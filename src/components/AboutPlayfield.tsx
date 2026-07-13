import { motion, useReducedMotion } from "../lib/motion";
import { useCallback, useRef, useState } from "react";
import "./AboutPlayfield.css";

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

const WORDS: FloatWord[] = [
  {
    id: "w1",
    text: "好奇心",
    x: 0.14,
    y: 0.08,
    driftX: [0, 5, -3, 6, 2, 0],
    driftY: [0, -6, 4, -5, 3, 0],
    duration: 13,
    delay: 0.6,
  },
  {
    id: "w2",
    text: "わくわく",
    x: 0.72,
    y: 0.14,
    driftX: [0, -5, 3, -4, 4, 0],
    driftY: [0, 5, -4, 6, -3, 0],
    duration: 11,
    delay: 1.8,
  },
  {
    id: "w3",
    text: "試す",
    x: 0.38,
    y: 0.3,
    driftX: [0, 4, -4, 2, -3, 0],
    driftY: [0, -5, 3, -6, 4, 0],
    duration: 9.5,
    delay: 0.3,
  },
  {
    id: "w4",
    text: "体験",
    x: 0.88,
    y: 0.46,
    driftX: [0, -4, 5, -3, 3, 0],
    driftY: [0, 4, -5, 3, -4, 0],
    duration: 14.5,
    delay: 2.4,
  },
  {
    id: "w5",
    text: "伝わる",
    x: 0.18,
    y: 0.58,
    driftX: [0, 5, -2, 4, -4, 0],
    driftY: [0, -4, 5, -5, 3, 0],
    duration: 12.5,
    delay: 1.1,
  },
  {
    id: "w6",
    text: "触る",
    x: 0.52,
    y: 0.76,
    driftX: [0, -3, 4, -5, 2, 0],
    driftY: [0, 6, -3, 4, -5, 0],
    duration: 10,
    delay: 3.2,
  },
];

export default function AboutPlayfield() {
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

  const popWord = (id: string) => {
    setLit(id);
    window.setTimeout(() => setLit(null), 650);
  };

  const incompleteText =
    incompleteStep === 0
      ? "伝___"
      : incompleteStep === 1
        ? "伝わ__"
        : incompleteStep === 2
          ? "伝わる"
          : "伝___";

  return (
    <div
      ref={fieldRef}
      className="about-playfield"
      aria-hidden="true"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {WORDS.map((word) => {
        const dx = mouse.x >= 0 ? word.x - mouse.x : 0;
        const dy = mouse.y >= 0 ? word.y - mouse.y : 0;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = dist < 0.22;
        const isLit = lit === word.id;

        return (
          <div
            key={word.id}
            className="about-playfield__anchor"
            style={{ left: `${word.x * 100}%`, top: `${word.y * 100}%` }}
          >
            <motion.button
              type="button"
              className={`about-playfield__word ${near ? "is-near" : ""} ${isLit ? "is-lit" : ""}`}
              onClick={() => popWord(word.id)}
              animate={
                reduceMotion
                  ? { x: near ? dx * 10 : 0, y: near ? dy * 10 : 0 }
                  : near
                    ? { x: dx * 14, y: dy * 14, scale: 1.03 }
                    : { x: word.driftX, y: word.driftY, scale: 1 }
              }
              transition={
                near
                  ? { type: "spring", stiffness: 120, damping: 22 }
                  : {
                      x: {
                        duration: word.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: word.delay,
                      },
                      y: {
                        duration: word.duration * 1.12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: word.delay + 0.8,
                      },
                    }
              }
              tabIndex={-1}
            >
              {word.text}
            </motion.button>
          </div>
        );
      })}

      <div className="about-playfield__anchor" style={{ left: "48%", top: "90%" }}>
        <motion.button
          type="button"
          className={`about-playfield__incomplete ${incompleteStep === 2 ? "is-done" : ""}`}
          onClick={() => setIncompleteStep((s) => (s + 1) % 4)}
          animate={reduceMotion ? undefined : { x: [0, 2, -1, 0], y: [0, -3, 2, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.6 }
          }
          tabIndex={-1}
        >
          {incompleteText}
        </motion.button>
      </div>
    </div>
  );
}
