import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * API Client with automatic token handling
 */
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  /**
   * Get authorization header with Supabase token
   */
  async getAuthHeaders() {
    // Always include JSON content type so Express can parse request bodies
    // even when the user is logged out (public endpoints like check-username).
    const baseHeaders = { 'Content-Type': 'application/json' }

    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      return baseHeaders
    }

    return {
      ...baseHeaders,
      Authorization: `Bearer ${data.session.access_token}`
    }
  }

  /**
   * Make API request with automatic error handling
   * Returns a consistent shape for both success and error cases.
   */
  async request(endpoint, options = {}) {
    const headers = await this.getAuthHeaders()

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      // Parse JSON safely (backend usually returns JSON, but don't assume)
      let payload = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }

      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('unauthorized'))
      }

      // Handle 403 - forbidden (authorization failed)
      if (response.status === 403) {
        return {
          success: false,
          status: 403,
          data: payload?.data ?? null,
          message:
            payload?.message ||
            'Access denied: You do not have permission for this action'
        }
      }

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          data: payload?.data ?? null,
          message: payload?.message || `API Error: ${response.status}`,
          error:
            payload?.error || payload?.message || `API Error: ${response.status}`
        }
      }

      return {
        success: true,
        status: response.status,
        data: payload?.data ?? null,
        message: payload?.message
      }
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        status: null,
        data: null,
        message: error?.message || 'Network error',
        error: error?.message || 'Network error'
      }
    }
  }

  // Auth endpoints
  async checkUsernameAvailability(username) {
    return this.request('/api/auth/check-username', {
      method: 'POST',
      body: JSON.stringify({ username })
    })
  }

  async registerUser(supabaseUser, username) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ supabaseUser, username })
    })
  }

  async loginUser() {
    return this.request('/api/auth/login', {
      method: 'POST'
    })
  }

  async logoutUser(sessionId) {
    return this.request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    })
  }

  async getCurrentUser() {
    return this.request('/api/auth/me')
  }

  async getUserProfile(userId) {
    return this.request(`/api/auth/user/${userId}`)
  }

  async updateUserProfile(updates) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async blockUser(userId) {
    return this.request(`/api/auth/block/${userId}`, {
      method: 'POST'
    })
  }

  async unblockUser(userId) {
    return this.request(`/api/auth/unblock/${userId}`, {
      method: 'POST'
    })
  }

  async getAuditLogs() {
    return this.request('/api/auth/audit-logs')
  }

  /**
   * Security login gateway (server-enforced lockouts + rate limiting)
   */
  async securityLogin(email, password) {
    return this.request('/api/security/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  // Message endpoints
  async getMessages(conversationId) {
    return this.request(`/api/messages?conversationId=${conversationId}`)
  }

  async sendMessage(conversationId, content) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content })
    })
  }

  async deleteMessage(messageId) {
    return this.request(`/api/messages/${messageId}`, {
      method: 'DELETE'
    })
  }
}

export const apiClient = new APIClient(API_URL)