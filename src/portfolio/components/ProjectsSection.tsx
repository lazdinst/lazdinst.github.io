import type { ProjectEntry } from "../types";
import { PortfolioSection } from "./PortfolioSection";
import { ProjectCard } from "./ProjectCard";

interface ProjectsSectionProps {
  projects: ProjectEntry[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const ordered = [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  );

  return (
    <PortfolioSection
      id="projects"
      label="Projects"
      trailing={<span>{projects.length}</span>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ordered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </PortfolioSection>
  );
}
