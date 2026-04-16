import { createContext } from 'react'

export type ThemeContextValue = {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
