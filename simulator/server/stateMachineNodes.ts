import { Namespace } from "node-opcua-address-space";
import { DataType, Variant } from "node-opcua";
import { PackMLStateMachine } from "../stateMachine/PackMLStateMachine";
import { PackMLCommand, PackMLState } from "../types";

const packML = new PackMLStateMachine();

export async function addStateMachineNodes(namespace: Namespace): Promise<void> {
  const packMLFolder = namespace.addFolder("ObjectsFolder", { browseName: "PackML" });

  namespace.addVariable({
    componentOf: packMLFolder,
    browseName: "State",
    dataType: "String",
    value: {
      get: () =>
        new Variant({
          dataType: DataType.String,
          value: packML.currentState
        })
    }
  });

  namespace.addVariable({
    componentOf: packMLFolder,
    browseName: "Command",
    dataType: "String",
    value: {
      get: () =>
        new Variant({
          dataType: DataType.String,
          value: ""
        }),
      set: (variant) => {
        const cmdString = variant.value as string;
        if (isValidCommand(cmdString)) {
          packML.handleCommand(cmdString as PackMLCommand);
          return { statusCode: 0 };
        } else {
          return { statusCode: 1 };
        }
      }
    }
  });
}

function isValidCommand(cmd: string): boolean {
  return Object.values(PackMLCommand).includes(cmd as PackMLCommand);
}
