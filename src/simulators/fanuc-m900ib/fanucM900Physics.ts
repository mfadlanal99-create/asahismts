export interface JointAngles {
  j1: number; // deg [-180, +180]
  j2: number; // deg [-64, +90]
  j3: number; // deg [-130, +30]
  j4: number; // deg [-360, +360]
  j5: number; // deg [-125, +125]
  j6: number; // deg [-360, +360]
}

export type CoordMode = 'JOINT' | 'WORLD';

export type FanucAlarmCode =
  | 'none'
  | 'SRVO-001'
  | 'SRVO-050'
  | 'SRVO-062'
  | 'MOTN-017';

export interface FanucAlarmInfo {
  code: FanucAlarmCode;
  severity: 'ok' | 'warning' | 'fault';
  label: string;
  description: string;
}

export type TpLineAction =
  | { type: 'move'; motionType: 'J' | 'L'; pointIndex: number; speedLabel: string; term: string }
  | { type: 'do'; signal: number; value: boolean };

export interface TpProgramLine {
  lineNumber: number;
  text: string;
  action: TpLineAction;
}

export interface KinematicsResult {
  // Cartesian TCP in mm and deg (FANUC World frame)
  x: number;
  y: number;
  z: number;
  w: number;
  p: number;
  r: number;
  // Planar side-view coordinates (in robot plane, mm) for 2D/2.5D SVG rendering
  radialMm: number;
  reachPct: number;
  outOfReach: boolean;
  singularityWarning: boolean;
  // Key joint positions in robot plane (r_mm, z_mm)
  j2Pos: { r: number; z: number };
  j3Pos: { r: number; z: number };
  wristPos: { r: number; z: number };
  tcpPos: { r: number; z: number };
  // Dynamics & Servo loads
  j2TorqueNm: number;
  j3TorqueNm: number;
  j2LoadPct: number;
  j3LoadPct: number;
  counterbalanceForceN: number;
  payloadOverload: boolean;
}

export const FANUC_M900_SPECS = {
  model: 'FANUC M-900iB/700',
  controller: 'R-30iB',
  maxPayloadKg: 700,
  maxReachMm: 2832,
  repeatabilityMm: 0.3,
  // Kinematic link lengths (mm) matching M-900iB/700 geometry
  d1: 950,   // Base to J2 height
  a1: 410,   // J1 to J2 forward offset
  a2: 1120,  // J2 to J3 lower arm length
  a3: 200,   // J3 vertical offset
  d4: 1285,  // J3 to J5 wrist length
  d6: 260,   // Wrist to TCP gripper flange
} as const;

export const JOINT_LIMITS: Record<keyof JointAngles, { min: number; max: number; label: string }> = {
  j1: { min: -180, max: 180, label: 'J1 (Waist)' },
  j2: { min: -64, max: 90, label: 'J2 (Shoulder)' },
  j3: { min: -130, max: 30, label: 'J3 (Elbow)' },
  j4: { min: -360, max: 360, label: 'J4 (Wrist Roll)' },
  j5: { min: -125, max: 125, label: 'J5 (Wrist Pitch)' },
  j6: { min: -360, max: 360, label: 'J6 (Flange)' },
};

export const DEFAULT_HOME_JOINTS: JointAngles = {
  j1: 0,
  j2: 12,
  j3: -18,
  j4: 0,
  j5: -72,
  j6: 0,
};

// Default 4 taught positions P[1]..P[4] for pick-and-place
export const DEFAULT_TAUGHT_POINTS: Record<number, JointAngles> = {
  1: { j1: 0, j2: 10, j3: -15, j4: 0, j5: -75, j6: 0 },     // P[1] Home / Approach
  2: { j1: -28, j2: 46, j3: -44, j4: 0, j5: -92, j6: 0 },   // P[2] Pick from Infeed
  3: { j1: 0, j2: 8, j3: -10, j4: 0, j5: -82, j6: 0 },      // P[3] Lift / Transfer
  4: { j1: 32, j2: 44, j3: -40, j4: 0, j5: -94, j6: 0 },    // P[4] Place on Pallet
};

