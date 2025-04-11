#!/bin/bash

# Ensure we exit on any error
set -e

# Install dependencies
echo "Installing server dependencies..."
npm install

echo "Installing client dependencies..."
cd client
npm install
cd ..

# Ensure client/dist directory exists and is empty
echo "Preparing build directory..."
rm -rf client/dist
mkdir -p client/dist

# Build the client
echo "Building client..."
cd client
npx vite build
cd ..

# Ensure proper permissions
echo "Setting permissions..."
chmod -R 755 client/dist

# Create a simple server.js file to run the application
echo "Creating server.js file..."
cat > server.js << 'EOF'
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
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
      <circle cx="${size/2}" cy="${size/3}" r="${size/6}" fill="white"/>
      <path d="M ${size/4} ${size*2/3} Q ${size/2} ${size*4/5} ${size*3/4} ${size*2/3}" stroke="white" fill="none" stroke-width="2"/>
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
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Serve static files from the client build directory
const clientDistPath = path.join(__dirname, 'client/dist');
console.log('Serving static files from:', clientDistPath);

app.use('/sqdtv', express.static(clientDistPath));

// Store connected users and their positions
const users = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    try {
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
    } catch (error) {
        console.error('Socket error:', error);
    }
});

// Serve index.html for all routes to support client-side routing
app.get('/sqdtv/*', (req, res) => {
    const indexPath = path.join(__dirname, 'client/dist/index.html');
    console.log('Serving index.html from:', indexPath);
    
    if (!fs.existsSync(indexPath)) {
        console.error('index.html not found at:', indexPath);
        return res.status(404).send('File not found');
    }
    
    res.sendFile(indexPath);
});

// Handle 404s
app.use((req, res) => {
    res.status(404).send('Not found');
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
EOF

# Ensure proper permissions for server files
chmod 755 server.js

echo "Build complete! The application is ready to be served at kirper.sh/sqdtv"
echo "To start the server, run: node server.js" 