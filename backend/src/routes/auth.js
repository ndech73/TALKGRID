const express = require('express')
const router = express.Router()
const AuthService = require('../services/authService')
const { verifyToken } = require('../middleware/auth')
const { requireRole } = require('../middleware/authorization')

/**
 * @route   POST /api/auth/register
 * @desc    Create user profile after Supabase registration
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { supabaseUser, username } = req.body

    if (!supabaseUser || !supabaseUser.id) {
      return res.status(400).json({
        success: false,
        message: 'Missing Supabase user data'
      })
    }

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters'
      })
    }

    const user = await AuthService.createUserProfile(supabaseUser, username)

    res.status(201).json({
      success: true,
      message: 'User profile created successfully',
      data: user
    })
  } catch (error) {
    console.error('Registration error:', error)

    // Check for duplicate username
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    })
  }
})

/**
 * @route   POST /api/auth/login
 * @desc    Create session after login
 * @access  Private (requires Supabase JWT)
 */
router.post('/login', verifyToken, async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.get('user-agent')

    // Check if user profile exists
    let user = await AuthService.getUserBySupabaseId(req.user.id)

    if (!user) {
      // Create profile if doesn't exist
      const supabaseUser = {
        id: req.user.id,
        email: req.user.email
      }
      user = await AuthService.createUserProfile(supabaseUser)
    }

    // Create session
    const session = await AuthService.createSession(user.id, ipAddress, userAgent)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        session: {
          id: session.id,
          refreshToken: session.refreshToken
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    })
  }
})

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke session (logout)
 * @access  Private
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      })
    }

    const user = await AuthService.getUserBySupabaseId(req.user.id)

    await AuthService.revokeSession(sessionId, user.id)

    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)

    res.status(500).json({
      success: false,
      message: 'Logout failed'
    })
  }
})

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await AuthService.getUserBySupabaseId(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching current user:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    })
  }
})

/**
 * @route   GET /api/auth/user/:id
 * @desc    Get public user profile
 * @access  Public
 */
router.get('/user/:id', async (req, res) => {
  try {
    const user = await AuthService.getUserById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    })
  }
})

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const user = await AuthService.getUserBySupabaseId(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const updatedUser = await AuthService.updateUserProfile(user.id, req.body)

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Error updating profile:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    })
  }
})

/**
 * @route   POST /api/auth/block/:userId
 * @desc    Block a user
 * @access  Private
 */
router.post('/block/:userId', verifyToken, async (req, res) => {
  try {
    const currentUser = await AuthService.getUserBySupabaseId(req.user.id)
    const blockedUser = await AuthService.getUserById(req.params.userId)

    if (!blockedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    await AuthService.blockUser(currentUser.id, blockedUser.id)

    res.json({
      success: true,
      message: 'User blocked successfully'
    })
  } catch (error) {
    console.error('Error blocking user:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to block user'
    })
  }
})

/**
 * @route   POST /api/auth/unblock/:userId
 * @desc    Unblock a user
 * @access  Private
 */
router.post('/unblock/:userId', verifyToken, async (req, res) => {
  try {
    const currentUser = await AuthService.getUserBySupabaseId(req.user.id)

    await AuthService.unblockUser(currentUser.id, req.params.userId)

    res.json({
      success: true,
      message: 'User unblocked successfully'
    })
  } catch (error) {
    console.error('Error unblocking user:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to unblock user'
    })
  }
})

/**
 * @route   GET /api/auth/audit-logs
 * @desc    Get audit logs (admin only)
 * @access  Private/Admin
 */
router.get('/audit-logs', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const logs = await AuthService.getAuditLogs(req.user.dbUser.id, 100)

    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    })
  }
})

module.exports = router