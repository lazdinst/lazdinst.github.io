import { useSelector } from "react-redux";
import { Slider } from "@/components/ui/slider";
import { useJoints } from "../../context";
import { RootState } from "../../../redux";
import { radiansToUnit, unitToRadians } from "@/robotics";

interface JointSliderProps {
  jointName: string;
  label: string;
  value: number;
  lowerRad: number;
  upperRad: number;
}

export default function JointSlider({
  jointName,
  label,
  value,
  lowerRad,
  upperRad,
}: JointSliderProps) {
  const { angleUnit } = useSelector((state: RootState) => state.settings);
  const { updateJoint } = useJoints();
  const min = radiansToUnit(lowerRad, angleUnit);
  const max = radiansToUnit(upperRad, angleUnit);
  const displayValue = radiansToUnit(value, angleUnit);

  return (
    <Slider
      className="min-w-0 flex-1"
      aria-label={`${label} angle`}
      min={min}
      max={max}
      step={angleUnit === "deg" ? 0.1 : 0.001}
      value={[Number.isFinite(displayValue) ? displayValue : 0]}
      onValueChange={(next) => {
        const nextValue = Array.isArray(next) ? next[0] : next;
        updateJoint(jointName, unitToRadians(nextValue, angleUnit));
      }}
    />
  );
}
