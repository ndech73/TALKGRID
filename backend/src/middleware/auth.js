const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for backend
)

/**
 * Middleware to verify JWT token from Supabase
 * Extracts user info and attaches to req.user
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      })
    }

    const token = authHeader.substring(7)

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      })
    }

    // Attach user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      supabaseId: data.user.id
    }

    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ 
      success: false, 
      message: 'Token verification failed' 
    })
  }
}

/**
 * Optional middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data } = await supabase.auth.getUser(token)
      
      if (data.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email,
          supabaseId: data.user.id
        }
      }
    }

    next()
  } catch (error) {
    // Silently fail for optional auth
    next()
  }
}

module.exports = { verifyToken, optionalAuth }