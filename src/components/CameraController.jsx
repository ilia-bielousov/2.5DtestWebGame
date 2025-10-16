import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CAMERA_RADIUS = 10;
const CAMERA_TILT = Math.PI / 4; // 45° fixed tilt
const CAMERA_LERP = 0.12;

function CameraController({ targetRef, angle }) {
  const { camera } = useThree();
  const planarRadius = useMemo(
    () => CAMERA_RADIUS * Math.cos(CAMERA_TILT),
    []
  );
  const height = useMemo(() => CAMERA_RADIUS * Math.sin(CAMERA_TILT), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!targetRef?.current) return;

    // Orbit around the player at a constant radius, constrained to the XZ plane.
    desiredPosition.set(
      targetRef.current.x + planarRadius * Math.cos(angle),
      targetRef.current.y + height,
      targetRef.current.z + planarRadius * Math.sin(angle)
    );

    camera.position.lerp(desiredPosition, CAMERA_LERP);

    lookTarget.copy(targetRef.current);
    camera.lookAt(lookTarget);
  });

  return null;
}

export default CameraController;