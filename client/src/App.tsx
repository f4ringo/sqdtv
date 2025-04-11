import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { io, Socket } from 'socket.io-client';
import Canvas from './components/Canvas';
import Chat from './components/Chat';
import { User, ChatMessage } from './types';

const AppContainer = styled.div`
  position: relative;
  height: 100vh;
  background-color: #0a0a0a;
  color: white;
  overflow: hidden;
`;

const MainContent = styled.div`
  width: 100%;
  height: 100%;
`;

const ChatOverlay = styled.div`
  position: absolute;
  right: 24px;
  bottom: 24px;
  height: 400px;
  z-index: 10;
`;

function App() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [leavingUsers, setLeavingUsers] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<string>('connecting');

    useEffect(() => {
        const socketUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3001'
            : window.location.origin;

        console.log('Connecting to socket server at:', socketUrl);

        const newSocket = io(socketUrl, {
            path: '/sqdtv/socket.io',
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Socket connected successfully with ID:', newSocket.id);
            setConnectionStatus('connected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setConnectionStatus('error');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setConnectionStatus('disconnected');
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        newSocket.on('users', (initialUsers: User[]) => {
            console.log('Received initial users:', initialUsers);
            setUsers(initialUsers);
            const currentUser = initialUsers.find(user => user.id === newSocket.id);
            console.log('Setting current user:', currentUser);
            setCurrentUser(currentUser || null);
        });

        newSocket.on('userJoined', (user: User) => {
            console.log('User joined:', user);
            setUsers(prev => [...prev, user]);
        });

        newSocket.on('userLeft', (userId: string) => {
            console.log('User left:', userId);
            setLeavingUsers(prev => [...prev, userId]);
            // Remove user after animation
            setTimeout(() => {
                setUsers(prev => prev.filter(user => user.id !== userId));
                setLeavingUsers(prev => prev.filter(id => id !== userId));
            }, 500);
        });

        newSocket.on('userMoved', ({ id, position }) => {
            console.log('User moved:', id, position);
            setUsers(prev => prev.map(user =>
                user.id === id ? { ...user, position } : user
            ));
        });

        newSocket.on('chatMessage', (message: ChatMessage) => {
            console.log('Received chat message:', message);
            setMessages(prev => [...prev, message]);
        });

        return () => {
            console.log('Cleaning up socket connection');
            newSocket.close();
        };
    }, []);

    const handleCanvasClick = (position: { x: number; y: number }) => {
        if (socket && currentUser) {
            socket.emit('updatePosition', position);
            setUsers(prev => prev.map(user =>
                user.id === currentUser.id ? { ...user, position } : user
            ));
        }
    };

    const handleSendMessage = (message: string) => {
        if (socket && currentUser) {
            socket.emit('chatMessage', message);
        }
    };

    return (
        <AppContainer>
            <MainContent>
                <Canvas
                    users={users}
                    onCanvasClick={handleCanvasClick}
                    leavingUsers={leavingUsers}
                />
            </MainContent>
            <ChatOverlay>
                <Chat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    currentUser={currentUser}
                    users={users}
                />
            </ChatOverlay>
        </AppContainer>
    );
}

export default App; 