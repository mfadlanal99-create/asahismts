import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type {
  ChainDriveInputs,
  ChainDriveMetrics,
} from './chainConveyorMath';

interface RollerChainLabSvgProps {
  inputs: ChainDriveInputs;
  metrics: ChainDriveMetrics;
  travelPitches: number; // Continuous monotonically increasing chain travel in pitch units
}

interface ChainPose {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mx: number;
  my: number;
  angleDeg: number;
}

/**
 * Generates a true pitch-proportional ANSI B29.1 sprocket profile with:
 * - Concave U-shaped circular roller seating pockets (SVG arc with sweep-flag = 0)
 * - Smooth cubic Bezier working & coast tooth flanks
 * - Rounded/crowned circular arc tooth tips (SVG arc with sweep-flag = 1)
 * - Progressive hook wear on the driving flank when worn
 *
 * Tooth pocket #0 is centered at angle `rotationRad`.
 */
function buildAnsiSprocketPath(
  cx: number,
  cy: number,
  pitchRadius: number,
  teeth: number,
  rotationRad: number,
  rollerR: number,
  hookWearFactor: number // 0..1
): { path: string; rRoot: number } {
  const cmds: string[] = [];
  const pitchAngle = (Math.PI * 2) / teeth;

  const rRoot = pitchRadius - rollerR * 0.98;
  const rPocketEdge = pitchRadius - rollerR * 0.16;
  const rFlankCtrl = pitchRadius + rollerR * 0.42;
  const rTip = pitchRadius + rollerR * 0.85;
  const tipCrownRadius = Math.max(1.1, rollerR * 0.72);

  for (let i = 0; i < teeth; i++) {
    const a0 = i * pitchAngle + rotationRad;
    const hookShift = hookWearFactor * pitchAngle * 0.14;

    const aPocketStart = a0 - pitchAngle * 0.23;
    const aPocketExit = a0 + pitchAngle * 0.23;

    const aDriveCtrl1 = a0 + pitchAngle * 0.29 - hookShift * 0.45;
    const aDriveCtrl2 = a0 + pitchAngle * 0.36 - hookShift * 0.85;
    const aTipLead = a0 + pitchAngle * 0.42 + hookShift * 0.5;
    const aTipTrail = a0 + pitchAngle * 0.58 + hookShift * 0.2;

    const aCoastCtrl1 = a0 + pitchAngle * 0.64;
    const aCoastCtrl2 = a0 + pitchAngle * 0.71;
    const aNextPocketStart = a0 + pitchAngle * 0.77;

    const pPocketStartX = cx + rPocketEdge * Math.cos(aPocketStart);
    const pPocketStartY = cy + rPocketEdge * Math.sin(aPocketStart);

    const pPocketExitX = cx + rPocketEdge * Math.cos(aPocketExit);
    const pPocketExitY = cy + rPocketEdge * Math.sin(aPocketExit);

    const cDrive1X = cx + (rPocketEdge + rollerR * 0.3) * Math.cos(aDriveCtrl1);
    const cDrive1Y = cy + (rPocketEdge + rollerR * 0.3) * Math.sin(aDriveCtrl1);

    const cDrive2X = cx + rFlankCtrl * Math.cos(aDriveCtrl2);
    const cDrive2Y = cy + rFlankCtrl * Math.sin(aDriveCtrl2);

    const effectiveTipR = rTip * (1 - hookWearFactor * 0.02);
    const pTipLeadX = cx + effectiveTipR * Math.cos(aTipLead);
    const pTipLeadY = cy + effectiveTipR * Math.sin(aTipLead);

    const pTipTrailX = cx + rTip * Math.cos(aTipTrail);
    const pTipTrailY = cy + rTip * Math.sin(aTipTrail);

    const cCoast1X = cx + rFlankCtrl * Math.cos(aCoastCtrl1);
    const cCoast1Y = cy + rFlankCtrl * Math.sin(aCoastCtrl1);

    const cCoast2X = cx + (rPocketEdge + rollerR * 0.3) * Math.cos(aCoastCtrl2);
    const cCoast2Y = cy + (rPocketEdge + rollerR * 0.3) * Math.sin(aCoastCtrl2);

    const pNextPocketStartX = cx + rPocketEdge * Math.cos(aNextPocketStart);
    const pNextPocketStartY = cy + rPocketEdge * Math.sin(aNextPocketStart);

    if (i === 0) {
      cmds.push(`M ${pPocketStartX.toFixed(2)} ${pPocketStartY.toFixed(2)}`);
    }

    cmds.push(
      `A ${(rollerR * 1.04).toFixed(2)} ${(rollerR * 1.04).toFixed(2)} 0 0 0 ${pPocketExitX.toFixed(2)} ${pPocketExitY.toFixed(2)}`,
      `C ${cDrive1X.toFixed(2)} ${cDrive1Y.toFixed(2)}, ${cDrive2X.toFixed(2)} ${cDrive2Y.toFixed(2)}, ${pTipLeadX.toFixed(2)} ${pTipLeadY.toFixed(2)}`,
      `A ${tipCrownRadius.toFixed(2)} ${tipCrownRadius.toFixed(2)} 0 0 1 ${pTipTrailX.toFixed(2)} ${pTipTrailY.toFixed(2)}`,
      `C ${cCoast1X.toFixed(2)} ${cCoast1Y.toFixed(2)}, ${cCoast2X.toFixed(2)} ${cCoast2Y.toFixed(2)}, ${pNextPocketStartX.toFixed(2)} ${pNextPocketStartY.toFixed(2)}`
    );
  }
  cmds.push('Z');
  return { path: cmds.join(' '), rRoot };
}

/**
 * Renders a realistic figure-8 articulated roller chain link between two adjacent pin centers.
 */
