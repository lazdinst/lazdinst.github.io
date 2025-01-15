import React from "react";

const Lighting: React.FC = () => {
  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.5} />

      {/* Directional Light */}
      <directionalLight
        intensity={0.5}
        position={[5, 10, 7.5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
      />
    </>
  );
};

export default Lighting;
