import type { Profile } from "../types";

interface PortfolioFooterProps {
  profile: Profile;
  repoHref?: string;
}

export function PortfolioFooter({ profile, repoHref }: PortfolioFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="flex h-7 shrink-0 items-center justify-between gap-2 border-t border-border px-2 font-mono text-[10px] text-muted-foreground sm:px-4">
      <span className="truncate">
        © {year} {profile.name}
      </span>
      <span className="flex items-center gap-2">
        <span className="hidden sm:inline">React · Three.js · Tailwind</span>
        {repoHref ? (
          <a
            href={repoHref}
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:underline"
          >
            source
          </a>
        ) : null}
      </span>
    </footer>
  );
}
