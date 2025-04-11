import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { User, ChatMessage } from '../types';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUser: User | null;
  users: User[];
}

const ChatContainer = styled.div`
  width: 320px;
  background-color: rgba(20, 20, 20, 0.95);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const Message = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'};
  max-width: 85%;
  align-self: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'};
`;

const MessageContent = styled.div<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
`;

const MessageSender = styled.span<{ color: string }>`
  font-size: 13px;
  color: ${props => props.color};
  margin-bottom: 4px;
  font-weight: 500;
`;

const InputContainer = styled.div`
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: background-color 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUser, users }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const getUserColor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return '#ffffff';

    // Extract color from SVG avatar
    const match = user.avatar.match(/fill="([^"]+)"/);
    return match ? match[1] : '#ffffff';
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.id === currentUser?.id;
          const color = getUserColor(msg.id);
          return (
            <Message key={index} isCurrentUser={isCurrentUser}>
              <MessageSender color={color}>{msg.name}</MessageSender>
              <MessageContent color={isCurrentUser ? color : `${color}33`}>
                {msg.message}
              </MessageContent>
            </Message>
          );
        })}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <form onSubmit={handleSubmit}>
        <InputContainer>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
        </InputContainer>
      </form>
    </ChatContainer>
  );
};

export default Chat; 