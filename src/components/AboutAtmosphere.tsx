import { motion, useInView, useReducedMotion } from "../lib/motion";
import { useEffect, useRef, useState } from "react";
import "./AboutAtmosphere.css";

export default function AboutAtmosphere() {
  return (
    <div className="about-atmosphere" aria-hidden="true">
      <div className="about-atmosphere__base" />
      <div className="about-atmosphere__noise" />
    </div>
  );
}

const OPENING_CHARS = ["は", "じ", "ま", "り"] as const;

export function AboutOpening({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      onComplete();
      return;
    }

    setStarted(true);
    const t = setTimeout(() => onComplete(), 900);

    return () => clearTimeout(t);
  }, [inView, reduceMotion, onComplete]);

  return (
    <div ref={ref} className="about-opening" id="about-heading" aria-labelledby="about-opening-title">
      <h2 className="about-opening__title" id="about-opening-title">
        {OPENING_CHARS.map((char, i) => (
          <motion.span
            key={char}
            className="about-opening__char"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={
              started || reduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            transition={{
              duration: 0.42,
              delay: reduceMotion ? 0 : i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char}
          </motion.span>
        ))}
      </h2>
    </div>
  );
}
