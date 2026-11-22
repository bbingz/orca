import { elementScroll, type Virtualizer } from '@tanstack/react-virtual'
import type { ProgrammaticScrollMarks } from '@/lib/list-interaction/virtualized-scrolling/programmatic-scroll-marks'
import { MARKDOWN_PREVIEW_HTML_ID_PREFIX } from '../render-tree/markdown-preview-plugins'

export function getMarkdownPreviewAnchorScrollTop(
  container: Pick<HTMLElement, 'getBoundingClientRect' | 'scrollTop'>,
  target: Pick<HTMLElement, 'getBoundingClientRect'>,
  align: 'start' | 'center' = 'start'
): number {
  const viewport = container.getBoundingClientRect()
  const bounds = target.getBoundingClientRect()
  const offset = align === 'center' ? (viewport.height - bounds.height) / 2 : 12
  return Math.max(0, bounds.top - viewport.top + container.scrollTop - offset)
}

export function decodeMarkdownPreviewAnchor(rawAnchor: string): string {
  try {
    return decodeURIComponent(rawAnchor)
  } catch {
    return rawAnchor
  }
}

export function resolveMarkdownPreviewAnchorId(
  rawAnchor: string,
  hasId: (id: string) => boolean
): string | null {
  const decoded = decodeMarkdownPreviewAnchor(rawAnchor)
  if (decoded && hasId(decoded)) {
    return decoded
  }
  const prefix = MARKDOWN_PREVIEW_HTML_ID_PREFIX
  // The sanitizer always adds one prefix, including when the authored id already has it.
  if (!decoded || !prefix) {
    return null
  }
  const prefixed = `${prefix}${decoded}`
  return hasId(prefixed) ? prefixed : null
}

export function findMarkdownPreviewAnchorElement(
  root: ParentNode,
  rawAnchor: string
): HTMLElement | null {
  const nodes = [...root.querySelectorAll<HTMLElement>('[id]')]
  const id = resolveMarkdownPreviewAnchorId(rawAnchor, (candidate) =>
    nodes.some((node) => node.id === candidate)
  )
  return id ? (nodes.find((node) => node.id === id) ?? null) : null
}

export function scrollMarkdownPreviewVirtualizer(
  offset: number,
  options: { adjustments?: number; behavior?: ScrollBehavior },
  instance: Virtualizer<HTMLDivElement, HTMLDivElement>,
  marks: ProgrammaticScrollMarks
): void {
  const element = instance.scrollElement
  const previous = element?.scrollTop
  elementScroll(offset, options, instance)
  const landing = element?.scrollTop
  if (landing !== undefined && landing !== previous) {
    marks.mark(landing)
  }
}

export function scrollMarkdownPreviewTo(
  container: HTMLDivElement,
  top: number,
  marks: ProgrammaticScrollMarks
): void {
  const previous = container.scrollTop
  container.scrollTo({ top })
  if (container.scrollTop !== previous) {
    marks.mark(container.scrollTop)
  }
}
