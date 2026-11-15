import { useEffect, useRef, useState, useId } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { RotorDynamicInputs, RotorDynamicState } from './vibrationData';

interface VibrationMachineSvgProps {
  inputs: RotorDynamicInputs;
  state: RotorDynamicState;
  isRunning: boolean;
  onToggleMotor: () => void;
  onSetCorrectionAngle?: (angleDeg: number) => void;
}

export function VibrationMachineSvg({
  inputs,
  state,
  isRunning,
  onToggleMotor,
  onSetCorrectionAngle,
}: VibrationMachineSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const filterId = useId();

  // Animation angle for spinning shaft & disk
  const [spinAngle, setSpinAngle] = useState(0);
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isRunning && state.rpm > 0) {
        // Rotational speed: (rpm / 60) * 360 deg/sec
        // Scaled visually for clean rendering and strobe visibility
        const visualSpeed = (state.rpm / 60) * 360 * 0.22;
        setSpinAngle((prev) => (prev + visualSpeed * dt) % 360);
      }

      if (active) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRunning, state.rpm]);

  // Color Palette Definitions (Precision Industrial CAD Palette)
  const colors = {
    bg: isDark ? '#0b1120' : '#f8fafc',
    basePlateTop: isDark ? '#334155' : '#cbd5e1',
    basePlateFace: isDark ? '#1e293b' : '#94a3b8',
    basePlateBottom: isDark ? '#0f172a' : '#64748b',
    tSlot: isDark ? '#020617' : '#475569',
    rubberFoot: isDark ? '#090d16' : '#334155',

    // Motor Palette
    motorPrimary: isDark ? '#0284c7' : '#0369a1',
    motorDark: isDark ? '#0369a1' : '#075985',
    motorAccent: isDark ? '#38bdf8' : '#38bdf8',
    motorRib: isDark ? '#075985' : '#0c4a6e',
    motorCap: isDark ? '#0f172a' : '#1e293b',
    motorTerminal: isDark ? '#1e293b' : '#334155',

    // Mechanical Steel Parts
    shaftSteel: isDark ? '#94a3b8' : '#cbd5e1',
    shaftHighlight: isDark ? '#f8fafc' : '#ffffff',
    shaftShadow: isDark ? '#475569' : '#64748b',
    plummerBlock: isDark ? '#334155' : '#64748b',
    plummerCap: isDark ? '#475569' : '#475569',
    plummerLine: isDark ? '#1e293b' : '#334155',
    brassFitting: '#d97706',

    // Coupling
    couplingHub: isDark ? '#475569' : '#64748b',
    spiderElastomer: '#06b6d4',

    // Sensor & Strobe
    accelStainless: isDark ? '#e2e8f0' : '#f1f5f9',
    accelHex: '#cbd5e1',
    accelBand: '#f59e0b',
    cableSheath: isDark ? '#38bdf8' : '#0284c7',
    strobeLaser: '#ef4444',
    strobeGlow: 'rgba(239, 68, 68, 0.45)',

    // Balancing Disk Face
    diskOuterRim: isDark ? '#475569' : '#64748b',
    diskFace: isDark ? '#1e293b' : '#e2e8f0',
    diskInnerHub: isDark ? '#334155' : '#cbd5e1',
    holeEmpty: isDark ? '#0f172a' : '#ffffff',
    holeBorder: isDark ? '#475569' : '#94a3b8',
    heavySpotRed: '#ef4444',
    correctionCyan: '#06b6d4',
    resultantPurple: '#a855f7',

    // Console Panels & Text
    panelBg: isDark ? '#0f172a' : '#ffffff',
    panelHeader: isDark ? '#1e293b' : '#f1f5f9',
    panelBorder: isDark ? '#334155' : '#e2e8f0',
    textMain: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    textDim: isDark ? '#64748b' : '#94a3b8',
    scopeCrtBg: isDark ? '#020617' : '#04101e',
    scopeGrid: isDark ? '#1e293b' : '#0c243c',
  };

  // Disk bolt holes on 360° circular face (Radius = 52px on face view)
  const holeRadius = 50;
  const numHoles = 12; // 12 holes every 30°
  const holePositions = Array.from({ length: numHoles }, (_, i) => {
    const angleDeg = i * 30;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      angleDeg,
      x: holeRadius * Math.cos(rad),
      y: holeRadius * Math.sin(rad),
    };
  });

  // Calculate dynamic shaft orbit coordinates (Lissajous orbit)
  const orbitScale = Math.min(22, Math.max(2, state.displacement1xPeakUm * 0.28));
  const orbitPhaseRad = (state.phaseLagDeg * Math.PI) / 180;
  const currentSpinRad = (spinAngle * Math.PI) / 180;
  const orbitX = orbitScale * Math.cos(currentSpinRad);
  const orbitY = orbitScale * Math.sin(currentSpinRad - orbitPhaseRad);

  // Strobe pulse effect (active when shaft keyphasor tape passes the optical sensor)
  const isStrobeActive = isRunning && state.rpm > 0 && Math.abs(spinAngle % 360) < 30;

  return (
    <svg
      viewBox="0 0 920 500"
      className="w-full h-auto max-h-[480px] select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glow Filters */}
        <filter id={`laserGlow-${filterId}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`ledGlow-${filterId}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`crtGlow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 3D Cylindrical Metallic Gradients */}
        <linearGradient id={`shaftGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.shaftHighlight} stopOpacity="0.9" />
          <stop offset="25%" stopColor={colors.shaftSteel} />
          <stop offset="70%" stopColor={colors.shaftSteel} />
          <stop offset="100%" stopColor={colors.shaftShadow} />
        </linearGradient>

        <linearGradient id={`bedplateGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.basePlateTop} />
          <stop offset="15%" stopColor={colors.basePlateFace} />
          <stop offset="100%" stopColor={colors.basePlateBottom} />
        </linearGradient>

        <linearGradient id={`motorGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.motorAccent} stopOpacity="0.8" />
          <stop offset="20%" stopColor={colors.motorPrimary} />
          <stop offset="85%" stopColor={colors.motorDark} />
          <stop offset="100%" stopColor={colors.motorCap} />
        </linearGradient>

        <radialGradient id={`diskFaceGrad-${filterId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.diskInnerHub} />
          <stop offset="65%" stopColor={colors.diskFace} />
          <stop offset="100%" stopColor={colors.diskOuterRim} />
        </radialGradient>
      </defs>

      {/* Main Background Canvas */}
      <rect width="920" height="500" rx="16" fill={colors.bg} />

      {/* ========================================================
          LEFT REGION: ROTOR DYNAMIC TEST RIG (X: 20 to 590)
          ======================================================== */}

      {/* Main Title Banner */}
      <g transform="translate(30, 26)">
        <text
          x="0"
          y="0"
          fontSize="11"
          fontWeight="800"
          letterSpacing="0.08em"
          fill={colors.textMuted}
          className="uppercase"
        >
          {pick(
            'Industrial Rotor Dynamic Test Rig — Single-Plane Balancing System',
            'Rig Uji Dinamika Rotor Industri — Sistem Penyeimbang Satu Bidang',
            '産業用ロータ動特性・単一修正面バランシング動釣合試験ベンチ'
          )}
        </text>
      </g>

      {/* Heavy Steel Base Bedplate with Precision Machined T-Slots */}
      <g transform="translate(30, 375)">
        {/* Base Foundation Structure */}
        <rect
          x="0"
          y="0"
          width="545"
          height="55"
          rx="5"
          fill={`url(#bedplateGrad-${filterId})`}
          stroke={colors.basePlateBottom}
          strokeWidth="1.5"
        />

        {/* Machined T-Slots along Bedplate */}
        <rect x="25" y="10" width="495" height="7" rx="1.5" fill={colors.tSlot} />
        <rect x="25" y="27" width="495" height="7" rx="1.5" fill={colors.tSlot} />

        {/* Precision Leveling Foot Mounts */}
        {[35, 255, 475].map((fx) => (
          <g key={fx} transform={`translate(${fx}, 55)`}>
            {/* Stud */}
            <rect x="12" y="0" width="16" height="6" fill="#94a3b8" />
            {/* Leveling Foot Pad */}
            <rect x="0" y="6" width="40" height="10" rx="3" fill={colors.rubberFoot} />
            <line x1="4" y1="11" x2="36" y2="11" stroke="#475569" strokeWidth="1" />
          </g>
        ))}

        {/* Foundation Compliance & Rigidity Badge */}
        <g transform="translate(272, 45)">
          <rect
            x="-140"
            y="-8"
            width="280"
            height="15"
            rx="3"
            fill={colors.basePlateBottom}
            fillOpacity="0.4"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="0.04em"
            fill={colors.shaftHighlight}
            opacity="0.9"
          >
            {inputs.support === 'rigid'
              ? pick('FOUNDATION: RIGID CAST SUB-BASE (ISO 10816 CLASS II)', 'FONDASI: DASAR COR KAKU (ISO 10816 KELAS II)', '基礎構造: 高剛性鋳鉄定盤 (ISO 10816 CLASS II)')
              : pick('FOUNDATION: ELASTOMER ISOLATED (ISO 10816 CLASS II)', 'FONDASI: TEREDAM ELASTOMER (ISO 10816 KELAS II)', '基礎構造: 防振ゴム弾性支持 (ISO 10816 CLASS II)')}
          </text>
        </g>
      </g>

      {/* ================= ELECTRIC DRIVE MOTOR (X: 45 to 180) ================= */}
      <g transform="translate(45, 195)">
        {/* Foot Mounting Brackets & Hold-down Bolts */}
        <rect x="15" y="152" width="115" height="28" rx="3" fill={colors.basePlateFace} stroke={colors.basePlateBottom} strokeWidth="1" />
        <circle cx="28" cy="166" r="3.5" fill="#94a3b8" />
        <circle cx="118" cy="166" r="3.5" fill="#94a3b8" />
        <line x1="28" y1="163" x2="28" y2="169" stroke="#475569" strokeWidth="1" />
        <line x1="118" y1="163" x2="118" y2="169" stroke="#475569" strokeWidth="1" />

        {/* Motor Stator Housing (Cylindrical barrel with cooling fins) */}
        <rect
          x="12"
          y="25"
          width="122"
          height="128"
          rx="14"
          fill={`url(#motorGrad-${filterId})`}
          stroke={colors.motorDark}
          strokeWidth="2"
        />

        {/* Longitudinal Cooling Fins */}
        {[38, 52, 66, 80, 94, 108, 122, 136].map((fy) => (
          <g key={fy}>
            <line x1="14" y1={fy} x2="132" y2={fy} stroke={colors.motorRib} strokeWidth="2.5" />
            <line x1="14" y1={fy - 1} x2="132" y2={fy - 1} stroke={colors.motorAccent} strokeWidth="0.8" opacity="0.6" />
          </g>
        ))}

        {/* Front Endbell / Bearing Bracket */}
        <rect x="130" y="44" width="12" height="90" rx="3" fill={colors.motorCap} stroke={colors.motorDark} strokeWidth="1" />

        {/* Terminal Junction Box with Cable Gland */}
        <rect x="45" y="5" width="56" height="22" rx="3" fill={colors.motorTerminal} stroke={colors.motorAccent} strokeWidth="1" />
        <text x="73" y="19" textAnchor="middle" fontSize="8" fontWeight="800" fill="#38bdf8">
          400V 3~
        </text>
        <rect x="99" y="12" width="6" height="8" rx="1.5" fill="#64748b" /> {/* Cable gland */}

        {/* Lifting Eye Bolt */}
        <circle cx="73" cy="2" r="5" fill="none" stroke={colors.shaftHighlight} strokeWidth="1.8" />
        <rect x="71" y="2" width="4" height="4" fill="#94a3b8" />

        {/* Rear Fan Cowl / Louvers */}
        <path d="M 12 35 C -6 50, -6 128, 12 143 Z" fill={colors.motorCap} stroke={colors.motorDark} strokeWidth="1.5" />
        {[55, 75, 95, 115].map((ly) => (
          <line key={ly} x1="2" y1={ly} x2="8" y2={ly} stroke={colors.motorAccent} strokeWidth="1.2" opacity="0.6" />
        ))}

        {/* Motor Output Shaft with Keyway */}
        <rect x="142" y="81" width="18" height="16" rx="1" fill={`url(#shaftGrad-${filterId})`} />
        <rect x="146" y="80" width="10" height="2" fill="#475569" />

        {/* Motor Nameplate Badge */}
        <g transform="translate(73, 80)">
          <rect x="-35" y="-12" width="70" height="24" rx="2" fill="#0b132b" fillOpacity="0.75" stroke="#38bdf8" strokeWidth="0.8" />
          <text x="0" y="-1" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#ffffff" letterSpacing="0.04em">
            AC DRIVE MOTOR
          </text>
          <text x="0" y="8" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#38bdf8">
            {state.rpm} RPM • 3.0 kW
          </text>
        </g>
      </g>

      {/* ================= ROTEX JAW FLEXIBLE COUPLING (X: 205 to 240) ================= */}
      <g transform="translate(205, 269)">
        {/* Drive Hub (Motor side) */}
        <rect x="0" y="5" width="15" height="20" rx="2" fill={colors.couplingHub} stroke={colors.basePlateBottom} strokeWidth="1" />
        <circle cx="7" cy="15" r="2" fill="#94a3b8" /> {/* Set screw */}

        {/* Polyurethane Spider Insert (Cyan Elastomer) */}
        <rect x="15" y="3" width="7" height="24" rx="2" fill={colors.spiderElastomer} stroke="#0891b2" strokeWidth="0.8" />

        {/* Driven Hub (Rotor shaft side) */}
        <rect x="22" y="5" width="15" height="20" rx="2" fill={colors.couplingHub} stroke={colors.basePlateBottom} strokeWidth="1" />
        <circle cx="29" cy="15" r="2" fill="#94a3b8" />

        {/* Coupling Name Callout */}
        <text x="18" y="38" textAnchor="middle" fontSize="7" fontWeight="700" fill={colors.textDim}>
          JAW COUPLING
        </text>
      </g>

      {/* ================= BEARING 1 PEDESTAL (DE) & ACCELEROMETER (X: 250 to 315) ================= */}
      <g transform="translate(255, 245)">
        {/* Plummer Block Base Foot */}
        <polygon points="5,130 65,130 56,65 14,65" fill={colors.plummerBlock} stroke={colors.basePlateBottom} strokeWidth="1.5" />
        <rect x="2" y="125" width="66" height="12" rx="2" fill={colors.basePlateFace} stroke={colors.basePlateBottom} strokeWidth="1" />
        <circle cx="10" cy="131" r="3" fill="#94a3b8" />
        <circle cx="60" cy="131" r="3" fill="#94a3b8" />

        {/* Split Housing Cap & Horizontal Parting Seam */}
        <path d="M 12 65 Q 35 20 58 65 Z" fill={colors.plummerCap} stroke={colors.basePlateBottom} strokeWidth="1.5" />
        <line x1="8" y1="65" x2="62" y2="65" stroke={colors.plummerLine} strokeWidth="1.5" />
        <circle cx="18" cy="62" r="2" fill="#94a3b8" />
        <circle cx="52" cy="62" r="2" fill="#94a3b8" />

        {/* Brass Grease Zerk Fitting on Top */}
        <circle cx="35" cy="38" r="2" fill={colors.brassFitting} />
        <rect x="34" y="34" width="2" height="4" fill={colors.brassFitting} />

        {/* Labyrinth Seals & Shaft Bore */}
        <circle cx="35" cy="40" r="16" fill="none" stroke="#475569" strokeWidth="2.5" />
        <circle cx="35" cy="40" r="12" fill={colors.shaftSteel} opacity="0.3" />

        {/* INDUSTRIAL PIEZOELECTRIC ACCELEROMETER SENSOR */}
        <g transform="translate(35, 18)">
          {/* Threaded Mounting Stud */}
          <rect x="-3" y="0" width="6" height="5" fill="#64748b" />
          {/* Stainless Steel Hex Base */}
          <polygon points="-8,0 8,0 7,-8 -7,-8" fill={colors.accelHex} stroke="#475569" strokeWidth="0.8" />
          {/* Sensor Body Canister with Yellow Hazard/Spec Band */}
          <rect x="-7" y="-24" width="14" height="16" rx="2" fill={colors.accelStainless} stroke="#64748b" strokeWidth="1" />
          <rect x="-7" y="-18" width="14" height="4" fill={colors.accelBand} />
          {/* Top Knurled Connector & Flexible Strain Relief Boot */}
          <rect x="-4" y="-30" width="8" height="6" rx="1.5" fill="#1e293b" />
          {/* Braided Coaxial Signal Cable Routed Gracefully */}
          <path
            d="M 0 -30 C 0 -50, 45 -60, 90 -45 C 130 -32, 170 -48, 250 -40"
            fill="none"
            stroke={colors.cableSheath}
            strokeWidth="2.4"
            strokeDasharray="4 2"
          />
          {/* Sensor Callout Tag */}
          <g transform="translate(0, -37)">
            <rect x="-24" y="-8" width="48" height="13" rx="2" fill={isDark ? '#0f172a' : '#ffffff'} stroke={colors.panelBorder} strokeWidth="0.8" />
            <text x="0" y="1" textAnchor="middle" fontSize="7" fontWeight="800" fill={isDark ? '#38bdf8' : '#0284c7'}>
              1X SENSOR
            </text>
          </g>
        </g>

        <text x="35" y="105" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={colors.textMain}>
          BEARING 1 (DE)
        </text>
      </g>

      {/* ================= ROTOR SHAFT ASSEMBLY WITH ORBIT DISPLACEMENT ================= */}
      <g transform="translate(242, 285)">
        {/* Longitudinal Datum Centerline */}
        <line
          x1="0"
          y1="0"
          x2="335"
          y2="0"
          stroke={colors.textDim}
          strokeWidth="0.8"
          strokeDasharray="6 3 2 3"
          opacity="0.5"
        />

        {/* Stepped Precision Ground Rotor Shaft */}
        <g transform={`translate(0, ${orbitY * 0.45})`}>
          {/* Section 1: From Coupling to Bearing 1 */}
          <rect x="0" y="-8" width="48" height="16" rx="1" fill={`url(#shaftGrad-${filterId})`} stroke={colors.basePlateBottom} strokeWidth="0.8" />
          {/* Stepped Shoulder */}
          <rect x="48" y="-9" width="35" height="18" rx="1" fill={`url(#shaftGrad-${filterId})`} stroke={colors.basePlateBottom} strokeWidth="0.8" />
          {/* Section 2: Shaft Span between Bearing 1 and Rotor Disk */}
          <rect x="83" y="-8" width="105" height="16" fill={`url(#shaftGrad-${filterId})`} stroke={colors.basePlateBottom} strokeWidth="0.8" />
          {/* Section 3: Disk Mounting Hub Shoulder */}
          <rect x="188" y="-10" width="30" height="20" rx="1" fill={`url(#shaftGrad-${filterId})`} stroke={colors.basePlateBottom} strokeWidth="0.8" />
          {/* Section 4: Shaft Span from Disk to Bearing 2 */}
          <rect x="218" y="-8" width="80" height="16" fill={`url(#shaftGrad-${filterId})`} stroke={colors.basePlateBottom} strokeWidth="0.8" />
          {/* Section 5: Bearing 2 Journal & Shaft End */}
          <rect x="298" y="-8" width="36" height="16" rx="2" fill={`url(#shaftGrad-${filterId})`} stroke={colors.basePlateBottom} strokeWidth="0.8" />

          {/* Visual Rotation Surface Striae (Texture moving with spin) */}
          {isRunning && (
            <line
              x1="120"
              y1="-8"
              x2="120"
              y2="8"
              stroke={colors.shaftHighlight}
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeDashoffset={(spinAngle * 0.5) % 6}
              opacity="0.8"
            />
          )}
        </g>
      </g>

      {/* ================= OPTICAL TACHOMETER / KEYPHASOR (X: 350 to 385) ================= */}
      <g transform="translate(360, 215)">
        {/* Rigid Base Bracket */}
        <polygon points="0,70 12,70 8,10 -4,10" fill={colors.plummerCap} stroke={colors.basePlateBottom} strokeWidth="1" />
        {/* Sensor Head with Emitter Lens */}
        <rect x="-3" y="10" width="14" height="24" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
        <circle cx="4" cy="34" r="3" fill="#ef4444" />

        {/* Laser Pulse Beam pointing directly at shaft */}
        <line
          x1="4"
          y1="36"
          x2="4"
          y2="69"
          stroke={colors.strobeLaser}
          strokeWidth={isStrobeActive ? 3 : 1}
          opacity={isStrobeActive ? 1 : 0.35}
          filter={isStrobeActive ? `url(#laserGlow-${filterId})` : undefined}
        />

        {/* Reflective Tape on Shaft surface */}
        <rect x="1" y="68" width="6" height="3" fill="#ffffff" stroke="#ef4444" strokeWidth="0.6" />

        <text x="4" y="2" textAnchor="middle" fontSize="7" fontWeight="800" fill={colors.textMuted}>
          KEYPHASOR
        </text>
      </g>

      {/* ================= BALANCING DISK ELEVATION VIEW (X: 435 to 455) ================= */}
      <g transform="translate(445, 285)">
        {/* Axial Hub Flange Collar */}
        <rect
          x="-14"
          y={-22 + orbitY * 0.45}
          width="28"
          height="44"
          rx="3"
          fill={colors.diskInnerHub}
          stroke={colors.basePlateBottom}
          strokeWidth="1.2"
        />

        {/* Precision Balanced Flywheel Disk Rim */}
        <rect
          x="-8"
          y={-85 + orbitY * 0.5}
          width="16"
          height="170"
          rx="4"
          fill={`url(#bedplateGrad-${filterId})`}
          stroke={colors.basePlateBottom}
          strokeWidth="1.8"
        />

        {/* Chamfers and Lightening Groove Details */}
        <line x1="-8" y1={-78 + orbitY * 0.5} x2="8" y2={-78 + orbitY * 0.5} stroke={colors.shaftHighlight} strokeWidth="1" opacity="0.7" />
        <line x1="-8" y1={78 + orbitY * 0.5} x2="8" y2={78 + orbitY * 0.5} stroke={colors.basePlateBottom} strokeWidth="1" />

        {/* Visible Correction Bolt Head Mounted on Rim (when present) */}
        {inputs.correctionMassG > 0 && (
          <circle
            cx="0"
            cy={-62 * Math.sin(((inputs.correctionPhaseDeg + spinAngle) * Math.PI) / 180) + orbitY * 0.5}
            r="4.5"
            fill={colors.correctionCyan}
            stroke="#ffffff"
            strokeWidth="1.2"
          />
        )}

        <text x="0" y={-93 + orbitY * 0.5} textAnchor="middle" fontSize="7.5" fontWeight="800" fill={colors.textMain}>
          ROTOR DISK
        </text>
      </g>

      {/* ================= BEARING 2 PEDESTAL (NDE) (X: 505 to 570) ================= */}
      <g transform="translate(510, 245)">
        {/* Plummer Block Base Foot */}
        <polygon points="5,130 65,130 56,65 14,65" fill={colors.plummerBlock} stroke={colors.basePlateBottom} strokeWidth="1.5" />
        <rect x="2" y="125" width="66" height="12" rx="2" fill={colors.basePlateFace} stroke={colors.basePlateBottom} strokeWidth="1" />
        <circle cx="10" cy="131" r="3" fill="#94a3b8" />
        <circle cx="60" cy="131" r="3" fill="#94a3b8" />

        {/* Housing Cap & Parting Seam */}
        <path d="M 12 65 Q 35 20 58 65 Z" fill={colors.plummerCap} stroke={colors.basePlateBottom} strokeWidth="1.5" />
        <line x1="8" y1="65" x2="62" y2="65" stroke={colors.plummerLine} strokeWidth="1.5" />
        <circle cx="18" cy="62" r="2" fill="#94a3b8" />
        <circle cx="52" cy="62" r="2" fill="#94a3b8" />

        {/* Brass Grease Zerk Fitting */}
        <circle cx="35" cy="38" r="2" fill={colors.brassFitting} />
        <rect x="34" y="34" width="2" height="4" fill={colors.brassFitting} />

        {/* Shaft Bore Bearing Ring */}
        <circle cx="35" cy="40" r="16" fill="none" stroke="#475569" strokeWidth="2.5" />

        <text x="35" y="105" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={colors.textMain}>
          BEARING 2 (NDE)
        </text>
      </g>

      {/* Shaft Safety Protective End Cap */}
      <rect x="576" y="280" width="10" height="10" rx="3" fill="#1e293b" />

      {/* Orbit Amplitude On-Rig Callout Badge */}
      <g transform="translate(260, 148)">
        <rect
          x="0"
          y="0"
          width="135"
          height="42"
          rx="6"
          fill={colors.panelBg}
          stroke={colors.panelBorder}
          strokeWidth="1.2"
        />
        <text x="10" y="15" fontSize="8" fontWeight="700" fill={colors.textMuted}>
          {pick('Radial Shaft Orbit Peak', 'Puncak Orbit Poros Radial', '軸心軌道ピーク変位')}
        </text>
        <text x="10" y="33" fontSize="13.5" fontWeight="900" fill={colors.cableSheath}>
          {state.displacement1xPkPkUm.toFixed(1)}{' '}
          <tspan fontSize="9" fontWeight="700" fill={colors.textMuted}>
            μm p-p
          </tspan>
        </text>
      </g>

      {/* ========================================================
          RIGHT REGION TOP: OSCILLOSCOPE CRT & ISO READOUT (X: 630 to 895, Y: 25 to 225)
          ======================================================== */}
      <g transform="translate(635, 25)">
        {/* Outer Bezel Frame */}
        <rect
          x="0"
          y="0"
          width="255"
          height="200"
          rx="10"
          fill={colors.panelBg}
          stroke={colors.panelBorder}
          strokeWidth="1.4"
        />

        {/* Header Bar */}
        <path
          d="M 0 10 Q 0 0 10 0 L 245 0 Q 255 0 255 10 L 255 30 L 0 30 Z"
          fill={colors.panelHeader}
        />
        <text
          x="12"
          y="19"
          fontSize="9"
          fontWeight="800"
          letterSpacing="0.05em"
          fill={colors.textMain}
          className="uppercase"
        >
          {pick('Oscilloscope Orbit & ISO Severity Readout', 'Orbit Osiloskop & Tingkat Keparahan ISO', '軸心軌道スコープ・ISO評価表示')}
        </text>

        {/* Oscilloscope Circular CRT Screen (Center at X: 64, Y: 100) */}
        <g transform="translate(64, 100)">
          {/* Phosphor CRT Dark Bezel */}
          <circle cx="0" cy="0" r="54" fill={colors.scopeCrtBg} stroke="#1e293b" strokeWidth="2" />

          {/* Graticule Grid Lines */}
          <circle cx="0" cy="0" r="50" fill="none" stroke={colors.scopeGrid} strokeWidth="1" />
          <circle cx="0" cy="0" r="35" fill="none" stroke={colors.scopeGrid} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="0" cy="0" r="20" fill="none" stroke={colors.scopeGrid} strokeWidth="1" strokeDasharray="2 2" />
          <line x1="-50" y1="0" x2="50" y2="0" stroke={colors.scopeGrid} strokeWidth="1" />
          <line x1="0" y1="-50" x2="0" y2="50" stroke={colors.scopeGrid} strokeWidth="1" />

          {/* Orbit Dynamic Trajectory */}
          <ellipse
            cx="0"
            cy="0"
            rx={Math.max(2, orbitScale)}
            ry={Math.max(1.5, orbitScale * 0.82)}
            transform={`rotate(${state.netPhaseDeg})`}
            fill="none"
            stroke={state.isoInfo.color}
            strokeWidth="2"
            filter={`url(#crtGlow-${filterId})`}
          />

          {/* Orbit Center & Live Instantaneous Orbit Dot */}
          <circle cx="0" cy="0" r="1.5" fill="#64748b" />
          {isRunning && (
            <circle
              cx={orbitX}
              cy={orbitY}
              r="3.5"
              fill={state.isoInfo.color}
              filter={`url(#ledGlow-${filterId})`}
            />
          )}

          {/* Cardinal Scope Axes */}
          <text x="36" y="-36" fontSize="6.5" fontWeight="700" fill="#64748b">Y (90°)</text>
          <text x="36" y="10" fontSize="6.5" fontWeight="700" fill="#64748b">X (0°)</text>
        </g>

        {/* Right Digital Telemetry Display inside Console */}
        <g transform="translate(136, 42)">
          {/* ISO 10816 4-Segment LED Indicator Bar */}
          <text x="0" y="0" fontSize="7.5" fontWeight="800" fill={colors.textMuted}>
            {pick('ISO 10816/20816 ZONES:', 'ZONA ISO 10816/20816:', 'ISO 10816/20816 評価ゾーン:')}
          </text>
          <div className="flex gap-1">
            {['A', 'B', 'C', 'D'].map((z, idx) => {
              const isActive = state.isoZone === z;
              const zColors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'];
              const zColor = zColors[idx];
              return (
                <g key={z} transform={`translate(${idx * 27}, 8)`}>
                  <rect
                    x="0"
                    y="0"
                    width="23"
                    height="16"
                    rx="2.5"
                    fill={isActive ? zColor : colors.panelHeader}
                    fillOpacity={isActive ? 1 : 0.4}
                    stroke={zColor}
                    strokeWidth={isActive ? 1.5 : 0.8}
                  />
                  <text
                    x="11.5"
                    y="11.5"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="900"
                    fill={isActive ? '#ffffff' : colors.textMuted}
                  >
                    {z}
                  </text>
                </g>
              );
            })}
          </div>

          {/* RMS Velocity Metric */}
          <g transform="translate(0, 48)">
            <text x="0" y="0" fontSize="7.5" fontWeight="700" fill={colors.textMuted}>
              {pick('RMS Velocity v_rms:', 'Kecepatan RMS v_rms:', '振動速度実効値 v_rms:')}
            </text>
            <text x="0" y="16" fontSize="16" fontWeight="900" fill={colors.textMain}>
              {state.velocityTotalRmsMmS.toFixed(2)}{' '}
              <tspan fontSize="9" fontWeight="700" fill={colors.textMuted}>
                mm/s
              </tspan>
            </text>
          </g>

          {/* 1X Phase Lag Angle */}
          <g transform="translate(0, 80)">
            <text x="0" y="0" fontSize="7.5" fontWeight="700" fill={colors.textMuted}>
              {pick('1X Phase Lag φ:', 'Lag Sudut Fasa 1X φ:', '1X 位相遅れ角 φ:')}
            </text>
            <text x="0" y="14" fontSize="13" fontWeight="900" fill={colors.cableSheath}>
              {state.phaseLagDeg.toFixed(1)}°
            </text>
          </g>

          {/* Condition Description Pill - bounded width to prevent any SVG edge overflow */}
          <g transform="translate(0, 104)">
            <rect
              x="-2"
              y="-10"
              width="114"
              height="24"
              rx="4"
              fill={state.isoInfo.color}
              fillOpacity="0.12"
              stroke={state.isoInfo.color}
              strokeWidth="0.8"
            />
            {state.isoZone === 'A' && (
              <>
                <text x="5" y="1" fontSize="7" fontWeight="800" fill={state.isoInfo.color}>
                  {pick('NEWLY COMMISSIONED', 'KONDISI BARU / PRIMA', '初期稼働・極めて良好')}
                </text>
                <text x="5" y="10" fontSize="6.5" fontWeight="600" fill={colors.textMuted}>
                  {pick('Pristine Condition', 'Kondisi Ideal', '理想的な健全状態')}
                </text>
              </>
            )}
            {state.isoZone === 'B' && (
              <>
                <text x="5" y="1" fontSize="7" fontWeight="800" fill={state.isoInfo.color}>
                  {pick('ACCEPTABLE LEVEL', 'LEVEL DITERIMA', '許容運転水準')}
                </text>
                <text x="5" y="10" fontSize="6.5" fontWeight="600" fill={colors.textMuted}>
                  {pick('Unrestricted Operation', 'Operasi Tak Terbatas', '長期連続運転可能')}
                </text>
              </>
            )}
            {state.isoZone === 'C' && (
              <>
                <text x="5" y="1" fontSize="7" fontWeight="800" fill={state.isoInfo.color}>
                  {pick('RESTRICTED RUN', 'OPERASI TERBATAS', '制限運転対象')}
                </text>
                <text x="5" y="10" fontSize="6.5" fontWeight="600" fill={colors.textMuted}>
                  {pick('Maintenance Required', 'Perlu Pemeliharaan', '次回停止時点検要')}
                </text>
              </>
            )}
            {state.isoZone === 'D' && (
              <>
                <text x="5" y="1" fontSize="7" fontWeight="800" fill={state.isoInfo.color}>
                  {pick('DANGER: TRIP ALARM', 'BAHAYA: ALARM TRIP', '危険: トリップ発砲')}
                </text>
                <text x="5" y="10" fontSize="6.5" fontWeight="600" fill={colors.textMuted}>
                  {pick('Immediate Shutdown', 'Matikan Mesin Segera', '即時緊急停止要')}
                </text>
              </>
            )}
          </g>
        </g>

        {/* Push-Button Interactive Motor Toggle on Bezel */}
        <g transform="translate(14, 160)">
          <rect
            x="0"
            y="0"
            width="227"
            height="28"
            rx="6"
            fill={isRunning ? (isDark ? '#064e3b' : '#dcfce7') : isDark ? '#1e293b' : '#f1f5f9'}
            stroke={isRunning ? '#10b981' : colors.panelBorder}
            strokeWidth="1.2"
            className="cursor-pointer transition-colors"
            onClick={onToggleMotor}
          />
          <circle
            cx="16"
            cy="14"
            r="4.5"
            fill={isRunning ? '#10b981' : '#64748b'}
            filter={isRunning ? `url(#ledGlow-${filterId})` : undefined}
          />
          <text
            x="28"
            y="18"
            fontSize="8.5"
            fontWeight="800"
            fill={isRunning ? (isDark ? '#34d399' : '#15803d') : colors.textMain}
          >
            {isRunning
              ? pick('MOTOR ENERGIZED — CLICK TO STOP', 'MOTOR BERPUTAR — KLIK UTK BERHENTI', 'モーター運転中 — クリックで停止')
              : pick('MOTOR OFF — CLICK TO START', 'MOTOR NONAKTIF — KLIK UTK MULAI', 'モーター停止中 — クリックで起動')}
          </text>
        </g>
      </g>

      {/* ========================================================
          RIGHT REGION BOTTOM: BALANCING PLANE POLAR FACE VIEW (X: 635 to 890, Y: 240 to 480)
          ======================================================== */}
      <g transform="translate(635, 240)">
        <rect
          x="0"
          y="0"
          width="255"
          height="240"
          rx="10"
          fill={colors.panelBg}
          stroke={colors.panelBorder}
          strokeWidth="1.4"
        />

        {/* Header Bar */}
        <path
          d="M 0 10 Q 0 0 10 0 L 245 0 Q 255 0 255 10 L 255 30 L 0 30 Z"
          fill={colors.panelHeader}
        />
        <text
          x="12"
          y="19"
          fontSize="9"
          fontWeight="800"
          letterSpacing="0.05em"
          fill={colors.textMain}
          className="uppercase"
        >
          {pick('Balancing Plane (360° Polar Holes)', 'Bidang Balans (Lubang Baut 360°)', '修正面 360°ボルト穴極配置')}
        </text>

        {/* Circular Face of Balancing Disk (Center at X: 127, Y: 130) */}
        <g transform="translate(127, 130)">
          {/* Strobe Flash Pulse Aura */}
          {isStrobeActive && (
            <circle cx="0" cy="0" r="82" fill={colors.strobeGlow} />
          )}

          {/* Outer Disk Rim */}
          <circle cx="0" cy="0" r="74" fill={`url(#diskFaceGrad-${filterId})`} stroke={colors.diskOuterRim} strokeWidth="3" />

          {/* Central Hub & Keyway */}
          <circle cx="0" cy="0" r="18" fill={colors.diskInnerHub} stroke={colors.basePlateBottom} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="9" fill={colors.basePlateBottom} />
          <rect x="-2" y="-10" width="4" height="4" fill="#64748b" />

          {/* PCD Pitch Circle Diameter (Dashed guideline) */}
          <circle cx="0" cy="0" r={holeRadius} fill="none" stroke={colors.textDim} strokeWidth="0.9" strokeDasharray="3 3" />

          {/* Initial Unbalance Heavy Spot Vector (U0) */}
          {inputs.initialUnbalanceGmm > 0 && (() => {
            const rad0 = (inputs.initialPhaseDeg * Math.PI) / 180;
            const vx0 = 65 * Math.cos(rad0);
            const vy0 = 65 * Math.sin(rad0);
            return (
              <g>
                <line
                  x1="0"
                  y1="0"
                  x2={vx0}
                  y2={vy0}
                  stroke={colors.heavySpotRed}
                  strokeWidth="2.2"
                  strokeDasharray="3 2"
                />
                <circle cx={vx0} cy={vy0} r="5.5" fill={colors.heavySpotRed} stroke="#ffffff" strokeWidth="1.2" />
              </g>
            );
          })()}

          {/* Correction Weight Vector (Uc) */}
          {inputs.correctionMassG > 0 && (() => {
            const radc = (inputs.correctionPhaseDeg * Math.PI) / 180;
            const vxc = 65 * Math.cos(radc);
            const vyc = 65 * Math.sin(radc);
            return (
              <g>
                <line
                  x1="0"
                  y1="0"
                  x2={vxc}
                  y2={vyc}
                  stroke={colors.correctionCyan}
                  strokeWidth="2.5"
                />
                <circle cx={vxc} cy={vyc} r="6" fill={colors.correctionCyan} stroke="#ffffff" strokeWidth="1.5" />
              </g>
            );
          })()}

          {/* Resultant Net Unbalance Vector (Unet) */}
          {inputs.initialUnbalanceGmm > 0 && inputs.correctionMassG > 0 && (() => {
            const radNet = (state.netPhaseDeg * Math.PI) / 180;
            const len = Math.min(65, Math.max(10, (state.netUnbalanceGmm / (inputs.initialUnbalanceGmm || 1)) * 60));
            const vxNet = len * Math.cos(radNet);
            const vyNet = len * Math.sin(radNet);
            return (
              <line
                x1="0"
                y1="0"
                x2={vxNet}
                y2={vyNet}
                stroke={colors.resultantPurple}
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            );
          })()}

          {/* 12 Tapped Holes on PCD (Clickable to select angle!) */}
          {holePositions.map((hole) => {
            const isCorrectionHole =
              inputs.correctionMassG > 0 &&
              Math.abs(inputs.correctionPhaseDeg - hole.angleDeg) < 15;
            return (
              <g
                key={hole.angleDeg}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => onSetCorrectionAngle?.(hole.angleDeg)}
              >
                {/* Counterbore Recess */}
                <circle
                  cx={hole.x}
                  cy={hole.y}
                  r="5.5"
                  fill={isCorrectionHole ? colors.correctionCyan : colors.holeEmpty}
                  stroke={isCorrectionHole ? '#ffffff' : colors.holeBorder}
                  strokeWidth={isCorrectionHole ? 1.8 : 1}
                />
                {/* Center Thread Hole */}
                <circle
                  cx={hole.x}
                  cy={hole.y}
                  r="2"
                  fill={isCorrectionHole ? '#ffffff' : colors.basePlateBottom}
                />
              </g>
            );
          })}

          {/* Angle Markings positioned strictly OUTSIDE disk rim (Radius = 84) to prevent any overlap */}
          <text x="84" y="3" fontSize="7.5" fontWeight="800" fill={colors.textMuted} textAnchor="start">0°</text>
          <text x="0" y="-81" fontSize="7.5" fontWeight="800" fill={colors.textMuted} textAnchor="middle">90°</text>
          <text x="-84" y="3" fontSize="7.5" fontWeight="800" fill={colors.textMuted} textAnchor="end">180°</text>
          <text x="0" y="87" fontSize="7.5" fontWeight="800" fill={colors.textMuted} textAnchor="middle">270°</text>
        </g>

        {/* Legend Footer */}
        <g transform="translate(18, 218)">
          <circle cx="5" cy="5" r="4" fill={colors.heavySpotRed} />
          <text x="14" y="8" fontSize="7.5" fontWeight="700" fill={colors.textMuted}>
            {pick('Heavy Spot U₀', 'Titik Berat U₀', '初期不釣合 U₀')}
          </text>

          <circle cx="120" cy="5" r="4" fill={colors.correctionCyan} />
          <text x="129" y="8" fontSize="7.5" fontWeight="700" fill={colors.textMuted}>
            {pick('Correction Mass Wc', 'Massa Koreksi Wc', '修正重り Wc')}
          </text>
        </g>
      </g>
    </svg>
  );
}
