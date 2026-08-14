import { Badge } from "@/components/ui/badge";

export function HotkeyBadge({ children }: { children: string }) {
  return (
    <Badge
      variant="outline"
      className="h-4 min-w-4 rounded-sm px-1 font-mono text-[10px] font-normal text-foreground"
    >
      {children}
    </Badge>
  );
}
