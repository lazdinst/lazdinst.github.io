import { simulationEngine } from "@/simulation";
import { getOptionalUrdfPath } from "@/utils/getURDFPath";
import { resolveInitialUrdfModel } from "./models/urdfCatalog";
import { RobotRuntime } from "./controller/RobotRuntime";

export const robotRuntime = new RobotRuntime(
  resolveInitialUrdfModel(getOptionalUrdfPath())
);

robotRuntime.setEventEmitter(
  (severity, source, eventCode, message, metadata) => {
    simulationEngine.emitDomainEvent(
      severity,
      source,
      eventCode,
      message,
      metadata
    );
  }
);

simulationEngine.setRobotTelemetryProvider(robotRuntime);

simulationEngine.registerSubsystem({
  reset: () => {
    robotRuntime.cancelMotion();
    robotRuntime.resetPose();
  },
  step: (ctx) => {
    robotRuntime.step(ctx.timestampMs, ctx.dtMs);
  },
});

export function subscribeRobotView(onStoreChange: () => void): () => void {
  return robotRuntime.subscribeView(onStoreChange);
}

export function getRobotView() {
  return robotRuntime.getView();
}
