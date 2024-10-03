const { Server } = require('socket.io');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',  // Allow all origins, adjust for production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle messages sent by clients
    socket.on('chat message', (msg) => {
      console.log('Message received:', msg);
      io.emit('chat message', msg);  // Broadcast message to all clients
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};
