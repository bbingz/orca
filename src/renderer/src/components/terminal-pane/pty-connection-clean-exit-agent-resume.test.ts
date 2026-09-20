import type * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makePaneKey } from '../../../../shared/stable-pane-id'
import { UNVERIFIED_PROCESS_EXIT_CODE } from '../../../../shared/terminal-exit-cause'
import type { SleepingAgentSessionRecord } from '../../../../shared/agent-session-resume'
import { flushAsyncTicks } from './pty-connection-test-async'
import {
  LEAF_1,
  createMockTransport,
  createPane,
  createManager,
  type MockPane,
  type MockPaneManager,
  type MockTransport
} from './pty-connection-test-pane-fixtures'
import { buildPaneConnectionDeps, type PaneConnectionDeps } from './pty-connection-test-deps'
import { createInitialStoreState } from './pty-connection-test-store-fixtures'
import type { StoreState } from './pty-connection-test-store-state'
import {
  installTerminalTestGlobals,
  restoreTerminalTestGlobals
} from './pty-connection-test-environment'

const {
  resetAndRefreshAllTerminalWebglAtlases,
  scheduleTerminalWebglAtlasRecovery,
  scheduleRuntimeGraphSync,
  shouldSeedCacheTimerOnInitialTitle,
  toastInfo,
  notifyCodexPaneBoundForStaleSweep
} = vi.hoisted(() => ({
  resetAndRefreshAllTerminalWebglAtlases: vi.fn(),
  scheduleTerminalWebglAtlasRecovery: vi.fn(),
  scheduleRuntimeGraphSync: vi.fn(),
  shouldSeedCacheTimerOnInitialTitle: vi.fn(() => false),
  toastInfo: vi.fn(),
  notifyCodexPaneBoundForStaleSweep: vi.fn()
}))

let mockStoreState: StoreState
let transportFactoryQueue: MockTransport[] = []
let createdTransportOptions: Record<string, unknown>[] = []
let storeSubscribers: ((state: StoreState) => void)[] = []

vi.mock('@/runtime/sync-runtime-graph', () => ({
  scheduleRuntimeGraphSync
}))

vi.mock('@/lib/pane-manager/pane-manager-registry', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  resetAndRefreshAllTerminalWebglAtlases
}))

vi.mock('./terminal-webgl-atlas-recovery', () => ({
  scheduleTerminalWebglAtlasRecovery
}))

vi.mock('@/store', () => ({
  useAppStore: {
    getState: () => mockStoreState,
    subscribe: (listener: (state: StoreState) => void) => {
      storeSubscribers.push(listener)
      return () => {
        storeSubscribers = storeSubscribers.filter((candidate) => candidate !== listener)
      }
    }
  }
}))

vi.mock('@/lib/agent-status', async (importOriginal) => {
  const { buildAgentStatusModuleMock } = await import('./pty-connection-test-environment')
  return buildAgentStatusModuleMock(await importOriginal<Record<string, unknown>>())
})

vi.mock('./cache-timer-seeding', () => ({
  shouldSeedCacheTimerOnInitialTitle
}))

vi.mock('sonner', () => ({
  toast: {
    info: toastInfo
  }
}))

vi.mock('@/lib/codex-stale-pane-sweep', () => ({
  notifyCodexPaneBoundForStaleSweep
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof React>()
  return {
    ...actual,
    useCallback: <T extends (...args: unknown[]) => unknown>(fn: T): T => fn
  }
})

vi.mock('./pty-transport', () => ({
  createIpcPtyTransport: vi.fn((options: Record<string, unknown>) => {
    createdTransportOptions.push(options)
    const nextTransport = transportFactoryQueue.shift()
    if (!nextTransport) {
      throw new Error('No mock transport queued')
    }
    return nextTransport
  })
}))

vi.mock('./remote-runtime-pty-transport', () => ({
  createRemoteRuntimePtyTransport: vi.fn(
    (_environmentId: string, options: Record<string, unknown>) => {
      createdTransportOptions.push(options)
      const nextTransport = transportFactoryQueue.shift()
      if (!nextTransport) {
        throw new Error('No mock transport queued')
      }
      return nextTransport
    }
  )
}))

vi.mock('./pty-dispatcher', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    getEagerPtyBufferHandle: vi.fn(() => undefined)
  }
})

function createDeps(overrides: Record<string, unknown> = {}) {
  return buildPaneConnectionDeps(() => mockStoreState, overrides)
}

function makeSleepingSessionRecord(paneKey: string): SleepingAgentSessionRecord {
  return {
    paneKey,
    tabId: 'tab-1',
    worktreeId: 'wt-1',
    agent: 'claude',
    providerSession: { key: 'session_id', id: 'claude-session-1' },
    prompt: '',
    state: 'done',
    capturedAt: 1,
    updatedAt: 1,
    origin: 'live'
  }
}

type ConnectMockPane = (
  pane: MockPane,
  manager: MockPaneManager,
  deps: PaneConnectionDeps
) => { dispose: () => void }

