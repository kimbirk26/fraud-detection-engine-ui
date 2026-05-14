import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getTransactionStatus } from '../lib/api'
import type { TransactionStatusDto } from '../lib/types'
import { SeverityBadge } from '../components/Badge'
import { INPUT_CLASS } from '../lib/ui'
import { ROUTES } from '../config/routes'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TransactionStatusDto }
  | { status: 'error'; error: string }

function PendingResult() {
  return (
    <section className="border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700/40 dark:bg-neutral-900/30">
      <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
        Status
      </p>
      <p className="text-lg font-light text-neutral-700 dark:text-neutral-300">Pending</p>
      <p className="mt-1 text-sm text-neutral-500/70 dark:text-neutral-400/70">
        Transaction is still being processed.
      </p>
    </section>
  )
}

function CleanResult() {
  return (
    <section className="border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800/40 dark:bg-emerald-950/30">
      <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
        Status
      </p>
      <p className="text-lg font-light text-emerald-700 dark:text-emerald-300">No fraud detected</p>
      <p className="mt-1 text-sm text-emerald-600/70 dark:text-emerald-400/70">
        Transaction passed all rules cleanly.
      </p>
    </section>
  )
}

function FlaggedResult({ data }: { data: TransactionStatusDto }) {
  const alert = data.alert

  return (
    <section className="space-y-4 border border-red-200 bg-red-50 p-6 dark:border-red-800/40 dark:bg-red-950/20">
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-red-500">
          Status — Flagged
        </p>
        {alert && (
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={alert.highestSeverity} />
            <span className="font-mono text-xs text-neutral-400">{alert.id}</span>
          </div>
        )}
      </div>

      {alert && (
        <>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-[0.1em] text-neutral-400">
                Customer
              </p>
              <p className="font-mono text-[12px] text-neutral-700 dark:text-neutral-300">
                {alert.customerId}
              </p>
            </div>

            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-[0.1em] text-neutral-400">
                Status
              </p>
              <p className="text-neutral-700 dark:text-neutral-300">{alert.status}</p>
            </div>
          </div>

          {alert.triggeredRules.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.1em] text-neutral-400">
                Triggered rules ({alert.triggeredRules.length})
              </p>

              <div className="space-y-3">
                {alert.triggeredRules.map((rule) => (
                  <div
                    key={`${rule.ruleName}-${rule.reason}`}
                    className="border border-black/[0.07] bg-white/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    <div className="mb-1.5 flex items-center gap-3">
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {rule.ruleName}
                      </span>
                      <SeverityBadge severity={rule.severity} />
                    </div>

                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{rule.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            to={ROUTES.ALERT_DETAIL(alert.id)}
            className="inline-block text-[11px] text-c-accent transition-colors hover:text-c-accent-h focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-c-accent/30"
          >
            View full alert →
          </Link>
        </>
      )}
    </section>
  )
}

export default function TransactionStatus() {
  const [searchParams] = useSearchParams()
  const [transactionId, setTransactionId] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [lookup, setLookup] = useState<LookupState>({ status: 'idle' })

  async function performLookup(id: string) {
    setValidationError(null)
    setLookup({ status: 'loading' })

    try {
      const data = await getTransactionStatus(id)
      setLookup({ status: 'success', data })
    } catch (error: unknown) {
      setLookup({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to look up transaction status',
      })
    }
  }

  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam && UUID_RE.test(idParam)) {
      setTransactionId(idParam)
      performLookup(idParam)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = transactionId.trim()

    if (!trimmed) {
      setValidationError('Transaction ID is required')
      return
    }

    if (!UUID_RE.test(trimmed)) {
      setValidationError('Must be a valid UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)')
      return
    }

    performLookup(trimmed)
  }

  return (
    <div className="min-h-screen px-6 pb-24 pt-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 border-b border-black/[0.07] pb-8 dark:border-white/[0.06]">
          <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-600">
            Lookup
          </p>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white">
            Transaction Status
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Check the processing status of an async transaction submission.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="transactionId"
              className="mb-2 block text-xs uppercase tracking-[0.1em] text-neutral-500"
            >
              Transaction ID
            </label>
            <input
              id="transactionId"
              type="text"
              className={INPUT_CLASS}
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              value={transactionId}
              onChange={(e) => {
                setTransactionId(e.target.value)
                if (validationError) setValidationError(null)
              }}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'transactionId-error' : undefined}
            />
            {validationError && (
              <p id="transactionId-error" className="mt-1.5 text-xs text-red-500">
                {validationError}
              </p>
            )}
          </div>

          {lookup.status === 'error' && (
            <p
              role="alert"
              className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-800/40 dark:bg-red-950/30"
            >
              {lookup.error}
            </p>
          )}

          <button
            type="submit"
            disabled={lookup.status === 'loading'}
            className="w-full bg-c-accent py-3.5 text-sm font-semibold text-white transition-colors hover:bg-c-accent-h disabled:cursor-not-allowed disabled:opacity-50"
          >
            {lookup.status === 'loading' ? 'Looking up…' : 'Look up'}
          </button>
        </form>

        {lookup.status === 'success' && (
          <div className="mt-8">
            {lookup.data.status === 'PENDING' && <PendingResult />}
            {lookup.data.status === 'CLEAN' && <CleanResult />}
            {lookup.data.status === 'FLAGGED' && <FlaggedResult data={lookup.data} />}
          </div>
        )}
      </div>
    </div>
  )
}
