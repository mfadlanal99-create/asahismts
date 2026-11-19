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

/**
 * Local vertical-axis (Y) cylinder/cone/hollow-ring helper matching cad3dEngine winding.
 */
function addCylinderY(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  cx: number,
  y0: number,
  y1: number,
  cz: number,
  rOut0: number,
  rOut1: number,
  rIn0: number,
  rIn1: number,
  segments: number,
  opts?: {
    colorHex?: string;
    isHousingShell?: boolean;
    addRimEdges?: boolean;
  }
) {
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

    const o00: Vec3 = [cx + rOut0 * c0, y0, cz + rOut0 * s0];
    const o01: Vec3 = [cx + rOut0 * c1, y0, cz + rOut0 * s1];
    const o10: Vec3 = [cx + rOut1 * c0, y1, cz + rOut1 * s0];
    const o11: Vec3 = [cx + rOut1 * c1, y1, cz + rOut1 * s1];

    faces.push({
      verts: [o00, o01, o11, o10],
      colorHex,
      isHousingShell,
      cullBackface: false,
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
        verts: [i00, i10, i11, i01],
        colorHex,
        isHousingShell,
        cullBackface: false,
      });
      // Top & bottom annular caps
      faces.push({
        verts: [o00, i00, i01, o01],
        colorHex,
        isHousingShell,
        cullBackface: false,
      });
      faces.push({
        verts: [o10, o11, i11, i10],
        colorHex,
        isHousingShell,
        cullBackface: false,
      });
      if (addRimEdges) {
        edges.push({ a: i00, b: i01, isHousingShell });
        edges.push({ a: i10, b: i11, isHousingShell });
      }
    } else {
      faces.push({
        verts: [[cx, y0, cz], o00, o01],
        colorHex,
        isHousingShell,
        cullBackface: false,
      });
      faces.push({
        verts: [[cx, y1, cz], o11, o10],
        colorHex,
        isHousingShell,
        cullBackface: false,
      });
    }
  }
}

/**
 * Adds a helical or spur gear along the X axis at local origin [cx, cy, cz].
 */
function addGearX(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  cy: number,
  cz: number,
  rRoot: number,
  rTip: number,
  rBore: number,
  teethCount: number,
  helixTwistRad: number,
  bodyColor: string,
  toothColor: string
) {
  // Build at origin then offset by [0, cy, cz] via helper wrapper
  const localFaces: RawFaceDef[] = [];
  const localEdges: EdgeDef[] = [];
  addCylinderSection(localFaces, localEdges, x0, x1, rRoot, rRoot, rBore, rBore, 20, {
    colorHex: bodyColor,
  });

  // Helical tooth ribs around circumference
  const toothW = ((Math.PI * 2) / teethCount) * 0.42;
  for (let i = 0; i < teethCount; i++) {
    const a0 = (i / teethCount) * Math.PI * 2;
    const a1 = a0 + toothW;
    const b0 = a0 + helixTwistRad;
    const b1 = a1 + helixTwistRad;

    const p00: Vec3 = [x0, rRoot * Math.cos(a0), rRoot * Math.sin(a0)];
    const p01: Vec3 = [x0, rRoot * Math.cos(a1), rRoot * Math.sin(a1)];
    const t00: Vec3 = [x0, rTip * Math.cos(a0), rTip * Math.sin(a0)];
    const t01: Vec3 = [x0, rTip * Math.cos(a1), rTip * Math.sin(a1)];

    const p10: Vec3 = [x1, rRoot * Math.cos(b0), rRoot * Math.sin(b0)];
    const p11: Vec3 = [x1, rRoot * Math.cos(b1), rRoot * Math.sin(b1)];
    const t10: Vec3 = [x1, rTip * Math.cos(b0), rTip * Math.sin(b0)];
    const t11: Vec3 = [x1, rTip * Math.cos(b1), rTip * Math.sin(b1)];

    localFaces.push({ verts: [t00, t01, t11, t10], colorHex: toothColor });
    localFaces.push({ verts: [p00, t00, t10, p10], colorHex: toothColor });
    localFaces.push({ verts: [t01, p01, p11, t11], colorHex: toothColor });
    localFaces.push({ verts: [p00, p01, t01, t00], colorHex: toothColor });
    localFaces.push({ verts: [p10, t10, t11, p11], colorHex: toothColor });
    localEdges.push({ a: t00, b: t10 });
    localEdges.push({ a: t01, b: t11 });
  }

  for (const rf of localFaces) {
    faces.push({
      ...rf,
      verts: rf.verts.map(([vx, vy, vz]) => [vx, vy + cy, vz + cz] as Vec3),
    });
  }
  for (const ed of localEdges) {
    edges.push({
      ...ed,
      a: [ed.a[0], ed.a[1] + cy, ed.a[2] + cz],
      b: [ed.b[0], ed.b[1] + cy, ed.b[2] + cz],
    });
  }
}

