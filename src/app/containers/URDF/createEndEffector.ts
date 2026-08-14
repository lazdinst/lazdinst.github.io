import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  TorusGeometry,
} from "three";

export const END_EFFECTOR_TCP_NAME = "end_effector_tcp";

const YELLOW = 0xf5c400;
const GRAPHITE = 0x2c2c2c;
const TUBE = 0x141414;
const RUBBER = 0xc24a2a;
const LIP = 0x7a2a1c;

function metal(
  color: number,
  extras: { metalness?: number; roughness?: number } = {}
) {
  return new MeshStandardMaterial({
    color,
    metalness: extras.metalness ?? 0.55,
    roughness: extras.roughness ?? 0.38,
  });
}

function alongZ(mesh: Mesh, z: number): Mesh {
  mesh.rotation.x = Math.PI / 2;
  mesh.position.z = z;
  mesh.castShadow = true;
  return mesh;
}

export function createEndEffector(): Group {
  const root = new Group();
  root.name = "end_effector";

  const mountMat = metal(GRAPHITE);
  const bodyMat = metal(YELLOW, { metalness: 0.22, roughness: 0.46 });
  const tubeMat = metal(TUBE, { metalness: 0.45, roughness: 0.42 });
  const rubberMat = metal(RUBBER, { metalness: 0.05, roughness: 0.72 });
  const lipMat = metal(LIP, { metalness: 0.04, roughness: 0.78 });

  const mount = alongZ(
    new Mesh(new CylinderGeometry(0.022, 0.022, 0.008, 32), mountMat),
    0.004
  );
  root.add(mount);

  const collar = alongZ(
    new Mesh(new CylinderGeometry(0.015, 0.02, 0.012, 28), mountMat),
    0.014
  );
  root.add(collar);

  const body = alongZ(
    new Mesh(new CylinderGeometry(0.016, 0.016, 0.028, 28), bodyMat),
    0.034
  );
  root.add(body);

  const tube = alongZ(
    new Mesh(new CylinderGeometry(0.007, 0.007, 0.11, 20), tubeMat),
    0.103
  );
  root.add(tube);

  const fitting = alongZ(
    new Mesh(new CylinderGeometry(0.009, 0.008, 0.01, 20), mountMat),
    0.163
  );
  root.add(fitting);

  const foldHeight = 0.007;
  const bellowsStart = 0.168;
  for (let index = 0; index < 3; index += 1) {
    const wideFirst = index % 2 === 0;
    const top = wideFirst ? 0.016 : 0.011;
    const bottom = wideFirst ? 0.011 : 0.016;
    const fold = alongZ(
      new Mesh(new CylinderGeometry(top, bottom, foldHeight, 24), rubberMat),
      bellowsStart + index * foldHeight + foldHeight / 2
    );
    root.add(fold);
  }

  const cupCenterZ = bellowsStart + 3 * foldHeight + 0.003;
  const pad = alongZ(
    new Mesh(new CylinderGeometry(0.013, 0.013, 0.003, 24), rubberMat),
    cupCenterZ
  );
  root.add(pad);

  const lip = new Mesh(new TorusGeometry(0.015, 0.0032, 12, 28), lipMat);
  lip.position.z = cupCenterZ + 0.002;
  lip.castShadow = true;
  root.add(lip);

  const tcp = new Group();
  tcp.name = END_EFFECTOR_TCP_NAME;
  tcp.position.z = cupCenterZ + 0.005;
  root.add(tcp);

  return root;
}
