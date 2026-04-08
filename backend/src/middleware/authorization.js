const { prisma } = require('../services/database')

/**
 * Check if user has required role(s)
 * @param {...string} allowedRoles - roles that are allowed
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        })
      }

      // Get user from database with role
      const user = await prisma.user.findUnique({
        where: { supabaseId: req.user.id }
      })

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        })
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        })
      }

      // Attach user to request
      req.user.dbUser = user
      next()
    } catch (error) {
      console.error('Authorization error:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Authorization check failed' 
      })
    }
  }
}

/**
 * Check if user owns a resource (message, conversation, etc.)
 * @param {string} resourceType - 'message', 'conversation', etc.
 * @param {string} resourceIdParam - URL parameter name (default: 'id')
 */
const requireOwnership = (resourceType, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.dbUser) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        })
      }

      const resourceId = req.params[resourceIdParam]

      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing resource ID parameter: ${resourceIdParam}` 
        })
      }

      let isOwner = false

      switch (resourceType) {
        case 'message':
          const message = await prisma.message.findUnique({
            where: { id: resourceId }
          })
          isOwner = message && message.senderId === req.user.dbUser.id
          break

        case 'conversation':
          const conversation = await prisma.conversation.findUnique({
            where: { id: resourceId }
          })
          isOwner = conversation && conversation.createdBy === req.user.dbUser.id
          break

        default:
          return res.status(400).json({ 
            success: false, 
            message: `Unknown resource type: ${resourceType}` 
          })
      }

      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to access this resource' 
        })
      }

      next()
    } catch (error) {
      console.error('Ownership check error:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Ownership verification failed' 
      })
    }
  }
}

/**
 * Check if user is participant in a conversation
 */
const requireConversationAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.dbUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      })
    }

    const conversationId = req.params.conversationId || req.params.id

    if (!conversationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing conversation ID' 
      })
    }

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: req.user.dbUser.id
        }
      }
    })

    if (!participant || participant.leftAt) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a participant in this conversation' 
      })
    }

    req.conversationParticipant = participant
    next()
  } catch (error) {
    console.error('Conversation access check error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Access verification failed' 
    })
  }
}

module.exports = {
  requireRole,
  requireOwnership,
  requireConversationAccess
}