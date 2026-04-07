import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/Forgotpassword.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">
            {success ? 'Check your inbox' : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {success ? (
          <div className="auth-success-box">
            <p className="auth-success">
              ✅ Reset link sent! Please check your email for instructions to reset your password.
            </p>
            <button
              type="button"
              className="auth-btn"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : 'Send Reset Link'}
            </button>

            <p className="auth-back" onClick={() => navigate('/login')}>
              ← Back to Login
            </p>
          </form>
        )}

      </div>
    </div>
  )
}

export default ForgotPassword
