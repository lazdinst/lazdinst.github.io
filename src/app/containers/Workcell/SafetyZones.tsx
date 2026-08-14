import { useDiagnostics } from "@/app/context";
import { DEFAULT_SAFETY_ZONES } from "@/workcell";

export function SafetyZones() {
  const { safety } = useDiagnostics();
  const { warning, protective, lightCurtain } = DEFAULT_SAFETY_ZONES;

  return (
    <group>
      <mesh position={warning.centerM}>
        <boxGeometry args={warning.sizeM} />
        <meshBasicMaterial
          color={safety.warningZoneOccupied ? "#f5c400" : "#d4a017"}
          transparent
          opacity={safety.warningZoneOccupied ? 0.22 : 0.08}
          depthWrite={false}
        />
      </mesh>
      <mesh position={protective.centerM}>
        <boxGeometry args={protective.sizeM} />
        <meshBasicMaterial
          color={safety.protectiveZoneOccupied ? "#ff3b30" : "#8a1f1f"}
          transparent
          opacity={safety.protectiveZoneOccupied ? 0.28 : 0.1}
          depthWrite={false}
        />
      </mesh>
      <mesh position={lightCurtain.centerM}>
        <boxGeometry args={lightCurtain.sizeM} />
        <meshBasicMaterial
          color={safety.lightCurtainClear ? "#3dff8a" : "#ff3b30"}
          transparent
          opacity={safety.lightCurtainClear ? 0.12 : 0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
