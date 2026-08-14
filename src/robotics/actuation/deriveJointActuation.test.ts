import { describe, expect, it } from "vitest";
import { deriveJointActuation } from "./deriveJointActuation";

describe("deriveJointActuation", () => {
  it("increases torque with payload and acceleration", () => {
    const idle = deriveJointActuation({
      velocityRadSec: 0,
      accelerationRadSec2: 0,
      payloadKg: 0,
      overheat: false,
      overload: false,
      previousTemperatureC: 36,
      dtSec: 0.1,
    });
    const loaded = deriveJointActuation({
      velocityRadSec: 1.2,
      accelerationRadSec2: 4,
      payloadKg: 2,
      overheat: false,
      overload: false,
      previousTemperatureC: 36,
      dtSec: 0.1,
    });
    expect(loaded.torqueNm).toBeGreaterThan(idle.torqueNm);
    expect(loaded.motorCurrentA).toBeGreaterThan(idle.motorCurrentA);
  });

  it("heats when overheat or overload is set", () => {
    const hot = deriveJointActuation({
      velocityRadSec: 0.4,
      accelerationRadSec2: 1,
      payloadKg: 1,
      overheat: true,
      overload: true,
      previousTemperatureC: 36,
      dtSec: 1,
    });
    expect(hot.temperatureC).toBeGreaterThan(50);
    expect(hot.torqueNm).toBeGreaterThan(15);
  });
});
