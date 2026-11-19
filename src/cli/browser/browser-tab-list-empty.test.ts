import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BrowserTabInfo } from '../../shared/browser/runtime/runtime-browser-contracts'
import { formatCommandHelp } from '../discovery/help'
import { okFixture } from '../runtime/fixtures/runtime-rpc-fixtures'
import { BROWSER_BASIC_COMMAND_SPECS } from '../specs/browser-basic'

const { callMock, runtimeClientConstructorMock, serveOrcaAppMock, getDefaultUserDataPathMock } =
  vi.hoisted(() => ({
    callMock: vi.fn(),
    runtimeClientConstructorMock: vi.fn(),
    serveOrcaAppMock: vi.fn(),
    getDefaultUserDataPathMock: vi.fn(() => '/tmp/orca-user-data')
  }))

vi.mock('../runtime/client', async () => {
  const { createRuntimeClientModuleMock } = await import('../index-test-harness.js')
  return createRuntimeClientModuleMock({
    callMock,
    runtimeClientConstructorMock,
    serveOrcaAppMock,
    getDefaultUserDataPathMock
  })
})

vi.mock('../runtime/launch', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  serveOrcaApp: serveOrcaAppMock
}))

vi.mock('../runtime/profile/metadata', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getDefaultUserDataPath: getDefaultUserDataPathMock
}))

import { main } from '../index'

const SCOPED_EMPTY =
  'No browser tabs open in this worktree. Use --worktree all to list every worktree.'

const OPEN_TAB: BrowserTabInfo = {
  browserPageId: 'page-1',
  index: 0,
  url: 'https://example.com',
  title: 'Example',
  active: true
}

async function listTabs(args: string[], tabs: readonly BrowserTabInfo[]): Promise<string> {
  const lines: string[] = []
  callMock.mockImplementation(async (method: string) => {
    if (method !== 'browser.tabList') {
      throw new Error(`unexpected ${method}`)
    }
    return okFixture('req_tab_list', { tabs })
  })
  vi.spyOn(console, 'log').mockImplementation((line?: unknown) => {
    lines.push(String(line))
  })
  await main(args, '/tmp/wt-b')
  return lines.join('\n')
}

describe('orca tab list empty scope', () => {
  beforeEach(() => {
    callMock.mockReset()
    process.exitCode = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.exitCode = undefined
  })

  it('names the worktree when that worktree has no tabs', async () => {
    const text = await listTabs(['tab', 'list', '--worktree', 'id:wt-b'], [])

    expect(text).toBe(SCOPED_EMPTY)
    expect(callMock).toHaveBeenCalledWith('browser.tabList', { worktree: 'id:wt-b' })
  })

  it('names the worktree when --show-profile is set and that worktree has no tabs', async () => {
    const text = await listTabs(['tab', 'list', '--worktree', 'id:wt-b', '--show-profile'], [])

    expect(text).toBe(SCOPED_EMPTY)
  })

  it('keeps the global sentence when --worktree all finds no tabs', async () => {
    const text = await listTabs(['tab', 'list', '--worktree', 'all'], [])

    expect(text).toBe('No browser tabs open.')
    expect(callMock).toHaveBeenCalledWith('browser.tabList', { worktree: undefined })
  })

  it('still lists a tab that is open in the scoped worktree', async () => {
    const text = await listTabs(['tab', 'list', '--worktree', 'id:wt-b'], [OPEN_TAB])

    expect(text).toBe('* [0] page-1  Example — https://example.com')
  })

  it('states the default worktree in tab list help', () => {
    const spec = BROWSER_BASIC_COMMAND_SPECS.find((item) => item.path.join(' ') === 'tab list')
    if (!spec) {
      throw new Error('tab list spec missing')
    }

    expect(formatCommandHelp(spec)).toContain(
      'Defaults to the current worktree. Pass --worktree all to list every worktree.'
    )
  })
})
