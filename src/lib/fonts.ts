const CRITICAL_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800&family=Zen+Maru+Gothic:wght@400;500&family=Zen+Kaku+Gothic+New:wght@400&display=swap";

const EXTENDED_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500&family=Poppins:wght@400;500;600;700;800&family=Kalam:wght@400;700&family=Zen+Kaku+Gothic+New:wght@500&display=swap";

function injectStylesheet(id: string, href: string) {
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function runWhenIdle(task: () => void, timeout: number) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(task, { timeout });
    return;
  }
  globalThis.setTimeout(task, 32);
}

export function scheduleWebFonts() {
  injectStylesheet("web-fonts-critical", CRITICAL_FONT_STYLESHEET);

  const injectExtended = () => injectStylesheet("web-fonts-extended", EXTENDED_FONT_STYLESHEET);

  const onFirstScroll = () => {
    injectExtended();
    window.removeEventListener("scroll", onFirstScroll);
  };

  window.addEventListener("scroll", onFirstScroll, { once: true, passive: true });
  runWhenIdle(injectExtended, 6000);
}
