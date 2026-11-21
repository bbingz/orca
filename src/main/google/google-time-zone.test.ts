import { describe, expect, it } from 'vitest'
import { windowBound, zonedMidnight } from './google-time-zone'

describe('zonedMidnight', () => {
  it('uses the offset in force at local midnight when the clocks change that day', () => {
    // New York springs forward at 02:00 on 8 Mar 2026, so midnight is still UTC-5.
    expect(zonedMidnight('2026-03-08', 'America/New_York')).toBe('2026-03-08T00:00:00-05:00')
    // New York falls back at 02:00 on 1 Nov 2026, so midnight is still UTC-4.
    expect(zonedMidnight('2026-11-01', 'America/New_York')).toBe('2026-11-01T00:00:00-04:00')
    expect(zonedMidnight('2026-11-03', 'America/New_York')).toBe('2026-11-03T00:00:00-05:00')
    expect(zonedMidnight('2026-11-09', 'Asia/Kolkata')).toBe('2026-11-09T00:00:00+05:30')
    expect(windowBound('2026-03-08', 'America/New_York', true)).toBe('2026-03-09T00:00:00-04:00')
    expect(windowBound('2026-11-01', 'America/New_York', true)).toBe('2026-11-02T00:00:00-05:00')
  })
})
