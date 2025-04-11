import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { User, Position } from '../types';
import * as THREE from 'three';

interface CanvasProps {
  users: User[];
  onCanvasClick: (position: Position) => void;
  leavingUsers: string[];
}

const CanvasContainer = styled.div`
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

const UserLabel = styled.div<{ x: number; y: number; isLeaving: boolean }>`
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

const Canvas: React.FC<CanvasProps> = ({ users, onCanvasClick, leavingUsers }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const avatarsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

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
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspectRatio / 2,
      viewSize * aspectRatio / 2,
      viewSize / 2,
      -viewSize / 2,
      1,
      1000
    );
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
      if (!containerRef.current || !camera || !renderer) return;

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
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const currentAvatars = new Set<string>();

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
        const material = avatar.material as THREE.MeshBasicMaterial;
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
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

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

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;

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

  const extractColorFromSvg = (svgString: string): string => {
    const match = svgString.match(/fill="([^"]+)"/);
    return match ? match[1] : '#ffffff';
  };

  return (
    <CanvasContainer ref={containerRef}>
      <canvas ref={canvasRef} />
      {users.map(user => (
        <UserLabel
          key={user.id}
          x={user.position.x}
          y={user.position.y}
          isLeaving={leavingUsers.includes(user.id)}
        >
          {user.name}
        </UserLabel>
      ))}
    </CanvasContainer>
  );
};

export default Canvas; 