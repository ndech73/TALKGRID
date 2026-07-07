const express = require('express')
const router = express.Router()
const { prisma } = require('../services/database')
const { verifyToken } = require('../middleware/auth')

// GET /api/conversations - list all conversations for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    // req.user.id is the Supabase auth UID, mapped to User.supabaseId
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
      // For direct chats, show the *other* participant's name/avatar
      const otherParticipant = conv.participants.find(
        (p) => p.userId !== localUser.id
      )?.user

      const lastMessage = conv.messages[0]

      return {
        id: conv.id,
        name: conv.type === 'group' ? conv.name : otherParticipant?.displayName || otherParticipant?.username,
        avatarUrl: conv.type === 'group' ? null : otherParticipant?.avatar || null,
        lastMessage: lastMessage?.content || '',
        timestamp: lastMessage?.createdAt || conv.createdAt,
        unreadCount: 0, // TODO: implement once read-receipts are tracked
      }
    })

    res.json({ success: true, conversations: formatted })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' })
  }
})

module.exports = router