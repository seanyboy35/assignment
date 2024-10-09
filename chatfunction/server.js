const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store chat histories and user avatars for different rooms
const chatRooms = {};
const userAvatars = {}; // Store avatars for each user

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', ({ room, username, avatar }) => {
        socket.join(room);
        socket.room = room;
        socket.username = username;
        socket.avatar = avatar; // Store the user's avatar

        // Store avatar for the username
        userAvatars[username] = avatar;

        socket.to(room).emit('userConnected', username);

        // Send chat history to the user who joined
        socket.emit('chatHistory', chatRooms[room] || []);
    });

    socket.on('message', (msg) => {
        const room = socket.room;
        const username = socket.username;
        const avatar = socket.avatar;

        const message = { username, msg, avatar };
        
        if (!chatRooms[room]) {
            chatRooms[room] = [];
        }
        chatRooms[room].push(message);
        
        io.to(room).emit('message', message);
    });

    socket.on('image', (data) => {
        const room = socket.room;
        const username = socket.username;
        const avatar = socket.avatar;

        const imageMessage = { username, image: data, avatar };
        
        if (!chatRooms[room]) {
            chatRooms[room] = [];
        }
        chatRooms[room].push(imageMessage);
        
        io.to(room).emit('image', imageMessage);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.username || socket.id);
        socket.to(socket.room).emit('userDisconnected', socket.username || socket.id);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});
