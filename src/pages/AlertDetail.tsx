import { Link, Navigate, useParams } from 'react-router-dom'
import { useAlert } from '../hooks/useAlert'
import AlertDetailContent from '../features/alerts/AlertDetailContent'
import { ROUTES } from '../config/routes'

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>()
  const { state, reload } = useAlert(id ?? '')

  if (!id) return <Navigate to={ROUTES.DASHBOARD} replace />

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link
            to={ROUTES.DASHBOARD}
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors uppercase tracking-[0.1em]"
          >
            ← Back to dashboard
          </Link>
        </div>

        {state.status === 'loading' && (
          <div className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-600">
            Loading…
          </div>
        )}

        {state.status === 'error' && <div className="py-8 text-sm text-red-500">{state.error}</div>}

        {state.status === 'success' && (
          <AlertDetailContent alert={state.data} onStatusChange={reload} />
        )}
      </div>
    </div>
  )
}
