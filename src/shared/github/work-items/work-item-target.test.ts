import { describe, expect, it } from 'vitest'
import { matchesGitHubWorkItemTarget, resolveGitHubWorkItemTarget } from './work-item-target'

const apiRepository = { host: 'git.example.com', owner: 'acme', repo: 'widgets' }

describe('GitHub Enterprise web and API hosts', () => {
  it('opens a listed issue on the API host when html_url uses the web host', () => {
    const item = {
      url: 'https://github.example.com/acme/widgets/issues/93',
      type: 'issue' as const,
      number: 93,
      apiRepository
    }
    const target = resolveGitHubWorkItemTarget(item)
    expect(target).toEqual({ repository: apiRepository, type: 'issue', number: 93 })
    expect(target && matchesGitHubWorkItemTarget(item, target)).toBe(true)
  })

  it('opens a listed pull request on prRepo when html_url uses the web host', () => {
    const item = {
      url: 'https://github.example.com/acme/widgets/pull/93',
      type: 'pr' as const,
      number: 93,
      prRepo: apiRepository
    }
    const target = resolveGitHubWorkItemTarget(item)
    expect(target).toEqual({ repository: apiRepository, type: 'pr', number: 93 })
    expect(target && matchesGitHubWorkItemTarget(item, target)).toBe(true)
  })
})
