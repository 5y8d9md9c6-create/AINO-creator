import { useCallback, useEffect, useRef, useState } from "react";
import "./ShyScrollbar.css";

const TRACK_INSET = 10;
const TRACK_WIDTH = 12;
const THUMB_MIN = 44;
const FLEE_MIN = 8;
const FLEE_MAX = 16;
const FLEE_MS = 250;
const FLEE_COOLDOWN = 380;
const MAX_FLEES = 3;
const PROXIMITY_X = 56;
const PROXIMITY_Y_PAD = 28;
const ZONE_WIDTH = 72;

type SquashPhase = "idle" | "squash" | "bounce";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ShyScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [visible, setVisible] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(THUMB_MIN);
  const [trackHeight, setTrackHeight] = useState(0);

  const [fleeX, setFleeX] = useState(0);
  const [surrendered, setSurrendered] = useState(false);
  const [squashPhase, setSquashPhase] = useState<SquashPhase>("idle");
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canFlee, setCanFlee] = useState(false);

  const fleeCountRef = useRef(0);
  const fleeTimerRef = useRef<number | null>(null);
  const fleeLockedRef = useRef(false);
  const bounceTimerRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const draggingRef = useRef(false);
  const surrenderedRef = useRef(false);
  const metricsRef = useRef({ scrollTop: 0, scrollMax: 0, trackHeight: 0, thumbHeight: THUMB_MIN });

  const updateMetrics = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const scrollable = scrollHeight - clientHeight > 1;

    setVisible(scrollable);

    if (!scrollable) return;

    const nextTrackHeight = Math.max(clientHeight - TRACK_INSET * 2, THUMB_MIN + 24);
    const ratio = clientHeight / scrollHeight;
    const nextThumbHeight = clamp(Math.round(nextTrackHeight * ratio), THUMB_MIN, nextTrackHeight - 8);
    const maxThumbTop = nextTrackHeight - nextThumbHeight;
    const scrollRatio = scrollMaxSafe(scrollTop, scrollHeight - clientHeight);
    const nextThumbTop = scrollRatio * maxThumbTop;

    metricsRef.current = {
      scrollTop,
      scrollMax: scrollHeight - clientHeight,
      trackHeight: nextTrackHeight,
      thumbHeight: nextThumbHeight,
    };

    setTrackHeight(nextTrackHeight);
    setThumbHeight(nextThumbHeight);
    if (!draggingRef.current) {
      setThumbTop(nextThumbTop);
    }
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fleeQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const applyMotion = () => setReducedMotion(motionQuery.matches);
    const applyFlee = () => setCanFlee(fleeQuery.matches);

    applyMotion();
    applyFlee();
    motionQuery.addEventListener("change", applyMotion);
    fleeQuery.addEventListener("change", applyFlee);

    updateMetrics();
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateMetrics);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateMetrics);

    return () => {
      motionQuery.removeEventListener("change", applyMotion);
      fleeQuery.removeEventListener("change", applyFlee);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateMetrics);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (fleeTimerRef.current) window.clearTimeout(fleeTimerRef.current);
      if (bounceTimerRef.current) window.clearTimeout(bounceTimerRef.current);
    };
  }, [updateMetrics]);

  const resetFleeState = useCallback(() => {
    fleeCountRef.current = 0;
    fleeLockedRef.current = false;
    surrenderedRef.current = false;
    setSurrendered(false);
    setFleeX(0);
  }, []);

  const triggerFlee = useCallback(
    (pointerX: number, thumbCenterX: number) => {
      if (draggingRef.current || surrenderedRef.current || reducedMotion || !canFlee) return;

      fleeCountRef.current += 1;

      if (fleeCountRef.current >= MAX_FLEES) {
        surrenderedRef.current = true;
        setSurrendered(true);
        setFleeX(0);
        return;
      }

      const amount = FLEE_MIN + Math.random() * (FLEE_MAX - FLEE_MIN);
      const jitter = (Math.random() - 0.5) * 4;
      const fleeDirection = pointerX <= thumbCenterX ? -1 : 1;
      setFleeX(fleeDirection * amount + jitter);

      if (fleeTimerRef.current) window.clearTimeout(fleeTimerRef.current);
      fleeTimerRef.current = window.setTimeout(() => {
        if (!surrenderedRef.current) setFleeX(0);
      }, FLEE_MS + 40);
    },
    [canFlee, reducedMotion],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!visible) return;

      const { clientX, clientY } = event;
      const inZone = clientX >= window.innerWidth - ZONE_WIDTH;

      if (!inZone) {
        if (!draggingRef.current) resetFleeState();
        return;
      }

      if (draggingRef.current) {
        const trackRect = trackRef.current?.getBoundingClientRect();
        if (!trackRect) return;

        const { trackHeight: tHeight, thumbHeight: tThumb, scrollMax } = metricsRef.current;
        const maxThumbTop = tHeight - tThumb;
        const pointerY = clientY - trackRect.top - dragOffsetRef.current;
        const ratio = clamp(pointerY / maxThumbTop, 0, 1);
        const nextTop = ratio * maxThumbTop;

        setThumbTop(nextTop);
        window.scrollTo({ top: ratio * scrollMax, behavior: "auto" });
        return;
      }

      const trackRect = trackRef.current?.getBoundingClientRect();
      if (!trackRect) return;

      const thumbCenterY = trackRect.top + thumbTop + thumbHeight / 2;
      const thumbCenterX = trackRect.right - TRACK_WIDTH / 2 + fleeX;
      const nearX = clientX >= thumbCenterX - PROXIMITY_X && clientX <= window.innerWidth + 8;
      const nearY = Math.abs(clientY - thumbCenterY) <= thumbHeight / 2 + PROXIMITY_Y_PAD;

      if (nearX && nearY && !fleeLockedRef.current) {
        fleeLockedRef.current = true;
        triggerFlee(clientX, thumbCenterX);
        window.setTimeout(() => {
          fleeLockedRef.current = false;
        }, FLEE_COOLDOWN);
      }
    },
    [resetFleeState, thumbHeight, thumbTop, triggerFlee, visible],
  );

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [handlePointerMove]);

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);

    if (!reducedMotion) {
      setSquashPhase("bounce");
      if (bounceTimerRef.current) window.clearTimeout(bounceTimerRef.current);
      bounceTimerRef.current = window.setTimeout(() => setSquashPhase("idle"), 360);
    } else {
      setSquashPhase("idle");
    }

    updateMetrics();
  }, [reducedMotion, updateMetrics]);

  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [endDrag]);

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    draggingRef.current = true;
    setDragging(true);
    setFleeX(0);
    surrenderedRef.current = true;
    setSurrendered(true);

    const trackRect = trackRef.current.getBoundingClientRect();
    dragOffsetRef.current = event.clientY - trackRect.top - thumbTop;

    if (!reducedMotion) setSquashPhase("squash");
  };

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || event.target !== trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const { trackHeight: tHeight, thumbHeight: tThumb, scrollMax } = metricsRef.current;
    const maxThumbTop = tHeight - tThumb;
    const clickY = event.clientY - trackRect.top - tThumb / 2;
    const ratio = clamp(clickY / maxThumbTop, 0, 1);

    window.scrollTo({
      top: ratio * scrollMax,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  if (!visible) return null;

  const scaleX = squashPhase === "squash" ? 1.08 : squashPhase === "bounce" ? 0.94 : 1;
  const scaleY = squashPhase === "squash" ? 0.9 : squashPhase === "bounce" ? 1.06 : 1;

  return (
    <div className="shy-scroll" aria-hidden="true">
      <div
        ref={trackRef}
        className="shy-scroll__track"
        style={{ height: trackHeight }}
        onPointerDown={handleTrackPointerDown}
      >
        <div
          className={[
            "shy-scroll__thumb",
            dragging ? "shy-scroll__thumb--dragging" : "",
            surrendered ? "shy-scroll__thumb--surrendered" : "",
            fleeX !== 0 ? "shy-scroll__thumb--fleeing" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            height: thumbHeight,
            top: thumbTop,
            transform: `translateX(${fleeX}px) scale(${scaleX}, ${scaleY})`,
          }}
          onPointerDown={handleThumbPointerDown}
        >
          <span className="shy-scroll__face" aria-hidden="true">
            <span
              className="shy-scroll__eye shy-scroll__eye--left"
              style={{ transform: fleeX < 0 ? "translateX(-1px)" : fleeX > 0 ? "translateX(1px)" : undefined }}
            />
            <span
              className="shy-scroll__eye shy-scroll__eye--right"
              style={{ transform: fleeX < 0 ? "translateX(-1px)" : fleeX > 0 ? "translateX(1px)" : undefined }}
            />
          </span>
          {surrendered && !dragging ? <span className="shy-scroll__blush" aria-hidden="true" /> : null}
        </div>
      </div>
    </div>
  );
}

function scrollMaxSafe(scrollTop: number, scrollMax: number) {
  if (scrollMax <= 0) return 0;
  return clamp(scrollTop / scrollMax, 0, 1);
}
