import type { JwtClaims, UserRole } from '../lib/types'
import type { AuthState, AuthUser } from './types'

const AUTH_TOKEN_KEY = 'fde-token'

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string'
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isJwtClaims(value: unknown): value is JwtClaims {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const claims = value as Record<string, unknown>

  if (!isString(claims.sub)) {
    return false
  }

  if (claims.customerId !== undefined && !isString(claims.customerId)) {
    return false
  }

  if (claims.exp !== undefined && !isNumber(claims.exp)) {
    return false
  }

  if (claims.iat !== undefined && !isNumber(claims.iat)) {
    return false
  }

  if (claims.roles !== undefined) {
    if (!Array.isArray(claims.roles)) {
      return false
    }

    if (!claims.roles.every(isUserRole)) {
      return false
    }
  }

  return true
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')

  return atob(padded)
}

export function parseJwtClaims(token: string): JwtClaims | null {
  try {
    const [, payload] = token.split('.')

    if (!payload) {
      return null
    }

    const decoded = decodeBase64Url(payload)
    const parsed: unknown = JSON.parse(decoded)

    return isJwtClaims(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function isTokenExpired(claims: JwtClaims): boolean {
  if (claims.exp === undefined) {
    return false
  }

  return claims.exp * 1000 <= Date.now()
}

export function mapClaimsToUser(claims: JwtClaims): AuthUser {
  return {
    id: claims.sub,
    roles: claims.roles ?? [],
    customerId: claims.customerId,
  }
}

export function clearSession(): AuthState {
  clearStoredToken()

  return {
    token: null,
    user: null,
  }
}

export function getInitialSession(): AuthState {
  const token = getStoredToken()

  if (!token) {
    return {
      token: null,
      user: null,
    }
  }

  const claims = parseJwtClaims(token)

  if (!claims || isTokenExpired(claims)) {
    return clearSession()
  }

  return {
    token,
    user: mapClaimsToUser(claims),
  }
}
