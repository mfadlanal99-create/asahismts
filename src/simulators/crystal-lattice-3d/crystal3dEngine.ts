import {
  type AtomSiteRole,
  type CrystalDefectMode,
  type CrystalLatticeSpec,
  type LatticeAtomSpec,
  type MillerPlaneId,
} from './crystalLatticeData';

export type Vec3 = [number, number, number];

export interface CrystalCameraState {
  yaw: number;
  pitch: number;
  zoom: number;
  panX: number;
  panY: number;
}

export type CrystalDisplayMode =
  | 'ball-stick'
  | 'hard-sphere'
  | 'sliced-cell'
  | 'coordination';

export interface RenderCrystalOptions {
  lattice: CrystalLatticeSpec;
  bOverA: number;
  cOverA: number;
  alphaDeg: number;
  betaDeg: number;
  gammaDeg: number;
  displayMode: CrystalDisplayMode;
  atomRadiusScale: number;
  explodeFactor: number;
  showSupercell: boolean;
  showBonds: boolean;
  showAxes: boolean;
  showInterstitials: boolean;
  millerPlane: MillerPlaneId;
  customMiller?: { enabled: boolean; h: number; k: number; l: number };
  slipDirection?: { enabled: boolean; u: number; v: number; w: number };
  defectMode?: CrystalDefectMode;
  hoveredAtomId: string | null;
  selectedAtomId: string | null;
  isDark: boolean;
  primaryHex: string;
}

export interface RenderedAtomInfo {
  renderId: string;
  spec: LatticeAtomSpec;
  screenX: number;
  screenY: number;
  screenR: number;
  depth: number;
  modelPos: Vec3;
}

export interface RenderCrystalResult {
  atoms: RenderedAtomInfo[];
  hitTestAtom: (canvasX: number, canvasY: number) => RenderedAtomInfo | null;
  neighborCountForSelected: number;
}

interface CellBasisVectors {
  va: Vec3;
  vb: Vec3;
  vc: Vec3;
  center: Vec3;
}

function add3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scale3(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}

function dist3(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function computeCellBasis(
  bOverA: number,
  cOverA: number,
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number
): CellBasisVectors {
  const degToRad = Math.PI / 180;
  const alpha = alphaDeg * degToRad;
  const beta = betaDeg * degToRad;
  const gamma = gammaDeg * degToRad;

  const sinGamma = Math.max(0.15, Math.sin(gamma));
  const cosAlpha = Math.cos(alpha);
  const cosBeta = Math.cos(beta);
  const cosGamma = Math.cos(gamma);

  const a = 1;
  const b = bOverA;
  const c = cOverA;

  // Standard crystallographic Cartesian basis mapped so +c points up (screen -Y) and +a points right/forward
  const ax = a;
  const ay = 0;
  const az = 0;

  const bx = b * cosGamma;
  const by = b * sinGamma;
  const bz = 0;

  const cx = c * cosBeta;
  const cy = (c * (cosAlpha - cosBeta * cosGamma)) / sinGamma;
  const cz = Math.sqrt(Math.max(0.08, c * c - cx * cx - cy * cy));

  // Map crystallographic (X, Y, Z) -> Three/canvas model (X, -Z, Y) so +c points up in screen space
  const va: Vec3 = [ax, -az, ay];
  const vb: Vec3 = [bx, -bz, by];
  const vc: Vec3 = [cx, -cz, cy];

  const center: Vec3 = scale3(add3(add3(va, vb), vc), 0.5);
  return { va, vb, vc, center };
}

function fracToModelPos(
  u: number,
  v: number,
  w: number,
  basis: CellBasisVectors,
  cOverA: number,
  isHexPrismCoord?: boolean
): Vec3 {
  if (isHexPrismCoord) {
    // Hex prism uses normalized XY where circumradius R = 1, and w in [-0.5, 0.5] along vertical c axis
    return [u, -w * cOverA, v];
  }
  return sub3(
    add3(add3(scale3(basis.va, u), scale3(basis.vb, v)), scale3(basis.vc, w)),
    basis.center
  );
}

function rotateAndProject(
  p: Vec3,
  yaw: number,
  pitch: number,
  zoom: number,
  cx: number,
  cy: number,
  scalePx: number
): { sx: number; sy: number; depth: number; scale: number } {
  const cyaw = Math.cos(yaw);
  const syaw = Math.sin(yaw);
  const cpitch = Math.cos(pitch);
  const spitch = Math.sin(pitch);

  // Rotate around Y (yaw)
  const x1 = p[0] * cyaw + p[2] * syaw;
  const y1 = p[1];
  const z1 = -p[0] * syaw + p[2] * cyaw;

  // Rotate around X (pitch)
  const x2 = x1;
  const y2 = y1 * cpitch - z1 * spitch;
  const z2 = y1 * spitch + z1 * cpitch;

  const camDist = 5.4;
  const persp = camDist / Math.max(1.2, camDist - z2);
  const f = scalePx * zoom * persp;

  return {
    sx: cx + x2 * f,
    sy: cy + y2 * f,
    depth: z2,
    scale: f,
  };
}

interface AtomPalette {
  lightTop: string;
  mid: string;
  dark: string;
  rim: string;
}

const ROLE_PALETTES: Record<AtomSiteRole, AtomPalette> = {
  corner: {
    lightTop: '#93c5fd',
    mid: '#2563eb',
    dark: '#1e3a8a',
    rim: '#dbeafe',
  },
  body: {
    lightTop: '#fde68a',
    mid: '#d97706',
    dark: '#78350f',
    rim: '#fef3c7',
  },
  face: {
    lightTop: '#6ee7b7',
    mid: '#059669',
    dark: '#064e3b',
    rim: '#d1fae5',
  },
  base: {
    lightTop: '#5eead4',
    mid: '#0d9488',
    dark: '#134e4a',
    rim: '#ccfbf1',
  },
  edge: {
    lightTop: '#f9a8d4',
    mid: '#db2777',
    dark: '#831843',
    rim: '#fce7f3',
  },
  interior: {
    lightTop: '#fca5a5',
    mid: '#dc2626',
    dark: '#7f1d1d',
    rim: '#fee2e2',
  },
  'species-b': {
    lightTop: '#fdba74',
    mid: '#ea580c',
    dark: '#7c2d12',
    rim: '#ffedd5',
  },
};

function drawAtomSphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  role: AtomSiteRole,
  opts: {
    isSelected: boolean;
    isHovered: boolean;
    isNeighborHighlight: boolean;
    dimmed: boolean;
    isGhostReplica: boolean;
    primaryHex: string;
    isDark: boolean;
  }
) {
  const pal = ROLE_PALETTES[role] ?? ROLE_PALETTES.corner;
  ctx.save();

  if (opts.dimmed) {
    ctx.globalAlpha = 0.25;
  } else if (opts.isGhostReplica) {
    ctx.globalAlpha = 0.72;
  }

  // Selection / Hover outer glow ring
  if (opts.isSelected || opts.isHovered || opts.isNeighborHighlight) {
    ctx.beginPath();
    ctx.arc(x, y, r + (opts.isSelected ? 5 : 3.5), 0, Math.PI * 2);
    ctx.strokeStyle = opts.isSelected
      ? opts.isDark
        ? '#facc15'
        : '#d97706'
      : opts.isNeighborHighlight
        ? '#38bdf8'
        : opts.primaryHex;
    ctx.lineWidth = opts.isSelected ? 2.6 : 1.8;
    ctx.stroke();
  }

  // 3D Sphere Gradient
  const grad = ctx.createRadialGradient(
    x - r * 0.34,
    y - r * 0.34,
    r * 0.08,
    x + r * 0.1,
    y + r * 0.1,
    r * 1.05
  );
  grad.addColorStop(0, pal.lightTop);
  grad.addColorStop(0.45, pal.mid);
  grad.addColorStop(1, pal.dark);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle crisp rim contour
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = opts.isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,23,42,0.22)';
  ctx.stroke();

  // Glossy specular highlight
  if (r > 6) {
    ctx.beginPath();
    ctx.ellipse(
      x - r * 0.32,
      y - r * 0.32,
      r * 0.24,
      r * 0.14,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
    ctx.fill();
  }

  ctx.restore();
}

