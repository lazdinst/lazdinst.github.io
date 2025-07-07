import { BaseDevice } from "../devices/base/BaseDevice";
import { PackMLStateMachine } from "../stateMachine/PackMLStateMachine";
import { PackMLState } from "../types";

let devices: BaseDevice[] = [];
let stateMachine: PackMLStateMachine;

export function startSimulation(
  deviceList: BaseDevice[],
  packML: PackMLStateMachine
): void {
  devices = deviceList;
  stateMachine = packML;

  setInterval(simulationLoop, 1000);
}

function simulationLoop(): void {
  if (stateMachine.currentState === PackMLState.Execute) {
    devices.forEach(device => device.update());
  }
}
