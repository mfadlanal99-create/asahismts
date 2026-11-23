import type { KeyboardEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { LotoEvaluation, LotoStateInput, SelectorMode } from './lotoData';

export type LotoActionId =
  | 'toggle-mcc-disconnect'
  | 'toggle-mcc-lock'
  | 'toggle-mcc-tag'
  | 'discharge-capacitor'
  | 'toggle-secondary-disconnect'
  | 'toggle-secondary-lock'
  | 'toggle-secondary-tag'
  | 'set-selector-hand'
  | 'set-selector-off'
  | 'set-selector-auto'
  | 'press-stop'
  | 'toggle-lcs-lock'
  | 'toggle-lcs-tag'
  | 'toggle-motor-isolator'
  | 'toggle-motor-isolator-lock'
  | 'toggle-motor-isolator-tag'
  | 'toggle-process-valve'
  | 'toggle-process-valve-lock'
  | 'toggle-bleed-valve'
  | 'toggle-gravity-block'
  | 'advance-ldl'
  | 'perform-tryout';

interface LotoSafetySvgProps {
  state: LotoStateInput;
  evaluation: LotoEvaluation;
  onAction: (action: LotoActionId) => void;
}

function handleSvgKeyDown(e: KeyboardEvent<SVGGElement>, action: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    action();
  }
}

