import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { StatsGl } from '@react-three/drei';
import * as THREE from 'three';
import Player from './components/Player.jsx';
import Obstacle from './components/Obstacle.jsx';
import CameraController from './components/CameraController.jsx';

const obstacleData = [
  { position: [0, 0.5, -5], size: [2, 1, 2], color: '#ef4444' },
  { position: [-4, 0.5, 2], size: [1.5, 1, 1.5], color: '#22c55e' },
  { position: [5, 0.5, 4], size: [3, 1, 1], color: '#3b82f6' },
  { position: [2, 0.5, 6], size: [1, 1, 3], color: '#f97316' },
];

const PLAYER_HEIGHT = 0.5;
const INITIAL_CAMERA_ANGLE = Math.PI / 4;
const ROTATION_SPEED = 0.008;

function GameScene({ onPlayerMove = () => {} }) {
  const playerRef = useRef();
  const targetRef = useRef(new THREE.Vector3(0, PLAYER_HEIGHT, 0));
  const [targetPosition, setTargetPosition] = useState(
    () => new THREE.Vector3(0, PLAYER_HEIGHT, 0)
  );
  const [cameraAngle, setCameraAngle] = useState(INITIAL_CAMERA_ANGLE);
  const rotationState = useRef({
    active: false,
    startX: 0,
    startAngle: INITIAL_CAMERA_ANGLE,
  });

  const obstacles = useMemo(() => obstacleData, []);

  useEffect(() => {
    const releaseRotation = () => {
      rotationState.current.active = false;
    };
    window.addEventListener('pointerup', releaseRotation);
    return () => {
      window.removeEventListener('pointerup', releaseRotation);
    };
  }, []);

  const handleDestinationSelect = useCallback((point) => {
    const destination = point.clone();
    destination.y = PLAYER_HEIGHT;
    setTargetPosition(destination);
  }, []);

  const handleCanvasPointerDown = useCallback(
    (event) => {
      if (event.nativeEvent.button !== 2) {
        return;
      }
      rotationState.current.active = true;
      rotationState.current.startX = event.nativeEvent.clientX;
      rotationState.current.startAngle = cameraAngle;
    },
    [cameraAngle]
  );

  const handleCanvasPointerMove = useCallback((event) => {
    if (!rotationState.current.active) return;
    const deltaX = event.nativeEvent.clientX - rotationState.current.startX;
    setCameraAngle(rotationState.current.startAngle + deltaX * ROTATION_SPEED);
  }, []);

  const handleCanvasPointerUp = useCallback((event) => {
    if (event.nativeEvent.button === 2) {
      rotationState.current.active = false;
    }
  }, []);

  const handleCanvasPointerLeave = useCallback(() => {
    rotationState.current.active = false;
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [10, 10, 10], fov: 50 }}
      style={{ background: '#0f172a' }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onPointerOut={handleCanvasPointerLeave}
      onCreated={({ gl }) => {
        // Prevent the default context menu when orbiting with the right mouse button.
        gl.domElement.oncontextmenu = (event) => event.preventDefault();
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Ground onSelect={handleDestinationSelect} />

        {obstacles.map((props, index) => (
          <Obstacle key={`obstacle-${index}`} {...props} />
        ))}

        <Player
          ref={playerRef}
          obstacles={obstacles}
          targetRef={targetRef}
          targetPosition={targetPosition}
          onMove={(position) => {
            targetRef.current.copy(position);
            onPlayerMove(position);
          }}
        />

        <CameraController targetRef={targetRef} angle={cameraAngle} />

        <StatsGl />
      </Suspense>
    </Canvas>
  );
}

export default GameScene;

function Ground({ onSelect }) {
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersectionPoint = useMemo(() => new THREE.Vector3(), []);

  const handlePointerDown = useCallback(
    (event) => {
      if (event.nativeEvent.button !== 0) return;

      // Translate the mouse position into normalized device coordinates for the raycaster.
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y =
        -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // Cast the ray against the ground plane to find the destination click position.
      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        onSelect(intersectionPoint.clone());
      }
    },
    [camera, gl, onSelect, plane, pointer, raycaster, intersectionPoint]
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={handlePointerDown}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
  );
}