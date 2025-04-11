"use strict";
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { generateRandomName, generateRandomAvatar } = require('./utils');
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Serve static files from the client build directory
app.use('/sqdtv', express.static(path.join(__dirname, '../client/dist')));
const users = new Map();
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    // Generate random user data
    const user = {
        id: socket.id,
        name: generateRandomName(),
        avatar: generateRandomAvatar(),
        position: { x: 0, y: 0 }
    };
    // Add user to the users map
    users.set(socket.id, user);
    // Send current users to the new user
    socket.emit('users', Array.from(users.values()));
    // Broadcast new user to all other users
    socket.broadcast.emit('userJoined', user);
    // Handle position updates
    socket.on('updatePosition', (position) => {
        const user = users.get(socket.id);
        if (user) {
            user.position = position;
            socket.broadcast.emit('userMoved', { id: socket.id, position });
        }
    });
    // Handle chat messages
    socket.on('chatMessage', (message) => {
        const user = users.get(socket.id);
        if (user) {
            io.emit('chatMessage', {
                id: socket.id,
                name: user.name,
                message,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        users.delete(socket.id);
        io.emit('userLeft', socket.id);
    });
});
// Serve index.html for all routes to support client-side routing
app.get('/sqdtv/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
