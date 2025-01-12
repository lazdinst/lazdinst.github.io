import React, { useEffect, useRef } from "react";
import { useJoints } from "../../context";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const JointAnimator: React.FC = () => {
  const { joints } = useJoints();
  const { jointAnimationEnabled } = useSelector(
    (state: RootState) => state.settings
  );

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const time = Date.now() * 0.001;
      Object.keys(joints).forEach((name, index) => {
        joints[name].setJointValue((Math.sin(time + index) * Math.PI) / 4);
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    if (jointAnimationEnabled) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null; // Ensure the reference is cleared
    }

    return () => {
      // Cleanup on unmount
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [joints, jointAnimationEnabled]);

  return null;
};

export default JointAnimator;
