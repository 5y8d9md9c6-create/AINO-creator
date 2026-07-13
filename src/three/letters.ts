import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildBar, buildInflatedHole, buildInflatedShape, buildRing, extrudeInflated, type Pt } from "./inflatedShape";

export type LetterId = "A" | "I" | "N" | "O";

const DEPTH = 0.6;
const BEVEL_RATIO = 0.5;
const BULGE = 0.18;
const RADIUS = 0.16;

function shapeToGeo(shape: THREE.Shape) {
  return extrudeInflated(shape, DEPTH, BEVEL_RATIO, 28);
}

function letterI(): THREE.BufferGeometry {
  const bar = buildBar([0, -0.68], [0, 0.68], { width: 0.42, bulge: BULGE, radius: 0.2 });
  return shapeToGeo(bar);
}

function letterN(): THREE.BufferGeometry {
  const leftLeg = buildBar([-0.36, -0.68], [-0.36, 0.68], { width: 0.32, bulge: BULGE, radius: RADIUS });
  const rightLeg = buildBar([0.36, -0.68], [0.36, 0.68], { width: 0.32, bulge: BULGE, radius: RADIUS });
  const diagonal = buildBar([-0.4, 0.66], [0.4, -0.66], { width: 0.34, bulge: BULGE, radius: RADIUS });
  const geos = [leftLeg, rightLeg, diagonal].map(shapeToGeo);
  return mergeGeometries(geos) as THREE.BufferGeometry;
}

function letterA(): THREE.BufferGeometry {
  // A single continuous silhouette (outer boundary trace clockwise) with one
  // enclosed hole for the counter. The leg-gap at the bottom is a concave
  // notch in the outer boundary rather than a hole, since it opens onto the
  // exterior background below the letter.
  const outer: Pt[] = [
    [-0.17, 0.68], // apex cap, left
    [0.17, 0.68], // apex cap, right
    [0.56, -0.58], // right outer edge
    [0.63, -0.7], // right foot outer-bottom
    [0.29, -0.76], // right foot inner-bottom
    [0.25, 0.02], // right leg inner edge, up to crossbar underside
    [-0.25, 0.02], // crossbar underside, straight across
    [-0.29, -0.76], // left leg inner edge, down to foot
    [-0.63, -0.7], // left foot inner-bottom
    [-0.56, -0.58], // left foot outer-bottom
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

export function buildLetterGeometry(id: LetterId): THREE.BufferGeometry {
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

// silence unused-type warning in strict builds while keeping the export for callers
export type { Pt };
