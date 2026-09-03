import { Button } from "@/components/ui/button";
import type { Profile } from "../types";
import { LinkIcon } from "./LinkIcon";
import { PortfolioSection } from "./PortfolioSection";

interface ContactSectionProps {
  profile: Profile;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const email = profile.links.find((link) => link.kind === "email");
  const others = profile.links.filter((link) => link.kind !== "email");

  return (
    <PortfolioSection id="contact" label="Contact">
      <div className="hud-skin rounded-md border border-border bg-sidebar p-4">
        <div className="relative z-[1] flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-medium text-foreground">
              Let's build something.
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              I'm happy to talk about robotics interfaces, simulation tooling,
              or anything with a control loop in it. The fastest way to reach
              me is email.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {email ? (
              <Button nativeButton={false} render={<a href={email.href} />}>
                <LinkIcon kind="email" />
                {email.label}
              </Button>
            ) : null}
            {others.map((link) => (
              <Button
                key={link.kind}
                variant="outline"
                nativeButton={false}
                render={<a href={link.href} target="_blank" rel="noreferrer" />}
              >
                <LinkIcon kind={link.kind} />
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </PortfolioSection>
  );
}
