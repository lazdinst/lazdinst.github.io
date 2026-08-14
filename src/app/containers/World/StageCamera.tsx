import { useEffect, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CameraControls,
  GizmoHelper,
  GizmoViewport,
  type CameraControls as CameraControlsImpl,
} from "@react-three/drei";
import CameraControlsLib from "camera-controls";
import { Raycaster, Vector2, Vector3, type Group } from "three";
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  focusTcp,
} from "./stageCameraActions";

interface StageCameraProps {
  controlsRef: MutableRefObject<CameraControlsImpl | null>;
}

const pointer = new Vector2();
const raycaster = new Raycaster();
const hitPoint = new Vector3();

export function StageCamera({ controlsRef }: StageCameraProps) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    camera.up.set(0, 0, 1);
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    controls.updateCameraUp();
    controls.minDistance = 0.15;
    controls.maxDistance = 8;
    controls.dollyToCursor = true;
    controls.smoothTime = 0.12;
    controls.draggingSmoothTime = 0.04;
    controls.mouseButtons.left = CameraControlsLib.ACTION.ROTATE;
    controls.mouseButtons.right = CameraControlsLib.ACTION.TRUCK;
    controls.mouseButtons.middle = CameraControlsLib.ACTION.DOLLY;
    controls.mouseButtons.wheel = CameraControlsLib.ACTION.DOLLY;
    controls.touches.one = CameraControlsLib.ACTION.TOUCH_ROTATE;
    controls.touches.two = CameraControlsLib.ACTION.TOUCH_DOLLY_TRUCK;

    const [px, py, pz] = DEFAULT_CAMERA_POSITION;
    const [tx, ty, tz] = DEFAULT_CAMERA_TARGET;
    void controls.setLookAt(px, py, pz, tx, ty, tz, false);
    controls.saveState();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        controls.mouseButtons.left = CameraControlsLib.ACTION.TRUCK;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        controls.mouseButtons.left = CameraControlsLib.ACTION.ROTATE;
      }
    };

    const onDoubleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const hit = hits.find((item) => item.object.visible);
      if (hit) {
        hitPoint.copy(hit.point);
        void controls.setTarget(hitPoint.x, hitPoint.y, hitPoint.z, true);
        return;
      }
      focusTcp(controls);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    gl.domElement.addEventListener("dblclick", onDoubleClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      gl.domElement.removeEventListener("dblclick", onDoubleClick);
      controls.mouseButtons.left = CameraControlsLib.ACTION.ROTATE;
    };
  }, [camera, controlsRef, gl, scene]);

  return (
    <>
      <CameraControls ref={controlsRef} makeDefault />
      <OrbitPivotMarker controlsRef={controlsRef} />
      <GizmoHelper alignment="top-right" margin={[48, 48]}>
        <GizmoViewport
          axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
          labelColor="#fafafa"
          labels={["X", "Y", "Z"]}
        />
      </GizmoHelper>
    </>
  );
}

function OrbitPivotMarker({
  controlsRef,
}: {
  controlsRef: MutableRefObject<CameraControlsImpl | null>;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    const controls = controlsRef.current;
    const group = groupRef.current;
    if (!controls || !group) {
      return;
    }
    controls.getTarget(group.position);
  });

  return (
    <group ref={groupRef}>
      <axesHelper args={[0.07]} />
      <mesh raycast={() => undefined}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial
          color="#f8fafc"
          transparent
          opacity={0.85}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
