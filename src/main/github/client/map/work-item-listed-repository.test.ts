import { describe, expect, it } from 'vitest'
import { mapIssueWorkItem } from './work-item'

describe('mapIssueWorkItem', () => {
  it('keeps the API repository that listed an issue when html_url uses another host', () => {
    const item = mapIssueWorkItem(
      {
        number: 93,
        title: 'Split host',
        state: 'open',
        html_url: 'https://github.example.com/acme/widgets/issues/93',
        updated_at: '2026-11-27T15:49:56Z'
      },
      { host: 'git.example.com', owner: 'acme', repo: 'widgets' }
    )
    expect(item.url).toBe('https://github.example.com/acme/widgets/issues/93')
    expect(item.apiRepository).toEqual({
      host: 'git.example.com',
      owner: 'acme',
      repo: 'widgets'
    })
  })
})
