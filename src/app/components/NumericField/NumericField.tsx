import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NumericFieldProps } from "./types/NumericFieldProps";

export function NumericField({
  id,
  label,
  value,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  disabled = false,
  unit,
  onChange,
}: NumericFieldProps) {
  const displayValue = Number.isFinite(value) ? value : 0;

  const commit = (next: number) => {
    if (Number.isNaN(next)) {
      return;
    }
    const clamped = Math.min(max, Math.max(min, next));
    onChange(id, clamped);
  };

  return (
    <div className="flex h-5 items-center gap-1">
      {label ? (
        <Label
          htmlFor={id}
          className="w-5 shrink-0 text-xs font-medium text-muted-foreground"
        >
          {label}
        </Label>
      ) : null}
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        className="h-5 w-16 shrink-0 px-1.5 text-right font-mono text-xs tabular-nums [appearance:textfield] md:text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={Number.isFinite(value) ? Number(value.toFixed(2)) : ""}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={label ? `${label}${unit ? ` ${unit}` : ""}` : id}
        onChange={(event) => commit(parseFloat(event.target.value))}
      />
      <div className="flex shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Decrease ${label ?? id}`}
          disabled={disabled || displayValue - step < min}
          onClick={() => commit(displayValue - step)}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Increase ${label ?? id}`}
          disabled={disabled || displayValue + step > max}
          onClick={() => commit(displayValue + step)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
