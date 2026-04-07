import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/Resetpassword.css'

function ResetPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Reset link sent! Please check your email.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">Enter your email to reset</p>
        </div>

        <form className="auth-form" onSubmit={handleReset}>
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
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : 'Send Reset Link'}
          </button>

          <button
            type="button"
            className="auth-btn-outline"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </form>

        <div className="auth-info">
          <p>We'll send a reset link to your email address</p>
        </div>

      </div>
    </div>
  )
}

export default ResetPassword