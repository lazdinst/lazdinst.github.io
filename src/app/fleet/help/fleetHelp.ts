import type { SectionInfoContent } from "@/app/components/SectionInfo";

export const ROSTER_HELP: SectionInfoContent = {
  title: "Roster",
  summary:
    "Every autonomous asset in the operating area. Positions, sensors, and status are simulated from a seeded runtime; nothing here is live telemetry.",
  controls: [
    { name: "Search", detail: "Matches callsign, name, kind, status, and tags. Field filters work too: status:fault, kind:quad, domain:sea, tag:isr." },
    { name: "Air / ground / sea", detail: "Toggle domains. Sort by severity, callsign, energy, or service due." },
    { name: "Row", detail: "Click to select. The map, inspector, and planner follow the selection." },
  ],
};

export const STATUS_HELP: SectionInfoContent = {
  title: "Status",
  summary:
    "Live state for the selected asset. Status is derived in priority order: lost link, fault, mission, charging, maintenance due, idle.",
  controls: [
    { name: "Energy", detail: "Battery or fuel. Below 25% on a mission triggers an automatic return to base." },
    { name: "Link", detail: "Nearest enabled relay, RSSI, and quality. Eight seconds out of range marks the link lost." },
    { name: "Inject fault", detail: "Apply a fault to this asset. GPS loss fails the active mission; the rest degrade it." },
  ],
};

export const SENSORS_HELP: SectionInfoContent = {
  title: "Sensors",
  summary:
    "Readings derived from the same state that moves the asset. GPS error rises in the urban canyon, radio follows relay distance, motor temperature follows load and run time.",
  controls: [
    { name: "Health", detail: "0 to 1 per sensor. Degraded below 0.7, failed at 0." },
    { name: "Faults", detail: "A fault pins the affected sensor and propagates into maintenance health." },
  ],
};

export const MAINTENANCE_HELP: SectionInfoContent = {
  title: "Maintenance",
  summary:
    "Hours accrue only while the asset moves. An asset is due when hours exceed the interval or a high-severity work order is open. Due assets need an override to dispatch.",
  controls: [
    { name: "Health", detail: "Composite of wear, open orders, faults, and sensor health." },
    { name: "Mark serviced", detail: "Resets hours and clears work orders." },
  ],
};

export const MISSION_HELP: SectionInfoContent = {
  title: "Mission",
  summary:
    "The active mission for the selected asset. Progress is distance along the approved path; ETA uses the current speed.",
  controls: [
    { name: "Return to base", detail: "Plans and dispatches a route to the home depot immediately." },
    { name: "Abort", detail: "Stops the mission where the asset is." },
  ],
};

export const PLANNER_HELP: SectionInfoContent = {
  title: "Mission planner",
  summary:
    "Generates three courses of action for one asset and one objective by re-weighting a single cost function: direct favors distance, safe favors risk, efficient favors energy. Ground assets are held to roads and terrain their kind can cross; vessels to water; air assets avoid no-fly zones.",
  controls: [
    { name: "Target", detail: "Pick a named waypoint or click the map. Patrols loop through waypoints; surveys fly a lawnmower over a preset box." },
    { name: "Generate", detail: "Runs A* over a 60 m cost grid three times and scores each path." },
    { name: "Dispatch", detail: "Approves the selected COA. Refusals show the reason: charging, maintenance, lost link, or an active fault." },
  ],
};

export const MISSIONS_HELP: SectionInfoContent = {
  title: "Active missions",
  summary: "Everything currently dispatched, with progress and ETA. Recently finished missions stay listed briefly.",
  controls: [{ name: "Abort", detail: "Stops that mission." }],
};

export const TELEMETRY_HELP: SectionInfoContent = {
  title: "Fleet telemetry",
  summary: "Counts by status plus one-second samples of mean link quality and mean energy across the fleet.",
};

export const QUEUE_HELP: SectionInfoContent = {
  title: "Maintenance queue",
  summary: "Assets ordered by how far through their service interval they are. Due assets sit at the top.",
  controls: [{ name: "Service", detail: "Same as Mark serviced in the inspector." }],
};

export const MAP_HELP: SectionInfoContent = {
  title: "Map",
  summary:
    "Basemap tiles from CARTO and OpenStreetMap. Everything drawn on top is simulated: zones, terrain patches, relay coverage, assets, and planned paths.",
  controls: [
    { name: "Fit / follow / reset", detail: "Frame the fleet, keep the selected asset centered, or return to the default view." },
    { name: "Layers", detail: "Toggle zones, terrain, coverage, labels, and paths." },
    { name: "Click", detail: "Selects an asset. With pick mode on, sets the planner target instead." },
  ],
};
