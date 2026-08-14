export interface SimulationStepContext {
  timestampMs: number;
  dtMs: number;
  stepCount: number;
  seed: number;
}

export interface SimulationSubsystem {
  reset(seed: number): void;
  step(ctx: SimulationStepContext): void;
}
