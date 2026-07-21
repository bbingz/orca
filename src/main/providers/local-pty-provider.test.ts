/* oxlint-disable max-lines */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { delimiter } from 'node:path'
import type * as MacosTccLoginShell from './macos-tcc-login-shell'

const {
  existsSyncMock,
  statSyncMock,
  accessSyncMock,
  mkdirSyncMock,
  writeFileSyncMock,
  spawnMock,
  prepareMacosTccLoginShellMock,
  resolveAgentForegroundProcessMock,
  readWindowsConptyProcessIdsMock,
  captureDescendantSnapshotMock,
  terminateDescendantSnapshotMock
} = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  statSyncMock: vi.fn(),
  accessSyncMock: vi.fn(),
  mkdirSyncMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
  spawnMock: vi.fn(),
  prepareMacosTccLoginShellMock: vi.fn(),
  resolveAgentForegroundProcessMock: vi.fn(),
  readWindowsConptyProcessIdsMock: vi.fn(),
  captureDescendantSnapshotMock: vi.fn(),
  terminateDescendantSnapshotMock: vi.fn()
}))

vi.mock('fs', () => ({
  existsSync: existsSyncMock,
  statSync: statSyncMock,
  accessSync: accessSyncMock,
  mkdirSync: mkdirSyncMock,
  writeFileSync: writeFileSyncMock,
  chmodSync: vi.fn(),
  constants: { X_OK: 1 }
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/orca-user-data')
  }
}))

vi.mock('node-pty', () => ({
  spawn: spawnMock
}))

vi.mock('./macos-tcc-login-shell', async (importOriginal) => ({
  ...(await importOriginal<typeof MacosTccLoginShell>()),
  prepareMacosTccLoginShell: prepareMacosTccLoginShellMock
}))

vi.mock('../pty-descendant-termination', () => ({
  captureDescendantSnapshot: captureDescendantSnapshotMock,
  terminateDescendantSnapshot: terminateDescendantSnapshotMock
}))

// Resolve PowerShell family names to deterministic absolute paths (the fs mock
// above otherwise makes every probe miss). The real resolver — which skips the
// Store App Execution Alias stub — is covered in
// windows-powershell-executable.test.ts.
const WINDOWS_POWERSHELL_ABS = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
const PWSH7_ABS = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'
const CMD_ABS = 'C:\\Windows\\System32\\cmd.exe'
vi.mock('./windows-powershell-executable', () => ({
  resolveWindowsPowerShellExecutablePath: (family: 'pwsh.exe' | 'powershell.exe') =>
    family === 'pwsh.exe' ? PWSH7_ABS : WINDOWS_POWERSHELL_ABS,
  resolveWindowsPowerShellSpawnChain: (family: 'pwsh.exe' | 'powershell.exe') =>
    family === 'pwsh.exe'
      ? [PWSH7_ABS, WINDOWS_POWERSHELL_ABS, CMD_ABS]
      : [WINDOWS_POWERSHELL_ABS, CMD_ABS],
  getWindowsCmdPath: () => CMD_ABS
}))

vi.mock('./agent-foreground-process', () => ({
  resolveAgentForegroundProcessWithAvailability: (...args: unknown[]) =>
    resolveAgentForegroundProcessMock(...args)
}))

vi.mock('./windows-conpty-process-membership', () => ({
  readWindowsConptyProcessIds: (...args: unknown[]) => readWindowsConptyProcessIdsMock(...args)
}))

vi.mock('../wsl', () => ({
  parseWslPath: (path: string) => {
    const match = path.match(/^\\\\wsl\.localhost\\([^\\]+)(.*)$/)
    if (!match) {
      return null
    }
    return {
      distro: match[1],
      linuxPath: (match[2] || '').replace(/\\/g, '/') || '/'
    }
  },
  toLinuxPath: (path: string) => path.replace(/^C:\\/i, '/mnt/c/').replace(/\\/g, '/'),
  toWindowsWslPath: (path: string, distro: string) =>
    `\\\\wsl.localhost\\${distro}${path.replace(/\//g, '\\')}`,
  isWslAvailable: () => true,
  // Why: WSL worktree validation now asks the distro; these tests use WSL UNC
  // cwds that are meant to exist, so report them present without spawning wsl.exe.
  wslUncDirectoryExists: () => true
}))

