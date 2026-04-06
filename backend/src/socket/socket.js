const redis = require('../redis/redisClient')

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`)

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId)
      console.log(`User joined conversation: ${conversationId}`)
    })

    socket.on('send_message', async (data) => {
      const { conversationId, message } = data

      // Publish to Redis
      await redis.publish('messages', JSON.stringify({ conversationId, message }))

      // Emit to all users in the conversation
      io.to(conversationId).emit('receive_message', message)
    })

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`)
    })
  })
}