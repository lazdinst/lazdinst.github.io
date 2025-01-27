import React, { useState, useCallback, useEffect } from "react";
import { URDFJoint } from "urdf-loader";
import { JointProviderProps, JointValuesType } from "./joints.types";
import JointContext from "./JointContext";
import { useJointValues, useJointBuffer } from "./hooks";

const JointProvider: React.FC<JointProviderProps> = ({ children }) => {
  const [joints, setJointsState] = useState<{ [key: string]: URDFJoint }>({});
  const { jointBuffer, updateBuffer } = useJointBuffer();

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
  useEffect(() => {
    const time = Date.now();
    updateBuffer(jointValues, time);
  }, [jointValues, updateBuffer]);

  return (
    <JointContext.Provider
      value={{
        joints,
        updateJoint,
        updateJoints,
        jointValues,
        getJointValues,
        jointBuffer,
      }}
    >
      {children}
    </JointContext.Provider>
  );
};

export default JointProvider;