function drawBondCylinder(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  radiusA: number,
  radiusB: number,
  highlighted: boolean,
  dimmed: boolean,
  isDark: boolean,
  emphasizePolyhedron: boolean
) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 1e-3) return;

  // Trim endpoints slightly inside atom spheres for clean depth transition
  const trimA = Math.min(len * 0.35, radiusA * 0.45);
  const trimB = Math.min(len * 0.35, radiusB * 0.45);
  const ux = dx / len;
  const uy = dy / len;
  const x0 = ax + ux * trimA;
  const y0 = ay + uy * trimA;
  const x1 = bx - ux * trimB;
  const y1 = by - uy * trimB;

  ctx.save();
  ctx.globalAlpha = dimmed ? 0.16 : highlighted ? 0.95 : emphasizePolyhedron ? 0.85 : 0.72;
  ctx.lineCap = 'round';

  // Outer shadow/casing stroke
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineWidth = highlighted ? 5.2 : emphasizePolyhedron ? 4.4 : 3.2;
  ctx.strokeStyle = highlighted
    ? '#38bdf8'
    : isDark
      ? 'rgba(148, 163, 184, 0.58)'
      : 'rgba(71, 85, 105, 0.48)';
  ctx.stroke();

  // Inner specular ridge
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineWidth = highlighted ? 2.1 : 1.3;
  ctx.strokeStyle = highlighted
    ? '#e0f2fe'
    : isDark
      ? 'rgba(226, 232, 240, 0.45)'
      : 'rgba(255, 255, 255, 0.65)';
  ctx.stroke();

  ctx.restore();
}

function getUnitCellEdges(
  lattice: CrystalLatticeSpec,
  basis: CellBasisVectors,
  cOverA: number
): { p0: Vec3; p1: Vec3 }[] {
  if (lattice.isFullHexPrism) {
    const edges: { p0: Vec3; p1: Vec3 }[] = [];
    const topRing: Vec3[] = [];
    const botRing: Vec3[] = [];
    for (let k = 0; k < 6; k++) {
      const th = (k * Math.PI) / 3;
      const x = Math.cos(th);
      const z = Math.sin(th);
      botRing.push([x, 0.5 * cOverA, z]);
      topRing.push([x, -0.5 * cOverA, z]);
    }
    for (let k = 0; k < 6; k++) {
      const next = (k + 1) % 6;
      edges.push({ p0: botRing[k], p1: botRing[next] });
      edges.push({ p0: topRing[k], p1: topRing[next] });
      edges.push({ p0: botRing[k], p1: topRing[k] });
    }
    return edges;
  }

  const corners: Vec3[] = [
    fracToModelPos(0, 0, 0, basis, cOverA),
    fracToModelPos(1, 0, 0, basis, cOverA),
    fracToModelPos(1, 1, 0, basis, cOverA),
    fracToModelPos(0, 1, 0, basis, cOverA),
    fracToModelPos(0, 0, 1, basis, cOverA),
    fracToModelPos(1, 0, 1, basis, cOverA),
    fracToModelPos(1, 1, 1, basis, cOverA),
    fracToModelPos(0, 1, 1, basis, cOverA),
  ];

  const pairs = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  return pairs.map(([i, j]) => ({ p0: corners[i], p1: corners[j] }));
}

