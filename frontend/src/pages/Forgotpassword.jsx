import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/Forgotpassword.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)
    setError('')
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset link sent! Check your email for instructions.')
        setEmail('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
        </div>

        <form className="auth-form" onSubmit={handleForgotPassword}>
          <div className="auth-input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remember your password?{' '}
            <span onClick={() => navigate('/login')}>Back to Login</span>
          </p>
        </div>

      </div>
    </div>
  )
}

export default ForgotPassword