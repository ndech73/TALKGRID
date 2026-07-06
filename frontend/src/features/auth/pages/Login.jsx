import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../shared/hooks/useAuth'
import '../styles/Login.css'

function EyeIcon({ off = false }) {
  return off ? (
    // eye-off
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.1 3.51 3.51 2.1l18.38 18.38-1.41 1.41-3.02-3.02A11.7 11.7 0 0 1 12 20C6 20 2.73 15.11 1 12c.64-1.16 1.62-2.6 3.02-3.98L2.1 3.51Zm6.02 6.02A3.5 3.5 0 0 0 12 15.5c.51 0 1-.11 1.44-.3l-1.06-1.06c-.12.02-.25.03-.38.03A2.5 2.5 0 0 1 9.5 12c0-.13.01-.26.03-.38L8.12 10.2ZM12 4c6 0 9.27 4.89 11 8-1.03 1.85-2.88 4.52-5.86 6.23l-1.46-1.46C17.97 15.5 19.48 13.57 20.8 12 19.3 9.36 16.5 6 12 6c-1.02 0-1.98.17-2.87.46L7.52 4.85A11.9 11.9 0 0 1 12 4Zm0 3.5A4.5 4.5 0 0 1 16.5 12c0 .56-.1 1.1-.28 1.6l-1.53-1.53c.2-.92-.07-1.92-.8-2.65a2.99 2.99 0 0 0-2.65-.8L9.7 7.1c.71-.38 1.52-.6 2.3-.6Z"
      />
    </svg>
  ) : (
    // eye
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5c6 0 10 5.5 11 7-1 1.5-5 7-11 7S2 13.5 1 12c1-1.5 5-7 11-7Zm0 2c-4.52 0-7.5 3.92-8.74 5 1.24 1.08 4.22 5 8.74 5s7.5-3.92 8.74-5C19.5 10.92 16.52 7 12 7Zm0 1.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5Z"
      />
    </svg>
  )
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithOAuth } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Show "unlocked" success message if redirected from backend unlock link
  const [unlockedNotice, setUnlockedNotice] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const unlocked = params.get('unlocked') === '1'
    setUnlockedNotice(unlocked)
  }, [location.search])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (!result.success) {
        throw new Error(result.error || 'Login failed')
      }

      // AuthContext will set the session; we can redirect immediately.
      setTimeout(() => navigate('/home-intro'), 300)
    } catch (err) {
      setError('❌ ' + (err.message || 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setError('')
      setLoading(true)

      const result = await loginWithOAuth('google')
      if (!result.success) {
        throw new Error(result.error || 'Google login failed')
      }
      // Supabase OAuth flow redirects; no navigate needed here.
    } catch (err) {
      setError('❌ Google login failed: ' + (err.message || 'Google login failed'))
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">💬</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to triad</p>
        </div>

        {unlockedNotice && (
          <p
            style={{
              padding: '10px',
              background: '#e6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px',
              marginBottom: '12px',
              color: '#135200'
            }}
          >
            ✅ Account unlocked. You can log in now.
          </p>
        )}

        {/* Social Login */}
        <div className="auth-social">
          <button
            type="button"
            className="auth-social-btn google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>

            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
          </div>

          <p
            className="auth-forgot"
            onClick={() => navigate('/forgot-password')}
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </p>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?{' '}
            <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Create one</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login