import { useCallback, useEffect, useState } from 'react'
import { getAlert } from '../lib/api'
import type { AsyncState, FraudAlertDto } from '../lib/types'

type UseAlertResult = {
  state: AsyncState<FraudAlertDto>
  reload: () => Promise<void>
}

export function useAlert(id: string): UseAlertResult {
  const [state, setState] = useState<AsyncState<FraudAlertDto>>(
    id ? { status: 'loading' } : { status: 'idle' },
  )

  const loadAlert = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!id) {
        setState({ status: 'idle' })
        return
      }

      setState({ status: 'loading' })

      try {
        const alert = await getAlert(id, signal)
        setState({ status: 'success', data: alert })
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to load alert',
        })
      }
    },
    [id],
  )

  useEffect(() => {
    const controller = new AbortController()
    void loadAlert(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadAlert])

  const reload = useCallback(async (): Promise<void> => {
    await loadAlert()
  }, [loadAlert])

  return { state, reload }
}
