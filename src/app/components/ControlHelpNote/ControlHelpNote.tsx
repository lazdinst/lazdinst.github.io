import { HotkeyBadge } from "../HotkeyBadge";

const ROBOT_ROWS: Array<{ keys: string[]; label: string }> = [
  { keys: ["W", "A", "S", "D"], label: "Jog the tool tip in world XY" },
  { keys: ["↑", "↓"], label: "Jog the tool tip in world Z" },
  { keys: ["Q", "E"], label: "Roll the wrist (J6)" },
  { keys: ["HOME"], label: "Return to the ready pose" },
  { keys: ["RESET"], label: "Home the arm and clear sim time" },
];

const CAMERA_ROWS: Array<{ keys: string[]; label: string }> = [
  { keys: ["LMB"], label: "Orbit around the white pivot" },
  { keys: ["RMB"], label: "Pan — moves the look-at point" },
  { keys: ["Shift"], label: "Hold and drag to pan with LMB" },
  { keys: ["Scroll"], label: "Zoom toward the cursor" },
  { keys: ["2×"], label: "Double-click a mesh to focus" },
];

interface ControlHelpNoteProps {
  heading?: boolean;
}

export function ControlHelpNote({ heading = true }: ControlHelpNoteProps) {
  return (
    <div className="flex flex-col gap-3">
      {heading ? (
        <p className="text-xs font-medium text-foreground">How to drive</p>
      ) : null}
      <p className="text-xs leading-relaxed text-muted-foreground">
        Click the 3D view, then hold keys to jog. Shortcuts are ignored while a
        number field is focused. XYZ jogging holds tool orientation; Q and E roll
        the wrist.
      </p>
      <HelpRows title="Robot" rows={ROBOT_ROWS} />
      <HelpRows title="Camera" rows={CAMERA_ROWS} />
    </div>
  );
}

function HelpRows({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ keys: string[]; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-start justify-between gap-2"
          >
            <span className="flex shrink-0 flex-wrap items-center gap-0.5">
              {row.keys.map((key) => (
                <HotkeyBadge key={key}>{key}</HotkeyBadge>
              ))}
            </span>
            <span className="pt-0.5 text-right text-xs leading-4 text-muted-foreground">
              {row.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
