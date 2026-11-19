import { PUMP_3D_PARTS, type Machine3DPartSpec } from './machine3dData';
import { buildExtraMachineMesh } from './extraMachines3dMeshes';

export type Vec3 = [number, number, number];
type RgbTuple = [number, number, number];

export interface CameraState {
  yaw: number;
  pitch: number;
  zoom: number;
  panX: number;
  panY: number;
}

export interface RenderSceneOptions {
  parts: Machine3DPartSpec[];
  explodeFactor: number;
  explodeMode: 'proportional' | 'staged';
  shaftAngleRad: number;
  xrayHousing: boolean;
  showCallouts: boolean;
  hoveredPartId: string | null;
  selectedPartId: string | null;
  isolatedPartId: string | null;
  isDark: boolean;
  isDriving?: boolean;
}

export interface ProjectedCallout {
  partId: string;
  bomNumber: number;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  depth: number;
}

export interface RawFaceDef {
  verts: Vec3[];
  colorHex?: string;
  isHousingShell?: boolean;
  cullBackface?: boolean;
}

interface CompiledFace {
  verts: Vec3[];
  normal: Vec3;
  rgb: RgbTuple;
  isHousingShell: boolean;
  cullBackface: boolean;
}

export interface EdgeDef {
  a: Vec3;
  b: Vec3;
  isHousingShell?: boolean;
}

export interface PartMesh {
  faces: CompiledFace[];
  edges: EdgeDef[];
  calloutLocalAnchor: Vec3;
}

