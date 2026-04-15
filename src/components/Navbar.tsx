import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../config/routes'
import ShieldIcon from './ShieldIcon'

interface NavLinkDef {
  label: string
  to: string
}

const SCROLL_THRESHOLD = 24

const NAV_LINKS: NavLinkDef[] = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD },
  { label: 'Submit Transaction', to: ROUTES.SUBMIT },
]

function NavLogo() {
  return (
    <Link
      to={ROUTES.DASHBOARD}
      className="flex items-center gap-2.5 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
    >
      <div className="w-6 h-6 border border-c-accent/70 flex items-center justify-center group-hover:border-c-accent-h transition-colors text-c-accent group-hover:text-c-accent-h">
        <ShieldIcon />
      </div>
      <span className="text-neutral-900 dark:text-white font-semibold tracking-tight text-[15px]">
        FraudEngine
      </span>
    </Link>
  )
}

function NavLinks() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <>
      {NAV_LINKS.map(({ label, to }) => (
        <Link
          key={to}
          to={to}
          aria-current={location.pathname === to ? 'page' : undefined}
          className={`text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent ${
            location.pathname === to
              ? 'text-neutral-900 dark:text-white'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          {label}
        </Link>
      ))}
    </>
  )
}

function UserMenu() {
  const { isAuthenticated, user, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <Link
        to={ROUTES.LOGIN}
        className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
      >
        Sign in
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {user?.id && (
        <span className="text-xs text-neutral-400 dark:text-neutral-600 max-w-[120px] truncate font-mono">
          {user.id}
        </span>
      )}
      <button
        onClick={logout}
        className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
      >
        Sign out
      </button>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-c-body/90 backdrop-blur-md border-b border-black/[0.07] dark:border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <NavLogo />
        <div className="flex items-center gap-6">
          <NavLinks />
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}
