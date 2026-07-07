const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const app = express()

// If you deploy behind a reverse proxy (Render/Heroku/Nginx/Cloudflare), enable this
app.set('trust proxy', 1)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./src/routes/auth'))
app.use('/api/messages', require('./src/routes/messages'))
app.use('/api/conversations', require('./src/routes/conversations'))
app.use('/api/security', require('./src/routes/security'))

// Socket.IO
require('./src/socket/socket')(io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})