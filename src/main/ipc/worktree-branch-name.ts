import {
  assertBranchPrefixValid,
  getBranchPrefixIssue,
  normalizeBranchPrefix,
  selectBranchPrefixInput,
  type BranchPrefixSettings
} from '../../shared/branch-prefix'

/**
 * Resolve the branch prefix segment (the part before `/`) the configured
 * strategy will prepend, or null when no prefix applies. Exposed so callers can
 * detect a prefix the user already typed (or a generation model leaked) before
 * it gets prepended a second time.
 *
 * The returned prefix is normalized (surrounding whitespace/slashes stripped) so
 * a custom value like `team/` cannot produce a `team//name` branch that git
 * check-ref-format rejects.
 */
export function getConfiguredBranchPrefix(
  settings: BranchPrefixSettings,
  gitUsername: string | null
): string | null {
  const raw = selectBranchPrefixInput(settings, gitUsername)
  return raw ? normalizeBranchPrefix(raw) || null : null
}

/**
 * Compute the full branch name by applying the configured prefix strategy.
 */
export function computeBranchName(
  sanitizedName: string,
  settings: BranchPrefixSettings,
  gitUsername: string | null
): string {
  const prefix = getConfiguredBranchPrefix(settings, gitUsername)
  return prefix ? `${prefix}/${sanitizedName}` : sanitizedName
}

/**
 * Compute a branch name and fail fast when the configured prefix is invalid.
 * Used on worktree-create paths so users get a clear settings hint instead of
 * an opaque git check-ref-format failure.
 */
export function computeValidatedBranchName(
  sanitizedName: string,
  settings: BranchPrefixSettings,
  gitUsername: string | null
): string {
  const prefix = getConfiguredBranchPrefix(settings, gitUsername)
  if (prefix === null) {
    return sanitizedName
  }
  if (getBranchPrefixIssue(prefix) !== null) {
    // Why: git-username can resolve to garbage (e.g. a rate-limited `gh api` JSON body).
    // Skip the prefix rather than blocking every worktree create; custom prefixes still fail loudly.
    if (settings.branchPrefix === 'git-username') {
      return sanitizedName
    }
    assertBranchPrefixValid(prefix)
  }
  return `${prefix}/${sanitizedName}`
}

function extractPrefixFromRef(ref: string, prefix: string): string {
  const prefixSegments = prefix.split('/')
  let remaining = ''
  if (ref.startsWith('refs/heads/')) {
    remaining = ref.slice('refs/heads/'.length)
  } else if (ref.startsWith('refs/remotes/')) {
    const withoutRemotes = ref.slice('refs/remotes/'.length)
    const slashIdx = withoutRemotes.indexOf('/')
    if (slashIdx !== -1) {
      remaining = withoutRemotes.slice(slashIdx + 1)
    }
  }
  if (!remaining) {
    return prefix
  }
  const candidate = remaining.split('/').slice(0, prefixSegments.length).join('/')
  return candidate.toLowerCase() === prefix.toLowerCase() ? candidate : prefix
}

/**
 * Reconcile a branch prefix against existing branches in the repository to prevent
 * ref case collisions on case-insensitive filesystems (issue #15857).
 */
export async function reconcileBranchPrefixCase(
  prefix: string,
  execGit: (args: string[]) => Promise<{ stdout: string }>
): Promise<string> {
  if (!prefix) {
    return prefix
  }
  try {
    const { stdout } = await execGit([
      'for-each-ref',
      '--count=1',
      '--ignore-case',
      '--format=%(refname)',
      `refs/heads/${prefix}/*`,
      `refs/remotes/*/${prefix}/*`
    ])
    const ref = stdout.trim().split('\n')[0]?.trim()
    if (ref) {
      return extractPrefixFromRef(ref, prefix)
    }
  } catch {
    // Why: fail open if git query fails (e.g. non-git directory or ancient git), keeping the original prefix.
  }
  return prefix
}

/**
 * Resolve and validate the branch name to create, reconciling the prefix against
 * existing refs in the repository to avoid case-insensitive collisions.
 */
export async function resolveValidatedBranchNameWithGit(
  sanitizedName: string,
  settings: BranchPrefixSettings,
  gitUsername: string | null,
  execGit: (args: string[]) => Promise<{ stdout: string }>
): Promise<string> {
  const configuredPrefix = getConfiguredBranchPrefix(settings, gitUsername)
  if (configuredPrefix === null) {
    return sanitizedName
  }
  if (getBranchPrefixIssue(configuredPrefix) !== null) {
    // Why: git-username can resolve to garbage (e.g. a rate-limited `gh api` JSON body).
    // Skip the prefix rather than blocking every worktree create; custom prefixes still fail loudly.
    if (settings.branchPrefix === 'git-username') {
      return sanitizedName
    }
    assertBranchPrefixValid(configuredPrefix)
  }
  const prefix = await reconcileBranchPrefixCase(configuredPrefix, execGit)
  return `${prefix}/${sanitizedName}`
}

/**
 * Reconcile any prefix in a caller-supplied branch name override, ensuring it
 * conforms to git rules and matches existing ref casing in the repository.
 */
export async function reconcileBranchNameOverrideWithGit(
  branchNameOverride: string,
  execGit: (args: string[]) => Promise<{ stdout: string }>
): Promise<string> {
  if (branchNameOverride.startsWith('-')) {
    throw new Error('Branch name must not start with "-"')
  }
  let effectiveBranchName = branchNameOverride
  if (branchNameOverride.includes('/')) {
    const slashIdx = branchNameOverride.lastIndexOf('/')
    const prefix = branchNameOverride.slice(0, slashIdx)
    const leaf = branchNameOverride.slice(slashIdx + 1)
    if (!/[\s~^:?*[\\]/.test(prefix)) {
      const reconciledPrefix = await reconcileBranchPrefixCase(prefix, execGit)
      if (reconciledPrefix !== prefix) {
        effectiveBranchName = `${reconciledPrefix}/${leaf}`
      }
    }
  }
  await execGit(['check-ref-format', '--branch', effectiveBranchName])
  return effectiveBranchName
}
