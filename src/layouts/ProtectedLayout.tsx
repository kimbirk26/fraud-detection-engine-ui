import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../config/routes'

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const next = `${location.pathname}${location.search}${location.hash}`

  if (!isAuthenticated) {
    return <Navigate to={`${ROUTES.LOGIN}?next=${encodeURIComponent(next)}`} replace />
  }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}
