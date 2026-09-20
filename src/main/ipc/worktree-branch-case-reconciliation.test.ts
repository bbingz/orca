import { describe, expect, it, vi } from 'vitest'
import {
  reconcileBranchPrefixCase,
  resolveValidatedBranchNameWithGit,
  reconcileBranchNameOverrideWithGit
} from './worktree-branch-name'

describe('reconcileBranchPrefixCase', () => {
  it('reconciles prefix casing when a matching local branch ref exists', async () => {
    const execGit = vi.fn(async () => ({
      stdout: 'refs/heads/eurfelux/existing-feature\n'
    }))

    const reconciled = await reconcileBranchPrefixCase('EurFelux', execGit)
    expect(reconciled).toBe('eurfelux')
    expect(execGit).toHaveBeenCalledWith([
      'for-each-ref',
      '--count=1',
      '--ignore-case',
      '--format=%(refname)',
      'refs/heads/EurFelux/*',
      'refs/remotes/*/EurFelux/*'
    ])
  })

  it('reconciles prefix casing when a matching remote tracking branch ref exists', async () => {
    const execGit = vi.fn(async () => ({
      stdout: 'refs/remotes/origin/eurfelux/remote-feature\n'
    }))

    const reconciled = await reconcileBranchPrefixCase('EurFelux', execGit)
    expect(reconciled).toBe('eurfelux')
  })

  it('reconciles multi-segment prefix casing', async () => {
    const execGit = vi.fn(async () => ({
      stdout: 'refs/heads/team/frontend/my-task\n'
    }))

    const reconciled = await reconcileBranchPrefixCase('Team/Frontend', execGit)
    expect(reconciled).toBe('team/frontend')
  })

  it('preserves prefix casing when no matching ref is found', async () => {
    const execGit = vi.fn(async () => ({ stdout: '' }))

    const reconciled = await reconcileBranchPrefixCase('EurFelux', execGit)
    expect(reconciled).toBe('EurFelux')
  })

  it('returns empty string immediately when prefix is empty', async () => {
    const execGit = vi.fn()

    const reconciled = await reconcileBranchPrefixCase('', execGit)
    expect(reconciled).toBe('')
    expect(execGit).not.toHaveBeenCalled()
  })

  it('fails open to original prefix when git execution fails', async () => {
    const execGit = vi.fn(async () => {
      throw new Error('git failure')
    })

    const reconciled = await reconcileBranchPrefixCase('EurFelux', execGit)
    expect(reconciled).toBe('EurFelux')
  })
})

describe('resolveValidatedBranchNameWithGit', () => {
  it('reconciles prefix against existing branches when strategy is git-username', async () => {
    const execGit = vi.fn(async (args: string[]) => {
      if (args[0] === 'for-each-ref') {
        return { stdout: 'refs/heads/eurfelux/some-branch\n' }
      }
      return { stdout: '' }
    })

    const branch = await resolveValidatedBranchNameWithGit(
      'my-feature',
      { branchPrefix: 'git-username' },
      'EurFelux',
      execGit
    )
    expect(branch).toBe('eurfelux/my-feature')
  })

  it('reconciles prefix when strategy is custom', async () => {
    const execGit = vi.fn(async (args: string[]) => {
      if (args[0] === 'for-each-ref') {
        return { stdout: 'refs/heads/feature/old-task\n' }
      }
      return { stdout: '' }
    })

    const branch = await resolveValidatedBranchNameWithGit(
      'new-task',
      { branchPrefix: 'custom', branchPrefixCustom: 'Feature' },
      null,
      execGit
    )
    expect(branch).toBe('feature/new-task')
  })

  it('returns sanitizedName directly when branchPrefix strategy is none', async () => {
    const execGit = vi.fn()

    const branch = await resolveValidatedBranchNameWithGit(
      'my-feature',
      { branchPrefix: 'none' },
      'EurFelux',
      execGit
    )
    expect(branch).toBe('my-feature')
    expect(execGit).not.toHaveBeenCalled()
  })

  it('falls back to plain branch name when git-username has invalid characters', async () => {
    const execGit = vi.fn()

    const branch = await resolveValidatedBranchNameWithGit(
      'my-feature',
      { branchPrefix: 'git-username' },
      '{"message":"rate limit exceeded"}',
      execGit
    )
    expect(branch).toBe('my-feature')
    expect(execGit).not.toHaveBeenCalled()
  })
})

describe('reconcileBranchNameOverrideWithGit', () => {
  it('throws when branch name override starts with "-"', async () => {
    const execGit = vi.fn()

    await expect(reconcileBranchNameOverrideWithGit('-invalid', execGit)).rejects.toThrow(
      'Branch name must not start with "-"'
    )
    expect(execGit).not.toHaveBeenCalled()
  })

  it('reconciles prefix casing and checks ref format for prefixed branch overrides', async () => {
    const execGit = vi.fn(async (args: string[]) => {
      if (args[0] === 'for-each-ref') {
        return { stdout: 'refs/heads/eurfelux/base-branch\n' }
      }
      return { stdout: '' }
    })

    const result = await reconcileBranchNameOverrideWithGit('EurFelux/my-feature', execGit)
    expect(result).toBe('eurfelux/my-feature')
    expect(execGit).toHaveBeenCalledWith(['check-ref-format', '--branch', 'eurfelux/my-feature'])
  })

  it('checks ref format directly for leaf branch overrides without a slash', async () => {
    const execGit = vi.fn(async () => ({ stdout: '' }))

    const result = await reconcileBranchNameOverrideWithGit('plain-branch', execGit)
    expect(result).toBe('plain-branch')
    expect(execGit).toHaveBeenCalledWith(['check-ref-format', '--branch', 'plain-branch'])
    expect(execGit).not.toHaveBeenCalledWith(expect.arrayContaining(['for-each-ref']))
  })
})

describe('git ref case reconciliation integration', () => {
  it('reconciles prefix against real on-disk refs in a git repository', async () => {
    const { mkdtemp, rm } = await import('node:fs/promises')
    const { tmpdir } = await import('node:os')
    const { join } = await import('node:path')
    const { gitExecFileAsync } = await import('../git/runner')

    const dir = await mkdtemp(join(tmpdir(), 'orca-case-test-'))
    try {
      await gitExecFileAsync(['init', '-b', 'main'], { cwd: dir })
      await gitExecFileAsync(['config', 'user.name', 'Test'], { cwd: dir })
      await gitExecFileAsync(['config', 'user.email', 'test@example.com'], { cwd: dir })
      await gitExecFileAsync(['commit', '--allow-empty', '-m', 'initial'], { cwd: dir })
      await gitExecFileAsync(['branch', 'eurfelux/existing'], { cwd: dir })

      const execGit = (args: string[]) => gitExecFileAsync(args, { cwd: dir })
      const resolved = await resolveValidatedBranchNameWithGit(
        'new-branch',
        { branchPrefix: 'git-username' },
        'EurFelux',
        execGit
      )
      expect(resolved).toBe('eurfelux/new-branch')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
