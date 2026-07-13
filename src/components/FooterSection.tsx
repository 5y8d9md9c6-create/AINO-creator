import { AnimatePresence, motion, useReducedMotion } from "../lib/motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useContactPlane } from "../context/ContactPlaneContext";
import {
  FOOTER_AINO_HINTS,
  FOOTER_BRAND_LINE_1,
  FOOTER_BRAND_LINE_2,
  FOOTER_COPYRIGHT,
  FOOTER_IDENTITY_HINTS,
  FOOTER_LINKS,
  FOOTER_MAIN,
  FOOTER_PLAY_AGAIN_STAGES,
  FOOTER_PLAYGROUND_CUE,
  FOOTER_SEQUENCE_REWARD,
  FOOTER_SPARK_PHRASES,
  FOOTER_SUB,
  FOOTER_WHISPER,
} from "../data/footer";
import FooterBrandSymbol from "./FooterBrandSymbol";
import { PaperPlaneGraphic } from "./PaperPlaneContact";
import { getFlightMs } from "../lib/motionTiming";
import "./FooterSection.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const AINO_ORDER = ["A", "I", "N", "O"] as const;
type LetterId = (typeof AINO_ORDER)[number];

function FooterPlaygroundCue({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <p className="footer-playground-cue" aria-hidden="true">
      <span className="footer-playground-cue__mark">✦</span>
      {FOOTER_PLAYGROUND_CUE}
    </p>
  );
}

