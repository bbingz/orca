import { runProcess } from '@orca/process-host'
import { mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusPorcelainParser } from '../../shared/git-status-porcelain-parser'

async function git(args: string[], cwd: string, env = process.env) {
  const result = await runProcess({ program: 'git', args, cwd, env })
  if (result.code !== 0) {
    throw new Error(result.stderr)
  }
  return result
}

vi.mock('./runner', () => ({
  gitExecFileAsync: (args: string[], options: { cwd: string; env: NodeJS.ProcessEnv }) =>
    git(args, options.cwd, options.env),
  gitOptionalLocksDisabledEnv: () => ({ ...process.env, GIT_OPTIONAL_LOCKS: '0' })
}))

import { attachLineStats } from './source-control/status-line-stats'

let repo: string

beforeEach(async () => {
  repo = await mkdtemp(join(tmpdir(), 'orca-status-renames-'))
  const emptyConfig = join(repo, 'empty-git-config')
  await writeFile(emptyConfig, '')
  vi.stubEnv('GIT_CONFIG_GLOBAL', emptyConfig)
  vi.stubEnv('GIT_CONFIG_NOSYSTEM', '1')
  await git(['init', '-q'], repo)
  await git(['config', 'user.name', 'Test'], repo)
  await git(['config', 'user.email', 'test@example.invalid'], repo)
  await git(['config', 'commit.gpgsign', 'false'], repo)
  await git(['config', 'core.autocrlf', 'false'], repo)
  await writeFile(join(repo, 'old.txt'), 'alpha\nbeta\ngamma\n')
  await git(['add', 'old.txt'], repo)
  await git(['commit', '-qm', 'baseline'], repo)
})

afterEach(async () => {
  vi.unstubAllEnvs()
  await rm(repo, { recursive: true, force: true })
})

async function readEntries() {
  const { stdout } = await git(['status', '--porcelain=v2', '--untracked-files=no'], repo)
  const parser = new StatusPorcelainParser()
  parser.update(stdout, 0)
  parser.finish()
  expect(await attachLineStats(repo, parser.entries)).toBe(true)
  return parser.entries
}

describe.each(['staged', 'unstaged'] as const)('%s rename line counts', (area) => {
  it.each([
    { diffRenames: 'true', statusRenames: undefined, renamed: true },
    { diffRenames: 'false', statusRenames: undefined, renamed: false },
    { diffRenames: 'true', statusRenames: 'false', renamed: false },
    { diffRenames: 'false', statusRenames: 'true', renamed: true }
  ])('matches status with $diffRenames diff / $statusRenames status', async (config) => {
    await git(['config', 'diff.renames', config.diffRenames], repo)
    if (config.statusRenames !== undefined) {
      await git(['config', 'status.renames', config.statusRenames], repo)
    }
    await rename(join(repo, 'old.txt'), join(repo, 'new.txt'))
    await git(
      area === 'staged' ? ['add', '-A', '--', 'old.txt', 'new.txt'] : ['add', '-N', 'new.txt'],
      repo
    )

    const entries = await readEntries()

    expect(entries).toEqual(
      config.renamed
        ? [{ path: 'new.txt', oldPath: 'old.txt', status: 'renamed', area, added: 0, removed: 0 }]
        : [
            { path: 'new.txt', status: 'added', area, added: 3, removed: 0 },
            { path: 'old.txt', status: 'deleted', area, added: 0, removed: 3 }
          ]
    )
  })
})

it('keeps unstaged edits separate from a staged rename', async () => {
  await git(['mv', 'old.txt', 'new.txt'], repo)
  await writeFile(join(repo, 'new.txt'), 'alpha\nbeta\ngamma\ndelta\n')

  expect(await readEntries()).toEqual([
    {
      path: 'new.txt',
      oldPath: 'old.txt',
      status: 'renamed',
      area: 'staged',
      added: 0,
      removed: 0
    },
    {
      path: 'new.txt',
      oldPath: 'old.txt',
      status: 'modified',
      area: 'unstaged',
      added: 1,
      removed: 0
    }
  ])
})
