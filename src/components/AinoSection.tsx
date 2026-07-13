import { Suspense, lazy, useRef } from "react";
import { createAnnotationPositions } from "../three/annotationTypes";
import "./AinoSection.css";

const AinoAnnotations = lazy(() => import("../three/AinoAnnotations"));
const AinoScene = lazy(() => import("../three/AinoScene"));

void import("../three/AinoScene");

export default function AinoSection() {
  const posRef = useRef(createAnnotationPositions());

  return (
    <div className="aino-section">
      <Suspense fallback={null}>
        <AinoScene posRef={posRef} />
        <AinoAnnotations posRef={posRef} />
      </Suspense>
    </div>
  );
}
