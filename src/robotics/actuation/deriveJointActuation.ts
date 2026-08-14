export interface JointActuationInput {
  velocityRadSec: number;
  accelerationRadSec2: number;
  payloadKg: number;
  overheat: boolean;
  overload: boolean;
  previousTemperatureC: number;
  dtSec: number;
}

export interface JointActuation {
  torqueNm: number;
  motorCurrentA: number;
  temperatureC: number;
}

const KT = 0.42;
const IDLE_TEMP_C = 36;
const THERMAL_TAU = 8;

export function deriveJointActuation(input: JointActuationInput): JointActuation {
  const inertial = Math.abs(input.accelerationRadSec2) * (0.18 + input.payloadKg * 0.08);
  const viscous = Math.abs(input.velocityRadSec) * (0.35 + input.payloadKg * 0.12);
  const gravity = input.payloadKg * 0.9;
  const overload = input.overload ? 18 : 0;
  const torqueNm = inertial + viscous + gravity + overload;
  const motorCurrentA = torqueNm / KT + (input.overload ? 4 : 0);
  const targetTemp =
    IDLE_TEMP_C +
    motorCurrentA * 1.6 +
    (input.overheat ? 28 : 0) +
    (input.overload ? 12 : 0);
  const alpha = 1 - Math.exp(-Math.max(input.dtSec, 0) / THERMAL_TAU);
  const temperatureC =
    input.previousTemperatureC + (targetTemp - input.previousTemperatureC) * alpha;

  return { torqueNm, motorCurrentA, temperatureC };
}
