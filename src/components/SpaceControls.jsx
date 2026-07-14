import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export default function SpaceControls({ mode, orbitRef, isAnimating }) {
  const { camera, gl } = useThree();
  
  // Track WASD keys
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
    shift: false
  });
  
  // Track dragging variables for Fly Mode look-around
  const mouse = useRef({ isDown: false, x: 0, y: 0 });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'fly' || isAnimating) return;
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') keys.current.w = true;
      if (key === 's' || e.key === 'ArrowDown') keys.current.s = true;
      if (key === 'a' || e.key === 'ArrowLeft') keys.current.a = true;
      if (key === 'd' || e.key === 'ArrowRight') keys.current.d = true;
      if (key === 'q' || e.key === ' ') keys.current.q = true; // Q or Space to fly up
      if (key === 'e') keys.current.e = true; // E to fly down
      if (e.shiftKey) keys.current.shift = true;
    };
    
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') keys.current.w = false;
      if (key === 's' || e.key === 'ArrowDown') keys.current.s = false;
      if (key === 'a' || e.key === 'ArrowLeft') keys.current.a = false;
      if (key === 'd' || e.key === 'ArrowRight') keys.current.d = false;
      if (key === 'q' || e.key === ' ') keys.current.q = false;
      if (key === 'e') keys.current.e = false;
      if (!e.shiftKey) keys.current.shift = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, isAnimating]);
  
  // Drag to look in Fly Mode
  useEffect(() => {
    if (mode !== 'fly' || isAnimating) return;
    
    // Sync current camera orientation to Euler angles
    euler.current.setFromQuaternion(camera.quaternion);
    
    const handlePointerDown = (e) => {
      mouse.current.isDown = true;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    
    const handlePointerMove = (e) => {
      if (!mouse.current.isDown) return;
      
      const deltaX = e.clientX - mouse.current.x;
      const deltaY = e.clientY - mouse.current.y;
      
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      const sensitivity = 0.0025;
      
      // Update Yaw (Y-rotation) and Pitch (X-rotation)
      euler.current.y -= deltaX * sensitivity;
      euler.current.x -= deltaY * sensitivity;
      
      // Prevent gimbal lock by constraining pitch
      euler.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, euler.current.x));
      
      camera.quaternion.setFromEuler(euler.current);
    };
    
    const handlePointerUp = () => {
      mouse.current.isDown = false;
    };
    
    const canvasElement = gl.domElement;
    canvasElement.addEventListener('pointerdown', handlePointerDown);
    canvasElement.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      canvasElement.removeEventListener('pointerdown', handlePointerDown);
      canvasElement.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [mode, isAnimating, camera, gl]);
  
  // Frame loop for camera translation in Fly Mode
  useFrame((state, delta) => {
    if (mode !== 'fly' || isAnimating) return;
    
    // Base speed in units per second
    const baseSpeed = 20; 
    const speed = baseSpeed * (keys.current.shift ? 2.5 : 1.0) * delta;
    
    // Get camera directional vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    const up = new THREE.Vector3(0, 1, 0); // Global up direction
    
    // Translate position
    if (keys.current.w) camera.position.addScaledVector(forward, speed);
    if (keys.current.s) camera.position.addScaledVector(forward, -speed);
    if (keys.current.a) camera.position.addScaledVector(right, -speed);
    if (keys.current.d) camera.position.addScaledVector(right, speed);
    if (keys.current.q) camera.position.addScaledVector(up, speed);
    if (keys.current.e) camera.position.addScaledVector(up, -speed);
    
    // Constrain camera position to prevent flying into infinite void
    const maxBound = 150;
    camera.position.x = Math.max(-maxBound, Math.min(maxBound, camera.position.x));
    camera.position.y = Math.max(-maxBound, Math.min(maxBound, camera.position.y));
    camera.position.z = Math.max(-maxBound, Math.min(maxBound, camera.position.z));
  });
  
  // Render OrbitControls only in Orbit Mode
  return mode === 'orbit' ? (
    <OrbitControls
      ref={orbitRef}
      enableDamping
      dampingFactor={0.05}
      makeDefault
      minDistance={3}
      maxDistance={120}
      enabled={!isAnimating}
    />
  ) : null;
}
