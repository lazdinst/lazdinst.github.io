import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Keyboard input, after Geist's Kbd. Modifiers are boolean props rendered as
 * their own keycaps and swapped for platform glyphs (⌘ on Mac, Ctrl elsewhere).
 * `children` is one key: K, 7, Enter, Esc. Keep punctuation outside.
 */
export interface KbdProps extends HTMLAttributes<HTMLElement> {
  meta?: boolean
  shift?: boolean
  alt?: boolean
  ctrl?: boolean
  size?: "default" | "small"
  children?: ReactNode
}

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)

const GLYPHS: Record<"meta" | "shift" | "alt" | "ctrl", string> = {
  meta: isMac ? "⌘" : "Ctrl",
  shift: isMac ? "⇧" : "Shift",
  alt: isMac ? "⌥" : "Alt",
  ctrl: isMac ? "⌃" : "Ctrl",
}

const CAP =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-background font-sans font-medium tabular-nums text-foreground select-none"

const SIZE = {
  default: "h-5 min-w-5 px-1.5 text-[11px] leading-none",
  small: "h-4 min-w-4 rounded-[5px] px-1 text-[10px] leading-none",
} as const

function Kbd({
  meta,
  shift,
  alt,
  ctrl,
  size = "default",
  className,
  children,
  ...props
}: KbdProps) {
  const modifiers: string[] = []
  if (ctrl) modifiers.push(GLYPHS.ctrl)
  if (alt) modifiers.push(GLYPHS.alt)
  if (shift) modifiers.push(GLYPHS.shift)
  if (meta) modifiers.push(GLYPHS.meta)

  return (
    <span
      data-slot="kbd"
      className={cn("inline-flex items-center gap-0.5 align-middle", className)}
      {...props}
    >
      {modifiers.map((glyph) => (
        <kbd key={glyph} className={cn(CAP, SIZE[size])}>
          {glyph}
        </kbd>
      ))}
      {children !== undefined && children !== null ? (
        <kbd className={cn(CAP, SIZE[size])}>{children}</kbd>
      ) : null}
    </span>
  )
}

export { Kbd }
