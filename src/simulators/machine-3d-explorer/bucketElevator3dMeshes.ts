import {
  addBox,
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
    thetaStart?: number;
    thetaEnd?: number;
  }
) {
  const cx = opts?.cx ?? 0;
  const cy = opts?.cy ?? 0;
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

    const o00: Vec3 = [cx + rOut0 * c0, cy + rOut0 * s0, z0];
    const o01: Vec3 = [cx + rOut0 * c1, cy + rOut0 * s1, z0];
    const o10: Vec3 = [cx + rOut1 * c0, cy + rOut1 * s0, z1];
    const o11: Vec3 = [cx + rOut1 * c1, cy + rOut1 * s1, z1];

    faces.push({
      verts: [o00, o01, o11, o10],
      colorHex,
      isHousingShell,
      cullBackface: !isPartial,
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
        cullBackface: !isPartial,
      });

      if (opts?.capBack !== false) {
        faces.push({
          verts: [i00, i01, o01, o00],
          colorHex,
          isHousingShell,
          cullBackface: !isPartial,
        });
      }
      if (opts?.capFront !== false) {
        faces.push({
          verts: [o10, o11, i11, i10],
          colorHex,
          isHousingShell,
          cullBackface: !isPartial,
        });
      }
    } else {
      if (opts?.capBack !== false && rOut0 > 0) {
        faces.push({
          verts: [[cx, cy, z0], o01, o00],
          colorHex,
          isHousingShell,
          cullBackface: !isPartial,
        });
      }
      if (opts?.capFront !== false && rOut1 > 0) {
        faces.push({
          verts: [[cx, cy, z1], o10, o11],
          colorHex,
          isHousingShell,
          cullBackface: !isPartial,
        });
      }
    }
  }
}

/** Add an extruded 2D XY-polygon along Z from z0 to z1 */
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