export const DEFAULT_TP_PROGRAM: TpProgramLine[] = [
  {
    lineNumber: 1,
    text: '1: J P[1] 100% FINE',
    action: { type: 'move', motionType: 'J', pointIndex: 1, speedLabel: '100%', term: 'FINE' },
  },
  {
    lineNumber: 2,
    text: '2: L P[2] 500mm/sec FINE',
    action: { type: 'move', motionType: 'L', pointIndex: 2, speedLabel: '500mm/sec', term: 'FINE' },
  },
  {
    lineNumber: 3,
    text: '3:   DO[1]=ON',
    action: { type: 'do', signal: 1, value: true },
  },
  {
    lineNumber: 4,
    text: '4: L P[3] 500mm/sec CNT100',
    action: { type: 'move', motionType: 'L', pointIndex: 3, speedLabel: '500mm/sec', term: 'CNT100' },
  },
  {
    lineNumber: 5,
    text: '5: L P[4] 300mm/sec FINE',
    action: { type: 'move', motionType: 'L', pointIndex: 4, speedLabel: '300mm/sec', term: 'FINE' },
  },
];

export const FANUC_ALARMS: Record<FanucAlarmCode, FanucAlarmInfo> = {
  none: {
    code: 'none',
    severity: 'ok',
    label: 'SYSTEM NORMAL',
    description: 'No active controller or servo alarms. Servos ready.',
  },
  'SRVO-001': {
    code: 'SRVO-001',
    severity: 'fault',
    label: 'SRVO-001 Operator panel E-stop',
    description: 'Emergency stop circuit open. Twist/release E-Stop mushroom button and press RESET.',
  },
  'SRVO-050': {
    code: 'SRVO-050',
    severity: 'fault',
    label: 'SRVO-050 Collision Detect alarm',
    description: 'Excessive disturbance torque on J2/J3 αiS servo motor. Check payload (≤700 kg) or obstacle.',
  },
  'SRVO-062': {
    code: 'SRVO-062',
    severity: 'fault',
    label: 'SRVO-062 BZAL alarm (Group:1)',
    description: 'Pulsecoder backup battery voltage dropped to 0 V. Mastering data lost; replace battery & remaster.',
  },
  'MOTN-017': {
    code: 'MOTN-017',
    severity: 'warning',
    label: 'MOTN-017 Limit error (G:1)',
    description: 'Commanded joint angle or Cartesian reach exceeds M-900iB/700 envelope (2832 mm).',
  },
};

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function clampJoint(key: keyof JointAngles, value: number): { value: number; clamped: boolean } {
  const lim = JOINT_LIMITS[key];
  if (value < lim.min) return { value: lim.min, clamped: true };
  if (value > lim.max) return { value: lim.max, clamped: true };
  return { value, clamped: false };
}

/**
 * Forward Kinematics for FANUC M-900iB/700.
 * J2 = 0° points straight up (+Z); +J2 pitches forward (+R).
 * J3 = 0° points horizontally forward (+R) when J2 = 0°; +J3 pitches up, -J3 pitches down.
 * Because of the parallel linkage, J3 angle in world vertical plane is measured relative to horizontal.
 */