function Figure8ChainLink({
  pose,
  isOuter,
  plateFill,
  plateStroke,
  plateScale,
}: {
  pose: ChainPose;
  isOuter: boolean;
  plateFill: string;
  plateStroke: string;
  plateScale: number;
}) {
  const dx = pose.x2 - pose.x1;
  const dy = pose.y2 - pose.y1;
  const linkLen = Math.hypot(dx, dy);
  const halfL = linkLen / 2;
  const rEnd = (isOuter ? 4.6 : 4.0) * plateScale;
  const waist = (isOuter ? 2.8 : 2.5) * plateScale;

  const d = [
    `M ${(-halfL).toFixed(1)} ${(-rEnd).toFixed(1)}`,
    `A ${rEnd.toFixed(2)} ${rEnd.toFixed(2)} 0 1 0 ${(-halfL).toFixed(1)} ${rEnd.toFixed(1)}`,
    `Q 0 ${waist.toFixed(1)} ${halfL.toFixed(1)} ${rEnd.toFixed(1)}`,
    `A ${rEnd.toFixed(2)} ${rEnd.toFixed(2)} 0 1 0 ${halfL.toFixed(1)} ${(-rEnd).toFixed(1)}`,
    `Q 0 ${(-waist).toFixed(1)} ${(-halfL).toFixed(1)} ${(-rEnd).toFixed(1)}`,
    'Z',
  ].join(' ');

  return (
    <g
      transform={`translate(${pose.mx.toFixed(2)}, ${pose.my.toFixed(2)}) rotate(${pose.angleDeg.toFixed(2)})`}
    >
      <path
        d={d}
        fill={plateFill}
        stroke={plateStroke}
        strokeWidth={isOuter ? '1.2' : '0.95'}
      />
    </g>
  );
}

