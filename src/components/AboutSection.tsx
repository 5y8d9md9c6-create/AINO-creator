import { motion, useReducedMotion } from "../lib/motion";
import { useCallback, useState } from "react";
import AboutAtmosphere, { AboutOpening } from "./AboutAtmosphere";
import AboutPlayfield from "./AboutPlayfield";
import "./AboutSection.css";

const ACTIONS = ["触ってみる。", "試してみる。", "失敗する。", "また作ってみる。"] as const;

const EXPERIENCES = [
  { text: "思わず触りたくなる。", whisper: "指が動く前に、心が動く。" },
  { text: "思わず笑ってしまう。", whisper: "小さな意外性が、記憶に残る。" },
  { text: "思わず誰かに見せたくなる。", whisper: "共有したくなるのが、最高の評価。" },
] as const;

const CURIOSITY = ["これ、", "面白", "そう。"] as const;

function AboutHeadline() {
  const [complete, setComplete] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="about-headline"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.p
        className="about-headline__line"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        面白いは、
      </motion.p>

      {complete ? (
        <motion.p
          className="about-headline__line about-headline__line--complete"
          initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          ちゃんと伝わる。
        </motion.p>
      ) : (
        <button
          type="button"
          className="about-headline__ghost"
          onClick={() => setComplete(true)}
          aria-label="ちゃんと伝わる。を表示"
        >
          <motion.span
            className="about-headline__ghost-text"
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.16, 0.34, 0.16],
                    filter: ["blur(3px)", "blur(0px)", "blur(3px)"],
                  }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            ちゃんと伝わる。
          </motion.span>
          <span className="about-headline__ghost-hint" aria-hidden="true">
            タップ
          </span>
        </button>
      )}
    </motion.div>
  );
}

function CuriosityWords() {
  const [assembled, setAssembled] = useState(false);
  const [placed, setPlaced] = useState<boolean[]>([false, false, false]);
  const reduceMotion = useReducedMotion();

  const handleDrop = useCallback((index: number) => {
    setPlaced((prev) => {
      const next = [...prev];
      next[index] = true;
      if (next.every(Boolean)) setAssembled(true);
      return next;
    });
  }, []);

  if (assembled) {
    return (
      <motion.p
        className="about-curiosity__assembled"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        「これ、面白そう。」
      </motion.p>
    );
  }

  return (
    <div className="about-curiosity">
      <p className="about-curiosity__prompt">最初は、</p>
      <div className="about-curiosity__zone">
        <div className="about-curiosity__slots" aria-hidden="true">
          {CURIOSITY.map((word, i) => (
            <span
              key={word}
              className={`about-curiosity__slot ${placed[i] ? "is-filled" : ""}`}
            >
              {placed[i] ? word : "···"}
            </span>
          ))}
        </div>
        <div className="about-curiosity__pieces">
          {CURIOSITY.map((word, i) =>
            placed[i] ? null : (
              <DraggableWord key={word} index={i} word={word} onDrop={handleDrop} />
            ),
          )}
        </div>
        <p className="about-curiosity__hint" aria-hidden="true">
          ドラッグして並べてみて
        </p>
      </div>
    </div>
  );
}

function DraggableWord({
  word,
  index,
  onDrop,
}: {
  word: string;
  index: number;
  onDrop: (index: number) => void;
}) {
  return (
    <motion.button
      type="button"
      className="about-curiosity__piece"
      drag
      dragElastic={0.12}
      dragMomentum={false}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 16 || Math.abs(info.offset.y) > 8) onDrop(index);
      }}
      onClick={() => onDrop(index)}
      aria-label={`${word}を配置`}
    >
      {word}
    </motion.button>
  );
}

function ActionSequence({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();

  const advance = (i: number) => {
    if (i !== step) return;
    const next = step + 1;
    setStep(next);
    if (next >= ACTIONS.length) onComplete();
  };

  return (
    <div className="about-actions">
      {ACTIONS.map((action, i) => {
        const unlocked = i <= step;
        const done = i < step;

        return (
          <motion.button
            key={action}
            type="button"
            className={`about-actions__item ${unlocked ? "is-unlocked" : ""} ${done ? "is-done" : ""}`}
            disabled={!unlocked || done}
            onClick={() => advance(i)}
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            whileInView={{ opacity: unlocked ? 1 : 0.2, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32, delay: i * 0.04 }}
            whileHover={unlocked && !done ? { x: 3 } : undefined}
          >
            <span className="about-actions__text">{action}</span>
            {done && (
              <motion.span
                className="about-actions__mark"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                aria-hidden="true"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function BridgeReveal({ visible }: { visible: boolean }) {
  const reduceMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <motion.div
      className="about-bridge"
      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="about-bridge__lead">その繰り返しの中で、</p>
      <p className="about-bridge__insight">
        <HoverGlowQuote>「面白い」</HoverGlowQuote>
        は、
        <br className="about-bridge__break" />
        ちゃんと人に伝わるんだと知りました。
      </p>
    </motion.div>
  );
}

function HoverGlowQuote({ children }: { children: React.ReactNode }) {
  const [lit, setLit] = useState(false);

  return (
    <button
      type="button"
      className={`about-glow-quote ${lit ? "is-lit" : ""}`}
      onMouseEnter={() => setLit(true)}
      onFocus={() => setLit(true)}
      onClick={() => setLit((v) => !v)}
      aria-label="面白い"
    >
      {children}
    </button>
  );
}

function ExperienceLines() {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  return (
    <div className="about-experience">
      <p className="about-experience__lead">だから私は、</p>
      <p className="about-experience__preface">見た目だけじゃなく、</p>

      <ul className="about-experience__list">
        {EXPERIENCES.map((item, i) => {
          const open = revealed.has(i);

          return (
            <li key={item.text} className="about-experience__item">
              <button
                type="button"
                className={`about-experience__trigger ${open ? "is-open" : ""}`}
                onMouseEnter={() => setRevealed((s) => new Set(s).add(i))}
                onFocus={() => setRevealed((s) => new Set(s).add(i))}
                onClick={() =>
                  setRevealed((s) => {
                    const next = new Set(s);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  })
                }
                aria-expanded={open}
              >
                {item.text}
              </button>
              <motion.span
                className="about-experience__whisper"
                initial={false}
                animate={{ opacity: open ? 1 : 0, y: open ? 0 : 4 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                aria-hidden={!open}
              >
                {item.whisper}
              </motion.span>
            </li>
          );
        })}
      </ul>

      <motion.p
        className="about-experience__closing"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-5%" }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        そんな体験まで
        <br className="about-experience__closing-br" />
        デザインしています。
      </motion.p>
    </div>
  );
}

export default function AboutSection() {
  const [actionsDone, setActionsDone] = useState(false);

  return (
    <section className="about-section" aria-labelledby="about-opening-title">
      <div className="about-section__fade" aria-hidden="true" />
      <AboutAtmosphere />

      <div className="about-section__layout">
        <div className="about-section__content">
          <AboutOpening onComplete={() => {}} />
          <AboutHeadline />

          <div className="about-section__body">
            <CuriosityWords />
            <ActionSequence onComplete={() => setActionsDone(true)} />
            <BridgeReveal visible={actionsDone} />
            <ExperienceLines />
          </div>
        </div>

        <AboutPlayfield />
      </div>
    </section>
  );
}
