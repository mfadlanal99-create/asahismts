import { useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  IP_RATINGS,
  MOTOR_MOUNTINGS,
  MOTOR_TYPES,
  calculateMotorState,
  type IpRating,
  type MotorMounting,
  type MotorType,
  type PoleCount,
  type TerminalConnectionMode,
} from './motorBasicsData';

interface MotorBasicsSvgProps {
  motorType: MotorType;
  mounting: MotorMounting;
  poles: PoleCount;
  frequency: 50 | 60;
  ipRating: IpRating;
  terminalConnection: TerminalConnectionMode;
  isMotorSpinning: boolean;
  onToggleSpin?: () => void;
  onToggleConnection?: () => void;
}

const SHAFT_BAND_COUNT = 4;
const ROTOR_BAR_COUNT = 8;
const FAN_BLADE_COUNT = 6;
const AIRFLOW_STREAK_COUNT = 4;

export function MotorBasicsSvg({
  motorType,
  mounting,
  poles,
  frequency,
  ipRating,
  terminalConnection,
  isMotorSpinning,
  onToggleSpin,
  onToggleConnection,
}: MotorBasicsSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const c = useMemo(
    () => ({
      canvasBg: 'var(--md-surface-container-lowest)',
      cardBg: 'var(--md-surface-container-low)',
      cardSubBg: 'var(--md-surface-container)',
      cardBorder: 'var(--md-outline-variant)',
      grid: 'var(--md-outline-variant)',
      textMain: 'var(--md-on-surface)',
      textMuted: 'var(--md-on-surface-variant)',
      steelDark: isDark ? '#1e293b' : '#475569',
      steelEdge: isDark ? '#64748b' : '#475569',
      steelMid: isDark ? '#475569' : '#94a3b8',
      steelLight: isDark ? '#94a3b8' : '#cbd5e1',
      emerald: '#10b981',
      amber: '#f59e0b',
      amberBg: isDark ? 'rgba(245,158,11,0.16)' : 'rgba(245,158,11,0.12)',
      cyan: 'var(--md-primary)',
      cyanBg: 'var(--md-primary-container)',
      onCyanBg: 'var(--md-on-primary-container)',
      blue: '#3b82f6',
      rose: '#ef4444',
      dim: 'var(--md-primary)',
      phenolic: isDark ? '#1c1917' : '#292524',
      phenolicRib: isDark ? '#44403c' : '#57534e',
    }),
    [isDark]
  );

  const motorSpec = MOTOR_TYPES.find((m) => m.id === motorType) ?? MOTOR_TYPES[0];
  const mountSpec = MOTOR_MOUNTINGS[mounting];
  const ipSpec = IP_RATINGS[ipRating];

  const motorCalc = useMemo(
    () => calculateMotorState(poles, frequency, terminalConnection),
    [poles, frequency, terminalConnection]
  );

  const motorShortName = useMemo(() => {
    switch (motorType) {
      case 'ac-tefc':
        return '3-Ph TEFC Induction';
      case 'single-phase':
        return '1-Ph Cap-Start AC';
      case 'vfd-inverter':
        return 'VFD Inverter-Duty';
      case 'bldc':
        return 'Brushless DC (BLDC)';
      case 'servo':
        return 'AC Servo w/ Encoder';
      case 'stepper':
        return 'Hybrid Stepper 1.8°';
      default:
        return motorSpec.name;
    }
  }, [motorType, motorSpec.name]);

  // Direct-DOM refs for smooth zero-rerender requestAnimationFrame shaft/rotor/fan rotation
  const angleRef = useRef(-0.55); // initial resting angle shows keyway on upper-front face
  const keySlotRef = useRef<SVGRectElement | null>(null);
  const keyBodyRef = useRef<SVGRectElement | null>(null);
  const keyHighlightRef = useRef<SVGRectElement | null>(null);
  const shaftBandRefs = useRef<Array<SVGRectElement | null>>([]);
  const intShaftBandRefs = useRef<Array<SVGRectElement | null>>([]);
  const rotorBarRefs = useRef<Array<SVGLineElement | null>>([]);
  const fanBladeRefs = useRef<Array<SVGRectElement | null>>([]);
  const airflowRefs = useRef<Array<SVGLineElement | null>>([]);

  useEffect(() => {
    const applyPhase = (theta: number, airProgress: number, running: boolean) => {
      const cy = 184;
      const rDe = 11; // DE shaft half-height (y=173..195)

      // 1) Cylindrical specular / machining bands sweeping top -> bottom across DE & internal shaft
      for (let i = 0; i < SHAFT_BAND_COUNT; i++) {
        const phi = theta + (i * Math.PI * 2) / SHAFT_BAND_COUNT;
        const cosPhi = Math.cos(phi);
        const el = shaftBandRefs.current[i];
        const intEl = intShaftBandRefs.current[i];
        if (cosPhi <= 0.05) {
          el?.setAttribute('opacity', '0');
          intEl?.setAttribute('opacity', '0');
        } else {
          if (el) {
            const yCenter = cy + rDe * Math.sin(phi);
            const bandH = Math.max(1.0, 2.8 * cosPhi);
            el.setAttribute('y', (yCenter - bandH * 0.5).toFixed(2));
            el.setAttribute('height', bandH.toFixed(2));
            el.setAttribute('opacity', (0.48 * cosPhi).toFixed(2));
          }
          if (intEl) {
            const yCenterInt = cy + 9 * Math.sin(phi);
            const bandHInt = Math.max(0.9, 2.2 * cosPhi);
            intEl.setAttribute('y', (yCenterInt - bandHInt * 0.5).toFixed(2));
            intEl.setAttribute('height', bandHInt.toFixed(2));
            intEl.setAttribute('opacity', (0.42 * cosPhi).toFixed(2));
          }
        }
      }

      // 2) Parallel Keyway Slot & Fitted Key orbiting around DE shaft front hemisphere
      const keySin = Math.sin(theta);
      const keyCos = Math.cos(theta);
      if (keySlotRef.current && keyBodyRef.current && keyHighlightRef.current) {
        if (keyCos <= -0.05) {
          // Key rotated around the back side of the shaft
          keySlotRef.current.setAttribute('opacity', '0');
          keyBodyRef.current.setAttribute('opacity', '0');
          keyHighlightRef.current.setAttribute('opacity', '0');
        } else {
          const vis = Math.min(1, (keyCos + 0.05) / 0.35);
          const yKeyCenter = cy + (rDe - 1.5) * keySin;
          const hKey = Math.max(1.5, 5.2 * Math.max(0.15, keyCos));
          const slotH = hKey + 1.4;
          keySlotRef.current.setAttribute('y', (yKeyCenter - slotH * 0.5).toFixed(2));
          keySlotRef.current.setAttribute('height', slotH.toFixed(2));
          keySlotRef.current.setAttribute('opacity', (0.75 * vis).toFixed(2));

          keyBodyRef.current.setAttribute('y', (yKeyCenter - hKey * 0.5).toFixed(2));
          keyBodyRef.current.setAttribute('height', hKey.toFixed(2));
          keyBodyRef.current.setAttribute('opacity', vis.toFixed(2));

          keyHighlightRef.current.setAttribute('y', (yKeyCenter - hKey * 0.35).toFixed(2));
          keyHighlightRef.current.setAttribute('height', Math.max(0.8, hKey * 0.3).toFixed(2));
          keyHighlightRef.current.setAttribute('opacity', (0.85 * vis).toFixed(2));
        }
      }

      // 3) Horizontal Squirrel-Cage Rotor Bars sweeping vertically across cutaway top half (y: 142..175)
      // On a spinning horizontal cylinder viewed from the side, rotor bars are longitudinal skewed stripes
      // that translate from top edge (y=142) down toward shaft (y=175) across the front upper quadrant.
      const rRotor = 42; // 184 - 142
      for (let i = 0; i < ROTOR_BAR_COUNT; i++) {
        const bar = rotorBarRefs.current[i];
        if (!bar) continue;
        const phi = theta + (i * Math.PI * 2) / ROTOR_BAR_COUNT;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        // Upper front quadrant covers phi in (-pi/2, 0.25) where y is between 142 and 175
        const yBar = cy + rRotor * sinPhi;
        if (cosPhi <= 0 || yBar < 141 || yBar > 176) {
          bar.setAttribute('opacity', '0');
        } else {
          const yLeft = Math.max(142, Math.min(175, yBar - 2.5));
          const yRight = Math.max(142, Math.min(175, yBar + 2.5));
          bar.setAttribute('y1', yLeft.toFixed(2));
          bar.setAttribute('y2', yRight.toFixed(2));
          bar.setAttribute('stroke-width', (1.2 + 1.6 * cosPhi).toFixed(2));
          bar.setAttribute('opacity', (0.28 + 0.62 * cosPhi).toFixed(2));
        }
      }

      // 4) Rear Cooling Fan Blades sweeping vertically across upper cowl cutaway (y: 122..170)
      const rFan = 62; // 184 - 122
      for (let i = 0; i < FAN_BLADE_COUNT; i++) {
        const blade = fanBladeRefs.current[i];
        if (!blade) continue;
        const phi = theta + (i * Math.PI * 2) / FAN_BLADE_COUNT;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const yBlade = cy + rFan * sinPhi;
        if (cosPhi <= 0 || yBlade < 120 || yBlade > 172) {
          blade.setAttribute('opacity', '0');
        } else {
          const bladeH = Math.max(1.8, 5.5 * cosPhi);
          blade.setAttribute('y', (yBlade - bladeH * 0.5).toFixed(2));
          blade.setAttribute('height', bladeH.toFixed(2));
          blade.setAttribute('opacity', (0.35 + 0.65 * cosPhi).toFixed(2));
        }
      }

      // 5) Subtle TEFC Cooling Airflow Streaks moving right -> left over cowl & stator
      for (let i = 0; i < AIRFLOW_STREAK_COUNT; i++) {
        const streak = airflowRefs.current[i];
        if (!streak) continue;
        if (!running) {
          streak.setAttribute('opacity', '0');
          continue;
        }
        const phase = (airProgress + i / AIRFLOW_STREAK_COUNT) % 1;
        const xHead = 468 - phase * 115; // flows leftward from intake grill (468 -> 353)
        const len = 18;
        const alpha = Math.sin(phase * Math.PI) * 0.75;
        streak.setAttribute('x1', (xHead + len).toFixed(1));
        streak.setAttribute('x2', xHead.toFixed(1));
        streak.setAttribute('opacity', alpha.toFixed(2));
      }
    };

    // Always render initial / paused pose immediately
    applyPhase(angleRef.current, 0, isMotorSpinning);

    if (!isMotorSpinning) {
      return undefined;
    }

    let rafId = 0;
    let lastTs = performance.now();
    let airProg = 0;
    // Scale angular speed proportionally to actual rated RPM (1440 RPM -> ~7.5 rad/s, smooth & anti-aliased)
    const visualOmega = (motorCalc.ratedRpm / 1440) * 7.5;
    const airSpeed = (motorCalc.ratedRpm / 1440) * 1.1;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      angleRef.current = (angleRef.current + visualOmega * dt) % (Math.PI * 2);
      airProg = (airProg + airSpeed * dt) % 1;
      applyPhase(angleRef.current, airProg, true);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isMotorSpinning, motorCalc.ratedRpm]);

  return (
    <div className="glass-panel w-full relative flex items-center justify-center overflow-hidden rounded-[28px] p-3 select-none">
      <svg
        viewBox="0 0 920 500"
        className="w-full max-h-[480px] h-auto drop-shadow-sm"
        role="img"
        aria-label="Electric Motor 2D CAD Cutaway, 6-Stud Star/Delta Terminal Block, and Metallic Nameplate"
      >
        <defs>
          <pattern id="mbGridMinor" width="16" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M 16 0 L 0 0 0 16"
              fill="none"
              stroke={c.grid}
              strokeWidth="0.6"
              strokeOpacity={isDark ? 0.22 : 0.35}
            />
          </pattern>
          <pattern id="mbGridMajor" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="url(#mbGridMinor)" />
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke={c.grid}
              strokeWidth="1.1"
              strokeOpacity={isDark ? 0.35 : 0.55}
            />
          </pattern>

          <pattern id="mbHatchStator" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="7" stroke={isDark ? '#64748b' : '#475569'} strokeWidth="1.1" strokeOpacity="0.5" />
          </pattern>

          {/* Vertical shading for flanges & upright cylindrical features */}
          <linearGradient id="mbCylSteelGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isDark ? '#334155' : '#64748b'} />
            <stop offset="22%" stopColor={isDark ? '#64748b' : '#cbd5e1'} />
            <stop offset="44%" stopColor={isDark ? '#cbd5e1' : '#f8fafc'} />
            <stop offset="72%" stopColor={isDark ? '#475569' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#475569'} />
          </linearGradient>

          {/* Horizontal cylindrical shading (top-to-bottom across shaft & rotor diameter) */}
          <linearGradient id="mbShaftHorizGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#334155' : '#64748b'} />
            <stop offset="22%" stopColor={isDark ? '#94a3b8' : '#e2e8f0'} />
            <stop offset="38%" stopColor={isDark ? '#e2e8f0' : '#ffffff'} />
            <stop offset="70%" stopColor={isDark ? '#475569' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#475569'} />
          </linearGradient>

          <linearGradient id="mbBoltFinishGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#64748b'} />
            <stop offset="26%" stopColor={isDark ? '#94a3b8' : '#cbd5e1'} />
            <stop offset="46%" stopColor={isDark ? '#e2e8f0' : '#f8fafc'} />
            <stop offset="75%" stopColor={isDark ? '#64748b' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#475569'} />
          </linearGradient>

          <linearGradient id="mbMotorBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#64748b'} />
            <stop offset="35%" stopColor={isDark ? '#334155' : '#475569'} />
            <stop offset="80%" stopColor={isDark ? '#1e293b' : '#334155'} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#1e293b'} />
          </linearGradient>

          <linearGradient id="mbCopperGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="40%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          <linearGradient id="mbBusbarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="mbNameplateGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isDark ? '#1e293b' : '#f8fafc'} />
            <stop offset="50%" stopColor={isDark ? '#0f172a' : '#e2e8f0'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#f1f5f9'} />
          </linearGradient>

          {/* Clip paths for crisp realistic shaft, rotor & cooling fan rotation */}
          <clipPath id="mbDeShaftClip">
            <rect x="44" y="173" width="86" height="22" rx="1.5" />
          </clipPath>
          <clipPath id="mbIntShaftClip">
            <rect x="130" y="175" width="268" height="18" />
          </clipPath>
          <clipPath id="mbRotorClip">
            <rect x="192" y="142" width="130" height="33" />
          </clipPath>
          <clipPath id="mbFanClip">
            <rect x="398" y="122" width="14" height="48" rx="2" />
          </clipPath>

          <marker id="mbDimArrowEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 9 5 L 0 8.5 L 2.5 5 z" fill={c.dim} />
          </marker>
        </defs>

        {/* Sheet Background */}
        <rect width="920" height="500" fill={c.canvasBg} rx="18" />
        <rect width="920" height="500" fill="url(#mbGridMajor)" rx="18" />

        {/* TOP HEADER BAR (y: 12..42) */}
        <g transform="translate(16, 12)">
          <rect x="0" y="0" width="320" height="30" rx="15" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1.2" />
          <circle cx="16" cy="15" r="5" fill={c.cyan} />
          <text x="30" y="19" fill={c.textMain} fontSize="11.5" fontWeight="800" letterSpacing="0.4" fontFamily="var(--font-sans)">
            {pick('CAD CUTAWAY: 3-PHASE TEFC MOTOR', 'POTONGAN CAD: MOTOR INDUKSI 3-FASA', 'CAD構造図：三相全閉外扇形電動機')}
          </text>
        </g>

        <g transform="translate(348, 12)">
          <rect x="0" y="0" width="192" height="30" rx="15" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1.2" />
          <text x="96" y="19" fill={c.cyan} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
            {poles}P • {frequency}Hz • {motorCalc.ratedRpm} RPM
          </text>
        </g>

        {/* LEFT CAD VIEWPORT FRAME */}
        <rect x="16" y="50" width="524" height="438" rx="16" fill="none" stroke={c.cardBorder} strokeWidth="1.2" />

        {/* TOP HALF (y: 52..298): TEFC MOTOR HALF-CUTAWAY CAD */}
        <g id="motorCutaway">
          <line x1="28" y1="184" x2="465" y2="184" stroke={c.dim} strokeWidth="1" strokeDasharray="12 4 2 4" strokeOpacity="0.6" />

          {/* LIFTING EYEBOLT */}
          <g id="eyebolt" transform="translate(310, 82)">
            <rect x="-5" y="18" width="10" height="8" fill="url(#mbCylSteelGrad)" stroke={c.steelEdge} strokeWidth="1.2" />
            <circle cx="0" cy="10" r="9.5" fill="none" stroke={c.steelEdge} strokeWidth="4.2" />
            <circle cx="0" cy="10" r="9.5" fill="none" stroke={c.steelLight} strokeWidth="1.8" />
          </g>

          {/* STATOR HOUSING SHELL */}
          <rect x="148" y="184" width="218" height="78" rx="3" fill="url(#mbMotorBodyGrad)" stroke={c.steelEdge} strokeWidth="1.8" />
          {[192, 206, 220, 234, 248].map((fy, i) => (
            <rect
              key={i}
              x="146"
              y={fy}
              width="222"
              height="6"
              rx="1"
              fill={isDark ? '#475569' : '#94a3b8'}
              stroke={c.steelDark}
              strokeWidth="0.9"
            />
          ))}

          {/* Upper Cutaway Half */}
          <rect x="148" y="106" width="218" height="78" fill={c.cardSubBg} stroke={c.steelEdge} strokeWidth="1.8" />
          <rect x="148" y="106" width="218" height="11" fill={c.steelMid} fillOpacity="0.25" stroke={c.steelEdge} strokeWidth="1.2" />
          <rect x="148" y="106" width="218" height="11" fill="url(#mbHatchStator)" />

          {/* Laminated Silicon-Steel Stator Core */}
          <rect x="192" y="117" width="130" height="22" fill={isDark ? '#334155' : '#94a3b8'} stroke={c.steelEdge} strokeWidth="1.2" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1={196 + i * 5.2} y1="117" x2={196 + i * 5.2} y2="139" stroke={c.steelDark} strokeWidth="0.7" />
          ))}

          {/* Copper End-Windings */}
          <path d="M 164 138 C 164 118, 192 118, 192 138 Z" fill="url(#mbCopperGrad)" stroke="#7c2d12" strokeWidth="1.3" />
          <path d="M 322 138 C 322 118, 350 118, 350 138 Z" fill="url(#mbCopperGrad)" stroke="#7c2d12" strokeWidth="1.3" />
          {[172, 178, 184, 330, 336, 342].map((wx, i) => (
            <line key={i} x1={wx} y1="124" x2={wx} y2="138" stroke="#fed7aa" strokeWidth="0.9" strokeOpacity="0.65" />
          ))}

          {/* Air-gap */}
          <rect x="192" y="139" width="130" height="3" fill={c.canvasBg} />

          {/* Squirrel-Cage Rotor Core + Animated Longitudinal Bars */}
          <rect x="192" y="142" width="130" height="33" fill="url(#mbShaftHorizGrad)" stroke={c.steelEdge} strokeWidth="1.3" />
          <g clipPath="url(#mbRotorClip)">
            {Array.from({ length: ROTOR_BAR_COUNT }).map((_, i) => (
              <line
                key={i}
                ref={(el) => {
                  rotorBarRefs.current[i] = el;
                }}
                x1="194"
                y1="150"
                x2="320"
                y2="155"
                stroke="#fb923c"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0"
              />
            ))}
          </g>
          <rect x="184" y="140" width="8" height="37" rx="1" fill={c.steelLight} stroke={c.steelEdge} strokeWidth="1" />
          <rect x="322" y="140" width="8" height="37" rx="1" fill={c.steelLight} stroke={c.steelEdge} strokeWidth="1" />

          {/* DE & NDE End-Shields */}
          <path d="M 134 110 L 148 110 L 148 258 L 134 258 L 130 220 L 130 148 Z" fill="url(#mbMotorBodyGrad)" stroke={c.steelEdge} strokeWidth="1.6" />
          <path d="M 366 110 L 380 110 L 384 148 L 384 220 L 380 258 L 366 258 Z" fill="url(#mbMotorBodyGrad)" stroke={c.steelEdge} strokeWidth="1.6" />

          {/* DE & NDE Ball Bearings */}
          {[136, 366].map((bx, idx) => (
            <g key={idx}>
              <rect x={bx} y="158" width="12" height="17" fill={c.steelLight} stroke={c.steelEdge} strokeWidth="1.1" />
              <circle cx={bx + 6} cy="166.5" r="4.2" fill="#e2e8f0" stroke={c.steelDark} strokeWidth="1" />
              <circle cx={bx + 4.8} cy="165" r="1.2" fill="#ffffff" />
            </g>
          ))}

          {/* NDE FAN COWL, ANIMATED COOLING FAN BLADES & AIRFLOW STREAKS */}
          <g id="fanCowl">
            <path d="M 380 184 L 436 184 L 448 196 L 448 250 L 432 264 L 380 264 Z" fill="url(#mbMotorBodyGrad)" stroke={c.steelEdge} strokeWidth="1.8" />
            <path d="M 380 104 L 432 104 L 448 118 L 448 184 L 380 184 Z" fill={c.cardSubBg} stroke={c.steelEdge} strokeWidth="1.8" />
            {[122, 134, 146, 158, 170, 198, 210, 222, 234, 246].map((ly, i) => (
              <line key={i} x1="435" y1={ly} x2="446" y2={ly} stroke={c.steelLight} strokeWidth="2" />
            ))}
            <rect x="394" y="170" width="22" height="14" rx="2" fill={c.steelMid} stroke={c.steelEdge} strokeWidth="1.2" />
            <rect x="398" y="122" width="14" height="48" rx="2" fill={isDark ? '#334155' : '#94a3b8'} stroke={c.steelEdge} strokeWidth="1.3" />
            {/* Moving radial fan blades inside fan clip */}
            <g clipPath="url(#mbFanClip)">
              {Array.from({ length: FAN_BLADE_COUNT }).map((_, i) => (
                <rect
                  key={i}
                  ref={(el) => {
                    fanBladeRefs.current[i] = el;
                  }}
                  x="399"
                  y="140"
                  width="12"
                  height="4"
                  rx="1"
                  fill={isDark ? '#cbd5e1' : '#f8fafc'}
                  stroke={c.steelDark}
                  strokeWidth="0.6"
                  opacity="0"
                />
              ))}
            </g>
            {/* Subtle TEFC Cooling Airflow Streaks */}
            {[128, 148, 206, 232].map((ay, i) => (
              <line
                key={i}
                ref={(el) => {
                  airflowRefs.current[i] = el;
                }}
                x1="468"
                y1={ay}
                x2="450"
                y2={ay}
                stroke={c.cyan}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0"
              />
            ))}
            <text x="415" y="96" fill={c.cyan} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-sans)">
              TEFC AIRFLOW
            </text>
          </g>

          {/* SHAFT & ROTATING KEYWAY + CYLINDRICAL MACHINING BANDS */}
          <g id="motorShaft">
            {/* Internal shaft body */}
            <rect x="130" y="175" width="268" height="18" fill="url(#mbShaftHorizGrad)" stroke={c.steelEdge} strokeWidth="1.4" />
            <g clipPath="url(#mbIntShaftClip)">
              {Array.from({ length: SHAFT_BAND_COUNT }).map((_, i) => (
                <rect
                  key={i}
                  ref={(el) => {
                    intShaftBandRefs.current[i] = el;
                  }}
                  x="130"
                  y="181"
                  width="268"
                  height="2"
                  fill={isDark ? '#f8fafc' : '#334155'}
                  opacity="0"
                />
              ))}
            </g>
            {/* DE Output Shaft body */}
            <rect x="44" y="173" width="86" height="22" rx="1.5" fill="url(#mbShaftHorizGrad)" stroke={c.steelEdge} strokeWidth="1.8" />

            {/* Moving cylindrical specular / machining streaks inside shaft clip */}
            <g clipPath="url(#mbDeShaftClip)">
              {Array.from({ length: SHAFT_BAND_COUNT }).map((_, i) => (
                <rect
                  key={i}
                  ref={(el) => {
                    shaftBandRefs.current[i] = el;
                  }}
                  x="44"
                  y="180"
                  width="86"
                  height="2"
                  fill={isDark ? '#f8fafc' : '#334155'}
                  opacity="0"
                />
              ))}

              {/* Keyway Pocket & Fitted Parallel Key orbiting on front surface */}
              <rect
                ref={keySlotRef}
                x="53"
                y="174"
                width="50"
                height="6.5"
                rx="1.2"
                fill={c.steelDark}
                opacity="0.75"
              />
              <rect
                ref={keyBodyRef}
                x="54"
                y="174.5"
                width="48"
                height="5"
                rx="1"
                fill="#e2e8f0"
                stroke={c.steelDark}
                strokeWidth="0.9"
                opacity="1"
              />
              <rect
                ref={keyHighlightRef}
                x="55"
                y="175.2"
                width="46"
                height="1.5"
                rx="0.5"
                fill="#ffffff"
                opacity="0.85"
              />
            </g>

            {/* Shaft chamfer & shoulder lines */}
            <line x1="48" y1="173" x2="48" y2="195" stroke={c.steelEdge} strokeWidth="1" strokeOpacity="0.6" />
            <line x1="126" y1="173" x2="126" y2="195" stroke={c.steelEdge} strokeWidth="1.4" />

            {/* Clean RPM Speed Badge (shown when running, no circular ring!) */}
            {isMotorSpinning && (
              <g>
                <rect x="34" y="138" width="84" height="20" rx="10" fill={c.emerald} />
                <text x="76" y="151.5" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="var(--font-mono)">
                  {motorCalc.ratedRpm} RPM
                </text>
              </g>
            )}
          </g>

          {/* MOUNTING TYPES */}
          {mounting === 'B3' && (
            <g id="b3Mount">
              <path d="M 154 262 L 142 292 L 194 292 L 184 262 Z" fill="url(#mbMotorBodyGrad)" stroke={c.steelEdge} strokeWidth="1.5" />
              <path d="M 326 262 L 316 292 L 368 292 L 356 262 Z" fill="url(#mbMotorBodyGrad)" stroke={c.steelEdge} strokeWidth="1.5" />
              <rect x="163" y="280" width="10" height="12" fill="url(#mbBoltFinishGrad)" stroke={c.steelEdge} strokeWidth="1" />
              <rect x="337" y="280" width="10" height="12" fill="url(#mbBoltFinishGrad)" stroke={c.steelEdge} strokeWidth="1" />
              <rect x="115" y="292" width="285" height="8" rx="1.5" fill={c.steelMid} fillOpacity="0.45" stroke={c.steelEdge} strokeWidth="1.2" />
              <rect x="218" y="276" width="76" height="16" rx="8" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="0.9" />
              <text x="256" y="287" fill={c.cyan} fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                B3 FOOT
              </text>
            </g>
          )}

          {mounting === 'B5' && (
            <g id="b5Mount">
              <rect x="114" y="88" width="16" height="192" rx="2.5" fill="url(#mbCylSteelGrad)" stroke={c.steelEdge} strokeWidth="1.8" />
              <circle cx="122" cy="104" r="4.5" fill={c.canvasBg} stroke={c.steelEdge} strokeWidth="1.3" />
              <circle cx="122" cy="264" r="4.5" fill={c.canvasBg} stroke={c.steelEdge} strokeWidth="1.3" />
              <rect x="34" y="88" width="74" height="20" rx="10" fill={c.cardBg} stroke={c.cyan} strokeWidth="1" />
              <text x="71" y="101.5" fill={c.cyan} fontSize="9.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                B5 FLANGE
              </text>
            </g>
          )}

          {mounting === 'B14' && (
            <g id="b14Mount">
              <rect x="122" y="114" width="10" height="140" rx="2" fill="url(#mbCylSteelGrad)" stroke={c.steelEdge} strokeWidth="1.6" />
              <rect x="122" y="126" width="7" height="6" fill={c.steelDark} stroke={c.amber} strokeWidth="1" />
              <rect x="122" y="236" width="7" height="6" fill={c.steelDark} stroke={c.amber} strokeWidth="1" />
              <rect x="34" y="100" width="78" height="20" rx="10" fill={c.cardBg} stroke={c.amber} strokeWidth="1" />
              <text x="73" y="113.5" fill={c.amber} fontSize="9.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                B14 FACE
              </text>
            </g>
          )}

          {/* TOP TERMINAL BOX HOUSING */}
          <g id="motorTerminalHousing">
            <rect x="195" y="76" width="66" height="30" rx="3" fill="url(#mbMotorBodyGrad)" stroke={c.steelEdge} strokeWidth="1.6" />
            <rect x="192" y="72" width="72" height="6" rx="2" fill={c.steelLight} stroke={c.steelEdge} strokeWidth="1.2" />
            <rect x="261" y="85" width="13" height="13" rx="1.5" fill="url(#mbBusbarGrad)" stroke={c.steelDark} strokeWidth="1.1" />
            <text x="228" y="95" fill="#ffffff" fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
              T-BOX
            </text>
            <path d="M 274 91 L 478 91 L 478 308 L 285 308" fill="none" stroke={c.dim} strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#mbDimArrowEnd)" />
          </g>
        </g>

        {/* BOTTOM HALF: ENLARGED 6-STUD TERMINAL BLOCK & WIRING INSET */}
        <g id="enlargedTerminalBlock" transform="translate(26, 312)">
          <rect x="0" y="0" width="504" height="168" rx="14" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1.3" />

          <text x="14" y="18" fill={c.textMuted} fontSize="9.5" fontWeight="800" letterSpacing="0.5" fontFamily="var(--font-sans)">
            {pick('TERMINAL BLOCK DETAIL (6-STUD IEC)', 'DETAIL BLOK TERMINAL (6-BAUT IEC)', '端子台拡大図（6端子 IEC配列）')}
          </text>
          <rect x="330" y="6" width="162" height="20" rx="10" fill={terminalConnection === 'star' ? c.cyanBg : c.amberBg} stroke={terminalConnection === 'star' ? c.cyan : c.amber} strokeWidth="1" />
          <text x="411" y="19.5" fill={terminalConnection === 'star' ? c.onCyanBg : c.amber} fontSize="9.5" fontWeight="900" textAnchor="middle" fontFamily="var(--font-mono)">
            {terminalConnection === 'star' ? 'STAR (Y) — 400V' : 'DELTA (Δ) — 230V'}
          </text>

          {/* Phenolic Resin Terminal Block */}
          <rect x="20" y="30" width="230" height="106" rx="6" fill={c.phenolic} stroke={c.steelEdge} strokeWidth="1.5" />
          <rect x="92" y="34" width="5" height="98" rx="1" fill={c.phenolicRib} />
          <rect x="171" y="34" width="5" height="98" rx="1" fill={c.phenolicRib} />

          {terminalConnection === 'star' && (
            <g id="starBusbar">
              <rect x="44" y="54" width="182" height="14" rx="4" fill="url(#mbBusbarGrad)" stroke="#92400e" strokeWidth="1.5" />
              <text x="135" y="47" fill="#fde047" fontSize="8" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                NEUTRAL STAR POINT (W2–U2–V2)
              </text>
            </g>
          )}

          {terminalConnection === 'delta' && (
            <g id="deltaBusbars">
              <rect x="50" y="53" width="14" height="58" rx="4" fill="url(#mbBusbarGrad)" stroke="#92400e" strokeWidth="1.5" />
              <rect x="128" y="53" width="14" height="58" rx="4" fill="url(#mbBusbarGrad)" stroke="#92400e" strokeWidth="1.5" />
              <rect x="206" y="53" width="14" height="58" rx="4" fill="url(#mbBusbarGrad)" stroke="#92400e" strokeWidth="1.5" />
            </g>
          )}

          {[
            { labelTop: 'W2', labelBot: 'U1', x: 57, line: 'L1', lineCol: c.rose },
            { labelTop: 'U2', labelBot: 'V1', x: 135, line: 'L2', lineCol: c.amber },
            { labelTop: 'V2', labelBot: 'W1', x: 213, line: 'L3', lineCol: c.blue },
          ].map((col, idx) => (
            <g key={idx}>
              <circle cx={col.x} cy="61" r="8.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
              <polygon
                points={`${col.x},54 ${col.x + 6},57.5 ${col.x + 6},64.5 ${col.x},68 ${col.x - 6},64.5 ${col.x - 6},57.5`}
                fill="#fde047"
                stroke="#92400e"
                strokeWidth="1"
              />
              <circle cx={col.x} cy="61" r="2.5" fill="#92400e" />
              <text x={col.x} y="48" fill="#e2e8f0" fontSize="9.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                {col.labelTop}
              </text>

              <circle cx={col.x} cy="103" r="8.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
              <polygon
                points={`${col.x},96 ${col.x + 6},99.5 ${col.x + 6},106.5 ${col.x},110 ${col.x - 6},106.5 ${col.x - 6},99.5`}
                fill="#fde047"
                stroke="#92400e"
                strokeWidth="1"
              />
              <circle cx={col.x} cy="103" r="2.5" fill="#92400e" />
              <text x={col.x} y="127" fill="#e2e8f0" fontSize="9.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                {col.labelBot}
              </text>

              <line x1={col.x} y1="136" x2={col.x} y2="146" stroke={col.lineCol} strokeWidth="3.5" />
              <rect x={col.x - 14} y="143" width="28" height="17" rx="8.5" fill={col.lineCol} />
              <text x={col.x} y="155" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="var(--font-mono)">
                {col.line}
              </text>
            </g>
          ))}

          {/* Right Side Schematic + Physics Summary */}
          <g transform="translate(268, 34)">
            <rect x="0" y="0" width="224" height="122" rx="12" fill={c.cardSubBg} stroke={c.cardBorder} strokeWidth="1" />

            {terminalConnection === 'star' ? (
              <g transform="translate(46, 52)">
                <line x1="0" y1="-34" x2="0" y2="0" stroke={c.cyan} strokeWidth="2.5" />
                <line x1="-30" y1="22" x2="0" y2="0" stroke={c.cyan} strokeWidth="2.5" />
                <line x1="30" y1="22" x2="0" y2="0" stroke={c.cyan} strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4.5" fill={c.amber} />
                <text x="0" y="-39" fill={c.textMain} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">L1 (U1)</text>
                <text x="-30" y="34" fill={c.textMain} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">L2 (V1)</text>
                <text x="30" y="34" fill={c.textMain} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">L3 (W1)</text>
              </g>
            ) : (
              <g transform="translate(46, 54)">
                <polygon points="0,-32 -30,22 30,22" fill="none" stroke={c.amber} strokeWidth="2.5" strokeLinejoin="round" />
                <circle cx="0" cy="-32" r="3.5" fill={c.rose} />
                <circle cx="-30" cy="22" r="3.5" fill={c.amber} />
                <circle cx="30" cy="22" r="3.5" fill={c.blue} />
                <text x="0" y="-39" fill={c.textMain} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">L1</text>
                <text x="-33" y="34" fill={c.textMain} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">L2</text>
                <text x="33" y="34" fill={c.textMain} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">L3</text>
              </g>
            )}

            <g transform="translate(96, 18)">
              <text x="0" y="0" fill={terminalConnection === 'star' ? c.cyan : c.amber} fontSize="10" fontWeight="800" fontFamily="var(--font-mono)">
                {terminalConnection === 'star' ? 'V_phase = V_line / √3' : 'V_phase = V_line'}
              </text>
              <text x="0" y="18" fill={c.textMain} fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">
                {terminalConnection === 'star' ? 'Coil: 230 V (on 400V)' : 'Coil: 400 V (Full Line)'}
              </text>
              <line x1="0" y1="28" x2="116" y2="28" stroke={c.cardBorder} strokeWidth="0.8" />
              <text x="0" y="44" fill={c.textMuted} fontSize="9" fontFamily="var(--font-sans)">
                {terminalConnection === 'star'
                  ? pick('Start current: Low (~1/3)', 'Arus start: Rendah (~1/3)', '始動電流：低（約1/3）')
                  : pick('Start current: Full (6–8×)', 'Arus start: Penuh (6–8×)', '始動電流：定格の6〜8倍')}
              </text>
              <text x="0" y="60" fill={c.textMuted} fontSize="9" fontFamily="var(--font-sans)">
                {terminalConnection === 'star'
                  ? pick('Torque: 1/3 of Delta', 'Torsi: 1/3 dari Delta', '始動トルク：デルタの1/3')
                  : pick('Torque: 100% Rated', 'Torsi: 100% Penuh', 'トルク：定格100%発揮')}
              </text>
              <text x="0" y="80" fill={c.emerald} fontSize="8.5" fontWeight="700" fontFamily="var(--font-sans)">
                {terminalConnection === 'star'
                  ? pick('Link: W2–U2–V2 horiz.', 'Jumper: W2–U2–V2 horiz.', '短絡：上段水平バー')
                  : pick('Links: 3 vertical bars', 'Jumper: 3 plat vertikal', '短絡：3本垂直バー')}
              </text>
            </g>
          </g>
        </g>

        {/* RIGHT SIDE: INDUSTRIAL METALLIC MOTOR NAMEPLATE & CONTROLS */}
        <g id="motorNameplatePanel" transform="translate(556, 12)">
          <rect x="0" y="0" width="348" height="422" rx="16" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1.6" />
          <rect x="10" y="10" width="328" height="402" rx="10" fill="none" stroke={c.cardBorder} strokeWidth="1" />

          {[
            [16, 16],
            [332, 16],
            [16, 406],
            [332, 406],
          ].map(([rx, ry], idx) => (
            <g key={idx}>
              <circle cx={rx} cy={ry} r="4.2" fill={c.steelLight} stroke={c.steelDark} strokeWidth="1" />
              <line x1={rx - 2.5} y1={ry - 2.5} x2={rx + 2.5} y2={ry + 2.5} stroke={c.steelDark} strokeWidth="0.9" />
            </g>
          ))}

          <g transform="translate(24, 34)">
            <text x="150" y="0" fill={c.textMain} fontSize="12.5" fontWeight="900" letterSpacing="0.8" textAnchor="middle" fontFamily="var(--font-sans)">
              MECH-LAB INDUSTRIAL MOTORS
            </text>
            <text x="150" y="14" fill={c.textMuted} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
              IEC 60034-1 • CE • EFFICIENCY CLASS IE3
            </text>
            <line x1="0" y1="22" x2="300" y2="22" stroke={c.cardBorder} strokeWidth="1.4" />
          </g>

          <g transform="translate(24, 76)">
            <text x="0" y="0" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">TYPE:</text>
            <text x="38" y="0" fill={c.textMain} fontSize="11" fontWeight="800" fontFamily="var(--font-sans)">{motorShortName}</text>
            <text x="208" y="0" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">MOUNT:</text>
            <text x="255" y="0" fill={c.cyan} fontSize="11.5" fontWeight="900" fontFamily="var(--font-mono)">{mountSpec.code}</text>

            <line x1="0" y1="10" x2="300" y2="10" stroke={c.cardBorder} strokeWidth="0.7" />

            <text x="0" y="28" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">POWER:</text>
            <text x="48" y="28" fill={c.emerald} fontSize="12.5" fontWeight="900" fontFamily="var(--font-mono)">
              4.0 kW <tspan fill={c.textMuted} fontSize="10" fontWeight="600">({motorCalc.ratedTorqueNm.toFixed(1)} N·m)</tspan>
            </text>
            <text x="208" y="28" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">EFF:</text>
            <text x="236" y="28" fill={c.emerald} fontSize="10.5" fontWeight="800" fontFamily="var(--font-mono)">89.2% (IE3)</text>

            <line x1="0" y1="38" x2="300" y2="38" stroke={c.cardBorder} strokeWidth="0.7" />

            <text x="0" y="56" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">POLES:</text>
            <text x="42" y="56" fill={c.textMain} fontSize="11" fontWeight="800" fontFamily="var(--font-mono)">{poles}P</text>

            <text x="92" y="56" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">FREQ:</text>
            <text x="128" y="56" fill={c.textMain} fontSize="11" fontWeight="800" fontFamily="var(--font-mono)">{frequency} Hz</text>

            <text x="195" y="56" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">RPM:</text>
            <text x="228" y="56" fill={c.textMain} fontSize="12" fontWeight="900" fontFamily="var(--font-mono)">{motorCalc.ratedRpm}</text>

            <text x="0" y="72" fill={c.textMuted} fontSize="9" fontFamily="var(--font-mono)">
              Sync Ns = {motorCalc.syncRpm} RPM • Slip = {motorCalc.slipPct.toFixed(1)}% • ω = {motorCalc.omegaRadS.toFixed(0)} rad/s
            </text>

            {/* Dual Voltage Box */}
            <g transform="translate(0, 86)">
              <rect x="0" y="0" width="300" height="62" rx="10" fill={c.cardSubBg} stroke={c.cardBorder} strokeWidth="1" />
              <rect
                x="4"
                y="4"
                width="292"
                height="25"
                rx="7"
                fill={terminalConnection === 'delta' ? c.amberBg : 'transparent'}
                stroke={terminalConnection === 'delta' ? c.amber : 'transparent'}
                strokeWidth="1"
              />
              <text x="12" y="21" fill={terminalConnection === 'delta' ? c.amber : c.textMain} fontSize="11" fontWeight="800" fontFamily="var(--font-mono)">
                Δ (Delta) 230 V
              </text>
              <text x="135" y="21" fill={c.textMain} fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)">14.5 A</text>
              <text x="205" y="21" fill={c.textMuted} fontSize="9.5" fontFamily="var(--font-mono)">cos φ 0.84</text>

              <rect
                x="4"
                y="33"
                width="292"
                height="25"
                rx="7"
                fill={terminalConnection === 'star' ? c.cyanBg : 'transparent'}
                stroke={terminalConnection === 'star' ? c.cyan : 'transparent'}
                strokeWidth="1"
              />
              <text x="12" y="50" fill={terminalConnection === 'star' ? c.onCyanBg : c.textMain} fontSize="11" fontWeight="800" fontFamily="var(--font-mono)">
                Y (Star) 400 V
              </text>
              <text x="135" y="50" fill={terminalConnection === 'star' ? c.onCyanBg : c.textMain} fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)">8.4 A</text>
              <text x="205" y="50" fill={terminalConnection === 'star' ? c.onCyanBg : c.textMuted} fontSize="9.5" fontFamily="var(--font-mono)">cos φ 0.84</text>
            </g>

            {/* IP Rating */}
            <g transform="translate(0, 166)">
              <text x="0" y="0" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">IP CODE:</text>
              <text x="50" y="0" fill={c.cyan} fontSize="12" fontWeight="900" fontFamily="var(--font-mono)">{ipRating}</text>

              <text x="108" y="0" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">INSUL:</text>
              <text x="145" y="0" fill={c.textMain} fontSize="10.5" fontWeight="800" fontFamily="var(--font-sans)">Class F</text>

              <text x="210" y="0" fill={c.textMuted} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)">DUTY:</text>
              <text x="245" y="0" fill={c.textMain} fontSize="10.5" fontWeight="800" fontFamily="var(--font-sans)">S1 Cont.</text>

              <text x="0" y="17" fill={c.textMuted} fontSize="9" fontFamily="var(--font-sans)">
                {ipSpec.dustProtection.split(':')[0]} • {ipSpec.waterProtection.split(':')[0]}
              </text>
            </g>

            {/* Active Terminal Rule Box */}
            <g transform="translate(0, 200)">
              <rect
                x="0"
                y="0"
                width="300"
                height="112"
                rx="12"
                fill={terminalConnection === 'star' ? c.cyanBg : c.amberBg}
                stroke={terminalConnection === 'star' ? c.cyan : c.amber}
                strokeWidth="1.2"
              />
              <text x="12" y="20" fill={terminalConnection === 'star' ? c.onCyanBg : c.amber} fontSize="10.5" fontWeight="900" fontFamily="var(--font-sans)">
                {terminalConnection === 'star'
                  ? pick('Y — STAR (WYE) CONNECTION', 'Y — SAMBUNGAN BINTANG (STAR)', 'Y — スター（Y）結線')
                  : pick('Δ — DELTA CONNECTION', 'Δ — SAMBUNGAN SEGITIGA (DELTA)', 'Δ — デルタ（Δ）結線')}
              </text>
              <text x="12" y="40" fill={terminalConnection === 'star' ? c.onCyanBg : c.textMain} fontSize="9.5" fontWeight="700" fontFamily="var(--font-sans)">
                {terminalConnection === 'star'
                  ? pick('• Jumper: Horizontal bar across W2–U2–V2', '• Jumper: Plat horizontal di W2–U2–V2', '• 短絡金具：W2–U2–V2 を水平に1枚接続')
                  : pick('• Jumpers: 3 vertical bars (U1–W2, V1–U2, W1–V2)', '• Jumper: 3 plat vertikal (U1–W2, V1–U2, W1–V2)', '• 短絡金具：U1–W2, V1–U2, W1–V2 を垂直3枚')}
              </text>
              <text x="12" y="58" fill={terminalConnection === 'star' ? c.onCyanBg : c.textMain} fontSize="9.5" fontFamily="var(--font-sans)">
                {terminalConnection === 'star'
                  ? pick('• Coil Voltage: V_line / √3 (230V on 400V grid)', '• Tegangan Kumparan: V_line / √3 (230V di 400V)', '• 巻線電圧：V_線間 / √3（400V電源で230V）')
                  : pick('• Coil Voltage: Full V_line across each phase', '• Tegangan Kumparan: V_line penuh di tiap fasa', '• 巻線電圧：各相巻線に線間電圧が直接印加')}
              </text>
              <line x1="12" y1="70" x2="288" y2="70" stroke={c.cardBorder} strokeWidth="0.8" />
              <text x="12" y="88" fill={terminalConnection === 'star' ? c.onCyanBg : c.textMuted} fontSize="9" fontFamily="var(--font-sans)" opacity={terminalConnection === 'star' ? 0.85 : 1}>
                {terminalConnection === 'star'
                  ? pick('Use on 400V supply for 230/400V rated motors', 'Wajib di jala 400V untuk motor rating 230/400V', '230/400V定格モーターを400V電源で運転時')
                  : pick('Use on 230V VFD or 400V for 400/690V motors', 'Untuk inverter 230V atau motor 400/690V di 400V', '230Vインバータ、または400/690V機の400V運転')}
              </text>
              <text x="12" y="102" fill={terminalConnection === 'star' ? c.onCyanBg : c.emerald} fontSize="8.8" fontWeight="700" fontFamily="var(--font-sans)">
                {mountSpec.code}: {mountSpec.bestFit.slice(0, 44)}
              </text>
            </g>
          </g>

          {/* Interactive SVG Buttons below Nameplate */}
          <g transform="translate(0, 434)">
            <g className="cursor-pointer" onClick={onToggleSpin} role="button" tabIndex={0}>
              <rect x="0" y="0" width="166" height="36" rx="18" fill={isMotorSpinning ? c.rose : c.emerald} />
              <text x="83" y="22" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-sans)">
                {isMotorSpinning
                  ? pick('■ STOP MOTOR', '■ STOP MOTOR', '■ 停止する')
                  : pick('▶ RUN MOTOR', '▶ PUTAR MOTOR', '▶ 運転開始')}
              </text>
            </g>

            <g transform="translate(176, 0)" className="cursor-pointer" onClick={onToggleConnection} role="button" tabIndex={0}>
              <rect
                x="0"
                y="0"
                width="172"
                height="36"
                rx="18"
                fill={c.cardSubBg}
                stroke={terminalConnection === 'star' ? c.amber : c.cyan}
                strokeWidth="1.8"
              />
              <text
                x="86"
                y="22"
                fill={terminalConnection === 'star' ? c.amber : c.cyan}
                fontSize="10.5"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--font-sans)"
              >
                {terminalConnection === 'star'
                  ? pick('SWITCH TO DELTA (Δ)', 'GANTI KE DELTA (Δ)', 'デルタ（Δ）へ切替')
                  : pick('SWITCH TO STAR (Y)', 'GANTI KE STAR (Y)', 'スター（Y）へ切替')}
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
