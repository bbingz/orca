import type { Terminal } from '@xterm/xterm'
import type { LinkHandlerDeps } from './terminal-link-handlers'
import { isTerminalHttpLinkActivation } from './terminal-http-link-activation'
import { handleOscLink } from './terminal-osc-link-routing'
import {
  openHttpLinkAtTerminalMouseEvent,
  type TerminalLinkRoutingPreferenceRequester
} from './terminal-url-link-hit-testing'
import type { HttpLinkSourceOwner } from '@/lib/http-link-routing'
import { classifyExternalAppUrl } from '../../../../shared/external-app-url'

type TerminalWebLinkClickDeps = Pick<
  LinkHandlerDeps,
  'worktreeId' | 'worktreePath' | 'startupCwd' | 'runtimeEnvironmentId' | 'terminalHomePath'
> & {
  terminal: Terminal | null
  sourceOwner?: HttpLinkSourceOwner
  requestOpenLinksInAppPreference?: TerminalLinkRoutingPreferenceRequester
}

export function handleTerminalWebLinkClick(
  url: string,
  event: MouseEvent | undefined,
  deps: TerminalWebLinkClickDeps
): boolean {
  if (!event || !isTerminalHttpLinkActivation(event)) {
    return false
  }

  // Why: custom app schemes skip in-app browser routing; main prompts then openExternal (#13225).
  const classified = classifyExternalAppUrl(url)
  if (classified.ok && classified.kind === 'custom') {
    event.preventDefault()
    void window.api.shell.openUrl(classified.url).catch(() => undefined)
    deps.terminal?.clearSelection()
    return true
  }

  let handled: boolean
  if (
    deps.terminal &&
    openHttpLinkAtTerminalMouseEvent(deps.terminal, event, {
      worktreeId: deps.worktreeId,
      sourceOwner:
        deps.sourceOwner ??
        (deps.runtimeEnvironmentId
          ? { kind: 'runtime', runtimeEnvironmentId: deps.runtimeEnvironmentId }
          : { kind: 'local' }),
      modifierHeld: Boolean(event.shiftKey),
      requestOpenLinksInAppPreference: deps.requestOpenLinksInAppPreference
    })
  ) {
    // Why: WebLinksAddon only knows the physical row; Orca's logical hit-test
    // preserves the complete URL rendered across hard-wrapped TUI rows.
    event.preventDefault()
    handled = true
  } else {
    handled = handleOscLink(url, event, deps)
  }

  if (handled) {
    // Why: link navigation can steal focus before xterm's mouseup cleanup;
    // clearing selection also detaches its pending drag-selection listeners.
    deps.terminal?.clearSelection()
  }
  return handled
}