export function computeForwardKinematics(
  joints: JointAngles,
  payloadKg: number
): KinematicsResult {
  const { d1, a1, a2, a3, d4, d6 } = FANUC_M900_SPECS;

  const j1Rad = joints.j1 * DEG2RAD;
  const j2Rad = joints.j2 * DEG2RAD;
  // Parallel linkage: J3 is relative to horizontal in M-900iB/700 convention
  const j3Rad = joints.j3 * DEG2RAD;

  // J2 shoulder pivot
  const r2 = a1;
  const z2 = d1;

  // J3 elbow pivot (J2=0 is vertical up, +J2 tilts forward)
  const r3 = r2 + a2 * Math.sin(j2Rad);
  const z3 = z2 + a2 * Math.cos(j2Rad);

  // J5 wrist center (J3=0 is horizontal forward, +J3 tilts up)
  const armLen3 = Math.hypot(d4, a3);
  const armOffsetAngle = Math.atan2(a3, d4);
  const effJ3 = j3Rad + armOffsetAngle;

  const r5 = r3 + armLen3 * Math.cos(effJ3);
  const z5 = z3 + armLen3 * Math.sin(effJ3);

  // TCP flange / gripper tip: J5 pitches relative to forearm
  const toolPitchRad = effJ3 + joints.j5 * DEG2RAD;
  const rTcp = r5 + d6 * Math.cos(toolPitchRad);
  const zTcp = z5 + d6 * Math.sin(toolPitchRad);

  const x = rTcp * Math.cos(j1Rad);
  const y = rTcp * Math.sin(j1Rad);
  const z = zTcp;

  // Euler W, P, R approximation (deg)
  const w = Number(((joints.j4 % 360) * 0.5).toFixed(1));
  const p = Number((toolPitchRad * RAD2DEG).toFixed(1));
  const r = Number(((joints.j6 + joints.j1) % 360).toFixed(1));

  const radialFromJ1 = Math.hypot(r5, Math.max(0, z5 - d1));
  const reachPct = Math.min(115, Math.max(0, (rTcp / FANUC_M900_SPECS.maxReachMm) * 100));
  const outOfReach = rTcp > FANUC_M900_SPECS.maxReachMm + 25 || radialFromJ1 > FANUC_M900_SPECS.maxReachMm;
  const singularityWarning = Math.abs(joints.j5) < 5;

  // Static torque & motor load estimation
  // Link masses (kg): lower arm ~320, upper arm ~240, wrist/gripper ~110 + payloadKg
  const g = 9.81;
  const payloadMass = Math.max(0, payloadKg);
  const mLower = 320;
  const mUpper = 240;
  const mWristTool = 110 + payloadMass;

  // Horizontal lever arms from J2 (mm -> m)
  const leverLowerM = (0.5 * a2 * Math.sin(j2Rad)) / 1000;
  const leverUpperM = (r3 - r2 + 0.45 * d4 * Math.cos(effJ3)) / 1000;
  const leverTcpM = (rTcp - r2) / 1000;

  const rawJ2GravityNm =
    g * (mLower * leverLowerM + mUpper * leverUpperM + mWristTool * leverTcpM);

  // Hydropneumatic counterbalance cylinder assists J2 when leaning forward
  const counterbalanceForceN = Math.round(4200 + 1800 * Math.abs(Math.sin(j2Rad)));
  const counterbalanceAssistNm = counterbalanceForceN * 0.38 * Math.sin(j2Rad);
  const netJ2TorqueNm = Math.abs(rawJ2GravityNm - counterbalanceAssistNm);

  // J3 torque from upper arm + wrist + payload
  const leverJ3UpperM = (0.45 * d4 * Math.cos(effJ3)) / 1000;
  const leverJ3TcpM = (rTcp - r3) / 1000;
  const netJ3TorqueNm = Math.abs(g * (mUpper * leverJ3UpperM + mWristTool * leverJ3TcpM));

  // Rated continuous stall torques (M-900iB/700 αiS 40/4000 & parallel linkage)
  const j2RatedNm = 16500;
  const j3RatedNm = 11500;

  const j2LoadPct = Math.min(150, (netJ2TorqueNm / j2RatedNm) * 100);
  const j3LoadPct = Math.min(150, (netJ3TorqueNm / j3RatedNm) * 100);
  const payloadOverload = payloadMass > FANUC_M900_SPECS.maxPayloadKg;

  return {
    x: Number(x.toFixed(1)),
    y: Number(y.toFixed(1)),
    z: Number(z.toFixed(1)),
    w,
    p,
    r,
    radialMm: Number(rTcp.toFixed(1)),
    reachPct: Number(reachPct.toFixed(1)),
    outOfReach,
    singularityWarning,
    j2Pos: { r: r2, z: z2 },
    j3Pos: { r: r3, z: z3 },
    wristPos: { r: r5, z: z5 },
    tcpPos: { r: rTcp, z: zTcp },
    j2TorqueNm: Math.round(netJ2TorqueNm),
    j3TorqueNm: Math.round(netJ3TorqueNm),
    j2LoadPct: Number(j2LoadPct.toFixed(1)),
    j3LoadPct: Number(j3LoadPct.toFixed(1)),
    counterbalanceForceN,
    payloadOverload,
  };
}

export type CartesianAxis = 'x' | 'y' | 'z' | 'w' | 'p' | 'r';

/**
 * Cartesian WORLD jog IK step.
 * Computes an incremental joint update to move the TCP along +X/-X, +Y/-Y, +Z/-Z
 * (or rotate W, P, R) while respecting M-900iB/700 joint limits and reach envelope.
 */
