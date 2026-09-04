import type { Profile } from "../types";

/**
 * Single source of truth for everything rendered on the portfolio page.
 * Populated from the resume and the public LinkedIn profile.
 */
export const PROFILE: Profile = {
  name: "Talis A. Lazdins",
  initials: "TL",
  title: "Software Engineering Leader",
  tagline:
    "Building next-gen human-machine interfaces for robotics, automation, and the warfighter.",
  location: "Washington, DC Metro Area",
  timezone: "ET",
  // Swap to { label: "OPEN TO WORK", tone: "ok" } when that should be public.
  availability: { label: "SOFTWARE ENGINEER @ RUNE", tone: "ok" },
  summary: [
    "Software engineering leader with over a decade of experience developing advanced human-machine interfaces that enhance interaction and efficiency.",
    "Expertise spans full-stack development, building scalable software architectures, and leading cross-functional teams to deliver impactful solutions across industries including robotics and automation.",
  ],
  links: [
    { kind: "github", label: "GitHub", href: "https://github.com/lazdinst" },
    {
      kind: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/talis-lazdins/",
    },
    { kind: "email", label: "Email", href: "mailto:lazdinst@gmail.com" },
    { kind: "resume", label: "Resume", href: "/resume.pdf" }, // TODO: drop a PDF in /public
  ],
  skills: [
    {
      label: "Frontend",
      items: [
        "TypeScript",
        "React",
        "Redux",
        "Three.js",
        "URDF",
        "styled-components",
        "Tailwind CSS",
        "Material UI",
      ],
    },
    {
      label: "Backend",
      items: [
        "Node.js",
        "Python",
        "Rust",
        "gRPC",
        "WebSockets",
        "REST",
        "Django",
        "Express",
        "MCP servers",
      ],
    },
    {
      label: "Data",
      items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "InfluxDB"],
    },
    {
      label: "DevOps",
      items: ["Docker", "Azure DevOps", "CircleCI", "CI/CD"],
    },
    {
      label: "Domain",
      items: [
        "Human-Machine Interface",
        "Robotics & Automation",
        "Warehouse Automation",
        "Engineering Management",
        "Project Management",
      ],
    },
  ],
  experience: [
    {
      company: "Rune Technologies",
      role: "Software Engineer",
      location: "Washington, DC · On-site",
      start: "Dec 2025",
      end: "Present",
      summary:
        "Building TyrOS, an AI-enabled logistics platform that helps the U.S. military make better decisions in contested, comms-denied environments.",
      highlights: [
        "Front-end engineering on an offline-first logistics system covering inventory, maintenance, routing, and medical logistics.",
        "Part of the team delivering the sustainment application for Lockheed Martin's Army Next Generation Command and Control (NGC2) prototype.",
      ],
      stack: ["TypeScript", "React", "Node.js"],
    },
    {
      company: "Amazon",
      role: "Sr. Software Development Engineer",
      location: "Washington, DC",
      start: "Mar 2025",
      end: "Dec 2025",
      summary:
        "Led design and development of a next-generation HMI platform unifying visualization, telemetry, and control across Amazon's robotic automation ecosystem.",
      highlights: [
        "Architected and implemented a full-stack system using React, Redux, TypeScript, and Node.js, enabling real-time machine interaction and modular expansion for new hardware and workflows.",
        "Developed AI-driven troubleshooting agents that leverage MCP servers to provide contextual insights, execute autonomous diagnostics, and recommend targeted recovery actions for operators.",
        "Delivered self-healing capabilities allowing automation systems to identify, isolate, and resolve operational faults automatically, reducing downtime and manual intervention.",
        "Built backend data services integrating DynamoDB for persistent system state and InfluxDB for high-frequency time-series telemetry, analytics, and performance monitoring.",
        "Collaborated with UX, hardware, and controls engineering teams to design unified operator experiences bridging real-time visualization, command control, and safety-critical workflows.",
        "Contributed to the long-term technical roadmap by defining architectural principles, deployment standards, and engineering practices for scalable growth and reliability.",
      ],
      stack: ["TypeScript", "React", "Redux", "Node.js", "DynamoDB", "InfluxDB", "MCP"],
    },
    {
      company: "Priede Engineering",
      role: "Owner & Software Engineer",
      location: "Washington, DC",
      start: "Sep 2023",
      end: "Mar 2025",
      summary:
        "Founded a consultancy focused on collaborative robotics and next-gen human-machine interfaces.",
      highlights: [
        "Built real-time operator UIs with React, TypeScript, and styled-components for robot visualization.",
        "Developed backends in Node.js and Python to sync sensors, track state, and control robot tasks.",
        "Created internal tools for state machines, telemetry logging, and analytics with Redis and PostgreSQL.",
        "Deployed CI/CD pipelines via Azure DevOps to automate Docker-based infrastructure updates.",
        "Led roadmap planning, sprint reviews, and integration efforts with mechanical and controls teams.",
      ],
      stack: ["TypeScript", "React", "Node.js", "Python", "Redis", "PostgreSQL", "Docker", "Azure DevOps"],
    },
    {
      company: "OSARO",
      role: "Engineering Manager",
      priorRoles: [
        { role: "Senior Software Engineer", start: "Dec 2017", end: "Jan 2020" },
      ],
      location: "San Francisco, CA",
      start: "Dec 2017",
      end: "Jun 2023",
      summary:
        "Six years at a robotic vision startup, from seed through Series D, moving from senior engineer to engineering manager.",
      highlights: [
        "Led a team of six engineers while contributing to architecture and delivery of robotic vision software.",
        "Recruited talent, mentored ICs, and fostered a high-quality engineering culture with regular code reviews.",
        "Coordinated with PMs, mechatronics, and QA to align the product roadmap with field-tested deployments.",
        "Set coding standards, CI/CD practices, and design patterns for scalable frontend and backend services.",
        "Built and maintained multiple React and Redux applications for real-time robot control and visualization.",
        "Developed robotic HMI tools using Three.js and URDF for 3D scene rendering and manipulation.",
        "Migrated API services from Python Django to Rust gRPC, improving type safety and performance.",
        "Implemented REST APIs and WebSocket clients to enable low-latency machine feedback loops.",
        "Delivered production-grade CI/CD pipelines with CircleCI and semantic versioning practices.",
      ],
      stack: ["TypeScript", "React", "Redux", "Three.js", "URDF", "Python", "Rust", "gRPC", "CircleCI"],
    },
    {
      company: "Albertsons Companies",
      role: "Sr. Technical Project Manager",
      priorRoles: [
        { role: "Technical Project Manager", start: "May 2016", end: "Nov 2016" },
      ],
      location: "San Francisco, CA",
      start: "May 2016",
      end: "Jun 2017",
      highlights: [
        "Directed end-to-end WMS migration strategy, optimizing workflows and minimizing disruptions.",
        "Spearheaded the development and deployment of robotics automation projects valued up to $15M.",
        "Led warehouse automation efforts during the Safeway-Albertsons merger, driving system standardization.",
        "Managed budgeting, timelines, and execution of large-scale automation and logistics technology projects.",
        "Managed the migration of Safeway's Warehouse Management System into Albertsons' infrastructure.",
        "Led commissioning and testing of warehouse voice-picking systems to improve fulfillment efficiency.",
        "Supported the implementation of an automated storage system, ensuring alignment with operational needs.",
      ],
      stack: ["WMS", "Warehouse Automation", "Program Management"],
    },
    {
      company: "Dematic Corporation",
      role: "Project Manager",
      priorRoles: [
        { role: "Project Engineer", start: "", end: "" },
        { role: "Senior Software Applications Engineer", start: "", end: "" },
      ],
      location: "Grand Rapids, MI",
      start: "Dec 2012",
      end: "May 2016",
      summary:
        "Software, controls, and project delivery for large-scale warehouse automation and material handling systems.",
      highlights: [
        "Led full-cycle project management for large-scale warehouse automation, ensuring coordinated execution.",
        "Managed a cross-functional team of 20+ engineers, overseeing design, installation, and commissioning.",
        "Delivered automation projects up to $30M on time and within budget.",
        "Designed and implemented robotic automation solutions for high-volume warehouse operations, including system layouts, control logic, and integration plans.",
        "Developed software to automate robotics and material handling in large-scale fulfillment warehouses.",
        "Designed and implemented HMIs to provide intuitive control and monitoring of automation systems.",
        "Engineered control systems integrating logic controllers and distributed field devices.",
      ],
      stack: ["HMI", "Controls", "Material Handling", "Robotics"],
    },
    {
      company: "Bloom Energy",
      role: "Systems Engineer",
      location: "Sunnyvale, CA",
      start: "May 2010",
      end: "Jan 2012",
      highlights: [
        "Built an internal full-stack tool to visualize GIS data and support real-time field asset tracking.",
        "Developed data integration features connecting spreadsheet-based inputs to geographic map overlays.",
        "Diagnosed software, electrical, and mechanical issues to improve fuel cell system uptime.",
        "Analyzed system fault logs to propose software enhancements and support predictive maintenance.",
        "Partnered with cross-functional teams to improve data workflows and overall system performance.",
      ],
      stack: ["GIS", "Full-stack", "Fuel Cell Systems"],
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
    {
      id: "fleet",
      title: "SkyNet",
      summary:
        "Autonomous fleet console on a Leaflet map: 18 simulated drones, rovers, legged robots, and surface vessels with derived sensor suites, relay link budgets, and maintenance state. A course-of-action planner runs A* over a per-kind cost grid and scores direct, safe, and efficient routes before dispatch.",
      stack: ["React", "Leaflet", "TypeScript", "A* planning", "Tailwind CSS", "Vitest"],
      route: "/showcase/fleet",
      repo: "https://github.com/lazdinst/lazdinst.github.io",
      featured: true,
      metrics: [
        { label: "Assets", value: "18" },
        { label: "Kinds", value: "6" },
        { label: "Planner", value: "A* ×3" },
        { label: "Playback", value: "Scrub" },
      ],
    },
  ],
  education: [
    {
      school: "Grand Valley State University · Grand Rapids, MI",
      degree: "B.S. Electrical Engineering",
      start: "",
      end: "",
      detail: "IEEE Student Branch · Applied Global Innovation Initiative (AGII)",
    },
    {
      school: "Hack Reactor · San Francisco, CA",
      degree: "Software Engineering Immersive",
      start: "Jun 2017",
      end: "Sep 2017",
      detail:
        "Full-stack JavaScript: Node.js, React, Angular, MySQL, PostgreSQL, and MongoDB in Agile, team-based sprints.",
    },
  ],
};
