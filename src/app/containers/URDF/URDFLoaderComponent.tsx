import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import URDFLoader, { URDFJoint } from "urdf-loader";
import { URDFRobot } from "../../../definitions";
import { getURDFPath } from "../../../utils";
import { useJoints } from "../../context";

// TODO: There is an issue when saving this file.
// It causes a re-render which clears the scene which removes the elements from the scene.
// It may be because the lighting is being removed from the scene but the robot is still there.
// Ok so i did figure it out, react lifecycle and the threejs scene get out of sync because of the re-renders
// to solve this we need to migrate the react compoents to hooks that manage the scene.
// OK that didnt really work, because now i have an issue that the axes text is a react component.

// import { useLighting } from "./hooks";

const urdfPath = getURDFPath();

const URDFLoaderComponent: React.FC = () => {
  const { updateJoints } = useJoints();
  const { scene } = useThree();
  // useLighting(); - Debug lighting
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

        updateJoints(joints);
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
  }, [scene, updateJoints]);

  return null;
};

export default URDFLoaderComponent;
