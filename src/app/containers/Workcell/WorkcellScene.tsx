import { perceptionRuntime } from "@/perception";
import { workcellRuntime } from "@/workcell";
import { useDisplayedSnapshot, useSimulation, useWorkcell } from "@/app/context";
import type { Workpiece } from "@/workcell";

export function WorkcellScene() {
  const live = useWorkcell();
  const { playbackMode } = useSimulation();
  const snapshot = useDisplayedSnapshot();
  const layout = live.layout;
  const parts =
    playbackMode === "scrub" && snapshot.workcell
      ? snapshot.workcell.parts
      : live.parts;
  const selectedPartId =
    playbackMode === "scrub" && snapshot.workcell
      ? snapshot.workcell.selectedPartId
      : live.selectedPartId;

  return (
    <group>
      <mesh
        position={layout.table.centerM}
        receiveShadow
        castShadow
      >
        <boxGeometry args={layout.table.sizeM} />
        <meshStandardMaterial color="#2a2d33" metalness={0.12} roughness={0.78} />
      </mesh>
      <Bin
        center={layout.tote.centerM}
        inner={layout.tote.innerSizeM}
        wall={layout.tote.wallM}
        floorZ={layout.tote.floorZ}
        height={layout.tote.heightM}
        color="#8a7a3c"
      />
      <Bin
        center={layout.destination.centerM}
        inner={layout.destination.innerSizeM}
        wall={0.006}
        floorZ={layout.destination.floorZ}
        height={layout.destination.heightM}
        color="#3d5a73"
      />
      {parts.map((part) => (
        <WorkpieceMesh
          key={part.id}
          part={part}
          selected={part.id === selectedPartId}
        />
      ))}
      <group position={layout.overheadCamera.positionM}>
        <mesh>
          <boxGeometry args={[0.06, 0.04, 0.03]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.04]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.018, 0.04, 12]} />
          <meshStandardMaterial color="#444" metalness={0.2} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function WorkpieceMesh({
  part,
  selected,
}: {
  part: Workpiece;
  selected: boolean;
}) {
  const [sx, sy, sz] = part.dimensionsM;
  const isBox = part.geometryType === "box";
  return (
    <group
      position={part.positionM}
      quaternion={part.quaternion}
      onClick={(event) => {
        event.stopPropagation();
        workcellRuntime.selectPart(part.id);
        perceptionRuntime.syncSelectionFromPart(part.id);
      }}
    >
      <mesh
        rotation={isBox ? [0, 0, 0] : [Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        {isBox ? (
          <boxGeometry args={[sx, sy, sz]} />
        ) : (
          <cylinderGeometry args={[sx / 2, sx / 2, sz, 20]} />
        )}
        <meshStandardMaterial
          color={part.color}
          emissive={selected ? "#f5c400" : "#000000"}
          emissiveIntensity={selected ? 0.45 : 0}
          metalness={0.08}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}

function Bin({
  center,
  inner,
  wall,
  floorZ,
  height,
  color,
}: {
  center: [number, number, number];
  inner: [number, number, number];
  wall: number;
  floorZ: number;
  height: number;
  color: string;
}) {
  const outerX = inner[0] + wall * 2;
  const outerY = inner[1] + wall * 2;
  return (
    <group>
      <mesh position={[center[0], center[1], floorZ + 0.003]} receiveShadow>
        <boxGeometry args={[outerX, outerY, 0.006]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[center[0], center[1] + inner[1] / 2 + wall / 2, floorZ + height / 2]}>
        <boxGeometry args={[outerX, wall, height]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[center[0], center[1] - inner[1] / 2 - wall / 2, floorZ + height / 2]}>
        <boxGeometry args={[outerX, wall, height]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[center[0] + inner[0] / 2 + wall / 2, center[1], floorZ + height / 2]}>
        <boxGeometry args={[wall, inner[1], height]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      <mesh position={[center[0] - inner[0] / 2 - wall / 2, center[1], floorZ + height / 2]}>
        <boxGeometry args={[wall, inner[1], height]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
    </group>
  );
}

export default WorkcellScene;
