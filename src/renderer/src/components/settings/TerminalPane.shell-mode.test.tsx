// @vitest-environment happy-dom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GlobalSettings } from '../../../../shared/global-settings-types'
import { TooltipProvider } from '../ui/tooltip'
import { TerminalPane } from './TerminalPane'

vi.mock('../../store', () => ({
  useAppStore: (selector: (state: unknown) => unknown) =>
    selector({
      settingsSearchQuery: '',
      ptyIdsByTabId: {},
      tabsByWorktree: {},
      retainedPanes: [],
      tabs: []
    })
}))

vi.mock('./ManageSessionsSection', () => ({
  ManageSessionsSection: () => null
}))

vi.mock('@/components/terminal-pane/pane-helpers', () => ({
  isMacUserAgent: () => true,
  isWindowsUserAgent: () => false
}))

vi.mock('@/lib/keyboard-layout/use-effective-mac-option-as-alt', () => ({
  useDetectedOptionAsAlt: () => 'us'
}))

vi.mock('@/lib/keyboard-layout/detect-option-as-alt', () => ({
  detectedCategoryToDefault: () => 'left-option'
}))

afterEach(cleanup)

function renderTerminalPane(initialShell = ''): {
  persist: ReturnType<typeof vi.fn>
} {
  const persist = vi.fn()
  function Harness(): React.JSX.Element {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test harness provides partial settings sufficient for shell selection.
    const [settings, setSettings] = useState<GlobalSettings>({
      terminalDefaultShell: initialShell
    } as unknown as GlobalSettings)
    return (
      <TooltipProvider>
        <TerminalPane
          settings={settings}
          updateSettings={(patch) => {
            persist(patch)
            setSettings((prev) => ({ ...prev, ...patch }))
          }}
          scrollbackMode="preset"
          setScrollbackMode={vi.fn()}
        />
      </TooltipProvider>
    )
  }
  render(<Harness />)
  return { persist }
}

describe('TerminalPane shell mode selection (#21586)', () => {
  beforeEach(() => {
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: Test mock for window.api desktop bridge.
    window.api = ({
      platform: {
        get: () => ({ shell: '/bin/zsh' })
      },
      shell: {
        pathExists: vi.fn().mockResolvedValue(true)
      }
    }) as unknown as typeof window.api
  })

  it('allows selecting Custom shell from the initial empty default shell', () => {
    const { persist } = renderTerminalPane()

    const systemRadio = screen.getByRole('radio', { name: /^System shell/ })
    const customRadio = screen.getByRole('radio', { name: 'Custom shell' })

    expect(systemRadio.getAttribute('aria-checked')).toBe('true')
    expect(customRadio.getAttribute('aria-checked')).toBe('false')
    expect(screen.queryByLabelText('Custom shell executable')).toBeNull()

    fireEvent.click(customRadio)

    expect(customRadio.getAttribute('aria-checked')).toBe('true')
    expect(systemRadio.getAttribute('aria-checked')).toBe('false')

    const input = screen.getByLabelText('Custom shell executable')
    expect(input).not.toBeNull()

    fireEvent.change(input, { target: { value: '/bin/fish' } })
    expect(persist).toHaveBeenCalledWith({ terminalDefaultShell: '/bin/fish' })
  })

  it('restores System shell and clears terminalDefaultShell when clicking System shell', () => {
    const { persist } = renderTerminalPane('/bin/fish')

    const systemRadio = screen.getByRole('radio', { name: /^System shell/ })
    const customRadio = screen.getByRole('radio', { name: 'Custom shell' })

    expect(customRadio.getAttribute('aria-checked')).toBe('true')
    expect(screen.getByLabelText('Custom shell executable')).not.toBeNull()

    fireEvent.click(systemRadio)

    expect(systemRadio.getAttribute('aria-checked')).toBe('true')
    expect(customRadio.getAttribute('aria-checked')).toBe('false')
    expect(screen.queryByLabelText('Custom shell executable')).toBeNull()
    expect(persist).toHaveBeenCalledWith({ terminalDefaultShell: '' })
  })
})
