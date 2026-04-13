const { prisma } = require('./database')
const { createClient } = require('@supabase/supabase-js')
const { v4: uuidv4 } = require('uuid')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

class AuthService {
  /**
   * Create user profile after Supabase registration
   */
  static async createUserProfile(supabaseUser, username) {
    try {
      const user = await prisma.user.create({
        data: {
          supabaseId: supabaseUser.id,
          email: supabaseUser.email,
          username: username || supabaseUser.email.split('@')[0],
          displayName: username || supabaseUser.user_metadata?.full_name || 'User',
          avatar: supabaseUser.user_metadata?.avatar_url || null,
          emailVerified: supabaseUser.email_confirmed_at ? true : false,
          role: 'user' // Default role
        }
      })

      // Log the registration
      await this.logAuditEvent(
        user.id,
        'register',
        'user',
        user.id,
        'success',
        null,
        null,
        JSON.stringify({ method: 'email/oauth' })
      )

      return user
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  /**
   * Create session after login
   */
  static async createSession(userId, ipAddress, userAgent) {
    try {
      const refreshToken = uuidv4()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const session = await prisma.session.create({
        data: {
          userId,
          refreshToken,
          expiresAt,
          ipAddress,
          userAgent,
          isRevoked: false
        }
      })

      // Log login
      await this.logAuditEvent(
        userId,
        'login',
        'session',
        session.id,
        'success',
        ipAddress,
        userAgent
      )

      return session
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  /**
   * Revoke session (logout)
   */
  static async revokeSession(sessionId, userId) {
    try {
      await prisma.session.update({
        where: { id: sessionId },
        data: { isRevoked: true }
      })

      // Log logout
      await this.logAuditEvent(userId, 'logout', 'session', sessionId, 'success')

      return true
    } catch (error) {
      console.error('Error revoking session:', error)
      throw error
    }
  }

  /**
   * Get user by ID (database)
   */
  static async getUserById(userId) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          supabaseId: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          status: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastSeenAt: true
        }
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  /**
   * Get user by Supabase ID
   */
  static async getUserBySupabaseId(supabaseId) {
    try {
      return await prisma.user.findUnique({
        where: { supabaseId },
        select: {
          id: true,
          supabaseId: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          status: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastSeenAt: true
        }
      })
    } catch (error) {
      console.error('Error fetching user by Supabase ID:', error)
      throw error
    }
  }

  /**
   * Get user by username (CASE-SENSITIVE exact matching)
   * Every letter, number, and special character matters!
   * john, John, JOHN, j0hn, john! are all DIFFERENT usernames
   */
  static async getUserByUsername(username) {
    try {
      // Keep exact case and characters - NO modifications
      return await prisma.user.findUnique({
        where: { username: username },
        select: {
          id: true,
          supabaseId: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          status: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastSeenAt: true
        }
      })
    } catch (error) {
      console.error('Error fetching user by username:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      // Whitelist allowed updates
      const allowedUpdates = ['displayName', 'bio', 'avatar', 'status']
      const sanitizedUpdates = {}

      for (const key of allowedUpdates) {
        if (key in updates) {
          sanitizedUpdates[key] = updates[key]
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: sanitizedUpdates
      })

      // Log the update
      await this.logAuditEvent(
        userId,
        'update_profile',
        'user',
        userId,
        'success'
      )

      return user
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Block a user
   */
  static async blockUser(blockerId, blockedId) {
    try {
      if (blockerId === blockedId) {
        throw new Error('Cannot block yourself')
      }

      return await prisma.blockedUser.create({
        data: {
          blockerId,
          blockedId
        }
      })
    } catch (error) {
      console.error('Error blocking user:', error)
      throw error
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(blockerId, blockedId) {
    try {
      return await prisma.blockedUser.delete({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId
          }
        }
      })
    } catch (error) {
      console.error('Error unblocking user:', error)
      throw error
    }
  }

  /**
   * Check if user is blocked
   */
  static async isUserBlocked(blockerId, blockedId) {
    try {
      const blocked = await prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId
          }
        }
      })

      return !!blocked
    } catch (error) {
      console.error('Error checking if user is blocked:', error)
      throw error
    }
  }

  /**
   * Log audit events for security tracking
   */
  static async logAuditEvent(
    userId,
    action,
    resource,
    resourceId,
    status = 'success',
    ipAddress = null,
    userAgent = null,
    details = null
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          status,
          ipAddress,
          userAgent,
          details
        }
      })
    } catch (error) {
      console.error('Error logging audit event:', error)
      // Don't throw - logging failure shouldn't break the app
    }
  }

  /**
   * Get audit logs for a user (admin only)
   */
  static async getAuditLogs(userId, limit = 50) {
    try {
      return await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          action: true,
          resource: true,
          status: true,
          ipAddress: true,
          createdAt: true
        }
      })
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  }
}

module.exports = AuthService