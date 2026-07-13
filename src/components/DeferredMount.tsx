import { useEffect, useRef, useState, type ReactNode } from "react";
import { scheduleIdleTask } from "../lib/idleMount";

type DeferredMountProps = {
  children: ReactNode;
  anchorId?: string;
  rootMargin?: string;
  minHeight?: string;
};

function hashTargets(anchorId?: string) {
  if (!anchorId) return false;
  return window.location.hash === `#${anchorId}`;
}

export default function DeferredMount({
  children,
  anchorId,
  rootMargin = "120px 0px",
  minHeight = "1px",
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [queued, setQueued] = useState(() => hashTargets(anchorId));
  const [live, setLive] = useState(() => hashTargets(anchorId));

  useEffect(() => {
    if (hashTargets(anchorId)) {
      setQueued(true);
      setLive(true);
    }

    const onHashChange = () => {
      if (hashTargets(anchorId)) {
        setQueued(true);
        setLive(true);
      }
    };

    const onRequestMount = () => {
      if (anchorId !== "contact") return;
      setQueued(true);
      setLive(true);
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("aino:request-contact-mount", onRequestMount);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("aino:request-contact-mount", onRequestMount);
    };
  }, [anchorId]);

  useEffect(() => {
    if (queued) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setQueued(true);
          scheduleIdleTask(() => setLive(true), { timeout: anchorId === "contact" ? 600 : 2400, gapMs: 96 });
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [queued, rootMargin]);

  const reserveSpace = !live;

  return (
    <div
      ref={ref}
      id={anchorId}
      style={{
        minHeight: reserveSpace ? minHeight : undefined,
        scrollMarginTop: "24px",
        contentVisibility: live ? "visible" : "auto",
      }}
    >
      {live ? children : null}
    </div>
  );
}
