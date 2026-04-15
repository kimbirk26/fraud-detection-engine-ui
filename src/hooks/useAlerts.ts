import { useState, useEffect, useCallback, useRef } from 'react'
import { getAlertsByStatus } from '../lib/api'
import type { AlertCounts, AsyncState, FraudAlertDto } from '../lib/types'
import { ALERT_STATUSES, EMPTY_ALERT_COUNTS } from '../config/badgeConfig'

const POLL_INTERVAL_MS = 10_000

type AlertsData = { alerts: FraudAlertDto[]; counts: AlertCounts }

type UseAlertsResult = {
  state: AsyncState<AlertsData>
  reload: (silent?: boolean) => Promise<void>
}

export function useAlerts(): UseAlertsResult {
  const [state, setState] = useState<AsyncState<AlertsData>>({ status: 'loading' })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reload = useCallback(async (silent = false): Promise<void> => {
    if (!silent) setState({ status: 'loading' })

    try {
      const settled = await Promise.allSettled(ALERT_STATUSES.map((s) => getAlertsByStatus(s)))

      if (settled.every((r) => r.status === 'rejected')) {
        const first = settled[0] as PromiseRejectedResult
        throw first.reason instanceof Error ? first.reason : new Error('Unable to reach the server')
      }

      const newCounts = { ...EMPTY_ALERT_COUNTS }
      const combined: FraudAlertDto[] = []

      ALERT_STATUSES.forEach((status, i) => {
        const result = settled[i]
        const batch = result.status === 'fulfilled' ? (result.value ?? []) : []
        newCounts[status] = batch.length
        combined.push(...batch)
      })

      setState({ status: 'success', data: { alerts: combined, counts: newCounts } })
    } catch (err) {
      setState({
        status: 'error',
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      })
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Poll every 10 s while there are open alerts; re-evaluate when open count changes
  const openCount = state.status === 'success' ? state.data.counts.OPEN : 0

  useEffect(() => {
    if (openCount > 0) {
      pollRef.current = setInterval(() => void reload(true), POLL_INTERVAL_MS)
    } else {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [openCount, reload])

  return { state, reload }
}
