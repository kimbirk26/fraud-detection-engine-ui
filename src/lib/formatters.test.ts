import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from './formatters'

describe('formatDate', () => {
  it('formats a valid ISO string into a human-readable date', () => {
    // 2024-03-15 → "15 Mar 2024" in en-GB locale
    const result = formatDate('2024-03-15T00:00:00.000Z')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/2024/)
  })

  it('returns "—" for an invalid ISO string', () => {
    expect(formatDate('not-a-date')).toBe('—')
  })
})

describe('formatDateTime', () => {
  it('formats a valid ISO string into a human-readable date-time', () => {
    const result = formatDateTime('2024-06-01T14:30:00.000Z')
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/Jun/)
  })

  it('returns "—" for an invalid ISO string', () => {
    expect(formatDateTime('garbage')).toBe('—')
  })
})
