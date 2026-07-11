import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../../../shared/services/api'
import '../styles/ProfilePage.css'

const ProfilePage = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      setLoading(true)
      setError('')
      const res = await apiClient.getPublicProfile(username)

      if (cancelled) return

      if (!res.success) {
        setError(res.message || 'User not found')
      } else {
        setProfile(res.data)
      }
      setLoading(false)
    }

    loadProfile()
    return () => { cancelled = true }
  }, [username])

  const handleMessage = async () => {
    setStarting(true)
    const res = await apiClient.startConversation(username)
    setStarting(false)

    if (res.success) {
      navigate('/home', { state: { openConversationId: res.data.id } })
    } else {
      setError(res.message || 'Could not start conversation')
    }
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/profile/${username}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="profile-page profile-page--state">Loading profile...</div>
  }

  if (error || !profile) {
    return (
      <div className="profile-page profile-page--state">
        <p>{error || 'User not found'}</p>
        <button onClick={() => navigate('/home')}>Back to chats</button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <button className="profile-page__back" onClick={() => navigate('/home')} aria-label="Back">
        ← Back
      </button>

      <div className="profile-page__avatar">
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.username} />
        ) : (
          <span>{(profile.displayName || profile.username)?.[0]?.toUpperCase()}</span>
        )}
      </div>

      <h1 className="profile-page__name">{profile.displayName || profile.username}</h1>
      <p className="profile-page__username">@{profile.username}</p>

      {profile.bio && <p className="profile-page__bio">{profile.bio}</p>}

      <span className={`profile-page__status profile-page__status--${profile.status}`}>
        {profile.status}
      </span>

      <div className="profile-page__actions">
        <button
          className="profile-page__message-btn"
          onClick={handleMessage}
          disabled={starting}
        >
          {starting ? 'Starting chat...' : 'Message'}
        </button>
        <button className="profile-page__copy-btn" onClick={handleCopyLink}>
          {copied ? 'Link copied!' : 'Share profile link'}
        </button>
      </div>
    </div>
  )
}

export default ProfilePage