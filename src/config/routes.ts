export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  SUBMIT: '/submit',
  TRANSACTION_STATUS: '/transactions/status',
  ALERT_DETAIL: (id: string) => `/alerts/${id}`,
  ALERT_DETAIL_PATTERN: '/alerts/:id',
} as const
