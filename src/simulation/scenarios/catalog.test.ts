import { describe, expect, it } from "vitest";
import { findScenario, SCENARIO_CATALOG } from "./catalog";

describe("scenario catalog", () => {
  it("includes the required named scenarios", () => {
    const ids = SCENARIO_CATALOG.map((scenario) => scenario.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "nominal",
        "dense_bin",
        "sensor_noise",
        "bad_lighting",
        "grasp_slip",
        "vacuum_leak",
        "collision_risk",
        "joint_limit",
        "part_not_found",
        "conveyor_jam",
        "safety_intrusion",
        "camera_offline",
        "payload_overload",
        "motor_overheat",
        "network_latency",
      ])
    );
  });

  it("falls back to nominal for unknown ids", () => {
    expect(findScenario("missing").id).toBe("nominal");
  });
});
