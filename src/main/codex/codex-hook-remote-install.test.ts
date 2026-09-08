import { describe, expect, it, vi } from 'vitest'
import type { SFTPWrapper } from 'ssh2'
import { CodexHookService } from './hook-service'
import { upsertHookTrustEntriesInContent } from './config-toml-trust'

vi.mock('electron', () => ({
  app: {
    getPath: () => '/tmp/orca-user-data'
  }
}))

function createFakeSftp(initialFiles: Record<string, string> = {}): {
  sftp: SFTPWrapper
  files: Map<string, string>
} {
  const files = new Map(Object.entries(initialFiles))
  const dirs = new Set(['/'])
  const noEntry = (path: string): { code: number; message: string } => ({
    code: 2,
    message: `ENOENT ${path}`
  })
  const sftp = {
    readFile: (path: string, _enc: string, cb: (err: unknown, data?: string) => void): void => {
      const value = files.get(path)
      if (value === undefined) {
        cb(noEntry(path))
        return
      }
      cb(null, value)
    },
    writeFile: (
      path: string,
      content: string,
      _options: string | { mode?: number },
      cb: (err: unknown) => void
    ): void => {
      files.set(path, content)
      cb(null)
    },
    rename: (src: string, dst: string, cb: (err: unknown) => void): void => {
      const value = files.get(src)
      if (value === undefined) {
        cb(noEntry(src))
        return
      }
      files.set(dst, value)
      files.delete(src)
      cb(null)
    },
    unlink: (path: string, cb: (err: unknown) => void): void => {
      files.delete(path)
      cb(null)
    },
    chmod: (_path: string, _mode: number, cb: (err: unknown) => void): void => {
      cb(null)
    },
    stat: (path: string, cb: (err: unknown, stats?: { mode: number }) => void): void => {
      if (!files.has(path)) {
        cb(noEntry(path))
        return
      }
      cb(null, { mode: 0o100644 })
    },
    readdir: (path: string, cb: (err: unknown, list?: { filename: string }[]) => void): void => {
      if (!dirs.has(path)) {
        cb(noEntry(path))
        return
      }
      cb(null, [])
    },
    mkdir: (path: string, cb: (err: unknown) => void): void => {
      dirs.add(path)
      cb(null)
    }
  } as unknown as SFTPWrapper
  return { sftp, files }
}

function hookTrustBlock(content: string, key: string): string {
  const header = `[hooks.state."${key}"]`
  const start = content.indexOf(header)
  if (start === -1) {
    return ''
  }
  const nextHeader = content.indexOf('\n[', start + header.length)
  return content.slice(start, nextHeader === -1 ? content.length : nextHeader)
}

describe('Codex remote hook prepend + trust migration', () => {
  it('prepends remote hooks without invalidating existing user hook trust', async () => {
    const remoteHooksPath = '/home/dev/.codex/hooks.json'
    const userStopCommand = 'echo user-stop-hook'
    const userTrustedHash = 'sha256:user-approved-stop-hook'
    const { sftp, files } = createFakeSftp({
      [remoteHooksPath]: `${JSON.stringify({
        hooks: {
          Stop: [{ hooks: [{ type: 'command', command: userStopCommand }] }]
        }
      })}\n`,
      '/home/dev/.codex/config.toml': upsertHookTrustEntriesInContent('', [
        {
          sourcePath: remoteHooksPath,
          eventLabel: 'stop',
          groupIndex: 0,
          handlerIndex: 0,
          command: userStopCommand,
          trustedHash: userTrustedHash,
          enabled: false
        }
      ])
    })

    const service = new CodexHookService()
    const status = await service.installRemote(sftp, '/home/dev')
    const repeatedStatus = await service.installRemote(sftp, '/home/dev')

    expect(status.state).toBe('installed')
    expect(repeatedStatus.state).toBe('installed')
    const hooks = JSON.parse(files.get(remoteHooksPath)!) as {
      hooks: Record<string, { hooks?: { command?: string }[] }[]>
    }
    expect(hooks.hooks.Stop?.[0]?.hooks?.[0]?.command).toContain('codex-hook.sh')
    expect(hooks.hooks.Stop?.[1]?.hooks?.[0]?.command).toBe(userStopCommand)
    expect(hooks.hooks.SubagentStart?.[0]?.hooks?.[0]?.command).toContain('codex-hook.sh')
    expect(hooks.hooks.SubagentStop?.[0]?.hooks?.[0]?.command).toContain('codex-hook.sh')
    const toml = files.get('/home/dev/.codex/config.toml') ?? ''
    expect(toml).toContain(':stop:0:0')
    expect(toml).toContain(':subagent_start:0:0')
    expect(toml).toContain(':subagent_stop:0:0')
    const userStopTrust = hookTrustBlock(toml, `${remoteHooksPath}:stop:1:0`)
    expect(userStopTrust).toContain('enabled = false')
    expect(userStopTrust).toContain(`trusted_hash = "${userTrustedHash}"`)
    expect(hookTrustBlock(toml, `${remoteHooksPath}:stop:0:0`)).not.toContain(userTrustedHash)
    expect(toml).not.toContain(`${remoteHooksPath}:stop:2:0`)
  })
})
