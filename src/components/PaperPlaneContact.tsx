import { AnimatePresence, motion, useReducedMotion } from "../lib/motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useContactPlane } from "../context/ContactPlaneContext";
import { CONTACT_FORM } from "../data/contact";
import "./PaperPlaneContact.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const FLIGHT_MS = 2200;
const FLIGHT_SEGMENTS = 18;

type Point = { x: number; y: number };
type FlightPoint = Point & { rotate: number };

function quadraticPoint(a: number, b: number, c: number, t: number) {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

function buildWobblyFlight(
  origin: Point,
  landing: Point,
  seed = Math.random(),
  segments = FLIGHT_SEGMENTS,
) {
  const midX = (origin.x + landing.x) / 2 + (seed - 0.5) * 40;
  const arcLift = Math.min(180, Math.max(80, Math.abs(landing.y - origin.y) * 0.38 + 72 + seed * 24));
  const midY = Math.min(origin.y, landing.y) - arcLift;
  const phase = seed * Math.PI * 2;
  const amp = 0.82 + seed * 0.36;

  const dx = landing.x - origin.x;
  const dy = landing.y - origin.y;
  const len = Math.max(Math.hypot(dx, dy), 1);
  const perpX = -dy / len;
  const perpY = dx / len;

  const points: FlightPoint[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const baseX = quadraticPoint(origin.x, midX, landing.x, t);
    const baseY = quadraticPoint(origin.y, midY, landing.y, t);
    const envelope = Math.sin(t * Math.PI);

    const sideSway =
      Math.sin(t * Math.PI * (4.6 + seed * 1.2) + phase) * 16 * amp * envelope +
      Math.sin(t * Math.PI * (8.1 + seed) + phase * 0.5) * 8 * amp * envelope;
    const bob =
      Math.sin(t * Math.PI * (6 + seed * 0.8) + phase * 1.1) * 10 * amp * envelope +
      Math.sin(t * Math.PI * (2.4 + seed * 0.5)) * 4 * amp * envelope;

    points.push({
      x: baseX + perpX * sideSway,
      y: baseY + perpY * sideSway * 0.32 + bob,
      rotate: 0,
    });
  }

  for (let i = 0; i < points.length; i += 1) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const heading = Math.atan2(next.y - prev.y, next.x - prev.x) * (180 / Math.PI);
    const t = i / (points.length - 1);
    const envelope = Math.sin(t * Math.PI);
    const bank =
      Math.sin(t * Math.PI * 4.8) * 14 * envelope +
      Math.sin(t * Math.PI * 9.1) * 6 * envelope;
    const pitch = Math.sin(t * Math.PI * 6.1 + 0.8) * 5 * envelope;
    points[i].rotate = heading + bank + pitch;
  }

  const trailPath =
    `M ${points[0].x} ${points[0].y} ` +
    points.slice(1).map((point) => `L ${point.x} ${point.y}`).join(" ");

  const times = points.map((_, index) => index / (points.length - 1));

  return { points, trailPath, times };
}

const INK = "#4f2f35";
const PAPER = "#ffffff";
const SHADE = "#c2cad2";
const STROKE = 2.35;

