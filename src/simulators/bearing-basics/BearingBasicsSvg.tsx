import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { BearingSpec, SealShieldType } from './bearingBasicsData';

interface BearingBasicsSvgProps {
  bearingSpec: BearingSpec;
  sealType: SealShieldType;
  radialLoadKn: number;
  axialLoadKn: number;
  isRotating: boolean;
  rotationAngleDeg: number;
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


export function BearingBasicsSvg({
  bearingSpec,
  sealType,
  radialLoadKn,
  axialLoadKn,
  isRotating,
  rotationAngleDeg,
}: BearingBasicsSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  // Theme-aware CAD colors
  const canvasBg = isDark ? '#0b1120' : '#f8fafc';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardHeaderBg = isDark ? '#1e293b' : '#f1f5f9';
  const cardStroke = isDark ? '#334155' : '#cbd5e1';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const dimBlue = isDark ? '#38bdf8' : '#0284c7';
  const ringOutline = isDark ? '#94a3b8' : '#334155';
  const hatchStroke = isDark ? '#64748b' : '#475569';

  // Fault evaluations
  const isFatalRadialOnThrust = bearingSpec.id === '51105' && radialLoadKn > 0;
  const isAxialOnNuRoller = bearingSpec.id === 'NU205' && axialLoadKn > 0;

  // Shaft rotation stripe phase (-32 to +32 cycle)
  const shaftStripeOffset = ((rotationAngleDeg % 360) / 360) * 24;

  return (
    <svg
      viewBox="0 0 640 460"
      className="w-full max-h-[480px] select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Chrome Bearing Steel (SUJ2 / 52100) Gradients */}
        <linearGradient id="bbSteelSection" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
          <stop offset="45%" stopColor={isDark ? '#334155' : '#cbd5e1'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#94a3b8'} />
        </linearGradient>


        {/* Cylindrical Turned Shaft Gradient */}
        <linearGradient id="bbShaftCyl" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#1e293b' : '#64748b'} />
          <stop offset="22%" stopColor={isDark ? '#64748b' : '#cbd5e1'} />
          <stop offset="38%" stopColor={isDark ? '#cbd5e1' : '#f8fafc'} />
          <stop offset="68%" stopColor={isDark ? '#475569' : '#94a3b8'} />
          <stop offset="100%" stopColor={isDark ? '#0f172a' : '#475569'} />
        </linearGradient>

        {/* 3D Specular Sphere Ball Gradient */}
        <radialGradient id="bbBall3D" cx="34%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="22%" stopColor="#f1f5f9" />
          <stop offset="58%" stopColor={isDark ? '#94a3b8' : '#cbd5e1'} />
          <stop offset="88%" stopColor={isDark ? '#334155' : '#64748b'} />
          <stop offset="100%" stopColor={isDark ? '#0f172a' : '#475569'} />
        </radialGradient>

        {/* Roller 3D Metallic Gradient */}
        <linearGradient id="bbRoller3D" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#334155' : '#64748b'} />
          <stop offset="28%" stopColor="#ffffff" />
          <stop offset="55%" stopColor={isDark ? '#cbd5e1' : '#e2e8f0'} />
          <stop offset="85%" stopColor={isDark ? '#475569' : '#94a3b8'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#475569'} />
        </linearGradient>

        {/* Machined Brass Cage Gradient */}
        <linearGradient id="bbBrassCage" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Cast Iron Housing / Pulley Sheave Gradient */}
        <linearGradient id="bbCastIron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
          <stop offset="50%" stopColor={isDark ? '#334155' : '#94a3b8'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#64748b'} />
        </linearGradient>


        {/* ISO 128 45° Section Hatching Patterns */}
        <pattern id="bbHatch45" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke={hatchStroke} strokeWidth="1" opacity="0.55" />
        </pattern>
        <pattern id="bbHatchNeg45" width="7" height="7" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke={hatchStroke} strokeWidth="1" opacity="0.5" />
        </pattern>
        <pattern id="bbHatchCastIron" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="5" stroke={isDark ? '#94a3b8' : '#334155'} strokeWidth="0.9" opacity="0.4" />
        </pattern>

        {/* Crisp Arrow Markers */}
        <marker id="bbArrowSky" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7" />
        </marker>
        <marker id="bbArrowRed" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
        <marker id="bbArrowAmber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f59e0b" />
        </marker>
        <marker id="bbArrowEmerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
        </marker>
        <marker id="bbDimTick" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 1 2 L 8 5 L 1 8 z" fill={dimBlue} />
        </marker>
      </defs>


      {/* Clean Blueprint Background */}
      <rect width="640" height="460" fill={canvasBg} />
      <g stroke={gridColor} strokeWidth="0.75" opacity={isDark ? 0.45 : 0.75}>
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`vg-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="460" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`hg-${i}`} x1="0" y1={i * 40} x2="640" y2={i * 40} />
        ))}
      </g>


        <g id="bearing-cad-scene">
          {/* Top Header Area (y: 0..48) */}
          <g transform="translate(18, 22)">
            <text x="0" y="0" fontSize="13.5" fontWeight="800" fill={textPrimary}>
              {pick(bearingSpec.name, bearingSpec.nameId, bearingSpec.nameJa)}
            </text>
            <text x="0" y="16" fontSize="9.5" fontWeight="600" fill={textMuted}>
              {`ISO ${bearingSpec.isoCode}  •  α = ${bearingSpec.contactAngleDeg}°  •  d = ${bearingSpec.boreMm} mm  •  D = ${bearingSpec.outerDiameterMm} mm  •  B = ${bearingSpec.widthMm} mm`}
            </text>
          </g>

          {/* Top-Right Status / Fault Alert Pill */}
          {isFatalRadialOnThrust ? (
            <g transform="translate(382, 8)">
              <rect width="242" height="36" rx="7" fill={isDark ? '#450a0a' : '#fef2f2'} stroke="#ef4444" strokeWidth="1.5" />
              <text x="12" y="15" fontSize="9.5" fontWeight="800" fill={isDark ? '#fca5a5' : '#b91c1c'}>
                {pick('FATAL: RADIAL LOAD ON 51105', 'FATAL: BEBAN RADIAL PADA 51105', '致命的警告：51105にラジアル負荷')}
              </text>
              <text x="12" y="28" fontSize="8.2" fill={isDark ? '#f87171' : '#dc2626'}>
                {pick('Thrust balls derail under radial force!', 'Bola dorong keluar jalur akibat gaya radial!', '接触角90°のため玉が脱線破損します！')}
              </text>
            </g>
          ) : isAxialOnNuRoller ? (
            <g transform="translate(382, 8)">
              <rect width="242" height="36" rx="7" fill={isDark ? '#451a03' : '#fffbeb'} stroke="#f59e0b" strokeWidth="1.5" />
              <text x="12" y="15" fontSize="9.5" fontWeight="800" fill={isDark ? '#fcd34d' : '#b45309'}>
                {pick('AXIAL FLOAT ALERT: NU205', 'PERINGATAN GERAK AKSIAL: NU205', 'アキシアル自由端警告：NU205')}
              </text>
              <text x="12" y="28" fontSize="8.2" fill={isDark ? '#fbbf24' : '#d97706'}>
                {pick('Ribless inner ring cannot locate axial thrust!', 'Cincin dalam tanpa bibir bebas geser aksial!', 'つば無し内輪はスラスト荷重を拘束できません！')}
              </text>
            </g>
          ) : (
            <g transform="translate(432, 10)">
              <rect width="192" height="30" rx="7" fill={isDark ? '#064e3b' : '#ecfdf5'} stroke="#10b981" strokeWidth="1.2" />
              <circle cx="15" cy="15" r="4" fill="#10b981" />
              <text x="26" y="18.5" fontSize="9.2" fontWeight="700" fill={isDark ? '#6ee7b7' : '#047857'}>
                {pick('LOAD VECTOR WITHIN SPEC', 'ARAH BEBAN SESUAI SPESIFIKASI', '負荷方向・構造適合')}
              </text>
            </g>
          )}

          {/* CAD Viewport Frame */}
          <rect
            x="16"
            y="52"
            width="404"
            height="394"
            rx="12"
            fill={isDark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.65)'}
            stroke={cardStroke}
            strokeWidth="1.2"
          />

          {/* Main Bearing CAD Coordinate Origin: (cx=220, cy=262) */}
          <g transform="translate(220, 262)">
            {/* Centerline Shaft Axis */}
            <line x1="-185" y1="0" x2="180" y2="0" stroke={dimBlue} strokeWidth="1" strokeDasharray="14,4,3,4" opacity="0.85" />
            <text x="186" y="3" fontSize="8" fontWeight="700" fill={dimBlue} textAnchor="end">
              CL
            </text>

            {/* Machined Drive Shaft (Ø25mm -> half-height 32px) */}
            <path
              d="M -140 -42 L -36 -42 L -36 -32 L 138 -32 L 138 32 L -36 32 L -36 42 L -140 42 Z"
              fill="url(#bbShaftCyl)"
              stroke={ringOutline}
              strokeWidth="1.4"
            />
            {/* Shaft Section Break Waves on left & right ends */}
            <path d="M -140 -42 Q -146 -21 -140 0 Q -134 21 -140 42" fill="none" stroke={ringOutline} strokeWidth="1.2" />
            <path d="M 138 -32 Q 144 -16 138 0 Q 132 16 138 32" fill="none" stroke={ringOutline} strokeWidth="1.2" />

            {/* Rotating Keyway / Motion Band inside shaft so rotation is clearly visible */}
            <clipPath id="bbShaftClip">
              <rect x="-36" y="-31" width="174" height="62" />
            </clipPath>
            <g clipPath="url(#bbShaftClip)" opacity={isRotating ? 0.35 : 0.15}>
              {[-48, -24, 0, 24, 48].map((baseY) => {
                const yPos = ((baseY + shaftStripeOffset + 48) % 96) - 48;
                return (
                  <rect
                    key={`stripe-${baseY}`}
                    x="-36"
                    y={yPos}
                    width="174"
                    height="5"
                    fill={isDark ? '#38bdf8' : '#0284c7'}
                  />
                );
              })}
            </g>

            {/* Shaft Label placed cleanly above centerline (clear of Fa arrow & pill below) */}
            <text x="-94" y="-22" fontSize="8.5" fontWeight="800" fill="#0f172a" textAnchor="middle">
              {pick('Shaft Ø25', 'Poros Ø25', '軸 Ø25')}
            </text>
            <text x="92" y="-12" fontSize="7.5" fontWeight="700" fill="#0f172a" textAnchor="middle">
              {isRotating ? `${Math.round(rotationAngleDeg)}° ↻` : '0 RPM'}
            </text>

            {/* PILLOW BLOCK CAST IRON HOUSING (UCP205 only) */}
            {bearingSpec.id === 'UCP205' && (
              <g id="ucp205-housing">
                {/* Cast Iron Outer Profile */}
                <path
                  d="M -52 -118 Q 0 -130 52 -118 L 58 -98 L 58 96 L 105 96 L 105 116 L -105 116 L -105 96 L -58 96 L -58 -98 Z"
                  fill="url(#bbCastIron)"
                  stroke={ringOutline}
                  strokeWidth="1.8"
                />
                <path
                  d="M -52 -118 Q 0 -130 52 -118 L 58 -98 L 58 96 L 105 96 L 105 116 L -105 116 L -105 96 L -58 96 L -58 -98 Z"
                  fill="url(#bbHatchCastIron)"
                />
                {/* Machined Spherical Housing Socket clearing the UC205 insert */}
                <path
                  d="M -36 -104 Q 0 -114 36 -104 L 36 98 Q 0 108 -36 98 Z"
                  fill={canvasBg}
                  stroke={ringOutline}
                  strokeWidth="1.2"
                />
                {/* Base Mounting Hex Bolts & Washers */}
                {[-82, 82].map((bx) => (
                  <g key={`bolt-${bx}`} transform={`translate(${bx}, 96)`}>
                    <rect x="-5" y="-4" width="10" height="26" fill="url(#bbRoller3D)" stroke={ringOutline} strokeWidth="1" />
                    <rect x="-9" y="-4" width="18" height="3.5" fill="#94a3b8" stroke={ringOutline} strokeWidth="0.9" />
                    <rect x="-8" y="-12" width="16" height="8" rx="1" fill="url(#bbSteelSection)" stroke={ringOutline} strokeWidth="1" />
                    <line x1="-3" y1="-12" x2="-3" y2="-4" stroke={ringOutline} strokeWidth="0.8" />
                    <line x1="3" y1="-12" x2="3" y2="-4" stroke={ringOutline} strokeWidth="0.8" />
                  </g>
                ))}
                {/* Hydraulic Brass Grease Zerk Nipple on Top */}
                <g transform="translate(0, -124)">
                  <rect x="-4" y="-7" width="8" height="8" fill="url(#bbBrassCage)" stroke="#78350f" strokeWidth="1" />
                  <polygon points="-5,-7 5,-7 3,-12 -3,-12" fill="url(#bbBrassCage)" stroke="#78350f" strokeWidth="1" />
                  <circle cx="0" cy="-13" r="2.2" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />
                  <text x="12" y="-7" fontSize="7.8" fontWeight="700" fill={isDark ? '#fbbf24' : '#b45309'}>
                    Grease Zerk
                  </text>
                </g>
                {/* UC205 Extended Inner Ring & Locking Set Screw on right */}
                <g transform="translate(46, 0)">
                  <rect x="-10" y="-42" width="22" height="10" fill="url(#bbSteelSection)" stroke={ringOutline} strokeWidth="1.2" />
                  <rect x="-10" y="32" width="22" height="10" fill="url(#bbSteelSection)" stroke={ringOutline} strokeWidth="1.2" />
                  <rect x="0" y="-49" width="7" height="15" fill="#334155" stroke={ringOutline} strokeWidth="1" />
                  <text x="12" y="-43" fontSize="7.5" fontWeight="700" fill={textMuted}>
                    Set Screw
                  </text>
                </g>
              </g>
            )}

            {/* TOP & BOTTOM SYMMETRICAL BEARING CUTAWAY HALVES */}
            <BearingCutawayHalf
              bearingSpec={bearingSpec}
              sealType={sealType}
              isDark={isDark}
              isTop={true}
              ringOutline={ringOutline}
            />
            <BearingCutawayHalf
              bearingSpec={bearingSpec}
              sealType={sealType}
              isDark={isDark}
              isTop={false}
              ringOutline={ringOutline}
            />

            {/* LIVE FORCE ARROWS (Radial Fr & Axial Fa) */}
            {/* Radial Load Fr Vector (Top, guaranteed inside CAD viewport) */}
            {radialLoadKn > 0 && (
              <g transform={`translate(0, ${bearingSpec.id === 'UCP205' ? -142 : -114})`}>
                <line
                  x1="0"
                  y1={-Math.min(38, 18 + radialLoadKn * 0.9)}
                  x2="0"
                  y2="-4"
                  stroke={isFatalRadialOnThrust ? '#ef4444' : '#0284c7'}
                  strokeWidth="3.5"
                  markerEnd={isFatalRadialOnThrust ? 'url(#bbArrowRed)' : 'url(#bbArrowSky)'}
                />
                <rect
                  x="-38"
                  y={-Math.min(38, 18 + radialLoadKn * 0.9) - 18}
                  width="76"
                  height="16"
                  rx="4"
                  fill={cardBg}
                  stroke={isFatalRadialOnThrust ? '#ef4444' : '#0284c7'}
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y={-Math.min(38, 18 + radialLoadKn * 0.9) - 7}
                  fontSize="8.8"
                  fontWeight="800"
                  textAnchor="middle"
                  fill={isFatalRadialOnThrust ? '#ef4444' : dimBlue}
                >
                  Fr = {radialLoadKn.toFixed(1)} kN
                </text>
              </g>
            )}

            {/* Axial Thrust Fa Vector (Left pushing against shaft shoulder, pill cleanly below arrow) */}
            {axialLoadKn > 0 && (
              <g transform="translate(-52, 0)">
                <line
                  x1={-Math.min(76, 30 + axialLoadKn * 2.1)}
                  y1="0"
                  x2="-6"
                  y2="0"
                  stroke={isAxialOnNuRoller ? '#f59e0b' : '#10b981'}
                  strokeWidth="3.5"
                  markerEnd={isAxialOnNuRoller ? 'url(#bbArrowAmber)' : 'url(#bbArrowEmerald)'}
                />
                <rect
                  x={-Math.min(76, 30 + axialLoadKn * 2.1) - 18}
                  y="10"
                  width="72"
                  height="16"
                  rx="4"
                  fill={cardBg}
                  stroke={isAxialOnNuRoller ? '#f59e0b' : '#10b981'}
                  strokeWidth="1.2"
                />
                <text
                  x={-Math.min(76, 30 + axialLoadKn * 2.1) + 18}
                  y="21"
                  fontSize="8.8"
                  fontWeight="800"
                  textAnchor="middle"
                  fill={isAxialOnNuRoller ? '#f59e0b' : '#10b981'}
                >
                  Fa = {axialLoadKn.toFixed(1)} kN
                </text>
              </g>
            )}

            {/* CLEAN CAD DIMENSION LINES (No Overlaps!) */}
            {/* 1. Width B Dimension (Bottom) */}
            <g transform={`translate(0, ${bearingSpec.id === 'UCP205' ? 132 : 126})`}>
              <line x1="-34" y1="-16" x2="-34" y2="6" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
              <line x1="34" y1="-16" x2="34" y2="6" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
              <line x1="-32" y1="0" x2="32" y2="0" stroke={dimBlue} strokeWidth="1.1" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
              <rect x="-32" y="5" width="64" height="14" rx="3" fill={canvasBg} />
              <text x="0" y="15" fontSize="8.5" fontWeight="700" textAnchor="middle" fill={dimBlue}>
                B = {bearingSpec.widthMm} mm
              </text>
            </g>

            {/* 2. Outer Diameter D Dimension (Right side x = +92) */}
            <g transform="translate(92, 0)">
              <line x1="-56" y1="-108" x2="8" y2="-108" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
              <line x1="-56" y1="108" x2="8" y2="108" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
              <line x1="0" y1="-105" x2="0" y2="105" stroke={dimBlue} strokeWidth="1.1" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
              <rect x="6" y="-9" width="76" height="18" rx="3" fill={canvasBg} stroke={dimBlue} strokeWidth="0.7" opacity="0.9" />
              <text x="44" y="3" fontSize="8.5" fontWeight="700" textAnchor="middle" fill={dimBlue}>
                D = {bearingSpec.outerDiameterMm} mm
              </text>
            </g>

            {/* 3. Bore Diameter d Dimension (Right inner side x = +54) */}
            <g transform="translate(54, 0)">
              <line x1="-18" y1="-32" x2="6" y2="-32" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
              <line x1="-18" y1="32" x2="6" y2="32" stroke={dimBlue} strokeWidth="0.8" opacity="0.7" />
              <line x1="0" y1="-30" x2="0" y2="30" stroke={dimBlue} strokeWidth="1.1" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
              <rect x="4" y="-26" width="32" height="13" rx="2" fill={canvasBg} />
              <text x="20" y="-17" fontSize="8" fontWeight="700" textAnchor="middle" fill={dimBlue}>
                d={bearingSpec.boreMm}
              </text>
            </g>
          </g>

          {/* RIGHT TECHNICAL SPEC CARD (x: 432..624, y: 52..446) */}
          <g transform="translate(432, 52)">
            <rect width="192" height="394" rx="10" fill={cardBg} stroke={cardStroke} strokeWidth="1.2" />
            <path d="M 0 10 Q 0 0 10 0 L 182 0 Q 192 0 192 10 L 192 30 L 0 30 Z" fill={cardHeaderBg} />
            <line x1="0" y1="30" x2="192" y2="30" stroke={cardStroke} strokeWidth="1" />
            <text x="12" y="19" fontSize="10" fontWeight="800" fill={textPrimary}>
              {pick('Internal Architecture', 'Arsitektur Internal', '内部構造諸元')}
            </text>

            <g transform="translate(12, 48)">
              {/* 1. Rolling Element */}
              <text x="0" y="0" fontSize="8.2" fontWeight="600" fill={textMuted}>
                {pick('Rolling Element', 'Tipe Elemen', '転動体形式')}
              </text>
              <text x="0" y="13" fontSize="9.2" fontWeight="700" fill={textPrimary}>
                {formatElementLabel(bearingSpec.rollingElement, pick)}
              </text>

              {/* 2. Contact Angle */}
              <text x="0" y="34" fontSize="8.2" fontWeight="600" fill={textMuted}>
                {pick('Contact Angle (α)', 'Sudut Kontak (α)', '接触角 (α)')}
              </text>
              <text x="0" y="47" fontSize="9.5" fontWeight="800" fill={dimBlue}>
                α = {bearingSpec.contactAngleDeg}°
              </text>

              {/* 3. Radial Capacity */}
              <text x="0" y="68" fontSize="8.2" fontWeight="600" fill={textMuted}>
                {pick('Radial Rating (Cr)', 'Kapasitas Radial (Cr)', 'ラジアル定格 (Cr)')}
              </text>
              <text x="0" y="81" fontSize="9.2" fontWeight="700" fill={bearingSpec.radialCapacity === 'Zero' ? '#ef4444' : '#10b981'}>
                {bearingSpec.radialCapacity} ({bearingSpec.dynamicLoadCrKn} kN)
              </text>

              {/* 4. Axial Capacity */}
              <text x="0" y="102" fontSize="8.2" fontWeight="600" fill={textMuted}>
                {pick('Axial Thrust Capability', 'Kapasitas Aksial', 'アキシアル耐力')}
              </text>
              <text x="0" y="115" fontSize="9" fontWeight="700" fill={dimBlue}>
                {bearingSpec.axialCapacity}
              </text>

              {/* 5. Misalignment */}
              <text x="0" y="136" fontSize="8.2" fontWeight="600" fill={textMuted}>
                {pick('Misalignment Limit', 'Batas Ketidaksejajaran', '許容傾き角')}
              </text>
              {wrapSvgText(
                pick(
                  bearingSpec.misalignmentTolerance,
                  bearingSpec.misalignmentToleranceId,
                  bearingSpec.misalignmentToleranceJa
                ),
                27
              ).map((line, i) => (
                <text key={`mis-${i}`} x="0" y={149 + i * 11} fontSize="8.6" fontWeight="700" fill={textPrimary}>
                  {line}
                </text>
              ))}

              {/* 6. Speed Limits */}
              <text x="0" y="178" fontSize="8.2" fontWeight="600" fill={textMuted}>
                {pick('Max Speed (Grease / Oil)', 'Kecepatan Maks (Gemuk / Oli)', '許容回転速度（グリース/油）')}
              </text>
              <text x="0" y="191" fontSize="9.2" fontWeight="700" fill={textPrimary}>
                {bearingSpec.limitingSpeedGreaseRpm.toLocaleString()} / {bearingSpec.limitingSpeedOilRpm.toLocaleString()} RPM
              </text>

              {/* 7. Seal Configuration */}
              <text x="0" y="212" fontSize="8.2" fontWeight="600" fill={textMuted}>
                {pick('Seal / Shield Enclosure', 'Pelindung / Seal', 'シール・シールド形式')}
              </text>
              <text x="0" y="225" fontSize="9.2" fontWeight="800" fill={sealType === '2rs' ? '#10b981' : textPrimary}>
                {sealType === 'open'
                  ? pick('OPEN (No Shield/Seal)', 'TERBUKA (Tanpa Seal)', '開放形（シール無し）')
                  : sealType === '2z'
                    ? pick('2Z (Pressed Steel Shield)', '2Z (Plat Baja Non-Kontak)', '2Z（両側鋼板シールド）')
                    : pick('2RS (NBR Rubber Contact)', '2RS (Seal Karet Kontak)', '2RS（両側ゴム接触シール）')}
              </text>

              {/* Engineering Summary Card (Wrapped safely inside box!) */}
              <rect x="0" y="242" width="168" height="92" rx="7" fill={cardHeaderBg} stroke={cardStroke} strokeWidth="1" />
              <text x="9" y="257" fontSize="8" fontWeight="800" fill={dimBlue}>
                {pick('TYPICAL USE & CAUTION', 'APLIKASI & PERHATIAN', '主な用途と注意点')}
              </text>
              <text x="9" y="271" fontSize="7.8" fontWeight="600" fill={textPrimary}>
                {wrapSvgText(bearingSpec.typicalApplications[0], 25).slice(0, 2).map((line, idx) => (
                  <tspan key={`app-${idx}`} x="9" dy={idx === 0 ? 0 : 10}>
                    • {line}
                  </tspan>
                ))}
              </text>
              <text x="9" y="299" fontSize="7.6" fill={isDark ? '#fca5a5' : '#b91c1c'}>
                {wrapSvgText(bearingSpec.cautions[0], 26).slice(0, 3).map((line, idx) => (
                  <tspan key={`caut-${idx}`} x="9" dy={idx === 0 ? 0 : 10}>
                    {idx === 0 ? '⚠ ' : '  '}
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
// HELPER: SYMMETRICAL 2D PRECISION BEARING CUTAWAY HALF
// =====================================================================
function BearingCutawayHalf({
  bearingSpec,
  sealType,
  isDark,
  isTop,
  ringOutline,
}: {
  bearingSpec: BearingSpec;
  sealType: SealShieldType;
  isDark: boolean;
  isTop: boolean;
  ringOutline: string;
}) {
  const s = isTop ? -1 : 1;
  const rInnerBore = 32; // touches shaft at y = ±32
  const rOuterOD = 108; // outer diameter y = ±108
  const halfW = 34; // total bearing width B = 68px

  const innerRaceY = s * 50;
  const pitchY = s * 70;

  // 1. Thrust Ball Bearing (51105): Axial Stack (Shaft Washer Left, Housing Washer Right)
  if (bearingSpec.id === '51105') {
    const ballX = 0;
    const ballY = s * 68;
    return (
      <g id={`thrust-half-${isTop ? 't' : 'b'}`}>
        {/* Shaft Washer (Left, tight fit on shaft at y = ±32) */}
        <path
          d={`M -28 ${s * 32} L -9 ${s * 32} L -9 ${s * 54} Q -18 ${s * 68} -9 ${s * 82} L -9 ${s * 100} L -28 ${s * 100} Z`}
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <path
          d={`M -28 ${s * 32} L -9 ${s * 32} L -9 ${s * 54} Q -18 ${s * 68} -9 ${s * 82} L -9 ${s * 100} L -28 ${s * 100} Z`}
          fill="url(#bbHatch45)"
        />
        {/* Housing Washer (Right, loose clearance gap above shaft y = ±37!) */}
        <path
          d={`M 9 ${s * 38} L 28 ${s * 38} L 28 ${s * 100} L 9 ${s * 100} L 9 ${s * 82} Q 18 ${s * 68} 9 ${s * 54} Z`}
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <path
          d={`M 9 ${s * 38} L 28 ${s * 38} L 28 ${s * 100} L 9 ${s * 100} L 9 ${s * 82} Q 18 ${s * 68} 9 ${s * 54} Z`}
          fill="url(#bbHatchNeg45)"
        />
        {/* Thrust Brass Cage */}
        <rect x="-6" y={ballY - 14} width="12" height="28" rx="2" fill="url(#bbBrassCage)" stroke="#78350f" strokeWidth="1" />
        {/* 3D Ball */}
        <circle cx={ballX} cy={ballY} r="12" fill="url(#bbBall3D)" stroke={ringOutline} strokeWidth="1.1" />
        {/* 90° Pure Axial Line of Action */}
        <line x1="-20" y1={ballY} x2="20" y2={ballY} stroke="#10b981" strokeWidth="1.4" strokeDasharray="3,2" />
      </g>
    );
  }

  // 2. Cylindrical Roller Bearing (NU205): Ribless Inner Ring + Two-Rib Outer Ring
  if (bearingSpec.id === 'NU205') {
    return (
      <g id={`nu-half-${isTop ? 't' : 'b'}`}>
        {/* Inner Ring (Ribless flat cylindrical raceway at y = ±50) */}
        <rect
          x={-halfW}
          y={isTop ? -50 : 32}
          width={halfW * 2}
          height="18"
          rx="2"
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <rect x={-halfW} y={isTop ? -50 : 32} width={halfW * 2} height="18" fill="url(#bbHatch45)" />
        {/* Polished raceway surface line */}
        <line x1={-halfW} y1={innerRaceY} x2={halfW} y2={innerRaceY} stroke="#38bdf8" strokeWidth="1.8" />

        {/* Outer Ring with Two Integral Guide Ribs */}
        <path
          d={`M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 76} L 18 ${s * 76} L 18 ${s * 88} L -18 ${s * 88} L -18 ${s * 76} L ${-halfW} ${s * 76} Z`}
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <path
          d={`M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 76} L 18 ${s * 76} L 18 ${s * 88} L -18 ${s * 88} L -18 ${s * 76} L ${-halfW} ${s * 76} Z`}
          fill="url(#bbHatchNeg45)"
        />

        {/* Brass Window Cage */}
        <rect x="-21" y={isTop ? -75 : 63} width="42" height="12" rx="1.5" fill="url(#bbBrassCage)" stroke="#78350f" strokeWidth="1" />

        {/* Cylindrical Roller (3D metallic shading, crowned corners) */}
        <rect
          x="-16"
          y={isTop ? -88 : 50}
          width="32"
          height="38"
          rx="3"
          fill="url(#bbRoller3D)"
          stroke={ringOutline}
          strokeWidth="1.2"
        />
        {/* Float Indicator Arrows on top half */}
        {isTop && (
          <g transform="translate(0, -56)">
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#38bdf8" strokeWidth="1.4" markerStart="url(#bbDimTick)" markerEnd="url(#bbDimTick)" />
          </g>
        )}
      </g>
    );
  }

  // 3. Tapered Roller Bearing (30205): Cup + Cone + Conical Roller + Apex Projection
  if (bearingSpec.id === '30205') {
    return (
      <g id={`trb-half-${isTop ? 't' : 'b'}`}>
        {/* Inner Cone with High Back Thrust Rib (Right) & Small Retaining Rib (Left) */}
        <path
          d={`M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 65} L 20 ${s * 65} L 20 ${s * 54} L -18 ${s * 45} L -18 ${s * 50} L ${-halfW} ${s * 50} Z`}
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <path
          d={`M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 65} L 20 ${s * 65} L 20 ${s * 54} L -18 ${s * 45} L -18 ${s * 50} L ${-halfW} ${s * 50} Z`}
          fill="url(#bbHatch45)"
        />
        {/* Outer Cup */}
        <path
          d={`M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 94} L -22 ${s * 80} L ${-halfW} ${s * 80} Z`}
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <path
          d={`M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 94} L -22 ${s * 80} L ${-halfW} ${s * 80} Z`}
          fill="url(#bbHatchNeg45)"
        />
        {/* Conical Tapered Roller */}
        <polygon
          points={`-17,${s * 46} 19,${s * 55} 19,${s * 92} -17,${s * 79}`}
          fill="url(#bbRoller3D)"
          stroke={ringOutline}
          strokeWidth="1.3"
        />
        {/* Stamped Steel Cone Cage */}
        <line x1="-22" y1={s * 62} x2="23" y2={s * 74} stroke="url(#bbBrassCage)" strokeWidth="3.5" strokeLinecap="round" />
        {/* Dashed Apex Convergence Line */}
        <line x1="-88" y1={s * 28} x2="22" y2={s * 56} stroke="#0284c7" strokeWidth="0.9" strokeDasharray="3,3" opacity="0.7" />
      </g>
    );
  }

  // 4. Spherical Roller Bearing (22205): Spherical Outer Raceway + Twin Barrel Rollers
  if (bearingSpec.id === '22205') {
    return (
      <g id={`srb-half-${isTop ? 't' : 'b'}`}>
        {/* Inner Ring with Central Guide Flange */}
        <path
          d={`M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 56} L 28 ${s * 56} L 28 ${s * 50} L 4 ${s * 48} L 4 ${s * 62} L -4 ${s * 62} L -4 ${s * 48} L -28 ${s * 50} L -28 ${s * 56} L ${-halfW} ${s * 56} Z`}
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <path
          d={`M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 56} L 28 ${s * 56} L 28 ${s * 50} L 4 ${s * 48} L 4 ${s * 62} L -4 ${s * 62} L -4 ${s * 48} L -28 ${s * 50} L -28 ${s * 56} L ${-halfW} ${s * 56} Z`}
          fill="url(#bbHatch45)"
        />
        {/* Outer Ring with Continuous Concave Spherical Raceway */}
        <path
          d={`M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 84} Q 0 ${s * 96} ${-halfW} ${s * 84} Z`}
          fill="url(#bbSteelSection)"
          stroke={ringOutline}
          strokeWidth="1.4"
        />
        <path
          d={`M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 84} Q 0 ${s * 96} ${-halfW} ${s * 84} Z`}
          fill="url(#bbHatchNeg45)"
        />
        {/* Left & Right Symmetrical Barrel Rollers */}
        <ellipse
          cx="-14"
          cy={s * 69}
          rx="11"
          ry="17"
          fill="url(#bbRoller3D)"
          stroke={ringOutline}
          strokeWidth="1.2"
          transform={`rotate(${s * 12}, -14, ${s * 69})`}
        />
        <ellipse
          cx="14"
          cy={s * 69}
          rx="11"
          ry="17"
          fill="url(#bbRoller3D)"
          stroke={ringOutline}
          strokeWidth="1.2"
          transform={`rotate(${-s * 12}, 14, ${s * 69})`}
        />
        {/* Brass Twin Comb Cage */}
        <circle cx="0" cy={s * 69} r="3.5" fill="url(#bbBrassCage)" stroke="#78350f" strokeWidth="1" />
      </g>
    );
  }

  // 5. Angular Contact Ball Bearing (7205) & Deep Groove Ball (6205) & UC205 Insert
  const isAcbb = bearingSpec.id === '7205';
  const isUcp = bearingSpec.id === 'UCP205';

  return (
    <g id={`ball-half-${isTop ? 't' : 'b'}`}>
      {/* Inner Ring Cutaway */}
      <path
        d={
          isAcbb
            ? `M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 58} L 14 ${s * 58} Q 0 ${s * 50} -18 ${s * 48} L ${-halfW} ${s * 48} Z`
            : `M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 56} L 18 ${s * 56} Q 0 ${s * 46} -18 ${s * 56} L ${-halfW} ${s * 56} Z`
        }
        fill="url(#bbSteelSection)"
        stroke={ringOutline}
        strokeWidth="1.4"
      />
      <path
        d={
          isAcbb
            ? `M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 58} L 14 ${s * 58} Q 0 ${s * 50} -18 ${s * 48} L ${-halfW} ${s * 48} Z`
            : `M ${-halfW} ${s * rInnerBore} L ${halfW} ${s * rInnerBore} L ${halfW} ${s * 56} L 18 ${s * 56} Q 0 ${s * 46} -18 ${s * 56} L ${-halfW} ${s * 56} Z`
        }
        fill="url(#bbHatch45)"
      />

      {/* Outer Ring Cutaway (Convex Spherical OD for UCP205 insert, Cylindrical for 6205/7205) */}
      <path
        d={
          isUcp
            ? `M ${-halfW} ${s * 102} Q 0 ${s * 112} ${halfW} ${s * 102} L ${halfW} ${s * 84} L 18 ${s * 84} Q 0 ${s * 94} -18 ${s * 84} L ${-halfW} ${s * 84} Z`
            : isAcbb
              ? `M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 92} L 18 ${s * 92} Q 0 ${s * 90} -14 ${s * 82} L ${-halfW} ${s * 82} Z`
              : `M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 84} L 18 ${s * 84} Q 0 ${s * 94} -18 ${s * 84} L ${-halfW} ${s * 84} Z`
        }
        fill="url(#bbSteelSection)"
        stroke={ringOutline}
        strokeWidth="1.4"
      />
      <path
        d={
          isUcp
            ? `M ${-halfW} ${s * 102} Q 0 ${s * 112} ${halfW} ${s * 102} L ${halfW} ${s * 84} L 18 ${s * 84} Q 0 ${s * 94} -18 ${s * 84} L ${-halfW} ${s * 84} Z`
            : isAcbb
              ? `M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 92} L 18 ${s * 92} Q 0 ${s * 90} -14 ${s * 82} L ${-halfW} ${s * 82} Z`
              : `M ${-halfW} ${s * rOuterOD} L ${halfW} ${s * rOuterOD} L ${halfW} ${s * 84} L 18 ${s * 84} Q 0 ${s * 94} -18 ${s * 84} L ${-halfW} ${s * 84} Z`
        }
        fill="url(#bbHatchNeg45)"
      />

      {/* Precision Stamped/Machined Cage Silhouette */}
      <path
        d={`M -20 ${pitchY} C -20 ${pitchY - s * 19}, 20 ${pitchY - s * 19}, 20 ${pitchY}`}
        fill="none"
        stroke="url(#bbBrassCage)"
        strokeWidth="3.5"
      />
      <circle cx="-20" cy={pitchY} r="2.2" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
      <circle cx="20" cy={pitchY} r="2.2" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

      {/* 3D Specular Bearing Ball */}
      <circle cx="0" cy={pitchY} r="17" fill="url(#bbBall3D)" stroke={ringOutline} strokeWidth="1.2" />

      {/* ACBB 40° Contact Angle Action Line */}
      {isAcbb && (
        <g>
          <line
            x1="-18"
            y1={pitchY + s * 16}
            x2="18"
            y2={pitchY - s * 16}
            stroke="#0284c7"
            strokeWidth="1.8"
            strokeDasharray="4,2"
          />
          {isTop && (
            <text x="19" y={pitchY - 12} fontSize="8" fontWeight="800" fill="#0284c7">
              40°
            </text>
          )}
        </g>
      )}

      {/* SEALS & SHIELDS (2Z Stamped Steel vs 2RS NBR Elastomer Lip Seal) */}
      {sealType === '2z' && !isUcp && (
        <g id={`shield-2z-${isTop ? 't' : 'b'}`}>
          {[-29, 29].map((sx, idx) => {
            const dir = idx === 0 ? 1 : -1;
            return (
              <path
                key={`2z-${sx}`}
                d={`M ${sx} ${s * 90} L ${sx} ${s * 60} L ${sx - dir * 3} ${s * 57}`}
                fill="none"
                stroke={isDark ? '#cbd5e1' : '#64748b'}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {(sealType === '2rs' || isUcp) && (
        <g id={`seal-2rs-${isTop ? 't' : 'b'}`}>
          {[-29, 29].map((sx, idx) => {
            const dir = idx === 0 ? 1 : -1;
            return (
              <g key={`2rs-${sx}`}>
                {/* Elastomer NBR Seal Body */}
                <path
                  d={`M ${sx - dir * 2} ${s * 91} L ${sx + dir * 2} ${s * 91} L ${sx + dir * 2} ${s * 56} L ${sx - dir * 3} ${s * 53} L ${sx - dir * 2} ${s * 59} Z`}
                  fill="#059669"
                  stroke="#064e3b"
                  strokeWidth="0.9"
                />
                {/* Embedded Steel Insert Core inside rubber seal */}
                <line x1={sx} y1={s * 88} x2={sx} y2={s * 62} stroke="#cbd5e1" strokeWidth="1.4" />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}

function formatElementLabel(
  elem: BearingSpec['rollingElement'],
  pick: <T>(en: T, id: T, ja: T) => T
): string {
  switch (elem) {
    case 'deep_groove_ball':
      return pick('Spherical Ball (Point)', 'Bola Bulat (Titik)', '玉（点接触）');
    case 'angular_ball':
      return pick('40° Angular Ball', 'Bola Kontak Sudut 40°', '40° アンギュラ玉');
    case 'cylindrical_roller':
      return pick('Cylindrical Roller (Line)', 'Rol Silinder (Garis)', '円筒ころ（線接触）');
    case 'tapered_roller':
      return pick('Conical Tapered Roller', 'Rol Kerucut Tirus', '円すいころ');
    case 'spherical_roller':
      return pick('Barrel Spherical Roller', 'Rol Tong Sferikal', 'たる形自動調心ころ');
    case 'thrust_ball':
      return pick('90° Axial Thrust Ball', 'Bola Dorong Aksial 90°', '90° スラスト玉');
    case 'pillow_block_ball':
      return pick('UC205 Spherical Insert', 'Insert Sferikal UC205', 'UC205 球面外径インサート');
  }
}
