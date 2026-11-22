import { describe, expect, it } from 'vitest'
import { mountWorker } from '../declarative/testing/testing-worker'
import { createMockHost } from '../declarative/testing/testing-host'

describe('commands.register', () => {
  it('keeps a replacement command when the earlier registration is disposed', async () => {
    let stale: { dispose(): void } | undefined
    let current: { dispose(): void } | undefined
    const mounted = await mountWorker(
      {
        default(orca: {
          commands: {
            register(id: string, handler: () => string): { dispose(): void }
          }
        }) {
          stale = orca.commands.register('ping', () => 'first')
          current = orca.commands.register('ping', () => 'second')
        }
      },
      {
        host: createMockHost({}, []),
        events: [],
        commands: ['ping'],
        hooks: []
      }
    )

    expect(await mounted.command('ping')).toBe('second')
    stale?.dispose()
    expect(await mounted.command('ping')).toBe('second')
    current?.dispose()
    await expect(mounted.command('ping')).rejects.toThrow(
      'command: the worker registered no "ping"'
    )
  })
})
