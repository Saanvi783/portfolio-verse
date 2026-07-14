import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function SpaceControls({
  mode,
  orbitRef,
  isAnimating,
  galaxies
}) {

  const { camera, gl } = useThree();

  // ---------- WASD ----------
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false,
    shift: false
  });

  // ---------- Mouse Look ----------
  const mouse = useRef({
    isDown: false,
    x: 0,
    y: 0
  });

  const euler = useRef(
    new THREE.Euler(0, 0, 0, "YXZ")
  );

  // ---------- Auto Fly ----------
  const currentGalaxy = useRef(0);
  const waitTimer = useRef(0);

  useEffect(() => {

    const down = (e) => {

      if (mode !== "fly") return;

      const k = e.key.toLowerCase();

      if (k === "w") keys.current.w = true;
      if (k === "a") keys.current.a = true;
      if (k === "s") keys.current.s = true;
      if (k === "d") keys.current.d = true;
      if (k === "q") keys.current.q = true;
      if (k === "e") keys.current.e = true;

      keys.current.shift = e.shiftKey;

    };

    const up = (e) => {

      const k = e.key.toLowerCase();

      if (k === "w") keys.current.w = false;
      if (k === "a") keys.current.a = false;
      if (k === "s") keys.current.s = false;
      if (k === "d") keys.current.d = false;
      if (k === "q") keys.current.q = false;
      if (k === "e") keys.current.e = false;

      keys.current.shift = false;

    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {

      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);

    };

  }, [mode]);

  useEffect(() => {

    if (mode !== "fly") return;

    euler.current.setFromQuaternion(camera.quaternion);

    const down = (e) => {

      mouse.current.isDown = true;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

    };

    const move = (e) => {

      if (!mouse.current.isDown) return;

      const dx = e.clientX - mouse.current.x;
      const dy = e.clientY - mouse.current.y;

      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      euler.current.y -= dx * 0.0025;
      euler.current.x -= dy * 0.0025;

      euler.current.x = Math.max(
        -Math.PI / 2.1,
        Math.min(Math.PI / 2.1, euler.current.x)
      );

      camera.quaternion.setFromEuler(euler.current);

    };

    const up = () => {

      mouse.current.isDown = false;

    };

    gl.domElement.addEventListener("pointerdown", down);
    gl.domElement.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {

      gl.domElement.removeEventListener("pointerdown", down);
      gl.domElement.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);

    };

  }, [mode]);
  
  // =========================
// STARFORGE AUTO FLY
// =========================
useFrame((state, delta) => {

  if (mode !== "fly" || isAnimating) return;

  waitTimer.current += delta;

  const galaxy = galaxies[currentGalaxy.current];

  if (!galaxy) return;

  const [gx, gy, gz] = galaxy.coordinates;

  const destination = new THREE.Vector3(
    gx,
    gy + 12,
    gz + 18
  );

  camera.position.lerp(destination, delta * 0.45);

  camera.lookAt(gx, gy, gz);

  if (
    camera.position.distanceTo(destination) < 1.5 &&
    waitTimer.current > 3
  ) {
    waitTimer.current = 0;

    currentGalaxy.current =
      (currentGalaxy.current + 1) %
      galaxies.length;
  }

});
  
  // Render OrbitControls only in Orbit Mode
  return mode !== 'fly' ? (
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
