import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "../lib/motion";
import { useEffect, useRef, useState } from "react";
import { mixAtmosphere, PROCESS_BRIDGE, PROCESS_INTRO_ASIDE, PROCESS_STEPS } from "../data/process";
import "./ProcessSection.css";

const OPENING_CHARS = ["思", "考", "室"] as const;
const STEP_COUNT = PROCESS_STEPS.length;
const REVEAL_PORTION = 0.84;
const PIN_SCROLL_VH = 58 * STEP_COUNT + 14 * (STEP_COUNT - 1) + 76;
const EASE = [0.22, 1, 0.36, 1] as const;
const BREATH = { duration: 4.8, repeat: Infinity, ease: "easeInOut" as const };

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type CardLayout = {
  x: number;
  scale: number;
  opacity: number;
  isFocus: boolean;
};

function computeCardLayout(
  cardIndex: number,
  progress: number,
  cardWidth: number,
  viewportWidth: number,
): CardLayout {
  const isMobile = viewportWidth < 640;
  const align =
    progress <= REVEAL_PORTION
      ? 0
      : smoothstep((progress - REVEAL_PORTION) / (1 - REVEAL_PORTION));

  const flow = Math.min(
    STEP_COUNT,
    (Math.min(progress, REVEAL_PORTION) / REVEAL_PORTION) * STEP_COUNT,
  );

  const spacing = cardWidth + 20;
  const entryX = viewportWidth * 0.44 + cardWidth * 0.4;
  const cardTravel = flow - cardIndex;
  const queueX = (cardIndex - flow + 1) * spacing;

  let x = entryX;
  let opacity = 0;

  if (cardTravel > 0) {
    const landed = smoothstep(Math.min(1, cardTravel));
    x = lerp(entryX, queueX, landed);
    opacity = smoothstep(Math.min(1, cardTravel * 1.4));
  }

  const scale = 1;

  if (align > 0) {
    const ease = smoothstep(align);

    if (isMobile) {
      const focusIndex = align * (STEP_COUNT - 1);
      const panX = (cardIndex - focusIndex) * spacing;
      x = lerp(x, panX, ease);
      opacity = Math.max(opacity, 1);
    } else {
      const fitScale = Math.max(
        0.84,
        Math.min(1, (viewportWidth - 56) / (STEP_COUNT * cardWidth * 1.08)),
      );
      const alignGap = cardWidth * fitScale * 1.04;
      const alignX = (cardIndex - (STEP_COUNT - 1) / 2) * alignGap;
      x = lerp(x, alignX, ease);
      opacity = Math.max(opacity, ease);

      return {
        x,
        scale: lerp(1, fitScale, ease),
        opacity,
        isFocus: opacity > 0.85 && Math.abs(x) < spacing * 0.42 && align < 0.25,
      };
    }
  }

  const isFocus = opacity > 0.85 && Math.abs(x) < spacing * 0.42 && align < 0.25;

  return { x, scale, opacity, isFocus };
}

const PLAY_SPARKS = [
  { left: "8%", top: "16%", size: 7, delay: 0 },
  { left: "88%", top: "22%", size: 5, delay: 0.4 },
  { left: "14%", top: "74%", size: 6, delay: 0.8 },
  { left: "82%", top: "68%", size: 8, delay: 1.1 },
] as const;

function ProcessPresence({ reduceMotion }: { reduceMotion: boolean | null }) {
  if (reduceMotion) return null;

  return (
    <motion.div className="process-presence" aria-hidden="true">
      <motion.span
        className="process-presence__glow"
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.04, 1] }}
        transition={BREATH}
      />
    </motion.div>
  );
}

