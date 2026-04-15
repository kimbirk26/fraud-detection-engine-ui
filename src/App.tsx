import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedLayout from './layouts/ProtectedLayout'
import PublicLayout from './layouts/PublicLayout'
import Dashboard from './pages/Dashboard'
import AlertDetail from './pages/AlertDetail'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Submit from './pages/Submit'
import RedirectIfAuthenticated from './routing/RedirectIfAuthenticated'
import ScrollToTop from './routing/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import { ROUTES } from './config/routes'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />

            <Routes>
              <Route element={<ProtectedLayout />}>
                <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.ALERT_DETAIL_PATTERN} element={<AlertDetail />} />
                <Route path={ROUTES.SUBMIT} element={<Submit />} />
              </Route>

              <Route element={<PublicLayout />}>
                <Route
                  path={ROUTES.LOGIN}
                  element={
                    <RedirectIfAuthenticated>
                      <Login />
                    </RedirectIfAuthenticated>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