interface ProjectedPolygon {
  partId: string;
  pts: [number, number][];
  zOffs: number[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  isHousingShell: boolean;
}

export interface RenderFrameResult {
  callouts: ProjectedCallout[];
  hitTestPart: (canvasX: number, canvasY: number) => string | null;
}

// --- Vector & Color Helpers ---

function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize3(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

const hexRgbCache = new Map<string, RgbTuple>();

function hexToRgb(hex: string): RgbTuple {
  const cached = hexRgbCache.get(hex);
  if (cached) return cached;
  const clean = hex.replace('#', '');
  const num = Number.parseInt(clean, 16);
  const rgb: RgbTuple = [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  hexRgbCache.set(hex, rgb);
  return rgb;
}

function clampByte(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : (n + 0.5) | 0;
}

export function compileMesh(
  rawFaces: RawFaceDef[],
  edges: EdgeDef[],
  calloutLocalAnchor: Vec3,
  partBaseHex: string
): PartMesh {
  const baseRgb = hexToRgb(partBaseHex);
  const faces: CompiledFace[] = rawFaces.map((rf) => {
    const e1 = sub3(rf.verts[1], rf.verts[0]);
    const e2 = sub3(rf.verts[2], rf.verts[0]);
    const normal = normalize3(cross3(e1, e2));
    return {
      verts: rf.verts,
      normal,
      rgb: rf.colorHex ? hexToRgb(rf.colorHex) : baseRgb,
      isHousingShell: Boolean(rf.isHousingShell),
      cullBackface: Boolean(rf.cullBackface),
    };
  });
  return { faces, edges, calloutLocalAnchor };
}

// --- Parametric CAD Mesh Builders (LOD-tuned for 60 FPS) ---

export function addCylinderSection(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  rOut0: number,
  rOut1: number,
  rIn0: number,
  rIn1: number,
  segments: number,
  opts?: {
    colorHex?: string;
    isHousingShell?: boolean;
    addRimEdges?: boolean;
    capFront?: boolean;
    capBack?: boolean;
  }
) {
  const colorHex = opts?.colorHex;
  const isHousingShell = opts?.isHousingShell;
  const addRimEdges = opts?.addRimEdges ?? true;
  const axialSlices = Math.max(1, Math.ceil(Math.abs(x1 - x0) / 30));

  for (let s = 0; s < axialSlices; s++) {
    const t0 = s / axialSlices;
    const t1 = (s + 1) / axialSlices;
    const sx0 = x0 + (x1 - x0) * t0;
    const sx1 = x0 + (x1 - x0) * t1;
    const sRo0 = rOut0 + (rOut1 - rOut0) * t0;
    const sRo1 = rOut0 + (rOut1 - rOut0) * t1;
    const sRi0 = rIn0 + (rIn1 - rIn0) * t0;
    const sRi1 = rIn0 + (rIn1 - rIn0) * t1;

    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);

      const o00: Vec3 = [sx0, sRo0 * c0, sRo0 * s0];
      const o01: Vec3 = [sx0, sRo0 * c1, sRo0 * s1];
      const o10: Vec3 = [sx1, sRo1 * c0, sRo1 * s0];
      const o11: Vec3 = [sx1, sRo1 * c1, sRo1 * s1];

      // Outward-wound barrel quad
      faces.push({
        verts: [o00, o01, o11, o10],
        colorHex,
        isHousingShell,
        cullBackface: true,
      });

      if (addRimEdges) {
        if (s === 0) edges.push({ a: o00, b: o01, isHousingShell });
        if (s === axialSlices - 1) edges.push({ a: o10, b: o11, isHousingShell });
      }

      if (sRi0 > 0 || sRi1 > 0) {
        const i00: Vec3 = [sx0, sRi0 * c0, sRi0 * s0];
        const i01: Vec3 = [sx0, sRi0 * c1, sRi0 * s1];
        const i10: Vec3 = [sx1, sRi1 * c0, sRi1 * s0];
        const i11: Vec3 = [sx1, sRi1 * c1, sRi1 * s1];

        // Inner bore quad (kept double-sided so recessed openings stay visible)
        faces.push({
          verts: [i00, i01, i11, i10],
          colorHex,
          isHousingShell,
          cullBackface: false,
        });

        // Outward-wound annular front (-X) and back (+X) end caps
        if (s === 0 && opts?.capFront !== false) {
          faces.push({
            verts: [o00, i00, i01, o01],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (s === axialSlices - 1 && opts?.capBack !== false) {
          faces.push({
            verts: [o10, o11, i11, i10],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (addRimEdges) {
          if (s === 0) edges.push({ a: i00, b: i01, isHousingShell });
          if (s === axialSlices - 1) edges.push({ a: i10, b: i11, isHousingShell });
        }
      } else {
        // Outward-wound solid disk end caps
        if (s === 0 && opts?.capFront !== false) {
          faces.push({
            verts: [[sx0, 0, 0], o01, o00],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (s === axialSlices - 1 && opts?.capBack !== false) {
          faces.push({
            verts: [[sx1, 0, 0], o10, o11],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
      }
    }
  }
}

export function addBox(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  cx: number,
  cy: number,
  cz: number,
  hx: number,
  hy: number,
  hz: number,
  colorHex?: string,
  isHousingShell?: boolean
) {
  const v: Vec3[] = [
    [cx - hx, cy - hy, cz - hz], // 0
    [cx + hx, cy - hy, cz - hz], // 1
    [cx + hx, cy + hy, cz - hz], // 2
    [cx - hx, cy + hy, cz - hz], // 3
    [cx - hx, cy - hy, cz + hz], // 4
    [cx + hx, cy - hy, cz + hz], // 5
    [cx + hx, cy + hy, cz + hz], // 6
    [cx - hx, cy + hy, cz + hz], // 7
  ];

  const quads: [number, number, number, number][] = [
    [0, 3, 2, 1], // -Z
    [4, 5, 6, 7], // +Z
    [0, 4, 7, 3], // -X
    [1, 2, 6, 5], // +X
    [3, 7, 6, 2], // +Y
    [0, 1, 5, 4], // -Y
  ];

  for (const [a, b, c, d] of quads) {
    faces.push({
      verts: [v[a], v[b], v[c], v[d]],
      colorHex,
      isHousingShell,
      cullBackface: true,
    });
  }

  const edgePairs: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (const [a, b] of edgePairs) {
    edges.push({ a: v[a], b: v[b], isHousingShell });
  }
}

export function addBoltRing(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  pitchR: number,
  boltR: number,
  count: number,
  colorHex: string,
  isHousingShell?: boolean
) {
  const segs = 6;
  for (let k = 0; k < count; k++) {
    const theta = (k / count) * Math.PI * 2;
    const by = pitchR * Math.cos(theta);
    const bz = pitchR * Math.sin(theta);
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = ((i + 1) / segs) * Math.PI * 2;
      const p00: Vec3 = [x0, by + boltR * Math.cos(a0), bz + boltR * Math.sin(a0)];
      const p01: Vec3 = [x0, by + boltR * Math.cos(a1), bz + boltR * Math.sin(a1)];
      const p10: Vec3 = [x1, by + boltR * Math.cos(a0), bz + boltR * Math.sin(a0)];
      const p11: Vec3 = [x1, by + boltR * Math.cos(a1), bz + boltR * Math.sin(a1)];
      faces.push({ verts: [p00, p01, p11, p10], colorHex, isHousingShell, cullBackface: true });
      faces.push({ verts: [[x0, by, bz], p01, p00], colorHex, isHousingShell, cullBackface: true });
      faces.push({ verts: [[x1, by, bz], p10, p11], colorHex, isHousingShell, cullBackface: true });
      edges.push({ a: p00, b: p01, isHousingShell });
      edges.push({ a: p10, b: p11, isHousingShell });
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
  // Low-poly chrome bearing ball (3x6 = 18 quads instead of 40)
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

      // Ensure outward normal away from sphere center
      const e1 = sub3(v10, v00);
      const e2 = sub3(v11, v00);
      const n = cross3(e1, e2);
      const rad: Vec3 = [v00[0] - cx, v00[1] - cy, v00[2] - cz];
      const dot = n[0] * rad[0] + n[1] * rad[1] + n[2] * rad[2];
      const verts: Vec3[] = dot >= 0 ? [v00, v10, v11, v01] : [v00, v01, v11, v10];
      faces.push({ verts, colorHex, cullBackface: true });
      if (i === 1) {
        edges.push({ a: v00, b: v01 });
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
  const axialSlices = Math.max(1, Math.ceil(Math.abs(z1 - z0) / 30));

  for (let s = 0; s < axialSlices; s++) {
    const t0 = s / axialSlices;
    const t1 = (s + 1) / axialSlices;
    const sz0 = z0 + (z1 - z0) * t0;
    const sz1 = z0 + (z1 - z0) * t1;
    const sRo0 = rOut0 + (rOut1 - rOut0) * t0;
    const sRo1 = rOut0 + (rOut1 - rOut0) * t1;
    const sRi0 = rIn0 + (rIn1 - rIn0) * t0;
    const sRi1 = rIn0 + (rIn1 - rIn0) * t1;

    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);

      const o00: Vec3 = [cx + sRo0 * c0, cy + sRo0 * s0, sz0];
      const o01: Vec3 = [cx + sRo0 * c1, cy + sRo0 * s1, sz0];
      const o10: Vec3 = [cx + sRo1 * c0, cy + sRo1 * s0, sz1];
      const o11: Vec3 = [cx + sRo1 * c1, cy + sRo1 * s1, sz1];

      faces.push({
        verts: [o00, o01, o11, o10],
        colorHex,
        isHousingShell,
        cullBackface: true,
      });

      if (addRimEdges) {
        if (s === 0) edges.push({ a: o00, b: o01, isHousingShell });
        if (s === axialSlices - 1) edges.push({ a: o10, b: o11, isHousingShell });
      }

      if (sRi0 > 0 || sRi1 > 0) {
        const i00: Vec3 = [cx + sRi0 * c0, cy + sRi0 * s0, sz0];
        const i01: Vec3 = [cx + sRi0 * c1, cy + sRi0 * s1, sz0];
        const i10: Vec3 = [cx + sRi1 * c0, cy + sRi1 * s0, sz1];
        const i11: Vec3 = [cx + sRi1 * c1, cy + sRi1 * s1, sz1];

        faces.push({
          verts: [i00, i01, i11, i10],
          colorHex,
          isHousingShell,
          cullBackface: false,
        });

        if (s === 0 && opts?.capFront !== false) {
          faces.push({
            verts: [o00, i00, i01, o01],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (s === axialSlices - 1 && opts?.capBack !== false) {
          faces.push({
            verts: [o10, o11, i11, i10],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (addRimEdges) {
          if (s === 0) edges.push({ a: i00, b: i01, isHousingShell });
          if (s === axialSlices - 1) edges.push({ a: i10, b: i11, isHousingShell });
        }
      } else {
        if (s === 0 && opts?.capFront !== false) {
          faces.push({
            verts: [[cx, cy, sz0], o01, o00],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (s === axialSlices - 1 && opts?.capBack !== false) {
          faces.push({
            verts: [[cx, cy, sz1], o10, o11],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
      }
    }
  }
}

function addOrientedCylinder(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  p0: Vec3,
  p1: Vec3,
  r: number,
  segments: number,
  opts?: {
    colorHex?: string;
    isHousingShell?: boolean;
    addRimEdges?: boolean;
  }
) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const dz = p1[2] - p0[2];
  const len = Math.hypot(dx, dy, dz) || 1;
  const axis: Vec3 = [dx / len, dy / len, dz / len];
  const ref: Vec3 = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = normalize3(cross3(ref, axis));
  const v = cross3(axis, u);

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

    const off0: Vec3 = [
      (u[0] * c0 + v[0] * s0) * r,
      (u[1] * c0 + v[1] * s0) * r,
      (u[2] * c0 + v[2] * s0) * r,
    ];
    const off1: Vec3 = [
      (u[0] * c1 + v[0] * s1) * r,
      (u[1] * c1 + v[1] * s1) * r,
      (u[2] * c1 + v[2] * s1) * r,
    ];

    const o00: Vec3 = [p0[0] + off0[0], p0[1] + off0[1], p0[2] + off0[2]];
    const o01: Vec3 = [p0[0] + off1[0], p0[1] + off1[1], p0[2] + off1[2]];
    const o10: Vec3 = [p1[0] + off0[0], p1[1] + off0[1], p1[2] + off0[2]];
    const o11: Vec3 = [p1[0] + off1[0], p1[1] + off1[1], p1[2] + off1[2]];

    faces.push({
      verts: [o00, o01, o11, o10],
      colorHex,
      isHousingShell,
      cullBackface: true,
    });
    faces.push({
      verts: [p0, o01, o00],
      colorHex,
      isHousingShell,
      cullBackface: true,
    });
    faces.push({
      verts: [p1, o10, o11],
      colorHex,
      isHousingShell,
      cullBackface: true,
    });

    if (addRimEdges) {
      edges.push({ a: o00, b: o01, isHousingShell });
      edges.push({ a: o10, b: o11, isHousingShell });
    }
  }
}

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
  const axialSlices = Math.max(1, Math.ceil(Math.abs(y1 - y0) / 30));

  for (let s = 0; s < axialSlices; s++) {
    const t0 = s / axialSlices;
    const t1 = (s + 1) / axialSlices;
    const sy0 = y0 + (y1 - y0) * t0;
    const sy1 = y0 + (y1 - y0) * t1;
    const sRo0 = rOut0 + (rOut1 - rOut0) * t0;
    const sRo1 = rOut0 + (rOut1 - rOut0) * t1;
    const sRi0 = rIn0 + (rIn1 - rIn0) * t0;
    const sRi1 = rIn0 + (rIn1 - rIn0) * t1;

    for (let i = 0; i < segments; i++) {
      const a0 = th0 + (i / segments) * (th1 - th0);
      const a1 = th0 + ((i + 1) / segments) * (th1 - th0);
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);

      const o00: Vec3 = [cx + sRo0 * c0, sy0, cz + sRo0 * s0];
      const o01: Vec3 = [cx + sRo0 * c1, sy0, cz + sRo0 * s1];
      const o10: Vec3 = [cx + sRo1 * c0, sy1, cz + sRo1 * s0];
      const o11: Vec3 = [cx + sRo1 * c1, sy1, cz + sRo1 * s1];

      // Outward-wound barrel quad around +Y
      faces.push({
        verts: [o00, o10, o11, o01],
        colorHex,
        isHousingShell,
        cullBackface: true,
      });

      if (addRimEdges) {
        if (s === 0) edges.push({ a: o00, b: o01, isHousingShell });
        if (s === axialSlices - 1) edges.push({ a: o10, b: o11, isHousingShell });
      }

      if (sRi0 > 0 || sRi1 > 0) {
        const i00: Vec3 = [cx + sRi0 * c0, sy0, cz + sRi0 * s0];
        const i01: Vec3 = [cx + sRi0 * c1, sy0, cz + sRi0 * s1];
        const i10: Vec3 = [cx + sRi1 * c0, sy1, cz + sRi1 * s0];
        const i11: Vec3 = [cx + sRi1 * c1, sy1, cz + sRi1 * s1];

        faces.push({
          verts: [i00, i01, i11, i10],
          colorHex,
          isHousingShell,
          cullBackface: false,
        });

        if (s === 0 && opts?.capBottom !== false) {
          faces.push({
            verts: [o00, o01, i01, i00],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (s === axialSlices - 1 && opts?.capTop !== false) {
          faces.push({
            verts: [o10, i10, i11, o11],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (addRimEdges) {
          if (s === 0) edges.push({ a: i00, b: i01, isHousingShell });
          if (s === axialSlices - 1) edges.push({ a: i10, b: i11, isHousingShell });
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
          edges.push({ a: o00, b: i00, isHousingShell });
          edges.push({ a: o10, b: i10, isHousingShell });
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
          edges.push({ a: o01, b: i01, isHousingShell });
          edges.push({ a: o11, b: i11, isHousingShell });
        }
      } else {
        if (s === 0 && opts?.capBottom !== false) {
          faces.push({
            verts: [[cx, sy0, cz], o00, o01],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
        if (s === axialSlices - 1 && opts?.capTop !== false) {
          faces.push({
            verts: [[cx, sy1, cz], o11, o10],
            colorHex,
            isHousingShell,
            cullBackface: true,
          });
        }
      }
    }
  }
}

function addHelicalSpringY(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  cx: number,
  cz: number,
  yBottom: number,
  yTop: number,
  coilR: number,
  wireR: number,
  turns: number,
  segsPerTurn: number,
  colorHex: string
) {
  const totalSteps = Math.max(4, Math.round(turns * segsPerTurn));
  for (let k = 0; k < totalSteps; k++) {
    const t0 = k / totalSteps;
    const t1 = (k + 1) / totalSteps;
    const a0 = t0 * turns * Math.PI * 2;
    const a1 = t1 * turns * Math.PI * 2;
    const p0: Vec3 = [
      cx + coilR * Math.cos(a0),
      yBottom + (yTop - yBottom) * t0,
      cz + coilR * Math.sin(a0),
    ];
    const p1: Vec3 = [
      cx + coilR * Math.cos(a1),
      yBottom + (yTop - yBottom) * t1,
      cz + coilR * Math.sin(a1),
    ];
    addOrientedCylinder(faces, edges, p0, p1, wireR, 6, {
      colorHex,
      addRimEdges: false,
    });
  }
}

function addSprocket3D(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  teeth: number,
  rootR: number,
  tipR: number,
  z0: number,
  z1: number,
  boreR: number,
  colorHex?: string,
  spokes?: number
) {
  // Build toothed rim in X-Y plane
  const rimInnerR = spokes ? rootR - 4.5 : boreR;
  addCylinderZ(faces, edges, z0, z1, rootR, rootR, rimInnerR, rimInnerR, teeth, {
    colorHex,
    addRimEdges: true,
  });

  if (spokes && spokes > 0) {
    const hubR = boreR + 5.5;
    addCylinderZ(faces, edges, z0, z1, hubR, hubR, boreR, boreR, 16, {
      colorHex,
      addRimEdges: true,
    });
    const spokeLen = rimInnerR - hubR + 1.5;
    const spokeMidR = (hubR + rimInnerR) * 0.5;
    const halfW = 2.6;
    const halfZ = (z1 - z0) * 0.44;
    const cz = (z0 + z1) * 0.5;
    for (let s = 0; s < spokes; s++) {
      const ang = (s / spokes) * Math.PI * 2;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const nx = -sa;
      const ny = ca;
      const rA = spokeMidR - spokeLen * 0.5;
      const rB = spokeMidR + spokeLen * 0.5;
      const pts: Vec3[] = [
        [rA * ca - halfW * nx, rA * sa - halfW * ny, cz - halfZ],
        [rB * ca - halfW * nx, rB * sa - halfW * ny, cz - halfZ],
        [rB * ca + halfW * nx, rB * sa + halfW * ny, cz - halfZ],
        [rA * ca + halfW * nx, rA * sa + halfW * ny, cz - halfZ],
        [rA * ca - halfW * nx, rA * sa - halfW * ny, cz + halfZ],
        [rB * ca - halfW * nx, rB * sa - halfW * ny, cz + halfZ],
        [rB * ca + halfW * nx, rB * sa + halfW * ny, cz + halfZ],
        [rA * ca + halfW * nx, rA * sa + halfW * ny, cz + halfZ],
      ];
      const quads: [number, number, number, number][] = [
        [0, 3, 2, 1],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [2, 3, 7, 6],
      ];
      for (const [a, b, c, d] of quads) {
        faces.push({ verts: [pts[a], pts[b], pts[c], pts[d]], colorHex, cullBackface: true });
      }
      edges.push({ a: pts[0], b: pts[1] });
      edges.push({ a: pts[3], b: pts[2] });
      edges.push({ a: pts[4], b: pts[5] });
      edges.push({ a: pts[7], b: pts[6] });
    }
  }

  // 3D involute-style trapezoidal teeth around rootR..tipR
  const step = (Math.PI * 2) / teeth;
  const tz0 = z0 + 0.4;
  const tz1 = z1 - 0.4;
  for (let i = 0; i < teeth; i++) {
    const mid = (i + 0.5) * step;
    const aBase0 = mid - step * 0.34;
    const aTip0 = mid - step * 0.14;
    const aTip1 = mid + step * 0.14;
    const aBase1 = mid + step * 0.34;

    const b0F: Vec3 = [rootR * Math.cos(aBase0), rootR * Math.sin(aBase0), tz0];
    const t0F: Vec3 = [tipR * Math.cos(aTip0), tipR * Math.sin(aTip0), tz0];
    const t1F: Vec3 = [tipR * Math.cos(aTip1), tipR * Math.sin(aTip1), tz0];
    const b1F: Vec3 = [rootR * Math.cos(aBase1), rootR * Math.sin(aBase1), tz0];

    const b0B: Vec3 = [b0F[0], b0F[1], tz1];
    const t0B: Vec3 = [t0F[0], t0F[1], tz1];
    const t1B: Vec3 = [t1F[0], t1F[1], tz1];
    const b1B: Vec3 = [b1F[0], b1F[1], tz1];

    // Front (-Z) & Back (+Z) tooth faces
    faces.push({ verts: [b0F, b1F, t1F, t0F], colorHex, cullBackface: true });
    faces.push({ verts: [b0B, t0B, t1B, b1B], colorHex, cullBackface: true });
    // Left flank, tip land, right flank
    faces.push({ verts: [b0F, t0F, t0B, b0B], colorHex, cullBackface: true });
    faces.push({ verts: [t0F, t1F, t1B, t0B], colorHex, cullBackface: true });
    faces.push({ verts: [t1F, b1F, b1B, t1B], colorHex, cullBackface: true });

    edges.push({ a: b0F, b: t0F });
    edges.push({ a: t0F, b: t1F });
    edges.push({ a: t1F, b: b1F });
    edges.push({ a: t0B, b: t1B });
  }
}

// --- Specific Machine Part Builders ---

function buildVoluteCasing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  const shellOpts = { isHousingShell: true, addRimEdges: true };

  // Spiral volute main casing body (18 segments for smooth FPS)
  const segs = 18;
  const xF = -14;
  const xB = 16;
  const rIn = 17;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    const spiral0 = 31 + 5.5 * (i / segs);
    const spiral1 = 31 + 5.5 * ((i + 1) / segs);
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);

    const o00: Vec3 = [xF, spiral0 * c0, spiral0 * s0];
    const o01: Vec3 = [xF, spiral1 * c1, spiral1 * s1];
    const o10: Vec3 = [xB, spiral0 * c0, spiral0 * s0];
    const o11: Vec3 = [xB, spiral1 * c1, spiral1 * s1];

    faces.push({
      verts: [o00, o01, o11, o10],
      isHousingShell: true,
      cullBackface: true,
    });
    edges.push({ a: o00, b: o01, isHousingShell: true });
    edges.push({ a: o10, b: o11, isHousingShell: true });

    const i00: Vec3 = [xF, rIn * c0, rIn * s0];
    const i01: Vec3 = [xF, rIn * c1, rIn * s1];
    faces.push({
      verts: [o00, i00, i01, o01],
      isHousingShell: true,
      cullBackface: true,
    });
  }

  // Front suction nozzle spool & raised ANSI flange
  addCylinderSection(faces, edges, -38, -14, 17, 18.5, 13.5, 14, 16, shellOpts);
  addCylinderSection(faces, edges, -42, -37, 26, 26, 13.5, 13.5, 16, shellOpts);
  addBoltRing(faces, edges, -44, -41.5, 21.5, 1.9, 8, '#CBD5E1', true);

  // Rear casing bolt flange collar
  addCylinderSection(faces, edges, 15, 20, 39, 39, 32, 32, 18, shellOpts);

  // Tangential vertical discharge nozzle (+Y at Z = +14)
  const nzX = 0;
  const nzZ = 14;
  const dSegs = 12;
  const rPipe = 11.5;
  const rPipeIn = 8.2;
  for (let i = 0; i < dSegs; i++) {
    const a0 = (i / dSegs) * Math.PI * 2;
    const a1 = ((i + 1) / dSegs) * Math.PI * 2;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);
    const y0 = 26;
    const y1 = 52;
    faces.push({
      verts: [
        [nzX + rPipe * c0, y0, nzZ + rPipe * s0],
        [nzX + rPipe * c0, y1, nzZ + rPipe * s0],
        [nzX + rPipe * c1, y1, nzZ + rPipe * s1],
        [nzX + rPipe * c1, y0, nzZ + rPipe * s1],
      ],
      isHousingShell: true,
      cullBackface: true,
    });
    faces.push({
      verts: [
        [nzX + rPipeIn * c0, y1, nzZ + rPipeIn * s0],
        [nzX + rPipeIn * c1, y1, nzZ + rPipeIn * s1],
        [nzX + rPipeIn * c1, y0, nzZ + rPipeIn * s1],
        [nzX + rPipeIn * c0, y0, nzZ + rPipeIn * s0],
      ],
      colorHex: '#0F172A',
      isHousingShell: true,
      cullBackface: false,
    });
  }

  // Discharge top flange ring
  for (let i = 0; i < dSegs; i++) {
    const a0 = (i / dSegs) * Math.PI * 2;
    const a1 = ((i + 1) / dSegs) * Math.PI * 2;
    const c0 = Math.cos(a0);
    const s0 = Math.sin(a0);
    const c1 = Math.cos(a1);
    const s1 = Math.sin(a1);
    const rFl = 19.5;
    const yB = 51;
    const yT = 55;
    const p00: Vec3 = [nzX + rFl * c0, yB, nzZ + rFl * s0];
    const p01: Vec3 = [nzX + rFl * c1, yB, nzZ + rFl * s1];
    const p10: Vec3 = [nzX + rFl * c0, yT, nzZ + rFl * s0];
    const p11: Vec3 = [nzX + rFl * c1, yT, nzZ + rFl * s1];
    faces.push({ verts: [p00, p10, p11, p01], isHousingShell: true, cullBackface: true });
    faces.push({
      verts: [
        p10,
        [nzX + rPipeIn * c0, yT, nzZ + rPipeIn * s0],
        [nzX + rPipeIn * c1, yT, nzZ + rPipeIn * s1],
        p11,
      ],
      isHousingShell: true,
      cullBackface: true,
    });
    edges.push({ a: p10, b: p11, isHousingShell: true });
    edges.push({ a: p00, b: p01, isHousingShell: true });
  }

  // Twin bottom casing mounting feet
  addBox(faces, edges, 0, -40, -18, 12, 5, 7, '#1D4ED8', true);
  addBox(faces, edges, 0, -40, 18, 12, 5, 7, '#1D4ED8', true);

  return compileMesh(faces, edges, [-8, 38, 12], baseHex);
}

function buildWearRing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  addCylinderSection(faces, edges, -6, -2, 19.5, 19.5, 13.0, 13.0, 16);
  addCylinderSection(faces, edges, -2, 6, 17.0, 17.0, 13.0, 13.0, 16);
  addCylinderSection(faces, edges, 0.5, 2.5, 17.2, 17.2, 16.5, 16.5, 16, {
    colorHex: '#92400E',
    addRimEdges: false,
  });
  return compileMesh(faces, edges, [0, 18, 0], baseHex);
}

function buildImpellerLocknut(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  addCylinderSection(faces, edges, -2, 4, 8.8, 8.8, 4.0, 4.0, 6);
  addCylinderSection(faces, edges, -8, -2, 2.8, 7.6, 0, 0, 10, {
    colorHex: '#64748B',
  });
  addCylinderSection(faces, edges, 4, 5.5, 8.0, 8.0, 4.5, 4.5, 12, {
    colorHex: '#B45309',
  });
  addBox(faces, edges, 10, 5.2, 0, 7, 1.3, 1.3, '#CBD5E1');
  return compileMesh(faces, edges, [-2, 10, 0], baseHex);
}

function buildEnclosedImpeller(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addCylinderSection(faces, edges, -6, 11, 8.5, 8.5, 5.2, 5.2, 14, {
    colorHex: '#0369A1',
  });
  addCylinderSection(faces, edges, 6.5, 10.5, 30.5, 30.5, 8.0, 8.0, 18);
  addCylinderSection(faces, edges, -8, -4.5, 15.5, 30.0, 11.8, 13.0, 18, {
    colorHex: '#38BDF8',
  });

  // 6 backward-swept 3D curved vanes (kept double-sided)
  const numVanes = 6;
  const vaneSteps = 3;
  for (let v = 0; v < numVanes; v++) {
    const baseAngle = (v / numVanes) * Math.PI * 2;
    for (let s = 0; s < vaneSteps; s++) {
      const t0 = s / vaneSteps;
      const t1 = (s + 1) / vaneSteps;
      const r0 = 10.5 + t0 * 19.2;
      const r1 = 10.5 + t1 * 19.2;
      const th0 = baseAngle + t0 * 0.85;
      const th1 = baseAngle + t1 * 0.85;
      const thick = 0.09;

      const xF = -4.5;
      const xB = 6.5;
      const pA0: Vec3 = [xF, r0 * Math.cos(th0), r0 * Math.sin(th0)];
      const pA1: Vec3 = [xF, r1 * Math.cos(th1), r1 * Math.sin(th1)];
      const pB0: Vec3 = [xB, r0 * Math.cos(th0), r0 * Math.sin(th0)];
      const pB1: Vec3 = [xB, r1 * Math.cos(th1), r1 * Math.sin(th1)];

      const pA0t: Vec3 = [xF, r0 * Math.cos(th0 + thick), r0 * Math.sin(th0 + thick)];
      const pA1t: Vec3 = [xF, r1 * Math.cos(th1 + thick), r1 * Math.sin(th1 + thick)];
      const pB0t: Vec3 = [xB, r0 * Math.cos(th0 + thick), r0 * Math.sin(th0 + thick)];
      const pB1t: Vec3 = [xB, r1 * Math.cos(th1 + thick), r1 * Math.sin(th1 + thick)];

      faces.push({ verts: [pA0, pA1, pB1, pB0], colorHex: '#BAE6FD', cullBackface: false });
      faces.push({ verts: [pA0t, pB0t, pB1t, pA1t], colorHex: '#0284C7', cullBackface: false });
      edges.push({ a: pA0, b: pA1 });
      edges.push({ a: pB0, b: pB1 });
      if (s === vaneSteps - 1) {
        faces.push({ verts: [pA1, pA1t, pB1t, pB1], colorHex: '#E0F2FE', cullBackface: false });
        edges.push({ a: pA1, b: pB1 });
      }
    }
  }

  return compileMesh(faces, edges, [2, 26, 0], baseHex);
}

function buildSealBackplate(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  const shellOpts = { isHousingShell: true, addRimEdges: true };

  addCylinderSection(faces, edges, -6, 0, 38.0, 38.0, 12.0, 12.0, 18, shellOpts);
  addBoltRing(faces, edges, 0, 3, 34.0, 1.8, 8, '#CBD5E1', true);
  addCylinderSection(faces, edges, 0, 15, 22.0, 19.5, 11.5, 11.5, 16, shellOpts);
  addBox(faces, edges, 7, 22, 0, 4, 3.5, 4, '#2563EB', true);

  return compileMesh(faces, edges, [0, 32, 0], baseHex);
}

function buildMechanicalSeal(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addCylinderSection(faces, edges, -9, -3, 13.8, 13.8, 8.0, 8.0, 16, {
    colorHex: '#1E293B',
  });
  addCylinderSection(faces, edges, -2, 4, 21.5, 21.5, 8.2, 8.2, 16, {
    colorHex: '#94A3B8',
  });
  addBoltRing(faces, edges, 4, 6.5, 18.0, 1.6, 4, '#E2E8F0');
  addBox(faces, edges, 1, 20, 0, 3.2, 3.2, 2.4, '#EF4444');
  addBox(faces, edges, 1, -20, 0, 3.2, 3.2, 2.4, '#EF4444');
  addCylinderSection(faces, edges, 4, 11, 12.0, 12.0, 7.2, 7.2, 14, {
    colorHex: '#D97706',
  });

  return compileMesh(faces, edges, [2, 21, 0], baseHex);
}

function buildPumpShaft(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addCylinderSection(faces, edges, -104, -95, 4.0, 4.0, 0, 0, 10, { colorHex: '#64748B' });
  addCylinderSection(faces, edges, -95, -75, 5.6, 5.6, 0, 0, 12);
  addCylinderSection(faces, edges, -75, -28, 6.8, 6.8, 0, 0, 12, { colorHex: '#CBD5E1' });
  addCylinderSection(faces, edges, -28, -4, 7.8, 7.8, 0, 0, 12);
  addCylinderSection(faces, edges, -4, 58, 9.2, 9.2, 0, 0, 12, { colorHex: '#94A3B8' });
  addCylinderSection(faces, edges, 58, 82, 7.8, 7.8, 0, 0, 12);
  addCylinderSection(faces, edges, 82, 104, 6.6, 6.6, 0, 0, 12, { colorHex: '#CBD5E1' });
  addBox(faces, edges, 94, 6.7, 0, 8, 1.4, 1.4, '#F59E0B');

  return compileMesh(faces, edges, [25, 11, 0], baseHex);
}

function buildRadialBearing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addCylinderSection(faces, edges, -7, 7, 17.2, 17.2, 14.6, 14.6, 16, {
    colorHex: '#64748B',
  });
  addCylinderSection(faces, edges, -7, 7, 10.6, 10.6, 8.0, 8.0, 16, {
    colorHex: '#94A3B8',
  });
  addCylinderSection(faces, edges, -2.5, 2.5, 13.4, 13.4, 11.8, 11.8, 16, {
    colorHex: '#D97706',
    addRimEdges: false,
  });

  const numBalls = 8;
  for (let i = 0; i < numBalls; i++) {
    const theta = (i / numBalls) * Math.PI * 2;
    addSphereAt(faces, edges, 0, 12.6 * Math.cos(theta), 12.6 * Math.sin(theta), 2.5, '#E2E8F0');
  }

  return compileMesh(faces, edges, [0, 18, 0], baseHex);
}

function buildBearingHousing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  const shellOpts = { isHousingShell: true, addRimEdges: true };

  addCylinderSection(faces, edges, -44, 44, 21.0, 21.0, 17.5, 17.5, 16, shellOpts);
  for (const rx of [-36, -18, 0, 18, 36]) {
    addCylinderSection(faces, edges, rx - 1.8, rx + 1.8, 24.5, 24.5, 21.0, 21.0, 16, {
      colorHex: '#334155',
      isHousingShell: true,
    });
  }
  addCylinderSection(faces, edges, -4, 4, 4.5, 4.5, 0, 0, 8, {
    colorHex: '#F59E0B',
    isHousingShell: true,
  });
  addBox(faces, edges, 0, 25, 0, 5, 4, 5, '#475569', true);
  addBox(faces, edges, 8, -4, 22.5, 5, 5, 3.5, '#334155', true);
  addBox(faces, edges, 8, -4, 24.8, 2.8, 2.8, 1.5, '#F59E0B', true);
  addBox(faces, edges, 4, -27, 0, 22, 10, 11, '#1E293B', true);
  addBox(faces, edges, 4, -40, 0, 28, 4.5, 19, '#0F172A', true);

  return compileMesh(faces, edges, [0, 28, 0], baseHex);
}

function buildThrustBearingCoupling(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addCylinderSection(faces, edges, -24, -15, 17.2, 17.2, 8.0, 8.0, 16, {
    colorHex: '#0F766E',
  });
  addCylinderSection(faces, edges, -14, -5, 17.2, 17.2, 8.0, 8.0, 16, {
    colorHex: '#14B8A6',
  });
  const numBalls = 8;
  for (let i = 0; i < numBalls; i++) {
    const theta = (i / numBalls) * Math.PI * 2;
    addSphereAt(faces, edges, -19.5, 12.6 * Math.cos(theta), 12.6 * Math.sin(theta), 2.3, '#E2E8F0');
    addSphereAt(faces, edges, -9.5, 12.6 * Math.cos(theta + 0.35), 12.6 * Math.sin(theta + 0.35), 2.3, '#E2E8F0');
  }

  addCylinderSection(faces, edges, -4, 1, 22.5, 22.5, 8.5, 8.5, 16, {
    colorHex: '#334155',
  });
  addBoltRing(faces, edges, 1, 3.2, 19.0, 1.5, 6, '#CBD5E1');
  addCylinderSection(faces, edges, 5, 28, 11.2, 11.2, 6.7, 6.7, 14, {
    colorHex: '#1E293B',
  });
  addCylinderSection(faces, edges, 16, 25, 22.0, 22.0, 11.2, 11.2, 16, {
    colorHex: '#0D9488',
  });
  addBoltRing(faces, edges, 25, 27.5, 17.0, 1.7, 6, '#FDE68A');

  return compileMesh(faces, edges, [16, 24, 0], baseHex);
}

// --- Belt Conveyor Part Builders ---

function buildBeltFrame(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Upper deck galvanized C-channel stringers (x: -86..+86, z: ±25.5, local y: 24.6..29.0 -> world y: 10.2..15.4)
  for (const sz of [-25.5, 25.5]) {
    const flangeZ = sz > 0 ? sz - 1.6 : sz + 1.6;
    addBox(faces, edges, 0, 26.8, sz, 86, 2.6, 1.0, '#64748B', true);
    addBox(faces, edges, 0, 29.0, flangeZ, 86, 0.7, 2.4, undefined, true);
    addBox(faces, edges, 0, 24.6, flangeZ, 86, 0.7, 2.4, undefined, true);
  }

  // Open structural upper cross-ties connecting stringers directly under idler stations (world y = 11.5)
  for (const cx of [-74, -44, 0, 44, 74]) {
    addBox(faces, edges, cx, 25.5, 0, 2.0, 1.1, 24.5, '#475569', true);
  }

  // Lower longitudinal C-channel tie rails (x: -96..+96, z: ±27.5, local y: 4.8..10.2 -> world y: -9.2..-3.8)
  for (const sz of [-27.5, 27.5]) {
    const flangeZ = sz > 0 ? sz - 1.8 : sz + 1.8;
    addBox(faces, edges, 0, 7.5, sz, 96, 3.2, 1.1, undefined, true);
    addBox(faces, edges, 0, 10.2, flangeZ, 96, 0.8, 2.8, undefined, true);
    addBox(faces, edges, 0, 4.8, flangeZ, 96, 0.8, 2.8, undefined, true);
  }

  // Vertical frame posts connecting upper deck stringers to lower tie rails at x = -74, 0, +74
  for (const px of [-74, 0, 74]) {
    for (const pz of [-26.5, 26.5]) {
      addBox(faces, edges, px, 17.4, pz, 2.6, 7.2, 1.8, '#475569', true);
    }
  }

  // Transverse structural cross-ties safely BELOW return belt (world y = -18 -> local y = -4)
  for (const cx of [-76, -26, 26, 76]) {
    addBox(faces, edges, cx, -4, 0, 2.4, 1.8, 26, '#475569', true);
  }

  // 4 gusseted support legs with flanged floor footpads (local y: -34 -> world y: -48)
  for (const lx of [-74, 74]) {
    for (const lz of [-27.5, 27.5]) {
      addBox(faces, edges, lx, -15, lz, 3.5, 18.0, 2.6, '#334155', true);
      addBox(faces, edges, lx + (lx < 0 ? 5 : -5), 0, lz, 4.0, 4.0, 1.2, '#475569', true);
      addBox(faces, edges, lx, -33.2, lz, 6.6, 1.3, 5.2, '#1E293B', true);
      addCylinderZ(faces, edges, lz - 3.4, lz - 2.0, 1.1, 1.1, 0, 0, 6, {
        cx: lx - 4.0,
        cy: -31.6,
        colorHex: '#94A3B8',
      });
      addCylinderZ(faces, edges, lz + 2.0, lz + 3.4, 1.1, 1.1, 0, 0, 6, {
        cx: lx + 4.0,
        cy: -31.6,
        colorHex: '#94A3B8',
      });
    }
  }

  // Snub-pulley mounting brackets & roller safely below return belt (world y = -13.5 -> local y = +0.5)
  for (const sz of [-27, 27]) {
    addBox(faces, edges, 70, 2.5, sz, 4.2, 4.0, 1.4, '#475569', true);
  }
  addCylinderZ(faces, edges, -24, 24, 3.0, 3.0, 0, 0, 12, {
    cx: 70,
    cy: 0.5,
    colorHex: '#64748B',
  });

  return compileMesh(faces, edges, [0, 8, 28], baseHex);
}

function buildBeltHeadPulley(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Crowned steel drum (r: 12.6, z: -23..+23) — cleanly inside belt rIn = 14.6!
  addCylinderZ(faces, edges, -23, 23, 12.6, 12.6, 3.8, 3.8, 18, { colorHex: '#475569' });

  // Orange diamond-lagging bands (r: 13.2)
  for (const lz of [-18, -9, 0, 9, 18]) {
    addCylinderZ(faces, edges, lz - 3.2, lz + 3.2, 13.2, 13.2, 12.6, 12.6, 18, {
      colorHex: '#EA580C',
      addRimEdges: true,
    });
  }

  // Subtle traction ribs (r: 13.35) so pulley rotation is crystal clear
  const ribCount = 12;
  for (let i = 0; i < ribCount; i++) {
    const a = (i / ribCount) * Math.PI * 2;
    const rx = 13.35 * Math.cos(a);
    const ry = 13.35 * Math.sin(a);
    addOrientedCylinder(faces, edges, [rx, ry, -22], [rx, ry, 22], 0.55, 6, {
      colorHex: '#1E293B',
      addRimEdges: false,
    });
  }

  // Protruding alloy drive shaft & taper-lock hubs
  addCylinderZ(faces, edges, -32, 46, 3.3, 3.3, 0, 0, 12, { colorHex: '#CBD5E1' });
  addCylinderZ(faces, edges, -26, -23, 6.0, 6.0, 3.3, 3.3, 12, { colorHex: '#334155' });
  addCylinderZ(faces, edges, 23, 26, 6.0, 6.0, 3.3, 3.3, 12, { colorHex: '#334155' });

  return compileMesh(faces, edges, [0, 13.5, 0], baseHex);
}

function buildBeltTailPulley(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Central hub drum & end rings (r: 12.2, z: -23..+23) — cleanly inside belt rIn = 14.6!
  addCylinderZ(faces, edges, -23, 23, 4.8, 4.8, 3.0, 3.0, 12, { colorHex: '#64748B' });
  addCylinderZ(faces, edges, -23, -20.8, 12.2, 12.2, 8.6, 8.6, 16);
  addCylinderZ(faces, edges, 20.8, 23, 12.2, 12.2, 8.6, 8.6, 16);

  // 8 radial self-cleaning wing fins (r: 4.8..12.2)
  const wingCount = 8;
  for (let i = 0; i < wingCount; i++) {
    const a = (i / wingCount) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const nx = -sa * 0.8;
    const ny = ca * 0.8;
    const r0 = 4.8;
    const r1 = 12.2;
    const p: Vec3[] = [
      [r0 * ca - nx, r0 * sa - ny, -22],
      [r1 * ca - nx, r1 * sa - ny, -22],
      [r1 * ca + nx, r1 * sa + ny, -22],
      [r0 * ca + nx, r0 * sa + ny, -22],
      [r0 * ca - nx, r0 * sa - ny, 22],
      [r1 * ca - nx, r1 * sa - ny, 22],
      [r1 * ca + nx, r1 * sa + ny, 22],
      [r0 * ca + nx, r0 * sa + ny, 22],
    ];
    const quads: [number, number, number, number][] = [
      [0, 3, 2, 1],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [1, 2, 6, 5],
    ];
    for (const [q0, q1, q2, q3] of quads) {
      faces.push({ verts: [p[q0], p[q1], p[q2], p[q3]], cullBackface: true });
    }
    edges.push({ a: p[1], b: p[5] });
    edges.push({ a: p[2], b: p[6] });
  }

  // Through shaft & ACME take-up screw collars
  addCylinderZ(faces, edges, -34, 34, 3.0, 3.0, 0, 0, 10, { colorHex: '#CBD5E1' });
  addCylinderZ(faces, edges, -31, -27, 5.2, 5.2, 3.0, 3.0, 6, { colorHex: '#F59E0B' });
  addCylinderZ(faces, edges, 27, 31, 5.2, 5.2, 3.0, 3.0, 6, { colorHex: '#F59E0B' });
  for (const sz of [-29, 29]) {
    addBox(faces, edges, 0, 0, sz, 5, 4.2, 2.2, '#334155');
    addOrientedCylinder(faces, edges, [-14, 0, sz], [6, 0, sz], 1.3, 8, {
      colorHex: '#F59E0B',
    });
  }

  return compileMesh(faces, edges, [0, 12.5, 0], baseHex);
}

function buildBeltIdlerSet(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // THREE spaced 3-roll troughing carry idler assemblies (x = -44, 0, +44)
  // Mounting cross-bars seat on the upper cross-ties (local y = 9.6 -> world y = 15.6)
  // Every roller stays tucked strictly UNDERNEATH and INSIDE the troughed belt canopy (z in [-23, +23])
  for (const ix of [-44, 0, 44]) {
    addBox(faces, edges, ix, 9.6, 0, 1.8, 0.8, 23.0, '#475569');
    addBox(faces, edges, ix, 11.8, -21.2, 1.3, 2.2, 1.0, '#475569');
    addBox(faces, edges, ix, 11.8, 21.2, 1.3, 2.2, 1.0, '#475569');
    addBox(faces, edges, ix, 11.0, -9.2, 1.2, 1.4, 0.8, '#64748B');
    addBox(faces, edges, ix, 11.0, 9.2, 1.2, 1.4, 0.8, '#64748B');

    // Horizontal center carry roll (r = 1.85, cy = 12.5 -> top = 14.35 < 14.8 belt bottom)
    addCylinderZ(faces, edges, -8.6, 8.6, 1.85, 1.85, 0, 0, 12, {
      cx: ix,
      cy: 12.5,
      colorHex: '#10B981',
    });

    // Angled wing rolls matched strictly to 0.20 belt wing slope cleanly under belt wings
    const zStart = 9.6;
    const zEnd = 20.6;
    const yStart = 12.6;
    const yEnd = 12.6 + (zEnd - zStart) * 0.2;
    addOrientedCylinder(faces, edges, [ix, yStart, zStart], [ix, yEnd, zEnd], 1.75, 10, {
      colorHex: '#10B981',
    });
    addOrientedCylinder(faces, edges, [ix, yStart, -zStart], [ix, yEnd, -zEnd], 1.75, 10, {
      colorHex: '#10B981',
    });
  }

  // TWO flat steel return rollers strictly underneath bottom return belt (-16.4)
  for (const rx of [-42, 42]) {
    addBox(faces, edges, rx, -15.5, -26.0, 1.5, 4.2, 1.2, '#475569');
    addBox(faces, edges, rx, -15.5, 26.0, 1.5, 4.2, 1.2, '#475569');
    addCylinderZ(faces, edges, -24.5, 24.5, 2.0, 2.0, 0, 0, 10, {
      cx: rx,
      cy: -19.0,
      colorHex: '#94A3B8',
    });
  }

  return compileMesh(faces, edges, [0, 13, 21], baseHex);
}

function buildBeltLoop(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Belt wraps cleanly OUTSIDE both pulleys (rIn = 14.8 > 13.4 head pulley / 12.2 tail pulley)
  const rIn = 14.8;
  const rOut = 16.4;
  const xSpan = 92;
  const arcSegs = 10;

  const smoothTroughAtX = (x: number): number => {
    const ax = Math.abs(x);
    if (ax <= 62) return 1;
    if (ax >= 90) return 0;
    const u = (ax - 62) / 28;
    const smooth = u * u * (3 - 2 * u);
    return 1 - smooth;
  };

  const addBeltSliceQuad = (
    p0: { x: number; y: number; nx: number; ny: number; trough: number },
    p1: { x: number; y: number; nx: number; ny: number; trough: number }
  ) => {
    const getProfile = (p: typeof p0, z: number, lift: number): Vec3 => {
      const absZ = Math.abs(z);
      const wingRise = absZ > 9.5 ? (absZ - 9.5) * 0.2 * p.trough : 0;
      return [
        p.x + p.nx * lift,
        p.y + p.ny * lift + wingRise,
        z,
      ];
    };

    const zStops = [-23, -9.5, 9.5, 23];
    for (let s = 0; s < zStops.length - 1; s++) {
      const za = zStops[s];
      const zb = zStops[s + 1];
      const o0a = getProfile(p0, za, rOut);
      const o1a = getProfile(p1, za, rOut);
      const o0b = getProfile(p0, zb, rOut);
      const o1b = getProfile(p1, zb, rOut);

      const i0a = getProfile(p0, za, rIn);
      const i1a = getProfile(p1, za, rIn);
      const i0b = getProfile(p0, zb, rIn);
      const i1b = getProfile(p1, zb, rIn);

      // Outward-wound outer rubber cover & inward-wound inner carcass ply
      faces.push({ verts: [o0a, o0b, o1b, o1a], colorHex: '#1E293B', cullBackface: false });
      faces.push({ verts: [i0a, i1a, i1b, i0b], colorHex: '#475569', cullBackface: false });
      edges.push({ a: o0a, b: o0b });

      if (s === 0) {
        faces.push({ verts: [o0a, i0a, i1a, o1a], colorHex: '#64748B', cullBackface: false });
        edges.push({ a: o0a, b: o1a });
        edges.push({ a: i0a, b: i1a });
      }
      if (s === zStops.length - 2) {
        faces.push({ verts: [o0b, o1b, i1b, i0b], colorHex: '#64748B', cullBackface: false });
        edges.push({ a: o0b, b: o1b });
        edges.push({ a: i0b, b: i1b });
      }
    }
  };

  // Smooth trough-to-flat top run (-92 -> +92) + flat arcs + flat return run
  const loopPts: { x: number; y: number; nx: number; ny: number; trough: number }[] = [];
  const topXs = [-92, -80, -68, -56, -32, 0, 32, 56, 68, 80, 92];
  for (const x of topXs) {
    loopPts.push({ x, y: 0, nx: 0, ny: 1, trough: smoothTroughAtX(x) });
  }
  for (let i = 1; i <= arcSegs; i++) {
    const a = Math.PI * 0.5 - (i / arcSegs) * Math.PI;
    loopPts.push({ x: xSpan, y: 0, nx: Math.cos(a), ny: Math.sin(a), trough: 0 });
  }
  loopPts.push({ x: 0, y: 0, nx: 0, ny: -1, trough: 0 });
  for (let i = 0; i < arcSegs; i++) {
    const a = -Math.PI * 0.5 - (i / arcSegs) * Math.PI;
    loopPts.push({ x: -xSpan, y: 0, nx: Math.cos(a), ny: Math.sin(a), trough: 0 });
  }

  for (let i = 0; i < loopPts.length; i++) {
    addBeltSliceQuad(loopPts[i], loopPts[(i + 1) % loopPts.length]);
  }

  return compileMesh(faces, edges, [0, 17, 0], baseHex);
}

function buildBeltDriveMotor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addBox(faces, edges, 0, -4, 0, 10, 12, 7.5, '#334155');
  addCylinderZ(faces, edges, -9, 9, 6.8, 6.8, 3.3, 3.3, 14, { colorHex: '#64748B' });

  const motY = -7;
  const motZ = 3;
  addOrientedCylinder(faces, edges, [-10, motY, motZ], [-40, motY, motZ], 9.2, 14, {
    colorHex: '#1D4ED8',
  });
  for (const fx of [-15, -21, -27, -33]) {
    addOrientedCylinder(faces, edges, [fx - 0.8, motY, motZ], [fx + 0.8, motY, motZ], 10.8, 14, {
      colorHex: '#0284C7',
      addRimEdges: false,
    });
  }
  addOrientedCylinder(faces, edges, [-40, motY, motZ], [-46, motY, motZ], 9.5, 12, {
    colorHex: '#1E293B',
  });
  addBox(faces, edges, -20, motY + 10.8, motZ, 4.5, 3, 4.5, '#0F172A');

  addOrientedCylinder(faces, edges, [0, -15, 0], [-14, -22, -18], 2.2, 8, {
    colorHex: '#F59E0B',
  });

  return compileMesh(faces, edges, [-24, 6, 4], baseHex);
}

function buildBeltHopperSkirt(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Tapered loading chute (world y = 24..44 -> local y = -4..+16)
  const t: Vec3[] = [
    [-16, 16, -18],
    [16, 16, -18],
    [16, 16, 18],
    [-16, 16, 18],
  ];
  const b: Vec3[] = [
    [-12, -4, -14],
    [12, -4, -14],
    [12, -4, 14],
    [-12, -4, 14],
  ];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    faces.push({
      verts: [t[i], t[j], b[j], b[i]],
      isHousingShell: true,
      cullBackface: false,
    });
    edges.push({ a: t[i], b: t[j], isHousingShell: true });
    edges.push({ a: b[i], b: b[j], isHousingShell: true });
    edges.push({ a: t[i], b: b[i], isHousingShell: true });
  }
  addBox(faces, edges, 0, 16.8, -18.5, 17, 1.0, 1.4, '#64748B', true);
  addBox(faces, edges, 0, 16.8, 18.5, 17, 1.0, 1.4, '#64748B', true);

  // Horizontal rubber skirtboard sealing strips tucked cleanly inside the troughed belt (world y = 23 -> local y = -5, z = ±13.5)
  for (const sz of [-13.5, 13.5]) {
    addBox(faces, edges, 24, -4.5, sz, 14, 2.0, 0.9, '#1E293B', true);
    addBox(faces, edges, 24, -2.5, sz + (sz > 0 ? 1.0 : -1.0), 14, 1.8, 0.7, '#475569', true);
  }

  return compileMesh(faces, edges, [0, 16, 18], baseHex);
}

function buildBeltCleanerTakeup(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Primary scraper blade presses cleanly against the outer belt face (world x = 92 + 17 = 109 -> local x = +11)
  addBox(faces, edges, 11, 10, 0, 2.0, 3.8, 22, '#F59E0B');
  addCylinderZ(faces, edges, -30, 30, 1.8, 1.8, 0, 0, 10, { cx: 11, cy: 5, colorHex: '#CBD5E1' });

  for (const sz of [-28, 28]) {
    addOrientedCylinder(faces, edges, [11, 5, sz], [14, -4, sz], 1.6, 8, {
      colorHex: '#94A3B8',
    });
    addOrientedCylinder(faces, edges, [14, -4, sz], [14, 6, sz], 2.6, 10, {
      colorHex: '#EAB308',
    });
  }

  // Twin UCP pillow block housings aligned to head pulley shaft (world x = 92 -> local x = -6, world y = 6 -> local y = 16)
  for (const sz of [-29, 29]) {
    addBox(faces, edges, -6, 10, sz, 7.0, 2.0, 4.0, '#334155');
    addBox(faces, edges, -6, 13.8, sz, 4.6, 3.4, 3.6, '#475569');
    addCylinderZ(faces, edges, sz - 3.8, sz + 3.8, 5.0, 5.0, 3.3, 3.3, 12, {
      cx: -6,
      cy: 16,
      colorHex: '#64748B',
    });
  }

  return compileMesh(faces, edges, [4, 12, 28], baseHex);
}

// --- En-Masse & Scraper Drag Chain Conveyor Part Builders ---

function buildChainGuard(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Dust-tight top cover sitting flush on U-trough flange at world y = 22.5..24.5 (local y = -0.5..+1.5)
  addBox(faces, edges, 0, 0.5, 0, 100, 1.2, 24, undefined, true);

  for (let bx = -88; bx <= 88; bx += 22) {
    for (const bz of [-22, 22]) {
      addBox(faces, edges, bx, 2.1, bz, 1.5, 0.8, 1.3, '#CBD5E1', true);
    }
  }

  for (const lx of [-48, 0, 48]) {
    addBox(faces, edges, lx, 2.0, 0, 1.2, 0.7, 24, '#475569', true);
    addBox(faces, edges, lx + 12, 2.6, 18, 4.0, 0.8, 1.4, '#F59E0B', true);
    addBox(faces, edges, lx + 12, 2.6, -18, 4.0, 0.8, 1.4, '#F59E0B', true);
  }

  addBox(faces, edges, 18, 2.2, 0, 14, 0.7, 10, '#0F172A', true);

  return compileMesh(faces, edges, [0, 3, 18], baseHex);
}

function buildChainMotor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addBox(faces, edges, 0, -4, 0, 11, 13, 8.5, '#334155');
  addCylinderZ(faces, edges, -10, 10, 7.6, 7.6, 4.0, 4.0, 14, { colorHex: '#64748B' });

  const motY = -7;
  const motZ = 3;
  addOrientedCylinder(faces, edges, [-11, motY, motZ], [-44, motY, motZ], 10.2, 14, {
    colorHex: '#1D4ED8',
  });
  for (const fx of [-16, -22, -28, -34, -40]) {
    addOrientedCylinder(faces, edges, [fx - 0.8, motY, motZ], [fx + 0.8, motY, motZ], 11.8, 14, {
      colorHex: '#0284C7',
      addRimEdges: false,
    });
  }
  addOrientedCylinder(faces, edges, [-44, motY, motZ], [-50, motY, motZ], 10.5, 12, {
    colorHex: '#1E293B',
  });
  addBox(faces, edges, -24, motY + 11.8, motZ, 5.0, 3.2, 5.0, '#0F172A');

  addOrientedCylinder(faces, edges, [0, -16, 0], [-16, -24, -18], 2.5, 8, {
    colorHex: '#F59E0B',
  });

  return compileMesh(faces, edges, [-24, 6, 4], baseHex);
}

function buildChainDriverSprocket(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Twin 3D toothed head drive sprockets (r: 14.0, cleanly INSIDE +102 trough end wall!)
  for (const sz of [-10, 10]) {
    addSprocket3D(faces, edges, 14, 11.6, 14.0, sz - 3.2, sz + 3.2, 4.2, undefined, 5);
  }
  addCylinderZ(faces, edges, -7, 7, 7.8, 7.8, 4.2, 4.2, 14, { colorHex: '#475569' });
  addBox(faces, edges, 0, 4.6, 0, 1.3, 1.1, 24, '#F59E0B');

  // Keyed drive shaft protruding cleanly to pillow blocks (z=-34) & gearmotor (z=+48)
  addCylinderZ(faces, edges, -34, 48, 4.0, 4.0, 0, 0, 14, { colorHex: '#CBD5E1' });

  return compileMesh(faces, edges, [0, 14, 0], baseHex);
}

function buildChainDrivenSprocket(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Twin tail return sprockets (r: 13.5, cleanly INSIDE -102 trough end wall!)
  for (const sz of [-10, 10]) {
    addSprocket3D(faces, edges, 14, 11.2, 13.5, sz - 3.0, sz + 3.0, 3.8, undefined, 5);
  }
  addCylinderZ(faces, edges, -28, 28, 3.8, 3.8, 0, 0, 12, { colorHex: '#CBD5E1' });

  // External ACME screw take-up slide blocks & tensioner collars outside trough wall (z: ±26)
  for (const sz of [-26, 26]) {
    addBox(faces, edges, 0, 0, sz, 5.2, 4.4, 2.2, '#334155');
    addCylinderZ(faces, edges, sz - 2.4, sz + 2.4, 5.2, 5.2, 3.8, 3.8, 6, {
      colorHex: '#F59E0B',
    });
  }

  return compileMesh(faces, edges, [0, 13.5, 0], baseHex);
}

function buildChainRollerLoop(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Twin static forged chain guide rails along top & bottom runs (moving flights & links are rendered dynamically!)
  for (const cz of [-10, 10]) {
    addBox(faces, edges, 0, 14.6, cz, 82, 0.7, 1.6, '#475569');
    addBox(faces, edges, 0, -14.6, cz, 82, 0.7, 1.6, '#475569');
  }

  return compileMesh(faces, edges, [0, 15, 10], baseHex);
}

function buildChainTensioner(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // U-trough bottom floor (y: -21) + end caps (x: ±101)
  addBox(faces, edges, 0, -21, 0, 102, 1.4, 24, undefined, true);
  addBox(faces, edges, -101, 0, 0, 1.4, 22, 24, undefined, true);
  addBox(faces, edges, 101, 0, 0, 1.4, 22, 24, undefined, true);

  // BOTH front wall (z: -24, facing default Iso camera) & back wall (z: +24) feature a flanged cutaway viewing window (x: -58..+58, opening y: -15..+16.5)
  for (const wz of [-24, 24]) {
    const mullionZ = wz < 0 ? wz - 0.4 : wz + 0.4;
    addBox(faces, edges, -80, 0, wz, 22, 22, 1.4, undefined, true);
    addBox(faces, edges, 80, 0, wz, 22, 22, 1.4, undefined, true);
    addBox(faces, edges, 0, -18.5, wz, 58, 3.5, 1.4, undefined, true);
    addBox(faces, edges, 0, 19.25, wz, 58, 2.75, 1.4, undefined, true);
    // Window mullions around cutaway opening at x = ±20
    addBox(faces, edges, -20, 0.75, mullionZ, 1.5, 15.75, 0.9, '#475569', true);
    addBox(faces, edges, 20, 0.75, mullionZ, 1.5, 15.75, 0.9, '#475569', true);
  }

  // Top perimeter flange lips
  addBox(faces, edges, 0, 22.5, -25.2, 102, 1.0, 2.2, '#475569', true);
  addBox(faces, edges, 0, 22.5, 25.2, 102, 1.0, 2.2, '#475569', true);

  // Green/amber UHMW-PE bottom wear liner strips inside trough floor (top = -18.6)
  addBox(faces, edges, 0, -19.5, -10, 94, 0.9, 5.5, '#10B981');
  addBox(faces, edges, 0, -19.5, 10, 94, 0.9, 5.5, '#10B981');
  addBox(faces, edges, 0, -19.5, 0, 94, 0.8, 3.2, '#F59E0B');

  // Open intermediate return-chain support ledges & narrow center wear rail so lower carry flights & UHMW liner stay clearly visible
  addBox(faces, edges, 0, 2.0, -17.5, 64, 0.9, 4.2, '#475569', true);
  addBox(faces, edges, 0, 2.0, 17.5, 64, 0.9, 4.2, '#475569', true);
  addBox(faces, edges, 0, 2.0, 0, 64, 0.8, 2.2, '#64748B', true);

  // Bolted support saddle feet down to y = -44
  for (const sx of [-74, 0, 74]) {
    addBox(faces, edges, sx, -23.5, 0, 4.5, 1.8, 25, '#334155', true);
    for (const sz of [-21, 21]) {
      addBox(faces, edges, sx, -33.5, sz, 3.4, 9.2, 2.8, '#334155', true);
      addBox(faces, edges, sx, -43.0, sz, 6.2, 1.2, 5.0, '#1E293B', true);
    }
  }

  return compileMesh(faces, edges, [0, 4, 24], baseHex);
}

function buildChainShafts(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Tapered Feed Inlet Hopper sitting flush on top cover (world y = 24..44 -> local y = 0..20)
  const t: Vec3[] = [
    [-16, 20, -18],
    [16, 20, -18],
    [16, 20, 18],
    [-16, 20, 18],
  ];
  const b: Vec3[] = [
    [-12, 0, -14],
    [12, 0, -14],
    [12, 0, 14],
    [-12, 0, 14],
  ];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    faces.push({
      verts: [t[i], t[j], b[j], b[i]],
      isHousingShell: true,
      cullBackface: false,
    });
    edges.push({ a: t[i], b: t[j], isHousingShell: true });
    edges.push({ a: b[i], b: b[j], isHousingShell: true });
    edges.push({ a: t[i], b: b[i], isHousingShell: true });
  }
  addBox(faces, edges, 0, 20.8, -18.5, 17, 0.9, 1.4, '#64748B', true);
  addBox(faces, edges, 0, 20.8, 18.5, 17, 0.9, 1.4, '#64748B', true);

  // Bottom Discharge Chute & Slide Gate bolted flush under trough floor at head end (world x = +80 -> local x = +144, world y = -24.5..-29.5 -> local y = -48.5..-53.5)
  addBox(faces, edges, 144, -48.5, 0, 11, 4.0, 15, '#475569', true);
  addBox(faces, edges, 144, -53.5, 0, 13, 1.1, 17, '#334155', true);
  addBox(faces, edges, 134, -51.2, 0, 12, 0.9, 16, '#F59E0B');
  addOrientedCylinder(faces, edges, [122, -51.2, 0], [110, -51.2, 0], 1.4, 8, {
    colorHex: '#CBD5E1',
  });

  return compileMesh(faces, edges, [0, 14, 16], baseHex);
}

function buildChainPillowBlocks(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Twin cast-iron flange/pillow block bearings mounted outside trough walls (local z=0 -> world -29, local z=58 -> world +29)
  for (const bz of [0, 58]) {
    addBox(faces, edges, 0, -10, bz, 15, 2.2, 6.0, '#334155');
    addBox(faces, edges, 0, -2, bz, 8.2, 6.2, 5.2, '#475569');
    addCylinderZ(faces, edges, bz - 5.5, bz + 5.5, 8.8, 8.8, 4.0, 4.0, 16, {
      colorHex: '#64748B',
    });
    addCylinderZ(faces, edges, bz - 7.0, bz - 5.5, 6.5, 6.5, 4.0, 4.0, 12, {
      colorHex: '#0F172A',
    });
    addOrientedCylinder(faces, edges, [0, 8.8, bz], [0, 11.8, bz], 1.1, 6, {
      colorHex: '#F59E0B',
    });
    addCylinderZ(faces, edges, bz - 2, bz + 2, 1.5, 1.5, 0, 0, 6, {
      cx: -11,
      cy: -7.5,
      colorHex: '#CBD5E1',
    });
    addCylinderZ(faces, edges, bz - 2, bz + 2, 1.5, 1.5, 0, 0, 6, {
      cx: 11,
      cy: -7.5,
      colorHex: '#CBD5E1',
    });
  }

  return compileMesh(faces, edges, [0, 6, 0], baseHex);
}

// --- Seishin SK-60 Pneumatic Air Knocker Part Builders ---

function buildKnockerPilotValve(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Brass 1/4" PT hex bushing threaded into top head flange boss (world y = 41.5..45.5)
  addCylinderY(faces, edges, -2.5, 1.5, 6.4, 6.4, 0, 0, 6, { colorHex: '#F59E0B' });
  addCylinderY(faces, edges, 1.5, 4.0, 4.2, 4.2, 0, 0, 10, { colorHex: '#D97706' });

  // Blue anodized 3-way quick-exhaust pilot solenoid manifold block
  addBox(faces, edges, 0, 8.2, 0, 9.5, 4.4, 7.2, baseHex);
  addBox(faces, edges, 0, 14.5, 0, 6.2, 2.2, 5.5, '#1E293B');
  addCylinderY(faces, edges, 16.7, 19.2, 3.2, 3.2, 0, 0, 10, { colorHex: '#EF4444' });

  // Left sintered bronze quick-exhaust silencer muffler
  addOrientedCylinder(faces, edges, [-9.5, 8.2, 0], [-15.5, 8.2, 0], 3.4, 10, {
    colorHex: '#CBD5E1',
  });
  addOrientedCylinder(faces, edges, [-15.5, 8.2, 0], [-25.5, 8.2, 0], 4.8, 12, {
    colorHex: '#D97706',
  });

  // Right brass 90-deg push-in air supply fitting & 1/4" inlet elbow
  addOrientedCylinder(faces, edges, [9.5, 8.2, 0], [16.5, 8.2, 0], 3.0, 8, {
    colorHex: '#F59E0B',
  });
  addCylinderY(faces, edges, 8.2, 16.5, 3.4, 3.4, 2.1, 2.1, 10, {
    cx: 16.5,
    cz: 0,
    colorHex: '#06B6D4',
  });

  return compileMesh(faces, edges, [12, 10, 0], baseHex);
}

function buildKnockerHeadFlange(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Ø121 mm scaled top flange plate (local y = -5..0 -> world y = 27..32) + domed pressure cap
  addCylinderY(faces, edges, -5.0, 0.0, 28.0, 28.0, 4.0, 4.0, 24, { colorHex: baseHex });
  addCylinderY(faces, edges, 0.0, 6.5, 22.8, 14.5, 4.0, 4.0, 20, { colorHex: '#1D4ED8' });
  addCylinderY(faces, edges, 6.5, 9.5, 9.2, 9.2, 3.6, 3.6, 14, { colorHex: '#94A3B8' });

  // 6 × M10 hex socket bolts around head flange
  for (let k = 0; k < 6; k++) {
    const th = (k / 6) * Math.PI * 2 + Math.PI / 6;
    const bx = 23.8 * Math.cos(th);
    const bz = 23.8 * Math.sin(th);
    addCylinderY(faces, edges, -1.0, 2.2, 2.3, 2.3, 0, 0, 6, {
      cx: bx,
      cz: bz,
      colorHex: '#CBD5E1',
    });
  }

  // Head flange NBR sealing O-ring seated underneath
  addCylinderY(faces, edges, -5.8, -4.8, 21.8, 21.8, 19.8, 19.8, 20, { colorHex: '#0F172A' });

  return compileMesh(faces, edges, [-20, 4, -14], baseHex);
}

function buildKnockerAnchorPlate(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Precision-ground steel ferromagnetic anchor plate (world y = 22..26) with center 1/4" air injection orifice
  addCylinderY(faces, edges, -2.0, 2.0, 26.5, 26.5, 3.2, 3.2, 22, { colorHex: baseHex });
  addCylinderY(faces, edges, -2.3, -1.7, 13.8, 13.8, 4.8, 4.8, 18, { colorHex: '#CBD5E1' });

  // Elastomer anchor gasket ring around perimeter seat
  addCylinderY(faces, edges, 2.0, 3.0, 25.0, 25.0, 21.6, 21.6, 20, { colorHex: '#1E293B' });

  return compileMesh(faces, edges, [24, 0, -10], baseHex);
}

function buildKnockerMagneticPiston(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Alloy piston head mass (local y = 0..12 -> world y = 8..20)
  addCylinderY(faces, edges, 0.0, 12.0, 18.0, 18.0, 0, 0, 20, { colorHex: baseHex });
  // Top embedded Neodymium permanent magnet pole face (world y = 20..22 -> contacts Anchor Plate at +22)
  addCylinderY(faces, edges, 12.0, 14.0, 13.5, 13.5, 4.5, 4.5, 18, { colorHex: '#2563EB' });

  // Red silicone pressure seal O-ring + bronze-PTFE guide wear band
  addCylinderY(faces, edges, 7.6, 9.6, 18.8, 18.8, 17.5, 17.5, 20, { colorHex: '#EF4444' });
  addCylinderY(faces, edges, 2.5, 5.5, 18.6, 18.6, 17.5, 17.5, 20, { colorHex: '#D97706' });

  // Hardened striker impact shank extending down into point bush (local y = -25..0 -> world y = -17..+8)
  addCylinderY(faces, edges, -25.0, 0.0, 8.8, 9.4, 0, 0, 14, { colorHex: '#64748B' });
  addCylinderY(faces, edges, -25.5, -23.0, 9.6, 8.8, 0, 0, 14, { colorHex: '#F8FAFC' });

  return compileMesh(faces, edges, [-14, 8, -14], baseHex);
}

function buildKnockerReturnSpring(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // 6.5-turn SWP-B helical compression return spring (local y = -13..+9 -> world y = -19..+3)
  addHelicalSpringY(faces, edges, 0, 0, -13.0, 9.0, 13.6, 1.45, 6.5, 10, baseHex);

  return compileMesh(faces, edges, [16, -2, -12], baseHex);
}

function buildKnockerCylinderBody(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Open front cutaway sector (-0.32*PI .. +1.08*PI) leaves 108 deg front window facing Iso camera
  const th0 = -0.32 * Math.PI;
  const th1 = 1.08 * Math.PI;

  // Main honed cylinder pressure barrel (y = -21..+22)
  addCylinderY(faces, edges, -21.0, 22.0, 22.5, 22.5, 19.0, 19.0, 16, {
    colorHex: baseHex,
    isHousingShell: true,
    thetaStart: th0,
    thetaEnd: th1,
  });

  // Top head flange collar (rOut = 28) & bottom mounting flange collar (rOut = 28)
  addCylinderY(faces, edges, 22.0, 26.5, 28.0, 28.0, 19.0, 19.0, 16, {
    colorHex: '#2563EB',
    isHousingShell: true,
    thetaStart: th0,
    thetaEnd: th1,
  });
  addCylinderY(faces, edges, -25.5, -21.0, 28.0, 28.0, 18.8, 18.8, 16, {
    colorHex: '#2563EB',
    isHousingShell: true,
    thetaStart: th0,
    thetaEnd: th1,
  });

  // Lower spout skirt down to base anvil (y = -34..-25.5) with matching front inspection window
  addCylinderY(faces, edges, -34.0, -25.5, 18.5, 18.5, 15.0, 15.0, 14, {
    colorHex: '#1D4ED8',
    isHousingShell: true,
    thetaStart: th0,
    thetaEnd: th1,
  });

  // Circumferential reinforcing rings & axial ribs along the solid barrel walls
  for (const ry of [-12, 0, 12]) {
    addCylinderY(faces, edges, ry - 1.0, ry + 1.0, 24.4, 24.4, 22.4, 22.4, 16, {
      colorHex: '#60A5FA',
      isHousingShell: true,
      thetaStart: th0,
      thetaEnd: th1,
    });
  }
  for (const ra of [-0.18 * Math.PI, 0.25 * Math.PI, 0.65 * Math.PI, 0.96 * Math.PI]) {
    const rx = 23.6 * Math.cos(ra);
    const rz = 23.6 * Math.sin(ra);
    addBox(faces, edges, rx, 0.5, rz, 1.4, 20.5, 1.4, '#1D4ED8', true);
  }

  return compileMesh(faces, edges, [24, 6, 8], baseHex);
}

function buildKnockerPointBush(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Phosphor-bronze striker point guide bush (local y = -5..+5 -> world y = -32..-22)
  addCylinderY(faces, edges, -5.0, 5.0, 14.4, 14.4, 9.6, 9.6, 16, { colorHex: baseHex });
  // Polyurethane return damper & cushion ring on top (world y = -22..-19)
  addCylinderY(faces, edges, 5.0, 8.0, 15.2, 15.2, 9.6, 9.6, 16, { colorHex: '#10B981' });

  return compileMesh(faces, edges, [-18, 2, -12], baseHex);
}

function buildKnockerBasePlate(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Curved steel silo / hopper wall backing section (world y = -48..-44.5)
  addBox(faces, edges, 0, -7.2, 0, 48, 1.8, 28, '#1E293B', true);

  // Welded 200 × 90 × 13 mm carbon steel base plate (hx = 42, hz = 22, local y = -5.4..-1.8)
  addBox(faces, edges, 0, -3.6, 0, 42, 1.8, 22, baseHex, true);

  // Central hardened anvil striker pad (local y = -1.8..+7.0 -> anvil face at world y = -32.0!)
  addCylinderY(faces, edges, -1.8, 7.0, 15.2, 14.5, 0, 0, 16, { colorHex: '#64748B' });
  addCylinderY(faces, edges, 5.5, 7.2, 11.2, 11.2, 0, 0, 14, { colorHex: '#94A3B8' });

  // Outer mounting wing studs on 200×90 plate
  for (const sx of [-34, 34]) {
    addCylinderY(faces, edges, -1.8, 4.5, 2.8, 2.8, 0, 0, 8, {
      cx: sx,
      cz: 0,
      colorHex: '#CBD5E1',
    });
    addCylinderY(faces, edges, -1.5, 1.2, 4.8, 4.8, 2.8, 2.8, 6, {
      cx: sx,
      cz: 0,
      colorHex: '#F59E0B',
    });
  }

  // 4 base flange studs + double wedge Hard-Lock nuts clamping cylinder flange (r = 24.7)
  for (const [bx, bz] of [
    [-17.5, -17.5],
    [17.5, -17.5],
    [17.5, 17.5],
    [-17.5, 17.5],
  ]) {
    addCylinderY(faces, edges, -1.8, 19.5, 2.1, 2.1, 0, 0, 6, {
      cx: bx,
      cz: bz,
      colorHex: '#CBD5E1',
    });
    // Convex lower Hard-Lock nut & upper lock nut resting on cylinder flange (world y = -21)
    addCylinderY(faces, edges, 16.5, 18.4, 3.8, 3.8, 2.1, 2.1, 6, {
      cx: bx,
      cz: bz,
      colorHex: '#F59E0B',
    });
    addCylinderY(faces, edges, 18.4, 19.8, 3.6, 3.6, 2.1, 2.1, 6, {
      cx: bx,
      cz: bz,
      colorHex: '#E2E8F0',
    });
  }

  return compileMesh(faces, edges, [34, -2, -16], baseHex);
}

// --- SKAKO 50D Electromagnetic Linear Vibrator Unit Builders (Pos. 1-13 Blueprint) ---

function buildSkakoMagnet(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 1: Central laminated stator core + epoxy-potted copper excitation coil inside armature window
  addBox(faces, edges, 0, 0, 0, 10.5, 5.4, 9.8, '#64748B');
  addBox(faces, edges, 0, 0, 0, 8.2, 4.0, 10.4, baseHex);
  addBox(faces, edges, 0, 0, 0, 5.5, 2.6, 10.9, '#CBD5E1');
  addBox(faces, edges, 0, -5.8, 0, 11.2, 1.0, 8.6, '#334155');

  return compileMesh(faces, edges, [-2, 2, -11], baseHex);
}

function buildSkakoArmature(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 2: Heavy rectangular perforated steel frame wrapping cleanly around Pos. 1 Magnet
  addBox(faces, edges, 0, 9.0, 0, 18.0, 2.5, 9.0, baseHex);   // Top bar
  addBox(faces, edges, 0, -9.0, 0, 18.0, 2.5, 9.0, baseHex);  // Bottom bar
  addBox(faces, edges, -14.8, 0, 0, 3.2, 6.5, 9.0, baseHex);  // Left bar
  addBox(faces, edges, 14.8, 0, 0, 3.2, 6.5, 9.0, baseHex);   // Right bar

  // 10 blueprint mounting bolt bosses (3 top, 3 bottom, 2 left, 2 right) on front & back faces
  for (const bx of [-10, 0, 10]) {
    for (const by of [-9.0, 9.0]) {
      addCylinderZ(faces, edges, -9.5, 9.5, 1.15, 1.15, 0, 0, 8, {
        cx: bx,
        cy: by,
        colorHex: '#1E293B',
      });
    }
  }
  for (const bx of [-14.8, 14.8]) {
    for (const by of [-3.2, 3.2]) {
      addCylinderZ(faces, edges, -9.5, 9.5, 1.15, 1.15, 0, 0, 8, {
        cx: bx,
        cy: by,
        colorHex: '#1E293B',
      });
    }
  }

  return compileMesh(faces, edges, [16, -6, -9], baseHex);
}

function buildSkakoGuidePlates(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 3: Lower lateral flexible spring-steel guide plate across base cavity
  addBox(faces, edges, 0, -24.0, 0, 28.0, 0.55, 10.8, baseHex);
  for (const bx of [-22, 0, 22]) {
    addBox(faces, edges, bx, -24.0, 0, 2.4, 1.1, 11.4, '#334155');
  }

  // Pos. 4: Upper horizontal guide flexure links coupling top spring studs to rear guide posts
  for (const gx of [-31, 31]) {
    addBox(faces, edges, gx, 26.6, 7.0, 3.2, 0.55, 10.5, baseHex);
    addCylinderY(faces, edges, 16.0, 27.6, 2.2, 2.2, 0, 0, 8, {
      cx: gx,
      cz: 15.0,
      colorHex: '#475569',
    });
  }

  return compileMesh(faces, edges, [18, -24, -10], baseHex);
}

function buildSkakoSpringCaps(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 5 Upper caps, Pos. 6 Lower caps, and twin M20 coaxial tie studs + top locknuts
  for (const sx of [-31, 31]) {
    // Pos. 5 Upper spring cap
    addCylinderY(faces, edges, 19.5, 21.3, 12.0, 12.0, 2.6, 2.6, 16, {
      cx: sx,
      colorHex: baseHex,
    });
    // Pos. 6 Lower spring cap resting cleanly on lower housing flange line
    addCylinderY(faces, edges, -20.0, -18.2, 12.0, 12.0, 2.6, 2.6, 16, {
      cx: sx,
      colorHex: baseHex,
    });
    // Coaxial threaded tie rod through spring column & roof cap nuts
    addCylinderY(faces, edges, -20.5, 31.0, 2.3, 2.3, 0, 0, 10, {
      cx: sx,
      colorHex: '#CBD5E1',
    });
    // Double hex locknuts above upper cap & protective black end cap above cover
    addCylinderY(faces, edges, 21.3, 23.6, 4.4, 4.4, 2.3, 2.3, 6, {
      cx: sx,
      colorHex: '#E2E8F0',
    });
    addCylinderY(faces, edges, 27.8, 30.8, 4.0, 4.0, 2.3, 2.3, 6, {
      cx: sx,
      colorHex: '#334155',
    });
    addCylinderY(faces, edges, 30.8, 32.0, 3.2, 2.8, 0, 0, 8, {
      cx: sx,
      colorHex: '#0F172A',
    });
  }

  return compileMesh(faces, edges, [31, 20, -10], baseHex);
}

function buildSkakoCoilSprings(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 7: Twin heavy-duty helical main vibrator coil springs straddling Base plate bridge
  for (const sx of [-31, 31]) {
    addHelicalSpringY(faces, edges, sx, 0, 2.6, 19.5, 9.6, 1.85, 3.5, 10, baseHex);
    addHelicalSpringY(faces, edges, sx, 0, -18.2, -2.6, 9.6, 1.85, 3.5, 10, baseHex);
  }

  return compileMesh(faces, edges, [31, 10, -9], baseHex);
}

function buildSkakoSupportingShears(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 8: Internal left vertical L-shaped supporting shear bracket & anchor bolt
  addBox(faces, edges, -20.5, -14.5, 0, 1.3, 9.5, 7.5, baseHex);
  addBox(faces, edges, -23.5, -24.0, 0, 3.8, 1.2, 7.5, '#334155');
  addCylinderZ(faces, edges, -8.5, 8.5, 1.6, 1.6, 0, 0, 6, {
    cx: -23.5,
    cy: -21.5,
    colorHex: '#F59E0B',
  });

  // Pos. 13: Upper horizontal supporting yoke tying left & right spring columns
  addBox(faces, edges, 0, 23.2, 0, 35.0, 1.0, 3.5, '#64748B');
  for (const bx of [-4.5, 4.5]) {
    addCylinderY(faces, edges, 24.2, 26.2, 1.8, 1.8, 0, 0, 6, {
      cx: bx,
      cz: 0,
      colorHex: '#CBD5E1',
    });
  }

  return compileMesh(faces, edges, [-10, 23, -3], baseHex);
}

function buildSkakoPowerCable(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 9: Rear face (+Z -> local z = 0) spiral strain-relief gland, sweeping loop cable & tan tag
  const cablePtsRear: Vec3[] = [
    [-2, -2, 1.0],
    [-1, -2, 4.8],
    [12, -3.5, 6.4],
    [28, -5.5, 6.2],
    [35, -7.8, 2.5],
    [18, -9.8, 6.4],
    [-8, -10.5, 6.8],
    [-34, -9.2, 4.2],
    [-38, -11.5, 0.2],
  ];
  for (let i = 0; i < cablePtsRear.length - 1; i++) {
    addOrientedCylinder(faces, edges, cablePtsRear[i], cablePtsRear[i + 1], 1.65, 8, {
      colorHex: baseHex,
      addRimEdges: false,
    });
  }
  // Articulated grey spiral bend-relief gland boot
  for (let g = 0; g < 4; g++) {
    addCylinderZ(faces, edges, -0.5 + g * 1.4, 0.7 + g * 1.4, 3.6 - g * 0.45, 3.2 - g * 0.45, 0, 0, 10, {
      cx: -2,
      cy: -2,
      colorHex: '#94A3B8',
    });
  }
  // Tan factory inspection tag attached along sweeping front/end cable loop (matching photo)
  addBox(faces, edges, -15, -9.8, 7.6, 4.5, 2.4, 0.5, '#D97706');

  // Opposite-end symmetric cable gland & bottom-routed cable loop (world z = -22, clear of cutaway)
  const cablePtsFront: Vec3[] = [
    [2, -16.5, -45.5],
    [16, -16.8, -48.2],
    [34, -15.5, -47.5],
    [38, -14.0, -45.5],
  ];
  for (let i = 0; i < cablePtsFront.length - 1; i++) {
    addOrientedCylinder(faces, edges, cablePtsFront[i], cablePtsFront[i + 1], 1.45, 8, {
      colorHex: baseHex,
      addRimEdges: false,
    });
  }
  for (let g = 0; g < 3; g++) {
    addCylinderZ(faces, edges, -47.8 + g * 1.2, -46.8 + g * 1.2, 2.8 - g * 0.35, 3.1 - g * 0.35, 0, 0, 8, {
      cx: 2,
      cy: -16.5,
      colorHex: '#94A3B8',
    });
  }

  return compileMesh(faces, edges, [18, -8, 6], baseHex);
}

function buildSkakoCover(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 10: Domed galvanized sheet-metal protective hood matching Sketch & crate photo
  // Arched cross-section along X (basePosition: [0, 10, 0])
  const roofProfile = (x: number): number => 23.5 - 0.0022 * x * x;
  const xPts = [-45.5, -45.2, -44.0, -38.0, -26.0, -13.0, 0, 13.0, 26.0, 38.0, 44.0, 45.2, 45.5];
  const yPts = [-23.5, 8.0, 15.5, ...xPts.slice(3, -3).map(roofProfile), 15.5, 8.0, -23.5];

  const addHoodStrip = (z0: number, z1: number, drawEndCapBack: boolean) => {
    for (let i = 0; i < xPts.length - 1; i++) {
      const p0a: Vec3 = [xPts[i], yPts[i], z0];
      const p1a: Vec3 = [xPts[i + 1], yPts[i + 1], z0];
      const p0b: Vec3 = [xPts[i], yPts[i], z1];
      const p1b: Vec3 = [xPts[i + 1], yPts[i + 1], z1];
      faces.push({
        verts: [p0a, p1a, p1b, p0b],
        colorHex: baseHex,
        isHousingShell: true,
        cullBackface: false,
      });
      edges.push({ a: p0a, b: p0b, isHousingShell: true });
      if (i === 0 || i === xPts.length - 2 || z0 > 0) {
        edges.push({ a: p0a, b: p1a, isHousingShell: true });
        edges.push({ a: p0b, b: p1b, isHousingShell: true });
      }
    }

    // Solid rear arched closure wall (z = z1) matching photo end view
    if (drawEndCapBack) {
      const baseCenter: Vec3 = [0, -23.5, z1];
      for (let i = 0; i < xPts.length - 1; i++) {
        faces.push({
          verts: [baseCenter, [xPts[i + 1], yPts[i + 1], z1], [xPts[i], yPts[i], z1]],
          colorHex: '#E2E8F0',
          isHousingShell: true,
          cullBackface: false,
        });
      }
    }
  };

  // Solid rear & top half (z = 2..22) + front cutaway arch rib (z = -22..-20.2)
  addHoodStrip(2.0, 22.0, true);
  addHoodStrip(-22.0, -20.2, false);

  // Full vertical left & right side skirts along z = -22..+22 so hood sits cleanly on base flange
  for (const sx of [-45.5, 45.5]) {
    addBox(faces, edges, sx, -7.8, 0, 0.7, 15.8, 22.0, baseHex, true);
    addBox(faces, edges, sx > 0 ? sx + 1.0 : sx - 1.0, -23.0, 0, 1.6, 0.8, 22.4, '#94A3B8', true);
  }

  // Signature raised vertical clamp seam band (x = +14) & bottom stainless T-bolt latch (photo feature)
  for (let i = 5; i <= 8; i++) {
    addBox(faces, edges, 14.0, roofProfile(14.0) + 0.4, 12.0, 1.2, 0.6, 10.2, '#94A3B8', true);
  }
  addBox(faces, edges, 14.0, -1.0, 22.2, 1.3, 21.8, 0.6, '#94A3B8', true);
  addOrientedCylinder(faces, edges, [12.0, -21.0, 22.8], [21.0, -21.0, 22.8], 1.1, 8, {
    colorHex: '#E2E8F0',
    isHousingShell: true,
  });

  // Yellow triangular High-Voltage Warning Label on top arched hood (photo feature)
  const yDecal = roofProfile(0) + 0.35;
  const tri: Vec3[] = [
    [0, yDecal, 7.0],
    [-6.2, yDecal - 0.12, 16.5],
    [6.2, yDecal - 0.12, 16.5],
  ];
  faces.push({ verts: tri, colorHex: '#F59E0B', cullBackface: false });
  edges.push({ a: tri[0], b: tri[1] });
  edges.push({ a: tri[1], b: tri[2] });
  edges.push({ a: tri[2], b: tri[0] });
  addBox(faces, edges, 0, yDecal + 0.15, 13.0, 0.7, 0.25, 2.5, '#0F172A');

  return compileMesh(faces, edges, [-20, 22, 6], baseHex);
}

function buildSkakoBasePlate(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 11: Central horizontal bridge straddled by upper & lower helical springs (local y = +17 -> world y = +5)
  addBox(faces, edges, 0, 17.0, 0, 43.0, 2.4, 13.0, baseHex);
  for (const wx of [-22, 22]) {
    addBox(faces, edges, wx, 8.0, 0, 2.2, 7.2, 10.5, '#64748B');
  }

  // Lower cast housing walls & bottom floor (local y = -19.5..-1.5 -> world y = -31.5..-13.5)
  addBox(faces, edges, 0, -18.5, 0, 46.0, 1.0, 22.0, '#64748B', true);
  addBox(faces, edges, -45.2, -10.5, 0, 1.2, 9.0, 22.0, baseHex, true);
  addBox(faces, edges, 45.2, -10.5, 0, 1.2, 9.0, 22.0, baseHex, true);

  // Solid rear (+Z) lower cast wall with photo-accurate ribs, black end caps & SKAKO nameplate
  addBox(faces, edges, 0, -10.5, 21.4, 46.0, 9.0, 1.0, baseHex, true);
  for (const rx of [-12, -4, 4, 12]) {
    addBox(faces, edges, rx, -10.2, 22.6, 1.0, 7.6, 1.0, '#64748B');
  }
  // 2 black cylindrical rubber protector end caps (left & right of vertical ribs, matching photo & side sketch)
  for (const cx of [-26, 26]) {
    addCylinderZ(faces, edges, 21.8, 27.0, 4.2, 4.0, 0, 0, 12, {
      cx,
      cy: -11.5,
      colorHex: '#0F172A',
    });
  }
  // White SKAKO VIBRATION factory nameplate on upper-left end face
  addBox(faces, edges, -24, -4.2, 22.7, 8.5, 2.6, 0.3, '#F8FAFC');

  // Front (-Z) cutaway frame leaving central internals (Pos. 1, 2, 3, 8) exposed in Iso view
  addBox(faces, edges, -41.0, -10.5, -21.4, 5.0, 9.0, 1.0, baseHex, true);
  addBox(faces, edges, 41.0, -10.5, -21.4, 5.0, 9.0, 1.0, baseHex, true);
  addBox(faces, edges, 0, -17.5, -21.4, 36.0, 2.0, 1.0, baseHex, true);

  // Perimeter flanged joint rim & external side clamping hex bolts
  addBox(faces, edges, 0, -1.5, 22.2, 47.0, 1.0, 1.2, '#64748B', true);
  addBox(faces, edges, -46.5, -1.5, 0, 1.2, 1.0, 22.2, '#64748B', true);
  addBox(faces, edges, 46.5, -1.5, 0, 1.2, 1.0, 22.2, '#64748B', true);
  for (const sx of [-48.2, 48.2]) {
    for (const sz of [-11, 11]) {
      addCylinderSection(faces, edges, sx - 1.5, sx + 1.5, 2.8, 2.8, 0, 0, 6, {
        colorHex: '#E2E8F0',
      });
      addBox(faces, edges, sx > 0 ? sx - 1.8 : sx + 1.8, -11.0, sz, 1.8, 2.2, 2.2, '#CBD5E1');
    }
  }

  // 4 bottom isolation pads resting flush at world y = -33
  for (const fx of [-36, 36]) {
    for (const fz of [-16, 16]) {
      addBox(faces, edges, fx, -20.2, fz, 5.0, 0.8, 4.0, '#1E293B');
    }
  }

  return compileMesh(faces, edges, [0, 17, -13], baseHex);
}

function buildSkakoTrimmingWeights(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Pos. 12: Stacked steel trimming weight slabs bolted directly onto Pos. 11 Base plate bridge
  addBox(faces, edges, 0, -1.4, 0, 20.5, 1.0, 11.8, '#475569');
  addBox(faces, edges, -10.5, 0.8, 0, 10.0, 1.1, 11.8, baseHex);
  addBox(faces, edges, 10.5, 0.8, 0, 10.0, 1.1, 11.8, baseHex);

  for (const bx of [-16, -6, 6, 16]) {
    addCylinderY(faces, edges, 1.9, 3.4, 1.4, 1.4, 0, 0, 6, {
      cx: bx,
      cz: 0,
      colorHex: '#CBD5E1',
    });
  }

  return compileMesh(faces, edges, [-10, 1, -12], baseHex);
}

// --- CEMA Book 350 Horizontal U-Trough Screw Conveyor Builders ---

function buildScrewTroughCover(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Flanged dust-tight top shroud plate (world y = 17..18.4, z = -17.8..+17.8)
  addBox(faces, edges, 0, 0.7, 0, 96, 0.7, 17.8, baseHex, true);

  // Turned-down flange lips & quick-release clamp handles every 24 units
  for (const sz of [-17.8, 17.8]) {
    addBox(faces, edges, 0, -0.3, sz, 96, 0.6, 0.6, '#334155', true);
    for (let cx = -84; cx <= 84; cx += 24) {
      addBox(faces, edges, cx, 1.5, sz > 0 ? sz - 0.6 : sz + 0.6, 1.4, 0.7, 1.2, '#CBD5E1', true);
    }
  }

  // Transverse stiffener channels & raised hinged quick-inspection hatch (x = +28)
  for (const rx of [-48, 0, 48]) {
    addBox(faces, edges, rx, 1.6, 0, 1.4, 0.5, 17.6, '#64748B', true);
  }
  addBox(faces, edges, 28, 2.0, 0, 12, 0.7, 11.5, '#334155', true);
  addBox(faces, edges, 28, 3.0, -9.5, 4.5, 0.6, 1.0, '#F59E0B', true);

  return compileMesh(faces, edges, [28, 3, -10], baseHex);
}

function buildScrewInletDischarge(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Top Feed Inlet Chute above cover (world x = -68, y = 18.4..37)
  const t: Vec3[] = [
    [-83, 37.0, -15],
    [-53, 37.0, -15],
    [-53, 37.0, 15],
    [-83, 37.0, 15],
  ];
  const b: Vec3[] = [
    [-80, 18.4, -12],
    [-56, 18.4, -12],
    [-56, 18.4, 12],
    [-80, 18.4, 12],
  ];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    faces.push({ verts: [t[i], t[j], b[j], b[i]], colorHex: baseHex, isHousingShell: true, cullBackface: false });
    edges.push({ a: t[i], b: t[j], isHousingShell: true });
    edges.push({ a: b[i], b: b[j], isHousingShell: true });
    edges.push({ a: t[i], b: b[i], isHousingShell: true });
  }
  addBox(faces, edges, -68, 37.6, -15.6, 16, 0.7, 1.2, '#64748B', true);
  addBox(faces, edges, -68, 37.6, 15.6, 16, 0.7, 1.2, '#64748B', true);

  // Bottom Slide-Gate Discharge Spout cleanly bolted under head U-cradle (world x = +72, y = -31..-15.5)
  addBox(faces, edges, 72, -23.0, 0, 10.5, 7.5, 10.5, baseHex, true);
  addBox(faces, edges, 72, -31.2, 0, 12.2, 1.0, 12.2, '#334155', true);

  // Manual rack slide-gate blade & adjusting handwheel centered at y = -27.5
  addBox(faces, edges, 62, -27.5, 0, 11.5, 0.8, 11.4, '#F59E0B');
  addOrientedCylinder(faces, edges, [50.5, -27.5, 0], [38.5, -27.5, 0], 1.3, 8, { colorHex: '#CBD5E1' });
  const hwR = 5.2;
  for (let h = 0; h < 10; h++) {
    const ha0 = (h / 10) * Math.PI * 2;
    const ha1 = ((h + 1) / 10) * Math.PI * 2;
    addOrientedCylinder(
      faces,
      edges,
      [38.5, -27.5 + hwR * Math.cos(ha0), hwR * Math.sin(ha0)],
      [38.5, -27.5 + hwR * Math.cos(ha1), hwR * Math.sin(ha1)],
      0.85,
      6,
      { colorHex: '#EF4444', addRimEdges: false }
    );
  }
  for (let sp = 0; sp < 4; sp++) {
    const sa = (sp / 4) * Math.PI * 2;
    addOrientedCylinder(
      faces,
      edges,
      [38.5, -27.5, 0],
      [38.5, -27.5 + hwR * Math.cos(sa), hwR * Math.sin(sa)],
      0.7,
      6,
      { colorHex: '#CBD5E1', addRimEdges: false }
    );
  }

  return compileMesh(faces, edges, [-68, 36, -14], baseHex);
}

function buildScrewHelicoidRotor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Continuous end-to-end Schedule 80 center torque pipe (x = -92..+92) + through drive/tail shaft
  addCylinderSection(faces, edges, -92, 92, 4.2, 4.2, 0, 0, 14, { colorHex: '#94A3B8' });
  addCylinderSection(faces, edges, -108, 116, 2.6, 2.6, 0, 0, 12, { colorHex: '#CBD5E1' });

  // True 3D thick continuous helicoid auger flighting advancing material toward +X on +shaftAngleRad spin
  const rIn = 4.2;
  const rOut = 13.0;
  const pitch = 25.0;
  const halfThick = 0.58;

  const addHelixSpan = (xStart: number, xEnd: number, segs: number) => {
    for (let i = 0; i < segs; i++) {
      const xa = xStart + (i / segs) * (xEnd - xStart);
      const xb = xStart + ((i + 1) / segs) * (xEnd - xStart);
      const a0 = -(Math.PI * 2 * xa) / pitch;
      const a1 = -(Math.PI * 2 * xb) / pitch;
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);

      const fi0: Vec3 = [xa + halfThick, rIn * c0, rIn * s0];
      const fo0: Vec3 = [xa + halfThick, rOut * c0, rOut * s0];
      const fi1: Vec3 = [xb + halfThick, rIn * c1, rIn * s1];
      const fo1: Vec3 = [xb + halfThick, rOut * c1, rOut * s1];

      const bi0: Vec3 = [xa - halfThick, rIn * c0, rIn * s0];
      const bo0: Vec3 = [xa - halfThick, rOut * c0, rOut * s0];
      const bi1: Vec3 = [xb - halfThick, rIn * c1, rIn * s1];
      const bo1: Vec3 = [xb - halfThick, rOut * c1, rOut * s1];

      faces.push({ verts: [fi0, fo0, fo1, fi1], colorHex: baseHex, cullBackface: false });
      faces.push({ verts: [bi0, bi1, bo1, bo0], colorHex: '#D97706', cullBackface: false });
      faces.push({ verts: [fo0, bo0, bo1, fo1], colorHex: '#FCD34D', cullBackface: false });
      edges.push({ a: fo0, b: fo1 });
      edges.push({ a: bo0, b: bo1 });

      if (i === 0) {
        faces.push({ verts: [fi0, bi0, bo0, fo0], colorHex: '#B45309', cullBackface: false });
        edges.push({ a: fi0, b: fo0 });
      }
      if (i === segs - 1) {
        faces.push({ verts: [fi1, fo1, bo1, bi1], colorHex: '#B45309', cullBackface: false });
        edges.push({ a: fi1, b: fo1 });
      }
    }
  };

  addHelixSpan(-88, 88, 96);

  return compileMesh(faces, edges, [-34, 8, -10], baseHex);
}

function buildScrewEndSeals(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Tail (x = -100..-95.5) and Head (x = +95.5..+100) split-gland PTFE stuffing boxes
  for (const sx of [-97.8, 97.8]) {
    addBox(faces, edges, sx, 0, 0, 2.2, 6.8, 6.8, '#475569');
    addCylinderSection(faces, edges, sx - 2.6, sx + 2.6, 5.0, 5.0, 2.7, 2.7, 14, {
      colorHex: baseHex,
    });
    // Twin packing follower bolts & brass purge zerk
    for (const fz of [-5.2, 5.2]) {
      addOrientedCylinder(faces, edges, [sx - 3.2, 0, fz], [sx + 3.2, 0, fz], 1.0, 6, {
        colorHex: '#CBD5E1',
      });
      addBox(faces, edges, sx, 0, fz, 1.4, 2.0, 1.1, '#F59E0B');
    }
    addOrientedCylinder(faces, edges, [sx, 5.0, 0], [sx, 8.2, 0], 1.1, 6, { colorHex: '#F59E0B' });
  }

  return compileMesh(faces, edges, [-98, 7, 0], baseHex);
}

function buildScrewEndBearings(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Cantilevered support standoffs outside stuffing box seals at tail (-105) & head (+104)
  for (const bx of [-104.5, 104.0]) {
    const wallX = bx < 0 ? -96.0 : 96.0;
    const midX = (bx + wallX) * 0.5;
    addBox(faces, edges, midX, -6.2, -5.2, 4.8, 1.2, 1.4, '#334155');
    addBox(faces, edges, midX, -6.2, 5.2, 4.8, 1.2, 1.4, '#334155');
    addBox(faces, edges, bx, -3.5, 0, 3.2, 2.2, 7.2, '#475569');
    addCylinderSection(faces, edges, bx - 3.0, bx + 3.0, 6.0, 6.0, 2.7, 2.7, 14, {
      colorHex: baseHex,
    });
    addOrientedCylinder(faces, edges, [bx, 6.0, 0], [bx, 8.8, 0], 1.0, 6, { colorHex: '#F59E0B' });
  }

  // Yellow safety cap guard on tail end protruding shaft
  addCylinderSection(faces, edges, -109.5, -107.5, 3.6, 3.6, 0, 0, 10, { colorHex: '#F59E0B' });

  return compileMesh(faces, edges, [104, 6, -6], baseHex);
}

function buildScrewGearmotorDrive(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // BasePosition [108, 4, 18] -> drive shaft center is local (x = +3.5, y = -4, z = -18)
  addBox(faces, edges, 3.5, -1.5, -17.5, 4.5, 8.5, 4.2, '#334155');
  addOrientedCylinder(faces, edges, [-2.5, -4.0, -18.0], [9.5, -4.0, -18.0], 4.8, 12, {
    colorHex: '#64748B',
  });
  addBox(faces, edges, 3.5, -4.0, -18.0, 5.2, 4.5, 4.5, '#F59E0B');

  // Blue finned TEFC helical gearmotor body extending toward +Z (local z = -12..+12)
  addCylinderZ(faces, edges, -11.5, 11.5, 7.8, 7.8, 0, 0, 14, {
    cx: 3.5,
    cy: 4.0,
    colorHex: baseHex,
  });
  for (const fz of [-7, -2, 3, 8]) {
    addCylinderZ(faces, edges, fz - 0.6, fz + 0.6, 9.2, 9.2, 7.6, 7.6, 14, {
      cx: 3.5,
      cy: 4.0,
      colorHex: '#38BDF8',
      addRimEdges: false,
    });
  }
  addCylinderZ(faces, edges, 11.5, 16.0, 8.2, 7.5, 0, 0, 12, {
    cx: 3.5,
    cy: 4.0,
    colorHex: '#1E293B',
  });
  addBox(faces, edges, 3.5, 13.0, -1.0, 3.5, 2.5, 3.5, '#0F172A');

  // Torque-arm reaction link anchored to head trough frame
  addOrientedCylinder(faces, edges, [3.5, -10.0, -18.0], [-12.0, -14.0, -2.0], 1.6, 8, {
    colorHex: '#F59E0B',
  });

  return compileMesh(faces, edges, [3, 12, 6], baseHex);
}

function buildScrewUTrough(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Semi-cylindrical U-cradle (x = -96..+96, rIn = 14.8, rOut = 16.4)
  const rIn = 14.8;
  const rOut = 16.4;
  const arcSegs = 10;
  for (let i = 0; i < arcSegs; i++) {
    const a0 = (i / arcSegs) * Math.PI;
    const a1 = ((i + 1) / arcSegs) * Math.PI;
    const o0: Vec3 = [-96, -rOut * Math.sin(a0), rOut * Math.cos(a0)];
    const o1: Vec3 = [-96, -rOut * Math.sin(a1), rOut * Math.cos(a1)];
    const o2: Vec3 = [96, -rOut * Math.sin(a1), rOut * Math.cos(a1)];
    const o3: Vec3 = [96, -rOut * Math.sin(a0), rOut * Math.cos(a0)];

    const i0: Vec3 = [-96, -rIn * Math.sin(a0), rIn * Math.cos(a0)];
    const i1: Vec3 = [-96, -rIn * Math.sin(a1), rIn * Math.cos(a1)];
    const i2: Vec3 = [96, -rIn * Math.sin(a1), rIn * Math.cos(a1)];
    const i3: Vec3 = [96, -rIn * Math.sin(a0), rIn * Math.cos(a0)];

    faces.push({ verts: [o0, o1, o2, o3], colorHex: baseHex, isHousingShell: true, cullBackface: false });
    faces.push({ verts: [i0, i3, i2, i1], colorHex: '#475569', isHousingShell: true, cullBackface: false });
    if (i === 0 || i === arcSegs - 1 || i === Math.floor(arcSegs / 2)) {
      edges.push({ a: o0, b: o3, isHousingShell: true });
    }
  }

  // Upper vertical side walls with cutaway inspection windows on BOTH front (z=-15.6) & back (z=+15.6) walls
  for (const wz of [-15.6, 15.6]) {
    addBox(faces, edges, -75, 8.25, wz, 21, 8.25, 0.8, baseHex, true);
    addBox(faces, edges, 75, 8.25, wz, 21, 8.25, 0.8, baseHex, true);
    addBox(faces, edges, 0, 15.25, wz, 54, 1.25, 0.8, baseHex, true);
    addBox(faces, edges, 0, 0.75, wz, 54, 0.75, 0.8, baseHex, true);
    // Longitudinal top angle mounting flanges (y = +16.4)
    addBox(faces, edges, 0, 16.4, wz > 0 ? wz + 1.2 : wz - 1.2, 96, 0.7, 1.6, '#64748B', true);
  }

  // Head (+95.2) & tail (-95.2) end bulkheads with center shaft bores
  for (const ex of [-95.2, 95.2]) {
    addBox(faces, edges, ex, 0.2, 0, 1.0, 16.6, 16.4, '#475569', true);
  }

  // Exterior stiffening ribs (at x = -56, 0, +56 around cradle bottom)
  for (const sx of [-56, 0, 56]) {
    addBox(faces, edges, sx, -15.5, 0, 1.6, 1.5, 16.8, '#1E293B', true);
  }

  // 3 heavy support saddle stands down to floor grid (y = -46.5), cleanly clearing +72 spout
  for (const lx of [-88, 0, 92]) {
    addBox(faces, edges, lx, -17.5, 0, 3.2, 1.5, 16.8, '#475569', true);
    for (const lz of [-14, 14]) {
      addBox(faces, edges, lx, -31.8, lz, 2.8, 13.5, 2.2, baseHex, true);
      addBox(faces, edges, lx, -45.8, lz, 5.2, 1.1, 4.2, '#1E293B', true);
    }
  }

  return compileMesh(faces, edges, [-34, -12, -16], baseHex);
}

// --- Mesh Registry Cache ---

const PART_MESH_CACHE = new Map<string, PartMesh>();

function getPartMesh(part: Machine3DPartSpec): PartMesh {
  const existing = PART_MESH_CACHE.get(part.id);
  if (existing) return existing;

  const baseHex = part.appearance.baseHex;
  let built: PartMesh;
  switch (part.id) {
    case 'volute-casing':
      built = buildVoluteCasing(baseHex);
      break;
    case 'wear-ring':
      built = buildWearRing(baseHex);
      break;
    case 'impeller-locknut':
      built = buildImpellerLocknut(baseHex);
      break;
    case 'enclosed-impeller':
      built = buildEnclosedImpeller(baseHex);
      break;
    case 'seal-backplate':
      built = buildSealBackplate(baseHex);
      break;
    case 'mechanical-seal':
      built = buildMechanicalSeal(baseHex);
      break;
    case 'pump-shaft':
      built = buildPumpShaft(baseHex);
      break;
    case 'radial-bearing':
      built = buildRadialBearing(baseHex);
      break;
    case 'bearing-housing':
      built = buildBearingHousing(baseHex);
      break;
    case 'belt-frame':
      built = buildBeltFrame(baseHex);
      break;
    case 'belt-head-pulley':
      built = buildBeltHeadPulley(baseHex);
      break;
    case 'belt-tail-pulley':
      built = buildBeltTailPulley(baseHex);
      break;
    case 'belt-idler-set':
      built = buildBeltIdlerSet(baseHex);
      break;
    case 'belt-loop':
      built = buildBeltLoop(baseHex);
      break;
    case 'belt-drive-motor':
      built = buildBeltDriveMotor(baseHex);
      break;
    case 'belt-hopper-skirt':
      built = buildBeltHopperSkirt(baseHex);
      break;
    case 'belt-cleaner-takeup':
      built = buildBeltCleanerTakeup(baseHex);
      break;
    case 'chain-guard':
      built = buildChainGuard(baseHex);
      break;
    case 'chain-motor':
      built = buildChainMotor(baseHex);
      break;
    case 'chain-driver-sprocket':
      built = buildChainDriverSprocket(baseHex);
      break;
    case 'chain-driven-sprocket':
      built = buildChainDrivenSprocket(baseHex);
      break;
    case 'chain-roller-loop':
      built = buildChainRollerLoop(baseHex);
      break;
    case 'chain-tensioner':
      built = buildChainTensioner(baseHex);
      break;
    case 'chain-shafts':
      built = buildChainShafts(baseHex);
      break;
    case 'chain-pillow-blocks':
      built = buildChainPillowBlocks(baseHex);
      break;
    case 'knocker-pilot-valve':
      built = buildKnockerPilotValve(baseHex);
      break;
    case 'knocker-head-flange':
      built = buildKnockerHeadFlange(baseHex);
      break;
    case 'knocker-anchor-plate':
      built = buildKnockerAnchorPlate(baseHex);
      break;
    case 'knocker-magnetic-piston':
      built = buildKnockerMagneticPiston(baseHex);
      break;
    case 'knocker-return-spring':
      built = buildKnockerReturnSpring(baseHex);
      break;
    case 'knocker-cylinder-body':
      built = buildKnockerCylinderBody(baseHex);
      break;
    case 'knocker-point-bush':
      built = buildKnockerPointBush(baseHex);
      break;
    case 'knocker-base-plate':
      built = buildKnockerBasePlate(baseHex);
      break;
    case 'skako-magnet':
      built = buildSkakoMagnet(baseHex);
      break;
    case 'skako-armature':
      built = buildSkakoArmature(baseHex);
      break;
    case 'skako-guide-plates':
      built = buildSkakoGuidePlates(baseHex);
      break;
    case 'skako-spring-caps':
      built = buildSkakoSpringCaps(baseHex);
      break;
    case 'skako-coil-springs':
      built = buildSkakoCoilSprings(baseHex);
      break;
    case 'skako-supporting-shears':
      built = buildSkakoSupportingShears(baseHex);
      break;
    case 'skako-power-cable':
      built = buildSkakoPowerCable(baseHex);
      break;
    case 'skako-cover':
      built = buildSkakoCover(baseHex);
      break;
    case 'skako-base-plate':
      built = buildSkakoBasePlate(baseHex);
      break;
    case 'skako-trimming-weights':
      built = buildSkakoTrimmingWeights(baseHex);
      break;
    case 'screw-trough-cover':
      built = buildScrewTroughCover(baseHex);
      break;
    case 'screw-inlet-discharge':
      built = buildScrewInletDischarge(baseHex);
      break;
    case 'screw-helicoid-rotor':
      built = buildScrewHelicoidRotor(baseHex);
      break;
    case 'screw-end-seals':
      built = buildScrewEndSeals(baseHex);
      break;
    case 'screw-end-bearings':
      built = buildScrewEndBearings(baseHex);
      break;
    case 'screw-gearmotor-drive':
      built = buildScrewGearmotorDrive(baseHex);
      break;
    case 'screw-u-trough':
      built = buildScrewUTrough(baseHex);
      break;
    case 'thrust-bearing-coupling':
    default: {
      const extra = buildExtraMachineMesh(part.id, baseHex);
      built = extra ?? buildThrustBearingCoupling(baseHex);
      break;
    }
  }

  PART_MESH_CACHE.set(part.id, built);
  return built;
}

for (const part of PUMP_3D_PARTS) {
  getPartMesh(part);
}

// --- Disassembly Interpolation ---

export function computePartDisplacement(
  part: Machine3DPartSpec,
  explodeFactor: number,
  explodeMode: 'proportional' | 'staged'
): Vec3 {
  if (explodeMode === 'proportional') {
    return [
      part.explodeVector[0] * explodeFactor,
      part.explodeVector[1] * explodeFactor,
      part.explodeVector[2] * explodeFactor,
    ];
  }

  const stageWindow: Record<1 | 2 | 3, [number, number]> = {
    1: [0.0, 0.4],
    2: [0.25, 0.75],
    3: [0.55, 1.0],
  };
  const [start, end] = stageWindow[part.explodeStage];
  const rawT = Math.max(0, Math.min(1, (explodeFactor - start) / (end - start)));
  const eased = rawT * rawT * (3 - 2 * rawT);
  return [
    part.explodeVector[0] * eased,
    part.explodeVector[1] * eased,
    part.explodeVector[2] * eased,
  ];
}

// Pre-normalized static directional lighting vectors (camera space)
const KEY_LIGHT = normalize3([-0.55, 0.72, -0.45]);
const FILL_LIGHT = normalize3([0.65, -0.35, -0.65]);
const HALF_VEC = normalize3([KEY_LIGHT[0], KEY_LIGHT[1], KEY_LIGHT[2] - 1]);

interface TrackSample {
  x: number;
  y: number;
  tx: number;
  ty: number;
  nx: number;
  ny: number;
}

function sampleStadiumTrack(
  xSpan: number,
  r: number,
  tRaw: number,
  clockwise: boolean
): TrackSample {
  const tSigned = clockwise ? tRaw : -tRaw;
  const t = ((tSigned % 1) + 1) % 1;
  const lStraight = 2 * xSpan;
  const lArc = Math.PI * r;
  const lTotal = 2 * lStraight + 2 * lArc;
  const s = t * lTotal;

  let x = 0;
  let y = 0;
  let tx = 1;
  let ty = 0;
  let nx = 0;
  let ny = 1;

  if (s < lStraight) {
    x = -xSpan + s;
    y = r;
    tx = 1;
    ty = 0;
    nx = 0;
    ny = 1;
  } else if (s < lStraight + lArc) {
    const a = Math.PI * 0.5 - ((s - lStraight) / lArc) * Math.PI;
    x = xSpan + r * Math.cos(a);
    y = r * Math.sin(a);
    tx = Math.sin(a);
    ty = -Math.cos(a);
    nx = Math.cos(a);
    ny = Math.sin(a);
  } else if (s < 2 * lStraight + lArc) {
    const u = s - (lStraight + lArc);
    x = xSpan - u;
    y = -r;
    tx = -1;
    ty = 0;
    nx = 0;
    ny = -1;
  } else {
    const a = -Math.PI * 0.5 - ((s - (2 * lStraight + lArc)) / lArc) * Math.PI;
    x = -xSpan + r * Math.cos(a);
    y = r * Math.sin(a);
    tx = Math.sin(a);
    ty = -Math.cos(a);
    nx = Math.cos(a);
    ny = Math.sin(a);
  }

  if (!clockwise) {
    // Reverse travel direction (bottom carry run moves -X -> +X)
    return { x, y, tx: -tx, ty: -ty, nx, ny };
  }
  return { x, y, tx, ty, nx, ny };
}

function samplePolygonDepthAt(
  x: number,
  y: number,
  pts: [number, number][],
  zOffs: number[]
): number | null {
  if (pts.length < 3 || zOffs.length < 3) return null;
  const p0 = pts[0];
  const z0 = zOffs[0];
  for (let k = 1; k < pts.length - 1; k++) {
    const p1 = pts[k];
    const p2 = pts[k + 1];
    const dx1 = p1[0] - p0[0];
    const dy1 = p1[1] - p0[1];
    const dx2 = p2[0] - p0[0];
    const dy2 = p2[1] - p0[1];
    const denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < 1e-6) continue;
    const invDenom = 1 / denom;
    const px = x - p0[0];
    const py = y - p0[1];
    const w1 = (px * dy2 - py * dx2) * invDenom;
    const w2 = (dx1 * py - dy1 * px) * invDenom;
    const w0 = 1 - w1 - w2;
    if (w0 >= -1e-4 && w1 >= -1e-4 && w2 >= -1e-4) {
      const invZ = w0 / z0 + w1 / zOffs[k] + w2 / zOffs[k + 1];
      return invZ > 0 ? 1 / invZ : z0;
    }
  }
  return null;
}

// --- Hardware WebGL 24-Bit Depth-Buffer CAD Pipeline ---

const GL_VERT_FLOATS = 7;

interface WebGLCadPipeline {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  aPosLoc: number;
  aColorLoc: number;
  uFocalLoc: WebGLUniformLocation | null;
  uScaleLoc: WebGLUniformLocation | null;
  uCenterLoc: WebGLUniformLocation | null;
  uViewportLoc: WebGLUniformLocation | null;
  uDepthBiasLoc: WebGLUniformLocation | null;
  buffer: WebGLBuffer;
  opaqueScratch: Float32Array;
  edgeScratch: Float32Array;
  ghostScratch: Float32Array;
  ghostEdgeScratch: Float32Array;
}

let cachedGlPipeline: WebGLCadPipeline | null | undefined;

function compileGlShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function ensureFloatCapacity(arr: Float32Array, neededFloats: number): Float32Array {
  if (arr.length >= neededFloats) return arr;
  let nextCap = Math.max(4096 * GL_VERT_FLOATS, arr.length * 2);
  while (nextCap < neededFloats) nextCap *= 2;
  const grown = new Float32Array(nextCap);
  grown.set(arr);
  return grown;
}

function pushGlVert(
  buf: Float32Array,
  vertIdx: number,
  cx: number,
  cy: number,
  cz: number,
  r: number,
  g: number,
  b: number,
  a: number
): void {
  const off = vertIdx * GL_VERT_FLOATS;
  buf[off] = cx;
  buf[off + 1] = cy;
  buf[off + 2] = cz;
  buf[off + 3] = r;
  buf[off + 4] = g;
  buf[off + 5] = b;
  buf[off + 6] = a;
}

function getWebGLCadPipeline(): WebGLCadPipeline | null {
  if (cachedGlPipeline && !cachedGlPipeline.gl.isContextLost()) {
    return cachedGlPipeline;
  }
  if (cachedGlPipeline === null) {
    return null;
  }
  if (typeof document === 'undefined') {
    cachedGlPipeline = null;
    return null;
  }

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });
  if (!gl) {
    cachedGlPipeline = null;
    return null;
  }

  const vsSource = `
    attribute vec3 aCamPos;
    attribute vec4 aColor;
    uniform float uFocal;
    uniform float uScale;
    uniform vec2 uCenter;
    uniform vec2 uViewport;
    uniform float uDepthBias;
    varying vec4 vColor;
    void main() {
      float zOff = max(40.0, uFocal + aCamPos.z + uDepthBias);
      float factor = uFocal / zOff;
      float sx = uCenter.x + aCamPos.x * uScale * factor;
      float sy = uCenter.y - aCamPos.y * uScale * factor;
      float ndcX = (sx / uViewport.x) * 2.0 - 1.0;
      float ndcY = 1.0 - (sy / uViewport.y) * 2.0;
      float zNear = 40.0;
      float zFar = 2400.0;
      float a = (zNear + zFar) / (zFar - zNear);
      float b = -(2.0 * zFar * zNear) / (zFar - zNear);
      gl_Position = vec4(ndcX * zOff, ndcY * zOff, a * zOff + b, zOff);
      vColor = aColor;
    }
  `;

  const fsSource = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
      gl_FragColor = vec4(vColor.rgb * vColor.a, vColor.a);
    }
  `;

  const vs = compileGlShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileGlShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    cachedGlPipeline = null;
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    cachedGlPipeline = null;
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    cachedGlPipeline = null;
    return null;
  }

  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    cachedGlPipeline = null;
    return null;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);
  gl.clearDepth(1.0);

  cachedGlPipeline = {
    canvas,
    gl,
    program,
    aPosLoc: gl.getAttribLocation(program, 'aCamPos'),
    aColorLoc: gl.getAttribLocation(program, 'aColor'),
    uFocalLoc: gl.getUniformLocation(program, 'uFocal'),
    uScaleLoc: gl.getUniformLocation(program, 'uScale'),
    uCenterLoc: gl.getUniformLocation(program, 'uCenter'),
    uViewportLoc: gl.getUniformLocation(program, 'uViewport'),
    uDepthBiasLoc: gl.getUniformLocation(program, 'uDepthBias'),
    buffer,
    opaqueScratch: new Float32Array(16384 * GL_VERT_FLOATS),
    edgeScratch: new Float32Array(16384 * GL_VERT_FLOATS),
    ghostScratch: new Float32Array(4096 * GL_VERT_FLOATS),
    ghostEdgeScratch: new Float32Array(4096 * GL_VERT_FLOATS),
  };

  return cachedGlPipeline;
}

function drawGlPass(
  gl: WebGLRenderingContext,
  uDepthBiasLoc: WebGLUniformLocation | null,
  bufferData: Float32Array,
  vertCount: number,
  mode: number,
  depthBias: number
): void {
  if (vertCount <= 0) return;
  gl.uniform1f(uDepthBiasLoc, depthBias);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    bufferData.subarray(0, vertCount * GL_VERT_FLOATS),
    gl.DYNAMIC_DRAW
  );
  gl.drawArrays(mode, 0, vertCount);
}

// --- Main Optimized CAD Renderer ---

export function renderCadScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraState,
  options: RenderSceneOptions
): RenderFrameResult {
  const {
    parts,
    explodeFactor,
    explodeMode,
    shaftAngleRad,
    xrayHousing,
    showCallouts,
    hoveredPartId,
    selectedPartId,
    isolatedPartId,
    isDark,
    isDriving = false,
  } = options;

  // Background studio fill
  const bgGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    20,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75
  );
  if (isDark) {
    bgGrad.addColorStop(0, '#0F1C33');
    bgGrad.addColorStop(1, '#060D1A');
  } else {
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(1, '#E6EEF8');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const cosY = Math.cos(camera.yaw);
  const sinY = Math.sin(camera.yaw);
  const cosP = Math.cos(camera.pitch);
  const sinP = Math.sin(camera.pitch);

  const focalDist = 680;
  const minDim = Math.min(width, height);
  const isoBonus = isolatedPartId
    ? 1.95
    : explodeFactor > 0.01
      ? 1.0 - 0.36 * Math.pow(explodeFactor, 0.55)
      : 1.05;
  const baseScale = (minDim / 260) * camera.zoom * isoBonus;
  const popupOffsetX = selectedPartId && width >= 700 && !isolatedPartId ? -135 : 0;
  const cxScreen = width * 0.5 + camera.panX + popupOffsetX;
  const cyScreen = height * 0.5 + camera.panY;

  function toCameraSpace(x: number, y: number, z: number): Vec3 {
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const y2 = y * cosP - z1 * sinP;
    const z2 = y * sinP + z1 * cosP;
    return [x1, y2, z2];
  }

  function projectCam(c: Vec3): [number, number, number] {
    const zOffset = focalDist + c[2];
    const factor = zOffset > 40 ? focalDist / zOffset : focalDist / 40;
    return [
      cxScreen + c[0] * baseScale * factor,
      cyScreen - c[1] * baseScale * factor,
      c[2],
    ];
  }

  // Reference floor grid (batch into single Canvas path)
  if (!isolatedPartId) {
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(0, 31, 107, 0.09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const gridY = -48;
    const halfW = 280;
    const halfD = 120;
    const step = 40;
    for (let gx = -halfW; gx <= halfW; gx += step) {
      const p0 = projectCam(toCameraSpace(gx, gridY, -halfD));
      const p1 = projectCam(toCameraSpace(gx, gridY, halfD));
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
    }
    for (let gz = -halfD; gz <= halfD; gz += step) {
      const p0 = projectCam(toCameraSpace(-halfW, gridY, gz));
      const p1 = projectCam(toCameraSpace(halfW, gridY, gz));
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
    }
    ctx.stroke();

    ctx.setLineDash([7, 5]);
    ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.45)';
    ctx.lineWidth = 1.4;
    const ax0 = projectCam(toCameraSpace(-320, 0, 0));
    const ax1 = projectCam(toCameraSpace(315, 0, 0));
    ctx.beginPath();
    ctx.moveTo(ax0[0], ax0[1]);
    ctx.lineTo(ax1[0], ax1[1]);
    ctx.stroke();
    ctx.restore();
  }

  const activeParts = isolatedPartId
    ? parts.filter((p) => p.id === isolatedPartId)
    : parts;

  type DrawItem =
    | {
        kind: 'face';
        part: Machine3DPartSpec;
        screenPts: [number, number][];
        camVerts: Vec3[];
        depth: number;
        rgb: RgbTuple;
        alpha: number;
        isHousingShell: boolean;
        isGhost: boolean;
      }
    | {
        kind: 'edge';
        ca: Vec3;
        cb: Vec3;
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        depth: number;
        edgeRgb: RgbTuple;
        alpha: number;
        lineWidth: number;
        isGhostEdge: boolean;
      };

  const drawQueue: DrawItem[] = [];
  const callouts: ProjectedCallout[] = [];

  function computeShadedRgb(
    cNorm: Vec3,
    rgb: RgbTuple,
    specStr: number,
    shininess: number,
    isSelected: boolean,
    isHovered: boolean,
    isDimmed: boolean,
    isGhost: boolean
  ): RgbTuple {
    const sign = cNorm[2] <= 0 ? 1 : -1;
    const enx = cNorm[0] * sign;
    const eny = cNorm[1] * sign;
    const enz = cNorm[2] * sign;

    const diffKey = Math.max(0, enx * KEY_LIGHT[0] + eny * KEY_LIGHT[1] + enz * KEY_LIGHT[2]);
    const diffFill = Math.max(0, enx * FILL_LIGHT[0] + eny * FILL_LIGHT[1] + enz * FILL_LIGHT[2]);
    const nDotH = Math.max(0, enx * HALF_VEC[0] + eny * HALF_VEC[1] + enz * HALF_VEC[2]);
    const spec = nDotH > 0 ? Math.pow(nDotH, shininess) * specStr : 0;

    const intensity = 0.28 + diffKey * 0.65 + diffFill * 0.24;
    let r = rgb[0] * intensity + spec;
    let g = rgb[1] * intensity + spec;
    let b = rgb[2] * intensity + spec;

    if (isSelected) {
      r = r * 0.8 + 38;
      g = g * 0.8 + 82;
      b = b * 0.8 + 110;
    } else if (isHovered) {
      r += 24;
      g += 32;
      b += 40;
    } else if (isDimmed && !isGhost) {
      // Keep non-selected parts 100% opaque for WebGL Z-buffer while muting contrast
      r *= 0.78;
      g *= 0.78;
      b *= 0.82;
    }

    return [clampByte(r), clampByte(g), clampByte(b)];
  }

  function pushDynamicFace(
    part: Machine3DPartSpec,
    verts: Vec3[],
    baseRgb: RgbTuple,
    specStr: number,
    shininess: number,
    isSelected: boolean,
    isHovered: boolean,
    isDimmed: boolean
  ): void {
    const e1 = sub3(verts[1], verts[0]);
    const e2 = sub3(verts[2], verts[0]);
    const wNorm = normalize3(cross3(e1, e2));
    const cNorm = toCameraSpace(wNorm[0], wNorm[1], wNorm[2]);
    const shaded = computeShadedRgb(
      cNorm,
      baseRgb,
      specStr,
      shininess,
      isSelected,
      isHovered,
      isDimmed,
      false
    );
    const camVerts: Vec3[] = [];
    const scrPts: [number, number][] = [];
    let sumZ = 0;
    for (let i = 0; i < verts.length; i++) {
      const c = toCameraSpace(verts[i][0], verts[i][1], verts[i][2]);
      const p = projectCam(c);
      camVerts.push(c);
      scrPts.push([p[0], p[1]]);
      sumZ += p[2];
    }
    drawQueue.push({
      kind: 'face',
      part,
      screenPts: scrPts,
      camVerts,
      depth: sumZ / verts.length,
      rgb: shaded,
      alpha: 1,
      isHousingShell: false,
      isGhost: false,
    });
  }

  function pushDynamicEdge(
    a: Vec3,
    b: Vec3,
    edgeRgb: RgbTuple,
    alpha: number,
    lineWidth: number
  ): void {
    const ca = toCameraSpace(a[0], a[1], a[2]);
    const cb = toCameraSpace(b[0], b[1], b[2]);
    const pa = projectCam(ca);
    const pb = projectCam(cb);
    drawQueue.push({
      kind: 'edge',
      ca,
      cb,
      x0: pa[0],
      y0: pa[1],
      x1: pb[0],
      y1: pb[1],
      depth: (pa[2] + pb[2]) * 0.5 - 0.35,
      edgeRgb,
      alpha,
      lineWidth,
      isGhostEdge: false,
    });
  }

  function pushOrientedDynamicBox(
    part: Machine3DPartSpec,
    cx: number,
    cy: number,
    cz: number,
    tx: number,
    ty: number,
    nx: number,
    ny: number,
    halfL: number,
    nIn: number,
    nOut: number,
    halfW: number,
    faceRgb: RgbTuple,
    edgeRgb: RgbTuple,
    specStr: number,
    shininess: number,
    isSelected: boolean,
    isHovered: boolean,
    isDimmed: boolean
  ): void {
    const pt = (lSign: number, nOff: number, wSign: number): Vec3 => [
      cx + tx * lSign * halfL + nx * nOff,
      cy + ty * lSign * halfL + ny * nOff,
      cz + wSign * halfW,
    ];
    const b0 = pt(-1, nIn, -1);
    const b1 = pt(1, nIn, -1);
    const b2 = pt(1, nIn, 1);
    const b3 = pt(-1, nIn, 1);
    const t0 = pt(-1, nOut, -1);
    const t1 = pt(1, nOut, -1);
    const t2 = pt(1, nOut, 1);
    const t3 = pt(-1, nOut, 1);

    pushDynamicFace(part, [t0, t1, t2, t3], faceRgb, specStr, shininess, isSelected, isHovered, isDimmed);
    pushDynamicFace(part, [b3, b2, b1, b0], faceRgb, specStr, shininess, isSelected, isHovered, isDimmed);
    pushDynamicFace(part, [b1, b2, t2, t1], faceRgb, specStr, shininess, isSelected, isHovered, isDimmed);
    pushDynamicFace(part, [b3, b0, t0, t3], faceRgb, specStr, shininess, isSelected, isHovered, isDimmed);
    pushDynamicFace(part, [b0, b1, t1, t0], faceRgb, specStr, shininess, isSelected, isHovered, isDimmed);
    pushDynamicFace(part, [b2, b3, t3, t2], faceRgb, specStr, shininess, isSelected, isHovered, isDimmed);

    pushDynamicEdge(t0, t1, edgeRgb, 0.85, 1.1);
    pushDynamicEdge(t1, t2, edgeRgb, 0.85, 1.1);
    pushDynamicEdge(t2, t3, edgeRgb, 0.85, 1.1);
    pushDynamicEdge(t3, t0, edgeRgb, 0.85, 1.1);
  }

  const cosRot = Math.cos(shaftAngleRad);
  const sinRot = Math.sin(shaftAngleRad);

  // Cyclic state for Seishin SK-60 Air Knocker & SKAKO 50D Vibratory Feeder
  const twoPi = Math.PI * 2;
  const pCycle = (((shaftAngleRad * 0.85) % twoPi) + twoPi) % twoPi / twoPi;
  let pistonDrop = 0;
  if (pCycle >= 0.35 && pCycle < 0.48) {
    const u = (pCycle - 0.35) / 0.13;
    pistonDrop = -15.2 * (u * u * (3 - 2 * u));
  } else if (pCycle >= 0.48 && pCycle < 0.58) {
    pistonDrop = -15.2;
  } else if (pCycle >= 0.58) {
    const u = (pCycle - 0.58) / 0.42;
    pistonDrop = -15.2 * (1 - u * u * (3 - 2 * u));
  }
  const skakoStroke = shaftAngleRad > 0 ? Math.sin(shaftAngleRad * 7.0) * 1.8 : 0;

  // URAS KEE rotary vibrator: synchronous 3D orbital centrifugal whirl + high-frequency housing chatter when Drive is active
  const isUrasActive = Boolean(isDriving) && !isolatedPartId;
  const urasCgAngle = shaftAngleRad + 2.096;
  const urasVibX = isUrasActive ? Math.sin(shaftAngleRad * 9.0) * 0.55 : 0;
  const urasVibY = isUrasActive
    ? Math.cos(urasCgAngle) * 1.9 + Math.sin(shaftAngleRad * 11.0) * 0.75
    : 0;
  const urasVibZ = isUrasActive
    ? Math.sin(urasCgAngle) * 1.9 + Math.cos(shaftAngleRad * 11.0) * 0.75
    : 0;

  for (const part of activeParts) {
    const mesh = getPartMesh(part);
    const disp = isolatedPartId
      ? ([0, 0, 0] as Vec3)
      : computePartDisplacement(part, explodeFactor, explodeMode);

    const isBilateralX =
      !isolatedPartId &&
      (part.id === 'uras-weight-covers' ||
        part.id === 'uras-adj-weights' ||
        part.id === 'uras-fixed-weights' ||
        part.id === 'uras-bearings-brackets' ||
        part.id === 'mot-end-shields' ||
        part.id === 'mot-bearings');
    const bilateralXNeg = isBilateralX ? Math.abs(disp[0]) : 0;
    const bilateralXPos = isBilateralX
      ? part.id === 'mot-end-shields'
        ? Math.abs(disp[0]) * 2.2
        : part.id === 'mot-bearings'
          ? Math.abs(disp[0]) * 3.5
          : Math.abs(disp[0])
      : 0;
    const bilateralZSplit =
      !isolatedPartId &&
      (part.id === 'gb-tapered-bearings' || part.id === 'gb-lip-seals')
        ? Math.abs(disp[2])
        : 0;
    let ox = isolatedPartId ? 0 : part.basePosition[0] + (isBilateralX ? 0 : disp[0]);
    let oy = isolatedPartId ? 0 : part.basePosition[1] + disp[1];
    let oz = isolatedPartId ? 0 : part.basePosition[2] + (bilateralZSplit > 0 ? 0 : disp[2]);

    // Apply physics-driven reciprocating & dual-mass resonant motion when Drive is running
    if (!isolatedPartId) {
      if (part.id === 'knocker-magnetic-piston') {
        oy += pistonDrop;
      } else if (
        part.id === 'skako-armature' ||
        part.id === 'skako-trimming-weights' ||
        part.id === 'skako-spring-caps' ||
        part.id === 'skako-supporting-shears' ||
        part.id === 'skako-guide-plates'
      ) {
        oy += skakoStroke;
      } else if (part.id === 'skako-magnet' || part.id === 'skako-base-plate') {
        oy -= skakoStroke * 0.55;
      } else if (part.id.startsWith('uras-')) {
        ox += urasVibX;
        oy += urasVibY;
        oz += urasVibZ;
      }
    }
    const knockerSpringScale =
      !isolatedPartId && part.id === 'knocker-return-spring'
        ? 1 + pistonDrop / 22.0
        : 1;
    const flexSkakoSpring =
      !isolatedPartId && part.id === 'skako-coil-springs' && skakoStroke !== 0;

    const isSelected = part.id === selectedPartId;
    const isHovered = part.id === hoveredPartId;
    const isDimmed =
      Boolean(selectedPartId) &&
      !isSelected &&
      !isolatedPartId &&
      !isHovered;

    if (
      !isolatedPartId &&
      explodeFactor > 0.03 &&
      !isBilateralX &&
      bilateralZSplit === 0 &&
      (Math.abs(disp[0]) > 2 || Math.abs(disp[1]) > 2 || Math.abs(disp[2]) > 2)
    ) {
      const pHome = projectCam(
        toCameraSpace(part.basePosition[0], part.basePosition[1], part.basePosition[2])
      );
      const pExp = projectCam(toCameraSpace(ox, oy, oz));
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = isSelected
        ? '#06B6D4'
        : isDark
          ? 'rgba(148, 163, 184, 0.35)'
          : 'rgba(100, 116, 139, 0.35)';
      ctx.lineWidth = isSelected ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(pHome[0], pHome[1]);
      ctx.lineTo(pExp[0], pExp[1]);
      ctx.stroke();
      ctx.restore();
    }

    const rotates = Boolean(part.rotates);
    const rotatesAroundZ =
      rotates &&
      (part.id.startsWith('belt-') ||
        part.id.startsWith('chain-') ||
        part.id.startsWith('gb-'));
    // Belt pulleys & intermediate gearbox shaft spin in reverse; gearbox stages scale by ratio
    let zRotSpeed = 1;
    if (part.id === 'gb-input-pinion') zRotSpeed = 1.8;
    else if (part.id === 'gb-intermediate-shaft') zRotSpeed = -0.85;
    else if (part.id === 'gb-bull-gear-output') zRotSpeed = 0.38;
    else if (part.id.startsWith('belt-')) zRotSpeed = -1;
    const cosZ = rotatesAroundZ ? Math.cos(shaftAngleRad * zRotSpeed) : cosRot;
    const sinZ = rotatesAroundZ ? Math.sin(shaftAngleRad * zRotSpeed) : sinRot;
    const shininess = part.appearance.shininess;
    const specStr = part.appearance.specularStrength * 165;

    for (const face of mesh.faces) {
      // Transform pre-computed unit normal into camera space (zero sqrt/cross calls per frame!)
      let nx = face.normal[0];
      let ny = face.normal[1];
      let nz = face.normal[2];
      if (rotatesAroundZ) {
        const nxRot = nx * cosZ - ny * sinZ;
        const nyRot = nx * sinZ + ny * cosZ;
        nx = nxRot;
        ny = nyRot;
      } else if (rotates) {
        const nyRot = ny * cosRot - nz * sinRot;
        const nzRot = ny * sinRot + nz * cosRot;
        ny = nyRot;
        nz = nzRot;
      }
      const cNorm = toCameraSpace(nx, ny, nz);

      const isGhost = Boolean(xrayHousing && face.isHousingShell && !isolatedPartId);
      // Fast backface cull for outward-wound solid faces
      if (face.cullBackface && !isGhost && cNorm[2] > 0.14) {
        continue;
      }

      const camVerts: Vec3[] = [];
      const scrPts: [number, number][] = [];
      let sumZ = 0;
      const verts = face.verts;
      for (let i = 0; i < verts.length; i++) {
        const v = verts[i];
        let vx = v[0];
        let vy = v[1];
        let vz = v[2];
        if (rotatesAroundZ) {
          const vxR = vx * cosZ - vy * sinZ;
          const vyR = vx * sinZ + vy * cosZ;
          vx = vxR;
          vy = vyR;
        } else if (rotates) {
          const vyR = vy * cosRot - vz * sinRot;
          const vzR = vy * sinRot + vz * cosRot;
          vy = vyR;
          vz = vzR;
        } else if (knockerSpringScale !== 1) {
          vy = -13 + (vy + 13) * knockerSpringScale;
        } else if (flexSkakoSpring) {
          const t = vy >= 0 ? Math.min(1, vy / 19.5) : Math.min(1, -vy / 18.2);
          vy += -skakoStroke * 0.55 * (1 - t) + skakoStroke * t;
        }
        if (isBilateralX) {
          vx += vx < 0 ? -bilateralXNeg : bilateralXPos;
        }
        if (bilateralZSplit > 0) {
          vz += vz < 0 ? -bilateralZSplit : bilateralZSplit;
        }
        const c = toCameraSpace(ox + vx, oy + vy, oz + vz);
        const p = projectCam(c);
        camVerts.push(c);
        scrPts.push([p[0], p[1]]);
        sumZ += p[2];
      }

      const shadedRgb = computeShadedRgb(
        cNorm,
        face.rgb,
        specStr,
        shininess,
        isSelected,
        isHovered,
        isDimmed,
        isGhost
      );
      const alpha = isGhost ? 0.16 : 1.0;

      drawQueue.push({
        kind: 'face',
        part,
        screenPts: scrPts,
        camVerts,
        depth: sumZ / verts.length,
        rgb: shadedRgb,
        alpha,
        isHousingShell: face.isHousingShell,
        isGhost,
      });
    }

    const edgeColor = isSelected
      ? '#22D3EE'
      : isHovered
        ? '#FACC15'
        : isDark
          ? part.appearance.edgeHex
          : '#0F172A';
    const edgeRgb = hexToRgb(edgeColor);
    const edgeAlpha =
      xrayHousing && part.isHousing && !isolatedPartId
        ? 0.55
        : isSelected || isHovered
          ? 0.96
          : 0.48;
    const edgeWidth = isSelected ? 1.8 : isHovered ? 1.4 : edgeAlpha > 0.5 ? 1.0 : 0.75;

    for (const edge of mesh.edges) {
      let ax = edge.a[0];
      let ay = edge.a[1];
      let az = edge.a[2];
      let bx = edge.b[0];
      let by = edge.b[1];
      let bz = edge.b[2];
      if (rotatesAroundZ) {
        const axR = ax * cosZ - ay * sinZ;
        const ayR = ax * sinZ + ay * cosZ;
        ax = axR;
        ay = ayR;
        const bxR = bx * cosZ - by * sinZ;
        const byR = bx * sinZ + by * cosZ;
        bx = bxR;
        by = byR;
      } else if (rotates) {
        const ayR = ay * cosRot - az * sinRot;
        const azR = ay * sinRot + az * cosRot;
        ay = ayR;
        az = azR;
        const byR = by * cosRot - bz * sinRot;
        const bzR = by * sinRot + bz * cosRot;
        by = byR;
        bz = bzR;
      } else if (knockerSpringScale !== 1) {
        ay = -13 + (ay + 13) * knockerSpringScale;
        by = -13 + (by + 13) * knockerSpringScale;
      } else if (flexSkakoSpring) {
        const ta = ay >= 0 ? Math.min(1, ay / 19.5) : Math.min(1, -ay / 18.2);
        const tb = by >= 0 ? Math.min(1, by / 19.5) : Math.min(1, -by / 18.2);
        ay += -skakoStroke * 0.55 * (1 - ta) + skakoStroke * ta;
        by += -skakoStroke * 0.55 * (1 - tb) + skakoStroke * tb;
      }
      if (isBilateralX) {
        ax += ax < 0 ? -bilateralXNeg : bilateralXPos;
        bx += bx < 0 ? -bilateralXNeg : bilateralXPos;
      }
      if (bilateralZSplit > 0) {
        az += az < 0 ? -bilateralZSplit : bilateralZSplit;
        bz += bz < 0 ? -bilateralZSplit : bilateralZSplit;
      }
      const ca = toCameraSpace(ox + ax, oy + ay, oz + az);
      const cb = toCameraSpace(ox + bx, oy + by, oz + bz);
      const pa = projectCam(ca);
      const pb = projectCam(cb);
      const isGhostEdge = Boolean(
        xrayHousing && (edge.isHousingShell ?? part.isHousing) && !isolatedPartId
      );
      drawQueue.push({
        kind: 'edge',
        ca,
        cb,
        x0: pa[0],
        y0: pa[1],
        x1: pb[0],
        y1: pb[1],
        depth: (pa[2] + pb[2]) * 0.5 - 0.35,
        edgeRgb,
        alpha: edgeAlpha,
        lineWidth: edgeWidth,
        isGhostEdge,
      });
    }

    // Dynamic 3D sculpted directional chevron cleats spanning center + trough wings ('belt-loop')
    if (part.id === 'belt-loop') {
      const xSpan = 92;
      const rBelt = 16.4;
      const totalLen = 4 * xSpan + 2 * Math.PI * rBelt;
      const beltPhase = (shaftAngleRad * 13.2) / totalLen;
      const numArrows = 10;
      const arrowRgb = hexToRgb(isSelected ? '#67E8F9' : '#38BDF8');
      const arrowEdgeRgb = hexToRgb('#E0F2FE');
      const hwT = 0.85;
      const hIn = 0.02;
      const hOut = 0.95;

      for (let k = 0; k < numArrows; k++) {
        const s = sampleStadiumTrack(xSpan, rBelt, k / numArrows + beltPhase, true);
        const cx = ox + s.x;
        const cy = oy + s.y;
        const ax = Math.abs(s.x);
        const u = ax <= 62 ? 0 : ax >= 90 ? 1 : (ax - 62) / 28;
        const smoothTrough = ax <= 62 ? 1 : ax >= 90 ? 0 : 1 - u * u * (3 - 2 * u);
        const cleatTrough = s.ny > 0.6 ? smoothTrough : 0;

        const ptAt = (tOff: number, hNorm: number, zAbs: number, side: number): Vec3 => {
          const wingRise = zAbs > 9.5 ? (zAbs - 9.5) * 0.2 * cleatTrough : 0;
          return [
            cx + s.tx * tOff + s.nx * hNorm,
            cy + s.ty * tOff + s.ny * hNorm + wingRise,
            oz + side * zAbs,
          ];
        };

        const addCleatSeg = (
          tInner: number,
          zInner: number,
          tOuter: number,
          zOuter: number,
          side: number,
          drawOuterCap: boolean
        ) => {
          const b0 = ptAt(tInner - hwT, hIn, zInner, side);
          const b1 = ptAt(tInner + hwT, hIn, zInner, side);
          const b2 = ptAt(tOuter + hwT, hIn, zOuter, side);
          const b3 = ptAt(tOuter - hwT, hIn, zOuter, side);
          const t0 = ptAt(tInner - hwT, hOut, zInner, side);
          const t1 = ptAt(tInner + hwT, hOut, zInner, side);
          const t2 = ptAt(tOuter + hwT, hOut, zOuter, side);
          const t3 = ptAt(tOuter - hwT, hOut, zOuter, side);

          pushDynamicFace(part, [t0, t1, t2, t3], arrowRgb, specStr, shininess, isSelected, isHovered, isDimmed);
          pushDynamicFace(part, [b1, t1, t2, b2], arrowRgb, specStr, shininess, isSelected, isHovered, isDimmed);
          pushDynamicFace(part, [t0, b0, b3, t3], arrowRgb, specStr, shininess, isSelected, isHovered, isDimmed);
          if (drawOuterCap) {
            pushDynamicFace(part, [b2, t2, t3, b3], arrowRgb, specStr, shininess, isSelected, isHovered, isDimmed);
            pushDynamicEdge(t2, t3, arrowEdgeRgb, 0.92, 1.2);
          }
          pushDynamicEdge(t1, t2, arrowEdgeRgb, 0.92, 1.2);
          pushDynamicEdge(t0, t3, arrowEdgeRgb, 0.92, 1.2);
        };

        for (const side of [-1, 1]) {
          addCleatSeg(3.2, 0, 0.2, 9.5, side, false);
          addCleatSeg(0.2, 9.5, -2.8, 18.5, side, true);
        }
      }
    }

    // Dynamic 3D forged drag-chain links & welded L-flight scraper paddles ('chain-roller-loop')
    if (part.id === 'chain-roller-loop') {
      const xSpan = 82;
      const rChain = 14.6;
      const totalLen = 4 * xSpan + 2 * Math.PI * rChain;
      const chainPhase = (shaftAngleRad * rChain) / totalLen;
      const numFlights = 16;
      const flightRgb = hexToRgb(isSelected ? '#FDE047' : '#F59E0B');
      const flightEdgeRgb = hexToRgb('#78350F');
      const linkRgb = hexToRgb('#64748B');
      const linkEdgeRgb = hexToRgb('#CBD5E1');

      for (let k = 0; k < numFlights; k++) {
        const s = sampleStadiumTrack(xSpan, rChain, k / numFlights + chainPhase, false);
        const cx = ox + s.x;
        const cy = oy + s.y;

        // Twin 3D forged chain side links at Z = ±10
        for (const cz of [-10, 10]) {
          pushOrientedDynamicBox(
            part,
            cx,
            cy,
            oz + cz,
            s.tx,
            s.ty,
            s.nx,
            s.ny,
            4.0,
            -1.3,
            1.3,
            1.15,
            linkRgb,
            linkEdgeRgb,
            specStr,
            shininess,
            isSelected,
            isHovered,
            isDimmed
          );
        }

        // Welded 3D L-flight scraper blade + horizontal mounting foot across trough (z = -17.2..+17.2)
        pushOrientedDynamicBox(
          part,
          cx,
          cy,
          oz,
          s.tx,
          s.ty,
          s.nx,
          s.ny,
          0.85,
          0.2,
          3.8,
          17.2,
          flightRgb,
          flightEdgeRgb,
          specStr,
          shininess,
          isSelected,
          isHovered,
          isDimmed
        );
        pushOrientedDynamicBox(
          part,
          cx,
          cy,
          oz,
          s.tx,
          s.ty,
          s.nx,
          s.ny,
          2.0,
          -0.1,
          0.9,
          12.6,
          flightRgb,
          flightEdgeRgb,
          specStr,
          shininess,
          isSelected,
          isHovered,
          isDimmed
        );
      }
    }

    // Dynamic compressed-air pulse indicator for Seishin SK-60 pilot valve
    if (part.id === 'knocker-pilot-valve' && shaftAngleRad > 0 && pCycle >= 0.35 && pCycle <= 0.56) {
      const airRgb = hexToRgb('#38BDF8');
      const airEdgeRgb = hexToRgb('#E0F2FE');
      const pulseOff = ((pCycle - 0.35) / 0.21) * 8.0;
      for (const side of [-1, 1]) {
        const yTop = oy + 1.5 - pulseOff;
        pushDynamicEdge([ox + side * 4.5, yTop, oz], [ox, yTop - 3.6, oz], airEdgeRgb, 0.95, 1.8);
      }
      pushOrientedDynamicBox(
        part,
        ox + 16.5,
        oy + 11.5 - pulseOff * 0.4,
        oz,
        0,
        -1,
        1,
        0,
        1.6,
        -1.2,
        1.2,
        1.2,
        airRgb,
        airEdgeRgb,
        specStr,
        shininess,
        isSelected,
        isHovered,
        isDimmed
      );
    }

    // Dynamic impact shockwave pulse rings on Seishin SK-60 anvil / base plate
    if (part.id === 'knocker-base-plate' && shaftAngleRad > 0 && pCycle >= 0.45 && pCycle <= 0.68) {
      const waveU = (pCycle - 0.45) / 0.23;
      const shockRgb = hexToRgb(waveU < 0.45 ? '#F59E0B' : '#38BDF8');
      const segs = 12;
      for (const rMul of [1.0, 0.62]) {
        const ringR = (18 + waveU * 26) * rMul;
        const ringY = oy - 1.2;
        for (let i = 0; i < segs; i++) {
          const a0 = (i / segs) * Math.PI * 2;
          const a1 = ((i + 1) / segs) * Math.PI * 2;
          pushDynamicEdge(
            [ox + ringR * Math.cos(a0), ringY, oz + ringR * Math.sin(a0)],
            [ox + ringR * Math.cos(a1), ringY, oz + ringR * Math.sin(a1)],
            shockRgb,
            0.92,
            2.0
          );
        }
      }
    }

    // Dynamic electromagnetic flux pulse lines across air gap between Pos. 1 Magnet & Pos. 2 Armature
    if (part.id === 'skako-magnet' && shaftAngleRad > 0 && !isolatedPartId) {
      const pulsePhase = Math.sin(shaftAngleRad * 7.0);
      const fluxRgb = hexToRgb(pulsePhase > 0 ? '#38BDF8' : '#F59E0B');
      const alphaFlux = 0.45 + 0.5 * Math.abs(pulsePhase);
      for (const fx of [-8.0, -4.0, 0, 4.0, 8.0]) {
        pushDynamicEdge([ox + fx, oy + 5.2, oz - 10.6], [ox + fx, oy + 7.2 + skakoStroke, oz - 10.6], fluxRgb, alphaFlux, 1.7);
        pushDynamicEdge([ox + fx, oy - 5.2, oz - 10.6], [ox + fx, oy - 7.2 + skakoStroke, oz - 10.6], fluxRgb, alphaFlux, 1.7);
      }
      for (const fy of [-3.5, 0, 3.5]) {
        pushDynamicEdge([ox - 10.5, oy + fy, oz - 10.2], [ox - 12.2, oy + fy + skakoStroke, oz - 9.4], fluxRgb, alphaFlux, 1.5);
        pushDynamicEdge([ox + 10.5, oy + fy, oz - 10.2], [ox + 12.2, oy + fy + skakoStroke, oz - 9.4], fluxRgb, alphaFlux, 1.5);
      }
    }

    // Dynamic centrifugal vibration wave rings & eccentric force arcs for URAS KEE Vibrating Motor
    if (part.id === 'uras-frame-housing' && isUrasActive) {
      const wavePhase = ((shaftAngleRad * 0.45) % 1 + 1) % 1;
      for (const ringIdx of [0, 1]) {
        const u = (wavePhase + ringIdx * 0.5) % 1;
        const rX = 28 + u * 26;
        const rZ = 30 + u * 24;
        const alphaWave = 0.85 * (1 - u * 0.65);
        const waveRgb = hexToRgb(ringIdx === 0 ? '#F97316' : '#FACC15');
        const segs = 16;
        for (let i = 0; i < segs; i++) {
          const a0 = (i / segs) * Math.PI * 2;
          const a1 = ((i + 1) / segs) * Math.PI * 2;
          pushDynamicEdge(
            [ox + rX * Math.cos(a0), oy - 30.2, oz + rZ * Math.sin(a0)],
            [ox + rX * Math.cos(a1), oy - 30.2, oz + rZ * Math.sin(a1)],
            waveRgb,
            alphaWave,
            1.9
          );
        }
      }
      // Rotating centrifugal force vector arcs on left & right weight planes
      const arcRgb = hexToRgb('#FACC15');
      for (const wx of [ox - 41, ox + 41]) {
        const rArc = 31.5;
        const arcSegs = 6;
        for (let i = 0; i < arcSegs; i++) {
          const a0 = urasCgAngle - 0.65 + (i / arcSegs) * 1.3;
          const a1 = urasCgAngle - 0.65 + ((i + 1) / arcSegs) * 1.3;
          pushDynamicEdge(
            [wx, oy + rArc * Math.cos(a0), oz + rArc * Math.sin(a0)],
            [wx, oy + rArc * Math.cos(a1), oz + rArc * Math.sin(a1)],
            arcRgb,
            0.9,
            2.1
          );
        }
      }
    }

    if (showCallouts && !isolatedPartId) {
      const biOffX = isBilateralX
        ? mesh.calloutLocalAnchor[0] < 0
          ? -bilateralXNeg
          : bilateralXPos
        : 0;
      const biOffZ =
        bilateralZSplit > 0
          ? mesh.calloutLocalAnchor[2] < 0
            ? -bilateralZSplit
            : bilateralZSplit
          : 0;
      const urasPinStabilizeX = part.id.startsWith('uras-') ? urasVibX : 0;
      const urasPinStabilizeY = part.id.startsWith('uras-') ? urasVibY : 0;
      const urasPinStabilizeZ = part.id.startsWith('uras-') ? urasVibZ : 0;
      const ancX = ox + mesh.calloutLocalAnchor[0] + biOffX - urasPinStabilizeX;
      const ancY = oy + mesh.calloutLocalAnchor[1] - urasPinStabilizeY;
      const ancZ = oz + mesh.calloutLocalAnchor[2] + biOffZ - urasPinStabilizeZ;
      const pAnchor = projectCam(toCameraSpace(ancX, ancY, ancZ));
      const pPin = projectCam(
        toCameraSpace(
          ancX + (part.bomNumber % 2 === 0 ? -10 : 10),
          ancY + (part.bomNumber % 2 === 0 ? 22 : 30),
          ancZ
        )
      );
      callouts.push({
        partId: part.id,
        bomNumber: part.bomNumber,
        anchorX: pAnchor[0],
        anchorY: pAnchor[1],
        x: pPin[0],
        y: pPin[1],
        depth: pAnchor[2],
      });
    }
  }

  const hitPolys: ProjectedPolygon[] = [];
  const glPipe = getWebGLCadPipeline();

  if (glPipe) {
    let opaqueCount = 0;
    let edgeCount = 0;
    let ghostCount = 0;
    let ghostEdgeCount = 0;

    let opaqueBuf = glPipe.opaqueScratch;
    let edgeBuf = glPipe.edgeScratch;
    let ghostBuf = glPipe.ghostScratch;
    let ghostEdgeBuf = glPipe.ghostEdgeScratch;

    for (let idx = 0; idx < drawQueue.length; idx++) {
      const item = drawQueue[idx];
      if (item.kind === 'face') {
        const pts = item.screenPts;
        const camVerts = item.camVerts;
        if (pts.length < 3 || camVerts.length < 3) continue;

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const zOffs: number[] = [];
        for (let i = 0; i < pts.length; i++) {
          const px = pts[i][0];
          const py = pts[i][1];
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
          const zO = focalDist + camVerts[i][2];
          zOffs.push(zO > 40 ? zO : 40);
        }

        hitPolys.push({
          partId: item.part.id,
          pts,
          zOffs,
          minX,
          maxX,
          minY,
          maxY,
          isHousingShell: item.isHousingShell,
        });

        const rn = item.rgb[0] / 255;
        const gn = item.rgb[1] / 255;
        const bn = item.rgb[2] / 255;
        const triCount = camVerts.length - 2;
        const c0 = camVerts[0];

        if (item.isGhost) {
          ghostBuf = ensureFloatCapacity(ghostBuf, (ghostCount + triCount * 3) * GL_VERT_FLOATS);
          for (let k = 1; k < camVerts.length - 1; k++) {
            const c1 = camVerts[k];
            const c2 = camVerts[k + 1];
            pushGlVert(ghostBuf, ghostCount++, c0[0], c0[1], c0[2], rn, gn, bn, item.alpha);
            pushGlVert(ghostBuf, ghostCount++, c1[0], c1[1], c1[2], rn, gn, bn, item.alpha);
            pushGlVert(ghostBuf, ghostCount++, c2[0], c2[1], c2[2], rn, gn, bn, item.alpha);
          }
        } else {
          opaqueBuf = ensureFloatCapacity(opaqueBuf, (opaqueCount + triCount * 3) * GL_VERT_FLOATS);
          for (let k = 1; k < camVerts.length - 1; k++) {
            const c1 = camVerts[k];
            const c2 = camVerts[k + 1];
            pushGlVert(opaqueBuf, opaqueCount++, c0[0], c0[1], c0[2], rn, gn, bn, item.alpha);
            pushGlVert(opaqueBuf, opaqueCount++, c1[0], c1[1], c1[2], rn, gn, bn, item.alpha);
            pushGlVert(opaqueBuf, opaqueCount++, c2[0], c2[1], c2[2], rn, gn, bn, item.alpha);
          }
        }
      } else {
        const er = item.edgeRgb[0] / 255;
        const eg = item.edgeRgb[1] / 255;
        const eb = item.edgeRgb[2] / 255;
        const ca = item.ca;
        const cb = item.cb;
        if (item.isGhostEdge) {
          ghostEdgeBuf = ensureFloatCapacity(ghostEdgeBuf, (ghostEdgeCount + 2) * GL_VERT_FLOATS);
          pushGlVert(ghostEdgeBuf, ghostEdgeCount++, ca[0], ca[1], ca[2], er, eg, eb, item.alpha);
          pushGlVert(ghostEdgeBuf, ghostEdgeCount++, cb[0], cb[1], cb[2], er, eg, eb, item.alpha);
        } else {
          edgeBuf = ensureFloatCapacity(edgeBuf, (edgeCount + 2) * GL_VERT_FLOATS);
          pushGlVert(edgeBuf, edgeCount++, ca[0], ca[1], ca[2], er, eg, eb, item.alpha);
          pushGlVert(edgeBuf, edgeCount++, cb[0], cb[1], cb[2], er, eg, eb, item.alpha);
        }
      }
    }

    glPipe.opaqueScratch = opaqueBuf;
    glPipe.edgeScratch = edgeBuf;
    glPipe.ghostScratch = ghostBuf;
    glPipe.ghostEdgeScratch = ghostEdgeBuf;

    const tx = ctx.getTransform();
    const dprX = Math.hypot(tx.a, tx.b) || 1;
    const dprY = Math.hypot(tx.c, tx.d) || 1;
    const pixelW = Math.max(1, Math.min(4096, Math.round(width * dprX)));
    const pixelH = Math.max(1, Math.min(4096, Math.round(height * dprY)));
    if (glPipe.canvas.width !== pixelW || glPipe.canvas.height !== pixelH) {
      glPipe.canvas.width = pixelW;
      glPipe.canvas.height = pixelH;
    }

    const gl = glPipe.gl;
    gl.viewport(0, 0, pixelW, pixelH);
    gl.useProgram(glPipe.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, glPipe.buffer);

    const stride = GL_VERT_FLOATS * 4;
    if (glPipe.aPosLoc >= 0) {
      gl.enableVertexAttribArray(glPipe.aPosLoc);
      gl.vertexAttribPointer(glPipe.aPosLoc, 3, gl.FLOAT, false, stride, 0);
    }
    if (glPipe.aColorLoc >= 0) {
      gl.enableVertexAttribArray(glPipe.aColorLoc);
      gl.vertexAttribPointer(glPipe.aColorLoc, 4, gl.FLOAT, false, stride, 12);
    }

    gl.uniform1f(glPipe.uFocalLoc, focalDist);
    gl.uniform1f(glPipe.uScaleLoc, baseScale);
    gl.uniform2f(glPipe.uCenterLoc, cxScreen, cyScreen);
    gl.uniform2f(glPipe.uViewportLoc, width, height);

    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass 1: Opaque parts write true 24-bit Z-buffer
    gl.disable(gl.BLEND);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.5, 1.5);
    drawGlPass(gl, glPipe.uDepthBiasLoc, opaqueBuf, opaqueCount, gl.TRIANGLES, 0.0);

    // Pass 2: Solid CAD crease lines occluded per-pixel by Z-buffer
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    drawGlPass(gl, glPipe.uDepthBiasLoc, edgeBuf, edgeCount, gl.LINES, -0.06);

    // Pass 3 & 4: Frosted X-Ray housing shells & edges
    drawGlPass(gl, glPipe.uDepthBiasLoc, ghostBuf, ghostCount, gl.TRIANGLES, 0.0);
    drawGlPass(gl, glPipe.uDepthBiasLoc, ghostEdgeBuf, ghostEdgeCount, gl.LINES, -0.06);

    gl.depthMask(true);
    ctx.drawImage(glPipe.canvas, 0, 0, width, height);
  } else {
    // 2D Painter's fallback if WebGL is unavailable
    drawQueue.sort((a, b) => b.depth - a.depth);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let idx = 0; idx < drawQueue.length; idx++) {
      const item = drawQueue[idx];
      if (item.kind === 'face') {
        const pts = item.screenPts;
        const camVerts = item.camVerts;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();

        ctx.globalAlpha = 1;
        const [sr, sg, sb] = item.rgb;
        ctx.fillStyle =
          item.alpha >= 1
            ? `rgb(${sr},${sg},${sb})`
            : `rgba(${sr},${sg},${sb},${item.alpha})`;
        ctx.fill();

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const zOffs: number[] = [];
        for (let i = 0; i < pts.length; i++) {
          const px = pts[i][0];
          const py = pts[i][1];
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
          const zO = focalDist + camVerts[i][2];
          zOffs.push(zO > 40 ? zO : 40);
        }

        hitPolys.push({
          partId: item.part.id,
          pts,
          zOffs,
          minX,
          maxX,
          minY,
          maxY,
          isHousingShell: item.isHousingShell,
        });
      } else {
        ctx.globalAlpha = item.alpha;
        const [er, eg, eb] = item.edgeRgb;
        ctx.strokeStyle = `rgb(${er},${eg},${eb})`;
        ctx.lineWidth = item.lineWidth;
        ctx.beginPath();
        ctx.moveTo(item.x0, item.y0);
        ctx.lineTo(item.x1, item.y1);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 3D Coordinate Triad Gizmo
  const gx = 48;
  const gy = height - 48;
  const triadLen = 26;
  const axes: { dir: Vec3; label: string; color: string }[] = [
    { dir: [1, 0, 0], label: 'X', color: '#EF4444' },
    { dir: [0, 1, 0], label: 'Y', color: '#22C55E' },
    { dir: [0, 0, 1], label: 'Z', color: '#38BDF8' },
  ];
  const rotatedAxes = axes
    .map((ax) => ({
      ...ax,
      cam: toCameraSpace(ax.dir[0], ax.dir[1], ax.dir[2]),
    }))
    .sort((a, b) => b.cam[2] - a.cam[2]);

  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.75)';
  ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.12)';
  ctx.beginPath();
  ctx.arc(gx, gy, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 10px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const ax of rotatedAxes) {
    const ex = gx + ax.cam[0] * triadLen;
    const ey = gy - ax.cam[1] * triadLen;
    ctx.strokeStyle = ax.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.fillStyle = ax.color;
    ctx.fillText(
      ax.label,
      gx + ax.cam[0] * (triadLen + 8),
      gy - ax.cam[1] * (triadLen + 8)
    );
  }
  ctx.restore();

  const hitTestPart = (canvasX: number, canvasY: number): string | null => {
    let bestSolidPartId: string | null = null;
    let bestSolidDepth = Infinity;
    let bestGhostPartId: string | null = null;
    let bestGhostDepth = Infinity;

    for (let i = 0; i < hitPolys.length; i++) {
      const poly = hitPolys[i];
      if (
        canvasX < poly.minX ||
        canvasX > poly.maxX ||
        canvasY < poly.minY ||
        canvasY > poly.maxY
      ) {
        continue;
      }
      const zAtPixel = samplePolygonDepthAt(canvasX, canvasY, poly.pts, poly.zOffs);
      if (zAtPixel === null) continue;

      if (xrayHousing && poly.isHousingShell && !isolatedPartId) {
        if (zAtPixel < bestGhostDepth) {
          bestGhostDepth = zAtPixel;
          bestGhostPartId = poly.partId;
        }
        continue;
      }

      if (zAtPixel < bestSolidDepth) {
        bestSolidDepth = zAtPixel;
        bestSolidPartId = poly.partId;
      }
    }

    return bestSolidPartId ?? bestGhostPartId;
  };

  return { callouts, hitTestPart };
}
