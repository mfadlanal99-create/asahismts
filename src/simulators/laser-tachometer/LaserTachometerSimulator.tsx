import { useMemo, useState } from 'react';
import {
  Activity,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Sliders,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LaserTachometerSvg } from './LaserTachometerSvg';
import {
  DRIVE_PRESETS,
  analyzeStroboscope,
  calculateMotorDrive,
  type DrivePresetId,
  type InstrumentMode,
  type PoleCount,
} from './laserTachometerPhysics';

interface SpeedStats {
  minRpm: number;
  maxRpm: number;
  sumRpm: number;
  samples: number;
}

export function LaserTachometerSimulator() {
  const { pick } = useLanguage();

  const [mode, setMode] = useState<InstrumentMode>('laser');
  const [presetId, setPresetId] = useState<DrivePresetId>('vfd-fan-4p');
  const [vfdFreqHz, setVfdFreqHz] = useState<number>(50);
  const [poles, setPoles] = useState<PoleCount>(4);
  const [loadTorquePct, setLoadTorquePct] = useState<number>(70);
  const [strobeFpm, setStrobeFpm] = useState<number>(1461);
  const [laserActive, setLaserActive] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isOnTarget, setIsOnTarget] = useState<boolean>(true);

  const drive = useMemo(
    () => calculateMotorDrive(vfdFreqHz, poles, loadTorquePct),
    [vfdFreqHz, poles, loadTorquePct]
  );

  const strobe = useMemo(
    () => analyzeStroboscope(drive.rotorRpm, strobeFpm),
    [drive.rotorRpm, strobeFpm]
  );

  const [stats, setStats] = useState<SpeedStats>(() => ({
    minRpm: drive.rotorRpm,
    maxRpm: drive.rotorRpm,
    sumRpm: drive.rotorRpm,
    samples: 1,
  }));

  const recordSample = (nextFreq: number, nextPoles: PoleCount, nextLoad: number) => {
    const next = calculateMotorDrive(nextFreq, nextPoles, nextLoad);
    setStats((prev) => ({
      minRpm: Math.min(prev.minRpm, next.rotorRpm),
      maxRpm: Math.max(prev.maxRpm, next.rotorRpm),
      sumRpm: prev.sumRpm + next.rotorRpm,
      samples: prev.samples + 1,
    }));
  };

  const handleSelectPreset = (id: DrivePresetId) => {
    const preset = DRIVE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setVfdFreqHz(preset.vfdFreqHz);
    setPoles(preset.poles);
    setLoadTorquePct(preset.loadTorquePct);
    setStrobeFpm(preset.initialStrobeFpm);
    recordSample(preset.vfdFreqHz, preset.poles, preset.loadTorquePct);
  };

  const handleFreqChange = (val: number) => {
    setVfdFreqHz(val);
    recordSample(val, poles, loadTorquePct);
  };

  const handlePolesChange = (val: PoleCount) => {
    setPoles(val);
    recordSample(vfdFreqHz, val, loadTorquePct);
  };

  const handleLoadChange = (val: number) => {
    setLoadTorquePct(val);
    recordSample(vfdFreqHz, poles, val);
  };

  const handleResetStats = () => {
    setStats({
      minRpm: drive.rotorRpm,
      maxRpm: drive.rotorRpm,
      sumRpm: drive.rotorRpm,
      samples: 1,
    });
  };

  const avgRpm = stats.samples > 0 ? stats.sumRpm / stats.samples : drive.rotorRpm;

  const adjustStrobe = (delta: number) => {
    setStrobeFpm((prev) => Math.max(200, Math.min(6000, Math.round(prev + delta))));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN: INTERACTIVE SVG & LIVE TELEMETRY (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <LaserTachometerSvg
            mode={mode}
            drive={drive}
            strobe={strobe}
            laserActive={laserActive}
            isRunning={isRunning}
            onAimChange={setIsOnTarget}
          />

          {/* Live Readout Cards */}
          {mode === 'laser' ? (
            <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5" data-tour="tach-readouts">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  <ScanLine className="h-4 w-4 text-[var(--md-primary)]" />
                  {pick(
                    'Optical Laser Tachometer Readouts & Hold Memory',
                    'Pembacaan Takometer Laser & Memori Hold',
                    'レーザータコメータ計測値・ホールドメモリ'
                  )}
                </h3>
                <button
                  type="button"
                  onClick={handleResetStats}
                  className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {pick('Reset Min/Max', 'Reset Min/Maks', '最小/最大リセット')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-[var(--md-primary)]/45 bg-[var(--md-primary-container)]/60 p-3.5">
                  <div className="text-[11px] font-semibold text-[var(--md-on-primary-container)]/80">
                    {pick('Shaft Speed (RPM)', 'Kecepatan Poros (RPM)', '回転速度 (RPM)')}
                  </div>
                  <div className="mt-0.5 font-mono text-xl font-extrabold text-[var(--md-primary)]">
                    {isOnTarget && laserActive ? drive.rotorRpm.toFixed(1) : '---.-'}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                  <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('Pulse Rate (RPS / Hz)', 'Frekuensi Pulsa (RPS / Hz)', 'パルス周波数 (RPS/Hz)')}
                  </div>
                  <div className="mt-0.5 font-mono text-xl font-bold text-[var(--md-on-surface)]">
                    {isOnTarget && laserActive ? drive.rps.toFixed(2) : '--.--'}{' '}
                    <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">Hz</span>
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                  <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('Angular Velocity (ω)', 'Kecepatan Sudut (ω)', '角速度 (ω)')}
                  </div>
                  <div className="mt-0.5 font-mono text-xl font-bold text-[var(--md-on-surface)]">
                    {isOnTarget && laserActive ? drive.omegaRadS.toFixed(1) : '---.-'}{' '}
                    <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">rad/s</span>
                  </div>
                </div>
              </div>

              {/* Min / Max / Avg Hold Bar */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                    MIN HOLD
                  </div>
                  <div className="font-mono text-sm font-bold text-[var(--md-on-surface)]">
                    {stats.minRpm.toFixed(1)} RPM
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                    AVG HOLD
                  </div>
                  <div className="font-mono text-sm font-bold text-[var(--md-primary)]">
                    {avgRpm.toFixed(1)} RPM
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2.5 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                    MAX HOLD
                  </div>
                  <div className="font-mono text-sm font-bold text-[var(--md-on-surface)]">
                    {stats.maxRpm.toFixed(1)} RPM
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5" data-tour="tach-readouts">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Zap className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Stroboscope Harmonic & Alias Diagnostics',
                  'Diagnostik Harmonik & Alias Stroboskop',
                  'ストロボ高調波・エイリアス診断'
                )}
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-[22px] border border-[var(--md-primary)]/45 bg-[var(--md-primary-container)]/60 p-3.5">
                  <div className="text-[11px] font-semibold text-[var(--md-on-primary-container)]/80">
                    {pick('Flash Rate', 'Frekuensi Kilatan', '発光周波数')}
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-extrabold text-[var(--md-primary)]">
                    {strobe.strobeFpm.toFixed(0)} FPM
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                  <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('FPM / RPM Ratio', 'Rasio FPM / RPM', 'FPM / RPM 比')}
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                    {strobe.ratio.toFixed(2)}×
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                  <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('Apparent Images', 'Jumlah Bayangan', '見かけの像数')}
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                    {strobe.apparentImages}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                  <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('Alias Drift', 'Pergeseran Alias', 'ドリフト速度')}
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                    {strobe.apparentRpm >= 0 ? '+' : ''}
                    {strobe.apparentRpm.toFixed(1)} RPM
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CONTROLS (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Instrument Mode & Transport */}
          <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5" data-tour="tach-mode-panel">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('Instrument Mode', 'Mode Instrumen', '計測モード')}
              </h3>
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className="m3-btn-filled inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    {pick('Pause Shaft', 'Jeda Poros', '回転停止')}
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    {pick('Run Shaft', 'Putar Poros', '回転再開')}
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
              <button
                type="button"
                onClick={() => setMode('laser')}
                className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs transition ${
                  mode === 'laser'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                <ScanLine className="h-4 w-4" />
                {pick('Laser Tachometer', 'Takometer Laser', 'レーザータコメータ')}
              </button>
              <button
                type="button"
                onClick={() => setMode('stroboscope')}
                className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs transition ${
                  mode === 'stroboscope'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                <Zap className="h-4 w-4" />
                {pick('Stroboscope', 'Stroboskop', 'ストロボスコープ')}
              </button>
            </div>

            {mode === 'laser' ? (
              <div className="flex items-center justify-between rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-4 py-2.5">
                <span className="text-xs font-semibold text-[var(--md-on-surface)]">
                  {pick('650 nm Laser Emitter', 'Pemancar Laser 650 nm', '650 nm レーザー照射')}
                </span>
                <button
                  type="button"
                  onClick={() => setLaserActive((prev) => !prev)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    laserActive
                      ? 'border-rose-500/40 bg-rose-600 text-white hover:bg-rose-500'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  {laserActive
                    ? pick('LASER ON', 'LASER AKTIF', 'レーザーON')
                    : pick('STANDBY', 'SIAGA', '待機中')}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--md-on-surface)]">
                    {pick('Strobe Flash Rate (FPM)', 'Frekuensi Kilatan Strobo (FPM)', 'ストロボ発光周波数 (FPM)')}
                  </span>
                  <span className="font-mono font-extrabold text-[var(--md-primary)]">
                    {strobeFpm} FPM
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={6000}
                  step={1}
                  value={strobeFpm}
                  onChange={(e) => setStrobeFpm(Number(e.target.value))}
                  className="w-full"
                />
                <div className="grid grid-cols-4 gap-1.5">
                  {[-10, -1, 1, 10].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => adjustStrobe(delta)}
                      className="glass-pill rounded-full py-1.5 font-mono text-xs font-semibold"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStrobeFpm(Math.round(drive.rotorRpm))}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/15 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-500/25 dark:text-emerald-300"
                  >
                    1× RPM ({Math.round(drive.rotorRpm)})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStrobeFpm(Math.min(6000, Math.round(drive.rotorRpm * 2)))
                    }
                    className="rounded-full border border-amber-500/40 bg-amber-500/15 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-500/25 dark:text-amber-300"
                  >
                    2× RPM
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStrobeFpm(Math.max(200, Math.round(drive.rotorRpm / 2)))
                    }
                    className="rounded-full border border-rose-500/40 bg-rose-500/15 py-1.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-500/25 dark:text-rose-300"
                  >
                    ½× RPM
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Motor Drive & VFD Physics Controls */}
          <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5" data-tour="tach-vfd-drive">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <Sliders className="h-4 w-4 text-[var(--md-primary)]" />
              {pick('VFD Motor Drive Controls', 'Kontrol Penggerak Motor VFD', 'VFDモータ駆動制御')}
            </h3>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {DRIVE_PRESETS.map((preset) => {
                const isSelected = presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`rounded-[20px] border px-3 py-2.5 text-left text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {pick(preset.label, preset.labelId, preset.labelJa)}
                  </button>
                );
              })}
            </div>

            {/* VFD Frequency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick('VFD Supply Frequency', 'Frekuensi Suplai VFD', 'VFD電源周波数')}
                </span>
                <span className="font-mono font-extrabold text-[var(--md-primary)]">
                  {vfdFreqHz} Hz
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={vfdFreqHz}
                onChange={(e) => handleFreqChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Pole Count */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[var(--md-on-surface)]">
                {pick('Motor Pole Count (P)', 'Jumlah Kutub Motor (P)', 'モータ極数 (P)')}
              </div>
              <div className="grid grid-cols-4 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                {([2, 4, 6, 8] as PoleCount[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePolesChange(p)}
                    className={`rounded-full py-1.5 font-mono text-xs transition ${
                      poles === p
                        ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {p}P
                  </button>
                ))}
              </div>
            </div>

            {/* Load Torque */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick('Shaft Load Torque', 'Torsi Beban Poros', '軸負荷トルク')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {loadTorquePct}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={loadTorquePct}
                onChange={(e) => handleLoadChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Drive Summary */}
            <div className="grid grid-cols-3 gap-2 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-center" data-tour="tach-drive-summary">
              <div>
                <div className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">
                  Ns = 120f/P
                </div>
                <div className="font-mono text-xs font-bold text-[var(--md-on-surface)]">
                  {drive.syncRpm.toFixed(0)} RPM
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">
                  {pick('Rotor Nr', 'Rotor Nr', '実回転 Nr')}
                </div>
                <div className="font-mono text-xs font-bold text-[var(--md-primary)]">
                  {drive.rotorRpm.toFixed(1)} RPM
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">
                  {pick('Slip s%', 'Slip s%', 'すべり s%')}
                </div>
                <div className="font-mono text-xs font-bold text-[var(--md-primary)]">
                  {drive.slipPct.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Field Tip Card */}
          <div className="glass-panel flex items-start gap-2.5 rounded-[28px] p-4 text-xs text-[var(--md-on-surface-variant)]" data-tour="tach-field-tip">
            <Activity className="mt-0.5 h-4 w-4 shrink-0 text-[var(--md-primary)]" />
            <p className="leading-relaxed">
              {pick(
                'Field Tip: In Stroboscope mode, try clicking 2× RPM to observe the harmonic double-image (two tape strips 180° apart), or adjust FPM by ±2 from RPM to observe forward/backward alias drift.',
                'Tips Lapangan: Pada mode Stroboskop, coba klik 2× RPM untuk melihat bayangan ganda harmonik (dua pita 180° berseberangan), atau geser FPM ±2 dari RPM untuk mengamati pergeseran alias maju/mundur.',
                '現場ヒント: ストロボモードで「2× RPM」を押すと180°対向の高調波二重像が、RPMからFPMを±2ずらすと正転/逆転エイリアスドリフトが観察できます。'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
