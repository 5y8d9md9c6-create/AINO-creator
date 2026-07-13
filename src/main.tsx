import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { scheduleWebFonts } from "./lib/fonts.ts";

const ShyScrollbar = lazy(() => import("./components/ShyScrollbar.tsx"));

void import("./components/AinoSection.tsx");

scheduleWebFonts();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Suspense fallback={null}>
      <ShyScrollbar />
    </Suspense>
  </StrictMode>,
);
