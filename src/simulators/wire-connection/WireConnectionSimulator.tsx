/* oxlint-disable react/only-export-components */
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  Flame,
  Gauge,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { WireConnectionSvg } from './WireConnectionSvg';
import {
  applyFaultPreset,
  computeWireState,
  DEFAULT_WIRE_PARAMS,
  getRecommendedStripRange,
  getRecommendedTorqueRange,
  type TerminationMethodId,
  type TerminationStationId,
  type WireFaultId,
  type WireGaugeMm2,
  type WireIssueCode,
  type WireParams,
  WIRE_GAUGES,
} from './wireConnectionPhysics';

export { wireConnectionMeta } from './wireConnectionMeta';

export function WireConnectionSimulator() {
  const { pick } = useLanguage();
  const [params, setParams] = useState<WireParams>(DEFAULT_WIRE_PARAMS);
  const [pullTestActive, setPullTestActive] = useState(false);

  const computed = useMemo(() => computeWireState(params), [params]);

  useEffect(() => {
    if (!pullTestActive) return;
    const timer = window.setTimeout(() => setPullTestActive(false), 2000);
    return () => window.clearTimeout(timer);
  }, [pullTestActive]);

  const updateParam = <K extends keyof WireParams>(
    key: K,
    value: WireParams[K]
  ) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
      faultMode: key === 'faultMode' ? (value as WireFaultId) : 'none',
    }));
  };

  const handleStationChange = (station: TerminationStationId) => {
    const recTorque = getRecommendedTorqueRange(station, params.gaugeMm2);
    const recStrip = getRecommendedStripRange(
      station,
      params.method,
      params.gaugeMm2
    );
    setParams((prev) => ({
      ...prev,
      station,
      method:
        station === 'wire-splice' && prev.method === 'bare-stranded'
          ? 'wago-lever'
          : prev.method,
      torqueNm: Number(((recTorque[0] + recTorque[1]) / 2).toFixed(1)),
      stripLengthMm: Math.round((recStrip[0] + recStrip[1]) / 2),
      faultMode: 'none',
    }));
  };

  const handleFaultSelect = (fault: WireFaultId) => {
    setParams((prev) => applyFaultPreset(fault, prev));
  };

  const handleReset = () => {
    setParams(DEFAULT_WIRE_PARAMS);
    setPullTestActive(false);
  };

  const stations: { id: TerminationStationId; label: string }[] = [
    {
      id: 'terminal-block',
      label: pick('Terminal Block', 'Blok Terminal DIN', 'DIN端子台'),
    },
    {
      id: 'motor-lug',
      label: pick('Motor Stud Lug', 'Sepatu Kabel Motor', 'モータ端子ラグ'),
    },
    {
      id: 'wire-splice',
      label: pick('Wire Splice', 'Sambungan Kabel', '電線スプライス'),
    },
    {
      id: 'grounding-pe',
      label: pick('Grounding (PE)', 'Pembumian (PE)', '保護接地 (PE)'),
    },
  ];

  const methods: { id: TerminationMethodId; label: string }[] = (
    [
      {
        id: 'crimped-ferrule-lug' as const,
        label:
          params.station === 'motor-lug' || params.station === 'grounding-pe'
            ? pick('Ring Lug (Crimped)', 'Sepatu Kabel (Lug)', '丸形圧着端子')
            : params.station === 'wire-splice'
              ? pick('Butt Crimp Splice', 'Selongsong Crimp', '圧着スリーブ')
              : pick('Bootlace Ferrule', 'Skun Ferrule', 'フェルール (棒端子)'),
        stations: ['terminal-block', 'motor-lug', 'wire-splice', 'grounding-pe'],
      },
      {
        id: 'wago-lever' as const,
        label: pick('Wago Lever-Nut', 'Konektor Tuas Wago', 'レバーコネクタ'),
        stations: ['wire-splice'],
      },
      {
        id: 'bare-stranded' as const,
        label: pick('Bare Stranded', 'Serabut Telanjang', '裸より線'),
        stations: ['terminal-block', 'motor-lug', 'grounding-pe'],
      },
      {
        id: 'solder-tinned' as const,
        label: pick('Solder-Tinned', 'Lapis Timah Solder', '予備はんだ'),
        stations: ['terminal-block', 'motor-lug', 'wire-splice'],
      },
      {
        id: 'twisted-tape' as const,
        label: pick('Twisted + PVC Tape', 'Puntir + Isolasi PVC', 'ねじり+テープ'),
        stations: ['wire-splice'],
      },
    ] satisfies {
      id: TerminationMethodId;
      label: string;
      stations: TerminationStationId[];
    }[]
  ).filter((m) => m.stations.includes(params.station));

  const faults: { id: WireFaultId; label: string }[] = [
    {
      id: 'none',
      label: pick('Normal (Healthy)', 'Normal (Sehat)', '正常（健全）'),
    },
    {
      id: 'loose-torque',
      label: pick('Loose Torque', 'Torsi Kendur', 'トルク不足'),
    },
    {
      id: 'insulation-pinch',
      label: pick('Insulation Pinch', 'Isolasi PVC Terjepit', '被覆噛み込み'),
    },
    {
      id: 'tinned-creep',
      label: pick('Tinned Wire Creep', 'Mulur Timah Solder', 'はんだクリープ'),
    },
    {
      id: 'wrong-washer-order',
      label: pick('Wrong Washer Stack', 'Urutan Ring Salah', 'ワッシャ順序誤り'),
    },
    {
      id: 'oversized-strip',
      label: pick('Oversized Strip', 'Kupasan Berlebih', '被覆剥き過大'),
    },
  ];

  const formatIssue = (issue: WireIssueCode): string => {
    switch (issue) {
      case 'loose-torque':
        return pick(
          `Low tightening torque (recommended ${computed.recommendedTorqueRange[0]}–${computed.recommendedTorqueRange[1]} N·m) — high R_c and micro-arcing.`,
          `Torsi pengencangan terlalu rendah (rekomendasi ${computed.recommendedTorqueRange[0]}–${computed.recommendedTorqueRange[1]} N·m) — R_c tinggi & percikan mikro.`,
          `締付トルク不足（推奨 ${computed.recommendedTorqueRange[0]}〜${computed.recommendedTorqueRange[1]} N·m）— 接触抵抗増大・微小アーク発生。`
        );
      case 'over-torque':
        return pick(
          'Excessive torque risks crushing copper strands or stripping threads.',
          'Torsi berlebih berisiko merusak serabut tembaga atau merusak ulir.',
          '過トルクにより銅素線の圧壊やねじ山破損の恐れがあります。'
        );
      case 'insulation-pinch':
        return pick(
          'PVC insulation pinched under clamp! Strip length too short — open/intermittent joint.',
          'Isolasi PVC terjepit di bawah penjepit! Panjang kupas terlalu pendek.',
          'PVC被覆がクランプに噛み込んでいます！被覆剥き長さが短すぎます。'
        );
      case 'undersized-strip':
        return pick(
          `Strip length slightly short (target ${computed.recommendedStripRange[0]}–${computed.recommendedStripRange[1]} mm).`,
          `Panjang kupas agak pendek (target ${computed.recommendedStripRange[0]}–${computed.recommendedStripRange[1]} mm).`,
          `被覆剥き長さがやや不足しています（推奨 ${computed.recommendedStripRange[0]}〜${computed.recommendedStripRange[1]} mm）。`
        );
      case 'oversized-strip':
        return pick(
          'Exposed bare copper outside terminal housing — shock & short-circuit hazard!',
          'Tembaga telanjang mencuat di luar rumah terminal — bahaya sengatan listrik & hubung singkat!',
          '端子外部へ裸銅線が露出しています — 感電・短絡フラッシュオーバーの危険！'
        );
      case 'tinned-creep':
        return pick(
          'Solder-tinned wire under screw pressure undergoes cold-flow creep and loosens over time.',
          'Ujung kabel berlapis timah solder mengalami mulur dingin (creep) dan mengendur seiring waktu.',
          '予備はんだ電線はねじ圧力下でクリープ変形し、経時的に緩みが発生します。'
        );
      case 'wrong-washer':
        return pick(
          'Wrong washer order! Place Ring Lug directly on busbar, then Flat Washer, Lock Washer, and Nut.',
          'Urutan ring salah! Pasang Sepatu Kabel langsung di pelat, lalu Ring Datar, Ring Per, dan Mur.',
          'ワッシャ順序が誤っています！丸形端子→平ワッシャ→ばね座金→ナットの順に組み付けてください。'
        );
      case 'paint-insulation':
        return pick(
          'Painted chassis blocks PE continuity! Scrape paint to bare metal before torquing.',
          'Lapisan cat menghalangi kontinuitas Pembumian (PE)! Kupas cat hingga logam bersih.',
          '塗膜がPE導通を阻害しています！締付前に塗装を剥離して地金金属を露出させてください。'
        );
      case 'emc-unbonded':
        return pick(
          'EMC shield not bonded 360° to PE — high-frequency VFD noise may couple onto cabinet.',
          'Perisai EMC belum terikat 360° ke Pembumian (PE) — berisiko menimbulkan derau frekuensi tinggi.',
          'EMCシールドがPEに360°接地されていません — 高周波ノイズ漏洩の恐れがあります。'
        );
      case 'twisted-tape-prohibited':
        return pick(
          'Twisted + PVC tape splices violate industrial panel standards (high R_c & weak pull-out).',
          'Sambungan puntir + isolasi PVC melanggar standar panel industri (R_c tinggi & kuat tarik lemah).',
          'ねじり＋ビニールテープ接続は産業用制御盤規格に不適合です（高抵抗・引張不良）。'
        );
      case 'wago-overcurrent':
        return pick(
          'Load current exceeds 32 A Wago lever-nut rating!',
          'Arus beban melampaui batas nominal konektor tuas Wago (32 A)!',
          '負荷電流がレバーコネクタ定格（32 A）を超過しています！'
        );
      case 'overcurrent':
        return pick(
          `Load current (${params.loadCurrentA} A) exceeds ${params.gaugeMm2} mm² ampacity (${computed.maxAmpacityA} A).`,
          `Arus beban (${params.loadCurrentA} A) melampaui kapasitas hantar arus kabel ${params.gaugeMm2} mm² (${computed.maxAmpacityA} A).`,
          `負荷電流（${params.loadCurrentA} A）が ${params.gaugeMm2} mm² 電線の許容電流（${computed.maxAmpacityA} A）を超えています。`
        );
      case 'pull-out-fail':
        return pick(
          `Pull-out retention (${computed.pullOutForceN} N) below IEC 60999-1 minimum (${computed.minPullOutForceN} N).`,
          `Kuat tarik (${computed.pullOutForceN} N) di bawah batas minimum IEC 60999-1 (${computed.minPullOutForceN} N).`,
          `引張保持力（${computed.pullOutForceN} N）が IEC 60999-1 最小基準（${computed.minPullOutForceN} N）未満です。`
        );
    }
  };

  const usesTorque =
    params.method !== 'wago-lever' && params.method !== 'twisted-tape';
  const isStud =
    params.station === 'motor-lug' || params.station === 'grounding-pe';

  return (
    <div className="space-y-5">
      {/* TOP STATUS / VERDICT BANNER */}
      {computed.verdict === 'PASS' ? (
        <div className="flex items-center gap-2.5 rounded-[24px] border border-emerald-300/60 bg-emerald-50/85 px-4 py-3 text-xs font-semibold text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/35 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            {pick(
              `PASS — Safe Gas-Tight Termination (${computed.contactResistanceMohm} mΩ, ${computed.terminalTempC} °C, Pull-Out ${computed.pullOutForceN} N ≥ ${computed.minPullOutForceN} N).`,
              `LULUS — Terminasi Aman & Rapat (${computed.contactResistanceMohm} mΩ, ${computed.terminalTempC} °C, Uji Tarik ${computed.pullOutForceN} N ≥ ${computed.minPullOutForceN} N).`,
              `合格 — 適正終端接続（${computed.contactResistanceMohm} mΩ、${computed.terminalTempC} °C、引張 ${computed.pullOutForceN} N ≥ ${computed.minPullOutForceN} N）。`
            )}
          </span>
        </div>
      ) : (
        <div
          className={`flex items-start gap-2.5 rounded-[24px] border px-4 py-3 text-xs font-semibold ${
            computed.verdict === 'FAIL'
              ? 'border-rose-300/70 bg-rose-50/90 text-rose-950 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200'
              : 'border-amber-300/70 bg-amber-50/90 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200'
          }`}
        >
          {computed.verdict === 'FAIL' ? (
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          )}
          <div className="space-y-0.5">
            <div>
              {computed.verdict === 'FAIL'
                ? pick(
                    `FAIL — Unsafe Termination Detected (${computed.terminalTempC} °C, ${computed.contactResistanceMohm} mΩ)`,
                    `GAGAL — Terdeteksi Terminasi Tidak Aman (${computed.terminalTempC} °C, ${computed.contactResistanceMohm} mΩ)`,
                    `不合格 — 危険な接続状態を検出（${computed.terminalTempC} °C、${computed.contactResistanceMohm} mΩ）`
                  )
                : pick(
                    `WARNING — Marginal Termination (${computed.terminalTempC} °C, ${computed.contactResistanceMohm} mΩ)`,
                    `PERINGATAN — Kualitas Terminasi Kurang Optimal (${computed.terminalTempC} °C, ${computed.contactResistanceMohm} mΩ)`,
                    `警告 — 接続状態に改善が必要です（${computed.terminalTempC} °C、${computed.contactResistanceMohm} mΩ）`
                  )}
            </div>
            {computed.issues[0] && (
              <p className="font-normal opacity-90">
                {formatIssue(computed.issues[0])}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN: SVG STAGE + TELEMETRY + PULL TEST (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick 1-Click Good vs Bad Comparison Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-low)] px-3.5 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick('Quick Compare:', 'Bandingkan Cepat:', 'かんたん比較:')}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const recT = getRecommendedTorqueRange(
                    params.station,
                    params.gaugeMm2
                  );
                  const recS = getRecommendedStripRange(
                    params.station,
                    'crimped-ferrule-lug',
                    params.gaugeMm2
                  );
                  setParams((prev) => ({
                    ...prev,
                    method:
                      prev.station === 'wire-splice'
                        ? 'wago-lever'
                        : 'crimped-ferrule-lug',
                    torqueNm: Number(((recT[0] + recT[1]) / 2).toFixed(1)),
                    stripLengthMm: Math.round((recS[0] + recS[1]) / 2),
                    washerStackCorrect: true,
                    paintRemoved: true,
                    emcShieldBonded: true,
                    faultMode: 'none',
                  }));
                }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-3 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600/25 dark:text-emerald-300"
              >
                ✓ {pick('Show Proper Wiring', 'Tampilkan Sambungan Benar', '適正施工を表示')}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleFaultSelect(
                    params.station === 'motor-lug'
                      ? 'wrong-washer-order'
                      : params.station === 'wire-splice'
                        ? 'loose-torque'
                        : 'insulation-pinch'
                  )
                }
                className="inline-flex items-center gap-1 rounded-full bg-rose-600/15 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600/25 dark:text-rose-300"
              >
                ✕ {pick('Show Bad Wiring', 'Tampilkan Sambungan Salah', '不良施工を表示')}
              </button>
            </div>
          </div>

          <WireConnectionSvg
            params={params}
            computed={computed}
            pullTestActive={pullTestActive}
          />

          {/* TELEMETRY & VERDICT READOUT */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-3"
            data-tour="wire-telemetry"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Activity className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Electrical & Thermal Telemetry',
                  'Telemetri Listrik & Termal',
                  '電気・熱テレメトリ'
                )}
              </span>
              <span className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Ampacity', 'KHA Kabel', '許容電流')}:{' '}
                {computed.maxAmpacityA} A
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-2xl bg-[var(--md-surface-container-low)] p-3 border border-[var(--md-outline-variant)]/40">
                <div className="text-[10px] font-semibold uppercase text-[var(--md-on-surface-variant)]">
                  {pick('Contact R_c', 'Resistansi Kontak', '接触抵抗')}
                </div>
                <div className="mt-1 text-base font-bold text-[var(--md-on-surface)]">
                  {computed.contactResistanceMohm} mΩ
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--md-surface-container-low)] p-3 border border-[var(--md-outline-variant)]/40">
                <div className="text-[10px] font-semibold uppercase text-[var(--md-on-surface-variant)]">
                  {pick('Voltage Drop', 'Drop Tegangan', '電圧降下')}
                </div>
                <div className="mt-1 text-base font-bold text-sky-600 dark:text-sky-400">
                  {computed.voltageDropMv} mV
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--md-surface-container-low)] p-3 border border-[var(--md-outline-variant)]/40">
                <div className="text-[10px] font-semibold uppercase text-[var(--md-on-surface-variant)]">
                  {pick('I²R Heat Loss', 'Rugi Panas I²R', 'I²R 発熱損')}
                </div>
                <div className="mt-1 text-base font-bold text-amber-600 dark:text-amber-400">
                  {computed.powerDissipationW} W
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--md-surface-container-low)] p-3 border border-[var(--md-outline-variant)]/40">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase text-[var(--md-on-surface-variant)]">
                  <Flame className="h-3 w-3" />
                  {pick('Terminal Temp', 'Suhu Terminal', '端子温度')}
                </div>
                <div
                  className={`mt-1 text-base font-bold ${
                    computed.terminalTempC >= 85
                      ? 'text-rose-600 dark:text-rose-400'
                      : computed.terminalTempC >= 65
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {computed.terminalTempC} °C
                </div>
              </div>
            </div>

            {computed.issues.length > 0 && (
              <ul className="space-y-1 pt-1 text-xs text-[var(--md-on-surface-variant)]">
                {computed.issues.map((issue) => (
                  <li key={issue} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{formatIssue(issue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* INTERACTIVE PULL-TEST */}
          <div
            className="glass-panel rounded-[28px] p-4 flex flex-wrap items-center justify-between gap-3"
            data-tour="wire-pull-test"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <ArrowDownUp className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'IEC 60999-1 Mechanical Pull-Test',
                  'Uji Tarik Mekanis IEC 60999-1',
                  'IEC 60999-1 機械的引張試験'
                )}
              </div>
              <p className="text-xs text-[var(--md-on-surface-variant)]">
                {pick(
                  `Retention: ${computed.pullOutForceN} N (Minimum required for ${params.gaugeMm2} mm²: ${computed.minPullOutForceN} N)`,
                  `Kuat tarik: ${computed.pullOutForceN} N (Minimum untuk ${params.gaugeMm2} mm²: ${computed.minPullOutForceN} N)`,
                  `保持力: ${computed.pullOutForceN} N（${params.gaugeMm2} mm² の最小基準: ${computed.minPullOutForceN} N）`
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPullTestActive(true)}
              className="m3-btn-filled inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
            >
              <ShieldCheck className="h-4 w-4" />
              {pullTestActive
                ? pick('Testing Pull...', 'Menguji Tarikan...', '引張試験中...')
                : pick('Run Pull-Test', 'Jalankan Uji Tarik', '引張試験を実行')}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. TERMINATION STATIONS */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-3"
            data-tour="wire-stations"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Zap className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Termination Station',
                  'Stasiun Terminasi',
                  '接続ステーション'
                )}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="glass-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              >
                <RotateCcw className="h-3 w-3" />
                {pick('Reset', 'Reset', 'リセット')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {stations.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStationChange(st.id)}
                  className={`rounded-full px-3 py-1.5 text-[11px] transition ${
                    params.station === st.id
                      ? 'm3-btn-filled font-bold'
                      : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. TERMINATION METHOD & WIRE GAUGE */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-3"
            data-tour="wire-method"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                'Termination Method & Cross-Section',
                'Metode Terminasi & Penampang Kabel',
                '終端処理方式・電線断面積'
              )}
            </span>

            <div className="flex flex-wrap gap-1.5">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateParam('method', m.id)}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] transition ${
                    params.method === m.id
                      ? 'm3-btn-filled font-bold'
                      : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick(
                  'Wire Cross-Section (mm²)',
                  'Luas Penampang Kabel (mm²)',
                  '電線断面積 (mm²)'
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {WIRE_GAUGES.map((g) => (
                  <button
                    key={g.mm2}
                    type="button"
                    onClick={() =>
                      updateParam('gaugeMm2', g.mm2 as WireGaugeMm2)
                    }
                    className={`rounded-full py-1.5 text-[11px] transition ${
                      params.gaugeMm2 === g.mm2
                        ? 'm3-btn-filled font-bold'
                        : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    {g.mm2}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. STRIP LENGTH, TORQUE, CURRENT & HARDWARE OPTIONS */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-3.5"
            data-tour="wire-params"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                'Strip, Torque & Load Parameters',
                'Parameter Kupas, Torsi & Beban',
                '剥き長さ・トルク・負荷設定'
              )}
            </span>

            {/* Strip Length */}
            <label className="block space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick(
                    'PVC Strip Length',
                    'Panjang Kupas Isolasi PVC',
                    'PVC被覆剥き長さ'
                  )}
                </span>
                <span className="font-bold text-[var(--md-primary)]">
                  {params.stripLengthMm} mm{' '}
                  <span className="text-[10px] font-normal text-[var(--md-on-surface-variant)]">
                    ({computed.recommendedStripRange[0]}–
                    {computed.recommendedStripRange[1]} mm)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={18}
                step={1}
                value={params.stripLengthMm}
                onChange={(e) =>
                  updateParam('stripLengthMm', Number(e.target.value))
                }
                className="w-full accent-[var(--md-primary)]"
              />
            </label>

            {/* Tightening Torque */}
            <label className="block space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick(
                    'Tightening Torque',
                    'Torsi Pengencangan',
                    '締付トルク'
                  )}
                </span>
                <span className="font-bold text-[var(--md-primary)]">
                  {usesTorque
                    ? `${params.torqueNm.toFixed(1)} N·m`
                    : pick('Tool-Free', 'Tanpa Torsi', '工具不要')}{' '}
                  {usesTorque && (
                    <span className="text-[10px] font-normal text-[var(--md-on-surface-variant)]">
                      ({computed.recommendedTorqueRange[0]}–
                      {computed.recommendedTorqueRange[1]} N·m)
                    </span>
                  )}
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={6.0}
                step={0.1}
                disabled={!usesTorque}
                value={params.torqueNm}
                onChange={(e) =>
                  updateParam('torqueNm', Number(e.target.value))
                }
                className="w-full accent-[var(--md-primary)] disabled:opacity-40"
              />
            </label>

            {/* Load Current */}
            <label className="block space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick('Load Current', 'Arus Beban', '負荷電流')}
                </span>
                <span className="font-bold text-[var(--md-primary)]">
                  {params.loadCurrentA} A
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={1}
                value={params.loadCurrentA}
                onChange={(e) =>
                  updateParam('loadCurrentA', Number(e.target.value))
                }
                className="w-full accent-[var(--md-primary)]"
              />
            </label>

            {/* Hardware / PE Options */}
            {isStud && (
              <div className="space-y-2 pt-1 border-t border-[var(--md-outline-variant)]/40">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="font-semibold text-[var(--md-on-surface)]">
                    {pick(
                      'Correct Washer Stack (Flat + Lock)',
                      'Urutan Ring Benar (Datar + Per)',
                      '正しいワッシャ順（平＋ばね）'
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={params.washerStackCorrect}
                    onChange={(e) =>
                      updateParam('washerStackCorrect', e.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--md-primary)]"
                  />
                </label>

                {params.station === 'grounding-pe' && (
                  <>
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="font-semibold text-[var(--md-on-surface)]">
                        {pick(
                          'Paint Scraped to Bare Metal',
                          'Cat Dikupas ke Logam Bersih',
                          '塗装剥離（地金露出）'
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={params.paintRemoved}
                        onChange={(e) =>
                          updateParam('paintRemoved', e.target.checked)
                        }
                        className="h-4 w-4 accent-[var(--md-primary)]"
                      />
                    </label>
                    <label className="flex items-center justify-between text-xs cursor-pointer">
                      <span className="font-semibold text-[var(--md-on-surface)]">
                        {pick(
                          '360° EMC Shield Bonded to PE',
                          'Perisai EMC 360° Terikat ke PE',
                          'EMCシールド 360°接地'
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={params.emcShieldBonded}
                        onChange={(e) =>
                          updateParam('emcShieldBonded', e.target.checked)
                        }
                        className="h-4 w-4 accent-[var(--md-primary)]"
                      />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 4. BAD WIRE CONNECTIONS (DO NOT DO THIS!) */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-2.5"
            data-tour="wire-faults"
          >
            <div className="space-y-0.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                {pick(
                  'Bad Wire Connections (Do NOT Do This!)',
                  'Contoh Sambungan Salah (Dilarang!)',
                  '禁止される不良配線例（やってはいけない施工）'
                )}
              </span>
              <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick(
                  'Select a prohibited practice below to see overheating, arcing, or pull-out failure.',
                  'Pilih contoh pemasangan yang salah untuk melihat risiko panas berlebih, percikan api, atau kabel terlepas.',
                  '下の不良例を選ぶと、過熱・アーク放電・引張抜けの危険性を確認できます。'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {faults.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFaultSelect(f.id)}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] transition ${
                    params.faultMode === f.id
                      ? 'm3-btn-filled font-bold'
                      : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
