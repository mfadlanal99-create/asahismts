import { useCallback, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Sliders,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  FAULT_SCENARIOS,
  MACHINE_CLASSES,
  PROBE_POINTS,
  computePointReading,
  type FaultScenarioId,
  type IsoZone,
  type MachineClassId,
  type ProbePointId,
  type VibrationMode,
} from './vibrationMeterPhysics';
import { VibrationMeterSvg } from './VibrationMeterSvg';

export function VibrationMeterSimulator() {
  const { pick } = useLanguage();

  const [activePoint, setActivePoint] = useState<ProbePointId>('pump-de');
  const [mode, setMode] = useState<VibrationMode>('velocity');
  const [rpm, setRpm] = useState<number>(1800);
  const [machineClassId, setMachineClassId] =
    useState<MachineClassId>('group2-rigid');
  const [scenarioId, setScenarioId] = useState<FaultScenarioId>('healthy');

  const activeScenario = useMemo(
    () => FAULT_SCENARIOS.find((s) => s.id === scenarioId) ?? FAULT_SCENARIOS[0],
    [scenarioId]
  );

  const activeClass = useMemo(
    () => MACHINE_CLASSES.find((c) => c.id === machineClassId) ?? MACHINE_CLASSES[0],
    [machineClassId]
  );

  const allPointReadings = useMemo(
    () =>
      PROBE_POINTS.map((pt) => ({
        spec: pt,
        reading: computePointReading(pt.id, activeScenario, rpm, activeClass),
      })),
    [activeScenario, rpm, activeClass]
  );

  const activeReading = useMemo(
    () =>
      allPointReadings.find((r) => r.spec.id === activePoint)?.reading ??
      allPointReadings[0].reading,
    [allPointReadings, activePoint]
  );

  const handleCycleMode = useCallback(() => {
    setMode((prev) =>
      prev === 'velocity'
        ? 'acceleration'
        : prev === 'acceleration'
          ? 'displacement'
          : prev === 'displacement'
            ? 'bearing'
            : 'velocity'
    );
  }, []);

  const zoneBadgeClass = (zone: IsoZone) => {
    if (zone === 'A')
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (zone === 'B')
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    if (zone === 'C')
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN (7 cols): SVG + 4-Point Route Comparison + Diagnostic Card */}
        <div className="lg:col-span-7 space-y-5">
          <VibrationMeterSvg
            activePoint={activePoint}
            mode={mode}
            rpm={rpm}
            scenarioId={scenarioId}
            machineClass={activeClass}
            reading={activeReading}
            onSelectPoint={setActivePoint}
            onCycleMode={handleCycleMode}
          />

          {/* 4-Point Route Comparison Grid */}
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-violet-500" />
                {pick(
                  '4-Point Bearing Route Matrix',
                  'Matriks Pengukuran Rute 4 Titik Bantalan',
                  '4点軸受ルート計測マトリックス'
                )}
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                ISO 10816-3: {activeClass.thresholds.join(' / ')} mm/s
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {allPointReadings.map(({ spec, reading }) => {
                const isSelected = spec.id === activePoint;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setActivePoint(spec.id)}
                    className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/10 dark:bg-violet-500/15 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 hover:border-violet-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {spec.label}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${zoneBadgeClass(reading.isoZone)}`}
                      >
                        Zone {reading.isoZone}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                      <span>VEL: {reading.velocityRmsMmS.toFixed(2)} mm/s</span>
                      <span>ACC: {reading.accelPeakG.toFixed(2)} g</span>
                      <span>DISP: {reading.displacementPpUm.toFixed(0)} μm</span>
                      <span
                        className={
                          reading.bduStatus === 'critical'
                            ? 'text-rose-500 font-bold'
                            : reading.bduStatus === 'caution'
                              ? 'text-amber-500 font-bold'
                              : ''
                        }
                      >
                        BDU: {reading.bearingBdu.toFixed(0)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Interpretation Card */}
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#001F6B] dark:text-blue-300 flex items-center gap-2">
                {scenarioId === 'healthy' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                {pick(
                  'Field Diagnostic Interpretation',
                  'Interpretasi Diagnostik Lapangan',
                  '現場診断および推奨処置'
                )}
              </h3>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {pick(
                  activeScenario.name,
                  activeScenario.nameId,
                  activeScenario.nameJa
                )}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {pick(
                activeScenario.diagnosis,
                activeScenario.diagnosisId,
                activeScenario.diagnosisJa
              )}
            </p>

            <div className="rounded-xl bg-[#001F6B]/5 dark:bg-blue-500/10 border border-[#001F6B]/15 dark:border-blue-500/20 p-3 flex items-start gap-2.5 text-xs">
              <Wrench className="h-4 w-4 text-[#002D9C] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#001F6B] dark:text-blue-300">
                  {pick('Recommended Action: ', 'Tindakan Disarankan: ', '推奨処置: ')}
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  {pick(
                    activeScenario.action,
                    activeScenario.actionId,
                    activeScenario.actionJa
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
              <h2 className="text-base font-bold text-[#001F6B] dark:text-blue-300 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-violet-500" />
                {pick(
                  'Vibration Meter & Fault Controls',
                  'Kontrol Alat Ukur & Skenario Gangguan',
                  '振動計・故障シナリオ設定'
                )}
              </h2>
              <Activity className="h-4 w-4 text-violet-500" />
            </div>

            {/* Measurement Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {pick('Measurement Mode', 'Mode Pengukuran', '測定モード')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'velocity', label: 'Velocity (mm/s RMS)' },
                    { id: 'acceleration', label: 'Accel (g Peak)' },
                    { id: 'displacement', label: 'Disp (μm P-P)' },
                    { id: 'bearing', label: 'Bearing (BDU)' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      mode === m.id
                        ? 'bg-violet-600 text-white border-violet-500 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Probe Point Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {pick('Magnetic Probe Placement', 'Posisi Probe Magnetik', 'マグネットプローブ位置')}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PROBE_POINTS.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setActivePoint(pt.id)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      activePoint === pt.id
                        ? 'bg-[#001F6B] text-white border-[#002D9C] shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Machine RPM */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {pick('Machine Speed (RPM)', 'Putaran Mesin (RPM)', '機械回転数 (RPM)')}
                </span>
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                  {rpm} RPM ({(rpm / 60).toFixed(1)} Hz)
                </span>
              </div>
              <input
                type="range"
                min={900}
                max={3600}
                step={50}
                value={rpm}
                onChange={(e) => setRpm(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5">
                {[1200, 1500, 1800, 3000, 3600].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRpm(preset)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border cursor-pointer ${
                      rpm === preset
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* ISO 10816-3 Machine Class & Foundation */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {pick(
                  'ISO 10816-3 Power & Foundation Class',
                  'Kelas Daya & Fondasi ISO 10816-3',
                  'ISO 10816-3 出力・基礎クラス'
                )}
              </label>
              <div className="grid gap-1.5">
                {MACHINE_CLASSES.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setMachineClassId(cls.id)}
                    className={`text-left px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      machineClassId === cls.id
                        ? 'bg-[#002D9C] text-white border-blue-500 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70'
                    }`}
                  >
                    <div className="font-semibold">
                      {pick(cls.label, cls.labelId, cls.labelJa)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fault Scenarios */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {pick('Fault Scenario', 'Skenario Kerusakan', '故障シナリオ')}
              </label>
              <div className="grid gap-1.5">
                {FAULT_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setScenarioId(sc.id)}
                    className={`text-left px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                      scenarioId === sc.id
                        ? 'bg-violet-600 text-white border-violet-500 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/70 hover:border-violet-400'
                    }`}
                  >
                    <div className="font-semibold">
                      {pick(sc.name, sc.nameId, sc.nameJa)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
