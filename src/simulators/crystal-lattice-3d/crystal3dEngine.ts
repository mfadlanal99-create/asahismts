import {
  type AtomSiteRole,
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

export type CrystalDisplayMode = 'ball-stick' | 'hard-sphere' | 'coordination';

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
  const spherePad = opts.displayMode === 'hard-sphere' ? 0.72 : 0.36;
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
      const baseR =
        (opts.displayMode === 'hard-sphere'
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

  // --- 4. Draw Translucent Miller Index Plane Overlay ---
  const planeVerts = getMillerPlaneVertices(opts.millerPlane, lattice, basis, cOverA);
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
    const labelText = `(${opts.millerPlane === '10-10' ? '101̄0' : opts.millerPlane})`;
    const tw = ctx.measureText(labelText).width;
    ctx.fillStyle = opts.isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(avgX - tw * 0.5 - 7, avgY - 10, tw + 14, 20, 999);
    ctx.fill();
    ctx.fillStyle = opts.isDark ? '#7dd3fc' : '#1d4ed8';
    ctx.fillText(labelText, avgX, avgY + 0.5);
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

  for (const op of ops) {
    if (op.kind === 'bond') {
      const a = projectedAtoms[op.bond.aIdx];
      const b = projectedAtoms[op.bond.bIdx];
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
      const isSelected = a.renderId === opts.selectedAtomId;
      const isHovered = a.renderId === opts.hoveredAtomId;
      const isNeighbor =
        anySelected && !isSelected && selectedNeighborIds.has(a.renderId);
      const dimmed = anySelected && !isSelected && !isNeighbor;

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
