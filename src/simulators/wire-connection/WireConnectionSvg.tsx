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
  const isStud =
    params.station === 'motor-lug' || params.station === 'grounding-pe';
  const isSplice = params.station === 'wire-splice';
  const isBlock = params.station === 'terminal-block';

  // Wire thickness scales visually with cross-section
  const wireHeight =
    params.gaugeMm2 === 1.5
      ? 12
      : params.gaugeMm2 === 2.5
        ? 15
        : params.gaugeMm2 === 4
          ? 18
          : params.gaugeMm2 === 6
            ? 22
            : 26;

  // Strip length in SVG px (2–18 mm -> 14–108 px)
  const stripPx = Math.round(params.stripLengthMm * 6);
  const insulationPinch = computed.issues.includes('insulation-pinch');
  const oversizedStrip = computed.shockHazard;

  // Pull-test visual slip offset
  const slipOffset =
    pullTestActive && !computed.pullTestPassed
      ? -22
      : pullTestActive
        ? -4
        : 0;

  // Screw vertical travel based on torque (higher torque -> lower screw head)
  const screwDrop = Math.min(18, Math.max(0, (params.torqueNm / 3.0) * 14));

  // Verdict colors
  const verdictColor =
    computed.verdict === 'PASS'
      ? '#10b981'
      : computed.verdict === 'WARNING'
        ? '#f59e0b'
        : '#ef4444';

  const insulationColor = isPe ? '#eab308' : '#92400e';
  const conductorColor =
    params.method === 'solder-tinned' ? '#cbd5e1' : '#d97706';

  const renderConductorTip = (startX: number, centerY: number) => {
    const copperEnd = startX + stripPx;
    const isFerrule =
      params.method === 'crimped-ferrule-lug' && !isStud;
    const isRingLug =
      params.method === 'crimped-ferrule-lug' && isStud;

    return (
      <g>
        {/* Exposed copper / tinned conductor */}
        {!isRingLug && (
          <rect
            x={startX}
            y={centerY - wireHeight * 0.34}
            width={Math.max(10, stripPx)}
            height={wireHeight * 0.68}
            rx={2}
            fill={conductorColor}
            stroke="#78350f"
            strokeWidth={1}
          />
        )}

        {/* Strands texture for bare-stranded */}
        {params.method === 'bare-stranded' && (
          <g stroke="#fbbf24" strokeWidth={1.1} opacity={0.85}>
            <line
              x1={startX + 2}
              y1={centerY - wireHeight * 0.18}
              x2={copperEnd + 6}
              y2={centerY - wireHeight * 0.32}
            />
            <line
              x1={startX + 2}
              y1={centerY}
              x2={copperEnd + 8}
              y2={centerY}
            />
            <line
              x1={startX + 2}
              y1={centerY + wireHeight * 0.18}
              x2={copperEnd + 5}
              y2={centerY + wireHeight * 0.34}
            />
          </g>
        )}

        {/* Bootlace Ferrule (Skun Ferrule) */}
        {isFerrule && (
          <g>
            {/* Plastic collar */}
            <rect
              x={startX - 10}
              y={centerY - wireHeight * 0.56}
              width={14}
              height={wireHeight * 1.12}
              rx={3}
              fill="#2563eb"
              stroke="#1e40af"
              strokeWidth={1.2}
            />
            {/* Crimped tin-plated copper barrel */}
            <rect
              x={startX + 4}
              y={centerY - wireHeight * 0.38}
              width={Math.max(24, stripPx - 2)}
              height={wireHeight * 0.76}
              rx={1.5}
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth={1.2}
            />
            {/* Crimp ribs */}
            <line
              x1={startX + 12}
              y1={centerY - wireHeight * 0.38}
              x2={startX + 12}
              y2={centerY + wireHeight * 0.38}
              stroke="#475569"
              strokeWidth={1.5}
            />
            <line
              x1={startX + 20}
              y1={centerY - wireHeight * 0.38}
              x2={startX + 20}
              y2={centerY + wireHeight * 0.38}
              stroke="#475569"
              strokeWidth={1.5}
            />
          </g>
        )}

        {/* Ring / Spade Lug (Sepatu Kabel) for Studs */}
        {isRingLug && (
          <g>
            {/* Exposed copper inside barrel if oversized strip */}
            {oversizedStrip && (
              <rect
                x={startX}
                y={centerY - wireHeight * 0.34}
                width={stripPx - 28}
                height={wireHeight * 0.68}
                fill={conductorColor}
              />
            )}
            {/* Insulated crimp sleeve */}
            <rect
              x={startX + (oversizedStrip ? 18 : 0)}
              y={centerY - wireHeight * 0.52}
              width={22}
              height={wireHeight * 1.04}
              rx={3}
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth={1.2}
            />
            {/* Tin-plated copper barrel + ring palm */}
            <rect
              x={startX + (oversizedStrip ? 40 : 22)}
              y={centerY - wireHeight * 0.35}
              width={44}
              height={wireHeight * 0.7}
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth={1.2}
            />
            <circle
              cx={startX + (oversizedStrip ? 96 : 78)}
              cy={centerY}
              r={18}
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth={1.5}
            />
            <circle
              cx={startX + (oversizedStrip ? 96 : 78)}
              cy={centerY}
              r={8}
              fill="#1e293b"
            />
          </g>
        )}

        {/* Solder-tinned creep indicator */}
        {params.method === 'solder-tinned' && (
          <g>
            <rect
              x={startX + 8}
              y={centerY - wireHeight * 0.28}
              width={Math.max(16, stripPx - 10)}
              height={wireHeight * 0.56}
              fill="#94a3b8"
              opacity={0.7}
            />
            <text
              x={startX + 10}
              y={centerY - wireHeight * 0.65}
              fill="#f59e0b"
              fontSize="9"
              fontWeight="700"
            >
              {pick('Solder Creep', 'Mulur Timah', 'はんだクリープ')}
            </text>
          </g>
        )}

        {/* Twisted & PVC Tape */}
        {params.method === 'twisted-tape' && (
          <g>
            <rect
              x={startX + 6}
              y={centerY - wireHeight * 0.62}
              width={Math.max(40, stripPx + 14)}
              height={wireHeight * 1.24}
              rx={6}
              fill="#1e293b"
              stroke="#475569"
              strokeWidth={1.2}
            />
            {[0, 10, 20, 30].map((dx) => (
              <line
                key={dx}
                x1={startX + 12 + dx}
                y1={centerY - wireHeight * 0.6}
                x2={startX + 18 + dx}
                y2={centerY + wireHeight * 0.6}
                stroke="#334155"
                strokeWidth={2}
              />
            ))}
          </g>
        )}
      </g>
    );
  };

  return (
    <div
      className="glass-panel rounded-[28px] p-4 space-y-3"
      data-tour="wire-stage"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
          {pick(
            'Interactive Cutaway & Thermal Inspection',
            'Penampang Interaktif & Inspeksi Termal',
            '断面図・熱分布インスペクション'
          )}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
            style={{ backgroundColor: verdictColor }}
          >
            {computed.verdict} · {computed.terminalTempC}°C
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 640 360"
        className="w-full h-auto rounded-2xl bg-slate-950/95 border border-slate-800/80 shadow-inner"
        role="img"
        aria-label={pick(
          'Wire termination cutaway diagram',
          'Diagram penampang terminasi kabel',
          '電線終端接続の断面図'
        )}
      >
        <defs>
          <radialGradient id="wireThermalGlow" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor={computed.thermalSeverity > 0.55 ? '#ef4444' : '#f59e0b'}
              stopOpacity={0.15 + computed.thermalSeverity * 0.65}
            />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="peStripePattern"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="16" fill="#eab308" />
            <rect x="8" width="8" height="16" fill="#16a34a" />
          </pattern>
        </defs>

        {/* Subtle engineering grid */}
        <g stroke="#1e293b" strokeWidth="1">
          {[80, 160, 240, 320, 400, 480, 560].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={360} />
          ))}
          {[72, 144, 216, 288].map((y) => (
            <line key={y} x1={0} y1={y} x2={640} y2={y} />
          ))}
        </g>

        {/* Thermal Glow Hotspot */}
        {computed.thermalSeverity > 0.08 && (
          <circle
            cx={isStud ? 360 : 340}
            cy={isStud ? 210 : 185}
            r={65 + computed.thermalSeverity * 45}
            fill="url(#wireThermalGlow)"
          />
        )}

        {/* STATION 1: TERMINAL BLOCK */}
        {isBlock && (
          <g>
            {/* DIN Rail */}
            <rect
              x={270}
              y={265}
              width={150}
              height={16}
              rx={2}
              fill="#64748b"
              stroke="#94a3b8"
              strokeWidth={1.5}
            />
            <text
              x={345}
              y={296}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="600"
            >
              DIN Rail 35 mm
            </text>

            {/* PA66 Terminal Housing Cutaway */}
            <path
              d="M 250 95 L 440 95 L 440 265 L 250 265 Z"
              fill="#334155"
              fillOpacity={0.75}
              stroke="#64748b"
              strokeWidth={2}
            />
            {/* Brass Busbar & Cage Clamp */}
            <rect
              x={275}
              y={170}
              width={140}
              height={46}
              rx={4}
              fill="#b45309"
              fillOpacity={0.35}
              stroke="#f59e0b"
              strokeWidth={1.8}
            />
            <rect
              x={280}
              y={202}
              width={130}
              height={12}
              fill="#d97706"
              stroke="#fbbf24"
              strokeWidth={1}
            />

            {/* Clamping Screw (moves down with torque) */}
            <g transform={`translate(0, ${screwDrop})`}>
              <rect
                x={328}
                y={75}
                width={34}
                height={18}
                rx={3}
                fill="#94a3b8"
                stroke="#cbd5e1"
                strokeWidth={1.5}
              />
              <rect
                x={338}
                y={93}
                width={14}
                height={68}
                fill="#cbd5e1"
                stroke="#64748b"
                strokeWidth={1}
              />
              {/* Screw pressure foot */}
              <rect
                x={325}
                y={158}
                width={40}
                height={8}
                rx={2}
                fill="#e2e8f0"
                stroke="#475569"
                strokeWidth={1}
              />
            </g>

            {/* Outgoing load wire on right */}
            <rect
              x={405}
              y={180}
              width={35}
              height={12}
              fill="#d97706"
            />
            <rect
              x={435}
              y={176}
              width={145}
              height={20}
              rx={3}
              fill={insulationColor}
              stroke="#451a03"
              strokeWidth={1.2}
            />
            <text
              x={510}
              y={166}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
            >
              {pick('To Load', 'Ke Beban', '負荷側')} ({params.loadCurrentA} A)
            </text>
          </g>
        )}

        {/* STATION 2 & 4: MOTOR LUG & GROUNDING PE */}
        {isStud && (
          <g>
            {/* Chassis / Motor Terminal Plate */}
            <rect
              x={240}
              y={252}
              width={260}
              height={28}
              rx={4}
              fill={isPe ? '#475569' : '#92400e'}
              stroke="#94a3b8"
              strokeWidth={1.5}
            />
            {/* Paint / Powder Coat Layer on PE if paintRemoved === false */}
            {isPe && !params.paintRemoved && (
              <g>
                <rect
                  x={240}
                  y={246}
                  width={260}
                  height={7}
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
                <text
                  x={435}
                  y={240}
                  fill="#f87171"
                  fontSize="10"
                  fontWeight="700"
                >
                  {pick('Paint Insulating Layer!', 'Lapisan Cat Isolator!', '塗装絶縁膜あり！')}
                </text>
              </g>
            )}
            {isPe && params.paintRemoved && (
              <text
                x={435}
                y={270}
                fill="#34d399"
                fontSize="10"
                fontWeight="700"
              >
                {pick('Bare Metal Scraped', 'Logam Bersih (Terkupas)', '塗装剥離済み（導通良）')}
              </text>
            )}

            {/* M6 Threaded Stud */}
            <rect
              x={348}
              y={115}
              width={24}
              height={137}
              fill="#94a3b8"
              stroke="#cbd5e1"
              strokeWidth={1.2}
            />
            {[125, 137, 149, 161, 173, 185, 197, 209, 221, 233].map((ty) => (
              <line
                key={ty}
                x1={348}
                y1={ty}
                x2={372}
                y2={ty + 4}
                stroke="#475569"
                strokeWidth={1.5}
              />
            ))}

            {/* Washer Stack (Correct vs Wrong Order) */}
            {params.washerStackCorrect ? (
              <g>
                {/* Flat Washer on top of lug */}
                <rect
                  x={330}
                  y={178}
                  width={60}
                  height={6}
                  rx={1}
                  fill="#cbd5e1"
                  stroke="#475569"
                />
                {/* Spring / Star Lock Washer */}
                <rect
                  x={334}
                  y={170}
                  width={52}
                  height={6}
                  rx={1}
                  fill="#fbbf24"
                  stroke="#b45309"
                />
              </g>
            ) : (
              <g>
                {/* Wrong: Lock washer placed UNDER lug! */}
                <rect
                  x={334}
                  y={236}
                  width={52}
                  height={6}
                  rx={1}
                  fill="#ef4444"
                  stroke="#991b1b"
                />
                <text
                  x={405}
                  y={175}
                  fill="#f87171"
                  fontSize="10"
                  fontWeight="700"
                >
                  {pick('Wrong Washer Order!', 'Urutan Ring Salah!', 'ワッシャ順序誤り！')}
                </text>
              </g>
            )}

            {/* Hex Nut (height adjusts with torque) */}
            <g transform={`translate(0, ${Math.min(10, screwDrop * 0.6)})`}>
              <rect
                x={332}
                y={142}
                width={56}
                height={22}
                rx={3}
                fill="#cbd5e1"
                stroke="#475569"
                strokeWidth={1.5}
              />
              <line
                x1={348}
                y1={142}
                x2={348}
                y2={164}
                stroke="#64748b"
                strokeWidth={1.2}
              />
              <line
                x1={372}
                y1={142}
                x2={372}
                y2={164}
                stroke="#64748b"
                strokeWidth={1.2}
              />
            </g>

            {/* 360° EMC Shield Clamp on Grounding PE */}
            {isPe && (
              <g>
                <rect
                  x={155}
                  y={235}
                  width={36}
                  height={20}
                  rx={3}
                  fill={params.emcShieldBonded ? '#10b981' : '#475569'}
                  stroke={params.emcShieldBonded ? '#34d399' : '#f87171'}
                  strokeWidth={1.5}
                />
                <text
                  x={173}
                  y={272}
                  textAnchor="middle"
                  fill={params.emcShieldBonded ? '#34d399' : '#f87171'}
                  fontSize="9"
                  fontWeight="700"
                >
                  {params.emcShieldBonded
                    ? pick('EMC 360° Bonded', 'Perisai EMC 360°', 'EMC 360°接地')
                    : pick('EMC Unbonded', 'EMC Tidak Terhubung', 'EMC未接地')}
                </text>
              </g>
            )}
          </g>
        )}

        {/* STATION 3: WIRE SPLICE (Wago Lever or Twisted Tape) */}
        {isSplice && (
          <g>
            {params.method === 'wago-lever' ? (
              <g>
                {/* Translucent Wago 221-style housing */}
                <rect
                  x={265}
                  y={145}
                  width={150}
                  height={82}
                  rx={8}
                  fill="#94a3b8"
                  fillOpacity={0.28}
                  stroke="#cbd5e1"
                  strokeWidth={1.8}
                />
                {/* Copper current bar */}
                <rect
                  x={280}
                  y={192}
                  width={120}
                  height={10}
                  fill="#d97706"
                  stroke="#fbbf24"
                  strokeWidth={1}
                />
                {/* Orange Lever */}
                <path
                  d="M 295 145 L 330 145 L 340 165 L 295 165 Z"
                  fill="#f97316"
                  stroke="#ea580c"
                  strokeWidth={1.5}
                />
                <path
                  d="M 355 145 L 390 145 L 390 165 L 345 165 Z"
                  fill="#f97316"
                  stroke="#ea580c"
                  strokeWidth={1.5}
                />
                <text
                  x={340}
                  y={245}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="600"
                >
                  {pick('Spring-Cage Lever Splice', 'Konektor Tuas Pegas', 'レバー式スプリングコネクタ')}
                </text>
              </g>
            ) : (
              <g>
                {/* Junction Box outline */}
                <rect
                  x={255}
                  y={135}
                  width={170}
                  height={100}
                  rx={10}
                  fill="#1e293b"
                  fillOpacity={0.6}
                  stroke="#475569"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                />
                <text
                  x={340}
                  y={252}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {pick('Junction Box Splice', 'Kotak Sambungan Kabel', 'ジャンクションボックス接続')}
                </text>
              </g>
            )}

            {/* Outgoing wire on right */}
            <rect
              x={380}
              y={180}
              width={45}
              height={12}
              fill="#d97706"
            />
            <rect
              x={420}
              y={176}
              width={150}
              height={20}
              rx={3}
              fill={insulationColor}
              stroke="#451a03"
              strokeWidth={1.2}
            />
          </g>
        )}

        {/* INCOMING WIRE + INSULATION + STRIPPED CONDUCTOR */}
        <g transform={`translate(${slipOffset}, 0)`}>
          {/* PVC Insulation Jacket */}
          <rect
            x={40}
            y={(isStud ? 210 : 185) - wireHeight * 0.55}
            width={242}
            height={wireHeight * 1.1}
            rx={3}
            fill={isPe ? 'url(#peStripePattern)' : insulationColor}
            stroke="#451a03"
            strokeWidth={1.5}
          />
          <text
            x={135}
            y={(isStud ? 210 : 185) - wireHeight * 0.8}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="10"
            fontWeight="600"
          >
            {params.gaugeMm2} mm² · {pick('Strip', 'Kupas', '被覆剥き')}:{' '}
            {params.stripLengthMm} mm
          </text>

          {/* Conductor Tip */}
          {renderConductorTip(282, isStud ? 210 : 185)}

          {/* Insulation Pinch Callout */}
          {insulationPinch && (
            <g>
              <circle
                cx={288}
                cy={isStud ? 210 : 185}
                r={14}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3 2"
              />
              <text
                x={240}
                y={(isStud ? 210 : 185) + 34}
                fill="#f87171"
                fontSize="10"
                fontWeight="700"
              >
                {pick('PVC Pinched Under Clamp!', 'Isolasi PVC Terjepit!', '被覆噛み込み！')}
              </text>
            </g>
          )}

          {/* Oversized Strip Shock Hazard Callout */}
          {oversizedStrip && (
            <text
              x={275}
              y={(isStud ? 210 : 185) + 34}
              fill="#f87171"
              fontSize="10"
              fontWeight="700"
            >
              {pick('Exposed Copper Flashover Hazard!', 'Tembaga Terbuka: Bahaya Kejut!', '銅線露出：感電・短絡危険！')}
            </text>
          )}
        </g>

        {/* Micro-Arcing Sparks when Loose or Pinched under load */}
        {computed.arcingActive && (
          <g stroke="#fef08a" strokeWidth={2} strokeLinecap="round">
            <path d="M 332 175 L 324 163 L 330 160 L 320 148" fill="none" />
            <path d="M 355 182 L 366 170 L 360 166 L 372 156" fill="none" />
            <circle cx={340} cy={178} r={4} fill="#fde047" />
          </g>
        )}

        {/* Animated Pull-Test Tension Arrow */}
        {pullTestActive && (
          <g>
            <line
              x1={110}
              y1={isStud ? 255 : 230}
              x2={32}
              y2={isStud ? 255 : 230}
              stroke={computed.pullTestPassed ? '#10b981' : '#ef4444'}
              strokeWidth={3.5}
            />
            <polygon
              points={`22,${isStud ? 255 : 230} 38,${isStud ? 247 : 222} 38,${isStud ? 263 : 238}`}
              fill={computed.pullTestPassed ? '#10b981' : '#ef4444'}
            />
            <rect
              x={36}
              y={isStud ? 266 : 242}
              width={165}
              height={22}
              rx={11}
              fill={computed.pullTestPassed ? '#064e3b' : '#7f1d1d'}
              stroke={computed.pullTestPassed ? '#10b981' : '#ef4444'}
            />
            <text
              x={118}
              y={isStud ? 281 : 257}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="700"
            >
              {pick('PULL', 'TARIK', '引張')}: {computed.pullOutForceN} N (
              {computed.pullTestPassed ? 'PASS' : 'SLIP!'})
            </text>
          </g>
        )}

        {/* Bottom HUD Telemetry Strip inside SVG */}
        <g transform="translate(16, 316)">
          <rect
            x={0}
            y={0}
            width={608}
            height={32}
            rx={16}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth={1}
          />
          <text x={20} y={20} fill="#94a3b8" fontSize="11" fontWeight="600">
            R_c:{' '}
            <tspan fill="#f8fafc" fontWeight="700">
              {computed.contactResistanceMohm} mΩ
            </tspan>
          </text>
          <text x={155} y={20} fill="#94a3b8" fontSize="11" fontWeight="600">
            ΔV:{' '}
            <tspan fill="#38bdf8" fontWeight="700">
              {computed.voltageDropMv} mV
            </tspan>
          </text>
          <text x={285} y={20} fill="#94a3b8" fontSize="11" fontWeight="600">
            P_loss:{' '}
            <tspan fill="#fbbf24" fontWeight="700">
              {computed.powerDissipationW} W
            </tspan>
          </text>
          <text x={415} y={20} fill="#94a3b8" fontSize="11" fontWeight="600">
            T_term:{' '}
            <tspan fill={verdictColor} fontWeight="700">
              {computed.terminalTempC} °C
            </tspan>
          </text>
          <text x={535} y={20} fill={verdictColor} fontSize="11" fontWeight="800">
            [{computed.verdict}]
          </text>
        </g>
      </svg>
    </div>
  );
}