import {
  _resetLocalPtyProviderStateForTest,
  LOCAL_PTY_FORCE_KILL_RETRY_MS,
  LOCAL_PTY_GRACEFUL_FORCE_TIMEOUT_MS,
  LOCAL_PTY_PHYSICAL_EXIT_TIMEOUT_MS,
  LocalPtyProvider
} from './local-pty-provider'
import { isRootLikePath } from './pty-path-safety'
import { POWERLEVEL10K_WIZARD_DISABLE_ENV } from '../pty/powerlevel10k-wizard-env'

describe('LocalPtyProvider', () => {
  let provider: LocalPtyProvider
  let mockProc: {
    onData: ReturnType<typeof vi.fn>
    onExit: ReturnType<typeof vi.fn>
    write: ReturnType<typeof vi.fn>
    resize: ReturnType<typeof vi.fn>
    pause: ReturnType<typeof vi.fn>
    resume: ReturnType<typeof vi.fn>
    kill: ReturnType<typeof vi.fn>
    process: string
    pid: number
  }
  let exitCb: ((info: { exitCode: number }) => void) | undefined
  let origShell: string | undefined
  let origPowerlevelWizardDisable: string | undefined
  let origHistFile: string | undefined
  let origPlatform: PropertyDescriptor | undefined

  beforeEach(() => {
    origPlatform = Object.getOwnPropertyDescriptor(process, 'platform')
    Object.defineProperty(process, 'platform', { configurable: true, value: 'linux' })
    origShell = process.env.SHELL
    origPowerlevelWizardDisable = process.env.POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD
    origHistFile = process.env.HISTFILE
    process.env.SHELL = '/bin/zsh'
    delete process.env.POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD
    // injectHistoryEnv preserves an inherited HISTFILE, so clear it for hermetic history assertions.
    delete process.env.HISTFILE

    existsSyncMock.mockReturnValue(true)
    statSyncMock.mockReturnValue({ isDirectory: () => true, mode: 0o755 })
    accessSyncMock.mockReturnValue(undefined)
    mkdirSyncMock.mockReset()
    writeFileSyncMock.mockReset()
    captureDescendantSnapshotMock.mockReset()
    captureDescendantSnapshotMock.mockResolvedValue(null)
    terminateDescendantSnapshotMock.mockReset()
    prepareMacosTccLoginShellMock.mockReset()
    prepareMacosTccLoginShellMock.mockResolvedValue(undefined)
    resolveAgentForegroundProcessMock.mockReset()
    resolveAgentForegroundProcessMock.mockImplementation(
      async (_pid: number, fallbackProcess: string | null) => ({
        available: true,
        processName: fallbackProcess
      })
    )
    readWindowsConptyProcessIdsMock.mockReset()
    readWindowsConptyProcessIdsMock.mockResolvedValue(null)

    exitCb = undefined
    mockProc = {
      onData: vi.fn(() => ({ dispose: vi.fn() })),
      onExit: vi.fn((cb: (info: { exitCode: number }) => void) => {
        exitCb = cb
        return {
          dispose: () => {
            if (exitCb === cb) {
              exitCb = undefined
            }
          }
        }
      }),
      write: vi.fn(),
      resize: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      kill: vi.fn(() => {
        exitCb?.({ exitCode: -1 })
      }),
      process: 'zsh',
      pid: 12345
    }
    spawnMock.mockReturnValue(mockProc)

    provider = new LocalPtyProvider()
  })

  afterEach(() => {
    _resetLocalPtyProviderStateForTest()
    if (origPlatform) {
      Object.defineProperty(process, 'platform', origPlatform)
    }
    if (origShell === undefined) {
      delete process.env.SHELL
    } else {
      process.env.SHELL = origShell
    }
    if (origPowerlevelWizardDisable === undefined) {
      delete process.env.POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD
    } else {
      process.env.POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD = origPowerlevelWizardDisable
    }
    if (origHistFile === undefined) {
      delete process.env.HISTFILE
    } else {
      process.env.HISTFILE = origHistFile
    }
  })

  describe('spawn', () => {
    it('returns a unique PTY id', async () => {
      const result = await provider.spawn({ cols: 80, rows: 24 })
      expect(result.id).toBeTruthy()
      expect(typeof result.id).toBe('string')
    })

    it('coalesces Windows agent shutdown around one native Job Object kill and physical exit', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const killSpy = vi.fn()
      mockProc.kill = killSpy
      const { id } = await provider.spawn({
        cols: 80,
        rows: 24,
        launchAgent: 'claude'
      })
      expect(spawnMock.mock.calls.at(-1)?.[2]).toMatchObject({ useConptyJobObject: true })

      const graceful = provider.shutdown(id, { immediate: false })
      const immediate = provider.shutdown(id, { immediate: true })
      let settled = false
      void immediate.then(() => {
        settled = true
      })
      await Promise.resolve()
      const settledBeforeExit = settled
      exitCb?.({ exitCode: 137 })
      await Promise.all([graceful, immediate])

      expect(settledBeforeExit).toBe(false)
      expect(killSpy).toHaveBeenCalledOnce()
      expect(captureDescendantSnapshotMock).not.toHaveBeenCalled()
      expect(terminateDescendantSnapshotMock).not.toHaveBeenCalled()
      expect(provider.hasPty(id)).toBe(false)
    })
    it('rejects a physical-exit timeout but retains the owner for a successful retry', async () => {
      vi.useFakeTimers()
      try {
        const killSpy = vi.fn()
        mockProc.kill = killSpy
        const { id } = await provider.spawn({ cols: 80, rows: 24 })

        const shutdown = provider.shutdown(id, { immediate: true })
        const rejected = expect(shutdown).rejects.toThrow('Timed out waiting for PTY process exit')
        await vi.advanceTimersByTimeAsync(LOCAL_PTY_PHYSICAL_EXIT_TIMEOUT_MS)
        await rejected
        expect(provider.hasPty(id)).toBe(true)

        const retry = provider.shutdown(id, { immediate: true })
        expect(killSpy).toHaveBeenCalledTimes(1)
        exitCb?.({ exitCode: 137 })
        await expect(retry).resolves.toBeUndefined()
        expect(provider.hasPty(id)).toBe(false)
      } finally {
        vi.useRealTimers()
      }
    })

    it('propagates kill failure without dropping the physical owner', async () => {
      mockProc.kill = vi.fn(() => {
        throw new Error('kill denied')
      })
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await expect(provider.shutdown(id, { immediate: true })).rejects.toThrow('kill denied')
      expect(provider.hasPty(id)).toBe(true)

      mockProc.kill = vi.fn(() => exitCb?.({ exitCode: 137 }))
      await expect(provider.shutdown(id, { immediate: true })).resolves.toBeUndefined()
      expect(provider.hasPty(id)).toBe(false)
    })

    it('cancels pending shell-ready startup delivery on forced shutdown', async () => {
      vi.useFakeTimers()
      try {
        const { id } = await provider.spawn({ cols: 80, rows: 24, command: 'printf ready' })

        await provider.shutdown(id, { immediate: true })
        vi.advanceTimersByTime(2000)
        await Promise.resolve()

        expect(mockProc.write).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })

    it('is a no-op for unknown PTY ids', async () => {
      await provider.shutdown('nonexistent', { immediate: true })
      expect(mockProc.kill).not.toHaveBeenCalled()
    })

    it('waits for an in-flight agent shutdown before reusing the same session id', async () => {
      let releaseSweep!: () => void
      killWithDescendantSweepMock.mockImplementation(
        (_rootPid: number, killRoot: () => void) =>
          new Promise<void>((resolve) => {
            releaseSweep = () => {
              killRoot()
              resolve()
            }
          })
      )
      const spawnArgs = {
        cols: 80,
        rows: 24,
        sessionId: 'stable-agent-session',
        launchAgent: 'claude' as const
      }
      const spawnCallsBefore = spawnMock.mock.calls.length
      const { id } = await provider.spawn(spawnArgs)

      const shutdown = provider.shutdown(id, { immediate: true })
      const respawn = provider.spawn(spawnArgs)
      await Promise.resolve()
      expect(spawnMock).toHaveBeenCalledTimes(spawnCallsBefore + 1)

      releaseSweep()
      await shutdown
      await respawn
      expect(spawnMock).toHaveBeenCalledTimes(spawnCallsBefore + 2)
    })

    it('coalesces duplicate shutdown while descendant sweep is pending', async () => {
      let releaseSweep!: () => void
      killWithDescendantSweepMock.mockImplementation(
        (_rootPid: number, killRoot: () => void) =>
          new Promise<void>((resolve) => {
            releaseSweep = () => {
              killRoot()
              resolve()
            }
          })
      )
      const { id } = await provider.spawn({
        cols: 80,
        rows: 24,
        launchAgent: 'claude'
      })

      const first = provider.shutdown(id, { immediate: true })
      const second = provider.shutdown(id, { immediate: true })
      expect(killWithDescendantSweepMock).toHaveBeenCalledOnce()
      releaseSweep()
      await Promise.all([first, second])
      expect(killWithDescendantSweepMock).toHaveBeenCalledOnce()
    })

    it('does not terminate descendants after the tracked root exits mid-sweep', async () => {
      const terminateDescendants = vi.fn()
      let releaseSweep!: () => void
      killWithDescendantSweepMock.mockImplementation(
        (_rootPid: number, killRoot: () => void, deps?: { ownsRoot?: () => boolean }) =>
          new Promise<void>((resolve) => {
            releaseSweep = () => {
              // Production killWithDescendantSweep only signals descendants while ownsRoot.
              if (deps?.ownsRoot?.() ?? true) {
                terminateDescendants()
              }
              killRoot()
              resolve()
            }
          })
      )
      const { id } = await provider.spawn({
        cols: 80,
        rows: 24,
        launchAgent: 'claude'
      })

      const shutdown = provider.shutdown(id, { immediate: true })
      exitCb?.({ exitCode: 0 })
      releaseSweep()
      await shutdown

      expect(terminateDescendants).not.toHaveBeenCalled()
    })

    it('win32 immediate shutdown of a plain shell taskkills the descendant tree', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await provider.shutdown(id, { immediate: true })

      // Why: an orphaned pnpm/node child otherwise keeps the ConPTY console alive and holds
      // the worktree cwd; the sweep taskkill /T /F clears the tree so removal can proceed.
      expect(killWithDescendantSweepMock).toHaveBeenCalledWith(
        mockProc.pid,
        expect.any(Function),
        expect.objectContaining({ ownsRoot: expect.any(Function) })
      )
    })

    it('win32 graceful shutdown of a plain shell does not taskkill the tree', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await provider.shutdown(id, { immediate: false })

      expect(killWithDescendantSweepMock).not.toHaveBeenCalled()
    })

    it('non-win32 immediate shutdown of a plain shell skips the tree kill', async () => {
      // beforeEach pins platform to linux; POSIX force-kill already reaches the child pgroup.
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await provider.shutdown(id, { immediate: true })

      expect(killWithDescendantSweepMock).not.toHaveBeenCalled()
    })
  })

  describe('hasChildProcesses', () => {
    it('returns false when foreground process matches shell', async () => {
      const { id } = await provider.spawn({ cols: 80, rows: 24 })
      expect(await provider.hasChildProcesses(id)).toBe(false)
    })

    it('returns true when foreground process differs from shell', async () => {
      mockProc.process = 'node'
      const { id } = await provider.spawn({ cols: 80, rows: 24 })
      expect(await provider.hasChildProcesses(id)).toBe(true)
    })

    it('returns false for unknown PTY ids', async () => {
      expect(await provider.hasChildProcesses('nonexistent')).toBe(false)
    })
  })

  describe('getForegroundProcess', () => {
    it('returns the process name', async () => {
      const { id } = await provider.spawn({ cols: 80, rows: 24 })
      expect(await provider.getForegroundProcess(id)).toBe('zsh')
    })

    it('uses the spawned Windows shell when node-pty reports only the terminal name', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      mockProc.process = 'xterm-256color'

      const { id } = await provider.spawn({
        cols: 80,
        rows: 24,
        shellOverride: 'powershell.exe'
      })

      expect(await provider.getForegroundProcess(id)).toBe('powershell.exe')
      expect(resolveAgentForegroundProcessMock).toHaveBeenCalledWith(
        mockProc.pid,
        'powershell.exe',
        expect.any(Object)
      )
    })

    it('returns null for unknown PTY ids', async () => {
      expect(await provider.getForegroundProcess('nonexistent')).toBeNull()
    })

    it('keeps a recognized agent across an unavailable scan without adding probes', async () => {
      resolveAgentForegroundProcessMock
        .mockResolvedValueOnce({ available: true, processName: 'claude' })
        .mockResolvedValueOnce({ available: false, processName: 'powershell.exe' })
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      expect(resolveAgentForegroundProcessMock).toHaveBeenCalledTimes(2)
    })

    it('drops a delayed scan result after the PTY exits', async () => {
      let resolveScan!: (resolution: { available: boolean; processName: string }) => void
      resolveAgentForegroundProcessMock.mockReturnValue(
        new Promise((resolve) => {
          resolveScan = resolve
        })
      )
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      const foreground = provider.getForegroundProcess(id)
      exitCb?.({ exitCode: 0 })
      resolveScan({ available: true, processName: 'droid' })

      await expect(foreground).resolves.toBeNull()
    })

    it('confirms a still-active agent from ConPTY console presence without a whole-table scan', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      mockProc.process = 'powershell.exe'
      resolveAgentForegroundProcessMock.mockResolvedValue({
        available: true,
        processName: 'claude'
      })
      // A child beyond the shell is still attached to this console.
      readWindowsConptyProcessIdsMock.mockResolvedValue(new Set([12345, 999]))
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      // First call establishes the agent identity via the scan.
      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      // node-pty still only names the shell, but console presence confirms the
      // agent — no second whole-table scan.
      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      expect(resolveAgentForegroundProcessMock).toHaveBeenCalledTimes(1)
    })

    it('falls through to the scan when the ConPTY console shows only the shell', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      mockProc.process = 'powershell.exe'
      resolveAgentForegroundProcessMock.mockResolvedValue({
        available: true,
        processName: 'claude'
      })
      readWindowsConptyProcessIdsMock.mockResolvedValue(new Set([12345]))
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      expect(resolveAgentForegroundProcessMock).toHaveBeenCalledTimes(2)
    })

    it('keeps the cached agent when both the console probe and process snapshot are inconclusive', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      mockProc.process = 'powershell.exe'
      resolveAgentForegroundProcessMock
        .mockResolvedValueOnce({ available: true, processName: 'claude' })
        .mockResolvedValue({ available: true, processName: null })
      readWindowsConptyProcessIdsMock.mockResolvedValue(null)
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      expect(resolveAgentForegroundProcessMock).toHaveBeenCalledTimes(2)
    })

    it('retires the cached agent after verified shell-only membership and a no-agent scan', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      mockProc.process = 'powershell.exe'
      resolveAgentForegroundProcessMock
        .mockResolvedValueOnce({ available: true, processName: 'claude' })
        .mockResolvedValue({ available: true, processName: null })
      readWindowsConptyProcessIdsMock.mockResolvedValue(new Set([12345]))
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      await expect(provider.getForegroundProcess(id)).resolves.toBe('claude')
      await expect(provider.getForegroundProcess(id)).resolves.toBeNull()
      expect(resolveAgentForegroundProcessMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('confirmForegroundProcess', () => {
    it('drops a delayed result after the PTY exits', async () => {
      let resolveScan!: (resolution: { available: boolean; processName: string }) => void
      resolveAgentForegroundProcessMock.mockReturnValue(
        new Promise((resolve) => {
          resolveScan = resolve
        })
      )
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      const confirmation = provider.confirmForegroundProcess(id)
      exitCb?.({ exitCode: 0 })
      resolveScan({ available: true, processName: 'droid' })

      await expect(confirmation).resolves.toBeNull()
    })
  })

  describe('event listeners', () => {
    it('notifies data listeners when PTY produces output', async () => {
      const dataHandler = vi.fn()
      provider.onData(dataHandler)
      const { id } = await provider.spawn({ cols: 80, rows: 24 })

      // Simulate node-pty data event
      const onDataCb = mockProc.onData.mock.calls[0][0]
      onDataCb('hello world')

      expect(dataHandler).toHaveBeenCalledWith({ id, data: 'hello world' })
    })

    it('classifies startup queries before runtime and public data listeners', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const runtimeData = vi.fn()
      const dataHandler = vi.fn()
      provider.configure({ onData: runtimeData })
      provider.onData(dataHandler)
      const { id } = await provider.spawn({
        cols: 80,
        rows: 24,
        startupIngress: {
          colors: { foreground: '#2e3434', background: '#ffffff' },
          deadlineMs: 5_000
        }
      })
      const onDataCb = mockProc.onData.mock.calls[0][0]
      const query = '\x1b]10;?\x07'
      const echo = ']10;rgb:2e2e/3434/3434\\'

      onDataCb(query)
      onDataCb(echo)
      onDataCb('prompt')

      expect(mockProc.write).toHaveBeenCalledWith('\x1b]10;rgb:2e2e/3434/3434\x1b\\')
      expect(runtimeData.mock.calls.map((call) => call.slice(1))).toEqual([
        ['', expect.any(Number), query.length, true],
        ['', expect.any(Number), echo.length, true],
        ['prompt', expect.any(Number)]
      ])
      expect(dataHandler.mock.calls.map(([payload]) => payload)).toEqual([
        { id, data: '', sequenceChars: query.length, seq: query.length, transformed: true },
        {
          id,
          data: '',
          sequenceChars: echo.length,
          seq: query.length + echo.length,
          transformed: true
        },
        { id, data: 'prompt' }
      ])
    })

    it('consumes a native Windows OSC color query before renderer delivery', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const dataHandler = vi.fn()
      provider.onData(dataHandler)
      const { id } = await provider.spawn({
        cols: 80,
        rows: 24,
        shellOverride: 'powershell.exe'
      })
      const onDataCb = mockProc.onData.mock.calls[0][0]
      const query = '\x1b]10;?\x07'

      onDataCb(query)

      expect(dataHandler).toHaveBeenCalledWith({
        id,
        data: '',
        sequenceChars: query.length,
        seq: query.length,
        transformed: true
      })
      expect(mockProc.write).not.toHaveBeenCalled()
    })

    it('keeps forwarded OSC color replies for a Windows-owned WSL PTY', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const { id } = await provider.spawn({
        cols: 80,
        rows: 24,
        shellOverride: 'wsl.exe',
        terminalWindowsWslDistro: 'Ubuntu'
      })
      const onDataCb = mockProc.onData.mock.calls[0][0]
      const reply = '\x1b]11;rgb:ffff/ffff/ffff\x1b\\'

      onDataCb('\x1b]11;?\x07')
      provider.write(id, reply)

      expect(mockProc.write).toHaveBeenCalledWith(reply)
    })

    it('notifies exit listeners when PTY exits', async () => {
      const exitHandler = vi.fn()
      provider.onExit(exitHandler)
      const { id, incarnationId } = await provider.spawn({ cols: 80, rows: 24 })

      // Simulate node-pty exit event
      exitCb?.({ exitCode: 0 })

      expect(exitHandler).toHaveBeenCalledWith({ id, code: 0, incarnationId })
    })

    it('allows unsubscribing from events', async () => {
      const dataHandler = vi.fn()
      const unsub = provider.onData(dataHandler)
      const { id: _id } = await provider.spawn({ cols: 80, rows: 24 })

      unsub()
      const onDataCb = mockProc.onData.mock.calls[0][0]
      onDataCb('hello')

      expect(dataHandler).not.toHaveBeenCalled()
    })
  })

  describe('listProcesses', () => {
    it('returns spawned PTYs', async () => {
      const before = await provider.listProcesses()
      await provider.spawn({
        cols: 80,
        rows: 24,
        cwd: '/tmp/owned-cwd',
        worktreeId: 'repo::/tmp/owned-cwd'
      })
      await provider.spawn({ cols: 80, rows: 24 })
      const after = await provider.listProcesses()
      expect(after.length - before.length).toBe(2)
      const newEntries = after.slice(before.length)
      expect(newEntries[0]).toHaveProperty('id')
      expect(newEntries[0]).toHaveProperty('title', 'zsh')
      expect(newEntries[0]).toHaveProperty('cwd', '/tmp/owned-cwd')
      expect(newEntries[0]).toHaveProperty('worktreeId', 'repo::/tmp/owned-cwd')
      expect(newEntries[0]).not.toHaveProperty('wslDistro')
      expect(newEntries[1]).not.toHaveProperty('wslDistro')
    })

    it('reports native and WSL ownership explicitly on Windows', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const native = await provider.spawn({
        cols: 80,
        rows: 24,
        cwd: 'C:\\repo',
        shellOverride: 'powershell.exe'
      })
      const wsl = await provider.spawn({
        cols: 80,
        rows: 24,
        cwd: '\\\\wsl.localhost\\Ubuntu\\home\\jin\\repo'
      })

      const processes = await provider.listProcesses()

      expect(processes.find((process) => process.id === native.id)?.wslDistro).toBeNull()
      expect(processes.find((process) => process.id === wsl.id)?.wslDistro).toBe('Ubuntu')
    })
  })

  describe('getDefaultShell', () => {
    it('returns SHELL env var on Unix', async () => {
      const originalShell = process.env.SHELL
      try {
        process.env.SHELL = '/bin/bash'
        expect(await provider.getDefaultShell()).toBe('/bin/bash')
      } finally {
        if (originalShell === undefined) {
          delete process.env.SHELL
        } else {
          process.env.SHELL = originalShell
        }
      }
    })
  })

  describe('killAll', () => {
    it('kills all PTY processes', async () => {
      // Why: each spawn needs its own proc so the onExit-triggered POSIX kill
      // neutralization on one proc does not replace the kill function on the
      // other (mockProc is shared by default in beforeEach). Each proc also
      // needs its own exitCb holder — the default mockProc.onExit assigns to
      // the shared `exitCb` variable, so the second spawn would overwrite the
      // first's exit callback, and mock1Kill firing would trigger cleanup for
      // id2 (removing it from the map before killAll iterates to it).
      let exit1: ((e: { exitCode: number }) => void) | undefined
      let exit2: ((e: { exitCode: number }) => void) | undefined
      const mock1Kill = vi.fn(() => exit1?.({ exitCode: -1 }))
      const mock2Kill = vi.fn(() => exit2?.({ exitCode: -1 }))
      spawnMock
        .mockReturnValueOnce({
          ...mockProc,
          kill: mock1Kill,
          onExit: vi.fn((cb) => {
            exit1 = cb
          })
        })
        .mockReturnValueOnce({
          ...mockProc,
          kill: mock2Kill,
          onExit: vi.fn((cb) => {
            exit2 = cb
          })
        })

      await provider.spawn({ cols: 80, rows: 24 })
      await provider.spawn({ cols: 80, rows: 24 })

      provider.killAll()

      expect(mock1Kill).toHaveBeenCalled()
      expect(mock2Kill).toHaveBeenCalled()
      const list = await provider.listProcesses()
      expect(list).toHaveLength(0)
    })

    it('does not destroy after intentional Windows orphan kills', async () => {
      Object.defineProperty(process, 'platform', { configurable: true, value: 'win32' })
      const destroySpy = vi.fn()
      const killSpy = vi.fn()
      spawnMock.mockReturnValue({
        ...mockProc,
        kill: killSpy,
        destroy: destroySpy
      })

      await provider.spawn({ cols: 80, rows: 24 })

      provider.killAll()

      expect(killSpy).toHaveBeenCalledTimes(1)
      expect(destroySpy).not.toHaveBeenCalled()
    })

    it('settles an overlapping shutdown when app quit takes final ownership', async () => {
      mockProc.kill.mockImplementation(() => undefined)
      const { id } = await provider.spawn({ cols: 80, rows: 24 })
      const shutdown = provider.shutdown(id, { immediate: true })
      let settled = false
      void shutdown.then(() => {
        settled = true
      })
      await Promise.resolve()
      expect(settled).toBe(false)

      provider.killAll()

      await expect(shutdown).resolves.toBeUndefined()
    })
  })
})
