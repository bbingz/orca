import type { GitHubRepositoryIdentity as GitHubOwnerRepo } from '../repositories/repository-identity'
import type { GitHubWorkItem, GitHubWorkItemDetails } from './work-item-types'
import { githubRepoIdentityKey, isDefaultGitHubHost } from '../repositories/repository-identity-key'

export type GitHubWorkItemTarget = {
  repository: GitHubOwnerRepo
  type: 'issue' | 'pr'
  number: number
}

type WorkItemIdentity = Pick<GitHubWorkItem, 'url' | 'prRepo' | 'apiRepository' | 'type' | 'number'>

function sameGitHubSlug(
  left: { owner: string; repo: string },
  right: { owner: string; repo: string }
): boolean {
  return (
    left.owner.toLowerCase() === right.owner.toLowerCase() &&
    left.repo.toLowerCase() === right.repo.toLowerCase()
  )
}

export function matchesGitHubWorkItemTarget(
  item: WorkItemIdentity | null | undefined,
  target: GitHubWorkItemTarget
): boolean {
  if (!item || item.type !== target.type || item.number !== target.number) {
    return false
  }
  try {
    const url = new URL(item.url)
    const parts = url.pathname.split('/').filter(Boolean)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      parts.length !== 4 ||
      parts[2] !== (target.type === 'pr' ? 'pull' : 'issues') ||
      parts[3] !== String(target.number)
    ) {
      return false
    }
    const fromUrl = { host: url.host, owner: parts[0], repo: parts[1] }
    if (!sameGitHubSlug(fromUrl, target.repository)) {
      return false
    }
    // html_url can name a GHES web host while the listed row keeps the API host.
    // A listed identity still has to be the target, including a github.com prRepo
    // whose owner differs from the browser URL.
    const listed = item.prRepo ?? item.apiRepository
    if (
      listed &&
      (!sameGitHubSlug(listed, target.repository) ||
        githubRepoIdentityKey(listed) !== githubRepoIdentityKey(target.repository))
    ) {
      return false
    }
    if (listed && !isDefaultGitHubHost(listed.host)) {
      return true
    }
    return githubRepoIdentityKey(fromUrl) === githubRepoIdentityKey(target.repository)
  } catch {
    return false
  }
}

export class GitHubWorkItemTargetError extends Error {
  constructor(target: GitHubWorkItemTarget) {
    const { owner, repo } = target.repository
    super(
      `Couldn't load ${owner}/${repo}#${target.number} from this server. Try again or open the ${target.type === 'pr' ? 'pull request' : 'issue'} on GitHub.`
    )
  }
}

export function requireGitHubWorkItemTargetDetails(
  details: GitHubWorkItemDetails | null,
  target: GitHubWorkItemTarget
): GitHubWorkItemDetails {
  if (!details || !matchesGitHubWorkItemTarget(details.item, target)) {
    throw new GitHubWorkItemTargetError(target)
  }
  return details
}

export const GITHUB_EXACT_OPERATION_UNSUPPORTED =
  'Update Orca on the executing server to edit this item or load its repository options.'

export function githubWorkItemTargetKey(target: GitHubWorkItemTarget): string {
  return [githubRepoIdentityKey(target.repository), target.type, target.number].join('\0')
}

export function parseGitHubItemRepository(url: string): GitHubOwnerRepo | null {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    return ['https:', 'http:'].includes(parsed.protocol) && parts.length >= 2
      ? { host: parsed.host, owner: parts[0], repo: parts[1] }
      : null
  } catch {
    return null
  }
}

export function resolveGitHubWorkItemTarget(item: WorkItemIdentity): GitHubWorkItemTarget | null {
  const repository = item.prRepo ?? item.apiRepository ?? parseGitHubItemRepository(item.url)
  return repository ? { repository, type: item.type, number: item.number } : null
}
