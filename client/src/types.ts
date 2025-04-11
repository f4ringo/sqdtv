export interface User {
    id: string;
    name: string;
    avatar: string;
    position: Position;
}

export interface Position {
    x: number;
    y: number;
}

export interface ChatMessage {
    id: string;
    name: string;
    message: string;
    timestamp: string;
} 