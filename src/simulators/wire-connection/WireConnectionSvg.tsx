import { useLanguage } from '../../context/LanguageContext';
import type {
  WireComputedState,
  WireParams,
} from './wireConnectionPhysics';

interface WireConnectionSvgProps {
  params: WireParams;
  computed: WireComputedState;
  pullTestActive: boolean;
}

export function WireConnectionSvg({
  params,
  computed,
  pullTestActive,
}: WireConnectionSvgProps) {
  const { pick } = useLanguage();

  const isPe = params.station === 'grounding-pe';
  const isMotorLug = params.station === 'motor-lug';
  const isSplice = params.station === 'wire-splice';
  const isBlock = params.station === 'terminal-block';

  // Wire radius / half-height scaled by cross-section (1.5 - 10 mm2)
  const wireH =
    params.gaugeMm2 === 1.5
      ? 11
      : params.gaugeMm2 === 2.5
        ? 13.5
        : params.gaugeMm2 === 4
          ? 16
          : params.gaugeMm2 === 6
            ? 19
            : 22;

  const stripPx = Math.round(params.stripLengthMm * 5.2);
  const insulationPinch = computed.issues.includes('insulation-pinch');
  const oversizedStrip = computed.shockHazard;

  const slipOffset =
    pullTestActive && !computed.pullTestPassed
      ? -24
      : pullTestActive
        ? -3
        : 0;

  // Torque ratio 0..1 relative to recommended max
  const torqueRatio = Math.min(
    1,
    Math.max(0, params.torqueNm / (isBlock ? 1.4 : 4.2))
  );

  // Thermal intensity 0..1 above 40 C
  const heatRatio = Math.min(1, Math.max(0, (computed.terminalTempC - 40) / 85));

  const verdictColor =
    computed.verdict === 'PASS'
      ? '#10b981'
      : computed.verdict === 'WARNING'
        ? '#f59e0b'
        : '#ef4444';

  const conductorFill =
    params.method === 'solder-tinned' ? 'url(#tinGrad)' : 'url(#copperGrad)';

  const renderWireJacket = (
    x: number,
    y: number,
    w: number,
    h: number,
    peStripe = false
  ) => (
    <g>
      <rect
        x={x}
        y={y - h / 2}
        width={w}
        height={h}
        rx={2.5}
        fill={peStripe ? '#16a34a' : 'url(#pvcBrownGrad)'}
        stroke={peStripe ? '#14532d' : '#451a03'}
        strokeWidth={1.1}
      />
      {peStripe && (
        <rect
          x={x + 1}
          y={y - h * 0.22}
          width={Math.max(0, w - 2)}
          height={h * 0.44}
          fill="#facc15"
          opacity={0.92}
        />
      )}
      <line
        x1={x + 2}
        y1={y - h * 0.3}
        x2={x + w - 2}
        y2={y - h * 0.3}
        stroke="#ffffff"
        strokeWidth={1}
        opacity={0.22}
      />
    </g>
  );

  const renderThermalAndArcOverlay = (cx: number, cy: number) => (
    <g pointerEvents="none">
      {heatRatio > 0.08 && (
        <circle
          cx={cx}
          cy={cy}
          r={38 + heatRatio * 34}
          fill="url(#thermalGlow)"
          opacity={0.25 + heatRatio * 0.65}
        />
      )}
      {computed.arcingActive && (
        <g stroke="#fde047" strokeWidth={1.8} strokeLinecap="round">
          <path d={`M ${cx - 12} ${cy - 8} L ${cx - 4} ${cy - 18} L ${cx + 3} ${cy - 10}`} fill="none" />
          <path d={`M ${cx + 10} ${cy + 6} L ${cx + 20} ${cy + 15} L ${cx + 12} ${cy + 20}`} fill="none" />
          <circle cx={cx} cy={cy - 12} r={2.2} fill="#fef08a" stroke="none" />
        </g>
      )}
    </g>
  );

  const renderPullBadge = (x: number, y: number) => {
    if (!pullTestActive) return null;
    const pass = computed.pullTestPassed;
    return (
      <g transform={`translate(${x}, ${y})`}>
        <path
          d="M 0 0 L -28 0 M -28 0 L -20 -6 M -28 0 L -20 6"
          stroke={pass ? '#34d399' : '#f87171'}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <rect
          x={-118}
          y={-26}
          width={112}
          height={20}
          rx={6}
          fill={pass ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.25)'}
          stroke={pass ? '#10b981' : '#ef4444'}
          strokeWidth={1}
        />
        <text
          x={-62}
          y={-12.5}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="700"
          fill={pass ? '#6ee7b7' : '#fca5a5'}
        >
          {pass
            ? `${pick('HOLD', 'KUAT', '保持')}: ${computed.pullOutForceN.toFixed(0)} N`
            : `${pick('SLIP!', 'LEPAS!', '抜け!')}: ${computed.pullOutForceN.toFixed(0)} N`}
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <svg
        viewBox="0 0 760 390"
        className="h-auto w-full select-none"
        role="img"
        aria-label={pick(
          'Electrical Wire Termination Cutaway',
          'Penampang Terminasi Kabel Listrik',
          '電気配線端子接続断面図'
        )}
      >
        <defs>
          <pattern
            id="wireGrid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(148,163,184,0.08)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="steelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="brassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id="copperGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <linearGradient id="tinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="55%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="pvcBrownGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="55%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="housingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <radialGradient id="thermalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="760" height="390" fill="#090d16" />
        <rect width="760" height="390" fill="url(#wireGrid)" />

        {/* STATION 1: DIN-RAIL SCREW TERMINAL BLOCK (Phoenix Contact / Weidmuller Cutaway) */}
        {isBlock && (
          <g>
            {/* 35mm Top-Hat DIN Rail Cross Section */}
            <path
              d="M 210 296 L 265 296 L 265 288 L 305 288 L 305 270 L 455 270 L 455 288 L 495 288 L 495 296 L 550 296 L 550 303 L 488 303 L 488 295 L 448 295 L 448 277 L 312 277 L 312 295 L 272 295 L 272 303 L 210 303 Z"
              fill="url(#steelGrad)"
              stroke="#64748b"
              strokeWidth={1}
            />
            <text
              x="380"
              y="320"
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
              fontFamily="monospace"
            >
              TS-35 DIN Rail (35 × 7.5 mm)
            </text>

            {/* Molded Polyamide Terminal Housing Silhouette */}
            <path
              d="M 255 110 L 350 110 L 350 86 L 410 86 L 410 110 L 505 110 L 505 245 L 458 245 L 458 270 L 302 270 L 302 245 L 255 245 Z"
              fill="url(#housingGrad)"
              stroke="#475569"
              strokeWidth={1.6}
            />
            {/* DIN Rail Snap Foot */}
            <rect
              x="306"
              y="262"
              width="148"
              height="9"
              rx={2}
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth={1}
            />
            {/* Angled Wire Funnel Entry Left & Right */}
            <polygon
              points="255,172 288,184 288,216 255,228"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth={1}
            />
            <polygon
              points="505,172 472,184 472,216 505,228"
              fill="#0f172a"
              stroke="#475569"
              strokeWidth={1}
            />
            {/* Central Jumper Bridge Channel */}
            <rect
              x="366"
              y="90"
              width="28"
              height="48"
              rx={3}
              fill="#0f172a"
              stroke="#475569"
              strokeWidth={1}
            />
            {/* Left Screwdriver Access Shaft */}
            <rect
              x="300"
              y="110"
              width="32"
              height="68"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth={1}
            />
            {/* Right Screwdriver Access Shaft */}
            <rect
              x="428"
              y="110"
              width="32"
              height="68"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth={1}
            />

            {/* Internal Copper Current Bar */}
            <rect
              x="292"
              y="206"
              width="176"
              height="10"
              rx={2}
              fill="url(#copperGrad)"
              stroke="#7c2d12"
              strokeWidth={1}
            />

            {/* Incoming Left Wire + Termination Tip */}
            {(() => {
              const jacketEnd = insulationPinch
                ? 338 + slipOffset
                : Math.min(286, 326 - stripPx) + slipOffset;
              const tipStart = jacketEnd;
              const tipLen = Math.max(24, stripPx);
              const isFerrule = params.method === 'crimped-ferrule-lug';
              return (
                <g>
                  {renderWireJacket(54, 198, Math.max(40, jacketEnd - 54), wireH)}
                  {/* Exposed Copper / Solder-Tinned / Ferrule */}
                  <rect
                    x={tipStart}
                    y={198 - wireH * 0.34}
                    width={tipLen}
                    height={wireH * 0.68}
                    rx={1.5}
                    fill={conductorFill}
                    stroke="#78350f"
                    strokeWidth={0.9}
                  />
                  {params.method === 'bare-stranded' && (
                    <g stroke="#fbbf24" strokeWidth={1.1} opacity={0.9}>
                      <line
                        x1={tipStart + 2}
                        y1={194}
                        x2={tipStart + tipLen + 5}
                        y2={190}
                      />
                      <line
                        x1={tipStart + 2}
                        y1={198}
                        x2={tipStart + tipLen + 6}
                        y2={198}
                      />
                      <line
                        x1={tipStart + 2}
                        y1={202}
                        x2={tipStart + tipLen + 4}
                        y2={206}
                      />
                    </g>
                  )}
                  {isFerrule && (
                    <g>
                      <rect
                        x={tipStart - 11}
                        y={198 - wireH * 0.56}
                        width={13}
                        height={wireH * 1.12}
                        rx={2.5}
                        fill="#2563eb"
                        stroke="#1e40af"
                        strokeWidth={1.1}
                      />
                      <rect
                        x={tipStart + 2}
                        y={198 - wireH * 0.38}
                        width={Math.max(28, tipLen - 2)}
                        height={wireH * 0.76}
                        rx={1.5}
                        fill="url(#tinGrad)"
                        stroke="#64748b"
                        strokeWidth={1}
                      />
                      {[10, 18, 26].map((dx) => (
                        <line
                          key={dx}
                          x1={tipStart + dx}
                          y1={198 - wireH * 0.35}
                          x2={tipStart + dx}
                          y2={198 + wireH * 0.35}
                          stroke="#475569"
                          strokeWidth={1.2}
                        />
                      ))}
                    </g>
                  )}
                </g>
              );
            })()}

            {/* Outgoing Right Load Wire (properly terminated with ferrule) */}
            <g>
              <rect
                x={434}
                y={198 - wireH * 0.36}
                width={38}
                height={wireH * 0.72}
                rx={1.5}
                fill="url(#tinGrad)"
                stroke="#64748b"
                strokeWidth={1}
              />
              <rect
                x={470}
                y={198 - wireH * 0.56}
                width={12}
                height={wireH * 1.12}
                rx={2.5}
                fill="#2563eb"
                stroke="#1e40af"
                strokeWidth={1}
              />
              {renderWireJacket(482, 198, 210, wireH)}
              <text
                x="590"
                y="182"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="#94a3b8"
              >
                {pick('To Load', 'Ke Beban', '負荷側')} ({params.loadCurrentA} A)
              </text>
            </g>

            {/* Left Brass Clamping Yoke + Animated M3.5 Screw (moves flush with torque!) */}
            {(() => {
              const screwY = 114 + torqueRatio * 14;
              const clampTop = 178 + torqueRatio * (198 - wireH * 0.38 - 178);
              return (
                <g>
                  {/* Brass Clamping Yoke */}
                  <rect
                    x={296}
                    y={clampTop}
                    width={40}
                    height={38}
                    rx={2.5}
                    fill="none"
                    stroke="url(#brassGrad)"
                    strokeWidth={4}
                  />
                  {/* M3.5 Screw Head & Threaded Shaft */}
                  <rect
                    x={305}
                    y={screwY}
                    width={22}
                    height={9}
                    rx={2}
                    fill="url(#steelGrad)"
                    stroke="#475569"
                    strokeWidth={1}
                  />
                  <line
                    x1={316}
                    y1={screwY + 2}
                    x2={316}
                    y2={screwY + 7}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                  <rect
                    x={311.5}
                    y={screwY + 9}
                    width={9}
                    height={Math.max(10, clampTop - (screwY + 9) + 4)}
                    fill="url(#steelGrad)"
                    stroke="#475569"
                    strokeWidth={0.9}
                  />
                </g>
              );
            })()}

            {/* Right Clamping Yoke + Screw (Load Side) */}
            <g>
              <rect
                x={424}
                y={188}
                width={40}
                height={34}
                rx={2.5}
                fill="none"
                stroke="url(#brassGrad)"
                strokeWidth={4}
              />
              <rect
                x={433}
                y={128}
                width={22}
                height={9}
                rx={2}
                fill="url(#steelGrad)"
                stroke="#475569"
                strokeWidth={1}
              />
              <rect
                x={439.5}
                y={137}
                width={9}
                height={52}
                fill="url(#steelGrad)"
                stroke="#475569"
                strokeWidth={0.9}
              />
            </g>

            {/* Dimension Callouts */}
            <text
              x="165"
              y="176"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fill="#e2e8f0"
            >
              {params.gaugeMm2} mm² · {pick('Strip', 'Kupas', '被覆剥き')}:{' '}
              {params.stripLengthMm} mm
            </text>
            {oversizedStrip && (
              <text
                x="235"
                y="156"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill="#fca5a5"
              >
                ⚠ {pick('EXPOSED COPPER!', 'TEMBAGA TERBUKA!', '導体露出危険!')}
              </text>
            )}
            {insulationPinch && (
              <text
                x="316"
                y="260"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill="#fca5a5"
              >
                ⚠ {pick('CLAMPED ON PVC!', 'MENJEPIT ISOLASI!', '被覆噛み込み!')}
              </text>
            )}
            {renderThermalAndArcOverlay(316, 198)}
            {renderPullBadge(152, 226)}
          </g>
        )}

        {/* STATION 2: 3-PHASE MOTOR TERMINAL BOX (U1/V1/W1 Stud + Ring Lug + Washer Stack) */}
        {isMotorLug && (
          <g>
            {/* Cast Aluminum Motor Terminal Box Cutaway */}
            <rect
              x="160"
              y="72"
              width="440"
              height="240"
              rx={14}
              fill="#111827"
              stroke="#475569"
              strokeWidth={2}
            />
            {/* Bakelite / Phenolic 6-Stud Terminal Block Base */}
            <rect
              x="255"
              y="224"
              width="250"
              height="68"
              rx={6}
              fill="#3b1d12"
              stroke="#78350f"
              strokeWidth={1.5}
            />
            <text
              x="285"
              y="278"
              fontSize="10"
              fontWeight="700"
              fill="#fdba74"
              fontFamily="monospace"
            >
              U1
            </text>
            <text
              x="380"
              y="278"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#fdba74"
              fontFamily="monospace"
            >
              V1 (Active Inspection)
            </text>
            <text
              x="475"
              y="278"
              textAnchor="end"
              fontSize="10"
              fontWeight="700"
              fill="#fdba74"
              fontFamily="monospace"
            >
              W1
            </text>

            {/* Copper Motor Winding Busbar sitting on Bakelite */}
            <rect
              x="295"
              y="210"
              width="170"
              height="14"
              rx={2}
              fill="url(#copperGrad)"
              stroke="#9a3412"
              strokeWidth={1.2}
            />

            {/* M6 Threaded Brass Stud Rising Vertically at x=380 */}
            <rect
              x="368"
              y="108"
              width="24"
              height="104"
              rx={2}
              fill="url(#brassGrad)"
              stroke="#78350f"
              strokeWidth={1.2}
            />
            {[116, 124, 132, 140, 148, 156, 164, 172, 180, 188, 196, 204].map(
              (ty) => (
                <line
                  key={ty}
                  x1={369}
                  y1={ty}
                  x2={391}
                  y2={ty + 3}
                  stroke="#78350f"
                  strokeWidth={1.1}
                  opacity={0.75}
                />
              )
            )}

            {/* Stack Assembly on M6 Stud: Lug + Flat Washer + Spring Washer + Hex Nut */}
            {(() => {
              const busTop = 210;
              const wrongOrder =
                !params.washerStackCorrect ||
                computed.issues.includes('wrong-washer');
              // If wrongOrder, washer is placed UNDER the ring lug!
              const lugBottom = wrongOrder ? busTop - 7 : busTop;
              const lugHeight = 10;
              const lugTop = lugBottom - lugHeight;
              const nutGap = (1 - torqueRatio) * 14;
              const flatWasherY = wrongOrder ? busTop - 6 : lugTop - 5;
              const springWasherY = wrongOrder
                ? lugTop - 5 - nutGap * 0.4
                : flatWasherY - 5 - nutGap * 0.4;
              const hexNutY = springWasherY - 14 - nutGap * 0.6;

              return (
                <g>
                  {/* Incoming Power Cable + Crimped Ring Lug sitting flush on stud */}
                  {renderWireJacket(
                    68,
                    lugBottom - lugHeight / 2,
                    220 + slipOffset,
                    wireH
                  )}
                  {params.method === 'crimped-ferrule-lug' ? (
                    <g>
                      {/* Red/Blue Heat-Shrink Strain Relief */}
                      <rect
                        x={280 + slipOffset}
                        y={lugBottom - lugHeight / 2 - wireH * 0.48}
                        width={22}
                        height={wireH * 0.96}
                        rx={2.5}
                        fill="#dc2626"
                        stroke="#991b1b"
                        strokeWidth={1}
                      />
                      {/* Tinned Copper Crimp Barrel */}
                      <rect
                        x={302 + slipOffset}
                        y={lugBottom - lugHeight + 1}
                        width={42}
                        height={lugHeight - 2}
                        rx={1.5}
                        fill="url(#tinGrad)"
                        stroke="#64748b"
                        strokeWidth={1}
                      />
                      {/* Flat Ring Palm around the M6 Stud */}
                      <rect
                        x={344 + slipOffset}
                        y={lugTop}
                        width={60}
                        height={lugHeight}
                        rx={3}
                        fill="url(#tinGrad)"
                        stroke="#475569"
                        strokeWidth={1.2}
                      />
                    </g>
                  ) : (
                    /* Bare/Tinned/Improvised Hooked Strand around stud */
                    <rect
                      x={288 + slipOffset}
                      y={lugTop + 1}
                      width={108}
                      height={lugHeight - 2}
                      rx={2}
                      fill={conductorFill}
                      stroke="#78350f"
                      strokeWidth={1}
                    />
                  )}

                  {/* Flat Washer */}
                  <rect
                    x={354}
                    y={flatWasherY}
                    width={52}
                    height={5}
                    rx={1.5}
                    fill="url(#steelGrad)"
                    stroke="#334155"
                    strokeWidth={1}
                  />
                  {/* Spring Lock Washer */}
                  <rect
                    x={358}
                    y={springWasherY}
                    width={44}
                    height={5}
                    rx={1.5}
                    fill="#f59e0b"
                    stroke="#92400e"
                    strokeWidth={1}
                  />
                  {/* Hex Nut */}
                  <g>
                    <rect
                      x={358}
                      y={hexNutY}
                      width={44}
                      height={14}
                      rx={2.5}
                      fill="url(#steelGrad)"
                      stroke="#334155"
                      strokeWidth={1.2}
                    />
                    <line
                      x1={369}
                      y1={hexNutY}
                      x2={369}
                      y2={hexNutY + 14}
                      stroke="#475569"
                      strokeWidth={1}
                    />
                    <line
                      x1={391}
                      y1={hexNutY}
                      x2={391}
                      y2={hexNutY + 14}
                      stroke="#475569"
                      strokeWidth={1}
                    />
                  </g>

                  {wrongOrder && (
                    <text
                      x="510"
                      y="206"
                      fontSize="10"
                      fontWeight="700"
                      fill="#fca5a5"
                    >
                      ⚠ {pick('WASHER UNDER LUG!', 'RING DI BAWAH SKUN!', '座金順序誤り!')}
                    </text>
                  )}
                </g>
              );
            })()}

            <text
              x="185"
              y="168"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fill="#e2e8f0"
            >
              M6 Stud · {params.torqueNm.toFixed(1)} N·m
            </text>
            {renderThermalAndArcOverlay(380, 204)}
            {renderPullBadge(152, 240)}
          </g>
        )}

        {/* STATION 3: INLINE WIRE SPLICE (Wago 221 Lever / Crimp Butt Splice / Twisted + Tape) */}
        {isSplice && (
          <g>
            {/* Left Supply Wire + Right Load Wire BOTH enter the splice body */}
            {renderWireJacket(60, 195, 224 + slipOffset, wireH)}
            {renderWireJacket(476, 195, 224, wireH)}

            {/* Exposed Copper Cores Entering Splice Center */}
            <rect
              x={284 + slipOffset}
              y={195 - wireH * 0.34}
              width={94 - slipOffset}
              height={wireH * 0.68}
              rx={1.5}
              fill={conductorFill}
              stroke="#78350f"
              strokeWidth={1}
            />
            <rect
              x={382}
              y={195 - wireH * 0.34}
              width={94}
              height={wireH * 0.68}
              rx={1.5}
              fill={conductorFill}
              stroke="#78350f"
              strokeWidth={1}
            />

            {/* Wago 221 Lever-Nut Transparent Housing + Copper Busbar + Orange Levers */}
            {params.method === 'wago-lever' && (
              <g>
                <rect
                  x={292}
                  y={144}
                  width={176}
                  height={82}
                  rx={10}
                  fill="rgba(226,232,240,0.14)"
                  stroke="#94a3b8"
                  strokeWidth={2}
                />
                {/* Internal Tin-Plated Copper Busbar */}
                <rect
                  x={308}
                  y={198}
                  width={144}
                  height={10}
                  rx={2}
                  fill="url(#tinGrad)"
                  stroke="#64748b"
                  strokeWidth={1}
                />
                {/* Two Orange Hinged Wago Levers */}
                <rect
                  x={314}
                  y={134}
                  width={48}
                  height={16}
                  rx={3}
                  fill="#ea580c"
                  stroke="#9a3412"
                  strokeWidth={1.2}
                />
                <rect
                  x={398}
                  y={134}
                  width={48}
                  height={16}
                  rx={3}
                  fill="#ea580c"
                  stroke="#9a3412"
                  strokeWidth={1.2}
                />
                <text
                  x="380"
                  y="246"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#fdba74"
                >
                  WAGO 221 Inline Lever Connector (IEC 60998)
                </text>
              </g>
            )}

            {/* Insulated Crimp Butt Splice */}
            {params.method === 'crimped-ferrule-lug' && (
              <g>
                {/* Translucent Blue/Yellow Nylon Sleeve */}
                <rect
                  x={296}
                  y={170}
                  width={168}
                  height={50}
                  rx={8}
                  fill="rgba(37,99,235,0.28)"
                  stroke="#60a5fa"
                  strokeWidth={1.8}
                />
                {/* Seamless Tin-Plated Copper Crimp Barrel */}
                <rect
                  x={320}
                  y={178}
                  width={120}
                  height={34}
                  rx={3}
                  fill="url(#tinGrad)"
                  stroke="#475569"
                  strokeWidth={1.4}
                />
                {/* Center Wire Stop Dimple & Dual Hex Crimp Indents */}
                <line
                  x1={380}
                  y1={178}
                  x2={380}
                  y2={212}
                  stroke="#334155"
                  strokeWidth={2}
                />
                {[340, 355, 405, 420].map((cx) => (
                  <rect
                    key={cx}
                    x={cx}
                    y={177}
                    width={5}
                    height={36}
                    fill="#475569"
                  />
                ))}
                <text
                  x="380"
                  y="244"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#93c5fd"
                >
                  {pick(
                    'Insulated Crimp Butt Splice (Double Hex Crimp)',
                    'Sambungan Selongsong Crimp Berisolasi',
                    '絶縁被覆付圧着スリーブ（両側六角圧着）'
                  )}
                </text>
              </g>
            )}

            {/* Twisted + PVC Tape (Improvised / Weak Splice) */}
            {(params.method === 'twisted-tape' ||
              params.method === 'bare-stranded' ||
              params.method === 'solder-tinned') && (
              <g>
                {/* Twisted Copper Helices */}
                <g stroke="#f59e0b" strokeWidth={2.5} fill="none">
                  <path d="M 335 188 Q 350 205 365 188 T 395 188 T 425 188" />
                  <path d="M 335 202 Q 350 185 365 202 T 395 202 T 425 202" />
                </g>
                {params.method === 'twisted-tape' && (
                  <g>
                    {[322, 344, 366, 388, 410].map((tx, idx) => (
                      <rect
                        key={tx}
                        x={tx}
                        y={177}
                        width={26}
                        height={36}
                        rx={3}
                        fill={idx % 2 === 0 ? '#18181b' : '#27272a'}
                        stroke="#52525b"
                        strokeWidth={1.2}
                        opacity={0.92}
                      />
                    ))}
                  </g>
                )}
                <text
                  x="380"
                  y="244"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#fca5a5"
                >
                  ⚠{' '}
                  {pick(
                    'High Contact Resistance & Mechanical Slip Risk!',
                    'Resistansi Kontak Tinggi & Berisiko Lepas Saat Ditarik!',
                    '接触抵抗増大・引張抜けリスク大!'
                  )}
                </text>
              </g>
            )}

            <text
              x="165"
              y="170"
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fill="#e2e8f0"
            >
              {params.gaugeMm2} mm² · {params.loadCurrentA} A
            </text>
            {renderThermalAndArcOverlay(380, 195)}
            {renderPullBadge(152, 232)}
          </g>
        )}

        {/* STATION 4: PROTECTIVE EARTH (PE) BONDING & VFD 360° EMC SHIELD CLAMP */}
        {isPe && (
          <g>
            {/* Steel Enclosure Mounting Plate */}
            <rect
              x="155"
              y="220"
              width="450"
              height="36"
              rx={4}
              fill="url(#steelGrad)"
              stroke="#475569"
              strokeWidth={1.5}
            />
            {/* Paint Layer if paint is NOT removed */}
            {(!params.paintRemoved ||
              computed.issues.includes('paint-insulation')) && (
              <rect
                x="155"
                y="214"
                width="450"
                height="8"
                rx={2}
                fill="#475569"
                stroke="#94a3b8"
                strokeWidth={1}
              />
            )}
            <text
              x="588"
              y="242"
              textAnchor="end"
              fontSize="10"
              fontWeight="700"
              fill="#0f172a"
            >
              {!params.paintRemoved ||
              computed.issues.includes('paint-insulation')
                ? pick('PAINTED CHASSIS (HIGH Z!)', 'CAT PENGHALANG!', '塗装面（高インピーダンス!）')
                : pick('BARE SCRAPED STEEL CHASSIS', 'PELAT BAJA BERSIH (KONTAK BAIK)', '素地露出鋼板')}
            </text>

            {/* M6 Grounding Stud on Left (x=290) */}
            <rect
              x="279"
              y="128"
              width="22"
              height="92"
              rx={2}
              fill="url(#brassGrad)"
              stroke="#78350f"
              strokeWidth={1.2}
            />
            {/* Green/Yellow PE Cable + Ring Lug + Star Lock Washer + Hex Nut */}
            {renderWireJacket(60, 208, 178 + slipOffset, wireH, true)}
            <rect
              x={238 + slipOffset}
              y={202}
              width={74}
              height={10}
              rx={2.5}
              fill={
                params.method === 'crimped-ferrule-lug'
                  ? 'url(#tinGrad)'
                  : conductorFill
              }
              stroke="#475569"
              strokeWidth={1.2}
            />
            {/* Star Lock Washer + Hex Nut */}
            <rect
              x={270}
              y={197 - (1 - torqueRatio) * 8}
              width={40}
              height={5}
              fill="#f59e0b"
              stroke="#92400e"
              strokeWidth={1}
            />
            <rect
              x={270}
              y={183 - (1 - torqueRatio) * 14}
              width={40}
              height={14}
              rx={2}
              fill="url(#steelGrad)"
              stroke="#334155"
              strokeWidth={1.2}
            />

            {/* Right Side: VFD 360° EMC Shield Saddle Clamp vs Pigtail Drain */}
            {params.emcShieldBonded ? (
              <g>
                {/* Shielded Cable Passing Under 360° Saddle Clamp */}
                <rect
                  x={435}
                  y={203}
                  width={130}
                  height={16}
                  rx={3}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth={1}
                />
                {/* Braided Copper Mesh Band Exposed */}
                <rect
                  x={468}
                  y={202}
                  width={56}
                  height={18}
                  fill="url(#copperGrad)"
                  stroke="#9a3412"
                  strokeWidth={1}
                />
                {/* 360° Stainless Steel EMC Saddle Clamp */}
                <path
                  d="M 476 220 L 476 196 Q 496 184 516 196 L 516 220"
                  fill="none"
                  stroke="url(#steelGrad)"
                  strokeWidth={6}
                />
                <text
                  x="496"
                  y="174"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#6ee7b7"
                >
                  ✓ {pick('360° EMC Shield Clamp', 'Klem Perisai EMC 360°', '360° EMCシールドクランプ')}
                </text>
              </g>
            ) : (
              <g>
                {/* Thin High-Inductance Pigtail Drain Wire */}
                <path
                  d="M 465 208 C 465 162, 520 162, 520 214"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth={2.5}
                />
                <circle cx={520} cy={214} r={5} fill="url(#steelGrad)" />
                <text
                  x="496"
                  y="156"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#fcd34d"
                >
                  ⚠ {pick('Pigtail = High HF Noise!', 'Pigtail = Gangguan EMI Tinggi!', 'ピグテール＝高周波ノイズ悪化!')}
                </text>
              </g>
            )}

            {renderThermalAndArcOverlay(290, 206)}
            {renderPullBadge(152, 238)}
          </g>
        )}

        {/* Bottom HUD Telemetry Strip */}
        <g transform="translate(24, 338)">
          <rect
            x="0"
            y="0"
            width="712"
            height="36"
            rx="12"
            fill="rgba(15,23,42,0.9)"
            stroke="rgba(148,163,184,0.22)"
          />
          <text x="20" y="22" fontSize="11" fontWeight="700" fill="#e2e8f0">
            R_c: {computed.contactResistanceMohm.toFixed(2)} mΩ
          </text>
          <text x="165" y="22" fontSize="11" fontWeight="700" fill="#93c5fd">
            ΔV: {computed.voltageDropMv.toFixed(1)} mV
          </text>
          <text x="310" y="22" fontSize="11" fontWeight="700" fill="#fcd34d">
            P_loss: {computed.powerDissipationW.toFixed(2)} W
          </text>
          <text x="455" y="22" fontSize="11" fontWeight="700" fill={verdictColor}>
            T_term: {computed.terminalTempC.toFixed(1)} °C
          </text>
          <text
            x="692"
            y="22"
            textAnchor="end"
            fontSize="11"
            fontWeight="800"
            fill={verdictColor}
          >
            [{computed.verdict}]
          </text>
        </g>
      </svg>
    </div>
  );
}
