import * as THREE from "three";
import { buildBar, buildInflatedHole, buildInflatedShape, buildRing, extrudeInflated, type Pt } from "./inflatedShape";

export type LetterId = "A" | "I" | "N" | "O";
export type LetterGeometry = THREE.BufferGeometry | THREE.BufferGeometry[];

const DEPTH = 0.6;
const BEVEL_RATIO = 0.5;
const BULGE = 0.18;
const RADIUS = 0.16;
const EXTRUDE_SEGMENTS = 14;

const geometryCache = new Map<LetterId, LetterGeometry>();

function shapeToGeo(shape: THREE.Shape) {
  return extrudeInflated(shape, DEPTH, BEVEL_RATIO, EXTRUDE_SEGMENTS);
}

function letterI(): THREE.BufferGeometry {
  const bar = buildBar([0, -0.68], [0, 0.68], { width: 0.42, bulge: BULGE, radius: 0.2 });
  return shapeToGeo(bar);
}

function letterN(): THREE.BufferGeometry[] {
  const leftLeg = shapeToGeo(
    buildBar([-0.36, -0.68], [-0.36, 0.68], { width: 0.3, bulge: BULGE, radius: RADIUS }),
  );
  const rightLeg = shapeToGeo(
    buildBar([0.36, -0.68], [0.36, 0.68], { width: 0.3, bulge: BULGE, radius: RADIUS }),
  );
  const diagonal = shapeToGeo(
    buildBar([-0.34, 0.62], [0.34, -0.62], { width: 0.24, bulge: BULGE * 0.85, radius: RADIUS * 0.9 }),
  );
  return [leftLeg, rightLeg, diagonal];
}

function letterA(): THREE.BufferGeometry {
  const outer: Pt[] = [
    [-0.17, 0.68],
    [0.17, 0.68],
    [0.56, -0.58],
    [0.63, -0.7],
    [0.29, -0.76],
    [0.25, 0.02],
    [-0.25, 0.02],
    [-0.29, -0.76],
    [-0.63, -0.7],
    [-0.56, -0.58],
  ];
  const outerRadii = [0.22, 0.22, 0.1, 0.16, 0.16, 0.1, 0.1, 0.16, 0.16, 0.1];
  const outerBulges = [0.32, 0.05, 0.03, 0.08, 0.06, -0.14, 0.06, 0.08, 0.03, 0.05];

  const shape = buildInflatedShape(outer, { radius: 0.14, bulge: 0.1, radii: outerRadii, bulges: outerBulges });

  const hole: Pt[] = [
    [0.22, 0.14],
    [0, 0.5],
    [-0.22, 0.14],
  ];
  shape.holes.push(buildInflatedHole(hole, { radius: 0.13, bulge: 0.12, radii: [0.1, 0.2, 0.1] }));

  return shapeToGeo(shape);
}

function letterO(): THREE.BufferGeometry {
  const ring = buildRing(0.7, 0.4);
  return shapeToGeo(ring);
}

function buildLetterGeometry(id: LetterId): LetterGeometry {
  switch (id) {
    case "I":
      return letterI();
    case "N":
      return letterN();
    case "A":
      return letterA();
    case "O":
      return letterO();
  }
}

export function getLetterGeometry(id: LetterId): LetterGeometry {
  const cached = geometryCache.get(id);
  if (cached) return cached;
  const geometry = buildLetterGeometry(id);
  geometryCache.set(id, geometry);
  return geometry;
}

export const LETTER_WIDTHS: Record<LetterId, number> = {
  A: 1.28,
  I: 0.42,
  N: 1.0,
  O: 1.4,
};

export const LETTER_ORDER: LetterId[] = ["A", "I", "N", "O"];

export function computeLayout(gap = 0.13): { id: LetterId; x: number }[] {
  const widths = LETTER_ORDER.map((id) => LETTER_WIDTHS[id]);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
  let cursor = -total / 2;
  const layout: { id: LetterId; x: number }[] = [];
  LETTER_ORDER.forEach((id, i) => {
    const w = widths[i];
    layout.push({ id, x: cursor + w / 2 });
    cursor += w + gap;
  });
  return layout;
}

export type { Pt };
