/* oxlint-disable react/only-export-components */
import { useMemo, useState } from 'react';
import { Cpu, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MotorBasicsSvg } from './MotorBasicsSvg';
import {
  IP_RATINGS,
  MOTOR_MOUNTINGS,
  MOTOR_TYPES,
  POLE_SPECS,
  TERMINAL_WIRING,
  calculateMotorState,
  type IpRating,
  type MotorMounting,
  type MotorType,
  type PoleCount,
  type TerminalConnectionMode,
} from './motorBasicsData';

export { motorBasicsMeta } from './motorBasicsMeta';

export function MotorBasicsSimulator() {
  const { pick } = useLanguage();

  const [motorType, setMotorType] = useState<MotorType>('ac-tefc');
  const [mounting, setMounting] = useState<MotorMounting>('B3');
  const [poles, setPoles] = useState<PoleCount>(4);
  const [frequency, setFrequency] = useState<50 | 60>(50);
  const [ipRating, setIpRating] = useState<IpRating>('IP55');
  const [terminalConnection, setTerminalConnection] =
    useState<TerminalConnectionMode>('star');
  const [isMotorSpinning, setIsMotorSpinning] = useState<boolean>(true);

  const activeMotor = useMemo(
    () => MOTOR_TYPES.find((m) => m.id === motorType) ?? MOTOR_TYPES[0],
    [motorType]
  );
  const activeMount = MOTOR_MOUNTINGS[mounting];
  const activeIp = IP_RATINGS[ipRating];
  const activeWiring = TERMINAL_WIRING[terminalConnection];
  const motorCalc = useMemo(
    () => calculateMotorState(poles, frequency, terminalConnection),
    [poles, frequency, terminalConnection]
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN: 2D CAD CUTAWAY + SPEC BREAKDOWN (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <MotorBasicsSvg
            motorType={motorType}
            mounting={mounting}
            poles={poles}
            frequency={frequency}
            ipRating={ipRating}
            terminalConnection={terminalConnection}
            isMotorSpinning={isMotorSpinning}
            onToggleSpin={() => setIsMotorSpinning((prev) => !prev)}
            onToggleConnection={() =>
              setTerminalConnection((prev) => (prev === 'star' ? 'delta' : 'star'))
            }
          />

          <div className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-4">
            <h3 className="flex items-center gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5 text-sm font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <Zap className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                'Motor Architecture, Mounting & Enclosure Guide',
                'Panduan Arsitektur Motor, Pemasangan & Proteksi IP',
                '電動機構造・取付方式・保護等級ガイド'
              )}
            </h3>

            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 space-y-1">
                <div className="font-bold text-[var(--md-primary)]">
                  {activeMotor.name}
                </div>
                <div className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">
                  {activeMotor.efficiencyClass}
                </div>
                <p className="text-[var(--md-on-surface-variant)] leading-relaxed pt-1">
                  {activeMotor.features}
                </p>
                <p className="text-[11px] text-[var(--md-on-surface-variant)] pt-1">
                  <strong className="text-[var(--md-on-surface)]">
                    {pick('Use:', 'Aplikasi:', '用途:')}
                  </strong>{' '}
                  {activeMotor.primaryUse}
                </p>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 space-y-1">
                <div className="font-bold text-[var(--md-primary)]">
                  {activeMount.name} ({activeMount.code})
                </div>
                <div className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">
                  IEC 60034-7
                </div>
                <p className="text-[var(--md-on-surface-variant)] leading-relaxed pt-1">
                  {activeMount.description}
                </p>
                <p className="text-[11px] text-[var(--md-on-surface-variant)] pt-1">
                  <strong className="text-[var(--md-on-surface)]">
                    {pick('Best Fit:', 'Cocok Untuk:', '適合例:')}
                  </strong>{' '}
                  {activeMount.bestFit}
                </p>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 space-y-1">
                <div className="font-bold text-[var(--md-primary)]">
                  {activeIp.code} {pick('Enclosure', 'Selungkup', '保護構造')}
                </div>
                <div className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">
                  IEC 60529
                </div>
                <p className="text-[var(--md-on-surface-variant)] leading-relaxed pt-1">
                  {activeIp.dustProtection}
                </p>
                <p className="text-[11px] text-[var(--md-on-surface-variant)] pt-1">
                  <strong className="text-[var(--md-on-surface)]">
                    {pick('Zone:', 'Area:', '環境:')}
                  </strong>{' '}
                  {activeIp.environment}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MOTOR CONTROLS & TELEMETRY (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-4">
            <h2 className="flex items-center gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5 text-sm font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <Cpu className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                'Motor Type, Poles, Mounting & Wiring',
                'Pengaturan Motor, Kutub, Mounting & Kabel',
                '電動機・極数・取付・結線設定'
              )}
            </h2>

            {/* Motor Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--md-on-surface)]">
                {pick('Electric Motor Family', 'Jenis Motor Listrik', '電動機の種類')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOTOR_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMotorType(item.id)}
                    className={`px-3.5 py-2.5 rounded-[20px] text-left text-xs font-semibold border transition ${
                      motorType === item.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mounting & IP Rating */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--md-on-surface)]">
                  {pick('Mounting (IEC)', 'Tipe Mounting', '取付方式')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['B3', 'B5', 'B14'] as MotorMounting[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setMounting(code)}
                      className={`py-2 rounded-full text-center text-xs font-semibold border transition ${
                        mounting === code
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--md-on-surface)]">
                  {pick('IP Protection', 'Rating IP', 'IP保護等級')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['IP54', 'IP55', 'IP65'] as IpRating[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setIpRating(code)}
                      className={`py-2 rounded-full text-center text-xs font-semibold border transition ${
                        ipRating === code
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Poles & Grid Frequency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--md-on-surface)]">
                  {pick('Magnetic Poles', 'Jumlah Kutub', '極数')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([2, 4, 6] as PoleCount[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPoles(p)}
                      className={`flex flex-col items-center py-2 rounded-[20px] text-center text-xs font-semibold border transition ${
                        poles === p
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <div>{p}P</div>
                      <div className="font-mono text-[10px] font-normal opacity-80">
                        {frequency === 50
                          ? POLE_SPECS[p].syncSpeed50HzRpm
                          : POLE_SPECS[p].syncSpeed60HzRpm}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--md-on-surface)]">
                  {pick('Supply Frequency', 'Frekuensi Listrik', '電源周波数')}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {([50, 60] as const).map((hz) => (
                    <button
                      key={hz}
                      type="button"
                      onClick={() => setFrequency(hz)}
                      className={`py-2 rounded-full text-center text-xs font-semibold border transition ${
                        frequency === hz
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {hz} Hz
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Star vs Delta Segmented Control */}
            <div className="grid grid-cols-2 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
              <button
                type="button"
                onClick={() => setTerminalConnection('star')}
                className={`py-2 px-3 rounded-full text-xs transition ${
                  terminalConnection === 'star'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                Star (Y) — 400V
              </button>
              <button
                type="button"
                onClick={() => setTerminalConnection('delta')}
                className={`py-2 px-3 rounded-full text-xs transition ${
                  terminalConnection === 'delta'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                Delta (Δ) — 230V
              </button>
            </div>
          </div>

          {/* LIVE TELEMETRY & WIRING SUMMARY */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <h3 className="border-b border-[var(--md-outline-variant)]/50 pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              {pick(
                'Nameplate Speed, Torque & Terminal Telemetry',
                'Telemetri Putaran, Torsi & Terminal Motor',
                '同期速度・軸トルク・端子電圧テレメトリ'
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Sync / Rated RPM', 'Sinkron / Terukur', '同期／定格回転数')}
                </div>
                <div className="mt-0.5 font-mono text-base font-extrabold text-[var(--md-primary)]">
                  {motorCalc.syncRpm} / {motorCalc.ratedRpm}
                </div>
              </div>
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('4 kW Shaft Torque', 'Torsi Poros 4 kW', '4 kW 定格軸トルク')}
                </div>
                <div className="mt-0.5 font-mono text-base font-extrabold text-[var(--md-primary)]">
                  {motorCalc.ratedTorqueNm.toFixed(1)} N·m
                </div>
              </div>
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Coil Phase (400V Grid)', 'Tegangan Fasa (400V)', '400V時 相電圧')}
                </div>
                <div className="mt-0.5 font-mono text-base font-extrabold text-[var(--md-primary)]">
                  {motorCalc.phaseVoltageOn400V.toFixed(0)} V
                </div>
              </div>
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Angular Speed & Slip', 'Sudut & Slip Rotor', '角速度・すべり')}
                </div>
                <div className="mt-0.5 font-mono text-base font-extrabold text-[var(--md-on-surface)]">
                  {motorCalc.omegaRadS.toFixed(0)} rad/s ({motorCalc.slipPct.toFixed(1)}%)
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/45 bg-[var(--md-secondary-container)] p-3.5 text-xs text-[var(--md-on-secondary-container)] space-y-1">
              <div className="font-bold text-[var(--md-primary)]">
                {activeWiring.symbol} — {activeWiring.name}
              </div>
              <p className="opacity-90 leading-relaxed">
                {activeWiring.jumperArrangement}
              </p>
              <p className="text-[11px] opacity-80">
                <strong>{pick('400V Rule:', 'Aturan 400V:', '400V電源注意:')}</strong>{' '}
                {activeWiring.operatingVoltage400VGrid}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
