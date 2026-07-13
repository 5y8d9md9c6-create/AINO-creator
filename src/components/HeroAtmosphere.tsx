import type { CSSProperties } from "react";
import "./HeroAtmosphere.css";

const PARTICLES = [
  { left: "22%", top: "38%", size: 2, tone: "pink", delay: 0, duration: 16 },
  { left: "48%", top: "28%", size: 1, tone: "white", delay: -4, duration: 15 },
  { left: "68%", top: "44%", size: 2, tone: "yellow", delay: -2, duration: 17 },
  { left: "36%", top: "58%", size: 1, tone: "blue", delay: -6, duration: 14 },
  { left: "58%", top: "62%", size: 1, tone: "white", delay: -3, duration: 18 },
  { left: "78%", top: "34%", size: 2, tone: "pink", delay: -7, duration: 16 },
];

export default function HeroAtmosphere() {
  return (
    <div className="hero-atmosphere" aria-hidden="true">
      <div className="hero-atmosphere__base" />

      <div className="hero-atmosphere__aino-air">
        <div className="hero-atmosphere__lights">
          <div className="hero-atmosphere__orb hero-atmosphere__orb--pink" />
          <div className="hero-atmosphere__orb hero-atmosphere__orb--yellow" />
          <div className="hero-atmosphere__orb hero-atmosphere__orb--blue" />
        </div>

        <div className="hero-atmosphere__aino-glow" />

        <div className="hero-atmosphere__particles">
          {PARTICLES.map((p) => (
            <span
              key={`${p.left}-${p.top}`}
              className={`hero-atmosphere__particle hero-atmosphere__particle--${p.tone}`}
              style={
                {
                  left: p.left,
                  top: p.top,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      <div className="hero-atmosphere__noise" />
    </div>
  );
}
