"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const styled_components_1 = __importDefault(require("styled-components"));
const socket_io_client_1 = require("socket.io-client");
const Canvas_1 = __importDefault(require("./components/Canvas"));
const Chat_1 = __importDefault(require("./components/Chat"));
const AppContainer = styled_components_1.default.div `
  position: relative;
  height: 100vh;
  background-color: #0a0a0a;
  color: white;
  overflow: hidden;
`;
const MainContent = styled_components_1.default.div `
  width: 100%;
  height: 100%;
`;
const ChatOverlay = styled_components_1.default.div `
  position: absolute;
  right: 24px;
  bottom: 24px;
  height: 400px;
  z-index: 10;
`;
function App() {
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [users, setUsers] = (0, react_1.useState)([]);
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [currentUser, setCurrentUser] = (0, react_1.useState)(null);
    const [leavingUsers, setLeavingUsers] = (0, react_1.useState)([]);
    const [connectionStatus, setConnectionStatus] = (0, react_1.useState)('connecting');
    (0, react_1.useEffect)(() => {
        const socketUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3001'
            : window.location.origin;
        console.log('Connecting to socket server at:', socketUrl);
        const newSocket = (0, socket_io_client_1.io)(socketUrl, {
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
        newSocket.on('users', (initialUsers) => {
            console.log('Received initial users:', initialUsers);
            setUsers(initialUsers);
            const currentUser = initialUsers.find(user => user.id === newSocket.id);
            console.log('Setting current user:', currentUser);
            setCurrentUser(currentUser || null);
        });
        newSocket.on('userJoined', (user) => {
            console.log('User joined:', user);
            setUsers(prev => [...prev, user]);
        });
        newSocket.on('userLeft', (userId) => {
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
            setUsers(prev => prev.map(user => user.id === id ? { ...user, position } : user));
        });
        newSocket.on('chatMessage', (message) => {
            console.log('Received chat message:', message);
            setMessages(prev => [...prev, message]);
        });
        return () => {
            console.log('Cleaning up socket connection');
            newSocket.close();
        };
    }, []);
    const handleCanvasClick = (position) => {
        if (socket && currentUser) {
            socket.emit('updatePosition', position);
            setUsers(prev => prev.map(user => user.id === currentUser.id ? { ...user, position } : user));
        }
    };
    const handleSendMessage = (message) => {
        if (socket && currentUser) {
            socket.emit('chatMessage', message);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(AppContainer, { children: [(0, jsx_runtime_1.jsx)(MainContent, { children: (0, jsx_runtime_1.jsx)(Canvas_1.default, { users: users, onCanvasClick: handleCanvasClick, leavingUsers: leavingUsers }) }), (0, jsx_runtime_1.jsx)(ChatOverlay, { children: (0, jsx_runtime_1.jsx)(Chat_1.default, { messages: messages, onSendMessage: handleSendMessage, currentUser: currentUser, users: users }) })] }));
}
exports.default = App;
