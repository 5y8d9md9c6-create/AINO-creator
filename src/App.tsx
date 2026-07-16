import { Suspense, lazy, useEffect, useState } from "react";
import { applyDocumentSeo, applyHomeSeo, applyWorkSeo } from "./lib/seo";
import { SITE_NAME } from "./data/seo";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HeroAtmosphere from "./components/HeroAtmosphere";
import DeferredMount from "./components/DeferredMount";
import { ContactPlaneProvider } from "./context/ContactPlaneContext";
import { PaperPlaneFlightLayer } from "./components/PaperPlaneContact";
import { useWorkRoute } from "./hooks/useWorkRoute";
import { usePageAnalytics } from "./hooks/usePageAnalytics";
import { getWorkById, isExternalWork } from "./data/works";
import { navigateToWorksIndex } from "./lib/navigation";
import "./components/HeroArea.css";

import MotionBoundary from "./lib/MotionBoundary";

const AinoSection = lazy(() => import("./components/AinoSection"));
const WorkDetailPage = lazy(() => import("./pages/WorkDetailPage"));
const AboutSection = lazy(() => import("./components/AboutSection"));
const WorksSection = lazy(() => import("./components/WorksSection"));
const ProcessSection = lazy(() => import("./components/ProcessSection"));
const PlanSection = lazy(() => import("./components/PlanSection"));
const ContactSection = lazy(() => import("./components/ContactSection"));
const FooterSection = lazy(() => import("./components/FooterSection"));
function ExternalWorkRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return null;
}

function WorkNotFound() {
  return (
    <div className="work-page">
      <div className="work-page__noise" aria-hidden="true" />
      <main className="work-page__main">
        <p className="work-page__text">作品が見つかりませんでした。</p>
        <button type="button" className="work-page__back" onClick={navigateToWorksIndex}>
          ← 作品集へ
        </button>
      </main>
    </div>
  );
}

function App() {
  const workId = useWorkRoute();
  const work = workId ? getWorkById(workId) : undefined;

  useEffect(() => {
    if (workId && !work) {
      applyDocumentSeo({
        title: `作品が見つかりません｜${SITE_NAME}`,
        noindex: true,
      });
      return;
    }
    if (work) {
      applyWorkSeo(work);
      return;
    }
    applyHomeSeo();
  }, [work, workId]);

  // SEO effect の後に宣言し、更新後の title で page_view を送る
  usePageAnalytics(workId);

  const [load3D, setLoad3D] = useState(false);

  useEffect(() => {
    if (workId) return;
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => setLoad3D(true));
      } else {
        setTimeout(() => setLoad3D(true), 50);
      }
    }
  }, [workId]);

  if (workId) {
    if (!work) return <WorkNotFound />;
    if (isExternalWork(work)) return <ExternalWorkRedirect url={work.url!} />;
    return (
      <Suspense fallback={null}>
        <MotionBoundary>
          <WorkDetailPage work={work} />
        </MotionBoundary>
      </Suspense>
    );
  }

  return (
    <ContactPlaneProvider>
      <main className="page" id="top">
        <div className="hero-area">
          <HeroAtmosphere />
          <Header />
          <div className="hero-area__stage">
            <Hero />
            {load3D && (
              <Suspense fallback={null}>
                <AinoSection />
              </Suspense>
            )}
          </div>
        </div>
        <DeferredMount anchorId="about" minHeight="80vh">
          <Suspense fallback={null}>
            <MotionBoundary>
              <AboutSection />
            </MotionBoundary>
          </Suspense>
        </DeferredMount>
        <DeferredMount anchorId="works" minHeight="120vh">
          <Suspense fallback={null}>
            <MotionBoundary>
              <WorksSection />
            </MotionBoundary>
          </Suspense>
        </DeferredMount>
        <DeferredMount anchorId="process" minHeight="120vh">
          <Suspense fallback={null}>
            <MotionBoundary>
              <ProcessSection />
            </MotionBoundary>
          </Suspense>
        </DeferredMount>
        <DeferredMount anchorId="plan" minHeight="120vh">
          <Suspense fallback={null}>
            <MotionBoundary>
              <PlanSection />
            </MotionBoundary>
          </Suspense>
        </DeferredMount>
        <DeferredMount anchorId="contact" minHeight="100vh" rootMargin="480px 0px">
          <Suspense fallback={null}>
            <MotionBoundary>
              <ContactSection />
            </MotionBoundary>
          </Suspense>
        </DeferredMount>
        <DeferredMount minHeight="80vh">
          <Suspense fallback={null}>
            <MotionBoundary>
              <FooterSection />
            </MotionBoundary>
          </Suspense>
        </DeferredMount>
        <MotionBoundary>
          <PaperPlaneFlightLayer />
        </MotionBoundary>
        <div className="grain-overlay" aria-hidden="true" />
      </main>
    </ContactPlaneProvider>
  );
}

export default App;
