import { FloatingPanel } from "../components";
import { ActiveMissions } from "../containers/ActiveMissions";
import { MissionPlanner } from "../containers/MissionPlanner";

interface PlannerDrawerProps {
  onClose: () => void;
}

/** Mission planning for the selected device, opened from the device card, context menu, or P. */
export function PlannerDrawer({ onClose }: PlannerDrawerProps) {
  return (
    <FloatingPanel title="Mission planner" onClose={onClose} closeLabel="Close planner" className="max-h-full">
      <MissionPlanner />
      <ActiveMissions />
    </FloatingPanel>
  );
}
