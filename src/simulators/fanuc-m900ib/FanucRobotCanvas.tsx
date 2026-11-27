import { useEffect, useRef, useState } from 'react';
import { Maximize2, RotateCcw } from 'lucide-react';
import type {
  FanucAlarmCode,
  JointAngles,
  KinematicsResult,
} from './fanucM900Physics';
import { FANUC_ALARMS, FANUC_M900_SPECS } from './fanucM900Physics';

export interface TcpTrailPoint {
  r: number;
  z: number;
  x?: number;
  y?: number;
}

interface FanucRobotCanvasProps {
  joints: JointAngles;
  kinematics: KinematicsResult;
  payloadKg: number;
  gripperOn: boolean;
  workpieceState: 'infeed' | 'carried' | 'pallet';
  alarm: FanucAlarmCode;
  tpEnabled: boolean;
  deadmanEnabled: boolean;
  eStopActive: boolean;
  tcpTrail: TcpTrailPoint[];
  labels: {
    reachEnvelope: string;
    payload: string;
    j2Load: string;
    singularity: string;
    turretJ1: string;
    infeed: string;
    pallet: string;
    servoOn: string;
    servoOff: string;
  };
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Face3D {
  pts: Vec3[];
  color: string;
  stroke?: string;
  specular?: number;
  ambient?: number;
}

type CameraPreset = 'iso' | 'front' | 'side' | 'top';

const PRESETS: Record<CameraPreset, { yaw: number; pitch: number; zoom: number }> = {
  iso: { yaw: -0.58, pitch: 0.34, zoom: 1.02 },
  front: { yaw: -Math.PI / 2, pitch: 0.16, zoom: 1.02 },
  side: { yaw: 0.0, pitch: 0.16, zoom: 1.02 },
  top: { yaw: -Math.PI / 2, pitch: 1.38, zoom: 0.92 },
};

const DEG2RAD = Math.PI / 180;

// --- 3D Vector & Matrix Helpers ---
function vAdd(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vSub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vCross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function vDot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vNorm(a: Vec3): Vec3 {
  const len = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / len, y: a.y / len, z: a.z / len };
}

function rotX(v: Vec3, rad: number): Vec3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

function rotY(v: Vec3, rad: number): Vec3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

function rotZ(v: Vec3, rad: number): Vec3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shadeColor(hex: string, intensity: number, spec = 0): string {
  const [r, g, b] = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const sr = clamp(r * intensity + 255 * spec);
  const sg = clamp(g * intensity + 255 * spec);
  const sb = clamp(b * intensity + 255 * spec);
  return `rgb(${sr},${sg},${sb})`;
}

/**
 * Generates an oriented 3D box using half-extents (hx, hy, hz) centered at local (cx, cy, cz)
 * and transforms all vertices through `xf`.
 */
function pushBox(
  faces: Face3D[],
  cx: number,
  cy: number,
  cz: number,
  hx: number,
  hy: number,
  hz: number,
  color: string,
  xf: (v: Vec3) => Vec3,
  stroke?: string,
  specular = 0.16
) {
  const corners: Vec3[] = [
    { x: cx - hx, y: cy - hy, z: cz - hz }, // 0: ---
    { x: cx + hx, y: cy - hy, z: cz - hz }, // 1: +--
    { x: cx + hx, y: cy + hy, z: cz - hz }, // 2: ++-
    { x: cx - hx, y: cy + hy, z: cz - hz }, // 3: -+-
    { x: cx - hx, y: cy - hy, z: cz + hz }, // 4: --+
    { x: cx + hx, y: cy - hy, z: cz + hz }, // 5: +-+
    { x: cx + hx, y: cy + hy, z: cz + hz }, // 6: +++
    { x: cx - hx, y: cy + hy, z: cz + hz }, // 7: -++
  ].map(xf);

  // CCW outward-facing quads
  const quads = [
    [3, 2, 1, 0], // bottom (-Z)
    [4, 5, 6, 7], // top (+Z)
    [0, 1, 5, 4], // front (-Y)
    [2, 3, 7, 6], // back (+Y)
    [1, 2, 6, 5], // right (+X)
    [3, 0, 4, 7], // left (-X)
  ];

  for (const [a, b, c, d] of quads) {
    faces.push({
      pts: [corners[a], corners[b], corners[c], corners[d]],
      color,
      stroke,
      specular,
    });
  }
}

/**
 * Generates a 3D cylinder along local axis ('x' | 'y' | 'z') from start to end.
 */
function pushCylinder(
  faces: Face3D[],
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  length: number,
  axis: 'x' | 'y' | 'z',
  sides: number,
  color: string,
  xf: (v: Vec3) => Vec3,
  capColor?: string,
  specular = 0.22
) {
  const half = length / 2;
  const ringA: Vec3[] = [];
  const ringB: Vec3[] = [];

  for (let i = 0; i < sides; i++) {
    const ang = (i / sides) * Math.PI * 2;
    const ca = Math.cos(ang) * radius;
    const sa = Math.sin(ang) * radius;
    if (axis === 'z') {
      ringA.push(xf({ x: cx + ca, y: cy + sa, z: cz - half }));
      ringB.push(xf({ x: cx + ca, y: cy + sa, z: cz + half }));
    } else if (axis === 'y') {
      ringA.push(xf({ x: cx + ca, y: cy - half, z: cz + sa }));
      ringB.push(xf({ x: cx + ca, y: cy + half, z: cz + sa }));
    } else {
      ringA.push(xf({ x: cx - half, y: cy + ca, z: cz + sa }));
      ringB.push(xf({ x: cx + half, y: cy + ca, z: cz + sa }));
    }
  }

  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    faces.push({
      pts: [ringA[i], ringA[next], ringB[next], ringB[i]],
      color,
      specular,
    });
  }

