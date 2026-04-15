export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  SUBMIT: '/submit',
  ALERT_DETAIL: (id: string) => `/alerts/${id}`,
  ALERT_DETAIL_PATTERN: '/alerts/:id',
} as const
