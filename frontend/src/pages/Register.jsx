import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Register.css'

function Register() {
  const navigate = useNavigate()
  const { register, loginWithOAuth, error: authError } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters!')
      return
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters!')
      return
    }

    setLoading(true)

    const result = await register(
      formData.email,
      formData.password,
      formData.username
    )

    if (result.success) {
      setSuccess(result.message)
      setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)

    const result = await loginWithOAuth('google')

    if (!result.success) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">💬</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join talkgrid today</p>
        </div>

        {/* Social Signup */}
        <div className="auth-social">
          <button
            type="button"
            className="auth-social-btn google"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
            </svg>
            Sign up with Google
          </button>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="daniel_k"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {(error || authError) && <p className="auth-error">{error || authError}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Register