  const cColor = capColor ?? color;
  // End caps
  faces.push({ pts: [...ringA].reverse(), color: cColor, specular: specular * 0.6 });
  faces.push({ pts: [...ringB], color: cColor, specular: specular * 0.6 });
}

/**
 * Generates a 3D strut/cylinder connecting two arbitrary world-space points p1 -> p2.
 */
function pushStrutBetween(
  faces: Face3D[],
  p1: Vec3,
  p2: Vec3,
  radius: number,
  sides: number,
  color: string,
  specular = 0.25
) {
  const dir = vSub(p2, p1);
  const len = Math.hypot(dir.x, dir.y, dir.z);
  if (len < 1) return;
  const n = vNorm(dir);
  const up: Vec3 = Math.abs(n.z) < 0.92 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
  const u = vNorm(vCross(up, n));
  const v = vCross(n, u);

  const ringA: Vec3[] = [];
  const ringB: Vec3[] = [];
  for (let i = 0; i < sides; i++) {
    const ang = (i / sides) * Math.PI * 2;
    const ox = (u.x * Math.cos(ang) + v.x * Math.sin(ang)) * radius;
    const oy = (u.y * Math.cos(ang) + v.y * Math.sin(ang)) * radius;
    const oz = (u.z * Math.cos(ang) + v.z * Math.sin(ang)) * radius;
    ringA.push({ x: p1.x + ox, y: p1.y + oy, z: p1.z + oz });
    ringB.push({ x: p2.x + ox, y: p2.y + oy, z: p2.z + oz });
  }

  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    faces.push({
      pts: [ringA[i], ringA[next], ringB[next], ringB[i]],
      color,
      specular,
    });
  }
}

