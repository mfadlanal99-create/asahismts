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
            <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-cyan-500" />
                  {pick(
                    'Optical Laser Tachometer Readouts & Hold Memory',
                    'Pembacaan Takometer Laser & Memori Hold',
                    'レーザータコメータ計測値・ホールドメモリ'
                  )}
                </h3>
                <button
                  type="button"
                  onClick={handleResetStats}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {pick('Reset Min/Max', 'Reset Min/Maks', '最小/最大リセット')}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {pick('Shaft Speed (RPM)', 'Kecepatan Poros (RPM)', '回転速度 (RPM)')}
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {isOnTarget && laserActive ? drive.rotorRpm.toFixed(1) : '---.-'}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {pick('Pulse Rate (RPS / Hz)', 'Frekuensi Pulsa (Hz)', 'パルス周波数 (RPS/Hz)')}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-0.5">
                    {isOnTarget && laserActive ? drive.rps.toFixed(2) : '--.--'}{' '}
                    <span className="text-xs font-normal">Hz</span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {pick('Angular Velocity (ω)', 'Kecepatan Sudut (ω)', '角速度 (ω)')}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-0.5">
                    {isOnTarget && laserActive ? drive.omegaRadS.toFixed(1) : '---.-'}{' '}
                    <span className="text-xs font-normal">rad/s</span>
                  </div>
                </div>
              </div>

              {/* Min / Max / Avg Hold Bar */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    MIN HOLD
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">
                    {stats.minRpm.toFixed(1)} RPM
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    AVG HOLD
                  </div>
                  <div className="text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400">
                    {avgRpm.toFixed(1)} RPM
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 px-3 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    MAX HOLD
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">
                    {stats.maxRpm.toFixed(1)} RPM
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-500" />
                {pick(
                  'Stroboscope Harmonic & Alias Diagnostics',
                  'Diagnostik Harmonik & Alias Stroboskop',
                  'ストロボ高調波・エイリアス診断'
                )}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {pick('Flash Rate', 'Laju Kilat', '発光周波数')}
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">
                    {strobe.strobeFpm.toFixed(0)} FPM
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 p-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {pick('FPM / RPM Ratio', 'Rasio FPM / RPM', 'FPM / RPM 比')}
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                    {strobe.ratio.toFixed(2)}×
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 p-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {pick('Apparent Images', 'Jumlah Bayangan', '見かけの像数')}
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                    {strobe.apparentImages}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 p-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {pick('Alias Drift', 'Geser Alias', 'ドリフト速度')}
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
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
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-cyan-500" />
                {pick('Instrument Mode', 'Mode Instrumen', '計測モード')}
              </h3>
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#001F6B] hover:bg-[#002D9C] text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
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

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('laser')}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                  mode === 'laser'
                    ? 'bg-[#001F6B] text-white border-[#002D9C] shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                }`}
              >
                <ScanLine className="h-4 w-4" />
                {pick('Laser Tachometer', 'Takometer Laser', 'レーザータコメータ')}
              </button>
              <button
                type="button"
                onClick={() => setMode('stroboscope')}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                  mode === 'stroboscope'
                    ? 'bg-[#001F6B] text-white border-[#002D9C] shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                }`}
              >
                <Zap className="h-4 w-4" />
                {pick('Stroboscope', 'Stroboskop', 'ストロボスコープ')}
              </button>
            </div>

            {mode === 'laser' ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 px-3.5 py-2.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {pick('650 nm Laser Emitter', 'Pemancar Laser 650 nm', '650 nm レーザー照射')}
                </span>
                <button
                  type="button"
                  onClick={() => setLaserActive((prev) => !prev)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    laserActive
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
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
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {pick('Strobe Flash Rate (FPM)', 'Laju Kilat Strobo (FPM)', 'ストロボ発光周波数 (FPM)')}
                  </span>
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
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
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 py-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setStrobeFpm(Math.round(drive.rotorRpm))}
                    className="rounded-lg bg-emerald-600/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 py-1.5 text-[11px] font-semibold hover:bg-emerald-600/25 cursor-pointer"
                  >
                    1× RPM ({Math.round(drive.rotorRpm)})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStrobeFpm(Math.min(6000, Math.round(drive.rotorRpm * 2)))
                    }
                    className="rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 py-1.5 text-[11px] font-semibold hover:bg-amber-500/25 cursor-pointer"
                  >
                    2× RPM
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStrobeFpm(Math.max(200, Math.round(drive.rotorRpm / 2)))
                    }
                    className="rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 py-1.5 text-[11px] font-semibold hover:bg-rose-500/25 cursor-pointer"
                  >
                    ½× RPM
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Motor Drive & VFD Physics Controls */}
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-500" />
              {pick('VFD Motor Drive Controls', 'Kontrol Penggerak Motor VFD', 'VFDモータ駆動制御')}
            </h3>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              {DRIVE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`rounded-xl px-2.5 py-2 text-left text-[11px] font-medium border transition-colors cursor-pointer ${
                    presetId === preset.id
                      ? 'bg-[#001F6B] text-white border-[#002D9C]'
                      : 'bg-white/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-500/40'
                  }`}
                >
                  {pick(preset.label, preset.labelId, preset.labelJa)}
                </button>
              ))}
            </div>

            {/* VFD Frequency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pick('VFD Supply Frequency', 'Frekuensi Suplai VFD', 'VFD電源周波数')}
                </span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
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
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {pick('Motor Pole Count (P)', 'Jumlah Kutub Motor (P)', 'モータ極数 (P)')}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {([2, 4, 6, 8] as PoleCount[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePolesChange(p)}
                    className={`rounded-lg py-1.5 text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                      poles === p
                        ? 'bg-[#001F6B] text-white border-[#002D9C]'
                        : 'bg-white/60 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
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
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pick('Shaft Load Torque', 'Torsi Beban Poros', '軸負荷トルク')}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
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
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 p-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Ns = 120f/P
                </div>
                <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">
                  {drive.syncRpm.toFixed(0)} RPM
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {pick('Rotor Nr', 'Rotor Nr', '実回転 Nr')}
                </div>
                <div className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
                  {drive.rotorRpm.toFixed(1)} RPM
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {pick('Slip s%', 'Slip s%', 'すべり s%')}
                </div>
                <div className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                  {drive.slipPct.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Field Tip Card */}
          <div className="glass-panel rounded-2xl p-4 shadow-xs text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <Activity className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
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
