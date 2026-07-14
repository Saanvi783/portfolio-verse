import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function CameraRig({ target }) {
  const { camera } = useThree();

  const velocity = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!target) return;

    const desired = new THREE.Vector3(...target);

    const direction = desired.clone().sub(camera.position);

    const distance = direction.length();

    if (distance < 0.05) return;

    direction.normalize();

    // acceleration
    velocity.current.add(direction.multiplyScalar(0.02));

    // damping
    velocity.current.multiplyScalar(0.94);

    // move
    camera.position.add(velocity.current);

    // look ahead
    camera.lookAt(desired);
  });

  return null;
}