function getMillerPlaneVertices(
  plane: MillerPlaneId,
  lattice: CrystalLatticeSpec,
  basis: CellBasisVectors,
  cOverA: number
): Vec3[] | null {
  if (plane === 'none') return null;

  if (lattice.isFullHexPrism) {
    if (plane === '0001' || plane === '100') {
      const ring: Vec3[] = [];
      for (let k = 0; k < 6; k++) {
        const th = (k * Math.PI) / 3;
        ring.push([Math.cos(th), 0, Math.sin(th)]);
      }
      return ring;
    }
    if (plane === '10-10' || plane === '110') {
      const th0 = 0;
      const th1 = Math.PI / 3;
      const x0 = Math.cos(th0);
      const z0 = Math.sin(th0);
      const x1 = Math.cos(th1);
      const z1 = Math.sin(th1);
      return [
        [x0, 0.5 * cOverA, z0],
        [x1, 0.5 * cOverA, z1],
        [x1, -0.5 * cOverA, z1],
        [x0, -0.5 * cOverA, z0],
      ];
    }
    // Diagonal slip plane across hex prism
    return [
      [1, 0.5 * cOverA, 0],
      [Math.cos(Math.PI / 3), 0.5 * cOverA, Math.sin(Math.PI / 3)],
      [Math.cos((4 * Math.PI) / 3), -0.5 * cOverA, Math.sin((4 * Math.PI) / 3)],
      [-1, -0.5 * cOverA, 0],
    ];
  }

  const pt = (u: number, v: number, w: number) =>
    fracToModelPos(u, v, w, basis, cOverA);

  if (plane === '100' || plane === '0001') {
    if (plane === '0001') {
      // Horizontal basal plane (001) / (0001) at w = 0.5
      return [pt(0, 0, 0.5), pt(1, 0, 0.5), pt(1, 1, 0.5), pt(0, 1, 0.5)];
    }
    // Front cube face x = 1
    return [pt(1, 0, 0), pt(1, 1, 0), pt(1, 1, 1), pt(1, 0, 1)];
  }
  if (plane === '110' || plane === '10-10') {
    return [pt(1, 0, 0), pt(0, 1, 0), pt(0, 1, 1), pt(1, 0, 1)];
  }
  if (plane === '111') {
    return [pt(1, 0, 0), pt(0, 1, 0), pt(0, 0, 1)];
  }
  return null;
}

