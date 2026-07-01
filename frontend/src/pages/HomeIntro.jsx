// frontend/src/pages/HomeIntro.jsx

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import '../styles/HomeIntro.css'

function HomeIntro() {
  const navigate = useNavigate()
  const { loading, isAuthenticated } = useAuth()
  const [visibleCount, setVisibleCount] = useState(0)
  const [tagline, setTagline] = useState('')

  // Typewriter effect for Triad-themed phrases
  useEffect(() => {
    if (loading || !isAuthenticated) return

    const phrases = [
      'Chat. Connect. Thrive.',
      'Your circle, in real time.',
      'Fast. Private. Simple.',
      'Together, wherever you are.'
    ]

    let pi = 0, ci = 0, deleting = false
    let timerId

    function type() {
      const word = phrases[pi]

      if (!deleting) {
        setTagline(word.slice(0, ++ci))
        if (ci === word.length) {
          deleting = true
          timerId = setTimeout(type, 1800)
          return
        }
      } else {
        setTagline(word.slice(0, --ci))
        if (ci === 0) {
          deleting = false
          pi = (pi + 1) % phrases.length
          timerId = setTimeout(type, 400)
          return
        }
      }
      timerId = setTimeout(type, deleting ? 60 : 85)
    }

    type()

    return () => {
      clearTimeout(timerId)
    }
  }, [loading, isAuthenticated])

  // Redirect if not authenticated (tokens expired or not logged in)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login')
    }
  }, [loading, isAuthenticated, navigate])

  // Initialize bubbles animation
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const timers = [1, 2, 3, 4].map((num, i) => {
        return setTimeout(() => {
          setVisibleCount(num)
        }, 600 + i * 500)
      })
      return () => {
        timers.forEach(clearTimeout)
      }
    }
  }, [loading, isAuthenticated])

  // Auto-redirect to home after 6 seconds
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectTimer = setTimeout(() => {
        navigate('/home')
      }, 6000)

      return () => {
        clearTimeout(redirectTimer)
      }
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return (
      <div className="homeintro-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="homeintro-container">

      {/* LEFT SIDE - LOGO & COUNTDOWN */}
      <div className="homeintro-left">
        <div className="intro-dots intro-dots-top" />

        <div className="intro-logo">
          <img src="/Gemini_Generated_Image_b2hq4ob2hq4ob2hq.png" alt="Triad Logo" className="intro-logo-img" />
        </div>

        <p className="intro-tagline">{tagline}</p>

        <div className="intro-dots intro-dots-bottom" />
      </div>

      {/* RIGHT SIDE - BUBBLES */}
      <div className="homeintro-right">
        <div className="intro-grid" />

        <div className="intro-bubbles">
          <div className={`bubble bubble-left ${visibleCount >= 1 ? 'show' : ''}`} id="b1">Hey! Welcome to Triad</div>
          <div className={`bubble bubble-right ${visibleCount >= 2 ? 'show' : ''}`} id="b2">This looks amazing!</div>
          <div className={`bubble bubble-left ${visibleCount >= 3 ? 'show' : ''}`} id="b3">Chat with anyone, anywhere</div>
          <div className={`bubble bubble-right ${visibleCount >= 4 ? 'show' : ''}`} id="b4">Let's get started!</div>
        </div>

        <p className="intro-right-label">REAL-TIME MESSAGING</p>
      </div>

    </div>
  )
}

export default HomeIntro