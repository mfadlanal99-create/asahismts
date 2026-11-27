import type {
  FanucAlarmCode,
  JointAngles,
  KinematicsResult,
} from './fanucM900Physics';
import { FANUC_ALARMS, FANUC_M900_SPECS } from './fanucM900Physics';

export interface TcpTrailPoint {
  r: number;
  z: number;
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

/**
 * Maps physical robot plane (r_mm, z_mm) into SVG viewBox (0..820, 0..500).
 * Floor Z = 0 mm sits at y = 435; J1 axis r = 0 mm sits at x = 230.
 */
const SCALE = 0.122;
const ORIGIN_X = 230;
const FLOOR_Y = 435;

function toSvg(rMm: number, zMm: number): { x: number; y: number } {
  return {
    x: ORIGIN_X + rMm * SCALE,
    y: FLOOR_Y - zMm * SCALE,
  };
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
  const j1Base = toSvg(0, 0);
  const turretTop = toSvg(0, 560);
  const j2 = toSvg(kinematics.j2Pos.r, kinematics.j2Pos.z);
  const j3 = toSvg(kinematics.j3Pos.r, kinematics.j3Pos.z);
  const wrist = toSvg(kinematics.wristPos.r, kinematics.wristPos.z);
  const tcp = toSvg(kinematics.tcpPos.r, kinematics.tcpPos.z);

  // Hydropneumatic counterbalance cylinder anchor on rear of J1 turret
  const cbAnchor = toSvg(-240, 440);
  // Counterbalance rod attaches ~28% up the lower arm
  const cbAttachR = kinematics.j2Pos.r + (kinematics.j3Pos.r - kinematics.j2Pos.r) * 0.28;
  const cbAttachZ = kinematics.j2Pos.z + (kinematics.j3Pos.z - kinematics.j2Pos.z) * 0.28;
  const cbAttach = toSvg(cbAttachR, cbAttachZ);

  // Parallel linkage rod (offset behind main lower arm)
  const linkOffsetX = -16;
  const linkOffsetY = -10;

  // Reach envelope arc (2832 mm radius centered at J2 shoulder or J1 axis)
  const maxReachPx = FANUC_M900_SPECS.maxReachMm * SCALE;

  // Tool orientation angle in SVG
  const toolAngleDeg = (Math.atan2(tcp.y - wrist.y, tcp.x - wrist.x) * 180) / Math.PI;

  // Dress-pack conduit curve from base turret -> J2 -> J3 -> wrist
  const dressPath = `M ${j1Base.x - 28} ${j1Base.y - 35} C ${j1Base.x - 45} ${j2.y + 30}, ${j2.x - 30} ${j2.y - 45}, ${j3.x - 18} ${j3.y - 24} S ${(j3.x + wrist.x) / 2} ${(j3.y + wrist.y) / 2 - 36}, ${wrist.x - 8} ${wrist.y - 10}`;

  // TCP trail polyline
  const trailPoints = tcpTrail
    .map((pt) => {
      const p = toSvg(pt.r, pt.z);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  const alarmInfo = FANUC_ALARMS[alarm];
  const servosReady = alarm === 'none' && !eStopActive && (!tpEnabled || deadmanEnabled);

  // Workpiece coordinates depending on state
  const infeedSvg = toSvg(1680, 120);
  const palletSvg = toSvg(2150, 140);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950 shadow-inner">
      {/* Top HUD */}
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

      {/* Main SVG Stage */}
      <svg
        viewBox="0 0 820 500"
        className="h-auto w-full select-none"
        role="img"
        aria-label="FANUC M-900iB/700 Industrial Robot Cell"
      >
        <defs>
          <linearGradient id="fanucBgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1220" />
            <stop offset="75%" stopColor="#111C2E" />
            <stop offset="100%" stopColor="#090F1A" />
          </linearGradient>
          <linearGradient id="fanucYellow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="fanucDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <pattern id="cellGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1E293B"
              strokeWidth="0.8"
              strokeOpacity="0.65"
            />
          </pattern>
        </defs>

        {/* Background & Grid */}
        <rect width="820" height="500" fill="url(#fanucBgGrad)" />
        <rect width="820" height={FLOOR_Y} fill="url(#cellGrid)" />

        {/* Safety Cell Floor */}
        <rect x="0" y={FLOOR_Y} width="820" height={500 - FLOOR_Y} fill="#0F172A" />
        <line x1="0" y1={FLOOR_Y} x2="820" y2={FLOOR_Y} stroke="#475569" strokeWidth="2" />
        {/* Yellow/Black floor safety stripe */}
        <line
          x1="30"
          y1={FLOOR_Y + 6}
          x2="790"
          y2={FLOOR_Y + 6}
          stroke="#FACC15"
          strokeWidth="3"
          strokeDasharray="14 10"
          strokeOpacity="0.55"
        />

        {/* Reach Envelope Arc (2832 mm) */}
        <path
          d={`M ${ORIGIN_X} ${FLOOR_Y - maxReachPx} A ${maxReachPx} ${maxReachPx} 0 0 1 ${ORIGIN_X + maxReachPx} ${FLOOR_Y}`}
          fill="none"
          stroke={kinematics.outOfReach ? '#F43F5E' : '#38BDF8'}
          strokeWidth="1.5"
          strokeDasharray="6 6"
          strokeOpacity="0.45"
        />
        <text
          x={ORIGIN_X + maxReachPx - 12}
          y={FLOOR_Y - 12}
          textAnchor="end"
          fill="#7DD3FC"
          fontSize="10"
          fontFamily="monospace"
          opacity="0.75"
        >
          {labels.reachEnvelope}: 2832 mm
        </text>

        {/* Infeed Conveyor / Stand (P[2]) */}
        <g transform={`translate(${infeedSvg.x - 36}, ${infeedSvg.y})`}>
          <rect x="0" y="14" width="72" height={FLOOR_Y - infeedSvg.y - 14} fill="#1E293B" stroke="#475569" strokeWidth="1.5" rx="3" />
          <rect x="-4" y="6" width="80" height="10" fill="#334155" stroke="#64748B" strokeWidth="1" rx="2" />
          <text x="36" y={FLOOR_Y - infeedSvg.y - 6} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="monospace">
            P[2] {labels.infeed}
          </text>
        </g>

        {/* Output Pallet (P[4]) */}
        <g transform={`translate(${palletSvg.x - 44}, ${palletSvg.y})`}>
          <rect x="0" y="16" width="88" height={FLOOR_Y - palletSvg.y - 16} fill="#1E293B" stroke="#475569" strokeWidth="1.5" rx="2" />
          <rect x="-6" y="4" width="100" height="14" fill="#92400E" stroke="#D97706" strokeWidth="1" rx="2" />
          <text x="44" y={FLOOR_Y - palletSvg.y - 6} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="monospace">
            P[4] {labels.pallet}
          </text>
        </g>

        {/* Workpiece when on Infeed or Pallet */}
        {workpieceState === 'infeed' && (
          <g transform={`translate(${infeedSvg.x - 18}, ${infeedSvg.y - 22})`}>
            <rect width="36" height="28" rx="3" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.5" />
            <text x="18" y="18" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="bold" fontFamily="monospace">
              {payloadKg}kg
            </text>
          </g>
        )}
        {workpieceState === 'pallet' && (
          <g transform={`translate(${palletSvg.x - 18}, ${palletSvg.y - 24})`}>
            <rect width="36" height="28" rx="3" fill="#34D399" stroke="#D1FAE5" strokeWidth="1.5" />
            <text x="18" y="18" textAnchor="middle" fill="#064E3B" fontSize="9" fontWeight="bold" fontFamily="monospace">
              OK
            </text>
          </g>
        )}

        {/* Live TCP Trail */}
        {trailPoints && (
          <polyline
            points={trailPoints}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.65"
          />
        )}

        {/* Heavy Pedestal & J1 Base */}
        <g>
          {/* Anchor plate */}
          <rect
            x={j1Base.x - 56}
            y={j1Base.y - 12}
            width="112"
            height="12"
            rx="2"
            fill="#0F172A"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Pedestal cylinder */}
          <path
            d={`M ${j1Base.x - 42} ${j1Base.y - 12} L ${j1Base.x - 34} ${turretTop.y + 12} L ${j1Base.x + 34} ${turretTop.y + 12} L ${j1Base.x + 42} ${j1Base.y - 12} Z`}
            fill="url(#fanucDark)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* J1 αiS Servo Motor */}
          <rect
            x={j1Base.x - 52}
            y={j1Base.y - 44}
            width="20"
            height="28"
            rx="3"
            fill="#1E293B"
            stroke="#64748B"
            strokeWidth="1.2"
          />
          {/* J1 Turret Casting (FANUC Yellow) */}
          <path
            d={`M ${j1Base.x - 38} ${turretTop.y + 14} L ${j2.x + 26} ${j2.y + 22} L ${j2.x + 22} ${j2.y - 26} L ${j1Base.x - 30} ${j2.y - 16} Z`}
            fill="url(#fanucYellow)"
            stroke="#854D0E"
            strokeWidth="1.5"
          />
        </g>

        {/* Hydropneumatic Counterbalance Cylinder */}
        <g>
          <line
            x1={cbAnchor.x}
            y1={cbAnchor.y}
            x2={(cbAnchor.x + cbAttach.x) / 2}
            y2={(cbAnchor.y + cbAttach.y) / 2}
            stroke="#334155"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <line
            x1={(cbAnchor.x + cbAttach.x) / 2}
            y1={(cbAnchor.y + cbAttach.y) / 2}
            x2={cbAttach.x}
            y2={cbAttach.y}
            stroke="#CBD5E1"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx={cbAnchor.x} cy={cbAnchor.y} r="7" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
        </g>

        {/* Parallel Linkage Rod (M-900iB/700 characteristic) */}
        <line
          x1={j2.x + linkOffsetX}
          y1={j2.y + linkOffsetY}
          x2={j3.x + linkOffsetX}
          y2={j3.y + linkOffsetY}
          stroke="#475569"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Lower Arm (J2 -> J3) */}
        <g>
          <line
            x1={j2.x}
            y1={j2.y}
            x2={j3.x}
            y2={j3.y}
            stroke="#854D0E"
            strokeWidth="30"
            strokeLinecap="round"
          />
          <line
            x1={j2.x}
            y1={j2.y}
            x2={j3.x}
            y2={j3.y}
            stroke="url(#fanucYellow)"
            strokeWidth="26"
            strokeLinecap="round"
          />
          {/* FANUC branding stripe */}
          <line
            x1={j2.x + (j3.x - j2.x) * 0.25}
            y1={j2.y + (j3.y - j2.y) * 0.25}
            x2={j2.x + (j3.x - j2.x) * 0.72}
            y2={j2.y + (j3.y - j2.y) * 0.72}
            stroke="#0F172A"
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />
        </g>

        {/* J2 Servo Motor & Pivot */}
        <g>
          <circle cx={j2.x} cy={j2.y} r="18" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
          <circle cx={j2.x} cy={j2.y} r="8" fill="#FACC15" />
        </g>

        {/* Upper Arm (J3 -> Wrist) */}
        <g>
          {/* Rear counterbalance counterweight housing */}
          <rect
            x={j3.x - 28}
            y={j3.y - 16}
            width="32"
            height="32"
            rx="6"
            fill="#1E293B"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          <line
            x1={j3.x}
            y1={j3.y}
            x2={wrist.x}
            y2={wrist.y}
            stroke="#854D0E"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <line
            x1={j3.x}
            y1={j3.y}
            x2={wrist.x}
            y2={wrist.y}
            stroke="url(#fanucYellow)"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </g>

        {/* J3 Servo Motor & Pivot */}
        <g>
          <circle cx={j3.x} cy={j3.y} r="15" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
          <circle cx={j3.x} cy={j3.y} r="6" fill="#FACC15" />
        </g>

        {/* Black Dress-Pack Conduit */}
        <path
          d={dressPath}
          fill="none"
          stroke="#020617"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <path
          d={dressPath}
          fill="none"
          stroke="#334155"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />

        {/* ISO Wrist & Heavy Vacuum/Pallet Gripper */}
        <g transform={`translate(${wrist.x}, ${wrist.y}) rotate(${toolAngleDeg})`}>
          {/* J5 Wrist Housing */}
          <circle cx="0" cy="0" r="10" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Wrist Flange */}
          <rect x="6" y="-8" width="10" height="16" rx="2" fill="#475569" stroke="#CBD5E1" strokeWidth="1" />
          {/* Heavy Vacuum / Pallet Gripper Frame */}
          <rect x="16" y="-14" width="16" height="28" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
          {/* Suction Cups / Fingers */}
          <line x1="32" y1="-10" x2="38" y2="-10" stroke="#94A3B8" strokeWidth="3" />
          <line x1="32" y1="10" x2="38" y2="10" stroke="#94A3B8" strokeWidth="3" />
          <circle
            cx="24"
            cy="0"
            r="3.5"
            fill={gripperOn ? '#22C55E' : '#64748B'}
          />
          {/* Carried Workpiece */}
          {workpieceState === 'carried' && (
            <g transform="translate(38, -14)">
              <rect width="26" height="28" rx="3" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.5" />
            </g>
          )}
        </g>

