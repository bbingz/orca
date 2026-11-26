// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DashboardAgentChildDisclosure } from './DashboardAgentChildDisclosure'

afterEach(cleanup)

function renderDisclosure(onParentMouseDown = () => {}) {
  return render(
    <div onMouseDown={onParentMouseDown}>
      <div data-terminal-workbench-container tabIndex={-1} />
      <DashboardAgentChildDisclosure
        childAgentCount={1}
        childAgentsExpanded={false}
        onToggleChildAgents={() => {}}
      />
    </div>
  )
}

function chevron(): HTMLElement {
  const button = document.querySelector('[data-agent-child-disclosure-button]')
  if (!(button instanceof HTMLElement)) {
    throw new Error('missing child disclosure button')
  }
  return button
}

it('prevents a mouse press from taking focus while a pane has it, and does not bubble', () => {
  const onParentMouseDown = vi.fn()
  renderDisclosure(onParentMouseDown)
  const pane = document.querySelector('[data-terminal-workbench-container]')
  if (!(pane instanceof HTMLElement)) {
    throw new Error('missing pane')
  }
  pane.focus()
  expect(document.activeElement).toBe(pane)
  expect(fireEvent.mouseDown(chevron())).toBe(false)
  expect(onParentMouseDown).not.toHaveBeenCalled()
})

it('lets a mouse press move focus when focus is outside a pane', () => {
  renderDisclosure()
  const outside = document.createElement('button')
  document.body.appendChild(outside)
  outside.focus()
  expect(document.activeElement).toBe(outside)
  expect(fireEvent.mouseDown(chevron())).toBe(true)
  outside.remove()
})
