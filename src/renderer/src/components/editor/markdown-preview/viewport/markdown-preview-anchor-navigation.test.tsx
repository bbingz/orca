// @vitest-environment happy-dom

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { parseMarkdownPreviewDocument } from '../document-worker/markdown-preview-document-tree'
import { MarkdownPreviewBody } from '../render-tree/MarkdownPreviewBody'
import {
  findMarkdownPreviewAnchorElement,
  resolveMarkdownPreviewAnchorId
} from './markdown-preview-anchor-navigation'

function renderPreview(content: string): HTMLElement {
  const host = document.createElement('div')
  host.innerHTML = renderToStaticMarkup(
    createElement(MarkdownPreviewBody, { content, components: {} })
  )
  return host
}

describe('markdown preview HTML anchors', () => {
  it('resolves an authored id through the sanitizer prefix and keeps a heading slug exact', () => {
    const authored = renderPreview('[Go to section](#section)\n\n<a id="section"></a>\n')
    expect(findMarkdownPreviewAnchorElement(authored, 'section')?.id).toBe('user-content-section')
    expect(findMarkdownPreviewAnchorElement(authored, 'user-content-section')?.id).toBe(
      'user-content-section'
    )

    const heading = renderPreview('[Go to section](#section)\n\n## Section\n')
    expect(findMarkdownPreviewAnchorElement(heading, 'section')?.id).toBe('section')

    const authoredAndHeading = renderPreview(
      '[Go to section](#section)\n\n<a id="section"></a>\n## Section\n'
    )
    const headingTarget = findMarkdownPreviewAnchorElement(authoredAndHeading, 'section')
    expect(headingTarget?.id).toBe('section')
    expect(headingTarget?.tagName).toBe('H2')

    const { document } = parseMarkdownPreviewDocument(
      '[Go to section](#section)\n\n<h2 id="section">Section</h2>\n'
    )
    const anchors = document.blocks.flatMap((block) => block.anchors)
    expect(anchors).toContain('user-content-section')
    expect(resolveMarkdownPreviewAnchorId('section', (id) => anchors.includes(id))).toBe(
      'user-content-section'
    )
  })
})
