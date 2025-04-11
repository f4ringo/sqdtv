"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const styled_components_1 = __importDefault(require("styled-components"));
const ChatContainer = styled_components_1.default.div `
  width: 320px;
  background-color: rgba(20, 20, 20, 0.95);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
`;
const MessagesContainer = styled_components_1.default.div `
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
const Message = styled_components_1.default.div `
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'};
  max-width: 85%;
  align-self: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'};
`;
const MessageContent = styled_components_1.default.div `
  background-color: ${props => props.color};
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
`;
const MessageSender = styled_components_1.default.span `
  font-size: 13px;
  color: ${props => props.color};
  margin-bottom: 4px;
  font-weight: 500;
`;
const InputContainer = styled_components_1.default.div `
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;
const Input = styled_components_1.default.input `
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
const Chat = ({ messages, onSendMessage, currentUser, users }) => {
    const [message, setMessage] = (0, react_1.useState)('');
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };
    const getUserColor = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user)
            return '#ffffff';
        // Extract color from SVG avatar
        const match = user.avatar.match(/fill="([^"]+)"/);
        return match ? match[1] : '#ffffff';
    };
    return ((0, jsx_runtime_1.jsxs)(ChatContainer, { children: [(0, jsx_runtime_1.jsxs)(MessagesContainer, { children: [messages.map((msg, index) => {
                        const isCurrentUser = msg.id === currentUser?.id;
                        const color = getUserColor(msg.id);
                        return ((0, jsx_runtime_1.jsxs)(Message, { isCurrentUser: isCurrentUser, children: [(0, jsx_runtime_1.jsx)(MessageSender, { color: color, children: msg.name }), (0, jsx_runtime_1.jsx)(MessageContent, { color: isCurrentUser ? color : `${color}33`, children: msg.message })] }, index));
                    }), (0, jsx_runtime_1.jsx)("div", { ref: messagesEndRef })] }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, children: (0, jsx_runtime_1.jsx)(InputContainer, { children: (0, jsx_runtime_1.jsx)(Input, { value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Type a message..." }) }) })] }));
};
exports.default = Chat;
