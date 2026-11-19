import { describe, expect, it, vi } from 'vitest'
import type { BrowserTabInfo } from '../../shared/browser/runtime/runtime-browser-contracts'
import type { RuntimeClient } from '../runtime/client'
import { okFixture } from '../runtime/fixtures/runtime-rpc-fixtures'
import { formatCommandHelp } from '../discovery/help'
import { BROWSER_BASIC_COMMAND_SPECS } from '../specs/browser-basic'
import { BROWSER_TAB_HANDLERS } from './browser-tab'

const SCOPED_EMPTY =
  'No browser tabs open in this worktree. Use --worktree all to list every worktree.'

// SAFETY: tab list reads only call() and isRemote; an id: selector does not list worktrees.
function tabListClient(tabs: readonly BrowserTabInfo[]): RuntimeClient {
  return {
    isRemote: false,
    call: vi.fn(async (method: string) => {
      if (method !== 'browser.tabList') {
        throw new Error(`unexpected ${method}`)
      }
      return okFixture('req_tab_list', { tabs })
    })
  } as RuntimeClient
}

async function listTabs(
  flags: Map<string, string | boolean>,
  tabs: readonly BrowserTabInfo[]
): Promise<string> {
  const lines: string[] = []
  vi.spyOn(console, 'log').mockImplementation((line?: unknown) => {
    lines.push(String(line))
  })
  await BROWSER_TAB_HANDLERS['tab list']({
    flags,
    client: tabListClient(tabs),
    cwd: '/tmp/wt-b',
    json: false
  })
  return lines.join('\n')
}

describe('orca tab list empty scope', () => {
  it('names the worktree when that worktree has no tabs', async () => {
    const text = await listTabs(new Map([['worktree', 'id:wt-b']]), [])

    expect(text).toBe(SCOPED_EMPTY)
  })

  it('names the worktree when --show-profile is set and that worktree has no tabs', async () => {
    const text = await listTabs(
      new Map<string, string | boolean>([
        ['worktree', 'id:wt-b'],
        ['show-profile', true]
      ]),
      []
    )

    expect(text).toBe(SCOPED_EMPTY)
  })

  it('keeps the global sentence when --worktree all finds no tabs', async () => {
    const text = await listTabs(new Map([['worktree', 'all']]), [])

    expect(text).toBe('No browser tabs open.')
  })

  it('still lists a tab that is open in the scoped worktree', async () => {
    const text = await listTabs(new Map([['worktree', 'id:wt-b']]), [
      {
        browserPageId: 'page-1',
        index: 0,
        url: 'https://example.com',
        title: 'Example',
        active: true
      }
    ])

    expect(text).toBe('* [0] page-1  Example — https://example.com')
  })

  it('states the default worktree in tab list help', () => {
    const spec = BROWSER_BASIC_COMMAND_SPECS.find((item) => item.path.join(' ') === 'tab list')
    if (!spec) {
      throw new Error('tab list spec missing')
    }

    expect(formatCommandHelp(spec)).toContain(
      'Defaults to the current worktree. Pass --worktree all to list every worktree.'
    )
  })
})