describe('clean exit sleeping agent session clearing (#14228)', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    transportFactoryQueue = []
    createdTransportOptions = []
    storeSubscribers = []
    mockStoreState = createInitialStoreState(() => mockStoreState)
    installTerminalTestGlobals()
  })

  afterEach(async () => {
    await restoreTerminalTestGlobals()
  })

  it('clears sleeping agent session checkpoint on verified unsuppressed PTY exit', async () => {
    const { connectPanePty } = await import('./pty-connection')
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test fixture uses shared mock pane and manager to drive connectPanePty.
    const connectMockPane = connectPanePty as unknown as ConnectMockPane
    const ptyId = 'pty-clean-exit'
    const transport = createMockTransport(ptyId)
    transportFactoryQueue.push(transport)
    const paneKey = makePaneKey('tab-1', LEAF_1)
    mockStoreState.sleepingAgentSessionsByPaneKey[paneKey] = makeSleepingSessionRecord(paneKey)

    connectMockPane(createPane(1), createManager(1), createDeps())
    await flushAsyncTicks()

    const onPtyExit = createdTransportOptions[0]?.onPtyExit
    expect(typeof onPtyExit).toBe('function')

    if (typeof onPtyExit === 'function') {
      onPtyExit(ptyId, 0)
    }

    expect(mockStoreState.clearSleepingAgentSession).toHaveBeenCalledWith(paneKey)
    expect(mockStoreState.sleepingAgentSessionsByPaneKey[paneKey]).toBeUndefined()
  })

  it('retains sleeping agent session checkpoint on suppressed PTY exit (hibernation)', async () => {
    const { connectPanePty } = await import('./pty-connection')
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test fixture uses shared mock pane and manager to drive connectPanePty.
    const connectMockPane = connectPanePty as unknown as ConnectMockPane
    const ptyId = 'pty-hibernated-exit'
    const transport = createMockTransport(ptyId)
    transportFactoryQueue.push(transport)
    const paneKey = makePaneKey('tab-1', LEAF_1)
    const record = makeSleepingSessionRecord(paneKey)
    mockStoreState.sleepingAgentSessionsByPaneKey[paneKey] = record

    const deps = createDeps({
      consumeSuppressedPtyExit: vi.fn(() => true)
    })

    connectMockPane(createPane(1), createManager(1), deps)
    await flushAsyncTicks()

    const onPtyExit = createdTransportOptions[0]?.onPtyExit
    if (typeof onPtyExit === 'function') {
      onPtyExit(ptyId, 0)
    }

    expect(mockStoreState.clearSleepingAgentSession).not.toHaveBeenCalled()
    expect(mockStoreState.sleepingAgentSessionsByPaneKey[paneKey]).toBe(record)
  })

  it('retains sleeping agent session checkpoint on unverified PTY exit (host loss)', async () => {
    const { connectPanePty } = await import('./pty-connection')
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test fixture uses shared mock pane and manager to drive connectPanePty.
    const connectMockPane = connectPanePty as unknown as ConnectMockPane
    const ptyId = 'pty-unverified-exit'
    const transport = createMockTransport(ptyId)
    transportFactoryQueue.push(transport)
    const paneKey = makePaneKey('tab-1', LEAF_1)
    const record = makeSleepingSessionRecord(paneKey)
    mockStoreState.sleepingAgentSessionsByPaneKey[paneKey] = record

    connectMockPane(createPane(1), createManager(1), createDeps())
    await flushAsyncTicks()

    const onPtyExit = createdTransportOptions[0]?.onPtyExit
    if (typeof onPtyExit === 'function') {
      onPtyExit(ptyId, UNVERIFIED_PROCESS_EXIT_CODE)
    }

    expect(mockStoreState.clearSleepingAgentSession).not.toHaveBeenCalled()
    expect(mockStoreState.sleepingAgentSessionsByPaneKey[paneKey]).toBe(record)
  })

  it('clears sleeping agent session checkpoint when agent process cleanly exits back to shell', async () => {
    const { connectPanePty } = await import('./pty-connection')
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test fixture uses shared mock pane and manager to drive connectPanePty.
    const connectMockPane = connectPanePty as unknown as ConnectMockPane
    const ptyId = 'pty-agent-exit'
    const transport = createMockTransport(ptyId)
    transportFactoryQueue.push(transport)
    const paneKey = makePaneKey('tab-1', LEAF_1)
    mockStoreState.sleepingAgentSessionsByPaneKey[paneKey] = makeSleepingSessionRecord(paneKey)

    connectMockPane(createPane(1), createManager(1), createDeps())
    await flushAsyncTicks()

    const onAgentExited = createdTransportOptions[0]?.onAgentExited
    expect(typeof onAgentExited).toBe('function')

    if (typeof onAgentExited === 'function') {
      onAgentExited()
    }

    expect(mockStoreState.clearSleepingAgentSession).toHaveBeenCalledWith(paneKey)
    expect(mockStoreState.sleepingAgentSessionsByPaneKey[paneKey]).toBeUndefined()
  })
})
