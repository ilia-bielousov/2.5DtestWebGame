import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CAMERA_OFFSET = new THREE.Vector3(10, 10, 10);
const LERP_FACTOR = 0.08;

function CameraController({ targetRef }) {
  const { camera } = useThree();
  const desiredPosition = new THREE.Vector3();

  useFrame(() => {
    if (!targetRef?.current) return;

    desiredPosition.copy(targetRef.current).add(CAMERA_OFFSET);
    camera.position.lerp(desiredPosition, LERP_FACTOR);
    camera.lookAt(targetRef.current);
  });

  return null;
}

export default CameraController;