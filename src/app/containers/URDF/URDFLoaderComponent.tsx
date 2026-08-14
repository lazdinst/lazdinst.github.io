import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useFrame, useThree } from "@react-three/fiber";
import { LoadingManager } from "three";
import URDFLoader, { URDFJoint, URDFRobot } from "urdf-loader";
import { extractActuatedJointSpecs, robotRuntime } from "@/robotics";
import { RootState } from "@/redux/store";
import { useDisplayedSnapshot, useJoints, useRobot, useSimulation } from "../../context";
import { applyJointMap } from "./applyJointMap";
import { createUrdfTcpProbe } from "./createUrdfTcpProbe";
import { attachTcpFrame, stylizeGhostRobot } from "./ghostRobot";

const URDFLoaderComponent = () => {
  const { model } = useRobot();
  const { updateJoints } = useJoints();
  const { scene } = useThree();
  const { ghostEnabled } = useSelector((state: RootState) => state.settings);
  const { playbackMode } = useSimulation();
  const snapshot = useDisplayedSnapshot();
  const robotRef = useRef<URDFRobot | null>(null);
  const ghostRef = useRef<URDFRobot | null>(null);
  const actualJointsRef = useRef<Record<string, URDFJoint> | null>(null);
  const ghostJointsRef = useRef<Record<string, URDFJoint> | null>(null);
  const updateJointsRef = useRef(updateJoints);
  updateJointsRef.current = updateJoints;

  useEffect(() => {
    const loader = new URDFLoader();
    let cancelled = false;
    let pending = 2;

    const finishIfReady = () => {
      pending -= 1;
      if (cancelled || pending > 0 || !robotRef.current) {
        return;
      }
      const joints = collectJoints(robotRef.current);
      actualJointsRef.current = joints;
      const specs = extractActuatedJointSpecs(joints);
      robotRuntime.configureModel(specs);
      robotRuntime.setKinematics(
        createUrdfTcpProbe(
          robotRef.current,
          specs.map((spec) => spec.id)
        )
      );
      updateJointsRef.current(joints);
    };

    loader.load(
      model.path,
      (robot) => {
        if (cancelled) {
          return;
        }
        attachTcpFrame(robot);
        scene.add(robot);
        robotRef.current = robot;
        finishIfReady();
      },
      undefined,
      (error) => {
        if (!cancelled) {
          console.error("Error loading URDF:", error);
        }
      }
    );

    const ghostManager = new LoadingManager();
    const ghostLoader = new URDFLoader(ghostManager);
    ghostManager.onLoad = () => {
      if (!cancelled && ghostRef.current) {
        stylizeGhostRobot(ghostRef.current);
      }
    };
    ghostLoader.load(
      model.path,
      (ghost) => {
        if (cancelled) {
          return;
        }
        attachTcpFrame(ghost, { axisSize: null });
        stylizeGhostRobot(ghost);
        ghost.visible = false;
        scene.add(ghost);
        ghostRef.current = ghost;
        ghostJointsRef.current = collectJoints(ghost);
        finishIfReady();
      },
      undefined,
      (error) => {
        if (!cancelled) {
          console.error("Error loading ghost URDF:", error);
        }
      }
    );

    return () => {
      cancelled = true;
      robotRuntime.setKinematics(null);
      if (robotRef.current) {
        scene.remove(robotRef.current);
        robotRef.current = null;
      }
      if (ghostRef.current) {
        scene.remove(ghostRef.current);
        ghostRef.current = null;
      }
      actualJointsRef.current = null;
      ghostJointsRef.current = null;
    };
  }, [model.path, scene]);

  useFrame(() => {
    const livePositions = robotRuntime.getPositionsRad();
    const positions =
      playbackMode === "scrub" && snapshot.robot
        ? Object.fromEntries(
            snapshot.robot.joints.map((joint) => [joint.id, joint.positionRad])
          )
        : livePositions;
    const targets = robotRuntime.getTargetPositionsRad();
    applyJointMap(actualJointsRef.current, positions);
    applyJointMap(ghostJointsRef.current, targets);
    const ghost = ghostRef.current;
    if (ghost) {
      stylizeGhostRobot(ghost);
      ghost.visible = ghostEnabled;
    }
  });

  return null;
};

function collectJoints(robot: URDFRobot): Record<string, URDFJoint> {
  const joints: Record<string, URDFJoint> = {};
  Object.entries(robot.joints).forEach(([name, joint]) => {
    joints[name] = joint;
  });
  return joints;
}

export default URDFLoaderComponent;
