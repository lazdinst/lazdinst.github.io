import { ReactNode } from "react";
import { URDFJoint } from "urdf-loader";

export interface JointState {
  joints: { [key: string]: URDFJoint };
}

export interface JointEvent {
  time: number;
  name: string;
  value: number;
}

// Update the JointBufferType to reflect the new structure
export type JointBufferType = {
  [key: string]: JointEvent[]; // Each key is a joint name, with its own array of events
};

export type JointValuesType = { [key: string]: number };

export interface JointContextProps {
  joints: { [key: string]: URDFJoint };
  jointValues: JointValuesType;
  updateJoint: (name: string, value: number) => void;
  updateJoints: (joints: { [key: string]: URDFJoint }) => void;
  getJointValues: () => JointValuesType;
  jointBuffer: JointBufferType; // Updated to use the new JointBufferType
}

export interface JointProviderProps {
  children: ReactNode;
}
