import { UAObject, BaseNode } from "node-opcua-address-space";

export function printNodes(node: BaseNode, indent = ""): void {
  console.log(`${indent}${node.browseName.toString()} - ${node.nodeId.toString()}`);

  if ("getComponents" in node) {
    const components = (node as UAObject).getComponents();
    for (const comp of components) {
      printNodes(comp, indent + "  ");
    }
  }
}
