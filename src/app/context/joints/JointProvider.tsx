import React, { useState, useCallback } from "react";
import { URDFJoint } from "urdf-loader";
import { JointProviderProps, JointValuesType } from "./joints.types";
import JointContext from "./JointContext";
import { useJointValues } from "./hooks";

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
      values[name] = Number(joint.angle);
      return values;
    }, {} as JointValuesType);
  };

  const jointValues = useJointValues(joints);

  return (
    <JointContext.Provider
      value={{ joints, updateJoint, updateJoints, jointValues, getJointValues }}
    >
      {children}
    </JointContext.Provider>
  );
};

export default JointProvider;
