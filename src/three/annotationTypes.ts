/**
 * Lightweight, Three.js-free types shared between the (lazy-loaded) 3D scene
 * and the plain DOM annotation overlay, so importing them doesn't force the
 * heavy AinoScene/Three.js bundle to load eagerly.
 */
export type AnchorKey = "A" | "I" | "N" | "O";

/** Local (unscaled, per-letter) anchor offsets that the 2D annotation labels
 * track, expressed in each anchor's own local 3D space. */
export const ANCHOR_OFFSETS: Record<AnchorKey, [number, number, number]> = {
  A: [-0.3, 1.02, 0.32],
  I: [0, 1.1, 0.32],
  N: [0.02, 1.02, 0.32],
  O: [0.3, 1.08, 0.32],
};

export interface ScreenPos {
  x: number;
  y: number;
}

export type AnnotationPositions = Record<AnchorKey, ScreenPos | null>;

export function createAnnotationPositions(): AnnotationPositions {
  return { A: null, I: null, N: null, O: null };
}
