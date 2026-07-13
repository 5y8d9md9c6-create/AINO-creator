import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "../lib/motion";
import LazyImage from "./LazyImage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  filterWorks,
  isExternalWork,
  WORK_CATEGORIES,
  type Work,
  type WorkCategoryFilter,
} from "../data/works";
import { navigateToWork } from "../lib/navigation";
import WorksAtmosphereBackdrop from "./WorksAtmosphere";
import WorksPlayfield from "./WorksPlayfield";
import "./WorksSection.css";
import "./WorksAtmosphere.css";

const OPENING_CHARS = ["カ", "タ", "チ"] as const;

const CHAOS_WORDS = [
  { text: "アイデア", x: "4%", y: "8%", rotate: -12 },
  { text: "試す", x: "72%", y: "2%", rotate: 8 },
  { text: "失敗", x: "18%", y: "62%", rotate: -6 },
  { text: "わくわく", x: "58%", y: "48%", rotate: 14 },
  { text: "また作る", x: "82%", y: "72%", rotate: -10 },
  { text: "面白い", x: "36%", y: "18%", rotate: 5 },
] as const;

const LAYOUT_SPRING = { type: "spring" as const, stiffness: 400, damping: 36, mass: 0.82 };
const REPEL_SPRING = { stiffness: 620, damping: 14, mass: 0.38 };
const REPEL_RADIUS = 420;
const REPEL_MAX = 168;

type HoverState = {
  id: string | null;
  x: number;
  y: number;
};

const HoverContext = createContext<HoverState>({ id: null, x: 0, y: 0 });

function WorksOpening() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    setStarted(true);
  }, [inView, reduceMotion]);

  return (
    <div ref={ref} className="works-opening" id="works-heading" aria-labelledby="works-opening-title">
      <h2 className="works-opening__title" id="works-opening-title">
        {OPENING_CHARS.map((char, i) => (
          <motion.span
            key={char}
            className="works-opening__char"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={
              started || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
            }
            transition={{
              duration: 0.42,
              delay: reduceMotion ? 0 : i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char}
          </motion.span>
        ))}
      </h2>
    </div>
  );
}

function WorksConcept() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="works-concept"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="works-concept__chaos" aria-hidden="true">
        {CHAOS_WORDS.map((word, i) => (
          <motion.span
            key={word.text}
            className="works-concept__chaos-word"
            style={{ left: word.x, top: word.y, rotate: `${word.rotate}deg` }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 0.38, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            {word.text}
          </motion.span>
        ))}
      </div>

      <div className="works-concept__copy">
        <div className="works-concept__block works-concept__block--free">
          <span className="works-concept__label">頭の中</span>
          <p className="works-concept__line">アイデアは、自由で、乱雑で、わくわくしている。</p>
        </div>
        <div className="works-concept__block works-concept__block--aligned">
          <span className="works-concept__label">届けるカタチ</span>
          <p className="works-concept__line">美しく整理して、伝わる形にする。</p>
        </div>
        <p className="works-concept__hint">
          作品にカーソルを置くと、周りが弾け飛ぶ。
          <br />
          クリックで詳しく見る。
        </p>
      </div>
    </motion.div>
  );
}

