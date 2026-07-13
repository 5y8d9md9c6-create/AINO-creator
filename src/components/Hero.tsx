import { useEffect, useState } from "react";
import { CursorHand } from "./Doodles";
import "./Hero.css";

const BUBBLE_MESSAGES = [
  "いろいろ触ってみてね",
  "どうなるかな？",
  "押してみて",
  "くるっと回るよ",
  "ふにふに柔らかいよ",
  "ゆらゆら揺れるよ",
  "びよーんと伸びるよ",
  "もう一回やってみて",
  "こっちも触ってみて",
  "なんか気持ちいいよ",
];

const BUBBLE_INTERVAL_MS = 5000;

export default function Hero() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % BUBBLE_MESSAGES.length);
    }, BUBBLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-copy">
      <div className="hero-copy__lead hero-copy__lead--enter">
        <h1 className="hero-title">
          <span>ちょっと</span>
          <span className="hero-title__underlined">遊んでみて。</span>
        </h1>

        <div className="hero-bubble hero-bubble--enter">
          <div className="hero-bubble__float">
            <CursorHand className="hero-bubble__cursor" />
            <span key={messageIndex} className="hero-bubble__text">
              {BUBBLE_MESSAGES[messageIndex]}
            </span>
          </div>
        </div>

        <p className="hero-desc">
          アイデアを、カタチにして、
          <br />
          ワクワクに変える人。
        </p>

        <p className="hero-sign">— AINO creator</p>
      </div>
    </div>
  );
}
