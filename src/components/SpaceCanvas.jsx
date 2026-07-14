import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import Galaxy from './Galaxy';
import SpaceControls from './SpaceControls';
import { spaceAudio } from './SpaceAudio';

// Camera transition controller inside the R3F Context
function CameraController({ 
  focusedGalaxyId, 
  selectedNode, 
  galaxies, 
  orbitRef, 
  isAnimating, 
  setIsAnimating 
}) {
  const { camera } = useThree();
  const prevSelectedNodeId = useRef(null);

  // 1. Handle Galaxy Selection (Zoom inside Galaxy)
  useEffect(() => {
    if (!focusedGalaxyId) return;

    const targetGalaxy = galaxies.find(g => g.id === focusedGalaxyId);
    if (!targetGalaxy) return;

    const [gx, gy, gz] = targetGalaxy.coordinates;

    // Interrupt any active camera tweens
    gsap.killTweensOf(camera.position);
    if (orbitRef.current) gsap.killTweensOf(orbitRef.current.target);

    setIsAnimating(true);
    spaceAudio.playWoosh();

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    });

    // Fly camera close to galaxy
    tl.to(camera.position, {
      x: gx,
      y: gy + 12,
      z: gz + 18,
      duration: 1.8,
      ease: 'power2.inOut'
    }, 0);

    // Point controls target directly at galaxy center
    if (orbitRef.current) {
      tl.to(orbitRef.current.target, {
        x: gx,
        y: gy,
        z: gz,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => orbitRef.current.update()
      }, 0);
    }
    
    // Clear selected node when changing galaxy focus
    prevSelectedNodeId.current = null;

  }, [focusedGalaxyId, galaxies, orbitRef, setIsAnimating]);

  // 2. Handle Universe Reset (Fly out to Overview)
  useEffect(() => {
    if (focusedGalaxyId) return;

    gsap.killTweensOf(camera.position);
    if (orbitRef.current) gsap.killTweensOf(orbitRef.current.target);

    setIsAnimating(true);
    spaceAudio.playWoosh();

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    });

    // Fly back to initial overview height
    tl.to(camera.position, {
      x: 0,
      y: 40,
      z: 75,
      duration: 2.0,
      ease: 'power2.inOut'
    }, 0);

    // Reset look target to universe origin
    if (orbitRef.current) {
      tl.to(orbitRef.current.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2.0,
        ease: 'power2.inOut',
        onUpdate: () => orbitRef.current.update()
      }, 0);
    }

    prevSelectedNodeId.current = null;

  }, [focusedGalaxyId, orbitRef, setIsAnimating]);

  // 3. Handle specific Star/Planet Selection (Focus Camera Close-up)
  useEffect(() => {
    if (!selectedNode || !focusedGalaxyId || isAnimating) return;
    if (prevSelectedNodeId.current === selectedNode.id) return;
    
    prevSelectedNodeId.current = selectedNode.id;
    
    const targetGalaxy = galaxies.find(g => g.id === focusedGalaxyId);
    if (!targetGalaxy) return;

    // Resolve absolute coordinate for target node
    let localOffset = [0, 0, 0];
    const [gx, gy, gz] = targetGalaxy.coordinates;

    // If it's a project node, map offsets from Galaxy definition
    if (focusedGalaxyId === 'projects') {
      const positions = {
        zenith_ai: [0, 0, 0],
        starforge: [7, 1.5, -7],
        freshtrack: [-8, -1, 6],
        spidey_sense: [8, -2, 6],
        super_mario: [-7, 2, -7],
        resume_screener: [11, 0, 0],
        divyastra: [-11, -1.5, -2],
        brahmastra: [3, -3, 11]
      };
      // Check if it's the main project star
      if (positions[selectedNode.id]) {
        localOffset = positions[selectedNode.id];
      } else if (selectedNode.id.includes('_tech_')) {
        // Tech planet: orbit close to its parent project center
        const parentId = selectedNode.id.split('_tech_')[0];
        const projCenter = positions[parentId] || [0,0,0];
        localOffset = [projCenter[0] + 1.5, projCenter[1], projCenter[2] + 1.5];
      }
    } 
    // If it's a skill category center
    else if (focusedGalaxyId === 'skills') {
      // Find node in skills calculations
      if (selectedNode.id.startsWith('cat_')) {
        // Find category offset
        const idx = galaxies.find(g => g.id === 'skills').constellations.findIndex(
          c => `cat_${c.category.toLowerCase().replace(/\s+/g, '_')}` === selectedNode.id
        );
        if (idx !== -1) {
          const angle = (idx / 6) * Math.PI * 2;
          localOffset = [Math.cos(angle) * 9, (idx % 2 === 0 ? 1 : -1) * 1.5, Math.sin(angle) * 9];
        }
      } else if (selectedNode.id.startsWith('skill_')) {
        // Just focus general area of galaxy
        localOffset = [0, 0, 0];
      }
    }
    // If it's a personal star
    else if (focusedGalaxyId === 'personal') {
      const offsets = {
        core_star: [0, 0, 0],
        about_planet: [8, 0, 0],
        education_planet: [13, 0, 0],
        academic_moon: [13 + 3, 0, 0] // Orbiting education
      };
      if (offsets[selectedNode.id]) localOffset = offsets[selectedNode.id];
    }
    // Achievements ring
    else if (focusedGalaxyId === 'achievements') {
      const idx = targetGalaxy.stars.findIndex(s => s.id === selectedNode.id);
      if (idx !== -1) {
        const angle = (idx / targetGalaxy.stars.length) * Math.PI * 2;
        localOffset = [Math.cos(angle) * 5, (idx % 2 === 0 ? 0.5 : -0.5), Math.sin(angle) * 5];
      }
    }
    // Certifications Fibonacci shell
    else if (focusedGalaxyId === 'certifications') {
      const idx = targetGalaxy.stars.findIndex(s => s.id === selectedNode.id);
      if (idx !== -1) {
        const phi = Math.acos(-1 + (2 * idx) / targetGalaxy.stars.length);
        const theta = Math.sqrt(targetGalaxy.stars.length * Math.PI) * phi;
        const radius = 8 + (idx % 2 === 0 ? 1 : -1) * 0.8;
        localOffset = [
          Math.sin(phi) * Math.cos(theta) * radius,
          Math.cos(phi) * radius * 0.7,
          Math.sin(phi) * Math.sin(theta) * radius
        ];
      }
    }

    const tx = gx + localOffset[0];
    const ty = gy + localOffset[1];
    const tz = gz + localOffset[2];

    gsap.killTweensOf(camera.position);
    if (orbitRef.current) gsap.killTweensOf(orbitRef.current.target);

    setIsAnimating(true);
    spaceAudio.playWoosh();

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    });

    // Zoom camera in tight to clicked planet
    tl.to(camera.position, {
      x: tx,
      y: ty + 3.0,
      z: tz + 5.5,
      duration: 1.2,
      ease: 'power2.out'
    }, 0);

    if (orbitRef.current) {
      tl.to(orbitRef.current.target, {
        x: tx,
        y: ty,
        z: tz,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => orbitRef.current.update()
      }, 0);
    }

  }, [selectedNode, focusedGalaxyId, galaxies, orbitRef, isAnimating, setIsAnimating]);

  return null;
}

