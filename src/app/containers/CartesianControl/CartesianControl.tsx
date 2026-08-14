import { useSelector } from "react-redux";
import { NumericField } from "../../components/NumericField";
import { CARTESIAN_HELP } from "../../components/InspectorGroup/inspectorHelp";
import { PanelSection } from "../../components/PanelSection";
import { useRobot } from "../../context";
import { robotRuntime, radiansToUnit, tcpPositionMm, unitToRadians } from "@/robotics";
import { RootState } from "../../../redux";

const POSITION_RANGE_MM = 1500;

export function CartesianControl() {
  const { tcp, specs } = useRobot();
  const { angleUnit } = useSelector((state: RootState) => state.settings);
  const positionMm = tcp ? tcpPositionMm(tcp) : [0, 0, 0];
  const orientation = tcp?.eulerRad ?? [0, 0, 0];
  const disabled = specs.length === 0 || !tcp;

  const updatePosition = (index: 0 | 1 | 2, value: number) => {
    if (!tcp) {
      return;
    }
    const next = [...positionMm] as [number, number, number];
    next[index] = value;
    robotRuntime.commandTcp(next, tcp.eulerRad);
  };

  const updateOrientation = (index: 0 | 1 | 2, displayValue: number) => {
    if (!tcp) {
      return;
    }
    const next = [...tcp.eulerRad] as [number, number, number];
    next[index] = unitToRadians(displayValue, angleUnit);
    robotRuntime.commandTcp(positionMm as [number, number, number], next);
  };

  return (
    <PanelSection title="Cartesian" info={CARTESIAN_HELP}>
          <div id="cartesian-form" className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <NumericField
              id="x"
              label="X"
              value={positionMm[0]}
              min={-POSITION_RANGE_MM}
              max={POSITION_RANGE_MM}
              step={1}
              unit="mm"
              disabled={disabled}
              onChange={(_id, value) => updatePosition(0, value)}
            />
            <NumericField
              id="rx"
              label="Rx"
              value={radiansToUnit(orientation[0], angleUnit)}
              min={radiansToUnit(-Math.PI, angleUnit)}
              max={radiansToUnit(Math.PI, angleUnit)}
              step={angleUnit === "deg" ? 1 : 0.01}
              unit={angleUnit === "deg" ? "°" : "rad"}
              disabled={disabled}
              onChange={(_id, value) => updateOrientation(0, value)}
            />
            <NumericField
              id="y"
              label="Y"
              value={positionMm[1]}
              min={-POSITION_RANGE_MM}
              max={POSITION_RANGE_MM}
              step={1}
              unit="mm"
              disabled={disabled}
              onChange={(_id, value) => updatePosition(1, value)}
            />
            <NumericField
              id="ry"
              label="Ry"
              value={radiansToUnit(orientation[1], angleUnit)}
              min={radiansToUnit(-Math.PI, angleUnit)}
              max={radiansToUnit(Math.PI, angleUnit)}
              step={angleUnit === "deg" ? 1 : 0.01}
              unit={angleUnit === "deg" ? "°" : "rad"}
              disabled={disabled}
              onChange={(_id, value) => updateOrientation(1, value)}
            />
            <NumericField
              id="z"
              label="Z"
              value={positionMm[2]}
              min={-POSITION_RANGE_MM}
              max={POSITION_RANGE_MM}
              step={1}
              unit="mm"
              disabled={disabled}
              onChange={(_id, value) => updatePosition(2, value)}
            />
            <NumericField
              id="rz"
              label="Rz"
              value={radiansToUnit(orientation[2], angleUnit)}
              min={radiansToUnit(-Math.PI, angleUnit)}
              max={radiansToUnit(Math.PI, angleUnit)}
              step={angleUnit === "deg" ? 1 : 0.01}
              unit={angleUnit === "deg" ? "°" : "rad"}
              disabled={disabled}
              onChange={(_id, value) => updateOrientation(2, value)}
            />
          </div>
    </PanelSection>
  );
}

export default CartesianControl;
