import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';

export default function Galaxy({ 
  galaxyData, 
  onSelectNode, 
  selectedNodeId, 
  focusedGalaxyId, 
  onFocusGalaxy 
}) {
  const groupRef = useRef();
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const isFocused = focusedGalaxyId === galaxyData.id;
  
  // 1. Generate Spiral Particle Background for the Galaxy
  const { positions, colors } = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const baseColor = new THREE.Color(galaxyData.color);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // 2 spiral arms
      const arm = i % 2;
      const angle = (i / count) * Math.PI * 8 + (arm * Math.PI);
      const radius = Math.pow(Math.random(), 2.0) * 15; // Concentrated in center
      
      const thickness = 1.2;
      const randomX = (Math.random() - 0.5) * thickness;
      const randomY = (Math.random() - 0.5) * thickness * 0.4; // Flatter galaxy
      const randomZ = (Math.random() - 0.5) * thickness;
      
      pos[i3] = Math.cos(angle) * radius + randomX;
      pos[i3 + 1] = randomY;
      pos[i3 + 2] = Math.sin(angle) * radius + randomZ;
      
      // Color gradient: hot white core to deep theme color to dark space
      const mixedColor = new THREE.Color('#ffffff').clone();
      if (radius < 3) {
        mixedColor.lerp(baseColor, radius / 3);
      } else {
        mixedColor.copy(baseColor).lerp(new THREE.Color('#010108'), (radius - 3) / 12);
      }
      
      cols[i3] = mixedColor.r;
      cols[i3 + 1] = mixedColor.g;
      cols[i3 + 2] = mixedColor.b;
    }
    return { positions: pos, colors: cols };
  }, [galaxyData.color]);
  
  // Rotate the entire galaxy slowly
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.04 * delta;
    }
    if (particlesRef.current) {
      // Let the dust rotate slightly faster for dynamic depth
      particlesRef.current.rotation.y += 0.01 * delta;
    }
  });

  const handleGalaxyClick = (e) => {
    if (!isFocused && onFocusGalaxy) {
      e.stopPropagation();
      onFocusGalaxy(galaxyData.id);
    }
  };

  // 2. Pre-calculate nodes for Skills Constellation
  const skillsNodes = useMemo(() => {
    if (galaxyData.id !== 'skills') return [];
    const nodes = [];
    const connections = [];
    
    // Spread skill constellations around the center of Skills Galaxy
    galaxyData.constellations.forEach((c, idx) => {
      const angle = (idx / galaxyData.constellations.length) * Math.PI * 2;
      const radius = 9;
      // Center coordinates for this category
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;
      const cy = (idx % 2 === 0 ? 1 : -1) * 1.5;
      
      const categoryId = `cat_${c.category.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Add category parent star
      nodes.push({
        id: categoryId,
        name: c.category,
        type: 'Skill Constellation Center',
        color: c.color,
        size: 0.9,
        coordinates: [cx, cy, cz],
        details: {
          "Category": c.category,
          "Skills Included": c.items.join(', ')
        }
      });
      
      // Place individual skill stars in a circle around the category center
      c.items.forEach((skill, sIdx) => {
        const sAngle = (sIdx / c.items.length) * Math.PI * 2;
        const sRadius = 2.4;
        const sx = cx + Math.cos(sAngle) * sRadius;
        const sz = cz + Math.sin(sAngle) * sRadius;
        const sy = cy + (sIdx % 2 === 0 ? 0.4 : -0.4);
        
        const skillId = `skill_${skill.toLowerCase().replace(/\s+/g, '_')}`;
        
        nodes.push({
          id: skillId,
          name: skill,
          type: 'Skill Node',
          color: '#ffffff',
          size: 0.4,
          coordinates: [sx, sy, sz],
          details: {
            "Skill Name": skill,
            "Category Group": c.category,
            "Status": "Proficient",
            "Confidence Level": `${Math.floor(80 + Math.random() * 18)}%`
          }
        });
        
        // Save connection lines
        connections.push([
          [cx, cy, cz],
          [sx, sy, sz]
        ]);
      });
    });
    return { nodes, connections };
  }, [galaxyData]);

  // 3. Pre-calculate nodes for Certifications Galaxy
  const certsNodes = useMemo(() => {
    if (galaxyData.id !== 'certifications') return [];
    
    // Spread 21 certifications in a spherical shell pattern around center
    return galaxyData.stars.map((cert, idx) => {
      // Fibonacci sphere mapping for even distribution
      const phi = Math.acos(-1 + (2 * idx) / galaxyData.stars.length);
      const theta = Math.sqrt(galaxyData.stars.length * Math.PI) * phi;
      const radius = 8 + (idx % 2 === 0 ? 1 : -1) * 0.8;
      
      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.cos(phi) * radius * 0.7; // slightly flatter
      const z = Math.sin(phi) * Math.sin(theta) * radius;
      
      return {
        id: cert.id,
        name: cert.name,
        type: cert.issuer.includes('Virtual') ? 'Professional Experience Program' : 'Professional Certificate',
        color: '#00e5ff',
        size: 0.6,
        coordinates: [x, y, z],
        details: {
          "Credential Name": cert.name,
          "Issuer": cert.issuer,
          "Date Earned": cert.date,
          "Skills Gained": cert.skills
        }
      };
    });
  }, [galaxyData]);

  // 4. Pre-calculate nodes for Projects Galaxy
  const projectsNodes = useMemo(() => {
    if (galaxyData.id !== 'projects') return [];
    
    // Position the 8 projects at different coordinates in Galaxy 2
    const positions = [
      [0, 0, 0],       // Zenith AI
      [7, 1.5, -7],    // StarForge
      [-8, -1, 6],     // FreshTrack
      [8, -2, 6],      // Spidey Sense
      [-7, 2, -7],     // Super Mario
      [11, 0, 0],      // Resume Screener
      [-11, -1.5, -2], // Divyastra
      [3, -3, 11]      // Brahmastra
    ];
    
    return galaxyData.stars.map((proj, idx) => {
      const coord = positions[idx] || [0, 0, 0];
      
      // Determine technologies lists
      const techList = proj.details["Tech Stack"].split(', ');
      
      // Orbiting planets representing tech stack
      const orbits = techList.map((tech, tIdx) => {
        return {
          id: `${proj.id}_tech_${tIdx}`,
          name: tech,
          type: 'Technology Planet',
          color: galaxyData.color,
          size: 0.28,
          orbitRadius: 1.4 + (tIdx * 0.35),
          orbitSpeed: 1.2 - (tIdx * 0.15)
        };
      });

      return {
        ...proj,
        coordinates: coord,
        orbits
      };
    });
  }, [galaxyData]);

  return (
    <group 
      ref={groupRef} 
      position={galaxyData.coordinates}
      onClick={handleGalaxyClick}
    >
      {/* Logarithmic Spiral Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.65}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Floating 3D Title Card when NOT focused on this galaxy */}
      {!isFocused && (
        <Html distanceFactor={35} position={[0, 4, 0]} center>
          <div 
            onClick={handleGalaxyClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            style={{
              color: '#ffffff',
              background: 'rgba(2, 2, 10, 0.85)',
              border: `1px solid ${galaxyData.color}`,
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              fontFamily: 'Share Tech Mono',
              letterSpacing: '2px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: `0 0 15px ${galaxyData.color}`,
              opacity: hovered ? 1.0 : 0.7,
              transform: `scale(${hovered ? 1.1 : 1.0})`,
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            🌌 {galaxyData.name.toUpperCase()}
          </div>
        </Html>
      )}

      {/* Ambient center light for focused galaxy */}
      {isFocused && (
        <pointLight color={galaxyData.color} intensity={3} distance={25} decay={1.5} />
      )}

      {/* GALAXY 1: PERSONAL UNIVERSE */}
      {galaxyData.id === 'personal' && galaxyData.stars.map((star) => (
        <Planet
          key={star.id}
          id={star.id}
          name={star.name}
          type={star.type}
          subTitle={star.subTitle}
          color={star.color || galaxyData.color}
          size={star.size}
          orbitRadius={star.orbitRadius}
          orbitSpeed={star.orbitSpeed}
          coordinates={star.coordinates}
          details={star.details}
          onSelect={onSelectNode}
          selectedId={selectedNodeId}
          isFocused={isFocused}
        />
      ))}

      {/* GALAXY 2: PROJECTS GALAXY (Nested solar systems) */}
      {galaxyData.id === 'projects' && projectsNodes.map((proj) => (
        <group key={proj.id} position={proj.coordinates}>
          {/* Main project star */}
          <Planet
            id={proj.id}
            name={proj.name}
            type={proj.type}
            subTitle={proj.subTitle}
            color={proj.color || galaxyData.color}
            size={proj.size}
            details={proj.details}
            onSelect={onSelectNode}
            selectedId={selectedNodeId}
            isFocused={isFocused}
          />
          {/* Orbiting tech stack planets */}
          {isFocused && proj.orbits.map((orbit) => (
            <Planet
              key={orbit.id}
              id={orbit.id}
              name={orbit.name}
              type={orbit.type}
              color={orbit.color}
              size={orbit.size}
              orbitRadius={orbit.orbitRadius}
              orbitSpeed={orbit.orbitSpeed}
              details={{ "Technology": orbit.name, "Used In": proj.name }}
              onSelect={onSelectNode}
              selectedId={selectedNodeId}
              isFocused={isFocused}
            />
          ))}
        </group>
      ))}

      {/* GALAXY 3: SKILLS GALAXY (Constellations connected by lines) */}
      {galaxyData.id === 'skills' && (
        <>
          {/* Glow Lines connecting parent and child skills */}
          {isFocused && skillsNodes.connections.map((line, idx) => (
            <Line
              key={`line_${idx}`}
              points={line}
              color={galaxyData.color}
              lineWidth={0.5}
              opacity={0.25}
              transparent
            />
          ))}
          {/* Nodes */}
          {skillsNodes.nodes.map((node) => (
            <Planet
              key={node.id}
              id={node.id}
              name={node.name}
              type={node.type}
              color={node.color}
              size={node.size}
              coordinates={node.coordinates}
              details={node.details}
              onSelect={onSelectNode}
              selectedId={selectedNodeId}
              isFocused={isFocused}
            />
          ))}
        </>
      )}

      {/* GALAXY 4: CERTIFICATIONS GALAXY (Spherical shell cloud of planets) */}
      {galaxyData.id === 'certifications' && certsNodes.map((node) => (
        <Planet
          key={node.id}
          id={node.id}
          name={node.name}
          type={node.type}
          color={node.color}
          size={node.size}
          coordinates={node.coordinates}
          details={node.details}
          onSelect={onSelectNode}
          selectedId={selectedNodeId}
          isFocused={isFocused}
        />
      ))}

      {/* GALAXY 5: ACHIEVEMENTS GALAXY (Golden stars) */}
      {galaxyData.id === 'achievements' && galaxyData.stars.map((star, idx) => {
        // Arrange achievements in a small ring around the center
        const angle = (idx / galaxyData.stars.length) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (idx % 2 === 0 ? 0.5 : -0.5);
        
        return (
          <Planet
            key={star.id}
            id={star.id}
            name={star.name}
            type={star.type}
            subTitle={star.subTitle}
            color={star.color || galaxyData.color}
            size={star.size}
            coordinates={[x, y, z]}
            details={star.details}
            onSelect={onSelectNode}
            selectedId={selectedNodeId}
            isFocused={isFocused}
          />
        );
      })}
    </group>
  );
}
