export type LinkKind = "github" | "linkedin" | "email" | "website" | "resume";

export interface ProfileLink {
  kind: LinkKind;
  label: string;
  href: string;
}

export type AvailabilityTone = "ok" | "warn" | "neutral";

export interface Availability {
  label: string;
  tone: AvailabilityTone;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface PriorRole {
  role: string;
  start: string;
  end: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  /** Earlier titles held at the same company, most recent first. */
  priorRoles?: PriorRole[];
  location?: string;
  /** Free-form, e.g. "2022" or "Mar 2022". */
  start: string;
  /** Free-form, or "Present". */
  end: string;
  summary?: string;
  highlights: string[];
  stack: string[];
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  /** In-app route for a live showcase. */
  route?: string;
  /** External URL, if the project lives elsewhere. */
  href?: string;
  repo?: string;
  featured?: boolean;
  metrics?: ProjectMetric[];
}

export interface EducationEntry {
  school: string;
  degree: string;
  start: string;
  end: string;
  detail?: string;
}

export interface Profile {
  name: string;
  initials: string;
  title: string;
  tagline: string;
  location: string;
  timezone?: string;
  availability: Availability;
  summary: string[];
  links: ProfileLink[];
  skills: SkillGroup[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
}
