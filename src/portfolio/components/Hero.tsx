import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AvailabilityTone, Profile } from "../types";
import { LinkIcon } from "./LinkIcon";

const TONE_CLASS: Record<AvailabilityTone, string> = {
  ok: "border-success/40 text-success",
  warn: "border-warning/40 text-warning",
  neutral: "border-border text-muted-foreground",
};

interface HeroProps {
  profile: Profile;
}

export function Hero({ profile }: HeroProps) {
  return (
    <section id="top" className="flex scroll-mt-10 flex-col gap-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "font-sans font-medium tracking-wide",
            TONE_CLASS[profile.availability.tone]
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              profile.availability.tone === "ok" && "hud-live bg-success",
              profile.availability.tone === "warn" && "bg-warning",
              profile.availability.tone === "neutral" && "bg-muted-foreground"
            )}
          />
          {profile.availability.label}
        </Badge>
        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          <MapPin className="size-2.5" />
          {profile.location}
          {profile.timezone ? ` · ${profile.timezone}` : null}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          {profile.name}
        </h1>
        <p className="text-sm text-muted-foreground">{profile.title}</p>
      </div>

      <p className="max-w-2xl text-base leading-relaxed text-foreground">
        {profile.tagline}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {profile.links.map((link) => (
          <Button
            key={link.kind}
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={link.href}
                target={link.kind === "email" ? undefined : "_blank"}
                rel="noreferrer"
              />
            }
          >
            <LinkIcon kind={link.kind} />
            {link.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
