import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './ProtectedRoute.css'

/**
 * Wraps routes that require authentication
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="auth-spinner"></div>
            <p style={{ color: '#a8b2d8', marginTop: '16px' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('Authenticated, showing protected content')
  return children
}

/**
 * Admin-only route
 */
export function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="auth-spinner"></div>
            <p style={{ color: '#a8b2d8', marginTop: '16px' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/home" replace />
  }

  return children
}

/**
 * Guest-only route (redirect if authenticated)
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="auth-spinner"></div>
            <p style={{ color: '#a8b2d8', marginTop: '16px' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/home-intro" replace />
  }

  return children
}