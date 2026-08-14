import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import type { CameraControls as CameraControlsImpl } from "@react-three/drei";
import URDFLoaderComponent from "../URDF";
import LogCameraPosition from "../LogCameraPositions";
import SceneEnvironment from "../SceneEnvironment";
import DebugHelpers from "../DebugHelper";
import JointStreamer from "../JointStreamer";
import { ReachabilityOverlay } from "../ReachabilityOverlay";
import { WorkcellScene, PickStatusOverlay, SafetyZones } from "../Workcell";
import { DetectionFrames, PointCloudView } from "../Perception";
import { ControlHelpMenu } from "../../components/ControlHelpMenu";
import { CameraHud } from "./CameraHud";
import { StageCamera } from "./StageCamera";

const LOG_CAMERA_POSITION = false;
const DEBUG_HELPER = false;

export function World() {
  const controlsRef = useRef<CameraControlsImpl | null>(null);

  return (
    <div className="relative h-full w-full min-h-0 min-w-0">
      <Canvas
        className="h-full w-full"
        shadows
        camera={{ position: [1.6, 1.4, 1.1], up: [0, 0, 1], fov: 50 }}
      >
        {DEBUG_HELPER && <DebugHelpers />}
        <SceneEnvironment />
        <WorkcellScene />
        <SafetyZones />
        <URDFLoaderComponent />
        <PointCloudView />
        <DetectionFrames />
        <StageCamera controlsRef={controlsRef} />
        {LOG_CAMERA_POSITION && <LogCameraPosition />}
      </Canvas>
      <div className="absolute top-2 left-2 z-10">
        <ControlHelpMenu align="start" side="bottom" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex flex-col items-center gap-1 px-12">
        <JointStreamer />
        <ReachabilityOverlay />
        <PickStatusOverlay />
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 z-10">
        <CameraHud controlsRef={controlsRef} />
      </div>
    </div>
  );
}

export default World;