export function RollerChainLabSvg({
  inputs,
  metrics,
  travelPitches,
}: RollerChainLabSvgProps) {
  const { pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware CAD engineering palette
  const bgFill = isDark ? '#0f172a' : '#f8fafc';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const panelFill = isDark ? '#1e293b' : '#ffffff';
  const panelStroke = isDark ? '#334155' : '#cbd5e1';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#475569';
  const dimLine = isDark ? '#64748b' : '#94a3b8';

  // Visual size scaling from RS 40 (12.7 mm) up to RS 160 (50.8 mm)
  const sizeScale = Math.pow(metrics.spec.pitchMm / 19.05, 0.55);
  const rawLinkPitchPx = 11.4 * sizeScale;
  const maxLinkPitchForViewBox = (92 * 2 * Math.PI) / inputs.z2;
  const minLinkPitchForViewBox = (28 * 2 * Math.PI) / inputs.z1;
  const linkPitchPx = Math.max(
    minLinkPitchForViewBox,
    Math.min(rawLinkPitchPx, maxLinkPitchForViewBox)
  );

  // CRITICAL: Both sprockets share the EXACT same circular pitch `linkPitchPx`
  // so every chain roller meshes inside both z1 and z2 tooth pockets simultaneously!
  const r1 = (inputs.z1 * linkPitchPx) / (2 * Math.PI);
  const r2 = (inputs.z2 * linkPitchPx) / (2 * Math.PI);
  const rollerR = Math.max(2.3, Math.min(6.8, linkPitchPx * 0.305));
  const plateScale = Math.max(0.74, Math.min(1.48, linkPitchPx / 11.4));

  const cy = 162;
  const sagPx = Math.max(5, Math.min(52, inputs.slackSagPct * 10.2));

  // Solve centerDistPx around 330 px so total closed-loop length is an EXACT even integer multiple of linkPitchPx
  const computeLoopGeometry = (distPx: number) => {
    const sinA = Math.max(-0.9, Math.min(0.9, (r2 - r1) / distPx));
    const aRad = Math.asin(sinA);
    const cosA = Math.cos(aRad);
    const tx1 = -r1 * sinA;
    const ty1 = -r1 * cosA;
    const tx2 = distPx - r2 * sinA;
    const ty2 = -r2 * cosA;
    const uLen = Math.hypot(tx2 - tx1, ty2 - ty1);

    const rStart = -Math.PI / 2 - aRad;
    const rSweep = Math.PI + 2 * aRad;
    const rArc = r2 * rSweep;

    const lChord = uLen; // symmetric tangent chord
    const lLen = lChord + (8 * sagPx * sagPx) / (3 * lChord);

    const lStart = Math.PI / 2 + aRad;
    const lSweep = Math.PI - 2 * aRad;
    const lArc = r1 * lSweep;

    return {
      distPx,
      sinA,
      aRad,
      cosA,
      uLen,
      rStart,
      rSweep,
      rArc,
      lLen,
      lStart,
      lSweep,
      lArc,
      totalLen: uLen + rArc + lLen + lArc,
    };
  };

  let geo = computeLoopGeometry(330);
  const totalChainPitchLinks = Math.max(
    24,
    Math.round(geo.totalLen / linkPitchPx / 2) * 2
  );
  const targetLoopLen = totalChainPitchLinks * linkPitchPx;
  for (let iter = 0; iter < 4; iter++) {
    const err = targetLoopLen - geo.totalLen;
    if (Math.abs(err) < 0.001) break;
    geo = computeLoopGeometry(geo.distPx + err * 0.5);
  }

  const cx1 = 390 - geo.distPx / 2;
  const cx2 = 390 + geo.distPx / 2;

  const topX1 = cx1 - r1 * geo.sinA;
  const topY1 = cy - r1 * geo.cosA;
  const topX2 = cx2 - r2 * geo.sinA;
  const topY2 = cy - r2 * geo.cosA;

  const botX1 = cx1 - r1 * geo.sinA;
  const botY1 = cy + r1 * geo.cosA;
  const botX2 = cx2 - r2 * geo.sinA;
  const botY2 = cy + r2 * geo.cosA;

  const midSpanX = (botX1 + botX2) / 2;
  const straightMidY = (botY1 + botY2) / 2;
  const sagPeakY = straightMidY + sagPx;
  const ctrlY = straightMidY + sagPx * 2;

  const totalLoopLen = geo.totalLen;
  const deltaS = travelPitches * linkPitchPx;

  // Exact phase-locked sprocket rotation angles (radians) so tooth pockets align with rollers
  const sLeftStart = geo.uLen + geo.rArc + geo.lLen;
  const rotRad1 = geo.lStart + (deltaS - sLeftStart) / r1;
  const rotRad2 = geo.rStart + (deltaS - geo.uLen) / r2;
  const driverAngleDeg = (rotRad1 * 180) / Math.PI;
  const drivenAngleDeg = (rotRad2 * 180) / Math.PI;

  const hookFactor = metrics.hookWearSeverityPct / 100;

  const sprocket1Geo = buildAnsiSprocketPath(
    cx1,
    cy,
    r1,
    inputs.z1,
    rotRad1,
    rollerR,
    hookFactor
  );
  const sprocket2Geo = buildAnsiSprocketPath(
    cx2,
    cy,
    r2,
    inputs.z2,
    rotRad2,
    rollerR,
    hookFactor * 0.85
  );

  function samplePointAtDistance(sRaw: number): { x: number; y: number } {
    const s = ((sRaw % totalLoopLen) + totalLoopLen) % totalLoopLen;
    if (s < geo.uLen) {
      const t = s / geo.uLen;
      return {
        x: topX1 + (topX2 - topX1) * t,
        y: topY1 + (topY2 - topY1) * t,
      };
    }
    const s1 = s - geo.uLen;
    if (s1 < geo.rArc) {
      const t = s1 / geo.rArc;
      const ang = geo.rStart + t * geo.rSweep;
      return {
        x: cx2 + r2 * Math.cos(ang),
        y: cy + r2 * Math.sin(ang),
      };
    }
    const s2 = s1 - geo.rArc;
    if (s2 < geo.lLen) {
      const t = 1 - s2 / geo.lLen;
      const oneMinusT = 1 - t;
      return {
        x:
          oneMinusT * oneMinusT * botX1 +
          2 * oneMinusT * t * midSpanX +
          t * t * botX2,
        y:
          oneMinusT * oneMinusT * botY1 +
          2 * oneMinusT * t * ctrlY +
          t * t * botY2,
      };
    }
    const s3 = s2 - geo.lLen;
    const t = Math.min(1, s3 / geo.lArc);
    const ang = geo.lStart + t * geo.lSweep;
    return {
      x: cx1 + r1 * Math.cos(ang),
      y: cy + r1 * Math.sin(ang),
    };
  }

  const pinNodes: { x: number; y: number }[] = [];
  for (let i = 0; i < totalChainPitchLinks; i++) {
    pinNodes.push(samplePointAtDistance(i * linkPitchPx + deltaS));
  }

  const linkPoses: ChainPose[] = pinNodes.map((p1, idx) => {
    const p2 = pinNodes[(idx + 1) % totalChainPitchLinks];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const angleDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, mx, my, angleDeg };
  });

  // Chain link metallic palette based on wear & lubrication state
  const outerPlateFill =
    metrics.wearStatus === 'replace-now'
      ? isDark
        ? '#be123c'
        : '#e11d48'
      : inputs.lubeMethod === 'Dry'
        ? '#d97706'
        : isDark
          ? '#475569'
          : '#64748b';
  const outerPlateStroke =
    metrics.wearStatus === 'replace-now'
      ? '#fda4af'
      : inputs.lubeMethod === 'Dry'
        ? '#fcd34d'
        : isDark
          ? '#cbd5e1'
          : '#1e293b';
  const innerPlateFill = isDark ? '#334155' : '#94a3b8';
  const innerPlateStroke = isDark ? '#94a3b8' : '#334155';

  // Drip drop animation phase
  const dripPhase = (travelPitches * 0.22) % 1;

  // 10-Pitch Vernier Gauge bar coordinates
  const gaugeStartX = 64;
  const gaugeNominalEndX = 410;
  const gaugeMaxScalePct = 4.0;
  const pxPerPct = 62;
  const gaugeMeasuredEndX =
    gaugeNominalEndX +
    Math.min(gaugeMaxScalePct, inputs.wearElongationPct) * pxPerPct;
  const gauge15PctX = gaugeNominalEndX + 1.5 * pxPerPct;
  const gauge30PctX = gaugeNominalEndX + 3.0 * pxPerPct;
  const readoutPillCenterX = Math.max(
    240,
    Math.min(555, gaugeMeasuredEndX)
  );
  const gaugePlateScale = Math.max(0.85, Math.min(1.22, sizeScale * 0.92));

  return (
    <div className="space-y-4">
      {/* Main 2D CAD Sprocket & Articulated Roller Chain Drive Card */}
      <div className="overflow-hidden glass-panel rounded-2xl shadow-xs">
        {/* Card Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {pick(
                'ANSI B29.1 Roller Chain & Sprocket Drive Schematic',
                'Skema Penggerak Rantai Rol & Sproket ANSI B29.1',
                'ANSI B29.1 ローラチェーン＆スプロケット伝動機構図'
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              {metrics.spec.rsLabel} ({inputs.chainCode} / {metrics.spec.isoCode}) · p ={' '}
              {metrics.spec.pitchMm} mm
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-0.5 font-semibold ${
                metrics.sagStatus === 'optimal'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
              }`}
            >
              {pick('Sag:', 'Kelendutan:', 'たるみ:')} S ={' '}
              {metrics.slackSagMm.toFixed(1)} mm ({inputs.slackSagPct.toFixed(1)}
              % C)
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-semibold ${
                metrics.lubeAdequate && inputs.lubeMethod !== 'Dry'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
              }`}
            >
              {inputs.lubeMethod === 'Dry'
                ? pick('Lube: DRY (Starved)', 'Pelumasan: KERING', '潤滑: 無給油（危険）')
                : inputs.lubeMethod === 'Manual Drip'
                  ? pick('Lube: Manual Drip', 'Pelumasan: Tetes Manual', '潤滑: 滴下給油')
                  : pick('Lube: Oil Bath Sump', 'Pelumasan: Rendaman Oli', '潤滑: 油浴（オイルバス）')}
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 780 360"
          className="h-auto w-full select-none"
          role="img"
          aria-label="2D Machined Sprocket and Articulated Roller Chain Drive Canvas"
        >
          <defs>
            <pattern
              id="chainCadGrid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke={gridStroke}
                strokeWidth="0.7"
              />
            </pattern>

            <radialGradient id="sprocketSteelGrad" cx="45%" cy="40%" r="60%">
              <stop
                offset="0%"
                stopColor={isDark ? '#64748b' : '#f1f5f9'}
              />
              <stop
                offset="65%"
                stopColor={isDark ? '#334155' : '#cbd5e1'}
              />
              <stop
                offset="100%"
                stopColor={isDark ? '#1e293b' : '#94a3b8'}
              />
            </radialGradient>

            <radialGradient id="hubBossGrad" cx="40%" cy="35%" r="65%">
              <stop
                offset="0%"
                stopColor={isDark ? '#475569' : '#e2e8f0'}
              />
              <stop
                offset="100%"
                stopColor={isDark ? '#0f172a' : '#64748b'}
              />
            </radialGradient>

            <linearGradient id="oilSumpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Theme-aware Blueprint Background */}
          <rect width="780" height="360" fill={bgFill} />
          <rect
            width="780"
            height="360"
            fill="url(#chainCadGrid)"
            opacity="0.65"
          />

          {/* Type C Oil Bath Sump Casing if Oil Bath is selected */}
          {inputs.lubeMethod === 'Oil Bath' && (
            <g>
              <path
                d="M 145 232 L 652 232 L 636 346 L 160 346 Z"
                fill={isDark ? 'rgba(30,41,59,0.55)' : 'rgba(241,245,249,0.85)'}
                stroke={panelStroke}
                strokeWidth="1.8"
              />
              <path
                d="M 150 250 L 647 250 L 634 343 L 162 343 Z"
                fill="url(#oilSumpGrad)"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="5 3"
              />
              <rect
                x="616"
                y="260"
                width="12"
                height="40"
                rx="3"
                fill={bgFill}
                stroke="#64748b"
                strokeWidth="1.2"
              />
              <rect
                x="618"
                y="272"
                width="8"
                height="26"
                rx="1.5"
                fill="#f59e0b"
              />
              <rect
                x="215"
                y="324"
                width="360"
                height="18"
                rx="4"
                fill={panelFill}
                stroke="#f59e0b"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x="395"
                y="336.5"
                textAnchor="middle"
                fill={isDark ? '#fde68a' : '#92400e'}
                fontSize="9.5"
                fontWeight="700"
              >
                {pick(
                  'TYPE C OIL BATH SUMP — Lower chain immersed (v > 2.2 m/s)',
                  'BAK RENDAMAN OLI TIPE C — Rantai bawah terendam (v > 2,2 m/s)',
                  'C種オイルバス油浴槽 — 下部チェーン浸漬潤滑 (v > 2.2 m/s)'
                )}
              </text>
            </g>
          )}

          {/* Type B Manual Drip Oiler */}
          {inputs.lubeMethod === 'Manual Drip' && (
            <g transform="translate(275, 10)">
              <rect
                x="0"
                y="0"
                width="96"
                height="24"
                rx="5"
                fill={panelFill}
                stroke="#0284c7"
                strokeWidth="1.3"
              />
              <rect
                x="6"
                y="5"
                width="20"
                height="14"
                rx="2"
                fill="#f59e0b"
                opacity="0.85"
              />
              <text
                x="60"
                y="15.5"
                textAnchor="middle"
                fill={isDark ? '#7dd3fc' : '#0369a1'}
                fontSize="9"
                fontWeight="700"
              >
                {pick('DRIP OILER', 'TETES OLI', '滴下オイラ')}
              </text>
              <line
                x1="16"
                y1="24"
                x2="16"
                y2="42"
                stroke="#b45309"
                strokeWidth="2.5"
              />
              <circle
                cx="16"
                cy={48 + ((dripPhase * 34) % 24)}
                r="3"
                fill="#f59e0b"
              />
              <circle
                cx="16"
                cy={48 + (((dripPhase + 0.5) * 34) % 24)}
                r="2.4"
                fill="#fbbf24"
              />
            </g>
          )}

          {/* Shaft Centerline Datum & Center Distance Pill */}
          <line
            x1={cx1}
            y1={cy}
            x2={cx2}
            y2={cy}
            stroke={dimLine}
            strokeWidth="1.1"
            strokeDasharray="6 4"
          />
          <rect
            x={(cx1 + cx2) / 2 - 96}
            y={cy - 22}
            width="192"
            height="18"
            rx="4"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="0.9"
            opacity="0.92"
          />
          <text
            x={(cx1 + cx2) / 2}
            y={cy - 9.5}
            textAnchor="middle"
            fill={textMuted}
            fontSize="10"
            fontWeight="600"
          >
            {pick('Center Distance', 'Jarak Pusat', '軸間距離')} C ={' '}
            {inputs.centerDistanceMm} mm
          </text>

          {/* Straight Lower Tangent Reference Datum (for measuring sag S) */}
          <line
            x1={botX1}
            y1={botY1}
            x2={botX2}
            y2={botY2}
            stroke={dimLine}
            strokeWidth="1.1"
            strokeDasharray="4 4"
          />

          {/* ==================== DRIVER SPROCKET (LEFT) ==================== */}
          <g>
            <path
              d={sprocket1Geo.path}
              fill="url(#sprocketSteelGrad)"
              stroke={
                hookFactor > 0.5
                  ? '#f59e0b'
                  : isDark
                    ? '#cbd5e1'
                    : '#334155'
              }
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle
              cx={cx1}
              cy={cy}
              r={r1}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="0.9"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <circle
              cx={cx1}
              cy={cy}
              r={Math.max(15, sprocket1Geo.rRoot - 4)}
              fill={isDark ? '#1e293b' : '#e2e8f0'}
              stroke={isDark ? '#475569' : '#94a3b8'}
              strokeWidth="1.2"
            />
            <g transform={`rotate(${driverAngleDeg.toFixed(2)} ${cx1} ${cy})`}>
              {[0, 60, 120, 180, 240, 300].map((ang) => {
                const rad = (ang * Math.PI) / 180;
                const holeR = r1 * 0.5;
                const hx = cx1 + holeR * Math.cos(rad);
                const hy = cy + holeR * Math.sin(rad);
                return (
                  <circle
                    key={ang}
                    cx={hx}
                    cy={hy}
                    r={Math.max(2.6, r1 * 0.095)}
                    fill={bgFill}
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    strokeWidth="1"
                  />
                );
              })}
              <circle
                cx={cx1}
                cy={cy}
                r={Math.max(10, r1 * 0.32)}
                fill="url(#hubBossGrad)"
                stroke={isDark ? '#94a3b8' : '#475569'}
                strokeWidth="1.3"
              />
              <circle
                cx={cx1}
                cy={cy}
                r={Math.max(6, Math.min(10, r1 * 0.19))}
                fill={isDark ? '#0f172a' : '#475569'}
                stroke="#38bdf8"
                strokeWidth="1.4"
              />
              <rect
                x={cx1 - 2.2}
                y={cy - Math.max(8, Math.min(13, r1 * 0.25))}
                width="4.4"
                height="4"
                fill="#38bdf8"
              />
            </g>
          </g>

          {/* ==================== DRIVEN SPROCKET (RIGHT) ==================== */}
          <g>
            <path
              d={sprocket2Geo.path}
              fill="url(#sprocketSteelGrad)"
              stroke={
                hookFactor > 0.5
                  ? '#f59e0b'
                  : isDark
                    ? '#cbd5e1'
                    : '#334155'
              }
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle
              cx={cx2}
              cy={cy}
              r={r2}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.9"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            <circle
              cx={cx2}
              cy={cy}
              r={Math.max(20, sprocket2Geo.rRoot - 4.5)}
              fill={isDark ? '#1e293b' : '#e2e8f0'}
              stroke={isDark ? '#475569' : '#94a3b8'}
              strokeWidth="1.2"
            />
            <g transform={`rotate(${drivenAngleDeg.toFixed(2)} ${cx2} ${cy})`}>
              {[0, 60, 120, 180, 240, 300].map((ang) => {
                const rad = (ang * Math.PI) / 180;
                const holeR = r2 * 0.52;
                const hx = cx2 + holeR * Math.cos(rad);
                const hy = cy + holeR * Math.sin(rad);
                return (
                  <circle
                    key={ang}
                    cx={hx}
                    cy={hy}
                    r={Math.max(3.8, r2 * 0.105)}
                    fill={bgFill}
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    strokeWidth="1.1"
                  />
                );
              })}
              <circle
                cx={cx2}
                cy={cy}
                r={Math.max(12, r2 * 0.29)}
                fill="url(#hubBossGrad)"
                stroke={isDark ? '#94a3b8' : '#475569'}
                strokeWidth="1.4"
              />
              <circle
                cx={cx2}
                cy={cy}
                r={Math.max(7.5, Math.min(12, r2 * 0.16))}
                fill={isDark ? '#0f172a' : '#475569'}
                stroke="#f59e0b"
                strokeWidth="1.4"
              />
              <rect
                x={cx2 - 2.6}
                y={cy - Math.max(10, Math.min(15, r2 * 0.21))}
                width="5.2"
                height="4.5"
                fill="#f59e0b"
              />
            </g>
          </g>

          {/* ==================== ARTICULATED ROLLER CHAIN (SYNCHRONIZED) ==================== */}
          {linkPoses.map((pose, idx) =>
            idx % 2 === 0 ? (
              <Figure8ChainLink
                key={`inner-${idx}`}
                pose={pose}
                isOuter={false}
                plateFill={innerPlateFill}
                plateStroke={innerPlateStroke}
                plateScale={plateScale}
              />
            ) : null
          )}

          {pinNodes.map((pt, idx) => (
            <circle
              key={`roller-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r={rollerR}
              fill={isDark ? '#e2e8f0' : '#f8fafc'}
              stroke={isDark ? '#0f172a' : '#334155'}
              strokeWidth="1.1"
            />
          ))}

          {linkPoses.map((pose, idx) =>
            idx % 2 === 1 ? (
              <Figure8ChainLink
                key={`outer-${idx}`}
                pose={pose}
                isOuter={true}
                plateFill={outerPlateFill}
                plateStroke={outerPlateStroke}
                plateScale={plateScale}
              />
            ) : null
          )}

          {pinNodes.map((pt, idx) => (
            <circle
              key={`pin-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r={Math.max(1.2, rollerR * 0.44)}
              fill={
                inputs.lubeMethod === 'Dry'
                  ? '#f97316'
                  : isDark
                    ? '#94a3b8'
                    : '#475569'
              }
              stroke={isDark ? '#0f172a' : '#1e293b'}
              strokeWidth="0.65"
            />
          ))}

          {/* Tight Span Velocity Pill */}
          <g transform="translate(385, 12)">
            <rect
              width="210"
              height="22"
              rx="5"
              fill={panelFill}
              stroke={panelStroke}
              strokeWidth="1.1"
              opacity="0.95"
            />
            <text
              x="105"
              y="14.5"
              textAnchor="middle"
              fill={textPrimary}
              fontSize="10"
              fontWeight="700"
            >
              {pick('TIGHT SPAN', 'SISI TEGANG', '張り側スパン')} → (v ={' '}
              {metrics.linearSpeedMs.toFixed(2)} m/s)
            </text>
          </g>

          {/* Slack Span Catenary Sag Dimension Arrow & Callout Pill */}
          <g>
            <line
              x1={midSpanX}
              y1={straightMidY}
              x2={midSpanX}
              y2={sagPeakY}
              stroke="#f59e0b"
              strokeWidth="2.2"
            />
            <circle cx={midSpanX} cy={straightMidY} r="3" fill={dimLine} />
            <circle cx={midSpanX} cy={sagPeakY} r="3.8" fill="#f59e0b" />
            <rect
              x={midSpanX - 94}
              y={Math.min(296, sagPeakY + 8)}
              width="188"
              height="22"
              rx="6"
              fill={panelFill}
              stroke="#f59e0b"
              strokeWidth="1.3"
              opacity="0.96"
            />
            <text
              x={midSpanX}
              y={Math.min(296, sagPeakY + 8) + 14.5}
              textAnchor="middle"
              fill={isDark ? '#fde68a' : '#b45309'}
              fontSize="10"
              fontWeight="700"
            >
              S = {metrics.slackSagMm.toFixed(1)} mm ({inputs.slackSagPct.toFixed(1)}
              % C)
            </text>
          </g>

          {/* Driver Sprocket Callout Card — Docked on Left Margin */}
          <g>
            <line
              x1="150"
              y1="268"
              x2={cx1 - r1 * 0.5}
              y2={cy + r1 * 0.7}
              stroke="#0ea5e9"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            <rect
              x="12"
              y="246"
              width="138"
              height="42"
              rx="6"
              fill={panelFill}
              stroke={panelStroke}
              strokeWidth="1.2"
            />
            <text
              x="81"
              y="263"
              textAnchor="middle"
              fill={isDark ? '#38bdf8' : '#0284c7'}
              fontSize="10"
              fontWeight="700"
            >
              {pick('Driver', 'Penggerak', '駆動')} z₁ = {inputs.z1}T
            </text>
            <text
              x="81"
              y="278"
              textAnchor="middle"
              fill={textMuted}
              fontSize="9"
            >
              D₁={metrics.pitchDia1Mm.toFixed(0)}mm · {inputs.driverRpm}RPM
            </text>
          </g>

          {/* Driven Sprocket Callout Card — Docked on Right Margin */}
          <g>
            <line
              x1="630"
              y1="268"
              x2={cx2 + r2 * 0.5}
              y2={cy + r2 * 0.7}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            <rect
              x="630"
              y="246"
              width="138"
              height="42"
              rx="6"
              fill={panelFill}
              stroke={panelStroke}
              strokeWidth="1.2"
            />
            <text
              x="699"
              y="263"
              textAnchor="middle"
              fill={isDark ? '#fbbf24' : '#b45309'}
              fontSize="10"
              fontWeight="700"
            >
              {pick('Driven', 'Digerakkan', '従動')} z₂ = {inputs.z2}T
            </text>
            <text
              x="699"
              y="278"
              textAnchor="middle"
              fill={textMuted}
              fontSize="9"
            >
              D₂={metrics.pitchDia2Mm.toFixed(0)}mm ·{' '}
              {metrics.drivenRpm.toFixed(0)}RPM
            </text>
          </g>

          {/* Magnified Sprocket Tooth Hook-Wear Inspection Inset (Top-Left) */}
          <g transform="translate(12, 12)">
            <rect
              width="142"
              height="74"
              rx="8"
              fill={panelFill}
              stroke={
                metrics.hookWearSeverityPct >= 55
                  ? '#f43f5e'
                  : metrics.hookWearSeverityPct >= 25
                    ? '#f59e0b'
                    : panelStroke
              }
              strokeWidth="1.4"
            />
            <text
              x="8"
              y="15"
              fill={textPrimary}
              fontSize="9"
              fontWeight="700"
            >
              {pick(
                'TOOTH HOOK WEAR',
                'KEAUSAN GIGI KAIT',
                'スプロケット歯摩耗'
              )}
            </text>
            <path
              d="M 10 62 A 8 8 0 0 0 20 52 C 22 40, 24 27, 28 24 A 5 5 0 0 1 36 24 C 40 27, 42 40, 44 52 A 8 8 0 0 0 54 62"
              fill="none"
              stroke={dimLine}
              strokeWidth="1.2"
              strokeDasharray="2.5 2.5"
            />
            <path
              d={`M 10 62 A 8 8 0 0 0 20 52 C ${22 + hookFactor * 10} ${40 - hookFactor * 3}, ${24 + hookFactor * 8} 27, ${28 + hookFactor * 5} 24 A 5 5 0 0 1 36 24 C 40 27, 42 40, 44 52 A 8 8 0 0 0 54 62 Z`}
              fill={
                metrics.hookWearSeverityPct >= 55
                  ? 'rgba(244,63,94,0.22)'
                  : metrics.hookWearSeverityPct >= 25
                    ? 'rgba(245,158,11,0.22)'
                    : 'rgba(16,185,129,0.18)'
              }
              stroke={
                metrics.hookWearSeverityPct >= 55
                  ? '#f43f5e'
                  : metrics.hookWearSeverityPct >= 25
                    ? '#f59e0b'
                    : '#10b981'
              }
              strokeWidth="1.8"
            />
            <circle
              cx={15 + hookFactor * 6}
              cy={50 - hookFactor * 12}
              r="5"
              fill={isDark ? '#e2e8f0' : '#ffffff'}
              stroke={
                metrics.hookWearSeverityPct >= 55 ? '#e11d48' : '#0284c7'
              }
              strokeWidth="1.5"
            />
            <text
              x="58"
              y="41"
              fill={
                metrics.hookWearSeverityPct >= 55
                  ? isDark
                    ? '#fda4af'
                    : '#be123c'
                  : metrics.hookWearSeverityPct >= 25
                    ? isDark
                      ? '#fde68a'
                      : '#b45309'
                    : isDark
                      ? '#6ee7b7'
                      : '#047857'
              }
              fontSize="13.5"
              fontWeight="800"
            >
              {metrics.hookWearSeverityPct}%
            </text>
            <text x="58" y="55" fill={textMuted} fontSize="8.5">
              {metrics.hookWearSeverityPct >= 55
                ? pick('Hooked! Replace', 'Aus Kait! Ganti', '摩耗大・要交換')
                : metrics.hookWearSeverityPct >= 25
                  ? pick('Moderate wear', 'Keausan sedang', '中程度の摩耗')
                  : pick('Healthy profile', 'Profil sehat', '正常な歯形')}
            </text>
          </g>
        </svg>
      </div>

      {/* 10-Pitch Stainless Vernier Chain Wear Gauge Card */}
      <div className="overflow-hidden glass-panel rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {pick(
                '10-Pitch Vernier Chain Wear Elongation Gauge',
                'Alat Ukur Vernier Perpanjangan Aus Rantai 10-Pitch',
                '10リンク・ノギス式チェーン摩耗伸び測定ゲージ'
              )}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {pick(
                `Nominal 10×p = ${metrics.nominal10PitchMm.toFixed(1)} mm · Case-Hardened Limit (1.5%) = ${metrics.limit15PctMm.toFixed(1)} mm · Standard Max Limit (3.0%) = ${metrics.limit30PctMm.toFixed(1)} mm`,
                `Nominal 10×p = ${metrics.nominal10PitchMm.toFixed(1)} mm · Batas Diperkeras (1,5%) = ${metrics.limit15PctMm.toFixed(1)} mm · Batas Maks Standar (3,0%) = ${metrics.limit30PctMm.toFixed(1)} mm`,
                `基準 10×p = ${metrics.nominal10PitchMm.toFixed(1)} mm · 硬化/大歯数限界 (1.5%) = ${metrics.limit15PctMm.toFixed(1)} mm · 標準交換限界 (3.0%) = ${metrics.limit30PctMm.toFixed(1)} mm`
              )}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold ${
              metrics.wearStatus === 'replace-now'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                : metrics.wearStatus === 'hardened-limit'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
            }`}
          >
            {metrics.wearStatus === 'replace-now'
              ? pick(
                  `REPLACE CHAIN (${inputs.wearElongationPct.toFixed(2)}%)`,
                  `GANTI RANTAI (${inputs.wearElongationPct.toFixed(2)}%)`,
                  `チェーン要交換 (${inputs.wearElongationPct.toFixed(2)}%)`
                )
              : metrics.wearStatus === 'hardened-limit'
                ? pick(
                    `WARNING > 1.5% (${inputs.wearElongationPct.toFixed(2)}%)`,
                    `PERINGATAN > 1,5% (${inputs.wearElongationPct.toFixed(2)}%)`,
                    `注意 > 1.5% (${inputs.wearElongationPct.toFixed(2)}%)`
                  )
                : pick(
                    `OK (${inputs.wearElongationPct.toFixed(2)}% < 1.5%)`,
                    `AMAN (${inputs.wearElongationPct.toFixed(2)}% < 1,5%)`,
                    `正常 (${inputs.wearElongationPct.toFixed(2)}% < 1.5%)`
                  )}
          </span>
        </div>

        <svg
          viewBox="0 0 760 154"
          className="h-auto w-full select-none"
          role="img"
          aria-label="10-Pitch Stainless Steel Vernier Chain Wear Gauge"
        >
          <defs>
            <linearGradient id="stainlessBeamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isDark ? '#475569' : '#f1f5f9'}
              />
              <stop
                offset="50%"
                stopColor={isDark ? '#334155' : '#e2e8f0'}
              />
              <stop
                offset="100%"
                stopColor={isDark ? '#1e293b' : '#cbd5e1'}
              />
            </linearGradient>
          </defs>

          <rect width="760" height="154" fill={bgFill} />

          {/* Brushed Stainless Vernier Caliper Main Beam */}
          <rect
            x="36"
            y="26"
            width="688"
            height="34"
            rx="4"
            fill="url(#stainlessBeamGrad)"
            stroke={panelStroke}
            strokeWidth="1.4"
          />

          {/* Millimeter Ruler Graduation Ticks along the Stainless Beam */}
          {Array.from({ length: 66 }).map((_, i) => {
            const tx = 48 + i * 10;
            const isMajor = i % 5 === 0;
            return (
              <line
                key={i}
                x1={tx}
                y1="60"
                x2={tx}
                y2={isMajor ? '49' : '54'}
                stroke={isDark ? '#94a3b8' : '#475569'}
                strokeWidth={isMajor ? '1.2' : '0.75'}
              />
            );
          })}

          {/* Color-Coded Tolerance Zones on Gauge Scale */}
          <rect
            x={gaugeNominalEndX}
            y="28"
            width={1.5 * pxPerPct}
            height="18"
            fill="rgba(16, 185, 129, 0.28)"
          />
          <rect
            x={gauge15PctX}
            y="28"
            width={1.5 * pxPerPct}
            height="18"
            fill="rgba(245, 158, 11, 0.32)"
          />
          <rect
            x={gauge30PctX}
            y="28"
            width={1.2 * pxPerPct}
            height="18"
            fill="rgba(244, 63, 94, 0.35)"
          />

          {/* Limit Threshold Markers */}
          <line
            x1={gaugeNominalEndX}
            y1="19"
            x2={gaugeNominalEndX}
            y2="62"
            stroke="#10b981"
            strokeWidth="2"
          />
          <text
            x={gaugeNominalEndX}
            y="15"
            textAnchor="middle"
            fill={isDark ? '#6ee7b7' : '#047857'}
            fontSize="9.5"
            fontWeight="700"
          >
            0% ({metrics.nominal10PitchMm.toFixed(1)})
          </text>

          <line
            x1={gauge15PctX}
            y1="19"
            x2={gauge15PctX}
            y2="62"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <text
            x={gauge15PctX}
            y="15"
            textAnchor="middle"
            fill={isDark ? '#fde68a' : '#b45309'}
            fontSize="9.5"
            fontWeight="700"
          >
            1.5% ({metrics.limit15PctMm.toFixed(1)})
          </text>

          <line
            x1={gauge30PctX}
            y1="19"
            x2={gauge30PctX}
            y2="62"
            stroke="#f43f5e"
            strokeWidth="2"
          />
          <text
            x={gauge30PctX}
            y="15"
            textAnchor="middle"
            fill={isDark ? '#fda4af' : '#be123c'}
            fontSize="9.5"
            fontWeight="700"
          >
            3.0% ({metrics.limit30PctMm.toFixed(1)})
          </text>

          {/* 10 Pitches of Articulated Figure-8 Chain Links under Test */}
          {Array.from({ length: 10 }).map((_, idx) => {
            const x1 =
              gaugeStartX + (idx / 10) * (gaugeMeasuredEndX - gaugeStartX);
            const x2 =
              gaugeStartX +
              ((idx + 1) / 10) * (gaugeMeasuredEndX - gaugeStartX);
            if (idx % 2 === 1) return null;
            return (
              <Figure8ChainLink
                key={`g-in-${idx}`}
                pose={{
                  x1,
                  y1: 94,
                  x2,
                  y2: 94,
                  mx: (x1 + x2) / 2,
                  my: 94,
                  angleDeg: 0,
                }}
                isOuter={false}
                plateFill={innerPlateFill}
                plateStroke={innerPlateStroke}
                plateScale={gaugePlateScale}
              />
            );
          })}
          {Array.from({ length: 10 }).map((_, idx) => {
            const x1 =
              gaugeStartX + (idx / 10) * (gaugeMeasuredEndX - gaugeStartX);
            const x2 =
              gaugeStartX +
              ((idx + 1) / 10) * (gaugeMeasuredEndX - gaugeStartX);
            if (idx % 2 === 0) return null;
            return (
              <Figure8ChainLink
                key={`g-out-${idx}`}
                pose={{
                  x1,
                  y1: 94,
                  x2,
                  y2: 94,
                  mx: (x1 + x2) / 2,
                  my: 94,
                  angleDeg: 0,
                }}
                isOuter={true}
                plateFill={outerPlateFill}
                plateStroke={outerPlateStroke}
                plateScale={gaugePlateScale}
              />
            );
          })}

          {Array.from({ length: 11 }).map((_, idx) => {
            const linkX =
              gaugeStartX + (idx / 10) * (gaugeMeasuredEndX - gaugeStartX);
            return (
              <g key={`g-pin-${idx}`}>
                <circle
                  cx={linkX}
                  cy="94"
                  r={5.0 * gaugePlateScale}
                  fill={isDark ? '#e2e8f0' : '#ffffff'}
                  stroke={isDark ? '#0f172a' : '#334155'}
                  strokeWidth="1.3"
                />
                <circle cx={linkX} cy="94" r={2.0 * gaugePlateScale} fill="#f59e0b" />
                <text
                  x={linkX}
                  y="117"
                  textAnchor="middle"
                  fill={textMuted}
                  fontSize="8.5"
                  fontWeight="600"
                >
                  P{idx}
                </text>
              </g>
            );
          })}

          {/* Fixed Left Caliper Anvil Jaw Engaged at P0 */}
          <path
            d={`M ${gaugeStartX - 12} 24 L ${gaugeStartX + 4} 24 L ${gaugeStartX + 4} 66 L ${gaugeStartX + 1.5} 90 L ${gaugeStartX - 6} 90 L ${gaugeStartX - 12} 60 Z`}
            fill="#0284c7"
            stroke="#0369a1"
            strokeWidth="1.2"
          />

          {/* Sliding Right Vernier Jaw Engaged at P10 */}
          <path
            d={`M ${gaugeMeasuredEndX - 4} 22 L ${gaugeMeasuredEndX + 24} 22 L ${gaugeMeasuredEndX + 24} 60 L ${gaugeMeasuredEndX + 6} 60 L ${gaugeMeasuredEndX + 2} 90 L ${gaugeMeasuredEndX - 2} 90 Z`}
            fill={
              metrics.wearStatus === 'replace-now'
                ? '#e11d48'
                : metrics.wearStatus === 'hardened-limit'
                  ? '#d97706'
                  : '#059669'
            }
            stroke={isDark ? '#f8fafc' : '#0f172a'}
            strokeWidth="1.2"
          />

          {/* Digital / Vernier Readout Pill at Bottom */}
          <rect
            x={readoutPillCenterX - 125}
            y="126"
            width="250"
            height="21"
            rx="5"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
          />
          <text
            x={readoutPillCenterX}
            y="140"
            textAnchor="middle"
            fill={textPrimary}
            fontSize="10"
            fontWeight="700"
          >
            L₁₀ = {metrics.measured10PitchMm.toFixed(2)} mm (+
            {(metrics.measured10PitchMm - metrics.nominal10PitchMm).toFixed(2)}{' '}
            mm / {inputs.wearElongationPct.toFixed(2)}%)
          </text>
        </svg>
      </div>
    </div>
  );
}
