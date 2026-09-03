import { useEffect } from "react";
import {
  AboutSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  Hero,
  PortfolioFooter,
  PortfolioHeader,
  ProfileAside,
  ProjectsSection,
} from "./components";
import { PROFILE } from "./data";

export function PortfolioPage() {
  useEffect(() => {
    document.title = `${PROFILE.name} · ${PROFILE.title}`;
  }, []);

  const repo = PROFILE.projects.find((project) => project.featured)?.repo;

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <PortfolioHeader profile={PROFILE} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
        <Hero profile={PROFILE} />
        <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <ProfileAside profile={PROFILE} />
          <div className="flex min-w-0 flex-col gap-10">
            <AboutSection paragraphs={PROFILE.summary} />
            <ProjectsSection projects={PROFILE.projects} />
            <ExperienceSection experience={PROFILE.experience} />
            <EducationSection education={PROFILE.education} />
            <ContactSection profile={PROFILE} />
          </div>
        </div>
      </main>
      <PortfolioFooter profile={PROFILE} repoHref={repo} />
    </div>
  );
}

export default PortfolioPage;
