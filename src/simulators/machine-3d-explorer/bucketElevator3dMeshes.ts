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

  addBox(faces, edges, 0, 6, 0, 19, 6, 11, baseHex, true);
  addCylinderZ(faces, edges, -11, 11, 19, 19, 0, 0, 14, {
    cx: 0,
    cy: 0,
    colorHex: baseHex,
    isHousingShell: true,
    thetaStart: Math.PI,
    thetaEnd: Math.PI * 2,
  });
  addBox(faces, edges, 0, -19, 0, 18, 2, 12, '#1E3A5F', true);
  addBox(faces, edges, 0, -22, 0, 22, 1.5, 14, '#0F172A', true);
  addBox(faces, edges, 0, 12.5, 0, 20.5, 1, 12.5, '#1E3A5F', true);

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
  addBox(faces, edges, -34.5, 11, 0, 1.2, 7, 9.5, '#1E3A5F', true);

  addBox(faces, edges, 19.5, -5, 0, 1, 5.5, 7.5, '#D97706', false);
  addBox(faces, edges, 21.5, -5, 0, 1.2, 1.2, 2.5, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeTrunkCasing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addBox(faces, edges, -12.5, 0, 0, 6, 31.5, 10, baseHex, true);
  addBox(faces, edges, 12.5, 0, 0, 6, 31.5, 10, baseHex, true);

  for (const ty of [-20, 0, 20]) {
    addBox(faces, edges, 0, ty, 0, 6.5, 1.2, 6, '#1E3A5F', false);
  }
  for (const fy of [-30.5, 30.5]) {
    addBox(faces, edges, -12.5, fy, 0, 7, 1, 11, '#1E3A5F', true);
    addBox(faces, edges, 12.5, fy, 0, 7, 1, 11, '#1E3A5F', true);
  }
  addBox(faces, edges, -12.5, -8, 10.5, 4.2, 7.5, 0.8, '#D97706', false);
  addBox(faces, edges, -9.2, -8, 11.4, 0.8, 2.2, 0.6, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeHeadHood(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addBox(faces, edges, 0, -6, 0, 19, 6, 11, baseHex, true);
  addCylinderZ(faces, edges, -11, 11, 19, 19, 0, 0, 16, {
    cx: 0,
    cy: 0,
    colorHex: baseHex,
    isHousingShell: true,
    thetaStart: 0,
    thetaEnd: Math.PI,
  });
  addBox(faces, edges, 0, 0, 0, 20.5, 1, 12.5, '#1E3A5F', true);
  addBox(faces, edges, -10, 20, 0, 2, 2, 1.2, '#F59E0B', false);
  addBox(faces, edges, 10, 20, 0, 2, 2, 1.2, '#F59E0B', false);

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
  addBox(faces, edges, 40.5, -16, 0, 1.2, 7, 9.5, '#1E3A5F', true);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeHeadPulley(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addCylinderZ(faces, edges, -8, 8, 10.5, 10.5, 3, 3, 18, {
    colorHex: baseHex,
  });
  // Lagging tread bars so rotation is clearly visible
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const lx = Math.cos(a) * 10.7;
    const ly = Math.sin(a) * 10.7;
    addBox(faces, edges, lx, ly, 0, 0.7, 0.7, 7.6, '#0F172A', false);
  }
  addCylinderZ(faces, edges, -8, -6.8, 10.1, 10.1, 2.5, 2.5, 18, {
    colorHex: '#64748B',
  });
  addCylinderZ(faces, edges, 6.8, 8, 10.1, 10.1, 2.5, 2.5, 18, {
    colorHex: '#64748B',
  });
  addCylinderZ(faces, edges, -22, 15, 2.8, 2.8, 0, 0, 12, {
    colorHex: '#CBD5E1',
  });
  addBox(faces, edges, 0, 0, 13, 4.5, 4, 2.2, '#1E293B', false);
  addBox(faces, edges, 0, 0, -13, 4.5, 4, 2.2, '#1E293B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeDriveBackstop(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // 1. SEW KA107T Right-Angle Hollow-Shaft Helical-Bevel Gearcase
  // Hollow-shaft output hub centered at (0,0,0) on the head pulley shaft
  addCylinderZ(faces, edges, -5.2, 5.2, 5.4, 5.4, 2.7, 2.7, 16, {
    cx: 0,
    cy: 0,
    colorHex: '#334155',
  });
  // Outer shrink-disc clamping collar on rear (-Z)
  addCylinderZ(faces, edges, -6.8, -5.2, 4.6, 4.6, 2.7, 2.7, 16, {
    cx: 0,
    cy: 0,
    colorHex: '#94A3B8',
  });
  // Main cast-iron KA107 bevel-helical gearhouse extending along -X
  addBox(faces, edges, -7, 0, 0, 8.5, 6.2, 4.6, '#334155', false);
  // Bevel stage chamfered ribs & oil sight-glass + breather
  addBox(faces, edges, -7, 6.5, 0, 6.5, 0.8, 3.8, '#475569', false);
  addBox(faces, edges, -4, 7.6, 0, 1.0, 1.0, 1.0, '#F59E0B', false);
  addCylinderZ(faces, edges, 4.4, 5.0, 1.2, 1.2, 0, 0, 10, {
    cx: -8,
    cy: -2,
    colorHex: '#10B981',
  });
  // Torque Arm (T) clevis & rubber-bushed anchor bracket beneath KA107
  addBox(faces, edges, -3.5, -8.5, 0, 2.0, 3.2, 1.8, '#64748B', false);
  addBox(faces, edges, -3.5, -12.2, 0, 3.2, 1.2, 2.4, '#1E293B', false);

  // 2. /RS Mechanical Sprag Backstop Housing (between KA107 input & DRN180M4 flange)
  addCylinderSection(faces, edges, -18.5, -15.5, 5.6, 5.6, 0, 0, 16, {
    colorHex: '#F59E0B',
  });

  // 3. SEW DRN180M4 (22 kW, 4-Pole) TEFC Motor mounted at 90° along -X
  // Heavy IEC B5 mounting flange
  addCylinderSection(faces, edges, -20.5, -18.5, 7.4, 6.2, 0, 0, 18, {
    colorHex: '#475569',
  });
  // DRN180M4 cast-iron ribbed stator barrel (x = -34.5..-20.5)
  addCylinderSection(faces, edges, -34.5, -20.5, 6.8, 6.8, 0, 0, 18, {
    colorHex: baseHex,
  });
  // 8 longitudinal cooling fins along X around the DRN180M4 frame
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const fy = Math.cos(a) * 7.1;
    const fz = Math.sin(a) * 7.1;
    addBox(faces, edges, -27.5, fy, fz, 6.2, 0.55, 0.55, '#92400E', false);
  }
  // NDE sheet-steel cooling fan cowl (x = -39.5..-34.5)
  addCylinderSection(faces, edges, -39.5, -34.5, 6.9, 6.9, 0, 0, 18, {
    colorHex: '#334155',
  });
  // Top-mounted rotatable SEW terminal box + cable gland + lifting eye
  addBox(faces, edges, -24.5, 8.0, 0, 3.2, 2.0, 3.2, '#1E293B', false);
  addBox(faces, edges, -24.5, 8.0, 3.6, 0.9, 0.9, 1.0, '#94A3B8', false);
  addBox(faces, edges, -31.5, 7.8, 0, 1.0, 1.2, 1.0, '#CBD5E1', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeBootTakeup(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addCylinderZ(faces, edges, -7.5, 7.5, 4.2, 4.2, 0, 0, 12, {
    colorHex: '#475569',
  });
  addCylinderZ(faces, edges, -15, 15, 2.4, 2.4, 0, 0, 10, {
    colorHex: '#CBD5E1',
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const wx = Math.cos(a) * 7.5;
    const wy = Math.sin(a) * 7.5;
    addBox(faces, edges, wx, wy, 0, 2, 1, 7.5, baseHex, false);
  }
  addBox(faces, edges, 0, 0, 13, 4, 3.5, 2, '#1E293B', false);
  addBox(faces, edges, 0, 0, -13, 4, 3.5, 2, '#1E293B', false);
  addBox(faces, edges, 0, 7, 13, 0.9, 6.5, 0.9, '#F59E0B', false);
  addBox(faces, edges, 0, 7, -13, 0.9, 6.5, 0.9, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeBeltBuckets(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Endless belt loop (vertical legs + head/boot pulley wrap arcs).
  // Dynamic moving buckets + belt cleats are generated per-frame in buildDynamicBucketElevatorBuckets().
  addBox(faces, edges, -11.2, 0, 0, 0.7, 44, 7.2, '#1E293B', false);
  addBox(faces, edges, 11.2, 0, 0, 0.7, 44, 7.2, '#1E293B', false);

  addCylinderZ(faces, edges, -7.2, 7.2, 11.9, 11.9, 10.5, 10.5, 14, {
    cx: 0,
    cy: 44,
    colorHex: '#1E293B',
    thetaStart: 0,
    thetaEnd: Math.PI,
  });
  addCylinderZ(faces, edges, -7.2, 7.2, 11.9, 11.9, 10.5, 10.5, 14, {
    cx: 0,
    cy: -44,
    colorHex: '#1E293B',
    thetaStart: Math.PI,
    thetaEnd: Math.PI * 2,
  });

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

/**
 * Generates the 12 moving CEMA scoop buckets + belt splice cleats along the closed
 * vertical-leg + head/boot pulley loop driven by shaftAngleRad.
 */
export function buildDynamicBucketElevatorBuckets(
  shaftAngleRad: number,
  baseHex: string
): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  const R = 11.9;
  const topY = 44;
  const botY = -44;
  const straightLen = topY - botY; // 88
  const arcLen = Math.PI * R;
  const totalLen = 2 * straightLen + 2 * arcLen;
  // Convert pulley rotation (rad) into linear belt travel (s = R * theta)
  const travelS = (shaftAngleRad * R) % totalLen;

  const bucketCount = 12;
  for (let i = 0; i < bucketCount; i++) {
    const rawS = (i / bucketCount) * totalLen + travelS;
    const s = ((rawS % totalLen) + totalLen) % totalLen;

    let bx = 0;
    let by = 0;
    let rotRad = 0; // 0 = upright on left ascending leg

    if (s < straightLen) {
      bx = -R;
      by = botY + s;
      rotRad = 0;
    } else if (s < straightLen + arcLen) {
      const u = (s - straightLen) / arcLen;
      const theta = Math.PI - u * Math.PI; // PI -> 0
      bx = R * Math.cos(theta);
      by = topY + R * Math.sin(theta);
      rotRad = -u * Math.PI; // smoothly tips clockwise over the head pulley
    } else if (s < 2 * straightLen + arcLen) {
      const u = (s - straightLen - arcLen) / straightLen;
      bx = R;
      by = topY - u * straightLen;
      rotRad = -Math.PI;
    } else {
      const u = (s - 2 * straightLen - arcLen) / arcLen;
      const theta = -u * Math.PI; // 0 -> -PI
      bx = R * Math.cos(theta);
      by = botY + R * Math.sin(theta);
      rotRad = -Math.PI - u * Math.PI;
    }

    const c = Math.cos(rotRad);
    const sn = Math.sin(rotRad);
    const localPts: [number, number][] = [
      [-0.2, -2.6],
      [-4.8, 2.2],
      [-0.2, 2.6],
    ];
    const worldPts: [number, number][] = localPts.map(([lx, ly]) => [
      bx + lx * c - ly * sn,
      by + lx * sn + ly * c,
    ]);

    addExtrudedPolyZ(faces, edges, worldPts, -5.8, 5.8, baseHex, false);

    // Belt fastener cleat bar on opposite belt face to make belt travel unmistakable
    const cleatPts: [number, number][] = [
      [0.4, -0.7],
      [-0.5, -0.7],
      [-0.5, 0.7],
      [0.4, 0.7],
    ];
    const cleatWorld: [number, number][] = cleatPts.map(([lx, ly]) => [
      bx + lx * c - ly * sn,
      by + lx * sn + ly * c,
    ]);
    addExtrudedPolyZ(faces, edges, cleatWorld, -6.6, 6.6, '#CBD5E1', false);
  }

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeZeroSpeedSensor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  addBox(faces, edges, 0, 0, 0, 3.5, 3.5, 2.5, baseHex, false);
  addCylinderZ(faces, edges, -9, -2.5, 1.5, 1.5, 0, 0, 10, {
    cx: 0,
    cy: 0,
    colorHex: '#CBD5E1',
  });
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