export function LotoSafetySvg({ state, evaluation, onAction }: LotoSafetySvgProps) {
  const { language, pick } = useLanguage();
  const { scenario } = evaluation;

  const mccLive = evaluation.effectiveMccVoltageV > 0;
  const secondaryLive = evaluation.effectiveSecondaryVoltageV > 0;
  const terminalLive = evaluation.effectiveMotorTerminalVoltageV > 0;
  const pressureLive = evaluation.effectivePressureBar > 0;
  const capLive = evaluation.effectiveCapacitorV > 0;
  const anyLive =
    mccLive || secondaryLive || terminalLive || pressureLive || capLive || !evaluation.gravitySecured;

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
            'ISOLATED — COMPLETE LOCK/TAG & TEST-BEFORE-TOUCH',
            'TERISOLASI — LENGKAPI GEMBOK/LABEL & VERIFIKASI',
            '遮断済み — 施錠・タグ・無電圧検証を完了してください'
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
        ? `${evaluation.effectiveMotorTerminalVoltageV.toFixed(1)} V`
        : '--- V';

  const pressureAngleDeg =
    scenario.nominalPressureBar > 0
      ? -120 + (evaluation.effectivePressureBar / scenario.nominalPressureBar) * 240
      : -120;

  const selectorAngleMap: Record<SelectorMode, number> = {
    hand: -40,
    off: 0,
    auto: 40,
  };

  return (
    <svg
      viewBox="0 0 880 460"
      className="h-auto w-full select-none"
      role="img"
      aria-label={pick(
        'Interactive Industrial Plant LOTO Isolation Schematic',
        'Skema Interaktif Isolasi LOTO Peralatan Pabrik',
        'インタラクティブ LOTO プラント遮断模式図'
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
      <rect width="880" height="460" rx="20" fill="url(#loto-grid)" />

      {/* Top Status Bar */}
      <rect
        x="16"
        y="12"
        width="848"
        height="34"
        rx="10"
        fill={statusColor}
        fillOpacity="0.14"
        stroke={statusColor}
        strokeWidth="1.5"
      />
      <circle cx="34" cy="29" r="6" fill={statusColor}>
        {anyLive && (
          <animate attributeName="opacity" values="1;0.35;1" dur="1.1s" repeatCount="indefinite" />
        )}
      </circle>
      <text
        x="48"
        y="33"
        fontSize="11.5"
        fontWeight="700"
        fill={statusColor}
        fontFamily="ui-monospace, SFMono-Regular, monospace"
      >
        {statusLabel}
      </text>
      <text
        x="852"
        y="33"
        textAnchor="end"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        opacity="0.75"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
      >
        {evaluation.completedStepCount}/6 {pick('STEPS', 'LANGKAH', '段階')}
      </text>

      {/* ================= 1. LEFT: MAIN MCC / VFD PANEL ================= */}
      <g transform="translate(16, 58)">
        <rect
          x="0"
          y="0"
          width="216"
          height="324"
          rx="16"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
        <text x="12" y="22" fontSize="10.5" fontWeight="700" fill="currentColor" opacity="0.9">
          {pick('MAIN MCC / VFD PANEL', 'PANEL MCC / VFD', '主 MCC / VFD 盤')}
        </text>
        <text
          x="204"
          y="22"
          textAnchor="end"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          fill={mccLive ? '#ef4444' : '#10b981'}
          fontWeight="700"
        >
          {mccLive ? `${scenario.nominalVoltageV}V ON` : '0V OFF'}
        </text>

        {/* Clickable Rotary Disconnect Handle */}
        <g
          transform="translate(14, 34)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={pick('Toggle Main MCC Rotary Disconnect', 'Ubah Pemutus Utama MCC', '主MCC断路器を切替')}
          onClick={() => onAction('toggle-mcc-disconnect')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-mcc-disconnect'))}
        >
          <rect
            x="0"
            y="0"
            width="188"
            height="72"
            rx="12"
            fill={state.mccDisconnectOpen ? '#10b981' : '#ef4444'}
            fillOpacity="0.1"
            stroke={state.mccDisconnectOpen ? '#10b981' : '#ef4444'}
            strokeWidth="1.5"
          />
          <circle cx="38" cy="36" r="22" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.3" />
          <g transform={`translate(38, 36) rotate(${state.mccDisconnectOpen ? -45 : 45})`}>
            <rect x="-5" y="-18" width="10" height="36" rx="3" fill={state.mccDisconnectOpen ? '#10b981' : '#ef4444'} />
          </g>
          <text x="72" y="26" fontSize="10" fontWeight="700" fill="currentColor">
            {pick('ROTARY DISCONNECT', 'SAKELAR PUTAR MCC', '回転式主断路器')}
          </text>
          <text
            x="72"
            y="43"
            fontSize="12"
            fontWeight="800"
            fontFamily="ui-monospace, monospace"
            fill={state.mccDisconnectOpen ? '#10b981' : '#ef4444'}
          >
            {state.mccDisconnectOpen ? 'OFF (OPEN)' : 'ON (LIVE)'}
          </text>
          <text x="72" y="59" fontSize="8.5" fill="currentColor" opacity="0.65">
            {pick('Click handle to switch', 'Klik tuas untuk putar', 'クリックで操作')}
          </text>
        </g>

        {/* Clickable MCC Padlock & Danger Tag */}
        <g
          transform="translate(14, 114)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={pick('Toggle MCC Padlock', 'Pasang/Lepas Gembok MCC', 'MCC南京錠を切替')}
          onClick={() => onAction('toggle-mcc-lock')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-mcc-lock'))}
        >
          <rect
            x="0"
            y="0"
            width="90"
            height="48"
            rx="10"
            fill={state.mccLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
            fillOpacity="0.16"
            stroke={state.mccLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
            strokeWidth="1.5"
          />
          <path
            d="M 16 22 v -6 a 6 6 0 0 1 12 0 v 6"
            fill="none"
            stroke={state.mccLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#94a3b8'}
            strokeWidth="2.2"
          />
          <rect
            x="13"
            y="22"
            width="18"
            height="14"
            rx="3"
            fill={state.mccLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#94a3b8'}
          />
          <text x="37" y="21" fontSize="8.5" fontWeight="700" fill="currentColor">
            {pick('PADLOCK', 'GEMBOK', '南京錠')}
          </text>
          <text
            x="37"
            y="35"
            fontSize="9"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            fill={state.mccLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#ef4444'}
          >
            {state.mccLocked && state.faultId !== 'tag-only-no-lock' ? 'LOCKED' : 'OPEN'}
          </text>
        </g>

        <g
          transform="translate(112, 114)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={pick('Toggle MCC Danger Tag', 'Pasang/Lepas Label Bahaya MCC', 'MCC危険タグを切替')}
          onClick={() => onAction('toggle-mcc-tag')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-mcc-tag'))}
        >
          <rect
            x="0"
            y="0"
            width="90"
            height="48"
            rx="10"
            fill={state.mccTagged ? '#ef4444' : '#64748b'}
            fillOpacity="0.14"
            stroke={state.mccTagged ? '#ef4444' : '#64748b'}
            strokeWidth="1.5"
          />
          <rect x="10" y="9" width="16" height="28" rx="2" fill={state.mccTagged ? '#ef4444' : '#94a3b8'} />
          <rect x="12" y="13" width="12" height="6" fill="#ffffff" />
          <text x="32" y="21" fontSize="8.5" fontWeight="700" fill="currentColor">
            {pick('DANGER', 'LABEL', '危険タグ')}
          </text>
          <text
            x="32"
            y="35"
            fontSize="9"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            fill={state.mccTagged ? '#ef4444' : '#64748b'}
          >
            {state.mccTagged ? 'TAGGED' : 'NONE'}
          </text>
        </g>

        {/* VFD DC Bus Capacitor Discharge */}
        {scenario.hasCapacitor && (
          <g
            transform="translate(14, 172)"
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={pick('Discharge VFD DC Bus Capacitor', 'Kosongkan Kapasitor Bus DC VFD', 'VFD DCバスコンデンサ放電')}
            onClick={() => onAction('discharge-capacitor')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('discharge-capacitor'))}
          >
            <rect
              x="0"
              y="0"
              width="188"
              height="62"
              rx="10"
              fill={capLive ? '#f59e0b' : '#10b981'}
              fillOpacity="0.14"
              stroke={capLive ? '#f59e0b' : '#10b981'}
              strokeWidth="1.5"
            />
            <text x="10" y="18" fontSize="9.5" fontWeight="700" fill="currentColor">
              {pick('VFD DC BUS CAPACITOR', 'KAPASITOR BUS DC VFD', 'VFD DC バスコンデンサ')}
            </text>
            <text
              x="10"
              y="36"
              fontSize="12"
              fontWeight="800"
              fontFamily="ui-monospace, monospace"
              fill={capLive ? '#ef4444' : '#10b981'}
            >
              {evaluation.effectiveCapacitorV} V DC
            </text>
            <text x="10" y="52" fontSize="8.5" fill="currentColor" opacity="0.75">
              {capLive
                ? pick('Click to bleed 540V → 0V (5τ)', 'Klik untuk kuras 540V → 0V', 'クリックで放電 540V→0V')
                : pick('Discharged Safe (0 V DC)', 'Kosong & Aman (0 V DC)', '放電完了 (0 V DC)')}
            </text>
          </g>
        )}

        {/* Secondary 120V Backfeed / Dual Feed */}
        {(scenario.hasDualFeed || state.faultId === 'dual-backfeed') && (
          <g
            transform={`translate(14, ${scenario.hasCapacitor ? 244 : 172})`}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={pick('Toggle Secondary 120V Disconnect', 'Ubah Pemutus Sekunder 120V', '補助120V断路器を切替')}
            onClick={() => onAction('toggle-secondary-disconnect')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-secondary-disconnect'))}
          >
            <rect
              x="0"
              y="0"
              width="188"
              height="64"
              rx="10"
              fill={secondaryLive ? '#ef4444' : '#10b981'}
              fillOpacity="0.14"
              stroke={secondaryLive ? '#ef4444' : '#10b981'}
              strokeWidth="1.5"
            />
            <text x="10" y="18" fontSize="9.5" fontWeight="700" fill="currentColor">
              {pick('2ND / BACKFEED (120 V)', 'SUMBER KE-2 (120 V)', '補助電源・逆潮流 (120 V)')}
            </text>
            <text
              x="10"
              y="36"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="ui-monospace, monospace"
              fill={secondaryLive ? '#ef4444' : '#10b981'}
            >
              {secondaryLive
                ? '120 V ENERGIZED'
                : state.secondaryLocked && state.secondaryTagged
                  ? 'OFF + LOCKED ✓'
                  : 'OFF — ADD LOTO'}
            </text>
            <text x="10" y="52" fontSize="8.5" fill="currentColor" opacity="0.7">
              {pick('Click to open 120V feed', 'Klik untuk buka suplai 120V', 'クリックで120V遮断')}
            </text>
          </g>
        )}
      </g>

      {/* Power Line: MCC -> Field Isolator */}
      <path
        d="M 232 145 L 266 145"
        stroke={mccLive ? 'url(#live-glow)' : '#64748b'}
        strokeWidth={mccLive ? '4' : '2.5'}
        strokeDasharray={mccLive ? '8 4' : '5 5'}
      >
        {mccLive && (
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.7s" repeatCount="indefinite" />
        )}
      </path>

      {/* ================= 2. CENTER-TOP: LOCAL CONTROL STATION (LCS) ================= */}
      <g transform="translate(266, 58)">
        <rect
          x="0"
          y="0"
          width="344"
          height="146"
          rx="16"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
        <text x="14" y="22" fontSize="10.5" fontWeight="700" fill="currentColor" opacity="0.9">
          {pick(
            'LOCAL CONTROL STATION (LCS AT MOTOR)',
            'STASIUN KONTROL LOKAL (SAKELAR SELEKTOR MOTOR)',
            '現場操作盤（モータ近傍 LCS）'
          )}
        </text>

        {/* 3-Position Selector Switch HAND / OFF / AUTO */}
        <g transform="translate(16, 36)">
          <rect
            x="0"
            y="0"
            width="136"
            height="94"
            rx="12"
            fill="currentColor"
            fillOpacity="0.05"
            stroke={state.selectorMode === 'off' ? '#10b981' : '#f59e0b'}
            strokeWidth="1.4"
          />
          <text x="68" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">
            {pick('SELECTOR SWITCH', 'SAKELAR SELEKTOR', '切替スイッチ')}
          </text>

          {/* Clickable HAND / OFF / AUTO labels */}
          <g
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onAction('set-selector-hand')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('set-selector-hand'))}
          >
            <rect
              x="8"
              y="22"
              width="38"
              height="20"
              rx="6"
              fill={state.selectorMode === 'hand' ? '#f59e0b' : 'transparent'}
              fillOpacity="0.25"
            />
            <text
              x="27"
              y="35"
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill={state.selectorMode === 'hand' ? '#f59e0b' : 'currentColor'}
            >
              HAND
            </text>
          </g>

          <g
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onAction('set-selector-off')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('set-selector-off'))}
          >
            <rect
              x="49"
              y="22"
              width="38"
              height="20"
              rx="6"
              fill={state.selectorMode === 'off' ? '#10b981' : 'transparent'}
              fillOpacity="0.25"
            />
            <text
              x="68"
              y="35"
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill={state.selectorMode === 'off' ? '#10b981' : 'currentColor'}
            >
              OFF
            </text>
          </g>

          <g
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onAction('set-selector-auto')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('set-selector-auto'))}
          >
            <rect
              x="90"
              y="22"
              width="38"
              height="20"
              rx="6"
              fill={state.selectorMode === 'auto' ? '#ef4444' : 'transparent'}
              fillOpacity="0.25"
            />
            <text
              x="109"
              y="35"
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill={state.selectorMode === 'auto' ? '#ef4444' : 'currentColor'}
            >
              AUTO
            </text>
          </g>

          {/* Rotary Knob */}
          <circle cx="68" cy="66" r="18" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.35" />
          <g transform={`translate(68, 66) rotate(${selectorAngleMap[state.selectorMode]})`}>
            <rect
              x="-3"
              y="-15"
              width="6"
              height="24"
              rx="2"
              fill={state.selectorMode === 'off' ? '#10b981' : '#ef4444'}
            />
          </g>
        </g>

        {/* STOP & START (Try-Out) Pushbuttons */}
        <g transform="translate(164, 36)">
          <g
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={pick('Press STOP Pushbutton', 'Tekan Tombol STOP', '停止ボタンを押す')}
            onClick={() => onAction('press-stop')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('press-stop'))}
          >
            <rect
              x="0"
              y="0"
              width="78"
              height="44"
              rx="10"
              fill={state.stopPressed ? '#10b981' : '#ef4444'}
              fillOpacity="0.14"
              stroke={state.stopPressed ? '#10b981' : '#ef4444'}
              strokeWidth="1.4"
            />
            <circle cx="22" cy="22" r="11" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <text x="40" y="20" fontSize="9.5" fontWeight="800" fill="currentColor">
              STOP
            </text>
            <text x="40" y="33" fontSize="8.5" fontWeight="700" fill={state.stopPressed ? '#10b981' : '#ef4444'}>
              {state.stopPressed ? 'PRESSED ✓' : 'PRESS'}
            </text>
          </g>

          <g
            transform="translate(0, 50)"
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={pick('Press START Try-Out Pushbutton', 'Tekan Tombol Start Try-Out', '起動試行(Try-Out)ボタンを押す')}
            onClick={() => onAction('perform-tryout')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('perform-tryout'))}
          >
            <rect
              x="0"
              y="0"
              width="78"
              height="44"
              rx="10"
              fill={state.tryOutAttempted ? '#10b981' : '#3b82f6'}
              fillOpacity="0.14"
              stroke={state.tryOutAttempted ? '#10b981' : '#3b82f6'}
              strokeWidth="1.4"
            />
            <circle cx="22" cy="22" r="11" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <text x="38" y="19" fontSize="8.5" fontWeight="800" fill="currentColor">
              START
            </text>
            <text x="38" y="32" fontSize="8" fontWeight="700" fill={state.tryOutAttempted ? '#10b981' : '#3b82f6'}>
              {state.tryOutAttempted ? 'TRY-OUT ✓' : 'TRY-OUT'}
            </text>
          </g>
        </g>

        {/* LCS Padlock & Tag */}
        <g
          transform="translate(252, 36)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onAction('toggle-lcs-lock')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-lcs-lock'))}
        >
          <rect
            x="0"
            y="0"
            width="78"
            height="44"
            rx="10"
            fill={state.localSelectorLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
            fillOpacity="0.16"
            stroke={state.localSelectorLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
            strokeWidth="1.4"
          />
          <text x="39" y="18" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
            {pick('LCS LOCK', 'GEMBOK LCS', 'LCS施錠')}
          </text>
          <text
            x="39"
            y="34"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            fill={state.localSelectorLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#ef4444'}
          >
            {state.localSelectorLocked && state.faultId !== 'tag-only-no-lock' ? 'LOCKED' : 'NONE'}
          </text>
        </g>

        <g
          transform="translate(252, 86)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onAction('toggle-lcs-tag')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-lcs-tag'))}
        >
          <rect
            x="0"
            y="0"
            width="78"
            height="44"
            rx="10"
            fill={state.localSelectorTagged ? '#ef4444' : '#64748b'}
            fillOpacity="0.14"
            stroke={state.localSelectorTagged ? '#ef4444' : '#64748b'}
            strokeWidth="1.4"
          />
          <text x="39" y="18" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
            {pick('LCS TAG', 'LABEL LCS', 'LCSタグ')}
          </text>
          <text
            x="39"
            y="34"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            fill={state.localSelectorTagged ? '#ef4444' : '#64748b'}
          >
            {state.localSelectorTagged ? 'TAGGED' : 'NONE'}
          </text>
        </g>
      </g>

      {/* ================= 3. CENTER-BOTTOM: MOTOR FIELD ISOLATOR + MOTOR + PROCESS ================= */}
      <g transform="translate(266, 214)">
        <rect
          x="0"
          y="0"
          width="344"
          height="168"
          rx="16"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
        <text x="14" y="22" fontSize="10.5" fontWeight="700" fill="currentColor" opacity="0.9">
          {pick(
            'FIELD MOTOR ISOLATOR & MACHINE',
            'ISOLATOR LOKAL MOTOR & PERALATAN',
            'モータ現場断路器 & 設備本体'
          )}
        </text>

        {/* Local Motor Disconnect Switch */}
        <g
          transform="translate(14, 34)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onAction('toggle-motor-isolator')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-motor-isolator'))}
        >
          <rect
            x="0"
            y="0"
            width="102"
            height="68"
            rx="10"
            fill={state.motorIsolatorOpen ? '#10b981' : '#ef4444'}
            fillOpacity="0.12"
            stroke={state.motorIsolatorOpen ? '#10b981' : '#ef4444'}
            strokeWidth="1.4"
          />
          <text x="51" y="17" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
            {pick('MOTOR ISOLATOR', 'ISOLATOR MOTOR', '現場断路器')}
          </text>
          <text
            x="51"
            y="38"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="800"
            fontFamily="ui-monospace, monospace"
            fill={state.motorIsolatorOpen ? '#10b981' : '#ef4444'}
          >
            {state.motorIsolatorOpen ? 'OFF' : 'ON'}
          </text>
          <text x="51" y="56" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">
            {pick('Click to switch', 'Klik ubah', 'クリック操作')}
          </text>
        </g>

        {/* Motor Isolator Lock & Tag */}
        <g
          transform="translate(14, 108)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onAction('toggle-motor-isolator-lock')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-motor-isolator-lock'))}
        >
          <rect
            x="0"
            y="0"
            width="49"
            height="44"
            rx="8"
            fill={state.motorIsolatorLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
            fillOpacity="0.16"
            stroke={state.motorIsolatorLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#64748b'}
          />
          <text x="24.5" y="18" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">
            LOCK
          </text>
          <text
            x="24.5"
            y="33"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            fill={state.motorIsolatorLocked && state.faultId !== 'tag-only-no-lock' ? '#10b981' : '#ef4444'}
          >
            {state.motorIsolatorLocked && state.faultId !== 'tag-only-no-lock' ? 'YES' : 'NO'}
          </text>
        </g>

        <g
          transform="translate(67, 108)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onAction('toggle-motor-isolator-tag')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-motor-isolator-tag'))}
        >
          <rect
            x="0"
            y="0"
            width="49"
            height="44"
            rx="8"
            fill={state.motorIsolatorTagged ? '#ef4444' : '#64748b'}
            fillOpacity="0.14"
            stroke={state.motorIsolatorTagged ? '#ef4444' : '#64748b'}
          />
          <text x="24.5" y="18" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">
            TAG
          </text>
          <text
            x="24.5"
            y="33"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            fill={state.motorIsolatorTagged ? '#ef4444' : '#64748b'}
          >
            {state.motorIsolatorTagged ? 'YES' : 'NO'}
          </text>
        </g>

        {/* 3-Phase Motor & Terminal Box */}
        <g transform="translate(128, 34)">
          <rect
            x="0"
            y="0"
            width="104"
            height="72"
            rx="12"
            fill={terminalLive ? '#ef4444' : '#10b981'}
            fillOpacity="0.1"
            stroke={terminalLive ? '#ef4444' : '#10b981'}
            strokeWidth="1.5"
          />
          <text x="52" y="20" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="currentColor">
            {pick('3-PH MOTOR', 'MOTOR 3-FASA', '三相モータ')}
          </text>
          <text
            x="52"
            y="40"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fontFamily="ui-monospace, monospace"
            fill={evaluation.motorRunning ? '#ef4444' : terminalLive ? '#f59e0b' : '#10b981'}
          >
            {evaluation.motorRunning
              ? '1480 RPM'
              : terminalLive
                ? '0 RPM (LIVE)'
                : '0 RPM / 0V'}
          </text>
          <text x="52" y="58" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">
            {scenario.name[language].slice(0, 18)}
          </text>

          {/* Clickable Terminal Box for Probe */}
          <g
            transform="translate(0, 78)"
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onAction('advance-ldl')}
            onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('advance-ldl'))}
          >
            <rect
              x="0"
              y="0"
              width="104"
              height="40"
              rx="8"
              fill={state.ldlStage === 'verified' ? '#10b981' : '#3b82f6'}
              fillOpacity="0.14"
              stroke={state.ldlStage === 'verified' ? '#10b981' : '#3b82f6'}
              strokeWidth="1.3"
            />
            <text x="52" y="16" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
              {pick('TERMINAL BOX', 'KOTAK TERMINAL', 'モータ端子箱')}
            </text>
            <text
              x="52"
              y="31"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill={state.ldlStage === 'verified' ? '#10b981' : '#3b82f6'}
            >
              {state.ldlStage === 'verified' ? '0.0 V PROBED ✓' : pick('Click to Probe', 'Klik Uji Probe', 'クリック検電')}
            </text>
          </g>
        </g>

        {/* Right Side of Field Box: Process Valves / Pressure Gauge / Gravity Block */}
        {scenario.hasPressureSystem ? (
          <g transform="translate(242, 34)">
            <circle
              cx="44"
              cy="30"
              r="25"
              fill="currentColor"
              fillOpacity="0.06"
              stroke={pressureLive ? '#ef4444' : '#10b981'}
              strokeWidth="2"
            />
            <g transform={`translate(44, 30) rotate(${pressureAngleDeg})`}>
              <line
                x1="0"
                y1="3"
                x2="0"
                y2="-18"
                stroke={pressureLive ? '#ef4444' : '#10b981'}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
            <circle cx="44" cy="30" r="3" fill="currentColor" />
            <text
              x="44"
              y="66"
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="800"
              fontFamily="ui-monospace, monospace"
              fill={pressureLive ? '#ef4444' : '#10b981'}
            >
              {evaluation.effectivePressureBar.toFixed(1)} bar
            </text>

            {/* Isolation Valve */}
            <g
              transform="translate(0, 74)"
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onAction('toggle-process-valve')}
              onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-process-valve'))}
            >
              <rect
                x="0"
                y="0"
                width="42"
                height="24"
                rx="6"
                fill={state.processValveClosed ? '#10b981' : '#ef4444'}
                fillOpacity="0.16"
                stroke={state.processValveClosed ? '#10b981' : '#ef4444'}
              />
              <text x="21" y="15" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor">
                {state.processValveClosed ? 'SHUT' : 'OPEN'}
              </text>
            </g>

            {/* Bleed Valve */}
            <g
              transform="translate(46, 74)"
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onAction('toggle-bleed-valve')}
              onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-bleed-valve'))}
            >
              <rect
                x="0"
                y="0"
                width="42"
                height="24"
                rx="6"
                fill={state.bleedValveOpen ? '#10b981' : '#64748b'}
                fillOpacity="0.16"
                stroke={state.bleedValveOpen ? '#10b981' : '#64748b'}
              />
              <text x="21" y="15" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor">
                {state.bleedValveOpen ? 'BLEED' : 'VENT'}
              </text>
            </g>

            {/* Gravity Block if Hydraulic Press */}
            {scenario.hasGravityBlock && (
              <g
                transform="translate(0, 102)"
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => onAction('toggle-gravity-block')}
                onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('toggle-gravity-block'))}
              >
                <rect
                  x="0"
                  y="0"
                  width="88"
                  height="22"
                  rx="6"
                  fill={state.gravityBlockInstalled ? '#10b981' : '#ef4444'}
                  fillOpacity="0.16"
                  stroke={state.gravityBlockInstalled ? '#10b981' : '#ef4444'}
                />
                <text x="44" y="14" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor">
                  {state.gravityBlockInstalled ? 'RAM BLOCK IN ✓' : 'INSERT RAM BLOCK'}
                </text>
              </g>
            )}
          </g>
        ) : (
          <g transform="translate(242, 34)">
            <rect
              x="0"
              y="0"
              width="88"
              height="118"
              rx="10"
              fill="currentColor"
              fillOpacity="0.03"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeDasharray="4 4"
            />
            <text x="44" y="48" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor" opacity="0.7">
              {pick('DIRECT COUPLED', 'KOPLING LANGSUNG', '直結駆動')}
            </text>
            <text x="44" y="66" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.55">
              {pick('0.0 bar (No Fluid)', '0.0 bar (Tanpa Fluida)', '流体圧力なし')}
            </text>
          </g>
        )}
      </g>

      {/* ================= 4. RIGHT: MULTIMETER LIVE-DEAD-LIVE & TRY-OUT ================= */}
      <g transform="translate(624, 58)">
        <rect
          x="0"
          y="0"
          width="240"
          height="324"
          rx="16"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
        <text x="14" y="22" fontSize="10.5" fontWeight="700" fill="currentColor" opacity="0.9">
          {pick('TEST BEFORE TOUCH', 'VERIFIKASI TEGANGAN NOL', '無電圧検証 (LDL)')}
        </text>

        {/* Handheld Multimeter */}
        <g
          transform="translate(20, 34)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onAction('advance-ldl')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('advance-ldl'))}
        >
          <rect
            x="0"
            y="0"
            width="200"
            height="196"
            rx="16"
            fill="#f59e0b"
            fillOpacity="0.16"
            stroke="#f59e0b"
            strokeWidth="1.8"
          />
          <rect x="14" y="14" width="172" height="58" rx="8" fill="#0f172a" />
          <text
            x="100"
            y="42"
            textAnchor="middle"
            fontSize="20"
            fontFamily="ui-monospace, monospace"
            fontWeight="800"
            fill={
              state.ldlStage === 'verified' ||
              (state.ldlStage === 'dead-test' && !terminalLive)
                ? '#10b981'
                : '#f59e0b'
            }
          >
            {ldlDisplayVoltage}
          </text>
          <text
            x="100"
            y="62"
            textAnchor="middle"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fill="#94a3b8"
          >
            CAT IV 600V • {state.ldlStage.toUpperCase()}
          </text>

          {/* 3-Step LDL Indicator */}
          {(
            [
              { key: 'live-1', label: '1. LIVE REF (480V)' },
              { key: 'dead-test', label: '2. DEAD BOX (0.0V)' },
              { key: 'live-2', label: '3. RE-TEST LIVE' },
            ] as const
          ).map((row, idx) => {
            const stageOrder = ['idle', 'live-1', 'dead-test', 'live-2', 'verified'];
            const active = stageOrder.indexOf(state.ldlStage) >= idx + 1;
            return (
              <g key={row.key} transform={`translate(14, ${82 + idx * 28})`}>
                <rect
                  x="0"
                  y="0"
                  width="172"
                  height="22"
                  rx="6"
                  fill={active ? '#10b981' : '#64748b'}
                  fillOpacity={active ? 0.22 : 0.12}
                />
                <text
                  x="10"
                  y="14.5"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="ui-monospace, monospace"
                  fill={active ? '#10b981' : 'currentColor'}
                >
                  {active ? '✓ ' : '○ '}
                  {row.label}
                </text>
              </g>
            );
          })}

          <text x="100" y="182" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
            {pick('Click meter to advance LDL', 'Klik meter untuk lanjut LDL', 'クリックで検電ステップ進行')}
          </text>
        </g>

        {/* Try-Out Verification Box */}
        <g
          transform="translate(20, 242)"
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => onAction('perform-tryout')}
          onKeyDown={(e) => handleSvgKeyDown(e, () => onAction('perform-tryout'))}
        >
          <rect
            x="0"
            y="0"
            width="200"
            height="66"
            rx="12"
            fill={evaluation.isTryOutComplete ? '#10b981' : '#3b82f6'}
            fillOpacity="0.14"
            stroke={evaluation.isTryOutComplete ? '#10b981' : '#3b82f6'}
            strokeWidth="1.5"
          />
          <text x="100" y="22" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">
            {pick('START TRY-OUT CHECK', 'UJI COBA START (TRY-OUT)', '起動試行（Try-Out）確認')}
          </text>
          <text
            x="100"
            y="42"
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fontFamily="ui-monospace, monospace"
            fill={evaluation.isTryOutComplete ? '#10b981' : '#f59e0b'}
          >
            {evaluation.isTryOutComplete
              ? 'ZERO START PASSED ✓'
              : pick('CLICK TO TEST START', 'KLIK UJI START', 'クリックで起動確認')}
          </text>
        </g>
      </g>

      {/* Bottom Legend Bar */}
      <g transform="translate(16, 396)">
        <rect
          x="0"
          y="0"
          width="848"
          height="50"
          rx="14"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.14"
        />
        <text x="16" y="21" fontSize="10" fontWeight="700" fill="currentColor">
          {pick(
            'DIRECT INTERACTION: Click any switch, padlock, danger tag, valve, multimeter, or Start/Stop button directly on the schematic.',
            'INTERAKSI LANGSUNG: Klik langsung sakelar, gembok LOTO, label bahaya, katup, multimeter, atau tombol Start/Stop pada skema.',
            '直接操作：図上の断路器・南京錠・危険タグ・バルブ・検電器・起動/停止ボタンを直接クリックして操作できます。'
          )}
        </text>
        <text x="16" y="38" fontSize="9.5" fill="currentColor" opacity="0.75">
          {pick(
            'OSHA 1910.147 Rule: Lockout Padlock + Danger Tag required on all isolators • Cannot lock an ON switch • Test-Before-Touch before servicing.',
            'Aturan OSHA 1910.147: Gembok LOTO + Label Bahaya wajib di setiap isolator • Tidak bisa mengunci sakelar ON • Wajib Test-Before-Touch.',
            'OSHA 1910.147 規定：全遮断器に南京錠＋危険タグ必須 • ON状態の施錠不可 • 作業前の検電・起動試行必須。'
          )}
        </text>
      </g>
    </svg>
  );
}