        {/* TCP Crosshair */}
        <g transform={`translate(${tcp.x}, ${tcp.y})`}>
          <circle cx="0" cy="0" r="5" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#38BDF8" strokeWidth="1" />
          <line x1="0" y1="-8" x2="0" y2="8" stroke="#38BDF8" strokeWidth="1" />
        </g>

        {/* Top-Down J1 Turret Radar (shows J1 -180..+180 rotation clearly) */}
        <g transform="translate(745, 78)">
          <circle cx="0" cy="0" r="46" fill="#0F172A" fillOpacity="0.88" stroke="#334155" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="28" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="-42" y1="0" x2="42" y2="0" stroke="#1E293B" strokeWidth="1" />
          <line x1="0" y1="-42" x2="0" y2="42" stroke="#1E293B" strokeWidth="1" />
          <g transform={`rotate(${-joints.j1})`}>
            <line x1="0" y1="0" x2="36" y2="0" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />
            <circle cx="36" cy="0" r="3.5" fill="#38BDF8" />
          </g>
          <circle cx="0" cy="0" r="5" fill="#FACC15" />
          <text x="0" y="60" textAnchor="middle" fill="#94A3B8" fontSize="9.5" fontFamily="monospace">
            {labels.turretJ1}: {joints.j1.toFixed(1)}°
          </text>
        </g>
      </svg>
    </div>
  );
}
