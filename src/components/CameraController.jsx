import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CAMERA_LERP_STRENGTH = 5;

function CameraController({ targetRef, angle, tilt, radius }) {
  const { camera } = useThree();
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!targetRef?.current) return;

    const planarRadius = radius * Math.cos(tilt);
    const height = radius * Math.sin(tilt);

    // Orbit around the player at a constant radius, constrained to the XZ plane with a clamped tilt.
    desiredPosition.set(
      targetRef.current.x + planarRadius * Math.cos(angle),
      targetRef.current.y + height,
      targetRef.current.z + planarRadius * Math.sin(angle)
    );

    // Exponential smoothing keeps the follow motion responsive without abrupt acceleration.
    const lerpFactor = 1 - Math.exp(-CAMERA_LERP_STRENGTH * delta);
    camera.position.lerp(desiredPosition, lerpFactor);

    lookTarget.lerp(targetRef.current, lerpFactor);
    camera.lookAt(lookTarget);
  });

  return null;
}

export default CameraController;