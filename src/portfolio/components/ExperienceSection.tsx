import { Badge } from "@/components/ui/badge";
import type { ExperienceEntry } from "../types";
import { PortfolioSection } from "./PortfolioSection";

interface ExperienceSectionProps {
  experience: ExperienceEntry[];
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <PortfolioSection
      id="experience"
      label="Experience"
      trailing={
        <span>
          {experience[experience.length - 1]?.start} — {experience[0]?.end}
        </span>
      }
    >
      <ol className="flex flex-col">
        {experience.map((entry, index) => (
          <li
            key={`${entry.company}-${entry.start}`}
            className="grid gap-2 border-b border-border py-4 first:pt-0 last:border-b-0 sm:grid-cols-[7.5rem_1fr] sm:gap-4"
          >
            <div className="flex items-start gap-2 sm:flex-col sm:gap-1">
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {entry.start} — {entry.end}
              </span>
              {index === 0 && entry.end.toLowerCase() === "present" ? (
                <Badge
                  variant="outline"
                  className="border-success/40 font-mono text-[10px] font-normal tracking-wide text-success"
                >
                  CURRENT
                </Badge>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-medium text-foreground">
                  {entry.role}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {entry.company}
                  {entry.location ? ` · ${entry.location}` : null}
                </p>
              </div>
              {entry.summary ? (
                <p className="text-xs leading-relaxed text-foreground">
                  {entry.summary}
                </p>
              ) : null}
              <ul className="flex flex-col gap-1">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                  >
                    <span
                      className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-chart-1"
                      aria-hidden
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-wrap gap-1">
                {entry.stack.map((item) => (
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
          </li>
        ))}
      </ol>
    </PortfolioSection>
  );
}
