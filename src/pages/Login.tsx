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
  const [showPassword, setShowPassword] = useState(false)

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
            <div className="relative">
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                className={INPUT_CLASS}
                placeholder="••••••••"
                value={form.password}
                onChange={handleFieldChange('password')}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? `${passwordId}-error` : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
                    <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 4.09 5.12L6.38 7.41a4 4 0 0 0 4.368 6.52Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
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
