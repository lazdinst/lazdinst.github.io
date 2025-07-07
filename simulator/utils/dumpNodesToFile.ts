import fs from "fs";
import { UAObject, BaseNode } from "node-opcua-address-space";

export function dumpNodesToFile(node: BaseNode, filename: string): void {
  const lines: string[] = [];
  collectNodeLines(node, "", lines);
  fs.writeFileSync(filename, lines.join("\n"), { encoding: "utf-8" });
  console.log(`✅ Node list written to ${filename}`);
}

function collectNodeLines(node: BaseNode, indent: string, lines: string[]): void {
  lines.push(`${indent}${node.browseName.toString()} - ${node.nodeId.toString()}`);
  if ("getComponents" in node) {
    const components = (node as UAObject).getComponents();
    for (const comp of components) {
      collectNodeLines(comp, indent + "  ", lines);
    }
  }
}
