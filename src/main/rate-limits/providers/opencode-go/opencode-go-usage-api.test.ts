import { afterEach, describe, expect, it } from 'vitest'
import { setMainHttpClient } from '../../../network/http-client'
import { fetchOpenCodeGoUsageWithApiKey } from './opencode-go-usage-api'

const ENTITLEMENT_BODY = JSON.stringify({
  type: 'error',
  error: { type: 'EntitlementError', message: 'OpenCode Go subscription required.' }
})

function respondWith(status: number, body: string, contentType: string): void {
  setMainHttpClient({
    fetch: async () => new Response(body, { status, headers: { 'Content-Type': contentType } }),
    proxySession: () => null
  })
}

const USAGE_BODY = JSON.stringify({
  usage: {
    rolling: { percent: 12.5, resetsAt: '2026-11-27T00:00:00.000Z' },
    weekly: { percent: 40, resetsAt: '2026-12-01T00:00:00.000Z' },
    monthly: { percent: 7, resetsAt: '2026-12-26T00:00:00.000Z' }
  }
})

describe('fetchOpenCodeGoUsageWithApiKey transient network errors', () => {
  afterEach(() => setMainHttpClient(null))

  it('returns the usage payload after one TypeError', async () => {
    let calls = 0
    setMainHttpClient({
      fetch: async () => {
        calls += 1
        if (calls === 1) {
          throw new TypeError('fetch failed')
        }
        return new Response(USAGE_BODY, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      },
      proxySession: () => null
    })

    const outcome = await fetchOpenCodeGoUsageWithApiKey('placeholder-go-key')

    expect(calls).toBe(2)
    expect(outcome).toEqual({
      kind: 'ok',
      windows: {
        session: {
          usedPercent: 12.5,
          windowMinutes: 300,
          resetsAt: 1795737600000,
          resetDescription: null
        },
        weekly: {
          usedPercent: 40,
          windowMinutes: 10080,
          resetsAt: 1796083200000,
          resetDescription: null
        },
        monthly: {
          usedPercent: 7,
          windowMinutes: 43200,
          resetsAt: 1798243200000,
          resetDescription: null
        }
      }
    })
  })
})

describe('fetchOpenCodeGoUsageWithApiKey failure classification', () => {
  afterEach(() => setMainHttpClient(null))

  it.each([
    ['entitlement 403', 403, ENTITLEMENT_BODY, 'application/json', 'no-subscription'],
    ['edge block page', 403, '<html><title>Access denied</title></html>', 'text/html', 'failed']
  ])('maps %s to its outcome', async (_case, status, body, contentType, kind) => {
    respondWith(status, body, contentType)
    const outcome = await fetchOpenCodeGoUsageWithApiKey('placeholder-go-key')
    expect(outcome.kind).toBe(kind)
  })
})
