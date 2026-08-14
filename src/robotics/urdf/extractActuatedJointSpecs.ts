import type { JointSpec, JointType } from "../types/JointSpec";

const JOINT_INDEX_PATTERN = /^joint_(\d+)$/;
const CONTINUOUS_SPAN = Math.PI * 2;

export function jointLabelFromId(id: string): string {
  const match = JOINT_INDEX_PATTERN.exec(id);
  if (!match) {
    return id;
  }
  return `J${match[1]}`;
}

interface JointSource {
  name?: string;
  jointType: string;
  limit: { lower: unknown; upper: unknown };
  velocity?: unknown;
}

export function extractActuatedJointSpecs(
  joints: Record<string, JointSource>
): JointSpec[] {
  return Object.entries(joints)
    .filter(([, joint]) => isActuatedType(joint.jointType))
    .map(([id, joint]) => toJointSpec(joint, id))
    .sort(compareJointSpecs);
}

function isActuatedType(type: string): type is JointType {
  return type === "revolute" || type === "continuous" || type === "prismatic";
}

function toJointSpec(joint: JointSource, fallbackId: string): JointSpec {
  const type = joint.jointType as JointType;
  let lowerRad = Number(joint.limit.lower);
  let upperRad = Number(joint.limit.upper);
  const id = joint.name || fallbackId;

  if (
    type === "continuous" ||
    !Number.isFinite(lowerRad) ||
    !Number.isFinite(upperRad) ||
    lowerRad === upperRad
  ) {
    lowerRad = type === "continuous" ? -CONTINUOUS_SPAN : lowerRad;
    upperRad = type === "continuous" ? CONTINUOUS_SPAN : upperRad;
  }

  if (lowerRad > upperRad) {
    const swap = lowerRad;
    lowerRad = upperRad;
    upperRad = swap;
  }

  const velocity = Number(joint.velocity);
  return {
    id,
    label: jointLabelFromId(id),
    type,
    lowerRad,
    upperRad,
    velocityLimitRadSec: Number.isFinite(velocity) ? velocity : null,
  };
}

function compareJointSpecs(a: JointSpec, b: JointSpec): number {
  const aIndex = jointIndex(a.id);
  const bIndex = jointIndex(b.id);
  if (aIndex !== null && bIndex !== null) {
    return aIndex - bIndex;
  }
  return a.id.localeCompare(b.id);
}

function jointIndex(id: string): number | null {
  const match = JOINT_INDEX_PATTERN.exec(id);
  return match ? Number(match[1]) : null;
}
