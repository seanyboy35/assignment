const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const routes = require('./routes');
const cors = require('cors');  // Import cors for use in express

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS for your entire Express app (optional)
app.use(cors({
  origin: "http://localhost:4200/",  // Allow your Angular app
  methods: ["GET", "POST"]
}));

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

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle incoming messages
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg);  // Broadcast message to all clients
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));