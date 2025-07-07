import { OPCUAServer } from "node-opcua";
import { setupAddressSpace } from "./addressSpace";
import { printNodes } from "../utils/printNodes";
import { dumpNodesToFile } from "../utils/dumpNodesToFile";

export async function createServer(): Promise<void> {
  const server = new OPCUAServer({
    port: 4334,
    resourcePath: "/UA/Simulator",
    buildInfo: {
      productName: "NodeOpcUaSimulator",
      buildNumber: "1",
      buildDate: new Date()
    }
  });

  await server.initialize();
  console.log("✅ OPC UA Server initialized");

  await setupAddressSpace(server);
  console.log("✅ Address space setup complete");

  const addressSpace = server.engine.addressSpace;
  if (!addressSpace) {
    throw new Error("AddressSpace is undefined!");
  }

  // 🟢 Dump all nodes immediately
  console.log("\n✅ OPC UA Address Space Contents:");
  printNodes(addressSpace.rootFolder.objects);

  dumpNodesToFile(addressSpace.rootFolder.objects, "nodeList.txt");

  await server.start();
  console.log(
    `✅ Server listening at ${server.endpoints[0].endpointDescriptions()[0].endpointUrl}`
  );
}
