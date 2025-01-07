import React, { useEffect } from "react";
import { useJoints } from "../../context";

const JointAnimator: React.FC = () => {
  const { joints } = useJoints();

  useEffect(() => {
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      Object.keys(joints).forEach((name, index) => {
        joints[name].setJointValue((Math.sin(time + index) * Math.PI) / 4);
      });
    };

    animate();
  }, [joints]);

  return null;
};

export default JointAnimator;
