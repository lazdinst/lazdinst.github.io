import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import URDFLoader from "urdf-loader";
import {
  URDFLoaderComponentProps,
  URDFRobot,
  URDFJoint,
} from "../../../definitions";
import { getURDFPath } from "../../../utils";

const urdfPath = getURDFPath();

const URDFLoaderComponent: React.FC<URDFLoaderComponentProps> = ({
  setJoints,
}) => {
  const { scene } = useThree();

  useEffect(() => {
    const loader = new URDFLoader();
    loader.load(
      urdfPath,
      (robot: URDFRobot) => {
        console.log("Loaded robot:", robot);

        // Add robot to scene
        scene.add(robot);

        // Extract joints
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

    return () => {
      // Remove robot on cleanup
      scene.clear();
    };
  }, [scene, setJoints]);

  return null;
};

export default URDFLoaderComponent;