function FooterIdentityCopy({
  discovered,
  onDiscover,
}: {
  discovered: boolean;
  onDiscover: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<"line1" | "line2" | null>(null);
  const tapTimer = useRef<number | null>(null);

  const clearTap = () => {
    if (tapTimer.current) window.clearTimeout(tapTimer.current);
    tapTimer.current = null;
  };

  const showLine = (line: "line1" | "line2") => {
    if (reduceMotion) return;
    clearTap();
    setHovered(line);
  };

  const hideLine = () => {
    clearTap();
    setHovered(null);
  };

  const tapLine = (line: "line1" | "line2") => {
    if (reduceMotion) return;
    if (window.matchMedia("(hover: hover)").matches) return;
    onDiscover();
    showLine(line);
    tapTimer.current = window.setTimeout(() => setHovered(null), 1500);
  };

  const line1Chars = ["こ", "の", "人", "が", "作", "り", "ま", "し", "た", "。"];
  const line2Lead = ["頭", "の", "中", "は", "、"];
  const line2Tail = ["ま", "だ", "制", "作", "中", "。"];

  return (
    <div className={`footer-identity${discovered ? " footer-identity--discovered" : ""}`}>
      <button
        type="button"
        className="footer-identity__line-btn"
        aria-label={FOOTER_BRAND_LINE_1}
        onMouseEnter={() => showLine("line1")}
        onMouseLeave={hideLine}
        onFocus={() => showLine("line1")}
        onBlur={hideLine}
        onClick={() => tapLine("line1")}
      >
        <span className="footer-identity__line" aria-hidden="true">
          {line1Chars.map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              className={`footer-identity__glyph${index < 3 ? " footer-identity__glyph--who" : ""}`}
              animate={
                reduceMotion || hovered !== "line1"
                  ? { y: 0, rotate: 0, scale: 1 }
                  : index < 3
                    ? { y: [0, -2, 0], rotate: [0, -4, 2, 0] }
                    : { y: [0, -1, 0], scale: [1, 1.04, 1] }
              }
              transition={{
                duration: 0.45,
                delay: index * 0.03,
                ease: EASE,
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      </button>

      <button
        type="button"
        className="footer-identity__line-btn footer-identity__line-btn--sub"
        aria-label={FOOTER_BRAND_LINE_2}
        onMouseEnter={() => showLine("line2")}
        onMouseLeave={hideLine}
        onFocus={() => showLine("line2")}
        onBlur={hideLine}
        onClick={() => tapLine("line2")}
      >
        <span className="footer-identity__line footer-identity__line--sub" aria-hidden="true">
          {line2Lead.map((char, index) => (
            <motion.span
              key={`lead-${char}-${index}`}
              className="footer-identity__glyph footer-identity__glyph--mind"
              animate={
                reduceMotion || hovered !== "line2"
                  ? { y: 0, opacity: 1 }
                  : { y: [0, -2, 0, -1, 0], opacity: [1, 0.82, 1] }
              }
              transition={{ duration: 1.4, delay: index * 0.05, repeat: Infinity, ease: "easeInOut" }}
            >
              {char}
            </motion.span>
          ))}
          {line2Tail.map((char, index) => (
            <motion.span
              key={`tail-${char}-${index}`}
              className={`footer-identity__glyph${index >= 2 ? " footer-identity__glyph--build" : ""}`}
              animate={
                reduceMotion || hovered !== "line2"
                  ? { y: 0, rotate: 0 }
                  : index >= 2
                    ? { rotate: [0, -2, 2, -1, 0], y: [0, -1, 0] }
                    : { y: [0, -1, 0] }
              }
              transition={{
                duration: index >= 2 ? 0.55 : 0.4,
                delay: (line2Lead.length + index) * 0.04,
                repeat: index >= 2 ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          ))}
          {hovered === "line2" && !reduceMotion ? (
            <motion.span
              className="footer-identity__dots"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            >
              ···
            </motion.span>
          ) : null}
        </span>
      </button>

      <AnimatePresence mode="wait">
        {hovered && !reduceMotion ? (
          <motion.p
            key={hovered}
            className="footer-identity__hint"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {FOOTER_IDENTITY_HINTS[hovered]}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FooterAinoLogo({
  onOActivate,
  onSequenceComplete,
  onDiscover,
  discovered,
}: {
  onOActivate: () => void;
  onSequenceComplete: () => void;
  onDiscover: () => void;
  discovered: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<LetterId | null>(null);
  const [hint, setHint] = useState<LetterId | null>(null);
  const [dragO, setDragO] = useState(0);
  const dragStart = useRef(0);
  const sequenceIndex = useRef(0);
  const sequenceTimer = useRef<number | null>(null);

  const press = (id: LetterId) => {
    if (reduceMotion) return;
    onDiscover();
    setActive(id);
    setHint(id);

    if (sequenceTimer.current) window.clearTimeout(sequenceTimer.current);
    if (id === AINO_ORDER[sequenceIndex.current]) {
      sequenceIndex.current += 1;
      if (sequenceIndex.current >= AINO_ORDER.length) {
        sequenceIndex.current = 0;
        onSequenceComplete();
      }
    } else {
      sequenceIndex.current = id === "A" ? 1 : 0;
    }
    sequenceTimer.current = window.setTimeout(() => {
      sequenceIndex.current = 0;
    }, 4200);
  };

  const release = () => setActive(null);

  const handleOPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragStart.current = event.clientX;
    press("O");
  };

  const handleOPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (active !== "O" || reduceMotion) return;
    setDragO((event.clientX - dragStart.current) * 0.08);
  };

  return (
    <div className="footer-aino-wrap">
      <div className="footer-aino" aria-label="AINO">
        {AINO_ORDER.map((letter) => (
          <motion.button
            key={letter}
            type="button"
            className={`footer-aino__letter footer-aino__letter--${letter.toLowerCase()}`}
            aria-label={`${letter} — ${FOOTER_AINO_HINTS[letter]}`}
            onPointerDown={letter === "O" ? handleOPointerDown : () => press(letter)}
            onPointerUp={release}
            onPointerLeave={() => {
              release();
              window.setTimeout(() => setHint(null), 900);
            }}
            onPointerMove={letter === "O" ? handleOPointerMove : undefined}
            onClick={letter === "O" ? onOActivate : undefined}
            onMouseEnter={() => !reduceMotion && setHint(letter)}
            onMouseLeave={() => setHint(null)}
            animate={
              reduceMotion
                ? {}
                : letter === "A" && active === "A"
                  ? { scaleY: 0.86, scaleX: 1.08, y: 3 }
                  : letter === "I" && active === "I"
                    ? { y: 5, scaleY: 0.9 }
                    : letter === "N" && active === "N"
                      ? { rotate: [0, -5, 5, -2, 0], y: [0, -1, 0] }
                      : letter === "O"
                        ? {
                            rotate: active === "O" ? dragO : hint === "O" ? 6 : 0,
                            y: active === "O" ? -2 : hint === "O" ? -1 : 0,
                            scale: active === "O" ? 1.05 : 1,
                          }
                        : { scale: 1, y: 0, rotate: 0 }
            }
            whileHover={
              reduceMotion
                ? undefined
                : letter === "N"
                  ? { rotate: [-2, 2, -1, 1, 0], transition: { duration: 1.6, repeat: Infinity } }
                  : letter === "O"
                    ? { rotate: 10, y: -2 }
                    : letter === "A"
                      ? { y: -1, scaleY: 0.96 }
                      : { y: -1 }
            }
            transition={{ duration: 0.32, ease: EASE }}
          >
            <svg viewBox="0 0 40 48" className="footer-aino__svg" aria-hidden="true">
              <text x="20" y="34" textAnchor="middle" className="footer-aino__glyph">
                {letter}
              </text>
            </svg>
          </motion.button>
        ))}
        <span className="footer-aino__creator">creator</span>
      </div>
      <p className={`footer-aino__touch-cue${discovered ? " footer-aino__touch-cue--hidden" : ""}`} aria-hidden="true">
        タップ
      </p>

      <AnimatePresence mode="wait">
        {hint && !reduceMotion ? (
          <motion.p
            key={hint}
            className="footer-aino__hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {FOOTER_AINO_HINTS[hint]}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FooterLinkItem({
  label,
  href,
  external,
  index,
  hoveredIndex,
  onHover,
}: {
  label: string;
  href: string;
  external?: boolean;
  index: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isNear = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;
  const isSelf = hoveredIndex === index;

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const flee = isSelf ? 5 : 0;
    setOffset({ x: (dx / dist) * flee, y: (dy / dist) * flee * 0.6 });
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      className="footer-link"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => {
        onHover(null);
        setOffset({ x: 0, y: 0 });
      }}
      onMouseMove={handleMove}
      animate={
        reduceMotion
          ? {}
          : {
              x: offset.x + (isNear ? (index < (hoveredIndex ?? 0) ? -2 : 2) : 0),
              y: offset.y + (isSelf ? -2 : isNear ? -1 : 0),
            }
      }
      transition={{ duration: 0.28, ease: EASE }}
    >
      <span className="footer-link__text">{label}</span>
      <span className="footer-link__line" aria-hidden="true" />
    </motion.a>
  );
}

function FooterPlayAgain({ onDiscover }: { onDiscover: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const { phase, launchReturnHero } = useContactPlane();
  const [hovered, setHovered] = useState(false);
  const [stage, setStage] = useState(0);
  const [launching, setLaunching] = useState(false);
  const mobileStageRef = useRef(0);
  const busy = phase === "flying" || launching;

  const hoverActive = hovered && !reduceMotion && !busy;
  const isReady = stage >= FOOTER_PLAY_AGAIN_STAGES.length - 1;

  useEffect(() => {
    if (!hoverActive) {
      setStage(0);
      return;
    }
    setStage(0);
    const step1 = window.setTimeout(() => setStage(1), 1100);
    const step2 = window.setTimeout(() => setStage(2), 2300);
    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
    };
  }, [hoverActive]);

  const fireReturn = useCallback(() => {
    if (busy) return;
    setLaunching(true);

    if (reduceMotion) {
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.dispatchEvent(new CustomEvent("aino:footer-return-hero"));
      setLaunching(false);
      return;
    }

    if (!buttonRef.current) {
      setLaunching(false);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    launchReturnHero({
      x: rect.left + rect.width * 0.5,
      y: rect.top + rect.height * 0.45,
    });
    window.setTimeout(() => setLaunching(false), getFlightMs() + 120);
  }, [busy, launchReturnHero, reduceMotion]);

  const handleClick = useCallback(() => {
    if (busy) return;
    onDiscover();

    const touchPrimary = window.matchMedia("(hover: none)").matches;

    if (reduceMotion || touchPrimary || window.matchMedia("(hover: hover)").matches) {
      fireReturn();
      return;
    }

    mobileStageRef.current += 1;
    setStage(Math.min(mobileStageRef.current, FOOTER_PLAY_AGAIN_STAGES.length - 1));

    if (mobileStageRef.current >= FOOTER_PLAY_AGAIN_STAGES.length) {
      mobileStageRef.current = 0;
      fireReturn();
    }
  }, [busy, fireReturn, onDiscover, reduceMotion]);

  const label = FOOTER_PLAY_AGAIN_STAGES[stage];

  return (
    <div className="footer-play-arena">
      <button
        ref={buttonRef}
        type="button"
        className={`footer-play${hoverActive ? " footer-play--hover" : ""}${isReady ? " footer-play--ready" : ""}`}
        disabled={busy}
        aria-label={label}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          mobileStageRef.current = 0;
        }}
        onFocus={() => setHovered(true)}
        onBlur={() => {
          setHovered(false);
          mobileStageRef.current = 0;
        }}
      >
        <motion.span
          className="footer-play__arrow"
          aria-hidden="true"
          animate={
            hoverActive
              ? isReady
                ? { x: [0, 8, -6, 7, 0], y: [0, -4, -7, -3, 0] }
                : { x: [0, 6, -4, 5, 0], y: [0, -3, -5, -2, 0] }
              : { x: 0, y: 0 }
          }
          transition={{ duration: isReady ? 1.2 : 1.8, repeat: hoverActive ? Infinity : 0, ease: "easeInOut" }}
        >
          ↑
        </motion.span>

        <span className="footer-play__label-wrap" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.span
              key={label}
              className="footer-play__label"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
              transition={{ duration: 0.42, ease: EASE }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>

        <motion.span
          className="footer-play__plane"
          aria-hidden="true"
          animate={
            hoverActive
              ? isReady
                ? { rotate: [-35, -55, -40, -50, -35], y: [0, -4, -8, -3, 0] }
                : { rotate: [-35, -48, -38, -44, -35], y: [0, -2, -4, -1, 0] }
              : { rotate: -35, y: 0 }
          }
          transition={{ duration: isReady ? 1.1 : 1.6, repeat: hoverActive ? Infinity : 0, ease: "easeInOut" }}
        >
          <PaperPlaneGraphic active={hoverActive} reduceMotion={reduceMotion} className="footer-play__plane-svg" />
        </motion.span>
      </button>
    </div>
  );
}

export default function FooterSection() {
  const reduceMotion = useReducedMotion();
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const [sparked, setSparked] = useState(false);
  const [sparkPhraseIndex, setSparkPhraseIndex] = useState(0);
  const [playgroundTouched, setPlaygroundTouched] = useState(false);
  const oTapCount = useRef(0);
  const oTapTimer = useRef<number | null>(null);
  const rewardTimer = useRef<number | null>(null);

  const showReward = useCallback((message: string, duration = 4200) => {
    setReward(message);
    if (rewardTimer.current) window.clearTimeout(rewardTimer.current);
    rewardTimer.current = window.setTimeout(() => setReward(null), duration);
  }, []);

  const handleOActivate = useCallback(() => {
    oTapCount.current += 1;
    if (oTapTimer.current) window.clearTimeout(oTapTimer.current);
    oTapTimer.current = window.setTimeout(() => {
      oTapCount.current = 0;
    }, 2400);

    if (oTapCount.current >= 5) {
      oTapCount.current = 0;
      showReward(FOOTER_WHISPER);
    }
  }, [showReward]);

  const handleSequenceComplete = useCallback(() => {
    showReward(FOOTER_SEQUENCE_REWARD, 4800);
  }, [showReward]);

  const markPlaygroundTouched = useCallback(() => {
    setPlaygroundTouched(true);
  }, []);

  const handleBrandTap = useCallback(() => {
    if (!sparked) {
      setSparked(true);
      setSparkPhraseIndex(0);
      return;
    }
    setSparkPhraseIndex((index) => (index + 1) % FOOTER_SPARK_PHRASES.length);
  }, [sparked]);

  return (
    <footer className="site-footer" aria-labelledby="footer-main-copy">
      <div className="site-footer__bridge" aria-hidden="true" />

      <div className="site-footer__inner">
        <motion.div
          className="site-footer__closing"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8%" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="site-footer__main" id="footer-main-copy">
            {FOOTER_MAIN}
          </p>
          <div className="site-footer__sub-wrap">
            <p className="site-footer__sub">{FOOTER_SUB}</p>
            <div className="site-footer__spark-slot" aria-live="polite">
              <AnimatePresence mode="wait">
                {sparked ? (
                  <motion.p
                    key={sparkPhraseIndex}
                    className="site-footer__spark"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.38, ease: EASE }}
                  >
                    {FOOTER_SPARK_PHRASES[sparkPhraseIndex]}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="footer-brand-block"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-6%" }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.05 }}
        >
          <FooterBrandSymbol sparked={sparked} onTap={handleBrandTap} />
        </motion.div>

        <FooterPlaygroundCue visible={!playgroundTouched} />

        <FooterIdentityCopy
          discovered={playgroundTouched}
          onDiscover={markPlaygroundTouched}
        />

        <FooterAinoLogo
          onOActivate={handleOActivate}
          onSequenceComplete={handleSequenceComplete}
          onDiscover={markPlaygroundTouched}
          discovered={playgroundTouched}
        />

        <nav className="footer-nav" aria-label="フッターナビゲーション">
          <ul className="footer-nav__list">
            {FOOTER_LINKS.map((link, index) => (
              <li key={link.id}>
                <FooterLinkItem
                  label={link.label}
                  href={link.href}
                  external={"external" in link ? link.external : false}
                  index={index}
                  hoveredIndex={hoveredLink}
                  onHover={setHoveredLink}
                />
              </li>
            ))}
          </ul>
        </nav>

        <FooterPlayAgain onDiscover={markPlaygroundTouched} />

        <p className="site-footer__copy">{FOOTER_COPYRIGHT}</p>

        <AnimatePresence>
          {reward ? (
            <motion.p
              className="site-footer__whisper"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.55, ease: EASE }}
              aria-live="polite"
            >
              {reward}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </footer>
  );
}
