export function getURDFPath(): string {
  const urdfPath = import.meta.env.VITE_URDF_PATH;

  if (!urdfPath) {
    console.error(
      "URDF path is not set. Please set the VITE_URDF_PATH variable in your environment file (e.g., .env, default.env)."
    );
    throw new Error("URDF path is required but not set.");
  }

  console.log(`URDF Path resolved: ${urdfPath}`);
  return urdfPath;
}
