import { motion, useReducedMotion } from "../lib/motion";
import { useCallback, useRef, useState } from "react";
import "./WorksPlayfield.css";

type FloatWord = {
  id: string;
  text: string;
  x: number;
  y: number;
  driftX: number[];
  driftY: number[];
  duration: number;
  delay: number;
};

const FLOAT_WORDS: FloatWord[] = [
  {
    id: "f1",
    text: "整理",
    x: 0.06,
    y: 0.12,
    driftX: [0, 4, -3, 5, 0],
    driftY: [0, -5, 3, -4, 0],
    duration: 11,
    delay: 0.2,
  },
  {
    id: "f2",
    text: "カタチ",
    x: 0.88,
    y: 0.08,
    driftX: [0, -5, 4, -3, 0],
    driftY: [0, 4, -5, 3, 0],
    duration: 13,
    delay: 1.1,
  },
  {
    id: "f3",
    text: "届ける",
    x: 0.04,
    y: 0.52,
    driftX: [0, 5, -2, 4, 0],
    driftY: [0, -4, 5, -3, 0],
    duration: 10,
    delay: 0.6,
  },
  {
    id: "f4",
    text: "触る",
    x: 0.92,
    y: 0.44,
    driftX: [0, -4, 3, -5, 0],
    driftY: [0, 5, -4, 4, 0],
    duration: 12,
    delay: 2.3,
  },
  {
    id: "f5",
    text: "整列",
    x: 0.1,
    y: 0.82,
    driftX: [0, 3, -4, 2, 0],
    driftY: [0, -3, 4, -5, 0],
    duration: 14,
    delay: 1.8,
  },
  {
    id: "f6",
    text: "わくわく",
    x: 0.78,
    y: 0.78,
    driftX: [0, -3, 5, -2, 0],
    driftY: [0, 4, -3, 5, 0],
    duration: 9,
    delay: 0.4,
  },
  {
    id: "f7",
    text: "面白い",
    x: 0.5,
    y: 0.06,
    driftX: [0, 2, -3, 4, 0],
    driftY: [0, -4, 2, -3, 0],
    duration: 12.5,
    delay: 2.8,
  },
];

export default function WorksPlayfield() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: -1, y: -1 });
  const [lit, setLit] = useState<string | null>(null);
  const [incompleteStep, setIncompleteStep] = useState(0);
  const reduceMotion = useReducedMotion();

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const onLeave = useCallback(() => setMouse({ x: -1, y: -1 }), []);

  const pop = (id: string) => {
    setLit(id);
    window.setTimeout(() => setLit(null), 550);
  };

  const incompleteText =
    incompleteStep === 0
      ? "整___"
      : incompleteStep === 1
        ? "整理_"
        : incompleteStep === 2
          ? "整理"
          : "整___";

  return (
    <div
      ref={fieldRef}
      className="works-playfield"
      aria-hidden="true"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="works-playfield__glow" />
      {FLOAT_WORDS.map((word) => {
        const dx = mouse.x >= 0 ? word.x - mouse.x : 0;
        const dy = mouse.y >= 0 ? word.y - mouse.y : 0;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = dist < 0.18;
        const isLit = lit === word.id;

        return (
          <div
            key={word.id}
            className="works-playfield__anchor"
            style={{ left: `${word.x * 100}%`, top: `${word.y * 100}%` }}
          >
            <motion.button
              type="button"
              className={`works-playfield__word ${near ? "is-near" : ""} ${isLit ? "is-lit" : ""}`}
              tabIndex={-1}
              onClick={() => pop(word.id)}
              animate={
                reduceMotion
                  ? { x: near ? dx * 12 : 0, y: near ? dy * 12 : 0 }
                  : near
                    ? { x: dx * 18, y: dy * 18, scale: 1.04 }
                    : { x: word.driftX, y: word.driftY, scale: 1 }
              }
              transition={
                near
                  ? { type: "spring", stiffness: 140, damping: 22 }
                  : {
                      x: {
                        duration: word.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: word.delay,
                      },
                      y: {
                        duration: word.duration * 1.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: word.delay + 0.7,
                      },
                    }
              }
            >
              {word.text}
            </motion.button>
          </div>
        );
      })}

      <div className="works-playfield__anchor" style={{ left: "46%", top: "92%" }}>
        <motion.button
          type="button"
          className={`works-playfield__incomplete ${incompleteStep === 2 ? "is-done" : ""}`}
          tabIndex={-1}
          onClick={() => setIncompleteStep((s) => (s + 1) % 4)}
          animate={reduceMotion ? undefined : { x: [0, 2, -1, 0], y: [0, -3, 2, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.6 }
          }
        >
          {incompleteText}
        </motion.button>
      </div>
    </div>
  );
}
