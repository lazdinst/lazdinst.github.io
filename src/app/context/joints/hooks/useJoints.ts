import { useContext } from "react";
import JointContext from "../JointContext";

export const useJoints = () => {
  const context = useContext(JointContext);
  if (!context) {
    throw new Error("useJoints must be used within a JointProvider");
  }
  return context;
};
