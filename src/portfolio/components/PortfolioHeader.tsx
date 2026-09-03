import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import type { Profile } from "../types";
import { LinkIcon } from "./LinkIcon";

const NAV = [
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

interface PortfolioHeaderProps {
  profile: Profile;
}

export function PortfolioHeader({ profile }: PortfolioHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-7 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-2 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <a
          href="#top"
          className="truncate text-xs font-medium text-foreground hover:text-foreground/80"
        >
          {profile.name}
        </a>
        <nav className="hidden items-center gap-0.5 sm:flex" aria-label="Sections">
          {NAV.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="xs"
              className="text-muted-foreground hover:text-foreground"
              nativeButton={false}
              render={<a href={item.href} />}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-0.5">
        {profile.links.map((link) => (
          <Tooltip key={link.kind}>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={link.label}
                  nativeButton={false}
                  render={
                    <a
                      href={link.href}
                      target={link.kind === "email" ? undefined : "_blank"}
                      rel="noreferrer"
                    />
                  }
                />
              }
            >
              <LinkIcon kind={link.kind} className="size-2.5" />
            </TooltipTrigger>
            <TooltipContent>{link.label}</TooltipContent>
          </Tooltip>
        ))}
        <ThemeToggle />
      </div>
    </header>
  );
}
