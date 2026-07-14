import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function SpaceDust() {
  const { camera } = useThree();
  const points = useRef();

  const particles = useMemo(() => {
    const arr = new Float32Array(600 * 3);

    for (let i = 0; i < 600; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 2] = -Math.random() * 80;
    }

    return arr;
  }, []);

  useFrame((_, delta) => {
    const pos = points.current.geometry.attributes.position.array;

    for (let i = 0; i < 600; i++) {
      pos[i * 3 + 2] += delta * 20;

      if (pos[i * 3 + 2] > 5) {
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
        pos[i * 3 + 2] = -80;
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true;

    points.current.position.copy(camera.position);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={600}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffffff"
        size={0.05}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
}