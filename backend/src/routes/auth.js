const express = require('express')
const router = express.Router()
const AuthService = require('../services/authServices')
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

module.exports = router