/**
 * Adds a cylinder along X axis shifted by [0, cy, cz].
 */
function addCylinderAtX(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  cy: number,
  cz: number,
  rOut0: number,
  rOut1: number,
  rIn0: number,
  rIn1: number,
  segments: number,
  opts?: { colorHex?: string; isHousingShell?: boolean; addRimEdges?: boolean }
) {
  const localFaces: RawFaceDef[] = [];
  const localEdges: EdgeDef[] = [];
  addCylinderSection(localFaces, localEdges, x0, x1, rOut0, rOut1, rIn0, rIn1, segments, opts);
  for (const rf of localFaces) {
    faces.push({
      ...rf,
      verts: rf.verts.map(([vx, vy, vz]) => [vx, vy + cy, vz + cz] as Vec3),
    });
  }
  for (const ed of localEdges) {
    edges.push({
      ...ed,
      a: [ed.a[0], ed.a[1] + cy, ed.a[2] + cz],
      b: [ed.b[0], ed.b[1] + cy, ed.b[2] + cz],
    });
  }
}

/**
 * Adds a semi-circular eccentric counterweight sector along X axis.
 */
function addEccentricSectorX(
  faces: RawFaceDef[],
  edges: EdgeDef[],
  x0: number,
  x1: number,
  rIn: number,
  rOut: number,
  startAngle: number,
  sweepAngle: number,
  segments: number,
  colorHex: string
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

    faces.push({ verts: [o00, o01, o11, o10], colorHex });
    faces.push({ verts: [i00, i10, i11, i01], colorHex });
    faces.push({ verts: [o00, i00, i01, o01], colorHex });
    faces.push({ verts: [o10, o11, i11, i10], colorHex });
    edges.push({ a: o00, b: o01 });
    edges.push({ a: o10, b: o11 });

    if (i === 0) {
      faces.push({ verts: [i00, o00, o10, i10], colorHex });
      edges.push({ a: i00, b: o00 });
      edges.push({ a: i10, b: o10 });
    }
    if (i === segments - 1) {
      faces.push({ verts: [o01, i01, i11, o11], colorHex });
      edges.push({ a: o01, b: i01 });
      edges.push({ a: o11, b: i11 });
    }
  }
}

// ============================================================================
// 1. HELICAL 2-STAGE INDUSTRIAL GEARBOX REDUCER
// ============================================================================

function buildGbUpperHousing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Upper split-case shell (+Y is UP: y from 0 to +36)
  addBox(faces, edges, 0, 18, 0, 70, 18, 30, baseHex, true);
  // Split-line flange at y = +2
  addBox(faces, edges, 0, 2, 0, 74, 2.5, 34, '#334155', true);
  // Top inspection cover + breather cap
  addBox(faces, edges, 0, 37, 0, 26, 2, 18, '#64748b', true);
  addCylinderY(faces, edges, -16, 38, 44, 0, 4.5, 4.5, 0, 0, 10, {
    colorHex: '#d97706',
    isHousingShell: true,
  });
  // Lifting eye lugs
  addBox(faces, edges, -64, 39, 0, 4, 4, 6, '#475569', true);
  addBox(faces, edges, 64, 39, 0, 4, 4, 6, '#475569', true);
  // Cooling ribs along front & back
  for (const rx of [-45, -25, -5, 15, 35, 55]) {
    addBox(faces, edges, rx, 18, 31, 2, 14, 1.5, '#3b526b', true);
    addBox(faces, edges, rx, 18, -31, 2, 14, 1.5, '#3b526b', true);
  }
  return compileMesh(faces, edges, [0, 38, 0], baseHex);
}

