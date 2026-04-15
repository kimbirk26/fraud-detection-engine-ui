import type { AlertStatus, Severity } from '../lib/types'
import { STATUS_BADGES, SEVERITY_BADGES } from '../config/badgeConfig'

type StatusBadgeProps = Readonly<{
  status: AlertStatus
}>

type SeverityBadgeProps = Readonly<{
  severity: Severity
}>

type BadgeProps = Readonly<{
  label: string
  bg: string
  text: string
}>

const BADGE_BASE_CLASS =
  'inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider'

function Badge({ label, bg, text }: BadgeProps) {
  return <span className={`${BADGE_BASE_CLASS} ${bg} ${text}`}>{label}</span>
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, bg, text } = STATUS_BADGES[status]
  return <Badge label={label} bg={bg} text={text} />
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { label, bg, text } = SEVERITY_BADGES[severity]
  return <Badge label={label} bg={bg} text={text} />
}
