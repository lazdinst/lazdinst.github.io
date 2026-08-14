import {
  SimulationEngine,
  type SimulationEngineConfig,
} from "./SimulationEngine";

export const DEFAULT_SIMULATION_SEED = 0x51e00001;

const DEFAULT_CONFIG: SimulationEngineConfig = {
  seed: DEFAULT_SIMULATION_SEED,
  dtMs: 1000 / 60,
  historyHz: 30,
  historyDurationMs: 30_000,
  eventCapacity: 500,
  scenarioId: "nominal",
  maxStepsPerAdvance: 8,
};

export function createSimulationEngine(
  overrides: Partial<SimulationEngineConfig> = {}
): SimulationEngine {
  return new SimulationEngine({
    ...DEFAULT_CONFIG,
    ...overrides,
  });
}
