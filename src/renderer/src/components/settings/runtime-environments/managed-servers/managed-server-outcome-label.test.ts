import { describe, expect, it } from 'vitest'
import { managedServerOutcomeLabel } from './managed-server-copy'

describe('managedServerOutcomeLabel', () => {
  it('selects the stop-incomplete outcome for an unconfirmed server exit', () => {
    const key = managedServerOutcomeLabel(
      {
        outcome: 'deferred',
        code: 'orcad_outgoing_stop_incomplete'
      },
      (selected) => selected
    )
    expect(key).toBe('auto.components.settings.managedServers.outcome.stopIncomplete')
  })
})
