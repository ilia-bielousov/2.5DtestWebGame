# 2.5D RPG Prototype

A minimal 2.5D RPG sandbox built with React, Vite, Three.js (via react-three-fiber), and @react-three/drei. The scene showcases a simple player controller with WASD movement, collision detection, and a trailing cinematic camera.

## Getting Started

```bash
npm install
npm run dev
```

Open the development server URL printed in the terminal (usually http://localhost:5173) to explore the scene.

## Features

- Tilted 2.5D perspective with a smooth-follow camera.
- Player-controlled cube that moves on the XZ plane via WASD input.
- Axis-aligned collision detection against configurable box obstacles.
- Ground plane, multiple obstacles, real-time lighting, and optional statistics overlay.
- Heads-up display overlay with the player's current X/Z coordinates.
