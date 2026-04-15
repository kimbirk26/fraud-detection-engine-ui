import { describe, it, expect } from 'vitest'
import { decodeBase64Url, parseJwtClaims, isTokenExpired, mapClaimsToUser } from './session'

// ---------------------------------------------------------------------------
// decodeBase64Url
// ---------------------------------------------------------------------------
describe('decodeBase64Url', () => {
  it('decodes a standard base64url string', () => {
    // btoa('hello') → 'aGVsbG8='  (standard base64)
    // base64url removes padding → 'aGVsbG8'
    expect(decodeBase64Url('aGVsbG8')).toBe('hello')
  })

  it('handles strings that need padding added', () => {
    // btoa('hi') → 'aGk='  → base64url 'aGk'
    expect(decodeBase64Url('aGk')).toBe('hi')
  })

  it('converts - and _ back to + and /', () => {
    // btoa produces '+' and '/' for certain byte sequences;
    // base64url replaces them with '-' and '_'
    // '{"s":"a/b"}' encoded manually
    const json = '{"s":"a/b"}'
    const b64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    expect(decodeBase64Url(b64)).toBe(json)
  })
})

// ---------------------------------------------------------------------------
// parseJwtClaims
// ---------------------------------------------------------------------------

function makeToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return `${header}.${body}.signature`
}

describe('parseJwtClaims', () => {
  it('parses a valid JWT and returns claims', () => {
    const claims = { sub: 'user-1', exp: 9999999999, roles: ['ANALYST'] }
    const token = makeToken(claims)
    expect(parseJwtClaims(token)).toMatchObject(claims)
  })

  it('returns null for a malformed token with no dots', () => {
    expect(parseJwtClaims('notajwt')).toBeNull()
  })

  it('returns null when the payload segment is missing', () => {
    expect(parseJwtClaims('header.')).toBeNull()
  })

  it('returns null when the payload is not valid JSON', () => {
    const bad = btoa('not-json').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    expect(parseJwtClaims(`header.${bad}.sig`)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// isTokenExpired
// ---------------------------------------------------------------------------
describe('isTokenExpired', () => {
  it('returns true when exp is in the past', () => {
    const pastExp = Math.floor((Date.now() - 60_000) / 1000)
    expect(isTokenExpired({ sub: 'u', exp: pastExp })).toBe(true)
  })

  it('returns false when exp is in the future', () => {
    const futureExp = Math.floor((Date.now() + 60_000) / 1000)
    expect(isTokenExpired({ sub: 'u', exp: futureExp })).toBe(false)
  })

  it('returns false when exp is not present', () => {
    expect(isTokenExpired({ sub: 'u' })).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// mapClaimsToUser
// ---------------------------------------------------------------------------
describe('mapClaimsToUser', () => {
  it('maps full claims correctly', () => {
    const claims = { sub: 'user-42', roles: ['ANALYST', 'ADMIN'] as const, customerId: 'cust-1' }
    const user = mapClaimsToUser(claims)
    expect(user).toEqual({ id: 'user-42', roles: ['ANALYST', 'ADMIN'], customerId: 'cust-1' })
  })

  it('defaults roles to empty array when absent', () => {
    const user = mapClaimsToUser({ sub: 'user-1' })
    expect(user.roles).toEqual([])
  })
})
