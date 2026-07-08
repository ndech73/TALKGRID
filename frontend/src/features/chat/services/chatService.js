import { apiClient } from '../../../shared/services/api'

const chatService = {
  async getConversations() {
    const res = await apiClient.getConversations()

    if (!res.success) {
      throw new Error(res.message || 'Failed to fetch conversations')
    }

    return res.data || []
  }
}

export default chatService