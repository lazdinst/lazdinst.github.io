import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Profile } from "../types";
import { LinkIcon } from "./LinkIcon";

interface ProfileAsideProps {
  profile: Profile;
}

export function ProfileAside({ profile }: ProfileAsideProps) {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-10 lg:self-start">
      <div className="hud-skin hud-skin-plain rounded-md border border-border bg-sidebar p-3">
        <div className="relative z-[1] flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Skills
            </h3>
            {profile.skills.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                <p className="text-[10px] text-muted-foreground">
                  {group.label}
                </p>
                <ul className="flex flex-wrap gap-1">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Badge
                        variant="outline"
                        className="rounded-sm font-mono text-[10px] font-normal"
                      >
                        {item}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <h3 className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Links
            </h3>
            <ul className="flex flex-col gap-1">
              {profile.links.map((link) => (
                <li key={link.kind}>
                  <a
                    href={link.href}
                    target={link.kind === "email" ? undefined : "_blank"}
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <LinkIcon kind={link.kind} className="size-3" />
                    <span>{link.label}</span>
                    <span className="ml-auto truncate font-mono text-[10px] text-muted-foreground/70">
                      {displayHref(link.href)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}

function displayHref(href: string): string {
  return href
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "");
}
