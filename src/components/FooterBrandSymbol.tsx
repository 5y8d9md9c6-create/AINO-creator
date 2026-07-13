import { motion, useReducedMotion } from "../lib/motion";
import { FOOTER_BRAND_LIT_SRC, FOOTER_BRAND_SRC, FOOTER_BRAND_TAP_HINT } from "../data/footer";
import "./FooterBrandSymbol.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const ART_W = 901;
const ART_H = 960;

type FooterBrandSymbolProps = {
  sparked: boolean;
  onTap: () => void;
};

export default function FooterBrandSymbol({ sparked, onTap }: FooterBrandSymbolProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="footer-brand">
      <div className="footer-brand__frame">
        <button
          type="button"
          className="footer-brand__tap"
          aria-label={sparked ? "イラストをタップして言葉を変える" : "イラストをタップしてひらめく"}
          aria-pressed={sparked}
          onClick={onTap}
        >
          <span className="footer-brand__stage" aria-hidden="true">
            <img
              className="footer-brand__art footer-brand__art--base"
              src={FOOTER_BRAND_SRC}
              alt=""
              width={ART_W}
              height={ART_H}
              decoding="async"
              loading="lazy"
              draggable={false}
            />
            <motion.img
              className="footer-brand__art footer-brand__art--lit"
              src={FOOTER_BRAND_LIT_SRC}
              alt=""
              width={ART_W}
              height={ART_H}
              decoding="async"
              loading="lazy"
              draggable={false}
              initial={false}
              animate={{ opacity: sparked ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
            />
          </span>
          <span className="visually-hidden">AINO creator — クリエイターのイラスト</span>
        </button>
        {!sparked ? (
          <motion.p
            className="footer-brand__hint"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0.5 }}
            animate={
              reduceMotion
                ? { opacity: 0.62 }
                : { opacity: [0.42, 0.72, 0.42] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <span className="footer-brand__hint-mark" aria-hidden="true">
              ✦
            </span>
            {FOOTER_BRAND_TAP_HINT}
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}
