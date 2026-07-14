import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { spaceAudio } from './SpaceAudio';

export default function Planet({ 
  id, 
  name, 
  type, 
  subTitle,
  color, 
  size, 
  orbitRadius, 
  orbitSpeed, 
  coordinates, 
  details,
  onSelect, 
  selectedId, 
  isFocused 
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Track rotation and orbit in R3F frame loop
  useFrame((state, delta) => {
    if (orbitRadius && groupRef.current) {
      // Orbit around the center
      groupRef.current.rotation.y += (orbitSpeed || 0.5) * delta * 0.3;
    }
    if (meshRef.current) {
      // Spin planet on its own axis
      meshRef.current.rotation.y += 0.4 * delta;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
    spaceAudio.playChime();
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    spaceAudio.playClick();
    onSelect({
      id,
      name,
      type,
      subTitle,
      color,
      details
    });
  };
  
  const isSelected = selectedId === id;
  const currentScale = size * (hovered ? 1.25 : 1.0);
  const position = coordinates ? coordinates : [orbitRadius || 0, 0, 0];
  
  const content = (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      scale={[currentScale, currentScale, currentScale]}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered || isSelected ? 1.6 : 0.3}
        roughness={0.15}
        metalness={0.2}
      />
      {(hovered || isSelected) && (
        <pointLight color={color} intensity={2.5} distance={12} decay={2} />
      )}
      
      {/* Floating 3D text label above the planet */}
      {isFocused && (
        <Html distanceFactor={14} position={[0, 1.4, 0]} center>
          <div 
            className={`planet-label`} 
            style={{
              color: '#ffffff',
              background: 'rgba(4, 4, 15, 0.9)',
              border: `1px solid ${hovered || isSelected ? color : 'rgba(255, 255, 255, 0.15)'}`,
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              fontFamily: 'Share Tech Mono',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: hovered || isSelected ? `0 0 12px ${color}` : 'none',
              transform: 'translateY(-10px)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: hovered || isSelected ? 1.0 : 0.75
            }}
          >
            {name}
          </div>
        </Html>
      )}
    </mesh>
  );

  // If this planet orbits, wrap it in an orbiting group and render its track path
  if (orbitRadius) {
    return (
      <group ref={groupRef}>
        {/* Draw translucent orbit track */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[orbitRadius - 0.04, orbitRadius + 0.04, 64]} />
          <meshBasicMaterial 
            color="#ffffff" 
            opacity={0.03} 
            transparent 
            side={THREE.DoubleSide} 
          />
        </mesh>
        {content}
      </group>
    );
  }

  return content;
}
