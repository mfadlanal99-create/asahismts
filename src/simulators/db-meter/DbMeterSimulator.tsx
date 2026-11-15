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
      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
      : computed.osha.status === 'action'
        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

  const nioshBadgeClass =
    computed.niosh.status === 'exceeded'
      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
      : computed.niosh.status === 'action'
        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';

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
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-emerald-500" />
                {pick(
                  `Octave-Band Spectrum (${weighting} Weighted)`,
                  `Spektrum Pita Oktaf (Pembobotan ${weighting})`,
                  `オクターブバンドスペクトル (${weighting} 特性)`
                )}
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded-md bg-[#001F6B]/10 dark:bg-blue-500/15 text-[#001F6B] dark:text-blue-300">
                  dBA: {computed.equivalentDba.toFixed(1)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  dBC: {computed.equivalentDbc.toFixed(1)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  dBZ: {computed.equivalentDbz.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2 items-end h-32 pt-4">
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
                  <div key={hz} className="flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {val.toFixed(0)}
                    </span>
                    <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 rounded-t-md h-20 flex items-end overflow-hidden">
                      <div
                        className={`w-full ${barCol} transition-all duration-200 rounded-t-md`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {hz >= 1000 ? `${hz / 1000}k` : hz}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
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
            <div className="glass-panel rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#001F6B] dark:text-blue-300">
                    OSHA 29 CFR 1910.95
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    90 dBA Criterion • 5 dB Exchange
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${oshaBadgeClass}`}
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

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {pick('Max Exposure Time', 'Waktu Maksimum', '許容ばく露時間')}
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                    {formatExposureDuration(computed.osha.permissibleHours)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {pick('8h TWA Dose', 'Dosis TWA 8 Jam', '8時間TWA線量')}
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                    {computed.osha.dose8hPercent.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* NIOSH Card */}
            <div className="glass-panel rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#001F6B] dark:text-blue-300">
                    NIOSH REL (1998)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    85 dBA Criterion • 3 dB Exchange
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${nioshBadgeClass}`}
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

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {pick('Max Exposure Time', 'Waktu Maksimum', '許容ばく露時間')}
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                    {formatExposureDuration(computed.niosh.permissibleHours)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {pick('8h TWA Dose', 'Dosis TWA 8 Jam', '8時間TWA線量')}
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                    {computed.niosh.dose8hPercent.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
              <h2 className="text-base font-bold text-[#001F6B] dark:text-blue-300 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-500" />
                {pick(
                  'Acoustic Measurement Controls',
                  'Kontrol Pengukuran Akustik',
                  '音響測定コントロール'
                )}
              </h2>
              <button
                type="button"
                onClick={handleResetPeak}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {pick('Reset Peak', 'Reset Puncak', 'ピークリセット')}
              </button>
            </div>

            {/* Machine Acoustic Source */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
                      className={`text-left px-3 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        active
                          ? 'bg-[#001F6B] text-white border-[#002D9C] shadow-sm'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70 hover:border-emerald-400'
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {pick('Frequency Weighting (IEC 61672)', 'Pembobotan Frekuensi', '周波数重み付け')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['dBA', 'dBC', 'dBZ'] as FrequencyWeighting[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleSelectWeighting(w)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      weighting === w
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Weighting */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {pick('Time Weighting', 'Pembobotan Waktu', '時間重み付け')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimeWeighting('FAST')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    timeWeighting === 'FAST'
                      ? 'bg-[#002D9C] text-white border-blue-500 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
                  }`}
                >
                  FAST (125 ms)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeWeighting('SLOW')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    timeWeighting === 'SLOW'
                      ? 'bg-[#002D9C] text-white border-blue-500 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
                  }`}
                >
                  SLOW (1 s)
                </button>
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {pick('Microphone Distance', 'Jarak Mikrofon', 'マイク距離')}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  enclosureActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
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
