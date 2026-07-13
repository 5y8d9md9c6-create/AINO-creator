import { useRef } from "react";
import { createAnnotationPositions } from "../three/annotationTypes";
import AinoAnnotations from "../three/AinoAnnotations";
import AinoScene from "../three/AinoScene";
import "./AinoSection.css";

export default function AinoSection() {
  const posRef = useRef(createAnnotationPositions());

  return (
    <div className="aino-section">
      <AinoScene posRef={posRef} />
      <AinoAnnotations posRef={posRef} />
    </div>
  );
}
