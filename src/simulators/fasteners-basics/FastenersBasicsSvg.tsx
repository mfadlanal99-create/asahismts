import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BOLT_HEADS,
  METRIC_BOLT_SPECS,
  NUT_TYPES,
  PROPERTY_CLASSES,
  WASHER_TYPES,
  calculateFastenerBasics,
  type BoltHeadType,
  type MetricBoltSize,
  type NutType,
  type PropertyClass,
  type WasherType,
} from './fastenersBasicsData';

interface FastenersBasicsSvgProps {
  boltHead: BoltHeadType;
  nut: NutType;
  washer: WasherType;
  size: MetricBoltSize;
  propertyClass: PropertyClass;
}

export function FastenersBasicsSvg({
  boltHead,
  nut,
  washer,
  size,
  propertyClass,
}: FastenersBasicsSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const c = useMemo(
    () => ({
      canvasBg: 'var(--md-surface-container-low)',
      cardBg: 'var(--md-surface-container)',
      cardSubBg: 'var(--md-surface-container-low)',
      cardBorder: 'var(--md-outline-variant)',
      grid: 'var(--md-outline-variant)',
      textMain: 'var(--md-on-surface)',
      textMuted: 'var(--md-on-surface-variant)',
      steelDark: isDark ? '#1e293b' : '#475569',
      steelEdge: isDark ? '#64748b' : '#475569',
      steelMid: isDark ? '#475569' : '#94a3b8',
      steelLight: isDark ? '#94a3b8' : '#cbd5e1',
      primary: 'var(--md-primary)',
      primaryBg: 'var(--md-primary-container)',
      onPrimaryContainer: 'var(--md-on-primary-container)',
      emerald: '#10b981',
      emeraldBg: isDark ? 'rgba(16,185,129,0.16)' : 'rgba(16,185,129,0.10)',
      amber: '#f59e0b',
      amberBg: isDark ? 'rgba(245,158,11,0.16)' : 'rgba(245,158,11,0.12)',
      dim: 'var(--md-primary)',
      nylonBlue: '#2563eb',
    }),
    [isDark]
  );

  const boltSpec = METRIC_BOLT_SPECS[size];
  const propClassSpec = PROPERTY_CLASSES[propertyClass];
  const headSpec = BOLT_HEADS.find((h) => h.id === boltHead) ?? BOLT_HEADS[0];
  const nutSpec = NUT_TYPES.find((n) => n.id === nut) ?? NUT_TYPES[0];
  const washerSpec = WASHER_TYPES.find((w) => w.id === washer) ?? WASHER_TYPES[0];

  const jointCalc = useMemo(
    () => calculateFastenerBasics(boltSpec, propClassSpec),
    [boltSpec, propClassSpec]
  );

  // Dynamic geometry for Bolted Joint (centered at cx = 270)
  const cx = 270;
  const plateTopY = 185;
  const plateMidY = 235;
  const plateBotY = 285;
  const rShank = Math.round(13 + (boltSpec.diameterMm - 6) * 1.15); // M6=13 .. M16=25
  const rHole = rShank + 4;
  const headHalfW = Math.round(rShank * 1.85 + 16);

  const washerHeight =
    washer === 'flat-din125' ? 10 : washer === 'spring-din127' ? 15 : 18;
  const washerBotY = plateBotY + washerHeight;
  const nutTopY = washerBotY;
  const nutBodyH = Math.round(34 + (boltSpec.diameterMm - 6) * 0.8);

  const threadStartY = plateMidY + 26;
  const threadEndY = 434;
  const pitchPx = Math.max(7, Math.min(11, boltSpec.pitchMm * 5.2));
  const threadToothDepth = 3.2;

  const threadProfile = useMemo(() => {
    const leftPts: string[] = [];
    const rightPts: string[] = [];
    const ridgeLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const count = Math.floor((threadEndY - threadStartY) / pitchPx);
    for (let i = 0; i <= count; i++) {
      const y = threadStartY + i * pitchPx;
      const yMid = y + pitchPx * 0.5;
      leftPts.push(`${cx - rShank},${y}`);
      if (i < count) {
        leftPts.push(`${cx - rShank + threadToothDepth},${yMid}`);
        rightPts.push(`${cx + rShank},${y + pitchPx * 0.25}`);
        rightPts.push(`${cx + rShank - threadToothDepth},${yMid + pitchPx * 0.25}`);
        ridgeLines.push({
          x1: cx - rShank + 1.5,
          y1: y + 0.5,
          x2: cx + rShank - 1.5,
          y2: y + pitchPx * 0.25 + 0.5,
        });
      }
    }
    return { leftPts, rightPts, ridgeLines };
  }, [cx, rShank, threadStartY, threadEndY, pitchPx]);

  const decoderFormulaLines = useMemo(() => {
    if (propertyClass === 'A2-70') {
      return {
        rmFormula: '70 × 10 = 700 MPa',
        reFormula: 'AISI 304 (450 MPa)',
      };
    }
    if (propertyClass === 'A4-80') {
      return {
        rmFormula: '80 × 10 = 800 MPa',
        reFormula: 'AISI 316 (600 MPa)',
      };
    }
    const [first, second] = propertyClass.split('.');
    return {
      rmFormula: `${first} × 100 = ${propClassSpec.nominalTensileMpa} MPa`,
      reFormula: `${propClassSpec.nominalTensileMpa} × 0.${second} = ${propClassSpec.yieldStrengthMpa}`,
    };
  }, [propertyClass, propClassSpec]);

  const lockingRating = useMemo(() => {
    if (nut === 'castle-din935') {
      return {
        badge: pick('POSITIVE MECHANICAL LOCK', 'KUNCI MEKANIS POSITIF', '機械的絶対脱落防止'),
        detail: pick(
          'Split cotter pin through drilled shaft blocks rotation',
          'Pin cotter melewati lubang poros mencegah putaran balik',
          '割りピンが軸貫通穴を拘束し回転緩みを物理的に阻止'
        ),
        color: c.emerald,
        bg: c.emeraldBg,
      };
    }
    if (washer === 'nordlock-din25201') {
      return {
        badge: pick('WEDGE-TENSION LOCK (JUNKER)', 'PENGUNCI BAJI (UJI JUNKER)', 'くさび張力ロック（ユンカー合格）'),
        detail: pick(
          'Cam angle α > thread lead β; vibration increases tension',
          'Sudut baji α > kisar ulir β; getaran justru mengencangkan',
          'くさび角α > リード角βにより振動時に締付軸力が増加'
        ),
        color: c.emerald,
        bg: c.emeraldBg,
      };
    }
    if (nut === 'nyloc-din985' || nut === 'flange-din6923') {
      return {
        badge: pick('PREVAILING TORQUE / BITE', 'TORSI FRIKSI / GERIGI', 'プリベリングトルク／歯付'),
        detail: pick(
          nut === 'nyloc-din985'
            ? 'Nylon collar grips male threads against vibration'
            : 'Serrated flange teeth bite mating surface against slip',
          nut === 'nyloc-din985'
            ? 'Cincin nilon mencengkeram ulir terhadap getaran ringan'
            : 'Gigi serasi flens menggigit permukaan agar tidak lepas',
          nut === 'nyloc-din985'
            ? 'ナイロンリングがねじ山に密着し振動に抵抗'
            : 'フランジ面のギザ歯が座面に食い込み緩みを抑制'
        ),
        color: c.primary,
        bg: c.primaryBg,
      };
    }
    return {
      badge: washer === 'spring-din127'
        ? pick('SPRING FRICTION (LIGHT DUTY)', 'PEGAS / FRIKSI (BEBAN RINGAN)', '摩擦＋ばね反力（軽負荷用）')
        : pick('PURE FRICTION CLAMP', 'KLEM FRIKSI MURNI', '純摩擦締結（振動対策なし）'),
      detail: washer === 'spring-din127'
        ? pick(
            'Split spring washers flatten under heavy load & shock',
            'Ring pegas memipih pada beban tinggi & getaran siklis',
            '高軸力・横振動下では平坦化し緩み止め効果が低下'
          )
        : pick(
            'Flat washer spreads load; pair lock nut for vibration',
            'Ring datar meratakan beban; padukan mur pengunci bila bergetar',
            '平座金は荷重分散用。振動箇所には緩み止めナット併用'
          ),
      color: c.amber,
      bg: c.amberBg,
    };
  }, [nut, washer, pick, c]);

  return (
    <div data-tour="fasteners-svg" className="glass-panel w-full relative flex items-center justify-center overflow-hidden rounded-[28px] p-2 select-none">
      <svg
        viewBox="0 0 920 500"
        className="w-full max-h-[480px] h-auto drop-shadow-sm"
        style={{ fontFamily: 'var(--font-sans)' }}
        role="img"
        aria-label="Bolted Joint Assembly 2D CAD Cross-Section and Property Class Decoder"
      >
        <defs>
          <pattern id="fbGridMinor" width="16" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M 16 0 L 0 0 0 16"
              fill="none"
              stroke={c.grid}
              strokeWidth="0.6"
              strokeOpacity={isDark ? 0.2 : 0.32}
            />
          </pattern>
          <pattern id="fbGridMajor" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="url(#fbGridMinor)" />
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke={c.grid}
              strokeWidth="1.1"
              strokeOpacity={isDark ? 0.32 : 0.5}
            />
          </pattern>

          <pattern id="fbHatch45" width="9" height="9" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="9" stroke={c.steelMid} strokeWidth="1.2" strokeOpacity="0.45" />
          </pattern>
          <pattern id="fbHatchNeg45" width="9" height="9" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="9" stroke={c.steelMid} strokeWidth="1.2" strokeOpacity="0.45" />
          </pattern>

          <linearGradient id="fbCylSteelGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isDark ? '#334155' : '#64748b'} />
            <stop offset="22%" stopColor={isDark ? '#64748b' : '#cbd5e1'} />
            <stop offset="44%" stopColor={isDark ? '#cbd5e1' : '#f8fafc'} />
            <stop offset="72%" stopColor={isDark ? '#475569' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#475569'} />
          </linearGradient>

          <linearGradient id="fbBoltFinishGrad" x1="0" y1="0" x2="1" y2="0">
            {propertyClass === '12.9' || propertyClass === '10.9' ? (
              <>
                <stop offset="0%" stopColor={isDark ? '#1e293b' : '#334155'} />
                <stop offset="28%" stopColor={isDark ? '#475569' : '#64748b'} />
                <stop offset="48%" stopColor={isDark ? '#94a3b8' : '#cbd5e1'} />
                <stop offset="75%" stopColor={isDark ? '#334155' : '#475569'} />
                <stop offset="100%" stopColor={isDark ? '#0f172a' : '#1e293b'} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor={isDark ? '#475569' : '#64748b'} />
                <stop offset="26%" stopColor={isDark ? '#94a3b8' : '#cbd5e1'} />
                <stop offset="46%" stopColor={isDark ? '#e2e8f0' : '#f8fafc'} />
                <stop offset="75%" stopColor={isDark ? '#64748b' : '#94a3b8'} />
                <stop offset="100%" stopColor={isDark ? '#334155' : '#475569'} />
              </>
            )}
          </linearGradient>

          <radialGradient id="fbHeadTopGrad" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor={isDark ? '#94a3b8' : '#ffffff'} />
            <stop offset="55%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#64748b'} />
          </radialGradient>

          <marker id="fbDimArrowStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 10 1.5 L 1 5 L 10 8.5 L 7.5 5 z" fill={c.dim} />
          </marker>
          <marker id="fbDimArrowEnd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 9 5 L 0 8.5 L 2.5 5 z" fill={c.dim} />
          </marker>
          <marker id="fbLeaderDot" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5">
            <circle cx="4" cy="4" r="3" fill={c.dim} />
          </marker>
        </defs>

        {/* Sheet Background */}
        <rect width="920" height="500" fill={c.canvasBg} rx="14" />
        <rect width="920" height="500" fill="url(#fbGridMajor)" rx="14" />

        {/* TOP HEADER BAR (y: 12..42) */}
        <g transform="translate(16, 12)">
          <rect x="0" y="0" width="320" height="30" rx="15" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1.2" />
          <circle cx="16" cy="15" r="5" fill={c.primary} />
          <text x="30" y="19" fill={c.textMain} fontSize="11.5" fontWeight="800" letterSpacing="0.4" fontFamily="var(--font-sans)">
            {pick('CAD SECTION: BOLTED JOINT ASSEMBLY', 'POTONGAN CAD: SAMBUNGAN BAUT', 'CAD断面図：ボルト締結アセンブリ')}
          </text>
        </g>

        <g transform="translate(348, 12)">
          <rect x="0" y="0" width="192" height="30" rx="15" fill={c.primaryBg} stroke={c.primary} strokeWidth="1.2" />
          <text x="96" y="19" fill={c.onPrimaryContainer} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
            {size} × {boltSpec.pitchMm} • Class {propertyClass}
          </text>
        </g>

        {/* LEFT CAD VIEWPORT FRAME */}
        <rect x="16" y="50" width="524" height="438" rx="14" fill="none" stroke={c.cardBorder} strokeWidth="1.2" />

        {/* Top-left Head Standard Pill */}
        <g transform="translate(26, 58)">
          <rect x="0" y="0" width="215" height="22" rx="11" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1" />
          <text x="12" y="14.5" fill={c.textMain} fontSize="10" fontWeight="700" fontFamily="var(--font-sans)">
            {headSpec.name} ({headSpec.standard.split('/')[0].trim()})
          </text>
        </g>

        {/* Bolt Centerline Axis */}
        <line
          x1={cx}
          y1="62"
          x2={cx}
          y2="476"
          stroke={c.dim}
          strokeWidth="1"
          strokeDasharray="12 4 2 4"
          strokeOpacity="0.6"
        />

        {/* CLAMPED PLATES (Plate A: y=185..235, Plate B: y=235..285) */}
        <g id="clampedPlates">
          <rect x="115" y={plateTopY} width="310" height="50" fill={c.cardBg} stroke={c.steelEdge} strokeWidth="1.5" />
          <rect x="115" y={plateTopY} width="310" height="50" fill="url(#fbHatch45)" />
          <rect x="115" y={plateMidY} width="310" height="50" fill={c.cardBg} stroke={c.steelEdge} strokeWidth="1.5" />
          <rect x="115" y={plateMidY} width="310" height="50" fill="url(#fbHatchNeg45)" />

          <rect x="122" y={plateTopY + 14} width="58" height="20" rx="3" fill={c.cardBg} fillOpacity="0.9" stroke={c.cardBorder} strokeWidth="0.8" />
          <text x="151" y={plateTopY + 28} fill={c.textMuted} fontSize="9.5" fontWeight="700" textAnchor="middle">
            PLATE A
          </text>
          <rect x="122" y={plateMidY + 14} width="58" height="20" rx="3" fill={c.cardBg} fillOpacity="0.9" stroke={c.cardBorder} strokeWidth="0.8" />
          <text x="151" y={plateMidY + 28} fill={c.textMuted} fontSize="9.5" fontWeight="700" textAnchor="middle">
            PLATE B
          </text>

          <rect x={cx - rHole} y={plateTopY} width={rHole * 2} height={plateBotY - plateTopY} fill={c.canvasBg} stroke={c.steelEdge} strokeWidth="1.2" />
          {boltHead === 'countersunk-din7991' && (
            <polygon
              points={`${cx - headHalfW - 4},${plateTopY} ${cx + headHalfW + 4},${plateTopY} ${cx + rHole},${plateTopY + 32} ${cx - rHole},${plateTopY + 32}`}
              fill={c.canvasBg}
              stroke={c.steelEdge}
              strokeWidth="1.3"
            />
          )}
          <line x1="115" y1={plateMidY} x2={cx - rHole} y2={plateMidY} stroke={c.steelEdge} strokeWidth="1.8" />
          <line x1={cx + rHole} y1={plateMidY} x2="425" y2={plateMidY} stroke={c.steelEdge} strokeWidth="1.8" />
        </g>

        {/* BOLT SHANK & V-PROFILE THREADS */}
        <g id="boltShankAndThreads">
          <rect
            x={cx - rShank}
            y={plateTopY}
            width={rShank * 2}
            height={threadStartY - plateTopY}
            fill="url(#fbBoltFinishGrad)"
            stroke={c.steelEdge}
            strokeWidth="1.5"
          />
          {boltHead !== 'countersunk-din7991' && boltHead !== 'stud-din975' && (
            <path
              d={`M ${cx - rShank - 4} ${plateTopY} Q ${cx - rShank} ${plateTopY} ${cx - rShank} ${plateTopY + 5} M ${cx + rShank + 4} ${plateTopY} Q ${cx + rShank} ${plateTopY} ${cx + rShank} ${plateTopY + 5}`}
              fill="none"
              stroke={c.steelEdge}
              strokeWidth="1.2"
            />
          )}
          <path
            d={`
              M ${cx - rShank} ${threadStartY}
              L ${threadProfile.leftPts.join(' L ')}
              L ${cx - rShank + 4} ${threadEndY + 7}
              L ${cx + rShank - 4} ${threadEndY + 7}
              L ${threadProfile.rightPts.slice().reverse().join(' L ')}
              L ${cx + rShank} ${threadStartY}
              Z
            `}
            fill="url(#fbBoltFinishGrad)"
            stroke={c.steelEdge}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {threadProfile.ridgeLines.map((ln, idx) => (
            <line
              key={idx}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke={c.steelDark}
              strokeWidth="1.15"
              strokeOpacity="0.65"
            />
          ))}
          <line
            x1={cx - rShank}
            y1={threadStartY}
            x2={cx + rShank}
            y2={threadStartY}
            stroke={c.steelDark}
            strokeWidth="1.1"
            strokeDasharray="3 2"
          />
        </g>

        {/* BOLT HEAD STYLES */}
        <g id="boltHead">
          {boltHead === 'hex-din933' && (
            <g>
              <rect
                x={cx - headHalfW + 4}
                y={plateTopY - 4}
                width={(headHalfW - 4) * 2}
                height="4"
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.2"
              />
              <path
                d={`M ${cx - headHalfW} ${plateTopY - 4} L ${cx - headHalfW} ${plateTopY - 38} L ${cx - headHalfW + 8} ${plateTopY - 44} L ${cx + headHalfW - 8} ${plateTopY - 44} L ${cx + headHalfW} ${plateTopY - 38} L ${cx + headHalfW} ${plateTopY - 4} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.8"
              />
              <path
                d={`M ${cx - headHalfW} ${plateTopY - 38} Q ${cx - headHalfW * 0.72} ${plateTopY - 44} ${cx - headHalfW * 0.45} ${plateTopY - 38} Q ${cx} ${plateTopY - 45} ${cx + headHalfW * 0.45} ${plateTopY - 38} Q ${cx + headHalfW * 0.72} ${plateTopY - 44} ${cx + headHalfW} ${plateTopY - 38}`}
                fill="none"
                stroke={c.steelEdge}
                strokeWidth="1.2"
              />
              <line x1={cx - headHalfW * 0.45} y1={plateTopY - 38} x2={cx - headHalfW * 0.45} y2={plateTopY - 4} stroke={c.steelEdge} strokeWidth="1.4" />
              <line x1={cx + headHalfW * 0.45} y1={plateTopY - 38} x2={cx + headHalfW * 0.45} y2={plateTopY - 4} stroke={c.steelEdge} strokeWidth="1.4" />
              <rect x={cx - 21} y={plateTopY - 30} width="42" height="18" rx="6" fill={c.cardBg} fillOpacity="0.95" stroke={c.primary} strokeWidth="1" />
              <text x={cx} y={plateTopY - 17} fill={c.primary} fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="var(--font-mono)">
                {propertyClass}
              </text>
            </g>
          )}

          {boltHead === 'socket-din912' && (
            <g>
              <path
                d={`M ${cx - headHalfW + 8} ${plateTopY} L ${cx - headHalfW + 8} ${plateTopY - 44} L ${cx - headHalfW + 13} ${plateTopY - 49} L ${cx + headHalfW - 13} ${plateTopY - 49} L ${cx + headHalfW - 8} ${plateTopY - 44} L ${cx + headHalfW - 8} ${plateTopY} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.8"
              />
              {[-3, -2, 2, 3].map((idx) => (
                <line
                  key={idx}
                  x1={cx + idx * ((headHalfW - 14) / 3.5)}
                  y1={plateTopY - 44}
                  x2={cx + idx * ((headHalfW - 14) / 3.5)}
                  y2={plateTopY - 3}
                  stroke={c.steelDark}
                  strokeWidth="1.1"
                  strokeDasharray="2 2"
                />
              ))}
              <path
                d={`M ${cx - rShank * 0.72} ${plateTopY - 49} L ${cx - rShank * 0.72} ${plateTopY - 22} L ${cx} ${plateTopY - 16} L ${cx + rShank * 0.72} ${plateTopY - 22} L ${cx + rShank * 0.72} ${plateTopY - 49} Z`}
                fill={c.canvasBg}
                stroke={c.primary}
                strokeWidth="1.4"
              />
              <line x1={cx - rShank * 0.35} y1={plateTopY - 49} x2={cx - rShank * 0.35} y2={plateTopY - 20} stroke={c.primary} strokeWidth="1" strokeOpacity="0.6" />
              <line x1={cx + rShank * 0.35} y1={plateTopY - 49} x2={cx + rShank * 0.35} y2={plateTopY - 20} stroke={c.primary} strokeWidth="1" strokeOpacity="0.6" />
            </g>
          )}

          {boltHead === 'countersunk-din7991' && (
            <g>
              <polygon
                points={`${cx - headHalfW - 3},${plateTopY} ${cx + headHalfW + 3},${plateTopY} ${cx + rShank},${plateTopY + 31} ${cx - rShank},${plateTopY + 31}`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.8"
              />
              <line x1={cx - headHalfW - 18} y1={plateTopY} x2={cx + headHalfW + 18} y2={plateTopY} stroke={c.emerald} strokeWidth="1.5" strokeDasharray="4 2" />
              <path
                d={`M ${cx - rShank * 0.58} ${plateTopY} L ${cx - rShank * 0.58} ${plateTopY + 15} L ${cx} ${plateTopY + 20} L ${cx + rShank * 0.58} ${plateTopY + 15} L ${cx + rShank * 0.58} ${plateTopY} Z`}
                fill={c.canvasBg}
                stroke={c.primary}
                strokeWidth="1.3"
              />
            </g>
          )}

          {boltHead === 'carriage-din603' && (
            <g>
              <path
                d={`M ${cx - headHalfW - 4} ${plateTopY} C ${cx - headHalfW - 4} ${plateTopY - 44}, ${cx + headHalfW + 4} ${plateTopY - 44}, ${cx + headHalfW + 4} ${plateTopY} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.8"
              />
              <rect
                x={cx - rShank - 4}
                y={plateTopY}
                width={(rShank + 4) * 2}
                height="22"
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.6"
              />
              <line x1={cx - rShank * 0.55} y1={plateTopY} x2={cx - rShank * 0.55} y2={plateTopY + 22} stroke={c.steelDark} strokeWidth="1.2" />
              <line x1={cx + rShank * 0.55} y1={plateTopY} x2={cx + rShank * 0.55} y2={plateTopY + 22} stroke={c.steelDark} strokeWidth="1.2" />
            </g>
          )}

          {boltHead === 'stud-din975' && (
            <g>
              <rect
                x={cx - rShank}
                y={plateTopY - 56}
                width={rShank * 2}
                height="56"
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.5"
              />
              <path
                d={`M ${cx - rShank} ${plateTopY - 56} L ${cx - rShank + 4} ${plateTopY - 62} L ${cx + rShank - 4} ${plateTopY - 62} L ${cx + rShank} ${plateTopY - 56} Z`}
                fill={c.steelLight}
                stroke={c.steelEdge}
                strokeWidth="1.4"
              />
              <rect x={cx - headHalfW - 6} y={plateTopY - 8} width={(headHalfW + 6) * 2} height="8" rx="1.5" fill="url(#fbCylSteelGrad)" stroke={c.steelEdge} strokeWidth="1.3" />
              <path
                d={`M ${cx - headHalfW} ${plateTopY - 8} L ${cx - headHalfW} ${plateTopY - 40} L ${cx - headHalfW + 6} ${plateTopY - 45} L ${cx + headHalfW - 6} ${plateTopY - 45} L ${cx + headHalfW} ${plateTopY - 40} L ${cx + headHalfW} ${plateTopY - 8} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.7"
              />
              <line x1={cx - headHalfW * 0.45} y1={plateTopY - 42} x2={cx - headHalfW * 0.45} y2={plateTopY - 8} stroke={c.steelEdge} strokeWidth="1.3" />
              <line x1={cx + headHalfW * 0.45} y1={plateTopY - 42} x2={cx + headHalfW * 0.45} y2={plateTopY - 8} stroke={c.steelEdge} strokeWidth="1.3" />
            </g>
          )}
        </g>

        {/* HORIZONTAL AF / DRIVE DIMENSION ABOVE HEAD */}
        <g id="afDimension">
          {(() => {
            const dimY = boltHead === 'stud-din975' ? plateTopY - 76 : plateTopY - 64;
            const extStartY = boltHead === 'countersunk-din7991' ? plateTopY - 4 : plateTopY - 46;
            return (
              <g>
                <line x1={cx - headHalfW} y1={dimY - 4} x2={cx - headHalfW} y2={extStartY} stroke={c.dim} strokeWidth="1" strokeDasharray="3 2" />
                <line x1={cx + headHalfW} y1={dimY - 4} x2={cx + headHalfW} y2={extStartY} stroke={c.dim} strokeWidth="1" strokeDasharray="3 2" />
                <line x1={cx - headHalfW + 3} y1={dimY} x2={cx + headHalfW - 3} y2={dimY} stroke={c.dim} strokeWidth="1.5" markerStart="url(#fbDimArrowStart)" markerEnd="url(#fbDimArrowEnd)" />
                <rect x={cx - 58} y={dimY - 25} width="116" height="20" rx="10" fill={c.cardBg} stroke={c.dim} strokeWidth="1" />
                <text x={cx} y={dimY - 11.5} fill={c.dim} fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                  {boltHead === 'socket-din912' || boltHead === 'countersunk-din7991'
                    ? `Allen Key: ${boltSpec.allenKeyMm} mm`
                    : boltHead === 'carriage-din603'
                    ? `Square Neck: ${size}`
                    : `AF (s) = ${boltSpec.hexSpannerMm} mm`}
                </text>
              </g>
            );
          })()}
        </g>

        {/* WASHER STACK */}
        <g id="washerElement">
          {washer === 'flat-din125' && (
            <g>
              <rect
                x={cx - headHalfW - 10}
                y={plateBotY}
                width={(headHalfW + 10) * 2}
                height={washerHeight}
                rx="1.5"
                fill="url(#fbCylSteelGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.5"
              />
              <line x1={cx - headHalfW - 7} y1={plateBotY + 2} x2={cx + headHalfW + 7} y2={plateBotY + 2} stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" />
            </g>
          )}

          {washer === 'spring-din127' && (
            <g>
              <path
                d={`M ${cx - headHalfW - 6} ${plateBotY} L ${cx + headHalfW + 6} ${plateBotY} L ${cx + headHalfW + 6} ${plateBotY + 11} L ${cx + 8} ${plateBotY + 11} L ${cx + 4} ${plateBotY + 15} L ${cx - headHalfW - 6} ${plateBotY + 15} Z`}
                fill="url(#fbCylSteelGrad)"
                stroke={c.amber}
                strokeWidth="1.6"
              />
              <polygon
                points={`${cx - 3},${plateBotY} ${cx + 5},${plateBotY} ${cx + 9},${plateBotY + 15} ${cx + 1},${plateBotY + 15}`}
                fill={c.canvasBg}
                stroke={c.amber}
                strokeWidth="1.2"
              />
            </g>
          )}

          {washer === 'nordlock-din25201' && (
            <g>
              <rect x={cx - headHalfW - 8} y={plateBotY} width={(headHalfW + 8) * 2} height="9" fill="url(#fbCylSteelGrad)" stroke={c.emerald} strokeWidth="1.4" />
              <rect x={cx - headHalfW - 8} y={plateBotY + 9} width={(headHalfW + 8) * 2} height="9" fill="url(#fbCylSteelGrad)" stroke={c.emerald} strokeWidth="1.4" />
              <path
                d={Array.from({ length: 11 })
                  .map((_, i) => {
                    const x0 = cx - headHalfW - 4 + i * (((headHalfW + 4) * 2) / 11);
                    const step = ((headHalfW + 4) * 2) / 11;
                    return `${i === 0 ? 'M' : 'L'} ${x0} ${plateBotY + 11} L ${x0 + step * 0.7} ${plateBotY + 7} L ${x0 + step} ${plateBotY + 11}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={c.emerald}
                strokeWidth="1.8"
              />
              {Array.from({ length: 14 }).map((_, i) => {
                const tx = cx - headHalfW - 4 + i * (((headHalfW + 4) * 2) / 13);
                return (
                  <g key={i}>
                    <line x1={tx} y1={plateBotY} x2={tx} y2={plateBotY + 2.5} stroke={c.steelDark} strokeWidth="1.2" />
                    <line x1={tx} y1={plateBotY + 15.5} x2={tx} y2={plateBotY + 18} stroke={c.steelDark} strokeWidth="1.2" />
                  </g>
                );
              })}
            </g>
          )}
        </g>

        {/* NUT ASSEMBLY */}
        <g id="nutElement">
          {nut === 'hex-din934' && (
            <g>
              <path
                d={`M ${cx - headHalfW} ${nutTopY + 4} L ${cx - headHalfW + 7} ${nutTopY} L ${cx + headHalfW - 7} ${nutTopY} L ${cx + headHalfW} ${nutTopY + 4} L ${cx + headHalfW} ${nutTopY + nutBodyH - 4} L ${cx + headHalfW - 7} ${nutTopY + nutBodyH} L ${cx - headHalfW + 7} ${nutTopY + nutBodyH} L ${cx - headHalfW} ${nutTopY + nutBodyH - 4} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.8"
              />
              <path
                d={`M ${cx - headHalfW} ${nutTopY + 5} Q ${cx - headHalfW * 0.72} ${nutTopY} ${cx - headHalfW * 0.45} ${nutTopY + 5} Q ${cx} ${nutTopY} ${cx + headHalfW * 0.45} ${nutTopY + 5} Q ${cx + headHalfW * 0.72} ${nutTopY} ${cx + headHalfW} ${nutTopY + 5}`}
                fill="none"
                stroke={c.steelEdge}
                strokeWidth="1.1"
              />
              <path
                d={`M ${cx - headHalfW} ${nutTopY + nutBodyH - 5} Q ${cx - headHalfW * 0.72} ${nutTopY + nutBodyH} ${cx - headHalfW * 0.45} ${nutTopY + nutBodyH - 5} Q ${cx} ${nutTopY + nutBodyH} ${cx + headHalfW * 0.45} ${nutTopY + nutBodyH - 5} Q ${cx + headHalfW * 0.72} ${nutTopY + nutBodyH} ${cx + headHalfW} ${nutTopY + nutBodyH - 5}`}
                fill="none"
                stroke={c.steelEdge}
                strokeWidth="1.1"
              />
              <line x1={cx - headHalfW * 0.45} y1={nutTopY + 5} x2={cx - headHalfW * 0.45} y2={nutTopY + nutBodyH - 5} stroke={c.steelEdge} strokeWidth="1.3" />
              <line x1={cx + headHalfW * 0.45} y1={nutTopY + 5} x2={cx + headHalfW * 0.45} y2={nutTopY + nutBodyH - 5} stroke={c.steelEdge} strokeWidth="1.3" />
            </g>
          )}

          {nut === 'nyloc-din985' && (
            <g>
              <path
                d={`M ${cx - headHalfW} ${nutTopY + 4} L ${cx - headHalfW + 7} ${nutTopY} L ${cx + headHalfW - 7} ${nutTopY} L ${cx + headHalfW} ${nutTopY + 4} L ${cx + headHalfW} ${nutTopY + nutBodyH - 6} L ${cx - headHalfW} ${nutTopY + nutBodyH - 6} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.8"
              />
              <line x1={cx - headHalfW * 0.45} y1={nutTopY + 3} x2={cx - headHalfW * 0.45} y2={nutTopY + nutBodyH - 6} stroke={c.steelEdge} strokeWidth="1.3" />
              <line x1={cx + headHalfW * 0.45} y1={nutTopY + 3} x2={cx + headHalfW * 0.45} y2={nutTopY + nutBodyH - 6} stroke={c.steelEdge} strokeWidth="1.3" />
              <path
                d={`M ${cx - headHalfW} ${nutTopY + nutBodyH - 6} L ${cx - headHalfW + 10} ${nutTopY + nutBodyH + 10} L ${cx + headHalfW - 10} ${nutTopY + nutBodyH + 10} L ${cx + headHalfW} ${nutTopY + nutBodyH - 6} Z`}
                fill="url(#fbCylSteelGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.6"
              />
              <rect
                x={cx - rShank - 6}
                y={nutTopY + nutBodyH + 3}
                width={(rShank + 6) * 2}
                height="9"
                rx="3"
                fill={c.nylonBlue}
                stroke="#1d4ed8"
                strokeWidth="1.3"
              />
            </g>
          )}

          {nut === 'flange-din6923' && (
            <g>
              <path
                d={`M ${cx - headHalfW - 16} ${nutTopY} L ${cx + headHalfW + 16} ${nutTopY} L ${cx + headHalfW + 16} ${nutTopY + 6} L ${cx + headHalfW} ${nutTopY + 13} L ${cx - headHalfW} ${nutTopY + 13} L ${cx - headHalfW - 16} ${nutTopY + 6} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.7"
              />
              {Array.from({ length: 13 }).map((_, i) => {
                const tx = cx - headHalfW - 13 + i * (((headHalfW + 13) * 2) / 12);
                return (
                  <polygon key={i} points={`${tx - 2.5},${nutTopY} ${tx + 2.5},${nutTopY} ${tx},${nutTopY - 3}`} fill={c.amber} />
                );
              })}
              <path
                d={`M ${cx - headHalfW} ${nutTopY + 13} L ${cx + headHalfW} ${nutTopY + 13} L ${cx + headHalfW} ${nutTopY + nutBodyH + 3} L ${cx + headHalfW - 7} ${nutTopY + nutBodyH + 8} L ${cx - headHalfW + 7} ${nutTopY + nutBodyH + 8} L ${cx - headHalfW} ${nutTopY + nutBodyH + 3} Z`}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.7"
              />
              <line x1={cx - headHalfW * 0.45} y1={nutTopY + 13} x2={cx - headHalfW * 0.45} y2={nutTopY + nutBodyH + 6} stroke={c.steelEdge} strokeWidth="1.3" />
              <line x1={cx + headHalfW * 0.45} y1={nutTopY + 13} x2={cx + headHalfW * 0.45} y2={nutTopY + nutBodyH + 6} stroke={c.steelEdge} strokeWidth="1.3" />
            </g>
          )}

          {nut === 'castle-din935' && (
            <g>
              <rect
                x={cx - headHalfW}
                y={nutTopY}
                width={headHalfW * 2}
                height={nutBodyH - 8}
                fill="url(#fbBoltFinishGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.8"
              />
              <line x1={cx - headHalfW * 0.45} y1={nutTopY} x2={cx - headHalfW * 0.45} y2={nutTopY + nutBodyH - 8} stroke={c.steelEdge} strokeWidth="1.3" />
              <line x1={cx + headHalfW * 0.45} y1={nutTopY} x2={cx + headHalfW * 0.45} y2={nutTopY + nutBodyH - 8} stroke={c.steelEdge} strokeWidth="1.3" />
              <rect
                x={cx - headHalfW + 5}
                y={nutTopY + nutBodyH - 8}
                width={(headHalfW - 5) * 0.55}
                height="16"
                rx="1.5"
                fill="url(#fbCylSteelGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.5"
              />
              <rect
                x={cx - 8}
                y={nutTopY + nutBodyH - 8}
                width="16"
                height="16"
                rx="1.5"
                fill="url(#fbCylSteelGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.5"
              />
              <rect
                x={cx + headHalfW - 5 - (headHalfW - 5) * 0.55}
                y={nutTopY + nutBodyH - 8}
                width={(headHalfW - 5) * 0.55}
                height="16"
                rx="1.5"
                fill="url(#fbCylSteelGrad)"
                stroke={c.steelEdge}
                strokeWidth="1.5"
              />
              <g id="cotterPin">
                <line x1={cx - headHalfW - 18} y1={nutTopY + nutBodyH + 1} x2={cx + headHalfW + 18} y2={nutTopY + nutBodyH + 1} stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
                <line x1={cx - headHalfW - 18} y1={nutTopY + nutBodyH + 1} x2={cx + headHalfW + 18} y2={nutTopY + nutBodyH + 1} stroke={c.steelEdge} strokeWidth="1.4" />
                <circle cx={cx - headHalfW - 21} cy={nutTopY + nutBodyH + 1} r="6.5" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle cx={cx - headHalfW - 21} cy={nutTopY + nutBodyH + 1} r="6.5" fill="none" stroke={c.steelEdge} strokeWidth="1.3" />
                <path d={`M ${cx + headHalfW + 17} ${nutTopY + nutBodyH - 0.5} L ${cx + headHalfW + 30} ${nutTopY + nutBodyH - 12}`} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                <path d={`M ${cx + headHalfW + 17} ${nutTopY + nutBodyH + 2.5} L ${cx + headHalfW + 31} ${nutTopY + nutBodyH + 13}`} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          )}
        </g>

        {/* LEFT CALLOUTS */}
        <g id="leftCallouts">
          <path
            d={`M ${cx - headHalfW - 10} ${plateBotY + washerHeight * 0.5} L 166 ${plateBotY + washerHeight * 0.5} L 156 312`}
            fill="none"
            stroke={c.dim}
            strokeWidth="1.2"
            markerStart="url(#fbLeaderDot)"
          />
          <rect x="24" y="294" width="132" height="36" rx="10" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1" />
          <text x="32" y="308" fill={c.textMuted} fontSize="8.5" fontWeight="800" fontFamily="var(--font-sans)">
            {pick('WASHER', 'RING', '座金')}
          </text>
          <text x="32" y="322" fill={c.textMain} fontSize="10" fontWeight="700" fontFamily="var(--font-sans)">
            {washer === 'flat-din125' ? 'Flat DIN 125' : washer === 'spring-din127' ? 'Split Spring DIN 127' : 'Nord-Lock DIN 25201'}
          </text>

          <path
            d={`M ${cx - headHalfW - 4} ${nutTopY + 20} L 166 ${nutTopY + 20} L 156 358`}
            fill="none"
            stroke={c.dim}
            strokeWidth="1.2"
            markerStart="url(#fbLeaderDot)"
          />
          <rect x="24" y="340" width="132" height="36" rx="10" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1" />
          <text x="32" y="354" fill={c.textMuted} fontSize="8.5" fontWeight="800" fontFamily="var(--font-sans)">
            {pick('NUT TYPE', 'TIPE MUR', 'ナット形式')}
          </text>
          <text x="32" y="368" fill={c.textMain} fontSize="10" fontWeight="700" fontFamily="var(--font-sans)">
            {nut === 'hex-din934'
              ? 'Hex Nut DIN 934'
              : nut === 'nyloc-din985'
              ? 'Nyloc DIN 985'
              : nut === 'flange-din6923'
              ? 'Flange DIN 6923'
              : 'Castle + Cotter'}
          </text>
        </g>

        {/* RIGHT CALLOUTS */}
        <g id="rightCallouts">
          <line x1="428" y1={plateTopY} x2="452" y2={plateTopY} stroke={c.dim} strokeWidth="1" strokeDasharray="3 2" />
          <line x1="428" y1={plateBotY} x2="452" y2={plateBotY} stroke={c.dim} strokeWidth="1" strokeDasharray="3 2" />
          <line x1="444" y1={plateTopY + 3} x2="444" y2={plateBotY - 3} stroke={c.dim} strokeWidth="1.5" markerStart="url(#fbDimArrowStart)" markerEnd="url(#fbDimArrowEnd)" />
          <rect x="454" y="220" width="76" height="30" rx="8" fill={c.cardBg} stroke={c.dim} strokeWidth="1" />
          <text x="492" y="233" fill={c.textMuted} fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="var(--font-sans)">
            GRIP Lk
          </text>
          <text x="492" y="245" fill={c.dim} fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
            100 mm
          </text>

          <path d={`M ${cx + rShank + 2} 410 L 380 410`} fill="none" stroke={c.dim} strokeWidth="1.2" markerStart="url(#fbLeaderDot)" />
          <rect x="380" y="392" width="148" height="36" rx="10" fill={c.cardBg} stroke={c.dim} strokeWidth="1" />
          <text x="454" y="406" fill={c.textMuted} fontSize="8.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-sans)">
            {pick('METRIC THREAD (6g)', 'ULIR METRIK (6g)', 'メートルねじ')}
          </text>
          <text x="454" y="420" fill={c.dim} fontSize="10.5" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
            {size} × {boltSpec.pitchMm} mm Pitch
          </text>

          <line x1={cx - rShank} y1={threadEndY + 10} x2={cx - rShank} y2={threadEndY + 30} stroke={c.dim} strokeWidth="1" strokeDasharray="2 2" />
          <line x1={cx + rShank} y1={threadEndY + 10} x2={cx + rShank} y2={threadEndY + 30} stroke={c.dim} strokeWidth="1" strokeDasharray="2 2" />
          <line x1={cx - rShank + 2} y1={threadEndY + 24} x2={cx + rShank - 2} y2={threadEndY + 24} stroke={c.dim} strokeWidth="1.4" markerStart="url(#fbDimArrowStart)" markerEnd="url(#fbDimArrowEnd)" />
          <rect x={cx - 42} y={threadEndY + 30} width="84" height="18" rx="9" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="0.9" />
          <text x={cx} y={threadEndY + 42.5} fill={c.textMain} fontSize="9.5" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
            d = {boltSpec.diameterMm} mm
          </text>
        </g>

        {/* RIGHT SIDE: TECHNICAL SPEC & HEAD STAMP PANEL (x: 556..904, y: 12..488) */}
        <g id="specPanel" transform="translate(556, 12)">
          <rect x="0" y="0" width="348" height="476" rx="16" fill={c.cardBg} stroke={c.cardBorder} strokeWidth="1.4" />

          {/* Section 1: Authentic Bolt Head Top-View Stamp */}
          <g transform="translate(18, 16)">
            <polygon
              points="40,4 72,22 72,58 40,76 8,58 8,22"
              fill="url(#fbHeadTopGrad)"
              stroke={c.steelEdge}
              strokeWidth="2"
            />
            <circle cx="40" cy="40" r="28" fill="none" stroke={c.steelDark} strokeWidth="1.2" strokeOpacity="0.5" />
            <text x="40" y="30" fill={c.textMuted} fontSize="8.5" fontWeight="800" textAnchor="middle" letterSpacing="1" fontFamily="var(--font-sans)">
              MECH-LAB
            </text>
            <text x="40" y="49" fill={c.primary} fontSize={propertyClass.length > 4 ? '12.5' : '16'} fontWeight="900" textAnchor="middle" fontFamily="var(--font-mono)">
              {propertyClass}
            </text>

            <text x="90" y="20" fill={c.textMain} fontSize="13.5" fontWeight="800" fontFamily="var(--font-sans)">
              {pick('PROPERTY CLASS', 'KELAS KEKUATAN', '強度区分')} {propertyClass}
            </text>
            <text x="90" y="37" fill={c.textMuted} fontSize="10.5" fontFamily="var(--font-sans)">
              {propClassSpec.material.length > 34 ? `${propClassSpec.material.slice(0, 34)}...` : propClassSpec.material}
            </text>
            <rect x="90" y="47" width="224" height="20" rx="10" fill={c.primaryBg} stroke={c.primary} strokeWidth="0.9" />
            <text x="100" y="60" fill={c.onPrimaryContainer} fontSize="9.5" fontWeight="700" fontFamily="var(--font-sans)">
              {propClassSpec.heatTreatment.length > 34 ? `${propClassSpec.heatTreatment.slice(0, 34)}` : propClassSpec.heatTreatment}
            </text>
          </g>

          {/* Section 2: Strength Decoder Breakdown */}
          <g transform="translate(16, 108)">
            <rect x="0" y="0" width="316" height="106" rx="12" fill={c.cardSubBg} stroke={c.cardBorder} strokeWidth="1" />
            <text x="12" y="19" fill={c.textMuted} fontSize="9.5" fontWeight="800" letterSpacing="0.5" fontFamily="var(--font-sans)">
              {pick('STRENGTH DECODER', 'DEKODER KEKUATAN BAJA', '強度区分の計算ルール')}
            </text>

            <text x="12" y="42" fill={c.textMain} fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">
              • {pick('Tensile (UTS)', 'Tarik (UTS)', '引張強さ')}:{' '}
              <tspan fill={c.primary} fontWeight="900" fontFamily="var(--font-mono)">{propClassSpec.nominalTensileMpa} MPa</tspan>
            </text>
            <text x="182" y="42" fill={c.textMuted} fontSize="9.5" fontFamily="var(--font-mono)">
              {decoderFormulaLines.rmFormula}
            </text>

            <text x="12" y="65" fill={c.textMain} fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">
              • {pick('Yield (Re)', 'Luluh (Re)', '降伏耐力')}:{' '}
              <tspan fill={c.primary} fontWeight="900" fontFamily="var(--font-mono)">{propClassSpec.yieldStrengthMpa} MPa</tspan>
            </text>
            <text x="182" y="65" fill={c.textMuted} fontSize="9.5" fontFamily="var(--font-mono)">
              {decoderFormulaLines.reFormula}
            </text>

            <line x1="12" y1="77" x2="304" y2="77" stroke={c.cardBorder} strokeWidth="0.8" />
            <text x="12" y="95" fill={c.textMuted} fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)">
              • {pick('Proof Stress (Sp)', 'Beban Bukti (Sp)', '保証荷重応力')}:{' '}
              <tspan fill={c.primary} fontWeight="800" fontFamily="var(--font-mono)">{propClassSpec.proofStrengthMpa} MPa</tspan>{' '}
              (Fp = {jointCalc.proofLoadKn.toFixed(1)} kN)
            </text>
          </g>

          {/* Section 3: Recommended Wrench & Allen Key */}
          <g transform="translate(16, 228)">
            <text x="0" y="0" fill={c.textMuted} fontSize="9.5" fontWeight="800" letterSpacing="0.5" fontFamily="var(--font-sans)">
              {pick('RECOMMENDED TOOLING', 'UKURAN KUNCI PAS & KUNCI L', '推奨スパナ・六角棒レンチ')}
            </text>
            <g transform="translate(0, 8)">
              <rect x="0" y="0" width="152" height="58" rx="12" fill={c.cardSubBg} stroke={c.cardBorder} strokeWidth="1" />
              <text x="12" y="19" fill={c.textMuted} fontSize="10" fontFamily="var(--font-sans)">
                {pick('Hex Spanner (AF)', 'Kunci Pas Hex', 'スパナ二面幅')}
              </text>
              <text x="12" y="45" fill={c.primary} fontSize="20" fontWeight="900" fontFamily="var(--font-mono)">
                {boltSpec.hexSpannerMm} mm
              </text>
            </g>
            <g transform="translate(164, 8)">
              <rect x="0" y="0" width="152" height="58" rx="12" fill={c.cardSubBg} stroke={c.cardBorder} strokeWidth="1" />
              <text x="12" y="19" fill={c.textMuted} fontSize="10" fontFamily="var(--font-sans)">
                {pick('Allen Key Socket', 'Kunci L Socket', '六角穴レンチ')}
              </text>
              <text x="12" y="45" fill={c.primary} fontSize="20" fontWeight="900" fontFamily="var(--font-mono)">
                {boltSpec.allenKeyMm} mm
              </text>
            </g>
          </g>

          {/* Section 4: Tightening Torque for active Class @ 75% Proof Preload */}
          <g transform="translate(16, 312)">
            <text x="0" y="0" fill={c.textMuted} fontSize="9.5" fontWeight="800" letterSpacing="0.5" fontFamily="var(--font-sans)">
              {pick(`TIGHTENING TORQUE (${propertyClass} @ 75% Fp)`, `TORSI PENGENCANGAN (${propertyClass}, 75% Fp)`, `推奨締付トルク（${propertyClass} 75%）`)}
            </text>
            <g transform="translate(0, 8)">
              <rect x="0" y="0" width="152" height="52" rx="12" fill={c.cardSubBg} stroke={c.cardBorder} strokeWidth="1" />
              <text x="12" y="18" fill={c.textMuted} fontSize="9.5" fontFamily="var(--font-sans)">
                {pick('Dry Steel (K=0.20)', 'Kering (K=0.20)', 'ドライ (K=0.20)')}
              </text>
              <text x="12" y="40" fill={c.primary} fontSize="16" fontWeight="900" fontFamily="var(--font-mono)">
                {jointCalc.recommendedTorqueDryNm.toFixed(1)} N·m
              </text>
            </g>
            <g transform="translate(164, 8)">
              <rect x="0" y="0" width="152" height="52" rx="12" fill={c.cardSubBg} stroke={c.cardBorder} strokeWidth="1" />
              <text x="12" y="18" fill={c.textMuted} fontSize="9.5" fontFamily="var(--font-sans)">
                {pick('Lubricated (K=0.15)', 'Terlumasi (K=0.15)', '潤滑時 (K=0.15)')}
              </text>
              <text x="12" y="40" fill={c.emerald} fontSize="16" fontWeight="900" fontFamily="var(--font-mono)">
                {jointCalc.recommendedTorqueLubeNm.toFixed(1)} N·m
              </text>
            </g>
          </g>

          {/* Section 5: Anti-Loosening Rating Banner */}
          <g transform="translate(16, 390)">
            <rect x="0" y="0" width="316" height="68" rx="14" fill={lockingRating.bg} stroke={lockingRating.color} strokeWidth="1.2" />
            <text x="12" y="19" fill={lockingRating.color} fontSize="10" fontWeight="900" letterSpacing="0.4" fontFamily="var(--font-sans)">
              {lockingRating.badge}
            </text>
            <text x="12" y="36" fill={c.textMain} fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)">
              {washerSpec.name} + {nutSpec.name}
            </text>
            <text x="12" y="54" fill={c.textMuted} fontSize="9.5" fontFamily="var(--font-sans)">
              {lockingRating.detail}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
