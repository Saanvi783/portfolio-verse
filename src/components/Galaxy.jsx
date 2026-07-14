import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import Planet from "./Planet";

export default function Galaxy({
    galaxyData,
    onSelectNode,
    selectedNodeId,
    focusedGalaxyId,
    onFocusGalaxy
}) {

    const groupRef = useRef();
    const particlesRef = useRef();
    const haloRef = useRef();

    const [hovered, setHovered] = useState(false);

    const isFocused =
        focusedGalaxyId === galaxyData.id;

    // =====================================================
    // Procedural Galaxy Generator
    // =====================================================

    const {
        positions,
        colors,
        sizes
    } = useMemo(() => {

        const count =
            galaxyData.id === "projects"
                 ? 12000
                 : galaxyData.id === "skills"
                 ? 9000
                 : galaxyData.id === "certifications"
                 ? 7000
                 : galaxyData.id === "achievements"
                 ? 6000
                 : 8000;

        const pos =
            new Float32Array(count * 3);

        const cols =
            new Float32Array(count * 3);

        const particleSizes =
            new Float32Array(count);

        const inside =
            new THREE.Color("#ffffff");

        const outside =
            new THREE.Color(galaxyData.color);

        const branches = 5;

        for (let i = 0; i < count; i++) {

            const i3 = i * 3;

            const maxRadius =
                galaxyData.id === "projects"
                    ? 18
                    : galaxyData.id === "skills"
                    ? 14
                    : galaxyData.id === "certifications"
                    ? 16
                    : galaxyData.id === "achievements"
                    ? 11
                    : 13;

            const radius =
                Math.pow(Math.random(), 3.0) * maxRadius;

            const branch =
                i % branches;

            const branchAngle =
                (branch / branches) *
                Math.PI *
                2;

            const spin =
                radius *
                (
                    galaxyData.id === "projects"
                        ? 2.8
                        : galaxyData.id === "skills"
                        ? 1.8
                        : galaxyData.id === "certifications"
                        ? 2.4
                        : galaxyData.id === "achievements"
                        ? 1.2
                        : 2.0
                );

            const randomX =
                Math.pow(Math.random(), 3) *
                (Math.random() < 0.5 ? -1 : 1) *
                radius *
                0.15;

            const randomY =
                Math.pow(Math.random(), 3) *
                (Math.random() < 0.5 ? -1 : 1) *
                radius *
                0.05;

            const randomZ =
                Math.pow(Math.random(), 3) *
                (Math.random() < 0.5 ? -1 : 1) *
                radius *
                0.15;

            pos[i3] =
                Math.cos(branchAngle + spin) *
                    radius +
                randomX;

            pos[i3 + 1] = randomY;

            pos[i3 + 2] =
                Math.sin(branchAngle + spin) *
                    radius +
                randomZ;

            const mixed =
                inside.clone();

            mixed.lerp(
                outside,
                Math.min(radius / maxRadius, 1)
            );

            cols[i3] = mixed.r;
            cols[i3 + 1] = mixed.g;
            cols[i3 + 2] = mixed.b;

            particleSizes[i] =
                Math.random() * 0.08 + 0.03;
        }

        return {
            positions: pos,
            colors: cols,
            sizes: particleSizes
        };

    }, [galaxyData.color]);

    // =====================================================
    // Animation
    // =====================================================

    useFrame((state, delta) => {

        if (groupRef.current) {

            groupRef.current.rotation.y +=
                delta * 0.03;

        }

        if (particlesRef.current) {

            particlesRef.current.rotation.y +=
                delta * 0.08;

            particlesRef.current.rotation.z +=
                delta * 0.01;
            
            particlesRef.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.15) * 0.015;

            particlesRef.current.scale.setScalar(
                1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.01
            );

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
      {/* ====================================================== */}
{/* PROCEDURAL GALAXY */}
{/* ====================================================== */}

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
        size={0.09}
        vertexColors
        transparent
        opacity={0.82}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
    />

</points>



{/* ======================= CORE ======================= */}

<mesh>

    <sphereGeometry args={[1.6, 32, 32]} />

    <meshBasicMaterial color="#ffffff" />

</mesh>


<mesh>

    <sphereGeometry args={[2.4, 32, 32]} />

    <meshBasicMaterial
        color={galaxyData.color}
        transparent
        opacity={0.05}
    />

</mesh>


{/* ======================= LIGHT ======================= */}

<pointLight
    color={galaxyData.color}
    intensity={4}
    distance={60}
    decay={2}
/>


{/* ======================= TITLE ======================= */}

{!isFocused && (

<Html
    center
    distanceFactor={35}
    position={[0,4,0]}
>

<div

onClick={handleGalaxyClick}

onPointerOver={() => setHovered(true)}

onPointerOut={() => setHovered(false)}

style={{

color:"#fff",

background:"rgba(2,2,15,.75)",

padding:"8px 16px",

borderRadius:"10px",

border:`1px solid ${galaxyData.color}`,

boxShadow:`0 0 30px ${galaxyData.color}`,

fontWeight:"bold",

letterSpacing:"2px",

cursor:"pointer",

transform:hovered
?"scale(1.1)"
:"scale(1)",

transition:"all .3s",

opacity:hovered
?1
:.8

}}

>

🌌 {galaxyData.name.toUpperCase()}

</div>

</Html>

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
          size={star.size || 0.8}
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
            size={star.size || 0.6}
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
