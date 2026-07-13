import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { MutableRefObject, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Letter, { type LetterHandle } from "./Letter";
import { computeLayout, LETTER_ORDER, LETTER_WIDTHS, type LetterId } from "./letters";
import { ANCHOR_OFFSETS, type AnchorKey, type AnnotationPositions } from "./annotationTypes";
import { HERO_ENHANCED_DELAY_MS } from "../lib/heroTiming";
import { isMobileScrollViewport } from "../lib/mobileScroll";

export type { AnchorKey, AnnotationPositions } from "./annotationTypes";
export { createAnnotationPositions } from "./annotationTypes";

const LETTER_GAP = 0.46;
const LAYOUT = computeLayout(LETTER_GAP);
const NATURAL_WIDTH = LETTER_ORDER.reduce((sum, id) => sum + LETTER_WIDTHS[id], 0) + LETTER_GAP * (LETTER_ORDER.length - 1);

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

const NATURAL_SPAN_Y = 1.9;
const BASE_SCALE = 2.12;
const BASE_POS_Y = 0.28;

function useWordFit() {
  const width = useThree((state) => state.viewport.width);
  const height = useThree((state) => state.viewport.height);

  const byWidth = (width * 0.88) / NATURAL_WIDTH;
  const byHeight = (height * 0.72) / NATURAL_SPAN_Y;
  const scale = Math.min(byWidth, byHeight, BASE_SCALE);
  const posY = BASE_POS_Y * (scale / BASE_SCALE);

  return { scale, posY };
}

function SceneLights({ enhanced }: { enhanced: boolean }) {
  return (
    <>
      <hemisphereLight args={["#fbf7ef", "#c8beac", enhanced ? 0.66 : 0.72]} />
      <directionalLight
        position={[-4.2, 6.2, 6.5]}
        intensity={enhanced ? 1.48 : 1.2}
        color="#fffaf0"
        castShadow={enhanced}
        shadow-mapSize-width={enhanced ? 1024 : 512}
        shadow-mapSize-height={enhanced ? 1024 : 512}
        shadow-bias={-0.0004}
      >
        {enhanced ? <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.1, 30]} /> : null}
      </directionalLight>
      <directionalLight position={[5, 2.4, 4]} intensity={0.4} color="#ffe9d2" />
      <directionalLight position={[-2, -3, -5]} intensity={0.32} color="#dfe6ff" />
      <pointLight position={[0, 1.2, 6]} intensity={0.2} color="#ffffff" distance={20} />
    </>
  );
}

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
  enhanced: boolean;
}

function SceneContent({ onInteract, registerRef, posRef, enhanced }: SceneContentProps) {
  const { scale, posY } = useWordFit();
  const anchors = useRef<Partial<Record<AnchorKey, THREE.Object3D | null>>>({});
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1e1b17"),
        roughness: 0.58,
        metalness: 0.04,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <TiltRig>
      <group position={[0, posY, 0]} scale={scale}>
        {LAYOUT.map(({ id, x }) => (
          <Letter
            key={id}
            id={id}
            x={x}
            material={material}
            mountDelay={0}
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

      {enhanced ? (
        <group position={[0, posY - scale * 0.745, 0]} scale={[1.18, 1, 0.92]}>
          <ContactShadows opacity={0.28} scale={scale * 11.35} blur={2.8} far={3} resolution={256} color="#1a1712" />
        </group>
      ) : null}
    </TiltRig>
  );
}

interface AinoSceneProps {
  posRef: MutableRefObject<AnnotationPositions>;
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

function useEnhancedScene() {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnhanced(true), HERO_ENHANCED_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return enhanced;
}

export default function AinoScene({ posRef }: AinoSceneProps) {
  const refs = useRef<Partial<Record<LetterId, LetterHandle>>>({});
  const canvasActive = useCanvasActivity();
  const enhanced = useEnhancedScene();

  const registerRef = (id: LetterId, handle: LetterHandle | null) => {
    if (handle) refs.current[id] = handle;
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
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
  }, []);

  const maxDpr =
    typeof window !== "undefined" ? Math.min(1.75, window.devicePixelRatio || 1) : 1;

  const isMobile = isMobileScrollViewport();
  const shouldKeepCanvasActive = isMobile || canvasActive;

  return (
    <Canvas
      shadows={enhanced}
      dpr={[1, maxDpr]}
      frameloop={shouldKeepCanvasActive ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.35, 13.5], fov: 26 }}
      style={{ position: "absolute", inset: 0, zIndex: 2 }}
    >
      <SceneLights enhanced={enhanced} />
      <SceneContent
        onInteract={() => {}}
        registerRef={registerRef}
        posRef={posRef}
        enhanced={enhanced}
      />
    </Canvas>
  );
}
