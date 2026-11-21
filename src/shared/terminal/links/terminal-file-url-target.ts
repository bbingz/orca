import { fileUriToFilesystemPath } from '../../file-links/file-uri-path'

export type TerminalFileUrlTarget = {
  filePath: string
  line: number | null
  column: number | null
}

export type TerminalFileUrlTargetOptions = {
  allowUncHost?: boolean
}

function parseFileUrlLineHash(hash: string): { line: number; column: number | null } | null {
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash
  // Why: GitHub-style ranges name the start line; dropping the whole fragment hides that line.
  const match = /^L(\d+)(?:C(\d+))?(?:-L?\d+)?$/i.exec(trimmed)
  if (!match) {
    return null
  }
  return {
    line: Number(match[1]),
    column: match[2] ? Number(match[2]) : null
  }
}

/** Path text plus a trailing `#L` fragment. A hash that is not a line fragment stays in the path. */
export function splitTerminalPathLineFragment(value: string): {
  pathText: string
  line: number | null
  column: number | null
} {
  const hashIndex = value.lastIndexOf('#')
  if (hashIndex <= 0) {
    return { pathText: value, line: null, column: null }
  }
  const parsed = parseFileUrlLineHash(value.slice(hashIndex))
  if (!parsed) {
    return { pathText: value, line: null, column: null }
  }
  return { pathText: value.slice(0, hashIndex), line: parsed.line, column: parsed.column }
}

function parseFilePathTrailingLineTarget(filePath: string): TerminalFileUrlTarget | null {
  const match = /^(.*?)(?::(\d+))(?::(\d+))?$/.exec(filePath)
  if (!match || !match[1] || match[1].endsWith('/') || match[1].endsWith('\\')) {
    return null
  }
  return {
    filePath: match[1],
    line: Number(match[2]),
    column: match[3] ? Number(match[3]) : null
  }
}

export function resolveTerminalFileUrlTarget(
  parsed: URL,
  options: TerminalFileUrlTargetOptions = {}
): TerminalFileUrlTarget | null {
  if (parsed.hostname && parsed.hostname !== 'localhost' && !options.allowUncHost) {
    return null
  }

  const filePath = fileUriToFilesystemPath(parsed)
  if (!filePath) {
    return null
  }

  const hashTarget = parseFileUrlLineHash(parsed.hash)
  if (hashTarget) {
    return { filePath, line: hashTarget.line, column: hashTarget.column }
  }

  return parseFilePathTrailingLineTarget(filePath) ?? { filePath, line: null, column: null }
}
