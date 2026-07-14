import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function ShootingStars() {
  const starRef = useRef();

  const data = useMemo(() => ({
    position: new THREE.Vector3(80, 40, -80),
    velocity: new THREE.Vector3(),
    active: false,
    timer: 1
  }), []);

  useFrame((state, delta) => {

    data.timer -= delta;

    // Spawn
    if (!data.active && data.timer <= 0) {

      data.active = true;

      data.position.set(
        (Math.random() - 0.5) * 180,
        20 + Math.random() * 60,
        -80
      );

      data.velocity.set(
        -140,
        -25,
        80
      );

      data.timer = 2;
    }

    if (data.active) {

      data.position.addScaledVector(
        data.velocity,
        delta
      );

      starRef.current.position.copy(data.position);

      if (data.position.x < -120) {
        data.active = false;
      }

    }

  });

  return (
  <group ref={starRef} visible={data.active}>
    <mesh>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>

    <mesh scale={4}>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshBasicMaterial
        color="#87ceff"
        transparent
        opacity={0.18}
      />
    </mesh>
  </group>
);
}