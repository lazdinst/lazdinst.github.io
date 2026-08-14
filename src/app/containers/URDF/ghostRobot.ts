import {
  AxesHelper,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from "three";
import type { URDFRobot } from "urdf-loader";
import {
  END_EFFECTOR_TCP_NAME,
  createEndEffector,
} from "./createEndEffector";

const GHOST_COLOR = 0x5eead4;

function createGhostMaterial(): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: GHOST_COLOR,
    emissive: GHOST_COLOR,
    emissiveIntensity: 0.7,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
    metalness: 0,
    roughness: 1,
    depthWrite: false,
    side: DoubleSide,
  });
}

export function stylizeGhostRobot(robot: URDFRobot): void {
  const existing = robot.userData.ghostMaterial;
  const material =
    existing instanceof MeshStandardMaterial
      ? existing
      : createGhostMaterial();
  robot.userData.ghostMaterial = material;
  robot.name = "ghost_robot";
  robot.traverse((child: Object3D) => {
    child.raycast = () => {};
    if (!(child instanceof Mesh)) {
      return;
    }
    if (child.material !== material) {
      child.material = material;
    }
    child.castShadow = false;
    child.receiveShadow = false;
    child.renderOrder = 3;
  });
}

export function attachTcpFrame(
  robot: URDFRobot,
  { axisSize = 0.08 }: { axisSize?: number | null } = {}
): void {
  const tool0 = robot.getFrame("tool0");
  const flange = robot.getFrame("flange");
  const mount = tool0 ?? flange;
  if (!mount) {
    return;
  }

  const effector = createEndEffector();
  if (!tool0) {
    effector.rotation.y = Math.PI / 2;
  }
  mount.add(effector);

  const tcp = robot.getObjectByName(END_EFFECTOR_TCP_NAME);
  if (tcp && axisSize) {
    tcp.add(new AxesHelper(axisSize));
  }
}
