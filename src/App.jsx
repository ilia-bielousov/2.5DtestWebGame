import { useState } from 'react';
import GameScene from './GameScene.jsx';

function App() {
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 0 });

  return (
    <div className="app-container">
      <GameScene
        onPlayerMove={(position) => {
          setPlayerCoords({
            x: position.x,
            z: position.z,
          });
        }}
      />
      <div className="hud">
        <h2>Player Coordinates</h2>
        <p>
          X: {playerCoords.x.toFixed(2)} | Z: {playerCoords.z.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default App;