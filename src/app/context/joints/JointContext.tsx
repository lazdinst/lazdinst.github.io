import React, { createContext, useState } from "react";
import { URDFJoint } from "../../../definitions";
import { JointContextProps, JointProviderProps } from "./joints.types";

const JointContext = createContext<JointContextProps | undefined>(undefined);

export const JointProvider: React.FC<JointProviderProps> = ({ children }) => {
  const [joints, setJointsState] = useState<{ [key: string]: URDFJoint }>({});

  const setJoints = (newJoints: { [key: string]: URDFJoint }) => {
    setJointsState(newJoints);
  };

  const updateJoint = (name: string, value: number) => {
    const joint = joints[name];
    if (joint) {
      joint.setJointValue(value);
    }
  };

  return (
    <JointContext.Provider value={{ joints, setJoints, updateJoint }}>
      {children}
    </JointContext.Provider>
  );
};

export default JointContext;
