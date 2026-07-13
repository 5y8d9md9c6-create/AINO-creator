export const WORK_CATEGORIES = ["ALL", "WEB", "APP", "BANNER", "GRAPHIC", "BRANDING"] as const;

export type WorkCategoryFilter = (typeof WORK_CATEGORIES)[number];
export type WorkCategory = Exclude<WorkCategoryFilter, "ALL">;

export type WorkLayout = "default" | "wide" | "tall";
export type WorkGalleryMode = "default" | "lp-stitch";

export type Work = {
  id: string;
  category: WorkCategory;
  title: string;
  thumbnail: string;
  images: string[];
  overview: string;
  background: string;
  role: string[];
  tools: string[];
  period: string;
  url?: string;
  /** 詳細ページを経由せず URL へ直接遷移 */
  externalOnly?: boolean;
  /** lp-stitch = LP画像を隙間なく縦連結 */
  galleryMode?: WorkGalleryMode;
  layout?: WorkLayout;
  /** 詳細ページの本文を Coming Soon 表示にする */
  comingSoon?: boolean;
};

const FACEMASK_IMAGES = Array.from({ length: 12 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return `/works/facemask-${num}.png`;
});

export const WORKS: Work[] = [
  {
    id: "web-openhouse",
    category: "WEB",
    title: "HIKARI HOME｜オープンハウスLP",
    thumbnail: "/works/openhouse-hero.png",
    images: ["/works/openhouse-hero.png", "/works/openhouse-mobile.png"],
    overview:
      "不動産ブランド「HIKARI HOME」のオープンハウスLP。「この週末、理想の暮らしを体感しませんか。」を軸に、来場予約につながる体験設計。",
    background:
      "見学予約につながる前に、来場したくなる感情をつくることを目的に制作。高級感と親しみやすさのバランスを意識し、PC・スマホ両方で世界観が崩れない構成にしました。",
    role: ["デザイン", "コーディング", "情報設計"],
    tools: ["Figma", "HTML/CSS", "JavaScript"],
    period: "2025年",
    url: "https://openhouse-lp.vercel.app/",
    externalOnly: true,
    layout: "wide",
  },
  {
    id: "web-facemask",
    category: "WEB",
    title: "MOISTURE INFUSION MASK｜LP",
    thumbnail: "/works/facemask-01.png",
    images: FACEMASK_IMAGES,
    overview:
      "集中保湿フェイスパック「MOISTURE INFUSION MASK」のLP。「すっぴん、好きになる。」を軸に、うるおい・透明感・日常の変化をストーリーとして積み上げる構成。",
    background:
      "「貼るだけ10分」という手軽さと、美容液5本分の訴求を両立させるため、悩み共感から成分、使用感、変化、信頼までの流れで設計。デザインのみの制作です。",
    role: ["デザイン", "構成", "ビジュアル制作"],
    tools: ["Figma", "Photoshop"],
    period: "2025年",
    galleryMode: "lp-stitch",
    layout: "wide",
  },
  {
    id: "banner-serum",
    category: "BANNER",
    title: "LUENA｜プレミアムセラムバナー",
    thumbnail: "/works/banner-serum.png",
    images: ["/works/banner-serum.png"],
    overview:
      "プレミアム美容液ブランド「LUENA（ルネア）」のプロモーションバナー。上質さと信頼感を、写真とタイポグラフィで伝えるデザイン。",
    background:
      "「年齢を重ねるたび、肌は美しくなれる。」というコピーを軸に、商品・累計100万本突破の実績・初回69%OFFを一枚で整理。ゴールドとベージュのトーンで、大人の肌への訴求を統一しました。",
    role: ["デザイン", "レイアウト"],
    tools: ["Figma", "Photoshop"],
    period: "2025年",
    layout: "default",
  },
  {
    id: "banner-career",
    category: "BANNER",
    title: "フルリモート転職｜求人支援バナー",
    thumbnail: "/works/banner-career.png",
    images: ["/works/banner-career.png"],
    overview:
      "フルリモート求人の転職支援バナー。「通勤時間を、自分の時間へ。」というコピーで、理想の働き方を前向きに伝えるデザイン。",
    background:
      "満足度No.1・実績1万人以上などの信頼要素と、無料相談への導線を一枚に整理。タイムライン上で一瞬で「自分ごと」に感じてもらうことを重視しました。",
    role: ["デザイン", "コピー配置"],
    tools: ["Figma", "Photoshop"],
    period: "2025年",
    layout: "default",
  },
  {
    id: "web-tattoo-homies",
    category: "WEB",
    title: "TATTOO STUDIO HOMIES",
    thumbnail: "/works/tattoo-homies.png",
    images: ["/works/tattoo-homies.png"],
    overview: "",
    background: "",
    role: [],
    tools: [],
    period: "2026年",
    layout: "wide",
    comingSoon: true,
  },
  {
    id: "graphic-flyer-gym",
    category: "GRAPHIC",
    title: "POWER FIT GYM｜ジムフライヤー",
    thumbnail: "/works/flyer-gym.png",
    images: ["/works/flyer-gym.png"],
    overview:
      "パーソナルトレーニングジム「POWER FIT GYM」のフライヤー。「自分史上、最高の身体へ。」をキャッチに、体験・キャンペーン・施設情報を一枚に集約。",
    background:
      "手に取った瞬間に「自分のための場所」と感じてもらえるよう、写真のトーンとタイポグラフィのコントラストを調整。折り込みを想定した視線の流れも設計しています。",
    role: ["デザイン", "構成", "ビジュアル制作"],
    tools: ["Photoshop"],
    period: "2025年",
    layout: "tall",
  },
];

export function filterWorks(category: WorkCategoryFilter): Work[] {
  if (category === "ALL") return WORKS;
  return WORKS.filter((work) => work.category === category);
}

export function getWorkById(id: string): Work | undefined {
  return WORKS.find((work) => work.id === id);
}

export function isExternalWork(work: Work): boolean {
  return Boolean(work.externalOnly && work.url);
}
