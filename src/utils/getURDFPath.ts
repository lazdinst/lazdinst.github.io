import { DEFAULT_URDF_MODEL } from "@/robotics/models/urdfCatalog";

export function getOptionalUrdfPath(): string | undefined {
  const urdfPath = import.meta.env.VITE_URDF_PATH;
  return typeof urdfPath === "string" && urdfPath.length > 0
    ? urdfPath
    : undefined;
}

export function getURDFPath(): string {
  return getOptionalUrdfPath() ?? DEFAULT_URDF_MODEL.path;
}