export function FanucRobotCanvas({
  joints,
  kinematics,
  payloadKg,
  gripperOn,
  workpieceState,
  alarm,
  tpEnabled,
  deadmanEnabled,
  eStopActive,
  tcpTrail,
  labels,
}: FanucRobotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [camera, setCamera] = useState<{ yaw: number; pitch: number; zoom: number }>(
    PRESETS.iso
  );
  const [activePreset, setActivePreset] = useState<CameraPreset | null>('iso');
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

  const servosReady = !eStopActive && alarm === 'none' && (!tpEnabled || deadmanEnabled);
  const alarmInfo = FANUC_ALARMS[alarm];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || 820;
    const cssH = canvas.clientHeight || 500;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Industrial 3D Studio Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, cssH);
    bgGrad.addColorStop(0, '#070c18');
    bgGrad.addColorStop(0.62, '#0f172a');
    bgGrad.addColorStop(1, '#182235');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cssW, cssH);

    // Camera setup
    const target: Vec3 = { x: 620, y: 0, z: 1080 };
    const { yaw, pitch, zoom } = camera;
    const camDist = 6600;
    const fov = 940 * zoom * (cssW / 820);

    // Compute world camera position for backface culling & specular lighting
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    const camDirWorld: Vec3 = {
      x: -sinY * cosP,
      y: cosY * cosP,
      z: sinP,
    };
    const camPosWorld: Vec3 = {
      x: target.x + camDirWorld.x * camDist,
      y: target.y + camDirWorld.y * camDist,
      z: target.z + camDirWorld.z * camDist,
    };

    const project = (p: Vec3): { x: number; y: number; depth: number } | null => {
      const dx = p.x - target.x;
      const dy = p.y - target.y;
      const dz = p.z - target.z;
      const cx = dx * cosY - dy * sinY;
      const depth0 = dx * sinY + dy * cosY;
      const cy = dz * cosP - depth0 * sinP;
      const cz = dz * sinP + depth0 * cosP;
      const camDepth = camDist - cz;
      if (camDepth < 150) return null;
      const s = fov / camDepth;
      return {
        x: cssW * 0.5 + cx * s,
        y: cssH * 0.54 - cy * s,
        depth: camDepth,
      };
    };

    // 2. Floor Grid (Z = 0 plane)
    ctx.lineWidth = 1;
    for (let g = -2400; g <= 3200; g += 400) {
      const isMajor = g === 0;
      ctx.strokeStyle = isMajor ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.11)';
      // X-parallel lines
      const a1 = project({ x: -1600, y: g, z: 0 });
      const b1 = project({ x: 3200, y: g, z: 0 });
      if (a1 && b1 && g >= -2000 && g <= 2000) {
        ctx.beginPath();
        ctx.moveTo(a1.x, a1.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.stroke();
      }
      // Y-parallel lines
      const a2 = project({ x: g, y: -2000, z: 0 });
      const b2 = project({ x: g, y: 2000, z: 0 });
      if (a2 && b2 && g >= -1600) {
        ctx.beginPath();
        ctx.moveTo(a2.x, a2.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();
      }
    }

    // Reach envelope ring on floor (R = 2832 mm)
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.22)';
    ctx.setLineDash([7, 6]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    let started = false;
    for (let deg = -110; deg <= 110; deg += 5) {
      const r = FANUC_M900_SPECS.maxReachMm;
      const pt = project({
        x: r * Math.cos(deg * DEG2RAD),
        y: r * Math.sin(deg * DEG2RAD),
        z: 4,
      });
      if (pt) {
        if (!started) {
          ctx.moveTo(pt.x, pt.y);
          started = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Build 3D Scene Faces
    const faces: Face3D[] = [];
    const FANUC_YELLOW = '#facc15';
    const FANUC_YELLOW_DEEP = '#eab308';
    const CHARCOAL = '#1e293b';
    const CHARCOAL_DARK = '#0f172a';
    const STEEL = '#94a3b8';
    const CHROME = '#e2e8f0';
    const DRESS_BLACK = '#111827';

    // --- Safety Fence Posts around workcell ---
    const fencePosts: [number, number][] = [
      [-1100, -1600],
      [-1100, 1600],
      [2700, -1600],
      [2700, 1600],
    ];
    for (const [fx, fy] of fencePosts) {
      pushBox(faces, fx, fy, 450, 38, 38, 450, FANUC_YELLOW_DEEP, (v) => v, '#0f172a', 0.12);
      pushBox(faces, fx, fy, 18, 70, 70, 18, CHARCOAL, (v) => v, undefined, 0.1);
    }

    // --- Infeed Conveyor Table (at j1 ≈ -28°, r ≈ 2140 mm -> x=1890, y=-1004) ---
    const infeedPos = { x: 1890, y: -1004, z: 0 };
    const infeedXf = (v: Vec3) => vAdd(rotZ(v, -28 * DEG2RAD), infeedPos);
    pushBox(faces, 0, 0, 260, 320, 280, 260, '#1e293b', infeedXf, '#334155', 0.1);
    pushBox(faces, 0, 0, 535, 340, 300, 18, '#334155', infeedXf, '#475569', 0.18);
    // Conveyor rollers
    for (let rx = -240; rx <= 240; rx += 120) {
      pushCylinder(faces, rx, 0, 558, 16, 540, 'y', 8, STEEL, infeedXf, '#64748b', 0.28);
    }

    // --- Outfeed Pallet Station (at j1 ≈ +32°, r ≈ 2100 mm -> x=1781, y=1113) ---
    const palletPos = { x: 1781, y: 1113, z: 0 };
    const palletXf = (v: Vec3) => vAdd(rotZ(v, 32 * DEG2RAD), palletPos);
    pushBox(faces, 0, 0, 230, 330, 300, 230, '#1e293b', palletXf, '#334155', 0.1);
    // Wooden/Composite Euro Pallet Deck
    pushBox(faces, 0, 0, 485, 350, 320, 26, '#92400e', palletXf, '#78350f', 0.08);
    pushBox(faces, 0, 0, 525, 350, 320, 14, '#b45309', palletXf, '#78350f', 0.08);

    // --- Base Pedestal (Fixed World Z = 0..560) ---
    pushBox(faces, 0, 0, 30, 540, 540, 30, CHARCOAL_DARK, (v) => v, '#334155', 0.14);
    pushCylinder(faces, 0, 0, 290, 420, 460, 'z', 14, CHARCOAL, (v) => v, '#334155', 0.18);
    pushCylinder(faces, 0, 0, 540, 450, 45, 'z', 14, '#334155', (v) => v, '#475569', 0.22);

    // --- Kinematic Transforms ---
    const { d1, a1, a2, a3, d4, d6 } = FANUC_M900_SPECS;
    const j1Rad = joints.j1 * DEG2RAD;
    const j2Rad = joints.j2 * DEG2RAD;
    const j3Rad = joints.j3 * DEG2RAD;
    const j4Rad = joints.j4 * DEG2RAD;
    const j5Rad = joints.j5 * DEG2RAD;
    const j6Rad = joints.j6 * DEG2RAD;

    const xfJ1 = (v: Vec3) => rotZ(v, j1Rad);

    // J1 Turret Casting (rotates with J1)
    pushCylinder(faces, 0, 0, 620, 390, 130, 'z', 14, FANUC_YELLOW, xfJ1, FANUC_YELLOW_DEEP, 0.24);
    pushBox(faces, 85, 0, 810, 360, 270, 190, FANUC_YELLOW, xfJ1, '#ca8a04', 0.22);
    // J1 Rear Counterbalance Lug & J2 Servo Motor Housing
    pushBox(faces, -310, 0, 720, 130, 190, 110, CHARCOAL, xfJ1, undefined, 0.16);
    pushCylinder(faces, a1, 310, d1, 135, 190, 'y', 12, CHARCOAL, xfJ1, '#0f172a', 0.26); // J2 αiS servo
    pushCylinder(faces, a1, -305, d1, 120, 150, 'y', 12, CHARCOAL, xfJ1, '#0f172a', 0.22);

    // J2 Shoulder Frame (origin at (a1, 0, d1), rotates around Y by +j2)
    const j2Origin: Vec3 = { x: a1, y: 0, z: d1 };
    const xfJ2 = (v: Vec3) => xfJ1(vAdd(rotY(v, j2Rad), j2Origin));

    // J2 Lower Arm (Twin-casting heavy arm from Z=0 to Z=a2)
    pushBox(faces, 0, 130, a2 * 0.5, 115, 62, a2 * 0.52, FANUC_YELLOW, xfJ2, '#ca8a04', 0.24);
    pushBox(faces, 0, -130, a2 * 0.5, 115, 62, a2 * 0.52, FANUC_YELLOW, xfJ2, '#ca8a04', 0.24);
    // Cross-brace webbing
    pushBox(faces, 0, 0, a2 * 0.45, 75, 115, 160, FANUC_YELLOW_DEEP, xfJ2, undefined, 0.18);

    // Hydropneumatic Counterbalance Cylinder (between turret rear and J2 lower arm)
    const cbBase = xfJ1({ x: -290, y: 0, z: 680 });
    const cbAttach = xfJ2({ x: -95, y: 0, z: a2 * 0.34 });
    const cbMid: Vec3 = {
      x: cbBase.x + (cbAttach.x - cbBase.x) * 0.58,
      y: cbBase.y + (cbAttach.y - cbBase.y) * 0.58,
      z: cbBase.z + (cbAttach.z - cbBase.z) * 0.58,
    };
    pushStrutBetween(faces, cbBase, cbMid, 82, 10, CHARCOAL, 0.22);
    pushStrutBetween(faces, cbMid, cbAttach, 40, 10, CHROME, 0.36);

    // Parallel Linkage Rod (rear crank on turret -> J3 rear crank)
    const linkStart = xfJ1({ x: a1 - 240, y: -210, z: d1 - 40 });
    const j3OriginInJ1 = vAdd(rotY({ x: 0, y: 0, z: a2 }, j2Rad), j2Origin);
    // J3 Upper Arm frame: in M-900iB/700 parallel linkage, J3=0 is horizontal (+X), +J3 tilts up (-Y rot)
    const xfJ3 = (v: Vec3) => xfJ1(vAdd(rotY(v, -j3Rad), j3OriginInJ1));
    const linkEnd = xfJ3({ x: -230, y: -210, z: 120 });
    pushStrutBetween(faces, linkStart, linkEnd, 34, 8, '#64748b', 0.28);

    // J3 Elbow Servo Housing & Casting
    pushCylinder(faces, 0, 0, 0, 155, 380, 'y', 12, CHARCOAL, xfJ3, '#334155', 0.25);
    pushBox(faces, -140, 0, 110, 210, 155, 145, FANUC_YELLOW, xfJ3, '#ca8a04', 0.24);
    // J4/J5/J6 rear servo motors on J3 rear counterweight
    pushCylinder(faces, -390, 85, 115, 72, 160, 'x', 10, CHARCOAL, xfJ3, '#0f172a', 0.25);
    pushCylinder(faces, -390, -85, 115, 72, 160, 'x', 10, CHARCOAL, xfJ3, '#0f172a', 0.25);

    // J3 Forearm Tube (extends along +X from 0 to d4 at Z = a3)
    pushCylinder(faces, d4 * 0.44, 0, a3, 128, d4 * 0.88, 'x', 12, FANUC_YELLOW, xfJ3, FANUC_YELLOW_DEEP, 0.24);
    // Corrugated Black Dress-Pack Conduit along top of J3 forearm
    pushCylinder(faces, d4 * 0.42, 75, a3 + 135, 36, d4 * 0.72, 'x', 8, DRESS_BLACK, xfJ3, '#1f2937', 0.14);

    // --- J4 Wrist Roll Frame (at (d4, 0, a3) in J3, rolls around +X by j4) ---
    const xfJ4 = (v: Vec3) => xfJ3(vAdd(rotX(v, j4Rad), { x: d4, y: 0, z: a3 }));
    pushCylinder(faces, -40, 0, 0, 118, 140, 'x', 12, CHARCOAL, xfJ4, '#334155', 0.24);
    // Wrist clevis ears
    pushBox(faces, 45, 95, 0, 85, 28, 78, FANUC_YELLOW_DEEP, xfJ4, undefined, 0.2);
    pushBox(faces, 45, -95, 0, 85, 28, 78, FANUC_YELLOW_DEEP, xfJ4, undefined, 0.2);

    // --- J5 Wrist Pitch Frame (at (70, 0, 0) in J4, pitches around +Y by -j5) ---
    const xfJ5 = (v: Vec3) => xfJ4(vAdd(rotY(v, -j5Rad), { x: 70, y: 0, z: 0 }));
    pushCylinder(faces, 0, 0, 0, 82, 180, 'y', 10, CHARCOAL, xfJ5, '#334155', 0.26);
    pushCylinder(faces, d6 * 0.35, 0, 0, 74, d6 * 0.7, 'x', 10, '#475569', xfJ5, '#334155', 0.26);

    // --- J6 Tool Flange & Heavy Vacuum/Pallet Gripper (at (d6, 0, 0) in J5, rolls around +X by j6) ---
    const xfJ6 = (v: Vec3) => xfJ5(vAdd(rotX(v, j6Rad), { x: d6, y: 0, z: 0 }));
    pushCylinder(faces, 0, 0, 0, 92, 34, 'x', 12, CHROME, xfJ6, '#94a3b8', 0.34);
    // Heavy Gripper Manifold
    pushBox(faces, 55, 0, 0, 32, 155, 115, '#334155', xfJ6, '#1e293b', 0.22);
    // 4 Vacuum Suction Pads / Clamping Jaws
    const jawOffset = gripperOn ? 0 : 32;
    pushBox(faces, 98, 120 + jawOffset, 75, 26, 26, 26, gripperOn ? '#10b981' : '#64748b', xfJ6);
    pushBox(faces, 98, -120 - jawOffset, 75, 26, 26, 26, gripperOn ? '#10b981' : '#64748b', xfJ6);
    pushBox(faces, 98, 120 + jawOffset, -75, 26, 26, 26, gripperOn ? '#10b981' : '#64748b', xfJ6);
    pushBox(faces, 98, -120 - jawOffset, -75, 26, 26, 26, gripperOn ? '#10b981' : '#64748b', xfJ6);

    // --- Workpiece (Heavy Cast Steel Billet / Crate, ~450 kg) ---
    if (workpieceState === 'infeed') {
      pushBox(faces, 0, 0, 680, 155, 145, 110, '#38bdf8', infeedXf, '#0284c7', 0.25);
    } else if (workpieceState === 'carried') {
      pushBox(faces, 200, 0, 0, 110, 145, 145, '#38bdf8', xfJ6, '#0284c7', 0.25);
    } else {
      pushBox(faces, 0, 0, 650, 155, 145, 110, '#38bdf8', palletXf, '#0284c7', 0.25);
    }

    // 4. Painter's Sort + Lighting + Draw Polygons
    const lightDir = vNorm({ x: 0.42, y: -0.48, z: 0.77 });
    const rendered = faces
      .map((face) => {
        const p0 = face.pts[0];
        const p1 = face.pts[1];
        const p2 = face.pts[2];
        const normal = vNorm(vCross(vSub(p1, p0), vSub(p2, p0)));
        const cx = face.pts.reduce((s, p) => s + p.x, 0) / face.pts.length;
        const cy = face.pts.reduce((s, p) => s + p.y, 0) / face.pts.length;
        const cz = face.pts.reduce((s, p) => s + p.z, 0) / face.pts.length;
        const centroid = { x: cx, y: cy, z: cz };

        // Backface cull relative to camera
        const toCam = vNorm(vSub(camPosWorld, centroid));
        if (vDot(normal, toCam) <= -0.04) return null;

        const projPts = face.pts.map(project);
        if (projPts.some((pt) => pt === null)) return null;
        const validPts = projPts as { x: number; y: number; depth: number }[];
        const avgDepth = validPts.reduce((s, p) => s + p.depth, 0) / validPts.length;

        const diff = Math.max(0, vDot(normal, lightDir));
        const ambient = face.ambient ?? 0.38;
        const intensity = Math.min(1.08, ambient + diff * 0.64);
        const halfVec = vNorm(vAdd(lightDir, toCam));
        const specAngle = Math.max(0, vDot(normal, halfVec));
        const spec = (face.specular ?? 0.16) * Math.pow(specAngle, 18);

        return {
          pts: validPts,
          depth: avgDepth,
          fill: shadeColor(face.color, intensity, spec),
          stroke: face.stroke,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.depth - a.depth);

    for (const poly of rendered) {
      ctx.beginPath();
      ctx.moveTo(poly.pts[0].x, poly.pts[0].y);
      for (let i = 1; i < poly.pts.length; i++) {
        ctx.lineTo(poly.pts[i].x, poly.pts[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = poly.fill;
      ctx.fill();
      ctx.strokeStyle = poly.stroke ?? 'rgba(15, 23, 42, 0.25)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // 5. 3D TCP Trail Overlay
    if (tcpTrail.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.78)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let trailStarted = false;
      for (const t of tcpTrail) {
        const wx = t.x ?? t.r * Math.cos(j1Rad);
        const wy = t.y ?? t.r * Math.sin(j1Rad);
        const pt = project({ x: wx, y: wy, z: t.z });
        if (pt) {
          if (!trailStarted) {
            ctx.moveTo(pt.x, pt.y);
            trailStarted = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      }
      ctx.stroke();
    }

    // 6. Station 3D Labels (Infeed, Pallet, TCP)
    const drawTag = (pos: Vec3, text: string, bg: string, fg: string) => {
      const p = project(pos);
      if (!p) return;
      ctx.font = 'bold 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      const w = ctx.measureText(text).width + 12;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(p.x - w / 2, p.y - 10, w, 18, 4);
      ctx.fill();
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, p.x, p.y - 1);
    };

    drawTag({ x: infeedPos.x, y: infeedPos.y, z: 860 }, labels.infeed, 'rgba(15,23,42,0.85)', '#cbd5e1');
    drawTag({ x: palletPos.x, y: palletPos.y, z: 860 }, labels.pallet, 'rgba(15,23,42,0.85)', '#cbd5e1');
    drawTag({ x: kinematics.x, y: kinematics.y, z: kinematics.z + 180 }, 'TCP', 'rgba(14,165,233,0.9)', '#082f49');

    ctx.restore();
  }, [joints, kinematics, payloadKg, gripperOn, workpieceState, alarm, tcpTrail, camera, labels]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
    setActivePreset(null);
    setCamera((prev) => ({
      ...prev,
      yaw: prev.yaw + dx * 0.0085,
      pitch: Math.max(-0.08, Math.min(1.48, prev.pitch + dy * 0.007)),
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current.active = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.55, Math.min(1.85, prev.zoom - e.deltaY * 0.0008)),
    }));
  };

  const applyPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    setCamera(PRESETS[preset]);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Top Status HUD */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md ${
              servosReady
                ? 'border border-emerald-500/40 bg-emerald-950/75 text-emerald-300'
                : 'border border-rose-500/40 bg-rose-950/80 text-rose-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                servosReady ? 'animate-pulse bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            {servosReady ? labels.servoOn : labels.servoOff}
          </span>

          <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 font-mono text-[11px] text-slate-200 backdrop-blur-md">
            {labels.payload}: {payloadKg} / 700 kg
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[11px] backdrop-blur-md ${
              kinematics.j2LoadPct > 95
                ? 'border-rose-500/50 bg-rose-950/80 text-rose-300'
                : 'border-slate-700/80 bg-slate-900/80 text-amber-300'
            }`}
          >
            {labels.j2Load}: {kinematics.j2LoadPct.toFixed(0)}%
          </span>
        </div>

        {alarm !== 'none' && (
          <div className="rounded-full border border-rose-500/60 bg-rose-950/90 px-3 py-1 font-mono text-[11px] font-bold text-rose-200 shadow-lg backdrop-blur-md">
            {alarmInfo.label}
          </div>
        )}
        {alarm === 'none' && kinematics.singularityWarning && (
          <div className="rounded-full border border-amber-500/60 bg-amber-950/90 px-3 py-1 font-mono text-[11px] font-semibold text-amber-200 backdrop-blur-md">
            {labels.singularity} (|J5| &lt; 5°)
          </div>
        )}
      </div>

      {/* Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="block h-[420px] w-full cursor-grab touch-none active:cursor-grabbing sm:h-[480px]"
        aria-label="FANUC M-900iB/700 3D Industrial Robot Cell"
      />

      {/* Bottom Bar: Camera Presets + Live TCP Readout */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/90 bg-slate-900/90 px-3 py-2 text-[11px]">
        <div className="flex items-center gap-1">
          {(['iso', 'front', 'side', 'top'] as CameraPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase transition ${
                activePreset === preset
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => applyPreset('iso')}
            className="ml-1 inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 font-mono text-[10px] text-slate-300 hover:bg-slate-700"
            title="Reset 3D View"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <span className="ml-1.5 hidden items-center gap-1 font-mono text-[10px] text-slate-400 sm:inline-flex">
            <Maximize2 className="h-3 w-3" />
            Drag 3D · Scroll Zoom
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] text-slate-300">
          <span>
            J1:<b className="text-amber-300"> {joints.j1.toFixed(1)}°</b>
          </span>
          <span>
            J2:<b className="text-amber-300"> {joints.j2.toFixed(1)}°</b>
          </span>
          <span>
            J3:<b className="text-amber-300"> {joints.j3.toFixed(1)}°</b>
          </span>
          <span className="hidden sm:inline">
            TCP:<b className="text-sky-300"> {kinematics.x.toFixed(0)}, {kinematics.y.toFixed(0)}, {kinematics.z.toFixed(0)} mm</b>
          </span>
        </div>
      </div>
    </div>
  );
}
