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
    const { data, error } = await supabase.auth.getSession()
    
    if (error || !data.session) {
      return {}
    }

    return {
      'Authorization': `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Make API request with automatic error handling
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
      const data = await response.json()

      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        // Supabase will handle token refresh automatically
        // But we can trigger a logout event
        window.dispatchEvent(new CustomEvent('unauthorized'))
      }

      // Handle 403 - forbidden (authorization failed)
      if (response.status === 403) {
        throw new Error('Access denied: You do not have permission for this action')
      }

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`)
      }

      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('API Error:', error)
      return { 
        success: false, 
        error: error.message || 'An error occurred',
        message: error.message 
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