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

          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-500" />
              {pick(
                'Motor Architecture, Mounting & Enclosure Guide',
                'Panduan Arsitektur Motor, Pemasangan & Proteksi IP',
                '電動機構造・取付方式・保護等級ガイド'
              )}
            </h3>

            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-1">
                <div className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {activeMotor.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {activeMotor.efficiencyClass}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {activeMotor.features}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <strong className="text-slate-700 dark:text-slate-200">
                    {pick('Use:', 'Aplikasi:', '用途:')}
                  </strong>{' '}
                  {activeMotor.primaryUse}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-1">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeMount.name} ({activeMount.code})
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  IEC 60034-7
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {activeMount.description}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <strong className="text-slate-700 dark:text-slate-200">
                    {pick('Best Fit:', 'Cocok Untuk:', '適合例:')}
                  </strong>{' '}
                  {activeMount.bestFit}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-1">
                <div className="font-semibold text-amber-600 dark:text-amber-400">
                  {activeIp.code} {pick('Enclosure', 'Selungkup', '保護構造')}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  IEC 60529
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {activeIp.dustProtection}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <strong className="text-slate-700 dark:text-slate-200">
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
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-500" />
              {pick(
                'Motor Type, Poles, Mounting & Wiring',
                'Pengaturan Motor, Kutub, Mounting & Kabel',
                '電動機・極数・取付・結線設定'
              )}
            </h2>

            {/* Motor Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {pick('Electric Motor Family', 'Jenis Motor Listrik', '電動機の種類')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {MOTOR_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMotorType(item.id)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition ${
                      motorType === item.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {pick('Mounting (IEC)', 'Tipe Mounting', '取付方式')}
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['B3', 'B5', 'B14'] as MotorMounting[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setMounting(code)}
                      className={`py-2 rounded-xl text-center text-xs font-semibold border transition ${
                        mounting === code
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {pick('IP Protection', 'Rating IP', 'IP保護等級')}
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['IP54', 'IP55', 'IP65'] as IpRating[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setIpRating(code)}
                      className={`py-2 rounded-xl text-center text-xs font-semibold border transition ${
                        ipRating === code
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {pick('Magnetic Poles', 'Jumlah Kutub', '極数')}
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {([2, 4, 6] as PoleCount[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPoles(p)}
                      className={`py-2 rounded-xl text-center text-xs font-semibold border transition ${
                        poles === p
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div>{p}P</div>
                      <div className="text-[10px] font-normal opacity-80">
                        {frequency === 50
                          ? POLE_SPECS[p].syncSpeed50HzRpm
                          : POLE_SPECS[p].syncSpeed60HzRpm}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {pick('Supply Frequency', 'Frekuensi Listrik', '電源周波数')}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {([50, 60] as const).map((hz) => (
                    <button
                      key={hz}
                      type="button"
                      onClick={() => setFrequency(hz)}
                      className={`py-2 rounded-xl text-center text-xs font-semibold border transition ${
                        frequency === hz
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {hz} Hz
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Star vs Delta + Run/Stop */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setTerminalConnection('star')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                  terminalConnection === 'star'
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Star (Y) — 400V
              </button>
              <button
                type="button"
                onClick={() => setTerminalConnection('delta')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                  terminalConnection === 'delta'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Delta (Δ) — 230V
              </button>
            </div>
          </div>

          {/* LIVE TELEMETRY & WIRING SUMMARY */}
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {pick(
                'Nameplate Speed, Torque & Terminal Telemetry',
                'Telemetri Putaran, Torsi & Terminal Motor',
                '同期速度・軸トルク・端子電圧テレメトリ'
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Sync / Rated RPM', 'Sinkron / Terukur', '同期／定格回転数')}
                </div>
                <div className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                  {motorCalc.syncRpm} / {motorCalc.ratedRpm}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('4 kW Shaft Torque', 'Torsi Poros 4 kW', '4 kW 定格軸トルク')}
                </div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {motorCalc.ratedTorqueNm.toFixed(1)} N·m
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Coil Phase (400V Grid)', 'Tegangan Fasa (400V)', '400V時 相電圧')}
                </div>
                <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {motorCalc.phaseVoltageOn400V.toFixed(0)} V
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Angular Speed & Slip', 'Sudut & Slip Rotor', '角速度・すべり')}
                </div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {motorCalc.omegaRadS.toFixed(0)} rad/s ({motorCalc.slipPct.toFixed(1)}%)
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 p-3 text-xs space-y-1">
              <div className="font-semibold text-cyan-700 dark:text-cyan-300">
                {activeWiring.symbol} — {activeWiring.name}
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeWiring.jumperArrangement}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
