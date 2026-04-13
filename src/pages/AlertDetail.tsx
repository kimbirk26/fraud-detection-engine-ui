import { Link, useParams } from 'react-router-dom'
import { useAlert } from '../hooks/useAlert'
import type { AlertStatus, FraudAlert, RuleResult, Severity } from '../lib/types'

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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function Badge({ config }: { config: BadgeConfig }) {
  return (
    <span className={`inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.12em] mb-1">
        {label}
      </p>
      <div className="text-sm text-neutral-900 dark:text-neutral-100">{children}</div>
    </div>
  )
}

function RuleRow({ rule, index }: { rule: RuleResult; index: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_1fr] gap-2 sm:gap-4 px-6 py-4 items-start">
      <span className="text-sm text-neutral-800 dark:text-neutral-200 font-medium">
        {rule.ruleName}
      </span>
      <Badge config={SEVERITY_BADGE[rule.severity]} />
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {rule.reason}
      </span>
    </div>
  )
}

function AlertDetailContent({ alert }: { alert: FraudAlert }) {
  return (
    <div className="space-y-6">
      <div className="pb-8 border-b border-black/[0.07] dark:border-white/[0.06]">
        <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.15em] mb-1">
          Fraud Alert
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-xl font-light text-neutral-900 dark:text-white tracking-tight font-mono">
            {alert.id}
          </h1>
          <Badge config={STATUS_BADGE[alert.status]} />
          <Badge config={SEVERITY_BADGE[alert.highestSeverity]} />
        </div>
      </div>

      <div className="border border-black/[0.07] dark:border-white/[0.06] p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Alert ID">
          <span className="font-mono text-[12px] break-all">{alert.id}</span>
        </Field>
        <Field label="Transaction ID">
          <span className="font-mono text-[12px] break-all">{alert.transactionId}</span>
        </Field>
        <Field label="Customer ID">
          <span className="font-mono text-[12px]">{alert.customerId}</span>
        </Field>
        <Field label="Created">
          <span>{formatDateTime(alert.createdAt)}</span>
        </Field>
        <Field label="Highest Severity">
          <Badge config={SEVERITY_BADGE[alert.highestSeverity]} />
        </Field>
        <Field label="Status">
          <Badge config={STATUS_BADGE[alert.status]} />
        </Field>
      </div>

      <div className="border border-black/[0.07] dark:border-white/[0.06]">
        <div className="px-6 py-4 border-b border-black/[0.07] dark:border-white/[0.06]">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-[0.1em]">
            Triggered Rules
            <span className="ml-2 font-mono text-neutral-400">
              ({alert.triggeredRules.length})
            </span>
          </p>
        </div>

        {alert.triggeredRules.length === 0 ? (
          <div className="px-6 py-8 text-sm text-neutral-400 dark:text-neutral-600 text-center">
            No rules triggered.
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.04]">
            <div className="hidden sm:grid grid-cols-[1fr_100px_1fr] gap-4 px-6 py-3 text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.1em]">
              <span>Rule</span>
              <span>Severity</span>
              <span>Reason</span>
            </div>
            {alert.triggeredRules.map((rule, i) => (
              <RuleRow key={i} rule={rule} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>()
  const { alert, loading, error } = useAlert(id!)

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors uppercase tracking-[0.1em]"
          >
            ← Back to dashboard
          </Link>
        </div>

        {loading && (
          <div className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-600">
            Loading…
          </div>
        )}

        {error && !loading && (
          <div className="py-8 text-sm text-red-500">{error}</div>
        )}

        {!loading && alert && <AlertDetailContent alert={alert} />}
      </div>
    </div>
  )
}
