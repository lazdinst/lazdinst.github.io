import type { URDFJoint } from "urdf-loader";

export function applyJointMap(
  joints: Record<string, URDFJoint> | null,
  values: Record<string, number>
): void {
  if (!joints) {
    return;
  }
  for (const [name, value] of Object.entries(values)) {
    joints[name]?.setJointValue(value);
  }
}
