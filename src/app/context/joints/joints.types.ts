import { ReactNode } from "react";
import { URDFJoint } from "../../../definitions";

export interface JointState {
  joints: { [key: string]: URDFJoint };
}

export interface JointContextProps {
  joints: { [key: string]: URDFJoint };
  setJoints: (newJoints: { [key: string]: URDFJoint }) => void;
  updateJoint: (name: string, value: number) => void;
}

export interface JointProviderProps {
  children: ReactNode;
}
