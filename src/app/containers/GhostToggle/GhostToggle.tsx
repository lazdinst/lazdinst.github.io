import { useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toggleGhostRobot } from "@/redux/slices/settings";
import { RootState, useAppDispatch } from "@/redux/store";

export function GhostToggle() {
  const dispatch = useAppDispatch();
  const { ghostEnabled } = useSelector((state: RootState) => state.settings);

  return (
    <div className="flex h-5 items-center gap-1">
      <Switch
        id="ghost-robot"
        size="sm"
        checked={ghostEnabled}
        onCheckedChange={() => dispatch(toggleGhostRobot())}
      />
      <Label htmlFor="ghost-robot" className="text-xs font-normal">
        Ghost
      </Label>
    </div>
  );
}
