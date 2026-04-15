import { useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { submitTransaction } from '../lib/api'
import type { FraudAlertDto, TransactionCategory, TransactionRequestDto } from '../lib/types'
import { SeverityBadge } from '../components/Badge'
import { INPUT_CLASS, SELECT_CLASS } from '../lib/ui'
import { ROUTES } from '../config/routes'

const CATEGORIES = [
  'GROCERIES',
  'FUEL',
  'TRANSFER',
  'ENTERTAINMENT',
  'UTILITIES',
  'TRAVEL',
  'ONLINE_PURCHASE',
  'ATM_WITHDRAWAL',
  'UNKNOWN',
] as const satisfies readonly TransactionCategory[]

type FormState = {
  customerId: string
  amount: string
  merchantId: string
  merchantName: string
  category: TransactionCategory
  currency: string
  countryCode: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

type SubmissionResult =
  | { status: 'idle' }
  | { status: 'clean' }
  | { status: 'fraud'; alert: FraudAlertDto }

type FormFieldProps = Readonly<{
  id: keyof FormState
  label: string
  hint?: string
  error?: string
  children: ReactNode
}>

type FraudResultProps = Readonly<{
  alert: FraudAlertDto
}>

const INITIAL_FORM: FormState = {
  customerId: '',
  amount: '',
  merchantId: '',
  merchantName: '',
  category: 'GROCERIES',
  currency: 'ZAR',
  countryCode: 'ZA',
}

function FormField({ id, label, hint, error, children }: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-[0.1em] text-neutral-500"
      >
        {label}
        {hint && (
          <span className="ml-2 normal-case text-neutral-300 dark:text-neutral-700">{hint}</span>
        )}
      </label>

      {children}

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

function CleanResult() {
  return (
    <section className="border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800/40 dark:bg-emerald-950/30">
      <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">
        Result
      </p>
      <p className="text-lg font-light text-emerald-700 dark:text-emerald-300">No fraud detected</p>
      <p className="mt-1 text-sm text-emerald-600/70 dark:text-emerald-400/70">
        Transaction passed all rules cleanly.
      </p>
    </section>
  )
}

function FraudResult({ alert }: FraudResultProps) {
  const ruleCount = alert.triggeredRules.length

  return (
    <section className="space-y-4 border border-red-200 bg-red-50 p-6 dark:border-red-800/40 dark:bg-red-950/20">
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-red-500">
          Result — Fraud Detected
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge severity={alert.highestSeverity} />
          <span className="font-mono text-xs text-neutral-400">{alert.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-[0.1em] text-neutral-400">Customer</p>
          <p className="font-mono text-[12px] text-neutral-700 dark:text-neutral-300">
            {alert.customerId}
          </p>
        </div>

        <div>
          <p className="mb-0.5 text-[10px] uppercase tracking-[0.1em] text-neutral-400">Status</p>
          <p className="text-neutral-700 dark:text-neutral-300">{alert.status}</p>
        </div>
      </div>

      {ruleCount > 0 && (
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.1em] text-neutral-400">
            Triggered rules ({ruleCount})
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
    </section>
  )
}

function validateForm(values: FormState): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.customerId.trim()) {
    errors.customerId = 'Customer ID is required'
  }

  const amount = Number(values.amount)
  if (!values.amount || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number'
  }

  if (!values.merchantId.trim()) {
    errors.merchantId = 'Merchant ID is required'
  }

  if (!values.merchantName.trim()) {
    errors.merchantName = 'Merchant name is required'
  }

  if (values.currency.trim().length !== 3) {
    errors.currency = '3-character ISO code required'
  }

  if (values.countryCode.trim().length !== 2) {
    errors.countryCode = '2-character ISO code required'
  }

  return errors
}

function toRequestDto(form: FormState): TransactionRequestDto {
  return {
    customerId: form.customerId.trim(),
    amount: Number(form.amount),
    merchantId: form.merchantId.trim(),
    merchantName: form.merchantName.trim(),
    category: form.category,
    currency: form.currency.trim().toUpperCase(),
    countryCode: form.countryCode.trim().toUpperCase(),
  }
}

export default function Submit() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmissionResult>({ status: 'idle' })

  const handleFieldChange =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = event.target.value

      if (field === 'currency' || field === 'countryCode') {
        value = value.toUpperCase()
      }

      setForm((current) => ({
        ...current,
        [field]: value,
      }))

      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }))

      if (apiError) {
        setApiError(null)
      }
    }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm(form)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setApiError(null)
    setResult({ status: 'idle' })
    setLoading(true)

    try {
      const response = await submitTransaction(toRequestDto(form))

      setResult(response === null ? { status: 'clean' } : { status: 'fraud', alert: response })
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-6 pb-24 pt-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 border-b border-black/[0.07] pb-8 dark:border-white/[0.06]">
          <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-600">
            Test
          </p>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white">
            Submit Transaction
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Submit a transaction synchronously and see whether the engine flags it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="customerId" label="Customer ID" error={errors.customerId}>
              <input
                id="customerId"
                type="text"
                className={INPUT_CLASS}
                placeholder="cust_001"
                value={form.customerId}
                onChange={handleFieldChange('customerId')}
                aria-invalid={Boolean(errors.customerId)}
                aria-describedby={errors.customerId ? 'customerId-error' : undefined}
              />
            </FormField>

            <FormField id="amount" label="Amount" error={errors.amount}>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                className={INPUT_CLASS}
                placeholder="500.00"
                value={form.amount}
                onChange={handleFieldChange('amount')}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
            </FormField>

            <FormField id="merchantId" label="Merchant ID" error={errors.merchantId}>
              <input
                id="merchantId"
                type="text"
                className={INPUT_CLASS}
                placeholder="merch_xyz"
                value={form.merchantId}
                onChange={handleFieldChange('merchantId')}
                aria-invalid={Boolean(errors.merchantId)}
                aria-describedby={errors.merchantId ? 'merchantId-error' : undefined}
              />
            </FormField>

            <FormField id="merchantName" label="Merchant Name" error={errors.merchantName}>
              <input
                id="merchantName"
                type="text"
                className={INPUT_CLASS}
                placeholder="Pick n Pay"
                value={form.merchantName}
                onChange={handleFieldChange('merchantName')}
                aria-invalid={Boolean(errors.merchantName)}
                aria-describedby={errors.merchantName ? 'merchantName-error' : undefined}
              />
            </FormField>

            <FormField id="category" label="Category">
              <select
                id="category"
                className={SELECT_CLASS}
                value={form.category}
                onChange={handleFieldChange('category')}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="currency" label="Currency" hint="ISO 4217" error={errors.currency}>
              <input
                id="currency"
                type="text"
                maxLength={3}
                className={INPUT_CLASS}
                placeholder="ZAR"
                value={form.currency}
                onChange={handleFieldChange('currency')}
                aria-invalid={Boolean(errors.currency)}
                aria-describedby={errors.currency ? 'currency-error' : undefined}
              />
            </FormField>

            <FormField
              id="countryCode"
              label="Country Code"
              hint="ISO 3166-1 alpha-2"
              error={errors.countryCode}
            >
              <input
                id="countryCode"
                type="text"
                maxLength={2}
                className={INPUT_CLASS}
                placeholder="ZA"
                value={form.countryCode}
                onChange={handleFieldChange('countryCode')}
                aria-invalid={Boolean(errors.countryCode)}
                aria-describedby={errors.countryCode ? 'countryCode-error' : undefined}
              />
            </FormField>
          </div>

          {apiError && (
            <p
              role="alert"
              className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-800/40 dark:bg-red-950/30"
            >
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-c-accent py-3.5 text-sm font-semibold text-white transition-colors hover:bg-c-accent-h disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Analysing…' : 'Submit for analysis'}
          </button>
        </form>

        {result.status !== 'idle' && (
          <div className="mt-8">
            {result.status === 'clean' ? <CleanResult /> : <FraudResult alert={result.alert} />}
          </div>
        )}
      </div>
    </div>
  )
}
