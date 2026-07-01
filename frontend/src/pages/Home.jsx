import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'

function Home() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1 className="logo">💬 Triad</h1>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">{user?.displayName?.charAt(0) || 'U'}</div>
              <div className="user-details">
                <p className="user-name">{user?.displayName || user?.username || 'User'}</p>
                <p className="user-status">{user?.status || 'online'}</p>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="welcome-section">
          <h2>Welcome, {user?.displayName || user?.username}!</h2>
          <p>You're successfully logged in to Triad</p>
          
          <div className="user-profile-card">
            <h3>Your Profile</h3>
            <div className="profile-info">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Status:</strong> {user?.status}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Member Since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="coming-soon">
            <h3>Coming Soon</h3>
            <p>✨ Real-time messaging</p>
            <p>✨ Group conversations</p>
            <p>✨ User profiles</p>
            <p>✨ And more!</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home