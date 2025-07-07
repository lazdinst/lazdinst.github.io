import { BaseDevice } from "../devices/base/BaseDevice";

export function triggerRandomEvent(devices: BaseDevice[]): void {
  if (Math.random() < 0.05) {
    console.log("⚠️ Simulated fault triggered!");
    devices.forEach(device => {
      if ("status" in device.params && device.params["status"] === "Running") {
        device.params["status"] = "Stopped";
      }
    });
  }
}
