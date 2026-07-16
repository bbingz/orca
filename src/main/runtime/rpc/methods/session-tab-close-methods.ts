import { withSpan } from '../../../observability/tracer'
import type { RpcContext } from '../core'
import { defineMethod, type RpcAnyMethod } from '../core'
import { recordRuntimeCloseAttribution } from '../runtime-close-attribution'
import type { RuntimeCloseDecision } from '../runtime-close-policy'
import { CloseLifecycleTab, CloseTab } from './session-tabs-schemas'

function resolveSessionTabCloseDecision(
  context: Pick<RpcContext, 'clientKind' | 'runtimeClosePolicy' | 'deviceId' | 'connectionId'>,
  target: { kind: 'session-tab'; worktree: string; tabId: string },
  closeIntent: Parameters<NonNullable<RpcContext['runtimeClosePolicy']>['evaluate']>[2]
): RuntimeCloseDecision {
  return (
    context.runtimeClosePolicy?.evaluate(context, target, closeIntent) ??
    (context.clientKind === 'runtime'
      ? {
          allowed: false,
          reason: 'close_intent_required',
          recentlyAttached: false
        }
      : { allowed: true, reason: 'legacy-client', recentlyAttached: false })
  )
}

export const SESSION_TAB_CLOSE_METHODS: RpcAnyMethod[] = [
  defineMethod({
    name: 'session.tabs.close',
    params: CloseTab,
    handler: async (params, context) =>
      withSpan(
        'runtime.session-tabs.close',
        async (span) => {
          if (!params.reason && context.clientKind === undefined) {
            const result = await context.runtime.refuseUnattributedMobileSessionTabClose(
              params.worktree,
              params.tabId
            )
            span.setAttribute('decision', `refused-${result.refusalReason ?? 'missing-intent'}`)
            return result
          }

          const target = {
            kind: 'session-tab' as const,
            worktree: params.worktree,
            tabId: params.tabId
          }
          const decision = resolveSessionTabCloseDecision(context, target, params.closeIntent)
          // Why: host-PTY teardown must be attributable to the issuing device (#8871).
          const result = await recordRuntimeCloseAttribution(
            'session.tabs.close',
            context,
            target,
            params.closeIntent,
            decision,
            async () => {
              if (!decision.allowed) {
                return { closed: false as const, blockedReason: decision.reason }
              }
              return await context.runtime.closeMobileSessionTab(params.worktree, params.tabId, {
                reason: 'user'
              })
            }
          )
          const refused =
            result &&
            typeof result === 'object' &&
            'refused' in result &&
            (result as { refused?: true }).refused === true
          span.setAttribute(
            'decision',
            !decision.allowed
              ? `blocked-${decision.reason}`
              : refused
                ? `refused-${(result as { refusalReason?: string }).refusalReason ?? 'unknown'}`
                : 'allowed'
          )
          return result
        },
        {
          kind: 'client',
          attributes: {
            attribution: 'session-tab-close',
            origin: context.clientKind ?? 'in-process',
            closeReason:
              params.reason ??
              (context.clientKind ? `legacy-${context.clientKind}-user` : 'missing'),
            connectionGeneration: context.connectionId ?? 'in-process',
            requestId: context.requestId ?? 'in-process'
          }
        }
      )
  }),
  defineMethod({
    name: 'session.tabs.closeLifecycle',
    params: CloseLifecycleTab,
    handler: async (params, context) =>
      withSpan(
        'runtime.session-tabs.close-lifecycle',
        async (span) => {
          const result = await context.runtime.closeMobileSessionTab(
            params.worktree,
            params.tabId,
            {
              reason: params.reason,
              expectedPublicationEpoch: params.publicationEpoch,
              expectedTerminalHandle: params.terminal
            }
          )
          span.setAttribute(
            'decision',
            result.refused ? `refused-${result.refusalReason ?? 'unknown'}` : 'allowed'
          )
          return result
        },
        {
          kind: 'client',
          attributes: {
            attribution: 'session-tab-lifecycle-close',
            origin: context.clientKind ?? 'in-process',
            closeReason: params.reason,
            connectionGeneration: context.connectionId ?? 'in-process',
            requestId: context.requestId ?? 'in-process',
            publicationEpoch: params.publicationEpoch
          }
        }
      )
  })
]
