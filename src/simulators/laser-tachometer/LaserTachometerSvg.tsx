import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  type InstrumentMode,
  type MotorDriveState,
  type StrobeAnalysis,
} from './laserTachometerPhysics';

interface LaserTachometerSvgProps {
  mode: InstrumentMode;
  drive: MotorDriveState;
  strobe: StrobeAnalysis;
  laserActive: boolean;
  isRunning: boolean;
  onAimChange?: (onTarget: boolean) => void;
}

interface StrobeFlashSample {
  angleDeg: number;
  timestampMs: number;
}

export function LaserTachometerSvg({
  mode,
  drive,
  strobe,
  laserActive,
  isRunning,
  onAimChange,
}: LaserTachometerSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [instPos, setInstPos] = useState<{ x: number; y: number }>({
    x: 210,
    y: 336,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const emitterX = instPos.x + 78;
  const emitterY = instPos.y - 6;
  const isLaserOnTarget = Math.abs(emitterX - 288) <= 18;
  const isStrobeOnTarget = Math.abs(emitterX - 288) <= 95;
  const isOnTarget = mode === 'laser' ? isLaserOnTarget : isStrobeOnTarget;

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    const pt = clientToSvg(e.clientX, e.clientY);
    if (!pt) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOffsetRef.current = {
      dx: pt.x - instPos.x,
      dy: pt.y - instPos.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDragging) return;
    const pt = clientToSvg(e.clientX, e.clientY);
    if (!pt) return;
    const nextX = Math.max(24, Math.min(320, pt.x - dragOffsetRef.current.dx));
    const nextY = Math.max(305, Math.min(348, pt.y - dragOffsetRef.current.dy));
    setInstPos({ x: nextX, y: nextY });
    const nextEmitterX = nextX + 78;
    const nextOnTarget =
      mode === 'laser'
        ? Math.abs(nextEmitterX - 288) <= 18
        : Math.abs(nextEmitterX - 288) <= 95;
    onAimChange?.(nextOnTarget);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    // Snap cleanly onto the reflective tape if close
    if (Math.abs(emitterX - 288) <= 14) {
      setInstPos((prev) => ({ ...prev, x: 210 }));
      onAimChange?.(true);
    }
  };

  const handleSnapToTape = () => {
    setInstPos({ x: 210, y: 336 });
    onAimChange?.(true);
  };

  const c = useMemo(
    () => ({
      bg: isDark ? '#07101e' : '#f1f5f9',
      panel: isDark ? '#0f172a' : '#ffffff',
      panelSub: isDark ? '#1e293b' : '#e2e8f0',
      border: isDark ? '#334155' : '#cbd5e1',
      textMain: isDark ? '#f8fafc' : '#0f172a',
      textMuted: isDark ? '#94a3b8' : '#475569',
      steelDark: isDark ? '#1e293b' : '#475569',
      steelMid: isDark ? '#334155' : '#64748b',
      steelLight: isDark ? '#64748b' : '#94a3b8',
      shaft: isDark ? '#cbd5e1' : '#94a3b8',
      motorBody: isDark ? '#0f294a' : '#1e3a8a',
      motorFin: isDark ? '#1e40af' : '#3b82f6',
      cyan: '#06b6d4',
      cyanSoft: isDark ? 'rgba(6, 182, 212, 0.16)' : 'rgba(6, 182, 212, 0.12)',
      red: '#ef4444',
      amber: '#f59e0b',
      emerald: '#10b981',
      tape: '#f8fafc',
      tapeGlow: '#38bdf8',
    }),
    [isDark]
  );

  // Refs for zero-rerender 60fps animation
  const sideShaftBandRef = useRef<SVGRectElement | null>(null);
  const sideTapeRef = useRef<SVGRectElement | null>(null);
  const laserSpotRef = useRef<SVGCircleElement | null>(null);
  const pulseLedRef = useRef<SVGCircleElement | null>(null);
  const pulseCountTextRef = useRef<SVGTextElement | null>(null);
  const strobeConeRef = useRef<SVGPolygonElement | null>(null);
  const strobeBulbRef = useRef<SVGCircleElement | null>(null);
  const discRealRef = useRef<SVGGElement | null>(null);
  const ghostRef0 = useRef<SVGGElement | null>(null);
  const ghostRef1 = useRef<SVGGElement | null>(null);
  const ghostRef2 = useRef<SVGGElement | null>(null);
  const ghostRef3 = useRef<SVGGElement | null>(null);

  const stateRef = useRef({
    mode,
    rotorRpm: drive.rotorRpm,
    strobeFpm: strobe.strobeFpm,
    laserActive,
    isRunning,
    isOnTarget,
  });

  useEffect(() => {
    stateRef.current = {
      mode,
      rotorRpm: drive.rotorRpm,
      strobeFpm: strobe.strobeFpm,
      laserActive,
      isRunning,
      isOnTarget,
    };
  }, [mode, drive.rotorRpm, strobe.strobeFpm, laserActive, isRunning, isOnTarget]);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let shaftAngleDeg = 0;
    let flashAccum = 0;
    let pulseCount = 0;
    let ledFlashMs = 0;
    let strobeFlashMs = 0;
    let prevMode: InstrumentMode = stateRef.current.mode;
    const flashHistory: StrobeFlashSample[] = [];
    const ghostRefs = [ghostRef0, ghostRef1, ghostRef2, ghostRef3];

    const tick = (now: number) => {
      const dtMs = Math.min(50, Math.max(0, now - lastTime));
      const dtSec = dtMs / 1000;
      lastTime = now;

      const s = stateRef.current;

      if (s.mode !== prevMode) {
        prevMode = s.mode;
        flashHistory.length = 0;
        flashAccum = 0;
      }

      if (s.isRunning) {
        const degPerSec = (s.rotorRpm / 60) * 360;
        const prevAngle = shaftAngleDeg;
        const deltaDeg = degPerSec * dtSec;
        shaftAngleDeg = (prevAngle + deltaDeg) % 360;

        // Exact revolution crossing count for retro-reflective tape at 0 deg
        if (s.mode === 'laser' && s.laserActive && s.isOnTarget) {
          const revs = Math.floor((prevAngle + deltaDeg) / 360);
          if (revs > 0) {
            pulseCount += revs;
            ledFlashMs = 65;
          }
        }
      }

      // Update side-view reflective tape & keyway band (3D cylindrical projection within shaft bounds y=202..228)
      const rad = (shaftAngleDeg * Math.PI) / 180;
      const sinVal = Math.sin(rad);
      const cosVal = Math.cos(rad);
      if (sideTapeRef.current) {
        const tapeY = 215 + sinVal * 13;
        const tapeH = Math.max(2, 8 * Math.max(0, cosVal));
        const tapeOpacity = cosVal > -0.15 ? 0.95 : 0.12;
        sideTapeRef.current.setAttribute('y', (tapeY - tapeH / 2).toFixed(1));
        sideTapeRef.current.setAttribute('height', tapeH.toFixed(1));
        sideTapeRef.current.setAttribute('opacity', tapeOpacity.toFixed(2));
      }
      if (sideShaftBandRef.current) {
        const bandY = 215 + sinVal * 9;
        sideShaftBandRef.current.setAttribute('y', (bandY - 2).toFixed(1));
        sideShaftBandRef.current.setAttribute('opacity', cosVal > 0 ? '0.55' : '0.12');
      }

      // Laser mode visuals
      if (s.mode === 'laser') {
        ledFlashMs = Math.max(0, ledFlashMs - dtMs);
        if (laserSpotRef.current) {
          const onTape = s.laserActive && s.isOnTarget && cosVal > 0.72;
          laserSpotRef.current.setAttribute(
            'r',
            onTape ? '6.5' : s.laserActive ? '3.5' : '0'
          );
          laserSpotRef.current.setAttribute(
            'opacity',
            s.laserActive ? (onTape ? '1' : '0.75') : '0'
          );
        }
        if (pulseLedRef.current) {
          pulseLedRef.current.setAttribute(
            'fill',
            ledFlashMs > 0 && s.laserActive && s.isOnTarget ? '#10b981' : '#334155'
          );
        }
        if (pulseCountTextRef.current) {
          pulseCountTextRef.current.textContent = String(pulseCount).padStart(
            5,
            '0'
          );
        }
        // Real disc rotates continuously in laser mode
        if (discRealRef.current) {
          discRealRef.current.setAttribute(
            'transform',
            `rotate(${shaftAngleDeg.toFixed(2)})`
          );
          discRealRef.current.setAttribute('opacity', '1');
        }
        for (const ref of ghostRefs) {
          if (ref.current) ref.current.setAttribute('opacity', '0');
        }
        if (strobeConeRef.current) {
          strobeConeRef.current.setAttribute('opacity', '0');
        }
        if (strobeBulbRef.current) {
          strobeBulbRef.current.setAttribute('opacity', '0.25');
        }
      } else {
        // Stroboscope mode: exact flash sampling + persistence of vision
        const flashesPerSec = s.strobeFpm / 60;
        if (s.isRunning && flashesPerSec > 0) {
          flashAccum += flashesPerSec * dtSec;
          const degPerSec = (s.rotorRpm / 60) * 360;
          const stepCount = Math.min(8, Math.floor(flashAccum));
          if (stepCount > 0) {
            for (let k = 1; k <= stepCount; k += 1) {
              const fracBack = (flashAccum - k) / flashesPerSec;
              const angleAtFlash =
                (((shaftAngleDeg - degPerSec * fracBack) % 360) + 360) % 360;
              flashHistory.unshift({
                angleDeg: angleAtFlash,
                timestampMs: now - fracBack * 1000,
              });
            }
            flashAccum -= stepCount;
            strobeFlashMs = 38;
          }
          // Keep persistence window (~85ms) up to 4 samples
          while (
            flashHistory.length > 4 ||
            (flashHistory.length > 1 &&
              now - flashHistory[flashHistory.length - 1].timestampMs > 85)
          ) {
            flashHistory.pop();
          }
        } else if (!s.isRunning && flashHistory.length === 0) {
          flashHistory.push({ angleDeg: shaftAngleDeg, timestampMs: now });
        }

        strobeFlashMs = Math.max(0, strobeFlashMs - dtMs);

        // Dim continuous disc in strobe mode so persistence ghosts dominate
        if (discRealRef.current) {
          discRealRef.current.setAttribute(
            'transform',
            `rotate(${shaftAngleDeg.toFixed(2)})`
          );
          discRealRef.current.setAttribute('opacity', '0.12');
        }

        for (let i = 0; i < ghostRefs.length; i += 1) {
          const el = ghostRefs[i].current;
          if (!el) continue;
          const sample = flashHistory[i];
          if (sample) {
            const age = Math.max(0, now - sample.timestampMs);
            const fade = Math.max(0.25, 1 - age / 110);
            el.setAttribute(
              'transform',
              `rotate(${sample.angleDeg.toFixed(2)})`
            );
            el.setAttribute('opacity', fade.toFixed(2));
          } else {
            el.setAttribute('opacity', '0');
          }
        }

        if (strobeConeRef.current) {
          strobeConeRef.current.setAttribute(
            'opacity',
            strobeFlashMs > 0 ? '0.32' : '0.07'
          );
        }
        if (strobeBulbRef.current) {
          strobeBulbRef.current.setAttribute(
            'opacity',
            strobeFlashMs > 0 ? '1' : '0.4'
          );
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const syncBadge = useMemo(() => {
    if (mode === 'laser') {
      if (!laserActive) {
        return {
          text: pick('LASER STANDBY', 'LASER SIAGA', 'レーザー待機'),
          color: c.textMuted,
        };
      }
      if (!isOnTarget) {
        return {
          text: pick('SIGNAL LOST · AIM AT TAPE', 'SINYAL HILANG · ARAHKAN KE PITA', '信号喪失 · テープに照準'),
          color: c.red,
        };
      }
      return {
        text: pick('LASER LOCKED · 1 PULSE/REV', 'LASER TERKUNCI · 1 PULSA/PUT', 'レーザーロック · 1パルス/回転'),
        color: c.emerald,
      };
    }
    if (!isOnTarget) {
      return {
        text: pick('OFF-TARGET · AIM STROBE AT ROTOR', 'MELENCENG · ARAHKAN STROBO', '照準外 · ロータに照射'),
        color: c.amber,
      };
    }
    switch (strobe.syncStatus) {
      case 'true-freeze':
        return {
          text: pick('1:1 TRUE FREEZE-FRAME', 'BEKU SEJATI 1:1', '1:1 完全静止 (同期)'),
          color: c.emerald,
        };
      case 'harmonic-multiple':
        return {
          text: `${strobe.harmonicOrder}× ${pick('HARMONIC DOUBLE-IMAGE', 'HARMONIK GANDA', '高調波マルチ像')}`,
          color: c.amber,
        };
      case 'sub-harmonic':
        return {
          text: `1/${strobe.subHarmonicDivisor}× ${pick('SUB-HARMONIC TRAP', 'JEBAKAN SUB-HARMONIK', '分数調波トラップ')}`,
          color: c.red,
        };
      case 'drift-forward':
        return {
          text: pick('ALIAS DRIFT: FORWARD (+)', 'GESER ALIAS: MAJU (+)', 'エイリアスドリフト: 正転 (+)'),
          color: c.cyan,
        };
      case 'drift-backward':
        return {
          text: pick('ALIAS DRIFT: BACKWARD (−)', 'GESER ALIAS: MUNDUR (−)', 'エイリアスドリフト: 逆転 (−)'),
          color: c.cyan,
        };
      default:
        return {
          text: pick('STROBE UNLOCKED (BLUR)', 'STROBO TIDAK SINKRON', 'ストロボ非同期 (ブレ)'),
          color: c.textMuted,
        };
    }
  }, [mode, laserActive, isOnTarget, strobe.syncStatus, strobe.harmonicOrder, strobe.subHarmonicDivisor, c, pick]);

  const renderFanRotor = (isGhost: boolean) => (
    <g>
      {/* 5 Fan Blades */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          d="M -7 -16 L -15 -78 Q 0 -86 15 -78 L 7 -16 Z"
          transform={`rotate(${deg})`}
          fill={isGhost ? c.cyan : c.steelMid}
          fillOpacity={isGhost ? 0.35 : 0.85}
          stroke={isGhost ? '#38bdf8' : c.border}
          strokeWidth={isGhost ? 1.5 : 1.2}
        />
      ))}
      {/* Central Hub */}
      <circle
        cx={0}
        cy={0}
        r={24}
        fill={isGhost ? '#0e7490' : c.steelDark}
        stroke={isGhost ? '#67e8f9' : c.shaft}
        strokeWidth={2}
      />
      {/* Shaft End & Keyway */}
      <circle
        cx={0}
        cy={0}
        r={10}
        fill={c.shaft}
        stroke={c.steelDark}
        strokeWidth={1.5}
      />
      <rect x={-2.5} y={-12} width={5} height={5} fill="#0f172a" />
      {/* Retro-Reflective Tape Strip at 12 o'clock (0 deg) */}
      <rect
        x={-6}
        y={-23}
        width={12}
        height={8}
        rx={1.5}
        fill="#ffffff"
        stroke="#06b6d4"
        strokeWidth={1.5}
      />
      <circle cx={0} cy={-19} r={2} fill="#38bdf8" />
    </g>
  );

  return (
    <div className="glass-panel rounded-2xl p-3 sm:p-4 shadow-xs">
      <svg
        ref={svgRef}
        viewBox="0 0 880 460"
        className="w-full h-auto max-h-[460px] select-none touch-none"
        role="img"
        aria-label={pick(
          'Laser Tachometer and Stroboscope Interactive CAD Diagram',
          'Diagram CAD Interaktif Takometer Laser dan Stroboskop',
          'レーザータコメータ・ストロボスコープ対話型CAD図'
        )}
      >
        <defs>
          <linearGradient id="motorBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#001f6b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="shaftGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="strobeConeGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.04" />
          </linearGradient>
          <filter id="laserGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect
          x={0}
          y={0}
          width={880}
          height={460}
          rx={16}
          fill={c.bg}
          stroke={c.border}
          strokeWidth={1}
        />

        {/* Subtle CAD Grid */}
        <g stroke={c.border} strokeOpacity={0.22} strokeWidth={0.75}>
          {[80, 160, 240, 320, 400].map((y) => (
            <line key={`hy-${y}`} x1={16} y1={y} x2={864} y2={y} />
          ))}
          {[110, 220, 330, 440, 550, 660, 770].map((x) => (
            <line key={`vx-${x}`} x1={x} y1={16} x2={x} y2={444} />
          ))}
        </g>

        {/* Top Header Strip */}
        <rect
          x={20}
          y={18}
          width={840}
          height={36}
          rx={8}
          fill={c.panel}
          stroke={c.border}
        />
        <text
          x={34}
          y={41}
          fill={c.textMain}
          fontSize={12.5}
          fontWeight={700}
          letterSpacing="0.04em"
        >
          {pick(
            'SIDE ELEVATION: VFD MOTOR – COUPLING – FAN',
            'TAMPAK SAMPING: MOTOR VFD – KOPLING – KIPAS',
            '側面図: VFDモータ – カップリング – ファン'
          )}
        </text>
        <rect
          x={520}
          y={24}
          width={328}
          height={24}
          rx={6}
          fill={c.panelSub}
        />
        <circle cx={536} cy={36} r={5} fill={syncBadge.color} />
        <text
          x={548}
          y={40}
          fill={syncBadge.color}
          fontSize={11}
          fontWeight={700}
          fontFamily="monospace"
        >
          {syncBadge.text}
        </text>

        {/* Machined Baseplate */}
        <rect
          x={36}
          y={278}
          width={420}
          height={18}
          rx={3}
          fill={c.steelDark}
          stroke={c.border}
        />

        {/* NDE Fan Cowl (Left of Motor) */}
        <path
          d="M 58 152 L 48 152 Q 40 152 40 164 L 40 250 Q 40 262 48 262 L 58 262 Z"
          fill={c.steelDark}
          stroke={c.border}
          strokeWidth={1.5}
        />
        {[168, 184, 200, 216, 232, 246].map((ly) => (
          <line
            key={`louver-${ly}`}
            x1={44}
            y1={ly}
            x2={54}
            y2={ly}
            stroke={c.shaft}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}

        {/* Cast-Iron Motor Mounting Feet (bolted flush to Baseplate y=278) */}
        <g fill={c.steelDark} stroke={c.border} strokeWidth={1.2}>
          <rect x={64} y={264} width={32} height={14} rx={2} />
          <rect x={58} y={272} width={44} height={6} rx={1.5} />
          <rect x={194} y={264} width={32} height={14} rx={2} />
          <rect x={188} y={272} width={44} height={6} rx={1.5} />
          {/* Pillow Block & Fan Housing Base Flanges */}
          <rect x={336} y={272} width={40} height={6} rx={1.5} />
          <rect x={376} y={272} width={58} height={6} rx={1.5} />
        </g>

        {/* Anchor Bolts seated cleanly on Foot Flanges */}
        {[66, 214, 342, 420].map((bx) => (
          <rect
            key={bx}
            x={bx}
            y={266}
            width={10}
            height={6}
            rx={1}
            fill={c.shaft}
            stroke={c.steelDark}
            strokeWidth={0.8}
          />
        ))}

        {/* AC Induction Motor Housing */}
        <rect
          x={58}
          y={146}
          width={174}
          height={122}
          rx={8}
          fill="url(#motorBodyGrad)"
          stroke={c.border}
          strokeWidth={1.5}
        />
        {/* Cooling Fins */}
        {[158, 170, 182, 194, 206, 218, 230, 242, 254].map((fy) => (
          <line
            key={fy}
            x1={70}
            y1={fy}
            x2={218}
            y2={fy}
            stroke="#60a5fa"
            strokeOpacity={0.35}
            strokeWidth={2}
          />
        ))}
        {/* Motor Terminal Box */}
        <rect
          x={116}
          y={122}
          width={56}
          height={24}
          rx={4}
          fill={c.steelDark}
          stroke={c.border}
        />
        <text
          x={144}
          y={138}
          textAnchor="middle"
          fill="#93c5fd"
          fontSize={10}
          fontWeight={700}
          fontFamily="monospace"
        >
          {drive.poles}P · {drive.vfdFreqHz}Hz
        </text>
        {/* Motor Nameplate */}
        <rect
          x={90}
          y={184}
          width={110}
          height={46}
          rx={4}
          fill="#07101e"
          fillOpacity={0.85}
          stroke="#38bdf8"
          strokeOpacity={0.5}
        />
        <text
          x={145}
          y={202}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize={10}
          fontWeight={700}
          fontFamily="monospace"
        >
          Ns: {drive.syncRpm.toFixed(0)} RPM
        </text>
        <text
          x={145}
          y={219}
          textAnchor="middle"
          fill="#38bdf8"
          fontSize={10}
          fontWeight={700}
          fontFamily="monospace"
        >
          Slip: {drive.slipPct.toFixed(2)}%
        </text>

        {/* Drive Shaft */}
        <rect
          x={232}
          y={202}
          width={145}
          height={26}
          fill="url(#shaftGrad)"
          stroke={c.steelDark}
        />
        {/* Animated shaft keyway/band */}
        <rect
          ref={sideShaftBandRef}
          x={245}
          y={208}
          width={40}
          height={4}
          rx={1}
          fill="#334155"
          opacity={0.55}
        />

        {/* Jaw Coupling + Reflective Tape */}
        <rect
          x={276}
          y={192}
          width={48}
          height={46}
          rx={4}
          fill={c.steelMid}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <rect x={297} y={192} width={6} height={46} fill="#f59e0b" />
        {/* Retro-Reflective Tape Strip on Coupling */}
        <rect
          ref={sideTapeRef}
          x={282}
          y={212}
          width={12}
          height={8}
          rx={1.5}
          fill={c.tape}
          stroke="#38bdf8"
          strokeWidth={1.2}
        />
        <text
          x={288}
          y={182}
          textAnchor="middle"
          fill={c.textMuted}
          fontSize={9.5}
          fontWeight={600}
        >
          {pick('REFLECTIVE TAPE', 'PITA REFLEKTIF', '反射テープ')}
        </text>
        <line
          x1={288}
          y1={185}
          x2={288}
          y2={195}
          stroke={c.textMuted}
          strokeDasharray="2 2"
        />

        {/* Pillow Block Bearing + Fan Shroud */}
        <rect
          x={344}
          y={228}
          width={24}
          height={50}
          rx={3}
          fill={c.steelMid}
          stroke={c.border}
        />
        <rect
          x={380}
          y={150}
          width={48}
          height={128}
          rx={6}
          fill={c.panelSub}
          stroke={c.border}
          strokeWidth={1.5}
        />
        <text
          x={404}
          y={218}
          textAnchor="middle"
          fill={c.textMuted}
          fontSize={10}
          fontWeight={700}
          transform="rotate(-90 404 218)"
        >
          {pick('FAN HOUSING', 'RUMAH KIPAS', 'ファンケーシング')}
        </text>

        {/* Axial View: Fan & Strobe Inspection Disc (Right Side) */}
        <rect
          x={490}
          y={72}
          width={364}
          height={292}
          rx={12}
          fill={c.panel}
          stroke={c.border}
        />
        <text
          x={506}
          y={94}
          fill={c.textMain}
          fontSize={11.5}
          fontWeight={700}
          letterSpacing="0.03em"
        >
          {mode === 'stroboscope'
            ? pick(
                'AXIAL STROBE VIEW (PERSISTENCE)',
                'TAMPILAN STROBO AKSIAL',
                '軸方向ストロボ視認 (残像)'
              )
            : pick(
                'AXIAL SHAFT & FAN VIEW',
                'TAMPILAN POROS & KIPAS AKSIAL',
                '軸方向シャフト・ファン図'
              )}
        </text>
        <text
          x={840}
          y={94}
          textAnchor="end"
          fill={c.cyan}
          fontSize={11}
          fontWeight={700}
          fontFamily="monospace"
        >
          {mode === 'stroboscope'
            ? `${strobe.strobeFpm.toFixed(0)} FPM`
            : `${drive.rotorRpm.toFixed(1)} RPM`}
        </text>

        {/* Fan Shroud Ring */}
        <circle
          cx={640}
          cy={215}
          r={102}
          fill={c.bg}
          stroke={c.border}
          strokeWidth={2}
          strokeDasharray="6 4"
        />

        {/* Axial Rotor & Strobe Persistence Layers (centered at 640, 215) */}
        <g transform="translate(640, 215)">
          <g ref={discRealRef} transform="rotate(0)">
            {renderFanRotor(false)}
          </g>

          <g ref={ghostRef3} transform="rotate(0)" opacity={0}>
            {renderFanRotor(true)}
          </g>
          <g ref={ghostRef2} transform="rotate(0)" opacity={0}>
            {renderFanRotor(true)}
          </g>
          <g ref={ghostRef1} transform="rotate(0)" opacity={0}>
            {renderFanRotor(true)}
          </g>
          <g ref={ghostRef0} transform="rotate(0)" opacity={0}>
            {renderFanRotor(true)}
          </g>
        </g>

        {/* Top TDC Reference Marker on Axial View */}
        <polygon points="640,104 634,94 646,94" fill={c.amber} />
        <text
          x={640}
          y={338}
          textAnchor="middle"
          fill={c.textMuted}
          fontSize={10.5}
          fontFamily="monospace"
        >
          {mode === 'stroboscope'
            ? `${pick('Ratio', 'Rasio', '比率')}: ${strobe.ratio.toFixed(2)}× | ${pick('Images', 'Bayangan', '像数')}: ${strobe.apparentImages}`
            : `ω = ${drive.omegaRadS.toFixed(1)} rad/s | ${drive.rps.toFixed(2)} RPS`}
        </text>

        {/* Target snap indicator on reflective tape while dragging or off-target */}
        {(isDragging || !isOnTarget) && (
          <g>
            <circle
              cx={288}
              cy={218}
              r={16}
              fill="none"
              stroke={isOnTarget ? c.emerald : c.amber}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            {!isOnTarget && (
              <g
                onClick={handleSnapToTape}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
              >
                <rect
                  x={386}
                  y={316}
                  width={92}
                  height={24}
                  rx={6}
                  fill="#001f6b"
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
                <text
                  x={432}
                  y={332}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize={10}
                  fontWeight={700}
                >
                  {pick('Snap to Tape', 'Bidik Pita', 'テープに照準')}
                </text>
              </g>
            )}
          </g>
        )}

        {/* Laser Beam (Laser Mode) */}
        {mode === 'laser' && (
          <g>
            <line
              x1={emitterX}
              y1={emitterY}
              x2={emitterX}
              y2={
                emitterX >= 276 && emitterX <= 324
                  ? 218
                  : emitterX <= 232
                    ? 268
                    : emitterX >= 380
                      ? 278
                      : 228
              }
              stroke={c.red}
              strokeWidth={laserActive ? 2.5 : 0}
              strokeDasharray={laserActive ? undefined : '4 4'}
              filter="url(#laserGlow)"
            />
            <circle
              ref={laserSpotRef}
              cx={emitterX}
              cy={
                emitterX >= 276 && emitterX <= 324
                  ? 218
                  : emitterX <= 232
                    ? 268
                    : emitterX >= 380
                      ? 278
                      : 228
              }
              r={laserActive ? 4 : 0}
              fill="#fca5a5"
              stroke={c.red}
              strokeWidth={1.5}
              filter="url(#laserGlow)"
            />
          </g>
        )}

        {/* Stroboscope Xenon Flash Cone (Strobe Mode) */}
        {mode === 'stroboscope' && (
          <polygon
            ref={strobeConeRef}
            points={`${emitterX},${emitterY} ${isOnTarget ? '545,120 735,310' : `${emitterX - 90},120 ${emitterX + 90},120`}`}
            fill="url(#strobeConeGrad)"
            opacity={0.12}
          />
        )}

        {/* Draggable Handheld Instrument Body (Bottom Left) */}
        <g
          transform={`translate(${instPos.x}, ${instPos.y})`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        >
          <rect
            x={0}
            y={0}
            width={158}
            height={106}
            rx={12}
            fill="#001f6b"
            stroke={isDragging ? '#67e8f9' : isOnTarget ? '#38bdf8' : '#ef4444'}
            strokeWidth={isDragging ? 2 : 1.5}
          />
          {/* Drag Grip Dots */}
          {[6, 12, 18].map((dy) => (
            <line
              key={`grip-${dy}`}
              x1={66}
              y1={96 + (dy - 6) * 0.4}
              x2={92}
              y2={96 + (dy - 6) * 0.4}
              stroke="#60a5fa"
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          ))}
          {/* Emitter Aperture */}
          <rect
            x={66}
            y={-8}
            width={24}
            height={10}
            rx={3}
            fill={c.steelDark}
            stroke={c.border}
          />
          {mode === 'laser' ? (
            <circle
              cx={78}
              cy={-5}
              r={3.5}
              fill={laserActive ? c.red : '#475569'}
            />
          ) : (
            <circle
              ref={strobeBulbRef}
              cx={78}
              cy={-4}
              r={5}
              fill="#67e8f9"
              opacity={0.7}
            />
          )}

          {/* Instrument LCD */}
          <rect
            x={12}
            y={14}
            width={134}
            height={52}
            rx={6}
            fill="#07101e"
            stroke="#0284c7"
            strokeWidth={1}
          />
          <text
            x={20}
            y={30}
            fill="#38bdf8"
            fontSize={9.5}
            fontWeight={700}
            fontFamily="monospace"
          >
            {mode === 'laser' ? 'OPTICAL TACH' : 'XENON STROBE'}
          </text>
          <circle ref={pulseLedRef} cx={132} cy={26} r={4} fill="#334155" />
          <text
            x={79}
            y={54}
            textAnchor="middle"
            fill={isOnTarget ? '#f8fafc' : '#fca5a5'}
            fontSize={19}
            fontWeight={800}
            fontFamily="monospace"
          >
            {mode === 'laser'
              ? isOnTarget && laserActive
                ? `${drive.rotorRpm.toFixed(1)} RPM`
                : '---.- RPM'
              : `${strobe.strobeFpm.toFixed(0)} FPM`}
          </text>

          {/* Pulse Counter / Sub-readout */}
          <text
            x={16}
            y={86}
            fill="#93c5fd"
            fontSize={9.5}
            fontFamily="monospace"
          >
            {mode === 'laser' ? 'PULSES:' : 'DRIFT:'}
          </text>
          <text
            ref={pulseCountTextRef}
            x={142}
            y={86}
            textAnchor="end"
            fill="#e2e8f0"
            fontSize={10.5}
            fontWeight={700}
            fontFamily="monospace"
          >
            {mode === 'laser'
              ? '00000'
              : `${strobe.apparentRpm >= 0 ? '+' : ''}${strobe.apparentRpm.toFixed(1)} RPM`}
          </text>
        </g>

        {/* Bottom-Right Diagnostic Legend Card */}
        <rect
          x={490}
          y={376}
          width={364}
          height={66}
          rx={10}
          fill={c.panel}
          stroke={c.border}
        />
        <text
          x={506}
          y={398}
          fill={c.textMain}
          fontSize={11}
          fontWeight={700}
        >
          {mode === 'laser'
            ? pick(
                'Laser Sensor: 650 nm Class 2 · Zero Mechanical Drag',
                'Sensor Laser: 650 nm Kelas 2 · Tanpa Beban Mekanis',
                'レーザーセンサ: 650 nm クラス2 · 機械負荷ゼロ'
              )
            : pick(
                'Strobe Rule: Double FPM to verify 1:1 vs 1/2× sub-harmonic',
                'Aturan Strobo: Gandakan FPM untuk cek 1:1 vs sub-harmonik',
                'ストロボ則: FPMを2倍にして1:1か分数調波か確認'
              )}
        </text>
        <text
          x={506}
          y={420}
          fill={c.textMuted}
          fontSize={10.5}
          fontFamily="monospace"
        >
          {`f = ${drive.vfdFreqHz} Hz | ${drive.poles}P | Ns = ${drive.syncRpm.toFixed(0)} | Nr = ${drive.rotorRpm.toFixed(1)} RPM`}
        </text>
      </svg>
    </div>
  );
}
