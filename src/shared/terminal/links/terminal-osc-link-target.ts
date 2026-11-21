import { isWindowsAbsolutePathLike } from '../../file-access/cross-platform-path'
import {
  resolveTerminalFileUrlTarget,
  splitTerminalPathLineFragment,
  type TerminalFileUrlTarget
} from './terminal-file-url-target'
import { toParsedTerminalFileLink } from './terminal-file-link-detection-ranges'
import type { ParsedTerminalFileLink } from './terminal-links'

export type TerminalOscLinkTarget =
  | { kind: 'url'; url: string }
  | { kind: 'file-url'; target: TerminalFileUrlTarget }
  | { kind: 'path'; link: ParsedTerminalFileLink }

export type TerminalOscLinkTargetOptions = {
  /** URL parsing reads a drive letter as a scheme, so Windows hosts try the path reading first. */
  windowsPathsFirst: boolean
  allowUncHost: boolean
}

/** What an OSC 8 hyperlink's URI points at; callers resolve paths against their own cwd. */
export function classifyTerminalOscLinkTarget(
  rawText: string,
  options: TerminalOscLinkTargetOptions
): TerminalOscLinkTarget | null {
  // Why: a hyperlink names its whole target, so the path is taken as written, never detected in it.
  const pathTarget = (): TerminalOscLinkTarget | null => {
    // Why: Windows hosts classify drive URIs before URL parsing, so #L never reaches the file-URL reader.
    const fragment = splitTerminalPathLineFragment(rawText)
    const link = fragment.pathText.includes('://')
      ? null
      : toParsedTerminalFileLink({
          text: fragment.pathText,
          startIndex: 0,
          endIndex: fragment.pathText.length
        })
    if (!link) {
      return null
    }
    if (fragment.line === null || link.line !== null) {
      return { kind: 'path', link }
    }
    return {
      kind: 'path',
      link: { ...link, line: fragment.line, column: fragment.column ?? link.column }
    }
  }
  const windowsPath =
    options.windowsPathsFirst && isWindowsAbsolutePathLike(rawText) ? pathTarget() : null
  if (windowsPath) {
    return windowsPath
  }
  let parsed: URL
  try {
    parsed = new URL(rawText)
  } catch {
    return pathTarget()
  }
  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
    return { kind: 'url', url: parsed.toString() }
  }
  if (parsed.protocol !== 'file:') {
    return null
  }
  const target = resolveTerminalFileUrlTarget(parsed, { allowUncHost: options.allowUncHost })
  return target ? { kind: 'file-url', target } : null
}
