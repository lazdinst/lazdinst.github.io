import type { SectionInfoContent } from "@/app/components/SectionInfo";

export const SEARCH_HELP: SectionInfoContent = {
  title: "Device search",
  summary:
    "Every autonomous device in the operating area, favorites first, then recently selected, then the rest. Positions, sensors, and status are simulated from a seeded runtime; nothing here is live telemetry.",
  controls: [
    { name: "Query", detail: "Matches callsign, name, kind, status, and tags. Field syntax: status:fault, kind:quad, tag:isr, energy:<30, mission:patrol, mission:none." },
    { name: "Filters", detail: "Domain chips plus status, charge band, mission type, and kind. Filters stack with the query." },
    { name: "Star", detail: "Pin a device to the Favorites section and mark it on the map." },
    { name: "Row", detail: "Click or press Enter to select. The map and device card follow the selection." },
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
    "Generates three courses of action for one asset and one objective by re-weighting a single cost function: direct favors distance, safe favors risk, efficient favors energy. Ground assets are held to roads and terrain their kind can cross; vessels to water; air assets avoid no-fly zones; nothing enters an exclusion zone.",
  controls: [
    { name: "Target", detail: "Pick a named waypoint or click the map. Patrols loop through waypoints; surveys fly a lawnmower over a preset box." },
    { name: "Generate", detail: "Runs A* over a 60 m cost grid three times and scores each path." },
    { name: "Dispatch", detail: "Approves the selected COA. Refusals show the reason: charging, maintenance, lost link, or an active fault." },
  ],
};

export const ZONES_HELP: SectionInfoContent = {
  title: "Zones",
  summary:
    "Polygons that shape routing. Exclusion zones are keep-outs for every asset; the other types follow each kind's profile: no-fly binds air, shallow water binds vessels, restricted binds all, hazard and low comms add risk. Editing a zone re-rasterizes the planning grid, re-routes active missions that now cross it, and aborts any whose target it swallows.",
  controls: [
    { name: "Draw", detail: "Pick a type, then click the map to place vertices. Double-click, Enter, or clicking the first point closes the ring. Z starts an exclusion zone from anywhere." },
    { name: "Edit shape", detail: "Drag vertices, click an edge midpoint to add one, right-click a vertex to remove it, drag the center dot to move the whole zone. Esc finishes." },
    { name: "Rename / type", detail: "Double-click a name or use the pencil. The type picker changes what the zone binds." },
    { name: "Right-click", detail: "On a zone: edit, rename, retype, delete. On open ground: draw a new zone starting there." },
    { name: "Persistence", detail: "Edited zones are kept per browser until reset to defaults." },
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

export const THREATS_HELP: SectionInfoContent = {
  title: "Threats",
  summary:
    "Hostile tracks in the operating area. They patrol, shoot back inside their weapon range, and are detected by any friendly within a few kilometres. Engage missions send an armed device through the targets, holding at weapon range to fire.",
  controls: [
    { name: "Engage with", detail: "Pick an armed device and dispatch it against the active hostiles, nearest first." },
    { name: "SITREP", detail: "Every 30 s of contact and at the end: targets eliminated, rounds and hits, ammo, armor." },
    { name: "Rearm", detail: "Reload and repair armor at the home depot." },
  ],
};

export const MAP_HELP: SectionInfoContent = {
  title: "Map",
  summary:
    "Basemap tiles from CARTO and OpenStreetMap. Everything drawn on top is simulated: zones, terrain patches, relay coverage, assets, and planned paths.",
  controls: [
    { name: "Fit / follow / reset", detail: "Frame the fleet, keep the selected asset centered, or return to the default view." },
    { name: "Layers", detail: "Toggle zones, terrain, coverage, labels, and paths." },
    { name: "Click", detail: "Selects an asset or a zone. With pick mode on, sets the planner target; while drawing, places a zone vertex." },
  ],
};
