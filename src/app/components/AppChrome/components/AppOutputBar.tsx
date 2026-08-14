import type { ReactNode } from "react";

interface AppOutputBarProps {
  children: ReactNode;
}

export function AppOutputBar({ children }: AppOutputBarProps) {
  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-black text-zinc-300">
      {children}
    </section>
  );
}
