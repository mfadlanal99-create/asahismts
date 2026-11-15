import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  checkGreaseCompatibility,
  computeFallingBallTime,
  NLGI_GRADES,
  OIL_FAMILIES,
  THICKENERS,
  type LabMode,
  type NlgiGradeId,
  type OilFamilyId,
  type ThickenerId,
} from './oilGreaseBasicsData';

interface OilGreaseBasicsSvgProps {
  mode: LabMode;
  oilFamilyId: OilFamilyId;
  isoVg: number;
  tempC: number;
  kinematicViscosityCst: number;
  nlgiGradeId: NlgiGradeId;
  thickener1Id: ThickenerId;
  thickener2Id: ThickenerId;
}

type BallPhase = 'ready' | 'dropping' | 'done';

/** Deterministic text wrapper for native SVG <tspan> lines (handles EN/ID spaces and JA CJK). */
function wrapSvgLines(
  text: string,
  maxChars: number,
  maxLines: number
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const hasSpaces = trimmed.includes(' ');
  const lines: string[] = [];

  if (!hasSpaces) {
    const cjkLimit = Math.max(14, Math.floor(maxChars * 0.56));
    for (let i = 0; i < trimmed.length && lines.length < maxLines; i += cjkLimit) {
      let chunk = trimmed.slice(i, i + cjkLimit);
      if (lines.length === maxLines - 1 && i + cjkLimit < trimmed.length) {
        chunk = chunk.slice(0, -1) + '…';
      }
      lines.push(chunk);
    }
    return lines;
  }

  const words = trimmed.split(/\s+/);
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (lines.length === maxLines - 1) {
        const truncated = (current || word).slice(0, maxChars - 1);
        lines.push(`${truncated}…`);
        current = '';
        break;
      }
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

/** Short clean thickener label for compact CAD badges */
function shortThickenerLabel(id: ThickenerId): string {
  switch (id) {
    case 'lithium-complex':
      return 'Lithium Complex';
    case 'polyurea':
      return 'Polyurea (Non-Soap)';
    case 'calcium-sulfonate':
      return 'Calcium Sulfonate';
    case 'aluminum-complex':
      return 'Aluminum Complex';
    case 'bentone-clay':
      return 'Bentone Clay';
  }
}

/** Compute luminous oil gradient stops based on oil family, VG grade, and temperature */
function getOilVisualColors(
  familyId: OilFamilyId,
  isoVg: number,
  tempC: number
): { light: string; mid: string; deep: string; opacity: number } {
  // Higher VG or colder temperature -> richer/darker optical density
  const thicknessFactor = Math.min(
    1,
    Math.max(0, (Math.log10(isoVg) - 1.5) / 1.2 + (40 - tempC) / 140)
  );

  switch (familyId) {
    case 'pao-food':
      return {
        light: '#fefce8',
        mid: '#fef08a',
        deep: '#fde047',
        opacity: 0.48 + thicknessFactor * 0.16,
      };
    case 'turbine-ro':
      return {
        light: '#fef08a',
        mid: '#fbbf24',
        deep: '#d97706',
        opacity: 0.65 + thicknessFactor * 0.2,
      };
    case 'hydraulic-aw':
      return {
        light: '#fde047',
        mid: '#f59e0b',
        deep: '#b45309',
        opacity: 0.72 + thicknessFactor * 0.18,
      };
    case 'slideway':
      return {
        light: '#fbbf24',
        mid: '#ea580c',
        deep: '#9a3412',
        opacity: 0.78 + thicknessFactor * 0.15,
      };
    case 'gear-ep':
      return {
        light: '#f59e0b',
        mid: '#b45309',
        deep: '#78350f',
        opacity: 0.82 + thicknessFactor * 0.14,
      };
    case 'engine-sae':
      return {
        light: '#d97706',
        mid: '#92400e',
        deep: '#451a03',
        opacity: 0.85 + thicknessFactor * 0.12,
      };
  }
}

// Viscometer geometry constants
const BALL_START_Y = 128;
const GATE_A_Y = 160;
const GATE_B_Y = 342;
const BALL_END_Y = 388;
const CONE_RETRACT_TIP_Y = 282;
const GREASE_SURFACE_Y = 307;

export function OilGreaseBasicsSvg({
  mode,
  oilFamilyId,
  isoVg,
  tempC,
  kinematicViscosityCst,
  nlgiGradeId,
  thickener1Id,
  thickener2Id,
}: OilGreaseBasicsSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  // Lightweight phase state for button labels (no per-frame React re-renders!)
  const [ballPhase, setBallPhase] = useState<BallPhase>('ready');
  const [coneRetracted, setConeRetracted] = useState<boolean>(false);

  // Reset phase cleanly during render when oil/grease props change (avoids setState in useEffect)
  const oilParamKey = `${oilFamilyId}-${isoVg}-${tempC}`;
  const [prevOilKey, setPrevOilKey] = useState<string>(oilParamKey);
  if (oilParamKey !== prevOilKey) {
    setPrevOilKey(oilParamKey);
    if (ballPhase !== 'ready') setBallPhase('ready');
  }

  const greaseParamKey = `${mode}-${nlgiGradeId}`;
  const [prevGreaseKey, setPrevGreaseKey] = useState<string>(greaseParamKey);
  if (greaseParamKey !== prevGreaseKey) {
    setPrevGreaseKey(greaseParamKey);
    if (coneRetracted) setConeRetracted(false);
  }

  // Direct SVG DOM Refs for 60fps requestAnimationFrame updates
  const ballGroupRef = useRef<SVGGElement | null>(null);
  const wakePathRef = useRef<SVGPathElement | null>(null);
  const stopwatchTextRef = useRef<SVGTextElement | null>(null);
  const gateABeamRef = useRef<SVGLineElement | null>(null);
  const gateBBeamRef = useRef<SVGLineElement | null>(null);
  const gateALedRef = useRef<SVGCircleElement | null>(null);
  const gateBLedRef = useRef<SVGCircleElement | null>(null);
  const ballAnimRef = useRef<number | null>(null);

  // Cone penetrometer direct DOM refs
  const coneGroupRef = useRef<SVGGElement | null>(null);
  const plungerLineRef = useRef<SVGLineElement | null>(null);
  const dialNeedleRef = useRef<SVGLineElement | null>(null);
  const craterPolyRef = useRef<SVGPolygonElement | null>(null);
  const dimGroupRef = useRef<SVGGElement | null>(null);
  const dimLineRef = useRef<SVGLineElement | null>(null);
  const dimBottomTickRef = useRef<SVGLineElement | null>(null);
  const dimTextRef = useRef<SVGTextElement | null>(null);
  const penValTextRef = useRef<SVGTSpanElement | null>(null);
  const penMmTextRef = useRef<SVGTextElement | null>(null);
  const coneAnimRef = useRef<number | null>(null);

  // Active data lookups
  const activeFamily = useMemo(
    () => OIL_FAMILIES.find((f) => f.id === oilFamilyId) ?? OIL_FAMILIES[0],
    [oilFamilyId]
  );
  const activeNlgi = useMemo(
    () => NLGI_GRADES.find((g) => g.grade === nlgiGradeId) ?? NLGI_GRADES[3],
    [nlgiGradeId]
  );
  const activeThickener1 = useMemo(
    () => THICKENERS.find((t) => t.id === thickener1Id) ?? THICKENERS[0],
    [thickener1Id]
  );
  const activeThickener2 = useMemo(
    () => THICKENERS.find((t) => t.id === thickener2Id) ?? THICKENERS[1],
    [thickener2Id]
  );

  const compatResult = useMemo(
    () => checkGreaseCompatibility(thickener1Id, thickener2Id),
    [thickener1Id, thickener2Id]
  );

  const { physicsTimeSec, animationDurationSec } = useMemo(
    () => computeFallingBallTime(kinematicViscosityCst),
    [kinematicViscosityCst]
  );

  const oilColors = useMemo(
    () => getOilVisualColors(oilFamilyId, isoVg, tempC),
    [oilFamilyId, isoVg, tempC]
  );

  // Penetration geometry target for active NLGI grade
  const targetPenetrationPx = useMemo(() => {
    const minPx = 22;
    const maxPx = 66;
    const ratio = (activeNlgi.workedPenetrationMid - 220) / (430 - 220);
    return minPx + Math.max(0, Math.min(1, ratio)) * (maxPx - minPx);
  }, [activeNlgi.workedPenetrationMid]);

  // Helper to apply ball visual position directly to SVG DOM
  const applyBallVisual = useCallback(
    (yPos: number, elapsedGateSec: number, isMoving: boolean) => {
      if (ballGroupRef.current) {
        ballGroupRef.current.setAttribute('transform', `translate(128, ${yPos.toFixed(2)})`);
      }
      if (wakePathRef.current) {
        wakePathRef.current.setAttribute(
          'opacity',
          isMoving && yPos > BALL_START_Y + 8 && yPos < BALL_END_Y - 4 ? '0.35' : '0'
        );
      }
      if (stopwatchTextRef.current) {
        stopwatchTextRef.current.textContent = `${elapsedGateSec.toFixed(2)} s`;
      }

      const passedA = yPos >= GATE_A_Y;
      const passedB = yPos >= GATE_B_Y;
      if (gateABeamRef.current) {
        gateABeamRef.current.setAttribute(
          'stroke',
          passedA ? '#22d3ee' : '#ef4444'
        );
      }
      if (gateALedRef.current) {
        gateALedRef.current.setAttribute(
          'fill',
          passedA ? '#22d3ee' : '#ef4444'
        );
      }
      if (gateBBeamRef.current) {
        gateBBeamRef.current.setAttribute(
          'stroke',
          passedB ? '#22c55e' : '#ef4444'
        );
      }
      if (gateBLedRef.current) {
        gateBLedRef.current.setAttribute(
          'fill',
          passedB ? '#22c55e' : '#ef4444'
        );
      }
    },
    []
  );

  // Reset ball cleanly
  const handleResetBall = useCallback(() => {
    if (ballAnimRef.current) {
      cancelAnimationFrame(ballAnimRef.current);
      ballAnimRef.current = null;
    }
    setBallPhase('ready');
    applyBallVisual(BALL_START_Y, 0, false);
  }, [applyBallVisual]);

  // Smooth 60fps requestAnimationFrame ball drop
  const handleDropBall = useCallback(() => {
    if (ballPhase === 'dropping') return;
    if (ballAnimRef.current) cancelAnimationFrame(ballAnimRef.current);

    setBallPhase('dropping');
    applyBallVisual(BALL_START_Y, 0, true);

    const totalDistance = BALL_END_Y - BALL_START_Y; // 260 px
    const gateDistance = GATE_B_Y - GATE_A_Y; // 182 px
    const totalAnimSec = animationDurationSec * (totalDistance / gateDistance);
    const startMs = performance.now();

    const step = (now: number) => {
      const elapsedSec = (now - startMs) / 1000;
      const tNorm = Math.min(1, elapsedSec / totalAnimSec);
      const yPos = BALL_START_Y + tNorm * totalDistance;

      let gateSec = 0;
      if (yPos >= GATE_B_Y) {
        gateSec = physicsTimeSec;
      } else if (yPos > GATE_A_Y) {
        gateSec = ((yPos - GATE_A_Y) / gateDistance) * physicsTimeSec;
      }

      applyBallVisual(yPos, gateSec, tNorm < 1);

      if (tNorm < 1) {
        ballAnimRef.current = requestAnimationFrame(step);
      } else {
        ballAnimRef.current = null;
        setBallPhase('done');
      }
    };

    ballAnimRef.current = requestAnimationFrame(step);
  }, [animationDurationSec, applyBallVisual, ballPhase, physicsTimeSec]);

  // Helper to apply cone penetrometer position directly to SVG DOM
  const applyConeVisual = useCallback(
    (progress: number) => {
      // progress: 0 = retracted hover at CONE_RETRACT_TIP_Y, 1 = plunged to targetPenetrationPx
      const interpolatedTipY =
        CONE_RETRACT_TIP_Y +
        progress * (GREASE_SURFACE_Y + targetPenetrationPx - CONE_RETRACT_TIP_Y);
      const actualTipY = progress <= 0 ? CONE_RETRACT_TIP_Y : interpolatedTipY;
      const depthInGrease = Math.max(0, actualTipY - GREASE_SURFACE_Y);

      if (coneGroupRef.current) {
        coneGroupRef.current.setAttribute(
          'transform',
          `translate(144, ${actualTipY.toFixed(2)})`
        );
      }
      if (plungerLineRef.current) {
        plungerLineRef.current.setAttribute('y2', (actualTipY - 42).toFixed(2));
      }

      // Dial angle: 0..450 mm/10 across -145..+145 deg
      const penProgress = depthInGrease / Math.max(1, targetPenetrationPx);
      const currentMm10 = activeNlgi.workedPenetrationMid * penProgress;
      const dialAngleDeg = -145 + (currentMm10 / 450) * 290;
      const rad = (dialAngleDeg * Math.PI) / 180;
      if (dialNeedleRef.current) {
        dialNeedleRef.current.setAttribute('x2', (Math.sin(rad) * 29).toFixed(2));
        dialNeedleRef.current.setAttribute('y2', (-Math.cos(rad) * 29).toFixed(2));
      }

      if (craterPolyRef.current) {
        if (depthInGrease > 2) {
          const halfWidth = Math.min(28, depthInGrease * 0.65);
          craterPolyRef.current.setAttribute(
            'points',
            `144,${(GREASE_SURFACE_Y + depthInGrease).toFixed(1)} ${(144 - halfWidth).toFixed(1)},${GREASE_SURFACE_Y} ${(144 + halfWidth).toFixed(1)},${GREASE_SURFACE_Y}`
          );
          craterPolyRef.current.setAttribute('opacity', '0.35');
        } else {
          craterPolyRef.current.setAttribute('opacity', '0');
        }
      }

      if (dimGroupRef.current) {
        dimGroupRef.current.setAttribute('opacity', depthInGrease > 3 ? '1' : '0');
      }
      if (dimLineRef.current) {
        dimLineRef.current.setAttribute('y2', actualTipY.toFixed(1));
      }
      if (dimBottomTickRef.current) {
        dimBottomTickRef.current.setAttribute('y1', actualTipY.toFixed(1));
        dimBottomTickRef.current.setAttribute('y2', actualTipY.toFixed(1));
      }
      if (dimTextRef.current) {
        dimTextRef.current.setAttribute(
          'y',
          (GREASE_SURFACE_Y + depthInGrease / 2 + 3).toFixed(1)
        );
        dimTextRef.current.textContent = `${(currentMm10 / 10).toFixed(1)} mm`;
      }
      if (penValTextRef.current) {
        penValTextRef.current.textContent = `${currentMm10.toFixed(0)}`;
      }
      if (penMmTextRef.current) {
        penMmTextRef.current.textContent = `= ${(currentMm10 / 10).toFixed(1)} mm`;
      }
    },
    [activeNlgi.workedPenetrationMid, targetPenetrationPx]
  );

  // Trigger cone release animation
  const handleReleaseCone = useCallback(() => {
    if (coneAnimRef.current) cancelAnimationFrame(coneAnimRef.current);
    setConeRetracted(false);
    const startMs = performance.now();
    const durationMs = 560;

    const stepCone = (now: number) => {
      const p = Math.min(1, (now - startMs) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      applyConeVisual(eased);
      if (p < 1) {
        coneAnimRef.current = requestAnimationFrame(stepCone);
      } else {
        coneAnimRef.current = null;
      }
    };
    coneAnimRef.current = requestAnimationFrame(stepCone);
  }, [applyConeVisual]);

  const handleRetractCone = useCallback(() => {
    if (coneAnimRef.current) cancelAnimationFrame(coneAnimRef.current);
    setConeRetracted(true);
    applyConeVisual(0);
  }, [applyConeVisual]);

  // Reset ball SVG DOM & cancel animation when oil parameters change
  useEffect(() => {
    if (ballAnimRef.current) {
      cancelAnimationFrame(ballAnimRef.current);
      ballAnimRef.current = null;
    }
    applyBallVisual(BALL_START_Y, 0, false);
  }, [oilParamKey, applyBallVisual]);

  // Sync cone SVG DOM when NLGI changes or switching to grease mode
  useEffect(() => {
    if (coneAnimRef.current) {
      cancelAnimationFrame(coneAnimRef.current);
      coneAnimRef.current = null;
    }
    if (mode === 'grease') {
      applyConeVisual(1);
    }
  }, [mode, nlgiGradeId, applyConeVisual]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      if (ballAnimRef.current) cancelAnimationFrame(ballAnimRef.current);
      if (coneAnimRef.current) cancelAnimationFrame(coneAnimRef.current);
    };
  }, []);

  // Theme color palette
  const c = useMemo(
    () => ({
      canvasBg: isDark ? '#090e1a' : '#f8fafc',
      panelBg: isDark ? '#111827' : '#ffffff',
      subCardBg: isDark ? '#0b1120' : '#f1f5f9',
      border: isDark ? '#273549' : '#cbd5e1',
      gridMinor: isDark ? 'rgba(148,163,184,0.045)' : 'rgba(15,23,42,0.04)',
      gridMajor: isDark ? 'rgba(148,163,184,0.09)' : 'rgba(15,23,42,0.075)',
      textMain: isDark ? '#f1f5f9' : '#0f172a',
      textMuted: isDark ? '#94a3b8' : '#64748b',
      oledBg: '#020617',
      oledBorder: isDark ? '#1e293b' : '#334155',
      glassStroke: isDark ? '#64748b' : '#94a3b8',
    }),
    [isDark]
  );

  // Derived telemetry values
  const speedMmSec = 180 / Math.max(0.1, physicsTimeSec);
  const pctDeltaVs40 = ((kinematicViscosityCst - isoVg) / isoVg) * 100;
  const dragRatio = Math.min(
    1,
    Math.max(0.06, Math.log10(Math.max(1.5, kinematicViscosityCst)) / Math.log10(2500))
  );

  // Thermometer mercury level (10°C at y=246 -> 90°C at y=118)
  const mercuryTopY = 246 - ((tempC - 10) / 80) * 128;

  // Grease mode wrapped lines
  const consequenceLines = useMemo(
    () => wrapSvgLines(compatResult.consequence[pick('en', 'id', 'ja')], 54, 3),
    [compatResult, pick]
  );
  const recommendationLines = useMemo(
    () => wrapSvgLines(compatResult.recommendation[pick('en', 'id', 'ja')], 54, 2),
    [compatResult, pick]
  );

  // Compatibility needle angle (-60 deg green, 0 deg amber, +60 deg red)
  const compatAngleDeg =
    compatResult.status === 'Compatible'
      ? -58
      : compatResult.status === 'Caution'
        ? 0
        : 58;
  const compatRad = (compatAngleDeg * Math.PI) / 180;

  return (
    <div className="w-full flex flex-col items-center justify-center p-1.5">
      <svg
        viewBox="0 0 780 480"
        className="w-full h-auto max-h-[480px] select-none rounded-xl border shadow-sm"
        style={{
          backgroundColor: c.canvasBg,
          borderColor: c.border,
        }}
      >
        <defs>
          {/* Blueprint CAD Grid Pattern */}
          <pattern id="cadGridMinor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={c.gridMinor} strokeWidth="0.7" />
          </pattern>
          <pattern id="cadGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#cadGridMinor)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke={c.gridMajor} strokeWidth="1" />
          </pattern>

          {/* Section Cross-Hatching for Machined Cutaway Cup */}
          <pattern
            id="cadHatch"
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={isDark ? '#64748b' : '#475569'}
              strokeWidth="1.5"
            />
          </pattern>

          {/* Brushed Stainless Cylindrical Rod Gradient */}
          <linearGradient id="stainlessRodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="28%" stopColor="#e2e8f0" />
            <stop offset="52%" stopColor="#94a3b8" />
            <stop offset="82%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Cast Iron Base Gradient */}
          <linearGradient id="castIronGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Chrome Steel Sphere Gradient */}
          <radialGradient id="chromeBallGrad" cx="32%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#e2e8f0" />
            <stop offset="65%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Machined Brass Cone Gradient */}
          <linearGradient id="brassConeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="80%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>

          {/* Dynamic Backlit Oil Column Gradient */}
          <linearGradient id="oilColumnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={oilColors.deep} />
            <stop offset="30%" stopColor={oilColors.mid} />
            <stop offset="55%" stopColor={oilColors.light} />
            <stop offset="82%" stopColor={oilColors.mid} />
            <stop offset="100%" stopColor={oilColors.deep} />
          </linearGradient>

          {/* Borosilicate Glass Specular Overlay */}
          <linearGradient id="borosilicateGloss" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="14%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="92%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.38" />
          </linearGradient>

          {/* 3D Industrial Steel Drum Gradient */}
          <linearGradient id="steelDrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="18%" stopColor="#334155" />
            <stop offset="35%" stopColor="#475569" />
            <stop offset="55%" stopColor="#1e293b" />
            <stop offset="85%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Crisp Drop Shadow for Floating Needles & Spheres */}
          <filter id="cadShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* CAD Blueprint Grid Background */}
        <rect x="0" y="0" width="780" height="480" fill="url(#cadGridMajor)" />

        {/* Corner Registration Marks */}
        <path
          d="M 10 22 L 10 10 L 22 10 M 758 10 L 770 10 L 770 22 M 10 458 L 10 470 L 22 470 M 758 470 L 770 470 L 770 458"
          fill="none"
          stroke={c.border}
          strokeWidth="1.5"
        />

        {/* ========================================================= */}
        {/* MODE 1: INDUSTRIAL OIL & FALLING-BALL VISCOMETER          */}
        {/* ========================================================= */}
        {mode === 'oil' && (
          <g id="oilModeCad">
            {/* Top Instrument Header Bar */}
            <rect
              x="16"
              y="14"
              width="748"
              height="38"
              rx="8"
              fill={c.panelBg}
              stroke={c.border}
              strokeWidth="1"
            />
            <circle cx="36" cy="33" r="8" fill={oilColors.mid} stroke={c.border} strokeWidth="1" />
            <circle cx="34" cy="31" r="2.5" fill="#ffffff" fillOpacity="0.7" />
            <text
              x="54"
              y="37"
              fontSize="12"
              fontWeight="700"
              fill={c.textMain}
              fontFamily="system-ui, sans-serif"
            >
              {pick(
                `ASTM D341 Viscometer  •  ${activeFamily.name}  •  VG ${isoVg} @ ${tempC} °C`,
                `Viskometer ASTM D341  •  ${activeFamily.name}  •  VG ${isoVg} @ ${tempC} °C`,
                `ASTM D341 粘度計  •  ${activeFamily.name}  •  VG ${isoVg} (${tempC} °C)`
              )}
            </text>

            {/* Right Header Spec Pill (Isolated zone x: 566..754) */}
            <rect
              x="566"
              y="20"
              width="188"
              height="26"
              rx="6"
              fill={isDark ? 'rgba(245,158,11,0.14)' : 'rgba(245,158,11,0.12)'}
              stroke="#f59e0b"
              strokeWidth="1"
            />
            <text
              x="660"
              y="37"
              fontSize="10.5"
              fontWeight="800"
              fill={isDark ? '#fbbf24' : '#b45309'}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              {activeFamily.shortCode.toUpperCase()}
            </text>

            {/* ---------------- LEFT BAY: VISCOMETER ---------------- */}
            <rect
              x="16"
              y="62"
              width="408"
              height="402"
              rx="10"
              fill={c.panelBg}
              stroke={c.border}
              strokeWidth="1"
            />
            <text
              x="30"
              y="83"
              fontSize="10.5"
              fontWeight="800"
              fill={c.textMuted}
              letterSpacing="0.06em"
            >
              {pick(
                'FALLING-BALL VISCOMETER (STOKES LAMINAR FLOW)',
                'VISKOMETER BOLA JATUH (ALIRAN LAMINER STOKES)',
                '落球式粘度計（ストークス層流測定装置）'
              )}
            </text>

            {/* Cast-Iron Base Plinth & Leveling Feet */}
            <rect x="42" y="446" width="24" height="6" rx="2" fill="#0f172a" />
            <rect x="164" y="446" width="24" height="6" rx="2" fill="#0f172a" />
            <path
              d="M 32 426 L 200 426 L 206 446 L 26 446 Z"
              fill="url(#castIronGrad)"
              stroke="#475569"
              strokeWidth="1.2"
            />
            {/* Base bolts */}
            <circle cx="42" cy="436" r="3" fill="#94a3b8" />
            <circle cx="190" cy="436" r="3" fill="#94a3b8" />

            {/* Vertical Brushed Stainless Support Rod */}
            <rect
              x="48"
              y="96"
              width="11"
              height="330"
              rx="2"
              fill="url(#stainlessRodGrad)"
              stroke="#475569"
              strokeWidth="0.8"
            />
            <rect x="45" y="92" width="17" height="6" rx="2" fill="#334155" />

            {/* Upper & Lower Machined Bosshead Clamps */}
            {[124, 376].map((cy) => (
              <g key={cy}>
                <rect x="44" y={cy - 8} width="20" height="16" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1" />
                <rect x="64" y={cy - 4} width="36" height="8" rx="1" fill="url(#stainlessRodGrad)" />
                {/* Knurled thumb screw */}
                <rect x="36" y={cy - 3} width="8" height="6" rx="1" fill="#eab308" />
                {/* Tube Gripper Collar */}
                <rect x="97" y={cy - 7} width="62" height="14" rx="2" fill="none" stroke="#64748b" strokeWidth="2.5" />
              </g>
            ))}

            {/* Backlight Strip behind Glass Tube for Crisp Oil Illumination */}
            <rect
              x="105"
              y="108"
              width="46"
              height="292"
              rx="4"
              fill={isDark ? '#1e293b' : '#ffffff'}
              opacity="0.55"
            />

            {/* Borosilicate Glass Tube Outer Wall */}
            <rect
              x="100"
              y="102"
              width="56"
              height="304"
              rx="6"
              fill="none"
              stroke={c.glassStroke}
              strokeWidth="2"
            />

            {/* Illuminated Fluid Column (from Meniscus y=116 to y=396) */}
            <rect
              x="103"
              y="116"
              width="50"
              height="282"
              rx="3"
              fill="url(#oilColumnGrad)"
              fillOpacity={oilColors.opacity}
            />

            {/* Concave Oil Meniscus at Top */}
            <path
              d="M 103 116 Q 128 122 153 116"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeOpacity="0.65"
            />

            {/* Etched Volumetric / Millimeter Graduations on Glass */}
            {Array.from({ length: 13 }).map((_, idx) => {
              const tickY = 148 + idx * 18;
              const isMajor = idx % 2 === 0;
              return (
                <line
                  key={idx}
                  x1="103"
                  y1={tickY}
                  x2={isMajor ? '115' : '110'}
                  y2={tickY}
                  stroke={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.4)'}
                  strokeWidth={isMajor ? '1.1' : '0.7'}
                />
              );
            })}

            {/* Borosilicate Glass Specular Highlights */}
            <rect
              x="102"
              y="104"
              width="52"
              height="300"
              rx="4"
              fill="url(#borosilicateGloss)"
              pointerEvents="none"
            />

            {/* Top & Bottom Machined 316L Stainless End-Caps + Elastomer O-Rings */}
            <rect x="98" y="96" width="60" height="10" rx="2" fill="url(#stainlessRodGrad)" stroke="#475569" strokeWidth="1" />
            <rect x="116" y="90" width="24" height="6" rx="1.5" fill="#475569" />
            <rect x="101" y="106" width="54" height="3" rx="1" fill="#0f172a" />

            <rect x="98" y="400" width="60" height="12" rx="2" fill="url(#stainlessRodGrad)" stroke="#475569" strokeWidth="1" />
            <rect x="101" y="397" width="54" height="3" rx="1" fill="#0f172a" />
            {/* Bottom ball rest cushion */}
            <path d="M 118 397 L 122 392 L 134 392 L 138 397 Z" fill="#334155" />

            {/* Optical Laser Gate A (Start Timing) & Gate B (Stop Timing) */}
            {[
              {
                y: GATE_A_Y,
                label: 'GATE A',
                beamRef: gateABeamRef,
                ledRef: gateALedRef,
              },
              {
                y: GATE_B_Y,
                label: 'GATE B',
                beamRef: gateBBeamRef,
                ledRef: gateBLedRef,
              },
            ].map((gate) => (
              <g key={gate.label}>
                {/* Laser Emitter Block (Left of glass) */}
                <rect
                  x="88"
                  y={gate.y - 6}
                  width="11"
                  height="12"
                  rx="2"
                  fill="#1e293b"
                  stroke="#64748b"
                  strokeWidth="1"
                />
                {/* Laser Detector Block (Right of glass) */}
                <rect
                  x="157"
                  y={gate.y - 6}
                  width="11"
                  height="12"
                  rx="2"
                  fill="#1e293b"
                  stroke="#64748b"
                  strokeWidth="1"
                />
                <circle
                  ref={gate.ledRef}
                  cx="162.5"
                  cy={gate.y}
                  r="2.5"
                  fill="#ef4444"
                />
                {/* Laser Beam Across Tube */}
                <line
                  ref={gate.beamRef}
                  x1="99"
                  y1={gate.y}
                  x2="157"
                  y2={gate.y}
                  stroke="#ef4444"
                  strokeWidth="1.3"
                  strokeDasharray="3,2"
                  opacity="0.85"
                />
                {/* Clean Non-Overlapping Label to Right */}
                <text
                  x="173"
                  y={gate.y + 3}
                  fontSize="8.5"
                  fontWeight="800"
                  fill={c.textMuted}
                  fontFamily="ui-monospace, monospace"
                >
                  {gate.label}
                </text>
              </g>
            ))}

            {/* 180 mm Calibrated Fall Span Dimension Line (x: 196, safely clear of console x: 236) */}
            <line
              x1="210"
              y1={GATE_A_Y}
              x2="210"
              y2={GATE_B_Y}
              stroke={c.textMuted}
              strokeWidth="1"
            />
            <path
              d={`M 207 ${GATE_A_Y + 5} L 210 ${GATE_A_Y} L 213 ${GATE_A_Y + 5} M 207 ${GATE_B_Y - 5} L 210 ${GATE_B_Y} L 213 ${GATE_B_Y - 5}`}
              fill="none"
              stroke={c.textMuted}
              strokeWidth="1"
            />
            <rect
              x="185"
              y="241"
              width="48"
              height="18"
              rx="4"
              fill={c.subCardBg}
              stroke={c.border}
              strokeWidth="0.8"
            />
            <text
              x="209"
              y="253"
              fontSize="8.5"
              fontWeight="700"
              fill={c.textMain}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              180 mm
            </text>

            {/* Animated Chrome-Steel Viscometer Ball (r = 10 px) */}
            <g ref={ballGroupRef} transform={`translate(128, ${BALL_START_Y})`}>
              {/* Fluid Wake Streamline */}
              <path
                ref={wakePathRef}
                d="M -6 -6 Q -2 -20 0 -32 Q 2 -20 6 -6 Z"
                fill="#ffffff"
                opacity="0"
              />
              {/* Ball Drop Shadow */}
              <circle cx="1.5" cy="2.5" r="10" fill="#000000" fillOpacity="0.32" />
              {/* Ball Body */}
              <circle cx="0" cy="0" r="10" fill="url(#chromeBallGrad)" stroke="#334155" strokeWidth="0.6" />
              {/* Crisp Specular Highlight */}
              <circle cx="-3.5" cy="-3.5" r="2.8" fill="#ffffff" fillOpacity="0.85" />
            </g>

            {/* Viscometer Digital Console & Controls (x: 240..410) */}
            <g transform="translate(240, 96)">
              {/* OLED Stopwatch Bezel */}
              <rect
                x="0"
                y="0"
                width="170"
                height="136"
                rx="8"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />
              <text
                x="12"
                y="18"
                fontSize="9"
                fontWeight="800"
                fill={c.textMuted}
                letterSpacing="0.06em"
              >
                {pick('STOKES GATE TIMER', 'TIMER GERBANG STOKES', 'ストークスゲート計測')}
              </text>

              {/* Digital LCD Screen */}
              <rect
                x="10"
                y="26"
                width="150"
                height="40"
                rx="6"
                fill={c.oledBg}
                stroke={c.oledBorder}
                strokeWidth="1"
              />
              <text
                ref={stopwatchTextRef}
                x="85"
                y="53"
                fontSize="22"
                fontWeight="900"
                fill="#38bdf8"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
              >
                0.00 s
              </text>

              {/* Telemetry Rows */}
              <text x="12" y="83" fontSize="9.5" fontWeight="600" fill={c.textMuted}>
                {pick('Target Time:', 'Waktu Target:', '理論時間:')}
              </text>
              <text
                x="158"
                y="83"
                fontSize="10"
                fontWeight="700"
                fill={c.textMain}
                textAnchor="end"
                fontFamily="ui-monospace, monospace"
              >
                {physicsTimeSec.toFixed(2)} s
              </text>

              <text x="12" y="101" fontSize="9.5" fontWeight="600" fill={c.textMuted}>
                {pick('Ball Speed:', 'Laju Bola:', '落下速度:')}
              </text>
              <text
                x="158"
                y="101"
                fontSize="10"
                fontWeight="700"
                fill={c.textMain}
                textAnchor="end"
                fontFamily="ui-monospace, monospace"
              >
                {speedMmSec.toFixed(1)} mm/s
              </text>

              <text x="12" y="119" fontSize="9.5" fontWeight="600" fill={c.textMuted}>
                {pick('Viscosity:', 'Viskositas:', '動粘度:')}
              </text>
              <text
                x="158"
                y="119"
                fontSize="10.5"
                fontWeight="800"
                fill="#f59e0b"
                textAnchor="end"
                fontFamily="ui-monospace, monospace"
              >
                {kinematicViscosityCst.toFixed(1)} cSt
              </text>

              {/* Phase Status Pill */}
              <rect
                x="0"
                y="144"
                width="170"
                height="24"
                rx="5"
                fill={
                  ballPhase === 'dropping'
                    ? 'rgba(56,189,248,0.16)'
                    : ballPhase === 'done'
                      ? 'rgba(34,197,94,0.16)'
                      : isDark
                        ? 'rgba(148,163,184,0.12)'
                        : 'rgba(100,116,139,0.1)'
                }
                stroke={
                  ballPhase === 'dropping'
                    ? '#38bdf8'
                    : ballPhase === 'done'
                      ? '#22c55e'
                      : c.border
                }
                strokeWidth="0.8"
              />
              <text
                x="85"
                y="160"
                fontSize="9.5"
                fontWeight="700"
                fill={
                  ballPhase === 'dropping'
                    ? '#38bdf8'
                    : ballPhase === 'done'
                      ? '#22c55e'
                      : c.textMuted
                }
                textAnchor="middle"
              >
                {ballPhase === 'dropping'
                  ? pick('TIMING GATE A → B...', 'MENGUKUR A → B...', 'ゲートA→B計測中...')
                  : ballPhase === 'done'
                    ? pick('MEASUREMENT COMPLETE', 'PENGUKURAN SELESAI', '計測完了')
                    : pick('SPHERE READY AT TOP', 'BOLA SIAP DI ATAS', '球セット完了')}
              </text>

              {/* Drop Ball CTA Button */}
              <g
                className="cursor-pointer"
                onClick={handleDropBall}
                transform="translate(0, 178)"
              >
                <rect
                  x="0"
                  y="0"
                  width="170"
                  height="34"
                  rx="7"
                  fill={ballPhase === 'dropping' ? '#ca8a04' : '#f59e0b'}
                />
                <polygon points="22,11 32,17 22,23" fill="#0f172a" />
                <text
                  x="94"
                  y="21"
                  fontSize="11"
                  fontWeight="800"
                  fill="#0f172a"
                  textAnchor="middle"
                >
                  {ballPhase === 'dropping'
                    ? pick('DROPPING...', 'MELUNCUR...', '落下中...')
                    : pick('DROP BALL (START)', 'JATUHKAN BOLA', '落球スタート')}
                </text>
              </g>

              {/* Reset Sphere Button */}
              <g
                className="cursor-pointer"
                onClick={handleResetBall}
                transform="translate(0, 218)"
              >
                <rect
                  x="0"
                  y="0"
                  width="170"
                  height="28"
                  rx="6"
                  fill={c.subCardBg}
                  stroke={c.border}
                  strokeWidth="1"
                />
                <text
                  x="85"
                  y="18"
                  fontSize="10"
                  fontWeight="700"
                  fill={c.textMuted}
                  textAnchor="middle"
                >
                  {pick('RESET SPHERE TO TOP', 'RESET KE ATAS', '初期位置へ戻す')}
                </text>
              </g>

              {/* Stokes Drag Indicator Card */}
              <g transform="translate(0, 256)">
                <rect
                  x="0"
                  y="0"
                  width="170"
                  height="98"
                  rx="8"
                  fill={c.subCardBg}
                  stroke={c.border}
                  strokeWidth="1"
                />
                <text
                  x="85"
                  y="18"
                  fontSize="9.5"
                  fontWeight="700"
                  fill={c.textMain}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                >
                  v = 2r²(ρs − ρf)g / 9μ
                </text>
                <text
                  x="85"
                  y="33"
                  fontSize="8.5"
                  fontWeight="600"
                  fill={c.textMuted}
                  textAnchor="middle"
                >
                  {pick('Viscous Drag Resistance', 'Hambatan Geser Viskos', '粘性抵抗レベル')}
                </text>

                {/* Drag Progress Bar */}
                <rect
                  x="14"
                  y="44"
                  width="142"
                  height="10"
                  rx="5"
                  fill={isDark ? '#1e293b' : '#cbd5e1'}
                />
                <rect
                  x="14"
                  y="44"
                  width={Math.max(10, dragRatio * 142)}
                  height="10"
                  rx="5"
                  fill={oilColors.mid}
                />
                <text x="14" y="68" fontSize="8" fontWeight="600" fill={c.textMuted}>
                  {pick('Fast (Thin)', 'Cepat (Encer)', '低粘性・速')}
                </text>
                <text
                  x="156"
                  y="68"
                  fontSize="8"
                  fontWeight="600"
                  fill={c.textMuted}
                  textAnchor="end"
                >
                  {pick('Slow (Thick)', 'Lambat (Kental)', '高粘性・遅')}
                </text>
                <text
                  x="85"
                  y="86"
                  fontSize="8.5"
                  fontWeight="700"
                  fill={isDark ? '#fbbf24' : '#b45309'}
                  textAnchor="middle"
                >
                  {pick(
                    'Higher cSt = Slower Descent',
                    'cSt Tinggi = Bola Lambat',
                    '高cStほど降下速度が低下'
                  )}
                </text>
              </g>
            </g>

            {/* ---------------- RIGHT BAY: DRUM & THERMAL MONITOR ---------------- */}
            <rect
              x="434"
              y="62"
              width="330"
              height="402"
              rx="10"
              fill={c.panelBg}
              stroke={c.border}
              strokeWidth="1"
            />
            <text
              x="448"
              y="83"
              fontSize="10.5"
              fontWeight="800"
              fill={c.textMuted}
              letterSpacing="0.06em"
            >
              {pick(
                '208L INDUSTRIAL DRUM & THERMAL RESPONSE',
                'DRUM 208L & RESPON VISKOSITAS SUHU',
                '208L産業ドラム規格と温度・粘度特性'
              )}
            </text>

            {/* 208L Industrial Steel Drum CAD (x: 446..580, y: 102..388) */}
            <g transform="translate(448, 102)">
              {/* Floor shadow */}
              <ellipse cx="64" cy="274" rx="64" ry="10" fill="#000000" fillOpacity="0.28" />

              {/* Drum Cylinder */}
              <path
                d="M 4 24 L 4 260 A 60 13 0 0 0 124 260 L 124 24 Z"
                fill="url(#steelDrumGrad)"
                stroke="#475569"
                strokeWidth="1.4"
              />

              {/* Top Head Rim & Recessed Lid */}
              <ellipse
                cx="64"
                cy="24"
                rx="60"
                ry="13"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="2"
              />
              <ellipse
                cx="64"
                cy="24"
                rx="54"
                ry="10"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* 2" Main Bung & 3/4" Vent Bung */}
              <ellipse cx="42" cy="25" rx="8" ry="3.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="38" y1="25" x2="46" y2="25" stroke="#94a3b8" strokeWidth="1.2" />
              <ellipse cx="90" cy="22" rx="5" ry="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.9" />

              {/* Stamped Rolling Hoops (Ribs) with Top Highlight & Bottom Shadow */}
              {[90, 198].map((ribY) => (
                <g key={ribY}>
                  <path
                    d={`M 3 ${ribY + 3} A 61 11 0 0 0 125 ${ribY + 3}`}
                    fill="none"
                    stroke="#020617"
                    strokeWidth="3.5"
                  />
                  <path
                    d={`M 3 ${ribY} A 61 11 0 0 0 125 ${ribY}`}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="4.5"
                  />
                  <path
                    d={`M 5 ${ribY - 1} A 59 10 0 0 0 123 ${ribY - 1}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Stenciled Drum Specification Label Placard */}
              <rect
                x="14"
                y="108"
                width="100"
                height="74"
                rx="4"
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="1"
              />
              <rect x="14" y="108" width="100" height="16" rx="3" fill={oilColors.mid} />
              <text
                x="64"
                y="119"
                fontSize="8"
                fontWeight="800"
                fill="#0f172a"
                textAnchor="middle"
              >
                {activeFamily.shortCode.split('(')[0].trim().toUpperCase()}
              </text>
              <text
                x="64"
                y="145"
                fontSize="17"
                fontWeight="900"
                fill="#0f172a"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
              >
                ISO VG {isoVg}
              </text>
              <text
                x="64"
                y="160"
                fontSize="7.5"
                fontWeight="700"
                fill="#334155"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
              >
                40°C: {isoVg} cSt (±10%)
              </text>
              <text
                x="64"
                y="173"
                fontSize="7"
                fontWeight="600"
                fill="#64748b"
                textAnchor="middle"
              >
                ISO 3448 CERTIFIED
              </text>

              {/* NFPA-704 Mini Diamond & Drum Volume Stencil */}
              <g transform="translate(18, 218)">
                <polygon points="10,0 20,10 10,20 0,10" fill="#ffffff" stroke="#64748b" strokeWidth="0.6" />
                <polygon points="10,0 20,10 10,10" fill="#ef4444" />
                <polygon points="0,10 10,10 10,20" fill="#3b82f6" />
                <polygon points="10,10 20,10 10,20" fill="#eab308" />
              </g>
              <text
                x="46"
                y="232"
                fontSize="8.5"
                fontWeight="700"
                fill="#cbd5e1"
                fontFamily="ui-monospace, monospace"
              >
                208 L / 55 GAL
              </text>
            </g>

            {/* Compact Drum Family Summary Badge underneath drum (y: 394..450) */}
            <g transform="translate(448, 394)">
              <rect
                x="0"
                y="0"
                width="132"
                height="56"
                rx="7"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />
              <text x="10" y="17" fontSize="8.5" fontWeight="700" fill={c.textMuted}>
                {pick('BASE OIL GRADE', 'BASIS OLI', '基油タイプ')}
              </text>
              <text
                x="10"
                y="34"
                fontSize="11"
                fontWeight="800"
                fill={c.textMain}
              >
                {activeFamily.baseType === 'synthetic'
                  ? 'PAO Synthetic (H1)'
                  : 'Refined Mineral'}
              </text>
              <text x="10" y="47" fontSize="8.5" fontWeight="600" fill="#f59e0b">
                VI ≈ {activeFamily.baseType === 'synthetic' ? '145' : '98'}
              </text>
            </g>

            {/* Thermometer Panel (x: 594..750, y: 96..288) — ZERO OVERLAP! */}
            <g transform="translate(594, 96)">
              <rect
                x="0"
                y="0"
                width="156"
                height="192"
                rx="8"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />

              {/* Thermometer Stem & Bulb */}
              <rect
                x="18"
                y="14"
                width="16"
                height="144"
                rx="8"
                fill={isDark ? '#020617' : '#e2e8f0'}
                stroke={c.border}
                strokeWidth="1.2"
              />
              {/* Active Mercury/Alcohol Column (map back into local group coords: y=150 for 10C to y=22 for 90C) */}
              {(() => {
                const localMercTop = mercuryTopY - 96; // 150 at 10C, 22 at 90C
                return (
                  <>
                    <rect
                      x="21"
                      y={localMercTop}
                      width="10"
                      height={168 - localMercTop}
                      rx="4"
                      fill="#ef4444"
                    />
                    <circle cx="26" cy="170" r="13" fill="#ef4444" stroke={c.border} strokeWidth="1.2" />
                    <circle cx="22" cy="166" r="3.5" fill="#fecaca" />
                  </>
                );
              })()}

              {/* Thermometer Scale Ticks (10..90°C mapped into y=150..22, 25.6px spacing) */}
              {[90, 75, 60, 40, 25, 10].map((t) => {
                const localTickY = 150 - ((t - 10) / 80) * 128;
                const isIsoRef = t === 40;
                return (
                  <g key={t}>
                    <line
                      x1="38"
                      y1={localTickY}
                      x2={isIsoRef ? '50' : '45'}
                      y2={localTickY}
                      stroke={isIsoRef ? '#f59e0b' : c.textMuted}
                      strokeWidth={isIsoRef ? '2' : '1'}
                    />
                    {isIsoRef ? (
                      <>
                        <rect
                          x="54"
                          y={localTickY - 8}
                          width="88"
                          height="16"
                          rx="3"
                          fill="rgba(245,158,11,0.18)"
                          stroke="#f59e0b"
                          strokeWidth="0.8"
                        />
                        <text
                          x="98"
                          y={localTickY + 3.5}
                          fontSize="9"
                          fontWeight="800"
                          fill={isDark ? '#fbbf24' : '#b45309'}
                          textAnchor="middle"
                          fontFamily="ui-monospace, monospace"
                        >
                          40°C ISO REF
                        </text>
                      </>
                    ) : (
                      <text
                        x="56"
                        y={localTickY + 3.5}
                        fontSize="9.5"
                        fontWeight="600"
                        fill={c.textMuted}
                        fontFamily="ui-monospace, monospace"
                      >
                        {t} °C
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Operating Viscosity Readout Card (x: 594..750, y: 298..450) */}
            <g transform="translate(594, 298)">
              <rect
                x="0"
                y="0"
                width="156"
                height="152"
                rx="8"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />
              <text
                x="12"
                y="20"
                fontSize="9"
                fontWeight="800"
                fill={c.textMuted}
                letterSpacing="0.04em"
              >
                {pick('ACTUAL VISCOSITY', 'VISKOSITAS AKTUAL', '実運転動粘度')}
              </text>

              <text
                x="12"
                y="50"
                fontSize="24"
                fontWeight="900"
                fill="#f59e0b"
                fontFamily="ui-monospace, monospace"
              >
                {kinematicViscosityCst.toFixed(1)}
                <tspan fontSize="11.5" fontWeight="700" dx="4">
                  cSt
                </tspan>
              </text>

              <line x1="12" y1="62" x2="144" y2="62" stroke={c.border} strokeWidth="1" />

              <text x="12" y="80" fontSize="9" fontWeight="600" fill={c.textMuted}>
                {pick('vs 40 °C:', 'vs 40 °C:', '40°C比:')}
              </text>
              <text
                x="144"
                y="80"
                fontSize="10"
                fontWeight="800"
                fill={pctDeltaVs40 <= 0 ? '#38bdf8' : '#f97316'}
                textAnchor="end"
                fontFamily="ui-monospace, monospace"
              >
                {pctDeltaVs40 > 0 ? `+${pctDeltaVs40.toFixed(0)}%` : `${pctDeltaVs40.toFixed(0)}%`}
              </text>

              {/* Fluid State Badge */}
              <rect
                x="12"
                y="92"
                width="132"
                height="24"
                rx="5"
                fill={
                  tempC < 25
                    ? 'rgba(56,189,248,0.16)'
                    : tempC > 70
                      ? 'rgba(239,68,68,0.16)'
                      : 'rgba(34,197,94,0.16)'
                }
              />
              <text
                x="78"
                y="108"
                fontSize="9.5"
                fontWeight="800"
                fill={
                  tempC < 25 ? '#38bdf8' : tempC > 70 ? '#ef4444' : '#22c55e'
                }
                textAnchor="middle"
              >
                {tempC < 25
                  ? pick('Cold / High Drag', 'Dingin / Kental', '低温・高抵抗')
                  : tempC > 70
                    ? pick('Hot / Thin Film', 'Panas / Tipis', '高温・油膜薄')
                    : pick('Optimum Oil Film', 'Film Oli Optimal', '最適油膜状態')}
              </text>

              <text
                x="78"
                y="138"
                fontSize="8.5"
                fontWeight="600"
                fill={c.textMuted}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
              >
                Walther @ {tempC} °C
              </text>
            </g>
          </g>
        )}

        {/* ========================================================= */}
        {/* MODE 2: GREASE PENETROMETER & COMPATIBILITY GAUGE         */}
        {/* ========================================================= */}
        {mode === 'grease' && (
          <g id="greaseModeCad">
            {/* Top Instrument Header Bar */}
            <rect
              x="16"
              y="14"
              width="748"
              height="38"
              rx="8"
              fill={c.panelBg}
              stroke={c.border}
              strokeWidth="1"
            />
            <rect
              x="28"
              y="24"
              width="18"
              height="18"
              rx="4"
              fill={activeThickener1.colorHex}
              stroke={c.border}
              strokeWidth="1"
            />
            <text
              x="56"
              y="37"
              fontSize="13"
              fontWeight="700"
              fill={c.textMain}
              fontFamily="system-ui, sans-serif"
            >
              {pick(
                `ASTM D217 Penetrometer  •  NLGI Grade ${activeNlgi.grade} (${activeNlgi.workedPenetrationMid} mm/10)`,
                `Penetrometer ASTM D217  •  NLGI Kelas ${activeNlgi.grade} (${activeNlgi.workedPenetrationMid} mm/10)`,
                `ASTM D217 ちょう度試験機  •  NLGI ${activeNlgi.grade}号 (${activeNlgi.workedPenetrationMid} mm/10)`
              )}
            </text>

            {/* Right Header Status Pill (Isolated x: 546..754) */}
            <rect
              x="546"
              y="20"
              width="208"
              height="26"
              rx="6"
              fill={
                compatResult.status === 'Compatible'
                  ? 'rgba(34,197,94,0.14)'
                  : compatResult.status === 'Caution'
                    ? 'rgba(245,158,11,0.14)'
                    : 'rgba(239,68,68,0.16)'
              }
              stroke={compatResult.colorHex}
              strokeWidth="1"
            />
            <text
              x="650"
              y="37"
              fontSize="10"
              fontWeight="800"
              fill={compatResult.colorHex}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              {compatResult.status.toUpperCase()}
            </text>

            {/* ---------------- LEFT BAY: ASTM D217 PENETROMETER ---------------- */}
            <rect
              x="16"
              y="62"
              width="380"
              height="402"
              rx="10"
              fill={c.panelBg}
              stroke={c.border}
              strokeWidth="1"
            />
            <text
              x="30"
              y="83"
              fontSize="10.5"
              fontWeight="800"
              fill={c.textMuted}
              letterSpacing="0.06em"
            >
              {pick(
                'ASTM D217 CONE PENETROMETER (150g CONE, 25 °C)',
                'PENETROMETER KERUCUT ASTM D217 (150g, 25 °C)',
                'ASTM D217 円錐針入度試験機（150g円錐・25 °C）'
              )}
            </text>

            {/* Heavy Cast-Iron Base Plate + Cup Centering Ring */}
            <rect x="42" y="446" width="24" height="6" rx="2" fill="#0f172a" />
            <rect x="202" y="446" width="24" height="6" rx="2" fill="#0f172a" />
            <path
              d="M 32 418 L 236 418 L 242 446 L 26 446 Z"
              fill="url(#castIronGrad)"
              stroke="#475569"
              strokeWidth="1.2"
            />
            <rect x="86" y="412" width="116" height="6" rx="2" fill="#64748b" />

            {/* Vertical Precision Guide Column + Rack Teeth */}
            <rect
              x="44"
              y="98"
              width="12"
              height="320"
              rx="2"
              fill="url(#stainlessRodGrad)"
              stroke="#475569"
              strokeWidth="0.9"
            />
            {Array.from({ length: 16 }).map((_, idx) => (
              <rect
                key={idx}
                x="56"
                y={114 + idx * 14}
                width="4"
                height="4"
                fill="#475569"
              />
            ))}

            {/* Cantilevered Head Support Arm */}
            <rect
              x="38"
              y="124"
              width="24"
              height="24"
              rx="3"
              fill="#334155"
              stroke="#64748b"
              strokeWidth="1"
            />
            <path
              d="M 62 132 L 144 132 L 144 188"
              fill="none"
              stroke="#64748b"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <rect x="30" y="133" width="8" height="6" rx="1" fill="#eab308" />

            {/* Precision Dial Indicator Gauge (cx=144, cy=136, r=40) */}
            <g transform="translate(144, 136)">
              <circle cx="0" cy="0" r="42" fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="37" fill="#f8fafc" />

              {/* Major & Minor Dial Ticks across -145..+145 deg */}
              {Array.from({ length: 19 }).map((_, idx) => {
                const deg = -145 + (idx / 18) * 290;
                const rad = (deg * Math.PI) / 180;
                const isMajor = idx % 2 === 0;
                const rInner = isMajor ? 28 : 32;
                const rOuter = 35;
                return (
                  <line
                    key={idx}
                    x1={Math.sin(rad) * rInner}
                    y1={-Math.cos(rad) * rInner}
                    x2={Math.sin(rad) * rOuter}
                    y2={-Math.cos(rad) * rOuter}
                    stroke="#334155"
                    strokeWidth={isMajor ? '1.8' : '0.9'}
                  />
                );
              })}

              {/* Dial Numerals */}
              <text x="-21" y="21" fontSize="6.5" fontWeight="800" fill="#0f172a" textAnchor="middle">
                0
              </text>
              <text x="-23" y="-7" fontSize="6.5" fontWeight="800" fill="#0f172a" textAnchor="middle">
                100
              </text>
              <text x="0" y="-20" fontSize="6.5" fontWeight="800" fill="#0f172a" textAnchor="middle">
                225
              </text>
              <text x="23" y="-7" fontSize="6.5" fontWeight="800" fill="#0f172a" textAnchor="middle">
                350
              </text>
              <text x="20" y="21" fontSize="6.5" fontWeight="800" fill="#0f172a" textAnchor="middle">
                450
              </text>

              {/* Center Hub & Red Needle */}
              <line
                ref={dialNeedleRef}
                x1="0"
                y1="0"
                x2="0"
                y2="-28"
                stroke="#ef4444"
                strokeWidth="2.2"
                strokeLinecap="round"
                filter="url(#cadShadow)"
              />
              <circle cx="0" cy="0" r="4" fill="#0f172a" />
              <circle cx="0" cy="0" r="1.8" fill="#ef4444" />
            </g>

            {/* Plunger Release Clutch */}
            <rect
              x="132"
              y="184"
              width="24"
              height="18"
              rx="3"
              fill="#334155"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <circle cx="158" cy="193" r="3.5" fill="#eab308" />

            {/* Vertical Plunger Shaft */}
            <line
              ref={plungerLineRef}
              x1="144"
              y1="202"
              x2="144"
              y2={GREASE_SURFACE_Y + targetPenetrationPx - 42}
              stroke="url(#stainlessRodGrad)"
              strokeWidth="4.5"
            />

            {/* Cutaway Brass/Steel ASTM D217 Grease Sample Cup (x: 92..196, y: 302..412) */}
            <g>
              {/* Cup Outer Body */}
              <rect
                x="92"
                y="302"
                width="104"
                height="110"
                rx="3"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="1.5"
              />
              {/* Cutaway Section Hatched Walls */}
              <rect x="93" y="303" width="7" height="108" fill="url(#cadHatch)" />
              <rect x="188" y="303" width="7" height="108" fill="url(#cadHatch)" />
              <rect x="93" y="404" width="102" height="7" fill="url(#cadHatch)" />

              {/* Grease Sample Fill */}
              <rect
                x="100"
                y={GREASE_SURFACE_Y}
                width="88"
                height={404 - GREASE_SURFACE_Y}
                fill={activeThickener1.colorHex}
                fillOpacity="0.88"
              />
              {/* Consistency Swirl Highlights inside Grease */}
              <path
                d="M 105 330 Q 125 322 144 330 T 183 326 M 105 358 Q 130 350 155 358 T 183 355"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeOpacity="0.28"
              />
              {/* Grease Top Level Line */}
              <line
                x1="100"
                y1={GREASE_SURFACE_Y}
                x2="188"
                y2={GREASE_SURFACE_Y}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeOpacity="0.5"
              />

              {/* Crater Indentation formed by Cone */}
              <polygon
                ref={craterPolyRef}
                points={`144,${GREASE_SURFACE_Y + targetPenetrationPx} 124,${GREASE_SURFACE_Y} 164,${GREASE_SURFACE_Y}`}
                fill="#020617"
                opacity="0.35"
              />

              {/* Cup Spec Plaque */}
              <rect x="108" y="380" width="72" height="18" rx="3" fill="rgba(15,23,42,0.85)" />
              <text
                x="144"
                y="392"
                fontSize="8.5"
                fontWeight="800"
                fill="#f8fafc"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
              >
                NLGI {activeNlgi.grade} CUP
              </text>
            </g>

            {/* Standard 150g Double-Tapered ASTM D217 Brass/Steel Cone */}
            <g
              ref={coneGroupRef}
              transform={`translate(144, ${GREASE_SURFACE_Y + targetPenetrationPx})`}
            >
              {/* Upper 90-degree brass collar */}
              <polygon
                points="-22,-42 22,-42 15,-34 -15,-34"
                fill="url(#brassConeGrad)"
                stroke="#713f12"
                strokeWidth="0.9"
              />
              {/* Lower 30-degree hardened tip */}
              <polygon
                points="-15,-34 15,-34 0,0"
                fill="url(#stainlessRodGrad)"
                stroke="#334155"
                strokeWidth="0.9"
              />
              {/* Specular cone highlight */}
              <polygon points="-9,-34 -3,-34 0,0" fill="#ffffff" fillOpacity="0.45" />
            </g>

            {/* Clean Penetration Depth Dimension Callout (x: 202..246) */}
            <g ref={dimGroupRef} opacity="1">
              <line
                x1="198"
                y1={GREASE_SURFACE_Y}
                x2="210"
                y2={GREASE_SURFACE_Y}
                stroke="#ef4444"
                strokeWidth="1"
              />
              <line
                ref={dimBottomTickRef}
                x1="198"
                y1={GREASE_SURFACE_Y + targetPenetrationPx}
                x2="210"
                y2={GREASE_SURFACE_Y + targetPenetrationPx}
                stroke="#ef4444"
                strokeWidth="1"
              />
              <line
                ref={dimLineRef}
                x1="205"
                y1={GREASE_SURFACE_Y}
                x2="205"
                y2={GREASE_SURFACE_Y + targetPenetrationPx}
                stroke="#ef4444"
                strokeWidth="1.5"
              />
              <text
                ref={dimTextRef}
                x="212"
                y={GREASE_SURFACE_Y + targetPenetrationPx / 2 + 3}
                fontSize="8.5"
                fontWeight="800"
                fill="#ef4444"
                fontFamily="ui-monospace, monospace"
              >
                {(activeNlgi.workedPenetrationMid / 10).toFixed(1)} mm
              </text>
            </g>

            {/* Penetrometer Right Console (x: 256..384, width 128px — zero overlap!) */}
            <g transform="translate(256, 96)">
              {/* Digital Penetration Readout */}
              <rect
                x="0"
                y="0"
                width="128"
                height="72"
                rx="8"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />
              <text x="10" y="16" fontSize="8" fontWeight="800" fill={c.textMuted}>
                {pick('PENETRATION', 'PENETRASI', '針入度')}
              </text>
              <rect x="8" y="22" width="112" height="30" rx="5" fill={c.oledBg} />
              <text
                x="64"
                y="43"
                fontSize="16"
                fontWeight="900"
                fill="#fbbf24"
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
              >
                <tspan ref={penValTextRef}>{activeNlgi.workedPenetrationMid}</tspan>
                <tspan fontSize="9" fontWeight="600" dx="3" fill="#94a3b8">
                  mm/10
                </tspan>
              </text>
              <text
                ref={penMmTextRef}
                x="64"
                y="65"
                fontSize="8.5"
                fontWeight="700"
                fill={c.textMuted}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
              >
                = {(activeNlgi.workedPenetrationMid / 10).toFixed(1)} mm
              </text>

              {/* Release Cone CTA */}
              <g
                className="cursor-pointer"
                onClick={handleReleaseCone}
                transform="translate(0, 82)"
              >
                <rect x="0" y="0" width="128" height="32" rx="6" fill="#f59e0b" />
                <text
                  x="64"
                  y="20"
                  fontSize="10"
                  fontWeight="800"
                  fill="#0f172a"
                  textAnchor="middle"
                >
                  {coneRetracted
                    ? pick('RELEASE CONE', 'LEPAS KERUCUT', '円錐を落下')
                    : pick('RE-DROP CONE', 'ULANGI UJI', '再落下テスト')}
                </text>
              </g>

              {/* Retract Cone Button */}
              <g
                className="cursor-pointer"
                onClick={handleRetractCone}
                transform="translate(0, 120)"
              >
                <rect
                  x="0"
                  y="0"
                  width="128"
                  height="26"
                  rx="6"
                  fill={c.subCardBg}
                  stroke={c.border}
                  strokeWidth="1"
                />
                <text
                  x="64"
                  y="17"
                  fontSize="9"
                  fontWeight="700"
                  fill={c.textMuted}
                  textAnchor="middle"
                >
                  {pick('RETRACT CONE', 'TARIK KERUCUT', '円錐を引き上げ')}
                </text>
              </g>

              {/* Consistency & Food Analogy Card */}
              <g transform="translate(0, 156)">
                <rect
                  x="0"
                  y="0"
                  width="128"
                  height="94"
                  rx="8"
                  fill={c.subCardBg}
                  stroke={c.border}
                  strokeWidth="1"
                />
                <text x="10" y="16" fontSize="8" fontWeight="800" fill={c.textMuted}>
                  {pick('CONSISTENCY', 'KONSISTENSI', '硬さ・食感例え')}
                </text>
                <text x="10" y="34" fontSize="11.5" fontWeight="900" fill="#f59e0b">
                  NLGI Grade {activeNlgi.grade}
                </text>
                {wrapSvgLines(activeNlgi.textureDescription, 19, 2).map((ln, idx) => (
                  <text
                    key={idx}
                    x="10"
                    y={49 + idx * 12}
                    fontSize="8.5"
                    fontWeight="600"
                    fill={c.textMain}
                  >
                    {ln}
                  </text>
                ))}
                <text x="10" y="75" fontSize="7.5" fontWeight="700" fill={c.textMuted}>
                  {pick('LIKE:', 'SEPERTI:', '例え:')}
                </text>
                <text x="10" y="86" fontSize="8.2" fontWeight="600" fill={c.textMuted}>
                  {wrapSvgLines(activeNlgi.foodAnalogy, 20, 1)[0]}
                </text>
              </g>

              {/* ASTM D217 Spec Range Card */}
              <g transform="translate(0, 260)">
                <rect
                  x="0"
                  y="0"
                  width="128"
                  height="54"
                  rx="8"
                  fill={c.subCardBg}
                  stroke={c.border}
                  strokeWidth="1"
                />
                <text x="64" y="17" fontSize="8" fontWeight="800" fill={c.textMuted} textAnchor="middle">
                  ASTM D217 RANGE
                </text>
                <text
                  x="64"
                  y="34"
                  fontSize="12"
                  fontWeight="800"
                  fill={c.textMain}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                >
                  {activeNlgi.workedPenetrationRange[0]}–{activeNlgi.workedPenetrationRange[1]}
                </text>
                <text x="64" y="46" fontSize="8" fontWeight="600" fill={c.textMuted} textAnchor="middle">
                  mm/10 (60 strokes)
                </text>
              </g>
            </g>

            {/* ---------------- RIGHT BAY: COMPATIBILITY GAUGE ---------------- */}
            <rect
              x="408"
              y="62"
              width="356"
              height="402"
              rx="10"
              fill={c.panelBg}
              stroke={c.border}
              strokeWidth="1"
            />
            <text
              x="422"
              y="83"
              fontSize="10.5"
              fontWeight="800"
              fill={c.textMuted}
              letterSpacing="0.06em"
            >
              {pick(
                '2-GREASE COMPATIBILITY GAUGE (ASTM D6185)',
                'GAUGE KOMPATIBILITAS 2-GEMUK (ASTM D6185)',
                '異種グリース混和適合性ゲージ（ASTM D6185）'
              )}
            </text>

            {/* High-Contrast Semi-Circular Gauge (cx: 586, cy: 186, r: 66) */}
            <g transform="translate(586, 186)">
              {/* Outer metallic housing arc */}
              <path
                d="M -78 0 A 78 78 0 0 1 78 0"
                fill="none"
                stroke={c.border}
                strokeWidth="1.8"
              />
              {/* Background gauge track */}
              <path
                d="M -66 0 A 66 66 0 0 1 66 0"
                fill="none"
                stroke={c.subCardBg}
                strokeWidth="15"
              />

              {/* Segmented Zones: Green (180..120 deg), Amber (120..60 deg), Red (60..0 deg) */}
              {/* 120 deg = (-33, -57.16), 60 deg = (+33, -57.16) */}
              <path
                d="M -66 0 A 66 66 0 0 1 -33 -57.16"
                fill="none"
                stroke="#22c55e"
                strokeWidth="14"
                opacity={compatResult.status === 'Compatible' ? 1 : 0.35}
              />
              <path
                d="M -33 -57.16 A 66 66 0 0 1 33 -57.16"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="14"
                opacity={compatResult.status === 'Caution' ? 1 : 0.35}
              />
              <path
                d="M 33 -57.16 A 66 66 0 0 1 66 0"
                fill="none"
                stroke="#ef4444"
                strokeWidth="14"
                opacity={compatResult.status === 'Incompatible — Do Not Mix!' ? 1 : 0.35}
              />

              {/* Crisp Outer Arc Labels (Zero overlap with arc!) */}
              <text
                x="-66"
                y="15"
                fontSize="8.5"
                fontWeight="800"
                fill="#22c55e"
                textAnchor="middle"
              >
                COMPATIBLE
              </text>
              <text
                x="0"
                y="-86"
                fontSize="8.5"
                fontWeight="800"
                fill="#f59e0b"
                textAnchor="middle"
              >
                CAUTION
              </text>
              <text
                x="66"
                y="15"
                fontSize="8.5"
                fontWeight="800"
                fill="#ef4444"
                textAnchor="middle"
              >
                DO NOT MIX
              </text>

              {/* Tapered Metallic Pointer Needle */}
              <g filter="url(#cadShadow)">
                <line
                  x1="0"
                  y1="0"
                  x2={Math.sin(compatRad) * 56}
                  y2={-Math.cos(compatRad) * 56}
                  stroke={compatResult.colorHex}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="0" r="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="0" cy="0" r="3.5" fill={compatResult.colorHex} />
              </g>
            </g>

            {/* Verdict Banner (x: 424..748, y: 212..246) */}
            <g transform="translate(424, 212)">
              <rect
                x="0"
                y="0"
                width="324"
                height="32"
                rx="6"
                fill={
                  compatResult.status === 'Compatible'
                    ? 'rgba(34,197,94,0.16)'
                    : compatResult.status === 'Caution'
                      ? 'rgba(245,158,11,0.16)'
                      : 'rgba(239,68,68,0.18)'
                }
                stroke={compatResult.colorHex}
                strokeWidth="1.4"
              />
              <text
                x="162"
                y="20.5"
                fontSize="11.5"
                fontWeight="900"
                fill={compatResult.colorHex}
                textAnchor="middle"
                letterSpacing="0.04em"
              >
                {compatResult.status.toUpperCase()}
              </text>
            </g>

            {/* Grease 1 + Grease 2 Pair Cards (x: 424..748, y: 254..316) */}
            <g transform="translate(424, 254)">
              {/* Grease 1 Box */}
              <rect
                x="0"
                y="0"
                width="146"
                height="58"
                rx="7"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />
              <circle cx="13" cy="15" r="5" fill={activeThickener1.colorHex} />
              <text x="23" y="18" fontSize="8" fontWeight="700" fill={c.textMuted}>
                {pick('EXISTING GREASE', 'GEMUK LAMA', '既存グリース')}
              </text>
              <text x="10" y="34" fontSize="10.5" fontWeight="800" fill={c.textMain}>
                {shortThickenerLabel(thickener1Id)}
              </text>
              <text x="10" y="48" fontSize="8" fontWeight="600" fill={c.textMuted}>
                Drop: {activeThickener1.droppingPointC === 'Non-Melting' ? 'Non-Melting' : `${activeThickener1.droppingPointC} °C`}
              </text>

              {/* Plus Circle */}
              <circle cx="162" cy="29" r="10" fill={c.subCardBg} stroke={c.border} strokeWidth="1" />
              <text
                x="162"
                y="33.5"
                fontSize="13"
                fontWeight="900"
                fill={c.textMuted}
                textAnchor="middle"
              >
                +
              </text>

              {/* Grease 2 Box */}
              <rect
                x="178"
                y="0"
                width="146"
                height="58"
                rx="7"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />
              <circle cx="191" cy="15" r="5" fill={activeThickener2.colorHex} />
              <text x="201" y="18" fontSize="8" fontWeight="700" fill={c.textMuted}>
                {pick('ADDED GREASE', 'GEMUK BARU', '追加グリース')}
              </text>
              <text x="188" y="34" fontSize="10.5" fontWeight="800" fill={c.textMain}>
                {shortThickenerLabel(thickener2Id)}
              </text>
              <text x="188" y="48" fontSize="8" fontWeight="600" fill={c.textMuted}>
                Drop: {activeThickener2.droppingPointC === 'Non-Melting' ? 'Non-Melting' : `${activeThickener2.droppingPointC} °C`}
              </text>
            </g>

            {/* Reaction Mechanism & Directive Card (Native SVG Wrapped Lines — Zero Clipping!) */}
            <g transform="translate(424, 322)">
              <rect
                x="0"
                y="0"
                width="324"
                height="130"
                rx="8"
                fill={c.subCardBg}
                stroke={c.border}
                strokeWidth="1"
              />
              <text x="12" y="18" fontSize="8.5" fontWeight="800" fill={c.textMain}>
                {pick('CHEMICAL REACTION:', 'REAKSI KIMIA:', '化学反応メカニズム:')}
              </text>
              {consequenceLines.map((line, idx) => (
                <text
                  key={idx}
                  x="12"
                  y={33 + idx * 13}
                  fontSize="9"
                  fontWeight="500"
                  fill={c.textMuted}
                >
                  {line}
                </text>
              ))}

              <line x1="12" y1="74" x2="312" y2="74" stroke={c.border} strokeWidth="1" />

              <text x="12" y="90" fontSize="8.5" fontWeight="800" fill={compatResult.colorHex}>
                {pick('MAINTENANCE ACTION:', 'TINDAKAN PERAWATAN:', '現場保全アクション:')}
              </text>
              {recommendationLines.map((line, idx) => (
                <text
                  key={idx}
                  x="12"
                  y={105 + idx * 13}
                  fontSize="9"
                  fontWeight="700"
                  fill={compatResult.colorHex}
                >
                  {line}
                </text>
              ))}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
