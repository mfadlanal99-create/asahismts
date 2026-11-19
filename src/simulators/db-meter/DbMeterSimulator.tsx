import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Shield,
  Sliders,
  Volume2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ACOUSTIC_SOURCES,
  OCTAVE_BANDS_HZ,
  computeDbMeterState,
  formatExposureDuration,
  type AcousticSourceId,
  type FrequencyWeighting,
  type TimeWeighting,
} from './dbMeterPhysics';
import { DbMeterSvg } from './DbMeterSvg';

export function DbMeterSimulator() {
  const { pick } = useLanguage();

  const [sourceId, setSourceId] = useState<AcousticSourceId>('centrifugal-compressor');
  const [distanceM, setDistanceM] = useState<number>(2.0);
  const [enclosureActive, setEnclosureActive] = useState<boolean>(false);
  const [weighting, setWeighting] = useState<FrequencyWeighting>('dBA');
  const [timeWeighting, setTimeWeighting] = useState<TimeWeighting>('FAST');

  const computed = useMemo(
    () => computeDbMeterState(sourceId, distanceM, enclosureActive, weighting),
    [sourceId, distanceM, enclosureActive, weighting]
  );

  // Live meter needle / bargraph smoothing (FAST 125 ms vs SLOW 1000 ms)
  const [liveSplDb, setLiveSplDb] = useState<number>(computed.overallSplDb);
  const [peakHoldDb, setPeakHoldDb] = useState<number>(computed.overallSplDb);

  const liveRef = useRef<number>(computed.overallSplDb);
  const targetRef = useRef<number>(computed.overallSplDb);
  const fluctRef = useRef<number>(computed.source.fluctuationDb);
  const timeWeightRef = useRef<TimeWeighting>(timeWeighting);

  useEffect(() => {
    targetRef.current = computed.overallSplDb;
    fluctRef.current = computed.source.fluctuationDb;
  }, [computed]);

  useEffect(() => {
    timeWeightRef.current = timeWeighting;
  }, [timeWeighting]);

  useEffect(() => {
    const dtMs = 60;
    const timer = window.setInterval(() => {
      const tauMs = timeWeightRef.current === 'FAST' ? 125 : 1000;
      const alpha = 1 - Math.exp(-dtMs / tauMs);
      const jitter = (Math.random() - 0.45) * fluctRef.current;
      const instantTarget = targetRef.current + jitter;
      const nextVal = liveRef.current + alpha * (instantTarget - liveRef.current);
      liveRef.current = nextVal;
      setLiveSplDb(nextVal);
      setPeakHoldDb((prev) => (nextVal > prev ? nextVal : prev));
    }, dtMs);
    return () => window.clearInterval(timer);
  }, []);

  const syncMeterToTarget = useCallback(
    (
      nextSourceId: AcousticSourceId,
      nextDist: number,
      nextEnc: boolean,
      nextWeight: FrequencyWeighting
    ) => {
      const nextState = computeDbMeterState(
        nextSourceId,
        nextDist,
        nextEnc,
        nextWeight
      );
      liveRef.current = nextState.overallSplDb;
      setLiveSplDb(nextState.overallSplDb);
      setPeakHoldDb(nextState.overallSplDb);
    },
    []
  );

  const handleSelectSource = useCallback(
    (nextSourceId: AcousticSourceId) => {
      setSourceId(nextSourceId);
      syncMeterToTarget(nextSourceId, distanceM, enclosureActive, weighting);
    },
    [distanceM, enclosureActive, weighting, syncMeterToTarget]
  );

  const handleSelectWeighting = useCallback(
    (nextWeight: FrequencyWeighting) => {
      setWeighting(nextWeight);
      syncMeterToTarget(sourceId, distanceM, enclosureActive, nextWeight);
    },
    [sourceId, distanceM, enclosureActive, syncMeterToTarget]
  );

  const handleCycleWeighting = useCallback(() => {
    const nextWeight: FrequencyWeighting =
      weighting === 'dBA' ? 'dBC' : weighting === 'dBC' ? 'dBZ' : 'dBA';
    handleSelectWeighting(nextWeight);
  }, [weighting, handleSelectWeighting]);

  const handleToggleTimeWeighting = useCallback(() => {
    setTimeWeighting((prev) => (prev === 'FAST' ? 'SLOW' : 'FAST'));
  }, []);

  const handleResetPeak = useCallback(() => {
    setPeakHoldDb(liveRef.current);
  }, []);

  const sourceLabel = pick(
    computed.source.name,
    computed.source.nameId,
    computed.source.nameJa
  );

  const oshaBadgeClass =
    computed.osha.status === 'exceeded'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35'
      : computed.osha.status === 'action'
        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/35'
        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35';

  const nioshBadgeClass =
    computed.niosh.status === 'exceeded'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35'
      : computed.niosh.status === 'action'
        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/35'
        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35';

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN (7 cols): SVG + Octave Spectrum + Exposure Standards */}
        <div className="lg:col-span-7 space-y-5">
          <DbMeterSvg
            sourceId={sourceId}
            sourceLabel={sourceLabel}
            distanceM={distanceM}
            enclosureActive={enclosureActive}
            weighting={weighting}
            timeWeighting={timeWeighting}
            liveSplDb={liveSplDb}
            peakHoldDb={peakHoldDb}
            onChangeDistance={setDistanceM}
            onSetEnclosure={setEnclosureActive}
            onCycleWeighting={handleCycleWeighting}
            onToggleTimeWeighting={handleToggleTimeWeighting}
            onResetPeak={handleResetPeak}
          />

          {/* Octave Band Spectrum & Weighting Comparison */}
          <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Volume2 className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  `Octave-Band Spectrum (${weighting} Weighted)`,
                  `Spektrum Pita Oktaf (Pembobotan ${weighting})`,
                  `オクターブバンドスペクトル (${weighting} 特性)`
                )}
              </h3>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {(
                  [
                    { key: 'dBA', val: computed.equivalentDba },
                    { key: 'dBC', val: computed.equivalentDbc },
                    { key: 'dBZ', val: computed.equivalentDbz },
                  ] as const
                ).map((item) => (
                  <span
                    key={item.key}
                    className={`rounded-full px-2.5 py-0.5 ${
                      weighting === item.key
                        ? 'bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                        : 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    {item.key}: {item.val.toFixed(1)}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid h-32 grid-cols-8 items-end gap-2 pt-4">
              {OCTAVE_BANDS_HZ.map((hz, idx) => {
                const val = computed.weightedBandsDb[idx];
                const pct = Math.max(6, Math.min(100, ((val - 30) / 85) * 100));
                const barCol =
                  val >= 90
                    ? 'bg-rose-500'
                    : val >= 85
                      ? 'bg-amber-500'
                      : 'bg-emerald-500';
                return (
                  <div key={hz} className="flex h-full flex-col items-center justify-end gap-1">
                    <span className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
                      {val.toFixed(0)}
                    </span>
                    <div className="flex h-20 w-full items-end overflow-hidden rounded-t-lg bg-[var(--md-surface-container-highest)]">
                      <div
                        className={`w-full ${barCol} rounded-t-lg transition-all duration-200`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--md-on-surface)]">
                      {hz >= 1000 ? `${hz / 1000}k` : hz}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                computed.source.dominantNote,
                computed.source.dominantNoteId,
                computed.source.dominantNoteJa
              )}
            </p>
          </div>

          {/* OSHA & NIOSH Occupational Noise Exposure Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* OSHA Card */}
            <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-primary)]">
                    OSHA 29 CFR 1910.95
                  </div>
                  <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                    90 dBA Criterion • 5 dB Exchange
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${oshaBadgeClass}`}
                >
                  {computed.osha.status === 'safe' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {computed.osha.status === 'exceeded'
                    ? pick('Exceeds PEL', 'Melebihi PEL', 'PEL超過')
                    : computed.osha.status === 'action'
                      ? pick('Action Level', 'Level Aksi', '管理基準')
                      : pick('Safe', 'Aman', '安全')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                  <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                    {pick('Max Exposure Time', 'Waktu Maksimum', '許容ばく露時間')}
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                    {formatExposureDuration(computed.osha.permissibleHours)}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                  <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                    {pick('8h TWA Dose', 'Dosis TWA 8 Jam', '8時間TWA線量')}
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                    {computed.osha.dose8hPercent.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* NIOSH Card */}
            <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-primary)]">
                    NIOSH REL (1998)
                  </div>
                  <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                    85 dBA Criterion • 3 dB Exchange
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${nioshBadgeClass}`}
                >
                  {computed.niosh.status === 'safe' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {computed.niosh.status === 'exceeded'
                    ? pick('Exceeds REL', 'Melebihi REL', 'REL超過')
                    : computed.niosh.status === 'action'
                      ? pick('Caution', 'Waspada', '注意')
                      : pick('Safe', 'Aman', '安全')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                  <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                    {pick('Max Exposure Time', 'Waktu Maksimum', '許容ばく露時間')}
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                    {formatExposureDuration(computed.niosh.permissibleHours)}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                  <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                    {pick('8h TWA Dose', 'Dosis TWA 8 Jam', '8時間TWA線量')}
                  </div>
                  <div className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                    {computed.niosh.dose8hPercent.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel space-y-5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--md-on-surface)]">
                <Sliders className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Acoustic Measurement Controls',
                  'Kontrol Pengukuran Akustik',
                  '音響測定コントロール'
                )}
              </h2>
              <button
                type="button"
                onClick={handleResetPeak}
                className="m3-btn-tonal inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {pick('Reset Peak', 'Reset Puncak', 'ピークリセット')}
              </button>
            </div>

            {/* Machine Acoustic Source */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Machine Acoustic Source', 'Sumber Akustik Mesin', '機械音源')}
              </label>
              <div className="grid gap-2">
                {ACOUSTIC_SOURCES.map((src) => {
                  const active = src.id === sourceId;
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => handleSelectSource(src.id)}
                      className={`rounded-[20px] border px-3.5 py-2.5 text-left text-xs transition-all ${
                        active
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <div className="font-semibold">
                        {pick(src.name, src.nameId, src.nameJa)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequency Weighting */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Frequency Weighting (IEC 61672)', 'Pembobotan Frekuensi', '周波数重み付け')}
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                {(['dBA', 'dBC', 'dBZ'] as FrequencyWeighting[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleSelectWeighting(w)}
                    className={`rounded-full py-2 text-xs transition ${
                      weighting === w
                        ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Weighting */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Time Weighting', 'Pembobotan Waktu', '時間重み付け')}
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                <button
                  type="button"
                  onClick={() => setTimeWeighting('FAST')}
                  className={`rounded-full py-2 text-xs transition ${
                    timeWeighting === 'FAST'
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  FAST (125 ms)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeWeighting('SLOW')}
                  className={`rounded-full py-2 text-xs transition ${
                    timeWeighting === 'SLOW'
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  SLOW (1 s)
                </button>
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Microphone Distance', 'Jarak Mikrofon', 'マイク距離')}
                </span>
                <span className="font-mono font-extrabold text-[var(--md-primary)]">
                  {distanceM.toFixed(1)} m ({computed.distanceAttenuationDb.toFixed(1)} dB)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={distanceM}
                onChange={(e) => setDistanceM(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                <span>1.0 m (Ref)</span>
                <span>8.0 m</span>
                <span>15.0 m</span>
              </div>
            </div>

            {/* Acoustic Enclosure Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setEnclosureActive((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-full border px-4 py-3 text-xs font-bold transition-all ${
                  enclosureActive
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-xs'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {pick(
                    'Acoustic Enclosure Attenuation (-12 dB)',
                    'Penutup Akustik / Enclosure (-12 dB)',
                    '防音エンクロージャ (-12 dB)'
                  )}
                </span>
                <span className="font-mono">
                  {enclosureActive ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
