import type { CSSProperties } from "react";
import { CurveArrow, FlickMark, RollArrow } from "./Doodles";
import "./WorksAtmosphere.css";

const BLOBS = [
  { id: "b1", left: "-8%", top: "12%", w: 340, h: 340, tone: "warm", delay: 0 },
  { id: "b2", left: "72%", top: "38%", w: 420, h: 420, tone: "rose", delay: -4 },
  { id: "b3", left: "28%", top: "68%", w: 300, h: 300, tone: "sand", delay: -9 },
] as const;

const DOTS = Array.from({ length: 48 }, (_, i) => ({
  id: `d${i}`,
  left: `${(i % 8) * 14 + 4}%`,
  top: `${Math.floor(i / 8) * 16 + 6}%`,
  delay: (i % 5) * 0.8,
}));

export default function WorksAtmosphereBackdrop() {
  return (
    <div className="works-atmosphere" aria-hidden="true">
      <div className="works-atmosphere__base" />

      {BLOBS.map((blob) => (
        <div
          key={blob.id}
          className={`works-atmosphere__blob works-atmosphere__blob--${blob.tone}`}
          style={
            {
              left: blob.left,
              top: blob.top,
              width: blob.w,
              height: blob.h,
              animationDelay: `${blob.delay}s`,
            } as CSSProperties
          }
        />
      ))}

      <div className="works-atmosphere__grid">
        {DOTS.map((dot) => (
          <span
            key={dot.id}
            className="works-atmosphere__dot"
            style={{ left: dot.left, top: dot.top, animationDelay: `${dot.delay}s` }}
          />
        ))}
      </div>

      <svg className="works-atmosphere__arc works-atmosphere__arc--a" viewBox="0 0 200 120" fill="none">
        <path
          d="M8 96 C48 24 120 8 188 44"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 10"
        />
      </svg>
      <svg className="works-atmosphere__arc works-atmosphere__arc--b" viewBox="0 0 160 100" fill="none">
        <path
          d="M152 12 C96 8 44 36 12 88"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 10"
        />
      </svg>

      <FlickMark className="works-atmosphere__doodle works-atmosphere__doodle--a" />
      <CurveArrow className="works-atmosphere__doodle works-atmosphere__doodle--b" />
      <RollArrow className="works-atmosphere__doodle works-atmosphere__doodle--c" />

      <div className="works-atmosphere__noise" />
    </div>
  );
}
