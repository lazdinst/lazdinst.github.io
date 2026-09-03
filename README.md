# lazdinst.github.io

Portfolio site with two full-screen showcases built on one shared instrument-panel chrome.

- `/showcase/workcell` — a robot pick-and-place cell: URDF-rendered Fanuc arm, Jacobian IK, seeded simulation with fault injection, perception overlays, safety zones, and scrub-able playback.
- `/showcase/fleet` — Fleet Ops: an autonomous fleet console on a Leaflet map. Eighteen simulated drones, rovers, legged robots, and surface vessels with derived sensor suites, relay link budgets, and maintenance state. A course-of-action planner runs A* over a per-kind cost grid and scores direct, safe, and efficient routes before dispatch.

## Layout

- `src/portfolio` — landing page and the profile data that drives it.
- `src/app` — React chrome shared by the showcases (`AppChrome`, inspector groups, meters, event console and timeline) plus the workcell containers.
- `src/app/fleet` — Fleet Ops React containers, hooks, and map layers.
- `src/fleet` — pure TypeScript fleet domain: operating area, asset seeds, geo math, terrain grid and cost maps, A* planner, motion and energy models, sensors and link, maintenance, search, and the `FleetRuntime` that ticks it all.
- `src/simulation`, `src/robotics`, `src/workcell`, `src/perception` — workcell domain modules and the shared simulation primitives (clock, seeded RNG, ring buffer, event log).

## Scripts

```
npm run dev      # Vite dev server
npm test         # Vitest, node environment, domain modules only
npm run lint
npm run build    # tsc -b && vite build → docs/ (served by GitHub Pages)
```

## Basemap

Fleet Ops uses Esri's World Light Gray and World Dark Gray canvas tiles with attribution. Everything drawn on top of them is simulated.

## URDF files

https://github.com/Daniella1/urdf_files_dataset/tree/main/urdf_files/ros-industrial/xacro_generated/fanuc
