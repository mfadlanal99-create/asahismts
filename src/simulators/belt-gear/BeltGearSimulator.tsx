import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cog,
  Disc,
  Pause,
  Play,
  RotateCcw,
  Thermometer,
  Volume2,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BeltGearCanvas } from './BeltGearCanvas';
import {
  BELT_SECTION_SPECS,
  calculateSpurGear,
  calculateVBelt,
  DEFAULT_SPUR_GEAR_PARAMS,
  DEFAULT_VBELT_PARAMS,
  type BeltSection,
  type DriveMode,
  DRIVE_FAULTS,
  type DriveFaultScenario,
  type FaultId,
  type MaintenanceStatus,
  type SpurGearParams,
  type VBeltParams,
} from './beltGearPhysics';
import { TroubleshootingPanel } from './TroubleshootingPanel';

const BELT_SECTIONS: BeltSection[] = ['Z / 3V', 'A', 'B / 5V', 'C'];

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: SliderControlProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--md-on-surface)]">
          {label}
        </span>
        <span className="rounded-full bg-[var(--md-surface-container-high)] px-2.5 py-0.5 font-mono font-bold text-[var(--md-primary)]">
          {Number.isInteger(step) ? value : value.toFixed(2)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function getStatusBadgeClasses(status: MaintenanceStatus): string {
  switch (status) {
    case 'Properly Tensioned':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300';
    case 'Loose':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300';
    case 'Over-tightened':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300';
  }
}

export function BeltGearSimulator() {
  const { pick } = useLanguage();
  const [driveMode, setDriveMode] = useState<DriveMode>('v-belt');
  const [isRunning, setIsRunning] = useState(true);
  const [vBeltParams, setVBeltParams] =
    useState<VBeltParams>(DEFAULT_VBELT_PARAMS);
  const [spurParams, setSpurParams] = useState<SpurGearParams>(
    DEFAULT_SPUR_GEAR_PARAMS
  );

  // Troubleshooting mode state
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [activeFaultId, setActiveFaultId] = useState<FaultId | null>(null);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [guessedFaultId, setGuessedFaultId] = useState<FaultId | null>(null);

  const vBeltResults = useMemo(
    () => calculateVBelt(vBeltParams),
    [vBeltParams]
  );
  const spurResults = useMemo(
    () => calculateSpurGear(spurParams),
    [spurParams]
  );

  const activeStatus =
    driveMode === 'v-belt' ? vBeltResults.status : spurResults.status;
  const diagnosticNote =
    driveMode === 'v-belt'
      ? vBeltResults.diagnosticNote
      : spurResults.diagnosticNote;

  const activeTempC =
    driveMode === 'v-belt' ? vBeltResults.beltTempC : spurResults.gearTempC;
  const activeVibMmS =
    driveMode === 'v-belt'
      ? vBeltResults.vibrationMmS
      : spurResults.vibrationMmS;
  const activeNoiseDba =
    driveMode === 'v-belt' ? vBeltResults.noiseDba : spurResults.noiseDba;

  const handleReset = () => {
    if (driveMode === 'v-belt') {
      setVBeltParams(DEFAULT_VBELT_PARAMS);
    } else {
      setSpurParams(DEFAULT_SPUR_GEAR_PARAMS);
    }
    setActiveFaultId(null);
    setGuessedFaultId(null);
    setIsRunning(true);
  };

  const handleSelectBeltSection = (section: BeltSection) => {
    const spec = BELT_SECTION_SPECS[section];
    setVBeltParams((p) => ({
      ...p,
      beltSection: section,
      testForceN: spec.nominalTestForceN,
    }));
  };

  const handleSelectFault = (fault: DriveFaultScenario, blind: boolean) => {
    setShowTroubleshooting(true);
    setActiveFaultId(fault.id);
    setIsBlindMode(blind);
    setGuessedFaultId(null);
    setDriveMode(fault.driveMode);
    if (fault.vBeltPatch) {
      setVBeltParams({ ...DEFAULT_VBELT_PARAMS, ...fault.vBeltPatch });
    }
    if (fault.spurPatch) {
      setSpurParams({ ...DEFAULT_SPUR_GEAR_PARAMS, ...fault.spurPatch });
    }
  };

  const toggleTroubleshooting = () => {
    if (!showTroubleshooting) {
      handleSelectFault(DRIVE_FAULTS[0], false);
    } else {
      setShowTroubleshooting(false);
      setActiveFaultId(null);
      setGuessedFaultId(null);
    }
  };

  const minSafeCenter = Math.ceil((vBeltParams.d1 + vBeltParams.d2) / 2 + 25);

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div data-tour="belt-gear-mode" className="inline-flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
            <button
              type="button"
              onClick={() => setDriveMode('v-belt')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                driveMode === 'v-belt'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Disc className="h-3.5 w-3.5" />
              {pick('V-Belt Drive', 'Penggerak V-Belt', 'Vベルト駆動')}
            </button>
            <button
              type="button"
              onClick={() => setDriveMode('spur-gear')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                driveMode === 'spur-gear'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Cog className="h-3.5 w-3.5" />
              {pick('Spur Gear Drive', 'Penggerak Roda Gigi', '平歯車駆動')}
            </button>
          </div>

          <button
            type="button"
            data-tour="belt-gear-troubleshooting"
            onClick={toggleTroubleshooting}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              showTroubleshooting
                ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                : 'glass-pill font-semibold'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            {pick('Troubleshooting Mode', 'Mode Diagnosis Gangguan', '故障診断モード')}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
              activeStatus
            )}`}
          >
            {activeStatus === 'Properly Tensioned' ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            {activeStatus === 'Properly Tensioned'
              ? pick('Properly Tensioned', 'Ketegangan Tepat', '適正張力・かみ合い')
              : activeStatus === 'Loose'
                ? pick('Loose', 'Kendur', '緩み・バックラッシ過大')
                : pick('Over-tightened', 'Terlalu Kencang', '過張力・かじり')}
          </span>

          <button
            type="button"
            onClick={() => setIsRunning((r) => !r)}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                {pick('Pause', 'Jeda', '一時停止')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                {pick('Run', 'Jalankan', '運転')}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Troubleshooting Panel (when active) */}
      {showTroubleshooting && (
        <TroubleshootingPanel
          activeFaultId={activeFaultId}
          isBlindMode={isBlindMode}
          guessedFaultId={guessedFaultId}
          driveMode={driveMode}
          vBeltParams={vBeltParams}
          vBeltResults={vBeltResults}
          spurResults={spurResults}
          onSelectFault={handleSelectFault}
          onGuessFault={setGuessedFaultId}
          onExitTroubleshooting={() => {
            setShowTroubleshooting(false);
            setActiveFaultId(null);
            setGuessedFaultId(null);
          }}
        />
      )}

      {/* Live Readouts Strip */}
      <div data-tour="belt-gear-readouts" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--md-on-surface-variant)]">
            {pick('Speed Ratio (i)', 'Rasio Kecepatan (i)', '変速比 (i)')}
          </div>
          <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-primary)]">
            {(driveMode === 'v-belt'
              ? vBeltResults.speedRatio
              : spurResults.speedRatio
            ).toFixed(2)}
            :1
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--md-on-surface-variant)]">
            {pick('Output RPM (N₂)', 'Putaran Output (N₂)', '出力回転数 (N₂)')}
          </div>
          <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
            {(driveMode === 'v-belt'
              ? vBeltResults.outputRpm
              : spurResults.outputRpm
            ).toFixed(0)}{' '}
            <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">RPM</span>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--md-on-surface-variant)]">
            {pick('Output Torque (T₂)', 'Torsi Output (T₂)', '出力トルク (T₂)')}
          </div>
          <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
            {(driveMode === 'v-belt'
              ? vBeltResults.outputTorqueNm
              : spurResults.outputTorqueNm
            ).toFixed(1)}{' '}
            <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">N·m</span>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--md-on-surface-variant)]">
            {driveMode === 'v-belt'
              ? pick('Belt Length (L)', 'Panjang Sabuk (L)', 'ベルト長さ (L)')
              : pick('Center Distance (C)', 'Jarak Pusat (C)', '中心距離 (C)')}
          </div>
          <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
            {driveMode === 'v-belt'
              ? `${vBeltResults.beltLengthMm.toFixed(0)} mm`
              : `${spurResults.actualCenterDistanceMm.toFixed(2)} mm`}
          </div>
        </div>

        <div className="col-span-2 glass-card rounded-[24px] p-3.5 sm:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--md-on-surface-variant)]">
            {driveMode === 'v-belt'
              ? pick('Belt Slip / Eff.', 'Slip Sabuk / Ef.', 'スリップ / 効率')
              : pick('Backlash / Eff.', 'Celah Gigi / Ef.', 'バックラッシ / 効率')}
          </div>
          <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
            {driveMode === 'v-belt'
              ? `${vBeltResults.slipPercent.toFixed(1)}% / ${vBeltResults.efficiencyPercent.toFixed(0)}%`
              : `${spurResults.backlashMm.toFixed(3)} mm`}
          </div>
        </div>
      </div>

      {/* Main Workspace: Canvas + Controls */}
      <div className="grid gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* Left: Interactive Canvas & Live Drive Diagnostics */}
        <div className="space-y-3 lg:col-span-8">
          <BeltGearCanvas
            mode={driveMode}
            isRunning={isRunning}
            vBeltParams={vBeltParams}
            vBeltResults={vBeltResults}
            spurParams={spurParams}
            spurResults={spurResults}
          />

          {/* Live Drive Diagnostics Telemetry Strip */}
          <div data-tour="belt-gear-diagnostics" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                <Thermometer className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {driveMode === 'v-belt'
                  ? pick('Belt Temp', 'Suhu Sabuk', 'ベルト温度')
                  : pick('Mesh Temp', 'Suhu Roda Gigi', '歯面温度')}
              </div>
              <div
                className={`mt-0.5 font-mono text-sm font-bold ${
                  activeTempC > 65
                    ? 'text-rose-600 dark:text-rose-400'
                    : activeTempC > 52
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[var(--md-on-surface)]'
                }`}
              >
                {activeTempC.toFixed(1)} °C
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                <Disc className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {driveMode === 'v-belt'
                  ? pick('Belt Slip', 'Slip Sabuk', 'スリップ率')
                  : pick('Backlash (j)', 'Celah Gigi / Backlash (j)', 'バックラッシ (j)')}
              </div>
              <div
                className={`mt-0.5 font-mono text-sm font-bold ${
                  driveMode === 'v-belt'
                    ? vBeltResults.slipPercent > 2
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[var(--md-on-surface)]'
                    : spurResults.status !== 'Properly Tensioned'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[var(--md-on-surface)]'
                }`}
              >
                {driveMode === 'v-belt'
                  ? `${vBeltResults.slipPercent.toFixed(1)} %`
                  : `${spurResults.backlashMm.toFixed(3)} mm`}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                <Activity className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Vibration RMS', 'Getaran RMS', '振動 RMS')}
              </div>
              <div
                className={`mt-0.5 font-mono text-sm font-bold ${
                  activeVibMmS > 4.5
                    ? 'text-rose-600 dark:text-rose-400'
                    : activeVibMmS > 2.8
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[var(--md-on-surface)]'
                }`}
              >
                {activeVibMmS.toFixed(2)} mm/s
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                <Volume2 className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Acoustic Noise', 'Kebisingan Akustik', '騒音レベル')}
              </div>
              <div
                className={`mt-0.5 font-mono text-sm font-bold ${
                  activeNoiseDba > 82
                    ? 'text-rose-600 dark:text-rose-400'
                    : activeNoiseDba > 75
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[var(--md-on-surface)]'
                }`}
              >
                {activeNoiseDba.toFixed(0)} dBA
              </div>
            </div>
          </div>

          {/* Min Pulley Bending Fatigue Warning */}
          {driveMode === 'v-belt' && vBeltResults.minPulleyWarning && (
            <div className="flex items-center gap-2.5 rounded-[22px] border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>
                  {pick(
                    'Bending Fatigue Warning:',
                    'Peringatan Kelelahan Tekuk:',
                    '曲げ疲労警告:'
                  )}
                </strong>{' '}
                D₁ ({vBeltParams.d1} mm) &lt; D_min (
                <strong>{vBeltResults.minPulleyMm} mm</strong>) [{vBeltParams.beltSection}]
              </span>
            </div>
          )}

          {/* Centrifugal Tension Warning (v > 25 m/s) */}
          {driveMode === 'v-belt' && vBeltResults.centrifugalWarning && (
            <div className="flex items-center gap-2.5 rounded-[22px] border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>
                  {pick(
                    'Centrifugal Tension Warning:',
                    'Peringatan Tegangan Sentrifugal:',
                    '遠心張力警告:'
                  )}
                </strong>{' '}
                {pick(
                  `Belt linear speed (${vBeltResults.beltSpeedMs.toFixed(1)} m/s) exceeds 25 m/s. Centrifugal force lifts the belt out of the sheave groove — reduce D₁/RPM or use balanced sheaves.`,
                  `Kecepatan sabuk (${vBeltResults.beltSpeedMs.toFixed(1)} m/s) melebihi 25 m/s. Gaya sentrifugal mengangkat sabuk dari alur puli — turunkan D₁/RPM atau gunakan puli terbalans.`,
                  `ベルト周速 (${vBeltResults.beltSpeedMs.toFixed(1)} m/s) が 25 m/s を超えています。遠心力によりベルトが溝から浮き上がるため、D₁/RPMを下げるかバランスプーリを使用してください。`
                )}
              </span>
            </div>
          )}

          {/* Diagnostic Note + Secondary Metrics */}
          <div data-tour="belt-gear-notes" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex items-start gap-2.5">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-[var(--md-primary)]" />
              <div className="w-full space-y-2.5 text-xs">
                <p className="font-semibold text-[var(--md-on-surface)]">
                  {diagnosticNote}
                </p>
                {driveMode === 'v-belt' ? (
                  <>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[var(--md-on-surface-variant)]">
                      <span>
                        Span Deflection:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {vBeltResults.actualDeflectionMm.toFixed(1)} mm
                        </strong>{' '}
                        (Target:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {vBeltResults.targetDeflectionMm.toFixed(1)} mm
                        </strong>{' '}
                        @ {vBeltResults.nominalTestForceN} N)
                      </span>
                      <span>
                        Wrap Angle θ₁:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {vBeltResults.wrapAngleDeg.toFixed(1)}°
                        </strong>
                      </span>
                      <span>
                        Belt Linear Speed:{' '}
                        <strong
                          className={`font-mono ${
                            vBeltResults.centrifugalWarning
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-[var(--md-on-surface)]'
                          }`}
                        >
                          {vBeltResults.beltSpeedMs.toFixed(1)} m/s
                        </strong>
                      </span>
                      <span>
                        Bearing Radial Load:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {vBeltResults.radialBearingLoadN.toFixed(0)} N
                        </strong>
                      </span>
                    </div>

                    {/* Standard Belt Length Matcher */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3.5 py-2.5">
                      <span className="text-[var(--md-on-surface-variant)]">
                        {pick(
                          'Nearest Standard Belt:',
                          'Sabuk Standar Terdekat:',
                          '最寄りの標準ベルト:'
                        )}{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {vBeltResults.standardBeltDesignation}
                        </strong>{' '}
                        ({vBeltResults.standardBeltLengthMm} mm)
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[var(--md-primary)]">
                        ΔL = {vBeltResults.beltLengthDeltaMm >= 0 ? '+' : ''}
                        {vBeltResults.beltLengthDeltaMm.toFixed(1)} mm ({pick('Slide C', 'Geser C', '軸間調整 C')} ≈{' '}
                        {vBeltResults.beltLengthDeltaMm / 2 >= 0 ? '+' : ''}
                        {(vBeltResults.beltLengthDeltaMm / 2).toFixed(1)} mm)
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[var(--md-on-surface-variant)]">
                      <span>
                        Pitch Diameters:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          d₁={spurResults.pitchDiameter1Mm} mm, d₂=
                          {spurResults.pitchDiameter2Mm} mm
                        </strong>
                      </span>
                      <span>
                        Std. Center C₀:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {spurResults.standardCenterDistanceMm.toFixed(1)} mm
                        </strong>
                      </span>
                      <span>
                        Pitch-Line Vel.:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {spurResults.pitchLineVelocityMs.toFixed(2)} m/s
                        </strong>
                      </span>
                      <span>
                        Input Torque T₁:{' '}
                        <strong className="font-mono text-[var(--md-on-surface)]">
                          {spurResults.inputTorqueNm.toFixed(1)} N·m
                        </strong>
                      </span>
                    </div>

                    {/* AGMA / ISO Tooth Contact & Bending Safety Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3.5 py-2.5">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--md-on-surface-variant)]">
                        <span>
                          {pick('AGMA Bending S_F:', 'Keamanan Tekuk S_F:', 'AGMA曲げ安全率 S_F:')}{' '}
                          <strong className="font-mono text-[var(--md-on-surface)]">
                            {spurResults.bendingSafetyFactor.toFixed(2)}×
                          </strong>
                        </span>
                        <span>
                          {pick('Contact S_H:', 'Kontak S_H:', '歯面接触 S_H:')}{' '}
                          <strong className="font-mono text-[var(--md-on-surface)]">
                            {spurResults.contactSafetyFactor.toFixed(2)}×
                          </strong>
                        </span>
                        <span>
                          {pick('Tangential F_t:', 'Gaya Tangensial F_t:', '接線荷重 F_t:')}{' '}
                          <strong className="font-mono text-[var(--md-on-surface)]">
                            {spurResults.tangentialForceN.toFixed(0)} N
                          </strong>
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          spurResults.toothSafetyStatus === 'Safe (AGMA OK)'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : spurResults.toothSafetyStatus === 'Marginal'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                        }`}
                      >
                        {spurResults.toothSafetyStatus === 'Safe (AGMA OK)'
                          ? pick('Safe (AGMA OK)', 'Aman (AGMA OK)', '安全 (AGMA OK)')
                          : spurResults.toothSafetyStatus === 'Marginal'
                            ? pick('Marginal', 'Batas Tipis', '限界付近')
                            : pick('Overload Risk', 'Risiko Beban Lebih', '過負荷リスク')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Parameter Controls */}
        <div data-tour="belt-gear-controls" className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
            <h3 className="text-sm font-bold text-[var(--md-on-surface)]">
              {driveMode === 'v-belt'
                ? pick(
                    'V-Belt Drive Parameters',
                    'Parameter Penggerak V-Belt',
                    'Vベルト駆動パラメータ'
                  )
                : pick(
                    'Spur Gear Parameters',
                    'Parameter Roda Gigi Lurus',
                    '平歯車パラメータ'
                  )}
            </h3>
            <span className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
              {pick('Live Tuning', 'Setelan Langsung', 'リアルタイム調整')}
            </span>
          </div>

          {driveMode === 'v-belt' ? (
            <div className="space-y-3.5">
              {/* V-Belt Cross-Section Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--md-on-surface)]">
                    V-Belt Cross-Section
                  </span>
                  <span className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                    D_min = {vBeltResults.minPulleyMm} mm
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {BELT_SECTIONS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleSelectBeltSection(sec)}
                      className={`rounded-full border py-1.5 text-xs transition-colors ${
                        vBeltParams.beltSection === sec
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] font-semibold text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <SliderControl
                label="Driver Pulley (D₁)"
                value={vBeltParams.d1}
                min={60}
                max={280}
                step={5}
                unit="mm"
                onChange={(d1) =>
                  setVBeltParams((p) => ({
                    ...p,
                    d1,
                    centerDistance: Math.max(
                      p.centerDistance,
                      Math.ceil((d1 + p.d2) / 2 + 25)
                    ),
                  }))
                }
              />
              <SliderControl
                label="Driven Pulley (D₂)"
                value={vBeltParams.d2}
                min={100}
                max={500}
                step={5}
                unit="mm"
                onChange={(d2) =>
                  setVBeltParams((p) => ({
                    ...p,
                    d2,
                    centerDistance: Math.max(
                      p.centerDistance,
                      Math.ceil((p.d1 + d2) / 2 + 25)
                    ),
                  }))
                }
              />
              <SliderControl
                label="Center Distance (C)"
                value={Math.max(vBeltParams.centerDistance, minSafeCenter)}
                min={minSafeCenter}
                max={1000}
                step={10}
                unit="mm"
                onChange={(centerDistance) =>
                  setVBeltParams((p) => ({ ...p, centerDistance }))
                }
              />
              <SliderControl
                label="Motor Speed (N₁)"
                value={vBeltParams.motorRpm}
                min={600}
                max={3600}
                step={50}
                unit="RPM"
                onChange={(motorRpm) =>
                  setVBeltParams((p) => ({ ...p, motorRpm }))
                }
              />
              <SliderControl
                label="Motor Power (P)"
                value={vBeltParams.motorKw}
                min={0.75}
                max={22}
                step={0.25}
                unit="kW"
                onChange={(motorKw) =>
                  setVBeltParams((p) => ({ ...p, motorKw }))
                }
              />

              <div className="border-t border-[var(--md-outline-variant)]/50 pt-3">
                <div className="mb-2 text-xs font-bold text-[var(--md-primary)]">
                  Tension & Alignment Inspection
                </div>
                <div className="space-y-3.5">
                  <SliderControl
                    label="Belt Tension Setting"
                    value={vBeltParams.tensionLevel}
                    min={45}
                    max={165}
                    step={5}
                    unit="%"
                    onChange={(tensionLevel) =>
                      setVBeltParams((p) => ({ ...p, tensionLevel }))
                    }
                  />
                  <SliderControl
                    label="Mid-Span Test Force"
                    value={vBeltParams.testForceN}
                    min={0}
                    max={75}
                    step={5}
                    unit="N"
                    onChange={(testForceN) =>
                      setVBeltParams((p) => ({ ...p, testForceN }))
                    }
                  />
                  <SliderControl
                    label="Sheave Misalignment"
                    value={vBeltParams.misalignmentDeg}
                    min={0}
                    max={2.5}
                    step={0.1}
                    unit="°"
                    onChange={(misalignmentDeg) =>
                      setVBeltParams((p) => ({ ...p, misalignmentDeg }))
                    }
                  />
                </div>
              </div>

              {/* Quick Maintenance Scenarios */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setVBeltParams((p) => ({
                      ...p,
                      tensionLevel: 100,
                      testForceN:
                        BELT_SECTION_SPECS[p.beltSection].nominalTestForceN,
                      misalignmentDeg: 0.1,
                    }))
                  }
                  className="glass-pill rounded-full px-2 py-1.5 text-[11px] font-semibold"
                >
                  Nominal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVBeltParams((p) => ({
                      ...p,
                      tensionLevel: 60,
                      testForceN:
                        BELT_SECTION_SPECS[p.beltSection].nominalTestForceN,
                      misalignmentDeg: 0.3,
                    }))
                  }
                  className="rounded-full border border-amber-300/70 bg-amber-50/90 px-2 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
                >
                  Loose Belt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVBeltParams((p) => ({
                      ...p,
                      tensionLevel: 145,
                      testForceN:
                        BELT_SECTION_SPECS[p.beltSection].nominalTestForceN,
                      misalignmentDeg: 1.4,
                    }))
                  }
                  className="rounded-full border border-rose-300/70 bg-rose-50/90 px-2 py-1.5 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300"
                >
                  Over-Tight
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <SliderControl
                label="Driver Pinion Teeth (Z₁)"
                value={spurParams.z1}
                min={12}
                max={42}
                step={1}
                unit="T"
                onChange={(z1) => setSpurParams((p) => ({ ...p, z1 }))}
              />
              <SliderControl
                label="Driven Gear Teeth (Z₂)"
                value={spurParams.z2}
                min={18}
                max={72}
                step={1}
                unit="T"
                onChange={(z2) => setSpurParams((p) => ({ ...p, z2 }))}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--md-on-surface)]">
                    Gear Module (m)
                  </span>
                  <span className="rounded-full bg-[var(--md-surface-container-high)] px-2.5 py-0.5 font-mono font-bold text-[var(--md-primary)]">
                    {spurParams.moduleMm} mm
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {[1.5, 2, 2.5, 3, 4, 5].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setSpurParams((p) => ({ ...p, moduleMm: m }))
                      }
                      className={`rounded-full border py-1 text-xs transition-colors ${
                        spurParams.moduleMm === m
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] font-semibold text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <SliderControl
                label="Motor Speed (N₁)"
                value={spurParams.motorRpm}
                min={300}
                max={3000}
                step={50}
                unit="RPM"
                onChange={(motorRpm) =>
                  setSpurParams((p) => ({ ...p, motorRpm }))
                }
              />
              <SliderControl
                label="Motor Power (P)"
                value={spurParams.motorKw}
                min={0.75}
                max={22}
                step={0.25}
                unit="kW"
                onChange={(motorKw) =>
                  setSpurParams((p) => ({ ...p, motorKw }))
                }
              />

              <div className="border-t border-[var(--md-outline-variant)]/50 pt-3">
                <div className="mb-2 text-xs font-bold text-[var(--md-primary)]">
                  Center Distance & Backlash Tuning
                </div>
                <SliderControl
                  label="Center Offset (ΔC)"
                  value={spurParams.centerOffsetMm}
                  min={-0.3}
                  max={1.0}
                  step={0.05}
                  unit="mm"
                  onChange={(centerOffsetMm) =>
                    setSpurParams((p) => ({ ...p, centerOffsetMm }))
                  }
                />
              </div>

              {/* Quick Maintenance Scenarios */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setSpurParams((p) => ({ ...p, centerOffsetMm: 0.05 }))
                  }
                  className="glass-pill rounded-full px-2 py-1.5 text-[11px] font-semibold"
                >
                  Optimal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSpurParams((p) => ({ ...p, centerOffsetMm: 0.75 }))
                  }
                  className="rounded-full border border-amber-300/70 bg-amber-50/90 px-2 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
                >
                  High Backlash
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSpurParams((p) => ({ ...p, centerOffsetMm: -0.2 }))
                  }
                  className="rounded-full border border-rose-300/70 bg-rose-50/90 px-2 py-1.5 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300"
                >
                  Binding
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
