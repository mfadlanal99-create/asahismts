import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { BeltSpec, WedgingPhysicsResult } from './vbeltBasicsData';

interface VbeltBasicsSvgProps {
  beltSpec: BeltSpec;
  pulleyCondition: 'proper' | 'bottomed_out' | 'worn_sheave';
  beltTensionN: number;
  wedgingPhysics: WedgingPhysicsResult;
}

/** Wrap text cleanly for SVG <tspan> considering wider CJK glyphs */
function wrapSvgText(text: string, maxUnits: number): string[] {
  const lines: string[] = [];
  let current = '';
  let units = 0;

  // Split by space when spaces exist, else character by character for CJK
  const hasSpaces = text.includes(' ');
  if (hasSpaces) {
    const words = text.split(' ');
    for (const word of words) {
      let wordUnits = 0;
      for (const ch of word) {
        wordUnits += ch.charCodeAt(0) > 0x2e80 ? 1.8 : 1;
      }
      if (units + (current ? 1 : 0) + wordUnits > maxUnits && current) {
        lines.push(current);
        current = word;
        units = wordUnits;
      } else {
        current = current ? `${current} ${word}` : word;
        units += (current === word ? 0 : 1) + wordUnits;
      }
    }
    if (current) lines.push(current);
  } else {
    for (const ch of text) {
      const w = ch.charCodeAt(0) > 0x2e80 ? 1.8 : 1;
      if (units + w > maxUnits && current) {
        lines.push(current);
        current = ch;
        units = w;
      } else {
        current += ch;
        units += w;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}


export function VbeltBasicsSvg({
  beltSpec,
  pulleyCondition,
  beltTensionN,
  wedgingPhysics,
}: VbeltBasicsSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  // Theme-aware Material You CAD colors
  const canvasBg = 'var(--md-surface-container-lowest)';
  const gridColor = 'var(--md-outline-variant)';
  const cardBg = 'var(--md-surface-container-low)';
  const cardHeaderBg = 'var(--md-surface-container)';
  const cardStroke = 'var(--md-outline-variant)';
  const textPrimary = 'var(--md-on-surface)';
  const textMuted = 'var(--md-on-surface-variant)';
  const dimBlue = 'var(--md-primary)';
  const ringOutline = isDark ? '#94a3b8' : '#334155';
  const rubberEdge = isDark ? '#475569' : '#0f172a';

  // Fault evaluations

  const isTimingOrFlat = beltSpec.wedgeAngleDeg === 0;
  const isBottomedOut = !isTimingOrFlat && wedgingPhysics.bottomingOutOccurring;

  return (
    <svg
      viewBox="0 0 640 460"
      className="w-full max-h-[480px] select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cast Iron Housing / Pulley Sheave Gradient */}
        <linearGradient id="bbCastIron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
          <stop offset="50%" stopColor={isDark ? '#334155' : '#94a3b8'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#64748b'} />
        </linearGradient>

        {/* Belt Rubber Core Gradient */}
        <linearGradient id="bbBeltRubber" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#334155' : '#475569'} />
          <stop offset="50%" stopColor={isDark ? '#1e293b' : '#334155'} />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>


        <pattern id="bbHatchCastIron" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="5" stroke={isDark ? '#94a3b8' : '#334155'} strokeWidth="0.9" opacity="0.4" />
        </pattern>

        {/* Crisp Arrow Markers */}
        <marker id="bbArrowSky" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--md-primary)" />
        </marker>
        <marker id="bbArrowRed" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
        <marker id="bbDimTick" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 1 2 L 8 5 L 1 8 z" fill={dimBlue} />
        </marker>
      </defs>

      {/* Clean Blueprint Background */}
      <rect width="640" height="460" fill={canvasBg} rx="18" />
      <g stroke={gridColor} strokeWidth="0.75" opacity={isDark ? 0.3 : 0.45}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`vg-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="460" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`hg-${i}`} x1="0" y1={i * 40} x2="640" y2={i * 40} />
        ))}
      </g>


        <g id="belt-cad-scene">
          {/* Top Header Area */}
          <g transform="translate(18, 22)">
            <text x="0" y="0" fontSize="13.5" fontWeight="800" fontFamily="var(--font-sans)" fill={textPrimary}>
              {pick(beltSpec.name, beltSpec.nameId, beltSpec.nameJa)}
            </text>
            <text x="0" y="16" fontSize="9.5" fontWeight="600" fontFamily="var(--font-mono)" fill={textMuted}>
              {`Profile: ${beltSpec.code}  •  Width × Height: ${beltSpec.topWidthMm} × ${beltSpec.heightMm} mm  •  Groove: ${beltSpec.wedgeAngleDeg > 0 ? `${beltSpec.wedgeAngleDeg}°` : 'Positive / Flat'}`}
            </text>
          </g>

          {/* Top-Right Status / Bottoming-Out Alert Pill */}
          {isBottomedOut ? (
            <g transform="translate(362, 8)">
              <rect width="262" height="36" rx="12" fill={isDark ? '#450a0a' : '#fef2f2'} stroke="#ef4444" strokeWidth="1.6" />
              <text x="12" y="15" fontSize="9.5" fontWeight="800" fontFamily="var(--font-sans)" fill={isDark ? '#fca5a5' : '#b91c1c'}>
                {pick('CRITICAL: BOTTOMING-OUT FAILURE!', 'KRITIS: KEGAGALAN BOTTOMING OUT!', '重大故障：プーリ底突き（ボトミング）！')}
              </text>
              <text x="12" y="28" fontSize="8.2" fontFamily="var(--font-sans)" fill={isDark ? '#f87171' : '#dc2626'}>
                {pick('Sidewall wedge lost! μ′ dropped to 0.30 (Slip!)', 'Efek baji hilang! μ′ anjlok ke 0.30 (Selip parah!)', 'くさび効果喪失！μ′が0.30へ急落しスリップ焼損！')}
              </text>
            </g>
          ) : pulleyCondition === 'worn_sheave' && !isTimingOrFlat ? (
            <g transform="translate(392, 8)">
              <rect width="232" height="36" rx="12" fill={isDark ? '#451a03' : '#fffbeb'} stroke="#f59e0b" strokeWidth="1.4" />
              <text x="12" y="15" fontSize="9.5" fontWeight="800" fontFamily="var(--font-sans)" fill={isDark ? '#fcd34d' : '#b45309'}>
                {pick('WARNING: DISHED / WORN SHEAVE', 'PERINGATAN: ALUR PULI AUS', '警告：プーリ溝側面が摩耗')}
              </text>
              <text x="12" y="28" fontSize="8.2" fontFamily="var(--font-sans)" fill={isDark ? '#fbbf24' : '#d97706'}>
                {pick('Belt rides low; replace sheave before bottoming.', 'Sabuk duduk terlalu dalam; segera ganti puli.', 'ベルト沈み込み過多。底突き前に交換推奨。')}
              </text>
            </g>
          ) : (
            <g transform="translate(422, 10)">
              <rect width="202" height="30" rx="15" fill={isDark ? '#064e3b' : '#ecfdf5'} stroke="#10b981" strokeWidth="1.2" />
              <circle cx="15" cy="15" r="4" fill="#10b981" />
              <text x="26" y="18.5" fontSize="9.2" fontWeight="700" fontFamily="var(--font-sans)" fill={isDark ? '#6ee7b7' : '#047857'}>
                {isTimingOrFlat
                  ? pick('PROPER BELT TRACKING', 'KEDUDUKAN SABUK OPTIMAL', '適正かみ合い・トラッキング')
                  : pick('OPTIMAL SIDEWALL WEDGING', 'BAJI DINDING SAMPING OPTIMAL', '適正側面くさび着座')}
              </text>
            </g>
          )}

          {/* CAD Viewport Frame */}
          <rect
            x="16"
            y="52"
            width="404"
            height="394"
            rx="16"
            fill={cardBg}
            fillOpacity="0.65"
            stroke={cardStroke}
            strokeWidth="1.2"
          />

          {/* PULLEY SHEAVE & BELT CROSS-SECTION ORIGIN (cx=218, cy=250) */}
          <g transform="translate(218, 250)">
            {/* Render Profile-Appropriate Pulley + Belt */}
            {renderBeltPulleyScene({
              beltSpec,
              pulleyCondition,
              beltTensionN,
              wedgingPhysics,
              textPrimary,
              dimBlue,
              ringOutline,
              rubberEdge,
              cardBg,
              pick,
            })}
          </g>

          {/* RIGHT WEDGING PHYSICS & TELEMETRY CARD (x: 432..624, y: 52..446) */}
          <g transform="translate(432, 52)">
            <rect width="192" height="394" rx="14" fill={cardBg} stroke={cardStroke} strokeWidth="1.2" />
            <path d="M 0 14 Q 0 0 14 0 L 178 0 Q 192 0 192 14 L 192 30 L 0 30 Z" fill={cardHeaderBg} />
            <line x1="0" y1="30" x2="192" y2="30" stroke={cardStroke} strokeWidth="1" />
            <text x="12" y="19" fontSize="10" fontWeight="800" fontFamily="var(--font-sans)" fill={textPrimary}>
              {pick('Drive & Wedge Physics', 'Fisika Baji & Transmisi', 'くさび摩擦力学解析')}
            </text>

            <g transform="translate(12, 48)">
              {/* Apparent Friction */}
              <text x="0" y="0" fontSize="8.2" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
                {isTimingOrFlat
                  ? pick('Drive Engagement', 'Mekanisme Transmisi', '動力伝達方式')
                  : pick('Apparent Friction (μ′)', 'Gesekan Semu (μ′)', '見かけ摩擦係数 (μ′)')}
              </text>
              {isTimingOrFlat ? (
                <text x="0" y="18" fontSize="11.5" fontWeight="800" fontFamily="var(--font-sans)" fill="#10b981">
                  {beltSpec.code.startsWith('HTD')
                    ? pick('Positive Tooth Mesh', 'Kait Gigi Positif', '歯形ポジティブ噛合')
                    : pick('Flat Crown Friction', 'Gesekan Sabuk Datar', 'クラウン平摩擦 (η>98%)')}
                </text>
              ) : (
                <g>
                  <text
                    x="0"
                    y="19"
                    fontSize="15"
                    fontWeight="900"
                    fontFamily="var(--font-mono)"
                    fill={isBottomedOut ? '#ef4444' : '#10b981'}
                  >
                    μ′ = {wedgingPhysics.apparentFrictionMuPrime.toFixed(2)}
                  </text>
                  <text x="82" y="18" fontSize="8.2" fontFamily="var(--font-mono)" fill={textMuted}>
                    (base μ = {wedgingPhysics.baseFrictionMu})
                  </text>
                </g>
              )}

              {/* Wedging Multiplier */}
              <text x="0" y="42" fontSize="8.2" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
                {pick('Wedging Multiplier', 'Pengganda Efek Baji', 'くさび力増幅率')}
              </text>
              <text x="0" y="56" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill={textPrimary}>
                {isTimingOrFlat
                  ? 'N/A (0° Wedge)'
                  : `1 / sin(${(beltSpec.wedgeAngleDeg / 2).toFixed(0)}°) = ${wedgingPhysics.wedgingMultiplier}×`}
              </text>

              {/* Sidewall Normal Force */}
              <text x="0" y="78" fontSize="8.2" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
                {pick('Sidewall Clamping (F_N)', 'Gaya Tekan Dinding (F_N)', '側面垂直抗力 (F_N)')}
              </text>
              <text x="0" y="92" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill={dimBlue}>
                {isTimingOrFlat
                  ? `${beltTensionN} N (Radial)`
                  : `${wedgingPhysics.normalForcePerSideN} N / flank`}
              </text>

              {/* Max Traction */}
              <text x="0" y="114" fontSize="8.2" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
                {pick('Max Grip Traction', 'Gaya Traksi Maksimum', '最大伝達トラクション')}
              </text>
              <text
                x="0"
                y="128"
                fontSize="9.8"
                fontWeight="800"
                fontFamily="var(--font-mono)"
                fill={isBottomedOut ? '#ef4444' : '#10b981'}
              >
                {isTimingOrFlat
                  ? `${(beltTensionN * 1.8).toFixed(0)} N (Tooth Shear)`
                  : `${wedgingPhysics.totalTransmittedTractionN} N`}
              </text>

              {/* Min Sheave Diameter */}
              <text x="0" y="150" fontSize="8.2" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
                {pick('Min Pulley Diameter', 'Diameter Puli Minimum', '最小許容プーリ径')}
              </text>
              <text x="0" y="164" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill={textPrimary}>
                Ø{beltSpec.minSheaveDiameterMm} mm
              </text>

              {/* Max Speed */}
              <text x="0" y="186" fontSize="8.2" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
                {pick('Max Rated Belt Speed', 'Kecepatan Sabuk Maks', '最高許容周速度')}
              </text>
              <text x="0" y="200" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill={textPrimary}>
                {beltSpec.maxBeltSpeedMPerS} m/s  •  {beltSpec.nominalPowerKwPerStrand} kW/strand
              </text>

              {/* Diagnosis Box (Wrapped clean lines) */}
              <rect
                x="0"
                y="218"
                width="168"
                height="114"
                rx="10"
                fill={isBottomedOut ? (isDark ? '#450a0a' : '#fef2f2') : cardHeaderBg}
                stroke={isBottomedOut ? '#ef4444' : cardStroke}
                strokeWidth="1.1"
              />
              <text
                x="9"
                y="233"
                fontSize="8"
                fontWeight="800"
                fontFamily="var(--font-sans)"
                fill={isBottomedOut ? '#ef4444' : dimBlue}
              >
                {pick('SEATING DIAGNOSIS', 'DIAGNOSIS KEDUDUKAN', '着座状態診断')}
              </text>
              <text
                x="9"
                y="248"
                fontSize="7.8"
                fontWeight="600"
                fontFamily="var(--font-sans)"
                fill={isBottomedOut ? (isDark ? '#fca5a5' : '#991b1b') : textPrimary}
              >
                {wrapSvgText(
                  isTimingOrFlat
                    ? pick(
                        beltSpec.constructionDescription,
                        beltSpec.constructionDescriptionId,
                        beltSpec.constructionDescriptionJa
                      )
                    : pick(
                        wedgingPhysics.statusTextEn,
                        wedgingPhysics.statusTextId,
                        wedgingPhysics.statusTextJa
                      ),
                  25
                )
                  .slice(0, 7)
                  .map((line, idx) => (
                    <tspan key={`diag-${idx}`} x="9" dy={idx === 0 ? 0 : 11}>
                      {line}
                    </tspan>
                  ))}
              </text>
            </g>
          </g>
        </g>
    </svg>
  );
}

// =====================================================================
// HELPER: MODE 2 PULLEY SHEAVE & BELT CROSS-SECTION CAD SCENE
// =====================================================================
function renderBeltPulleyScene({
  beltSpec,
  pulleyCondition,
  beltTensionN,
  wedgingPhysics,
  textPrimary,
  dimBlue,
  ringOutline,
  rubberEdge,
  cardBg,
  pick,
}: {
  beltSpec: BeltSpec;
  pulleyCondition: 'proper' | 'bottomed_out' | 'worn_sheave';
  beltTensionN: number;
  wedgingPhysics: WedgingPhysicsResult;
  textPrimary: string;
  dimBlue: string;
  ringOutline: string;
  rubberEdge: string;
  cardBg: string;
  pick: <T>(en: T, id: T, ja: T) => T;
}) {
  // 1. TIMING / SYNCHRONOUS BELT (HTD 5M vs HTD 8M proportionally scaled!)
  if (beltSpec.code.startsWith('HTD')) {
    const is8M = beltSpec.code === 'HTD_8M';
    const pitchMm = is8M ? 8.0 : 5.0;
    const toothDepthPx = is8M ? 20 : 12;
    const backingPx = is8M ? 13 : 9;
    const pitchPx = is8M ? 46 : 29;
    const numTeeth = is8M ? 5 : 9;
    const totalHalfSpan = (numTeeth * pitchPx) / 2;
    const flangeX = totalHalfSpan + 14;

    // Build sprocket pocket path & belt tooth path dynamically from pitchPx & toothDepthPx
    let sprocketPath = `M -154 -36 L ${-flangeX} -36 L ${-flangeX} 8 `;
    let beltPath = `M ${-totalHalfSpan - 4} ${-backingPx - 6} L ${totalHalfSpan + 4} ${-backingPx - 6} L ${totalHalfSpan + 4} 6 `;
    const toothCenters: number[] = [];
    for (let i = 0; i < numTeeth; i++) {
      const startX = -totalHalfSpan + i * pitchPx;
      const midX = startX + pitchPx / 2;
      toothCenters.push(midX);
      const tW = pitchPx * 0.62;
      const tStart = midX - tW / 2;
      const tEnd = midX + tW / 2;
      sprocketPath += `L ${tStart} 8 Q ${midX} ${8 + toothDepthPx} ${tEnd} 8 `;
    }
    sprocketPath += `L ${flangeX} 8 L ${flangeX} -36 L 154 -36 L 154 96 L -154 96 Z`;

    for (let i = numTeeth - 1; i >= 0; i--) {
      const startX = -totalHalfSpan + i * pitchPx;
      const midX = startX + pitchPx / 2;
      const tW = pitchPx * 0.58;
      const tStart = midX - tW / 2;
      const tEnd = midX + tW / 2;
      beltPath += `L ${tEnd} 6 Q ${midX} ${6 + toothDepthPx - 1} ${tStart} 6 `;
    }
    beltPath += `L ${-totalHalfSpan - 4} 6 Z`;

    return (
      <g id="htd-timing-scene">
        <path d={sprocketPath} fill="url(#bbCastIron)" stroke={ringOutline} strokeWidth="1.6" />
        <path d={sprocketPath} fill="url(#bbHatchCastIron)" />
        <path d={beltPath} fill="url(#bbBeltRubber)" stroke={rubberEdge} strokeWidth="1.8" />
        {/* Fiberglass Cords along Pitch Line */}
        {Array.from({ length: 14 }).map((_, i) => (
          <circle
            key={`htd-c-${i}`}
            cx={-totalHalfSpan + 8 + i * ((totalHalfSpan * 2 - 16) / 13)}
            cy={-backingPx / 2}
            r={is8M ? 3 : 2.2}
            fill="#eab308"
            stroke="#854d0e"
            strokeWidth="0.7"
          />
        ))}
        {/* Live Pitch Dimension Arrow */}
        <line x1={toothCenters[1]} y1="-54" x2={toothCenters[2]} y2="-54" stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <line x1={toothCenters[1]} y1="-58" x2={toothCenters[1]} y2="-20" stroke={dimBlue} strokeWidth="0.8" strokeDasharray="3,2" />
        <line x1={toothCenters[2]} y1="-58" x2={toothCenters[2]} y2="-20" stroke={dimBlue} strokeWidth="0.8" strokeDasharray="3,2" />
        <rect x={(toothCenters[1] + toothCenters[2]) / 2 - 36} y="-74" width="72" height="15" rx="7.5" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x={(toothCenters[1] + toothCenters[2]) / 2} y="-63.5" fontSize="8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          Pitch = {pitchMm.toFixed(1)} mm
        </text>

        {/* Live Height Dimension Arrow */}
        <line x1="-168" y1={-backingPx - 6} x2="-168" y2={6 + toothDepthPx} stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <rect x="-196" y="-44" width="58" height="15" rx="7.5" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x="-167" y="-33.5" fontSize="7.8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          H = {beltSpec.heightMm}mm
        </text>

        <text x="0" y="-96" fontSize="9.5" fontWeight="800" textAnchor="middle" fill="#10b981">
          {pick('Curvilinear Positive Tooth Meshing (Zero Slip)', 'Keterkaitan Gigi Positif (Tanpa Selip)', '円弧歯形ポジティブ噛合い（スリップゼロ）')}
        </text>
        <text x="0" y="74" fontSize="8.8" fontWeight="700" textAnchor="middle" fill={textPrimary}>
          {pick(`Machined HTD ${is8M ? '8M' : '5M'} Sprocket (Width ${beltSpec.topWidthMm}mm)`, `Sproket HTD ${is8M ? '8M' : '5M'} (Lebar ${beltSpec.topWidthMm}mm)`, `HTD ${is8M ? '8M' : '5M'} タイミングプーリ（幅 ${beltSpec.topWidthMm}mm）`)}
        </text>
      </g>
    );
  }

  // 2. FLAT BELT ON CROWNED PULLEY (40 × 2.5 mm proportional)
  if (beltSpec.code === 'Flat') {
    return (
      <g id="flat-belt-scene">
        <path d="M -150 10 Q 0 -8 150 10 L 150 96 L -150 96 Z" fill="url(#bbCastIron)" stroke={ringOutline} strokeWidth="1.6" />
        <path d="M -150 10 Q 0 -8 150 10 L 150 96 L -150 96 Z" fill="url(#bbHatchCastIron)" />
        {/* Flat Belt Body (160px wide = 40mm @ 4px/mm, 12px thick) */}
        <path d="M -128 -10 Q 0 -27 128 -10 L 128 4 Q 0 -13 -128 4 Z" fill="url(#bbBeltRubber)" stroke={rubberEdge} strokeWidth="1.8" />
        <path d="M -124 -3 Q 0 -20 124 -3" fill="none" stroke="#eab308" strokeWidth="3.2" strokeDasharray="8,3" />
        {/* Width Dimension */}
        <line x1="-128" y1="-44" x2="128" y2="-44" stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <line x1="-128" y1="-48" x2="-128" y2="-14" stroke={dimBlue} strokeWidth="0.8" />
        <line x1="128" y1="-48" x2="128" y2="-14" stroke={dimBlue} strokeWidth="0.8" />
        <rect x="-42" y="-64" width="84" height="16" rx="8" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x="0" y="-53" fontSize="8.2" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          W = {beltSpec.topWidthMm} mm
        </text>
        {/* Thickness Dimension */}
        <line x1="-142" y1="-10" x2="-142" y2="4" stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <rect x="-195" y="-12" width="48" height="15" rx="7.5" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x="-171" y="-1.5" fontSize="7.8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          H={beltSpec.heightMm}mm
        </text>
        <text x="0" y="-82" fontSize="9.5" fontWeight="800" textAnchor="middle" fill={dimBlue}>
          {pick('High-Efficiency Flat Belt (>98%) on Crowned Pulley', 'Sabuk Datar Efisiensi Tinggi (>98%) pada Puli Kubah', 'クラウンプーリー上の高効率平ベルト（効率98%超）')}
        </text>
        <text x="0" y="65" fontSize="8.8" fontWeight="700" textAnchor="middle" fill={textPrimary}>
          {pick('Convex Crown Centering Profile', 'Profil Kubah Penengahan Mandiri', '自動蛇行防止クラウン形状')}
        </text>
      </g>
    );
  }

  // 3. POLY-V MULTI-RIBBED BELT (PJ 2.34mm pitch vs PK 3.56mm pitch proportionally scaled!)
  if (beltSpec.code === 'PJ' || beltSpec.code === 'PK') {
    const isPk = beltSpec.code === 'PK';
    const scalePoly = 7.2; // px/mm
    const pitchMm = isPk ? 3.56 : 2.34;
    const ribPitchPx = pitchMm * scalePoly; // PJ=16.8px, PK=25.6px
    const numRibs = 5;
    const totalRibsW = numRibs * ribPitchPx;
    const ribDepthPx = (isPk ? 2.6 : 1.7) * scalePoly;
    const backThickPx = (isPk ? 1.9 : 1.8) * scalePoly;
    const yDrop = pulleyCondition === 'bottomed_out' ? 7 : 0;

    let pulleyPath = `M -150 2 L ${-totalRibsW / 2} 2 `;
    for (let i = 0; i < numRibs; i++) {
      const x0 = -totalRibsW / 2 + i * ribPitchPx;
      pulleyPath += `L ${x0 + ribPitchPx / 2} ${2 + ribDepthPx + 4} L ${x0 + ribPitchPx} 2 `;
    }
    pulleyPath += `L 150 2 L 150 96 L -150 96 Z`;

    let beltPath = `M ${-totalRibsW / 2} ${-backThickPx + yDrop} L ${totalRibsW / 2} ${-backThickPx + yDrop} L ${totalRibsW / 2} ${yDrop} `;
    for (let i = numRibs - 1; i >= 0; i--) {
      const x0 = -totalRibsW / 2 + i * ribPitchPx;
      beltPath += `L ${x0 + ribPitchPx / 2} ${yDrop + ribDepthPx} L ${x0} ${yDrop} `;
    }
    beltPath += `Z`;

    return (
      <g id="polyv-belt-scene">
        <path d={pulleyPath} fill="url(#bbCastIron)" stroke={ringOutline} strokeWidth="1.6" />
        <path d={pulleyPath} fill="url(#bbHatchCastIron)" />
        <path d={beltPath} fill="url(#bbBeltRubber)" stroke={rubberEdge} strokeWidth="1.8" />
        {Array.from({ length: isPk ? 11 : 8 }).map((_, i) => (
          <circle
            key={`pv-c-${i}`}
            cx={-totalRibsW / 2 + 8 + i * ((totalRibsW - 16) / (isPk ? 10 : 7))}
            cy={-backThickPx / 2 + yDrop}
            r={isPk ? 2.6 : 2}
            fill="#eab308"
          />
        ))}
        {/* Rib Pitch Dimension */}
        <line x1={-totalRibsW / 2 + ribPitchPx * 1.5} y1="-34" x2={-totalRibsW / 2 + ribPitchPx * 2.5} y2="-34" stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <rect x="-46" y="-54" width="92" height="15" rx="7.5" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x="0" y="-43.5" fontSize="8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          Rib Pitch = {pitchMm} mm
        </text>
        {/* Total Height Dimension */}
        <line x1={-totalRibsW / 2 - 14} y1={-backThickPx + yDrop} x2={-totalRibsW / 2 - 14} y2={yDrop + ribDepthPx} stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <rect x={-totalRibsW / 2 - 74} y="-12" width="54" height="15" rx="7.5" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x={-totalRibsW / 2 - 47} y="-1.5" fontSize="7.8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          H={beltSpec.heightMm}mm
        </text>

        <text x="0" y="-76" fontSize="9.5" fontWeight="800" textAnchor="middle" fill={dimBlue}>
          {pick(
            `${beltSpec.code} Multi-Ribbed Profile (5 Ribs Shown, 40° Micro-V)`,
            `Profil Multi-Rusuk ${beltSpec.code} (5 Rusuk, Mikro-V 40°)`,
            `${beltSpec.code}形 多リブポリVベルト（40°マイクロV溝）`
          )}
        </text>
        <text x="0" y="72" fontSize="8.8" fontWeight="700" textAnchor="middle" fill={textPrimary}>
          {pick('Machined Multi-V Pulley Grooves', 'Alur Puli Multi-V Presisi', '精密多溝リブドプーリ')}
        </text>
      </g>
    );
  }

  // 4. STANDARD / NARROW WEDGE / COGGED V-BELT IN PROPORTIONALLY SCALED PULLEY GROOVE
  // Uniform physical scale: 6.4 px/mm!
  // SPZ (9.7x8) -> 62.1x51.2px; SPA (12.7x10) -> 81.3x64.0px; SPB (16.3x13) -> 104.3x83.2px
  // A/AX (13x8) -> 83.2x51.2px; B/BX (17x11) -> 108.8x70.4px; C (22x14) -> 140.8x89.6px
  const SCALE = 6.4;
  const isCogged = beltSpec.code === 'AX' || beltSpec.code === 'BX';
  const isBottomed = pulleyCondition === 'bottomed_out';
  const isWorn = pulleyCondition === 'worn_sheave';

  const halfAngleRad = ((beltSpec.wedgeAngleDeg / 2) * Math.PI) / 180;
  const tanHalf = Math.tan(halfAngleRad);

  const beltH = beltSpec.heightMm * SCALE;
  const nominalTopW = beltSpec.topWidthMm * SCALE;
  const nominalBotW = Math.max(12, nominalTopW - 2 * beltH * tanHalf);

  // Fixed machined pulley OD top at rimY = -62, groove extends down to rootY
  const rimY = -62;
  const rootClearancePx = 22;
  const rootY = rimY + (beltH - 3) + rootClearancePx;
  const grooveRimHalfW = nominalTopW / 2 - 3 * tanHalf;
  const grooveRootHalfW = Math.max(5, grooveRimHalfW - (rootY - rimY) * tanHalf);
  const pulleyWebBottomY = rootY + 62;

  // Belt seating Y positions
  const bTopY = isBottomed ? rootY - beltH : isWorn ? rootY - beltH - 11 : rimY - 3;
  const bBotY = bTopY + beltH;

  // When bottomed out, worn belt flanks have shrunk narrower (~16%) leaving visible air gaps along both flanks
  const topW = isBottomed ? nominalTopW * 0.84 : nominalTopW;
  const botW = isBottomed ? Math.max(10, nominalBotW * 0.84) : nominalBotW;

  const pulleyHalfWidth = 114;
  const numCords = Math.max(5, Math.round(topW / 14));

  return (
    <g id="vbelt-sheave-scene">
      {/* Machined Cast-Iron Sheave Cross-Section (Proportionally scaled groove!) */}
      <path
        d={
          isWorn
            ? `M ${-pulleyHalfWidth} ${rimY} L ${-grooveRimHalfW} ${rimY} Q ${-(grooveRimHalfW + grooveRootHalfW) / 2 - 6} ${(rimY + rootY) / 2} ${-grooveRootHalfW} ${rootY} L ${grooveRootHalfW} ${rootY} Q ${(grooveRimHalfW + grooveRootHalfW) / 2 + 6} ${(rimY + rootY) / 2} ${grooveRimHalfW} ${rimY} L ${pulleyHalfWidth} ${rimY} L ${pulleyHalfWidth} ${pulleyWebBottomY} L ${-pulleyHalfWidth} ${pulleyWebBottomY} Z`
            : `M ${-pulleyHalfWidth} ${rimY} L ${-grooveRimHalfW} ${rimY} L ${-grooveRootHalfW} ${rootY} L ${grooveRootHalfW} ${rootY} L ${grooveRimHalfW} ${rimY} L ${pulleyHalfWidth} ${rimY} L ${pulleyHalfWidth} ${pulleyWebBottomY} L ${-pulleyHalfWidth} ${pulleyWebBottomY} Z`
        }
        fill="url(#bbCastIron)"
        stroke={ringOutline}
        strokeWidth="1.8"
      />
      <path
        d={
          isWorn
            ? `M ${-pulleyHalfWidth} ${rimY} L ${-grooveRimHalfW} ${rimY} Q ${-(grooveRimHalfW + grooveRootHalfW) / 2 - 6} ${(rimY + rootY) / 2} ${-grooveRootHalfW} ${rootY} L ${grooveRootHalfW} ${rootY} Q ${(grooveRimHalfW + grooveRootHalfW) / 2 + 6} ${(rimY + rootY) / 2} ${grooveRimHalfW} ${rimY} L ${pulleyHalfWidth} ${rimY} L ${pulleyHalfWidth} ${pulleyWebBottomY} L ${-pulleyHalfWidth} ${pulleyWebBottomY} Z`
            : `M ${-pulleyHalfWidth} ${rimY} L ${-grooveRimHalfW} ${rimY} L ${-grooveRootHalfW} ${rootY} L ${grooveRootHalfW} ${rootY} L ${grooveRimHalfW} ${rimY} L ${pulleyHalfWidth} ${rimY} L ${pulleyHalfWidth} ${pulleyWebBottomY} L ${-pulleyHalfWidth} ${pulleyWebBottomY} Z`
        }
        fill="url(#bbHatchCastIron)"
      />

      {/* Pulley Rim OD Reference Dashed Line */}
      <line x1={-pulleyHalfWidth} y1={rimY} x2={pulleyHalfWidth} y2={rimY} stroke={dimBlue} strokeWidth="0.9" strokeDasharray="5,3" opacity="0.6" />
      <text x={-pulleyHalfWidth + 4} y={rimY - 5} fontSize="7.4" fontWeight="700" fill={dimBlue}>
        Pulley OD
      </text>

      {/* Seated Trapezoidal V-Belt Cross-Section */}
      <path
        d={`M ${-topW / 2} ${bTopY} L ${topW / 2} ${bTopY} L ${botW / 2} ${bBotY} L ${-botW / 2} ${bBotY} Z`}
        fill="url(#bbBeltRubber)"
        stroke={isCogged ? '#f59e0b' : rubberEdge}
        strokeWidth={isCogged ? '2' : '2.2'}
      />

      {/* Woven Fabric Jacket Overlay (for wrapped belts, NOT raw-edge cogged AX/BX) */}
      {!isCogged && (
        <path
          d={`M ${-topW / 2 + 2} ${bTopY + 2} L ${topW / 2 - 2} ${bTopY + 2} L ${botW / 2 - 2} ${bBotY - 2} L ${-botW / 2 + 2} ${bBotY - 2} Z`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="3,2"
          opacity="0.6"
        />
      )}

      {/* Molded Bottom Cog Profile Indicator for AX / BX */}
      {isCogged && (
        <g fill="var(--md-surface-container-low)" stroke="#f59e0b" strokeWidth="1">
          <path d={`M ${-botW / 2 + 4} ${bBotY} Q ${-botW / 2 + 9} ${bBotY - 8} ${-botW / 2 + 14} ${bBotY} Z`} />
          <path d={`M -5 ${bBotY} Q 0 ${bBotY - 8} 5 ${bBotY} Z`} />
          <path d={`M ${botW / 2 - 14} ${bBotY} Q ${botW / 2 - 9} ${bBotY - 8} ${botW / 2 - 4} ${bBotY} Z`} />
        </g>
      )}

      {/* Tension Cord Layer (Aramid / Polyester strands along Pitch Line) */}
      <g id="pitch-cords">
        <line x1={-topW / 2 - 8} y1={bTopY + beltH * 0.28} x2={topW / 2 + 8} y2={bTopY + beltH * 0.28} stroke="#eab308" strokeWidth="1" strokeDasharray="4,2" />
        {Array.from({ length: numCords }).map((_, i) => {
          const cx = -topW / 2 + 8 + i * ((topW - 16) / Math.max(1, numCords - 1));
          return (
            <g key={`cord-${i}`}>
              <circle cx={cx} cy={bTopY + beltH * 0.28} r="2.8" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
              <circle cx={cx} cy={bTopY + beltH * 0.28} r="0.9" fill="#713f12" />
            </g>
          );
        })}
        {/* Pitch Cords Pill cleanly outside right edge */}
        <line x1={topW / 2 + 8} y1={bTopY + beltH * 0.28} x2={122} y2={bTopY + beltH * 0.28} stroke="#eab308" strokeWidth="0.9" />
        <rect x="122" y={bTopY + beltH * 0.28 - 7.5} width="60" height="15" rx="7.5" fill={cardBg} stroke="#eab308" strokeWidth="0.9" />
        <text x="152" y={bTopY + beltH * 0.28 + 3} fontSize="7.6" fontWeight="800" fontFamily="var(--font-sans)" textAnchor="middle" fill="#ca8a04">
          Pitch Cords
        </text>
      </g>

      {/* LIVE PROPORTIONAL DIMENSION ARROWS: TOP WIDTH (W) & HEIGHT (H) */}
      {/* 1. Belt Top Width Dimension cleanly at y = -114 (clear of T arrow!) */}
      <g id="dim-belt-width">
        <line x1={-topW / 2} y1={bTopY - 4} x2={-topW / 2} y2="-118" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
        <line x1={topW / 2} y1={bTopY - 4} x2={topW / 2} y2="-118" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
        <line x1={-topW / 2 + 2} y1="-114" x2={topW / 2 - 2} y2="-114" stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <rect x="-42" y="-134" width="84" height="15" rx="7.5" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x="0" y="-123.5" fontSize="8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          W = {beltSpec.topWidthMm} mm
        </text>
      </g>

      {/* 2. Belt Height Dimension cleanly in left open margin x = -126 */}
      <g id="dim-belt-height">
        <line x1={-topW / 2 - 4} y1={bTopY} x2="-130" y2={bTopY} stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
        <line x1={-botW / 2 - 4} y1={bBotY} x2="-130" y2={bBotY} stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
        <line x1="-126" y1={bTopY + 2} x2="-126" y2={bBotY - 2} stroke={dimBlue} strokeWidth="1.2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
        <rect x="-194" y={(bTopY + bBotY) / 2 - 7.5} width="62" height="15" rx="7.5" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x="-163" y={(bTopY + bBotY) / 2 + 3} fontSize="8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          H = {beltSpec.heightMm} mm
        </text>
      </g>

      {/* SIDEWALL CONTACT HIGHLIGHTS vs BOTTOMING-OUT FAILURE */}
      {!isBottomed ? (
        <g id="proper-wedge-indicators">
          {/* Glowing Emerald Contact Lines on Flanks */}
          <line x1={-topW / 2} y1={bTopY + 4} x2={-botW / 2} y2={bBotY - 1} stroke="#10b981" strokeWidth="3.5" opacity="0.9" />
          <line x1={topW / 2} y1={bTopY + 4} x2={botW / 2} y2={bBotY - 1} stroke="#10b981" strokeWidth="3.5" opacity="0.9" />

          {/* Sidewall Clamping Force Arrows F_N placed cleanly below Height & Pitch Cords */}
          <line x1="-120" y1={rootY + 26} x2={-(botW / 2 + 6)} y2={bBotY - 8} stroke="var(--md-primary)" strokeWidth="2.8" markerEnd="url(#bbArrowSky)" />
          <rect x="-194" y={rootY + 20} width="72" height="16" rx="8" fill={cardBg} stroke="var(--md-primary)" strokeWidth="1" />
          <text x="-158" y={rootY + 31} fontSize="7.8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
            F_N={wedgingPhysics.normalForcePerSideN}N
          </text>

          <line x1="120" y1={rootY + 26} x2={botW / 2 + 6} y2={bBotY - 8} stroke="var(--md-primary)" strokeWidth="2.8" markerEnd="url(#bbArrowSky)" />
          <rect x="122" y={rootY + 20} width="72" height="16" rx="8" fill={cardBg} stroke="var(--md-primary)" strokeWidth="1" />
          <text x="158" y={rootY + 31} fontSize="7.8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
            F_N={wedgingPhysics.normalForcePerSideN}N
          </text>

          {/* Root Clearance Callout cleanly below belt bottom */}
          <line x1="0" y1={bBotY + 2} x2="0" y2={rootY - 2} stroke="#10b981" strokeWidth="2" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
          <rect x="-50" y={rootY + 7} width="100" height="16" rx="8" fill={cardBg} stroke="#10b981" strokeWidth="1" />
          <text x="0" y={rootY + 18} fontSize="8" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill="#10b981">
            {isWorn ? 'Low Clearance: 1.2mm' : 'Root Gap c > 2.5 mm'}
          </text>
        </g>
      ) : (
        <g id="bottomed-out-failure">
          {/* Red Crushing Root Contact Highlight */}
          <rect x={-botW / 2} y={rootY - 5} width={botW} height="7" rx="2" fill="#ef4444" />
          {/* Sidewall Clearance Lost Pill Indicators + Leader Lines into Air Gap */}
          <line x1="-120" y1={rootY + 24} x2={-(botW / 2 + 2)} y2={bBotY - 12} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
          <rect x="-194" y={rootY + 18} width="74" height="16" rx="8" fill={cardBg} stroke="#ef4444" strokeWidth="1.1" />
          <text x="-157" y={rootY + 29} fontSize="7.6" fontWeight="800" fontFamily="var(--font-sans)" textAnchor="middle" fill="#ef4444">
            Flank Grip Lost
          </text>

          <line x1="120" y1={rootY + 24} x2={botW / 2 + 2} y2={bBotY - 12} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
          <rect x="120" y={rootY + 18} width="74" height="16" rx="8" fill={cardBg} stroke="#ef4444" strokeWidth="1.1" />
          <text x="157" y={rootY + 29} fontSize="7.6" fontWeight="800" fontFamily="var(--font-sans)" textAnchor="middle" fill="#ef4444">
            Flank Grip Lost
          </text>

          {/* Radial Tension Dumping Straight into Groove Root */}
          <line x1="0" y1={bTopY - 26} x2="0" y2={bTopY - 2} stroke="#ef4444" strokeWidth="3.5" markerEnd="url(#bbArrowRed)" />
          <rect x="-44" y={bTopY - 46} width="88" height="16" rx="8" fill={cardBg} stroke="#ef4444" strokeWidth="1.2" />
          <text x="0" y={bTopY - 35} fontSize="8.5" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill="#ef4444">
            T = {beltTensionN} N (Slip!)
          </text>

          {/* Zero Clearance Alert Pill below root */}
          <rect x="-64" y={rootY + 7} width="128" height="17" rx="8.5" fill="#fef2f2" stroke="#ef4444" strokeWidth="1.4" />
          <text x="0" y={rootY + 18.5} fontSize="8.2" fontWeight="900" fontFamily="var(--font-mono)" textAnchor="middle" fill="#b91c1c">
            BOTTOMING OUT (c = 0 mm)!
          </text>
        </g>
      )}

      {/* Groove Included Angle 2β Callout at Bottom of Cast Iron Web */}
      <g transform={`translate(0, ${rootY + 46})`}>
        <path d="M -22 -10 A 26 26 0 0 1 22 -10" fill="none" stroke={dimBlue} strokeWidth="1.3" />
        <rect x="-64" y="-3" width="128" height="16" rx="8" fill={cardBg} stroke={dimBlue} strokeWidth="0.8" />
        <text x="0" y="8" fontSize="8.6" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle" fill={dimBlue}>
          {pick(`Sheave Angle 2β = ${beltSpec.wedgeAngleDeg}°`, `Sudut Alur 2β = ${beltSpec.wedgeAngleDeg}°`, `プーリ溝角 2β = ${beltSpec.wedgeAngleDeg}°`)}
        </text>
      </g>
    </g>
  );
}

