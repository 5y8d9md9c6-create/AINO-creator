export type ProcessStep = {
  id: string;
  title: string;
  lead: string;
  body: string;
  detail: string;
  motion: string;
  atmosphere: string;
  aside: string;
};

export const PROCESS_INTRO_ASIDE = "…ここから、ちゃんと向き合う。";

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "listen",
    title: "聞く。",
    lead: "まず、話を聞きます。",
    body: "要望だけじゃなく、言葉の裏や空気まで。一番近いところに立って、丁寧に。",
    detail:
      "ヒアリングシートを埋める、というより。今、何に困っていて、何を届けたいのか——その温度まで聞き取ります。",
    motion: "情報が集まる",
    atmosphere: "#f6f8fb",
    aside: "…まず、聞こう。",
  },
  {
    id: "unwind",
    title: "ほどく。",
    lead: "糸を、ほどいていきます。",
    body: "ごちゃごちゃに絡んだ想いを、一つずつ言葉にする。急がない。",
    detail:
      "整理は、削ることじゃない。何が本当に伝えたいことなのか、芯だけを残す作業です。",
    motion: "整理される",
    atmosphere: "#faf8f4",
    aside: "ごちゃっとしてる。大丈夫。",
  },
  {
    id: "play",
    title: "遊ぶ。",
    lead: "ここからが、たのしい。",
    body: "試す。崩す。またつくる。正解を探す前に、まず遊ぶ。",
    detail:
      "ラフでもいい。失敗してもいい。面白い方向が見つかるまで、何度でも。",
    motion: "可能性が広がる",
    atmosphere: "#fbfaf3",
    aside: "ちょっと、いじってみよう。",
  },
  {
    id: "shape",
    title: "カタチにする。",
    lead: "見えないものに、カタチを。",
    body: "デザインも実装も、ひとつの体験としてつくる。",
    detail:
      "伝わるかどうかは、形にして初めてわかる。だから、ちゃんとカタチにします。",
    motion: "完成へ近づく",
    atmosphere: "#fbf7f8",
    aside: "…うん、こんな感じかな。",
  },
  {
    id: "grow",
    title: "育てる。",
    lead: "公開して、終わりじゃない。",
    body: "届いたあとも、一緒に育てていく。数字より、反応を見る。",
    detail:
      "サイトは育つもの。使われ方を見て、また直して、また面白くする。それが、仕事のあとにも続くこと。",
    motion: "次の未来へ繋がる",
    atmosphere: "#f6f9f7",
    aside: "あとから、また一緒に。",
  },
];

export const PROCESS_BRIDGE = {
  line: "ここからは、あなたと。",
  href: "#plan",
};

export const PROCESS_ATMOSPHERES = PROCESS_STEPS.map((step) => step.atmosphere);

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export function mixAtmosphere(index: number): string {
  const colors = PROCESS_ATMOSPHERES;
  const clamped = Math.min(Math.max(index, 0), colors.length - 1);
  const base = Math.floor(clamped);
  const t = clamped - base;
  const a = hexToRgb(colors[base]);
  const b = hexToRgb(colors[Math.min(base + 1, colors.length - 1)]);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r} ${g} ${bl})`;
}
