import { useState } from "react";
import "./Header.css";

interface NavItem {
  jp: string;
  en: string;
  shape: "pill" | "cloud" | "cloud-sm" | "notch";
}

const NAV_ITEMS: NavItem[] = [
  { jp: "はじまり", en: "ABOUT", shape: "pill" },
  { jp: "カタチ", en: "WORKS", shape: "cloud" },
  { jp: "思考室", en: "PROCESS", shape: "cloud-sm" },
  { jp: "ご依頼", en: "PLAN", shape: "notch" },
  { jp: "その先", en: "CONTACT", shape: "pill" },
];

function ShapeOutline({ shape, active }: { shape: NavItem["shape"]; active: boolean }) {
  const strokeWidth = active ? 2.4 : 1.6;
  const stroke = "currentColor";
  switch (shape) {
    case "cloud":
      return (
        <svg viewBox="0 0 220 108" preserveAspectRatio="none" className="nav-shape">
          <path
            d="M 34 78
               C 16 78 8 62 18 50
               C 10 38 22 22 38 24
               C 42 10 64 4 78 14
               C 92 2 118 4 128 18
               C 146 8 172 16 174 34
               C 196 34 204 56 188 68
               C 198 82 182 96 164 92
               C 156 102 132 104 118 94
               C 104 104 78 102 70 90
               C 52 96 36 90 34 78 Z"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "notch":
      return (
        <svg viewBox="0 0 200 92" preserveAspectRatio="none" className="nav-shape">
          <path
            d="M 18 88
               L 18 30
               L 46 6
               L 154 6
               L 182 30
               L 182 88
               Z"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "cloud-sm":
      return (
        <svg viewBox="0 0 200 96" preserveAspectRatio="none" className="nav-shape">
          <path
            d="M 34 82
               C 14 82 6 64 18 52
               C 6 38 22 20 42 24
               C 48 8 78 2 100 16
               C 122 2 152 8 158 24
               C 178 20 194 38 182 52
               C 194 64 186 82 166 82
               C 162 92 138 94 124 84
               C 110 94 90 94 76 84
               C 62 94 40 92 34 82 Z"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 170 84" preserveAspectRatio="none" className="nav-shape">
          <rect x="4" y="4" width="162" height="76" rx="38" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      );
  }
}

export default function Header() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <header className="site-header">
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          <filter id="nav-rough" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.028 0.09" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.1" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <a className="logo" href="#top">
        <span className="logo-main">AINO</span>
        <span className="logo-sub">creator</span>
      </a>

      <nav className="nav-track" aria-label="メインナビゲーション">
        <svg className="nav-track__line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="10" x2="960" y2="10" stroke="var(--gray-dash)" strokeWidth="1.5" strokeDasharray="1 9" strokeLinecap="round" />
          <path d="M 958 4 L 972 10 L 958 16" fill="none" stroke="var(--gray-dash)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {NAV_ITEMS.map((item, i) => {
          const isActive = active === i;
          const isHover = hovered === i;
          const href = item.en === "ABOUT" ? "#about" : `#${item.en.toLowerCase()}`;
          return (
            <a
              key={item.en}
              href={href}
              className={`nav-item nav-item--${item.shape} ${isActive ? "is-active" : ""}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setActive(i)}
              style={{ zIndex: NAV_ITEMS.length - i }}
            >
              <span className="nav-dot" aria-hidden="true" />
              <ShapeOutline shape={item.shape} active={isActive || isHover} />
              <span className="nav-item__label">
                <span className="nav-item__jp">{item.jp}</span>
                <span className="nav-item__en">{item.en}</span>
              </span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
