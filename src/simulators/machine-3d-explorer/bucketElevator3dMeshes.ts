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

function buildBeBootSection(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Main boot housing box
  addBox(faces, edges, 0, 0, 0, 56, 36, 34, baseHex, true);
  // Base flange + anchor pads
  addBox(faces, edges, 0, -19, 0, 64, 3, 42, '#1E3A5F', true);
  // Top bolted collar flange matching trunking
  addBox(faces, edges, 0, 19, 0, 60, 2.5, 38, '#2B537A', true);
  // Sloped feed inlet hopper on the left ascending side
  addBox(faces, edges, -34, 3, 0, 18, 16, 24, '#4F7FA8', true);
  addBox(faces, edges, -42, 12, 0, 14, 4, 28, '#64748B', true);
  // Cleanout slide gate on right side
  addBox(faces, edges, 29, -8, 0, 3, 15, 22, '#D97706', false);
  addBox(faces, edges, 32, -8, 0, 4, 3, 7, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeTrunkCasing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Left ascending leg & right descending leg enclosed steel trunking (x = ±16, width 24 -> outer ±28)
  addBox(faces, edges, -16, 0, 0, 24, 70, 34, baseHex, true);
  addBox(faces, edges, 16, 0, 0, 24, 70, 34, baseHex, true);
  // Center structural divider web
  addBox(faces, edges, 0, 0, 0, 8, 70, 28, '#2B537A', true);
  // Top, middle, and bottom bolted flange collars
  for (const fy of [-33, 0, 33]) {
    addBox(faces, edges, 0, fy, 0, 60, 3, 38, '#1E3A5F', true);
  }
  // Hinged inspection hatch on front ascending leg
  addBox(faces, edges, -16, -12, 18, 14, 22, 2.5, '#D97706', false);
  addBox(faces, edges, -11, -12, 20, 2.5, 7, 2, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeHeadHood(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Split head hood upper & lower flanged shell
  addBox(faces, edges, 0, 4, 0, 58, 42, 36, baseHex, true);
  // Split seam flange at pulley centerline
  addBox(faces, edges, 0, 0, 0, 64, 3, 40, '#1E3A5F', true);
  // Top lifting lugs
  addBox(faces, edges, -18, 28, 0, 6, 6, 4.5, '#F59E0B', false);
  addBox(faces, edges, 18, 28, 0, 6, 6, 4.5, '#F59E0B', false);
  // Tangential discharge chute / throat on right side
  addBox(faces, edges, 35, -5, 0, 18, 18, 24, '#4F7FA8', true);
  addBox(faces, edges, 45, -12, 0, 12, 12, 22, '#334155', true);
  // Discharge flange collar
  addBox(faces, edges, 52, -15, 0, 3, 16, 26, '#1E3A5F', true);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeHeadPulley(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Rubber-lagged drum pulley
  addCylinderZ(faces, edges, -12, 12, 14, 14, 4, 4, 16, {
    colorHex: baseHex,
  });
  // Steel end-discs
  addCylinderZ(faces, edges, -12, -10.5, 13.5, 13.5, 3.5, 3.5, 16, {
    colorHex: '#64748B',
  });
  addCylinderZ(faces, edges, 10.5, 12, 13.5, 13.5, 3.5, 3.5, 16, {
    colorHex: '#64748B',
  });
  // Heavy 4140 drive shaft extending to reducer on back (-Z)
  addCylinderZ(faces, edges, -28, 22, 3.8, 3.8, 0, 0, 10, {
    colorHex: '#CBD5E1',
  });
  // Two pillow block bearing housings
  addBox(faces, edges, 0, 0, 19, 12, 11, 7, '#1E293B', false);
  addBox(faces, edges, 0, 0, -19, 12, 11, 7, '#1E293B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeDriveBackstop(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Shaft-mounted helical reducer housing
  addBox(faces, edges, -6, -6, 0, 22, 28, 14, '#334155', false);
  // Safety-yellow sprag backstop brake housing on outer face
  addCylinderZ(faces, edges, -11, -7, 8, 8, 0, 0, 14, {
    cx: 0,
    cy: 0,
    colorHex: '#F59E0B',
  });
  // Torque arm bracket
  addBox(faces, edges, -12, -22, 0, 7, 12, 4, '#D97706', false);
  // TEFC 3-phase drive motor mounted on reducer bracket
  addCylinderZ(faces, edges, -8, 11, 9.5, 9.5, 0, 0, 14, {
    cx: -26,
    cy: -10,
    colorHex: baseHex,
  });
  // Motor cooling fan cowl
  addCylinderZ(faces, edges, -14, -8, 10, 10, 0, 0, 14, {
    cx: -26,
    cy: -10,
    colorHex: '#475569',
  });
  // Motor terminal box
  addBox(faces, edges, -26, 1, 1, 7.5, 5.5, 7.5, '#1E293B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeBootTakeup(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Central hub + shaft
  addCylinderZ(faces, edges, -11, 11, 6, 6, 0, 0, 12, {
    colorHex: '#475569',
  });
  addCylinderZ(faces, edges, -21, 21, 3.2, 3.2, 0, 0, 10, {
    colorHex: '#CBD5E1',
  });
  // 8 radial self-cleaning wing bars
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const wx = Math.cos(a) * 10;
    const wy = Math.sin(a) * 10;
    addBox(faces, edges, wx, wy, 0, 5.5, 3, 22, baseHex, false);
  }
  // Left & right screw take-up slide frames & Acme threaded rods
  addBox(faces, edges, 0, 0, 19, 11, 10, 6, '#1E293B', false);
  addBox(faces, edges, 0, 0, -19, 11, 10, 6, '#1E293B', false);
  addBox(faces, edges, 0, 10, 19, 2.5, 18, 2.5, '#F59E0B', false);
  addBox(faces, edges, 0, 10, -19, 2.5, 18, 2.5, '#F59E0B', false);

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeBeltBuckets(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Ascending and descending vertical belt runs (x = ±14, inside ±28 trunking)
  addBox(faces, edges, -14, 0, 0, 2, 104, 22, '#1E293B', false);
  addBox(faces, edges, 14, 0, 0, 2, 104, 22, '#1E293B', false);
  // Top and bottom arc caps representing belt wrap
  addBox(faces, edges, 0, 66, 0, 24, 2.5, 22, '#1E293B', false);
  addBox(faces, edges, 0, -66, 0, 24, 2.5, 22, '#1E293B', false);

  // 6 steel buckets on ascending leg (left, facing upward, inside x = -23..-15)
  for (let i = 0; i < 6; i++) {
    const by = -45 + i * 18;
    addBox(faces, edges, -19, by, 0, 8, 7, 18, baseHex, false);
    addBox(faces, edges, -20, by + 3.5, 0, 8.5, 1.5, 18, '#E2E8F0', false);
  }
  // 6 steel buckets on descending leg (right, inverted)
  for (let i = 0; i < 6; i++) {
    const by = -45 + i * 18;
    addBox(faces, edges, 19, by, 0, 8, 7, 18, baseHex, false);
    addBox(faces, edges, 20, by - 3.5, 0, 8.5, 1.5, 18, '#E2E8F0', false);
  }

  return compileMesh(faces, edges, [0, 0, 0], baseHex);
}

function buildBeZeroSpeedSensor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];

  // Junction box + mounting bracket
  addBox(faces, edges, 0, 0, 0, 10, 10, 7, baseHex, false);
  // Inductive proximity sensor barrel pointing toward boot shaft
  addCylinderZ(faces, edges, -13, -3, 2.4, 2.4, 0, 0, 10, {
    cx: 0,
    cy: 0,
    colorHex: '#CBD5E1',
  });
  // LED indicator cap
  addBox(faces, edges, 0, 6.5, 0, 4, 3, 4, '#F59E0B', false);

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
