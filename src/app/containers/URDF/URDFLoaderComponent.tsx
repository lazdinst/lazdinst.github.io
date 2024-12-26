import React, { useEffect, useRef } from "react";
import URDFLoader from "urdf-loader";
import {
  URDFJoint,
  URDFRobot,
  URDFLoaderComponentProps,
} from "../../../definitions";

const urdfPath = "/fanuc_crx10ia_support/urdf/crx10ial.urdf";

const URDFLoaderComponent: React.FC<URDFLoaderComponentProps> = ({
  scene,
  robotGroup,
  setJoints,
}) => {
  const hasRobotLoaded = useRef(false); // Flag to ensure single load

  useEffect(() => {
    if (hasRobotLoaded.current) {
      console.log("URDF already loaded, skipping...");
      return;
    }

    console.log("Loading URDF...");
    const loader = new URDFLoader();

    loader.load(
      urdfPath,
      (robot: URDFRobot) => {
        console.log("Loaded robot:", robot);

        // Add robot to the robot group
        robotGroup.add(robot);

        // Extract joints and pass them to parent
        const joints: { [key: string]: URDFJoint } = {};
        Object.entries(robot.joints).forEach(([name, joint]) => {
          joints[name] = joint;
        });

        setJoints(joints);
        hasRobotLoaded.current = true; // Mark as loaded
      },
      undefined,
      (error) => {
        console.error("Error loading URDF:", error);
      }
    );
  }, [scene, robotGroup, setJoints]);

  return null;
};

export default URDFLoaderComponent;
