import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type {
  HardnessScaleConfig,
  IndentationGeometry,
  SpecimenMaterial,
  TestStage,
} from './hardnessData';

export interface HardnessMachineSvgProps {
  scaleConfig: HardnessScaleConfig;
  material: SpecimenMaterial;
  stage: TestStage;
  liveLoadKgf: number;
  dwellRemainingSec: number;
  totalDwellSec: number;
  measuredValue: number | null;
  geometry: IndentationGeometry;
  onStartCycle: () => void;
  onApplyMajor: () => void;
  onReset: () => void;
}

export function HardnessMachineSvg({
  scaleConfig,
  material,
  stage,
  liveLoadKgf,
  dwellRemainingSec,
  totalDwellSec,
  measuredValue,
  geometry,
  onStartCycle,
  onApplyMajor,
  onReset,
}: HardnessMachineSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  // Precision 2D CAD Palette
  const c = useMemo(() => {
    if (isDark) {
      return {
        // C-Frame Industrial Slate/Graphite
        castBaseDark: '#0f172a',
        castBaseMid: '#1e293b',
        castBaseLight: '#334155',
        castBorder: '#475569',
        castHighlight: '#64748b',
        screws: '#94a3b8',
        screwSlots: '#1e293b',
        // Ground Steel & Chrome
        steelDark: '#334155',
        steelMid: '#64748b',
        steelLight: '#cbd5e1',
        steelBright: '#f1f5f9',
        // Elevating Screw & Handwheel
        screwThread: '#475569',
        handwheelBody: '#1e293b',
        handwheelRim: '#334155',
        handwheelHighlight: '#64748b',
        knurling: '#94a3b8',
        // Machine LCD Head Display
        oledBezel: '#020617',
        oledGlass: '#090d16',
        oledBorder: '#1e293b',
        oledText: '#38bdf8',
        oledValue: '#10b981',
        oledMuted: '#64748b',
        oledAccent: '#f43f5e',
        // Buttons
        consoleBg: '#0f172a',
        consoleBorder: '#334155',
        // Microscope Right Panel
        insetOuter: '#0f172a',
        insetInner: '#020617',
        insetBorder: '#334155',
        scopeBezel: '#1e293b',
        scopeGlass: '#030712',
        reticleLine: '#0284c7',
        reticleSubtle: '#1e293b',
        cardBg: '#090d16',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#64748b',
      };
    }
    return {
      // Light Mode Machine Powder-Coat
      castBaseDark: '#94a3b8',
      castBaseMid: '#cbd5e1',
      castBaseLight: '#f1f5f9',
      castBorder: '#64748b',
      castHighlight: '#ffffff',
      screws: '#475569',
      screwSlots: '#0f172a',
      // Ground Steel & Chrome
      steelDark: '#475569',
      steelMid: '#94a3b8',
      steelLight: '#e2e8f0',
      steelBright: '#ffffff',
      // Elevating Screw & Handwheel
      screwThread: '#64748b',
      handwheelBody: '#475569',
      handwheelRim: '#64748b',
      handwheelHighlight: '#cbd5e1',
      knurling: '#334155',
      // Machine LCD Head Display
      oledBezel: '#1e293b',
      oledGlass: '#090d16',
      oledBorder: '#334155',
      oledText: '#38bdf8',
      oledValue: '#10b981',
      oledMuted: '#94a3b8',
      oledAccent: '#f43f5e',
      // Buttons
      consoleBg: '#e2e8f0',
      consoleBorder: '#94a3b8',
      // Microscope Right Panel
      insetOuter: '#f8fafc',
      insetInner: '#ffffff',
      insetBorder: '#cbd5e1',
      scopeBezel: '#e2e8f0',
      scopeGlass: '#f8fafc',
      reticleLine: '#0284c7',
      reticleSubtle: '#e2e8f0',
      cardBg: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
    };
  }, [isDark]);

  // Stage vertical stroke kinematics (mm mapped to SVG px)
  const indenterYOffset = useMemo(() => {
    switch (stage) {
      case 'idle':
        return 0; // Parked safely above specimen (16px clearance)
      case 'elevating':
        return 8; // Moving into contact
      case 'minor_load':
        return 16; // Contact made, minor load seats indenter (10 kgf)
      case 'major_load':
        return 24; // Full major penetration depth
      case 'dwelling':
        return 24.5; // Slight creep relaxation
      case 'unloading':
        return 19; // Major released, elastic recovery springback, leaving permanent h
      case 'measuring':
      case 'completed':
        return 19;
      default:
        return 0;
    }
  }, [stage]);

  // Stage status descriptions and indicators
  const stageStatus = useMemo(() => {
    switch (stage) {
      case 'idle':
        return {
          label: pick('STANDBY · READY', 'SIAP · STANDBY', '待機中 · 準備完了'),
          color: '#38bdf8',
          dot: '#38bdf8',
        };
      case 'elevating':
        return {
          label: pick('ELEVATING ANVIL...', 'MENAIKKAN LANDASAN...', 'アンビル上昇中...'),
          color: '#fbbf24',
          dot: '#fbbf24',
        };
      case 'minor_load':
        return {
          label: pick('MINOR LOAD (10 kgf)', 'BEBAN AWAL (10 kgf)', '初荷重付加 (10 kgf)'),
          color: '#f59e0b',
          dot: '#f59e0b',
        };
      case 'major_load':
        return {
          label: pick(`MAJOR LOAD (${scaleConfig.totalLoadKgf} kgf)`, `BEBAN UTAMA (${scaleConfig.totalLoadKgf} kgf)`, `試験荷重付加 (${scaleConfig.totalLoadKgf} kgf)`),
          color: '#f43f5e',
          dot: '#f43f5e',
        };
      case 'dwelling':
        return {
          label: pick(`DWELLING (${dwellRemainingSec}s)`, `MENAHAN BEBAN (${dwellRemainingSec}s)`, `荷重保持中 (${dwellRemainingSec}秒)`),
          color: '#ec4899',
          dot: '#ec4899',
        };
      case 'unloading':
        return {
          label: pick('UNLOADING TO MINOR', 'PELEPASAN BEBAN UTAMA', '主荷重除荷中'),
          color: '#a855f7',
          dot: '#a855f7',
        };
      case 'measuring':
        return {
          label: pick('OPTICAL / LVDT ACQUISITION', 'MEMBACA SENSOR KEDALAMAN', '圧痕計測読取中'),
          color: '#06b6d4',
          dot: '#06b6d4',
        };
      case 'completed':
        return {
          label: pick('TEST COMPLETE', 'PENGUJIAN SELESAI', '試験完了'),
          color: '#10b981',
          dot: '#10b981',
        };
    }
  }, [stage, dwellRemainingSec, scaleConfig.totalLoadKgf, pick]);

  // Load bar ratio (0 to 1)
  const loadPercentage = useMemo(() => {
    return Math.min(100, Math.max(0, (liveLoadKgf / scaleConfig.totalLoadKgf) * 100));
  }, [liveLoadKgf, scaleConfig.totalLoadKgf]);

  // Coordinate benchmarks
  const specimenCenterX = 215;
  const anvilTopY = 215;
  const specimenWidth = 84;
  const specimenHeight = 34;
  const specimenLeftX = specimenCenterX - specimenWidth / 2;
  const specimenTopY = anvilTopY - specimenHeight;

  return (
    <div className="w-full flex flex-col items-center select-none">
      <svg
        viewBox="0 0 640 480"
        className="w-full h-auto max-h-[480px] drop-shadow-lg"
        role="img"
        aria-label="High-Fidelity CAD Hardness Tester"
      >
        <defs>
          {/* C-Frame Metallic Powder-Coat Gradients */}
          <linearGradient id="cFrameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.castBaseDark} />
            <stop offset="25%" stopColor={c.castBaseMid} />
            <stop offset="65%" stopColor={c.castBaseLight} />
            <stop offset="90%" stopColor={c.castBaseMid} />
            <stop offset="100%" stopColor={c.castBaseDark} />
          </linearGradient>

          <linearGradient id="cFrameThroatShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.0)" />
          </linearGradient>

          {/* Hardened Ground Steel Shafts & Leadscrew */}
          <linearGradient id="groundSteelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c.steelDark} />
            <stop offset="20%" stopColor={c.steelMid} />
            <stop offset="50%" stopColor={c.steelBright} />
            <stop offset="80%" stopColor={c.steelLight} />
            <stop offset="100%" stopColor={c.steelDark} />
          </linearGradient>

          {/* Precision Acme Screw Gradient */}
          <linearGradient id="acmeScrewGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Tungsten Carbide Spherical Indenter Gradient */}
          <radialGradient id="wcBallGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#475569" />
            <stop offset="95%" stopColor="#0f172a" />
          </radialGradient>

          {/* Natural Diamond Crystal Gradient */}
          <linearGradient id="diamondFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="diamondFacet2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
          </linearGradient>

          {/* Specimen Material Metal Texture */}
          <linearGradient id="specimenMaterialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={material.finishColor} />
            <stop offset="35%" stopColor={material.color} />
            <stop offset="70%" stopColor={material.finishColor} />
            <stop offset="100%" stopColor={material.color} />
          </linearGradient>

          {/* Optical Glass Lens Flare Radial Gradient */}
          <radialGradient id="opticalGlassGlow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={isDark ? '0.12' : '0.06'} />
            <stop offset="80%" stopColor="#0284c7" stopOpacity="0.0" />
          </radialGradient>

          {/* Crisp Industrial Buttons Gradients */}
          <linearGradient id="btnCycleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="btnMajorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="40%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="btnResetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* 1. MACHINE C-FRAME CASTING & HEAVY BASE BED              */}
        {/* ========================================================= */}
        <g id="cframe-structural-body">
          {/* Heavy Machine Footbed / Base Casting */}
          <path
            d={`
              M 35 448
              L 345 448
              Q 350 448, 350 442
              L 345 408
              L 295 404
              L 295 385
              L 145 385
              L 145 404
              L 38 408
              Q 32 408, 32 414
              L 32 442
              Q 32 448, 35 448
              Z
            `}
            fill="url(#cFrameGrad)"
            stroke={c.castBorder}
            strokeWidth="1.5"
          />

          {/* Base Leveling Pads with Vibration Rubber Isolators */}
          <rect x="45" y="448" width="46" height="12" rx="2" fill="#0f172a" stroke={c.castBorder} strokeWidth="0.8" />
          <rect x="285" y="448" width="46" height="12" rx="2" fill="#0f172a" stroke={c.castBorder} strokeWidth="0.8" />
          <line x1="32" y1="460" x2="350" y2="460" stroke="#000000" strokeWidth="1" opacity="0.3" />

          {/* Ground Mounting Anchor Bolts */}
          <circle cx="68" cy="428" r="4.5" fill="#334155" stroke={c.screws} strokeWidth="0.8" />
          <circle cx="68" cy="428" r="2.5" fill={c.screwSlots} />
          <circle cx="312" cy="428" r="4.5" fill="#334155" stroke={c.screws} strokeWidth="0.8" />
          <circle cx="312" cy="428" r="2.5" fill={c.screwSlots} />

          {/* Heavy C-Frame Vertical Column & Upper Overhanging Head */}
          <path
            d={`
              M 38 408
              L 38 48
              Q 38 38, 48 38
              L 336 38
              Q 346 38, 346 48
              L 346 136
              Q 346 146, 336 146
              L 262 146
              L 262 170
              L 168 170
              L 168 146
              L 138 146
              Q 122 146, 122 164
              L 122 368
              Q 122 385, 145 385
              L 295 385
              L 295 404
              L 38 408
              Z
            `}
            fill="url(#cFrameGrad)"
            stroke={c.castBorder}
            strokeWidth="1.6"
          />

          {/* Throat Stiffening Web / Gusset with Shadow Contour */}
          <path
            d="M 122 168 Q 122 188, 108 202 L 60 202 Q 48 202, 48 214 L 48 352 Q 48 368, 62 368 L 122 370"
            fill="none"
            stroke={c.castHighlight}
            strokeWidth="1.2"
            opacity={0.6}
          />
          <path
            d="M 122 168 Q 122 188, 108 202 L 60 202 Q 48 202, 48 214 L 48 352 Q 48 368, 62 368 L 122 370 Z"
            fill="url(#cFrameThroatShadow)"
          />

          {/* Manufacturer Metrology Identification Plate */}
          <rect
            x="48"
            y="48"
            width="72"
            height="22"
            rx="2"
            fill="#090d16"
            stroke={c.castBorder}
            strokeWidth="0.8"
          />
          {/* Rivets */}
          <circle cx="52" cy="52" r="1.2" fill={c.screws} />
          <circle cx="116" cy="52" r="1.2" fill={c.screws} />
          <circle cx="52" cy="66" r="1.2" fill={c.screws} />
          <circle cx="116" cy="66" r="1.2" fill={c.screws} />
          <text
            x="84"
            y="59"
            fill="#f8fafc"
            fontSize="6.5"
            fontWeight="bold"
            letterSpacing="0.8"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            METRO-HARD 500
          </text>
          <text
            x="84"
            y="66"
            fill="#38bdf8"
            fontSize="4.5"
            textAnchor="middle"
            fontFamily="monospace"
          >
            ASTM E18 / E10 / E92
          </text>
        </g>

        {/* ========================================================= */}
        {/* 2. ELEVATING SCREW, KNURLED HANDWHEEL & ANVIL            */}
        {/* ========================================================= */}
        <g id="elevating-mechanism">
          {/* Heavy Bronze Guide Bushing on Base */}
          <rect
            x="192"
            y="352"
            width="46"
            height="33"
            rx="2"
            fill="url(#groundSteelGrad)"
            stroke={c.castBorder}
            strokeWidth="1"
          />
          <line x1="192" y1="368" x2="238" y2="368" stroke="#334155" strokeWidth="0.8" />

          {/* Precision Ground Acme Trapezoidal Leadscrew */}
          <rect
            x="206"
            y="232"
            width="18"
            height="124"
            fill="url(#acmeScrewGrad)"
            stroke={c.steelDark}
            strokeWidth="1"
          />
          {/* Realistic Acme Helical Thread Ridges */}
          {[238, 246, 254, 262, 270, 278, 286, 294, 302, 310, 318, 326, 334, 342, 350].map(
            (ty) => (
              <line
                key={ty}
                x1="206"
                y1={ty}
                x2="224"
                y2={ty - 2.5}
                stroke="#1e293b"
                strokeWidth="1.4"
              />
            )
          )}

          {/* Heavy Cast Elevating Handwheel with Knurled Grip Rim */}
          <g id="spoked-handwheel">
            {/* Outer Knurled Rim */}
            <ellipse
              cx={specimenCenterX}
              cy="368"
              rx="48"
              ry="11"
              fill={c.handwheelBody}
              stroke={c.castBorder}
              strokeWidth="1.4"
            />
            {/* Machined Inner Recess */}
            <ellipse
              cx={specimenCenterX}
              cy="368"
              rx="38"
              ry="8.5"
              fill={c.handwheelRim}
              stroke={c.castHighlight}
              strokeWidth="0.8"
            />
            {/* Knurling Serration Lines on Rim */}
            {[-44, -36, -26, -16, -6, 6, 16, 26, 36, 44].map((dx) => (
              <line
                key={dx}
                x1={specimenCenterX + dx}
                y1={363}
                x2={specimenCenterX + dx}
                y2={373}
                stroke={c.knurling}
                strokeWidth="1.6"
              />
            ))}
            {/* Center Hub & Spoke Boss */}
            <ellipse
              cx={specimenCenterX}
              cy="368"
              rx="18"
              ry="4.5"
              fill="url(#groundSteelGrad)"
              stroke={c.castBorder}
              strokeWidth="0.8"
            />
            {/* Chrome Revolving Spinner Handle */}
            <circle cx={specimenCenterX + 32} cy="366" r="3.5" fill="#f1f5f9" stroke="#334155" strokeWidth="0.8" />
            <circle cx={specimenCenterX + 32} cy="366" r="1.5" fill="#64748b" />
          </g>

          {/* Hardened Ground Steel Anvil Assembly */}
          <g id="hardened-anvil">
            {/* Anvil Collar Support */}
            <path
              d="M 186 232 L 244 232 L 238 218 L 248 218 L 248 215 L 182 215 L 182 218 L 192 218 Z"
              fill="url(#groundSteelGrad)"
              stroke={c.castBorder}
              strokeWidth="1"
            />
            {/* Ground Anvil Working Face (High Polish Reflection) */}
            <line
              x1="182"
              y1={anvilTopY}
              x2="248"
              y2={anvilTopY}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>

          {/* Specimen Block Resting Solidly on Anvil */}
          <g id="specimen-block">
            {/* Specimen Drop Shadow on Anvil */}
            <rect
              x={specimenLeftX}
              y={anvilTopY}
              width={specimenWidth}
              height="3"
              rx="1"
              fill="rgba(0,0,0,0.35)"
            />
            {/* Specimen Metallic Body */}
            <rect
              x={specimenLeftX}
              y={specimenTopY}
              width={specimenWidth}
              height={specimenHeight}
              rx="3"
              fill="url(#specimenMaterialGrad)"
              stroke={c.castBorder}
              strokeWidth="1.4"
            />
            {/* Top Chamfer Machined Glare */}
            <line
              x1={specimenLeftX + 2}
              y1={specimenTopY + 1.2}
              x2={specimenLeftX + specimenWidth - 2}
              y2={specimenTopY + 1.2}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.2"
            />
            {/* Metallic Grain Texture Accents */}
            <line
              x1={specimenLeftX + 6}
              y1={specimenTopY + 12}
              x2={specimenLeftX + specimenWidth - 6}
              y2={specimenTopY + 12}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.8"
            />

            {/* Specimen Recessed Nameplate Badge */}
            <rect
              x={specimenLeftX + 6}
              y={specimenTopY + 15}
              width={specimenWidth - 12}
              height="14"
              rx="2"
              fill={isDark ? 'rgba(9, 13, 22, 0.9)' : 'rgba(255, 255, 255, 0.9)'}
              stroke={c.castBorder}
              strokeWidth="0.8"
            />
            <text
              x={specimenCenterX}
              y={specimenTopY + 25}
              fill={c.textPrimary}
              fontSize="6.2"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {material.name.length > 22 ? material.name.substring(0, 20) + '…' : material.name}
            </text>
          </g>
        </g>

        {/* ========================================================= */}
        {/* 3. INDENTER TURRET & STROKE KINEMATICS                    */}
        {/* ========================================================= */}
        <g id="indenter-spindle-assembly">
          {/* Main Spindle Sleeve extending down from upper head */}
          <rect
            x="198"
            y="126"
            width="34"
            height="26"
            rx="2"
            fill="url(#groundSteelGrad)"
            stroke={c.castBorder}
            strokeWidth="1.2"
          />

          {/* Rotary Turret Head with detents */}
          <rect
            x="192"
            y="146"
            width="46"
            height="18"
            rx="3"
            fill="url(#groundSteelGrad)"
            stroke={c.castBorder}
            strokeWidth="1.2"
          />
          {/* Turret Index Locating Screws */}
          <circle cx="200" cy="155" r="2.2" fill="#334155" stroke={c.screws} strokeWidth="0.6" />
          <circle cx="215" cy="155" r="2.2" fill="#334155" stroke={c.screws} strokeWidth="0.6" />
          <circle cx="230" cy="155" r="2.2" fill="#334155" stroke={c.screws} strokeWidth="0.6" />

          {/* Moving Tool Chuck & Indenter Shank */}
          {(() => {
            // Indenter tip reference at Y = 181 when in contact
            const currentTipY = 165 + indenterYOffset;
            const shankTopY = 160;

            return (
              <g id="active-indenter-stroke">
                {/* Precision Ground Tool Shank */}
                <path
                  d={`
                    M 207 ${shankTopY}
                    L 223 ${shankTopY}
                    L 220 ${currentTipY - 14}
                    L 210 ${currentTipY - 14}
                    Z
                  `}
                  fill="url(#groundSteelGrad)"
                  stroke={c.steelDark}
                  strokeWidth="1"
                />

                {/* Indenter Geometric Tip */}
                {scaleConfig.indenterType === 'diamond_cone' && (
                  // Rockwell C: 120° Spheroconical Diamond Brale Indenter
                  <g id="tip-brale-diamond">
                    <polygon
                      points={`210,${currentTipY - 14} 220,${currentTipY - 14} 215,${currentTipY}`}
                      fill="url(#diamondFacet1)"
                      stroke="#0284c7"
                      strokeWidth="0.8"
                    />
                    <polygon
                      points={`215,${currentTipY - 14} 220,${currentTipY - 14} 215,${currentTipY}`}
                      fill="url(#diamondFacet2)"
                    />
                    <circle cx="215" cy={currentTipY} r="1.5" fill="#38bdf8" />
                  </g>
                )}

                {scaleConfig.indenterType === 'ball_1_16' && (
                  // Rockwell B: 1/16" Carbide Ball in Brass/Steel Cup
                  <g id="tip-small-carbide-ball">
                    <path
                      d={`M 211 ${currentTipY - 14} L 219 ${currentTipY - 14} L 218 ${currentTipY - 5} L 212 ${currentTipY - 5} Z`}
                      fill="#94a3b8"
                      stroke="#475569"
                      strokeWidth="0.8"
                    />
                    <circle
                      cx="215"
                      cy={currentTipY - 3}
                      r="4.2"
                      fill="url(#wcBallGrad)"
                      stroke="#1e293b"
                      strokeWidth="0.8"
                    />
                  </g>
                )}

                {scaleConfig.indenterType === 'ball_10mm' && (
                  // Brinell: 10 mm Tungsten Carbide Ball
                  <g id="tip-10mm-wc-ball">
                    <path
                      d={`M 209 ${currentTipY - 14} L 221 ${currentTipY - 14} L 220 ${currentTipY - 8} L 210 ${currentTipY - 8} Z`}
                      fill="#94a3b8"
                      stroke="#475569"
                      strokeWidth="0.8"
                    />
                    <circle
                      cx="215"
                      cy={currentTipY - 1}
                      r="8"
                      fill="url(#wcBallGrad)"
                      stroke="#0f172a"
                      strokeWidth="1.2"
                    />
                  </g>
                )}

                {scaleConfig.indenterType === 'diamond_pyramid' && (
                  // Vickers: 136° Square-Based Diamond Pyramid
                  <g id="tip-vickers-diamond-pyramid">
                    <polygon
                      points={`209,${currentTipY - 14} 221,${currentTipY - 14} 215,${currentTipY}`}
                      fill="url(#diamondFacet1)"
                      stroke="#0284c7"
                      strokeWidth="0.8"
                    />
                    <polygon
                      points={`215,${currentTipY - 14} 221,${currentTipY - 14} 215,${currentTipY}`}
                      fill="url(#diamondFacet2)"
                    />
                    <line
                      x1="215"
                      y1={currentTipY - 14}
                      x2="215"
                      y2={currentTipY}
                      stroke="#0369a1"
                      strokeWidth="0.8"
                    />
                  </g>
                )}
              </g>
            );
          })()}
        </g>

        {/* ========================================================= */}
        {/* 4. DIGITAL OLED DISPLAY ON MACHINE HEAD                   */}
        {/* ========================================================= */}
        <g id="machine-head-oled-console">
          {/* Beveled Outer Display Frame */}
          <rect
            x="132"
            y="48"
            width="200"
            height="76"
            rx="5"
            fill={c.oledBezel}
            stroke={c.castBorder}
            strokeWidth="1.5"
          />

          {/* Anti-Reflective OLED Glass Pane */}
          <rect
            x="136"
            y="52"
            width="192"
            height="68"
            rx="3"
            fill={c.oledGlass}
            stroke={c.oledBorder}
            strokeWidth="1"
          />

          {/* Status Header Line */}
          <circle cx="146" cy="63" r="3.2" fill={stageStatus.dot} />
          <text
            x="154"
            y="66"
            fill={stageStatus.color}
            fontSize="6.8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {stageStatus.label}
          </text>

          {/* Active Scale & Nominal Load */}
          <text
            x="320"
            y="66"
            fill={c.oledMuted}
            fontSize="6.2"
            textAnchor="end"
            fontFamily="monospace"
          >
            {scaleConfig.id} [{scaleConfig.totalLoadKgf} kgf]
          </text>

          <line x1="140" y1="72" x2="324" y2="72" stroke="#1e293b" strokeWidth="0.8" />

          {/* Primary High-Resolution Digital Hardness Result */}
          <text x="144" y="86" fill={c.oledMuted} fontSize="6" fontFamily="monospace">
            HARDNESS READOUT:
          </text>
          <text
            x="322"
            y="94"
            fill={measuredValue !== null ? c.oledValue : c.oledText}
            fontSize="18"
            fontWeight="bold"
            textAnchor="end"
            fontFamily="monospace"
          >
            {measuredValue !== null
              ? `${measuredValue.toFixed(1)} ${scaleConfig.unit}`
              : `---.- ${scaleConfig.unit}`}
          </text>

          {/* Telemetry Row: Live Force & Measured Depth */}
          <text x="144" y="106" fill={c.oledMuted} fontSize="5.8" fontFamily="monospace">
            FORCE:
          </text>
          <text
            x="178"
            y="106"
            fill="#f59e0b"
            fontSize="6.5"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {liveLoadKgf.toFixed(0)} kgf
          </text>

          <text x="222" y="106" fill={c.oledMuted} fontSize="5.8" fontFamily="monospace">
            DEPTH h:
          </text>
          <text
            x="322"
            y="106"
            fill="#38bdf8"
            fontSize="6.5"
            fontWeight="bold"
            textAnchor="end"
            fontFamily="monospace"
          >
            {(geometry.depthMm * 1000).toFixed(1)} µm
          </text>

          {/* Dynamic Force Capacity Bar */}
          <rect x="144" y="112" width="176" height="4" rx="2" fill="#1e293b" />
          <rect
            x="144"
            y="112"
            width={Math.max(3, (176 * loadPercentage) / 100)}
            height="4"
            rx="2"
            fill={loadPercentage >= 95 ? '#f43f5e' : loadPercentage > 10 ? '#f59e0b' : '#38bdf8'}
          />
        </g>

        {/* ========================================================= */}
        {/* 5. ON-MACHINE TACTILE CONTROL BUTTONS (NO CSS JITTER)      */}
        {/* ========================================================= */}
        <g id="tactile-control-console">
          {/* Anodized Brushed Faceplate */}
          <rect
            x="48"
            y="218"
            width="68"
            height="146"
            rx="4"
            fill={c.consoleBg}
            stroke={c.consoleBorder}
            strokeWidth="1.2"
          />
          {/* Corner Faceplate Hex Screws */}
          <circle cx="53" cy="223" r="1.5" fill={c.screws} />
          <circle cx="111" cy="223" r="1.5" fill={c.screws} />
          <circle cx="53" cy="359" r="1.5" fill={c.screws} />
          <circle cx="111" cy="359" r="1.5" fill={c.screws} />

          <text
            x="82"
            y="232"
            fill={c.textMuted}
            fontSize="5.2"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            CONTROL CONSOLE
          </text>

          {/* BUTTON 1: CYCLE START (AUTOMATIC OR PRELOAD) */}
          <g
            id="hw-btn-start"
            className="cursor-pointer transition-opacity hover:opacity-85 active:opacity-70"
            onClick={stage === 'idle' || stage === 'completed' ? onStartCycle : undefined}
          >
            <title>{pick('Start automated loading sequence', 'Mulai siklus pembebanan otomatis', '自動試験サイクル開始')}</title>
            <rect
              x="54"
              y="240"
              width="56"
              height="30"
              rx="3"
              fill={stage === 'idle' || stage === 'completed' ? 'url(#btnCycleGrad)' : '#334155'}
              stroke="#059669"
              strokeWidth="0.8"
            />
            {/* Status LED */}
            <circle
              cx="63"
              cy="255"
              r="2.5"
              fill={stage === 'idle' || stage === 'completed' ? '#34d399' : '#64748b'}
            />
            <text
              x="83"
              y="252"
              fill="#ffffff"
              fontSize="6.2"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              START
            </text>
            <text
              x="83"
              y="261"
              fill="rgba(255,255,255,0.85)"
              fontSize="4.8"
              textAnchor="middle"
              fontFamily="monospace"
            >
              CYCLE / F₀
            </text>
          </g>

          {/* BUTTON 2: APPLY MAJOR LOAD */}
          <g
            id="hw-btn-major"
            className="cursor-pointer transition-opacity hover:opacity-85 active:opacity-70"
            onClick={stage === 'minor_load' ? onApplyMajor : undefined}
          >
            <title>{pick('Apply total test major load', 'Terapkan beban uji utama', '試験荷重（主荷重）付加')}</title>
            <rect
              x="54"
              y="278"
              width="56"
              height="30"
              rx="3"
              fill={stage === 'minor_load' ? 'url(#btnMajorGrad)' : '#334155'}
              stroke={stage === 'minor_load' ? '#f43f5e' : '#475569'}
              strokeWidth="0.8"
            />
            <circle
              cx="63"
              cy="293"
              r="2.5"
              fill={stage === 'minor_load' ? '#fb7185' : '#64748b'}
            />
            <text
              x="83"
              y="290"
              fill="#ffffff"
              fontSize="6"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              APPLY MAJOR
            </text>
            <text
              x="83"
              y="299"
              fill="rgba(255,255,255,0.85)"
              fontSize="4.6"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {scaleConfig.totalLoadKgf} kgf LOAD
            </text>
          </g>

          {/* BUTTON 3: RESET / UNLOAD */}
          <g
            id="hw-btn-reset"
            className="cursor-pointer transition-opacity hover:opacity-85 active:opacity-70"
            onClick={onReset}
          >
            <title>{pick('Reset machine to standby baseline', 'Reset posisi awal mesin', '待機原点にリセット')}</title>
            <rect
              x="54"
              y="316"
              width="56"
              height="30"
              rx="3"
              fill="url(#btnResetGrad)"
              stroke="#64748b"
              strokeWidth="0.8"
            />
            <circle cx="63" cy="331" r="2.5" fill="#94a3b8" />
            <text
              x="83"
              y="328"
              fill="#ffffff"
              fontSize="6.2"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              RESET
            </text>
            <text
              x="83"
              y="337"
              fill="rgba(255,255,255,0.85)"
              fontSize="4.8"
              textAnchor="middle"
              fontFamily="monospace"
            >
              UNLOAD / ZERO
            </text>
          </g>
        </g>

        {/* ========================================================= */}
        {/* 6. ZOOMED OPTICAL MICROSCOPE / CROSS-SECTION INSET        */}
        {/* ========================================================= */}
        <g id="optical-inspection-station" transform="translate(372, 38)">
          {/* Heavy Beveled Monitor Housing */}
          <rect
            x="0"
            y="0"
            width="250"
            height="422"
            rx="6"
            fill={c.insetOuter}
            stroke={c.insetBorder}
            strokeWidth="1.5"
          />

          {/* Header Title Bar */}
          <rect x="0" y="0" width="250" height="28" rx="6" fill={c.scopeBezel} />
          <line x1="0" y1="28" x2="250" y2="28" stroke={c.insetBorder} strokeWidth="1" />
          <circle cx="16" cy="14" r="3.2" fill="#38bdf8" />
          <text
            x="26"
            y="17.5"
            fill={c.textPrimary}
            fontSize="7.8"
            fontWeight="bold"
            letterSpacing="0.4"
            fontFamily="sans-serif"
          >
            {scaleConfig.id === 'HRC' || scaleConfig.id === 'HRB'
              ? pick('INDENTATION CROSS-SECTION (200×)', 'PENAMPANG KEDALAMAN (200×)', '圧痕断面・侵入深さ (200×)')
              : pick('OPTICAL RETICLE VIEW (100×)', 'PENGUKURAN RETIKEL OPTIK (100×)', '光学レチクル計測 (100×)')}
          </text>

          {/* Optical Eyepiece Viewport (Centered at X = 125, Y = 138, R = 94) */}
          <g id="microscope-eyepiece" transform="translate(125, 138)">
            {/* Outer Knurled Objective Bezel */}
            <circle cx="0" cy="0" r="95" fill={c.scopeBezel} stroke={c.insetBorder} strokeWidth="2" />
            {/* Dark Optical Tube / Field */}
            <circle cx="0" cy="0" r="88" fill={c.scopeGlass} stroke="#334155" strokeWidth="1" />
            {/* Antireflective Lens Glow */}
            <circle cx="0" cy="0" r="88" fill="url(#opticalGlassGlow)" />

            {/* Calibrated Concentric Metric Rings */}
            <circle cx="0" cy="0" r="75" fill="none" stroke={c.reticleSubtle} strokeWidth="0.8" strokeDasharray="2 3" />
            <circle cx="0" cy="0" r="50" fill="none" stroke={c.reticleSubtle} strokeWidth="0.8" strokeDasharray="2 3" />
            <circle cx="0" cy="0" r="25" fill="none" stroke={c.reticleSubtle} strokeWidth="0.8" strokeDasharray="2 3" />

            {/* Precision Optical Crosshairs with Graduation Ticks */}
            <line x1="-88" y1="0" x2="88" y2="0" stroke={c.reticleLine} strokeWidth="0.8" />
            <line x1="0" y1="-88" x2="0" y2="88" stroke={c.reticleLine} strokeWidth="0.8" />
            {[-60, -45, -30, -15, 15, 30, 45, 60].map((pos) => (
              <g key={pos}>
                <line x1={pos} y1="-3" x2={pos} y2="3" stroke={c.reticleLine} strokeWidth="0.8" />
                <line x1="-3" y1={pos} x2="3" y2={pos} stroke={c.reticleLine} strokeWidth="0.8" />
              </g>
            ))}

            {/* A. ROCKWELL HRC/HRB: HIGH-RESOLUTION CROSS-SECTION PROFILE */}
            {(scaleConfig.id === 'HRC' || scaleConfig.id === 'HRB') && (
              <g id="rockwell-depth-profile">
                {/* Specimen Substrate Below Surface */}
                <rect x="-82" y="0" width="164" height="78" fill={material.color} opacity={0.65} />
                {/* Pristine Specimen Datum Surface (h₀) */}
                <line x1="-82" y1="0" x2="82" y2="0" stroke="#f8fafc" strokeWidth="1.6" />
                <text x="-76" y="-7" fill={c.textMuted} fontSize="6" fontFamily="monospace">
                  SURFACE DATUM (h₀)
                </text>

                {/* Live Indentation Impression */}
                {stage !== 'idle' && stage !== 'elevating' && (
                  <g id="active-rockwell-depth-crater">
                    {scaleConfig.id === 'HRC' ? (
                      // 120° Conical impression with piling-up lip
                      <g>
                        <polygon
                          points={`0,${Math.min(52, geometry.depthMm * 420)} -34,0 34,0`}
                          fill={isDark ? '#090d16' : '#cbd5e1'}
                          stroke="#f43f5e"
                          strokeWidth="1.2"
                        />
                        {/* Lip */}
                        <path d="M -34 0 Q -38 -2, -42 0 Z" fill={material.finishColor} />
                        <path d="M 34 0 Q 38 -2, 42 0 Z" fill={material.finishColor} />
                      </g>
                    ) : (
                      // Spherical impression
                      <path
                        d={`M -38 0 Q 0 ${Math.min(52, geometry.depthMm * 360)} 38 0 Z`}
                        fill={isDark ? '#090d16' : '#cbd5e1'}
                        stroke="#f43f5e"
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Permanent Depth h Dimension Callout Line */}
                    <line
                      x1="48"
                      y1="0"
                      x2="48"
                      y2={Math.min(52, geometry.depthMm * 420)}
                      stroke="#f43f5e"
                      strokeWidth="1.2"
                    />
                    <polygon points={`48,0 45,6 51,6`} fill="#f43f5e" />
                    <polygon
                      points={`48,${Math.min(52, geometry.depthMm * 420)} 45,${Math.min(52, geometry.depthMm * 420) - 6} 51,${Math.min(52, geometry.depthMm * 420) - 6}`}
                      fill="#f43f5e"
                    />

                    {/* Non-overlapping Pill Badge for Depth Readout */}
                    <rect
                      x="54"
                      y={Math.max(4, Math.min(28, (geometry.depthMm * 420) / 2 - 9))}
                      width="42"
                      height="17"
                      rx="3"
                      fill={isDark ? '#090d16' : '#ffffff'}
                      stroke="#f43f5e"
                      strokeWidth="1"
                    />
                    <text
                      x="75"
                      y={Math.max(4, Math.min(28, (geometry.depthMm * 420) / 2 - 9)) + 12}
                      fill="#f43f5e"
                      fontSize="6.8"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {`h=${(geometry.depthMm * 1000).toFixed(0)}µm`}
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* B. BRINELL HBW: CIRCULAR IMPRESSION WITH DIAMETER CALIPER TICKS */}
            {scaleConfig.id === 'HBW' && (
              <g id="brinell-optical-top-view">
                {/* Spherical Indent Rim with Lighting Shadows */}
                <circle
                  cx="0"
                  cy="0"
                  r={Math.min(68, Math.max(16, geometry.diameterMm * 14.5))}
                  fill={isDark ? '#1e293b' : '#cbd5e1'}
                  stroke="#38bdf8"
                  strokeWidth="1.6"
                />
                <circle
                  cx="-3"
                  cy="-3"
                  r={Math.min(64, Math.max(14, geometry.diameterMm * 13))}
                  fill="none"
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="5"
                />

                {/* Caliper Measuring Leader Lines */}
                <line
                  x1={-Math.min(68, Math.max(16, geometry.diameterMm * 14.5))}
                  y1="-75"
                  x2={-Math.min(68, Math.max(16, geometry.diameterMm * 14.5))}
                  y2="75"
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1={Math.min(68, Math.max(16, geometry.diameterMm * 14.5))}
                  y1="-75"
                  x2={Math.min(68, Math.max(16, geometry.diameterMm * 14.5))}
                  y2="75"
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Dimension Arrow for Diameter d */}
                <line
                  x1={-Math.min(68, Math.max(16, geometry.diameterMm * 14.5))}
                  y1="-56"
                  x2={Math.min(68, Math.max(16, geometry.diameterMm * 14.5))}
                  y2="-56"
                  stroke="#0284c7"
                  strokeWidth="1.2"
                />
                <polygon
                  points={`${-Math.min(68, Math.max(16, geometry.diameterMm * 14.5))},-56 ${-Math.min(68, Math.max(16, geometry.diameterMm * 14.5)) + 6},-59 ${-Math.min(68, Math.max(16, geometry.diameterMm * 14.5)) + 6},-53`}
                  fill="#0284c7"
                />
                <polygon
                  points={`${Math.min(68, Math.max(16, geometry.diameterMm * 14.5))},-56 ${Math.min(68, Math.max(16, geometry.diameterMm * 14.5)) - 6},-59 ${Math.min(68, Math.max(16, geometry.diameterMm * 14.5)) - 6},-53`}
                  fill="#0284c7"
                />

                {/* Non-overlapping Diameter Pill */}
                <rect
                  x="-32"
                  y="-70"
                  width="64"
                  height="16"
                  rx="3"
                  fill={isDark ? '#090d16' : '#ffffff'}
                  stroke="#0284c7"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-59"
                  fill="#0284c7"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {`d = ${geometry.diameterMm.toFixed(2)} mm`}
                </text>
              </g>
            )}

            {/* C. VICKERS HV: 136° SQUARE PYRAMID DIAGONAL MEASUREMENT */}
            {scaleConfig.id === 'HV' && (
              <g id="vickers-optical-pyramid">
                {/* 45° Diamond Quadrilateral */}
                <polygon
                  points={`0,${-Math.min(64, geometry.diameterMm * 115)} ${Math.min(64, geometry.diameterMm * 115)},0 0,${Math.min(64, geometry.diameterMm * 115)} ${-Math.min(64, geometry.diameterMm * 115)},0`}
                  fill={isDark ? '#1e293b' : '#cbd5e1'}
                  stroke="#0284c7"
                  strokeWidth="1.4"
                />
                {/* Internal Pyramid Ridge Crosshairs */}
                <line
                  x1={-Math.min(64, geometry.diameterMm * 115)}
                  y1="0"
                  x2={Math.min(64, geometry.diameterMm * 115)}
                  y2="0"
                  stroke="#0369a1"
                  strokeWidth="0.8"
                />
                <line
                  x1="0"
                  y1={-Math.min(64, geometry.diameterMm * 115)}
                  x2="0"
                  y2={Math.min(64, geometry.diameterMm * 115)}
                  stroke="#0369a1"
                  strokeWidth="0.8"
                />

                {/* Shaded Triangular Facets */}
                <polygon
                  points={`0,${-Math.min(64, geometry.diameterMm * 115)} ${Math.min(64, geometry.diameterMm * 115)},0 0,0`}
                  fill="rgba(56, 189, 248, 0.25)"
                />
                <polygon
                  points={`0,${Math.min(64, geometry.diameterMm * 115)} ${-Math.min(64, geometry.diameterMm * 115)},0 0,0`}
                  fill="rgba(2, 132, 199, 0.35)"
                />

                {/* Diagonal Readout Callout Box */}
                <rect
                  x="-32"
                  y="46"
                  width="64"
                  height="24"
                  rx="3"
                  fill={isDark ? '#090d16' : '#ffffff'}
                  stroke="#0284c7"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="57"
                  fill="#0284c7"
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {`d₁ = ${(geometry.d1Mm ?? geometry.diameterMm).toFixed(3)} mm`}
                </text>
                <text
                  x="0"
                  y="66"
                  fill="#0284c7"
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {`d₂ = ${(geometry.d2Mm ?? geometry.diameterMm).toFixed(3)} mm`}
                </text>
              </g>
            )}
          </g>

          {/* Metrology Specifications & Calculation Card (Lower half) */}
          <g id="metrology-spec-card" transform="translate(14, 252)">
            <rect
              x="0"
              y="0"
              width="222"
              height="156"
              rx="4"
              fill={c.cardBg}
              stroke={c.insetBorder}
              strokeWidth="1"
            />

            {/* Spec Title */}
            <text x="12" y="16" fill={c.textPrimary} fontSize="7.2" fontWeight="bold" fontFamily="sans-serif">
              {pick('METROLOGY SPECIFICATIONS', 'SPESIFIKASI METROLOGI', '計測・規格仕様')}
            </text>
            <line x1="12" y1="22" x2="210" y2="22" stroke={c.insetBorder} strokeWidth="0.8" />

            {/* Rows with Generous Clean Spacing */}
            <text x="12" y="36" fill={c.textMuted} fontSize="6" fontFamily="monospace">
              STANDARD:
            </text>
            <text x="210" y="36" fill={c.textPrimary} fontSize="6" textAnchor="end" fontFamily="monospace">
              {scaleConfig.standard}
            </text>

            <text x="12" y="50" fill={c.textMuted} fontSize="6" fontFamily="monospace">
              INDENTER:
            </text>
            <text x="210" y="50" fill="#f43f5e" fontSize="5.5" fontWeight="bold" textAnchor="end" fontFamily="monospace">
              {scaleConfig.indenterName}
            </text>

            <text x="12" y="64" fill={c.textMuted} fontSize="6" fontFamily="monospace">
              TOTAL LOAD:
            </text>
            <text x="210" y="64" fill="#f59e0b" fontSize="6.5" fontWeight="bold" textAnchor="end" fontFamily="monospace">
              {scaleConfig.totalLoadKgf} kgf ({((scaleConfig.totalLoadKgf * 9.80665) / 1000).toFixed(2)} kN)
            </text>

            <text x="12" y="78" fill={c.textMuted} fontSize="6" fontFamily="monospace">
              DWELL DURATION:
            </text>
            <text x="210" y="78" fill={c.textPrimary} fontSize="6" textAnchor="end" fontFamily="monospace">
              {totalDwellSec} seconds
            </text>

            <line x1="12" y1="86" x2="210" y2="86" stroke={c.insetBorder} strokeWidth="0.8" />

            <text x="12" y="99" fill={c.textMuted} fontSize="6" fontFamily="monospace">
              FORMULA:
            </text>
            <text x="210" y="99" fill="#38bdf8" fontSize="5.5" fontWeight="bold" textAnchor="end" fontFamily="monospace">
              {scaleConfig.readoutFormula}
            </text>

            <text x="12" y="113" fill={c.textMuted} fontSize="6" fontFamily="monospace">
              CALIBRATION ENVELOPE:
            </text>
            <text x="210" y="113" fill="#10b981" fontSize="6" textAnchor="end" fontFamily="monospace">
              {scaleConfig.minRecommended} – {scaleConfig.maxRecommended} {scaleConfig.unit}
            </text>

            {/* Material Treatment Note Container */}
            <rect x="10" y="121" width="202" height="28" rx="2" fill={isDark ? '#0f172a' : '#e2e8f0'} />
            <text x="16" y="132" fill={c.textSecondary} fontSize="5.2" fontWeight="bold" fontFamily="sans-serif">
              {material.name}
            </text>
            <text x="16" y="142" fill={c.textMuted} fontSize="4.6" fontFamily="sans-serif">
              {material.treatment}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
