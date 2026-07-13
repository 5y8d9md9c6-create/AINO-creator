import { CONTACT_EMAIL as SITE_CONTACT_EMAIL } from "./site-config";

export const CONTACT_BRIDGE = "ここからは、";

export const CONTACT_THEME =
  "AINO creator と、\nあなたの会話が始まる場所です。";

export const CONTACT_TAGLINE = "あなたの中の\n『こんなの作りたい。』\nぜひ、聞かせてください。";

export const CONTACT_BODY = [
  "まだちゃんと決まっていなくても大丈夫です。",
  "「こんなことお願いできるかな？」",
  "そんなご相談から",
  "一緒に整理していきます。",
] as const;

export const CONTACT_REASSURANCE = [
  "ご相談無料",
  "無理な営業はありません",
  "2営業日以内に返信します",
] as const;

export const CONTACT_TOPICS = [
  { id: "website", label: "ホームページ制作" },
  { id: "lp", label: "LP制作" },
  { id: "design", label: "デザイン制作" },
  { id: "app", label: "アプリ開発" },
  { id: "maintenance", label: "保守・運用" },
  { id: "undecided", label: "まだ決まっていない", highlight: true },
] as const;

export const CONTACT_BUDGETS = [
  { id: "under5", label: "～5万円" },
  { id: "5to10", label: "5〜10万円" },
  { id: "10to30", label: "10〜30万円" },
  { id: "over30", label: "30万円以上" },
  { id: "budget-undecided", label: "まだ決まっていない" },
] as const;

export const CONTACT_TIMELINES = [
  { id: "asap", label: "できるだけ早く" },
  { id: "1-2months", label: "1〜2ヶ月以内" },
  { id: "halfyear", label: "半年以内" },
  { id: "timeline-undecided", label: "未定" },
] as const;

export const CONTACT_EMAIL = SITE_CONTACT_EMAIL;

export const CONTACT_FORM = {
  nameLabel: "なんてお呼びしましょう？",
  nameHint: "お名前",
  namePlaceholder: "昵称やお名前、なんでも",
  emailLabel: "お返事はこちらへ。",
  emailHint: "メールアドレス",
  emailPlaceholder: "hello@example.com",
  topicLabel: "どんなご相談ですか？",
  topicHint: "チップ形式で選択してください。",
  messageLabel: "どんなことを考えていますか？",
  messageHint: "お問い合わせ内容",
  messagePlaceholders: [
    "まだふんわりしています。",
    "相談だけでも大丈夫ですか？",
    "こんなサイトを作りたいです。",
  ] as const,
  budgetLabel: "ご予算",
  budgetOptional: "任意",
  timelineLabel: "希望時期",
  timelineOptional: "任意",
  submitLabel: "飛ばしてみる？",
  sentTitle: "ありがとうございます。",
  sentSubline: "お話できるのを\n楽しみにしています。",
  topicRequired: "ひとつ選んでください。",
} as const;
