const express = require('express')
const rateLimit = require('express-rate-limit')
const router = express.Router()

const { supabase } = require('../services/supabaseAdmin')
const { sendMail } = require('../services/mailer')
const { sign, verify } = require('../services/securityTokens')
const {
  getLockStatus,
  clearAll,
  incrementAttemptsAndMaybeLock,
  normalizeEmail,
  LOCK_SECONDS
} = require('../services/securityLockout')

function getClientIp(req) {
  // If behind proxy, set app.set('trust proxy', 1) in server.js
  // For now we keep it basic:
  return (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) || req.ip
}

// Rate limit: baseline protection against spamming this endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
})

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const ip = getClientIp(req)
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '')

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    // 1) Lock check
    const lock = await getLockStatus(email, ip)
    if (lock.locked) {
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${Math.ceil(lock.secondsRemaining / 60)} minute(s).`,
        data: lock
      })
    }

    // 2) Attempt login against Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data?.session) {
      // Wrong credentials (or other auth fail) -> count it
      const stats = await incrementAttemptsAndMaybeLock(email, ip)

      if (stats.lockedNow) {
        // Send email alert + verify link
        const apiBase = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`
        const token = sign({
          email,
          ip,
          // expire token slightly after lock window
          exp: Date.now() + (LOCK_SECONDS * 1000) + (60 * 1000)
        })
        const verifyUrl = `${apiBase}/api/security/unlock?token=${encodeURIComponent(token)}`

        // Fire-and-forget email (don’t block response if email fails)
        sendMail({
          to: email,
          subject: 'TalkGrid security alert: login attempts blocked',
          text:
`We detected multiple failed login attempts on your TalkGrid account.

For your security, we locked login for 5 minutes.

If this was you, you can unlock immediately using this link:
${verifyUrl}

If this wasn’t you, we recommend changing your password.`,
          html:
`<p>We detected multiple failed login attempts on your TalkGrid account.</p>
<p><b>For your security, we locked login for 5 minutes.</b></p>
<p>If this was you, you can unlock immediately:</p>
<p><a href="${verifyUrl}">Unlock my account</a></p>
<p>If this wasn’t you, we recommend changing your password.</p>`
        }).catch((e) => console.error('Email send failed:', e.message))

        return res.status(423).json({
          success: false,
          message: 'Too many failed attempts. Account and IP locked for 5 minutes. An email was sent.',
          data: {
            locked: true,
            secondsRemaining: LOCK_SECONDS,
            attempts: stats
          }
        })
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: {
          attempts: stats
        }
      })
    }

    // Success -> clear counters/locks
    await clearAll(email, ip)

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        session: data.session,
        user: data.user
      }
    })
  } catch (err) {
    console.error('Security login error:', err)
    return res.status(500).json({ success: false, message: 'Login failed', error: err.message })
  }
})

router.get('/unlock', async (req, res) => {
  try {
    const token = req.query?.token
    const payload = verify(token)

    if (!payload?.email || !payload?.ip || !payload?.exp) {
      return res.status(400).send('Invalid link')
    }

    if (Date.now() > payload.exp) {
      return res.status(400).send('This link has expired')
    }

    await clearAll(payload.email, payload.ip)

    // Redirect to frontend login page with a flag so it can show a friendly message.
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174'
    return res.redirect(302, `${clientUrl}/login?unlocked=1`)
  } catch (err) {
    console.error('Unlock error:', err)
    return res.status(500).send('Failed to unlock')
  }
})

module.exports = router