function buildBeBootSection(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Upper collar (y = 0..12, x = -19..+19, z = -11..+11)
  addBox(faces, edges, 0, 6, 0, 19, 6, 11, baseHex, true);
  // Semicircular bottom trough (y = 0 down to -19, R = 19)
  addCylinderZ(faces, edges, -11, 11, 19, 19, 0, 0, 14, {
    cx: 0,
    cy: 0,
    colorHex: baseHex,
    isHousingShell: true,
    thetaStart: Math.PI,
    thetaEnd: Math.PI * 2,
  });
  // Steel pedestal skirt & anchor baseplate
  addBox(faces, edges, 0, -19, 0, 18, 2, 12, '#1E3A5F', true);
  addBox(faces, edges, 0, -22, 0, 22, 1.5, 14, '#0F172A', true);
  // Top mating flange
  addBox(faces, edges, 0, 12.5, 0, 20.5, 1, 12.5, '#1E3A5F', true);

  // 45-degree sloped inlet feed hopper on left ascending side
  addExtrudedPolyZ(
    faces,
    edges,
    [
      [-19, 8],
      [-34, 17],
      [-34, 5],
      [-19, -5],
    ],
    -8,
    8,
    '#4F7FA8',
    true
  );
  // Inlet hopper flange rim
  addBox(faces, edges, -34.5, 11, 0, 1.2, 7, 9.5, '#1E3A5F', true);

  // Cleanout slide gate on right side
  addBox(faces, edges, 19.5, -5, 0, 1, 5.5, 7.5, '#D97706', false);
  addBox(faces, edges, 21.5, -5, 0, 1.2, 1.2, 2.5, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeTrunkCasing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Slender twin vertical legs with clear 13-unit open gap in center (x = ±12.5, hx = 6 -> ±6.5..±18.5)
  addBox(faces, edges, -12.5, 0, 0, 6, 31.5, 10, baseHex, true);
  addBox(faces, edges, 12.5, 0, 0, 6, 31.5, 10, baseHex, true);

  // 3 sleek horizontal tie-channel struts connecting the two legs
  for (const ty of [-20, 0, 20]) {
    addBox(faces, edges, 0, ty, 0, 6.5, 1.2, 6, '#1E3A5F', false);
  }
  // Crisp top & bottom mating flanges on each leg
  for (const fy of [-30.5, 30.5]) {
    addBox(faces, edges, -12.5, fy, 0, 7, 1, 11, '#1E3A5F', true);
    addBox(faces, edges, 12.5, fy, 0, 7, 1, 11, '#1E3A5F', true);
  }
  // Hinged inspection hatch on front of left ascending leg
  addBox(faces, edges, -12.5, -8, 10.5, 4.2, 7.5, 0.8, '#D97706', false);
  addBox(faces, edges, -9.2, -8, 11.4, 0.8, 2.2, 0.6, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeHeadHood(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Lower split hood base (y = -12..0, x = -19..+19, z = -11..+11)
  addBox(faces, edges, 0, -6, 0, 19, 6, 11, baseHex, true);
  // Semicircular curved head hood crown (y = 0..+19, R = 19)
  addCylinderZ(faces, edges, -11, 11, 19, 19, 0, 0, 16, {
    cx: 0,
    cy: 0,
    colorHex: baseHex,
    isHousingShell: true,
    thetaStart: 0,
    thetaEnd: Math.PI,
  });
  // Split seam flange at pulley centerline
  addBox(faces, edges, 0, 0, 0, 20.5, 1, 12.5, '#1E3A5F', true);
  // Top lifting lugs
  addBox(faces, edges, -10, 20, 0, 2, 2, 1.2, '#F59E0B', false);
  addBox(faces, edges, 10, 20, 0, 2, 2, 1.2, '#F59E0B', false);

  // Sloped 35° tangential discharge throat on the right
  addExtrudedPolyZ(
    faces,
    edges,
    [
      [18, 4],
      [40, -10],
      [40, -22],
      [18, -10],
    ],
    -8,
    8,
    '#4F7FA8',
    true
  );
  // Discharge outlet flange
  addBox(faces, edges, 40.5, -16, 0, 1.2, 7, 9.5, '#1E3A5F', true);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeHeadPulley(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Crowned rubber-lagged drum pulley
  addCylinderZ(faces, edges, -8, 8, 10.5, 10.5, 3, 3, 18, {
    colorHex: baseHex,
  });
  // Steel end-discs
  addCylinderZ(faces, edges, -8, -6.8, 10.1, 10.1, 2.5, 2.5, 18, {
    colorHex: '#64748B',
  });
  addCylinderZ(faces, edges, 6.8, 8, 10.1, 10.1, 2.5, 2.5, 18, {
    colorHex: '#64748B',
  });
  // 4140 alloy drive shaft extending to reducer on back (-Z)
  addCylinderZ(faces, edges, -22, 15, 2.8, 2.8, 0, 0, 12, {
    colorHex: '#CBD5E1',
  });
  // Two compact pillow-block bearing housings
  addBox(faces, edges, 0, 0, 13, 4.5, 4, 2.2, '#1E293B', false);
  addBox(faces, edges, 0, 0, -13, 4.5, 4, 2.2, '#1E293B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeDriveBackstop(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Tapered shaft-mounted helical reducer housing
  addBox(faces, edges, -3, -3, 0, 7, 11, 4.5, '#334155', false);
  // Safety-yellow sprag backstop clutch on outer face
  addCylinderZ(faces, edges, -8, -4.5, 6, 6, 0, 0, 14, {
    cx: 0,
    cy: 0,
    colorHex: '#F59E0B',
  });
  // Torque arm bracket
  addBox(faces, edges, -6, -16, 0, 2, 4, 1.2, '#D97706', false);

  // Ribbed TEFC 3-phase drive motor
  addCylinderZ(faces, edges, -5, 8, 6.5, 6.5, 0, 0, 16, {
    cx: -17,
    cy: -7,
    colorHex: baseHex,
  });
  // Cooling fin rings on motor stator
  for (let i = 0; i < 4; i++) {
    const fz = -3.5 + i * 3;
    addCylinderZ(faces, edges, fz, fz + 1, 7.2, 7.2, 6.3, 6.3, 16, {
      cx: -17,
      cy: -7,
      colorHex: '#92400E',
    });
  }
  // Motor fan cowl
  addCylinderZ(faces, edges, -9.5, -5, 6.8, 6.8, 0, 0, 16, {
    cx: -17,
    cy: -7,
    colorHex: '#475569',
  });
  // Motor terminal box
  addBox(faces, edges, -17, 1, 1, 2.8, 2.2, 2.8, '#1E293B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeBootTakeup(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Central hub + shaft
  addCylinderZ(faces, edges, -7.5, 7.5, 4.2, 4.2, 0, 0, 12, {
    colorHex: '#475569',
  });
  addCylinderZ(faces, edges, -15, 15, 2.4, 2.4, 0, 0, 10, {
    colorHex: '#CBD5E1',
  });
  // 8 radial self-cleaning wing bars
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const wx = Math.cos(a) * 7.5;
    const wy = Math.sin(a) * 7.5;
    addBox(faces, edges, wx, wy, 0, 2, 1, 7.5, baseHex, false);
  }
  // Twin screw take-up slide frames & Acme tension rods
  addBox(faces, edges, 0, 0, 13, 4, 3.5, 2, '#1E293B', false);
  addBox(faces, edges, 0, 0, -13, 4, 3.5, 2, '#1E293B', false);
  addBox(faces, edges, 0, 7, 13, 0.9, 6.5, 0.9, '#F59E0B', false);
  addBox(faces, edges, 0, 7, -13, 0.9, 6.5, 0.9, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeBeltBuckets(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Vertical belt runs at x = ±11.2, hy = 44 -> spans exact y = -44..+44 inside trunking!
  addBox(faces, edges, -11.2, 0, 0, 0.7, 44, 7.2, '#1E293B', false);
  addBox(faces, edges, 11.2, 0, 0, 0.7, 44, 7.2, '#1E293B', false);

  // Curved top belt arc over head pulley (y = +44, R = 10.6..11.9)
  addCylinderZ(faces, edges, -7.2, 7.2, 11.9, 11.9, 10.5, 10.5, 14, {
    cx: 0,
    cy: 44,
    colorHex: '#1E293B',
    thetaStart: 0,
    thetaEnd: Math.PI,
  });
  // Curved bottom belt arc around boot pulley (y = -44, R = 10.6..11.9)
  addCylinderZ(faces, edges, -7.2, 7.2, 11.9, 11.9, 10.5, 10.5, 14, {
    cx: 0,
    cy: -44,
    colorHex: '#1E293B',
    thetaStart: Math.PI,
    thetaEnd: Math.PI * 2,
  });

  // 6 angled CEMA scoop buckets on ascending leg (left, facing up, safely inside x = -18.5)
  for (let i = 0; i < 6; i++) {
    const by = -34 + i * 13.5;
    addExtrudedPolyZ(
      faces,
      edges,
      [
        [-11.9, by - 2.6],
        [-16.4, by + 2.2],
        [-11.9, by + 2.6],
      ],
      -6,
      6,
      baseHex,
      false
    );
  }
  // 6 angled CEMA scoop buckets on descending leg (right, inverted)
  for (let i = 0; i < 6; i++) {
    const by = -34 + i * 13.5;
    addExtrudedPolyZ(
      faces,
      edges,
      [
        [11.9, by + 2.6],
        [16.4, by - 2.2],
        [11.9, by - 2.6],
      ],
      -6,
      6,
      baseHex,
      false
    );
  }

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeZeroSpeedSensor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Compact IP67 junction box + mounting bracket
  addBox(faces, edges, 0, 0, 0, 3.5, 3.5, 2.5, baseHex, false);
  // Inductive proximity sensor barrel pointing toward boot shaft
  addCylinderZ(faces, edges, -9, -2.5, 1.5, 1.5, 0, 0, 10, {
    cx: 0,
    cy: 0,
    colorHex: '#CBD5E1',
  });
  // Amber LED status cap
  addBox(faces, edges, 0, 4.5, 0, 1.4, 1, 1.4, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

export function buildBucketElevatorMesh(
  partId: string,
  baseHex: string
): PartMesh | null {
  switch (partId) {
    case 'be-boot-section':
      return buildBeBootSection(baseHex);
    case 'be-trunk-casing':
      return buildBeTrunkCasing(baseHex);
    case 'be-head-hood':
      return buildBeHeadHood(baseHex);
    case 'be-head-pulley':
      return buildBeHeadPulley(baseHex);
    case 'be-drive-backstop':
      return buildBeDriveBackstop(baseHex);
    case 'be-boot-takeup':
      return buildBeBootTakeup(baseHex);
    case 'be-belt-buckets':
      return buildBeBeltBuckets(baseHex);
    case 'be-zero-speed-sensor':
      return buildBeZeroSpeedSensor(baseHex);
    default:
      return null;
  }
}
