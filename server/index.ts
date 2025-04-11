import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { User, Position, ChatMessage, ServerSocket } from './types';
import { generateRandomName, generateRandomAvatar } from './utils';

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something broke!');
});

// Serve static files from the client build directory
const clientDistPath = path.join(__dirname, '../client/dist');
console.log('Serving static files from:', clientDistPath);

app.use('/sqdtv', express.static(clientDistPath));

// Store connected users and their positions
const users = new Map<string, User>();

// Socket.IO connection handling
io.on('connection', (socket: ServerSocket) => {
    console.log('New socket connection:', socket.id);
    console.log('Current connected users:', Array.from(users.keys()));

    try {
        // Generate random user data
        const user: User = {
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
        socket.on('updatePosition', (position: Position) => {
            console.log('Position update from', socket.id, ':', position);
            const user = users.get(socket.id);
            if (user) {
                user.position = position;
                socket.broadcast.emit('userMoved', { id: socket.id, position });
            }
        });

        // Handle chat messages
        socket.on('chatMessage', (message: string) => {
            console.log('Chat message from', socket.id, ':', message);
            const user = users.get(socket.id);
            if (user) {
                const chatMessage: ChatMessage = {
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
app.get('/sqdtv/*', (req: express.Request, res: express.Response) => {
    const indexPath = path.join(__dirname, '../client/dist/index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO path: /sqdtv/socket.io`);
    console.log(`Static files served from: ${clientDistPath}`);
}); 