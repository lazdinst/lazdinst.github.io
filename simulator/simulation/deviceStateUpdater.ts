import { BaseDevice } from "../devices/base/BaseDevice";

export function updateAllDevices(devices: BaseDevice[]): void {
  devices.forEach(device => device.update());
}