function buildGbLowerSumpBase(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Lower sump body (basePosition: [0, -18, 0], so y: -20..+16 -> world -38..-2)
  addBox(faces, edges, 0, -2, 0, 70, 18, 30, baseHex, true);
  // Lower split-line flange at y = +16
  addBox(faces, edges, 0, 16, 0, 74, 2.5, 34, '#334155', true);
  // 4 heavy mounting foot pads + M20 anchor bolt bosses at bottom (-Y)
  for (const fx of [-64, 64]) {
    for (const fz of [-33, 33]) {
      addBox(faces, edges, fx, -19, fz, 10, 3.5, 6, '#1e293b', true);
      addCylinderY(faces, edges, fx, -16, -12, fz, 3.2, 3.2, 0, 0, 8, {
        colorHex: '#cbd5e1',
        isHousingShell: true,
      });
    }
  }
  return compileMesh(faces, edges, [0, -16, 0], baseHex);
}

function buildGbInputPinion(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [-46, -4, 0]
  addCylinderSection(faces, edges, -46, 26, 7.5, 7.5, 0, 0, 14, { colorHex: '#cbd5e1' });
  // Coupling hub & keyway at left input end
  addCylinderSection(faces, edges, -44, -30, 11, 11, 7.5, 7.5, 14, { colorHex: '#64748b' });
  // Helical pinion gear (stage 1)
  addGearX(faces, edges, -6, 16, 0, 0, 11, 15, 7.5, 14, 0.25, baseHex, '#f59e0b');
  return compileMesh(faces, edges, [-24, -14, 0], baseHex);
}

function buildGbIntermediateShaft(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 4, 0]
  addCylinderSection(faces, edges, -30, 30, 8.5, 8.5, 0, 0, 14, { colorHex: '#cbd5e1' });
  // Driven 1st-stage helical gear (meshes with input pinion)
  addGearX(faces, edges, -22, -4, 0, 0, 21, 26, 8.5, 22, -0.22, baseHex, '#94a3b8');
  // 2nd-stage helical pinion (meshes with bull gear)
  addGearX(faces, edges, 6, 24, 0, 0, 11, 15.5, 8.5, 14, 0.24, '#64748b', '#e2e8f0');
  return compileMesh(faces, edges, [-12, -26, 0], baseHex);
}

function buildGbBullGearOutput(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [50, 8, 0] -> bull gear sits around x = -34..-14 (world +16..+36)
  addCylinderSection(faces, edges, -36, 44, 11, 11, 0, 0, 16, { colorHex: '#cbd5e1' });
  // Output shaft key & coupling shoulder
  addCylinderSection(faces, edges, 22, 42, 13.5, 13.5, 11, 11, 16, { colorHex: '#64748b' });
  // Heavy helical bull gear
  addGearX(faces, edges, -34, -14, 0, 0, 25, 30, 11, 26, -0.22, baseHex, '#cbd5e1');
  return compileMesh(faces, edges, [-24, -30, 0], baseHex);
}

function buildGbTaperedBearings(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // 6 tapered roller bearings at the 3 shaft bearing seats
  const seats: Array<[number, number, number]> = [
    [-68, 4, 12],
    [-22, 4, 12],
    [-28, -4, 13],
    [28, -4, 13],
    [16, -8, 16],
    [68, -8, 16],
  ];
  for (const [bx, by, rOut] of seats) {
    addCylinderAtX(faces, edges, bx - 4, bx + 4, by, 0, rOut, rOut, rOut - 3.5, rOut - 3.5, 14, {
      colorHex: baseHex,
    });
    addCylinderAtX(faces, edges, bx - 3, bx + 3, by, 0, rOut - 1.2, rOut - 1.2, rOut - 2.6, rOut - 2.6, 12, {
      colorHex: '#f59e0b',
    });
  }
  return compileMesh(faces, edges, [0, 4, -14], baseHex);
}

