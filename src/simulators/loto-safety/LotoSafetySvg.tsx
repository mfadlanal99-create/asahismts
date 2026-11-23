import { useLanguage } from '../../context/LanguageContext';
import type { LotoEvaluation, LotoStateInput } from './lotoData';

interface LotoSafetySvgProps {
  state: LotoStateInput;
  evaluation: LotoEvaluation;
}

export function LotoSafetySvg({ state, evaluation }: LotoSafetySvgProps) {
  const { pick } = useLanguage();
  const { scenario } = evaluation;

  const primaryLive = evaluation.effectiveVoltageV > 0;
  const secondaryLive = evaluation.effectiveSecondaryVoltageV > 0;
  const pressureLive = evaluation.effectivePressureBar > 0;
  const capLive = evaluation.effectiveCapacitorV > 0;
  const anyLive = primaryLive || secondaryLive || pressureLive || capLive || !evaluation.gravitySecured;

  const statusColor =
    evaluation.safetyStatus === 'zero-energy-safe'
      ? '#10b981'
      : evaluation.safetyStatus === 'isolated-unverified'
        ? '#f59e0b'
        : '#ef4444';

  const statusLabel =
    evaluation.safetyStatus === 'zero-energy-safe'
      ? pick(
          'ZERO ENERGY VERIFIED — SAFE FOR MAINTENANCE',
          'ENERGI NOL TERVERIFIKASI — AMAN UNTUK PEMELIHARAAN',
          'ゼロエネルギー検証完了 — 保守作業安全'
        )
      : evaluation.safetyStatus === 'isolated-unverified'
        ? pick(
            'ISOLATED — COMPLETE LOCK/TAG & VERIFICATION',
            'TERISOLASI — LENGKAPI GEMBOK/LABEL & VERIFIKASI',
            '遮断済み — 施錠・タグ・検証を完了してください'
          )
        : pick(
            'HAZARD: HAZARDOUS ENERGY PRESENT',
            'BAHAYA: ENERGI BERBAHAYA MASIH AKTIF',
            '危険：危険エネルギー残留中'
          );

  const ldlDisplayVoltage =
    state.ldlStage === 'live-1' || state.ldlStage === 'live-2'
      ? `${scenario.nominalVoltageV}.0 V`
      : state.ldlStage === 'dead-test' || state.ldlStage === 'verified'
        ? `${Math.max(evaluation.effectiveVoltageV, evaluation.effectiveSecondaryVoltageV).toFixed(1)} V`
        : '--- V';

  const pressureAngleDeg =
    scenario.nominalPressureBar > 0
      ? -120 + (evaluation.effectivePressureBar / scenario.nominalPressureBar) * 240
      : -120;

  return (
    <svg
      viewBox="0 0 820 410"
      className="h-auto w-full select-none"
      role="img"
      aria-label={pick(
        'LOTO Plant Isolation & Zero-Energy Verification Schematic',
        'Skema Isolasi LOTO & Verifikasi Energi Nol',
        'LOTO プラント遮断・ゼロエネルギー検証模式図'
      )}
    >
      <defs>
        <pattern id="loto-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeWidth="1"
          />
        </pattern>
        <linearGradient id="live-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="820" height="410" rx="20" fill="url(#loto-grid)" />

      {/* Top Header Strip */}
      <rect
        x="16"
        y="14"
        width="788"
        height="34"
        rx="10"
        fill={statusColor}
        fillOpacity="0.14"
        stroke={statusColor}
        strokeWidth="1.5"
      />
      <circle cx="34" cy="31" r="6" fill={statusColor}>
        {anyLive && (
          <animate attributeName="opacity" values="1;0.35;1" dur="1.1s" repeatCount="indefinite" />
        )}
      </circle>
      <text
        x="48"
        y="35"
        fontSize="12"
        fontWeight="700"
        fill={statusColor}
        fontFamily="ui-monospace, SFMono-Regular, monospace"
      >
        {statusLabel}
      </text>
      <text
        x="792"
        y="35"
        textAnchor="end"
        fontSize="11"
        fontWeight="600"
        fill="currentColor"
        opacity="0.75"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
      >
        {evaluation.completedStepCount}/6 STEPS
      </text>

      {/* ================= LEFT: MCC ELECTRICAL DISCONNECT ================= */}
      <g transform="translate(20, 64)">
        <rect
          x="0"
          y="0"
          width="210"
          height="268"
          rx="16"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <text x="14" y="24" fontSize="11" fontWeight="700" fill="currentColor" opacity="0.85">
          {pick('MCC DISCONNECT', 'PEMUTUS MCC', 'MCC 遮断器')}
        </text>
        <text
          x="196"
          y="24"
          textAnchor="end"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          fill={primaryLive ? '#ef4444' : '#10b981'}
          fontWeight="700"
        >
          {primaryLive ? `${scenario.nominalVoltageV} V LIVE` : '0 V OPEN'}
        </text>

        {/* Incoming 3-Phase Bus */}
        <line x1="36" y1="42" x2="36" y2="80" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <text x="48" y="64" fontSize="10" fill="#ef4444" fontWeight="700">
          L1/L2/L3 ({scenario.nominalVoltageV}V)
        </text>

        {/* Knife Switch Blade */}
        <circle cx="36" cy="84" r="5" fill="#ef4444" />
        <circle cx="36" cy="136" r="5" fill={primaryLive ? '#ef4444' : '#64748b'} />
        <line
          x1="36"
          y1="84"
          x2={state.primaryBreakerOpen ? '74' : '36'}
          y2={state.primaryBreakerOpen ? '122' : '136'}
          stroke={state.primaryBreakerOpen ? '#10b981' : '#ef4444'}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text
          x="84"
          y="112"
          fontSize="11"
          fontWeight="700"
          fill={state.primaryBreakerOpen ? '#10b981' : '#ef4444'}
        >
          {state.primaryBreakerOpen ? 'OPEN' : 'CLOSED'}
        </text>

        {/* Padlock Badge */}
        <g transform="translate(16, 156)">
          <rect
            x="0"
            y="0"
            width="84"
            height="46"
            rx="10"
            fill={state.primaryLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
            fillOpacity="0.16"
            stroke={state.primaryLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
            strokeWidth="1.5"
          />
          {/* Padlock Shackle & Body */}
          <path
            d="M 18 20 v -5 a 6 6 0 0 1 12 0 v 5"
            fill="none"
            stroke={state.primaryLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#94a3b8'}
            strokeWidth="2.2"
          />
          <rect
            x="15"
            y="20"
            width="18"
            height="14"
            rx="3"
            fill={state.primaryLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#94a3b8'}
          />
          <text x="40" y="21" fontSize="9.5" fontWeight="700" fill="currentColor">
            PADLOCK
          </text>
          <text
            x="40"
            y="34"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fill={state.primaryLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#ef4444'}
            fontWeight="700"
          >
            {state.primaryLocked && state.faultId !== 'tag-only-no-lock' ? 'LOCKED' : 'NONE'}
          </text>
        </g>

        {/* Danger Tag Badge */}
        <g transform="translate(108, 156)">
          <rect
            x="0"
            y="0"
            width="86"
            height="46"
            rx="10"
            fill={state.primaryTagged ? '#ef4444' : '#64748b'}
            fillOpacity="0.14"
            stroke={state.primaryTagged ? '#ef4444' : '#64748b'}
            strokeWidth="1.5"
          />
          <rect x="10" y="9" width="16" height="28" rx="2" fill={state.primaryTagged ? '#ef4444' : '#94a3b8'} />
          <rect x="12" y="13" width="12" height="6" fill="#ffffff" />
          <text x="32" y="21" fontSize="9.5" fontWeight="700" fill="currentColor">
            DANGER
          </text>
          <text
            x="32"
            y="34"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fill={state.primaryTagged ? '#ef4444' : '#64748b'}
            fontWeight="700"
          >
            {state.primaryTagged ? 'TAGGED' : 'NO TAG'}
          </text>
        </g>

        {/* Secondary / Backfeed Indicator */}
        {(scenario.hasDualFeed || state.faultId === 'dual-backfeed') && (
          <g transform="translate(16, 214)">
            <rect
              x="0"
              y="0"
              width="178"
              height="40"
              rx="10"
              fill={secondaryLive ? '#ef4444' : '#10b981'}
              fillOpacity="0.14"
              stroke={secondaryLive ? '#ef4444' : '#10b981'}
              strokeWidth="1.4"
            />
            <text x="10" y="16" fontSize="9.5" fontWeight="700" fill="currentColor">
              {pick('2ND / BACKFEED (120V)', 'SUMBER KE-2 (120V)', '第2電源・逆潮流')}
            </text>
            <text
              x="10"
              y="31"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              fill={secondaryLive ? '#ef4444' : '#10b981'}
            >
              {secondaryLive
                ? 'ENERGIZED (120 V)'
                : state.secondaryLocked && state.secondaryTagged
                  ? 'ISOLATED + LOTO OK'
                  : 'OPEN — ADD LOTO'}
            </text>
          </g>
        )}
      </g>

      {/* Power Feed Line from MCC to Equipment */}
      <path
        d="M 230 198 L 282 198"
        stroke={primaryLive || secondaryLive ? 'url(#live-glow)' : '#64748b'}
        strokeWidth={primaryLive || secondaryLive ? '4' : '2.5'}
        strokeDasharray={primaryLive || secondaryLive ? '8 4' : '5 5'}
      >
        {(primaryLive || secondaryLive) && (
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.7s" repeatCount="indefinite" />
        )}
      </path>

      {/* ================= CENTER: PLANT EQUIPMENT & STORED ENERGY ================= */}
      <g transform="translate(282, 64)">
        <rect
          x="0"
          y="0"
          width="302"
          height="268"
          rx="16"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <text x="14" y="24" fontSize="11" fontWeight="700" fill="currentColor" opacity="0.85">
          {scenario.name[pick('en', 'id', 'ja') as 'en' | 'id' | 'ja'].toUpperCase()}
        </text>

        {/* Motor / Drive Block */}
        <rect
          x="16"
          y="44"
          width="112"
          height="68"
          rx="12"
          fill={primaryLive ? '#ef4444' : '#10b981'}
          fillOpacity="0.1"
          stroke={primaryLive ? '#ef4444' : '#10b981'}
          strokeWidth="1.5"
        />
        <text x="72" y="72" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
          {pick('DRIVE MOTOR', 'MOTOR PENGGERAK', '駆動モータ')}
        </text>
        <text
          x="72"
          y="92"
          textAnchor="middle"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          fill={state.equipmentStopped && !primaryLive ? '#10b981' : '#ef4444'}
        >
          {state.equipmentStopped ? (primaryLive ? 'STOPPED (LIVE)' : '0 RPM / DEAD') : 'RUNNING'}
        </text>

        {/* Process Isolation & Bleed Valves (for pressure scenarios) */}
        {scenario.hasPressureSystem ? (
          <g transform="translate(142, 42)">
            {/* Pressure Gauge */}
            <circle
              cx="104"
              cy="46"
              r="34"
              fill="currentColor"
              fillOpacity="0.06"
              stroke={pressureLive ? '#ef4444' : '#10b981'}
              strokeWidth="2"
            />
            <g transform={`translate(104, 46) rotate(${pressureAngleDeg})`}>
              <line x1="0" y1="4" x2="0" y2="-24" stroke={pressureLive ? '#ef4444' : '#10b981'} strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="104" cy="46" r="4" fill="currentColor" />
            <text
              x="104"
              y="96"
              textAnchor="middle"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              fill={pressureLive ? '#ef4444' : '#10b981'}
            >
              {evaluation.effectivePressureBar.toFixed(1)} bar
            </text>

            {/* Isolation Valve */}
            <rect
              x="0"
              y="6"
              width="60"
              height="36"
              rx="8"
              fill={state.processValveClosed ? '#10b981' : '#ef4444'}
              fillOpacity="0.14"
              stroke={state.processValveClosed ? '#10b981' : '#ef4444'}
              strokeWidth="1.2"
            />
            <text x="30" y="21" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
              ISOL VALVE
            </text>
            <text
              x="30"
              y="34"
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill={state.processValveClosed ? '#10b981' : '#ef4444'}
            >
              {state.processValveClosed ? 'SHUT' : 'OPEN'}
            </text>

            {/* Bleed / Dump Valve */}
            <rect
              x="0"
              y="50"
              width="60"
              height="36"
              rx="8"
              fill={state.bleedValveOpen ? '#10b981' : '#f59e0b'}
              fillOpacity="0.14"
              stroke={state.bleedValveOpen ? '#10b981' : '#f59e0b'}
              strokeWidth="1.2"
            />
            <text x="30" y="65" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
              BLEED/DUMP
            </text>
            <text
              x="30"
              y="78"
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill={state.bleedValveOpen ? '#10b981' : '#f59e0b'}
            >
              {state.bleedValveOpen ? 'OPEN' : 'SHUT'}
            </text>
          </g>
        ) : (
          /* Capacitor Bank for Dual-Feed VFD */
          <g transform="translate(142, 44)">
            <rect
              x="0"
              y="0"
              width="144"
              height="68"
              rx="12"
              fill={capLive ? '#ef4444' : '#10b981'}
              fillOpacity="0.12"
              stroke={capLive ? '#ef4444' : '#10b981'}
              strokeWidth="1.5"
            />
            <text x="72" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">
              VFD DC BUS CAP
            </text>
            <text
              x="72"
              y="48"
              textAnchor="middle"
              fontSize="13"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              fill={capLive ? '#ef4444' : '#10b981'}
            >
              {evaluation.effectiveCapacitorV} V DC
            </text>
          </g>
        )}

        {/* Gravity Ram & Mechanical Safety Block */}
        {scenario.hasGravityBlock ? (
          <g transform="translate(16, 152)">
            <rect
              x="0"
              y="0"
              width="270"
              height="98"
              rx="12"
              fill="currentColor"
              fillOpacity="0.04"
              stroke="currentColor"
              strokeOpacity="0.16"
            />
            <text x="12" y="20" fontSize="10" fontWeight="700" fill="currentColor">
              {pick('GRAVITY RAM & SAFETY BLOCK', 'RAM GRAVITASI & BLOK PENGAMAN', '重力ラム・落下防止ブロック')}
            </text>
            {/* Upper Platen */}
            <rect x="24" y="30" width="90" height="20" rx="4" fill="#64748b" />
            {/* Safety Block */}
            <rect
              x="54"
              y="52"
              width="30"
              height="32"
              rx="4"
              fill={state.gravityBlockInstalled ? '#10b981' : 'none'}
              stroke={state.gravityBlockInstalled ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              strokeDasharray={state.gravityBlockInstalled ? 'none' : '4 3'}
            />
            {/* Lower Bed */}
            <rect x="18" y="84" width="102" height="8" rx="2" fill="#475569" />
            <text
              x="130"
              y="58"
              fontSize="11"
              fontWeight="700"
              fill={state.gravityBlockInstalled ? '#10b981' : '#ef4444'}
            >
              {state.gravityBlockInstalled
                ? pick('BLOCK INSTALLED', 'BLOK TERPASANG', 'ブロック設置済')
                : pick('UNSUPPORTED!', 'TIDAK DIGANJAL!', '未支持・落下危険')}
            </text>
            <text x="130" y="76" fontSize="9.5" fill="currentColor" opacity="0.75">
              {pick('Mechanical restraint', 'Penahan mekanis', '機械的拘束')}
            </text>
          </g>
        ) : (
          <g transform="translate(16, 152)">
            <rect
              x="0"
              y="0"
              width="270"
              height="98"
              rx="12"
              fill="currentColor"
              fillOpacity="0.04"
              stroke="currentColor"
              strokeOpacity="0.16"
            />
            <text x="14" y="24" fontSize="10" fontWeight="700" fill="currentColor">
              {pick('STORED ENERGY SUMMARY', 'RINGKASAN ENERGI TERSIMPAN', '残留エネルギー状態')}
            </text>
            <text
              x="14"
              y="50"
              fontSize="11"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              fill={evaluation.isStoredEnergyReleased ? '#10b981' : '#ef4444'}
            >
              {evaluation.isStoredEnergyReleased
                ? pick('ALL STORED ENERGY = 0', 'SEMUA ENERGI TERSIMPAN = 0', '残留エネルギー = 0')
                : pick('RESIDUAL ENERGY PRESENT', 'MASIH ADA ENERGI TERSISA', '残留エネルギーあり')}
            </text>
            <text x="14" y="74" fontSize="10" fill="currentColor" opacity="0.75">
              {scenario.hasPressureSystem
                ? `Pressure: ${evaluation.effectivePressureBar.toFixed(1)} bar`
                : `DC Bus: ${evaluation.effectiveCapacitorV} V DC`}
            </text>
          </g>
        )}
      </g>

      {/* ================= RIGHT: LIVE-DEAD-LIVE & TRY-OUT ================= */}
      <g transform="translate(600, 64)">
        <rect
          x="0"
          y="0"
          width="204"
          height="268"
          rx="16"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <text x="14" y="24" fontSize="11" fontWeight="700" fill="currentColor" opacity="0.85">
          {pick('ZERO-ENERGY TEST', 'UJI ENERGI NOL', 'ゼロエネルギー検証')}
        </text>

        {/* Multimeter Screen */}
        <rect
          x="14"
          y="38"
          width="176"
          height="88"
          rx="12"
          fill="#0f172a"
          stroke={evaluation.isLdlComplete ? '#10b981' : '#334155'}
          strokeWidth="2"
        />
        <text x="24" y="56" fontSize="9.5" fill="#94a3b8" fontFamily="ui-monospace, monospace">
          CAT IV MULTIMETER (LDL)
        </text>
        <text
          x="102"
          y="92"
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fontFamily="ui-monospace, monospace"
          fill={
            state.ldlStage === 'live-1' || state.ldlStage === 'live-2'
              ? '#f59e0b'
              : evaluation.effectiveVoltageV + evaluation.effectiveSecondaryVoltageV > 0
                ? '#ef4444'
                : '#10b981'
          }
        >
          {ldlDisplayVoltage}
        </text>
        <text
          x="102"
          y="114"
          textAnchor="middle"
          fontSize="9.5"
          fontFamily="ui-monospace, monospace"
          fill="#cbd5e1"
        >
          STAGE: {state.ldlStage.toUpperCase()}
        </text>

        {/* Live-Dead-Live 3-Step Indicator Pills */}
        <g transform="translate(14, 140)">
          {(['live-1', 'dead-test', 'live-2'] as const).map((stage, idx) => {
            const passed =
              (stage === 'live-1' && state.ldlStage !== 'idle') ||
              (stage === 'dead-test' &&
                (state.ldlStage === 'dead-test' ||
                  state.ldlStage === 'live-2' ||
                  state.ldlStage === 'verified')) ||
              (stage === 'live-2' &&
                (state.ldlStage === 'live-2' || state.ldlStage === 'verified'));
            return (
              <g key={stage} transform={`translate(${idx * 60}, 0)`}>
                <rect
                  x="0"
                  y="0"
                  width="54"
                  height="32"
                  rx="8"
                  fill={passed ? '#10b981' : '#64748b'}
                  fillOpacity="0.18"
                  stroke={passed ? '#10b981' : '#64748b'}
                />
                <text
                  x="27"
                  y="20"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill={passed ? '#10b981' : 'currentColor'}
                >
                  {idx === 0 ? '1.LIVE' : idx === 1 ? '2.DEAD' : '3.LIVE'}
                </text>
              </g>
            );
          })}
        </g>

        {/* Try-Out Pushbutton Status */}
        <g transform="translate(14, 188)">
          <rect
            x="0"
            y="0"
            width="176"
            height="64"
            rx="12"
            fill={evaluation.isTryOutComplete ? '#10b981' : '#64748b'}
            fillOpacity="0.14"
            stroke={evaluation.isTryOutComplete ? '#10b981' : '#64748b'}
            strokeWidth="1.4"
          />
          <circle
            cx="30"
            cy="32"
            r="14"
            fill={evaluation.isTryOutComplete ? '#10b981' : '#475569'}
          />
          <text x="54" y="28" fontSize="10.5" fontWeight="700" fill="currentColor">
            START TRY-OUT
          </text>
          <text
            x="54"
            y="44"
            fontSize="9.5"
            fontFamily="ui-monospace, monospace"
            fontWeight="700"
            fill={evaluation.isTryOutComplete ? '#10b981' : '#f59e0b'}
          >
            {evaluation.isTryOutComplete ? 'VERIFIED (NO START)' : 'NOT TESTED'}
          </text>
        </g>
      </g>

      {/* Bottom Legend */}
      <text x="20" y="384" fontSize="11" fill="currentColor" opacity="0.7">
        {pick(
          'OSHA 1910.147 Control of Hazardous Energy • One Person, One Lock, One Key • Always Verify Zero Energy',
          'OSHA 1910.147 Pengendalian Energi Berbahaya • Satu Orang, Satu Gembok, Satu Kunci • Selalu Verifikasi Energi Nol',
          'OSHA 1910.147 危険エネルギー管理 • 一人一錠一鍵原則 • 必ずゼロエネルギーを検証'
        )}
      </text>
    </svg>
  );
}
