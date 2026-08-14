export interface UrdfModelOption {
  id: string;
  name: string;
  path: string;
  dof: 5 | 6;
  /** Joint home in degrees, ordered J1..Jn. */
  homeDeg: number[];
}

/** Ready pose from the 200iD workbench: slight fold, wrist down. */
const HOME_6DOF_DEG = [0, -35.4, -24.2, 0, -101.2, -21.6];
const HOME_5DOF_DEG = [0, -35.4, -24.2, 0, -21.6];

export const URDF_MODELS: UrdfModelOption[] = [
  {
    id: "lrmate200id",
    name: "LR Mate 200iD",
    path: "/fanuc_lrmate200id_support/urdf/lrmate200id.urdf",
    dof: 6,
    homeDeg: HOME_6DOF_DEG,
  },
  {
    id: "lrmate200id4s",
    name: "LR Mate 200iD/4S",
    path: "/fanuc_lrmate200id_support/urdf/lrmate200id4s.urdf",
    dof: 6,
    homeDeg: HOME_6DOF_DEG,
  },
  {
    id: "lrmate200id4sc",
    name: "LR Mate 200iD/4SC",
    path: "/fanuc_lrmate200id_support/urdf/lrmate200id4sc.urdf",
    dof: 6,
    homeDeg: HOME_6DOF_DEG,
  },
  {
    id: "lrmate200id4sh",
    name: "LR Mate 200iD/4SH",
    path: "/fanuc_lrmate200id_support/urdf/lrmate200id4sh.urdf",
    dof: 5,
    homeDeg: HOME_5DOF_DEG,
  },
  {
    id: "lrmate200id7h",
    name: "LR Mate 200iD/7H",
    path: "/fanuc_lrmate200id_support/urdf/lrmate200id7h.urdf",
    dof: 5,
    homeDeg: HOME_5DOF_DEG,
  },
  {
    id: "lrmate200id7l",
    name: "LR Mate 200iD/7L",
    path: "/fanuc_lrmate200id_support/urdf/lrmate200id7l.urdf",
    dof: 6,
    homeDeg: HOME_6DOF_DEG,
  },
  {
    id: "lrmate200id7lc",
    name: "LR Mate 200iD/7LC",
    path: "/fanuc_lrmate200id_support/urdf/lrmate200id7lc.urdf",
    dof: 6,
    homeDeg: HOME_6DOF_DEG,
  },
];

export const DEFAULT_URDF_MODEL = URDF_MODELS[0];

export function findUrdfModelByPath(path: string): UrdfModelOption | undefined {
  return URDF_MODELS.find((model) => model.path === path);
}

export function findUrdfModelById(id: string): UrdfModelOption | undefined {
  return URDF_MODELS.find((model) => model.id === id);
}

export function resolveInitialUrdfModel(path: string | undefined): UrdfModelOption {
  if (!path) {
    return DEFAULT_URDF_MODEL;
  }
  return findUrdfModelByPath(path) ?? { ...DEFAULT_URDF_MODEL, path };
}
