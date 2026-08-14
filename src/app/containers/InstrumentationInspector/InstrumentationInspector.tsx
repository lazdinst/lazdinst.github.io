import { INSTRUMENTATION_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useDiagnostics, useWorkcell } from "@/app/context";

export function InstrumentationInspector() {
  const { forceTorque, conveyor, gripper } = useDiagnostics();
  const { tool } = useWorkcell();
  const vacuum = tool.vacuum;

  return (
    <PanelSection title="Instrumentation" info={INSTRUMENTATION_HELP}>
          <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
            {forceTorque ? (
              <p>
                F/T {forceTorque.fxN.toFixed(1)} {forceTorque.fyN.toFixed(1)}{" "}
                {forceTorque.fzN.toFixed(1)} N · T {forceTorque.tzNm.toFixed(2)} Nm
              </p>
            ) : (
              <p>F/T waiting for sample</p>
            )}
            {vacuum ? (
              <p>
                vac {vacuum.enabled ? "ON" : "off"} · {vacuum.pressureKPa.toFixed(0)} kPa ·
                flow {vacuum.flowLMin.toFixed(1)} · seal{" "}
                {(vacuum.sealQuality * 100).toFixed(0)}%
              </p>
            ) : null}
            {gripper ? (
              <p>
                grip {gripper.openingWidthMm.toFixed(1)} mm ·{" "}
                {gripper.gripForceN.toFixed(1)} N
                {gripper.contact ? " · CONTACT" : ""}
              </p>
            ) : null}
            {conveyor ? (
              <p>
                conv {conveyor.velocityMmSec.toFixed(0)} mm/s ·{" "}
                {conveyor.distanceMm.toFixed(0)} mm
                {conveyor.jammed ? " · JAM" : ""}
              </p>
            ) : null}
          </div>
    </PanelSection>
  );
}
