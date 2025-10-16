import { Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
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

function GameScene({ onPlayerMove = () => {} }) {
  const playerRef = useRef();
  const targetRef = useRef(new THREE.Vector3(0, 0.5, 0));

  const obstacles = useMemo(() => obstacleData, []);

  return (
    <Canvas
      shadows
      camera={{ position: [10, 10, 10], fov: 50 }}
      style={{ background: '#0f172a' }}
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

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>

        {obstacles.map((props, index) => (
          <Obstacle key={`obstacle-${index}`} {...props} />
        ))}

        <Player
          ref={playerRef}
          obstacles={obstacles}
          targetRef={targetRef}
          onMove={(position) => {
            targetRef.current.copy(position);
            onPlayerMove(position);
          }}
        />

        <CameraController targetRef={targetRef} />

        <StatsGl />
      </Suspense>
    </Canvas>
  );
}

export default GameScene;