function ProcessOpening() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="process-opening" id="process-heading" aria-labelledby="process-opening-title">
      <h2 className="process-opening__title" id="process-opening-title">
        {OPENING_CHARS.map((char, i) => (
          <motion.span
            key={char}
            className="process-opening__char"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={
              inView || reduceMotion
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
  );
}

function ProcessIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className="process-intro"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <p className="process-intro__role">仕事の進め方</p>
      <motion.p
        className="process-intro__tagline"
        animate={reduceMotion ? undefined : { opacity: [0.92, 1, 0.92] }}
        transition={BREATH}
      >
        答えじゃなく、
        <br className="process-intro__tagline-br" aria-hidden="true" />
        可能性を探している。
      </motion.p>
      <p className="process-intro__lead">答えは、一緒に見つけていく。</p>
      <motion.p
        className="process-intro__aside"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={inView || reduceMotion ? { opacity: [0.45, 0.72, 0.45] } : { opacity: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { opacity: { ...BREATH, delay: 0.8 } }
        }
      >
        {PROCESS_INTRO_ASIDE}
      </motion.p>
    </motion.div>
  );
}

function StepGimmick({
  stepId,
  active,
  reduceMotion,
}: {
  stepId: string;
  active: boolean;
  reduceMotion: boolean | null;
}) {
  if (!active || reduceMotion) return null;

  if (stepId === "play") {
    return (
      <div className="process-gimmick process-gimmick--play" aria-hidden="true">
        {PLAY_SPARKS.map((spark, i) => (
          <motion.span
            key={i}
            className="process-gimmick__spark"
            style={{ left: spark.left, top: spark.top, width: spark.size, height: spark.size }}
            animate={{
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              y: [0, -14, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 2.6 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: spark.delay }}
          />
        ))}
      </div>
    );
  }

  if (stepId === "listen") {
    return (
      <motion.span
        className="process-gimmick process-gimmick--listen"
        aria-hidden="true"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.38, 0.15] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  if (stepId === "shape") {
    return (
      <motion.span
        className="process-gimmick process-gimmick--shape"
        aria-hidden="true"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  if (stepId === "grow") {
    return (
      <motion.span
        className="process-gimmick process-gimmick--grow"
        aria-hidden="true"
        animate={{ y: [0, -8, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  return null;
}

function ProcessCard({
  step,
  index,
  scrollYProgress,
  cardWidth,
  viewportWidth,
  reduceMotion,
}: {
  step: (typeof PROCESS_STEPS)[number];
  index: number;
  scrollYProgress: MotionValue<number>;
  cardWidth: number;
  viewportWidth: number;
  reduceMotion: boolean | null;
}) {
  const isPlay = step.id === "play";
  const [isFocus, setIsFocus] = useState(false);

  const x = useTransform(scrollYProgress, (p) =>
    computeCardLayout(index, p, cardWidth, viewportWidth).x,
  );
  const scale = useTransform(scrollYProgress, (p) =>
    computeCardLayout(index, p, cardWidth, viewportWidth).scale,
  );
  const opacity = useTransform(scrollYProgress, (p) =>
    computeCardLayout(index, p, cardWidth, viewportWidth).opacity,
  );

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setIsFocus(computeCardLayout(index, p, cardWidth, viewportWidth).isFocus);
  });

  return (
    <motion.article
      className={`process-card${isFocus ? " process-card--focus" : ""}${isPlay ? " process-card--play" : ""}`}
      style={{ x, scale, opacity, zIndex: isFocus ? 6 : index + 1 }}
    >
      <motion.div
        className="process-card__inner"
        animate={
          isFocus && !reduceMotion
            ? { scale: [1, 1.007, 1], y: [0, -2, 0] }
            : { scale: 1, y: 0 }
        }
        transition={isFocus && !reduceMotion ? BREATH : { duration: 0 }}
      >
        <StepGimmick stepId={step.id} active={isFocus} reduceMotion={reduceMotion} />

        <p className="process-card__motion">{step.motion}</p>

        {isPlay && isFocus ? (
          <h3 className="process-card__title process-card__title--play">
            {step.title.split("").map((char, charIndex) => (
              <motion.span
                key={`${char}-${charIndex}`}
                className="process-card__title-char"
                animate={
                  reduceMotion
                    ? undefined
                    : { y: [0, -3 - charIndex * 0.35, 0], rotate: [0, charIndex % 2 === 0 ? -3 : 3, 0] }
                }
                transition={{
                  duration: 2.2 + charIndex * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: charIndex * 0.1,
                }}
              >
                {char}
              </motion.span>
            ))}
          </h3>
        ) : (
          <h3 className="process-card__title">{step.title}</h3>
        )}

        <p className="process-card__lead">{step.lead}</p>
        <p className="process-card__body">{step.body}</p>
        <p className="process-card__detail">{step.detail}</p>

        <AnimatePresence>
          {isFocus && (
            <motion.p
              className="process-card__aside"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {step.aside}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  );
}

function ProcessWhisper({
  activeIndex,
  isAligning,
  reduceMotion,
  placement = "stage",
}: {
  activeIndex: number;
  isAligning: boolean;
  reduceMotion: boolean | null;
  placement?: "stage" | "title";
}) {
  if (isAligning || reduceMotion) return null;

  const step = PROCESS_STEPS[activeIndex];
  if (!step) return null;

  return (
    <div className={`process-whisper process-whisper--${placement}`} aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={step.id}
          className="process-whisper__text"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: [0.5, 0.78, 0.5], y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{
            opacity: { ...BREATH },
            y: { duration: 0.45, ease: EASE },
          }}
        >
          {step.aside}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function ProcessStage({
  scrollYProgress,
  reduceMotion,
  isMobile,
  isAligning,
  showBridge,
  activeIndex,
}: {
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean | null;
  isMobile: boolean;
  isAligning: boolean;
  showBridge: boolean;
  activeIndex: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(320);
  const [viewportWidth, setViewportWidth] = useState(1024);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const probe = stage.querySelector<HTMLElement>(".process-card");
      if (probe) setCardWidth(probe.offsetWidth);
      setViewportWidth(stage.clientWidth);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const stageIsMobile = isMobile || viewportWidth < 640;

  return (
    <div className="process-stage" ref={stageRef}>
      <div
        className={`process-stage__viewport${isAligning && stageIsMobile ? " process-stage__viewport--aligning" : ""}`}
      >
        {PROCESS_STEPS.map((step, index) => (
          <ProcessCard
            key={step.id}
            step={step}
            index={index}
            scrollYProgress={scrollYProgress}
            cardWidth={cardWidth}
            viewportWidth={viewportWidth}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {!stageIsMobile ? (
        <ProcessWhisper
          placement="stage"
          activeIndex={activeIndex}
          isAligning={isAligning}
          reduceMotion={reduceMotion}
        />
      ) : null}

      {showBridge ? (
        <motion.a
          className="process-stage__bridge"
          href={PROCESS_BRIDGE.href}
          animate={reduceMotion ? undefined : { opacity: [0.82, 1, 0.82] }}
          transition={BREATH}
        >
          {PROCESS_BRIDGE.line}
        </motion.a>
      ) : (
        <motion.p
          className="process-stage__guide"
          aria-hidden="true"
          animate={reduceMotion ? undefined : { opacity: [0.55, 0.85, 0.55] }}
          transition={{ ...BREATH, duration: 5.6 }}
        >
          {isAligning && stageIsMobile ? "スクロールで順に見る" : "スクロールで並ぶ"}
        </motion.p>
      )}
    </div>
  );
}

function ProcessStaticRow() {
  return (
    <div className="process-static-row" aria-label="仕事の進め方">
      {PROCESS_STEPS.map((step) => (
        <article
          key={step.id}
          className={`process-card process-card--static${step.id === "play" ? " process-card--play" : ""}`}
        >
          <p className="process-card__motion">{step.motion}</p>
          <h3 className="process-card__title">{step.title}</h3>
          <p className="process-card__lead">{step.lead}</p>
          <p className="process-card__body">{step.body}</p>
          <p className="process-card__detail">{step.detail}</p>
          <p className="process-card__aside process-card__aside--static">{step.aside}</p>
        </article>
      ))}
      <a className="process-stage__bridge" href={PROCESS_BRIDGE.href}>
        {PROCESS_BRIDGE.line}
      </a>
    </div>
  );
}

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [bgColor, setBgColor] = useState(PROCESS_STEPS[0].atmosphere);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAligning, setIsAligning] = useState(false);
  const [showBridge, setShowBridge] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const flowIndex = useTransform(scrollYProgress, [0, REVEAL_PORTION], [0, STEP_COUNT - 1]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setShowBridge(p > REVEAL_PORTION + 0.08);
    setIsAligning(p > REVEAL_PORTION);
    const flow = Math.min(STEP_COUNT, (Math.min(p, REVEAL_PORTION) / REVEAL_PORTION) * STEP_COUNT);
    setActiveIndex(Math.min(STEP_COUNT - 1, Math.max(0, Math.round(flow))));
  });

  useMotionValueEvent(flowIndex, "change", (value) => {
    if (reduceMotion) return;
    setBgColor(mixAtmosphere(value));
  });

  if (reduceMotion) {
    return (
      <section
        ref={sectionRef}
        className="process-section process-section--static"
        aria-labelledby="process-opening-title"
      >
        <div className="process-section__inner">
          <ProcessOpening />
          <ProcessIntro />
          <ProcessStaticRow />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="process-section"
      style={{
        height: `calc(100vh + ${PIN_SCROLL_VH}vh)`,
        backgroundColor: bgColor,
      }}
      aria-labelledby="process-opening-title"
    >
      <div className="process-section__fade" aria-hidden="true" />
      <ProcessPresence reduceMotion={reduceMotion} />

      <div className="process-section__sticky">
        <div className="process-section__inner">
          <div className="process-opening-row">
            <ProcessOpening />
            {isMobile ? (
              <ProcessWhisper
                placement="title"
                activeIndex={activeIndex}
                isAligning={isAligning}
                reduceMotion={reduceMotion}
              />
            ) : null}
          </div>
          <ProcessIntro />
          <ProcessStage
            scrollYProgress={scrollYProgress}
            reduceMotion={reduceMotion}
            isMobile={isMobile}
            isAligning={isAligning}
            showBridge={showBridge}
            activeIndex={activeIndex}
          />
        </div>
      </div>
    </section>
  );
}
