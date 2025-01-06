import { MutableRefObject, useCallback, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const useSetupScene = (
  mountRef: MutableRefObject<HTMLDivElement | null>,
  sceneRef: MutableRefObject<THREE.Scene>
) => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const setupScene = useCallback(() => {
    console.log("useCallback - Setting up scene...");
    if (!mountRef.current) return () => {};

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = sceneRef.current;
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);

    let renderer = rendererRef.current;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer; // Store reference
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      if (renderer && mountRef.current) {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      console.log("Cleaning up renderer...");
      if (renderer) {
        renderer.dispose();
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        rendererRef.current = null; // Clear reference
      }
    };
  }, [mountRef, sceneRef]);

  return setupScene;
};
