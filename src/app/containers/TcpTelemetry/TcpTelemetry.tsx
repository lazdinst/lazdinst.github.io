import { useSelector } from "react-redux";
import { TCP_TELEMETRY_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useDisplayedSnapshot } from "@/app/context";
import { formatAngle } from "@/robotics";
import type { RootState } from "../../../redux";

export function TcpTelemetry() {
  const snapshot = useDisplayedSnapshot();
  const { angleUnit } = useSelector((state: RootState) => state.settings);
  const tcp = snapshot.tcp;

  return (
    <PanelSection title="TCP" info={TCP_TELEMETRY_HELP}>
      {tcp ? (
        <article className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Speed
            </span>
            <span className="font-mono text-sm leading-none tabular-nums text-foreground">
              {tcp.linearVelocityMmSec.toFixed(0)} mm/s
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[10px] tabular-nums">
            <Row
              label="X"
              value={`${tcp.positionMm[0].toFixed(1)} mm`}
            />
            <Row
              label="Rx"
              value={formatAngle(tcp.orientationRad[0], angleUnit)}
            />
            <Row
              label="Y"
              value={`${tcp.positionMm[1].toFixed(1)} mm`}
            />
            <Row
              label="Ry"
              value={formatAngle(tcp.orientationRad[1], angleUnit)}
            />
            <Row
              label="Z"
              value={`${tcp.positionMm[2].toFixed(1)} mm`}
            />
            <Row
              label="Rz"
              value={formatAngle(tcp.orientationRad[2], angleUnit)}
            />
            <Row
              label="ω"
              value={`${formatAngle(tcp.angularVelocityRadSec, angleUnit)}/s`}
            />
            <Row
              label="Mode"
              value={
                snapshot.robot?.fault
                  ? "fault"
                  : (snapshot.robot?.controllerMode ?? "").replaceAll("_", " ")
              }
            />
          </dl>
        </article>
      ) : (
        <p className="text-xs text-muted-foreground">Waiting for TCP sample.</p>
      )}
    </PanelSection>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground">{value}</dd>
    </>
  );
}
