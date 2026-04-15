import type { ReactNode } from 'react'
import type { FraudAlertDto, RuleResultDto } from '../../lib/types'
import { StatusBadge, SeverityBadge } from '../../components/Badge'
import { formatDateTime } from '../../lib/formatters'

type AlertDetailContentProps = Readonly<{
  alert: FraudAlertDto
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

export default function AlertDetailContent({ alert }: AlertDetailContentProps) {
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
    </div>
  )
}
