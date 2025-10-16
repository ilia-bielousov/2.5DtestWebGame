import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { StatsGl } from '@react-three/drei';
import * as THREE from 'three';
import Player from './components/Player.jsx';
import CameraController from './components/CameraController.jsx';

const PLAYER_HEIGHT = 0.5;
const INITIAL_CAMERA_YAW = Math.PI / 4;
const INITIAL_CAMERA_TILT = Math.PI / 4;
const CAMERA_TILT_MIN = THREE.MathUtils.degToRad(25);
const CAMERA_TILT_MAX = THREE.MathUtils.degToRad(70);
const ROTATION_SPEED = 0.008;
const TILT_SPEED = 0.006;
const INITIAL_RADIUS = 10;
const MIN_RADIUS = 6;
const MAX_RADIUS = 18;

function GameScene({ onPlayerMove = () => {} }) {
  const playerRef = useRef();
  const targetRef = useRef(new THREE.Vector3(0, PLAYER_HEIGHT, 0));
  const [targetPosition, setTargetPosition] = useState(
    () => new THREE.Vector3(0, PLAYER_HEIGHT, 0)
  );
  const [cameraAngle, setCameraAngle] = useState(INITIAL_CAMERA_YAW);
  const [cameraTilt, setCameraTilt] = useState(INITIAL_CAMERA_TILT);
  const [cameraRadius, setCameraRadius] = useState(INITIAL_RADIUS);
  const emptyObstacles = useMemo(() => [], []);
  const rotationState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startAngle: INITIAL_CAMERA_YAW,
    startTilt: INITIAL_CAMERA_TILT,
  });

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
      rotationState.current.startY = event.nativeEvent.clientY;
      rotationState.current.startAngle = cameraAngle;
      rotationState.current.startTilt = cameraTilt;
    },
    [cameraAngle, cameraTilt]
  );

  const handleCanvasPointerMove = useCallback((event) => {
    if (!rotationState.current.active) return;
    const deltaX = event.nativeEvent.clientX - rotationState.current.startX;
    const deltaY = event.nativeEvent.clientY - rotationState.current.startY;
    // Horizontal drags yaw the camera; vertical drags adjust the tilt within a safe range.
    setCameraAngle(rotationState.current.startAngle + deltaX * ROTATION_SPEED);
    setCameraTilt(
      THREE.MathUtils.clamp(
        rotationState.current.startTilt + deltaY * TILT_SPEED,
        CAMERA_TILT_MIN,
        CAMERA_TILT_MAX
      )
    );
  }, []);

  const handleCanvasPointerUp = useCallback((event) => {
    if (event.nativeEvent.button === 2) {
      rotationState.current.active = false;
    }
  }, []);

  const handleCanvasPointerLeave = useCallback(() => {
    rotationState.current.active = false;
  }, []);

  const handleCanvasWheel = useCallback((event) => {
    event.preventDefault();
    // Mouse wheel zooms the orbital radius while keeping it within comfortable limits.
    setCameraRadius((current) =>
      THREE.MathUtils.clamp(
        current + event.deltaY * 0.01,
        MIN_RADIUS,
        MAX_RADIUS
      )
    );
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
      onWheel={handleCanvasWheel}
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

        <Player
          ref={playerRef}
          obstacles={emptyObstacles}
          targetRef={targetRef}
          targetPosition={targetPosition}
          onMove={(position) => {
            targetRef.current.copy(position);
            onPlayerMove(position);
          }}
        />

        <CameraController
          targetRef={targetRef}
          angle={cameraAngle}
          tilt={cameraTilt}
          radius={cameraRadius}
        />

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