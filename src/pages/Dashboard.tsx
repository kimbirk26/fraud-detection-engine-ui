import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAlerts } from '../hooks/useAlerts'
import type { AlertStatus, FraudAlert, Severity } from '../lib/types'

const STATUSES: AlertStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE']

interface BadgeConfig {
  label: string
  bg: string
  text: string
}

const STATUS_BADGE: Record<AlertStatus, BadgeConfig> = {
  OPEN:           { label: 'Open',           bg: 'bg-c-accent/10',                        text: 'text-c-accent' },
  UNDER_REVIEW:   { label: 'Under Review',   bg: 'bg-amber-100 dark:bg-amber-900/30',      text: 'text-amber-700 dark:text-amber-400' },
  RESOLVED:       { label: 'Resolved',       bg: 'bg-emerald-100 dark:bg-emerald-900/30',  text: 'text-emerald-700 dark:text-emerald-400' },
  FALSE_POSITIVE: { label: 'False Positive', bg: 'bg-neutral-100 dark:bg-neutral-800/60',  text: 'text-neutral-500 dark:text-neutral-400' },
}

const SEVERITY_BADGE: Record<Severity, BadgeConfig> = {
  HIGH:   { label: 'High',   bg: 'bg-red-100 dark:bg-red-900/30',        text: 'text-red-700 dark:text-red-400' },
  MEDIUM: { label: 'Medium', bg: 'bg-orange-100 dark:bg-orange-900/30',   text: 'text-orange-700 dark:text-orange-400' },
  LOW:    { label: 'Low',    bg: 'bg-amber-100 dark:bg-amber-900/30',     text: 'text-amber-700 dark:text-amber-400' },
  NONE:   { label: 'None',   bg: 'bg-neutral-100 dark:bg-neutral-800/60', text: 'text-neutral-400' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Badge({ config }: { config: BadgeConfig }) {
  return (
    <span className={`inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

function AlertRow({ alert }: { alert: FraudAlert }) {
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
      <Badge config={SEVERITY_BADGE[alert.highestSeverity]} />
      <span className="text-[11px] text-neutral-400 dark:text-neutral-600 font-mono">
        {alert.triggeredRules.length} rule{alert.triggeredRules.length !== 1 ? 's' : ''}
      </span>
      <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
        {formatDate(alert.createdAt)}
      </span>
      <Link
        to={`/alerts/${alert.id}`}
        className="text-[11px] text-c-accent hover:text-c-accent-h transition-colors"
      >
        View →
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { logout } = useAuth()
  const { alerts, counts, loading, error, reload } = useAlerts()
  const [activeTab, setActiveTab] = useState<AlertStatus>('OPEN')
  const [refreshing, setRefreshing] = useState(false)

  const visibleAlerts = alerts.filter((a) => a.status === activeTab)
  const highSeverityCount = alerts.filter((a) => a.highestSeverity === 'HIGH').length

  const handleRefresh = async () => {
    setRefreshing(true)
    await reload()
    setRefreshing(false)
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
              to="/submit"
              className="flex items-center gap-2 bg-c-accent hover:bg-c-accent-h text-white text-sm font-medium px-5 py-2.5 transition-colors"
            >
              + Submit Transaction
            </Link>
            <button
              onClick={logout}
              className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors px-3 py-2.5 border border-black/[0.07] dark:border-white/[0.08]"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total alerts',  value: alerts.length },
            { label: 'Open',          value: counts.OPEN },
            { label: 'Under review',  value: counts.UNDER_REVIEW },
            { label: 'High severity', value: highSeverityCount },
          ].map(({ label, value }) => (
            <div key={label} className="border border-black/[0.07] dark:border-white/[0.06] p-5">
              <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.12em] mb-2">
                {label}
              </p>
              <p className="text-2xl font-light text-neutral-900 dark:text-white font-mono">
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>

        {/* Alert list */}
        <div className="border border-black/[0.07] dark:border-white/[0.06]">
          {/* Status tabs */}
          <div className="px-6 border-b border-black/[0.07] dark:border-white/[0.06] flex items-center justify-between">
            <div className="flex">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`py-4 px-1 mr-6 text-xs font-medium uppercase tracking-[0.1em] border-b-2 -mb-px transition-colors ${
                    activeTab === status
                      ? 'border-c-accent text-neutral-900 dark:text-white'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  {STATUS_BADGE[status].label}
                  {!loading && counts[status] > 0 && (
                    <span className="ml-1.5 font-mono text-[10px]">
                      ({counts[status]})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors disabled:opacity-40"
            >
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>

          {loading && (
            <div className="px-6 py-12 text-center text-sm text-neutral-400 dark:text-neutral-600">
              Loading…
            </div>
          )}

          {error && !loading && (
            <div className="px-6 py-8 text-sm text-red-500">
              {error} —{' '}
              <button onClick={() => void reload()} className="underline">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && visibleAlerts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-neutral-400 dark:text-neutral-600">
                No {STATUS_BADGE[activeTab].label.toLowerCase()} alerts.
              </p>
            </div>
          )}

          {!loading && visibleAlerts.length > 0 && (
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
