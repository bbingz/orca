// @vitest-environment happy-dom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import antigravityIconUrl from '../../../../../shared/agent-icons/antigravity.png?url'
import cursorIconUrl from '../../../../../shared/agent-icons/cursor.png?url'
import devinIconUrl from '../../../../../shared/agent-icons/devin.png?url'
import vscodeIconUrl from '../../../../../shared/editor-icons/vscode.png?url'
import zedIconUrl from '../../../../../shared/editor-icons/zed.png?url'
import { OpenInApplicationIcon } from './open-in-app-catalog'

afterEach(() => {
  cleanup()
})

describe('OpenInApplicationIcon', () => {
  it('uses bundled editor icons instead of the Google favicon service', () => {
    const cases = [
      ['code', vscodeIconUrl],
      ['Cursor', cursorIconUrl],
      ['zed', zedIconUrl],
      ['devin-desktop', devinIconUrl],
      ['antigravity-ide', antigravityIconUrl]
    ] as const
    for (const [command, iconUrl] of cases) {
      const { container, unmount } = render(<OpenInApplicationIcon application={{ command }} />)
      expect(container.querySelector('img')?.getAttribute('src')).toBe(iconUrl)
      unmount()
    }
  })

  it('replaces a failed icon with the local app glyph and still shows the next preset', () => {
    const { container, rerender } = render(
      <OpenInApplicationIcon application={{ command: 'code' }} />
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    fireEvent.error(img!)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
    rerender(<OpenInApplicationIcon application={{ command: 'cursor' }} />)
    expect(container.querySelector('img')?.getAttribute('src')).toBe(cursorIconUrl)
  })
})
