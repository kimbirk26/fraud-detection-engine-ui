import { Link } from 'react-router-dom'
import { ROUTES } from '../config/routes'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-600">
          Error
        </p>

        <h1 className="text-4xl font-light tracking-tight text-neutral-900 dark:text-white">404</h1>

        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          The page you&apos;re looking for does not exist.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to={ROUTES.DASHBOARD}
            className="bg-c-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-c-accent-h focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c-accent/30"
          >
            Go to dashboard
          </Link>

          <Link
            to={ROUTES.LOGIN}
            className="border border-black/[0.07] px-5 py-2.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c-accent/30 dark:border-white/[0.08] dark:hover:text-neutral-200"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  )
}
