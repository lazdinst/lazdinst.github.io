import { Slider } from "@/components/ui/slider";
import { NumericField } from "../NumericField";

interface JointRowProps {
  jointName: string;
  label: string;
  value: number;
  displayValue: number;
  disabled?: boolean;
  unit?: string;
  onValueChange: (jointName: string, radians: number) => void;
  onDisplayChange: (jointName: string, displayValue: number) => void;
}

export function JointRow({
  jointName,
  label,
  value,
  displayValue,
  disabled = false,
  unit = "°",
  onValueChange,
  onDisplayChange,
}: JointRowProps) {
  return (
    <div className="flex h-5 items-center gap-1.5">
      <NumericField
        id={jointName}
        label={label}
        value={displayValue}
        min={-180}
        max={180}
        step={1}
        unit={unit}
        disabled={disabled}
        onChange={onDisplayChange}
      />
      <Slider
        className="min-w-0 flex-1"
        aria-label={`${label} angle`}
        min={-Math.PI}
        max={Math.PI}
        step={0.01}
        value={[Number.isFinite(value) ? value : 0]}
        disabled={disabled}
        onValueChange={(next) => {
          const nextValue = Array.isArray(next) ? next[0] : next;
          onValueChange(jointName, nextValue);
        }}
      />
    </div>
  );
}
