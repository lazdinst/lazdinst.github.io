import React, { useState, useCallback, useRef, useEffect } from "react";
import { URDFJoint } from "urdf-loader";
import { JointProviderProps, JointValuesType } from "./joints.types";
import JointContext from "./JointContext";
import { useJointValues } from "./hooks";
import { CircularBuffer } from "../../../utils";

const JointProvider: React.FC<JointProviderProps> = ({ children }) => {
  const buffer = useRef(new CircularBuffer(5));

  const [joints, setJointsState] = useState<{ [key: string]: URDFJoint }>({});
  const [jointBuffer, setJointBuffer] = useState<number[][]>([]);

  const updateJoint = (name: string, value: number) => {
    const joint = joints[name];
    if (joint) {
      joint.setJointValue(value);
    }
  };

  const updateJoints = useCallback(
    (newJoints: { [key: string]: URDFJoint }) => {
      console.log("im getting called");
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
    buffer.current.add(Object.values(jointValues));
    setJointBuffer(buffer.current.getValues());
  }, [jointValues]);

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
