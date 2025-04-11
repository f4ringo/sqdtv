const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// Define the utility functions directly in server.js
const adjectives = [
    'Cool', 'Super', 'Mega', 'Ultra', 'Epic', 'Awesome', 'Amazing',
    'Brilliant', 'Clever', 'Daring', 'Eager', 'Fierce', 'Gentle'
];

const nouns = [
    'Tiger', 'Eagle', 'Dolphin', 'Panda', 'Koala', 'Penguin', 'Lion',
    'Wolf', 'Bear', 'Fox', 'Hawk', 'Owl', 'Dragon', 'Phoenix'
];

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];

function generateRandomName() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 100);
    return `${adjective}${noun}${number}`;
}

function generateRandomAvatar() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 40;
    const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}"/>
      <circle cx="${size / 2}" cy="${size / 3}" r="${size / 6}" fill="white"/>
      <path d="M ${size / 4} ${size * 2 / 3} Q ${size / 2} ${size * 4 / 5} ${size * 3 / 4} ${size * 2 / 3}" stroke="white" fill="none" stroke-width="2"/>
    </svg>
  `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    path: '/sqdtv/socket.io'
});

// Add detailed logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Serve static files from the client build directory
const clientDistPath = path.join(__dirname, 'client/dist');
console.log('Serving static files from:', clientDistPath);

// Check if the directory exists
if (!fs.existsSync(clientDistPath)) {
    console.error('ERROR: Client dist directory not found at:', clientDistPath);
} else {
    console.log('Client dist directory exists and contains:', fs.readdirSync(clientDistPath));
}

app.use('/sqdtv', express.static(clientDistPath));

// Store connected users and their positions
const users = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    console.log('Current connected users:', Array.from(users.keys()));

    try {
        // Generate random user data
        const user = {
            id: socket.id,
            name: generateRandomName(),
            avatar: generateRandomAvatar(),
            position: { x: 0, y: 0 }
        };

        console.log('Generated user data:', user);

        // Add user to the users map
        users.set(socket.id, user);

        // Send current users to the new user
        const allUsers = Array.from(users.values());
        console.log('Sending initial users to new client:', allUsers);
        socket.emit('users', allUsers);

        // Broadcast new user to all other users
        console.log('Broadcasting new user to others:', user);
        socket.broadcast.emit('userJoined', user);

        // Handle position updates
        socket.on('updatePosition', (position) => {
            console.log('Position update from', socket.id, ':', position);
            const user = users.get(socket.id);
            if (user) {
                user.position = position;
                socket.broadcast.emit('userMoved', { id: socket.id, position });
            }
        });

        // Handle chat messages
        socket.on('chatMessage', (message) => {
            console.log('Chat message from', socket.id, ':', message);
            const user = users.get(socket.id);
            if (user) {
                const chatMessage = {
                    id: socket.id,
                    name: user.name,
                    message,
                    timestamp: new Date().toISOString()
                };
                console.log('Broadcasting chat message:', chatMessage);
                io.emit('chatMessage', chatMessage);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            users.delete(socket.id);
            io.emit('userLeft', socket.id);
            console.log('Remaining users:', Array.from(users.keys()));
        });
    } catch (error) {
        console.error('Socket error for', socket.id, ':', error);
    }
});

// Serve index.html for all routes to support client-side routing
app.get('/sqdtv/*', (req, res) => {
    const indexPath = path.join(__dirname, 'client/dist/index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO path: /sqdtv/socket.io`);
    console.log(`Static files served from: ${clientDistPath}`);
});
