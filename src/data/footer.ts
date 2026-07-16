import { BRAND_EMAIL, INSTAGRAM_URL } from "./site-config";

export const FOOTER_MAIN = "おわり、じゃない。";
export const FOOTER_SUB = "また、何か面白いことを。";

export const FOOTER_BRAND_SRC = "/aino-creator-brand.png";
export const FOOTER_BRAND_LIT_SRC = "/aino-creator-brand-lit.png";
export const FOOTER_BRAND_TAP_HINT = "触ると、ひらめく。";

export const FOOTER_PLAYGROUND_CUE = "文字も、ロゴも、触れる。";

export const FOOTER_SPARK_PHRASES = [
  "ひらめきました。",
  "いい感じ、きた。",
  "この方向、いける。",
  "まだ、煮えてる。",
  "なんか、見えた。",
] as const;

export const FOOTER_BRAND_LINE_1 = "この人が作りました。";
export const FOOTER_BRAND_LINE_2 = "頭の中は、まだ制作中。";

export const FOOTER_IDENTITY_HINTS = {
  line1: "たぶん、本人です。",
  line2: "まだ、渦巻いてます。",
} as const;

export const FOOTER_BRAND_EMAIL = BRAND_EMAIL;

export const FOOTER_PLAY_AGAIN_STAGES = [
  "もう一回、遊ぶ？",
  "ほんとに？",
  "じゃあ、いくよ！",
] as const;

export const FOOTER_WHISPER = "まだ見てる？ありがとう。";
export const FOOTER_SEQUENCE_REWARD = "全部、見てくれたんだ。";
export const FOOTER_COPYRIGHT = "© AINO creator";

export const FOOTER_AINO_HINTS = {
  A: "アイデアの、A。",
  I: "芯の、I。",
  N: "次の、N。",
  O: "一周の、O。",
} as const;

export const FOOTER_LINKS = [
  { id: "instagram", label: "Instagram", href: INSTAGRAM_URL, external: true },
  { id: "mail", label: "Mail", href: `mailto:${FOOTER_BRAND_EMAIL}`, external: true },
  { id: "works", label: "Works", href: "#works" },
  { id: "plan", label: "ご依頼", href: "#plan" },
  { id: "contact", label: "その先", href: "#contact" },
] as const;
