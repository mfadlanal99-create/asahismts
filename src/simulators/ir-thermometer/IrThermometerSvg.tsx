import { useCallback, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  INSPECTION_SCENES,
  tempToPaletteColor,
  type CameraMode,
  type DsRatio,
  type InspectionSceneId,
  type IrMeasurementResult,
  type ThermalPalette,
} from './irThermometerPhysics';

interface IrThermometerSvgProps {
  sceneId: InspectionSceneId;
  mode: CameraMode;
  palette: ThermalPalette;
  dsRatio: DsRatio;
  distanceCm: number;
  instrumentEmissivity: number;
  reflectedTempC: number;
  tapeApplied: boolean;
  aimX: number;
  aimY: number;
  measurement: IrMeasurementResult;
  onAimChange: (x: number, y: number) => void;
}

export function IrThermometerSvg({
  sceneId,
  mode,
  palette,
  dsRatio,
  distanceCm,
  instrumentEmissivity,
  reflectedTempC,
  tapeApplied,
  aimX,
  aimY,
  measurement,
  onAimChange,
}: IrThermometerSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const scene = INSPECTION_SCENES[sceneId];

  const updateAimFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      let svgX: number;
      let svgY: number;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const transformed = pt.matrixTransform(ctm.inverse());
        svgX = transformed.x;
        svgY = transformed.y;
      } else {
        const rect = svg.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        svgX = ((clientX - rect.left) / rect.width) * 760;
        svgY = ((clientY - rect.top) / rect.height) * 440;
      }
      // Clamp inside inspection viewport [55..545] x [55..385]
      const clampedX = Math.min(545, Math.max(55, svgX));
      const clampedY = Math.min(385, Math.max(55, svgY));
      onAimChange(Math.round(clampedX), Math.round(clampedY));
    },
    [onAimChange]
  );

  const bgCanvas = 'var(--md-surface-container-low)';
  const viewportBg =
    mode === 'thermal'
      ? tempToPaletteColor(scene.ambientBgTempC, scene.minScaleC, scene.maxScaleC, palette)
      : isDark
      ? '#0b0e14'
      : 'var(--md-surface-container-lowest)';

  const hudBg = isDark ? '#0F172A' : '#1E293B';
  const hudBorder = isDark ? '#334155' : '#475569';

  // Palette scale bar stops
  const scaleSteps = [1, 0.75, 0.5, 0.25, 0];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 760 440"
      className="w-full h-auto select-none cursor-crosshair"
      role="img"
      aria-label={pick(
        'IR Thermometer and Thermal Camera Inspection Scene',
        'Tampilan Inspeksi Termometer Inframerah (IR) dan Kamera Termal',
        '放射温度計・サーモグラフィ検査画面'
      )}
      onPointerDown={(e) => {
        draggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateAimFromPointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) {
          updateAimFromPointer(e.clientX, e.clientY);
        }
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    >
      <defs>
        <clipPath id="irViewportClip">
          <rect x="30" y="34" width="530" height="372" rx="14" />
        </clipPath>
        <linearGradient id="paletteBarGrad" x1="0" y1="0" x2="0" y2="1">
          {scaleSteps.map((frac) => {
            const temp = scene.minScaleC + frac * (scene.maxScaleC - scene.minScaleC);
            return (
              <stop
                key={frac}
                offset={`${(1 - frac) * 100}%`}
                stopColor={tempToPaletteColor(temp, scene.minScaleC, scene.maxScaleC, palette)}
              />
            );
          })}
        </linearGradient>
        <filter id="thermalBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect
        x="0"
        y="0"
        width="760"
        height="440"
        rx="18"
        fill={bgCanvas}
        stroke="var(--md-outline-variant)"
        strokeWidth="1"
      />

      {/* ==================== LEFT: INSPECTION VIEWPORT ==================== */}
      <rect
        x="30"
        y="34"
        width="530"
        height="372"
        rx="14"
        fill={viewportBg}
        stroke="var(--md-outline-variant)"
        strokeWidth="1.5"
      />

      <g clipPath="url(#irViewportClip)">
        {/* Structural Equipment Drawings */}
        {sceneId === 'mcc-breaker' && (
          <g>
            {/* Steel Enclosure Backplate */}
            <rect
              x="75"
              y="70"
              width="440"
              height="300"
              rx="10"
              fill={isDark ? '#1E293B' : '#CBD5E1'}
              stroke={isDark ? '#475569' : '#64748B'}
              strokeWidth="2"
            />
            {/* Three Breaker Modules + Copper Busbar Lugs */}
            {[
              { x: 185, label: 'PHASE A', hot: false },
              { x: 300, label: 'PHASE B', hot: true },
              { x: 415, label: 'PHASE C', hot: false },
            ].map((b) => (
              <g key={b.label}>
                <rect
                  x={b.x - 42}
                  y="110"
                  width="84"
                  height="220"
                  rx="8"
                  fill={isDark ? '#0F172A' : '#475569'}
                  stroke="#64748B"
                  strokeWidth="1.5"
                />
                {/* Copper Lug */}
                <rect
                  x={b.x - 16}
                  y="175"
                  width="32"
                  height="40"
                  rx="4"
                  fill="#D97706"
                  stroke="#FDE68A"
                  strokeWidth="1.5"
                />
                <circle cx={b.x} cy="195" r="7" fill="#78350F" />
                <text
                  x={b.x}
                  y="135"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill="#E2E8F0"
                >
                  {b.label}
                </text>
                {/* Cable Drop */}
                <rect x={b.x - 8} y="215" width="16" height="100" rx="3" fill="#1E293B" />
              </g>
            ))}
          </g>
        )}

        {sceneId === 'bearing-housing' && (
          <g>
            {/* Baseplate */}
            <rect
              x="90"
              y="285"
              width="420"
              height="26"
              rx="4"
              fill={isDark ? '#334155' : '#64748B'}
            />
            {/* Shiny Steel Shaft */}
            <rect
              x="70"
              y="192"
              width="460"
              height="46"
              rx="4"
              fill={isDark ? '#CBD5E1' : '#E2E8F0'}
              stroke="#94A3B8"
              strokeWidth="2"
            />
            <line x1="70" y1="205" x2="530" y2="205" stroke="#FFFFFF" strokeWidth="3" opacity="0.5" />
            {/* Pillow-Block Cast Housing */}
            <path
              d="M 215 285 L 235 170 A 65 65 0 0 1 365 170 L 385 285 Z"
              fill={isDark ? '#1E3A5F' : '#475569'}
              stroke={isDark ? '#60A5FA' : '#1E293B'}
              strokeWidth="2.5"
            />
            {/* Bearing Inner Race Circle */}
            <circle
              cx="300"
              cy="215"
              r="38"
              fill={isDark ? '#0F172A' : '#334155'}
              stroke="#94A3B8"
              strokeWidth="2"
            />
            <circle cx="300" cy="215" r="22" fill={isDark ? '#CBD5E1' : '#E2E8F0'} />
            <text
              x="155"
              y="180"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill="var(--md-on-surface)"
            >
              {pick('SHINY SHAFT (ε=0.15)', 'POROS MENGILAP', '光沢軸 (ε=0.15)')}
            </text>
          </g>
        )}

        {sceneId === 'steam-trap' && (
          <g>
            {/* Horizontal Steam Pipe */}
            <rect
              x="60"
              y="198"
              width="480"
              height="44"
              fill={isDark ? '#475569' : '#94A3B8'}
              stroke="#334155"
              strokeWidth="2"
            />
            {/* Flanges */}
            <rect x="235" y="180" width="14" height="80" rx="3" fill="#334155" />
            <rect x="351" y="180" width="14" height="80" rx="3" fill="#334155" />
            {/* Steam Trap Body */}
            <rect
              x="249"
              y="165"
              width="102"
              height="110"
              rx="14"
              fill={isDark ? '#334155' : '#64748B'}
              stroke="#1E293B"
              strokeWidth="2"
            />
            <text x="145" y="185" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-sans)" fill={isDark ? '#FCA5A5' : '#991B1B'}>
              {pick('STEAM IN (165°C)', 'UAP MASUK', '蒸気入口')}
            </text>
            <text x="455" y="185" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="var(--font-sans)" fill={isDark ? '#93C5FD' : '#1E3A8A'}>
              {pick('CONDENSATE (82°C)', 'KONDENSAT', '復水出口')}
            </text>
          </g>
        )}

        {sceneId === 'motor-stator' && (
          <g>
            {/* Motor Stator Body */}
            <rect
              x="160"
              y="145"
              width="210"
              height="150"
              rx="14"
              fill={isDark ? '#1E3A5F' : '#64748B'}
              stroke="#334155"
              strokeWidth="2"
            />
            {/* Cooling Fins */}
            {[165, 185, 205, 225, 245, 265, 280].map((fy) => (
              <line
                key={fy}
                x1="172"
                y1={fy}
                x2="355"
                y2={fy}
                stroke={isDark ? '#60A5FA' : '#CBD5E1'}
                strokeWidth="3"
                opacity="0.55"
              />
            ))}
            {/* Drive End Bearing Bell */}
            <rect
              x="370"
              y="165"
              width="55"
              height="110"
              rx="10"
              fill={isDark ? '#334155' : '#475569'}
              stroke="#1E293B"
              strokeWidth="2"
            />
            {/* Shaft */}
            <rect x="425" y="206" width="75" height="28" rx="3" fill="#CBD5E1" />
            {/* Terminal Box on Top */}
            <rect
              x="225"
              y="95"
              width="80"
              height="50"
              rx="6"
              fill={isDark ? '#0F172A' : '#475569'}
              stroke="#334155"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Thermal Heatmap Overlay (visible in Thermal Camera mode) */}
        {mode === 'thermal' && (
          <g opacity="0.82" filter="url(#thermalBlur)">
            {scene.zones.map((z) => (
              <circle
                key={z.id}
                cx={z.cx}
                cy={z.cy}
                r={z.radiusPx * 1.25}
                fill={tempToPaletteColor(z.tempC, scene.minScaleC, scene.maxScaleC, palette)}
              />
            ))}
          </g>
        )}

        {/* Electrical Tape Patch (when applied) */}
        {tapeApplied && (
          <rect
            x={aimX - 18}
            y={aimY - 11}
            width="36"
            height="22"
            rx="2"
            fill="#0F172A"
            stroke="#94A3B8"
            strokeWidth="1.5"
            opacity="0.92"
          />
        )}

        {/* Laser Measurement Spot Circle (D:S Optics) */}
        <circle
          cx={aimX}
          cy={aimY}
          r={measurement.spotRadiusPx}
          fill={mode === 'spot' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.10)'}
          stroke="#EF4444"
          strokeWidth="2"
          strokeDasharray="6 3"
        />
        {/* Crosshair Center Dot */}
        <circle cx={aimX} cy={aimY} r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
        <line x1={aimX - 12} y1={aimY} x2={aimX - 5} y2={aimY} stroke="#EF4444" strokeWidth="1.5" />
        <line x1={aimX + 5} y1={aimY} x2={aimX + 12} y2={aimY} stroke="#EF4444" strokeWidth="1.5" />
        <line x1={aimX} y1={aimY - 12} x2={aimX} y2={aimY - 5} stroke="#EF4444" strokeWidth="1.5" />
        <line x1={aimX} y1={aimY + 5} x2={aimX} y2={aimY + 12} stroke="#EF4444" strokeWidth="1.5" />

        {/* Click/Drag Hint Pill at Bottom-Left of Viewport */}
        <rect
          x="42"
          y="370"
          width="232"
          height="26"
          rx="13"
          fill="var(--md-surface-container)"
          fillOpacity="0.92"
          stroke="var(--md-outline-variant)"
          strokeWidth="1"
        />
        <text x="56" y="387" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--md-on-surface)">
          {pick(
            'Click or drag anywhere to aim laser',
            'Klik atau seret untuk mengarahkan laser',
            'クリック／ドラッグで照射位置を移動'
          )}
        </text>
      </g>

      {/* Thermal Palette Scale Bar (when in Thermal mode) */}
      {mode === 'thermal' && (
        <g>
          <rect
            x="530"
            y="54"
            width="14"
            height="332"
            rx="4"
            fill="url(#paletteBarGrad)"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <text x="524" y="64" textAnchor="end" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#FFFFFF">
            {scene.maxScaleC}°C
          </text>
          <text x="524" y="386" textAnchor="end" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#FFFFFF">
            {scene.minScaleC}°C
          </text>
        </g>
      )}

      {/* ==================== RIGHT: HANDHELD IR / THERMAL HUD ==================== */}
      <rect
        x="576"
        y="34"
        width="160"
        height="372"
        rx="18"
        fill={hudBg}
        stroke={hudBorder}
        strokeWidth="2"
      />
      {/* Top Orange Instrument Accent */}
      <rect x="590" y="46" width="132" height="24" rx="8" fill="#EA580C" />
      <text x="656" y="62" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="var(--font-sans)" fill="#FFFFFF">
        {mode === 'thermal'
          ? pick('THERMAL CAM', 'KAMERA TERMAL', 'サーモカメラ')
          : pick('IR PYROMETER', 'TERMOMETER IR', 'IR放射温度計')}
      </text>

      {/* Main Digital Temperature Readout */}
      <rect x="590" y="82" width="132" height="84" rx="10" fill="#071324" stroke="#334155" strokeWidth="1.5" />
      <text x="656" y="102" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="var(--font-sans)" fill="#94A3B8">
        {pick('DISPLAYED TEMP', 'SUHU TERBACA', '表示温度')}
      </text>
      <text
        x="656"
        y="142"
        textAnchor="middle"
        fontSize="28"
        fontWeight="800"
        fontFamily="var(--font-mono)"
        fill="#FB923C"
      >
        {measurement.displayedTempC.toFixed(1)}°C
      </text>

      {/* True Center vs Error Breakdown */}
      <rect x="590" y="178" width="132" height="114" rx="10" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
      <text x="600" y="198" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill="#94A3B8">
        {pick('True Center:', 'Suhu Asli:', '真の温度:')}
      </text>
      <text x="712" y="198" textAnchor="end" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#34D399">
        {measurement.trueCenterTempC.toFixed(1)}°C
      </text>

      <text x="600" y="220" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill="#94A3B8">
        {pick('Spot Avg:', 'Rata-rata Spot:', 'スポット平均:')}
      </text>
      <text x="712" y="220" textAnchor="end" fontSize="10.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#F8FAFC">
        {measurement.spotAvgTrueTempC.toFixed(1)}°C
      </text>

      <text x="600" y="242" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill="#94A3B8">
        {pick('D:S Error:', 'Galat D:S:', 'D:S誤差:')}
      </text>
      <text
        x="712"
        y="242"
        textAnchor="end"
        fontSize="10"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={Math.abs(measurement.spotErrorC) > 3 ? '#FBBF24' : '#94A3B8'}
      >
        {measurement.spotErrorC >= 0 ? '+' : ''}
        {measurement.spotErrorC.toFixed(1)}°C
      </text>

      <text x="600" y="264" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill="#94A3B8">
        {pick('ε Error:', 'Galat ε:', 'ε誤差:')}
      </text>
      <text
        x="712"
        y="264"
        textAnchor="end"
        fontSize="10"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={Math.abs(measurement.emissivityErrorC) > 3 ? '#F87171' : '#94A3B8'}
      >
        {measurement.emissivityErrorC >= 0 ? '+' : ''}
        {measurement.emissivityErrorC.toFixed(1)}°C
      </text>

      <text x="600" y="284" fontSize="9" fontWeight="600" fontFamily="var(--font-sans)" fill="#64748B">
        {pick('Target:', 'Target:', '対象:')} {measurement.targetZoneName.slice(0, 14)}
      </text>

      {/* Optics & Emissivity Footer */}
      <rect x="590" y="304" width="132" height="88" rx="10" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
      <text x="600" y="324" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#CBD5E1">
        D:S = {dsRatio}:1 ({distanceCm} cm)
      </text>
      <text x="600" y="342" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#38BDF8">
        Spot Ø = {measurement.spotDiameterCm.toFixed(1)} cm
      </text>
      <text x="600" y="360" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#FDBA74">
        ε_inst = {instrumentEmissivity.toFixed(2)}
      </text>
      <text x="600" y="378" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill="#94A3B8">
        T_refl = {reflectedTempC}°C {tapeApplied ? '• TAPE' : ''}
      </text>
    </svg>
  );
}
