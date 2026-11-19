import {
  addBoltRing,
  addBox,
  addCylinderSection,
  compileMesh,
  type EdgeDef,
  type PartMesh,
  type RawFaceDef,
  type Vec3,
} from './cad3dEngine';

// ---------------------------------------------------------------------------
// Blueprint-Grade Parametric CAD Geometry Helpers (matches cad3dEngine.ts)
// ---------------------------------------------------------------------------

function addCylinderY(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  y0: number,
  y1: number,
  rOut0: number,
  rOut1: number,
  rIn0: number,
  rIn1: number,
  segments: number,
  opts?: {
    cx?: number;
    cz?: number;
    colorHex?: string;
    isHousingShell?: boolean;
    addRimEdges?: boolean;
    capBottom?: boolean;
    capTop?: boolean;
    thetaStart?: number;
    thetaEnd?: number;
  }
) {
  const cx = opts?.cx ?? 0;
  const cz = opts?.cz ?? 0;
  const colorHex = opts?.colorHex;
  const isHousingShell = opts?.isHousingShell;
  const addRimEdges = opts?.addRimEdges ?? true;
  const th0 = opts?.thetaStart ?? 0;
  const th1 = opts?.thetaEnd ?? Math.PI * 2;
  const isPartial = Math.abs(th1 - th0) < Math.PI * 1.99;

  for (let i = 0; i < segments; i++) {
    const a0 = th0 + (i / segments) * (th1 - th0);
    const a1 = th0 + ((i + 1) / segments) * (th1 - th0);
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);

    const o00: Vec3 = [cx + rOut0 * c0, y0, cz + rOut0 * s0];
    const o01: Vec3 = [cx + rOut0 * c1, y0, cz + rOut0 * s1];
    const o10: Vec3 = [cx + rOut1 * c0, y1, cz + rOut1 * s0];
    const o11: Vec3 = [cx + rOut1 * c1, y1, cz + rOut1 * s1];

    faces.push({
      verts: [o00, o10, o11, o01],
      colorHex,
      isHousingShell,
      cullBackface: !isPartial,
    });

    if (addRimEdges) {
      edges.push({ a: o00, b: o01, isHousingShell });
      edges.push({ a: o10, b: o11, isHousingShell });
    }

    if (rIn0 > 0 || rIn1 > 0) {
      const i00: Vec3 = [cx + rIn0 * c0, y0, cz + rIn0 * s0];
      const i01: Vec3 = [cx + rIn0 * c1, y0, cz + rIn0 * s1];
      const i10: Vec3 = [cx + rIn1 * c0, y1, cz + rIn1 * s0];
      const i11: Vec3 = [cx + rIn1 * c1, y1, cz + rIn1 * s1];

      faces.push({
        verts: [i00, i01, i11, i10],
        colorHex,
        isHousingShell,
        cullBackface: false,
      });
      if (opts?.capBottom !== false) {
        faces.push({
          verts: [o00, o01, i01, i00],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (opts?.capTop !== false) {
        faces.push({
          verts: [o10, i10, i11, o11],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (addRimEdges) {
        edges.push({ a: i00, b: i01, isHousingShell });
        edges.push({ a: i10, b: i11, isHousingShell });
      }
      if (isPartial && i === 0) {
        faces.push({
          verts: [o00, i00, i10, o10],
          colorHex,
          isHousingShell,
          cullBackface: false,
        });
        edges.push({ a: o00, b: o10, isHousingShell });
        edges.push({ a: i00, b: i10, isHousingShell });
      }
      if (isPartial && i === segments - 1) {
        faces.push({
          verts: [o01, o11, i11, i01],
          colorHex,
          isHousingShell,
          cullBackface: false,
        });
        edges.push({ a: o01, b: o11, isHousingShell });
        edges.push({ a: i01, b: i11, isHousingShell });
      }
    } else {
      if (opts?.capBottom !== false) {
        faces.push({
          verts: [[cx, y0, cz], o00, o01],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (opts?.capTop !== false) {
        faces.push({
          verts: [[cx, y1, cz], o11, o10],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
    }
  }
}

function addCylinderZ(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  z0: number,
  z1: number,
  rOut0: number,
  rOut1: number,
  rIn0: number,
  rIn1: number,
  segments: number,
  opts?: {
    cx?: number;
    cy?: number;
    colorHex?: string;
    isHousingShell?: boolean;
    addRimEdges?: boolean;
    capFront?: boolean;
    capBack?: boolean;
  }
) {
  const cx = opts?.cx ?? 0;
  const cy = opts?.cy ?? 0;
  const colorHex = opts?.colorHex;
  const isHousingShell = opts?.isHousingShell;
  const addRimEdges = opts?.addRimEdges ?? true;

  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);

    const o00: Vec3 = [cx + rOut0 * c0, cy + rOut0 * s0, z0];
    const o01: Vec3 = [cx + rOut0 * c1, cy + rOut0 * s1, z0];
    const o10: Vec3 = [cx + rOut1 * c0, cy + rOut1 * s0, z1];
    const o11: Vec3 = [cx + rOut1 * c1, cy + rOut1 * s1, z1];

    faces.push({
      verts: [o00, o01, o11, o10],
      colorHex,
      isHousingShell,
      cullBackface: true,
    });
    if (addRimEdges) {
      edges.push({ a: o00, b: o01, isHousingShell });
      edges.push({ a: o10, b: o11, isHousingShell });
    }

    if (rIn0 > 0 || rIn1 > 0) {
      const i00: Vec3 = [cx + rIn0 * c0, cy + rIn0 * s0, z0];
      const i01: Vec3 = [cx + rIn0 * c1, cy + rIn0 * s1, z0];
      const i10: Vec3 = [cx + rIn1 * c0, cy + rIn1 * s0, z1];
      const i11: Vec3 = [cx + rIn1 * c1, cy + rIn1 * s1, z1];

      faces.push({
        verts: [i00, i01, i11, i10],
        colorHex,
        isHousingShell,
        cullBackface: false,
      });
      if (opts?.capFront !== false) {
        faces.push({
          verts: [o00, i00, i01, o01],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (opts?.capBack !== false) {
        faces.push({
          verts: [o10, o11, i11, i10],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (addRimEdges) {
        edges.push({ a: i00, b: i01, isHousingShell });
        edges.push({ a: i10, b: i11, isHousingShell });
      }
    } else {
      if (opts?.capFront !== false) {
        faces.push({
          verts: [[cx, cy, z0], o01, o00],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (opts?.capBack !== false) {
        faces.push({
          verts: [[cx, cy, z1], o10, o11],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
    }
  }
}

function addCylinderCutX(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  rOut0: number,
  rOut1: number,
  rIn0: number,
  rIn1: number,
  segments: number,
  th0: number,
  th1: number,
  opts?: { colorHex?: string; isHousingShell?: boolean; cy?: number; cz?: number }
) {
  const colorHex = opts?.colorHex;
  const isHousingShell = opts?.isHousingShell;
  const cy = opts?.cy ?? 0;
  const cz = opts?.cz ?? 0;
  const isPartial = Math.abs(th1 - th0) < Math.PI * 1.99;

  for (let i = 0; i < segments; i++) {
    const a0 = th0 + (i / segments) * (th1 - th0);
    const a1 = th0 + ((i + 1) / segments) * (th1 - th0);
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);

    const o00: Vec3 = [x0, cy + rOut0 * c0, cz + rOut0 * s0];
    const o01: Vec3 = [x0, cy + rOut0 * c1, cz + rOut0 * s1];
    const o10: Vec3 = [x1, cy + rOut1 * c0, cz + rOut1 * s0];
    const o11: Vec3 = [x1, cy + rOut1 * c1, cz + rOut1 * s1];

    faces.push({ verts: [o00, o01, o11, o10], colorHex, isHousingShell, cullBackface: false });
    edges.push({ a: o00, b: o01, isHousingShell });
    edges.push({ a: o10, b: o11, isHousingShell });

    if (rIn0 > 0 || rIn1 > 0) {
      const i00: Vec3 = [x0, cy + rIn0 * c0, cz + rIn0 * s0];
      const i01: Vec3 = [x0, cy + rIn0 * c1, cz + rIn0 * s1];
      const i10: Vec3 = [x1, cy + rIn1 * c0, cz + rIn1 * s0];
      const i11: Vec3 = [x1, cy + rIn1 * c1, cz + rIn1 * s1];

      faces.push({ verts: [i00, i10, i11, i01], colorHex, isHousingShell, cullBackface: false });
      faces.push({ verts: [o00, i00, i01, o01], colorHex, isHousingShell, cullBackface: false });
      faces.push({ verts: [o10, o11, i11, i10], colorHex, isHousingShell, cullBackface: false });
      edges.push({ a: i00, b: i01, isHousingShell });
      edges.push({ a: i10, b: i11, isHousingShell });

      if (isPartial && i === 0) {
        faces.push({ verts: [o00, o10, i10, i00], colorHex, isHousingShell, cullBackface: false });
        edges.push({ a: o00, b: o10, isHousingShell });
        edges.push({ a: i00, b: i10, isHousingShell });
      }
      if (isPartial && i === segments - 1) {
        faces.push({ verts: [o01, i01, i11, o11], colorHex, isHousingShell, cullBackface: false });
        edges.push({ a: o01, b: o11, isHousingShell });
        edges.push({ a: i01, b: i11, isHousingShell });
      }
    }
  }
}

function addSphereAt(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  cx: number,
  cy: number,
  cz: number,
  r: number,
  colorHex: string
) {
  const rings = 3;
  const sectors = 6;
  for (let i = 0; i < rings; i++) {
    const phi0 = (i / rings) * Math.PI;
    const phi1 = ((i + 1) / rings) * Math.PI;
    for (let j = 0; j < sectors; j++) {
      const th0 = (j / sectors) * Math.PI * 2;
      const th1 = ((j + 1) / sectors) * Math.PI * 2;
      const p = (phi: number, th: number): Vec3 => [
        cx + r * Math.sin(phi) * Math.cos(th),
        cy + r * Math.cos(phi),
        cz + r * Math.sin(phi) * Math.sin(th),
      ];
      const v00 = p(phi0, th0);
      const v01 = p(phi0, th1);
      const v10 = p(phi1, th0);
      const v11 = p(phi1, th1);
      faces.push({ verts: [v00, v10, v11, v01], colorHex, cullBackface: false });
      if (i === 1) edges.push({ a: v00, b: v01 });
    }
  }
}

/**
 * Radial longitudinal cooling fin strip along X at polar angle around Y-Z circle.
 */
function addRadialFinX(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  rBase: number,
  rTip: number,
  halfThick: number,
  angle: number,
  colorHex: string,
  isHousingShell: boolean
) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const nx = -sa * halfThick;
  const nz = ca * halfThick;

  const p = (x: number, r: number, side: number): Vec3 => [x, r * ca + side * nx, r * sa + side * nz];
  const b0L = p(x0, rBase, -1);
  const b0R = p(x0, rBase, 1);
  const t0L = p(x0, rTip, -1);
  const t0R = p(x0, rTip, 1);
  const b1L = p(x1, rBase, -1);
  const b1R = p(x1, rBase, 1);
  const t1L = p(x1, rTip, -1);
  const t1R = p(x1, rTip, 1);

  faces.push({ verts: [t0L, t0R, t1R, t1L], colorHex, isHousingShell, cullBackface: false });
  faces.push({ verts: [b0L, t0L, t1L, b1L], colorHex, isHousingShell, cullBackface: false });
  faces.push({ verts: [t0R, b0R, b1R, t1R], colorHex, isHousingShell, cullBackface: false });
  faces.push({ verts: [b0L, b0R, t0R, t0L], colorHex, isHousingShell, cullBackface: false });
  faces.push({ verts: [b1L, t1L, t1R, b1R], colorHex, isHousingShell, cullBackface: false });
  edges.push({ a: t0L, b: t1L, isHousingShell });
  edges.push({ a: t0R, b: t1R, isHousingShell });
}

/**
 * Precision 3D helical gear with trapezoidal teeth, recessed web, hub boss & radial ribs around Z axis.
 */
function addHelicalGearZ(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  z0: number,
  z1: number,
  rBore: number,
  rHub: number,
  rRimIn: number,
  rRoot: number,
  rTip: number,
  teeth: number,
  helixTwistRad: number,
  rimColor: string,
  toothColor: string,
  webColor: string,
  spokes?: number
) {
  // Rim cylinder
  addCylinderZ(faces, edges, z0, z1, rRoot, rRoot, rRimIn, rRimIn, teeth, {
    colorHex: rimColor,
    addRimEdges: true,
  });
  // Recessed web disk (thinner inside rim)
  const zMid = (z0 + z1) * 0.5;
  const webHalf = (z1 - z0) * 0.24;
  addCylinderZ(faces, edges, zMid - webHalf, zMid + webHalf, rRimIn + 0.4, rRimIn + 0.4, rHub - 0.5, rHub - 0.5, 16, {
    colorHex: webColor,
    addRimEdges: false,
  });
  // Hub collar
  addCylinderZ(faces, edges, z0 - 0.8, z1 + 0.8, rHub, rHub, rBore, rBore, 14, {
    colorHex: rimColor,
    addRimEdges: true,
  });

  // Raised strengthening spokes on both recessed faces
  if (spokes && spokes > 0) {
    const rA = rHub;
    const rB = rRimIn;
    for (let s = 0; s < spokes; s++) {
      const a = (s / spokes) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const nx = -sa * 1.4;
      const ny = ca * 1.4;
      const s0 = z0 + 0.5;
      const s1 = z1 - 0.5;
      const q = (r: number, side: number, z: number): Vec3 => [
        r * ca + side * nx,
        r * sa + side * ny,
        z,
      ];
      faces.push({
        verts: [q(rA, -1, s0), q(rB, -1, s0), q(rB, 1, s0), q(rA, 1, s0)],
        colorHex: rimColor,
        cullBackface: false,
      });
      faces.push({
        verts: [q(rA, -1, s1), q(rA, 1, s1), q(rB, 1, s1), q(rB, -1, s1)],
        colorHex: rimColor,
        cullBackface: false,
      });
    }
  }

  // Trapezoidal 3D helical gear teeth
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const mid = (i + 0.5) * step;
    const aB0 = mid - step * 0.34;
    const aT0 = mid - step * 0.15;
    const aT1 = mid + step * 0.15;
    const aB1 = mid + step * 0.34;

    const pt = (ang: number, r: number, z: number): Vec3 => [r * Math.cos(ang), r * Math.sin(ang), z];
    const b0F = pt(aB0, rRoot, z0);
    const t0F = pt(aT0, rTip, z0);
    const t1F = pt(aT1, rTip, z0);
    const b1F = pt(aB1, rRoot, z0);

    const b0B = pt(aB0 + helixTwistRad, rRoot, z1);
    const t0B = pt(aT0 + helixTwistRad, rTip, z1);
    const t1B = pt(aT1 + helixTwistRad, rTip, z1);
    const b1B = pt(aB1 + helixTwistRad, rRoot, z1);

    faces.push({ verts: [b0F, b1F, t1F, t0F], colorHex: toothColor, cullBackface: false });
    faces.push({ verts: [b0B, t0B, t1B, b1B], colorHex: toothColor, cullBackface: false });
    faces.push({ verts: [b0F, t0F, t0B, b0B], colorHex: toothColor, cullBackface: false });
    faces.push({ verts: [t0F, t1F, t1B, t0B], colorHex: toothColor, cullBackface: false });
    faces.push({ verts: [t1F, b1F, b1B, t1B], colorHex: toothColor, cullBackface: false });

    edges.push({ a: t0F, b: t0B });
    edges.push({ a: t1F, b: t1B });
    edges.push({ a: t0F, b: t1F });
    edges.push({ a: t0B, b: t1B });
  }
}

function addSemiCircleEccentricX(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  rIn: number,
  rOut: number,
  startAngle: number,
  sweepAngle: number,
  segments: number,
  colorHex: string,
  chamferColor?: string
) {
  for (let i = 0; i < segments; i++) {
    const a0 = startAngle + (i / segments) * sweepAngle;
    const a1 = startAngle + ((i + 1) / segments) * sweepAngle;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);

    const o00: Vec3 = [x0, rOut * c0, rOut * s0];
    const o01: Vec3 = [x0, rOut * c1, rOut * s1];
    const o10: Vec3 = [x1, rOut * c0, rOut * s0];
    const o11: Vec3 = [x1, rOut * c1, rOut * s1];

    const i00: Vec3 = [x0, rIn * c0, rIn * s0];
    const i01: Vec3 = [x0, rIn * c1, rIn * s1];
    const i10: Vec3 = [x1, rIn * c0, rIn * s0];
    const i11: Vec3 = [x1, rIn * c1, rIn * s1];

    faces.push({ verts: [o00, o01, o11, o10], colorHex: chamferColor ?? colorHex, cullBackface: false });
    faces.push({ verts: [i00, i10, i11, i01], colorHex, cullBackface: false });
    faces.push({ verts: [o00, i00, i01, o01], colorHex, cullBackface: false });
    faces.push({ verts: [o10, o11, i11, i10], colorHex, cullBackface: false });
    edges.push({ a: o00, b: o01 });
    edges.push({ a: o10, b: o11 });

    if (i === 0) {
      faces.push({ verts: [i00, o00, o10, i10], colorHex, cullBackface: false });
      edges.push({ a: i00, b: o00 });
      edges.push({ a: i10, b: o10 });
    }
    if (i === segments - 1) {
      faces.push({ verts: [o01, i01, i11, o11], colorHex, cullBackface: false });
      edges.push({ a: o01, b: i01 });
      edges.push({ a: o11, b: i11 });
    }
  }
}

// ============================================================================
// 1. HELICAL 2-STAGE PARALLEL-SHAFT GEARBOX REDUCER (Flender H2SH Style)
// ============================================================================

function buildGbUpperHousing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Stepped upper cast hood over input (-46), intermediate (-8), bull gear (+36)
  // Centered around x = -6..+8, y = 0..+36, z = -23..+23
  addBox(faces, edges, -6, 14, 0, 62, 13, 21, baseHex, true);
  // Domed bull-gear & stage-2 crown cover (higher arch over bull gear x = +2..+68)
  addBox(faces, edges, 30, 29, 0, 34, 6, 21, '#2B4C7E', true);
  // Split-line perimeter bolt flange at y = +1.5
  addBox(faces, edges, -4, 1.5, 0, 72, 1.6, 26, '#334155', true);

  // Upper bearing saddle boss blocks strictly above y = 0 split line along front (+Z) & rear (-Z)
  for (const sx of [-46, -8, 36]) {
    const hw = sx === 36 ? 13 : sx === -8 ? 11 : 9.5;
    addBox(faces, edges, sx, 6.2, 22.8, hw, 4.2, 1.8, '#334155', true);
    addBox(faces, edges, sx, 6.2, -22.8, hw, 4.2, 1.8, '#334155', true);
  }

  // External vertical casting stiffening ribs & cooling fins along front & rear
  for (const rx of [-58, -30, -22, 12, 56]) {
    addBox(faces, edges, rx, 14, 22, 1.4, 11, 1.4, '#475569', true);
    addBox(faces, edges, rx, 14, -22, 1.4, 11, 1.4, '#475569', true);
  }

  // Top bolted oval inspection hatch cover + brass oil breather/dipstick assembly
  addBox(faces, edges, -28, 28, 0, 16, 1.8, 12, '#64748b', true);
  for (const [bx, bz] of [
    [-40, -9],
    [-16, -9],
    [-40, 9],
    [-16, 9],
  ]) {
    addCylinderY(faces, edges, 29.8, 31.5, 1.5, 1.5, 0, 0, 6, { cx: bx, cz: bz, colorHex: '#CBD5E1' });
  }
  // Brass breather valve with cap on top of bull crown
  addCylinderY(faces, edges, 35, 41, 4.2, 4.2, 0, 0, 10, { cx: 30, cz: 0, colorHex: '#D97706' });
  addCylinderY(faces, edges, 41, 43.5, 5.5, 5.5, 0, 0, 10, { cx: 30, cz: 0, colorHex: '#F59E0B' });

  // Heavy cast lifting eye lugs at both ends
  for (const lx of [-62, 62]) {
    addBox(faces, edges, lx, 30, 0, 3.2, 4.5, 3.5, '#64748B', true);
    addCylinderZ(faces, edges, -3.8, 3.8, 2.2, 2.2, 0, 0, 8, { cx: lx, cy: 32, colorHex: '#0F172A' });
  }

  return compileMesh(faces, edges, [30, 42, 0], baseHex);
}

function buildGbLowerSumpBase(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Heavy lower cast sump tub (y = -30..0) — remains open top to reveal shafts when upper cover lifts
  // Back wall (-Z = -22), left wall (-66), right wall (+74), floor (-30), front lower tub wall (+Z = +22)
  addBox(faces, edges, 4, -29.5, 0, 70, 2.0, 23, '#1E293B', true);
  addBox(faces, edges, -65, -15, 0, 2.2, 15, 22, baseHex, true);
  addBox(faces, edges, 71, -15, 0, 2.2, 15, 22, baseHex, true);
  addBox(faces, edges, 3, -15, -22, 69, 15, 2.2, baseHex, true);
  // Front wall (+Z = +22): lower tub bay up to y = -8 + lower bearing arch bosses strictly below y = 0
  addBox(faces, edges, 3, -19, 22, 69, 11, 2.2, baseHex, true);
  for (const sx of [-46, -8, 36]) {
    const hw = sx === 36 ? 13 : sx === -8 ? 11 : 9.5;
    addBox(faces, edges, sx, -6.2, 22.8, hw, 4.2, 1.8, '#334155', true);
    addBox(faces, edges, sx, -6.2, -22.8, hw, 4.2, 1.8, '#334155', true);
  }

  // Horizontal split-line bolting flange at y = -1.5 with perimeter hex bolts
  addBox(faces, edges, 3, -1.2, -24.5, 72, 1.4, 2.8, '#334155', true);
  addBox(faces, edges, -68, -1.2, 0, 3.0, 1.4, 25, '#334155', true);
  addBox(faces, edges, 74, -1.2, 0, 3.0, 1.4, 25, '#334155', true);
  for (let bx = -60; bx <= 68; bx += 22) {
    addCylinderY(faces, edges, 0, 2.2, 1.7, 1.7, 0, 0, 6, { cx: bx, cz: -24.5, colorHex: '#CBD5E1' });
  }

  // Deep sump vertical structural ribs & 4 anchor-bolted mounting feet at y = -34
  for (const fx of [-60, 66]) {
    for (const fz of [-26, 26]) {
      addBox(faces, edges, fx, -31.5, fz, 9.5, 2.5, 5.5, '#0F172A', true);
      addCylinderY(faces, edges, -29, -25.5, 2.8, 2.8, 0, 0, 6, {
        cx: fx,
        cz: fz,
        colorHex: '#E2E8F0',
        isHousingShell: true,
      });
    }
  }
  for (const rx of [-58, -28, -4, 18, 56]) {
    addBox(faces, edges, rx, -19, 24.4, 1.5, 10, 1.2, '#475569', true);
    addBox(faces, edges, rx, -15, -24.4, 1.5, 13, 1.2, '#475569', true);
  }

  return compileMesh(faces, edges, [-60, -28, 26], baseHex);
}

function buildGbInputPinion(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Z-axis high-speed input shaft protruding out front (+Z) toward viewer, centered at basePosition [-46, 0, 0]
  addCylinderZ(faces, edges, -22, 50, 5.2, 5.2, 0, 0, 14, { colorHex: '#CBD5E1' });
  // Journal shoulders
  addCylinderZ(faces, edges, -18, 22, 6.8, 6.8, 0, 0, 14, { colorHex: '#94A3B8' });
  // Stage-1 integral helical pinion (z = -15..-2, rRoot = 10.5, rTip = 13.5, 13 teeth)
  addHelicalGearZ(faces, edges, -15, -2, 5.2, 7.6, 8.2, 10.2, 13.2, 13, 0.26, '#475569', baseHex, '#334155');
  // Input shaft DIN 6885 key & brass coupling key
  addBox(faces, edges, 0, 5.3, 39, 1.3, 1.2, 9, '#F59E0B');
  return compileMesh(faces, edges, [0, 8, 42], baseHex);
}

function buildGbIntermediateShaft(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Z-axis layshaft at basePosition [-8, 0, 0], mesh-coupled between pinion (-46) and bull gear (+36)
  addCylinderZ(faces, edges, -22, 22, 6.2, 6.2, 0, 0, 14, { colorHex: '#CBD5E1' });
  // Stage-1 Driven Helical Gear (meshes with pinion at z = -15..-2, rPitch ≈ 25.5)
  addHelicalGearZ(faces, edges, -15, -2, 6.2, 10, 18.5, 24.0, 27.0, 24, -0.24, '#38BDF8', baseHex, '#1E293B', 5);
  // Stage-2 Helical Pinion (meshes with bull gear at z = +3..+16, rPitch ≈ 11.2)
  addHelicalGearZ(faces, edges, 3, 16, 6.2, 8.5, 8.5, 9.8, 12.8, 13, 0.26, '#F59E0B', '#FCD34D', '#B45309');
  return compileMesh(faces, edges, [0, 26, -8], baseHex);
}

function buildGbBullGearOutput(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Heavy Stage-2 Bull Gear + Ø75mm output shaft protruding both front & back at basePosition [+36, 0, 0]
  addCylinderZ(faces, edges, -54, 52, 8.5, 8.5, 0, 0, 16, { colorHex: '#E2E8F0' });
  addCylinderZ(faces, edges, -52, -30, 9.6, 9.6, 8.5, 8.5, 16, { colorHex: '#64748B' });
  addBox(faces, edges, 0, 9.8, -42, 1.8, 1.4, 9, '#F59E0B');
  addBox(faces, edges, 0, 8.7, 40, 1.8, 1.4, 9, '#F59E0B');
  // Stage-2 Helical Bull Gear (z = +3..+16, rRoot = 30.5, rTip = 33.8, 28 teeth, 6 radial stiffening ribs)
  addHelicalGearZ(faces, edges, 3, 16, 8.5, 13.5, 24.5, 30.2, 33.6, 28, -0.22, '#64748B', baseHex, '#334155', 6);
  return compileMesh(faces, edges, [0, 16, -42], baseHex);
}

function buildGbTaperedBearings(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  const shaftSpecs: Array<[number, number, number]> = [
    [-46, 5.4, 10.5],
    [-8, 6.4, 12.0],
    [36, 8.6, 14.5],
  ];
  for (const [sx, rIn, rOut] of shaftSpecs) {
    for (const bz of [-20.5, 20.5]) {
      // Outer cup & inner cone rings
      addCylinderZ(faces, edges, bz - 2.6, bz + 2.6, rOut, rOut, rOut - 1.8, rOut - 1.8, 14, {
        cx: sx,
        cy: 0,
        colorHex: '#64748B',
      });
      addCylinderZ(faces, edges, bz - 2.6, bz + 2.6, rIn + 1.8, rIn + 1.8, rIn, rIn, 14, {
        cx: sx,
        cy: 0,
        colorHex: '#CBD5E1',
      });
      // Brass tapered roller cage ring
      addCylinderZ(faces, edges, bz - 2.0, bz + 2.0, rOut - 2.0, rOut - 2.0, rIn + 2.0, rIn + 2.0, 12, {
        cx: sx,
        cy: 0,
        colorHex: baseHex,
        addRimEdges: false,
      });
    }
  }
  return compileMesh(faces, edges, [-46, 11, 21], baseHex);
}

function buildGbLipSeals(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Input shaft Viton seal + bolted cast cap at (-46, 0, +25)
  addCylinderZ(faces, edges, 24.5, 27.5, 11.8, 11.8, 5.4, 5.4, 14, {
    cx: -46,
    cy: 0,
    colorHex: '#475569',
  });
  addCylinderZ(faces, edges, 27.2, 28.8, 8.8, 8.8, 5.2, 5.2, 14, {
    cx: -46,
    cy: 0,
    colorHex: baseHex,
  });
  // Output shaft dual-lip seals + bolted end covers at (+36, 0, ±25)
  for (const sz of [-25, 25]) {
    const s0 = sz < 0 ? sz - 2.5 : sz;
    const s1 = sz < 0 ? sz : sz + 2.5;
    addCylinderZ(faces, edges, s0, s1, 15.8, 15.8, 8.8, 8.8, 16, {
      cx: 36,
      cy: 0,
      colorHex: '#475569',
    });
    addCylinderZ(faces, edges, sz < 0 ? s0 - 1.2 : s1, sz < 0 ? s0 : s1 + 1.2, 12.2, 12.2, 8.6, 8.6, 14, {
      cx: 36,
      cy: 0,
      colorHex: baseHex,
    });
  }
  // Intermediate shaft blind bolted end caps at (-8, 0, ±25)
  for (const bz of [-26.5, 24.5]) {
    addCylinderZ(faces, edges, bz, bz + 2.2, 13.0, 13.0, 0, 0, 14, {
      cx: -8,
      cy: 0,
      colorHex: '#334155',
    });
  }
  return compileMesh(faces, edges, [-46, 10, 29], baseHex);
}

function buildGbOilSightDrain(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [18, -16, 26]
  // Brass sight-glass housing ring + clear borosilicate window + amber oil level half-disk
  addCylinderZ(faces, edges, -2, 2.5, 6.2, 6.2, 4.2, 4.2, 14, { colorHex: baseHex });
  addCylinderZ(faces, edges, 0, 1.8, 4.1, 4.1, 0, 0, 12, { colorHex: '#BAE6FD' });
  addBox(faces, edges, 0, -1.6, 1.2, 3.0, 1.5, 0.8, '#D97706');
  // Magnetic brass hex drain plug lower right
  addCylinderZ(faces, edges, -2, 2.2, 3.2, 3.2, 0, 0, 6, { cx: 22, cy: -8, colorHex: '#F59E0B' });
  return compileMesh(faces, edges, [0, 6, 4], baseHex);
}

// ============================================================================
// 2. 3-PHASE TEFC SQUIRREL-CAGE INDUCTION MOTOR (IEC 160M)
// ============================================================================

function buildMotStatorFrame(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Cutaway sector leaves front-top 110 deg open (between angles -0.15*PI and +0.46*PI around X axis? Let's check!)
  // Around X axis: angle 0 is +Y (TOP), angle +PI/2 is +Z (FRONT toward Iso viewer).
  // So front-top window is angles a in [+0.08*PI .. +0.58*PI]!
  // Therefore solid arc goes from th0 = +0.58*PI to th1 = +2.08*PI (270 deg solid)!
  const th0 = 0.58 * Math.PI;
  const th1 = 2.08 * Math.PI;

  // Ribbed cast-iron barrel (x = -36..+36, rOut = 34, rIn = 30.2)
  addCylinderCutX(faces, edges, -36, 36, 34, 34, 30.2, 30.2, 20, th0, th1, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // Front & rear rabbet spigot end rings
  addCylinderCutX(faces, edges, -38, -35, 36.5, 36.5, 30.2, 30.2, 20, th0, th1, {
    colorHex: '#1D4ED8',
    isHousingShell: true,
  });
  addCylinderCutX(faces, edges, 35, 38, 36.5, 36.5, 30.2, 30.2, 20, th0, th1, {
    colorHex: '#1D4ED8',
    isHousingShell: true,
  });

  // 20 true radial longitudinal cooling fins around the solid sectors
  const finCount = 24;
  for (let i = 0; i < finCount; i++) {
    const a = (i / finCount) * Math.PI * 2;
    // Skip cutaway sector [+0.06*PI .. +0.60*PI], top terminal neck [-0.14*PI..+0.12*PI], and bottom feet [0.85*PI..1.15*PI]
    if (a > 0.06 * Math.PI && a < 0.6 * Math.PI) continue;
    if (a < 0.1 * Math.PI || a > 1.88 * Math.PI) continue;
    if (a > 0.84 * Math.PI && a < 1.16 * Math.PI) continue;
    addRadialFinX(faces, edges, -34, 34, 33.8, 38.2, 0.85, a, '#1D4ED8', true);
  }

  // Heavy cast mounting feet at bottom (-Y = -36) with slotted anchor bosses & M12 hold-down bolts
  for (const fz of [-24, 24]) {
    addBox(faces, edges, 0, -35.5, fz, 29, 3.2, 6.5, '#1E3A8A', true);
    addBox(faces, edges, 0, -31.5, fz * 0.78, 22, 3.5, 2.5, baseHex, true);
    for (const bx of [-21, 21]) {
      addCylinderY(faces, edges, -32.3, -29.2, 2.2, 2.2, 0, 0, 6, {
        cx: bx,
        cz: fz + (fz > 0 ? 1.5 : -1.5),
        colorHex: '#CBD5E1',
        isHousingShell: true,
      });
    }
  }

  // Forged steel DIN 580 lifting eyebolt on DE shoulder (+X = +26)
  addCylinderY(faces, edges, 34, 39, 3.2, 3.2, 0, 0, 10, { cx: 26, cz: 0, colorHex: '#94A3B8' });
  addCylinderZ(faces, edges, -1.6, 1.6, 4.2, 4.2, 2.1, 2.1, 12, {
    cx: 26,
    cy: 42.5,
    colorHex: '#E2E8F0',
  });

  // Top terminal box mounting pedestal neck
  addBox(faces, edges, -4, 35.5, -2, 10, 3.0, 10, '#1D4ED8', true);

  return compileMesh(faces, edges, [-20, -34, 28], baseHex);
}

function buildMotStatorWinding(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Complete 360-degree M400-50A silicon-steel laminated core stack + VPI copper end turns + lacing rings
  addCylinderSection(faces, edges, -22, 22, 29.5, 29.5, 20.6, 20.6, 20, {
    colorHex: '#64748B',
  });
  addCylinderSection(faces, edges, -28.5, -22, 27.5, 28.5, 21.5, 21.5, 18, {
    colorHex: baseHex,
  });
  addCylinderSection(faces, edges, 22, 28.5, 28.5, 27.5, 21.5, 21.5, 18, {
    colorHex: baseHex,
  });
  addCylinderSection(faces, edges, -26.5, -25.2, 28.2, 28.2, 21.3, 21.3, 16, {
    colorHex: '#FEF08A',
  });
  addCylinderSection(faces, edges, 25.2, 26.5, 28.2, 28.2, 21.3, 21.3, 16, {
    colorHex: '#FEF08A',
  });
  return compileMesh(faces, edges, [22, 26, 0], baseHex);
}

function buildMotSquirrelRotor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Silicon steel rotor stack (x = -21..+21, r = 19.2)
  addCylinderSection(faces, edges, -21, 21, 19.2, 19.2, 7.6, 7.6, 18, { colorHex: baseHex });
  // 16 skewed die-cast aluminum squirrel-cage bars along outer rotor surface
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2;
    const a1 = a0 + 0.18;
    const rB = 19.6;
    const p0: Vec3 = [-21, rB * Math.cos(a0), rB * Math.sin(a0)];
    const p1: Vec3 = [21, rB * Math.cos(a1), rB * Math.sin(a1)];
    const q0: Vec3 = [-21, 19.1 * Math.cos(a0 + 0.08), 19.1 * Math.sin(a0 + 0.08)];
    const q1: Vec3 = [21, 19.1 * Math.cos(a1 + 0.08), 19.1 * Math.sin(a1 + 0.08)];
    faces.push({ verts: [p0, q0, q1, p1], colorHex: '#F8FAFC', cullBackface: false });
    edges.push({ a: p0, b: p1 });
  }
  // Dual aluminum end-rings with cast integral rotor stirring blades
  addCylinderSection(faces, edges, -24, -21, 18.8, 19.2, 7.6, 7.6, 16, { colorHex: '#E2E8F0' });
  addCylinderSection(faces, edges, 21, 24, 19.2, 18.8, 7.6, 7.6, 16, { colorHex: '#E2E8F0' });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    addRadialFinX(faces, edges, -26.5, -24, 10, 17, 0.7, a, '#CBD5E1', false);
    addRadialFinX(faces, edges, 24, 26.5, 10, 17, 0.7, a, '#CBD5E1', false);
  }
  // Stepped AISI 4140 steel shaft extending NDE (-56) through DE drive extension (+78)
  addCylinderSection(faces, edges, -56, -34, 6.2, 6.2, 0, 0, 14, { colorHex: '#CBD5E1' });
  addCylinderSection(faces, edges, -34, 34, 8.2, 8.2, 0, 0, 14, { colorHex: '#94A3B8' });
  addCylinderSection(faces, edges, 34, 78, 7.4, 7.4, 0, 0, 14, { colorHex: '#E2E8F0' });
  // DE shaft keyway & parallel key (x = +52..+74)
  addBox(faces, edges, 63, 7.6, 0, 11, 1.3, 1.5, '#F59E0B');
  return compileMesh(faces, edges, [4, 16, 12], baseHex);
}

function buildMotBearings(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Authentic 3D 6309-2Z ball bearings at NDE (-38) & DE (+38)
  for (const bx of [-38, 38]) {
    addCylinderSection(faces, edges, bx - 3.2, bx + 3.2, 14.2, 14.2, 12.0, 12.0, 16, {
      colorHex: '#64748B',
    });
    addCylinderSection(faces, edges, bx - 3.2, bx + 3.2, 9.6, 9.6, 7.5, 7.5, 16, {
      colorHex: '#94A3B8',
    });
    addCylinderSection(faces, edges, bx - 1.5, bx + 1.5, 11.4, 11.4, 10.2, 10.2, 14, {
      colorHex: '#D97706',
      addRimEdges: false,
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      addSphereAt(faces, edges, bx, Math.cos(a) * 10.8, Math.sin(a) * 10.8, 1.7, '#F8FAFC');
    }
  }
  return compileMesh(faces, edges, [38, 15, 0], baseHex);
}

function buildMotEndShields(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Bilateral NDE (vx < 0) & DE (vx > 0) dished cast-iron end shields with stiffening webs & 6 flange bolts
  // NDE endbell: x = -45..-36
  addCylinderSection(faces, edges, -43, -36, 22, 35.5, 14.2, 14.2, 18, { colorHex: baseHex });
  addCylinderSection(faces, edges, -46, -42, 18, 18, 8.0, 8.0, 14, { colorHex: '#10B981' });
  addBoltRing(faces, edges, -41, -39, 31.5, 1.6, 6, '#CBD5E1');
  // DE endbell: x = +36..+45
  addCylinderSection(faces, edges, 36, 43, 35.5, 22, 14.2, 14.2, 18, { colorHex: baseHex });
  addCylinderSection(faces, edges, 42, 46, 18, 18, 8.0, 8.0, 14, { colorHex: '#10B981' });
  addBoltRing(faces, edges, 39, 41, 31.5, 1.6, 6, '#CBD5E1');
  return compileMesh(faces, edges, [42, -22, 16], baseHex);
}

function buildMotCoolingFan(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [-50, 0, 0] -> contoured hub, outer stabilizer ring & 9 straight bi-directional radial blades
  addCylinderSection(faces, edges, -4.5, 4.5, 10.5, 10.5, 6.4, 6.4, 14, { colorHex: baseHex });
  addCylinderSection(faces, edges, -3.5, 3.5, 26.5, 26.5, 25.2, 25.2, 18, { colorHex: '#0284C7' });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    addRadialFinX(faces, edges, -4.0, 4.0, 10.2, 25.4, 0.85, a, baseHex, false);
  }
  return compileMesh(faces, edges, [0, 26, 0], baseHex);
}

function buildMotFanCowl(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [-54, 0, 0] -> stamped steel aerodynamic fan cowl overlapping NDE endbell when assembled
  addCylinderSection(faces, edges, -10, 17, 34.5, 35.5, 32.0, 32.8, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // Tapered rear cone intake shoulder (x = -16..-10)
  addCylinderSection(faces, edges, -16, -10, 25.0, 34.5, 23.0, 32.0, 20, {
    colorHex: '#1E293B',
    isHousingShell: true,
  });
  // Concentric wire grille intake rings + 4 radial spider struts
  addCylinderSection(faces, edges, -16.8, -15.5, 17.5, 17.5, 15.8, 15.8, 16, {
    colorHex: '#475569',
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, -16.8, -15.5, 9.5, 9.5, 7.8, 7.8, 12, {
    colorHex: '#475569',
    isHousingShell: true,
  });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    addRadialFinX(faces, edges, -16.8, -15.6, 4, 24.5, 0.7, a, '#64748B', true);
  }
  return compileMesh(faces, edges, [-12, 32, 0], baseHex);
}

function buildMotTerminalBox(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 41, 0]
  // Junction box housing + internal ceramic 6-stud steatite block + copper link bars + top gasketed lid
  addBox(faces, edges, -4, 3, -2, 12.5, 5.5, 12.5, baseHex);
  addBox(faces, edges, -4, 9.5, -2, 13.5, 1.4, 13.5, '#1D4ED8');
  // 4 stainless corner lid bolts
  for (const [bx, bz] of [
    [-14, -12],
    [6, -12],
    [-14, 8],
    [6, 8],
  ]) {
    addCylinderY(faces, edges, 10.8, 12.2, 1.4, 1.4, 0, 0, 6, { cx: bx, cz: bz, colorHex: '#CBD5E1' });
  }
  // M32 brass cable gland protruding toward +Z front side
  addCylinderZ(faces, edges, 10.5, 17.5, 3.6, 3.2, 1.8, 1.8, 10, { cx: -4, cy: 3, colorHex: '#D97706' });
  addCylinderZ(faces, edges, 17.5, 21.5, 2.2, 2.2, 0, 0, 8, { cx: -4, cy: 3, colorHex: '#1E293B' });
  return compileMesh(faces, edges, [-4, 12, 0], baseHex);
}

// ============================================================================
// 4. URAS KEE ROTARY ELECTRIC VIBRATING MOTOR (URAS Techno Blueprint)
// ============================================================================

function buildUrasFrameHousing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Signature compact muscular FCD450 body (`x = -25..+25`, `rOut = 27.5`) with front-top cutaway (85 deg) to preview core
  const th0 = 0.56 * Math.PI;
  const th1 = 2.08 * Math.PI;
  addCylinderCutX(faces, edges, -25, 25, 27.5, 27.5, 22.8, 22.8, 18, th0, th1, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // Thick structural circumferential flange collars at x = ±23
  addCylinderCutX(faces, edges, -26.5, -22.5, 30.5, 30.5, 22.8, 22.8, 18, th0, th1, {
    colorHex: '#9A3412',
    isHousingShell: true,
  });
  addCylinderCutX(faces, edges, 22.5, 26.5, 30.5, 30.5, 22.8, 22.8, 18, th0, th1, {
    colorHex: '#9A3412',
    isHousingShell: true,
  });

  // Heavy box-section axial ribs along barrel sides
  for (const a of [0.68 * Math.PI, 1.32 * Math.PI, 1.55 * Math.PI, 1.78 * Math.PI]) {
    addRadialFinX(faces, edges, -23, 23, 27.2, 31.0, 1.4, a, '#C2410C', true);
  }

  // Iconic wide gusseted 4-bolt URAS mounting base slab (`y = -27`) + 4 spot-faced bolt bosses
  addBox(faces, edges, 0, -27.5, 0, 24, 3.2, 29, '#7C2D12', true);
  for (const [bx, bz] of [
    [-17, -23],
    [17, -23],
    [-17, 23],
    [17, 23],
  ]) {
    // Gusset webs up to cylinder body
    addBox(faces, edges, bx, -20.5, bz * 0.85, 2.5, 5.5, 4.0, '#9A3412', true);
    // Grade 10.9 M16 anchor bolt + heavy washer
    addCylinderY(faces, edges, -24.5, -21.0, 3.2, 3.2, 0, 0, 6, {
      cx: bx,
      cz: bz,
      colorHex: '#E2E8F0',
      isHousingShell: true,
    });
  }
  // Top saddle boss under terminal box
  addBox(faces, edges, 0, 28, 0, 11, 2.5, 11, '#9A3412', true);

  return compileMesh(faces, edges, [0, -28, 28], baseHex);
}

function buildUrasStatorCore(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Complete 360-degree Class-F shrink-fit laminated stator core + double-varnished copper end turns
  addCylinderSection(faces, edges, -16, 16, 22.2, 22.2, 16.5, 16.5, 20, {
    colorHex: '#64748B',
  });
  addCylinderSection(faces, edges, -21, -16, 21.0, 21.8, 17.0, 17.0, 18, {
    colorHex: baseHex,
  });
  addCylinderSection(faces, edges, 16, 21, 21.8, 21.0, 17.0, 17.0, 18, {
    colorHex: baseHex,
  });
  return compileMesh(faces, edges, [14, 21, 0], baseHex);
}

function buildUrasRotorShaft(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Short ultra-stiff large-diameter 42CrMo4 shaft (r = 9.0, x = -48..+48) + rotor stack
  addCylinderSection(faces, edges, -48, 48, 8.8, 8.8, 0, 0, 14, { colorHex: '#E2E8F0' });
  addCylinderSection(faces, edges, -15, 15, 15.6, 15.6, 8.8, 8.8, 16, { colorHex: baseHex });
  // Woodruff keyways on both shaft ends for fixed counterweight lock
  addBox(faces, edges, -39, 9.0, 0, 4.5, 1.3, 1.6, '#F59E0B');
  addBox(faces, edges, 39, 9.0, 0, 4.5, 1.3, 1.6, '#F59E0B');
  return compileMesh(faces, edges, [-12, 15, 8], baseHex);
}

function buildUrasBearingsBrackets(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Heavy C3 spherical/cylindrical roller bearings + nodular iron end brackets (x = ±25..±33) + top grease nipples
  for (const sign of [-1, 1]) {
    const b0 = sign < 0 ? -32 : 25;
    const b1 = sign < 0 ? -25 : 32;
    addCylinderSection(faces, edges, b0, b1, 27.5, 25, 15, 15, 18, { colorHex: baseHex });
    // C3 Roller bearing visible inside bracket collar
    const r0 = sign < 0 ? -29.5 : 26.5;
    const r1 = sign < 0 ? -26.5 : 29.5;
    addCylinderSection(faces, edges, r0, r1, 15.2, 15.2, 8.9, 8.9, 14, { colorHex: '#F59E0B' });
    // Top M8 brass hydraulic grease nipple
    addCylinderY(faces, edges, 27.5, 32, 2.0, 2.0, 0, 0, 8, {
      cx: (b0 + b1) * 0.5,
      cz: 0,
      colorHex: '#FBBF24',
    });
  }
  return compileMesh(faces, edges, [-28, 30, 0], baseHex);
}

function buildUrasFixedWeights(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Bilateral coaxial inner fixed counterweight rings on BOTH ends: left (-39..-33) & right (+33..+39)
  addCylinderSection(faces, edges, -39, -33, 12.2, 12.2, 8.8, 8.8, 14, { colorHex: '#475569' });
  addSemiCircleEccentricX(faces, edges, -38.8, -33.2, 11.5, 26.5, 0.2, Math.PI, 10, baseHex, '#9A3412');
  addCylinderSection(faces, edges, 33, 39, 12.2, 12.2, 8.8, 8.8, 14, { colorHex: '#475569' });
  addSemiCircleEccentricX(faces, edges, 33.2, 38.8, 11.5, 26.5, 0.2, Math.PI, 10, baseHex, '#9A3412');
  return compileMesh(faces, edges, [-36, -22, 10], baseHex);
}

function buildUrasAdjWeights(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Bilateral coaxial outer phase-adjustable counterweight plates on BOTH ends: left (-46..-40) & right (+40..+46)
  addCylinderSection(faces, edges, -46, -40, 12.2, 12.2, 8.8, 8.8, 14, { colorHex: '#475569' });
  addSemiCircleEccentricX(faces, edges, -45.8, -40.2, 11.5, 26.5, 0.85, Math.PI, 10, baseHex, '#FDE047');
  addBox(faces, edges, -43, -14, -12, 2.8, 3.5, 3.5, '#E2E8F0');

  addCylinderSection(faces, edges, 40, 46, 12.2, 12.2, 8.8, 8.8, 14, { colorHex: '#475569' });
  addSemiCircleEccentricX(faces, edges, 40.2, 45.8, 11.5, 26.5, 0.85, Math.PI, 10, baseHex, '#FDE047');
  addBox(faces, edges, 43, -14, -12, 2.8, 3.5, 3.5, '#E2E8F0');
  return compileMesh(faces, edges, [43, 24, 0], baseHex);
}

function buildUrasWeightCovers(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Bilateral Left (vx < 0: x = -53..-31) and Right (vx > 0: x = +31..+53) O-ring sealed ADC12 dome covers
  // Left cover
  addCylinderSection(faces, edges, -50, -31, 28.5, 29.5, 25.5, 26.5, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, -53.5, -50, 24, 28.5, 0, 0, 20, {
    colorHex: '#94A3B8',
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, -32.2, -30.8, 29.8, 29.8, 27.2, 27.2, 20, {
    colorHex: '#0F172A',
    isHousingShell: true,
    addRimEdges: false,
  });
  addBoltRing(faces, edges, -34, -31, 27.5, 1.5, 6, '#E2E8F0', true);

  // Right cover
  addCylinderSection(faces, edges, 31, 50, 29.5, 28.5, 26.5, 25.5, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, 50, 53.5, 28.5, 24, 0, 0, 20, {
    colorHex: '#94A3B8',
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, 30.8, 32.2, 29.8, 29.8, 27.2, 27.2, 20, {
    colorHex: '#0F172A',
    isHousingShell: true,
    addRimEdges: false,
  });
  addBoltRing(faces, edges, 31, 34, 27.5, 1.5, 6, '#E2E8F0', true);

  return compileMesh(faces, edges, [46, 26, 0], baseHex);
}

function buildUrasTerminalBox(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 34, 0] -> cast box + black polyurethane anti-vib potting collar + flexible rubber gland + loop
  addBox(faces, edges, 0, 1, 0, 11.5, 4.5, 11.5, baseHex);
  addBox(faces, edges, 0, 6.2, 0, 12.2, 1.3, 12.2, '#334155');
  addBox(faces, edges, 0, 4.5, 0, 9.8, 0.8, 9.8, '#0F172A');
  addCylinderZ(faces, edges, 10, 17, 3.2, 2.8, 1.5, 1.5, 10, { cx: 0, cy: 1, colorHex: '#1E293B' });
  addCylinderZ(faces, edges, 17, 23, 2.1, 2.1, 0, 0, 8, { cx: 0, cy: 0.5, colorHex: '#0F172A' });
  return compileMesh(faces, edges, [0, 9, 0], baseHex);
}

export function buildExtraMachineMesh(partId: string, baseHex: string): PartMesh | null {
  switch (partId) {
    case 'gb-upper-housing':
      return buildGbUpperHousing(baseHex);
    case 'gb-lower-sump-base':
      return buildGbLowerSumpBase(baseHex);
    case 'gb-input-pinion':
      return buildGbInputPinion(baseHex);
    case 'gb-intermediate-shaft':
      return buildGbIntermediateShaft(baseHex);
    case 'gb-bull-gear-output':
      return buildGbBullGearOutput(baseHex);
    case 'gb-tapered-bearings':
      return buildGbTaperedBearings(baseHex);
    case 'gb-lip-seals':
      return buildGbLipSeals(baseHex);
    case 'gb-oil-sight-drain':
      return buildGbOilSightDrain(baseHex);

    case 'mot-stator-frame':
      return buildMotStatorFrame(baseHex);
    case 'mot-stator-winding':
      return buildMotStatorWinding(baseHex);
    case 'mot-squirrel-rotor':
      return buildMotSquirrelRotor(baseHex);
    case 'mot-bearings':
      return buildMotBearings(baseHex);
    case 'mot-end-shields':
      return buildMotEndShields(baseHex);
    case 'mot-cooling-fan':
      return buildMotCoolingFan(baseHex);
    case 'mot-fan-cowl':
      return buildMotFanCowl(baseHex);
    case 'mot-terminal-box':
      return buildMotTerminalBox(baseHex);

    case 'uras-frame-housing':
      return buildUrasFrameHousing(baseHex);
    case 'uras-stator-core':
      return buildUrasStatorCore(baseHex);
    case 'uras-rotor-shaft':
      return buildUrasRotorShaft(baseHex);
    case 'uras-bearings-brackets':
      return buildUrasBearingsBrackets(baseHex);
    case 'uras-fixed-weights':
      return buildUrasFixedWeights(baseHex);
    case 'uras-adj-weights':
      return buildUrasAdjWeights(baseHex);
    case 'uras-weight-covers':
      return buildUrasWeightCovers(baseHex);
    case 'uras-terminal-box':
      return buildUrasTerminalBox(baseHex);

    default:
      return null;
  }
}
