import { perceptionRuntime } from "@/perception";
import { workcellRuntime } from "@/workcell";
import { useDisplayedSnapshot, usePerception, useSimulation } from "@/app/context";

export function DetectionFrames() {
  const live = usePerception();
  const { playbackMode } = useSimulation();
  const snapshot = useDisplayedSnapshot();
  const detections =
    playbackMode === "scrub" && snapshot.perception
      ? snapshot.perception.detections
      : live.detections;
  const selectedDetectionId =
    playbackMode === "scrub" && snapshot.perception
      ? snapshot.perception.selectedDetectionId
      : live.selectedDetectionId;

  return (
    <group>
      {detections.map((detection) => {
        const selected = detection.id === selectedDetectionId;
        const size = detection.dimensionsMm.map((value) => value / 1000) as [
          number,
          number,
          number,
        ];
        return (
          <group
            key={detection.id}
            position={[
              detection.positionMm[0] / 1000,
              detection.positionMm[1] / 1000,
              detection.positionMm[2] / 1000,
            ]}
            quaternion={detection.quaternion}
            onClick={(event) => {
              event.stopPropagation();
              perceptionRuntime.selectDetection(detection.id);
              workcellRuntime.selectPart(detection.partId);
            }}
          >
            <axesHelper args={[selected ? 0.05 : 0.03]} />
            <mesh>
              <boxGeometry args={size} />
              <meshBasicMaterial
                color={selected ? "#f5c400" : "#4cc9f0"}
                wireframe
                transparent
                opacity={selected ? 0.95 : 0.45}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