export function stepCartesianWorld(
  joints: JointAngles,
  axis: CartesianAxis,
  delta: number, // mm for x/y/z, deg for w/p/r
  payloadKg: number
): { nextJoints: JointAngles; limitHit: boolean } {
  if (axis === 'w') {
    const res = clampJoint('j4', joints.j4 + delta);
    return { nextJoints: { ...joints, j4: res.value }, limitHit: res.clamped };
  }
  if (axis === 'p') {
    const res = clampJoint('j5', joints.j5 + delta);
    return { nextJoints: { ...joints, j5: res.value }, limitHit: res.clamped };
  }
  if (axis === 'r') {
    const res = clampJoint('j6', joints.j6 + delta);
    return { nextJoints: { ...joints, j6: res.value }, limitHit: res.clamped };
  }

  const fk = computeForwardKinematics(joints, payloadKg);
  const targetX = fk.x + (axis === 'x' ? delta : 0);
  const targetY = fk.y + (axis === 'y' ? delta : 0);
  const targetZ = fk.z + (axis === 'z' ? delta : 0);

  // New J1 from target (x, y)
  const targetR_Tcp = Math.hypot(targetX, targetY);
  if (targetR_Tcp < 350 || targetR_Tcp > FANUC_M900_SPECS.maxReachMm + 15) {
    return { nextJoints: joints, limitHit: true };
  }

  let nextJ1 = Math.atan2(targetY, targetX) * RAD2DEG;
  // Keep J1 continuous near ±180
  if (Math.abs(nextJ1 - joints.j1) > 180) {
    nextJ1 += nextJ1 > joints.j1 ? -360 : 360;
  }

  // Solve 2-link planar IK in (R, Z) for J2 and J3 to place wrist center
  const { d1, a1, a2, a3, d4, d6 } = FANUC_M900_SPECS;
  const effJ3Current = joints.j3 * DEG2RAD + Math.atan2(a3, d4);
  const toolPitchRad = effJ3Current + joints.j5 * DEG2RAD;

  // Keep current tool pitch constant during X/Y/Z jog
  const targetR5 = targetR_Tcp - d6 * Math.cos(toolPitchRad);
  const targetZ5 = targetZ - d6 * Math.sin(toolPitchRad);

  const dr = targetR5 - a1;
  const dz = targetZ5 - d1;
  const L1 = a2;
  const L2 = Math.hypot(d4, a3);
  const distSq = dr * dr + dz * dz;
  const dist = Math.sqrt(distSq);

  if (dist > L1 + L2 - 10 || dist < Math.abs(L1 - L2) + 20) {
    return { nextJoints: joints, limitHit: true };
  }

  // Law of cosines for elbow-up configuration
  const cosAlpha = Math.max(-1, Math.min(1, (L1 * L1 + distSq - L2 * L2) / (2 * L1 * dist)));
  const alpha = Math.acos(cosAlpha);
  // Angle from vertical (+Z) to target vector (dr, dz)
  const phiFromVertical = Math.atan2(dr, dz);
  // Elbow-up: J2 leans less forward (smaller angle from vertical)
  const nextJ2Rad = phiFromVertical - alpha;
  const nextJ2 = nextJ2Rad * RAD2DEG;

  // Wrist center relative to J3
  const j3r = L1 * Math.sin(nextJ2Rad);
  const j3z = L1 * Math.cos(nextJ2Rad);
  const nextEffJ3 = Math.atan2(dz - j3z, dr - j3r);
  const nextJ3 = (nextEffJ3 - Math.atan2(a3, d4)) * RAD2DEG;

  // Adjust J5 so tool pitch remains steady
  const nextJ5 = toolPitchRad * RAD2DEG - nextEffJ3 * RAD2DEG;

  const c1 = clampJoint('j1', nextJ1);
  const c2 = clampJoint('j2', nextJ2);
  const c3 = clampJoint('j3', nextJ3);
  const c5 = clampJoint('j5', nextJ5);

  if (c1.clamped || c2.clamped || c3.clamped || c5.clamped) {
    return { nextJoints: joints, limitHit: true };
  }

  return {
    nextJoints: {
      ...joints,
      j1: Number(c1.value.toFixed(2)),
      j2: Number(c2.value.toFixed(2)),
      j3: Number(c3.value.toFixed(2)),
      j5: Number(c5.value.toFixed(2)),
    },
    limitHit: false,
  };
}

export function interpolateJoints(a: JointAngles, b: JointAngles, t: number): JointAngles {
  const s = Math.max(0, Math.min(1, t));
  return {
    j1: a.j1 + (b.j1 - a.j1) * s,
    j2: a.j2 + (b.j2 - a.j2) * s,
    j3: a.j3 + (b.j3 - a.j3) * s,
    j4: a.j4 + (b.j4 - a.j4) * s,
    j5: a.j5 + (b.j5 - a.j5) * s,
    j6: a.j6 + (b.j6 - a.j6) * s,
  };
}