function getCustomMillerPolygon(
  h: number,
  k: number,
  l: number,
  lattice: CrystalLatticeSpec,
  basis: CellBasisVectors,
  cOverA: number
): Vec3[] | null {
  if (h === 0 && k === 0 && l === 0) return null;

  if (lattice.isFullHexPrism) {
    if (h === 0 && k === 0) {
      const ring: Vec3[] = [];
      for (let m = 0; m < 6; m++) {
        const th = (m * Math.PI) / 3;
        ring.push([Math.cos(th), 0, Math.sin(th)]);
      }
      return ring;
    }
    const nx = h + 0.5 * k;
    const ny = k * 0.866;
    const nz = l / Math.max(0.8, cOverA);
    const len = Math.hypot(nx, ny, nz) || 1;
    const ux = nx / len;
    const uy = nz / len;
    const uz = ny / len;
    // Build rectangular prism cross-section perpendicular to (ux, uy, uz)
    const ref: Vec3 = Math.abs(uy) < 0.8 ? [0, 1, 0] : [1, 0, 0];
    const t1x = ref[1] * uz - ref[2] * uy;
    const t1y = ref[2] * ux - ref[0] * uz;
    const t1z = ref[0] * uy - ref[1] * ux;
    const l1 = Math.hypot(t1x, t1y, t1z) || 1;
    const t1: Vec3 = [(t1x / l1) * 0.9, (t1y / l1) * 0.9, (t1z / l1) * 0.9];
    const t2: Vec3 = [
      (uy * t1[2] - uz * t1[1]) * 0.9,
      (uz * t1[0] - ux * t1[2]) * 0.9,
      (ux * t1[1] - uy * t1[0]) * 0.9,
    ];
    return [
      add3(t1, t2),
      sub3(t1, t2),
      sub3(scale3(t1, -1), t2),
      add3(scale3(t1, -1), t2),
    ];
  }

  // Shift origin so negative Miller indices slice cleanly inside [0, 1]^3
  const u0 = h < 0 ? 1 : 0;
  const v0 = k < 0 ? 1 : 0;
  const w0 = l < 0 ? 1 : 0;
  const target = 1 + h * u0 + k * v0 + l * w0;

  const cubeCorners: [number, number, number][] = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1],
  ];
  const edgePairs: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  const evalPlane = (p: [number, number, number]) =>
    h * p[0] + k * p[1] + l * p[2] - target;

  const hits: [number, number, number][] = [];
  for (const [i, j] of edgePairs) {
    const a = cubeCorners[i];
    const b = cubeCorners[j];
    const fa = evalPlane(a);
    const fb = evalPlane(b);
    if (Math.abs(fa) < 1e-5 && Math.abs(fb) < 1e-5) {
      hits.push(a, b);
      continue;
    }
    if ((fa <= 1e-5 && fb >= -1e-5) || (fa >= -1e-5 && fb <= 1e-5)) {
      const denom = fa - fb;
      if (Math.abs(denom) > 1e-6) {
        const t = fa / denom;
        if (t >= -1e-4 && t <= 1 + 1e-4) {
          hits.push([
            a[0] + t * (b[0] - a[0]),
            a[1] + t * (b[1] - a[1]),
            a[2] + t * (b[2] - a[2]),
          ]);
        }
      }
    }
  }

  // Deduplicate fractional points
  const uniqueHits: [number, number, number][] = [];
  for (const p of hits) {
    if (
      !uniqueHits.some(
        (q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 1e-3
      )
    ) {
      uniqueHits.push(p);
    }
  }
  if (uniqueHits.length < 3) return null;

  // Sort cyclically around centroid using fractional plane normal
  const cu = uniqueHits.reduce((s, p) => s + p[0], 0) / uniqueHits.length;
  const cv = uniqueHits.reduce((s, p) => s + p[1], 0) / uniqueHits.length;
  const cw = uniqueHits.reduce((s, p) => s + p[2], 0) / uniqueHits.length;
  const nLen = Math.hypot(h, k, l) || 1;
  const nn: [number, number, number] = [h / nLen, k / nLen, l / nLen];
  const ref: [number, number, number] = Math.abs(nn[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0];
  const e1: [number, number, number] = [
    ref[1] * nn[2] - ref[2] * nn[1],
    ref[2] * nn[0] - ref[0] * nn[2],
    ref[0] * nn[1] - ref[1] * nn[0],
  ];
  const l1 = Math.hypot(e1[0], e1[1], e1[2]) || 1;
  e1[0] /= l1;
  e1[1] /= l1;
  e1[2] /= l1;
  const e2: [number, number, number] = [
    nn[1] * e1[2] - nn[2] * e1[1],
    nn[2] * e1[0] - nn[0] * e1[2],
    nn[0] * e1[1] - nn[1] * e1[0],
  ];

  uniqueHits.sort((a, b) => {
    const da = [a[0] - cu, a[1] - cv, a[2] - cw];
    const db = [b[0] - cu, b[1] - cv, b[2] - cw];
    const angA = Math.atan2(
      da[0] * e2[0] + da[1] * e2[1] + da[2] * e2[2],
      da[0] * e1[0] + da[1] * e1[1] + da[2] * e1[2]
    );
    const angB = Math.atan2(
      db[0] * e2[0] + db[1] * e2[1] + db[2] * e2[2],
      db[0] * e1[0] + db[1] * e1[1] + db[2] * e1[2]
    );
    return angA - angB;
  });

  return uniqueHits.map(([uu, vv, ww]) =>
    fracToModelPos(uu, vv, ww, basis, cOverA)
  );
}

function computeConvexHull2D(pts: [number, number][]): [number, number][] {
  if (pts.length <= 3) return pts;
  const sorted = [...pts].sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function getUnitCellBoundaryVertices(
  lattice: CrystalLatticeSpec,
  basis: CellBasisVectors,
  cOverA: number
): Vec3[] {
  if (lattice.isFullHexPrism) {
    const pts: Vec3[] = [];
    for (let k = 0; k < 6; k++) {
      const th = (k * Math.PI) / 3;
      const x = Math.cos(th);
      const z = Math.sin(th);
      pts.push([x, 0.5 * cOverA, z]);
      pts.push([x, -0.5 * cOverA, z]);
    }
    return pts;
  }
  return [
    fracToModelPos(0, 0, 0, basis, cOverA),
    fracToModelPos(1, 0, 0, basis, cOverA),
    fracToModelPos(1, 1, 0, basis, cOverA),
    fracToModelPos(0, 1, 0, basis, cOverA),
    fracToModelPos(0, 0, 1, basis, cOverA),
    fracToModelPos(1, 0, 1, basis, cOverA),
    fracToModelPos(1, 1, 1, basis, cOverA),
    fracToModelPos(0, 1, 1, basis, cOverA),
  ];
}

function pickDefectTargetAtomId(
  atoms: { renderId: string; spec: LatticeAtomSpec; isReplica: boolean }[]
): string | null {
  const prim = atoms.filter((a) => !a.isReplica);
  const byRole = (role: AtomSiteRole) => prim.find((a) => a.spec.role === role);
  const pick =
    byRole('body') ??
    byRole('interior') ??
    byRole('face') ??
    byRole('base') ??
    prim.find((a) => a.renderId === 'c111') ??
    prim[0];
  return pick ? pick.renderId : null;
}

export function renderCrystalScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CrystalCameraState,
  opts: RenderCrystalOptions
): RenderCrystalResult {
  const { lattice, bOverA, cOverA, alphaDeg, betaDeg, gammaDeg } = opts;

  // Clean Material You / CAD studio backdrop
  const bgGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.44,
    20,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.78
  );
  if (opts.isDark) {
    bgGrad.addColorStop(0, '#182132');
    bgGrad.addColorStop(1, '#0b101b');
  } else {
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(1, '#e6eef8');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle blueprint dot grid
  ctx.save();
  ctx.fillStyle = opts.isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(51, 65, 85, 0.12)';
  const gridStep = 28;
  for (let gx = (width % gridStep) * 0.5; gx < width; gx += gridStep) {
    for (let gy = (height % gridStep) * 0.5; gy < height; gy += gridStep) {
      ctx.fillRect(gx, gy, 1.2, 1.2);
    }
  }
  ctx.restore();

  const basis = computeCellBasis(bOverA, cOverA, alphaDeg, betaDeg, gammaDeg);
  const spherePad =
    opts.displayMode === 'hard-sphere' || opts.displayMode === 'sliced-cell'
      ? 0.72
      : 0.36;
  const maxSpan =
    Math.max(
      lattice.isFullHexPrism ? 2.15 : 1.15,
      bOverA,
      cOverA,
      opts.showSupercell ? (lattice.isFullHexPrism ? 3.6 : 2.25) : 1.25
    ) + spherePad;
  const scalePx = (Math.min(width, height) * 0.42) / maxSpan;
  const cx = width * 0.5 + camera.panX;
  const cy = height * 0.5 + camera.panY;

  const project = (p: Vec3) =>
    rotateAndProject(p, camera.yaw, camera.pitch, camera.zoom, cx, cy, scalePx);

  // --- 1. Build Atom Instances (with 2x2x2 Supercell replication & deduplication) ---
  interface ExpandedAtom {
    renderId: string;
    spec: LatticeAtomSpec;
    modelPos: Vec3;
    baseRadiusModel: number;
    isReplica: boolean;
  }

  const expanded: ExpandedAtom[] = [];

  const offsets: [number, number, number, boolean][] = [];
  if (!opts.showSupercell) {
    offsets.push([0, 0, 0, false]);
  } else if (lattice.isFullHexPrism) {
    // 2x1x2 / 3-column planar hex cluster centered symmetrically
    const hexShifts: [number, number][] = [
      [0, 0],
      [1.5, Math.sqrt(3) / 2],
      [1.5, -Math.sqrt(3) / 2],
    ];
    for (let iz = 0; iz <= 1; iz++) {
      for (let hi = 0; hi < hexShifts.length; hi++) {
        const [dx, dz] = hexShifts[hi];
        const isOrig = hi === 0 && iz === 0;
        offsets.push([dx - 0.65, dz, iz - 0.5, !isOrig]);
      }
    }
  } else {
    for (let ix = 0; ix < 2; ix++) {
      for (let iy = 0; iy < 2; iy++) {
        for (let iz = 0; iz < 2; iz++) {
          offsets.push([ix - 0.5, iy - 0.5, iz - 0.5, !(ix === 0 && iy === 0 && iz === 0)]);
        }
      }
    }
  }

  for (let oi = 0; oi < offsets.length; oi++) {
    const [du, dv, dw, isReplica] = offsets[oi];
    for (const atom of lattice.atoms) {
      let rawPos: Vec3;
      if (lattice.isFullHexPrism) {
        rawPos = fracToModelPos(
          atom.u + du,
          atom.v + dv,
          atom.w + dw,
          basis,
          cOverA,
          true
        );
      } else {
        rawPos = fracToModelPos(
          atom.u + du,
          atom.v + dv,
          atom.w + dw,
          basis,
          cOverA,
          false
        );
      }

      // Apply subtle outward explosion along vector from assembly center
      const explodedPos: Vec3 =
        opts.explodeFactor > 0.001
          ? add3(rawPos, scale3(rawPos, opts.explodeFactor * 0.42))
          : rawPos;

      // Deduplicate shared corner / face / basal atoms in supercell
      let isDuplicate = false;
      for (let k = 0; k < expanded.length; k++) {
        if (dist3(expanded[k].modelPos, explodedPos) < 0.045) {
          if (expanded[k].isReplica && !isReplica) {
            expanded[k].renderId = atom.id;
            expanded[k].spec = atom;
            expanded[k].isReplica = false;
          }
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;

      const spScale = atom.speciesIndex === 2 && lattice.secondSpeciesScale
        ? lattice.secondSpeciesScale
        : 1;
      const isPackingRadius =
        opts.displayMode === 'hard-sphere' || opts.displayMode === 'sliced-cell';
      const baseR =
        (isPackingRadius
          ? lattice.canonicalSphereRadius
          : lattice.canonicalBallRadius * (opts.displayMode === 'coordination' ? 0.84 : 1)) *
        spScale *
        opts.atomRadiusScale;

      expanded.push({
        renderId: isReplica ? `${atom.id}__rep${oi}` : atom.id,
        spec: atom,
        modelPos: explodedPos,
        baseRadiusModel: baseR,
        isReplica,
      });
    }
  }

  // --- 2. Compute Nearest-Neighbor Bonds & Selected Atom Neighbors ---
  interface BondLink {
    aIdx: number;
    bIdx: number;
    highlighted: boolean;
  }
  const bonds: BondLink[] = [];
  const selectedNeighborIds = new Set<string>();

  const dynamicCutoff =
    lattice.bondCutoff *
    Math.max(1, cOverA / Math.max(1, lattice.defaultCOverA), bOverA / Math.max(1, lattice.defaultBOverA)) *
    (1 + opts.explodeFactor * 0.42);

  if (opts.showBonds || opts.selectedAtomId) {
    for (let i = 0; i < expanded.length; i++) {
      for (let j = i + 1; j < expanded.length; j++) {
        const a = expanded[i];
        const b = expanded[j];
        // For NaCl B1 and CsCl B2 compound lattices, emphasize A-B hetero bonds first
        if (lattice.id === 'nacl' || lattice.id === 'cscl') {
          if (a.spec.speciesIndex === b.spec.speciesIndex) continue;
        }
        const d = dist3(a.modelPos, b.modelPos);
        if (d > 0.06 && d <= dynamicCutoff) {
          const involvesSel =
            opts.selectedAtomId !== null &&
            (a.renderId === opts.selectedAtomId || b.renderId === opts.selectedAtomId);
          if (involvesSel) {
            selectedNeighborIds.add(a.renderId);
            selectedNeighborIds.add(b.renderId);
          }
          if (opts.showBonds) {
            bonds.push({ aIdx: i, bIdx: j, highlighted: involvesSel });
          }
        }
      }
    }
  }

  // --- 3. Draw Unit Cell Wireframe Edges ---
  const unitEdges = getUnitCellEdges(lattice, basis, cOverA);
  ctx.save();
  ctx.strokeStyle = opts.isDark
    ? 'rgba(148, 163, 184, 0.36)'
    : 'rgba(51, 65, 85, 0.34)';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 3]);
  for (const edge of unitEdges) {
    const p0 = project(edge.p0);
    const p1 = project(edge.p1);
    ctx.beginPath();
    ctx.moveTo(p0.sx, p0.sy);
    ctx.lineTo(p1.sx, p1.sy);
    ctx.stroke();
  }
  ctx.restore();

  // --- 4. Draw Translucent Miller Index Plane Overlay (Custom hkl or Preset) ---
  const useCustomPlane = Boolean(opts.customMiller?.enabled);
  const planeVerts = useCustomPlane && opts.customMiller
    ? getCustomMillerPolygon(
        opts.customMiller.h,
        opts.customMiller.k,
        opts.customMiller.l,
        lattice,
        basis,
        cOverA
      )
    : getMillerPlaneVertices(opts.millerPlane, lattice, basis, cOverA);

  if (planeVerts && planeVerts.length >= 3) {
    const projPlane = planeVerts.map(project);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(projPlane[0].sx, projPlane[0].sy);
    for (let k = 1; k < projPlane.length; k++) {
      ctx.lineTo(projPlane[k].sx, projPlane[k].sy);
    }
    ctx.closePath();
    ctx.fillStyle = opts.isDark
      ? 'rgba(56, 189, 248, 0.24)'
      : 'rgba(37, 99, 235, 0.18)';
    ctx.fill();
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = opts.isDark ? '#7dd3fc' : '#2563eb';
    ctx.stroke();

    // Label plane at centroid
    const avgX = projPlane.reduce((s, p) => s + p.sx, 0) / projPlane.length;
    const avgY = projPlane.reduce((s, p) => s + p.sy, 0) / projPlane.length;
    ctx.font = '700 11px "Google Sans Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelText =
      useCustomPlane && opts.customMiller
        ? lattice.system === 'hexagonal'
          ? `(${opts.customMiller.h} ${opts.customMiller.k} ${-(opts.customMiller.h + opts.customMiller.k)} ${opts.customMiller.l})`
          : `(${opts.customMiller.h} ${opts.customMiller.k} ${opts.customMiller.l})`
        : `(${opts.millerPlane === '10-10' ? '101̄0' : opts.millerPlane})`;
    const tw = ctx.measureText(labelText).width;
    ctx.fillStyle = opts.isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(avgX - tw * 0.5 - 7, avgY - 10, tw + 14, 20, 999);
    ctx.fill();
    ctx.fillStyle = opts.isDark ? '#7dd3fc' : '#1d4ed8';
    ctx.fillText(labelText, avgX, avgY + 0.5);
    ctx.restore();
  }

  // --- 4b. Draw Slip Direction Vector [u v w] ---
  if (
    opts.slipDirection?.enabled &&
    (opts.slipDirection.u !== 0 ||
      opts.slipDirection.v !== 0 ||
      opts.slipDirection.w !== 0)
  ) {
    const su = opts.slipDirection.u;
    const sv = opts.slipDirection.v;
    const sw = opts.slipDirection.w;
    const oU = su < 0 ? 0.85 : 0.15;
    const oV = sv < 0 ? 0.85 : 0.15;
    const oW = sw < 0 ? 0.85 : 0.15;
    const maxC = Math.max(Math.abs(su), Math.abs(sv), Math.abs(sw), 1);
    const span = 0.7 / maxC;
    const pStart3 = lattice.isFullHexPrism
      ? ([0, 0, 0] as Vec3)
      : fracToModelPos(oU, oV, oW, basis, cOverA);
    const pEnd3 = lattice.isFullHexPrism
      ? ([
          (su / maxC) * 0.8,
          -(sw / maxC) * 0.65 * cOverA,
          (sv / maxC) * 0.8,
        ] as Vec3)
      : fracToModelPos(
          oU + su * span,
          oV + sv * span,
          oW + sw * span,
          basis,
          cOverA
        );
    const ps = project(pStart3);
    const pe = project(pEnd3);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ps.sx, ps.sy);
    ctx.lineTo(pe.sx, pe.sy);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.0;
    ctx.stroke();

    const ang = Math.atan2(pe.sy - ps.sy, pe.sx - ps.sx);
    ctx.beginPath();
    ctx.moveTo(pe.sx, pe.sy);
    ctx.lineTo(pe.sx - 10 * Math.cos(ang - 0.38), pe.sy - 10 * Math.sin(ang - 0.38));
    ctx.lineTo(pe.sx - 10 * Math.cos(ang + 0.38), pe.sy - 10 * Math.sin(ang + 0.38));
    ctx.closePath();
    ctx.fillStyle = '#10b981';
    ctx.fill();

    ctx.font = '800 11px "Google Sans Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const dirTxt = `[${su} ${sv} ${sw}]`;
    const dw = ctx.measureText(dirTxt).width;
    const lx = pe.sx + 16 * Math.cos(ang);
    const ly = pe.sy + 16 * Math.sin(ang);
    ctx.fillStyle = opts.isDark ? 'rgba(6, 78, 59, 0.9)' : 'rgba(209, 250, 229, 0.95)';
    ctx.beginPath();
    ctx.roundRect(lx - dw * 0.5 - 6, ly - 9, dw + 12, 18, 999);
    ctx.fill();
    ctx.fillStyle = opts.isDark ? '#6ee7b7' : '#065f46';
    ctx.fillText(dirTxt, lx, ly + 0.5);
    ctx.restore();
  }

  // --- 5. Draw Crystallographic Basis Vectors (a, b, c) ---
  if (opts.showAxes) {
    const origin = lattice.isFullHexPrism
      ? ([0, 0.5 * cOverA, 0] as Vec3)
      : fracToModelPos(0, 0, 0, basis, cOverA);
    const axisSpecs: { end: Vec3; color: string; label: string }[] = lattice.isFullHexPrism
      ? [
          { end: [1.22, 0.5 * cOverA, 0], color: '#ef4444', label: 'a₁' },
          { end: [-0.61, 0.5 * cOverA, 1.06], color: '#10b981', label: 'a₂' },
          { end: [0, -0.68 * cOverA, 0], color: '#3b82f6', label: 'c' },
        ]
      : [
          { end: add3(origin, scale3(basis.va, 1.18)), color: '#ef4444', label: 'a' },
          { end: add3(origin, scale3(basis.vb, 1.18)), color: '#10b981', label: 'b' },
          { end: add3(origin, scale3(basis.vc, 1.18)), color: '#3b82f6', label: 'c' },
        ];

    const pOrig = project(origin);
    for (const ax of axisSpecs) {
      const pEnd = project(ax.end);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pOrig.sx, pOrig.sy);
      ctx.lineTo(pEnd.sx, pEnd.sy);
      ctx.strokeStyle = ax.color;
      ctx.lineWidth = 2.1;
      ctx.stroke();

      // Arrowhead
      const ang = Math.atan2(pEnd.sy - pOrig.sy, pEnd.sx - pOrig.sx);
      ctx.beginPath();
      ctx.moveTo(pEnd.sx, pEnd.sy);
      ctx.lineTo(
        pEnd.sx - 8 * Math.cos(ang - 0.4),
        pEnd.sy - 8 * Math.sin(ang - 0.4)
      );
      ctx.lineTo(
        pEnd.sx - 8 * Math.cos(ang + 0.4),
        pEnd.sy - 8 * Math.sin(ang + 0.4)
      );
      ctx.closePath();
      ctx.fillStyle = ax.color;
      ctx.fill();

      ctx.font = '800 12px "Google Sans Mono", monospace';
      ctx.fillStyle = ax.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        ax.label,
        pEnd.sx + 11 * Math.cos(ang),
        pEnd.sy + 11 * Math.sin(ang)
      );
      ctx.restore();
    }
  }

  // --- 6. Project & Depth-Sort Bonds, Interstitials, and Atoms ---
  const projectedAtoms = expanded.map((item) => {
    const p = project(item.modelPos);
    const screenR = Math.max(4, item.baseRadiusModel * p.scale);
    return {
      ...item,
      sx: p.sx,
      sy: p.sy,
      depth: p.depth,
      screenR,
    };
  });

  type DrawOp =
    | { depth: number; kind: 'bond'; bond: BondLink }
    | {
        depth: number;
        kind: 'interstitial';
        sx: number;
        sy: number;
        voidKind: 'octahedral' | 'tetrahedral';
      }
    | { depth: number; kind: 'atom'; idx: number };

  const ops: DrawOp[] = [];

  for (const bond of bonds) {
    const pa = projectedAtoms[bond.aIdx];
    const pb = projectedAtoms[bond.bIdx];
    ops.push({
      depth: (pa.depth + pb.depth) * 0.5 - 0.02,
      kind: 'bond',
      bond,
    });
  }

  if (opts.showInterstitials && lattice.interstitials) {
    for (const iv of lattice.interstitials) {
      const mPos = fracToModelPos(
        iv.u,
        iv.v,
        iv.w,
        basis,
        cOverA,
        iv.isHexPrismCoord
      );
      const p = project(mPos);
      ops.push({
        depth: p.depth,
        kind: 'interstitial',
        sx: p.sx,
        sy: p.sy,
        voidKind: iv.kind,
      });
    }
  }

  for (let i = 0; i < projectedAtoms.length; i++) {
    ops.push({
      depth: projectedAtoms[i].depth,
      kind: 'atom',
      idx: i,
    });
  }

  // Painter's back-to-front depth sort (smaller z2 is farther back)
  ops.sort((a, b) => a.depth - b.depth);

  const anySelected = opts.selectedAtomId !== null;
  const emphasizePoly = opts.displayMode === 'coordination';
  const isSlicedCell = opts.displayMode === 'sliced-cell' && !opts.showSupercell;
  const defectMode = opts.defectMode ?? 'none';

  // Choose host target atom inside primary unit cell for vacancy / substitutional demos
  const defectTargetAtomId = pickDefectTargetAtomId(expanded);

  if (isSlicedCell) {
    const boundaryPts = getUnitCellBoundaryVertices(lattice, basis, cOverA).map((v) => {
      const p = project(v);
      return [p.sx, p.sy] as [number, number];
    });
    const hull = computeConvexHull2D(boundaryPts);
    if (hull.length >= 3) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(hull[0][0], hull[0][1]);
      for (let h = 1; h < hull.length; h++) {
        ctx.lineTo(hull[h][0], hull[h][1]);
      }
      ctx.closePath();
      ctx.clip();
    }
  }

  for (const op of ops) {
    if (op.kind === 'bond') {
      const a = projectedAtoms[op.bond.aIdx];
      const b = projectedAtoms[op.bond.bIdx];
      if (
        defectMode === 'vacancy' &&
        (a.renderId === defectTargetAtomId || b.renderId === defectTargetAtomId)
      ) {
        continue;
      }
      drawBondCylinder(
        ctx,
        a.sx,
        a.sy,
        b.sx,
        b.sy,
        a.screenR,
        b.screenR,
        op.bond.highlighted,
        anySelected && !op.bond.highlighted,
        opts.isDark,
        emphasizePoly
      );
    } else if (op.kind === 'interstitial') {
      ctx.save();
      const s = op.voidKind === 'octahedral' ? 9 : 7;
      ctx.translate(op.sx, op.sy);
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s, 0);
      ctx.closePath();
      ctx.fillStyle =
        op.voidKind === 'octahedral'
          ? 'rgba(244, 63, 94, 0.88)'
          : 'rgba(168, 85, 247, 0.88)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    } else {
      const a = projectedAtoms[op.idx];
      const isDefectTarget = a.renderId === defectTargetAtomId;

      if (defectMode === 'vacancy' && isDefectTarget) {
        // Draw dashed glowing Vacancy cage V[]
        ctx.save();
        ctx.beginPath();
        ctx.arc(a.sx, a.sy, a.screenR * 0.92, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.14)';
        ctx.fill();
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#f43f5e';
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '800 10px "Google Sans Mono", monospace';
        ctx.fillStyle = opts.isDark ? '#fda4af' : '#be123c';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('V□', a.sx, a.sy);
        ctx.restore();
        continue;
      }

      const isSelected = a.renderId === opts.selectedAtomId;
      const isHovered = a.renderId === opts.hoveredAtomId;
      const isNeighbor =
        anySelected && !isSelected && selectedNeighborIds.has(a.renderId);
      const dimmed = anySelected && !isSelected && !isNeighbor;

      if (defectMode === 'substitutional' && isDefectTarget) {
        const subR = a.screenR * 1.32;
        ctx.save();
        const subGrad = ctx.createRadialGradient(
          a.sx - subR * 0.3,
          a.sy - subR * 0.3,
          subR * 0.1,
          a.sx,
          a.sy,
          subR
        );
        subGrad.addColorStop(0, '#f5d0fe');
        subGrad.addColorStop(0.5, '#c026d3');
        subGrad.addColorStop(1, '#581c87');
        ctx.beginPath();
        ctx.arc(a.sx, a.sy, subR, 0, Math.PI * 2);
        ctx.fillStyle = subGrad;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fae8ff';
        ctx.stroke();
        ctx.font = '800 10px "Google Sans Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S+', a.sx, a.sy);
        ctx.restore();
        continue;
      }

      drawAtomSphere(ctx, a.sx, a.sy, a.screenR, a.spec.role, {
        isSelected,
        isHovered,
        isNeighborHighlight: isNeighbor,
        dimmed,
        isGhostReplica: a.isReplica,
        primaryHex: opts.primaryHex,
        isDark: opts.isDark,
      });
    }
  }

  if (isSlicedCell) {
    ctx.restore(); // End unit cell clip
    // Re-stroke crisp unit cell cut boundary frame on top of sliced spheres
    ctx.save();
    ctx.strokeStyle = opts.isDark
      ? 'rgba(226, 232, 240, 0.72)'
      : 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 1.8;
    for (const edge of unitEdges) {
      const p0 = project(edge.p0);
      const p1 = project(edge.p1);
      ctx.beginPath();
      ctx.moveTo(p0.sx, p0.sy);
      ctx.lineTo(p1.sx, p1.sy);
      ctx.stroke();
    }
    ctx.restore();

    // Draw fractional occupancy weight pills on visible atoms inside unit cell
    ctx.save();
    ctx.font = '800 9px "Google Sans Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const a of projectedAtoms) {
      if (a.isReplica) continue;
      const lbl = a.spec.cellWeightLabel;
      const bw = ctx.measureText(lbl).width + 8;
      ctx.fillStyle = opts.isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(a.sx - bw * 0.5, a.sy - 7, bw, 14, 999);
      ctx.fill();
      ctx.fillStyle = opts.isDark ? '#f8fafc' : '#0f172a';
      ctx.fillText(lbl, a.sx, a.sy + 0.5);
    }
    ctx.restore();
  }

  // --- 7. Draw Interstitial Carbon / Dislocation Core Defect Overlays ---
  if (defectMode === 'interstitial-c') {
    const cModel = lattice.isFullHexPrism
      ? ([0.34, -0.25 * cOverA, 0.2] as Vec3)
      : lattice.id === 'bcc' || lattice.id === 'bct' || lattice.id === 'bco'
        ? fracToModelPos(0.5, 0.5, 0.0, basis, cOverA)
        : fracToModelPos(0.5, 0.5, 0.5, basis, cOverA);
    const pc = project(cModel);
    const cTop = project(add3(cModel, [0, -0.26, 0]));
    const cBot = project(add3(cModel, [0, 0.26, 0]));

    ctx.save();
    // Tetragonal dipole strain arrows along +/- c
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(pc.sx, pc.sy);
    ctx.lineTo(cTop.sx, cTop.sy);
    ctx.moveTo(pc.sx, pc.sy);
    ctx.lineTo(cBot.sx, cBot.sy);
    ctx.stroke();

    const rC = Math.max(8, 0.095 * pc.scale);
    const cg = ctx.createRadialGradient(
      pc.sx - rC * 0.3,
      pc.sy - rC * 0.3,
      rC * 0.1,
      pc.sx,
      pc.sy,
      rC
    );
    cg.addColorStop(0, '#fca5a5');
    cg.addColorStop(0.5, '#dc2626');
    cg.addColorStop(1, '#450a0a');
    ctx.beginPath();
    ctx.arc(pc.sx, pc.sy, rC, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#fef2f2';
    ctx.stroke();
    ctx.font = '800 9px "Google Sans Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', pc.sx, pc.sy + 0.5);
    ctx.restore();
  } else if (defectMode === 'dislocation') {
    const corePos = lattice.isFullHexPrism
      ? ([0, 0, 0] as Vec3)
      : fracToModelPos(0.5, 0.5, 0.5, basis, cOverA);
    const topPos = lattice.isFullHexPrism
      ? ([0, -0.5 * cOverA, 0] as Vec3)
      : fracToModelPos(0.5, 0.5, 1.05, basis, cOverA);
    const bEnd = lattice.isFullHexPrism
      ? ([0.55, 0, 0] as Vec3)
      : fracToModelPos(0.95, 0.5, 0.5, basis, cOverA);

    const pCore = project(corePos);
    const pTop = project(topPos);
    const pB = project(bEnd);

    ctx.save();
    // Extra half-plane wedged downward
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(pTop.sx, pTop.sy);
    ctx.lineTo(pCore.sx, pCore.sy);
    ctx.stroke();

    // Dislocation core circle & inverted-T symbol ⊥
    ctx.beginPath();
    ctx.arc(pCore.sx, pCore.sy, 11, 0, Math.PI * 2);
    ctx.fillStyle = opts.isDark ? 'rgba(120, 53, 15, 0.92)' : 'rgba(254, 243, 199, 0.95)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.font = '900 13px "Google Sans Mono", monospace';
    ctx.fillStyle = opts.isDark ? '#fde68a' : '#92400e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⊥', pCore.sx, pCore.sy + 0.5);

    // Burgers vector b arrow
    ctx.beginPath();
    ctx.moveTo(pCore.sx + 12, pCore.sy);
    ctx.lineTo(pB.sx, pB.sy);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    const bang = Math.atan2(pB.sy - pCore.sy, pB.sx - pCore.sx);
    ctx.beginPath();
    ctx.moveTo(pB.sx, pB.sy);
    ctx.lineTo(pB.sx - 9 * Math.cos(bang - 0.4), pB.sy - 9 * Math.sin(bang - 0.4));
    ctx.lineTo(pB.sx - 9 * Math.cos(bang + 0.4), pB.sy - 9 * Math.sin(bang + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#ec4899';
    ctx.fill();

    ctx.font = '800 11px "Google Sans Mono", monospace';
    ctx.fillStyle = '#ec4899';
    ctx.fillText('b', pB.sx + 10 * Math.cos(bang), pB.sy + 10 * Math.sin(bang));
    ctx.restore();
  }

  // Front-to-back ordered RenderedAtomInfo list for hit testing
  const renderedAtoms: RenderedAtomInfo[] = projectedAtoms
    .map((a) => ({
      renderId: a.renderId,
      spec: a.spec,
      screenX: a.sx,
      screenY: a.sy,
      screenR: a.screenR,
      depth: a.depth,
      modelPos: a.modelPos,
    }))
    .sort((a, b) => b.depth - a.depth);

  return {
    atoms: renderedAtoms,
    neighborCountForSelected: opts.selectedAtomId
      ? Math.max(0, selectedNeighborIds.size - 1)
      : 0,
    hitTestAtom: (canvasX: number, canvasY: number) => {
      for (const atom of renderedAtoms) {
        const d = Math.hypot(canvasX - atom.screenX, canvasY - atom.screenY);
        if (d <= Math.max(10, atom.screenR + 3)) {
          return atom;
        }
      }
      return null;
    },
  };
}
