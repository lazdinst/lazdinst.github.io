import { useWorkcell } from "@/app/context";
import { cn } from "@/lib/utils";

export function PickStatusOverlay() {
  const { pick, message } = useWorkcell();
  if (pick.phase === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md border bg-background/90 px-2 py-0.5 font-mono text-xs shadow-sm",
        pick.phase === "failed" && "border-destructive/40 text-destructive",
        pick.phase === "complete" && "border-success/40 text-success",
        pick.phase !== "failed" &&
          pick.phase !== "complete" &&
          "border-border text-foreground"
      )}
    >
      {pick.phase.replace(/_/g, " ").toUpperCase()}
      {pick.targetPartId ? ` · ${pick.targetPartId}` : ""}
      {message ? ` · ${message}` : ""}
    </div>
  );
}