function WorksFilter({
  active,
  onChange,
}: {
  active: WorkCategoryFilter;
  onChange: (category: WorkCategoryFilter) => void;
}) {
  return (
    <LayoutGroup id="works-filter">
      <div className="works-filter" role="tablist" aria-label="作品カテゴリ">
        {WORK_CATEGORIES.map((category) => {
          const isActive = active === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`works-filter__btn ${isActive ? "is-active" : ""}`}
              onClick={() => onChange(category)}
            >
              {isActive && (
                <motion.span
                  layoutId="works-filter-pill"
                  className="works-filter__pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {category}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function useHoverRepulsion(workId: string, slotRef: React.RefObject<HTMLDivElement | null>) {
  const hover = useContext(HoverContext);
  const reduceMotion = useReducedMotion();
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const springX = useSpring(offsetX, REPEL_SPRING);
  const springY = useSpring(offsetY, REPEL_SPRING);

  useEffect(() => {
    if (reduceMotion || !hover.id || hover.id === workId || !slotRef.current) {
      offsetX.set(0);
      offsetY.set(0);
      return;
    }

    const rect = slotRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cx - hover.x;
    const dy = cy - hover.y;
    const dist = Math.hypot(dx, dy);

    if (dist < REPEL_RADIUS && dist > 0.5) {
      const t = 1 - dist / REPEL_RADIUS;
      const force = t ** 0.85 * REPEL_MAX;
      offsetX.set((dx / dist) * force);
      offsetY.set((dy / dist) * force);
    } else {
      offsetX.set(0);
      offsetY.set(0);
    }
  }, [hover, workId, slotRef, offsetX, offsetY, reduceMotion]);

  return reduceMotion ? { x: 0, y: 0 } : { x: springX, y: springY };
}

function WorkCard({
  work,
  index,
  onHover,
  onMove,
  onLeave,
}: {
  work: Work;
  index: number;
  onHover: (work: Work, e: React.PointerEvent) => void;
  onMove: (work: Work, e: React.PointerEvent) => void;
  onLeave: () => void;
}) {
  const hover = useContext(HoverContext);
  const slotRef = useRef<HTMLDivElement>(null);
  const repulsion = useHoverRepulsion(work.id, slotRef);
  const isFocused = hover.id === work.id;

  const isExternal = isExternalWork(work);

  return (
    <motion.div
      ref={slotRef}
      className={`works-grid__slot ${isFocused ? "is-focused" : ""}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        layout: LAYOUT_SPRING,
        opacity: { duration: 0.28, delay: index * 0.04 },
        y: { duration: 0.38, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      <motion.div
        className="works-card__motion"
        style={isFocused ? undefined : { x: repulsion.x, y: repulsion.y }}
      >
        <article className={`works-card ${isFocused ? "is-hovered is-focused" : ""}`}>
          <a
            className="works-card__link"
            href={isExternal ? work.url : `/works/${work.id}`}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onClick={
              isExternal
                ? undefined
                : (e) => {
                    e.preventDefault();
                    navigateToWork(work.id);
                  }
            }
            onPointerEnter={(e) => onHover(work, e)}
            onPointerMove={(e) => onMove(work, e)}
            onPointerLeave={onLeave}
          >
            <div className="works-card__sheet">
              <span className="works-card__snap" aria-hidden="true" />
              <div className="works-card__media">
                <LazyImage
                  className="works-card__image"
                  src={work.thumbnail}
                  alt=""
                  width={640}
                  height={480}
                  sizes="(max-width: 768px) 88vw, (max-width: 1024px) 44vw, 320px"
                />
                <span className="works-card__more" aria-hidden="true">
                  {isExternal ? "サイトを見る ↗" : "詳しく見る →"}
                </span>
              </div>
              <div className="works-card__meta">
                <span className="works-card__category" aria-hidden="true">{work.category}</span>
                <span className="works-card__title">{work.title}</span>
              </div>
            </div>
          </a>
        </article>
      </motion.div>
    </motion.div>
  );
}

function WorksStage({ works }: { works: Work[] }) {
  const [hover, setHover] = useState<HoverState>({ id: null, x: 0, y: 0 });

  const handleHover = useCallback((work: Work, e: React.PointerEvent) => {
    setHover({ id: work.id, x: e.clientX, y: e.clientY });
  }, []);

  const handleMove = useCallback((work: Work, e: React.PointerEvent) => {
    setHover({ id: work.id, x: e.clientX, y: e.clientY });
  }, []);

  const handleLeave = useCallback(() => {
    setHover({ id: null, x: 0, y: 0 });
  }, []);

  return (
    <HoverContext.Provider value={hover}>
      <div className="works-stage">
        <WorksPlayfield />

        <LayoutGroup id="works-grid">
          <motion.div className="works-grid" layout>
            <AnimatePresence mode="popLayout">
              {works.length > 0 ? (
                works.map((work, index) => (
                  <WorkCard
                    key={work.id}
                    work={work}
                    index={index}
                    onHover={handleHover}
                    onMove={handleMove}
                    onLeave={handleLeave}
                  />
                ))
              ) : (
                <motion.p
                  key="empty"
                  className="works-grid__empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  このカテゴリの作品は、これから増えていきます。
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>
    </HoverContext.Provider>
  );
}

export default function WorksSection() {
  const [category, setCategory] = useState<WorkCategoryFilter>("ALL");
  const filtered = filterWorks(category);

  const handleCategoryChange = useCallback((next: WorkCategoryFilter) => {
    setCategory(next);
  }, []);

  return (
    <section className="works-section" aria-labelledby="works-opening-title">
      <WorksAtmosphereBackdrop />
      <div className="works-section__fade" aria-hidden="true" />

      <div className="works-section__inner">
        <WorksOpening />
        <WorksConcept />
        <WorksFilter active={category} onChange={handleCategoryChange} />
        <WorksStage works={filtered} />
      </div>
    </section>
  );
}