function buildGbLipSeals(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Input & output Viton lip seals + bolted end covers
  addCylinderAtX(faces, edges, -74, -70, 4, 0, 15, 15, 8, 8, 14, { colorHex: '#475569' });
  addCylinderAtX(faces, edges, -75, -73, 4, 0, 11, 11, 7.6, 7.6, 12, { colorHex: baseHex });
  addCylinderAtX(faces, edges, 70, 74, -8, 0, 19, 19, 11.2, 11.2, 14, { colorHex: '#475569' });
  addCylinderAtX(faces, edges, 73, 75, -8, 0, 14, 14, 11, 11, 12, { colorHex: baseHex });
  // Blind end caps for intermediate shaft
  addCylinderAtX(faces, edges, -32, -29, -4, 0, 14, 14, 0, 0, 12, { colorHex: '#475569' });
  addCylinderAtX(faces, edges, 29, 32, -4, 0, 14, 14, 0, 0, 12, { colorHex: '#475569' });
  return compileMesh(faces, edges, [74, -8, 16], baseHex);
}

function buildGbOilSightDrain(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 32, 34]
  // Brass sight glass bezel facing +Z
  addBox(faces, edges, 0, 0, 0, 5.5, 5.5, 2.5, baseHex);
  addBox(faces, edges, 0, 0, 2, 3.5, 3.5, 1, '#38bdf8');
  // Magnetic drain plug lower down
  addBox(faces, edges, 18, 6, -1, 3, 3, 3, '#d97706');
  return compileMesh(faces, edges, [0, 0, 4], baseHex);
}

// ============================================================================
// 2. TEKA THZ 4500 A TURBINE / PLANETARY PAN MIXER
// ============================================================================

function buildTekaPanTrough(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, -24, 0] (+Y is UP)
  // Outer cylindrical pan wall (rOut = 74, rIn = 69, y: -12..+22)
  addCylinderY(faces, edges, 0, -12, 22, 0, 74, 74, 69, 69, 24, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // Pan bottom plate
  addCylinderY(faces, edges, 0, -14, -10, 0, 74, 74, 22, 22, 24, {
    colorHex: '#334155',
    isHousingShell: true,
  });
  // Central inner cone/column forming the ring trough
  addCylinderY(faces, edges, 0, -14, 22, 0, 26, 22, 0, 0, 18, {
    colorHex: '#475569',
    isHousingShell: true,
  });
  // Top rim flange
  addCylinderY(faces, edges, 0, 21, 24, 0, 77, 77, 69, 69, 24, {
    colorHex: '#1e293b',
    isHousingShell: true,
  });
  // 4 structural support legs pointing DOWN (-Y)
  for (const [lx, lz] of [
    [-54, -42],
    [54, -42],
    [-54, 42],
    [54, 42],
  ]) {
    addBox(faces, edges, lx, -24, lz, 4.5, 14, 4.5, '#1e293b', true);
    addBox(faces, edges, lx, -38, lz, 7, 2, 7, '#0f172a', true);
  }
  return compileMesh(faces, edges, [-72, 0, 0], baseHex);
}

function buildTekaWearLiners(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, -20, 0] -> Hardox 500 ring floor + wall liner ring
  addCylinderY(faces, edges, 0, -13.5, -10, 0, 68, 68, 27, 27, 20, { colorHex: baseHex });
  addCylinderY(faces, edges, 0, -11, 14, 0, 68.5, 68.5, 66.5, 66.5, 20, { colorHex: '#64748b' });
  return compileMesh(faces, edges, [-48, -8, 34], baseHex);
}

