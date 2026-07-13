import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { AnchorKey, AnnotationPositions } from "./annotationTypes";
import { DownLabel, PushLabel, RollLabel, ShakeLabel } from "./LetterAnnotations";
import "./annotations.css";

interface AinoAnnotationsProps {
  posRef: MutableRefObject<AnnotationPositions>;
}

const KEYS: AnchorKey[] = ["A", "I", "N", "O"];

/**
 * Plain DOM overlay that mirrors the live (camera-projected) screen position
 * of each 3D letter's annotation anchor every animation frame. Deliberately
 * bypasses drei's in-Canvas <Html>, which mis-projects once the surrounding
 * flex layout resizes the canvas after first mount.
 */
export default function AinoAnnotations({ posRef }: AinoAnnotationsProps) {
  const nodeRefs = useRef<Partial<Record<AnchorKey, HTMLDivElement | null>>>({});

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      KEYS.forEach((key) => {
        const node = nodeRefs.current[key];
        if (!node) return;
        const pos = posRef.current[key];
        if (!pos) {
          node.style.opacity = "0";
          return;
        }
        node.style.opacity = "1";
        node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [posRef]);

  return (
    <div className="annotation-overlay" aria-hidden="true">
      <div className="annotation-node" ref={(n) => { nodeRefs.current.A = n; }}>
        <PushLabel />
      </div>
      <div className="annotation-node" ref={(n) => { nodeRefs.current.I = n; }}>
        <DownLabel />
      </div>
      <div className="annotation-node" ref={(n) => { nodeRefs.current.N = n; }}>
        <ShakeLabel />
      </div>
      <div className="annotation-node" ref={(n) => { nodeRefs.current.O = n; }}>
        <RollLabel />
      </div>
    </div>
  );
}
