import PropTypes from 'prop-types';

function Obstacle({ position, size, color }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

Obstacle.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  size: PropTypes.arrayOf(PropTypes.number).isRequired,
  color: PropTypes.string.isRequired,
};

export default Obstacle;