export default function SpaceCanvas({ 
  portfolioData, 
  controlMode, 
  focusedGalaxyId, 
  selectedNode, 
  onSelectNode, 
  onFocusGalaxy,
  setCameraCoords
}) {
  const orbitRef = useRef();
  const [isAnimating, setIsAnimating] = useState(false);

  // Read camera positions and stream to HUD
  const CameraStreamer = () => {
    const { camera } = useThree();
    useFrame(() => {
      if (setCameraCoords) {
        setCameraCoords([
          Math.round(camera.position.x),
          Math.round(camera.position.y),
          Math.round(camera.position.z)
        ]);
      }
    });
    return null;
  };

  return (
    <Canvas
      camera={{ position: [0, 40, 75], fov: 60, near: 0.1, far: 1000 }}
      gl={{ antialias: true }}
    >
      {/* Background Starfield */}
      <Stars 
        radius={150} 
        depth={60} 
        count={5500} 
        factor={7} 
        saturation={0.5} 
        fade 
        speed={1} 
      />

      {/* Global Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 50, 0]} intensity={0.5} />

      {/* Render 5 galaxies */}
      {portfolioData.galaxies.map((galaxy) => (
        <Galaxy
          key={galaxy.id}
          galaxyData={galaxy}
          onSelectNode={onSelectNode}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          focusedGalaxyId={focusedGalaxyId}
          onFocusGalaxy={onFocusGalaxy}
        />
      ))}

      {/* Active Camera GSAP Transition controller */}
      <CameraController
        focusedGalaxyId={focusedGalaxyId}
        selectedNode={selectedNode}
        galaxies={portfolioData.galaxies}
        orbitRef={orbitRef}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
      />

      {/* Controller inputs */}
      <SpaceControls
        mode={controlMode}
        orbitRef={orbitRef}
        isAnimating={isAnimating}
      />

      {/* HUD Telemetry Streamer */}
      <CameraStreamer />

      {/* Post Processing Bloom & glow effects */}
      <EffectComposer>
        <Bloom 
          intensity={1.2} 
          luminanceThreshold={0.15} 
          luminanceSmoothing={0.9} 
          height={300} 
        />
      </EffectComposer>
    </Canvas>
  );
}
