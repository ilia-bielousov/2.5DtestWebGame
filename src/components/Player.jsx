import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PLAYER_SPEED = 6; // units per second
const PLAYER_HALF_SIZE = 0.5;
const STOP_DISTANCE = 0.1;

const Player = forwardRef(function Player(
  { obstacles, targetRef, targetPosition, onMove },
  ref
) {
  const meshRef = useRef();
  const position = useRef(new THREE.Vector3(0, PLAYER_HALF_SIZE, 0));
  const desired = useRef(new THREE.Vector3(0, PLAYER_HALF_SIZE, 0));
  const toTarget = useMemo(() => new THREE.Vector3(), []);
  const step = useMemo(() => new THREE.Vector3(), []);
  const lastDirection = useRef(new THREE.Vector3(0, 0, 1));

  useImperativeHandle(ref, () => ({
    get position() {
      return position.current.clone();
    },
  }));

  useEffect(() => {
    desired.current.copy(targetPosition ?? position.current);
    desired.current.y = PLAYER_HALF_SIZE;
  }, [targetPosition]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(position.current);
    meshRef.current.rotation.set(0, 0, 0);

    if (targetRef?.current) {
      targetRef.current.copy(position.current);
    }
    if (onMove) {
      onMove(position.current.clone());
    }
  }, []);

  const isColliding = (x, z) => {
    return obstacles.some(({ position: obsPos, size }) => {
      const [ox, , oz] = obsPos;
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
    toTarget.subVectors(desired.current, position.current);
    const distance = Math.hypot(toTarget.x, toTarget.z);

    if (distance <= STOP_DISTANCE) {
      // Snap to the goal when close enough so the player fully reaches the target.
      if (distance > 0) {
        const prevX = position.current.x;
        const prevZ = position.current.z;
        position.current.x = desired.current.x;
        position.current.z = desired.current.z;
        meshRef.current.position.copy(position.current);

        if (
          (prevX !== position.current.x || prevZ !== position.current.z) &&
          targetRef?.current
        ) {
          targetRef.current.copy(position.current);
        }
        if (onMove && (prevX !== position.current.x || prevZ !== position.current.z)) {
          onMove(position.current.clone());
        }
      }
      return;
    }

    toTarget.set(toTarget.x / distance, 0, toTarget.z / distance);
    lastDirection.current.copy(toTarget);

    const moveDistance = Math.min(PLAYER_SPEED * delta, distance);
    step.copy(toTarget).multiplyScalar(moveDistance);

    const prevX = position.current.x;
    const prevZ = position.current.z;
    let nextX = position.current.x + step.x;
    let nextZ = position.current.z + step.z;

    if (isColliding(nextX, position.current.z)) {
      nextX = position.current.x;
    }
    if (isColliding(nextX, nextZ)) {
      nextZ = position.current.z;
    }

    position.current.set(nextX, PLAYER_HALF_SIZE, nextZ);
    meshRef.current.position.copy(position.current);

    const facingAngle = Math.atan2(lastDirection.current.x, lastDirection.current.z);
    meshRef.current.rotation.y = facingAngle;

    const moved = prevX !== position.current.x || prevZ !== position.current.z;

    if (moved && targetRef?.current) {
      targetRef.current.copy(position.current);
    }
    if (onMove && moved) {
      onMove(position.current.clone());
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