const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost/chat-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Chat Application!');
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (channel) => {
    socket.join(channel);
    console.log(`Client joined channel: ${channel}`);
  });

  socket.on('message', (data) => {
    io.to(data.channel).emit('message', data.message);
    console.log(`Message sent to channel ${data.channel}: ${data.message}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));