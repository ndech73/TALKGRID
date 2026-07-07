const express = require('express')
const router = express.Router()
const AuthService = require('../services/authServices')
const { prisma } = require('../services/database')
const { verifyToken } = require('../middleware/auth')
const { requireRole } = require('../middleware/authorization')

/**
 * @route   POST /api/auth/check-username
 * @desc    Check if username is available (CASE-SENSITIVE)
 * @access  Public
 */
router.post('/check-username', async (req, res) => {
  try {
    let { username } = req.body

    // Normalize for validation only (DO NOT change case sensitivity)
    username = typeof username === 'string' ? username.trim() : ''

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters',
        data: {
          available: null,
          message: 'Username must be at least 3 characters'
        }
      })
    }

    // Check if username exists (EXACT CASE-SENSITIVE MATCH)
    const existingUser = await AuthService.getUserByUsername(username)

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken',
        data: {
          available: false,
          message: 'Username already taken'
        }
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Username is available',
      data: {
        available: true,
        message: '✓ Username available'
      }
    })
  } catch (error) {
    console.error('Username check error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to check username availability',
      error: error.message,
      data: {
        available: null,
        message: 'Failed to check username availability'
      }
    })
  }
})

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

    // Check if username is already taken (EXACT CASE-SENSITIVE MATCH)
    const existingUser = await AuthService.getUserByUsername(username)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
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
 * @desc    Sync user session with backend after Supabase login
 * @access  Protected
 */
router.post('/login', verifyToken, async (req, res) => {
  try {
    // req.user.id is the Supabase auth UID
    const supabaseId = req.user.id
    const email = req.user.email || ''

    // Find user by supabaseId first
    let user = await AuthService.getUserBySupabaseId(supabaseId)

    // If not found by supabaseId, try to find by email
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email }
      })
      
      // If found by email but supabaseId doesn't match, update it
      if (user) {
        user = await prisma.user.update({
          where: { email },
          data: { supabaseId }
        })
      }
    }

    // If still not found, create a new user
    if (!user) {
      const username = email ? email.split('@')[0] : `user_${supabaseId.substring(0, 8)}`
      user = await AuthService.createUserProfile(
        { id: supabaseId, email },
        username
      )
    }

    res.json({
      success: true,
      message: 'User synchronized',
      data: user
    })
  } catch (error) {
    console.error('Login sync error:', error)
    res.status(500).json({
      success: false,
      message: 'Login sync failed',
      error: error.message
    })
  }
})

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's profile
 * @access  Protected
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const supabaseId = req.user.id

    const user = await AuthService.getUserBySupabaseId(supabaseId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    })
  }
})

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear session data)
 * @access  Protected
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // For now, just return success
    // Actual session handling is done on frontend with Supabase
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    })
  }
})

/**
 * @route   GET /api/auth/user/:userId
 * @desc    Get user profile by ID
 * @access  Protected
 */
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params

    const user = await AuthService.getUserById(userId)

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
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    })
  }
})

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Protected
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const supabaseId = req.user.id
    const { displayName, avatar, bio } = req.body

    // Get database user ID from supabase ID
    const user = await AuthService.getUserBySupabaseId(supabaseId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const updatedUser = await AuthService.updateUserProfile(user.id, {
      displayName,
      avatar,
      bio
    })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    })
  }
})

/**
 * @route   POST /api/auth/block/:userId
 * @desc    Block a user
 * @access  Protected
 */
router.post('/block/:userId', verifyToken, async (req, res) => {
  try {
    const supabaseId = req.user.id
    const { userId } = req.params

    // Get current user's database ID
    const currentUser = await AuthService.getUserBySupabaseId(supabaseId)
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Prevent blocking self
    if (currentUser.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block yourself'
      })
    }

    // Block the user
    await AuthService.blockUser(currentUser.id, userId)

    res.json({
      success: true,
      message: 'User blocked successfully'
    })
  } catch (error) {
    console.error('Block user error:', error)
    
    // Handle unique constraint error if already blocked
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'User is already blocked'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error.message
    })
  }
})

/**
 * @route   POST /api/auth/unblock/:userId
 * @desc    Unblock a user
 * @access  Protected
 */
router.post('/unblock/:userId', verifyToken, async (req, res) => {
  try {
    const supabaseId = req.user.id
    const { userId } = req.params

    // Get current user's database ID
    const currentUser = await AuthService.getUserBySupabaseId(supabaseId)
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Unblock the user
    await AuthService.unblockUser(currentUser.id, userId)

    res.json({
      success: true,
      message: 'User unblocked successfully'
    })
  } catch (error) {
    console.error('Unblock user error:', error)
    
    // Handle not found error
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User block relationship not found'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: error.message
    })
  }
})

/**
 * @route   GET /api/auth/audit-logs
 * @desc    Get audit logs for current user
 * @access  Protected
 */
router.get('/audit-logs', verifyToken, async (req, res) => {
  try {
    const supabaseId = req.user.id

    // Get user's database ID
    const user = await AuthService.getUserBySupabaseId(supabaseId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const logs = await AuthService.getAuditLogs(user.id)

    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    })
  }
})

module.exports = router