function inkStroke(d: string, fill: string, strokeWidth = STROKE) {
  return (
    <>
      <path
        d={d}
        fill={fill}
        stroke="#fff"
        strokeWidth={strokeWidth + 3.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={d}
        fill={fill}
        stroke={INK}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </>
  );
}

function sketchDefs(filterId: string) {
  return (
    <>
      <filter id={`sketch-${filterId}`} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.042" numOctaves="3" seed="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.85" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`soft-shadow-${filterId}`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(79, 47, 53, 0.12)" />
      </filter>
    </>
  );
}

export function PaperPlaneGraphic({
  active,
  reduceMotion,
  className,
  flying = false,
  showMotionLines = false,
}: {
  active: boolean;
  reduceMotion: boolean | null;
  className?: string;
  flying?: boolean;
  showMotionLines?: boolean;
}) {
  const filterId = useId().replace(/:/g, "");
  const noseOrigin = "82px 28px";
  const hoverActive = active && !reduceMotion;
  const flutterActive = flying && !reduceMotion;
  const motionLinesVisible = showMotionLines || hoverActive || flutterActive;

  const strokeShape = (d: string, fill: string, key?: string) => (
    <g key={key}>{inkStroke(d, fill)}</g>
  );

  return (
    <motion.svg
      className={className}
      viewBox="0 0 120 90"
      fill="none"
      aria-hidden="true"
      animate={
        hoverActive
          ? { rotate: [0, -2.5, 1.8, -1.2, 0], y: [0, -2.5, 1.2, -1.5, 0] }
          : flutterActive
            ? { rotate: [0, 2, -2.8, 1.5, 0], y: [0, -1.8, 2, -1, 0] }
            : { rotate: 0, y: 0 }
      }
      transition={{
        duration: flutterActive ? 0.5 : 3.6,
        repeat: hoverActive || flutterActive ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      <defs>
        {sketchDefs(filterId)}
      </defs>

      <g filter={`url(#soft-shadow-${filterId})`}>
        <g filter={`url(#sketch-${filterId})`}>
          {/* keel — grey underside */}
          {strokeShape("M24 63 L81 29 L57 56 L24 63 Z", SHADE, "keel")}

          {/* lower wing */}
          <motion.g
            style={{ transformOrigin: noseOrigin, transformBox: "fill-box" }}
            animate={
              hoverActive
                ? { rotate: [0, 3, -2, 1.5, 0] }
                : flutterActive
                  ? { rotate: [0, 5, -4, 3, -1.5, 0] }
                  : { rotate: 0 }
            }
            transition={{
              duration: flutterActive ? 0.44 : 2.8,
              repeat: hoverActive || flutterActive ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            {strokeShape("M24 61 L81 29 L50 74 L24 61 Z", PAPER, "wing-low")}
          </motion.g>

          {/* upper wing */}
          <motion.g
            style={{ transformOrigin: noseOrigin, transformBox: "fill-box" }}
            animate={
              hoverActive
                ? { rotate: [0, -2.5, 2, -1, 0] }
                : flutterActive
                  ? { rotate: [0, -4.5, 3.5, -2.5, 1, 0] }
                  : { rotate: 0 }
            }
            transition={{
              duration: flutterActive ? 0.42 : 2.6,
              repeat: hoverActive || flutterActive ? Infinity : 0,
              ease: "easeInOut",
              delay: 0.05,
            }}
          >
            {strokeShape("M24 61 L81 29 L46 36 L24 61 Z", PAPER, "wing-high")}
          </motion.g>

          {/* center fold */}
          <motion.path
            d="M24 61 L81 29"
            stroke={INK}
            strokeWidth={STROKE * 0.85}
            strokeLinecap="round"
            animate={
              hoverActive || flutterActive
                ? { opacity: [0.55, 0.9, 0.58], pathLength: [0.94, 1, 0.96] }
                : { opacity: 0.72, pathLength: 1 }
            }
            transition={{
              duration: flutterActive ? 0.38 : 2.2,
              repeat: hoverActive || flutterActive ? Infinity : 0,
              ease: "easeInOut",
            }}
          />

          {/* wing creases from nose */}
          <path d="M81 29 L50 74" stroke={INK} strokeWidth={STROKE * 0.72} strokeLinecap="round" opacity="0.55" />
          <path d="M81 29 L46 36" stroke={INK} strokeWidth={STROKE * 0.72} strokeLinecap="round" opacity="0.55" />

          {/* motion lines */}
          <motion.g
            animate={motionLinesVisible ? { opacity: [0.35, 0.85, 0.4] } : { opacity: 0 }}
            transition={{
              duration: flutterActive ? 0.35 : 1.8,
              repeat: motionLinesVisible ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <path d="M12 74 L6 80" stroke={INK} strokeWidth={STROKE * 0.9} strokeLinecap="round" />
            <path d="M18 70 L12 76" stroke={INK} strokeWidth={STROKE * 0.9} strokeLinecap="round" />
            <path d="M24 66 L18 72" stroke={INK} strokeWidth={STROKE * 0.9} strokeLinecap="round" />
          </motion.g>
        </g>
      </g>
    </motion.svg>
  );
}

export function PaperPlaneLaunch() {
  const { phase, launch, completeFlight } = useContactPlane();
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const busy = phase === "flying";
  const showLaunchPlane = phase !== "flying";

  const handleLaunch = useCallback(() => {
    if (busy) return;

    const contact = document.getElementById("contact");
    if (!contact) return;

    if (reduceMotion) {
      contact.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        completeFlight();
        window.dispatchEvent(new CustomEvent("aino:contact-plane-landed"));
      }, 400);
      return;
    }

    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;

    launch({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height * 0.38,
    });
  }, [busy, completeFlight, launch, reduceMotion]);

  return (
    <button
      ref={wrapRef}
      type="button"
      className={`paper-plane-launch${hovered ? " paper-plane-launch--hover" : ""}${busy ? " paper-plane-launch--busy" : ""}`}
      onClick={handleLaunch}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={busy}
      aria-label="飛ばしてみる？ Contactセクションへ"
    >
      <span className="paper-plane-launch__visual" aria-hidden="true">
        <AnimatePresence>
          {showLaunchPlane ? (
            <motion.span
              key="launch-plane"
              className="paper-plane-launch__plane-wrap"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, y: -10 }}
              transition={{ duration: 0.24, ease: EASE }}
            >
              <motion.span
                className="paper-plane-launch__shadow"
                animate={
                  hovered && !reduceMotion && !busy
                    ? {
                        scale: [1, 1.08, 0.96, 1.04, 1],
                        opacity: [0.22, 0.38, 0.26, 0.34, 0.22],
                        x: [0, 2, -2, 1, 0],
                      }
                    : { scale: 1, opacity: 0.22, x: 0 }
                }
                transition={{ duration: 3.4, repeat: hovered && !busy ? Infinity : 0, ease: "easeInOut" }}
              />
              <PaperPlaneGraphic
                active={hovered && !busy}
                reduceMotion={reduceMotion}
                showMotionLines={hovered && !busy}
                className="paper-plane-launch__plane"
              />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      <span className="paper-plane-launch__label">飛ばしてみる？</span>
    </button>
  );
}

function getLandingPoint() {
  const anchor = document.getElementById("contact-plane-landing");
  if (!anchor) {
    const contact = document.getElementById("contact");
    if (!contact) return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.72 };
    const rect = contact.getBoundingClientRect();
    return { x: rect.left + 48, y: rect.top + 120 };
  }
  const rect = anchor.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function getSubmitTarget() {
  const logo = document.querySelector(".logo");
  if (logo) {
    const rect = logo.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  return { x: window.innerWidth * 0.78, y: 52 };
}

function getHeroLandingPoint() {
  const aino = document.querySelector(".aino-section");
  if (aino) {
    const rect = aino.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 };
  }
  const top = document.getElementById("top");
  if (top) {
    const rect = top.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.38 };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight * 0.32 };
}

export function PaperPlaneFlightLayer() {
  const {
    phase,
    origin,
    flightIntent,
    flightSeed,
    submitMailto,
    completeFlight,
    completeSubmit,
    completeReturnHero,
  } = useContactPlane();
  const reduceMotion = useReducedMotion();
  const [flight, setFlight] = useState<ReturnType<typeof buildWobblyFlight> | null>(null);

  useEffect(() => {
    if (phase !== "flying" || !origin || !flightIntent || reduceMotion) return;

    const landing =
      flightIntent === "submit"
        ? getSubmitTarget()
        : flightIntent === "returnHero"
          ? getHeroLandingPoint()
          : getLandingPoint();
    setFlight(buildWobblyFlight(origin, landing, flightSeed));

    if (flightIntent === "navigate") {
      const contact = document.getElementById("contact");
      window.setTimeout(() => {
        contact?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 280);
    }

    if (flightIntent === "returnHero") {
      window.setTimeout(() => {
        document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 280);
    }

    const timer = window.setTimeout(() => {
      if (flightIntent === "submit") {
        if (submitMailto) {
          window.location.href = submitMailto;
        }
        completeSubmit();
        window.dispatchEvent(new CustomEvent("aino:contact-submit-sent"));
      } else if (flightIntent === "returnHero") {
        completeReturnHero();
        window.dispatchEvent(new CustomEvent("aino:footer-return-hero"));
      } else {
        completeFlight();
        window.dispatchEvent(new CustomEvent("aino:contact-plane-landed"));
      }
    }, FLIGHT_MS);

    return () => window.clearTimeout(timer);
  }, [
    phase,
    origin,
    flightIntent,
    flightSeed,
    submitMailto,
    completeFlight,
    completeSubmit,
    completeReturnHero,
    reduceMotion,
  ]);

  const keyframes = useMemo(() => {
    if (!flight) return null;
    const last = flight.points.length - 1;
    return {
      left: flight.points.map((point) => point.x),
      top: flight.points.map((point) => point.y),
      rotate: flight.points.map((point) => point.rotate),
      scale: flight.points.map((_, index) => {
        const t = index / last;
        const envelope = Math.sin(t * Math.PI);
        return 1 + envelope * 0.06 + Math.sin(t * Math.PI * 5) * 0.03 * envelope;
      }),
      opacity: flight.points.map((_, index) => {
        const t = index / last;
        if (t > 0.88) return 1 - (t - 0.88) / 0.12;
        return 1;
      }),
      times: flight.times,
    };
  }, [flight]);

  if (reduceMotion || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {phase === "flying" && origin && flight && keyframes ? (
        <motion.div
          className="paper-plane-flight"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="paper-plane-flight__trail-svg">
            <motion.path
              d={flight.trailPath}
              fill="none"
              stroke="rgba(198, 193, 182, 0.5)"
              strokeWidth="1.2"
              strokeDasharray="4 8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.45 }}
              animate={{ pathLength: 1, opacity: 0 }}
              transition={{ duration: FLIGHT_MS / 1000, ease: "linear" }}
            />
          </svg>

          <motion.div
            className="paper-plane-flight__plane"
            initial={{
              left: keyframes.left[0],
              top: keyframes.top[0],
              x: "-50%",
              y: "-50%",
              rotate: keyframes.rotate[0],
              scale: keyframes.scale[0],
              opacity: 1,
            }}
            animate={{
              left: keyframes.left,
              top: keyframes.top,
              x: "-50%",
              y: "-50%",
              rotate: keyframes.rotate,
              scale: keyframes.scale,
              opacity: keyframes.opacity,
            }}
            transition={{
              duration: FLIGHT_MS / 1000,
              ease: "linear",
              times: keyframes.times,
            }}
          >
            <PaperPlaneGraphic
              active
              flying
              showMotionLines
              reduceMotion={false}
              className="paper-plane-flight__plane-svg"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function ContactEnvelopeIcon() {
  const filterId = useId().replace(/:/g, "");

  return (
    <svg className="contact-envelope" viewBox="0 0 120 90" fill="none" aria-hidden="true">
      <defs>{sketchDefs(filterId)}</defs>
      <g filter={`url(#soft-shadow-${filterId})`}>
        <g filter={`url(#sketch-${filterId})`}>
          {inkStroke("M22 40 L22 80 Q22 84 26 84 L94 84 Q98 84 98 80 L98 40 Z", PAPER)}

          <path
            d="M22 44 L60 66 L98 44 L98 80 L22 80 Z"
            fill={SHADE}
            fillOpacity="0.32"
            stroke="none"
          />

          <path
            d="M22 44 L60 66 L98 44"
            stroke={INK}
            strokeWidth={STROKE * 0.78}
            strokeLinejoin="round"
            fill="none"
            opacity="0.55"
          />

          {inkStroke("M22 44 L60 66 L98 44 Z", PAPER, STROKE * 0.95)}

          <circle cx="60" cy="60" r="7" fill={PAPER} stroke={INK} strokeWidth={STROKE * 0.85} />
          <circle cx="60" cy="60" r="3" fill={INK} fillOpacity="0.22" stroke="none" />
        </g>
      </g>
    </svg>
  );
}

export function ContactSubmitButton({
  reduceMotion,
  disabled,
  onLaunch,
  fillProgress = 0,
}: {
  reduceMotion: boolean | null;
  disabled?: boolean;
  onLaunch: (origin: { x: number; y: number }) => void;
  fillProgress?: number;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const busy = disabled;
  const hoverActive = hovered && !reduceMotion && !busy;

  const handleMove = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!hoverActive || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setTilt({
        x: ((event.clientX - cx) / rect.width) * 10,
        y: ((event.clientY - cy) / rect.height) * 6,
      });
    },
    [hoverActive],
  );

  const handleClick = useCallback(() => {
    if (busy || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    onLaunch({
      x: rect.left + rect.width * 0.42,
      y: rect.top + rect.height * 0.45,
    });
  }, [busy, onLaunch]);

  const planeActive = hoverActive || fillProgress > 0.25;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`contact-form__submit${hoverActive ? " contact-form__submit--hover" : ""}`}
      disabled={busy}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={handleMove}
      onFocus={() => setHovered(true)}
      onBlur={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
    >
      <span className="contact-form__submit-visual" aria-hidden="true">
        <motion.span
          className="contact-form__submit-shadow"
          animate={
            hoverActive
              ? {
                  scale: [1, 1.14, 0.92, 1.08, 1],
                  opacity: [0.18, 0.42, 0.22, 0.34, 0.18],
                  x: tilt.x * 0.55,
                  y: 2 + Math.abs(tilt.y) * 0.15,
                }
              : { scale: 1 + fillProgress * 0.04, opacity: 0.16 + fillProgress * 0.08, x: 0, y: 0 }
          }
          transition={{ duration: 3.2, repeat: hoverActive ? Infinity : 0, ease: "easeInOut" }}
        />
        <motion.span
          className="contact-form__submit-plane-wrap"
          animate={
            hoverActive
              ? {
                  y: [-3, -7, -2, -6, -3],
                  rotate: tilt.x * 0.75,
                  scale: 1.06,
                  x: tilt.x * 0.35,
                }
              : { y: -fillProgress * 2, rotate: 0, scale: 1 + fillProgress * 0.03, x: 0 }
          }
          transition={{ duration: hoverActive ? 2.6 : 0.45, repeat: hoverActive ? Infinity : 0, ease: "easeInOut" }}
        >
          <PaperPlaneGraphic
            active={planeActive}
            reduceMotion={reduceMotion}
            className="contact-form__submit-plane"
            showMotionLines={hoverActive}
          />
        </motion.span>
      </span>
      <span className="contact-form__submit-label">{CONTACT_FORM.submitLabel}</span>
    </button>
  );
}
