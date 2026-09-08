import { describe, expect, it, vi } from 'vitest'
import {
  waitForPtyDraftInputReady,
  type PtyDraftInputReadyHost
} from './runtime-pty-draft-input-ready'

const CODEX_COMPOSER_READY_BYTES = '\x1b[?2004h\x1b[?1049h\x1b[1m›\x1b[0m'

function createHost(initial?: string): PtyDraftInputReadyHost & {
  emit: (data: string) => void
  exit: () => void
} {
  const dataListeners = new Set<(data: string) => void>()
  const exitListeners = new Set<() => void>()
  let recent = initial
  return {
    subscribeToData(_ptyId, listener) {
      dataListeners.add(listener)
      return () => {
        dataListeners.delete(listener)
      }
    },
    readRecentOutput() {
      return recent
    },
    subscribeToExit(_ptyId, listener) {
      exitListeners.add(listener)
      return () => {
        exitListeners.delete(listener)
      }
    },
    emit(data) {
      recent = `${recent ?? ''}${data}`
      for (const listener of dataListeners) {
        listener(data)
      }
    },
    exit() {
      for (const listener of exitListeners) {
        listener()
      }
    }
  }
}

describe('waitForPtyDraftInputReady', () => {
  it('resolves true from replayed Codex composer bytes', async () => {
    const host = createHost(CODEX_COMPOSER_READY_BYTES)
    await expect(waitForPtyDraftInputReady(host, 'pty-1', 'codex')).resolves.toBe(true)
  })

  it('resolves true when Codex composer bytes arrive after subscribe', async () => {
    const host = createHost()
    const wait = waitForPtyDraftInputReady(host, 'pty-1', 'codex')
    host.emit('\x1b[?20')
    host.emit(CODEX_COMPOSER_READY_BYTES.slice(5))
    await expect(wait).resolves.toBe(true)
  })

  it('resolves false when the Codex hard timeout elapses', async () => {
    vi.useFakeTimers()
    try {
      const host = createHost()
      const wait = waitForPtyDraftInputReady(host, 'pty-1', 'codex')
      await vi.advanceTimersByTimeAsync(20_000)
      await expect(wait).resolves.toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects when the PTY exits before composer readiness', async () => {
    const host = createHost()
    const wait = waitForPtyDraftInputReady(host, 'pty-1', 'codex')
    host.exit()
    await expect(wait).rejects.toThrow('terminal_exited')
  })
})
