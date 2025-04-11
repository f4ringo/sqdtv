"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const styled_components_1 = __importDefault(require("styled-components"));
const THREE = __importStar(require("three"));
const CanvasContainer = styled_components_1.default.div `
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background-color: #0a0a0a;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;
const UserLabel = styled_components_1.default.div `
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y - 40}px;
  transform: translate(-50%, -50%) scale(${props => props.isLeaving ? 0.75 : 1});
  color: white;
  font-size: 14px;
  white-space: nowrap;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  transition: all 0.5s ease;
  opacity: ${props => props.isLeaving ? 0 : 1};
  filter: blur(${props => props.isLeaving ? '6px' : '0'});
`;
const Canvas = ({ users, onCanvasClick, leavingUsers }) => {
    const containerRef = (0, react_1.useRef)(null);
    const canvasRef = (0, react_1.useRef)(null);
    const rendererRef = (0, react_1.useRef)(null);
    const sceneRef = (0, react_1.useRef)(null);
    const cameraRef = (0, react_1.useRef)(null);
    const avatarsRef = (0, react_1.useRef)(new Map());
    const isDraggingRef = (0, react_1.useRef)(false);
    const lastMousePosRef = (0, react_1.useRef)({ x: 0, y: 0 });
    const [cameraOffset, setCameraOffset] = (0, react_1.useState)({ x: 0, y: 0 });
    // Initialize Three.js scene
    (0, react_1.useEffect)(() => {
        if (!containerRef.current || !canvasRef.current)
            return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        renderer.setClearColor(0x0a0a0a);
        rendererRef.current = renderer;
        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        // Create camera (orthographic for 2D view)
        const aspectRatio = width / height;
        const viewSize = 1000;
        const camera = new THREE.OrthographicCamera(-viewSize * aspectRatio / 2, viewSize * aspectRatio / 2, viewSize / 2, -viewSize / 2, 1, 1000);
        camera.position.z = 100;
        cameraRef.current = camera;
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        };
        animate();
        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !camera || !renderer)
                return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;
            const newAspectRatio = newWidth / newHeight;
            camera.left = -viewSize * newAspectRatio / 2;
            camera.right = viewSize * newAspectRatio / 2;
            camera.top = viewSize / 2;
            camera.bottom = -viewSize / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, []);
    // Handle user updates
    (0, react_1.useEffect)(() => {
        if (!sceneRef.current)
            return;
        const scene = sceneRef.current;
        const currentAvatars = new Set();
        // Update or create avatars
        users.forEach(user => {
            currentAvatars.add(user.id);
            let avatar = avatarsRef.current.get(user.id);
            if (!avatar) {
                // Create new avatar
                const geometry = new THREE.CircleGeometry(20, 32);
                const material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(extractColorFromSvg(user.avatar)),
                    transparent: true,
                    opacity: leavingUsers.includes(user.id) ? 0 : 1
                });
                avatar = new THREE.Mesh(geometry, material);
                scene.add(avatar);
                avatarsRef.current.set(user.id, avatar);
            }
            // Update position
            avatar.position.x = user.position.x - (window.innerWidth / 2) + cameraOffset.x;
            avatar.position.y = -(user.position.y - (window.innerHeight / 2)) + cameraOffset.y;
            // Update leaving animation
            if (leavingUsers.includes(user.id)) {
                const material = avatar.material;
                material.opacity = 0;
                material.needsUpdate = true;
            }
        });
        // Remove unused avatars
        avatarsRef.current.forEach((avatar, id) => {
            if (!currentAvatars.has(id)) {
                scene.remove(avatar);
                avatarsRef.current.delete(id);
            }
        });
    }, [users, leavingUsers, cameraOffset]);
    // Handle mouse events
    (0, react_1.useEffect)(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const handleMouseDown = (e) => {
            isDraggingRef.current = true;
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current)
                return;
            const dx = e.clientX - lastMousePosRef.current.x;
            const dy = e.clientY - lastMousePosRef.current.y;
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
            setCameraOffset(prev => ({
                x: prev.x - dx,
                y: prev.y - dy
            }));
        };
        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };
        const handleClick = (e) => {
            if (!containerRef.current)
                return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left + cameraOffset.x;
            const y = e.clientY - rect.top + cameraOffset.y;
            onCanvasClick({ x, y });
        };
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseUp);
        container.addEventListener('click', handleClick);
        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mouseleave', handleMouseUp);
            container.removeEventListener('click', handleClick);
        };
    }, [onCanvasClick]);
    const extractColorFromSvg = (svgString) => {
        const match = svgString.match(/fill="([^"]+)"/);
        return match ? match[1] : '#ffffff';
    };
    return ((0, jsx_runtime_1.jsxs)(CanvasContainer, { ref: containerRef, children: [(0, jsx_runtime_1.jsx)("canvas", { ref: canvasRef }), users.map(user => ((0, jsx_runtime_1.jsx)(UserLabel, { x: user.position.x, y: user.position.y, isLeaving: leavingUsers.includes(user.id), children: user.name }, user.id)))] }));
};
exports.default = Canvas;
