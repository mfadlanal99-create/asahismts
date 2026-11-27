import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Eye, Maximize2, RotateCcw } from 'lucide-react';
import type {
  FanucAlarmCode,
  JointAngles,
  KinematicsResult,
} from './fanucM900Physics';
import {
  computeForwardKinematics,
  DEFAULT_TAUGHT_POINTS,
  FANUC_ALARMS,
  FANUC_M900_SPECS,
} from './fanucM900Physics';

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

type CameraPreset = 'iso' | 'front' | 'side' | 'top' | 'cell';

const PRESETS: Record<
  CameraPreset,
  { yaw: number; pitch: number; dist: number; target: [number, number, number] }
> = {
  iso: { yaw: -0.68, pitch: 0.34, dist: 4650, target: [760, 40, 1080] },
  front: { yaw: 0.0, pitch: 0.16, dist: 4500, target: [620, 0, 1120] },
  side: { yaw: -Math.PI / 2, pitch: 0.16, dist: 4600, target: [780, 0, 1120] },
  top: { yaw: -Math.PI / 2, pitch: 1.42, dist: 5400, target: [780, 0, 600] },
  cell: { yaw: -0.95, pitch: 0.44, dist: 5600, target: [620, -80, 960] },
};

const DEG2RAD = Math.PI / 180;

/**
 * Creates a crisp OEM FANUC arm decal texture ("FANUC Robot M-900iB/700")
 */
function createFanucArmDecalTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f5be0b';
  ctx.fillRect(0, 0, c.width, c.height);

  // Subtle cast surface grain + top/bottom seam lines
  ctx.strokeStyle = 'rgba(120, 80, 0, 0.32)';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

  // Red FANUC bold trademark block
  ctx.fillStyle = '#dc2626';
  ctx.font = '900 78px "Arial Black", Impact, sans-serif';
  ctx.fillText('FANUC', 58, 122);

  // Dark industrial model designation
  ctx.fillStyle = '#111827';
  ctx.font = 'italic 800 54px Arial, Helvetica, sans-serif';
  ctx.fillText('Robot  M-900iB/700', 382, 120);

  // Red accent stripe & payload spec badge
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(58, 146, 890, 10);

  ctx.fillStyle = '#1e293b';
  ctx.font = '700 30px ui-monospace, Consolas, monospace';
  ctx.fillText('MAX PAYLOAD 700 kg  •  IP67 WRIST', 60, 196);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Creates recessed cast-iron weight-relief pocket texture matching vertical J2 lower arm (270 x 1120 mm)
 */
function createLowerArmPocketTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f5be0b';
  ctx.fillRect(0, 0, c.width, c.height);

  // Recessed cast-iron relief pockets (upper & lower)
  ctx.fillStyle = '#d49406';
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 6;
  ctx.fillRect(36, 90, 184, 370);
  ctx.strokeRect(36, 90, 184, 370);
  ctx.fillRect(36, 564, 184, 370);
  ctx.strokeRect(36, 564, 184, 370);

  // Center raised horizontal stiffener rib with crisp FANUC badge
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(34, 488, 188, 52);
  ctx.fillStyle = '#ef4444';
  ctx.font = '900 32px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FANUC', c.width / 2, 515);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates FANUC R-30iB Controller Cabinet front faceplate texture
 */
function createCabinetFrontTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 768;
  const ctx = c.getContext('2d')!;

  // FANUC Yellow door
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, c.width, c.height);

  // Door recessed border
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 10;
  ctx.strokeRect(22, 22, c.width - 44, c.height - 44);

  // Top dark nameplate bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(42, 48, c.width - 84, 96);
  ctx.fillStyle = '#ef4444';
  ctx.font = '900 40px "Arial Black", sans-serif';
  ctx.fillText('FANUC', 62, 102);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 28px ui-monospace, monospace';
  ctx.fillText('SYSTEM R-30iB', 235, 100);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 18px ui-monospace, monospace';
  ctx.fillText('A-CABINET • 480VAC 3PH', 62, 130);

  // Operator panel box (Mode switch, Cycle Start, Fault Reset, E-Stop)
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(58, 178, 250, 145);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(58, 178, 250, 145);

  // Green CYCLE START + Blue FAULT RESET + Red E-STOP on cabinet
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(105, 235, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(165, 235, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(248, 245, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(248, 245, 22, 0, Math.PI * 2);
  ctx.fill();

  // Main rotary disconnect breaker on right
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(355, 195, 92, 120);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(392, 215, 18, 76);

  // Lower cooling louvers
  ctx.fillStyle = '#422006';
  for (let y = 430; y <= 670; y += 22) {
    ctx.fillRect(68, y, c.width - 136, 9);
  }

  // High voltage warning triangle
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(256, 345);
  ctx.lineTo(290, 402);
  ctx.lineTo(222, 402);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.font = '900 32px sans-serif';
  ctx.fillText('⚡', 241, 396);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Helper: builds an industrial finned AC αiS Servo Motor + Pulsecoder cap along local Z
 */
function buildServoMotor(
  radius: number,
  length: number,
  darkMat: THREE.Material,
  capMat: THREE.Material,
  silverMat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length * 0.78, 24),
    darkMat
  );
  body.rotation.x = Math.PI / 2;
  body.position.z = length * 0.39;
  body.castShadow = true;
  g.add(body);

  // Cooling fins
  for (let i = 0; i < 5; i++) {
    const fin = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.07, radius * 1.07, length * 0.05, 20),
      darkMat
    );
    fin.rotation.x = Math.PI / 2;
    fin.position.z = length * (0.18 + i * 0.11);
    g.add(fin);
  }

  // Mounting flange
  const flange = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.22, radius * 1.22, 22, 24),
    silverMat
  );
  flange.rotation.x = Math.PI / 2;
  flange.position.z = 11;
  g.add(flange);

  // FANUC Red/Black Pulsecoder Rear Cap + Harting connector box
  const encoder = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.88, radius * 0.92, length * 0.22, 24),
    capMat
  );
  encoder.rotation.x = Math.PI / 2;
  encoder.position.z = length * 0.89;
  g.add(encoder);

  const connBox = new THREE.Mesh(
    new THREE.BoxGeometry(radius * 0.65, radius * 0.75, length * 0.22),
    darkMat
  );
  connBox.position.set(radius * 0.85, 0, length * 0.78);
  g.add(connBox);

  return g;
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
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset | null>('iso');
  const [showAxes, setShowAxes] = useState(true);

  const camStateRef = useRef<{
    yaw: number;
    pitch: number;
    dist: number;
    target: [number, number, number];
  }>({
    ...PRESETS.iso,
    target: [...PRESETS.iso.target],
  });

  const dragRef = useRef<{
    mode: 'none' | 'orbit' | 'pan';
    x: number;
    y: number;
  }>({ mode: 'none', x: 0, y: 0 });

  // Scene object refs updated dynamically on prop changes
  const rigRefs = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    j1Group: THREE.Group;
    j2Group: THREE.Group;
    j3Group: THREE.Group;
    j3DriveCrank: THREE.Group;
    parallelRodMesh: THREE.Mesh;
    cbBarrelGroup: THREE.Group;
    cbPistonGroup: THREE.Group;
    j4Group: THREE.Group;
    j5Group: THREE.Group;
    j6Group: THREE.Group;
    jawMeshes: THREE.Group[];
    eoatLedMat: THREE.MeshStandardMaterial;
    workpieceInfeed: THREE.Group;
    workpieceCarried: THREE.Group;
    workpiecePallet: THREE.Group;
    dressCurveMesh: THREE.Mesh | null;
    dressMat: THREE.Material;
    trailLine: THREE.Line;
    axesGroup: THREE.Group;
    tcpAxesGroup: THREE.Group;
    stackGreenMat: THREE.MeshStandardMaterial;
    stackAmberMat: THREE.MeshStandardMaterial;
    stackRedMat: THREE.MeshStandardMaterial;
    renderNow: () => void;
  } | null>(null);

  const servosReady = !eStopActive && alarm === 'none' && (!tpEnabled || deadmanEnabled);
  const alarmInfo = FANUC_ALARMS[alarm];

  // Build 1:1 Three.js WebGL scene once on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 820;
    const height = container.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b111d');
    scene.fog = new THREE.FogExp2('#0b111d', 0.000072);

    // Z-up industrial robot world coordinate system!
    const camera = new THREE.PerspectiveCamera(37, width / height, 60, 22000);
    camera.up.set(0, 0, 1);

    // --- Industrial Bay Lighting Rig ---
    const hemi = new THREE.HemisphereLight('#e2e8f0', '#1e293b', 0.95);
    hemi.position.set(0, 0, 5000);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight('#fffbeb', 2.25);
    keyLight.position.set(2600, -3100, 4400);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 500;
    keyLight.shadow.camera.far = 10000;
    const d = 3400;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#93c5fd', 0.95);
    fillLight.position.set(-2800, 2400, 2600);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#fde68a', 0.7);
    rimLight.position.set(-1800, -2200, 3200);
    scene.add(rimLight);

    // --- PBR Industrial Materials ---
    const fanucYellow = new THREE.MeshStandardMaterial({
      color: '#f5be0b',
      roughness: 0.31,
      metalness: 0.14,
    });
    const fanucYellowDark = new THREE.MeshStandardMaterial({
      color: '#d99b06',
      roughness: 0.38,
      metalness: 0.18,
    });
    const castGraphite = new THREE.MeshStandardMaterial({
      color: '#1b222c',
      roughness: 0.46,
      metalness: 0.58,
    });
    const servoBlack = new THREE.MeshStandardMaterial({
      color: '#12161d',
      roughness: 0.4,
      metalness: 0.62,
    });
    const encoderRed = new THREE.MeshStandardMaterial({
      color: '#b91c1c',
      roughness: 0.35,
      metalness: 0.3,
    });
    const machinedSteel = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.24,
      metalness: 0.86,
    });
    const mirrorChrome = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.08,
      metalness: 0.96,
    });
    const dressBlack = new THREE.MeshStandardMaterial({
      color: '#111318',
      roughness: 0.72,
      metalness: 0.12,
    });
    const billetSteel = new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.28,
      metalness: 0.82,
    });

    const armDecalTex = createFanucArmDecalTexture();
    const armDecalMat = new THREE.MeshStandardMaterial({
      map: armDecalTex,
      roughness: 0.32,
      metalness: 0.14,
    });
    const lowerPocketTex = createLowerArmPocketTexture();
    const lowerPocketMat = new THREE.MeshStandardMaterial({
      map: lowerPocketTex,
      roughness: 0.36,
      metalness: 0.16,
    });
    const cabinetFrontTex = createCabinetFrontTexture();

    // --- 1. Factory Epoxy Concrete Floor + Safety Markings ---
    const floorGeo = new THREE.PlaneGeometry(14000, 14000);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#141c28',
      roughness: 0.78,
      metalness: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    scene.add(floor);

    // Millimeter workcell grid on Z = 2 mm
    const grid = new THREE.GridHelper(7200, 18, '#334155', '#1e293b');
    grid.rotation.x = Math.PI / 2;
    grid.position.set(600, 0, 2);
    scene.add(grid);

    // Safety Yellow Max-Reach Floor Ring (R = 2832 mm)
    const reachRing = new THREE.Mesh(
      new THREE.RingGeometry(2812, 2848, 96),
      new THREE.MeshBasicMaterial({
        color: '#facc15',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.42,
      })
    );
    reachRing.position.z = 3;
    scene.add(reachRing);

    // --- 2. Industrial Safety Perimeter Fence + Light Curtain ---
    const fenceMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      roughness: 0.35,
      metalness: 0.3,
    });
    const meshWireMat = new THREE.MeshBasicMaterial({
      color: '#334155',
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const postCoords: [number, number][] = [
      [-1350, -2150],
      [800, -2150],
      [2950, -2150],
      [-1350, 2150],
      [800, 2150],
      [2950, 2150],
      [-1350, 0],
    ];
    for (const [px, py] of postCoords) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(70, 70, 1550), fenceMat);
      post.position.set(px, py, 775);
      post.castShadow = true;
      scene.add(post);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(150, 150, 20), castGraphite);
      foot.position.set(px, py, 10);
      scene.add(foot);
    }
    // Side mesh panels (left & right perimeter)
    for (const sideY of [-2150, 2150]) {
      for (const cx of [-275, 1875]) {
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(2060, 1320, 18, 12), meshWireMat);
        panel.rotation.x = Math.PI / 2;
        panel.position.set(cx, sideY, 790);
        scene.add(panel);
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(2120, 36, 36), castGraphite);
        topRail.position.set(cx, sideY, 1460);
        scene.add(topRail);
      }
    }

    // --- 3. FANUC R-30iB A-Cabinet Controller + Live 3-Color Stack Light ---
    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(-980, 1480, 0);
    cabinetGroup.rotation.z = -0.35;
    scene.add(cabinetGroup);

    const cabPlinth = new THREE.Mesh(new THREE.BoxGeometry(820, 680, 90), castGraphite);
    cabPlinth.position.z = 45;
    cabPlinth.castShadow = true;
    cabinetGroup.add(cabPlinth);

    const cabFrontMat = new THREE.MeshStandardMaterial({
      map: cabinetFrontTex,
      roughness: 0.36,
      metalness: 0.2,
    });
    // BoxGeometry faces: +X, -X, +Y, -Y (front look), +Z, -Z
    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(780, 640, 1220), [
      fanucYellow,
      fanucYellow,
      fanucYellow,
      cabFrontMat,
      fanucYellowDark,
      castGraphite,
    ]);
    cabBody.position.z = 700;
    cabBody.castShadow = true;
    cabBody.receiveShadow = true;
    cabinetGroup.add(cabBody);

    // Andon Stack Light Pole on top of R-30iB Cabinet
    const stackPole = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 16, 260, 16),
      machinedSteel
    );
    stackPole.rotation.x = Math.PI / 2;
    stackPole.position.set(260, 0, 1440);
    cabinetGroup.add(stackPole);

    const stackRedMat = new THREE.MeshStandardMaterial({
      color: '#7f1d1d',
      emissive: '#ef4444',
      emissiveIntensity: 0.1,
      roughness: 0.2,
    });
    const stackAmberMat = new THREE.MeshStandardMaterial({
      color: '#78350f',
      emissive: '#f59e0b',
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const stackGreenMat = new THREE.MeshStandardMaterial({
      color: '#14532d',
      emissive: '#22c55e',
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    const stackGreen = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 65, 20), stackGreenMat);
    stackGreen.rotation.x = Math.PI / 2;
    stackGreen.position.set(260, 0, 1580);
    cabinetGroup.add(stackGreen);

    const stackAmber = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 65, 20), stackAmberMat);
    stackAmber.rotation.x = Math.PI / 2;
    stackAmber.position.set(260, 0, 1648);
    cabinetGroup.add(stackAmber);

    const stackRed = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 65, 20), stackRedMat);
    stackRed.rotation.x = Math.PI / 2;
    stackRed.position.set(260, 0, 1716);
    cabinetGroup.add(stackRed);

    // Heavy floor umbilical cables from R-30iB cabinet to Robot Base rear manifold
    const floorCableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-920, 1180, 160),
      new THREE.Vector3(-760, 680, 32),
      new THREE.Vector3(-580, 220, 28),
      new THREE.Vector3(-480, 0, 140),
    ]);
    const floorCable = new THREE.Mesh(
      new THREE.TubeGeometry(floorCableCurve, 28, 28, 12, false),
      dressBlack
    );
    floorCable.castShadow = true;
    scene.add(floorCable);

    // --- 4. Exact Pick (P[2]) & Place (P[4]) Industrial Workstations ---
    const fkPick = computeForwardKinematics(DEFAULT_TAUGHT_POINTS[2], 420);
    const fkPlace = computeForwardKinematics(DEFAULT_TAUGHT_POINTS[4], 420);

    // Helper: Machined 420 kg Heavy Steel Die-Block Workpiece (height = 220 mm)
    const createDieBlockWorkpiece = (): THREE.Group => {
      const wp = new THREE.Group();
      const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(360, 280, 180), billetSteel);
      mainBlock.castShadow = true;
      mainBlock.receiveShadow = true;
      wp.add(mainBlock);

      // Machined top boss + T-slots
      const boss = new THREE.Mesh(new THREE.BoxGeometry(280, 200, 42), machinedSteel);
      boss.position.z = 108;
      boss.castShadow = true;
      wp.add(boss);

      // 4 Lifting Lug Rings
      for (const [lx, ly] of [
        [-135, -100],
        [135, -100],
        [-135, 100],
        [135, 100],
      ]) {
        const lug = new THREE.Mesh(new THREE.TorusGeometry(18, 5, 10, 18), fanucYellow);
        lug.rotation.x = Math.PI / 2;
        lug.position.set(lx, ly, 102);
        wp.add(lug);
      }
      return wp;
    };

    // A) Powered Heavy Roller Infeed Conveyor at fkPick
    const billetHalfH = 110;
    const infeedSurfaceZ = fkPick.z - billetHalfH - 85;
    const infeedGroup = new THREE.Group();
    infeedGroup.position.set(fkPick.x, fkPick.y, 0);
    infeedGroup.rotation.z = -28 * DEG2RAD;
    scene.add(infeedGroup);

    // Conveyor side channels & legs
    for (const sx of [-420, 420]) {
      for (const sy of [-260, 260]) {
        const leg = new THREE.Mesh(
          new THREE.BoxGeometry(65, 65, infeedSurfaceZ - 70),
          castGraphite
        );
        leg.position.set(sx, sy, (infeedSurfaceZ - 70) / 2);
        leg.castShadow = true;
        infeedGroup.add(leg);
      }
    }
    for (const sy of [-285, 285]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1080, 44, 110), fanucYellowDark);
      rail.position.set(0, sy, infeedSurfaceZ - 38);
      rail.castShadow = true;
      infeedGroup.add(rail);
    }
    // 9 Steel Powered Rollers + Gearmotor on side
    for (let rx = -440; rx <= 440; rx += 110) {
      const roller = new THREE.Mesh(
        new THREE.CylinderGeometry(32, 32, 520, 20),
        machinedSteel
      );
      roller.position.set(rx, 0, infeedSurfaceZ - 32);
      roller.castShadow = true;
      roller.receiveShadow = true;
      infeedGroup.add(roller);
    }
    // Part-present photoeye sensor
    const sensorStalk = new THREE.Mesh(new THREE.BoxGeometry(24, 24, 150), servoBlack);
    sensorStalk.position.set(220, 315, infeedSurfaceZ + 30);
    infeedGroup.add(sensorStalk);

    const workpieceInfeed = createDieBlockWorkpiece();
    workpieceInfeed.position.set(0, 0, infeedSurfaceZ + 90);
    infeedGroup.add(workpieceInfeed);

    // B) Heavy Outfeed Euro Pallet & Steel Stand at fkPlace
    const palletTopZ = fkPlace.z - billetHalfH - 85;
    const palletGroup = new THREE.Group();
    palletGroup.position.set(fkPlace.x, fkPlace.y, 0);
    palletGroup.rotation.z = 32 * DEG2RAD;
    scene.add(palletGroup);

    const standFrame = new THREE.Mesh(
      new THREE.BoxGeometry(920, 760, palletTopZ - 145),
      castGraphite
    );
    standFrame.position.z = (palletTopZ - 145) / 2;
    standFrame.castShadow = true;
    standFrame.receiveShadow = true;
    palletGroup.add(standFrame);

    const woodLight = new THREE.MeshStandardMaterial({
      color: '#b47a40',
      roughness: 0.82,
      metalness: 0.04,
    });
    const woodDark = new THREE.MeshStandardMaterial({
      color: '#855325',
      roughness: 0.86,
      metalness: 0.04,
    });
    // Euro Pallet stringers, blocks & 7 top deck boards (1200 x 800 scaled fit)
    for (const py of [-310, 0, 310]) {
      const runner = new THREE.Mesh(new THREE.BoxGeometry(940, 95, 24), woodDark);
      runner.position.set(0, py, palletTopZ - 132);
      palletGroup.add(runner);
      for (const px of [-390, 0, 390]) {
        const block = new THREE.Mesh(new THREE.BoxGeometry(120, 95, 78), woodDark);
        block.position.set(px, py, palletTopZ - 81);
        block.castShadow = true;
        palletGroup.add(block);
      }
    }
    for (let i = -3; i <= 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(940, 88, 24), woodLight);
      plank.position.set(0, i * 104, palletTopZ - 12);
      plank.castShadow = true;
      plank.receiveShadow = true;
      palletGroup.add(plank);
    }
    // Corner pallet alignment guides
    for (const [gx, gy] of [
      [-480, -390],
      [480, -390],
      [-480, 390],
      [480, 390],
    ]) {
      const guide = new THREE.Mesh(new THREE.BoxGeometry(45, 45, 95), fanucYellow);
      guide.position.set(gx, gy, palletTopZ - 80);
      palletGroup.add(guide);
    }

    const workpiecePallet = createDieBlockWorkpiece();
    workpiecePallet.position.set(0, 0, palletTopZ + 90);
    palletGroup.add(workpiecePallet);

    // =========================================================================
    // 5. 1:1 FANUC M-900iB/700 6-AXIS HEAVY INDUSTRIAL ROBOT ASSEMBLY
    // =========================================================================
    const { d1, a1, a2, a3, d4, d6 } = FANUC_M900_SPECS;

    // --- Fixed Base Pedestal (Z = 0 .. 520 mm) ---
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // Heavy square cast-steel anchor baseplate (1040 x 1040 x 68 mm)
    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1040, 1040, 68), castGraphite);
    basePlate.position.z = 34;
    basePlate.castShadow = true;
    basePlate.receiveShadow = true;
    baseGroup.add(basePlate);

    // 16 M24 Anchor Bolts around baseplate perimeter
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      for (const offset of [-360, -120, 120, 360]) {
        const bx = Math.cos(ang) * 465 - Math.sin(ang) * offset;
        const by = Math.sin(ang) * 465 + Math.cos(ang) * offset;
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(16, 16, 32, 6),
          machinedSteel
        );
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(bx, by, 76);
        baseGroup.add(bolt);
      }
    }

    // J1 Stationary RV-Reducer Pedestal Drum
    const j1Drum = new THREE.Mesh(
      new THREE.CylinderGeometry(435, 465, 390, 36),
      castGraphite
    );
    j1Drum.rotation.x = Math.PI / 2;
    j1Drum.position.z = 262;
    j1Drum.castShadow = true;
    j1Drum.receiveShadow = true;
    baseGroup.add(j1Drum);

    // Machined J1 Cross-Roller Bearing Ring + 24 Socket Cap Bolts
    const bearingRing = new THREE.Mesh(
      new THREE.CylinderGeometry(448, 448, 52, 36),
      machinedSteel
    );
    bearingRing.rotation.x = Math.PI / 2;
    bearingRing.position.z = 482;
    baseGroup.add(bearingRing);

    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const b = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 14, 8), servoBlack);
      b.rotation.x = Math.PI / 2;
      b.position.set(Math.cos(a) * 422, Math.sin(a) * 422, 510);
      baseGroup.add(b);
    }

    // Rear Harting Multi-Pin Connector Manifold Box on stationary base
    const baseManifold = new THREE.Mesh(new THREE.BoxGeometry(190, 340, 210), castGraphite);
    baseManifold.position.set(-485, 0, 195);
    baseManifold.castShadow = true;
    baseGroup.add(baseManifold);

    // --- J1 Rotating Swing Turret (rotates around +Z by J1) ---
    const j1Group = new THREE.Group();
    scene.add(j1Group);

    // Lower yellow turret turntable deck
    const turretDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(425, 435, 130, 36),
      fanucYellow
    );
    turretDeck.rotation.x = Math.PI / 2;
    turretDeck.position.z = 574;
    turretDeck.castShadow = true;
    turretDeck.receiveShadow = true;
    j1Group.add(turretDeck);

    // Vertical J1 αiS 40/4000 Servo Motor mounted on left-rear of turret deck
    const j1Motor = buildServoMotor(96, 360, servoBlack, encoderRed, machinedSteel);
    j1Motor.position.set(-140, 260, 638);
    j1Group.add(j1Motor);

    // Twin Heavy Clevis Cheek Castings sweeping forward to J2 pivot (a1=410, d1=950)
    for (const sideY of [-195, 195]) {
      const cheek = new THREE.Mesh(new THREE.BoxGeometry(680, 118, 430), fanucYellow);
      cheek.position.set(145, sideY, 825);
      cheek.castShadow = true;
      cheek.receiveShadow = true;
      j1Group.add(cheek);

      // Rounded J2 Trunnion Boss at (a1, sideY, d1)
      const boss = new THREE.Mesh(
        new THREE.CylinderGeometry(195, 195, 124, 32),
        fanucYellow
      );
      boss.position.set(a1, sideY, d1);
      boss.castShadow = true;
      j1Group.add(boss);
    }

    // Center turret bridge web
    const turretBridge = new THREE.Mesh(new THREE.BoxGeometry(480, 280, 250), fanucYellowDark);
    turretBridge.position.set(30, 0, 735);
    turretBridge.castShadow = true;
    j1Group.add(turretBridge);

    // Rear Counterbalance Trunnion Fork Lugs on J1 Turret (at x = -330, z = 695)
    for (const ly of [-115, 115]) {
      const cbLug = new THREE.Mesh(new THREE.BoxGeometry(240, 52, 185), fanucYellowDark);
      cbLug.position.set(-290, ly, 695);
      cbLug.castShadow = true;
      j1Group.add(cbLug);
    }
    const cbRearPin = new THREE.Mesh(
      new THREE.CylinderGeometry(36, 36, 310, 20),
      machinedSteel
    );
    cbRearPin.position.set(-330, 0, 695);
    j1Group.add(cbRearPin);

    // J2 & J3 Heavy RV Reducer Housings + αiS 40/4000 Servo Motors on sides of J2 Shoulder
    // Right side (+Y): J2 Drive Motor + RV Reducer
    const j2ReducerR = new THREE.Mesh(
      new THREE.CylinderGeometry(175, 185, 105, 32),
      castGraphite
    );
    j2ReducerR.position.set(a1, 305, d1);
    j2ReducerR.castShadow = true;
    j1Group.add(j2ReducerR);

    const j2Motor = buildServoMotor(102, 370, servoBlack, encoderRed, machinedSteel);
    j2Motor.rotation.x = -Math.PI / 2;
    j2Motor.position.set(a1, 355, d1);
    j1Group.add(j2Motor);

    // Left side (-Y): J3 Parallel-Link Drive RV Reducer + Motor
    const j3ReducerL = new THREE.Mesh(
      new THREE.CylinderGeometry(165, 175, 95, 32),
      castGraphite
    );
    j3ReducerL.position.set(a1, -300, d1);
    j3ReducerL.castShadow = true;
    j1Group.add(j3ReducerL);

    const j3BaseMotor = buildServoMotor(98, 350, servoBlack, encoderRed, machinedSteel);
    j3BaseMotor.rotation.x = Math.PI / 2;
    j3BaseMotor.position.set(a1, -345, d1);
    j1Group.add(j3BaseMotor);

    // --- J3 Parallel-Linkage Lower Drive Crank (at J2 axis, rotates independently by -j3Rad!) ---
    const crankRadius = 285;
    const parallelY = -255;
    const j3DriveCrank = new THREE.Group();
    j3DriveCrank.position.set(a1, parallelY, d1);
    j1Group.add(j3DriveCrank);

    const crankArm = new THREE.Mesh(
      new THREE.BoxGeometry(crankRadius + 90, 38, 110),
      fanucYellowDark
    );
    crankArm.position.set(-crankRadius / 2, 0, 0);
    crankArm.castShadow = true;
    j3DriveCrank.add(crankArm);

    const crankPin = new THREE.Mesh(
      new THREE.CylinderGeometry(32, 32, 62, 20),
      machinedSteel
    );
    crankPin.position.set(-crankRadius, 0, 0);
    j3DriveCrank.add(crankPin);

    // Parallel Linkage Connecting Rod (unit-length along Y, scaled/aligned dynamically)
    const parallelRodMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(30, 30, 1, 20),
      machinedSteel
    );
    parallelRodMesh.castShadow = true;
    j1Group.add(parallelRodMesh);

    // --- Live Articulating Hydropneumatic Counterbalance Cylinder ---
    // Barrel pivots at J1 turret rear pin (-330, 0, 695); chrome rod pivots on J2 lower arm
    const cbBarrelGroup = new THREE.Group();
    cbBarrelGroup.position.set(-330, 0, 695);
    j1Group.add(cbBarrelGroup);

    // Barrel cylinder extending along +Z of cbBarrelGroup (lookAt aligns +Z to target!)
    const cbOuterBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(118, 118, 560, 28),
      castGraphite
    );
    cbOuterBarrel.rotation.x = Math.PI / 2;
    cbOuterBarrel.position.z = 290;
    cbOuterBarrel.castShadow = true;
    cbBarrelGroup.add(cbOuterBarrel);

    // Yellow nitrogen warning band & end-cap flange on counterbalance barrel
    const cbBand = new THREE.Mesh(
      new THREE.CylinderGeometry(121, 121, 95, 28),
      fanucYellow
    );
    cbBand.rotation.x = Math.PI / 2;
    cbBand.position.z = 420;
    cbBarrelGroup.add(cbBand);

    const cbGland = new THREE.Mesh(
      new THREE.CylinderGeometry(92, 115, 55, 24),
      machinedSteel
    );
    cbGland.rotation.x = Math.PI / 2;
    cbGland.position.z = 590;
    cbBarrelGroup.add(cbGland);

    // Chrome piston rod group anchored at J2 arm clevis, pointing back into barrel!
    const cbPistonGroup = new THREE.Group();
    j1Group.add(cbPistonGroup);

    const cbChromeRod = new THREE.Mesh(
      new THREE.CylinderGeometry(52, 52, 620, 24),
      mirrorChrome
    );
    cbChromeRod.rotation.x = Math.PI / 2;
    cbChromeRod.position.z = 310;
    cbChromeRod.castShadow = true;
    cbPistonGroup.add(cbChromeRod);

    const cbRodEye = new THREE.Mesh(
      new THREE.CylinderGeometry(68, 68, 92, 20),
      castGraphite
    );
    cbRodEye.position.z = 0;
    cbPistonGroup.add(cbRodEye);

    // --- J2 Lower Arm Assembly (origin at (a1, 0, d1), pitches around +Y by +j2Rad) ---
    const j2Group = new THREE.Group();
    j2Group.position.set(a1, 0, d1);
    j1Group.add(j2Group);

    // Sculpted Twin-Pocketed Box-Casting Lower Arm (Z = 0 .. a2 = 1120)
    const armMainBox = new THREE.Mesh(
      new THREE.BoxGeometry(270, 240, a2),
      [
        fanucYellow,
        fanucYellow,
        lowerPocketMat, // +Y side with recessed FANUC cast badge
        lowerPocketMat, // -Y side with recessed FANUC cast badge
        fanucYellow,
        fanucYellow,
      ]
    );
    armMainBox.position.z = a2 / 2;
    armMainBox.castShadow = true;
    armMainBox.receiveShadow = true;
    j2Group.add(armMainBox);

    // Raised heavy edge ribs along front & rear of J2 lower arm
    for (const rx of [-122, 122]) {
      for (const ry of [-118, 118]) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(52, 34, a2 + 40), fanucYellow);
        rib.position.set(rx, ry, a2 / 2);
        rib.castShadow = true;
        j2Group.add(rib);
      }
    }

    // Lower & Upper cylindrical bearing bosses on J2 arm
    const j2BottomBoss = new THREE.Mesh(
      new THREE.CylinderGeometry(175, 175, 268, 32),
      fanucYellow
    );
    j2BottomBoss.castShadow = true;
    j2Group.add(j2BottomBoss);

    const j2TopBoss = new THREE.Mesh(
      new THREE.CylinderGeometry(162, 162, 268, 32),
      fanucYellow
    );
    j2TopBoss.position.z = a2;
    j2TopBoss.castShadow = true;
    j2Group.add(j2TopBoss);

    // Rear Counterbalance Clevis Bracket on J2 Lower Arm (at x = -165, z = 390)
    for (const cy of [-68, 68]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(150, 32, 140), fanucYellowDark);
      ear.position.set(-145, cy, 390);
      j2Group.add(ear);
    }

    // --- J3 Upper Arm & Cantilevered Rear Wrist-Servo Housing (at (0, 0, a2) in j2Group) ---
    const j3Group = new THREE.Group();
    j3Group.position.set(0, 0, a2);
    j2Group.add(j3Group);

    // Parallel-Linkage Upper Bellcrank Arm (matches crankRadius = 285 at y = parallelY)
    const upperBellcrank = new THREE.Mesh(
      new THREE.BoxGeometry(crankRadius + 85, 38, 108),
      fanucYellowDark
    );
    upperBellcrank.position.set(-crankRadius / 2, parallelY, 0);
    upperBellcrank.castShadow = true;
    j3Group.add(upperBellcrank);

    const upperCrankPin = new THREE.Mesh(
      new THREE.CylinderGeometry(32, 32, 62, 20),
      machinedSteel
    );
    upperCrankPin.position.set(-crankRadius, parallelY, 0);
    j3Group.add(upperCrankPin);

    // Massive J3 Elbow Saddle Casting rising to a3 = 200 mm
    const j3Saddle = new THREE.Mesh(new THREE.BoxGeometry(460, 310, 310), fanucYellow);
    j3Saddle.position.set(-60, 0, 125);
    j3Saddle.castShadow = true;
    j3Saddle.receiveShadow = true;
    j3Group.add(j3Saddle);

    const j3PivotCapR = new THREE.Mesh(
      new THREE.CylinderGeometry(148, 148, 338, 32),
      castGraphite
    );
    j3PivotCapR.castShadow = true;
    j3Group.add(j3PivotCapR);

    // Rear Wrist Drive Gearbox Box + 3 Stacked αiS Wrist Servo Motors (J4, J5, J6)
    const rearGearBox = new THREE.Mesh(new THREE.BoxGeometry(240, 320, 280), castGraphite);
    rearGearBox.position.set(-350, 0, 145);
    rearGearBox.castShadow = true;
    j3Group.add(rearGearBox);

    for (const [my, mz] of [
      [-92, 205],
      [92, 205],
      [0, 82],
    ]) {
      const wMotor = buildServoMotor(68, 255, servoBlack, encoderRed, machinedSteel);
      wMotor.rotation.y = -Math.PI / 2;
      wMotor.position.set(-465, my, mz);
      j3Group.add(wMotor);
    }

    // Tapered FANUC Yellow J3 Forearm Boom with OEM "FANUC Robot M-900iB/700" Side Plates!
    const boomLen = d4 - 230; // leaves room for heavy IP67 wrist
    const forearmBox = new THREE.Mesh(
      new THREE.BoxGeometry(boomLen, 216, 224),
      [
        fanucYellowDark,
        fanucYellowDark,
        armDecalMat, // +Y side decal
        armDecalMat, // -Y side decal
        fanucYellow,
        fanucYellowDark,
      ]
    );
    forearmBox.position.set(140 + boomLen / 2, 0, a3);
    forearmBox.castShadow = true;
    forearmBox.receiveShadow = true;
    j3Group.add(forearmBox);

    // Top dress-pack clamp brackets on J3 forearm
    for (const cx of [260, 620, 960]) {
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(46, 130, 56), fanucYellowDark);
      clamp.position.set(cx, 65, a3 + 132);
      j3Group.add(clamp);
    }

    // --- J4 / J5 / J6 Heavy IP67 3-Axis Inline Wrist (at (d4, 0, a3) in j3Group) ---
    const armOffsetAngle = Math.atan2(a3, d4);
    const wristCarrier = new THREE.Group();
    wristCarrier.position.set(d4, 0, a3);
    wristCarrier.rotation.y = -armOffsetAngle;
    j3Group.add(wristCarrier);

    // J4 Wrist Roll Group (rolls around +X by j4Rad)
    const j4Group = new THREE.Group();
    wristCarrier.add(j4Group);

    const j4Barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(118, 132, 210, 28),
      castGraphite
    );
    j4Barrel.rotation.z = Math.PI / 2;
    j4Barrel.position.x = -115;
    j4Barrel.castShadow = true;
    j4Group.add(j4Barrel);

    // Heavy Forked J5 Clevis Yoke
    for (const wy of [-98, 98]) {
      const yokeEar = new THREE.Mesh(new THREE.BoxGeometry(195, 42, 168), castGraphite);
      yokeEar.position.set(-15, wy, 0);
      yokeEar.castShadow = true;
      j4Group.add(yokeEar);

      const yokeCap = new THREE.Mesh(
        new THREE.CylinderGeometry(84, 84, 48, 24),
        fanucYellowDark
      );
      yokeCap.position.set(0, wy, 0);
      j4Group.add(yokeCap);
    }

    // J5 Wrist Pitch Knuckle (pitches around +Y by -j5Rad)
    const j5Group = new THREE.Group();
    j4Group.add(j5Group);

    const j5Knuckle = new THREE.Mesh(
      new THREE.CylinderGeometry(92, 92, 150, 24),
      castGraphite
    );
    j5Knuckle.castShadow = true;
    j5Group.add(j5Knuckle);

    const j5Snout = new THREE.Mesh(
      new THREE.CylinderGeometry(88, 102, d6 - 48, 28),
      castGraphite
    );
    j5Snout.rotation.z = Math.PI / 2;
    j5Snout.position.x = (d6 - 48) / 2 + 24;
    j5Snout.castShadow = true;
    j5Group.add(j5Snout);

    // J6 ISO 9409-1-A200 Tool Flange + Heavy Servo/Pneumatic Billet Gripper (at x = d6)
    const j6Group = new THREE.Group();
    j6Group.position.x = d6;
    j5Group.add(j6Group);

    const isoFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(104, 104, 28, 32),
      machinedSteel
    );
    isoFlange.rotation.z = Math.PI / 2;
    isoFlange.position.x = -14;
    isoFlange.castShadow = true;
    j6Group.add(isoFlange);

    // 12 Flange bolts + master dowel pin
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const fb = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 12, 8), servoBlack);
      fb.rotation.z = Math.PI / 2;
      fb.position.set(2, Math.cos(a) * 84, Math.sin(a) * 84);
      j6Group.add(fb);
    }

    // Heavy Industrial EOAT Spreader Frame & Pneumatic Actuator Manifold
    const eoatAdapter = new THREE.Mesh(new THREE.BoxGeometry(58, 320, 240), castGraphite);
    eoatAdapter.position.x = 29;
    eoatAdapter.castShadow = true;
    j6Group.add(eoatAdapter);

    const eoatLedMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#10b981',
      emissiveIntensity: 0.9,
    });
    const eoatLed = new THREE.Mesh(new THREE.SphereGeometry(14, 14, 14), eoatLedMat);
    eoatLed.position.set(42, 0, 132);
    j6Group.add(eoatLed);

    // Pneumatic actuator bar
    const pneuCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(34, 34, 390, 20),
      machinedSteel
    );
    pneuCylinder.position.x = 58;
    j6Group.add(pneuCylinder);

    // 4 Actuating Heavy Clamping Jaws + Vacuum Cups
    const jawMeshes: THREE.Group[] = [];
    for (const dirY of [-1, 1]) {
      const jawGroup = new THREE.Group();
      jawGroup.position.set(58, dirY * 155, 0);
      j6Group.add(jawGroup);

      const fingerArm = new THREE.Mesh(new THREE.BoxGeometry(145, 32, 210), fanucYellow);
      fingerArm.position.x = 68;
      fingerArm.castShadow = true;
      jawGroup.add(fingerArm);

      const gripPad = new THREE.Mesh(new THREE.BoxGeometry(90, 18, 190), servoBlack);
      gripPad.position.set(112, -dirY * 16, 0);
      jawGroup.add(gripPad);

      jawMeshes.push(jawGroup);
    }

    // 4 Heavy Suction Cups on face of EOAT
    for (const [sy, sz] of [
      [-85, -65],
      [85, -65],
      [-85, 65],
      [85, 65],
    ]) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(28, 18, 32, 18), servoBlack);
      cup.rotation.z = Math.PI / 2;
      cup.position.set(74, sy, sz);
      j6Group.add(cup);
    }

    // Carried Workpiece attached right inside the EOAT jaws!
    const workpieceCarried = createDieBlockWorkpiece();
    workpieceCarried.rotation.y = Math.PI / 2;
    workpieceCarried.position.set(175, 0, 0);
    j6Group.add(workpieceCarried);

    // --- 6. Coordinate Axes Triads (World Base & TCP Tool) ---
    const createTriad = (len: number): THREE.Group => {
      const g = new THREE.Group();
      // +X Red, +Y Green, +Z Blue
      g.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), len, 0xef4444, len * 0.22, len * 0.1));
      g.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), len, 0x22c55e, len * 0.22, len * 0.1));
      g.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), len, 0x38bdf8, len * 0.22, len * 0.1));
      return g;
    };
    const axesGroup = createTriad(520);
    axesGroup.position.set(0, 0, 12);
    scene.add(axesGroup);

    const tcpAxesGroup = createTriad(240);
    tcpAxesGroup.position.set(95, 0, 0);
    j6Group.add(tcpAxesGroup);

    // --- 7. Live 3D TCP Path Trail Line ---
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({
      color: '#38bdf8',
      linewidth: 2,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);

    const syncCamera = () => {
      const { yaw, pitch, dist, target } = camStateRef.current;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const cx = target[0] + dist * cosP * Math.cos(yaw);
      const cy = target[1] + dist * cosP * Math.sin(yaw);
      const cz = target[2] + dist * sinP;
      camera.position.set(cx, cy, cz);
      camera.lookAt(target[0], target[1], target[2]);
    };

    const renderNow = () => {
      syncCamera();
      renderer.render(scene, camera);
    };

    rigRefs.current = {
      renderer,
      scene,
      camera,
      j1Group,
      j2Group,
      j3Group,
      j3DriveCrank,
      parallelRodMesh,
      cbBarrelGroup,
      cbPistonGroup,
      j4Group,
      j5Group,
      j6Group,
      jawMeshes,
      eoatLedMat,
      workpieceInfeed,
      workpieceCarried,
      workpiecePallet,
      dressCurveMesh: null,
      dressMat: dressBlack,
      trailLine,
      axesGroup,
      tcpAxesGroup,
      stackGreenMat,
      stackAmberMat,
      stackRedMat,
      renderNow,
    };

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 820;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderNow();
    });
    ro.observe(container);

    renderNow();

    return () => {
      ro.disconnect();
      armDecalTex.dispose();
      lowerPocketTex.dispose();
      cabinetFrontTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Synchronize all 6 axes, 4-bar parallel link, telescoping hydraulic cylinder, dress-pack, EOAT & trail!
  useEffect(() => {
    const rig = rigRefs.current;
    if (!rig) return;

    const { a1, d1, a2, a3 } = FANUC_M900_SPECS;
    const j1Rad = joints.j1 * DEG2RAD;
    const j2Rad = joints.j2 * DEG2RAD;
    const j3Rad = joints.j3 * DEG2RAD;
    const j4Rad = joints.j4 * DEG2RAD;
    const j5Rad = joints.j5 * DEG2RAD;
    const j6Rad = joints.j6 * DEG2RAD;

    // 1. Primary 6-DOF Joint Rotations
    rig.j1Group.rotation.z = j1Rad;
    rig.j2Group.rotation.y = j2Rad;
    // Parallel linkage keeps J3 pitch measured relative to horizontal!
    rig.j3Group.rotation.y = -j2Rad - j3Rad;
    rig.j4Group.rotation.x = j4Rad;
    rig.j5Group.rotation.y = -j5Rad;
    rig.j6Group.rotation.x = j6Rad;

    // 2. Geometrically-Exact 4-Bar Parallel Linkage (in j1Group local space)
    rig.j3DriveCrank.rotation.y = -j3Rad;
    const crankR = 285;
    const pY = -255;
    const pLower = new THREE.Vector3(
      a1 - crankR * Math.cos(j3Rad),
      pY,
      d1 - crankR * Math.sin(j3Rad)
    );
    const elbowX = a1 + a2 * Math.sin(j2Rad);
    const elbowZ = d1 + a2 * Math.cos(j2Rad);
    const pUpper = new THREE.Vector3(
      elbowX - crankR * Math.cos(j3Rad),
      pY,
      elbowZ - crankR * Math.sin(j3Rad)
    );
    const rodMid = pLower.clone().add(pUpper).multiplyScalar(0.5);
    const rodDir = pUpper.clone().sub(pLower);
    const rodLen = rodDir.length();
    rig.parallelRodMesh.position.copy(rodMid);
    rig.parallelRodMesh.scale.set(1, rodLen, 1);
    rig.parallelRodMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      rodDir.clone().normalize()
    );

    // 3. Telescoping Hydropneumatic Counterbalance Cylinder (exact coaxial alignment in j1Group local space)
    const clevisLocal = new THREE.Vector3(
      a1 + -145 * Math.cos(j2Rad) + 390 * Math.sin(j2Rad),
      0,
      d1 - -145 * Math.sin(j2Rad) + 390 * Math.cos(j2Rad)
    );
    const barrelPinLocal = new THREE.Vector3(-330, 0, 695);
    const zUnit = new THREE.Vector3(0, 0, 1);

    const barrelToClevis = clevisLocal.clone().sub(barrelPinLocal).normalize();
    rig.cbBarrelGroup.quaternion.setFromUnitVectors(zUnit, barrelToClevis);

    const clevisToBarrel = barrelPinLocal.clone().sub(clevisLocal).normalize();
    rig.cbPistonGroup.position.copy(clevisLocal);
    rig.cbPistonGroup.quaternion.setFromUnitVectors(zUnit, clevisToBarrel);

    // 4. Flexible Corrugated Dress-Pack Conduit Curve (rebuilt smoothly in j1Group space)
    if (rig.dressCurveMesh) {
      rig.j1Group.remove(rig.dressCurveMesh);
      rig.dressCurveMesh.geometry.dispose();
    }
    const pStart = new THREE.Vector3(-120, 165, 760);
    const pMidArm = new THREE.Vector3(
      a1 + (a2 * 0.52) * Math.sin(j2Rad) - 95 * Math.cos(j2Rad),
      155,
      d1 + (a2 * 0.52) * Math.cos(j2Rad) + 95 * Math.sin(j2Rad)
    );
    const pElbowLoop = new THREE.Vector3(
      elbowX - 180 * Math.cos(j3Rad) - 120 * Math.sin(j3Rad),
      135,
      elbowZ - 180 * Math.sin(j3Rad) + 280 * Math.cos(j3Rad)
    );
    const pForearmA = new THREE.Vector3(
      elbowX + 280 * Math.cos(j3Rad) - (a3 + 145) * Math.sin(j3Rad),
      65,
      elbowZ + 280 * Math.sin(j3Rad) + (a3 + 145) * Math.cos(j3Rad)
    );
    const pForearmB = new THREE.Vector3(
      elbowX + 960 * Math.cos(j3Rad) - (a3 + 145) * Math.sin(j3Rad),
      65,
      elbowZ + 960 * Math.sin(j3Rad) + (a3 + 145) * Math.cos(j3Rad)
    );
    const dressCurve = new THREE.CatmullRomCurve3([
      pStart,
      pMidArm,
      pElbowLoop,
      pForearmA,
      pForearmB,
    ]);
    const dressMesh = new THREE.Mesh(
      new THREE.TubeGeometry(dressCurve, 28, 28, 10, false),
      rig.dressMat
    );
    dressMesh.castShadow = true;
    rig.j1Group.add(dressMesh);
    rig.dressCurveMesh = dressMesh;

    // 5. EOAT Clamping Jaws & Workpiece State
    const jawSpread = gripperOn ? 148 : 192;
    rig.jawMeshes[0].position.y = -jawSpread;
    rig.jawMeshes[1].position.y = jawSpread;
    rig.eoatLedMat.color.set(gripperOn ? '#10b981' : '#f59e0b');
    rig.eoatLedMat.emissive.set(gripperOn ? '#10b981' : '#f59e0b');

    rig.workpieceInfeed.visible = workpieceState === 'infeed';
    rig.workpieceCarried.visible = workpieceState === 'carried';
    rig.workpiecePallet.visible = workpieceState === 'pallet';

    // 6. R-30iB Controller Stack Light Status
    const hasFault = alarm !== 'none' || eStopActive;
    rig.stackRedMat.emissiveIntensity = hasFault ? 2.2 : 0.06;
    rig.stackAmberMat.emissiveIntensity = !hasFault && !servosReady ? 1.8 : 0.12;
    rig.stackGreenMat.emissiveIntensity = !hasFault && servosReady ? 1.9 : 0.08;

    // 7. Coordinate Axes Visibility & 3D TCP Trail
    rig.axesGroup.visible = showAxes;
    rig.tcpAxesGroup.visible = showAxes;

    if (tcpTrail.length > 1) {
      const pts = tcpTrail.map((pt) => {
        const wx = pt.x ?? pt.r * Math.cos(j1Rad);
        const wy = pt.y ?? pt.r * Math.sin(j1Rad);
        return new THREE.Vector3(wx, wy, pt.z);
      });
      rig.trailLine.geometry.dispose();
      rig.trailLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      rig.trailLine.visible = true;
    } else {
      rig.trailLine.visible = false;
    }

    rig.renderNow();
  }, [
    joints,
    kinematics,
    payloadKg,
    gripperOn,
    workpieceState,
    alarm,
    eStopActive,
    servosReady,
    tcpTrail,
    showAxes,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isPan = e.button === 2 || e.button === 1 || e.shiftKey;
    dragRef.current = {
      mode: isPan ? 'pan' : 'orbit',
      x: e.clientX,
      y: e.clientY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.mode === 'none') return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    setActivePreset(null);

    const cs = camStateRef.current;
    if (dragRef.current.mode === 'orbit') {
      cs.yaw -= dx * 0.0075;
      cs.pitch = Math.max(0.04, Math.min(1.48, cs.pitch + dy * 0.0065));
    } else {
      const panScale = cs.dist * 0.0011;
      const rightX = -Math.sin(cs.yaw);
      const rightY = Math.cos(cs.yaw);
      cs.target[0] -= rightX * dx * panScale;
      cs.target[1] -= rightY * dx * panScale;
      cs.target[2] = Math.max(120, Math.min(2600, cs.target[2] + dy * panScale));
    }
    rigRefs.current?.renderNow();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.mode = 'none';
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cs = camStateRef.current;
    cs.dist = Math.max(1850, Math.min(8800, cs.dist + e.deltaY * 2.4));
    rigRefs.current?.renderNow();
  };

  const applyPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    const p = PRESETS[preset];
    camStateRef.current = {
      yaw: p.yaw,
      pitch: p.pitch,
      dist: p.dist,
      target: [...p.target],
    };
    rigRefs.current?.renderNow();
  };

  return (
    <div className="fanuc-hw-scope relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b111d] shadow-2xl">
      {/* Top Industrial Telemetry Overlay */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            style={{
              backgroundColor: servosReady ? 'rgba(6, 78, 59, 0.85)' : 'rgba(127, 29, 29, 0.88)',
              borderColor: servosReady ? 'rgba(52, 211, 153, 0.5)' : 'rgba(248, 113, 113, 0.55)',
              color: servosReady ? '#6ee7b7' : '#fecaca',
            }}
            className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide backdrop-blur-md"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                servosReady ? 'animate-pulse bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            {servosReady ? labels.servoOn : labels.servoOff}
          </span>

          <span
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderColor: 'rgba(71, 85, 105, 0.7)',
              color: '#e2e8f0',
            }}
            className="rounded-md border px-2.5 py-1 font-mono text-[11px] backdrop-blur-md"
          >
            {labels.payload}: <b>{payloadKg}</b> / 700 kg
          </span>

          <span
            style={{
              backgroundColor:
                kinematics.j2LoadPct > 95 ? 'rgba(127, 29, 29, 0.88)' : 'rgba(15, 23, 42, 0.85)',
              borderColor:
                kinematics.j2LoadPct > 95 ? 'rgba(248, 113, 113, 0.6)' : 'rgba(71, 85, 105, 0.7)',
              color: kinematics.j2LoadPct > 95 ? '#fecaca' : '#fcd34d',
            }}
            className="rounded-md border px-2.5 py-1 font-mono text-[11px] backdrop-blur-md"
          >
            {labels.j2Load}: <b>{kinematics.j2LoadPct.toFixed(0)}%</b>
          </span>
        </div>

        {alarm !== 'none' && (
          <div
            style={{
              backgroundColor: 'rgba(153, 27, 27, 0.94)',
              borderColor: '#f87171',
              color: '#fee2e2',
            }}
            className="rounded-md border px-3 py-1 font-mono text-[11px] font-bold shadow-lg backdrop-blur-md"
          >
            {alarmInfo.label}
          </div>
        )}
        {alarm === 'none' && kinematics.singularityWarning && (
          <div
            style={{
              backgroundColor: 'rgba(120, 53, 15, 0.92)',
              borderColor: '#fbbf24',
              color: '#fef3c7',
            }}
            className="rounded-md border px-3 py-1 font-mono text-[11px] font-bold backdrop-blur-md"
          >
            {labels.singularity} (|J5| &lt; 5°)
          </div>
        )}
      </div>

      {/* Interactive 1:1 WebGL Three.js Viewport */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        role="img"
        aria-label="FANUC M-900iB/700 1:1 3D Industrial Robot Cell"
        className="h-[460px] w-full cursor-grab select-none touch-none active:cursor-grabbing sm:h-[585px]"
      />

      {/* Bottom 3D CAD Camera Bar & Live World/Joint Readout */}
      <div
        style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
        className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-[11px]"
      >
        <div className="flex flex-wrap items-center gap-1">
          {(['iso', 'front', 'side', 'top', 'cell'] as CameraPreset[]).map((preset) => {
            const active = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  backgroundColor: active ? '#facc15' : '#1e293b',
                  color: active ? '#0f172a' : '#cbd5e1',
                  borderColor: active ? '#eab308' : '#334155',
                }}
                className="hw-key border px-2 py-1 font-mono text-[10px] font-bold uppercase transition"
              >
                {preset}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowAxes((v) => !v)}
            style={{
              backgroundColor: showAxes ? '#0369a1' : '#1e293b',
              color: '#e0f2fe',
              borderColor: '#334155',
            }}
            className="hw-key ml-1 inline-flex items-center gap-1 border px-2 py-1 font-mono text-[10px] font-bold"
            title="Toggle World & TCP Axes Triad"
          >
            <Compass className="h-3 w-3" />
            XYZ
          </button>

          <button
            type="button"
            onClick={() => applyPreset('iso')}
            style={{ backgroundColor: '#1e293b', color: '#cbd5e1', borderColor: '#334155' }}
            className="hw-key inline-flex items-center gap-1 border px-2 py-1 font-mono text-[10px]"
            title="Reset 3D Camera"
          >
            <RotateCcw className="h-3 w-3" />
          </button>

          <span className="ml-1.5 hidden items-center gap-1 font-mono text-[10px] text-slate-400 xl:inline-flex">
            <Maximize2 className="h-3 w-3" />
            Orbit: Drag • Pan: Shift+Drag • Zoom: Scroll
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Eye className="h-3 w-3 text-amber-400" />
            1:1 CAD
          </span>
          <span>
            J1:<b style={{ color: '#fcd34d' }}> {joints.j1.toFixed(1)}°</b>
          </span>
          <span>
            J2:<b style={{ color: '#fcd34d' }}> {joints.j2.toFixed(1)}°</b>
          </span>
          <span>
            J3:<b style={{ color: '#fcd34d' }}> {joints.j3.toFixed(1)}°</b>
          </span>
          <span className="hidden sm:inline">
            TCP:
            <b style={{ color: '#7dd3fc' }}>
              {' '}
              X:{kinematics.x.toFixed(0)} Y:{kinematics.y.toFixed(0)} Z:{kinematics.z.toFixed(0)}
            </b>
          </span>
        </div>
      </div>
    </div>
  );
}
