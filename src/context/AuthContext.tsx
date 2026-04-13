import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { login as apiLogin } from '../lib/api'
import type { JwtClaims } from '../lib/types'

interface AuthContextValue {
  token: string | null
  user: JwtClaims | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseJwt(token: string): JwtClaims {
  try {
    return JSON.parse(atob(token.split('.')[1])) as JwtClaims
  } catch {
    return { sub: '' }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('fde-token'),
  )
  const [user, setUser] = useState<JwtClaims | null>(() => {
    const saved = localStorage.getItem('fde-token')
    return saved ? parseJwt(saved) : null
  })

  const login = async (username: string, password: string): Promise<void> => {
    const data = await apiLogin(username, password)
    const claims = parseJwt(data.token)
    setToken(data.token)
    setUser(claims)
    localStorage.setItem('fde-token', data.token)
  }

  const logout = (): void => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('fde-token')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
