const Lighting = () => {
  return (
    <>
      <hemisphereLight args={["#6d7380", "#161616", 0.32]} />
      <ambientLight intensity={0.18} color="#d8dbe0" />
      <directionalLight
        intensity={1.05}
        position={[5, 10, 7.5]}
        color="#fff6ea"
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
