// @vitest-environment happy-dom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TaskPageJiraSummaryGenerationModel } from './jira/creation/use-task-page-jira-summary-generation'
import { useTaskPageGlobalEffects } from './use-task-page-global-effects'

afterEach(() => {
  cleanup()
})

function renderEffects(overrides: Partial<TaskPageJiraSummaryGenerationModel> = {}) {
  const closeTaskPage = vi.fn()
  const closeTaskDetailPage = vi.fn()
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the Esc effect reads only these fields; the preflight effect is held idle.
  const model = {
    closeTaskPage,
    closeTaskDetailPage,
    activeModal: 'none',
    dialogWorkItem: null,
    newIssueOpen: false,
    selectedLinearIssue: null,
    selectedJiraIssue: null,
    newLinearIssueOpen: false,
    newJiraIssueOpen: false,
    preflightStatusCurrent: true,
    preflightStatusChecked: true,
    linearStatusReady: true,
    jiraStatusReady: true,
    githubListPending: false,
    tasksRefreshing: false,
    tasksFiltering: false,
    linearStatusContextKey: 'linear',
    preflightStatusContextKey: 'preflight',
    expectedPreflightContextKey: 'preflight',
    jiraStatusContextKey: 'jira',
    providerRuntimeContextKey: 'runtime',
    checkLinearConnection: vi.fn(),
    refreshPreflightStatus: vi.fn(),
    checkJiraConnection: vi.fn(),
    ...overrides
  } as TaskPageJiraSummaryGenerationModel
  renderHook(() => useTaskPageGlobalEffects(model))
  return { closeTaskPage, closeTaskDetailPage }
}

function pressEscape(target: EventTarget): void {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    )
  })
}

describe('useTaskPageGlobalEffects Escape', () => {
  it('steps back from a GitHub detail page', () => {
    const { closeTaskPage, closeTaskDetailPage } = renderEffects({
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the handler only checks that a GitHub detail is open.
      dialogWorkItem: { id: 'issue-1' } as TaskPageJiraSummaryGenerationModel['dialogWorkItem']
    })
    pressEscape(document.body)
    expect(closeTaskDetailPage).toHaveBeenCalledOnce()
    expect(closeTaskPage).not.toHaveBeenCalled()
  })

  it('blurs a focused field on a GitHub detail page before navigating', () => {
    const { closeTaskPage, closeTaskDetailPage } = renderEffects({
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the handler only checks that a GitHub detail is open.
      dialogWorkItem: { id: 'issue-1' } as TaskPageJiraSummaryGenerationModel['dialogWorkItem']
    })
    const input = document.createElement('input')
    document.body.append(input)
    input.focus()
    pressEscape(input)
    expect(document.activeElement).not.toBe(input)
    expect(closeTaskDetailPage).not.toHaveBeenCalled()
    expect(closeTaskPage).not.toHaveBeenCalled()
  })

  it('steps back from a Linear detail page', () => {
    const { closeTaskPage, closeTaskDetailPage } = renderEffects({
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the handler only checks that a Linear detail is open.
      selectedLinearIssue: {
        id: 'LIN-1'
      } as TaskPageJiraSummaryGenerationModel['selectedLinearIssue']
    })
    pressEscape(document.body)
    expect(closeTaskDetailPage).toHaveBeenCalledOnce()
    expect(closeTaskPage).not.toHaveBeenCalled()
  })
})
