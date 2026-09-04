import { useId, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FleetSelectOption<V extends string = string> {
  value: V;
  label: string;
  /** Leading glyph, dot, or icon shown in the popup row and in the trigger when selected. */
  icon?: ReactNode;
  /** Secondary line shown in the popup only. */
  description?: string;
  /** Trailing glyph or badge in the popup row. */
  trailing?: ReactNode;
  disabled?: boolean;
}

interface FleetSelectProps<V extends string> {
  value: V | null;
  onValueChange: (value: V) => void;
  options: FleetSelectOption<V>[];
  /** Trigger text when nothing is selected. For clearable selects defaults to `allLabel`. */
  placeholder?: string;
  /** Small caption rendered above the trigger. */
  label?: string;
  /** Text for the "no filter" choice on clearable selects. */
  allLabel?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  align?: "start" | "end";
  /** Mute the trigger text, for secondary pickers. */
  muted?: boolean;
  /** Lets the "all" choice be picked, clearing the value. */
  clearable?: boolean;
}

const CLEAR = "__clear__";

/**
 * Compact popover select in the command-bar style: 20 px mono trigger,
 * themed popup with icons and descriptions. Replaces native selects in SkyNet.
 */
export function FleetSelect<V extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  allLabel = "All",
  id,
  className,
  contentClassName,
  disabled,
  align = "start",
  muted = false,
  clearable = false,
  ...aria
}: FleetSelectProps<V>) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const emptyLabel = placeholder ?? (clearable ? allLabel : "Select…");
  const selected = options.find((option) => option.value === value);
  const items = options.map((option) => ({ value: option.value as string, label: option.label }));

  const select = (
    <Select<string | null>
      value={value}
      items={items}
      onValueChange={(next) => {
        if (next === null || next === CLEAR) {
          if (clearable) onValueChange(null as unknown as V);
          return;
        }
        onValueChange(next as V);
      }}
      disabled={disabled}
      // Non-modal so a click on the surrounding search panel reaches it and
      // only the popup closes, not the whole search dropdown.
      modal={false}
    >
      <SelectTrigger
        id={triggerId}
        aria-label={aria["aria-label"] ?? label}
        className={cn(
          "h-5 rounded-sm border-border bg-background px-1 font-mono text-xs dark:bg-background dark:hover:bg-muted",
          muted ? "text-muted-foreground" : "text-foreground",
          className
        )}
      >
        {selected?.icon ? (
          <span className="flex shrink-0 items-center [&_svg]:size-3">{selected.icon}</span>
        ) : null}
        <SelectValue placeholder={emptyLabel} />
      </SelectTrigger>
      <SelectContent align={align} className={cn("font-mono", contentClassName)}>
        {clearable ? (
          <SelectItem value={CLEAR} className="text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="flex size-3 shrink-0 items-center justify-center">
                <span className="size-1.5 rounded-full border border-muted-foreground" />
              </span>
              <span>{allLabel}</span>
            </span>
          </SelectItem>
        ) : null}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            <span className="flex items-center gap-2">
              {option.icon ? (
                <span className="flex size-3 shrink-0 items-center justify-center [&_svg]:size-3">
                  {option.icon}
                </span>
              ) : null}
              <span className="truncate">{option.label}</span>
              {option.trailing}
            </span>
            {option.description ? (
              <span
                className={cn(
                  "truncate font-sans text-[10px] leading-3 text-muted-foreground",
                  option.icon && "pl-5"
                )}
              >
                {option.description}
              </span>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (!label) return select;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <label
        htmlFor={triggerId}
        className="truncate text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
      >
        {label}
      </label>
      {select}
    </div>
  );
}
