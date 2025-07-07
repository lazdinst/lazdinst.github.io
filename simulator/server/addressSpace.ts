import { OPCUAServer } from "node-opcua";
import { addDeviceNodes } from "./deviceNodes";
import { addStateMachineNodes } from "./stateMachineNodes";

export async function setupAddressSpace(server: OPCUAServer): Promise<void> {
  const addressSpace = server.engine.addressSpace;
  if (!addressSpace) {
    throw new Error("AddressSpace is undefined!");
  }

  const namespace = addressSpace.getOwnNamespace();

  await addDeviceNodes(namespace);
  await addStateMachineNodes(namespace);
}
