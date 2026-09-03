import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaneCloseButtonProps {
  label: string;
  onClick: () => void;
}

export function PaneCloseButton({ label, onClick }: PaneCloseButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      onClick={onClick}
    >
      <X />
    </Button>
  );
}
