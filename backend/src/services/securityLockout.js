const { redis } = require('../redis/redis')

const MAX_ATTEMPTS = 5
const LOCK_SECONDS = 5 * 60
const ATTEMPT_WINDOW_SECONDS = 10 * 60 // keep attempt counters for 10 min

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function ipKey(ip) {
  return `sec:ip:${ip}`
}

function emailKey(email) {
  return `sec:email:${normalizeEmail(email)}`
}

function comboKey(email, ip) {
  return `sec:combo:${normalizeEmail(email)}:${ip}`
}

function lockKey(base) {
  return `${base}:lock`
}

function attemptsKey(base) {
  return `${base}:attempts`
}

async function getLockStatus(email, ip) {
  const eKey = emailKey(email)
  const iKey = ipKey(ip)
  const cKey = comboKey(email, ip)

  const [eTtl, iTtl, cTtl] = await Promise.all([
    redis.ttl(lockKey(eKey)),
    redis.ttl(lockKey(iKey)),
    redis.ttl(lockKey(cKey))
  ])

  const seconds = Math.max(eTtl, iTtl, cTtl)

  if (seconds > 0) {
    return {
      locked: true,
      secondsRemaining: seconds,
      lockedBy: {
        email: eTtl > 0,
        ip: iTtl > 0,
        combo: cTtl > 0
      }
    }
  }

  return { locked: false, secondsRemaining: 0, lockedBy: { email: false, ip: false, combo: false } }
}

async function clearAll(email, ip) {
  const eKey = emailKey(email)
  const iKey = ipKey(ip)
  const cKey = comboKey(email, ip)

  await redis.del(
    attemptsKey(eKey), lockKey(eKey),
    attemptsKey(iKey), lockKey(iKey),
    attemptsKey(cKey), lockKey(cKey)
  )
}

async function incrementAttemptsAndMaybeLock(email, ip) {
  const eKey = emailKey(email)
  const iKey = ipKey(ip)
  const cKey = comboKey(email, ip)

  const [eAttempts, iAttempts, cAttempts] = await Promise.all([
    redis.incr(attemptsKey(eKey)),
    redis.incr(attemptsKey(iKey)),
    redis.incr(attemptsKey(cKey))
  ])

  // Ensure counters expire (so attempts don't last forever)
  await Promise.all([
    redis.expire(attemptsKey(eKey), ATTEMPT_WINDOW_SECONDS),
    redis.expire(attemptsKey(iKey), ATTEMPT_WINDOW_SECONDS),
    redis.expire(attemptsKey(cKey), ATTEMPT_WINDOW_SECONDS)
  ])

  const shouldLock = (eAttempts >= MAX_ATTEMPTS) || (iAttempts >= MAX_ATTEMPTS) || (cAttempts >= MAX_ATTEMPTS)

  if (shouldLock) {
    // lock all three dimensions
    await Promise.all([
      redis.set(lockKey(eKey), '1', 'EX', LOCK_SECONDS),
      redis.set(lockKey(iKey), '1', 'EX', LOCK_SECONDS),
      redis.set(lockKey(cKey), '1', 'EX', LOCK_SECONDS)
    ])
  }

  return {
    eAttempts,
    iAttempts,
    cAttempts,
    lockedNow: shouldLock,
    maxAttempts: MAX_ATTEMPTS,
    lockSeconds: LOCK_SECONDS
  }
}

module.exports = {
  MAX_ATTEMPTS,
  LOCK_SECONDS,
  normalizeEmail,
  getLockStatus,
  clearAll,
  incrementAttemptsAndMaybeLock
}