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
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35';
    if (zone === 'B')
      return 'bg-sky-500/20 text-sky-800 dark:text-sky-200 border-sky-500/35';
    if (zone === 'C')
      return 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/35';
    return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35';
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
          <div data-tour="vmeter-route" className="glass-panel space-y-3.5 rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <MapPin className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  '4-Point Bearing Route Matrix',
                  'Matriks Pengukuran Rute 4 Titik Bantalan',
                  '4点軸受ルート計測マトリックス'
                )}
              </h3>
              <span className="rounded-full bg-[var(--md-surface-container-high)] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
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
                    className={`rounded-[20px] border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-bold">
                        {spec.label}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${zoneBadgeClass(reading.isoZone)}`}
                      >
                        Zone {reading.isoZone}
                      </span>
                    </div>
                    <div
                      className={`grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] ${
                        isSelected
                          ? 'text-[var(--md-on-primary-container)]/85'
                          : 'text-[var(--md-on-surface-variant)]'
                      }`}
                    >
                      <span>VEL: {reading.velocityRmsMmS.toFixed(2)} mm/s</span>
                      <span>ACC: {reading.accelPeakG.toFixed(2)} g</span>
                      <span>DISP: {reading.displacementPpUm.toFixed(0)} μm</span>
                      <span
                        className={
                          reading.bduStatus === 'critical'
                            ? 'font-bold text-rose-700 dark:text-rose-300'
                            : reading.bduStatus === 'caution'
                              ? 'font-bold text-amber-800 dark:text-amber-200'
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
          <div data-tour="vmeter-diagnostic" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
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
              <span className="rounded-full bg-[var(--md-primary-container)] px-3 py-1 text-xs font-bold text-[var(--md-on-primary-container)]">
                {pick(
                  activeScenario.name,
                  activeScenario.nameId,
                  activeScenario.nameJa
                )}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[var(--md-on-surface-variant)]">
              {pick(
                activeScenario.diagnosis,
                activeScenario.diagnosisId,
                activeScenario.diagnosisJa
              )}
            </p>

            <div className="flex items-start gap-2.5 rounded-[22px] border border-[var(--md-outline-variant)]/45 bg-[var(--md-secondary-container)] p-3.5 text-xs text-[var(--md-on-secondary-container)]">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[var(--md-primary)]" />
              <div>
                <span className="font-bold">
                  {pick('Recommended Action: ', 'Tindakan Disarankan: ', '推奨処置: ')}
                </span>
                <span className="opacity-90">
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
          <div className="glass-panel space-y-5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--md-on-surface)]">
                <Sliders className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Vibration Meter & Fault Controls',
                  'Kontrol Alat Ukur Getaran & Skenario Gangguan',
                  '振動計・故障シナリオ設定'
                )}
              </h2>
              <Activity className="h-4 w-4 text-[var(--md-primary)]" />
            </div>

            {/* Measurement Mode */}
            <div data-tour="vmeter-modes" className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
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
                ).map((m) => {
                  const isSelected = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`rounded-[20px] border px-3 py-2.5 text-left text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Probe Point Selector */}
            <div data-tour="vmeter-probe" className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Magnetic Probe Placement', 'Posisi Probe Magnetik', 'マグネットプローブ位置')}
              </label>
              <div className="grid grid-cols-4 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                {PROBE_POINTS.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setActivePoint(pt.id)}
                    className={`rounded-full px-1 py-2 text-[11px] transition ${
                      activePoint === pt.id
                        ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Machine RPM */}
            <div data-tour="vmeter-rpm" className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Machine Speed (RPM)', 'Putaran Mesin (RPM)', '機械回転数 (RPM)')}
                </span>
                <span className="font-mono font-extrabold text-[var(--md-primary)]">
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
                className="w-full"
              />
              <div className="flex flex-wrap gap-1.5">
                {[1200, 1500, 1800, 3000, 3600].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRpm(preset)}
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] transition ${
                      rpm === preset
                        ? 'border-[var(--md-primary)] bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* ISO 10816-3 Machine Class & Foundation */}
            <div data-tour="vmeter-iso-class" className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick(
                  'ISO 10816-3 Power & Foundation Class',
                  'Kelas Daya & Fondasi ISO 10816-3',
                  'ISO 10816-3 出力・基礎クラス'
                )}
              </label>
              <div className="grid gap-1.5">
                {MACHINE_CLASSES.map((cls) => {
                  const isSelected = machineClassId === cls.id;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setMachineClassId(cls.id)}
                      className={`rounded-[20px] border px-3.5 py-2.5 text-left text-xs transition-all ${
                        isSelected
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <div className="font-semibold">
                        {pick(cls.label, cls.labelId, cls.labelJa)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fault Scenarios */}
            <div data-tour="vmeter-faults" className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Fault Scenario', 'Skenario Gangguan', '故障シナリオ')}
              </label>
              <div className="grid gap-1.5">
                {FAULT_SCENARIOS.map((sc) => {
                  const isSelected = scenarioId === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setScenarioId(sc.id)}
                      className={`rounded-[20px] border px-3.5 py-2.5 text-left text-xs transition-all ${
                        isSelected
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <div className="font-semibold">
                        {pick(sc.name, sc.nameId, sc.nameJa)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
