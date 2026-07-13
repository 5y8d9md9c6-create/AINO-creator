import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import type { MutableRefObject, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Letter, { type LetterHandle } from "./Letter";
import { computeLayout, LETTER_ORDER, LETTER_WIDTHS, type LetterId } from "./letters";
import { ANCHOR_OFFSETS, type AnchorKey, type AnnotationPositions } from "./annotationTypes";

export type { AnchorKey, AnnotationPositions } from "./annotationTypes";
export { createAnnotationPositions } from "./annotationTypes";

const LETTER_GAP = 0.46;
const LAYOUT = computeLayout(LETTER_GAP);
const NATURAL_WIDTH = LETTER_ORDER.reduce((sum, id) => sum + LETTER_WIDTHS[id], 0) + LETTER_GAP * (LETTER_ORDER.length - 1);

/** Tiny procedural grain used as a bump map so the letters read as soft matte
 * clay/rubber (like the reference) instead of a perfectly smooth CG plastic
 * surface. */
function createGrainTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 60;
    imageData.data[i] = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  return texture;
}

function TiltRig({ children }: { children: ReactNode }) {
  const rig = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!rig.current) return;
    const targetY = state.pointer.x * 0.14;
    const targetX = -state.pointer.y * 0.07;
    rig.current.rotation.y += (targetY - rig.current.rotation.y) * 0.045;
    rig.current.rotation.x += (targetX - rig.current.rotation.x) * 0.045;
  });
  return <group ref={rig}>{children}</group>;
}

const NATURAL_SPAN_Y = 1.9; // from top of labels to bottom of feet, at scale 1
const BASE_SCALE = 2.12;
const BASE_POS_Y = 0.28;

/** Fits the wordmark to the canvas regardless of its aspect ratio, so it
 * never overflows on narrow/tall (mobile) viewports. */
function useWordFit() {
  const width = useThree((state) => state.viewport.width);
  const height = useThree((state) => state.viewport.height);

  const byWidth = (width * 0.88) / NATURAL_WIDTH;
  const byHeight = (height * 0.72) / NATURAL_SPAN_Y;
  const scale = Math.min(byWidth, byHeight, BASE_SCALE);
  const posY = BASE_POS_Y * (scale / BASE_SCALE);

  return { scale, posY };
}

function SceneLights() {
  return (
    <>
      <hemisphereLight args={["#fbf7ef", "#c8beac", 0.66]} />
      <directionalLight
        position={[-4.2, 6.2, 6.5]}
        intensity={1.48}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.1, 30]} />
      </directionalLight>
      <directionalLight position={[5, 2.4, 4]} intensity={0.4} color="#ffe9d2" />
      <directionalLight position={[-2, -3, -5]} intensity={0.32} color="#dfe6ff" />
      <pointLight position={[0, 1.2, 6]} intensity={0.2} color="#ffffff" distance={20} />

      <Environment resolution={512} blur={1.45}>
        <group>
          <Lightformer form="rect" intensity={0.82} color="#fff9ee" position={[-3.6, 3.8, 3.6]} scale={[9, 6, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={0.24} color="#ffe6c8" position={[3.8, 1.4, 2.8]} scale={[7, 5, 1]} target={[0, 0, 0]} />
          <Lightformer form="ring" intensity={0.2} color="#e8ecff" position={[0, -2, 4]} scale={5} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={0.18} color="#ffffff" position={[0, 2.2, -5]} scale={[8, 4, 1]} />
        </group>
      </Environment>
    </>
  );
}

/** Projects each anchor's live world position to canvas-pixel screen space,
 * every frame, so the DOM annotation overlay can follow the bouncing /
 * swaying letters exactly without re-rendering React. */
function AnnotationProjector({
  anchors,
  posRef,
}: {
  anchors: MutableRefObject<Partial<Record<AnchorKey, THREE.Object3D | null>>>;
  posRef: MutableRefObject<AnnotationPositions>;
}) {
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const { camera, size } = state;
    (Object.keys(ANCHOR_OFFSETS) as AnchorKey[]).forEach((key) => {
      const obj = anchors.current[key];
      if (!obj) return;
      obj.getWorldPosition(v);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (1 - (v.y * 0.5 + 0.5)) * size.height;
      posRef.current[key] = { x, y };
    });
  });

  return null;
}