function buildTekaDustHood(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 34, 0]
  addCylinderY(faces, edges, 0, -30, -24, 0, 76, 76, 26, 26, 24, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // Inspection hatch lids on top (+Y)
  addBox(faces, edges, -44, -22, 26, 12, 2, 10, '#64748b', true);
  addBox(faces, edges, 44, -22, -26, 12, 2, 10, '#64748b', true);
  // Cement / aggregate inlet chute on top (+Y)
  addCylinderY(faces, edges, -38, -24, -6, -22, 10, 10, 8, 8, 12, {
    colorHex: '#475569',
    isHousingShell: true,
  });
  return compileMesh(faces, edges, [-46, -20, 28], baseHex);
}

function buildTekaPlanetaryGearbox(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 18, 0]
  addCylinderY(faces, edges, 0, -12, 16, 0, 26, 24, 0, 0, 18, { colorHex: baseHex });
  // Top bevel input housing
  addBox(faces, edges, -8, 22, 0, 18, 8, 14, '#1e40af');
  // Integrated hydraulic power-pack pump block on side
  addBox(faces, edges, 24, 6, -12, 8, 8, 8, '#475569');
  addCylinderY(faces, edges, 24, 12, 18, -12, 4.5, 4.5, 0, 0, 10, { colorHex: '#0284c7' });
  return compileMesh(faces, edges, [0, 24, 0], baseHex);
}

function buildTekaDriveMotorCoupling(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [-86, 12, 0]
  addCylinderSection(faces, edges, -24, 14, 15, 15, 0, 0, 16, { colorHex: baseHex });
  addBox(faces, edges, -6, 18, 0, 6, 4, 6, '#334155');
  addCylinderSection(faces, edges, 14, 28, 13, 13, 0, 0, 16, { colorHex: '#f59e0b' });
  addCylinderSection(faces, edges, 28, 66, 4.5, 4.5, 0, 0, 12, { colorHex: '#cbd5e1' });
  return compileMesh(faces, edges, [-4, 18, 0], baseHex);
}

function buildTekaTurbineRotorArms(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, -8, 0]
  addCylinderY(faces, edges, 0, -6, 6, 0, 26, 26, 16, 16, 18, { colorHex: '#475569' });
  const armAngles = [0.2, Math.PI * 0.5 + 0.2, Math.PI + 0.2, Math.PI * 1.5 + 0.2];
  const radii = [36, 48, 58, 42];
  for (let i = 0; i < 4; i++) {
    const a = armAngles[i];
    const r = radii[i];
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const mx = ca * (22 + r) * 0.5;
    const mz = sa * (22 + r) * 0.5;
    addBox(faces, edges, mx, 0, mz, Math.abs(ca * (r - 22) * 0.5) + 2, 2.5, Math.abs(sa * (r - 22) * 0.5) + 2, '#94a3b8');
    // Paddles hang DOWN (-Y) into the ring trough
    addBox(faces, edges, ca * r, -12, sa * r, 5, 6, 2.5, baseHex);
  }
  return compileMesh(faces, edges, [-44, -8, 12], baseHex);
}

function buildTekaIntensiveAgitator(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [34, 8, 22]
  // Top vertical agitator motor (+Y)
  addCylinderY(faces, edges, 0, 6, 28, 0, 9.5, 9.5, 0, 0, 14, { colorHex: '#0284c7' });
  addCylinderY(faces, edges, 0, 2, 6, 0, 12, 12, 0, 0, 14, { colorHex: '#475569' });
  // Vertical agitator shaft extending DOWN (-Y)
  addCylinderY(faces, edges, 0, -26, 2, 0, 3.2, 3.2, 0, 0, 10, { colorHex: '#cbd5e1' });
  // 3-blade high-speed whirl star at bottom (-Y)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    addBox(faces, edges, Math.cos(a) * 8, -23, Math.sin(a) * 8, 6, 3, 2, baseHex);
  }
  return compileMesh(faces, edges, [0, 26, 0], baseHex);
}

function buildTekaDischargeGate(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [26, 36, 34]
  // Rotary discharge gate chute housing
  addBox(faces, edges, 0, 0, 0, 12, 6, 12, baseHex);
  // Hydraulic actuator cylinder
  addCylinderSection(faces, edges, 14, 34, 3.5, 3.5, 0, 0, 10, { colorHex: '#0284c7' });
  // Chrome piston rod
  addCylinderSection(faces, edges, 4, 14, 1.8, 1.8, 0, 0, 8, { colorHex: '#e2e8f0' });
  return compileMesh(faces, edges, [16, 0, 8], baseHex);
}

