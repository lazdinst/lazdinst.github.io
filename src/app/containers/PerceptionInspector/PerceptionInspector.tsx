import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PERCEPTION_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { usePerception, useWorkcell } from "@/app/context";
import { perceptionRuntime } from "@/perception";
import type { PointCloudColorMode } from "@/simulation";
import { cn } from "@/lib/utils";

const COLOR_MODES: PointCloudColorMode[] = [
  "rgb",
  "height",
  "segmentation",
  "confidence",
];

export function PerceptionInspector() {
  const { camera, detections, selectedDetectionId, pointCount, settings } =
    usePerception();
  const { layout } = useWorkcell();

  return (
    <PanelSection title="Perception" info={PERCEPTION_HELP}>
          <div className="flex flex-col gap-2">
            {camera ? (
              <p className="font-mono text-xs text-muted-foreground">
                RGB-D {camera.fps.toFixed(0)} fps · {camera.latencyMs.toFixed(0)} ms ·{" "}
                {pointCount} pts · {camera.invalidDepthPercent.toFixed(0)}% invalid
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No perception frame yet.</p>
            )}
            <ToteMap
              detections={detections}
              selectedDetectionId={selectedDetectionId}
              toteCenter={layout.tote.centerM}
              toteSize={layout.tote.innerSizeM}
            />
            <ul className="flex flex-col gap-0.5">
              {detections.map((detection) => (
                <li key={detection.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-1 py-0.5 text-left text-xs",
                      detection.id === selectedDetectionId
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60"
                    )}
                    onClick={() => perceptionRuntime.selectDetection(detection.id)}
                  >
                    <span className="font-mono">
                      {detection.className} {detection.partId}
                    </span>
                    <span>
                      {(detection.confidence * 100).toFixed(0)}% · occ{" "}
                      {(detection.occlusion * 100).toFixed(0)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-1">
              <Label htmlFor="cloud-visible" className="text-xs font-normal">
                Point cloud
              </Label>
              <Switch
                id="cloud-visible"
                size="sm"
                checked={settings.visible}
                onCheckedChange={(visible) =>
                  perceptionRuntime.patchSettings({ visible })
                }
              />
            </div>
            <CloudSlider
              id="density"
              label="Density"
              value={settings.density}
              min={0.15}
              max={1}
              step={0.05}
              onChange={(density) => perceptionRuntime.patchSettings({ density })}
            />
            <CloudSlider
              id="noise"
              label="Noise mm"
              value={settings.noiseMm}
              min={0}
              max={8}
              step={0.2}
              onChange={(noiseMm) => perceptionRuntime.patchSettings({ noiseMm })}
            />
            <CloudSlider
              id="dropout"
              label="Dropout"
              value={settings.dropout}
              min={0}
              max={0.6}
              step={0.02}
              onChange={(dropout) => perceptionRuntime.patchSettings({ dropout })}
            />
            <CloudSlider
              id="size"
              label="Point size"
              value={settings.pointSize}
              min={0.002}
              max={0.012}
              step={0.001}
              onChange={(pointSize) => perceptionRuntime.patchSettings({ pointSize })}
            />
            <label className="flex items-center justify-between gap-1 text-xs">
              Color
              <select
                className="h-5 rounded-sm border border-border bg-background px-1 font-mono text-xs"
                value={settings.colorMode}
                onChange={(event) =>
                  perceptionRuntime.patchSettings({
                    colorMode: event.target.value as PointCloudColorMode,
                  })
                }
              >
                {COLOR_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>
          </div>
    </PanelSection>
  );
}

function CloudSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Label htmlFor={id} className="font-normal">
          {label}
        </Label>
        <span className="font-mono">{value.toFixed(2)}</span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => {
          const numeric = Array.isArray(next) ? next[0] : next;
          if (typeof numeric === "number") {
            onChange(numeric);
          }
        }}
      />
    </div>
  );
}

function ToteMap({
  detections,
  selectedDetectionId,
  toteCenter,
  toteSize,
}: {
  detections: ReturnType<typeof usePerception>["detections"];
  selectedDetectionId: string | null;
  toteCenter: [number, number, number];
  toteSize: [number, number, number];
}) {
  const width = 160;
  const height = 110;
  const toX = (x: number) =>
    ((x / 1000 - (toteCenter[0] - toteSize[0] / 2)) / toteSize[0]) * width;
  const toY = (y: number) =>
    (1 - (y / 1000 - (toteCenter[1] - toteSize[1] / 2)) / toteSize[1]) * height;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-24 w-full rounded-sm border border-border bg-black/40"
      aria-label="Overhead camera detections"
    >
      {detections.map((detection) => {
        const selected = detection.id === selectedDetectionId;
        return (
          <rect
            key={detection.id}
            x={toX(detection.positionMm[0]) - 6}
            y={toY(detection.positionMm[1]) - 6}
            width={12}
            height={12}
            fill={selected ? "#f5c400" : "#4cc9f0"}
            opacity={0.35 + detection.confidence * 0.65}
            className="cursor-pointer"
            onClick={() => perceptionRuntime.selectDetection(detection.id)}
          />
        );
      })}
    </svg>
  );
}
