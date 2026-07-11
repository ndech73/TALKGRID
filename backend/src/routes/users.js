const express = require('express')
const router = express.Router()
const { prisma } = require('../services/database')
const { verifyToken } = require('../middleware/auth')

// GET /api/users/search?q=<query> - search users by username (excludes self)
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No query provided',
        data: [],
      })
    }

    const query = q.trim()

    const localUser = await prisma.user.findUnique({
      where: { supabaseId: req.user.id },
    })

    if (!localUser) {
      return res.status(404).json({ success: false, message: 'User profile not found' })
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
        NOT: { id: localUser.id },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        status: true,
      },
      take: 20,
      orderBy: { username: 'asc' },
    })

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    })
  } catch (error) {
    console.error('Error searching users:', error)
    return res.status(500).json({ success: false, message: 'Failed to search users' })
  }
})

// GET /api/users/profile/:username - profile lookup (for shareable links)
router.get('/profile/:username', verifyToken, async (req, res) => {
  try {
    const { username } = req.params

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        status: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: user,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' })
  }
})

module.exports = router