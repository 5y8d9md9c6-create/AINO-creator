import { useFrame } from "@react-three/fiber";
import type { ReactNode } from "react";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildLetterGeometry, type LetterId } from "./letters";
import { ScalarSpring } from "./spring";

export interface LetterHandle {
  trigger: () => void;
  release: () => void;
  id: LetterId;
}

interface LetterProps {
  id: LetterId;
  x: number;
  material: THREE.Material;
  mountDelay?: number;
  instantEntry?: boolean;
  extra?: ReactNode;
  onInteract?: (id: LetterId) => void;
  onPointer?: (hovering: boolean) => void;
}

const DROP_FROM = 3.6;

const Letter = forwardRef<LetterHandle, LetterProps>(function Letter(
  { id, x, material, mountDelay = 0, instantEntry = false, extra, onInteract, onPointer },
  ref
) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const pressedRef = useRef(false);
  const startedRef = useRef(instantEntry);

  const geometry = useMemo(() => buildLetterGeometry(id), [id]);

  const springs = useMemo(
    () => ({
      posY: new ScalarSpring(instantEntry ? 0 : DROP_FROM, instantEntry ? 0 : DROP_FROM),
      posX: new ScalarSpring(0),
      rotZ: new ScalarSpring(0),
      squishY: new ScalarSpring(instantEntry ? 1 : 0.4, instantEntry ? 1 : 0.4),
      squishXZ: new ScalarSpring(instantEntry ? 1 : 1.5, instantEntry ? 1 : 1.5),
    }),
    [id, instantEntry],
  );

  const fire = () => {
    if (!startedRef.current) return;
    onInteract?.(id);
    switch (id) {
      case "A": {
        pressedRef.current = true;
        springs.squishY.target = 0.6;
        springs.squishXZ.target = 1.18;
        springs.posY.target = -0.16;
        break;
      }
      case "I": {
        springs.posY.impulse(-7.5);
        break;
      }
      case "N": {
        const dir = Math.random() > 0.5 ? 1 : -1;
        springs.rotZ.impulse(dir * 11);
        break;
      }
      case "O": {
        springs.rotZ.impulse(-16);
        springs.posX.impulse(-1.4);
        break;
      }
    }
  };

  const release = () => {
    if (id === "A" && pressedRef.current) {
      pressedRef.current = false;
      springs.squishY.target = 1;
      springs.squishXZ.target = 1;
      springs.posY.target = 0;
    }
  };

  useImperativeHandle(ref, () => ({
    trigger: fire,
    release,
    id,
  }));

  useFrame((state, dt) => {
    const g = groupRef.current;
    if (!g) return;

    if (!startedRef.current) {
      if (state.clock.elapsedTime > mountDelay) {
        startedRef.current = true;
        springs.posY.target = 0;
        springs.squishY.target = 1;
        springs.squishXZ.target = 1;
      }
    }

    const rotStiffness = id === "O" ? 22 : id === "N" ? 46 : 70;
    const rotDamping = id === "O" ? 2.3 : id === "N" ? 3.6 : 3.4;

    const posYStiffness = pressedRef.current ? 150 : 92;
    const posYDamping = pressedRef.current ? 15 : 13.5;

    springs.posY.update(dt, posYStiffness, posYDamping);
    springs.posX.update(dt, rotStiffness, rotDamping + 1.2);
    springs.rotZ.update(dt, rotStiffness, rotDamping);
    springs.squishY.update(dt, 120, 12);
    springs.squishXZ.update(dt, 120, 12);

    const idle = startedRef.current ? Math.sin(state.clock.elapsedTime * 1.4 + x * 1.7) * 0.028 : 0;
    const hoverLift = hovered && !pressedRef.current ? 0.05 : 0;

    g.position.y = springs.posY.value + idle + hoverLift;
    g.position.x = x + springs.posX.value;
    g.rotation.z = springs.rotZ.value;
    g.scale.set(springs.squishXZ.value, springs.squishY.value, springs.squishXZ.value);
  });

  return (
    <group
      ref={groupRef}
      position={[x, instantEntry ? 0 : DROP_FROM, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        fire();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        release();
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        onPointer?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        setHovered(false);
        onPointer?.(false);
        release();
        document.body.style.cursor = "auto";
      }}
    >
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      {extra}
    </group>
  );
});

export default Letter;
