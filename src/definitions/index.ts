import * as THREE from "three";

// DEPRECATED - UPDATEJOINTS comes from context now
export interface URDFLoaderComponentProps {
  setJoints: (joints: { [key: string]: URDFJoint }) => void;
}

// DEPRECATED JOINT ANIMATOR PROPS - JOINTS FROM CONTEXT
export interface JointAnimatorProps {
  joints: { [key: string]: URDFJoint };
}

// DEPERECATED JOINT CONTROL PROPS - comes from useJoints context
export interface JointControlsProps {
  joints: { [key: string]: URDFJoint };
  updateJoint: (name: string, value: number) => void;
}

export interface LightingProps {
  scene: THREE.Scene;
}

export interface URDFJoint extends THREE.Object3D {
  isURDFJoint: boolean;
  name: string;
  setJointValue: (value: number) => void;
  angle: number;
}

export interface URDFLink extends THREE.Object3D {
  isURDFLink: boolean;
  name: string;
}

export interface URDFRobot extends THREE.Object3D {
  isURDFRobot: boolean;
  joints: { [name: string]: URDFJoint };
  links: { [name: string]: URDFLink };
  robotName: string;
}
export interface URDFVisual extends THREE.Object3D {
  isURDFVisual: boolean;
  geometry?: THREE.BufferGeometry; // Geometry is optional but expected
}
