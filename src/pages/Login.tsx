import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface FormState {
  username: string
  password: string
}

interface FieldErrors extends Partial<Record<keyof FormState, string>> {}

const INPUT_CLASS =
  'w-full bg-transparent border border-black/[0.1] dark:border-white/[0.08] text-neutral-900 dark:text-white text-sm px-4 py-3 placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none focus:border-black/20 dark:focus:border-white/20 transition-colors'

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 uppercase tracking-[0.1em] mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function Login() {
  const [form, setForm] = useState<FormState>({ username: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const set =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {}
    if (!form.username.trim()) errs.username = 'Required'
    if (!form.password) errs.password = 'Required'
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
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate(next, { replace: true })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-6 h-6 border border-c-accent/70 flex items-center justify-center text-c-accent">
            <ShieldIcon />
          </div>
          <span className="text-neutral-900 dark:text-white font-semibold tracking-tight text-[15px]">
            FraudEngine
          </span>
        </div>

        <div className="pb-3 mb-8 border-b border-black/[0.07] dark:border-white/[0.06]">
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] mb-1">Access</p>
          <h1 className="text-xl font-light text-neutral-900 dark:text-white tracking-tight">
            Sign in
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormField label="Username" error={errors.username}>
            <input
              type="text"
              className={INPUT_CLASS}
              placeholder="analyst"
              value={form.username}
              onChange={set('username')}
              autoFocus
              autoComplete="username"
            />
          </FormField>

          <FormField label="Password" error={errors.password}>
            <input
              type="password"
              className={INPUT_CLASS}
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
          </FormField>

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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
