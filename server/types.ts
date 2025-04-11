import { Socket } from 'socket.io';

export interface Position {
    x: number;
    y: number;
}

export interface User {
    id: string;
    name: string;
    avatar: string;
    position: Position;
}

export interface ChatMessage {
    id: string;
    name: string;
    message: string;
    timestamp: string;
}

export interface ServerSocket extends Socket {
    user?: User;
} 