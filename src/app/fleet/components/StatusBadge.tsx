import { Badge } from "@/components/ui/badge";
import type { AssetStatus } from "@/fleet";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE, TONE_BADGE_CLASS } from "./statusTone";

interface StatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 font-mono text-[10px] font-normal tracking-wide",
        TONE_BADGE_CLASS[STATUS_TONE[status]],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
