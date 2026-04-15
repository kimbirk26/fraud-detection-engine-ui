import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAlerts } from '../hooks/useAlerts'
import type { AlertStatus, FraudAlertDto } from '../lib/types'
import { SeverityBadge } from '../components/Badge'
import { ALERT_STATUSES, EMPTY_ALERT_COUNTS, STATUS_BADGES } from '../config/badgeConfig'
import { formatDate } from '../lib/formatters'
import { ROUTES } from '../config/routes'

function AlertRow({ alert }: { alert: FraudAlertDto }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_100px_100px_100px_60px] gap-2 sm:gap-4 px-6 py-4 items-center">
      <span
        className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 truncate"
        title={alert.id}
      >
        {alert.id}
      </span>
      <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 truncate">
        {alert.customerId}
      </span>
      <SeverityBadge severity={alert.highestSeverity} />
      <span className="text-[11px] text-neutral-400 dark:text-neutral-600 font-mono">
        {alert.triggeredRules.length} rule{alert.triggeredRules.length !== 1 ? 's' : ''}
      </span>
      <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
        {formatDate(alert.createdAt)}
      </span>
      <Link
        to={ROUTES.ALERT_DETAIL(alert.id)}
        className="text-[11px] text-c-accent hover:text-c-accent-h transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
      >
        View →
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { logout } = useAuth()
  const { state, reload } = useAlerts()
  const [activeTab, setActiveTab] = useState<AlertStatus>('OPEN')
  const [refreshing, setRefreshing] = useState(false)

  const alerts = state.status === 'success' ? state.data.alerts : []
  const counts = state.status === 'success' ? state.data.counts : EMPTY_ALERT_COUNTS
  const visibleAlerts = alerts.filter((a) => a.status === activeTab)
  const highSeverityCount = alerts.filter((a) => a.highestSeverity === 'HIGH').length

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await reload()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-black/[0.07] dark:border-white/[0.06] mb-8">
          <div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.15em] mb-1">
              Dashboard
            </p>
            <h1 className="text-2xl font-light text-neutral-900 dark:text-white tracking-tight">
              Fraud Alerts
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.SUBMIT}
              className="flex items-center gap-2 bg-c-accent hover:bg-c-accent-h text-white text-sm font-medium px-5 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
            >
              + Submit Transaction
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors px-3 py-2.5 border border-black/[0.07] dark:border-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total alerts', value: alerts.length },
            { label: 'Open', value: counts.OPEN },
            { label: 'Under review', value: counts.UNDER_REVIEW },
            { label: 'High severity', value: highSeverityCount },
          ].map(({ label, value }) => (
            <div key={label} className="border border-black/[0.07] dark:border-white/[0.06] p-5">
              <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.12em] mb-2">
                {label}
              </p>
              <p className="text-2xl font-light text-neutral-900 dark:text-white font-mono">
                {state.status !== 'success' ? '—' : value}
              </p>
            </div>
          ))}
        </div>

        {/* Alert list */}
        <div className="border border-black/[0.07] dark:border-white/[0.06]">
          {/* Status tabs */}
          <div className="px-6 border-b border-black/[0.07] dark:border-white/[0.06] flex items-center justify-between">
            <div className="flex">
              {ALERT_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveTab(status)}
                  className={`py-4 px-1 mr-6 text-xs font-medium uppercase tracking-[0.1em] border-b-2 -mb-px transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent ${
                    activeTab === status
                      ? 'border-c-accent text-neutral-900 dark:text-white'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  {STATUS_BADGES[status].label}
                  {state.status === 'success' && counts[status] > 0 && (
                    <span className="ml-1.5 font-mono text-[10px]">({counts[status]})</span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
            >
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>

          {state.status === 'loading' && (
            <div
              role="status"
              className="px-6 py-12 text-center text-sm text-neutral-400 dark:text-neutral-600"
            >
              Loading…
            </div>
          )}

          {state.status === 'error' && (
            <div role="alert" className="px-6 py-8 text-sm text-red-500">
              {state.error} —{' '}
              <button
                type="button"
                onClick={() => void reload()}
                className="underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-c-accent"
              >
                Retry
              </button>
            </div>
          )}

          {state.status === 'success' && visibleAlerts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-neutral-400 dark:text-neutral-600">
                No {STATUS_BADGES[activeTab].label.toLowerCase()} alerts.
              </p>
            </div>
          )}

          {state.status === 'success' && visibleAlerts.length > 0 && (
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.04]">
              <div className="hidden sm:grid grid-cols-[1fr_160px_100px_100px_100px_60px] gap-4 px-6 py-3 text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.1em]">
                <span>Alert ID</span>
                <span>Customer</span>
                <span>Severity</span>
                <span>Rules</span>
                <span>Date</span>
                <span />
              </div>
              {visibleAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
