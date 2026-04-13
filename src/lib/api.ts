import type {
  AuthTokenResponse,
  FraudAlert,
  TransactionPayload,
} from './types'

const BASE = 'http://localhost:8080/api/v1'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  return localStorage.getItem('fde-token')
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // 204 No Content — caller is responsible for typing T as nullable where relevant
  if (res.status === 204) return null as T

  if (!res.ok) {
    const payload = await res.json().catch(() => ({})) as { message?: string }
    throw new ApiError(
      payload.message ?? `${res.status} ${res.statusText}`,
      res.status,
    )
  }

  return res.json() as Promise<T>
}

export const login = (
  username: string,
  password: string,
): Promise<AuthTokenResponse> =>
  request<AuthTokenResponse>('POST', '/auth/token', { username, password })

export const getAlertsByStatus = (status: string): Promise<FraudAlert[]> =>
  request<FraudAlert[]>('GET', `/alerts?status=${status}`)

export const getAlertsBySeverity = (severity: string): Promise<FraudAlert[]> =>
  request<FraudAlert[]>('GET', `/alerts?severity=${severity}`)

export const getAlert = (id: string): Promise<FraudAlert> =>
  request<FraudAlert>('GET', `/alerts/${id}`)

export const getCustomerAlerts = (customerId: string): Promise<FraudAlert[]> =>
  request<FraudAlert[]>('GET', `/alerts/customer/${encodeURIComponent(customerId)}`)

// Returns null (204) when the transaction is clean, FraudAlert when fraud is detected
export const submitTransaction = (
  data: TransactionPayload,
): Promise<FraudAlert | null> =>
  request<FraudAlert | null>('POST', '/transactions/sync', data)
