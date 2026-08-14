import { InspectorGroup } from "../../components/InspectorGroup";
import {
  DIAGNOSTICS_HELP,
  INSTRUMENTATION_HELP,
  IO_HELP,
  OPERATION_HELP,
  PERCEPTION_HELP,
  ROBOT_HELP,
  SAFETY_HELP,
} from "../../components/InspectorGroup/inspectorHelp";
import { ControlHelpCallout } from "../../components/ControlHelpNote";
import { CartesianControl } from "../CartesianControl/CartesianControl";
import { CellIoInspector } from "../CellIoInspector/CellIoInspector";
import { FaultInspector } from "../FaultInspector/FaultInspector";
import { InstrumentationInspector } from "../InstrumentationInspector/InstrumentationInspector";
import { JointControls } from "../JointControls/JointControls";
import { PerceptionInspector } from "../PerceptionInspector";
import { SafetyInspector } from "../SafetyInspector/SafetyInspector";
import { WorkcellInspector } from "../WorkcellInspector";

export function JointInspector() {
  return (
    <>
      <ControlHelpCallout />
      <InspectorGroup label="Operation" info={OPERATION_HELP}>
        <WorkcellInspector />
      </InspectorGroup>
      <InspectorGroup label="Robot" info={ROBOT_HELP}>
        <JointControls />
        <CartesianControl />
      </InspectorGroup>
      <InspectorGroup label="Perception" info={PERCEPTION_HELP}>
        <PerceptionInspector />
      </InspectorGroup>
      <InspectorGroup label="Instrumentation" info={INSTRUMENTATION_HELP}>
        <InstrumentationInspector />
      </InspectorGroup>
      <InspectorGroup label="I/O" info={IO_HELP}>
        <CellIoInspector />
      </InspectorGroup>
      <InspectorGroup label="Safety" info={SAFETY_HELP}>
        <SafetyInspector />
      </InspectorGroup>
      <InspectorGroup label="Diagnostics" info={DIAGNOSTICS_HELP}>
        <FaultInspector />
      </InspectorGroup>
    </>
  );
}

export default JointInspector;
