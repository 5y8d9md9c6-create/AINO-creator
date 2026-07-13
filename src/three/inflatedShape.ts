import * as THREE from "three";

export type Pt = [number, number];

interface InflateOptions {
  /** how far each edge bows outward, as a fraction of that edge's length */
  bulge?: number;
  /** corner rounding radius in local units */
  radius?: number;
  /** per-corner radius override, indexed same as points */
  radii?: number[];
  /** per-edge bulge override, indexed by the starting point of the edge */
  bulges?: number[];
}

/**
 * Traces a polygon whose corners are rounded and whose edges bow outward
 * slightly onto any THREE.Path-like target (THREE.Shape for outlines,
 * THREE.Path for holes), producing the soft "inflated" silhouette used by
 * every letter limb in the AINO wordmark.
 */
export function traceInflatedOutline(target: THREE.Path, points: Pt[], opts: InflateOptions = {}) {
  const bulge = opts.bulge ?? 0.16;
  const radius = opts.radius ?? 0.05;
  const n = points.length;
  const pts = points.map(([x, y]) => new THREE.Vector2(x, y));

  const A: THREE.Vector2[] = [];
  const B: THREE.Vector2[] = [];

  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const r = opts.radii?.[i] ?? radius;

    const toPrev = prev.clone().sub(curr);
    const toNext = next.clone().sub(curr);
    const rPrev = Math.min(r, toPrev.length() * 0.42);
    const rNext = Math.min(r, toNext.length() * 0.42);

    A.push(curr.clone().add(toPrev.clone().normalize().multiplyScalar(rPrev)));
    B.push(curr.clone().add(toNext.clone().normalize().multiplyScalar(rNext)));
  }

  target.moveTo(B[n - 1].x, B[n - 1].y);

  for (let i = 0; i < n; i++) {
    const bStart = B[(i - 1 + n) % n];
    const aEnd = A[i];
    const edgeBulge = opts.bulges?.[(i - 1 + n) % n] ?? bulge;

    const dir = aEnd.clone().sub(bStart);
    const len = dir.length();
    const mid = bStart.clone().add(aEnd).multiplyScalar(0.5);

    if (len > 1e-6 && edgeBulge !== 0) {
      const normal = new THREE.Vector2(dir.y, -dir.x).normalize();
      const control = mid.add(normal.multiplyScalar(len * edgeBulge));
      target.quadraticCurveTo(control.x, control.y, aEnd.x, aEnd.y);
    } else {
      target.lineTo(aEnd.x, aEnd.y);
    }

    target.quadraticCurveTo(pts[i].x, pts[i].y, B[i].x, B[i].y);
  }
}

export function buildInflatedShape(points: Pt[], opts: InflateOptions = {}): THREE.Shape {
  const shape = new THREE.Shape();
  traceInflatedOutline(shape, points, opts);
  return shape;
}

export function buildInflatedHole(points: Pt[], opts: InflateOptions = {}): THREE.Path {
  const path = new THREE.Path();
  traceInflatedOutline(path, points, opts);
  return path;
}

interface BarOptions extends InflateOptions {
  width: number;
}

/**
 * Returns the 4 corner points of a rectangular "bar" running from a to b,
 * ready to be fed into buildInflatedShape.
 */
export function barPoints(a: Pt, b: Pt, width: number): Pt[] {
  const av = new THREE.Vector2(a[0], a[1]);
  const bv = new THREE.Vector2(b[0], b[1]);
  const dir = bv.clone().sub(av).normalize();
  const perp = new THREE.Vector2(-dir.y, dir.x).multiplyScalar(width / 2);
  const p1 = av.clone().add(perp);
  const p2 = bv.clone().add(perp);
  const p3 = bv.clone().sub(perp);
  const p4 = av.clone().sub(perp);
  return [
    [p1.x, p1.y],
    [p2.x, p2.y],
    [p3.x, p3.y],
    [p4.x, p4.y],
  ];
}

export function buildBar(a: Pt, b: Pt, opts: BarOptions): THREE.Shape {
  const pts = barPoints(a, b, opts.width);
  return buildInflatedShape(pts, opts);
}

export function buildRing(outerR: number, innerR: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

export function extrudeInflated(shape: THREE.Shape, depth: number, bevelRatio = 0.5, segments = 14): THREE.ExtrudeGeometry {
  const bevelThickness = depth * bevelRatio;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevelThickness * 2,
    bevelEnabled: true,
    bevelThickness,
    bevelSize: bevelThickness * 0.92,
    bevelSegments: segments,
    bevelOffset: 0,
    curveSegments: 24,
    steps: 1,
  });
  geo.translate(0, 0, -(depth - bevelThickness * 2) / 2 - bevelThickness);
  geo.computeVertexNormals();
  return geo;
}
