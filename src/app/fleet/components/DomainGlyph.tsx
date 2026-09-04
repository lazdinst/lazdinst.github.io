import type { AssetDomain } from "@/fleet";
import { cn } from "@/lib/utils";

interface DomainGlyphProps {
  domain: AssetDomain;
  className?: string;
}

/** Air, ground, and sea marks matching the map marker silhouettes. Uses currentColor. */
export function DomainGlyph({ domain, className }: DomainGlyphProps) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-3 shrink-0", className)} fill="currentColor" aria-hidden>
      {domain === "air" ? (
        <path d="M8 1.5 L13.5 14 L8 11 L2.5 14 Z" />
      ) : domain === "sea" ? (
        <path d="M8 1.5 L12.5 7 L12.5 14.5 L3.5 14.5 L3.5 7 Z" />
      ) : (
        <>
          <path d="M3.5 5.5 h9 v7 a1.5 1.5 0 0 1 -1.5 1.5 h-6 a1.5 1.5 0 0 1 -1.5 -1.5 z" />
          <path d="M8 1.5 L11 5.5 H5 Z" />
        </>
      )}
    </svg>
  );
}
