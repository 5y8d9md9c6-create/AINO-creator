import type { CSSProperties } from "react";

interface DoodleProps {
  className?: string;
  style?: CSSProperties;
}

export function FlickMark({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 46 30" className={className} style={style} fill="none" aria-hidden="true">
      <path d="M3 24 C10 10, 16 6, 22 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 26 C17 15, 21 11, 26 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function CursorHand({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} fill="none" aria-hidden="true">
      <path
        d="M14 6.5c0-1.4 1.1-2.5 2.5-2.5S19 5.1 19 6.5v9.7l1.7-1.2c1.4-1 3.3-.6 4.1.9l.2.4c.6-.5 1.5-.6 2.2-.2 1 .5 1.4 1.7 1 2.7l-2.6 6.3c-1 2.5-3.4 4.1-6.1 4.1h-3.6c-2 0-3.9-1-5-2.7l-4.2-6.5c-.7-1.1-.4-2.6.7-3.4.9-.6 2.1-.5 2.9.2l1.7 1.5V6.5z"
        fill="var(--paper)"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CurveArrow({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 46" className={className} style={style} fill="none" aria-hidden="true">
      <path
        d="M4 6c2 16 14 30 30 32 6 .7 12-.4 17-3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      <path d="M44 28 L52 34.5 L43 38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function RollArrow({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 54 54" className={className} style={style} fill="none" aria-hidden="true">
      <path
        d="M12 14 C4 24 6 38 18 44 C30 50 44 44 47 32"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      <path d="M40 24 L48 31 L38 35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function DownArrow({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 20 40" className={className} style={style} fill="none" aria-hidden="true">
      <path d="M10 2 V30" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 6" />
      <path d="M3 25 L10 34 L17 25" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ShakeLines({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 40" className={className} style={style} fill="none" aria-hidden="true">
      <path d="M6 12 C10 12 10 20 6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 8 C20 8 20 24 14 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M46 8 C40 8 40 24 46 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M54 12 C50 12 50 20 54 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function UnderlineSwash({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 200 26" className={className} style={style} fill="none" aria-hidden="true">
      <path
        d="M3 8 C40 16 80 17 118 11 C132 9 140 9 148 13 C154 16 158 15 163 10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PushArrow({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 34 26" className={className} style={style} fill="none" aria-hidden="true">
      <path d="M4 4 L17 16 L30 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