interface SceneContentProps {
  onInteract: (id: LetterId) => void;
  registerRef: (id: LetterId, handle: LetterHandle | null) => void;
  posRef: MutableRefObject<AnnotationPositions>;
  onSceneReady?: () => void;
}

function SceneContent({ onInteract, registerRef, posRef, onSceneReady }: SceneContentProps) {
  const { scale, posY } = useWordFit();
  const anchors = useRef<Partial<Record<AnchorKey, THREE.Object3D | null>>>({});
  const sceneReadyRef = useRef(false);
  const material = useMemo(() => {
    const grain = createGrainTexture();
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1e1b17"),
      roughness: 0.6,
      metalness: 0.02,
      clearcoat: 0.18,
      clearcoatRoughness: 0.5,
      reflectivity: 0.16,
      envMapIntensity: 0.68,
      bumpMap: grain,
      bumpScale: 0.0028,
    });

    return mat;
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
      if (material.bumpMap) material.bumpMap.dispose();
    };
  }, [material]);

  useFrame(() => {
    if (sceneReadyRef.current) return;
    sceneReadyRef.current = true;
    onSceneReady?.();
  });

  return (
    <TiltRig>
      <group position={[0, posY, 0]} scale={scale}>
        {LAYOUT.map(({ id, x }, i) => (
          <Letter
            key={id}
            id={id}
            x={x}
            material={material}
            mountDelay={i * 0.01}
            instantEntry
            onInteract={onInteract}
            ref={(handle) => registerRef(id, handle)}
            extra={
              <group
                position={ANCHOR_OFFSETS[id]}
                ref={(o) => {
                  anchors.current[id] = o;
                }}
              />
            }
          />
        ))}
      </group>

      <AnnotationProjector anchors={anchors} posRef={posRef} />

      <group position={[0, posY - scale * 0.745, 0]} scale={[1.18, 1, 0.92]}>
        <ContactShadows opacity={0.3} scale={scale * 11.35} blur={3.1} far={3} resolution={512} color="#1a1712" />
      </group>
    </TiltRig>
  );
}

interface AinoSceneProps {
  posRef: MutableRefObject<AnnotationPositions>;
  onSceneReady?: () => void;
}

function useCanvasActivity() {
  const [active, setActive] = useState(() => !document.hidden);

  useEffect(() => {
    const section = document.querySelector(".aino-section");
    if (!section) return;

    let visible = true;
    const sync = () => setActive(visible && !document.hidden);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(section);

    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return active;
}

export default function AinoScene({ posRef, onSceneReady }: AinoSceneProps) {
  const refs = useRef<Partial<Record<LetterId, LetterHandle>>>({});
  const [ready, setReady] = useState(false);
  const canvasActive = useCanvasActivity();

  const registerRef = (id: LetterId, handle: LetterHandle | null) => {
    if (handle) refs.current[id] = handle;
  };

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const onReturn = () => {
      const order: LetterId[] = ["A", "I", "N", "O"];
      order.forEach((id, index) => {
        window.setTimeout(() => {
          const handle = refs.current[id];
          handle?.trigger();
          if (id === "A") {
            window.setTimeout(() => handle?.release(), 620);
          }
        }, index * 130);
      });
    };
    window.addEventListener("aino:footer-return-hero", onReturn);
    return () => window.removeEventListener("aino:footer-return-hero", onReturn);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const order: LetterId[] = ["A", "I", "N", "O"];
    let i = 0;
    const interval = setInterval(() => {
      const id = order[i % order.length];
      const handle = refs.current[id];
      handle?.trigger();
      if (id === "A") {
        setTimeout(() => handle?.release(), 620);
      }
      i += 1;
    }, 2600);
    return () => clearInterval(interval);
  }, [ready]);

  const maxDpr =
    typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;

  return (
    <Canvas
      shadows
      dpr={[1, maxDpr]}
      frameloop={canvasActive ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.35, 13.5], fov: 26 }}
      style={{ position: "absolute", inset: 0, zIndex: 2 }}
    >
      <SceneLights />
      <SceneContent
        onInteract={() => {}}
        registerRef={registerRef}
        posRef={posRef}
        onSceneReady={onSceneReady}
      />
    </Canvas>
  );
}
