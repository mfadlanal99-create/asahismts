import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Crosshair,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  Square,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  LINER_PRESETS,
  OEM_SERVICE_LIMIT_MM,
  computeBoreMapMetrics,
  computeRockedReading,
  createEmptyBoreMap,
  getBlindLinerProfile,
  type BoreAxisId,
  type DepthPlaneId,
  type LinerPresetId,
  type RecordedBoreMap,
} from './boreGaugeMath';
import { BoreGaugeSvg } from './BoreGaugeSvg';

export function BoreGaugeSimulator() {
  const { pick } = useLanguage();

  const [presetId, setPresetId] = useState<LinerPresetId>('top-taper');
  const [blindVariant, setBlindVariant] = useState<number>(0);
  const [depthPlane, setDepthPlane] = useState<DepthPlaneId>('top');
  const [axis, setAxis] = useState<BoreAxisId>('axisA');
  const [rockingAngleDeg, setRockingAngleDeg] = useState<number>(0);
  const [isAutoRocking, setIsAutoRocking] = useState<boolean>(false);
  const [bezelZeroOffsetMm, setBezelZeroOffsetMm] = useState<number>(0);

  // 6-point recorded bore map — initialized with Top-Taper preset at null point
  const [boreMap, setBoreMap] = useState<RecordedBoreMap>(() => ({
    top: {
      axisA: LINER_PRESETS['top-taper'].planes.top.axisA,
      axisB: LINER_PRESETS['top-taper'].planes.top.axisB,
    },
    mid: {
      axisA: LINER_PRESETS['top-taper'].planes.mid.axisA,
      axisB: LINER_PRESETS['top-taper'].planes.mid.axisB,
    },
    bottom: {
      axisA: LINER_PRESETS['top-taper'].planes.bottom.axisA,
      axisB: LINER_PRESETS['top-taper'].planes.bottom.axisB,
    },
  }));
  const [offNullWarning, setOffNullWarning] = useState<string | null>(null);

  // Blind challenge user submission
  const [blindVerdictGuess, setBlindVerdictGuess] = useState<'PASS' | 'RE-BORE'>(
    'RE-BORE'
  );
  const [blindSubmitted, setBlindSubmitted] = useState<boolean>(false);

  const activeProfile = useMemo(() => {
    if (presetId === 'blind-challenge') {
      return getBlindLinerProfile(blindVariant);
    }
    return LINER_PRESETS[presetId];
  }, [presetId, blindVariant]);

  // True diameter at current Depth Plane & Axis
  const trueDiameterMm = activeProfile.planes[depthPlane][axis];

  // Rocked reading calculation
  const rocked = useMemo(
    () =>
      computeRockedReading(trueDiameterMm, rockingAngleDeg, bezelZeroOffsetMm),
    [trueDiameterMm, rockingAngleDeg, bezelZeroOffsetMm]
  );

  // Null-point reference reading (at theta = 0°)
  const nullPointReading = useMemo(
    () => computeRockedReading(trueDiameterMm, 0, bezelZeroOffsetMm),
    [trueDiameterMm, bezelZeroOffsetMm]
  );

  // Auto-rocking animation (-6° to +6° continuous sinusoidal sweep without jump)
  const rockPhaseRef = useRef<number>(0);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAutoRocking) {
      lastFrameRef.current = null;
      return;
    }
    let frameId = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current !== null) {
        const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
        rockPhaseRef.current += dt * 2.4;
        const angle = Number((6 * Math.sin(rockPhaseRef.current)).toFixed(1));
        setRockingAngleDeg(angle);
      }
      lastFrameRef.current = now;
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoRocking]);

  const mapMetrics = useMemo(() => computeBoreMapMetrics(boreMap), [boreMap]);

  function handleSelectPreset(nextPreset: LinerPresetId) {
    setIsAutoRocking(false);
    setPresetId(nextPreset);
    setRockingAngleDeg(0);
    setOffNullWarning(null);
    setBlindSubmitted(false);

    if (nextPreset === 'blind-challenge') {
      setBoreMap(createEmptyBoreMap());
    } else {
      const prof = LINER_PRESETS[nextPreset];
      setBoreMap({
        top: { axisA: prof.planes.top.axisA, axisB: prof.planes.top.axisB },
        mid: { axisA: prof.planes.mid.axisA, axisB: prof.planes.mid.axisB },
        bottom: {
          axisA: prof.planes.bottom.axisA,
          axisB: prof.planes.bottom.axisB,
        },
      });
    }
  }

  function handleRecordCurrentPoint() {
    const recordedVal = Number(rocked.apparentSpanMm.toFixed(3));
    setBoreMap((prev) => ({
      ...prev,
      [depthPlane]: {
        ...prev[depthPlane],
        [axis]: recordedVal,
      },
    }));

    if (!rocked.isAtNullPoint) {
      setOffNullWarning(
        pick(
          `Recorded at θ = ${rockingAngleDeg > 0 ? '+' : ''}${rockingAngleDeg.toFixed(1)}° off-null (+${rocked.cosineErrorMm.toFixed(3)} mm cosine tilt error). Rock to 0.0° null point for true minimum bore!`,
          `Dicatat pada θ = ${rockingAngleDeg > 0 ? '+' : ''}${rockingAngleDeg.toFixed(1)}° di luar titik balik (+${rocked.cosineErrorMm.toFixed(3)} mm kesalahan kosinus). Goyangkan ke titik balik 0.0° untuk diameter minimum sejati!`,
          `θ = ${rockingAngleDeg > 0 ? '+' : ''}${rockingAngleDeg.toFixed(1)}°（非反転点）で記録されました（+${rocked.cosineErrorMm.toFixed(3)} mm のコサイン傾き誤差）。0.0° の反転点で再記録してください！`
        )
      );
    } else {
      setOffNullWarning(null);
    }
  }

  function handleAutoMapAllSix() {
    setIsAutoRocking(false);
    setRockingAngleDeg(0);
    setOffNullWarning(null);
    const offset = bezelZeroOffsetMm;
    setBoreMap({
      top: {
        axisA: Number((activeProfile.planes.top.axisA + offset).toFixed(3)),
        axisB: Number((activeProfile.planes.top.axisB + offset).toFixed(3)),
      },
      mid: {
        axisA: Number((activeProfile.planes.mid.axisA + offset).toFixed(3)),
        axisB: Number((activeProfile.planes.mid.axisB + offset).toFixed(3)),
      },
      bottom: {
        axisA: Number((activeProfile.planes.bottom.axisA + offset).toFixed(3)),
        axisB: Number((activeProfile.planes.bottom.axisB + offset).toFixed(3)),
      },
    });
  }

  function handleClearMap() {
    setBoreMap(createEmptyBoreMap());
    setOffNullWarning(null);
  }

  function handleNewBlindChallenge() {
    setBlindVariant((v) => v + 1);
    setBoreMap(createEmptyBoreMap());
    setBlindSubmitted(false);
    setOffNullWarning(null);
    setRockingAngleDeg(0);
  }

  const presetOptions: { id: LinerPresetId; label: string; badge: string }[] = [
    {
      id: 'healthy',
      label: pick('Healthy OEM Liner', 'Liner OEM Sehat', '正常 OEM ライナ'),
      badge: pick('Spec OK', 'Normal', '正常'),
    },
    {
      id: 'top-taper',
      label: pick(
        'Ring-Turn Top Taper Wear',
        'Keausan Tirus Atas (Top Taper)',
        '上死点リング折返しテーパ摩耗'
      ),
      badge: pick('Taper > 0.05', 'Taper > 0.05', 'テーパ過大'),
    },
    {
      id: 'thrust-ovality',
      label: pick(
        'Thrust-Axis Ovality Wear',
        'Keausan Ovalitas Sumbu Thrust',
        'スラスト軸方向の楕円摩耗'
      ),
      badge: pick('Ovality > 0.05', 'Oval > 0.05', '楕円度過大'),
    },
    {
      id: 'barrel-wear',
      label: pick(
        'Barrel-Shaped Liner',
        'Liner Bentuk Tong (Barrel)',
        '中央膨らみ（バレル摩耗）ライナ'
      ),
      badge: pick('Mid Wear', 'Aus Tengah', '中央摩耗'),
    },
    {
      id: 'blind-challenge',
      label: pick(
        'Blind Inspection Challenge',
        'Tantangan Inspeksi Buta',
        'ブラインド検査チャレンジ'
      ),
      badge: pick('Mystery', 'Misteri', '実技試験'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Control Panel: Liner Presets & Master Ring Setup */}
      <div className="glass-panel rounded-[28px] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-[var(--md-primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick(
                'Cylinder Liner Wear Profile Preset',
                'Preset Profil Keausan Liner Silinder',
                'シリンダライナ摩耗プロファイル選択'
              )}
            </span>
          </div>

          {/* Master Ring Gauge & Anvil Reference Pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-primary-container)] px-3 py-1 font-semibold text-[var(--md-on-primary-container)]">
              {pick(
                'Master Ring: Ø85.000 mm | Anvil: 85 mm + 0.0 mm Spacer',
                'Master Ring: Ø85.000 mm | Anvil: 85 mm + 0.0 mm Spacer',
                '基準リングゲージ: Ø85.000 mm | アンビル: 85 mm'
              )}
            </span>

            <div className="flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
              <span className="px-2 text-[var(--md-on-surface-variant)] font-medium">
                {pick('Bezel Zero:', 'Nol Bezel:', 'ゼロ補正:')}
              </span>
              {([-0.02, 0, 0.02] as const).map((offset) => (
                <button
                  key={offset}
                  type="button"
                  onClick={() => setBezelZeroOffsetMm(offset)}
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-colors ${
                    bezelZeroOffsetMm === offset
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  {offset === 0
                    ? '0.00'
                    : `${offset > 0 ? '+' : ''}${offset.toFixed(2)}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {presetOptions.map((item) => {
            const active = presetId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPreset(item.id)}
                className={`flex items-center justify-between gap-2 rounded-[20px] border px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                  active
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active
                      ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                      : 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive Probe Controls: Depth Plane, Measurement Axis, Rocking Angle */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-[var(--md-outline-variant)]/50">
          {/* Probe Depth Plane */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick(
                '1. Probe Depth Plane',
                '1. Bidang Kedalaman Probe',
                '1. 測定深さ位置（上・中・下）'
              )}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  ['top', pick('Top — 15 mm', 'Atas — 15 mm', '上部 — 15 mm')],
                  ['mid', pick('Mid — 75 mm', 'Tengah — 75 mm', '中央 — 75 mm')],
                  [
                    'bottom',
                    pick('Bottom — 135 mm', 'Bawah — 135 mm', '下部 — 135 mm'),
                  ],
                ] as [DepthPlaneId, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDepthPlane(id)}
                  className={`rounded-full border px-2 py-2 text-xs transition-colors ${
                    depthPlane === id
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-semibold text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Measurement Axis */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick(
                '2. Measurement Axis (0° vs 90°)',
                '2. Sumbu Ukur (0° vs 90°)',
                '2. 測定軸方向（0° スラスト vs 90° ピン）'
              )}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setAxis('axisA')}
                className={`rounded-full border px-2.5 py-2 text-xs transition-colors ${
                  axis === 'axisA'
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-semibold text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick(
                  'Axis A — 0° Thrust',
                  'Sumbu A — 0° Thrust',
                  'A軸 — 0° スラスト'
                )}
              </button>
              <button
                type="button"
                onClick={() => setAxis('axisB')}
                className={`rounded-full border px-2.5 py-2 text-xs transition-colors ${
                  axis === 'axisB'
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-semibold text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick(
                  'Axis B — 90° Pin',
                  'Sumbu B — 90° Pin',
                  'B軸 — 90° ピン方向'
                )}
              </button>
            </div>
          </div>

          {/* Gauge Rocking Angle (-8° to +8°) */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick(
                  '3. Gauge Rocking Angle (-8° to +8°)',
                  '3. Sudut Goyang Gauge (-8° s/d +8°)',
                  '3. ゲージ揺動角（-8° 〜 +8°）'
                )}
              </label>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                  rocked.isAtNullPoint
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                }`}
              >
                {rockingAngleDeg > 0 ? '+' : ''}
                {rockingAngleDeg.toFixed(1)}°{' '}
                {rocked.isAtNullPoint
                  ? pick('• NULL POINT', '• TITIK BALIK', '• 反転点(最小)')
                  : pick('• Tilted', '• Miring', '• 傾きあり')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min={-8}
                max={8}
                step={0.5}
                value={rockingAngleDeg}
                onChange={(e) => {
                  setIsAutoRocking(false);
                  setRockingAngleDeg(Number(e.target.value));
                }}
                aria-label="Gauge Rocking Angle"
                className="w-full"
              />
              <button
                type="button"
                onClick={() => {
                  setIsAutoRocking(false);
                  setRockingAngleDeg(0);
                }}
                title={pick(
                  'Snap to 0.0° Null Reversal Point',
                  'Setel ke Titik Balik 0.0°',
                  '0.0° 反転点に合わせる'
                )}
                className="shrink-0 rounded-full border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
              >
                0.0°
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAutoRocking((v) => {
                    if (!v) {
                      const clampedRatio = Math.max(-1, Math.min(1, rockingAngleDeg / 6));
                      rockPhaseRef.current = Math.asin(clampedRatio);
                    }
                    return !v;
                  });
                }}
                className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold ${
                  isAutoRocking ? 'm3-btn-filled' : 'm3-btn-tonal'
                }`}
              >
                {isAutoRocking ? (
                  <>
                    <Square className="h-3 w-3" />
                    {pick('Stop', 'Berhenti', '停止')}
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    {pick('Rock', 'Goyang', '揺動')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 12-Column Split Layout: 7-col CAD Stage + 5-col 6-Point Mapping & Verdict */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column (7/12): Unified CAD Machine Illustration + Off-Null Warning */}
        <div className="lg:col-span-7 space-y-3">
          <BoreGaugeSvg
            presetId={presetId}
            activeProfile={activeProfile}
            depthPlane={depthPlane}
            onSelectDepthPlane={setDepthPlane}
            axis={axis}
            onSelectAxis={setAxis}
            rockingAngleDeg={rockingAngleDeg}
            rocked={rocked}
            nullPointReading={nullPointReading}
            blindSubmitted={blindSubmitted}
            onRecordCurrentPoint={handleRecordCurrentPoint}
          />

          {/* Off-Null Recording Warning Banner */}
          {offNullWarning && (
            <div className="flex items-start gap-2 rounded-[22px] border border-amber-300/70 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-950/60 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span>{offNullWarning}</span>
            </div>
          )}
        </div>

        {/* Right Column (5/12): 6-Point Bore Mapping Matrix, Live Diagnostics & Verdict */}
        <div className="lg:col-span-5 glass-panel rounded-[28px] p-4 space-y-3.5">
          <div className="space-y-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--md-on-surface)] flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[var(--md-primary)] shrink-0" />
                {pick(
                  '6-Point Bore Map & Ovality / Taper Diagnostics',
                  'Tabel Pemetaan 6-Titik & Ovalitas / Ketirusan',
                  '6点ボア測定表 & 楕円度・テーパ判定'
                )}
              </h3>
              <p className="text-[11px] text-[var(--md-on-surface-variant)] mt-0.5">
                {pick(
                  'Click any cell to aim probe, rock to 0.0° null point, and record.',
                  'Klik sel untuk memindah probe, goyangkan ke 0.0° null, lalu catat.',
                  'セルをクリックして位置を切替え、0.0° 反転点で値を記録（限度: 0.050 mm）。'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAutoMapAllSix}
                className="m3-btn-tonal inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {pick(
                  'Auto-Map All 6 (0° Null)',
                  'Isi 6 Titik (0° Null)',
                  '全6点を自動測定(0°)'
                )}
              </button>
              <button
                type="button"
                onClick={handleClearMap}
                className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {pick('Clear', 'Hapus', 'クリア')}
              </button>
            </div>
          </div>

          {/* Compact 6-Point Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]">
                  <th className="py-2 px-2 font-bold">
                    {pick('Plane', 'Bidang', '深さ')}
                  </th>
                  <th className="py-2 px-1.5 font-bold">
                    {pick('Axis A (0°)', 'Sumbu A (0°)', 'A軸 (0°)')}
                  </th>
                  <th className="py-2 px-1.5 font-bold">
                    {pick('Axis B (90°)', 'Sumbu B (90°)', 'B軸 (90°)')}
                  </th>
                  <th className="py-2 px-1.5 font-bold">
                    {pick('Ovality', 'Ovalitas', '楕円度')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-outline-variant)]/40">
                {(
                  [
                    ['top', pick('Top 15', 'Atas 15', '上部 15')],
                    ['mid', pick('Mid 75', 'Tengah 75', '中央 75')],
                    ['bottom', pick('Bot 135', 'Bawah 135', '下部 135')],
                  ] as [DepthPlaneId, string][]
                ).map(([planeId, planeLabel]) => {
                  const row = boreMap[planeId];
                  const ovality = mapMetrics.ovalityByPlane[planeId];
                  const exceeds =
                    ovality !== null && ovality > OEM_SERVICE_LIMIT_MM + 1e-6;
                  return (
                    <tr
                      key={planeId}
                      className={
                        depthPlane === planeId
                          ? 'bg-[var(--md-primary-container)]/25'
                          : ''
                      }
                    >
                      <td className="py-2 px-2 font-semibold text-[var(--md-on-surface)] whitespace-nowrap">
                        {planeLabel}
                      </td>
                      <td className="py-1.5 px-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDepthPlane(planeId);
                            setAxis('axisA');
                          }}
                          className={`w-full text-left font-mono px-2.5 py-1 rounded-full border transition-colors ${
                            depthPlane === planeId && axis === 'axisA'
                              ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-bold'
                              : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                          }`}
                        >
                          {row.axisA !== null ? row.axisA.toFixed(3) : '—'}
                        </button>
                      </td>
                      <td className="py-1.5 px-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDepthPlane(planeId);
                            setAxis('axisB');
                          }}
                          className={`w-full text-left font-mono px-2.5 py-1 rounded-full border transition-colors ${
                            depthPlane === planeId && axis === 'axisB'
                              ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-bold'
                              : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                          }`}
                        >
                          {row.axisB !== null ? row.axisB.toFixed(3) : '—'}
                        </button>
                      </td>
                      <td className="py-2 px-1.5 font-mono font-bold whitespace-nowrap">
                        {ovality === null ? (
                          <span className="text-[var(--md-on-surface-variant)]">—</span>
                        ) : exceeds ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                            <XCircle className="h-3 w-3 shrink-0" />
                            {ovality.toFixed(3)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            {ovality.toFixed(3)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Taper Summary Row */}
                <tr className="border-t-2 border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container)] font-semibold">
                  <td className="py-2 px-2 text-[var(--md-on-surface)] whitespace-nowrap">
                    {pick('Taper', 'Ketirusan', 'テーパ')}
                  </td>
                  <td className="py-2 px-1.5 font-mono font-bold text-[var(--md-primary)]">
                    {mapMetrics.taperByAxis.axisA !== null
                      ? `${mapMetrics.taperByAxis.axisA.toFixed(3)}`
                      : '—'}
                    {mapMetrics.axialSpanByAxis.axisA !== null &&
                      mapMetrics.taperByAxis.axisA !== null &&
                      mapMetrics.axialSpanByAxis.axisA >
                        mapMetrics.taperByAxis.axisA + 0.005 && (
                        <span className="block text-[9.5px] text-amber-600 dark:text-amber-400">
                          {pick(
                            `Δ:${mapMetrics.axialSpanByAxis.axisA.toFixed(3)}`,
                            `Δ:${mapMetrics.axialSpanByAxis.axisA.toFixed(3)}`,
                            `差:${mapMetrics.axialSpanByAxis.axisA.toFixed(3)}`
                          )}
                        </span>
                      )}
                  </td>
                  <td className="py-2 px-1.5 font-mono font-bold text-[var(--md-primary)]">
                    {mapMetrics.taperByAxis.axisB !== null
                      ? `${mapMetrics.taperByAxis.axisB.toFixed(3)}`
                      : '—'}
                  </td>
                  <td className="py-2 px-1.5 font-mono font-bold text-[var(--md-on-surface)] whitespace-nowrap">
                    {mapMetrics.maxTaperMm !== null
                      ? `${mapMetrics.maxTaperMm.toFixed(3)} max`
                      : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Cards: Max Ovality & Max Taper (2-col) + OEM Service Verdict */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Max Ovality', 'Ovalitas Maks', '最大楕円度')}
              </div>
              <div className="mt-0.5 flex items-baseline justify-between gap-1">
                <span className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                  {mapMetrics.maxOvalityMm !== null
                    ? `${mapMetrics.maxOvalityMm.toFixed(3)} mm`
                    : '—'}
                </span>
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">≤ 0.050</span>
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Max Taper', 'Tirus Maks', '最大テーパ')}
              </div>
              <div className="mt-0.5 flex items-baseline justify-between gap-1">
                <span className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                  {mapMetrics.maxTaperMm !== null
                    ? `${mapMetrics.maxTaperMm.toFixed(3)} mm`
                    : '—'}
                </span>
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">≤ 0.050</span>
              </div>
            </div>

            <div
              className={`col-span-2 rounded-[22px] border p-3 ${
                mapMetrics.recordedCount < 6
                  ? 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]'
                  : mapMetrics.isServiceLimitExceeded
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40'
                    : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40'
              }`}
            >
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick(
                  'OEM Re-Bore / Honing Verdict',
                  'Keputusan Servis Re-Bore / Honing OEM',
                  'OEM ボーリング／ホーニング合否判定'
                )}
              </div>
              <div className="mt-1 font-bold text-xs">
                {mapMetrics.recordedCount < 6 ? (
                  <span className="text-[var(--md-on-surface-variant)]">
                    {pick(
                      `Record all 6 points (${mapMetrics.recordedCount}/6 logged)`,
                      `Catat semua 6 titik (${mapMetrics.recordedCount}/6 tercatat)`,
                      `全6点を記録してください (${mapMetrics.recordedCount}/6 完了)`
                    )}
                  </span>
                ) : mapMetrics.isServiceLimitExceeded ? (
                  <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0" />
                    {pick(
                      'RE-BORE TO +0.25 mm OVERSIZE REQUIRED',
                      'WAJIB RE-BORE KE OVERSIZE +0.25 mm',
                      '不合格：+0.25 mm オーバーサイズ再ボーリング要'
                    )}
                  </span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {pick(
                      'SERVICEABLE — WITHIN 0.050 mm OEM LIMIT',
                      'LAYAK PAKAI — DALAM BATAS OEM 0.050 mm',
                      '合格：OEM使用限度（0.050 mm）以内'
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Blind Inspection Challenge Panel */}
          {presetId === 'blind-challenge' && (
            <div className="rounded-[22px] border border-[var(--md-primary)]/40 bg-[var(--md-primary-container)]/35 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-bold text-[var(--md-on-surface)]">
                  {pick(
                    `Blind Challenge #${blindVariant + 1}: Submit QC decision`,
                    `Tantangan Buta #${blindVariant + 1}: Kirim keputusan QC`,
                    `ブラインド検査 #${blindVariant + 1}: 合否判定を提出`
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNewBlindChallenge}
                  className="glass-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                >
                  <Shuffle className="h-3 w-3" />
                  {pick('New Liner', 'Liner Baru', '新規ライナ')}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBlindVerdictGuess('PASS')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    blindVerdictGuess === 'PASS'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  {pick('PASS (≤ 0.050)', 'LULUS (≤ 0.050)', '合格 (≤ 0.050)')}
                </button>
                <button
                  type="button"
                  onClick={() => setBlindVerdictGuess('RE-BORE')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    blindVerdictGuess === 'RE-BORE'
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  {pick(
                    'RE-BORE (> 0.050)',
                    'RE-BORE (> 0.050)',
                    '要ボーリング (> 0.050)'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setBlindSubmitted(true)}
                  className="m3-btn-filled px-3.5 py-1 text-[11px] font-bold"
                >
                  {pick('Verify', 'Periksa', '判定確認')}
                </button>
              </div>

              {blindSubmitted && (
                <div className="text-[11px] font-semibold pt-0.5">
                  {blindVerdictGuess === activeProfile.expectedVerdict ? (
                    <span className="text-emerald-700 dark:text-emerald-300">
                      {pick(
                        `Correct! Expected verdict is ${activeProfile.expectedVerdict} (${activeProfile.faultCategory} profile).`,
                        `Benar! Keputusan yang tepat adalah ${activeProfile.expectedVerdict} (profil ${activeProfile.faultCategory}).`,
                        `正解です！ 正しい判定は ${activeProfile.expectedVerdict}（${activeProfile.faultCategory}）です。`
                      )}
                    </span>
                  ) : (
                    <span className="text-rose-700 dark:text-rose-300">
                      {pick(
                        `Not quite — expected ${activeProfile.expectedVerdict}. Use "Auto-Map All 6" to inspect null readings.`,
                        `Kurang tepat — seharusnya ${activeProfile.expectedVerdict}. Klik "Isi 6 Titik" untuk memeriksa nilai.`,
                        `不正解 — 正解は ${activeProfile.expectedVerdict} です。「全6点を自動測定」で確認できます。`
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
