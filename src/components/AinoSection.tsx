import { useCallback, useRef, useState } from "react";
import { createAnnotationPositions } from "../three/annotationTypes";
import AinoAnnotations from "../three/AinoAnnotations";
import AinoScene from "../three/AinoScene";
import "./AinoSection.css";

export default function AinoSection() {
  const posRef = useRef(createAnnotationPositions());
  const [sceneVisible, setSceneVisible] = useState(false);

  const handleSceneReady = useCallback(() => {
    setSceneVisible(true);
  }, []);

  return (
    <div className="aino-section">
      <div
        className={`aino-section__silhouette${sceneVisible ? " aino-section__silhouette--hidden" : ""}`}
        aria-hidden="true"
      >
        <span className="aino-section__silhouette-word">AINO</span>
      </div>
      <AinoScene posRef={posRef} onSceneReady={handleSceneReady} />
      <AinoAnnotations posRef={posRef} />
    </div>
  );
}
