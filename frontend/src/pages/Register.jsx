import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/Register.css'

function Register() {
  const navigate = useNavigate()
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
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters!')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { username: formData.username }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Account created! Please check your email to verify.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-logo">💬</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join talkgrid today</p>
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

          {error && <p className="auth-error">{error}</p>}
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