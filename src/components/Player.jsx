import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useKeyboardControls from '../hooks/useKeyboardControls.js';

const PLAYER_SPEED = 6; // units per second
const PLAYER_HALF_SIZE = 0.5;

const Player = forwardRef(function Player({ obstacles, targetRef, onMove }, ref) {
  const meshRef = useRef();
  const direction = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, PLAYER_HALF_SIZE, 0));
  const keyboard = useKeyboardControls();

  useImperativeHandle(ref, () => ({
    get position() {
      return position.current.clone();
    },
  }));

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(position.current);
    }
    if (targetRef?.current) {
      targetRef.current.copy(position.current);
    }
    if (onMove) {
      onMove(position.current.clone());
    }
  }, []);

  const isColliding = (x, z) => {
    return obstacles.some(({ position: obsPos, size }) => {
      const [ox, oy, oz] = obsPos;
      const [sx, , sz] = size;
      const halfX = sx / 2;
      const halfZ = sz / 2;
      return (
        Math.abs(x - ox) <= PLAYER_HALF_SIZE + halfX &&
        Math.abs(z - oz) <= PLAYER_HALF_SIZE + halfZ
      );
    });
  };

  useFrame((_, delta) => {
    direction.current.set(0, 0, 0);

    if (keyboard['KeyW']) direction.current.z -= 1;
    if (keyboard['KeyS']) direction.current.z += 1;
    if (keyboard['KeyA']) direction.current.x -= 1;
    if (keyboard['KeyD']) direction.current.x += 1;

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();

      const moveDistance = PLAYER_SPEED * delta;

      const targetX = position.current.x + direction.current.x * moveDistance;
      const targetZ = position.current.z + direction.current.z * moveDistance;

      let newX = position.current.x;
      let newZ = position.current.z;

      if (!isColliding(targetX, position.current.z)) {
        newX = targetX;
      }

      if (!isColliding(newX, targetZ)) {
        newZ = targetZ;
      }

      position.current.set(newX, PLAYER_HALF_SIZE, newZ);
      meshRef.current.position.copy(position.current);

      if (targetRef?.current) {
        targetRef.current.copy(position.current);
      }
      if (onMove) {
        onMove(position.current.clone());
      }
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[PLAYER_HALF_SIZE * 2, PLAYER_HALF_SIZE * 2, PLAYER_HALF_SIZE * 2]} />
      <meshStandardMaterial color="#facc15" />
    </mesh>
  );
});

export default Player;