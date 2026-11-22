import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeCommandPositionals, parseArgs, validateCommandAndFlags } from '../arguments/args'
import { specPaths } from '../discovery/command-spec'
import type { HandlerContext } from '../dispatch/dispatch'
import { ignoresRemoteSelection } from '../dispatch/remote-selection-scope'
import type { RuntimeClient } from '../runtime/client'
import { COMMAND_SPECS } from '../specs/index'
import { SKILL_HANDLERS } from './skills'

// `--dry-run` is still rejected up front. If the guard is absent, the handler
// returns a plan instead of writing, so the failing run stays off the real home.
const REFUSALS = [
  ['install', '--environment', 'nope'],
  ['update', '--environment', 'nope'],
  ['install', '--pairing-code', 'abc'],
  ['update', '--pairing-code', 'abc']
] as const

let home: string | undefined

afterEach(async () => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  if (home) {
    await rm(home, { recursive: true, force: true })
    home = undefined
  }
})

async function run(argv: string[]): Promise<void> {
  home = await mkdtemp(join(tmpdir(), 'orca-skills-remote-'))
  vi.stubEnv('HOME', home)
  vi.stubEnv('USERPROFILE', home)
  vi.stubEnv('ORCA_USER_DATA_PATH', join(home, 'user-data'))
  vi.stubEnv('ORCA_CLI_CWD', '')
  vi.stubEnv('ORCA_ENVIRONMENT', '')
  const paths = COMMAND_SPECS.flatMap((spec) => specPaths(spec))
  const parsed = normalizeCommandPositionals(COMMAND_SPECS, parseArgs(argv, paths, COMMAND_SPECS))
  validateCommandAndFlags(COMMAND_SPECS, parsed)
  // SAFETY: these cases return or throw before the handler reads the client.
  const client = { isRemote: false } as unknown as RuntimeClient
  const ctx: HandlerContext = {
    flags: parsed.flags,
    client,
    cwd: home,
    json: true,
    rawArgs: argv
  }
  vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  await SKILL_HANDLERS[parsed.commandPath.join(' ')](ctx)
}

describe('skills install remote selector', () => {
  it.each(REFUSALS)('refuses skills %s %s %s before a plan or write', async (verb, flag, value) => {
    const flagName = flag.slice(2)
    await expect(
      run(['skills', verb, '--skill', 'orca-cli', '--agent', 'universal', flag, value, '--dry-run'])
    ).rejects.toMatchObject({
      code: 'invalid_argument',
      message: `\`--${flagName}\` does not retarget orca skills ${verb}; it writes on the machine that runs it`,
      data: {
        nextSteps: [
          `Run \`orca skills ${verb}\` on the machine whose agents need the skills.`,
          'Drop the flag to write on this machine.'
        ]
      }
    })
  })

  it('does not reject skills install --environment local', async () => {
    await expect(run(['skills', 'install', '--environment', 'local'])).resolves.toBeUndefined()
  })

  it('skips saved-server lookup for skills install and update', () => {
    expect(ignoresRemoteSelection(['skills', 'install'])).toBe(true)
    expect(ignoresRemoteSelection(['skills', 'update'])).toBe(true)
    expect(ignoresRemoteSelection(['skills', 'list'])).toBe(false)
  })
})
