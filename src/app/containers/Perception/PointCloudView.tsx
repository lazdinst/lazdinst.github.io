import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
} from "three";
import { perceptionRuntime } from "@/perception";
import { MAX_POINT_COUNT } from "@/perception";
import { usePerception } from "@/app/context";

const HEIGHT_MIN = 0.0;
const HEIGHT_MAX = 0.22;

export function PointCloudView() {
  const { settings } = usePerception();
  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    geom.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(MAX_POINT_COUNT * 3), 3)
    );
    geom.setAttribute(
      "color",
      new BufferAttribute(new Float32Array(MAX_POINT_COUNT * 3), 3)
    );
    geom.setDrawRange(0, 0);
    geom.computeBoundingSphere();
    return geom;
  }, []);
  const material = useMemo(
    () =>
      new PointsMaterial({
        size: settings.pointSize,
        vertexColors: true,
        sizeAttenuation: true,
      }),
    [settings.pointSize]
  );
  const pointsRef = useRef<Points>(null);
  const lastRevision = useRef(-1);
  const color = useMemo(() => new Color(), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const lastMode = useRef(settings.colorMode);

  useFrame(() => {
    const cloud = perceptionRuntime.getPointCloud();
    const modeChanged = lastMode.current !== settings.colorMode;
    if (cloud.revision === lastRevision.current && !modeChanged) {
      material.size = settings.pointSize;
      return;
    }
    lastRevision.current = cloud.revision;
    lastMode.current = settings.colorMode;
    const positions = geometry.getAttribute("position") as BufferAttribute;
    const colors = geometry.getAttribute("color") as BufferAttribute;
    positions.array.set(cloud.positions);
    for (let i = 0; i < cloud.count; i += 1) {
      writeColor(colors.array as Float32Array, i, cloud, settings.colorMode, color);
    }
    positions.needsUpdate = true;
    colors.needsUpdate = true;
    geometry.setDrawRange(0, cloud.count);
    material.size = settings.pointSize;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      visible={settings.visible}
      frustumCulled={false}
    />
  );
}

function writeColor(
  target: Float32Array,
  index: number,
  cloud: ReturnType<typeof perceptionRuntime.getPointCloud>,
  mode: string,
  color: Color
): void {
  const offset = index * 3;
  if (mode === "rgb") {
    target[offset] = cloud.rgb[offset] ?? 1;
    target[offset + 1] = cloud.rgb[offset + 1] ?? 1;
    target[offset + 2] = cloud.rgb[offset + 2] ?? 1;
    return;
  }
  if (mode === "height") {
    const z = cloud.positions[offset + 2] ?? 0;
    const t = Math.min(1, Math.max(0, (z - HEIGHT_MIN) / (HEIGHT_MAX - HEIGHT_MIN)));
    color.setHSL(0.66 * (1 - t), 0.85, 0.5);
    target[offset] = color.r;
    target[offset + 1] = color.g;
    target[offset + 2] = color.b;
    return;
  }
  if (mode === "segmentation") {
    const hue = ((cloud.partIndex[index] ?? 0) * 0.17) % 1;
    color.setHSL(hue, 0.7, 0.5);
    target[offset] = color.r;
    target[offset + 1] = color.g;
    target[offset + 2] = color.b;
    return;
  }
  const conf = cloud.confidence[index] ?? 0;
  target[offset] = 1 - conf;
  target[offset + 1] = conf;
  target[offset + 2] = 0.12;
}
