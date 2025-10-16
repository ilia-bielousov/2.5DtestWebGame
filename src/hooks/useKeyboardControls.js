import { useEffect, useRef } from 'react';

const CONTROL_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];

function useKeyboardControls() {
  const keysRef = useRef({});

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (CONTROL_KEYS.includes(event.code)) {
        keysRef.current[event.code] = true;
      }
    };

    const handleKeyUp = (event) => {
      if (CONTROL_KEYS.includes(event.code)) {
        keysRef.current[event.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keysRef.current;
}

export default useKeyboardControls;