import type { AssetKind } from "@/fleet";
import { cn } from "@/lib/utils";

interface AssetGlyphProps {
  kind: AssetKind;
  className?: string;
}

/** Small monochrome silhouette per asset kind. Uses currentColor. */
export function AssetGlyph({ kind, className }: AssetGlyphProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-3 shrink-0", className)}
      fill="currentColor"
      aria-hidden
    >
      {glyphPath(kind)}
    </svg>
  );
}

function glyphPath(kind: AssetKind) {
  switch (kind) {
    case "uav_quad":
      return (
        <>
          <circle cx="4" cy="4" r="2.2" />
          <circle cx="12" cy="4" r="2.2" />
          <circle cx="4" cy="12" r="2.2" />
          <circle cx="12" cy="12" r="2.2" />
          <rect x="6.5" y="6.5" width="3" height="3" rx="0.6" />
        </>
      );
    case "uav_fixed_wing":
      return <path d="M8 1.5 L9.6 6.5 L15 8 L9.6 9 L9.2 13 L11 14.5 L8 14 L5 14.5 L6.8 13 L6.4 9 L1 8 L6.4 6.5 Z" />;
    case "ugv_rover":
      return (
        <>
          <rect x="3" y="4" width="10" height="7" rx="1.2" />
          <rect x="1.5" y="5" width="2" height="2.6" rx="0.6" />
          <rect x="12.5" y="5" width="2" height="2.6" rx="0.6" />
          <rect x="1.5" y="9" width="2" height="2.6" rx="0.6" />
          <rect x="12.5" y="9" width="2" height="2.6" rx="0.6" />
        </>
      );
    case "ugv_tracked":
      return (
        <>
          <rect x="1.5" y="4.5" width="13" height="7.5" rx="3.5" />
          <rect x="5" y="2.5" width="6" height="4" rx="1" />
        </>
      );
    case "legged":
      return (
        <>
          <rect x="4" y="5" width="8" height="4.5" rx="1.2" />
          <rect x="3.5" y="9" width="1.6" height="4.5" rx="0.5" />
          <rect x="6.3" y="9" width="1.6" height="4.5" rx="0.5" />
          <rect x="8.9" y="9" width="1.6" height="4.5" rx="0.5" />
          <rect x="11.5" y="9" width="1.6" height="4.5" rx="0.5" />
          <rect x="11" y="3" width="3" height="2.5" rx="0.6" />
        </>
      );
    case "usv":
      return <path d="M2 9 L14 9 L12 13 L4 13 Z M7 3 L9 3 L9 9 L7 9 Z" />;
    default:
      return <circle cx="8" cy="8" r="4" />;
  }
}
