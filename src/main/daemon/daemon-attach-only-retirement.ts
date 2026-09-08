import {
  classifyAttachOnlyKillError,
  trackAttachOnlyOrphanRisk
} from './daemon-attach-only-orphan-event'
import { retireAccidentalAttachOnlySpawn } from './daemon-attach-only-retire'
import { SessionNotFoundError, TerminalSessionOwnerUnverifiedError } from './daemon-errors'

export async function retireUnexpectedAttachOnlySpawn(
  protocolVersion: number,
  sessionId: string,
  kill: () => Promise<unknown>
): Promise<void> {
  const retire = await retireAccidentalAttachOnlySpawn({
    kill: async () => {
      await kill()
    }
  })
  if (retire.ok || retire.error instanceof SessionNotFoundError) {
    return
  }
  const killErrorClass = classifyAttachOnlyKillError(retire.error)
  console.error(
    '[daemon] attach-only retire of accidental legacy spawn failed; orphan may remain',
    { protocolVersion, killErrorClass }
  )
  trackAttachOnlyOrphanRisk({ protocolVersion, killErrorClass })
  throw new TerminalSessionOwnerUnverifiedError(sessionId)
}
