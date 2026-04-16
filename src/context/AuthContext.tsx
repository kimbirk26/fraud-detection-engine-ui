import { useCallback, useMemo, useState } from 'react'
import { login as apiLogin } from '../lib/api'
import {
  clearSession,
  getInitialSession,
  isTokenExpired,
  mapClaimsToUser,
  parseJwtClaims,
  setStoredToken,
} from '../auth/session'
import type { AuthContextValue, AuthProviderProps, AuthState } from '../auth/types'
import { AuthContext } from './auth'

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(getInitialSession)

  const logout = useCallback((): void => {
    setAuthState(clearSession())
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const response = await apiLogin(username, password)
    const claims = parseJwtClaims(response.token)

    if (!claims || isTokenExpired(claims)) {
      setAuthState(clearSession())
      throw new Error('Authentication token is invalid or expired')
    }

    const user = mapClaimsToUser(claims)

    setStoredToken(response.token)
    setAuthState({
      token: response.token,
      user,
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: authState.token !== null && authState.user !== null,
      user: authState.user,
      login,
      logout,
    }),
    [authState, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
