import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectEntry } from "../types";
import { GitHubIcon } from "./BrandIcons";

interface ProjectCardProps {
  project: ProjectEntry;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const featured = Boolean(project.featured);

  return (
    <article
      className={cn(
        "rounded-md border border-border bg-sidebar p-3",
        featured && "hud-skin sm:col-span-2"
      )}
    >
      <div className="relative z-[1] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            {featured ? (
              <span className="font-mono text-[10px] tracking-[0.16em] text-brand uppercase">
                Featured · Live demo
              </span>
            ) : null}
            <h3
              className={cn(
                "font-medium text-foreground",
                featured ? "text-lg" : "text-sm"
              )}
            >
              {project.title}
            </h3>
          </div>
          {project.repo ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${project.title} source on GitHub`}
              nativeButton={false}
              render={<a href={project.repo} target="_blank" rel="noreferrer" />}
            >
              <GitHubIcon className="size-3" />
            </Button>
          ) : null}
        </div>

        <p
          className={cn(
            "leading-relaxed text-muted-foreground",
            featured ? "max-w-2xl text-sm" : "text-xs"
          )}
        >
          {project.summary}
        </p>

        {project.metrics && project.metrics.length > 0 ? (
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {project.metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-0.5">
                <dt className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  {metric.label}
                </dt>
                <dd className="font-mono text-sm leading-none tabular-nums text-foreground">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <ul className="flex flex-wrap gap-1">
          {project.stack.map((item) => (
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

        {project.route || project.href ? (
          <div className="flex flex-wrap gap-1.5">
            {project.route ? (
              <Button
                variant={featured ? "default" : "outline"}
                nativeButton={false}
                render={<Link to={project.route} />}
              >
                Open showcase
                <ArrowUpRight />
              </Button>
            ) : null}
            {project.href ? (
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href={project.href} target="_blank" rel="noreferrer" />}
              >
                Visit
                <ExternalLink />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
