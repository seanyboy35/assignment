const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const routes = require('./routes');
const cors = require('cors');  // Import cors for use in express
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const messageRoutes = require('./api/messages');

// Enable CORS for your entire Express app (optional)
app.use(cors({
  origin: "http://localhost:4200",  // Allow your Angular app (remove the trailing slash)
  methods: ["GET", "POST"]
}));

mongoose.connect('mongodb://localhost:27017/MyDB',{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const db = mongoose.connection;

db.on('error', (err) => {
  console.error(err);
});

// Middleware
app.use(bodyParser.json());  // Parse incoming JSON requests
app.use(express.json());
app.use('/api/messages', messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Chat Application!');
});

const { Message } = require('./models'); // Importing the Message model

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle incoming messages
  socket.on('chat message', async (messageObject) => {
    console.log('Message received:', messageObject);

    try {
      // Create a new message instance using the Message model
      const newMessage = new Message({
        username: messageObject.username,
        text: messageObject.text,
        timestamp: new Date(),
      });

      // Save the message to MongoDB
      await newMessage.save();
      console.log('Message saved to MongoDB:', newMessage);

      // Broadcast the message to all connected clients
      io.emit('chat message', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Endpoint to save messages to MongoDB
app.post('/api/messages', async (req, res) => {
  const { username, text } = req.body;

  console.log('Received message:', username, text); // Log incoming message

  try {
    const newMessage = new Message({
      username: username,
      text: text,
      timestamp: new Date(),
    });

    await newMessage.save();
    console.log('Message saved to MongoDB:', newMessage); // Log the saved message

    res.status(200).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error); // Log any error
    res.status(500).json({ error: 'Error saving message to database' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
