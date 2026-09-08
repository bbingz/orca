import { expect, it, vi } from 'vitest'
import { OrcaRuntimeService } from './orca-runtime-test-mocks.spec'
import { TEST_WORKTREE_ID, store } from './orca-runtime-test-fixtures.spec'
import type { RuntimeMobileSessionTabsSnapshot } from '../../shared/runtime-types'

it('does not publish unknown-owner offscreen rows into an unaccepted renderer epoch', () => {
  const runtime = new OrcaRuntimeService(store)
  runtime.setOffscreenBrowserBackend({ closeTab: vi.fn() } as never)
  runtime.setAgentBrowserBridge({
    tabList: () => ({
      tabs: [
        {
          browserPageId: 'offscreen-new',
          title: 'Headless',
          url: 'https://example.com/',
          active: false
        }
      ]
    })
  } as never)
  const snapshot: RuntimeMobileSessionTabsSnapshot = {
    worktree: TEST_WORKTREE_ID,
    publicationEpoch: 'renderer-unaccepted',
    snapshotVersion: 1,
    activeGroupId: null,
    activeTabId: null,
    activeTabType: null,
    tabs: []
  }
  runtime['mobileSessionTabsByWorktree'].set(TEST_WORKTREE_ID, snapshot)
  runtime['acceptedRendererMobileSnapshotByWorktree'].delete(TEST_WORKTREE_ID)
  runtime['reconcileHeadlessMobileSessionBrowserTabs'](TEST_WORKTREE_ID, snapshot)
  expect(runtime['mobileSessionTabsByWorktree'].get(TEST_WORKTREE_ID)).toEqual(snapshot)
})
