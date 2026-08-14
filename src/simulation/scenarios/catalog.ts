import { NOMINAL_SCENARIO_ID, type ScenarioDefinition } from "./types";

export const SCENARIO_CATALOG: ScenarioDefinition[] = [
  {
    id: NOMINAL_SCENARIO_ID,
    name: "Nominal Production",
    description: "Baseline tote pick with healthy sensors and no injected faults.",
  },
  {
    id: "dense_bin",
    name: "Dense Bin",
    description: "More parts in the same tote, increasing occlusion.",
    partCount: 10,
  },
  {
    id: "sensor_noise",
    name: "Sensor Noise",
    description: "Elevated depth noise and dropout on the overhead RGB-D camera.",
    perceptionNoiseMm: 6.5,
    perceptionDropout: 0.28,
  },
  {
    id: "bad_lighting",
    name: "Bad Lighting",
    description: "Low-contrast lighting reduces detection confidence.",
    perceptionNoiseMm: 4.2,
    perceptionDropout: 0.18,
    networkLatencyMs: 40,
  },
  {
    id: "grasp_slip",
    name: "Grasp Slip",
    description: "Seal quality collapses after contact.",
    graspSlipBias: 1,
    faults: [{ id: "grasp_slip" }],
  },
  {
    id: "vacuum_leak",
    name: "Vacuum Leak",
    description: "Suction circuit leaks and cannot hold a part.",
    vacuumLeak: 0.72,
    faults: [{ id: "vacuum_loss" }],
  },
  {
    id: "collision_risk",
    name: "Collision Risk",
    description: "Dense clutter that raises approach obstruction risk.",
    partCount: 10,
    perceptionNoiseMm: 3.2,
  },
  {
    id: "joint_limit",
    name: "Joint Limit",
    description: "Payload and reach conditions that stress joint limits.",
    payloadScale: 2.4,
  },
  {
    id: "part_not_found",
    name: "Part Not Found",
    description: "Camera is offline so perception never returns detections.",
    cameraOffline: true,
    faults: [{ id: "camera_disconnect" }],
  },
  {
    id: "conveyor_jam",
    name: "Conveyor Jam",
    description: "Destination conveyor encoder stops and ready is false.",
    conveyorJammed: true,
  },
  {
    id: "safety_intrusion",
    name: "Safety Intrusion",
    description: "Protective zone occupancy trips a protective stop.",
    safetyIntrusion: "protective",
    faults: [{ id: "safety_trip" }],
  },
  {
    id: "camera_offline",
    name: "Camera Offline",
    description: "RGB-D camera reports offline and no frames are published.",
    cameraOffline: true,
    faults: [{ id: "camera_disconnect" }],
  },
  {
    id: "payload_overload",
    name: "Payload Overload",
    description: "Grasped mass is scaled up and joints report overload.",
    payloadScale: 4,
    faults: [{ id: "joint_overload" }],
  },
  {
    id: "motor_overheat",
    name: "Motor Overheat",
    description: "Motor thermal bias drives temperatures into a warning band.",
    motorOverheat: true,
  },
  {
    id: "network_latency",
    name: "Network Latency",
    description: "Perception latency increases without changing geometry.",
    networkLatencyMs: 120,
  },
];

export function findScenario(id: string): ScenarioDefinition {
  return (
    SCENARIO_CATALOG.find((scenario) => scenario.id === id) ??
    SCENARIO_CATALOG[0]
  );
}
