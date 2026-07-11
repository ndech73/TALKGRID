const express = require('express')
const router = express.Router()
const { prisma } = require('../services/database')
const { verifyToken } = require('../middleware/auth')

// GET /api/conversations - list all conversations for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const localUser = await prisma.user.findUnique({
      where: { supabaseId: req.user.id },
    })

    if (!localUser) {
      return res.status(404).json({ success: false, message: 'User profile not found' })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: localUser.id, leftAt: null },
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.userId !== localUser.id
      )?.user

      const lastMessage = conv.messages[0]

      return {
        id: conv.id,
        name:
          conv.type === 'group'
            ? conv.name
            : otherParticipant?.displayName || otherParticipant?.username,
        avatarUrl: conv.type === 'group' ? null : otherParticipant?.avatar || null,
        lastMessage: lastMessage?.content || '',
        timestamp: lastMessage?.createdAt || conv.createdAt,
        unreadCount: 0, // TODO: implement once read-receipts are tracked
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Conversations fetched successfully',
      data: formatted,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations' })
  }
})

// POST /api/conversations/start - find or create a direct conversation with another user
router.post('/start', verifyToken, async (req, res) => {
  try {
    const { username } = req.body

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, message: 'username is required' })
    }

    const localUser = await prisma.user.findUnique({
      where: { supabaseId: req.user.id },
    })

    if (!localUser) {
      return res.status(404).json({ success: false, message: 'User profile not found' })
    }

    const targetUser = await prisma.user.findUnique({
      where: { username },
    })

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (targetUser.id === localUser.id) {
      return res.status(400).json({ success: false, message: 'Cannot start a conversation with yourself' })
    }

    // Look for an existing direct conversation between exactly these two users
    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'direct',
        AND: [
          { participants: { some: { userId: localUser.id, leftAt: null } } },
          { participants: { some: { userId: targetUser.id, leftAt: null } } },
        ],
      },
    })

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        data: { id: existing.id, isNew: false },
      })
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: 'direct',
        createdBy: localUser.id,
        participants: {
          create: [
            { userId: localUser.id, role: 'member' },
            { userId: targetUser.id, role: 'member' },
          ],
        },
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Conversation created',
      data: { id: conversation.id, isNew: true },
    })
  } catch (error) {
    console.error('Error starting conversation:', error)
    return res.status(500).json({ success: false, message: 'Failed to start conversation' })
  }
})

module.exports = router