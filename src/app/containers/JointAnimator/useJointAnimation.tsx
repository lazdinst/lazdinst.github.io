import { useEffect, useRef } from "react";

type AnimationType = "sine" | "cosine" | "linear" | "custom";

export const useJointAnimation = (
  joints: Record<string, { setJointValue: (value: number) => void }>,
  jointAnimationEnabled: boolean,
  animationType: AnimationType
) => {
  const animationRef = useRef<number | null>(null);

  const getJointAnimation = (
    type: AnimationType,
    time: number,
    index: number
  ) => {
    switch (type) {
      case "sine":
        return (Math.sin(time + index) * Math.PI) / 4;
      case "cosine":
        return (Math.cos(time + index) * Math.PI) / 4;
      case "linear":
        return (Math.abs((time % 2) - 1) * 2 - 1) * Math.PI; // Oscillates back and forth
      case "custom":
        return ((Math.sin(time) + Math.cos(time + index)) * Math.PI) / 6;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const animate = () => {
      const time = Date.now() * 0.001; // Time in seconds
      Object.keys(joints).forEach((name, index) => {
        const value = getJointAnimation(animationType, time, index);
        joints[name].setJointValue(value);
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    if (jointAnimationEnabled) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null; // Clear the reference
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [joints, jointAnimationEnabled, animationType]);
};
