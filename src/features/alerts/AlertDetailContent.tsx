import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AlertStatus, FraudAlertDto, RuleResultDto } from '../../lib/types'
import { StatusBadge, SeverityBadge } from '../../components/Badge'
import { formatDateTime } from '../../lib/formatters'
import { updateAlertStatus } from '../../lib/api'
import { useAuth } from '../../context/useAuth'

type AlertDetailContentProps = Readonly<{
  alert: FraudAlertDto
  onStatusChange: () => void
}>

type DetailFieldProps = Readonly<{
  label: string
  children: ReactNode
}>

type RuleRowProps = Readonly<{
  rule: RuleResultDto
}>

type SectionCardProps = Readonly<{
  children: ReactNode
  className?: string
}>

type StatusActionsProps = Readonly<{
  alertId: string
  currentStatus: AlertStatus
  onSuccess: () => void
}>

const STATUS_LABEL: Record<AlertStatus, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  FALSE_POSITIVE: 'False Positive',
}

const NEXT_STATUSES: Record<AlertStatus, readonly AlertStatus[]> = {
  OPEN: ['UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE'],
  UNDER_REVIEW: ['RESOLVED', 'FALSE_POSITIVE'],
  RESOLVED: [],
  FALSE_POSITIVE: [],
}

function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <section className={`border border-black/[0.07] dark:border-white/[0.06] ${className}`}>
      {children}
    </section>
  )
}

function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-600">
        {label}
      </p>
      <div className="text-sm text-neutral-900 dark:text-neutral-100">{children}</div>
    </div>
  )
}

function RuleRow({ rule }: RuleRowProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 px-6 py-4 sm:grid-cols-[1fr_100px_1fr] sm:gap-4">
      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {rule.ruleName}
      </span>
      <SeverityBadge severity={rule.severity} />
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{rule.reason}</span>
    </div>
  )
}

function StatusActions({ alertId, currentStatus, onSuccess }: StatusActionsProps) {
  const { user } = useAuth()
  const [pending, setPending] = useState<AlertStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canWrite = user?.roles.includes('alerts:write') ?? false
  const nextStatuses = NEXT_STATUSES[currentStatus]

  if (!canWrite || nextStatuses.length === 0) return null

  async function handleUpdate(status: AlertStatus) {
    setPending(status)
    setError(null)
    try {
      await updateAlertStatus(alertId, status)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setPending(null)
    }
  }

  return (
    <SectionCard>
      <div className="border-b border-black/[0.07] px-6 py-4 dark:border-white/[0.06]">
        <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
          Change Status
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 py-5">
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            disabled={pending !== null}
            onClick={() => void handleUpdate(status)}
            className="border border-black/[0.1] px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-neutral-700 transition-colors hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.1] dark:text-neutral-300 dark:hover:bg-white/[0.05]"
          >
            {pending === status ? 'Saving…' : STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mx-6 mb-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-500 dark:border-red-800/40 dark:bg-red-950/30"
        >
          {error}
        </p>
      )}
    </SectionCard>
  )
}

export default function AlertDetailContent({ alert, onStatusChange }: AlertDetailContentProps) {
  const ruleCount = alert.triggeredRules.length

  return (
    <div className="space-y-6">
      <header className="border-b border-black/[0.07] pb-8 dark:border-white/[0.06]">
        <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-600">
          Alert Details
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-xl font-light tracking-tight text-neutral-900 dark:text-white">
              Fraud Alert
            </h1>
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{alert.id}</p>
          </div>

          <StatusBadge status={alert.status} />
          <SeverityBadge severity={alert.highestSeverity} />
        </div>
      </header>

      <SectionCard className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        <DetailField label="Alert ID">
          <span className="break-all font-mono text-[12px]">{alert.id}</span>
        </DetailField>

        <DetailField label="Transaction ID">
          <span className="break-all font-mono text-[12px]">{alert.transactionId}</span>
        </DetailField>

        <DetailField label="Customer ID">
          <span className="font-mono text-[12px]">{alert.customerId}</span>
        </DetailField>

        <DetailField label="Created">
          <span>{formatDateTime(alert.createdAt)}</span>
        </DetailField>

        <DetailField label="Highest Severity">
          <SeverityBadge severity={alert.highestSeverity} />
        </DetailField>

        <DetailField label="Status">
          <StatusBadge status={alert.status} />
        </DetailField>
      </SectionCard>

      <SectionCard>
        <div className="border-b border-black/[0.07] px-6 py-4 dark:border-white/[0.06]">
          <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
            Triggered Rules<span className="ml-2 font-mono text-neutral-400">({ruleCount})</span>
          </h2>
        </div>

        {ruleCount === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-neutral-400 dark:text-neutral-600">
            No rules triggered.
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.04]">
            <div className="hidden grid-cols-[1fr_100px_1fr] gap-4 px-6 py-3 text-[10px] uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-600 sm:grid">
              <span>Rule</span>
              <span>Severity</span>
              <span>Reason</span>
            </div>

            {alert.triggeredRules.map((rule) => (
              <RuleRow key={`${rule.ruleName}-${rule.reason}`} rule={rule} />
            ))}
          </div>
        )}
      </SectionCard>

      <StatusActions
        alertId={alert.id}
        currentStatus={alert.status}
        onSuccess={onStatusChange}
      />
    </div>
  )
}
