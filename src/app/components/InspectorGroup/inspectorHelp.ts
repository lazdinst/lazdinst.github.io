import type { SectionInfoContent } from "../SectionInfo";

export const OPERATION_HELP: SectionInfoContent = {
  title: "Operation",
  summary:
    "Live pick-cell status. The workcell list is the same object set shown in the tote and used by perception and grasp planning.",
  controls: [
    {
      name: "Phase / cycle",
      detail: "Current pick state machine step and completed cycle count.",
    },
    {
      name: "Part list",
      detail: "Click a part to select it in 3D, detections, and the pick planner.",
    },
    {
      name: "AUTO PICK / STEP",
      detail: "Command-bar buttons start a full cycle or advance one phase.",
    },
  ],
};

export const ROBOT_HELP: SectionInfoContent = {
  title: "Robot",
  summary:
    "Authoritative joint state drives forward kinematics. Cartesian fields solve inverse kinematics back into those same joints. The ghost arm previews the target, not the live pose.",
  controls: [
    {
      name: "Sliders / numeric joints",
      detail: "Command each actuated axis. Bounds come from the loaded URDF.",
    },
    {
      name: "HOME",
      detail: "Return to the model home pose and cancel motion.",
    },
    {
      name: "Ghost",
      detail: "Show a translucent target robot at the commanded joints.",
    },
    {
      name: "X Y Z / Rx Ry Rz",
      detail: "Command TCP pose. Unreachable or near-singular targets are rejected.",
    },
  ],
};

export const PERCEPTION_HELP: SectionInfoContent = {
  title: "Perception",
  summary:
    "Synthetic RGB-D cycle. Detections and the point cloud are generated from known workpiece geometry, then noised. Selecting a detection selects the same part everywhere.",
  controls: [
    {
      name: "Tote map / list",
      detail: "Click a detection to target that part for grasp planning.",
    },
    {
      name: "Point cloud",
      detail: "Toggle visibility of the overhead cloud in the 3D view.",
    },
    {
      name: "Density / noise / dropout",
      detail: "Change sampling quality. These are visualization and perception parameters, not CAD edits.",
    },
    {
      name: "Color",
      detail: "RGB, height, segmentation, or confidence coloring.",
    },
  ],
};

export const INSTRUMENTATION_HELP: SectionInfoContent = {
  title: "Instrumentation",
  summary:
    "Sensor readbacks derived from the same simulation state as motion and grasping. Values are correlated, not independent random streams.",
  controls: [
    {
      name: "F/T",
      detail: "TCP force/torque. Fz rises on contact, payload, and vacuum seal.",
    },
    {
      name: "Vacuum",
      detail: "Pressure, flow, and seal. A leak or slip prevents object secured.",
    },
    {
      name: "Gripper",
      detail: "Opening width and grip force. Closes with suction during a pick.",
    },
    {
      name: "Conveyor",
      detail: "Encoder velocity and distance. A jam holds the count.",
    },
  ],
};

export const IO_HELP: SectionInfoContent = {
  title: "Cell I/O",
  summary:
    "PLC-style digital map used by the cell. Inputs are derived from sensors and process state. Outputs are commanded by the pick cycle.",
  controls: [
    {
      name: "Input switches",
      detail: "Override a bit for manual/simulation testing. OVRD marks a forced value.",
    },
    {
      name: "Outputs",
      detail: "Live commanded bits: vacuum, conveyor, stack lights.",
    },
    {
      name: "PLC comms",
      detail: "A PLC-loss fault freezes the last sampled map.",
    },
  ],
};

export const SAFETY_HELP: SectionInfoContent = {
  title: "Safety",
  summary:
    "Zone occupancy and interlocks. These are simulated safety conditions, not a certified safety PLC. Yellow is warning; red is protective.",
  controls: [
    {
      name: "Warning zone",
      detail: "Occupancy reduces commanded robot speed to 40%.",
    },
    {
      name: "Protective zone / E-stop / curtain / door",
      detail: "Any trip issues a protective stop, cancels motion, and fails the active pick.",
    },
  ],
};

export const JOINTS_HELP: SectionInfoContent = {
  title: "Joints",
  summary:
    "Each row is one actuated URDF axis. Slider and numeric field write the same joint command. Limits are extracted from the robot model, not hardcoded.",
  controls: [
    {
      name: "Slider / value",
      detail: "Set joint position. Out-of-range values clamp to the URDF limit.",
    },
    {
      name: "HOME",
      detail: "Return every axis to the catalog home pose.",
    },
    {
      name: "Ghost",
      detail: "Show a translucent target robot at the commanded joints.",
    },
  ],
};

export const CARTESIAN_HELP: SectionInfoContent = {
  title: "Cartesian",
  summary:
    "TCP pose readback from forward kinematics. Editing a field runs inverse kinematics. The live arm and the ghost stay on one joint state path.",
  controls: [
    {
      name: "X Y Z",
      detail: "Tool-center-point position in millimeters.",
    },
    {
      name: "Rx Ry Rz",
      detail: "Tool orientation. Units follow the command-bar deg/rad toggle.",
    },
    {
      name: "WASD / arrows / Q E",
      detail: "Jog TCP after clicking the 3D view. Ignored while a number field is focused.",
    },
  ],
};

export const CELL_ANALYTICS_HELP: SectionInfoContent = {
  title: "Cell analytics",
  summary:
    "Simulated pick-cell throughput and OEE. Availability is uptime minus stopped time. Performance is mean cycle time versus an 8 s target. Quality is successful picks over completed cycles.",
  controls: [
    {
      name: "OEE",
      detail: "Availability × performance × quality. Nominal 100% before the first cycle.",
    },
    {
      name: "Cycle time",
      detail: "Sparkline of recent cycle durations. Mean and P95 are computed from every completed cycle.",
    },
    {
      name: "Failures",
      detail: "Counts by category from failed picks. Bars are relative to the largest category.",
    },
  ],
};

export const TCP_TELEMETRY_HELP: SectionInfoContent = {
  title: "TCP",
  summary:
    "Live tool-center-point pose and velocity from the same forward-kinematics path as the 3D arm.",
  controls: [
    {
      name: "Speed",
      detail: "Linear TCP speed in mm/s derived from successive poses.",
    },
    {
      name: "X Y Z / Rx Ry Rz",
      detail: "Position in millimeters and orientation in the command-bar angle unit.",
    },
  ],
};

export const JOINT_GRAPHS_HELP: SectionInfoContent = {
  title: "Joints",
  summary:
    "Streaming joint angles plus actuation readbacks. Position traces use the URDF limits as the plot domain. Utilization, current, and temperature come from the live joint telemetry.",
  controls: [
    {
      name: "Sparkline",
      detail: "Recent commanded joint angle over simulation time.",
    },
    {
      name: "Util / vel / temp / A",
      detail: "Limit utilization, angular velocity, winding temperature, and motor current for that axis.",
    },
  ],
};

export const DIAGNOSTICS_HELP: SectionInfoContent = {
  title: "Diagnostics",
  summary:
    "Named scenarios retune the same simulation. Faults propagate through perception, tooling, I/O, and safety instead of only showing an alert.",
  controls: [
    {
      name: "Scenario",
      detail: "Applies composable parameters and resets the cell. Same seed is deterministic.",
    },
    {
      name: "Inject / active",
      detail: "Click a fault to inject or clear it. Command-bar INJECT FAULT does the same.",
    },
    {
      name: "Timeline / terminal",
      detail: "Click an event or scrub the output timeline to inspect history without replaying side effects.",
    },
  ],
};
