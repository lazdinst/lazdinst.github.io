import { useRobot } from "../../context";
import { cn } from "@/lib/utils";

export function ReachabilityOverlay() {
  const { ikStatus, ikMessage } = useRobot();

  if (ikStatus === "idle" || !ikMessage) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-background/90 px-2 py-0.5 font-mono text-xs shadow-sm",
        ikStatus === "valid" && "border-success/40 text-success",
        ikStatus === "unreachable" && "border-destructive/40 text-destructive",
        ikStatus === "joint_limit" && "border-warning/40 text-warning",
        ikStatus === "singularity" && "border-warning/40 text-warning"
      )}
    >
      {ikMessage}
    </div>
  );
}
