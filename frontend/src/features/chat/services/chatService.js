import { apiClient } from '../../../shared/services/api'

const chatService = {
  async getChats() {
    const response = await apiClient.getConversations()

    if (!response.success) {
      throw new Error(response.message || 'Failed to load chats')
    }

    return response.data?.conversations || []
  },
}

export default chatService