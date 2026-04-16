import { useId, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ROUTES } from '../config/routes'
import ShieldIcon from '../components/ShieldIcon'
import { INPUT_CLASS } from '../lib/ui'

type FormState = {
  username: string
  password: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

type FormFieldProps = Readonly<{
  id: string
  label: string
  error?: string
  children: ReactNode
}>

function FormField({ id, label, error, children }: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-[0.1em] text-neutral-500"
      >
        {label}
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

function getSafeNextPath(rawNext: string | null): string {
  if (!rawNext) {
    return ROUTES.DASHBOARD
  }

  return rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : ROUTES.DASHBOARD
}

export default function Login() {
  const usernameId = useId()
  const passwordId = useId()

  const [form, setForm] = useState<FormState>({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const next = getSafeNextPath(searchParams.get('next'))

  const handleFieldChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

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

  function validate(values: FormState): FieldErrors {
    const nextErrors: FieldErrors = {}

    if (!values.username.trim()) {
      nextErrors.username = 'Username is required'
    }

    if (!values.password) {
      nextErrors.password = 'Password is required'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(form)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setApiError(null)
    setLoading(true)

    try {
      await login(form.username.trim(), form.password)
      navigate(next, { replace: true })
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 pt-16">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center border border-c-accent/70 text-c-accent">
            <ShieldIcon />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            FraudEngine
          </span>
        </div>

        <div className="mb-8 border-b border-black/[0.07] pb-3 dark:border-white/[0.06]">
          <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400">Access</p>
          <h1 className="text-xl font-light tracking-tight text-neutral-900 dark:text-white">
            Sign in
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField id={usernameId} label="Username" error={errors.username}>
            <input
              id={usernameId}
              type="text"
              className={INPUT_CLASS}
              placeholder="analyst"
              value={form.username}
              onChange={handleFieldChange('username')}
              autoFocus
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? `${usernameId}-error` : undefined}
            />
          </FormField>

          <FormField id={passwordId} label="Password" error={errors.password}>
            <input
              id={passwordId}
              type="password"
              className={INPUT_CLASS}
              placeholder="••••••••"
              value={form.password}
              onChange={handleFieldChange('password')}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `${passwordId}-error` : undefined}
            />
          </FormField>

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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
