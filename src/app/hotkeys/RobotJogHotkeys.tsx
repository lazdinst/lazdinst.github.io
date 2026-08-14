import { useEffect, useRef } from "react";
import { useHotkeys, useKeyHold } from "@tanstack/react-hotkeys";
import { robotRuntime } from "@/robotics";
import { useRobot } from "../context";
import { isTextInputFocused } from "./isTextInputFocused";
import { jogDeltaMm, jogRollRad, type JogHolds } from "./jogDeltaMm";

const JOG_STEP_SEC = 0.05;

const JOG_HOTKEYS = [
  { hotkey: "W", name: "Jog +Y" },
  { hotkey: "S", name: "Jog -Y" },
  { hotkey: "A", name: "Jog -X" },
  { hotkey: "D", name: "Jog +X" },
  { hotkey: "Q", name: "Roll wrist −" },
  { hotkey: "E", name: "Roll wrist +" },
  { hotkey: "ArrowUp", name: "Jog +Z" },
  { hotkey: "ArrowDown", name: "Jog -Z" },
] as const;

export function RobotJogHotkeys() {
  const { specs, tcp } = useRobot();
  const holdW = useKeyHold("W");
  const holdA = useKeyHold("A");
  const holdS = useKeyHold("S");
  const holdD = useKeyHold("D");
  const holdQ = useKeyHold("Q");
  const holdE = useKeyHold("E");
  const holdUp = useKeyHold("ArrowUp");
  const holdDown = useKeyHold("ArrowDown");
  const holdsRef = useRef<JogHolds>({
    w: false,
    a: false,
    s: false,
    d: false,
    up: false,
    down: false,
    q: false,
    e: false,
  });

  holdsRef.current = {
    w: holdW,
    a: holdA,
    s: holdS,
    d: holdD,
    up: holdUp,
    down: holdDown,
    q: holdQ,
    e: holdE,
  };

  const enabled = specs.length > 0 && tcp !== null;

  useHotkeys(
    JOG_HOTKEYS.map((item) => ({
      hotkey: item.hotkey,
      callback: () => undefined,
      options: {
        meta: { name: item.name, description: "Cartesian TCP jog" },
      },
    })),
    {
      enabled,
      preventDefault: true,
      ignoreInputs: true,
    }
  );

  const holding =
    holdW || holdA || holdS || holdD || holdQ || holdE || holdUp || holdDown;

  useEffect(() => {
    if (!enabled || !holding) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();
    let accumulator = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += dt;

      if (!isTextInputFocused() && accumulator >= JOG_STEP_SEC) {
        const step = accumulator;
        accumulator = 0;
        const delta = jogDeltaMm(holdsRef.current, step);
        const roll = jogRollRad(holdsRef.current, step);
        if (delta || roll !== 0) {
          robotRuntime.nudgeTcp(delta ?? [0, 0, 0], roll);
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, holding]);

  return null;
}
