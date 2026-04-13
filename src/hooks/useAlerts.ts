import { useState, useEffect, useCallback, useRef } from 'react'
import { getAlertsByStatus } from '../lib/api'
import type { AlertStatus, FraudAlert } from '../lib/types'

const STATUSES: AlertStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE']

type AlertCounts = Record<AlertStatus, number>

const EMPTY_COUNTS: AlertCounts = {
  OPEN: 0,
  UNDER_REVIEW: 0,
  RESOLVED: 0,
  FALSE_POSITIVE: 0,
}

interface UseAlertsResult {
  alerts: FraudAlert[]
  counts: AlertCounts
  loading: boolean
  error: string | null
  reload: (silent?: boolean) => Promise<void>
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [counts, setCounts] = useState<AlertCounts>(EMPTY_COUNTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reload = useCallback(async (silent = false): Promise<void> => {
    if (!silent) setLoading(true)
    setError(null)

    try {
      const settled = await Promise.allSettled(
        STATUSES.map((s) => getAlertsByStatus(s)),
      )

      if (settled.every((r) => r.status === 'rejected')) {
        const first = settled[0] as PromiseRejectedResult
        throw first.reason instanceof Error
          ? first.reason
          : new Error('Unable to reach the server')
      }

      const newCounts = { ...EMPTY_COUNTS }
      const combined: FraudAlert[] = []

      STATUSES.forEach((status, i) => {
        const result = settled[i]
        const batch =
          result.status === 'fulfilled' ? (result.value ?? []) : []
        newCounts[status] = batch.length
        combined.push(...batch)
      })

      setAlerts(combined)
      setCounts(newCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Poll every 10 s while there are open alerts
  useEffect(() => {
    if (counts.OPEN > 0) {
      pollRef.current = setInterval(() => void reload(true), 10_000)
    } else {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [counts.OPEN, reload])

  return { alerts, counts, loading, error, reload }
}
