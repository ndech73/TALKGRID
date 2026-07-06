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
          <img src="/Gemini_Generated_Image_b2hq4ob2hq4ob2hq.png" alt="Triad Logo" className="intro-logo-img" />
        </div>

        <h1 className="intro-title">  Triad</h1>
        <p className="intro-tagline" id="tagline"></p>

        <p className="intro-new-user">New to Triad?</p>

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
          <div className="bubble bubble-left" id="b1">Hey! Welcome to triad</div>
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