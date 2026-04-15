import type {
  AlertStatus,
  AuthTokenResponseDto,
  FraudAlertDto,
  Severity,
  TransactionRequestDto,
} from './types'
import { getStoredToken } from '../auth/session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL')
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type QueryValue = string | number | boolean | undefined | null

type RequestOptions = {
  body?: unknown
  signal?: AbortSignal
  query?: Record<string, QueryValue>
}

type ApiErrorPayload = {
  message?: string
}

export type AlertFilters = {
  status?: AlertStatus
  severity?: Severity
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getAccessToken(): string | null {
  return getStoredToken()
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const url = new URL(normalizedPath, base)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

async function parseError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null

    return new ApiError(
      payload?.message ?? `${response.status} ${response.statusText}`,
      response.status,
    )
  }

  const text = await response.text().catch(() => '')
  return new ApiError(text || `${response.status} ${response.statusText}`, response.status)
}

async function request<TResponse>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const token = getAccessToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const timeoutSignal = AbortSignal.timeout(10_000)
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal,
    })
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Unable to reach the server. Make sure the backend is running.')
    }
    throw err
  }

  if (response.status === 204) {
    return null as TResponse
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json() as Promise<TResponse>
}

export function login(
  username: string,
  password: string,
  signal?: AbortSignal,
): Promise<AuthTokenResponseDto> {
  return request<AuthTokenResponseDto>('POST', '/auth/token', {
    body: { username, password },
    signal,
  })
}

export function getAlerts(
  filters: AlertFilters = {},
  signal?: AbortSignal,
): Promise<FraudAlertDto[]> {
  return request<FraudAlertDto[]>('GET', '/alerts', {
    query: {
      status: filters.status,
      severity: filters.severity,
    },
    signal,
  })
}

export function getAlertsByStatus(
  status: AlertStatus,
  signal?: AbortSignal,
): Promise<FraudAlertDto[]> {
  return getAlerts({ status }, signal)
}

export function getAlertsBySeverity(
  severity: Severity,
  signal?: AbortSignal,
): Promise<FraudAlertDto[]> {
  return getAlerts({ severity }, signal)
}

export function getAlert(id: string, signal?: AbortSignal): Promise<FraudAlertDto> {
  return request<FraudAlertDto>('GET', `/alerts/${encodeURIComponent(id)}`, {
    signal,
  })
}

export function getCustomerAlerts(
  customerId: string,
  signal?: AbortSignal,
): Promise<FraudAlertDto[]> {
  return request<FraudAlertDto[]>('GET', `/alerts/customer/${encodeURIComponent(customerId)}`, {
    signal,
  })
}

export function updateAlertStatus(
  id: string,
  status: AlertStatus,
  signal?: AbortSignal,
): Promise<FraudAlertDto> {
  return request<FraudAlertDto>('PATCH', `/alerts/${encodeURIComponent(id)}/status`, {
    body: { status },
    signal,
  })
}

// Returns null (204) when the transaction is clean,
// FraudAlertDto when fraud is detected.
export function submitTransaction(
  data: TransactionRequestDto,
  signal?: AbortSignal,
): Promise<FraudAlertDto | null> {
  return request<FraudAlertDto | null>('POST', '/transactions/sync', {
    body: data,
    signal,
  })
}
