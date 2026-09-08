import { createDraftPasteReadyScanner } from '../../shared/draft-paste-ready-scanner'
import { resolveDraftPasteReadyTimeoutMs } from '../../shared/draft-paste-ready-timeout'
import { TUI_AGENT_CONFIG } from '../../shared/tui-agent-config'
import type { TuiAgent } from '../../shared/tui-agent'

const BRACKETED_PASTE_QUIET_MS = 1500

export type PtyDraftInputReadyHost = {
  subscribeToData: (ptyId: string, listener: (data: string) => void) => () => void
  readRecentOutput: (ptyId: string) => string | undefined
  subscribeToExit: (ptyId: string, listener: () => void) => () => void
}

export function waitForPtyDraftInputReady(
  host: PtyDraftInputReadyHost,
  ptyId: string,
  agent: TuiAgent
): Promise<boolean> {
  const readySignal =
    TUI_AGENT_CONFIG[agent].draftPasteReadySignal ?? 'render-quiet-after-bracketed-paste'
  return new Promise<boolean>((resolve, reject) => {
    let settled = false
    const scanner = createDraftPasteReadyScanner(readySignal)
    let quietTimer: NodeJS.Timeout | null = null
    let hardTimer: NodeJS.Timeout | null = null
    let unsubscribeData: (() => void) | null = null
    let unsubscribeExit: (() => void) | null = null

    const cleanup = (): void => {
      if (quietTimer) {
        clearTimeout(quietTimer)
      }
      if (hardTimer) {
        clearTimeout(hardTimer)
      }
      unsubscribeData?.()
      unsubscribeExit?.()
    }

    const finish = (value: boolean): void => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      resolve(value)
    }

    const fail = (error: unknown): void => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      reject(error)
    }

    const observeData = (data: string): void => {
      const { ready, armQuietTimer } = scanner.observe(data)
      if (ready) {
        finish(true)
        return
      }
      if (!armQuietTimer) {
        return
      }
      if (quietTimer) {
        clearTimeout(quietTimer)
      }
      quietTimer = setTimeout(() => finish(true), BRACKETED_PASTE_QUIET_MS)
    }

    unsubscribeData = host.subscribeToData(ptyId, observeData)
    unsubscribeExit = host.subscribeToExit(ptyId, () => fail(new Error('terminal_exited')))
    const replay = host.readRecentOutput(ptyId)
    if (replay) {
      observeData(replay)
    }
    if (!settled) {
      hardTimer = setTimeout(() => finish(false), resolveDraftPasteReadyTimeoutMs(agent))
    }
  })
}
