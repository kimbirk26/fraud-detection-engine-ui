import { useState, useEffect } from 'react'
import { getAlert } from '../lib/api'
import type { FraudAlert } from '../lib/types'

interface UseAlertResult {
  alert: FraudAlert | null
  loading: boolean
  error: string | null
}

export function useAlert(id: string): UseAlertResult {
  const [alert, setAlert] = useState<FraudAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    getAlert(id)
      .then(setAlert)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load alert')
      })
      .finally(() => setLoading(false))
  }, [id])

  return { alert, loading, error }
}
