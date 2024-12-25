import * as THREE from "three";

export interface URDFJoint extends THREE.Object3D {
  isURDFJoint: boolean;
  setJointValue: (value: number) => void;
}

export interface URDFLoaderComponentProps {
  scene: THREE.Scene;
  setJoints: (joints: { [key: string]: URDFJoint }) => void;
}
