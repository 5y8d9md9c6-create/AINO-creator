import { motion, useReducedMotion } from "../lib/motion";
import type { Work } from "../data/works";
import { navigateToWorksIndex } from "../lib/navigation";
import "./WorkDetailPage.css";

function WorkGallery({ work }: { work: Work }) {
  if (work.galleryMode === "lp-stitch") {
    return (
      <div className="work-page__lp" aria-label={`${work.title}のLP`}>
        <div className="work-page__lp-frame">
          <div className="work-page__lp-scroll">
            {work.images.map((src, index) => (
              <img
                key={src}
                className="work-page__lp-slice"
                src={src}
                alt={`${work.title} — 画面${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "low"}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="work-page__gallery" aria-label={`${work.title}の画像`}>
      {work.images.map((src, index) => (
        <figure key={src} className="work-page__figure">
          <img
            className="work-page__image"
            src={src}
            alt={`${work.title} — 画像${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index === 0 ? "high" : "low"}
          />
        </figure>
      ))}
    </div>
  );
}

export default function WorkDetailPage({ work }: { work: Work }) {
  const reduceMotion = useReducedMotion();
  const isLpStitch = work.galleryMode === "lp-stitch";

  return (
    <div className="work-page">
      <div className="work-page__noise" aria-hidden="true" />

      <header className="work-page__header">
        <a
          className="work-page__logo"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateToWorksIndex();
          }}
        >
          <span className="work-page__logo-main">AINO</span>
          <span className="work-page__logo-sub">creator</span>
        </a>
        <button type="button" className="work-page__back" onClick={navigateToWorksIndex}>
          ← 作品集へ
        </button>
      </header>

      <motion.main
        className={`work-page__main ${isLpStitch ? "work-page__main--lp" : ""}`}
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="work-page__intro">
          <span className="work-page__category">{work.category}</span>
          <h1 className="work-page__title">{work.title}</h1>
        </div>

        <WorkGallery work={work} />

        <div className="work-page__details">
          <section className="work-page__block">
            <h2 className="work-page__label">概要</h2>
            <p className="work-page__text">{work.overview}</p>
          </section>

          <section className="work-page__block">
            <h2 className="work-page__label">制作背景</h2>
            <p className="work-page__text">{work.background}</p>
          </section>

          <div className="work-page__meta-grid">
            <section className="work-page__block work-page__block--compact">
              <h2 className="work-page__label">担当範囲</h2>
              <ul className="work-page__tags">
                {work.role.map((item) => (
                  <li key={item} className="work-page__tag">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="work-page__block work-page__block--compact">
              <h2 className="work-page__label">使用ツール</h2>
              <ul className="work-page__tags">
                {work.tools.map((item) => (
                  <li key={item} className="work-page__tag">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
