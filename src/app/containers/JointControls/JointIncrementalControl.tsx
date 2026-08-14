import { useSelector } from "react-redux";
import { NumericField } from "../../components/NumericField";
import { useJoints } from "../../context";
import { RootState } from "../../../redux";
import { radiansToUnit, unitToRadians } from "@/robotics";

interface JointIncrementalControlsProps {
  jointName: string;
  label: string;
  value: number;
  lowerRad: number;
  upperRad: number;
}

export default function JointIncrementalControl({
  jointName,
  label,
  value,
  lowerRad,
  upperRad,
}: JointIncrementalControlsProps) {
  const { angleUnit } = useSelector((state: RootState) => state.settings);
  const { updateJoint } = useJoints();

  return (
    <NumericField
      id={jointName}
      label={label}
      value={Number.isFinite(value) ? radiansToUnit(value, angleUnit) : 0}
      onChange={(_id, next) => {
        const radians = unitToRadians(next, angleUnit);
        if (!Number.isNaN(radians)) {
          updateJoint(jointName, radians);
        }
      }}
      min={radiansToUnit(lowerRad, angleUnit)}
      max={radiansToUnit(upperRad, angleUnit)}
      step={angleUnit === "deg" ? 1 : 0.01}
      unit={angleUnit === "deg" ? "°" : "rad"}
    />
  );
}
