const crypto = require('crypto')

function getSecret() {
  const secret = process.env.SECURITY_TOKEN_SECRET
  if (!secret) throw new Error('Missing SECURITY_TOKEN_SECRET')
  return secret
}

// Simple HMAC token: base64url(payload).base64url(signature)
function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

function sign(payloadObj) {
  const payloadJson = JSON.stringify(payloadObj)
  const payload = base64url(payloadJson)

  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url')

  return `${payload}.${sig}`
}

function verify(token) {
  const [payload, sig] = String(token || '').split('.')
  if (!payload || !sig) return null

  const expectedSig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url')

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null
  }

  try {
    const json = Buffer.from(payload, 'base64url').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

module.exports = { sign, verify }