import { GraduationCap } from "lucide-react";
import type { EducationEntry } from "../types";
import { PortfolioSection } from "./PortfolioSection";

interface EducationSectionProps {
  education: EducationEntry[];
}

export function EducationSection({ education }: EducationSectionProps) {
  if (education.length === 0) {
    return null;
  }

  return (
    <PortfolioSection id="education" label="Education">
      <ul className="flex flex-col gap-2">
        {education.map((entry) => (
          <li
            key={`${entry.school}-${entry.start}`}
            className="flex items-start gap-3 rounded-md border border-border bg-sidebar p-3"
          >
            <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <h3 className="text-sm font-medium text-foreground">
                  {entry.degree}
                </h3>
                {entry.start || entry.end ? (
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {entry.start === entry.end
                      ? entry.start
                      : `${entry.start} — ${entry.end}`}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{entry.school}</p>
              {entry.detail ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {entry.detail}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </PortfolioSection>
  );
}
