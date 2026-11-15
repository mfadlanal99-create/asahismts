import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { UtmInstantaneousState, UtmTestInputs } from './utmTestingData';

interface UtmMachineSvgProps {
  inputs: UtmTestInputs;
  state: UtmInstantaneousState;
  isMounted: boolean;
  isRunning: boolean;
  isEStopped: boolean;
  peakForceKn: number;
  safetyDoorClosed: boolean;
  onStartPause: () => void;
  onEmergencyStop: () => void;
  onReset: () => void;
  onToggleSafetyDoor: () => void;
}

export function UtmMachineSvg({
  inputs,
  state,
  isMounted,
  isRunning,
  isEStopped,
  peakForceKn,
  safetyDoorClosed,
  onStartPause,
  onEmergencyStop,
  onReset,
  onToggleSafetyDoor,
}: UtmMachineSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const { mode, material, diameterMm, gaugeLengthMm } = inputs;
  const {
    extensionMm,
    forceKn,
    isYielded,
    isNecking,
    isFractured,
    stressHeatmapRatio,
    currentCenterDiameterMm,
    currentEndDiameterMm,
    fractureGapMm,
  } = state;

  // Frame coordinates & dimensions (viewBox="0 0 530 480")
  const BASE_Y_TOP_FIXTURE = 165;
  const BASE_Y_CROSSHEAD = 320;
  const BASE_SPAN = BASE_Y_CROSSHEAD - BASE_Y_TOP_FIXTURE; // 155 px

  // Scale factor: map mm to SVG pixels
  const pxPerMm = Math.min(2.5, Math.max(1.0, BASE_SPAN / gaugeLengthMm));

  // Current moving crosshead Y coordinate
  const crossheadY = useMemo(() => {
    if (!isMounted) return BASE_Y_CROSSHEAD;
    if (mode === 'tensile') {
      const travelPx = extensionMm * pxPerMm;
      return BASE_Y_CROSSHEAD + travelPx;
    } else {
      const travelPx = extensionMm * pxPerMm;
      return Math.max(BASE_Y_TOP_FIXTURE + 35, BASE_Y_CROSSHEAD - travelPx);
    }
  }, [isMounted, mode, extensionMm, pxPerMm]);

  // Animated Leadscrew Thread Scroll Offset (simulates rotating ball-screw)
  const threadScrollOffset = useMemo(() => {
    // Scroll repeats every 10 px
    return (extensionMm * 14) % 10;
  }, [extensionMm]);

  // Specimen gauge visual thickness in SVG pixels
  const baseDiameterPx = Math.min(26, Math.max(12, diameterMm * 1.45));
  const centerDiameterPx = (currentCenterDiameterMm / diameterMm) * baseDiameterPx;
  const endDiameterPx = (currentEndDiameterMm / diameterMm) * baseDiameterPx;

  // Dynamic Specimen Heatmap Color
  const baseMatColor = material.color;
  const stressColor = useMemo(() => {
    if (isFractured) return baseMatColor;
    if (stressHeatmapRatio > 0.85) return '#ef4444'; // Red peak UTS
    if (stressHeatmapRatio > 0.55) return '#f59e0b'; // Amber yield
    if (stressHeatmapRatio > 0.25) return '#3b82f6'; // Blue elastic
    return baseMatColor;
  }, [stressHeatmapRatio, isFractured, baseMatColor]);

  // Color theme palettes
  const c = useMemo(() => {
    return {
      frameDark: isDark ? '#1e293b' : '#334155',
      frameMed: isDark ? '#334155' : '#64748b',
      frameLight: isDark ? '#475569' : '#94a3b8',
      frameBg: isDark ? '#0b0f19' : '#f8fafc',
      screwThread: isDark ? '#64748b' : '#cbd5e1',
      gripSteel: isDark ? '#27272a' : '#e4e4e7',
      gripSteelBorder: isDark ? '#52525b' : '#a1a1aa',
      loadCellBody: isDark ? '#1e1b4b' : '#ede9fe',
      loadCellBorder: isDark ? '#6366f1' : '#8b5cf6',
      extensometer: isDark ? '#0284c7' : '#0369a1',
      oledBg: '#020617',
      oledBorder: isDark ? '#1e293b' : '#cbd5e1',
      textMain: isDark ? '#f1f5f9' : '#0f172a',
      textMuted: isDark ? '#94a3b8' : '#64748b',
    };
  }, [isDark]);

  // Fixture coordinates
  const topFixtureY = BASE_Y_TOP_FIXTURE;
  const bottomFixtureY = crossheadY;
  const midGaugeY = (topFixtureY + bottomFixtureY) / 2;
  const specimenCenterX = 210;

  // Load cell load percentage (relative to 50 kN max)
  const loadPercentage = Math.min(100, Math.max(0, (forceKn / 50) * 100));

  // Machine status display badge
  const machineStatus = useMemo(() => {
    if (isEStopped) {
      return {
        label: pick('E-STOP', 'DARURAT', '非常停止'),
        color: '#ef4444',
      };
    }
    if (!isMounted) {
      return {
        label: pick('NO SPECIMEN', 'KOSONG', '未装填'),
        color: '#64748b',
      };
    }
    if (isFractured) {
      return {
        label: pick('RUPTURE', 'PATAH', '破断'),
        color: '#f43f5e',
      };
    }
    if (isRunning) {
      if (isNecking) {
        return {
          label: pick('NECKING', 'NECKING', '局部くびれ'),
          color: '#f59e0b',
        };
      }
      if (isYielded) {
        return {
          label: pick('YIELDING', 'LULUH', '降伏中'),
          color: '#eab308',
        };
      }
      return {
        label: pick('RUNNING', 'PENGUJIAN', '試験中'),
        color: '#10b981',
      };
    }
    return {
      label: pick('READY', 'SIAP', '待機中'),
      color: '#3b82f6',
    };
  }, [isEStopped, isMounted, isFractured, isRunning, isYielded, isNecking, pick]);

  // Specimen SVG rendering
  const specimenSvg = useMemo(() => {
    if (!isMounted) {
      return (
        <g opacity={0.35}>
          <line
            x1={specimenCenterX}
            y1={topFixtureY + 10}
            x2={specimenCenterX}
            y2={bottomFixtureY - 10}
            stroke={c.textMuted}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text
            x={specimenCenterX}
            y={midGaugeY}
            fill={c.textMuted}
            fontSize="9"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {pick('[ NO SPECIMEN ]', '[ SPESIMEN KOSONG ]', '[ 試験片未装填 ]')}
          </text>
        </g>
      );
    }

    if (mode === 'tensile') {
      const topClampY = topFixtureY;
      const botClampY = bottomFixtureY;
      const gaugeHeight = botClampY - topClampY;
      const rEnd = endDiameterPx / 2;
      const rCenter = centerDiameterPx / 2;
      const shoulderWidth = baseDiameterPx * 1.5;
      const shoulderR = shoulderWidth / 2;

      if (!isFractured) {
        const specimenPath = [
          `M ${specimenCenterX - shoulderR} ${topClampY - 18}`,
          `L ${specimenCenterX + shoulderR} ${topClampY - 18}`,
          `L ${specimenCenterX + shoulderR} ${topClampY}`,
          `Q ${specimenCenterX + rEnd} ${topClampY + 6}, ${specimenCenterX + rEnd} ${topClampY + 12}`,
          `C ${specimenCenterX + rCenter} ${midGaugeY - gaugeHeight * 0.18}, ${specimenCenterX + rCenter} ${midGaugeY + gaugeHeight * 0.18}, ${specimenCenterX + rEnd} ${botClampY - 12}`,
          `Q ${specimenCenterX + rEnd} ${botClampY - 6}, ${specimenCenterX + shoulderR} ${botClampY}`,
          `L ${specimenCenterX + shoulderR} ${botClampY + 18}`,
          `L ${specimenCenterX - shoulderR} ${botClampY + 18}`,
          `L ${specimenCenterX - shoulderR} ${botClampY}`,
          `Q ${specimenCenterX - rEnd} ${botClampY - 6}, ${specimenCenterX - rEnd} ${botClampY - 12}`,
          `C ${specimenCenterX - rCenter} ${midGaugeY + gaugeHeight * 0.18}, ${specimenCenterX - rCenter} ${midGaugeY - gaugeHeight * 0.18}, ${specimenCenterX - rEnd} ${topClampY + 12}`,
          `Q ${specimenCenterX - rEnd} ${topClampY + 6}, ${specimenCenterX - shoulderR} ${topClampY}`,
          'Z',
        ].join(' ');

        return (
          <g id="tensile-specimen-intact">
            <defs>
              <linearGradient id="specimenStressGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={baseMatColor} />
                <stop offset="35%" stopColor={stressColor} />
                <stop offset="50%" stopColor={isNecking ? '#dc2626' : stressColor} />
                <stop offset="65%" stopColor={stressColor} />
                <stop offset="100%" stopColor={baseMatColor} />
              </linearGradient>
            </defs>
            <path
              d={specimenPath}
              fill="url(#specimenStressGrad2)"
              stroke={isDark ? '#e2e8f0' : '#1e293b'}
              strokeWidth="1.2"
            />
            <line
              x1={specimenCenterX}
              y1={topClampY + 4}
              x2={specimenCenterX}
              y2={botClampY - 4}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </g>
        );
      } else {
        const gapPx = Math.min(26, Math.max(6, fractureGapMm * 1.6));
        const topHalfBot = midGaugeY - gapPx / 2;
        const botHalfTop = midGaugeY + gapPx / 2;
        const isBrittle = material.behavior === 'brittle';

        const topFractureLip = isBrittle
          ? `L ${specimenCenterX + rCenter} ${topHalfBot} L ${specimenCenterX - rCenter} ${topHalfBot}`
          : `L ${specimenCenterX + rCenter} ${topHalfBot - 3} L ${specimenCenterX} ${topHalfBot + 3} L ${specimenCenterX - rCenter} ${topHalfBot - 3}`;

        const botFractureLip = isBrittle
          ? `L ${specimenCenterX + rCenter} ${botHalfTop} L ${specimenCenterX - rCenter} ${botHalfTop}`
          : `L ${specimenCenterX + rCenter} ${botHalfTop + 3} L ${specimenCenterX} ${botHalfTop - 3} L ${specimenCenterX - rCenter} ${botHalfTop + 3}`;

        return (
          <g id="tensile-specimen-broken">
            <path
              d={[
                `M ${specimenCenterX - shoulderR} ${topClampY - 18}`,
                `L ${specimenCenterX + shoulderR} ${topClampY - 18}`,
                `L ${specimenCenterX + shoulderR} ${topClampY}`,
                `L ${specimenCenterX + rEnd} ${topClampY + 10}`,
                `L ${specimenCenterX + rCenter} ${topHalfBot - 3}`,
                topFractureLip,
                `L ${specimenCenterX - rCenter} ${topHalfBot - 3}`,
                `L ${specimenCenterX - rEnd} ${topClampY + 10}`,
                `L ${specimenCenterX - shoulderR} ${topClampY}`,
                'Z',
              ].join(' ')}
              fill={baseMatColor}
              stroke={isDark ? '#cbd5e1' : '#1e293b'}
              strokeWidth="1.2"
            />
            <path
              d={[
                `M ${specimenCenterX - shoulderR} ${botClampY + 18}`,
                `L ${specimenCenterX + shoulderR} ${botClampY + 18}`,
                `L ${specimenCenterX + shoulderR} ${botClampY}`,
                `L ${specimenCenterX + rEnd} ${botClampY - 10}`,
                `L ${specimenCenterX + rCenter} ${botHalfTop + 3}`,
                botFractureLip,
                `L ${specimenCenterX - rCenter} ${botHalfTop + 3}`,
                `L ${specimenCenterX - rEnd} ${botClampY - 10}`,
                `L ${specimenCenterX - shoulderR} ${botClampY}`,
                'Z',
              ].join(' ')}
              fill={baseMatColor}
              stroke={isDark ? '#cbd5e1' : '#1e293b'}
              strokeWidth="1.2"
            />
            <text
              x={specimenCenterX + 24}
              y={midGaugeY + 3}
              fill="#ef4444"
              fontSize="8"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {isBrittle ? 'CLEAVAGE' : 'CUP & CONE'}
            </text>
          </g>
        );
      }
    } else {
      // Compression Mode: Cylindrical Slug between platens
      const topPlatenY = topFixtureY;
      const botPlatenY = bottomFixtureY;
      const slugHeight = botPlatenY - topPlatenY;
      const rEnd = endDiameterPx / 2;
      const rMid = centerDiameterPx / 2;

      const slugPath = [
        `M ${specimenCenterX - rEnd} ${topPlatenY}`,
        `L ${specimenCenterX + rEnd} ${topPlatenY}`,
        `C ${specimenCenterX + rMid} ${topPlatenY + slugHeight * 0.35}, ${specimenCenterX + rMid} ${botPlatenY - slugHeight * 0.35}, ${specimenCenterX + rEnd} ${botPlatenY}`,
        `L ${specimenCenterX - rEnd} ${botPlatenY}`,
        `C ${specimenCenterX - rMid} ${botPlatenY - slugHeight * 0.35}, ${specimenCenterX - rMid} ${topPlatenY + slugHeight * 0.35}, ${specimenCenterX - rEnd} ${topPlatenY}`,
        'Z',
      ].join(' ');

      return (
        <g id="compression-specimen">
          <defs>
            <linearGradient id="compStressGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={baseMatColor} />
              <stop offset="50%" stopColor={stressColor} />
              <stop offset="100%" stopColor={baseMatColor} />
            </linearGradient>
          </defs>
          <path
            d={slugPath}
            fill="url(#compStressGrad2)"
            stroke={isDark ? '#e2e8f0' : '#1e293b'}
            strokeWidth="1.2"
          />
          {isFractured && (
            <g id="shear-crack-45">
              <line
                x1={specimenCenterX - rEnd * 0.8}
                y1={topPlatenY + 4}
                x2={specimenCenterX + rEnd * 0.8}
                y2={botPlatenY - 4}
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <text
                x={specimenCenterX + 20}
                y={midGaugeY + 3}
                fill="#ef4444"
                fontSize="8"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                45° SHEAR
              </text>
            </g>
          )}
        </g>
      );
    }
  }, [
    isMounted,
    mode,
    topFixtureY,
    bottomFixtureY,
    endDiameterPx,
    centerDiameterPx,
    baseDiameterPx,
    midGaugeY,
    baseMatColor,
    stressColor,
    isDark,
    isNecking,
    isFractured,
    fractureGapMm,
    material.behavior,
    c.textMuted,
    specimenCenterX,
    pick,
  ]);

  // Clip-on Extensometer & Gauge Length L0 Dimension Callout
  const extensometerSvg = useMemo(() => {
    if (!isMounted || mode !== 'tensile' || isFractured) return null;

    const span = bottomFixtureY - topFixtureY;
    const knifeTopY = topFixtureY + span * 0.25;
    const knifeBotY = bottomFixtureY - span * 0.25;
    const specLeftEdgeX = specimenCenterX - endDiameterPx / 2;
    const specRightEdgeX = specimenCenterX + endDiameterPx / 2;
    const dimLineX = Math.max(specRightEdgeX + 16, specimenCenterX + baseDiameterPx / 2 + 14);

    return (
      <g id="clip-on-extensometer-and-gauge-callout">
        {/* === LEFT SIDE: CLIP-ON EXTENSOMETER SENSOR === */}
        {/* Knife edge upper contact */}
        <polygon
          points={`${specLeftEdgeX},${knifeTopY} ${specLeftEdgeX - 6},${knifeTopY - 3} ${specLeftEdgeX - 6},${knifeTopY + 3}`}
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="0.8"
        />
        {/* Knife edge lower contact */}
        <polygon
          points={`${specLeftEdgeX},${knifeBotY} ${specLeftEdgeX - 6},${knifeBotY - 3} ${specLeftEdgeX - 6},${knifeBotY + 3}`}
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="0.8"
        />
        {/* Extensometer Body */}
        <rect
          x={specLeftEdgeX - 28}
          y={(knifeTopY + knifeBotY) / 2 - 18}
          width="22"
          height="36"
          rx="3"
          fill={c.loadCellBody}
          stroke={c.extensometer}
          strokeWidth="1.2"
        />
        {/* Extension arms */}
        <line
          x1={specLeftEdgeX - 6}
          y1={knifeTopY}
          x2={specLeftEdgeX - 17}
          y2={(knifeTopY + knifeBotY) / 2 - 9}
          stroke={c.extensometer}
          strokeWidth="1.5"
        />
        <line
          x1={specLeftEdgeX - 6}
          y1={knifeBotY}
          x2={specLeftEdgeX - 17}
          y2={(knifeTopY + knifeBotY) / 2 + 9}
          stroke={c.extensometer}
          strokeWidth="1.5"
        />
        {/* Status LED & Sensor Label */}
        <circle cx={specLeftEdgeX - 17} cy={(knifeTopY + knifeBotY) / 2 - 8} r="1.8" fill="#10b981" />
        <text
          x={specLeftEdgeX - 17}
          y={(knifeTopY + knifeBotY) / 2 + 6}
          fill={c.textMain}
          fontSize="6"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="monospace"
        >
          EXT
        </text>

        {/* === RIGHT SIDE: CRISP CAD GAUGE LENGTH L₀ DIMENSION CALLOUT === */}
        {/* Top witness line from specimen to dimension line */}
        <line
          x1={specRightEdgeX + 2}
          y1={knifeTopY}
          x2={dimLineX + 6}
          y2={knifeTopY}
          stroke={c.textMuted}
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />
        {/* Bottom witness line from specimen to dimension line */}
        <line
          x1={specRightEdgeX + 2}
          y1={knifeBotY}
          x2={dimLineX + 6}
          y2={knifeBotY}
          stroke={c.textMuted}
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />
        {/* Vertical dimension line spanning knifeTopY to knifeBotY */}
        <line
          x1={dimLineX}
          y1={knifeTopY}
          x2={dimLineX}
          y2={knifeBotY}
          stroke="#0284c7"
          strokeWidth="1.2"
        />
        {/* Arrowheads / cross ticks at dimension ends */}
        <path
          d={`M ${dimLineX - 3} ${knifeTopY + 5} L ${dimLineX} ${knifeTopY} L ${dimLineX + 3} ${knifeTopY + 5}`}
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.2"
        />
        <path
          d={`M ${dimLineX - 3} ${knifeBotY - 5} L ${dimLineX} ${knifeBotY} L ${dimLineX + 3} ${knifeBotY - 5}`}
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.2"
        />
        {/* Dimension Label Badge centered along dimension line */}
        <g transform={`translate(${dimLineX + 8}, ${(knifeTopY + knifeBotY) / 2})`}>
          <rect
            x="-2"
            y="-9"
            width="54"
            height="18"
            rx="3"
            fill={isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)'}
            stroke="#0284c7"
            strokeWidth="0.9"
          />
          <text
            x="25"
            y="3.5"
            fill={isDark ? '#38bdf8' : '#0369a1'}
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            L₀: {gaugeLengthMm}mm
          </text>
        </g>
      </g>
    );
  }, [
    isMounted,
    mode,
    isFractured,
    bottomFixtureY,
    topFixtureY,
    endDiameterPx,
    specimenCenterX,
    baseDiameterPx,
    gaugeLengthMm,
    isDark,
    c.loadCellBody,
    c.extensometer,
    c.textMain,
    c.textMuted,
  ]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center select-none">
      <svg
        viewBox="0 0 530 480"
        className="h-auto max-h-[500px] w-full max-w-[540px] drop-shadow-md"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Chrome ballscrew metallic gradient */}
          <linearGradient id="chromeScrewGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
            <stop offset="30%" stopColor={isDark ? '#94a3b8' : '#f8fafc'} />
            <stop offset="70%" stopColor={isDark ? '#64748b' : '#e2e8f0'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#94a3b8'} />
          </linearGradient>

          {/* Guide column gradient */}
          <linearGradient id="columnGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#1e293b' : '#64748b'} />
            <stop offset="25%" stopColor={isDark ? '#334155' : '#94a3b8'} />
            <stop offset="60%" stopColor={isDark ? '#1e293b' : '#475569'} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#334155'} />
          </linearGradient>

          {/* Crosshead structural steel gradient */}
          <linearGradient id="crossheadGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#334155' : '#e2e8f0'} />
            <stop offset="50%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#94a3b8'} />
          </linearGradient>

          {/* Caution Hazard Chevron Stripes Pattern */}
          <pattern
            id="hazardStripes"
            width="10"
            height="10"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="5" height="10" fill="#eab308" />
            <rect x="5" width="5" height="10" fill="#18181b" />
          </pattern>
        </defs>

        {/* CAD Outer Baseplate Frame */}
        <rect
          x="12"
          y="15"
          width="506"
          height="450"
          rx="8"
          fill={c.frameBg}
          stroke={c.gripSteelBorder}
          strokeWidth="1"
        />

        {/* Machine Top Banner */}
        <rect
          x="18"
          y="20"
          width="494"
          height="30"
          rx="4"
          fill={isDark ? '#111827' : '#f1f5f9'}
          stroke={c.gripSteelBorder}
          strokeWidth="0.8"
        />
        <text
          x="28"
          y="39"
          fill={c.textMain}
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
        >
          UTM-50 INDUSTRIAL TESTING SYSTEM
        </text>

        {/* Safety Guard Door Toggle Button / Status on top header */}
        <g
          id="guard-toggle-header"
          onClick={onToggleSafetyDoor}
          className="cursor-pointer transition-opacity hover:opacity-80"
        >
          <rect
            x="368"
            y="25"
            width="136"
            height="20"
            rx="10"
            fill={safetyDoorClosed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}
            stroke={safetyDoorClosed ? '#10b981' : '#ef4444'}
            strokeWidth="1.2"
          />
          <circle cx="378" cy="35" r="3.5" fill={safetyDoorClosed ? '#10b981' : '#ef4444'} />
          <text
            x="386"
            y="39"
            fill={c.textMain}
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {safetyDoorClosed ? 'GUARD: CLOSED' : 'GUARD: OPEN'}
          </text>
        </g>

        {/* Heavy Cast Steel Machine Base */}
        <rect
          x="25"
          y="418"
          width="365"
          height="40"
          rx="4"
          fill="url(#crossheadGrad2)"
          stroke={c.frameMed}
          strokeWidth="1.5"
        />
        {/* Machine Vibration Leveling Feet */}
        <rect x="45" y="458" width="40" height="7" rx="2" fill={c.frameDark} />
        <rect x="330" y="458" width="40" height="7" rx="2" fill={c.frameDark} />

        {/* Servo Motor Enclosure Badge on Base */}
        <rect
          x="155"
          y="426"
          width="110"
          height="22"
          rx="3"
          fill={isDark ? '#0f172a' : '#ffffff'}
          stroke={c.frameMed}
          strokeWidth="1"
        />
        <text
          x="210"
          y="440"
          fill={c.textMuted}
          fontSize="8"
          textAnchor="middle"
          fontWeight="600"
          fontFamily="monospace"
        >
          PRECISION SERVO ACTUATOR
        </text>

        {/* Twin Load Frame Columns */}
        {/* Left Column */}
        <rect
          x="35"
          y="56"
          width="24"
          height="365"
          rx="2"
          fill="url(#columnGrad2)"
          stroke={c.frameDark}
          strokeWidth="1"
        />
        {/* Right Column */}
        <rect
          x="356"
          y="56"
          width="24"
          height="365"
          rx="2"
          fill="url(#columnGrad2)"
          stroke={c.frameDark}
          strokeWidth="1"
        />

        {/* Animated Chrome Ball Screws with visible rotating helical threads */}
        {/* Left Lead Screw */}
        <g id="left-leadscrew">
          <rect
            x="68"
            y="62"
            width="12"
            height="358"
            rx="1"
            fill="url(#chromeScrewGrad2)"
            stroke={c.screwThread}
            strokeWidth="0.8"
          />
          {/* Thread helical lines with live scroll offset */}
          {Array.from({ length: 36 }).map((_, idx) => {
            const ty = 64 + idx * 10 + threadScrollOffset;
            if (ty > 418) return null;
            return (
              <line
                key={`left-th-${idx}`}
                x1="68"
                y1={ty}
                x2="80"
                y2={ty + 3}
                stroke={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)'}
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Right Lead Screw */}
        <g id="right-leadscrew">
          <rect
            x="335"
            y="62"
            width="12"
            height="358"
            rx="1"
            fill="url(#chromeScrewGrad2)"
            stroke={c.screwThread}
            strokeWidth="0.8"
          />
          {/* Thread helical lines with live scroll offset */}
          {Array.from({ length: 36 }).map((_, idx) => {
            const ty = 64 + idx * 10 + threadScrollOffset;
            if (ty > 418) return null;
            return (
              <line
                key={`right-th-${idx}`}
                x1="335"
                y1={ty}
                x2="347"
                y2={ty + 3}
                stroke={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)'}
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Left Column Linear Displacement Ruler */}
        <g id="column-ruler" opacity={0.65}>
          {Array.from({ length: 14 }).map((_, idx) => {
            const ry = 78 + idx * 24;
            const isMajor = idx % 2 === 0;
            return (
              <g key={`tick-${idx}`}>
                <line
                  x1={isMajor ? 30 : 33}
                  y1={ry}
                  x2={35}
                  y2={ry}
                  stroke={c.textMuted}
                  strokeWidth={isMajor ? 1.2 : 0.8}
                />
                {isMajor && (
                  <text
                    x="28"
                    y={ry + 2.5}
                    fill={c.textMuted}
                    fontSize="6"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {idx * 10}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Fixed Upper Crosshead */}
        <rect
          x="30"
          y="54"
          width="355"
          height="38"
          rx="4"
          fill="url(#crossheadGrad2)"
          stroke={c.frameMed}
          strokeWidth="1.5"
        />
        {/* Upper Mount Bolts */}
        <circle cx="47" cy="73" r="3.5" fill={c.frameLight} stroke={c.frameDark} strokeWidth="1" />
        <circle cx="368" cy="73" r="3.5" fill={c.frameLight} stroke={c.frameDark} strokeWidth="1" />

        {/* Bolted Load Cell Housing with Strain Gauge Bridge Decal & Cable */}
        <g id="load-cell-unit">
          <rect
            x={specimenCenterX - 28}
            y="92"
            width="56"
            height="32"
            rx="4"
            fill={c.loadCellBody}
            stroke={c.loadCellBorder}
            strokeWidth="1.5"
          />
          <text
            x={specimenCenterX}
            y="106"
            fill={c.loadCellBorder}
            fontSize="7"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            LOAD CELL
          </text>
          <text
            x={specimenCenterX}
            y="118"
            fill={c.textMain}
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            ±50 kN
          </text>
          {/* Coiled Signal Cable routed to right column */}
          <path
            d={`M ${specimenCenterX + 28} 108 C 265 106, 290 125, 335 110`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        </g>

        {/* Upper Fixture: Wedge Grip or Compression Platen */}
        {mode === 'tensile' ? (
          <g id="upper-wedge-grip">
            <path
              d={`M ${specimenCenterX - 24} 124 L ${specimenCenterX + 24} 124 L ${specimenCenterX + 16} 165 L ${specimenCenterX - 16} 165 Z`}
              fill={c.gripSteel}
              stroke={c.gripSteelBorder}
              strokeWidth="1.2"
            />
            <circle cx={specimenCenterX - 10} cy="138" r="2.5" fill={c.frameMed} />
            <circle cx={specimenCenterX + 10} cy="138" r="2.5" fill={c.frameMed} />
            {/* Serrated Gripping Teeth */}
            <line
              x1={specimenCenterX - 14}
              y1="165"
              x2={specimenCenterX + 14}
              y2="165"
              stroke="#ef4444"
              strokeWidth="2"
            />
          </g>
        ) : (
          <g id="upper-compression-platen">
            <rect
              x={specimenCenterX - 45}
              y="124"
              width="90"
              height="38"
              rx="2"
              fill={c.gripSteel}
              stroke={c.gripSteelBorder}
              strokeWidth="1.2"
            />
            {/* Concentric grooved hardened face */}
            <line
              x1={specimenCenterX - 45}
              y1="162"
              x2={specimenCenterX + 45}
              y2="162"
              stroke="#0ea5e9"
              strokeWidth="2.5"
            />
            <text
              x={specimenCenterX}
              y="144"
              fill={c.textMuted}
              fontSize="6.5"
              textAnchor="middle"
              fontFamily="monospace"
            >
              HARDENED PLATEN
            </text>
          </g>
        )}

        {/* Specimen SVG */}
        {specimenSvg}

        {/* Clip-on Extensometer */}
        {extensometerSvg}

        {/* Lower Fixture (Mounted on Moving Crosshead) */}
        {mode === 'tensile' ? (
          <g id="lower-wedge-grip">
            <path
              d={`M ${specimenCenterX - 16} ${crossheadY} L ${specimenCenterX + 16} ${crossheadY} L ${specimenCenterX + 24} ${crossheadY + 36} L ${specimenCenterX - 24} ${crossheadY + 36} Z`}
              fill={c.gripSteel}
              stroke={c.gripSteelBorder}
              strokeWidth="1.2"
            />
            <circle cx={specimenCenterX - 10} cy={crossheadY + 18} r="2.5" fill={c.frameMed} />
            <circle cx={specimenCenterX + 10} cy={crossheadY + 18} r="2.5" fill={c.frameMed} />
            <line
              x1={specimenCenterX - 14}
              y1={crossheadY}
              x2={specimenCenterX + 14}
              y2={crossheadY}
              stroke="#ef4444"
              strokeWidth="2"
            />
          </g>
        ) : (
          <g id="lower-compression-platen">
            <rect
              x={specimenCenterX - 45}
              y={crossheadY - 38}
              width="90"
              height="38"
              rx="2"
              fill={c.gripSteel}
              stroke={c.gripSteelBorder}
              strokeWidth="1.2"
            />
            <line
              x1={specimenCenterX - 45}
              y1={crossheadY}
              x2={specimenCenterX + 45}
              y2={crossheadY}
              stroke="#0ea5e9"
              strokeWidth="2.5"
            />
            <text
              x={specimenCenterX}
              y={crossheadY - 18}
              fill={c.textMuted}
              fontSize="6.5"
              textAnchor="middle"
              fontFamily="monospace"
            >
              LOWER PLATEN
            </text>
          </g>
        )}

        {/* Motorized Moving Crosshead Body */}
        <g id="moving-crosshead">
          <rect
            x="58"
            y={crossheadY + (mode === 'tensile' ? 36 : 0)}
            width="298"
            height="34"
            rx="4"
            fill="url(#crossheadGrad2)"
            stroke={c.frameMed}
            strokeWidth="1.5"
          />
          {/* Hazard Caution Chevron Stripes on Crosshead ends */}
          <rect
            x="60"
            y={crossheadY + (mode === 'tensile' ? 38 : 2)}
            width="20"
            height="30"
            fill="url(#hazardStripes)"
            stroke={c.frameDark}
            strokeWidth="0.8"
          />
          <rect
            x="334"
            y={crossheadY + (mode === 'tensile' ? 38 : 2)}
            width="20"
            height="30"
            fill="url(#hazardStripes)"
            stroke={c.frameDark}
            strokeWidth="0.8"
          />

          {/* Drive Nuts on Crosshead */}
          <rect
            x="64"
            y={crossheadY + (mode === 'tensile' ? 32 : -4)}
            width="18"
            height="42"
            rx="2"
            fill={c.frameDark}
            stroke={c.screwThread}
            strokeWidth="1"
          />
          <rect
            x="332"
            y={crossheadY + (mode === 'tensile' ? 32 : -4)}
            width="18"
            height="42"
            rx="2"
            fill={c.frameDark}
            stroke={c.screwThread}
            strokeWidth="1"
          />
          <text
            x={specimenCenterX}
            y={crossheadY + (mode === 'tensile' ? 57 : 21)}
            fill={c.textMain}
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            MOTORIZED MOVING CROSSHEAD
          </text>
        </g>

        {/* Full Test-Zone Bay Polycarbonate Safety Guard Door */}
        {safetyDoorClosed ? (
          <g
            id="safety-door-closed"
            onClick={onToggleSafetyDoor}
            className="cursor-pointer transition-opacity hover:opacity-90"
            aria-label="Safety Guard Door (Closed - Click to Open)"
          >
            <title>Safety Guard Door (Closed - Click to Open)</title>
            {/* Outer Aluminum Perimeter Frame spanning the entire test bay */}
            <rect
              x="58"
              y="94"
              width="298"
              height="322"
              rx="4"
              fill={isDark ? 'rgba(56, 189, 248, 0.07)' : 'rgba(56, 189, 248, 0.05)'}
              stroke={isDark ? '#64748b' : '#94a3b8'}
              strokeWidth="3.5"
            />
            {/* Inner beveled edge */}
            <rect
              x="61"
              y="97"
              width="292"
              height="316"
              rx="2"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />

            {/* Heavy-Duty Left-Side Industrial Hinges (3 hinges) */}
            {/* Top Hinge */}
            <rect x="53" y="132" width="7" height="20" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
            <circle cx="56.5" cy="142" r="2" fill="#334155" />
            {/* Middle Hinge */}
            <rect x="53" y="245" width="7" height="20" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
            <circle cx="56.5" cy="255" r="2" fill="#334155" />
            {/* Bottom Hinge */}
            <rect x="53" y="358" width="7" height="20" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
            <circle cx="56.5" cy="368" r="2" fill="#334155" />

            {/* Right-Side Industrial Grab Handle */}
            <rect
              x="346"
              y="228"
              width="5"
              height="54"
              rx="2.5"
              fill="#e2e8f0"
              stroke="#475569"
              strokeWidth="1.2"
            />
            {/* Magnetic Interlock Safety Sensor Switch */}
            <rect x="351" y="248" width="5" height="14" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <circle cx="353.5" cy="255" r="1.5" fill="#10b981" />

            {/* Diagonal Polycarbonate Glass Reflection Streaks */}
            <line
              x1="75"
              y1="110"
              x2="155"
              y2="400"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="2.5"
              strokeDasharray="90 30 50 40"
            />
            <line
              x1="265"
              y1="105"
              x2="340"
              y2="390"
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="2"
              strokeDasharray="70 40 80 30"
            />

            {/* Safety Interlock Header Decal Badge */}
            <g transform="translate(68, 102)">
              <rect
                x="0"
                y="0"
                width="122"
                height="14"
                rx="2"
                fill={isDark ? 'rgba(15,23,42,0.85)' : 'rgba(241,245,249,0.92)'}
                stroke="#0ea5e9"
                strokeWidth="0.8"
              />
              <circle cx="7" cy="7" r="2.5" fill="#10b981" />
              <text
                x="14"
                y="10"
                fill={isDark ? '#38bdf8' : '#0369a1'}
                fontSize="6"
                fontWeight="bold"
                fontFamily="monospace"
              >
                INTERLOCK: SHIELD CLOSED
              </text>
            </g>
          </g>
        ) : (
          <g
            id="safety-door-open"
            onClick={onToggleSafetyDoor}
            className="cursor-pointer transition-opacity hover:opacity-90"
            aria-label="Safety Guard Door (Open - Click to Close)"
          >
            <title>Safety Guard Door (Open - Click to Close)</title>
            {/* Left-swung door resting ajar outside the test bay */}
            <rect
              x="6"
              y="94"
              width="48"
              height="322"
              rx="3"
              fill="rgba(244, 63, 94, 0.08)"
              stroke="#f43f5e"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />
            {/* Pivoted Hinges */}
            <rect x="51" y="132" width="7" height="20" rx="2" fill="#f43f5e" stroke="#334155" strokeWidth="1" />
            <rect x="51" y="245" width="7" height="20" rx="2" fill="#f43f5e" stroke="#334155" strokeWidth="1" />
            <rect x="51" y="358" width="7" height="20" rx="2" fill="#f43f5e" stroke="#334155" strokeWidth="1" />

            {/* Vertical Door Ajar Text along the swung panel */}
            <text
              x="30"
              y="255"
              fill="#f43f5e"
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
              transform="rotate(-90, 30, 255)"
              fontFamily="monospace"
            >
              GUARD AJAR / UNLATCHED
            </text>

            {/* Open Magnetic Latch Indicator on right frame */}
            <rect x="351" y="248" width="5" height="14" rx="1.5" fill="#1e293b" stroke="#ef4444" strokeWidth="0.8" />
            <circle cx="353.5" cy="255" r="1.5" fill="#ef4444" />

            {/* Test Bay Open Boundary Guide */}
            <rect
              x="58"
              y="94"
              width="298"
              height="322"
              rx="4"
              fill="none"
              stroke="rgba(244, 63, 94, 0.25)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
          </g>
        )}

        {/* ============================================================== */}
        {/* RIGHT CONSOLE OPERATOR PENDANT (On-Machine Interactive Station) */}
        {/* ============================================================== */}
        <g id="machine-control-console">
          {/* Console Enclosure Bracket attached to right column */}
          <rect
            x="380"
            y="170"
            width="20"
            height="16"
            rx="2"
            fill={c.frameDark}
            stroke={c.frameMed}
            strokeWidth="1"
          />

          {/* Console Housing */}
          <rect
            x="396"
            y="54"
            width="118"
            height="404"
            rx="6"
            fill={isDark ? '#0f172a' : '#1e293b'}
            stroke={isDark ? '#334155' : '#0f172a'}
            strokeWidth="1.5"
          />

          {/* Console Header Bezel */}
          <rect x="400" y="58" width="110" height="20" rx="3" fill="#020617" />
          <text
            x="455"
            y="72"
            fill="#38bdf8"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            CONTROLLER V3
          </text>

          {/* Mini Digital OLED/LCD Telemetry Display Screen */}
          <g id="console-oled-screen">
            <rect
              x="402"
              y="84"
              width="106"
              height="116"
              rx="4"
              fill={c.oledBg}
              stroke={c.oledBorder}
              strokeWidth="1.2"
            />

            {/* Status Indicator LED & Label inside OLED */}
            <circle
              cx="412"
              cy="96"
              r="3.5"
              fill={machineStatus.color}
            />
            <text
              x="420"
              y="99"
              fill={machineStatus.color}
              fontSize="7"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {machineStatus.label}
            </text>

            {/* Live Load Readout */}
            <text x="408" y="116" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">
              LOAD:
            </text>
            <text
              x="500"
              y="116"
              fill="#06b6d4"
              fontSize="10"
              fontWeight="bold"
              textAnchor="end"
              fontFamily="monospace"
            >
              {forceKn.toFixed(2)} kN
            </text>

            {/* Peak Force Readout */}
            <text x="408" y="130" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">
              PEAK:
            </text>
            <text
              x="500"
              y="130"
              fill="#a78bfa"
              fontSize="8"
              fontWeight="bold"
              textAnchor="end"
              fontFamily="monospace"
            >
              {peakForceKn.toFixed(2)} kN
            </text>

            {/* Extension Readout */}
            <text x="408" y="144" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">
              EXT:
            </text>
            <text
              x="500"
              y="144"
              fill="#38bdf8"
              fontSize="8"
              fontWeight="bold"
              textAnchor="end"
              fontFamily="monospace"
            >
              {extensionMm.toFixed(3)} mm
            </text>

            {/* Stress Readout */}
            <text x="408" y="158" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">
              STRESS:
            </text>
            <text
              x="500"
              y="158"
              fill="#f59e0b"
              fontSize="8"
              fontWeight="bold"
              textAnchor="end"
              fontFamily="monospace"
            >
              {state.stressMpa.toFixed(0)} MPa
            </text>

            {/* Load Capacity Bar (0-50 kN) */}
            <rect x="408" y="168" width="94" height="6" rx="2" fill="#1e293b" />
            <rect
              x="408"
              y="168"
              width={Math.max(0, (loadPercentage / 100) * 94)}
              height="6"
              rx="2"
              fill={loadPercentage > 85 ? '#ef4444' : loadPercentage > 60 ? '#f59e0b' : '#10b981'}
            />
            <text x="455" y="184" fill="#64748b" fontSize="6" textAnchor="middle" fontFamily="monospace">
              CAPACITY: {loadPercentage.toFixed(0)}% (50kN)
            </text>

            {/* Alert message if E-Stop */}
            {isEStopped && (
              <text
                x="455"
                y="194"
                fill="#ef4444"
                fontSize="6"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                * INTERLOCK ACTIVE *
              </text>
            )}
          </g>

          {/* Door Interlock Status & Quick Toggle */}
          <g
            id="console-door-interlock"
            onClick={onToggleSafetyDoor}
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <rect
              x="404"
              y="208"
              width="102"
              height="20"
              rx="3"
              fill={safetyDoorClosed ? '#064e3b' : '#7f1d1d'}
              stroke={safetyDoorClosed ? '#059669' : '#dc2626'}
              strokeWidth="1"
            />
            <text
              x="455"
              y="221"
              fill="#ffffff"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {safetyDoorClosed ? 'DOOR: SECURED' : 'DOOR: OPEN'}
            </text>
          </g>

          {/* Interactive Industrial Console Buttons */}
          {/* 1. GREEN ILLUMINATED START / PAUSE PUSH-BUTTON */}
          <g
            id="btn-svg-start-pause"
            onClick={onStartPause}
            className="cursor-pointer transition-opacity hover:opacity-85 active:opacity-70"
          >
            {/* Outer mounting ring */}
            <circle cx="455" cy="265" r="22" fill="#020617" stroke="#334155" strokeWidth="2" />
            {/* Illuminated halo */}
            <circle
              cx="455"
              cy="265"
              r="18"
              fill={isRunning ? '#15803d' : '#166534'}
              stroke={isRunning ? '#4ade80' : '#22c55e'}
              strokeWidth="2.5"
            />
            {/* Button cap */}
            <circle cx="455" cy="265" r="14" fill={isRunning ? '#22c55e' : '#15803d'} />
            <text
              x="455"
              y="268"
              fill="#ffffff"
              fontSize="7.5"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {isRunning ? 'PAUSE' : 'START'}
            </text>
          </g>

          {/* 2. RED MUSHROOM EMERGENCY STOP (E-STOP) BUTTON WITH YELLOW COLLAR */}
          <g
            id="btn-svg-estop"
            onClick={onEmergencyStop}
            className="cursor-pointer transition-opacity hover:opacity-85 active:opacity-70"
            aria-label="Emergency Stop (E-STOP)"
          >
            <title>Emergency Stop (E-STOP)</title>
            {/* Yellow Safety Warning Collar */}
            <circle cx="455" cy="330" r="24" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />

            {/* Red Mushroom Push Head - clean iconic emergency button with zero overlapping text */}
            <circle
              cx="455"
              cy="330"
              r="18"
              fill={isEStopped ? '#991b1b' : '#dc2626'}
              stroke={isEStopped ? '#fca5a5' : '#ef4444'}
              strokeWidth="2.5"
            />
            {/* Tactile 3D Dome Highlight */}
            <circle
              cx="452"
              cy="327"
              r="11"
              fill={isEStopped ? '#b91c1c' : '#ef4444'}
            />
          </g>

          {/* 3. TACTILE RESET PUSH-BUTTON */}
          <g
            id="btn-svg-reset"
            onClick={onReset}
            className="cursor-pointer transition-opacity hover:opacity-85 active:opacity-70"
          >
            <rect
              x="425"
              y="375"
              width="60"
              height="22"
              rx="4"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.2"
            />
            <text
              x="455"
              y="389"
              fill="#38bdf8"
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              RESET 0
            </text>
          </g>

          {/* Console Manufacturer Label at bottom */}
          <text
            x="455"
            y="435"
            fill="#64748b"
            fontSize="6"
            textAnchor="middle"
            fontFamily="monospace"
          >
            ASAHI-UTM-50
          </text>
        </g>
      </svg>
    </div>
  );
}
