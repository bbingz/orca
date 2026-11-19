// @vitest-environment happy-dom

import { act, cleanup, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { useAppStore } from '@/store/index'
import CloseTerminalDialog from './CloseTerminalDialog'

const initialState = useAppStore.getInitialState()

function mountActiveLeaf(): HTMLTextAreaElement {
  const tab = document.createElement('div')
  tab.setAttribute('data-terminal-tab-id', 'tab-1')
  const leaf = document.createElement('div')
  leaf.setAttribute('data-leaf-id', 'leaf-1')
  const helper = document.createElement('textarea')
  helper.className = 'xterm-helper-textarea'
  leaf.append(helper)
  tab.append(leaf)
  document.body.append(tab)
  return helper
}

function flushFocusFrames(): Promise<void> {
  return act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
  )
}

function OpenCloseDialog(): React.JSX.Element {
  const [open, setOpen] = useState(true)
  return (
    <CloseTerminalDialog
      open={open}
      onCancel={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
    />
  )
}

beforeEach(() => {
  useAppStore.setState(initialState, true)
  useAppStore.setState({
    activeWorktreeId: 'wt-1',
    activeTabType: 'terminal',
    activeTabId: 'tab-1',
    activeTabIdByWorktree: { 'wt-1': 'tab-1' },
    terminalLayoutsByTabId: {
      'tab-1': {
        root: { type: 'leaf', leafId: 'leaf-1' },
        activeLeafId: 'leaf-1',
        expandedLeafId: null
      }
    }
  })
  document.body.replaceChildren()
})

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  useAppStore.setState(initialState, true)
})

it('returns focus to the active terminal pane when the close dialog is cancelled', async () => {
  const helper = mountActiveLeaf()
  render(<OpenCloseDialog />)
  await act(async () => {
    screen.getByRole('button', { name: 'Cancel' }).click()
  })
  await flushFocusFrames()
  expect(document.activeElement).toBe(helper)
})
