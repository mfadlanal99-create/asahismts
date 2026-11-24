import {
  addBox,
  addCylinderSection,
  compileMesh,
  type EdgeDef,
  type PartMesh,
  type RawFaceDef,
  type Vec3,
} from './cad3dEngine';

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
    capBack?: boolean;
    capFront?: boolean;
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
        verts: [i00, i10, i11, i01],
        colorHex,
        isHousingShell,
        cullBackface: true,
      });

      if (opts?.capBack !== false) {
        faces.push({
          verts: [i00, i01, o01, o00],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (opts?.capFront !== false) {
        faces.push({
          verts: [o10, o11, i11, i10],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
    } else {
      if (opts?.capBack !== false && rOut0 > 0) {
        faces.push({
          verts: [[cx, cy, z0], o01, o00],
          colorHex,
          isHousingShell,
          cullBackface: true,
        });
      }
      if (opts?.capFront !== false && rOut1 > 0) {
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

function addExtrudedPolyZ(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  pts: [number, number][],
  z0: number,
  z1: number,
  colorHex: string,
  isHousingShell = false
) {
  const n = pts.length;
  const front: Vec3[] = pts.map(([x, y]): Vec3 => [x, y, z1]);
  const back: Vec3[] = pts.map(([x, y]): Vec3 => [x, y, z0]).reverse();
  faces.push({ verts: front, colorHex, isHousingShell, cullBackface: false });
  faces.push({ verts: back, colorHex, isHousingShell, cullBackface: false });

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a0: Vec3 = [pts[i][0], pts[i][1], z0];
    const b0: Vec3 = [pts[j][0], pts[j][1], z0];
    const a1: Vec3 = [pts[i][0], pts[i][1], z1];
    const b1: Vec3 = [pts[j][0], pts[j][1], z1];
    faces.push({
      verts: [a0, b0, b1, a1],
      colorHex,
      isHousingShell,
      cullBackface: false,
    });
    edges.push({ a: a0, b: b0, isHousingShell });
    edges.push({ a: a1, b: b1, isHousingShell });
    edges.push({ a: a0, b: a1, isHousingShell });
  }
}

function buildApronFrame(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Heavy C-channel side frames (z = ±17, x = -56..+56)
  addBox(faces, edges, 0, 0, 17, 56, 7.5, 1.5, baseHex, true);
  addBox(faces, edges, 0, 0, -17, 56, 7.5, 1.5, baseHex, true);

  // Hardened AR400 carry & return rails along inner side frames
  addBox(faces, edges, 0, 8.2, 13.5, 48, 0.8, 1.4, '#CBD5E1', false);
  addBox(faces, edges, 0, 8.2, -13.5, 48, 0.8, 1.4, '#CBD5E1', false);
  addBox(faces, edges, 0, -8.2, 13.5, 48, 0.8, 1.4, '#CBD5E1', false);
  addBox(faces, edges, 0, -8.2, -13.5, 48, 0.8, 1.4, '#CBD5E1', false);

  // 3 pairs of heavy support legs + cross-members + anchor footpads
  for (const lx of [-42, 0, 42]) {
    addBox(faces, edges, lx, -13.5, 17, 2.2, 10.5, 1.8, '#1E3A5F', true);
    addBox(faces, edges, lx, -13.5, -17, 2.2, 10.5, 1.8, '#1E3A5F', true);
    // Anchor footpads
    addBox(faces, edges, lx, -24.5, 17, 4.0, 1.0, 3.5, '#0F172A', true);
    addBox(faces, edges, lx, -24.5, -17, 4.0, 1.0, 3.5, '#0F172A', true);
    // Cross tie beam
    addBox(faces, edges, lx, -14, 0, 1.6, 1.8, 15.2, '#2B537A', false);
  }

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildApronSkirtboards(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Flared left & right skirtboard walls over tail feed zone
  addBox(faces, edges, 0, -2, 11.5, 18, 5.5, 1.0, baseHex, true);
  addBox(faces, edges, 0, -2, -11.5, 18, 5.5, 1.0, baseHex, true);
  // Back feed hopper endplate & flared top hopper rim
  addBox(faces, edges, -17.5, -1, 0, 1.0, 6.5, 11.5, '#2B537A', true);
  addBox(faces, edges, -4, 4.2, 12.8, 15, 1.2, 1.4, '#1E3A5F', true);
  addBox(faces, edges, -4, 4.2, -12.8, 15, 1.2, 1.4, '#1E3A5F', true);
  // 3 overhead stiffener tie bars
  for (const bx of [-14, -4, 6]) {
    addBox(faces, edges, bx, 5.2, 0, 1.0, 0.9, 12.5, '#334155', false);
  }

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildToothedSprocket(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  zPos: number,
  baseHex: string
) {
  addCylinderZ(faces, edges, zPos - 1.4, zPos + 1.4, 9.2, 9.2, 2.8, 2.8, 14, {
    colorHex: baseHex,
  });
  // 10 visible sprocket teeth around circumference so rotation is crisp
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const tx = Math.cos(a) * 9.8;
    const ty = Math.sin(a) * 9.8;
    addBox(faces, edges, tx, ty, zPos, 1.1, 1.1, 1.0, '#1E293B', false);
  }
}

function buildApronHeadSprockets(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Alloy head shaft extending to gearmotor on -Z
  addCylinderZ(faces, edges, -26, 22, 2.6, 2.6, 0, 0, 12, {
    colorHex: '#CBD5E1',
  });
  // Dual cast-steel drive sprockets at z = ±13.5
  buildToothedSprocket(faces, edges, 13.5, baseHex);
  buildToothedSprocket(faces, edges, -13.5, baseHex);
  // Flanged pillow-block bearings on side frames
  addBox(faces, edges, 0, 0, 19.5, 4.2, 3.8, 2.0, '#1E293B', false);
  addBox(faces, edges, 0, 0, -19.5, 4.2, 3.8, 2.0, '#1E293B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildApronHeadDrive(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Hollow-shaft helical-bevel gearcase mounted on head shaft
  addCylinderZ(faces, edges, -4.5, 4.5, 4.8, 4.8, 2.5, 2.5, 16, {
    colorHex: '#334155',
  });
  addCylinderZ(faces, edges, -6.0, -4.5, 4.2, 4.2, 2.5, 2.5, 16, {
    colorHex: '#94A3B8',
  });
  addBox(faces, edges, -6.5, 0, 0, 7.5, 5.5, 4.2, '#334155', false);
  // Torque arm anchor below gearcase
  addBox(faces, edges, -3.5, -7.5, 0, 1.8, 2.8, 1.5, '#64748B', false);
  addBox(faces, edges, -3.5, -10.8, 0, 2.8, 1.0, 2.0, '#1E293B', false);
  // Direct-flanged TEFC 4-pole motor along -X
  addCylinderSection(faces, edges, -16.5, -14.2, 6.4, 5.5, 0, 0, 16, {
    colorHex: '#475569',
  });
  addCylinderSection(faces, edges, -29.5, -16.5, 5.8, 5.8, 0, 0, 16, {
    colorHex: baseHex,
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    addBox(
      faces,
      edges,
      -23,
      Math.cos(a) * 6.1,
      Math.sin(a) * 6.1,
      5.5,
      0.45,
      0.45,
      '#92400E',
      false
    );
  }
  addCylinderSection(faces, edges, -34, -29.5, 5.9, 5.9, 0, 0, 16, {
    colorHex: '#334155',
  });
  addBox(faces, edges, -20.5, 7.0, 0, 2.8, 1.8, 2.8, '#1E293B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildApronTailTakeup(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Tail idler shaft + twin sprockets
  addCylinderZ(faces, edges, -21, 21, 2.3, 2.3, 0, 0, 12, {
    colorHex: '#CBD5E1',
  });
  buildToothedSprocket(faces, edges, 13.5, baseHex);
  buildToothedSprocket(faces, edges, -13.5, baseHex);
  // Left & right screw take-up blocks & Acme tension rods
  addBox(faces, edges, 0, 0, 19.5, 4.0, 3.6, 2.0, '#1E293B', false);
  addBox(faces, edges, 0, 0, -19.5, 4.0, 3.6, 2.0, '#1E293B', false);
  addBox(faces, edges, -7.5, 0, 19.5, 5.5, 0.9, 0.9, '#F59E0B', false);
  addBox(faces, edges, -7.5, 0, -19.5, 5.5, 0.9, 0.9, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildApronChainPans(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Twin outboard chain track bars (top & bottom horizontal runs at z = ±13.5, y = ±10.2)
  for (const cz of [-13.5, 13.5]) {
    addBox(faces, edges, 0, 10.2, cz, 52, 0.65, 0.9, '#334155', false);
    addBox(faces, edges, 0, -10.2, cz, 52, 0.65, 0.9, '#334155', false);
  }

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

/**
 * Generates overlapping beaded steel apron pans + outboard chain rollers moving
 * continuously along the closed head-to-tail loop driven by shaftAngleRad.
 */
export function buildDynamicApronChainPans(
  shaftAngleRad: number,
  baseHex: string
): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  const R = 10.2;
  const leftX = -52;
  const rightX = 52;
  const straightLen = rightX - leftX; // 104
  const arcLen = Math.PI * R;
  const totalLen = 2 * straightLen + 2 * arcLen;
  const travelS = (shaftAngleRad * R) % totalLen;

  const panCount = 24;
  for (let i = 0; i < panCount; i++) {
    const rawS = (i / panCount) * totalLen + travelS;
    const s = ((rawS % totalLen) + totalLen) % totalLen;

    let px = 0;
    let py = 0;
    let rotRad = 0; // 0 = upright on top carry run

    if (s < straightLen) {
      px = leftX + s;
      py = R;
      rotRad = 0;
    } else if (s < straightLen + arcLen) {
      const u = (s - straightLen) / arcLen;
      const theta = Math.PI / 2 - u * Math.PI; // +PI/2 -> -PI/2
      px = rightX + R * Math.cos(theta);
      py = R * Math.sin(theta);
      rotRad = -u * Math.PI;
    } else if (s < 2 * straightLen + arcLen) {
      const u = (s - straightLen - arcLen) / straightLen;
      px = rightX - u * straightLen;
      py = -R;
      rotRad = -Math.PI;
    } else {
      const u = (s - 2 * straightLen - arcLen) / arcLen;
      const theta = -Math.PI / 2 - u * Math.PI; // -PI/2 -> -3PI/2
      px = leftX + R * Math.cos(theta);
      py = R * Math.sin(theta);
      rotRad = -Math.PI - u * Math.PI;
    }

    const c = Math.cos(rotRad);
    const sn = Math.sin(rotRad);

    // Overlapping beaded pan cross-section (Z-extruded across z = -10.5..+10.5)
    const panLocal: [number, number][] = [
      [-4.8, 0.2],
      [-3.8, 2.2],
      [4.2, 2.2],
      [4.8, 0.4],
      [4.2, -0.5],
      [-4.2, -0.5],
    ];
    const panWorld: [number, number][] = panLocal.map(([lx, ly]) => [
      px + lx * c - ly * sn,
      py + lx * sn + ly * c,
    ]);
    addExtrudedPolyZ(faces, edges, panWorld, -10.5, 10.5, baseHex, false);

    // Raised pan side-wings (containment cleats at z = ±10.5)
    const wingLocal: [number, number][] = [
      [-3.8, 2.2],
      [-3.8, 4.4],
      [3.8, 4.4],
      [3.8, 2.2],
    ];
    const wingWorld: [number, number][] = wingLocal.map(([lx, ly]) => [
      px + lx * c - ly * sn,
      py + lx * sn + ly * c,
    ]);
    addExtrudedPolyZ(faces, edges, wingWorld, 9.6, 11.2, '#475569', false);
    addExtrudedPolyZ(faces, edges, wingWorld, -11.2, -9.6, '#475569', false);

    // Outboard chain rollers at z = ±13.5 so chain motion is clearly visible
    const rollerLocal: [number, number][] = [
      [-1.3, -1.2],
      [1.3, -1.2],
      [1.3, 1.2],
      [-1.3, 1.2],
    ];
    const rollerWorld: [number, number][] = rollerLocal.map(([lx, ly]) => [
      px + lx * c - ly * sn,
      py + lx * sn + ly * c,
    ]);
    addExtrudedPolyZ(faces, edges, rollerWorld, 12.4, 14.6, '#F59E0B', false);
    addExtrudedPolyZ(faces, edges, rollerWorld, -14.6, -12.4, '#F59E0B', false);
  }

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildApronRollersChute(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // 3 internal support carry rollers beneath the top pan run
  for (const rx of [-26, 0, 26]) {
    addCylinderZ(faces, edges, -11, 11, 2.4, 2.4, 0, 0, 12, {
      cx: rx,
      cy: 5.5,
      colorHex: baseHex,
    });
  }
  // Head discharge chute hood at x = +58..+72
  addExtrudedPolyZ(
    faces,
    edges,
    [
      [54, 10],
      [70, -4],
      [70, -18],
      [54, -8],
    ],
    -11,
    11,
    '#334155',
    true
  );

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

export function buildApronConveyorMesh(
  partId: string,
  baseHex: string
): PartMesh | null {
  switch (partId) {
    case 'apron-frame':
      return buildApronFrame(baseHex);
    case 'apron-skirtboards':
      return buildApronSkirtboards(baseHex);
    case 'apron-head-sprockets':
      return buildApronHeadSprockets(baseHex);
    case 'apron-head-drive':
      return buildApronHeadDrive(baseHex);
    case 'apron-tail-takeup':
      return buildApronTailTakeup(baseHex);
    case 'apron-chain-pans':
      return buildApronChainPans(baseHex);
    case 'apron-rollers-chute':
      return buildApronRollersChute(baseHex);
    default:
      return null;
  }
}
