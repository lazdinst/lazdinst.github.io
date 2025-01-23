import { ReactNode } from "react";
import { URDFJoint } from "urdf-loader";

export interface JointState {
  joints: { [key: string]: URDFJoint };
}

export type JointValuesType = { [key: string]: number };

export interface JointContextProps {
  joints: { [key: string]: URDFJoint };
  jointValues: JointValuesType;
  updateJoint: (name: string, value: number) => void;
  updateJoints: (joints: { [key: string]: URDFJoint }) => void;
  getJointValues: () => { [key: string]: number };
  jointBuffer: number[][];
}

export interface JointProviderProps {
  children: ReactNode;
}
