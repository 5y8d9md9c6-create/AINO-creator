import { motion, useReducedMotion } from "../lib/motion";
import "./ContactAtmosphere.css";

const PAPERS = [
  { top: "14%", left: "18%", rotate: -18, w: 28, h: 36 },
  { top: "48%", right: "16%", rotate: 14, w: 24, h: 32 },
  { top: "72%", left: "14%", rotate: 8, w: 22, h: 28 },
] as const;

export default function ContactAtmosphere() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="contact-atmosphere" aria-hidden="true">
      <div className="contact-atmosphere__glow contact-atmosphere__glow--a" />
      <div className="contact-atmosphere__glow contact-atmosphere__glow--b" />

      {PAPERS.map((paper, index) => (
        <motion.span
          key={`paper-${index}`}
          className="contact-atmosphere__paper"
          style={{
            top: paper.top,
            left: "left" in paper ? paper.left : undefined,
            right: "right" in paper ? paper.right : undefined,
            width: paper.w,
            height: paper.h,
            rotate: paper.rotate,
          }}
          animate={
            reduceMotion
              ? { opacity: 0.08 }
              : {
                  opacity: [0.06, 0.14, 0.08],
                  y: [0, -8, 0],
                  rotate: [paper.rotate, paper.rotate + 4, paper.rotate],
                }
          }
          transition={{
            duration: 9 + index * 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.6,
          }}
        />
      ))}

      <svg className="contact-atmosphere__cloud contact-atmosphere__cloud--a" viewBox="0 0 120 48" fill="none">
        <path
          d="M8 32 C20 22 36 18 52 24 C64 14 88 16 98 28 C108 26 114 34 108 38 C96 44 68 42 40 40 C24 38 12 38 8 32 Z"
          stroke="rgba(198, 193, 182, 0.22)"
          strokeWidth="1.2"
          fill="rgba(250, 250, 248, 0.35)"
        />
      </svg>
      <svg className="contact-atmosphere__cloud contact-atmosphere__cloud--b" viewBox="0 0 100 40" fill="none">
        <path
          d="M6 26 C18 18 34 16 48 22 C58 14 78 16 86 26 C92 24 96 30 90 32 C78 36 54 34 32 32 C18 30 8 30 6 26 Z"
          stroke="rgba(198, 193, 182, 0.18)"
          strokeWidth="1"
          fill="rgba(255, 255, 255, 0.28)"
        />
      </svg>
      <svg className="contact-atmosphere__cloud contact-atmosphere__cloud--c" viewBox="0 0 80 32" fill="none">
        <path
          d="M4 22 C14 14 28 12 40 18 C50 10 66 12 72 22 C76 20 78 26 74 27 C64 30 44 28 26 26 C14 24 6 24 4 22 Z"
          stroke="rgba(198, 193, 182, 0.15)"
          strokeWidth="1"
          fill="rgba(255, 255, 255, 0.22)"
        />
      </svg>
    </div>
  );
}
