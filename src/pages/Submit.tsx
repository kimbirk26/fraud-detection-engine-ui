import { useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { submitTransaction } from '../lib/api'
import type { FraudAlert, Severity, TransactionCategory, TransactionPayload } from '../lib/types'

const CATEGORIES: TransactionCategory[] = [
  'GROCERIES', 'FUEL', 'TRANSFER', 'ENTERTAINMENT',
  'UTILITIES', 'TRAVEL', 'ONLINE_PURCHASE', 'ATM_WITHDRAWAL', 'UNKNOWN',
]

interface BadgeConfig {
  label: string
  bg: string
  text: string
}

const SEVERITY_BADGE: Record<Severity, BadgeConfig> = {
  HIGH:   { label: 'High',   bg: 'bg-red-100 dark:bg-red-900/30',        text: 'text-red-700 dark:text-red-400' },
  MEDIUM: { label: 'Medium', bg: 'bg-orange-100 dark:bg-orange-900/30',   text: 'text-orange-700 dark:text-orange-400' },
  LOW:    { label: 'Low',    bg: 'bg-amber-100 dark:bg-amber-900/30',     text: 'text-amber-700 dark:text-amber-400' },
  NONE:   { label: 'None',   bg: 'bg-neutral-100 dark:bg-neutral-800/60', text: 'text-neutral-400' },
}

interface FormState {
  customerId: string
  amount: string
  merchantId: string
  merchantName: string
  category: TransactionCategory
  currency: string
  countryCode: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  customerId: '',
  amount: '',
  merchantId: '',
  merchantName: '',
  category: 'GROCERIES',
  currency: 'ZAR',
  countryCode: 'ZA',
}

const INPUT_CLASS =
  'w-full bg-transparent border border-black/[0.1] dark:border-white/[0.08] text-neutral-900 dark:text-white text-sm px-4 py-3 placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors'

const SELECT_CLASS =
  'w-full bg-c-body dark:bg-neutral-900 border border-black/[0.1] dark:border-white/[0.08] text-neutral-900 dark:text-white text-sm px-4 py-3 focus:outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors appearance-none'

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 uppercase tracking-[0.1em] mb-2">
        {label}
        {hint && (
          <span className="ml-2 normal-case text-neutral-300 dark:text-neutral-700">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function CleanResult() {
  return (
    <div className="border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 p-6">
      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em] mb-1">
        Result
      </p>
      <p className="text-lg font-light text-emerald-700 dark:text-emerald-300">
        No fraud detected
      </p>
      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-1">
        Transaction passed all rules cleanly.
      </p>
    </div>
  )
}

function FraudResult({ alert }: { alert: FraudAlert }) {
  const badge = SEVERITY_BADGE[alert.highestSeverity]
  return (
    <div className="border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 p-6 space-y-4">
      <div>
        <p className="text-[10px] text-red-500 uppercase tracking-[0.15em] mb-1">
          Result — Fraud Detected
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${badge.bg} ${badge.text}`}>
            {badge.label} severity
          </span>
          <span className="text-xs text-neutral-400 font-mono">{alert.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.1em] mb-0.5">Customer</p>
          <p className="font-mono text-[12px] text-neutral-700 dark:text-neutral-300">
            {alert.customerId}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.1em] mb-0.5">Status</p>
          <p className="text-neutral-700 dark:text-neutral-300">{alert.status}</p>
        </div>
      </div>

      {alert.triggeredRules.length > 0 && (
        <div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.1em] mb-3">
            Triggered rules ({alert.triggeredRules.length})
          </p>
          <div className="space-y-3">
            {alert.triggeredRules.map((rule, i) => {
              const rb = SEVERITY_BADGE[rule.severity]
              return (
                <div
                  key={i}
                  className="border border-black/[0.07] dark:border-white/[0.06] p-4 bg-white/60 dark:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {rule.ruleName}
                    </span>
                    <span className={`inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 ${rb.bg} ${rb.text}`}>
                      {rb.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{rule.reason}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Link
        to={`/alerts/${alert.id}`}
        className="inline-block text-[11px] text-c-accent hover:text-c-accent-h transition-colors"
      >
        View full alert →
      </Link>
    </div>
  )
}

export default function Submit() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  // undefined = not yet submitted | null = clean (204) | FraudAlert = fraud detected
  const [result, setResult] = useState<FraudAlert | null | undefined>(undefined)

  const set =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {}
    if (!form.customerId.trim()) errs.customerId = 'Required'
    const amount = Number(form.amount)
    if (!form.amount || isNaN(amount) || amount <= 0)
      errs.amount = 'Must be a positive number'
    if (!form.merchantId.trim()) errs.merchantId = 'Required'
    if (!form.merchantName.trim()) errs.merchantName = 'Required'
    if (form.currency.trim().length !== 3)
      errs.currency = '3-character ISO code required'
    if (form.countryCode.trim().length !== 2)
      errs.countryCode = '2-character ISO code required'
    return errs
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setApiError(null)
    setResult(undefined)
    setLoading(true)

    try {
      const payload: TransactionPayload = {
        customerId:   form.customerId.trim(),
        amount:       Number(form.amount),
        merchantId:   form.merchantId.trim(),
        merchantName: form.merchantName.trim(),
        category:     form.category,
        currency:     form.currency.trim().toUpperCase(),
        countryCode:  form.countryCode.trim().toUpperCase(),
      }
      setResult(await submitTransaction(payload))
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="pb-8 border-b border-black/[0.07] dark:border-white/[0.06] mb-8">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.15em] mb-1">
            Test
          </p>
          <h1 className="text-2xl font-light text-neutral-900 dark:text-white tracking-tight">
            Submit Transaction
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Submit a transaction synchronously and see whether the engine flags it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Customer ID" error={errors.customerId}>
              <input type="text" className={INPUT_CLASS} placeholder="cust_001" value={form.customerId} onChange={set('customerId')} />
            </FormField>

            <FormField label="Amount" error={errors.amount}>
              <input type="number" step="0.01" min="0.01" className={INPUT_CLASS} placeholder="500.00" value={form.amount} onChange={set('amount')} />
            </FormField>

            <FormField label="Merchant ID" error={errors.merchantId}>
              <input type="text" className={INPUT_CLASS} placeholder="merch_xyz" value={form.merchantId} onChange={set('merchantId')} />
            </FormField>

            <FormField label="Merchant Name" error={errors.merchantName}>
              <input type="text" className={INPUT_CLASS} placeholder="Pick n Pay" value={form.merchantName} onChange={set('merchantName')} />
            </FormField>

            <FormField label="Category">
              <select className={SELECT_CLASS} value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Currency" hint="ISO 4217" error={errors.currency}>
              <input type="text" maxLength={3} className={INPUT_CLASS} placeholder="ZAR" value={form.currency} onChange={set('currency')} />
            </FormField>

            <FormField label="Country Code" hint="ISO 3166-1 alpha-2" error={errors.countryCode}>
              <input type="text" maxLength={2} className={INPUT_CLASS} placeholder="ZA" value={form.countryCode} onChange={set('countryCode')} />
            </FormField>
          </div>

          {apiError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 px-4 py-3">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-c-accent hover:bg-c-accent-h text-white text-sm font-semibold py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analysing…' : 'Submit for analysis'}
          </button>
        </form>

        {result !== undefined && (
          <div className="mt-8">
            {result === null ? <CleanResult /> : <FraudResult alert={result} />}
          </div>
        )}
      </div>
    </div>
  )
}
