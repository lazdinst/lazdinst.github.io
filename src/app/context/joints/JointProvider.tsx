import React, { useState, useCallback } from "react";
import { URDFJoint } from "../../../definitions";
import { JointProviderProps } from "./joints.types";
import JointContext from "./JointContext";

const JointProvider: React.FC<JointProviderProps> = ({ children }) => {
  const [joints, setJointsState] = useState<{ [key: string]: URDFJoint }>({});

  const updateJoint = (name: string, value: number) => {
    const joint = joints[name];
    if (joint) {
      joint.setJointValue(value);
    }
  };

  const updateJoints = useCallback(
    (newJoints: { [key: string]: URDFJoint }) => {
      setJointsState((prevJoints) => ({
        ...prevJoints,
        ...newJoints,
      }));
    },
    []
  );

  const getJointValues = () => {
    return Object.keys(joints).reduce((values, name) => {
      const joint = joints[name];
      values[name] = joint.angle;
      return values;
    }, {} as { [key: string]: number });
  };

  return (
    <JointContext.Provider
      value={{ joints, updateJoint, updateJoints, getJointValues }}
    >
      {children}
    </JointContext.Provider>
  );
};

export default JointProvider;
