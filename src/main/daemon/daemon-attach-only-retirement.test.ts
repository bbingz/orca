import { describe, expect, it, vi } from 'vitest'

const trackMock = vi.hoisted(() => vi.fn())
vi.mock('../telemetry/client', () => ({ track: trackMock }))

import { SessionNotFoundError, TerminalSessionOwnerUnverifiedError } from './daemon-errors'
import { retireUnexpectedAttachOnlySpawn } from './daemon-attach-only-retirement'

describe('retireUnexpectedAttachOnlySpawn', () => {
  it('returns after a successful single kill', async () => {
    const kill = vi.fn().mockResolvedValue(undefined)
    await expect(retireUnexpectedAttachOnlySpawn(30, 'session', kill)).resolves.toBeUndefined()
    expect(kill).toHaveBeenCalledTimes(1)
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('treats SessionNotFound as a completed retire', async () => {
    const kill = vi.fn().mockRejectedValue(new SessionNotFoundError('session'))
    await expect(retireUnexpectedAttachOnlySpawn(30, 'session', kill)).resolves.toBeUndefined()
    expect(kill).toHaveBeenCalledTimes(1)
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('surfaces a failed kill with redacted support fields and no retry', async () => {
    const kill = vi.fn().mockRejectedValue(new Error('Connection lost'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(retireUnexpectedAttachOnlySpawn(30, 'session', kill)).rejects.toBeInstanceOf(
        TerminalSessionOwnerUnverifiedError
      )
      expect(kill).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledWith(
        '[daemon] attach-only retire of accidental legacy spawn failed; orphan may remain',
        { protocolVersion: 30, killErrorClass: 'transport' }
      )
      expect(trackMock).toHaveBeenCalledWith('daemon_attach_only_orphan_risk', {
        protocol_version: 30,
        kill_error_class: 'transport'
      })
    } finally {
      errorSpy.mockRestore()
    }
  })
})
