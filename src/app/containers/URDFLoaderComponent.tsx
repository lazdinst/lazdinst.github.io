import React, { useEffect } from "react";
import * as THREE from "three";
import URDFLoader from "urdf-loader";

const urdfPath = "/fanuc_crx10ia_support/urdf/crx10ial.urdf";

interface URDFJoint extends THREE.Object3D {
  isURDFJoint: boolean;
  name: string;
  setJointValue: (value: number) => void;
}

interface URDFLink extends THREE.Object3D {
  isURDFLink: boolean;
  name: string;
}

interface URDFRobot extends THREE.Object3D {
  isURDFRobot: boolean;
  joints: { [name: string]: URDFJoint };
  links: { [name: string]: URDFLink };
  robotName: string;
}

interface URDFLoaderComponentProps {
  scene: THREE.Scene;
  setJoints: (joints: { [key: string]: URDFJoint }) => void;
}

interface URDFVisual extends THREE.Object3D {
  isURDFVisual: boolean;
  geometry?: THREE.BufferGeometry; // Geometry is optional but expected
}

const URDFLoaderComponent: React.FC<URDFLoaderComponentProps> = ({
  scene,
  setJoints,
}) => {
  useEffect(() => {
    const loader = new URDFLoader();

    loader.load(
      urdfPath,
      (robot: URDFRobot) => {
        console.log("Loaded robot:", robot);

        // Add the robot to the scene
        scene.add(robot);

        robot.traverse((child) => {
          if ((child as URDFJoint).isURDFJoint) {
            const joint = child as URDFJoint;
            console.log("Joint found:", joint.name);
          }
          if ((child as URDFLink).isURDFLink) {
            const link = child as URDFLink;
            console.log("Link found:", link.name);
          }

          const visual = child as URDFVisual; // Assert child as URDFVisual

          if (visual.isURDFVisual && visual.geometry) {
            console.log("Loading mesh for visual:", visual.geometry);
          }
        });

        // Extract joints and pass them to the parent
        const joints: { [key: string]: URDFJoint } = {};
        Object.entries(robot.joints).forEach(([name, joint]) => {
          joints[name] = joint;
        });

        setJoints(joints);
      },
      undefined,
      (error) => {
        console.error("Error loading URDF:", error);
      }
    );
  }, [scene, setJoints]);

  return null;
};

export default URDFLoaderComponent;
