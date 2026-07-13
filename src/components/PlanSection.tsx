import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "../lib/motion";
import { useId, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  HEADER_BUBBLES,
  PLAN_BODY,
  PLAN_BRIDGE,
  PLAN_CLOSING,
  PLAN_SERVICES,
  PLAN_SUBSCRIPTION,
  PLAN_TAGLINE,
  type PlanPrice,
  type PlanService,
  type PlanSubscriptionTier,
} from "../data/plan";
import { SITE_DISPLAY_HOST } from "../data/site-config";
import { PaperPlaneLaunch } from "./PaperPlaneContact";
import "./PlanSection.css";
import "./PaperPlaneContact.css";

const OPENING_CHARS = ["ご", "依", "頼"] as const;
const EASE = [0.22, 1, 0.36, 1] as const;
const BREATH = { duration: 4.8, repeat: Infinity, ease: "easeInOut" as const };

function splitChars(text: string) {
  return [...text];
}

function FloatingPrice({ amount, active }: { amount: string; active: boolean }) {
  return (
    <span className="plan-price-float" aria-label={amount}>
      {splitChars(amount).map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="plan-price-float__char"
          animate={
            active
              ? { y: [0, -2 - (index % 3), 0], opacity: [1, 0.9, 1] }
              : { y: 0, opacity: 1 }
          }
          transition={{
            duration: 2.4 + index * 0.08,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.04,
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function PlanPriceDisplay({ prices, hovered }: { prices: PlanPrice[]; hovered: boolean }) {
  if (prices.length === 1 && !prices[0].label) {
    return (
      <p className="plan-card__price">
        <FloatingPrice amount={prices[0].amount} active={hovered} />
      </p>
    );
  }

  return (
    <div className="plan-card__prices">
      {prices.map((price) => (
        <p key={`${price.label ?? "price"}-${price.amount}`} className="plan-card__price-line">
          {price.label ? <span className="plan-card__price-label">{price.label}</span> : null}
          <span className="plan-card__price-amount">
            <FloatingPrice amount={price.amount} active={hovered} />
          </span>
        </p>
      ))}
    </div>
  );
}

/* ── Service visuals — peek inside, shape stays ── */

function WebsiteVisual({
  active,
  isPeeking,
  includes,
  reduceMotion,
}: {
  active: boolean;
  isPeeking: boolean;
  includes: string[];
  reduceMotion: boolean | null;
}) {
  return (
    <div className="plan-visual plan-visual--website" aria-hidden="true">
      <motion.div
        className="plan-visual-browser"
        animate={active && !reduceMotion && !isPeeking ? { y: [0, -2, 0] } : { y: 0 }}
        transition={{ duration: 3.6, repeat: active && !isPeeking ? Infinity : 0, ease: "easeInOut" }}
      >
        <motion.div
          className="plan-visual-browser__chrome"
          animate={active && !reduceMotion ? { scaleY: isPeeking ? 1.02 : [1, 1.04, 1] } : { scaleY: 1 }}
          transition={{ duration: isPeeking ? 0.45 : 2.8, repeat: active && !isPeeking ? Infinity : 0, ease: "easeInOut" }}
        >
          <span className="plan-visual-browser__dot plan-visual-browser__dot--a" />
          <span className="plan-visual-browser__dot plan-visual-browser__dot--b" />
          <span className="plan-visual-browser__dot plan-visual-browser__dot--c" />
          <span className="plan-visual-browser__url">{SITE_DISPLAY_HOST}</span>
          <span className="plan-visual-browser__menu" />
        </motion.div>
        <div className="plan-visual-browser__viewport">
          <motion.div
            className="plan-visual-browser__layers"
            animate={{ y: isPeeking ? "-50%" : "0%" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="plan-visual-browser__layer">
              <motion.div
                className="plan-visual-browser__scene"
                animate={
                  active && !reduceMotion && !isPeeking
                    ? { x: [0, 6, -4, 0], y: [0, -3, 2, 0] }
                    : { x: 0, y: 0 }
                }
                transition={{ duration: 5, repeat: active && !isPeeking ? Infinity : 0, ease: "easeInOut" }}
              >
                <span className="plan-visual-browser__mountain" />
                <span className="plan-visual-browser__sun" />
                <div className="plan-visual-browser__blocks">
                  <span /><span /><span />
                </div>
              </motion.div>
            </div>
            <div className="plan-visual-browser__layer plan-visual-browser__layer--peek">
              <motion.ul
                className="plan-visual-browser__peek-list"
                initial={false}
                animate={isPeeking ? { opacity: 1 } : { opacity: 0.85 }}
              >
                {includes.slice(0, 4).map((item, index) => (
                  <motion.li
                    key={item}
                    animate={
                      isPeeking && !reduceMotion
                        ? { opacity: [0.82, 1, 0.82], x: [0, 1, 0] }
                        : { opacity: 0.92, x: 0 }
                    }
                    transition={{ duration: 2.6, repeat: isPeeking ? Infinity : 0, delay: index * 0.12, ease: "easeInOut" }}
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function LpVisual({
  active,
  isPeeking,
  includes,
  reduceMotion,
}: {
  active: boolean;
  isPeeking: boolean;
  includes: string[];
  reduceMotion: boolean | null;
}) {
  return (
    <div className="plan-visual plan-visual--lp" aria-hidden="true">
      <div className="plan-visual-scroll">
        <div className="plan-visual-scroll__roll plan-visual-scroll__roll--top" />
        <motion.div
          className="plan-visual-scroll__body"
          animate={
            isPeeking
              ? { height: "92%" }
              : active && !reduceMotion
                ? { height: ["72%", "82%", "72%"] }
                : { height: "72%" }
          }
          transition={{ duration: isPeeking ? 0.55 : 4, repeat: active && !isPeeking ? Infinity : 0, ease: "easeInOut" }}
        >
          <motion.div
            className="plan-visual-scroll__track"
            animate={
              isPeeking && !reduceMotion
                ? { y: [0, -12, 0] }
                : active && !reduceMotion
                  ? { y: [0, -18, 0] }
                  : { y: 0 }
            }
            transition={{ duration: isPeeking ? 3.2 : 4.2, repeat: isPeeking || active ? Infinity : 0, ease: "easeInOut" }}
          >
            <span className="plan-visual-scroll__hero" />
            <span /><span /><span /><span />
            {isPeeking
              ? includes.slice(0, 3).map((item) => (
                  <span key={item} className="plan-visual-scroll__peek-line">
                    {item}
                  </span>
                ))
              : null}
            <span className="plan-visual-scroll__cta" />
          </motion.div>
          <motion.span
            className="plan-visual-scroll__hint"
            animate={{ opacity: isPeeking ? 0 : 0.55 }}
          >
            Scroll
          </motion.span>
          <motion.span
            className="plan-visual-scroll__arrow"
            animate={{ opacity: isPeeking ? 0 : 0.45, y: isPeeking ? 4 : 0 }}
          >
            ↓
          </motion.span>
        </motion.div>
        <div className="plan-visual-scroll__roll plan-visual-scroll__roll--bottom" />
      </div>
    </div>
  );
}

function DesignVisual({
  active,
  isPeeking,
  includes,
  reduceMotion,
}: {
  active: boolean;
  isPeeking: boolean;
  includes: string[];
  reduceMotion: boolean | null;
}) {
  const notes = [
    { id: "banner", label: "バナー", price: "¥5,000〜", tone: "a", r: -4, x: 0, y: 0, back: includes[0] ?? "バナー" },
    { id: "card", label: "名刺", price: "¥15,000〜", tone: "b", r: 3, x: 8, y: 6, back: includes[1] ?? "名刺" },
    { id: "flyer", label: "フライヤー", price: "¥20,000〜", tone: "c", r: -2, x: -6, y: 10, back: includes[2] ?? "フライヤー" },
  ] as const;

  return (
    <div className="plan-visual plan-visual--design" aria-hidden="true">
      <span className="plan-visual-board__tape" />
      <span className="plan-visual-board__chart" />
      {notes.map((note, index) => (
        <motion.span
          key={note.id}
          className={`plan-visual-note plan-visual-note--${note.tone}`}
          style={{ transformStyle: "preserve-3d" }}
          animate={
            isPeeking
              ? { rotateY: 180, rotate: note.r, y: note.y, x: note.x }
              : active && !reduceMotion
                ? {
                    rotateY: 0,
                    rotate: [note.r, note.r + (index % 2 === 0 ? 5 : -5), note.r],
                    y: [note.y, note.y - 4, note.y],
                    x: [note.x, note.x + (index % 2 === 0 ? 2 : -2), note.x],
                  }
                : { rotateY: 0, rotate: note.r, y: note.y, x: note.x }
          }
          transition={{ duration: isPeeking ? 0.55 : 2.8 + index * 0.2, repeat: active && !isPeeking ? Infinity : 0, ease: "easeInOut", delay: isPeeking ? 0 : index * 0.08 }}
        >
          <span className="plan-visual-note__face plan-visual-note__face--front">
            <span className="plan-visual-note__label">{note.label}</span>
            <span className="plan-visual-note__price">{note.price}</span>
          </span>
          <span className="plan-visual-note__face plan-visual-note__face--back">{note.back}</span>
        </motion.span>
      ))}
      <motion.span
        className="plan-visual-board__page"
        animate={
          isPeeking && !reduceMotion
            ? { rotateY: [0, 24, 0] }
            : active && !reduceMotion
              ? { rotateY: [0, 12, 0] }
              : { rotateY: 0 }
        }
        transition={{ duration: isPeeking ? 2.4 : 3.6, repeat: isPeeking || active ? Infinity : 0, ease: "easeInOut" }}
      />
    </div>
  );
}

function AppVisual({
  active,
  isPeeking,
  includes,
  reduceMotion,
}: {
  active: boolean;
  isPeeking: boolean;
  includes: string[];
  reduceMotion: boolean | null;
}) {
  const peekItems = includes.slice(0, 4);

  return (
    <div className="plan-visual plan-visual--app" aria-hidden="true">
      <div className="plan-visual-phone">
        <span className="plan-visual-phone__notch" />
        <div className="plan-visual-phone__screen">
          <motion.div
            className="plan-visual-phone__track"
            animate={{ x: isPeeking ? "-50%" : "0%" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="plan-visual-phone__slide">
              <motion.div
                animate={active && !reduceMotion && !isPeeking ? { x: [0, -4, 0] } : { x: 0 }}
                transition={{ duration: 3.8, repeat: active && !isPeeking ? Infinity : 0, ease: "easeInOut" }}
              >
                <span className="plan-visual-phone__bar" />
                <div className="plan-visual-phone__icons">
                  <span /><span /><span /><span />
                </div>
                <span className="plan-visual-phone__bell" />
                <div className="plan-visual-phone__chart">
                  <span /><span /><span />
                </div>
                <span className="plan-visual-phone__cta" />
              </motion.div>
            </div>
            <div className="plan-visual-phone__slide plan-visual-phone__slide--peek">
              <ul className="plan-visual-phone__peek-list">
                {peekItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ServiceVisual({
  service,
  active,
  isPeeking,
  reduceMotion,
}: {
  service: PlanService;
  active: boolean;
  isPeeking: boolean;
  reduceMotion: boolean | null;
}) {
  const props = { active, isPeeking, includes: service.includes, reduceMotion };

  switch (service.id) {
    case "website":
      return <WebsiteVisual {...props} />;
    case "lp":
      return <LpVisual {...props} />;
    case "design":
      return <DesignVisual {...props} />;
    case "app":
      return <AppVisual {...props} />;
  }
}

/* ── Service card ── */

function PlanServiceCard({
  service,
  isPeeking,
  isMuted,
  depth,
  onToggle,
  reduceMotion,
}: {
  service: PlanService;
  isPeeking: boolean;
  isMuted: boolean;
  depth: MotionValue<number>;
  onToggle: () => void;
  reduceMotion: boolean | null;
}) {
  const peekDescId = useId();
  const buttonId = useId();
  const [hovered, setHovered] = useState(false);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 20 });
  const sheen = useMotionTemplate`radial-gradient(380px circle at ${springX}% ${springY}%, rgba(255, 255, 255, 0.65), transparent 55%)`;
  const shadowX = useTransform(springX, [0, 100], [-10, 10]);
  const shadowY = useTransform(springY, [0, 100], [-8, 12]);
  const cardY = useTransform(depth, [0, 1], [16, -6]);
  const active = hovered || isPeeking;

  const handleMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * 100);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <motion.article
      className={`plan-card plan-card--${service.id}${isPeeking ? " plan-card--peek" : ""}${isMuted ? " plan-card--muted" : ""}`}
      style={reduceMotion ? undefined : { y: cardY }}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: isMuted ? 0.992 : active ? 1.015 : 1,
              y: isMuted ? 1 : hovered ? -3 : 0,
            }
      }
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        pointerX.set(50);
        pointerY.set(50);
      }}
    >
      {!reduceMotion ? (
        <motion.span className="plan-card__sheen" style={{ background: sheen }} aria-hidden="true" />
      ) : null}
      {!reduceMotion ? (
        <motion.span className="plan-card__shadow" aria-hidden="true" style={{ x: shadowX, y: shadowY }} />
      ) : null}

      <button
        type="button"
        id={buttonId}
        className="plan-card__face"
        onClick={onToggle}
        aria-expanded={isPeeking}
        aria-describedby={peekDescId}
        aria-label={`${service.title}を${isPeeking ? "閉じる" : "覗く"} — ${service.prices.map((p) => (p.label ? `${p.label} ${p.amount}` : p.amount)).join("、")}`}
      >
        <div className={`plan-card__visual${isPeeking ? " plan-card__visual--peek" : ""}`}>
          <ServiceVisual service={service} active={active} isPeeking={isPeeking} reduceMotion={reduceMotion} />
        </div>

        <div className="plan-card__info">
          <span className="plan-card__number">{service.number}</span>
          <h3 className="plan-card__title">{service.title}</h3>
          <p className="plan-card__teaser">{service.teaser}</p>
          <div className="plan-card__foot">
            <PlanPriceDisplay prices={service.prices} hovered={active} />
            <span className={`plan-card__toggle${isPeeking ? " plan-card__toggle--peek" : ""}`} aria-hidden="true">
              {isPeeking ? "·" : "+"}
            </span>
          </div>
        </div>
      </button>

      <div id={peekDescId} className="plan-card__peek-desc">
        {isPeeking ? (
          <>
            <p>{service.catchphrase}</p>
            <ul>
              {service.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </motion.article>
  );
}

/* ── Header atmosphere ── */

function PlanHeaderAtmosphere({
  inView,
  reduceMotion,
}: {
  inView: boolean;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(50);
  const springX = useSpring(cursorX, { stiffness: 60, damping: 18 });
  const springY = useSpring(cursorY, { stiffness: 60, damping: 18 });
  const parallaxX = useTransform(springX, [0, 100], [-12, 12]);
  const parallaxY = useTransform(springY, [0, 100], [-10, 10]);

  const handleMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    cursorX.set(((event.clientX - rect.left) / rect.width) * 100);
    cursorY.set(((event.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <div
      ref={ref}
      className="plan-header__air"
      aria-hidden="true"
      onMouseMove={handleMove}
      onMouseLeave={() => {
        cursorX.set(50);
        cursorY.set(50);
      }}
    >
      <motion.div className="plan-header__cloud-wrap" style={reduceMotion ? undefined : { x: parallaxX, y: parallaxY }}>
        <svg className="plan-header__cloud-svg" viewBox="0 0 280 168" fill="none" aria-hidden="true">
          <path
            d="M52 118 C34 118 24 100 34 84 C22 66 42 50 66 54 C76 36 104 32 124 44 C142 28 172 32 188 48 C206 38 232 50 236 70 C252 72 260 90 248 104 C256 118 238 128 214 124 L70 124 C56 130 40 124 52 118 Z"
            stroke="rgba(154, 149, 140, 0.38)"
            strokeWidth="1.4"
            strokeDasharray="4 5"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="rgba(255, 255, 255, 0.28)"
          />
        </svg>
        <p className="plan-header__cloud-text">
          どんなカタチにしよう？
          <br />
          一緒に考えよう！
        </p>
      </motion.div>

      {HEADER_BUBBLES.map((bubble) => (
        <motion.span
          key={bubble.text}
          className="plan-header__bubble"
          style={{ top: bubble.top, left: bubble.left }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={
            inView || reduceMotion
              ? { opacity: [0.35, 0.62, 0.35], y: [0, -6, 0], scale: 1 }
              : { opacity: 0, scale: 0.9 }
          }
          transition={{
            opacity: { ...BREATH, delay: bubble.delay },
            y: { ...BREATH, delay: bubble.delay },
            scale: { duration: 0.5, delay: bubble.delay },
          }}
        >
          {bubble.text}
        </motion.span>
      ))}

      <motion.span
        className="plan-header__spark plan-header__spark--1"
        animate={inView && !reduceMotion ? { opacity: [0.15, 0.45, 0.15], rotate: [0, 15, 0] } : { opacity: 0.15 }}
        transition={{ ...BREATH, duration: 5.2 }}
      >
        ✦
      </motion.span>
      <motion.span
        className="plan-header__spark plan-header__spark--2"
        animate={inView && !reduceMotion ? { opacity: [0.1, 0.35, 0.1], scale: [1, 1.15, 1] } : { opacity: 0.1 }}
        transition={{ ...BREATH, duration: 6, delay: 0.8 }}
      >
        ✧
      </motion.span>
    </div>
  );
}

function PlanPresence({ reduceMotion }: { reduceMotion: boolean | null }) {
  if (reduceMotion) return null;

  return (
    <div className="plan-presence" aria-hidden="true">
      <motion.span
        className="plan-presence__glow plan-presence__glow--a"
        animate={{ opacity: [0.08, 0.16, 0.08], x: [0, 14, 0], y: [0, -10, 0] }}
        transition={{ ...BREATH, duration: 7.2 }}
      />
      <motion.span
        className="plan-presence__glow plan-presence__glow--b"
        animate={{ opacity: [0.05, 0.1, 0.05], x: [0, -12, 0], y: [0, 8, 0] }}
        transition={{ ...BREATH, duration: 8.4, delay: 1.2 }}
      />
    </div>
  );
}

function PlanServices({
  reduceMotion,
  depth,
}: {
  reduceMotion: boolean | null;
  depth: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const [peekId, setPeekId] = useState<string | null>(null);
  const hasPeek = peekId !== null;

  return (
    <div ref={ref} className="plan-services">
      {PLAN_SERVICES.map((service, index) => {
        const isPeeking = peekId === service.id;
        const isMuted = hasPeek && !isPeeking;

        return (
          <motion.div
            key={service.id}
            className={`plan-services__item plan-services__item--${service.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={inView || reduceMotion ? { opacity: isMuted ? 0.9 : 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : index * 0.08, ease: EASE }}
          >
            <PlanServiceCard
              service={service}
              isPeeking={isPeeking}
              isMuted={isMuted}
              depth={depth}
              onToggle={() => setPeekId((current) => (current === service.id ? null : service.id))}
              reduceMotion={reduceMotion}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Growth — sprouting plants ── */

const PLANT_COLORS = {
  potLight: "#ddb892",
  potMid: "#c9926a",
  potDark: "#a8744f",
  potRim: "#8f6040",
  soil: "#7a6348",
  stem: "#4f7344",
  leafLight: "#b8d4a8",
  leafMid: "#94bc82",
  leafDeep: "#6f9a62",
  leafStroke: "#527548",
  bud: "#e8c4a8",
  budCore: "#d4a574",
} as const;

function PlantStem({
  d,
  width,
  delay,
  grown,
  reduceMotion,
}: {
  d: string;
  width: number;
  delay: number;
  grown: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.path
      d={d}
      stroke={PLANT_COLORS.stem}
      strokeWidth={width}
      strokeLinecap="round"
      fill="none"
      initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
      animate={grown ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    />
  );
}

function PlantLeaf({
  cx,
  cy,
  rx,
  ry,
  rotate,
  tone,
  delay,
  grown,
  reduceMotion,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  tone: "light" | "mid" | "deep";
  delay: number;
  grown: boolean;
  reduceMotion: boolean | null;
}) {
  const fill =
    tone === "light" ? PLANT_COLORS.leafLight : tone === "mid" ? PLANT_COLORS.leafMid : PLANT_COLORS.leafDeep;

  return (
    <motion.g
      initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
      animate={grown ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "fill-box" as const }}
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={PLANT_COLORS.leafStroke}
        strokeWidth="0.8"
        transform={`rotate(${rotate} ${cx} ${cy})`}
      />
    </motion.g>
  );
}

function GrowthPlantSvg({
  variant,
  tierIndex,
  grown,
  active,
  reduceMotion,
}: {
  variant: 0 | 1 | 2;
  tierIndex: number;
  grown: boolean;
  active: boolean;
  reduceMotion: boolean | null;
}) {
  const filterId = useId().replace(/:/g, "");
  const baseDelay = tierIndex * 0.18;

  return (
    <motion.svg
      className="plan-grow-tier__plant-svg"
      viewBox="0 0 120 160"
      fill="none"
      aria-hidden="true"
      animate={active && !reduceMotion && grown ? { rotate: [0, 1.2, 0, -1.2, 0] } : { rotate: 0 }}
      transition={{ duration: 4.8, repeat: active && grown ? Infinity : 0, ease: "easeInOut" }}
      style={{ transformOrigin: "50% 88%" }}
    >
      <defs>
        <filter id={`plant-shadow-${filterId}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(26, 25, 23, 0.1)" />
        </filter>
        <linearGradient id={`pot-grad-${filterId}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor={PLANT_COLORS.potLight} />
          <stop offset="55%" stopColor={PLANT_COLORS.potMid} />
          <stop offset="100%" stopColor={PLANT_COLORS.potDark} />
        </linearGradient>
        <linearGradient id={`soil-grad-${filterId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6b5640" />
          <stop offset="100%" stopColor={PLANT_COLORS.soil} />
        </linearGradient>
      </defs>

      <motion.ellipse
        cx="60"
        cy="152"
        rx="34"
        ry="4"
        fill="rgba(198, 193, 182, 0.2)"
        initial={reduceMotion ? false : { opacity: 0, scaleX: 0.4 }}
        animate={grown ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.4 }}
        transition={{ duration: 0.45, delay: baseDelay, ease: EASE }}
        style={{ transformOrigin: "60px 152px" }}
      />

      {variant === 0 ? (
        <>
          <motion.path
            filter={`url(#plant-shadow-${filterId})`}
            d="M42 148 L44 128 Q46 124 60 124 Q74 124 76 128 L78 148 Z"
            fill={`url(#pot-grad-${filterId})`}
            stroke={PLANT_COLORS.potRim}
            strokeWidth="1"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={grown ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.55, delay: baseDelay, ease: EASE }}
          />
          <motion.rect
            x="44"
            y="124"
            width="32"
            height="5"
            rx="1"
            fill={`url(#soil-grad-${filterId})`}
            initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
            animate={grown ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.35, delay: baseDelay + 0.12, ease: EASE }}
            style={{ transformOrigin: "60px 129px" }}
          />
          <PlantStem d="M60 124 L60 98" width={1.8} delay={baseDelay + 0.28} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={52} cy={104} rx={9} ry={5} rotate={-28} tone="mid" delay={baseDelay + 0.72} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={68} cy={100} rx={9} ry={5} rotate={24} tone="light" delay={baseDelay + 0.86} grown={grown} reduceMotion={reduceMotion} />
        </>
      ) : null}

      {variant === 1 ? (
        <>
          <motion.path
            filter={`url(#plant-shadow-${filterId})`}
            d="M38 148 L41 122 Q44 116 60 116 Q76 116 79 122 L82 148 Z"
            fill={`url(#pot-grad-${filterId})`}
            stroke={PLANT_COLORS.potRim}
            strokeWidth="1"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={grown ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.55, delay: baseDelay, ease: EASE }}
          />
          <motion.rect
            x="41"
            y="116"
            width="38"
            height="6"
            rx="1"
            fill={`url(#soil-grad-${filterId})`}
            initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
            animate={grown ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.35, delay: baseDelay + 0.12, ease: EASE }}
            style={{ transformOrigin: "60px 122px" }}
          />
          <PlantStem d="M60 116 L60 72" width={2} delay={baseDelay + 0.28} grown={grown} reduceMotion={reduceMotion} />
          <PlantStem d="M60 92 L48 82" width={1.2} delay={baseDelay + 0.62} grown={grown} reduceMotion={reduceMotion} />
          <PlantStem d="M60 84 L72 74" width={1.2} delay={baseDelay + 0.68} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={44} cy={80} rx={10} ry={6} rotate={-32} tone="mid" delay={baseDelay + 0.88} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={76} cy={72} rx={10} ry={6} rotate={28} tone="light" delay={baseDelay + 0.98} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={52} cy={64} rx={8} ry={5} rotate={-18} tone="deep" delay={baseDelay + 1.08} grown={grown} reduceMotion={reduceMotion} />
        </>
      ) : null}

      {variant === 2 ? (
        <>
          <motion.path
            filter={`url(#plant-shadow-${filterId})`}
            d="M34 148 L38 118 Q42 112 60 112 Q78 112 82 118 L86 148 Z"
            fill={`url(#pot-grad-${filterId})`}
            stroke={PLANT_COLORS.potRim}
            strokeWidth="1"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={grown ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.55, delay: baseDelay, ease: EASE }}
          />
          <motion.rect
            x="38"
            y="112"
            width="44"
            height="6"
            rx="1"
            fill={`url(#soil-grad-${filterId})`}
            initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
            animate={grown ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.35, delay: baseDelay + 0.12, ease: EASE }}
            style={{ transformOrigin: "60px 118px" }}
          />
          <PlantStem d="M60 112 L60 48" width={2.2} delay={baseDelay + 0.28} grown={grown} reduceMotion={reduceMotion} />
          <PlantStem d="M60 88 L44 74" width={1.2} delay={baseDelay + 0.58} grown={grown} reduceMotion={reduceMotion} />
          <PlantStem d="M60 78 L76 64" width={1.2} delay={baseDelay + 0.64} grown={grown} reduceMotion={reduceMotion} />
          <PlantStem d="M60 66 L50 54" width={1} delay={baseDelay + 0.78} grown={grown} reduceMotion={reduceMotion} />
          <PlantStem d="M60 58 L72 46" width={1} delay={baseDelay + 0.84} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={40} cy={72} rx={11} ry={6} rotate={-34} tone="mid" delay={baseDelay + 0.92} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={80} cy={62} rx={11} ry={6} rotate={30} tone="light" delay={baseDelay + 1.02} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={46} cy={52} rx={9} ry={5} rotate={-20} tone="deep" delay={baseDelay + 1.1} grown={grown} reduceMotion={reduceMotion} />
          <PlantLeaf cx={74} cy={44} rx={9} ry={5} rotate={22} tone="mid" delay={baseDelay + 1.18} grown={grown} reduceMotion={reduceMotion} />
          <motion.g
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={grown ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.55, delay: baseDelay + 1.28, ease: EASE }}
            style={{ transformOrigin: "60px 38px", transformBox: "fill-box" as const }}
          >
            <circle cx="60" cy="38" r="5" fill={PLANT_COLORS.bud} stroke={PLANT_COLORS.budCore} strokeWidth="0.8" />
            <circle cx="60" cy="38" r="2" fill={PLANT_COLORS.budCore} />
          </motion.g>
        </>
      ) : null}
    </motion.svg>
  );
}

function GrowthTier({
  tier,
  index,
  isOpen,
  onToggle,
  grown,
  reduceMotion,
}: {
  tier: PlanSubscriptionTier;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  grown: boolean;
  reduceMotion: boolean | null;
}) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || isOpen;

  return (
    <motion.div
      className={`plan-grow-tier-wrap plan-grow-tier-wrap--${index + 1}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
    >
      <motion.button
        type="button"
        className={`plan-grow-tier${isOpen ? " plan-grow-tier--open" : ""}${active ? " plan-grow-tier--active" : ""}`}
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-expanded={isOpen}
        aria-label={`${tier.title}${isOpen ? "の詳細を閉じる" : "の詳細を見る"}`}
        animate={
          reduceMotion
            ? undefined
            : {
                y: isOpen ? -2 : hovered ? -3 : 0,
              }
        }
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <span className="plan-grow-tier__head">
          <span className="plan-grow-tier__title">{tier.title}</span>
          <span className="plan-grow-tier__subtitle">{tier.subtitle}</span>
          <span className="plan-grow-tier__price">
            <FloatingPrice amount={tier.price} active={active} />
          </span>
          <span className={`plan-grow-tier__cue${isOpen ? " plan-grow-tier__cue--open" : ""}`}>
            <span className="plan-grow-tier__cue-text">{isOpen ? "閉じる" : "くわしく見る"}</span>
            <svg className="plan-grow-tier__cue-icon" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 4.5 L6 8.5 L10 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </span>
        </span>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              className="plan-grow-tier__body"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {tier.includesNote ? <p className="plan-grow-tier__note">{tier.includesNote}</p> : null}
              <ul className="plan-grow-tier__list">
                {tier.adds.map((item, itemIndex) => (
                  <motion.li
                    key={item}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.06 + itemIndex * 0.05, ease: EASE }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <span className="plan-grow-tier__plant" aria-hidden="true">
          <GrowthPlantSvg
            variant={index as 0 | 1 | 2}
            tierIndex={index}
            grown={grown}
            active={active}
            reduceMotion={reduceMotion}
          />
        </span>
      </motion.button>
    </motion.div>
  );
}

function PlanGrowth({ reduceMotion }: { reduceMotion: boolean | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section ref={ref} className="plan-growth" aria-labelledby="plan-growth-title">
      <div className="plan-growth__layout">
        <motion.div
          className="plan-growth__intro"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="plan-growth__label">{PLAN_SUBSCRIPTION.label}</p>
          <h3 className="plan-growth__title" id="plan-growth-title">
            {splitChars(PLAN_SUBSCRIPTION.title).map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                className="plan-growth__title-char"
                animate={inView && !reduceMotion ? { y: [0, -2, 0] } : { y: 0 }}
                transition={{ ...BREATH, delay: index * 0.08 }}
              >
                {char}
              </motion.span>
            ))}
          </h3>
          <div className="plan-growth__body">
            {PLAN_SUBSCRIPTION.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </motion.div>

        <p className="plan-growth__tap-guide">タップして内容を確認</p>
        <div className="plan-growth__tiers">
          {PLAN_SUBSCRIPTION.tiers.map((tier, index) => (
            <GrowthTier
              key={tier.id}
              tier={tier}
              index={index}
              isOpen={openId === tier.id}
              onToggle={() => setOpenId((current) => (current === tier.id ? null : tier.id))}
              grown={inView || !!reduceMotion}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>

      <motion.p
        className="plan-growth__footnote"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={inView || reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
      >
        {PLAN_SUBSCRIPTION.footnote}
      </motion.p>
    </section>
  );
}

function PlanClosing({ reduceMotion }: { reduceMotion: boolean | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <motion.div
      ref={ref}
      className="plan-closing"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {PLAN_CLOSING.map((line, index) => (
        <p
          key={line}
          className={`plan-closing__line${index === PLAN_CLOSING.length - 1 ? " plan-closing__line--lead" : ""}`}
        >
          {line}
        </p>
      ))}
      <PaperPlaneLaunch />
    </motion.div>
  );
}

export default function PlanSection() {
  const ref = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-10%" });
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const depth = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.35]);

  return (
    <section ref={ref} className="plan-section" aria-labelledby="plan-opening-title">
      <div className="plan-section__fade" aria-hidden="true" />
      <PlanPresence reduceMotion={reduceMotion} />

      <div className="plan-section__inner">
        <div ref={headerRef} className="plan-header">
          <div className="plan-header__copy">
            <p className="plan-section__bridge" lang="ja">
              {PLAN_BRIDGE}
            </p>

            <div className="plan-opening" id="plan-heading" aria-labelledby="plan-opening-title">
              <p className="plan-opening__en" lang="en">
                PLAN
              </p>
              <h2 className="plan-opening__title" id="plan-opening-title">
                {OPENING_CHARS.map((char, i) => (
                  <motion.span
                    key={char}
                    className="plan-opening__char"
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={
                      headerInView || reduceMotion
                        ? { opacity: 1, y: reduceMotion ? 0 : [0, -1.5, 0] }
                        : { opacity: 0, y: 14 }
                    }
                    transition={{
                      opacity: { duration: 0.42, delay: reduceMotion ? 0 : i * 0.08, ease: EASE },
                      y: reduceMotion ? { duration: 0 } : { ...BREATH, delay: 0.6 + i * 0.15 },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h2>
            </div>

            <motion.div
              className="plan-intro"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={headerInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.2, ease: EASE }}
            >
              <p className="plan-intro__tagline">
                {PLAN_TAGLINE.split("\n").map((line, index) => (
                  <span key={line}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
              <div className="plan-intro__body">
                {PLAN_BODY.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </motion.div>
          </div>

          <PlanHeaderAtmosphere inView={headerInView} reduceMotion={reduceMotion} />
        </div>

        <PlanServices reduceMotion={reduceMotion} depth={depth} />
        <PlanGrowth reduceMotion={reduceMotion} />
        <PlanClosing reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}
