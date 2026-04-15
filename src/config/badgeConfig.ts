import type { AlertCounts, AlertStatus, Severity } from '../lib/types'

export type BadgeConfig = Readonly<{
  label: string
  bg: string
  text: string
}>

export const EMPTY_ALERT_COUNTS: AlertCounts = {
  OPEN: 0,
  UNDER_REVIEW: 0,
  RESOLVED: 0,
  FALSE_POSITIVE: 0,
}

export const ALERT_STATUSES = [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED',
  'FALSE_POSITIVE',
] as const satisfies readonly AlertStatus[]

export const STATUS_BADGES = {
  OPEN: {
    label: 'Open',
    bg: 'bg-c-accent/10',
    text: 'text-c-accent',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  FALSE_POSITIVE: {
    label: 'False Positive',
    bg: 'bg-neutral-100 dark:bg-neutral-800/60',
    text: 'text-neutral-500 dark:text-neutral-400',
  },
} satisfies Record<AlertStatus, BadgeConfig>

export const SEVERITY_BADGES = {
  HIGH: {
    label: 'High',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
  },
  LOW: {
    label: 'Low',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
  NONE: {
    label: 'None',
    bg: 'bg-neutral-100 dark:bg-neutral-800/60',
    text: 'text-neutral-400',
  },
} satisfies Record<Severity, BadgeConfig>
