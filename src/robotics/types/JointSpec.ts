export type JointType = "revolute" | "continuous" | "prismatic";

export interface JointSpec {
  id: string;
  label: string;
  type: JointType;
  lowerRad: number;
  upperRad: number;
  velocityLimitRadSec: number | null;
}

export interface JointLike {
  name: string;
  jointType: string;
  limit: { lower: number; upper: number };
  velocity?: number;
}
