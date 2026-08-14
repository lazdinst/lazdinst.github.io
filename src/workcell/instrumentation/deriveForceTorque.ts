import type { ForceTorqueTelemetry } from "@/simulation";
import type { SeededRng } from "@/simulation";

export interface ForceTorqueInput {
  contacting: boolean;
  payloadKg: number;
  linearAccelMmSec2: number;
  vacuumEnabled: boolean;
  vacuumSeal: number;
  gripperForceN: number;
}

export function deriveForceTorque(
  input: ForceTorqueInput,
  rng: SeededRng
): ForceTorqueTelemetry {
  const payloadN = input.payloadKg * 9.81;
  const inertialN = (input.payloadKg * input.linearAccelMmSec2) / 1000;
  const vacuumN = input.vacuumEnabled ? input.vacuumSeal * (18 + payloadN * 0.35) : 0;
  const contactN = input.contacting ? payloadN + vacuumN + input.gripperForceN : 0;
  const noise = () => rng.nextGaussian() * (input.contacting ? 0.35 : 0.08);

  return {
    fxN: inertialN * 0.25 + noise(),
    fyN: inertialN * 0.12 + noise(),
    fzN: contactN + noise(),
    txNm: input.contacting ? 0.08 * payloadN + noise() * 0.05 : noise() * 0.02,
    tyNm: input.contacting ? 0.05 * payloadN + noise() * 0.05 : noise() * 0.02,
    tzNm: noise() * 0.03,
  };
}