// ============================================================================
// 3. 3-PHASE TEFC SQUIRREL-CAGE INDUCTION MOTOR (IEC 160M)
// ============================================================================

function buildMotStatorFrame(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Barrel (x: -40..+40, rOut: 35, rIn: 30)
  addCylinderSection(faces, edges, -40, 40, 35, 35, 30, 30, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // 16 axial cooling fins around perimeter (+Y is UP)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const fy = Math.cos(a) * 37.5;
    const fz = Math.sin(a) * 37.5;
    // Skip bottom where feet sit (-Y) & top where terminal box sits (+Y)
    if (fy < -26 || (fy > 28 && Math.abs(fz) < 16)) continue;
    addBox(faces, edges, 0, fy, fz, 36, 1.6, 1.6, '#1d4ed8', true);
  }
  // 2 mounting feet at bottom (-Y)
  addBox(faces, edges, 0, -38, -24, 30, 4, 7, '#1e3a8a', true);
  addBox(faces, edges, 0, -38, 24, 30, 4, 7, '#1e3a8a', true);
  // Top lifting eyebolt (+Y)
  addCylinderY(faces, edges, 24, 36, 44, 0, 3.5, 3.5, 1.5, 1.5, 10, {
    colorHex: '#94a3b8',
    isHousingShell: true,
  });
  return compileMesh(faces, edges, [-20, 38, 18], baseHex);
}

function buildMotStatorWinding(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Silicon steel core stack
  addCylinderSection(faces, edges, -24, 24, 29, 29, 20, 20, 20, { colorHex: '#64748b' });
  // Copper end-windings on both ends
  addCylinderSection(faces, edges, -32, -24, 27, 28, 21, 21, 18, { colorHex: baseHex });
  addCylinderSection(faces, edges, 24, 32, 28, 27, 21, 21, 18, { colorHex: baseHex });
  return compileMesh(faces, edges, [28, -24, 0], baseHex);
}

function buildMotSquirrelRotor(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [6, 0, 0] -> rotor core world x: -24..+24 (local -30..+18)
  addCylinderSection(faces, edges, -30, 18, 18.5, 18.5, 0, 0, 18, { colorHex: baseHex });
  // Die-cast aluminum end-ring blades
  addCylinderSection(faces, edges, -33, -30, 17, 18.5, 9, 9, 14, { colorHex: '#e2e8f0' });
  addCylinderSection(faces, edges, 18, 21, 18.5, 17, 9, 9, 14, { colorHex: '#e2e8f0' });
  // Precision shaft extending NDE (-62) to DE (+80)
  addCylinderSection(faces, edges, -62, 80, 7.5, 7.5, 0, 0, 14, { colorHex: '#cbd5e1' });
  // DE shaft key
  addBox(faces, edges, 66, -7.8, 0, 10, 1.4, 1.6, '#f59e0b');
  return compileMesh(faces, edges, [70, -10, 0], baseHex);
}

function buildMotBearings(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // NDE (x = -41) and DE (x = +41) 6309-2Z ball bearings
  for (const bx of [-41, 41]) {
    addCylinderSection(faces, edges, bx - 4, bx + 4, 14, 14, 7.6, 7.6, 16, { colorHex: baseHex });
    addCylinderSection(faces, edges, bx - 2.5, bx + 2.5, 12.2, 12.2, 9.2, 9.2, 14, {
      colorHex: '#f59e0b',
    });
  }
  return compileMesh(faces, edges, [41, -14, 0], baseHex);
}

