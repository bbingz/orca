import { describe, expect, it } from 'vitest'
import { managedServerOutcomeLabel } from './managed-server-copy'

describe('managedServerOutcomeLabel', () => {
  it('names an unconfirmed server stop instead of asking to try later', () => {
    expect(
      managedServerOutcomeLabel({
        outcome: 'deferred',
        code: 'orcad_outgoing_stop_incomplete'
      })
    ).toBe(
      'Not done: Orca couldn’t confirm the current server exited, so it did not start the update. Check the server log before trying again.'
    )
  })
})
