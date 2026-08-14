import React, { useCallback, useEffect } from "react";
import { URDFJoint } from "urdf-loader";
import { simulationEngine } from "@/simulation";
import { robotRuntime } from "@/robotics";
import { JointProviderProps, JointValuesType } from "./joints.types";
import JointContext from "./JointContext";
import { useJointBuffer } from "./hooks";
import { useRobot } from "../robot";

const JointProvider: React.FC<JointProviderProps> = ({ children }) => {
  const view = useRobot();
  const { jointBuffer, updateBuffer } = useJointBuffer();

  const updateJoint = (name: string, value: number) => {
    robotRuntime.setJoint(name, value);
  };

  const updateJoints = useCallback((newJoints: { [key: string]: URDFJoint }) => {
    void newJoints;
  }, []);

  const getJointValues = () => view.positionsRad as JointValuesType;

  useEffect(() => {
    updateBuffer(view.positionsRad, simulationEngine.getView().timestampMs);
  }, [view.revision, view.positionsRad, updateBuffer]);

  return (
    <JointContext.Provider
      value={{
        joints: {},
        updateJoint,
        updateJoints,
        jointValues: view.positionsRad,
        getJointValues,
        jointBuffer,
      }}
    >
      {children}
    </JointContext.Provider>
  );
};

export default JointProvider;
