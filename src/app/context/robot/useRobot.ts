import { useSyncExternalStore } from "react";
import { getRobotView, subscribeRobotView, type RobotView } from "@/robotics";

export function useRobot(): RobotView {
  return useSyncExternalStore(subscribeRobotView, getRobotView, getRobotView);
}
