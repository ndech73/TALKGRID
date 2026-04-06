import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/Intro.css'

function Intro() {
  const navigate = useNavigate()

  useEffect(() => {
    const phrases = ['connect · chat', 'instant messaging', 'stay connected', 'your grid, your chat']
    let pi = 0, ci = 0, deleting = false
    const el = document.getElementById('tagline')

    function type() {
      const word = phrases[pi]
      if (!deleting) {
        el.textContent = word.slice(0, ++ci)
        if (ci === word.length) { deleting = true; setTimeout(type, 1800); return }
      } else {
        el.textContent = word.slice(0, --ci)
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); return }
      }
      setTimeout(type, deleting ? 60 : 100)
    }
    type()

    const bubbles = ['b1', 'b2', 'b3', 'b4']
    bubbles.forEach((id, i) => {
      setTimeout(() => {
        document.getElementById(id)?.classList.add('show')
      }, 600 + i * 500)
    })
  }, [])

  return (
    <div className="intro-container">

      {/* LEFT SIDE */}
      <div className="intro-left">
        <div className="intro-dots intro-dots-top" />

        <div className="intro-logo">
          <svg width="90" height="90" viewBox="0 0 120 120">
            <rect x="30" y="8" width="72" height="58" rx="16" fill="#1A1A2E" stroke="#2EC4B6" strokeWidth="2.5"/>
            <rect x="18" y="32" width="62" height="46" rx="12" fill="#2EC4B6"/>
            <line x1="30" y1="44" x2="68" y2="44" stroke="#1A1A2E" strokeWidth="2" opacity="0.4"/>
            <line x1="30" y1="56" x2="68" y2="56" stroke="#1A1A2E" strokeWidth="2" opacity="0.4"/>
            <line x1="30" y1="68" x2="68" y2="68" stroke="#1A1A2E" strokeWidth="2" opacity="0.4"/>
            <line x1="38" y1="34" x2="38" y2="76" stroke="#1A1A2E" strokeWidth="2" opacity="0.4"/>
            <line x1="52" y1="34" x2="52" y2="76" stroke="#1A1A2E" strokeWidth="2" opacity="0.4"/>
            <polygon points="26,76 14,94 40,76" fill="#2EC4B6"/>
            <circle cx="44" cy="26" r="4" fill="#2EC4B6"/>
            <circle cx="62" cy="18" r="4" fill="#2EC4B6"/>
            <circle cx="80" cy="26" r="4" fill="#2EC4B6"/>
            <line x1="44" y1="26" x2="62" y2="18" stroke="#2EC4B6" strokeWidth="1.5" opacity="0.7"/>
            <line x1="62" y1="18" x2="80" y2="26" stroke="#2EC4B6" strokeWidth="1.5" opacity="0.7"/>
          </svg>
        </div>

        <h1 className="intro-title">talkgrid</h1>
        <p className="intro-tagline" id="tagline"></p>

        <p className="intro-new-user">New to TalkGrid?</p>

        <button className="intro-btn" onClick={() => navigate('/register')}>
          Get Started
        </button>

        <p className="intro-login">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Login</span>
        </p>

        <div className="intro-dots intro-dots-bottom" />
      </div>

      {/* RIGHT SIDE */}
      <div className="intro-right">
        <div className="intro-grid" />

        <div className="intro-bubbles">
          <div className="bubble bubble-left" id="b1">Hey! Welcome to talkgrid</div>
          <div className="bubble bubble-right" id="b2">This looks amazing!</div>
          <div className="bubble bubble-left" id="b3">Chat with anyone, anywhere</div>
          <div className="bubble bubble-right" id="b4">Let's get started!</div>
        </div>

        <p className="intro-right-label">REAL-TIME MESSAGING</p>
      </div>

    </div>
  )
}

export default Intro