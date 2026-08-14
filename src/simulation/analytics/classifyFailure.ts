import type { FailureCategory } from "../types/SimulationSnapshot";

export function classifyFailure(reason: string | null | undefined): FailureCategory {
  const text = (reason ?? "").toLowerCase();
  if (text.includes("safety") || text.includes("protective") || text.includes("e-stop")) {
    return "safety";
  }
  if (text.includes("vacuum") || text.includes("seal") || text.includes("leak")) {
    return "vacuum_loss";
  }
  if (text.includes("unreachable") || text.includes("joint limit")) {
    return "unreachable";
  }
  if (text.includes("grasp") || text.includes("slip")) {
    return "grasp_failure";
  }
  if (text.includes("perception") || text.includes("detect") || text.includes("camera")) {
    return "perception";
  }
  if (text.includes("collision")) {
    return "collision";
  }
  return "motion";
}