function buildMotEndShields(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [44, 0, 0] -> DE at local x = -4..+6, NDE at local x = -88..-78 (world -44..-34)
  addCylinderSection(faces, edges, -4, 4, 35, 22, 14, 14, 18, { colorHex: baseHex });
  addBoltRing(faces, edges, 4, 6, 31, 1.6, 6, '#cbd5e1');
  addCylinderSection(faces, edges, -88, -80, 22, 35, 14, 14, 18, { colorHex: baseHex });
  addBoltRing(faces, edges, -90, -88, 31, 1.6, 6, '#cbd5e1');
  return compileMesh(faces, edges, [4, -26, 0], baseHex);
}

function buildMotCoolingFan(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [-50, 0, 0]
  addCylinderSection(faces, edges, -5, 5, 11, 11, 7.5, 7.5, 14, { colorHex: baseHex });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    addBox(faces, edges, 0, Math.cos(a) * 19, Math.sin(a) * 19, 4.5, 8, 1.2, baseHex);
  }
  return compileMesh(faces, edges, [0, -24, 0], baseHex);
}

function buildMotFanCowl(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [-66, 0, 0]
  addCylinderSection(faces, edges, -12, 24, 34, 35, 31, 32, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // Rear intake grille rings
  addCylinderSection(faces, edges, -14, -12, 34, 34, 24, 24, 18, {
    colorHex: '#334155',
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, -14, -12, 18, 18, 10, 10, 14, {
    colorHex: '#334155',
    isHousingShell: true,
  });
  return compileMesh(faces, edges, [-12, -32, 0], baseHex);
}

function buildMotTerminalBox(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 48, 0] (+Y is UP)
  addBox(faces, edges, 0, 0, 0, 13, 8, 13, baseHex);
  addBox(faces, edges, 0, 9, 0, 14, 1.5, 14, '#1e3a8a');
  // M32 brass cable gland
  addCylinderAtX(faces, edges, 13, 21, 0, 0, 3.5, 3.5, 1.8, 1.8, 10, { colorHex: '#d97706' });
  return compileMesh(faces, edges, [0, 11, 0], baseHex);
}

// ============================================================================
// 4. URAS KEE ROTARY ELECTRIC VIBRATING MOTOR
// ============================================================================

function buildUrasFrameHousing(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, -12, 0] -> barrel centered at local y = +12 (world y = 0)
  addCylinderAtX(faces, edges, -30, 30, 12, 0, 31, 31, 25, 25, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  // Heavy 4-bolt FCD450 mounting feet at bottom (local y = -16 -> world -28)
  addBox(faces, edges, 0, -16, 0, 26, 4, 28, '#9a3412', true);
  // 4 Grade 10.9 anchor bolt heads on top of feet
  for (const [bx, bz] of [
    [-20, -22],
    [20, -22],
    [-20, 22],
    [20, 22],
  ]) {
    addCylinderY(faces, edges, bx, -13, -8, bz, 3.2, 3.2, 0, 0, 8, {
      colorHex: '#cbd5e1',
      isHousingShell: true,
    });
  }
  return compileMesh(faces, edges, [0, -18, 28], baseHex);
}

function buildUrasStatorCore(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  addCylinderSection(faces, edges, -18, 18, 24.5, 24.5, 17, 17, 18, { colorHex: '#64748b' });
  // Varnished Class-F copper end turns
  addCylinderSection(faces, edges, -23, -18, 23, 24, 18, 18, 16, { colorHex: baseHex });
  addCylinderSection(faces, edges, 18, 23, 24, 23, 18, 18, 16, { colorHex: baseHex });
  return compileMesh(faces, edges, [-20, -24, 0], baseHex);
}

function buildUrasRotorShaft(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // High-stiffness 42CrMo4 dual-extension shaft
  addCylinderSection(faces, edges, -54, 54, 8.5, 8.5, 0, 0, 14, { colorHex: '#cbd5e1' });
  // Squirrel-cage rotor core
  addCylinderSection(faces, edges, -18, 18, 16, 16, 8.5, 8.5, 16, { colorHex: baseHex });
  return compileMesh(faces, edges, [0, -16, 0], baseHex);
}

function buildUrasBearingsBrackets(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Heavy C3 bearings + nodular iron end brackets at x = ±30
  for (const sign of [-1, 1]) {
    const x0 = sign > 0 ? 26 : -34;
    const x1 = sign > 0 ? 34 : -26;
    addCylinderSection(faces, edges, x0, x1, 30, 30, 12, 12, 18, { colorHex: baseHex });
    addCylinderSection(faces, edges, x0 + 1, x1 - 1, 15, 15, 8.6, 8.6, 14, { colorHex: '#f59e0b' });
    // Top brass grease nipple (+Y)
    addCylinderY(faces, edges, (x0 + x1) * 0.5, 29, 34, 0, 2.2, 2.2, 0, 0, 8, {
      colorHex: '#fbbf24',
    });
  }
  return compileMesh(faces, edges, [-30, 32, 0], baseHex);
}

function buildUrasFixedWeights(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [-44, 0, 0] -> keyed semi-circular eccentric fixed weight
  addCylinderSection(faces, edges, -6, 6, 12, 12, 8.5, 8.5, 14, { colorHex: '#475569' });
  addEccentricSectorX(faces, edges, -6, 6, 11, 27, 0, Math.PI, 10, baseHex);
  return compileMesh(faces, edges, [0, 24, 0], baseHex);
}

function buildUrasAdjWeights(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [44, 0, 0] -> phase-adjustable sector + Grade 10.9 clamp bolt
  addCylinderSection(faces, edges, -6, 6, 12, 12, 8.5, 8.5, 14, { colorHex: '#475569' });
  addEccentricSectorX(faces, edges, -6, 6, 11, 27, 0.55, Math.PI, 10, baseHex);
  addBox(faces, edges, 0, 15, 12, 4, 4, 4, '#cbd5e1');
  return compileMesh(faces, edges, [0, 22, 12], baseHex);
}

function buildUrasWeightCovers(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // Left & right ADC12 O-ring sealed weight covers
  addCylinderSection(faces, edges, -56, -34, 31, 32, 27, 28, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, -57, -55, 31, 31, 0, 0, 18, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, 34, 56, 32, 31, 28, 27, 20, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  addCylinderSection(faces, edges, 55, 57, 31, 31, 0, 0, 18, {
    colorHex: baseHex,
    isHousingShell: true,
  });
  return compileMesh(faces, edges, [-48, -30, 0], baseHex);
}

function buildUrasTerminalBox(baseHex: string): PartMesh {
  const faces: RawFaceDef[] = [];
  const edges: EdgeDef[] = [];
  // basePosition [0, 44, 0] (+Y is UP)
  addBox(faces, edges, 0, 0, 0, 12, 7, 12, baseHex);
  addBox(faces, edges, 0, 8, 0, 13, 1.5, 13, '#334155');
  // Anti-vibration rubber cable gland
  addCylinderAtX(faces, edges, 12, 20, 0, 0, 3.2, 3.2, 1.5, 1.5, 10, { colorHex: '#1e293b' });
  return compileMesh(faces, edges, [0, 10, 0], baseHex);
}

/**
 * Dispatcher for all 32 parts of the 4 added machines.
 * Returns null if partId does not belong to these 4 machines.
 */
export function buildExtraMachineMesh(partId: string, baseHex: string): PartMesh | null {
  switch (partId) {
    // 1. Gearbox Reducer
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

    // 2. TEKA THZ 4500 A Mixer
    case 'teka-pan-trough':
      return buildTekaPanTrough(baseHex);
    case 'teka-wear-liners':
      return buildTekaWearLiners(baseHex);
    case 'teka-dust-hood':
      return buildTekaDustHood(baseHex);
    case 'teka-planetary-gearbox':
      return buildTekaPlanetaryGearbox(baseHex);
    case 'teka-drive-motor-coupling':
      return buildTekaDriveMotorCoupling(baseHex);
    case 'teka-turbine-rotor-arms':
      return buildTekaTurbineRotorArms(baseHex);
    case 'teka-intensive-agitator':
      return buildTekaIntensiveAgitator(baseHex);
    case 'teka-discharge-gate':
      return buildTekaDischargeGate(baseHex);

    // 3. 3-Phase TEFC Motor
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

    // 4. URAS KEE Vibrating Motor
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
