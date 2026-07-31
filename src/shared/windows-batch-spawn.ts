import { win32 } from 'node:path'
import { getWindowsPowerShellShimSpawn } from './windows-powershell-shim-spawn'

/** Full path to cmd.exe for GUI and service-launched processes. */
export function getCmdExePath(): string {
  return (
    process.env.ComSpec ||
    win32.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'cmd.exe')
  )
}

export function isWindowsBatchScript(commandPath: string): boolean {
  return process.platform === 'win32' && /\.(cmd|bat)$/i.test(commandPath)
}

export const WINDOWS_BATCH_UNSAFE_ARGUMENTS_ERROR = 'UNSAFE_WINDOWS_BATCH_ARGUMENTS'

export class UnsafeWindowsBatchArgumentsError extends Error {
  constructor() {
    super(WINDOWS_BATCH_UNSAFE_ARGUMENTS_ERROR)
    this.name = 'UnsafeWindowsBatchArgumentsError'
  }
}

// Why: cmd.exe re-parses the command line, and these are the characters that can
// start a new command or expand a variable out of an otherwise inert argument.
// `(`/`)` are deliberately absent: they only group commands, and grouping cannot
// chain anything without one of the separators below, so rejecting them merely
// broke every `C:\Program Files (x86)\...` shim and paren-bearing worktree path.
const WINDOWS_BATCH_UNSAFE_CHARACTERS = ['&', '|', '<', '>', '^', '"', '%', '!'] as const

/** The rejected characters, spelled for error messages so they cannot drift from the guard. */
export const WINDOWS_BATCH_UNSAFE_CHARACTERS_LABEL = WINDOWS_BATCH_UNSAFE_CHARACTERS.join(' ')

const UNSAFE_WINDOWS_BATCH_SYNTAX = new RegExp(
  `[${WINDOWS_BATCH_UNSAFE_CHARACTERS.map((character) => character.replace(/[\\^\]-]/, '\\$&')).join('')}\\r\\n]`
)

function hasUnsafeWindowsBatchSyntax(value: string): boolean {
  return UNSAFE_WINDOWS_BATCH_SYNTAX.test(value)
}

export type WindowsSpawnOptions = {
  allowPowerShellShimFallback?: boolean
  env?: NodeJS.ProcessEnv
}

/**
 * Resolve spawn parameters for a command that may be a Windows batch script.
 *
 * Why: Node's spawn() cannot execute .cmd/.bat files directly without
 * shell:true, but shell:true with an args array triggers DEP0190 because
 * args are concatenated, not escaped. Routing through cmd.exe /c explicitly
 * avoids the deprecation warning while passing args correctly.
 *
 * Why /d: disables per-machine/user AutoRun registry commands so a background
 * spawn cannot inherit surprising side effects from the user's shell config.
 *
 * SAFETY: when the .cmd/.bat branch is taken, cmd.exe re-parses the command
 * line. Args with cmd metacharacters are rejected instead of escaped. Opt-in
 * callers may use an existing sibling .ps1 without involving cmd.exe.
 */
export function getSpawnArgsForWindows(
  command: string,
  args: string[],
  options: WindowsSpawnOptions = {}
): { spawnCmd: string; spawnArgs: string[] } {
  if (isWindowsBatchScript(command)) {
    for (const value of [command, ...args]) {
      if (hasUnsafeWindowsBatchSyntax(value)) {
        // Why: direct PowerShell execution avoids cmd.exe re-parsing arbitrary prompt text.
        const fallback = options.allowPowerShellShimFallback
          ? getWindowsPowerShellShimSpawn(command, args, options.env ?? process.env)
          : null
        if (fallback) {
          return fallback
        }
        throw new UnsafeWindowsBatchArgumentsError()
      }
    }

    // Why: separate argv entries let Node quote spaces without breaking cmd.
    return { spawnCmd: getCmdExePath(), spawnArgs: ['/d', '/c', command, ...args] }
  }
  return { spawnCmd: command, spawnArgs: args }
}
