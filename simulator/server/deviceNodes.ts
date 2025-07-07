import { Namespace, UAObject } from "node-opcua-address-space";
import { DataType, Variant } from "node-opcua";
import { DeviceConfig } from "../types";

const mockDevices: DeviceConfig[] = [
  {
    id: "motor-01",
    type: "Motor",
    params: { speed: 0, status: "Stopped" }
  }
];

export async function addDeviceNodes(namespace: Namespace): Promise<void> {
  const deviceFolder = namespace.addFolder("ObjectsFolder", { browseName: "Devices" });

  for (const device of mockDevices) {
    const deviceObj = namespace.addObject({
      organizedBy: deviceFolder,
      browseName: device.id
    });

    for (const [key, value] of Object.entries(device.params)) {
      namespace.addVariable({
        componentOf: deviceObj,
        browseName: key,
        dataType: guessDataType(value),
        value: new Variant({ dataType: guessDataType(value), value })
      });
    }
  }
}

function guessDataType(value: unknown): DataType {
  if (typeof value === "boolean") return DataType.Boolean;
  if (typeof value === "number") return DataType.Double;
  return DataType.String;
}
