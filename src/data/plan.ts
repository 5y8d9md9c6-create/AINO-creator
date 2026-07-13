export type PlanPrice = {
  label?: string;
  amount: string;
};

export type PlanServiceVisual = "website" | "lp" | "design" | "app";

export type PlanService = {
  id: PlanServiceVisual;
  number: string;
  title: string;
  teaser: string;
  prices: PlanPrice[];
  catchphrase: string;
  includesLabel: string;
  includes: string[];
  forWhomLabel?: string;
  forWhom?: string[];
  note?: string;
};

export type PlanSubscriptionTier = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  adds: string[];
  includesNote?: string;
};

export const PLAN_BRIDGE = "育てたものを、これからも。";

export const PLAN_TAGLINE = "あなたの『つくりたい』を、\nお聞かせください。";

export const PLAN_BODY = [
  "まだちゃんと決まっていなくても大丈夫です。",
  "『こんなことできるかな？』",
  "そんなご相談から、一緒に整理していきます。",
] as const;

export const PLAN_SERVICES: PlanService[] = [
  {
    id: "website",
    number: "01",
    title: "ホームページ制作",
    teaser: "会社・店舗の魅力を、ちゃんと伝わる形に。",
    prices: [{ amount: "¥200,000〜" }],
    catchphrase: "会社・店舗・サービスの魅力を、ちゃんと伝わるホームページに。",
    includesLabel: "含まれる内容",
    includes: [
      "企画・構成",
      "オリジナルデザイン",
      "コーディング",
      "レスポンシブ対応",
      "お問い合わせフォーム",
      "基本SEO対策",
      "納品後1ヶ月サポート",
    ],
    forWhomLabel: "こんな方へ",
    forWhom: ["会社サイト", "店舗サイト", "リニューアル", "世界観も大切にしたい方"],
  },
  {
    id: "lp",
    number: "02",
    title: "LP制作",
    teaser: "伝えたいことを、一枚にぎゅっと。",
    prices: [{ amount: "¥100,000〜" }],
    catchphrase: "伝えたいことを、一枚にぎゅっと。",
    includesLabel: "含まれる内容",
    includes: ["構成設計", "デザイン", "コーディング", "レスポンシブ対応", "CTA設計"],
    forWhomLabel: "こんな方へ",
    forWhom: ["商品紹介", "サービス紹介", "広告LP", "お問い合わせを増やしたい方"],
  },
  {
    id: "design",
    number: "03",
    title: "デザイン制作",
    teaser: "バナー、名刺、フライヤー。想いを目に見える形に。",
    prices: [
      { label: "バナー", amount: "¥5,000〜" },
      { label: "名刺", amount: "¥15,000〜" },
      { label: "フライヤー", amount: "¥20,000〜" },
    ],
    catchphrase: "伝えたい想いを、目に見えるデザインへ。",
    includesLabel: "対応内容",
    includes: ["バナー", "名刺", "フライヤー", "SNS画像", "その他デザイン"],
  },
  {
    id: "app",
    number: "04",
    title: "アプリ開発",
    teaser: "目的に合わせた、オリジナルアプリを。",
    prices: [{ amount: "お見積り" }],
    catchphrase: "目的に合わせたオリジナルアプリを制作します。",
    includesLabel: "対応内容",
    includes: ["Flutterアプリ", "業務管理", "予約システム", "社内システム", "UI設計"],
    note: "機能や規模に応じてお見積りしてください。",
  },
];

export const PLAN_SUBSCRIPTION = {
  label: "一緒に、育てていく",
  title: "育てる。",
  body: [
    "公開して、終わりじゃない。",
    "更新や改善も、",
    "一緒に育てていきます。",
  ],
  footnote: "内容やご予算に合わせて、最適な形をご提案します。お気軽にご相談ください。",
  tiers: [
    {
      id: "start",
      title: "はじめる。",
      subtitle: "土台を、守る。",
      price: "¥5,000 / 月",
      adds: ["サーバー管理", "ドメイン管理", "SSL管理", "バックアップ"],
    },
    {
      id: "grow",
      title: "そだてる。",
      subtitle: "中身も、一緒に。",
      price: "¥10,000 / 月",
      includesNote: "はじめる。の内容を含みます。",
      adds: ["更新代行", "画像変更", "テキスト修正", "軽微な修正"],
    },
    {
      id: "expand",
      title: "ひろげる。",
      subtitle: "もっと、広げていく。",
      price: "¥20,000 / 月",
      includesNote: "そだてる。の内容を含みます。",
      adds: [
        "アクセス解析",
        "改善提案",
        "デザイン改善",
        "コンテンツ追加",
        "月1回オンライン相談",
      ],
    },
  ] satisfies PlanSubscriptionTier[],
} as const;

export const PLAN_CLOSING = [
  "まだ『こんなことお願いできるかな？』",
  "という段階でも大丈夫です。",
  "まずは、お話を聞かせてください。",
] as const;

export const HEADER_BUBBLES = [
  { text: "つながる", top: "8%", left: "6%", delay: 0 },
  { text: "伝える", top: "22%", left: "72%", delay: 0.4 },
  { text: "育つ", top: "58%", left: "4%", delay: 0.8 },
  { text: "届く", top: "68%", left: "78%", delay: 1.1 },
  { text: "整える", top: "38%", left: "88%", delay: 0.6 },
] as const;
