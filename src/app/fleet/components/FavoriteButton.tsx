import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  active: boolean;
  callsign: string;
  onToggle: () => void;
  size?: "icon-xs" | "icon-sm";
  className?: string;
}

export function FavoriteButton({ active, callsign, onToggle, size = "icon-xs", className }: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={active ? `Remove ${callsign} from favorites` : `Add ${callsign} to favorites`}
      aria-pressed={active}
      className={cn(active ? "text-warning" : "text-muted-foreground", className)}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <Star className={cn(active && "fill-current")} />
    </Button>
  );
}
