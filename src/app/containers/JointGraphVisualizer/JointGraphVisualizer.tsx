import React, { useState, useEffect } from "react";
import { useJoints } from "../../context";

const JointGraphVisualizer: React.FC = () => {
  const { jointValues, jointBuffer } = useJoints();
  const [joints, setJoints] = useState(jointValues);
  const [graphData, setGraphData] = useState({});

  useEffect(() => {
    setJoints(jointValues);
    setGraphData((prevData) => {
      return { ...prevData, ...jointValues };
    });
  }, [jointValues]);

  console.log(joints);
  return (
    <div>
      <pre>{JSON.stringify(joints, null, 2)}</pre>
      <pre>{JSON.stringify(graphData, null, 2)}</pre>
      <pre>{JSON.stringify(jointBuffer, null, 2)}</pre>
    </div>
  );
};

export default JointGraphVisualizer;
