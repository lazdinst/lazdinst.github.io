import { useSelector } from "react-redux";
import { useRobot } from "../../context";
import { RootState } from "../../../redux";
import { formatAngle } from "@/robotics";

export function JointStreamer() {
  const { specs, positionsRad } = useRobot();
  const { angleUnit } = useSelector((state: RootState) => state.settings);

  return (
    <div className="flex max-w-full min-w-0 items-center gap-2 overflow-x-auto rounded-md border border-border bg-ds-gray-1000/90 px-1.5 py-0.5 text-primary-foreground shadow-sm">
      {specs.map((spec) => (
        <div key={spec.id} className="flex items-center gap-0.5">
          <span className="text-xs font-medium text-primary-foreground/70">
            {spec.label}
          </span>
          <span className="font-mono text-xs tabular-nums">
            {formatAngle(positionsRad[spec.id] ?? 0, angleUnit)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default JointStreamer;
