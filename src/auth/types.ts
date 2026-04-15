import type { ReactNode } from 'react'
import type { UserRole } from '../lib/types'

export type AuthProviderProps = Readonly<{
  children: ReactNode
}>

export type AuthUser = Readonly<{
  id: string
  roles: readonly UserRole[]
  customerId?: string
}>

export type AuthState = Readonly<{
  token: string | null
  user: AuthUser | null
}>

export type AuthContextValue = Readonly<{
  isAuthenticated: boolean
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}>
