import type { Profile } from "../types";

/**
 * Single source of truth for everything rendered on the portfolio page.
 *
 * Entries marked PLACEHOLDER are generic filler so the layout reads well.
 * Replace them with real details from the resume; nothing else needs to change.
 */
export const PROFILE: Profile = {
  name: "Talis Lazdins",
  initials: "TL",
  title: "Software Engineer",
  tagline: "Building control interfaces, simulation tooling, and the systems that sit between hardware and people.",
  location: "PLACEHOLDER City, ST", // PLACEHOLDER
  timezone: "UTC−05:00", // PLACEHOLDER
  availability: { label: "OPEN TO WORK", tone: "ok" }, // PLACEHOLDER: e.g. "AVAILABLE Q1" / "NOT LOOKING"
  summary: [
    // PLACEHOLDER copy — swap for the resume summary.
    "I design and ship software for robotics and industrial systems: real-time operator UIs, kinematics and motion tooling, and the data plumbing that keeps a cell observable.",
    "I care about interfaces that feel like instruments — dense, legible, and honest about what the machine is doing.",
  ],
  links: [
    { kind: "github", label: "GitHub", href: "https://github.com/lazdinst" },
    {
      kind: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/PLACEHOLDER", // PLACEHOLDER
    },
    { kind: "email", label: "Email", href: "mailto:hello@example.com" }, // PLACEHOLDER
    { kind: "resume", label: "Resume", href: "/resume.pdf" }, // PLACEHOLDER: drop a PDF in /public
  ],
  skills: [
    {
      label: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "C++"],
    },
    {
      label: "Frontend",
      items: ["React", "Redux Toolkit", "Tailwind CSS", "Three.js", "Vite"],
    },
    {
      label: "Robotics",
      items: ["URDF", "Kinematics / IK", "Motion planning", "ROS", "Perception"],
    },
    {
      label: "Tooling",
      items: ["Node.js", "Vitest", "Docker", "GitHub Actions", "Linux"],
    },
  ],
  experience: [
    // PLACEHOLDER employment history — replace with resume entries.
    {
      company: "Acme Robotics",
      role: "Senior Software Engineer",
      location: "Remote",
      start: "2022",
      end: "Present",
      summary:
        "Owner of the operator-facing control stack for a fleet of six-axis industrial arms.",
      highlights: [
        "Led the rewrite of the cell HMI into a React + Three.js console with live URDF rendering, jog controls, and telemetry overlays.",
        "Built a browser-side simulation runtime (seeded RNG, ring-buffered snapshots, fault injection) used for demos and regression tests.",
        "Reduced mean time-to-diagnose on pick failures by adding an event timeline with scrub-to-snapshot playback.",
      ],
      stack: ["TypeScript", "React", "Three.js", "Redux", "Vitest"],
    },
    {
      company: "Northwind Systems",
      role: "Software Engineer",
      location: "Boston, MA",
      start: "2019",
      end: "2022",
      summary:
        "Full-stack engineer on an industrial monitoring platform for discrete manufacturing.",
      highlights: [
        "Designed the PLC I/O ingestion service and the dashboards that surfaced it to line operators.",
        "Introduced typed API contracts across the frontend and backend, cutting integration defects in half.",
        "Mentored two junior engineers and ran the team's frontend design reviews.",
      ],
      stack: ["TypeScript", "Node.js", "PostgreSQL", "React", "Docker"],
    },
    {
      company: "Initech",
      role: "Junior Developer",
      location: "Austin, TX",
      start: "2017",
      end: "2019",
      highlights: [
        "Shipped features across a customer-facing web application and its internal admin tooling.",
        "Automated the release pipeline and moved the team onto continuous deployment.",
      ],
      stack: ["JavaScript", "Python", "AWS"],
    },
  ],
  projects: [
    {
      id: "workcell",
      title: "Robot Workcell Console",
      summary:
        "An interactive pick-and-place cell running entirely in the browser: a Fanuc LR Mate 200iD rendered from URDF, Jacobian IK, a seeded simulation engine with fault injection, perception overlays, safety zones, and scrub-able event playback.",
      stack: [
        "React",
        "Three.js",
        "TypeScript",
        "Redux Toolkit",
        "Tailwind CSS",
        "Vitest",
      ],
      route: "/showcase/workcell",
      repo: "https://github.com/lazdinst/lazdinst.github.io",
      featured: true,
      metrics: [
        { label: "Axes", value: "6" },
        { label: "IK", value: "Jacobian" },
        { label: "Faults", value: "Injectable" },
        { label: "Playback", value: "Scrub" },
      ],
    },
    // PLACEHOLDER projects — replace or remove.
    {
      id: "telemetry",
      title: "Telemetry Streamer",
      summary:
        "Ring-buffered time-series charts for high-rate joint and TCP data, with per-channel sparklines and threshold tones.",
      stack: ["TypeScript", "Recharts", "Web Workers"],
      repo: "https://github.com/lazdinst",
    },
    {
      id: "ik-lab",
      title: "IK Lab",
      summary:
        "A small kinematics playground for comparing damped least-squares and CCD solvers on arbitrary URDF chains.",
      stack: ["TypeScript", "Three.js"],
      repo: "https://github.com/lazdinst",
    },
  ],
  education: [
    // PLACEHOLDER
    {
      school: "State University",
      degree: "B.S. Computer Science",
      start: "2013",
      end: "2017",
      detail: "Focus on robotics and human-computer interaction.",
    },
  ],
};
