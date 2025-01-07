import { ReactNode } from "react";
import { URDFJoint } from "../../../definitions";

export interface JointState {
  joints: { [key: string]: URDFJoint };
}

export interface JointContextProps {
  joints: { [key: string]: URDFJoint };
  updateJoint: (name: string, value: number) => void;
  updateJoints: (joints: { [key: string]: URDFJoint }) => void;
}

export interface JointProviderProps {
  children: ReactNode;
}
