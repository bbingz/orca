import { getRepoHostedReviewExecutionHostId } from '../source-control/hosted-review-execution-host'
import type { BranchPrefixStrategy } from '../../shared/ui-chrome-types'
import type { Repo } from '../../shared/repo-types'
import { getPRForBranch } from '../github/client'
import type { GitAdmissionTier } from '../../shared/rpc-contract/git-admission-tier-params'
import { gitExecFileAsync } from '../git/runner'
import { listWorktrees } from '../git/worktree'
import {
  resolveValidatedBranchNameWithGit,
  reconcileBranchNameOverrideWithGit
} from '../ipc/worktree-logic'
import { getHostedReviewForBranch } from '../source-control/hosted-review'
import {
  getSelectedReviewBranch,
  getSelectedReviewLookupHints,
  type SelectedReviewBranchInput
} from './selected-review-branch'
import { hasLocalGitOptions, normalizeLocalBranchName } from './runtime-worktree-selection'
import type { HostedReviewExecutionOptions } from '../source-control/hosted-review-git-options'

export async function resolveCreateBranchName(
  repoPath: string,
  branchNameOverride: string | undefined,
  sanitizedName: string,
  settings: { branchPrefix: string; branchPrefixCustom?: string },
  username: string | null,
  gitOptions: { wslDistro?: string; admissionTier?: GitAdmissionTier } = {}
): Promise<string> {
  const execGit = (args: string[]) => gitExecFileAsync(args, { cwd: repoPath, ...gitOptions })
  if (!branchNameOverride) {
    return resolveValidatedBranchNameWithGit(
      sanitizedName,
      { ...settings, branchPrefix: settings.branchPrefix as BranchPrefixStrategy },
      username,
      execGit
    )
  }
  return reconcileBranchNameOverrideWithGit(branchNameOverride, execGit)
}

export async function canCheckoutExistingLocalBranch(
  repoPath: string,
  branchName: string,
  baseBranch: string,
  gitOptions: { wslDistro?: string; admissionTier?: GitAdmissionTier } = {}
): Promise<boolean> {
  let localHead = ''
  try {
    const { stdout } = await gitExecFileAsync(
      ['rev-parse', '--verify', '--quiet', `refs/heads/${branchName}^{commit}`],
      { cwd: repoPath, ...gitOptions }
    )
    localHead = stdout.trim()
  } catch {
    return false
  }
  if (normalizeLocalBranchName(baseBranch) !== branchName) {
    if (!localHead) {
      return false
    }
    try {
      const { stdout } = await gitExecFileAsync(
        ['rev-parse', '--verify', '--quiet', `${baseBranch}^{commit}`],
        { cwd: repoPath, ...gitOptions }
      )
      if (stdout.trim() !== localHead) {
        return false
      }
    } catch {
      return false
    }
  }
  const worktrees = await listWorktrees(repoPath, gitOptions)
  return !worktrees.some((worktree) => normalizeLocalBranchName(worktree.branch) === branchName)
}

export function getLocalGitHubPrForBranch(
  repoPath: string,
  branchName: string,
  gitOptions: { wslDistro?: string }
): ReturnType<typeof getPRForBranch> {
  return hasLocalGitOptions(gitOptions)
    ? getPRForBranch(repoPath, branchName, null, null, null, {
        localGitExecOptions: gitOptions
      })
    : getPRForBranch(repoPath, branchName)
}

export async function getSelectedHostedReviewForBranch(
  repo: Pick<Repo, 'path' | 'connectionId' | 'executionHostId'>,
  branchName: string,
  args: SelectedReviewBranchInput,
  executionOptions: HostedReviewExecutionOptions = {}
): Promise<{ matchesSelected: boolean; number: number } | null> {
  const selectedReview = getSelectedReviewBranch(args)
  if (!selectedReview) {
    return null
  }
  const review = await getHostedReviewForBranch({
    repoPath: repo.path,
    executionHostId: getRepoHostedReviewExecutionHostId(repo),
    branch: branchName,
    ...executionOptions,
    ...getSelectedReviewLookupHints(args)
  })
  return review
    ? {
        matchesSelected:
          review.provider === selectedReview.provider && review.number === selectedReview.number,
        number: review.number
      }
    : null
}
