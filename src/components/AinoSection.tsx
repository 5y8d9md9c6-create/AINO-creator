import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { createAnnotationPositions } from "../three/annotationTypes";
import AinoAnnotations from "../three/AinoAnnotations";
import { scheduleIdleTask } from "../lib/idleMount";
import "./AinoSection.css";

const AinoScene = lazy(() => import("../three/AinoScene"));

export default function AinoSection() {
  const posRef = useRef(createAnnotationPositions());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const target = document.querySelector(".aino-section");
    if (!target) return;

    const activate = () => {
      scheduleIdleTask(() => setReady(true), { timeout: 1400, gapMs: 0 });
    };
    const options = { once: true, passive: true } as const;

    target.addEventListener("pointerdown", activate, options);
    target.addEventListener("touchstart", activate, options);

    const fallback = window.setTimeout(activate, 120000);

    return () => {
      target.removeEventListener("pointerdown", activate);
      target.removeEventListener("touchstart", activate);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="aino-section">
      {ready ? (
        <Suspense fallback={null}>
          <AinoScene posRef={posRef} />
          <AinoAnnotations posRef={posRef} />
        </Suspense>
      ) : null}
    </div>
  );
}
