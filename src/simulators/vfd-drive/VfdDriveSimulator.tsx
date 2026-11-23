/* oxlint-disable react/only-export-components */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Play,
  RotateCcw,
  ShieldAlert,
  Square,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { VfdDriveSvg } from './VfdDriveSvg';
import {
  computeVfdState,
  DEFAULT_VFD_PARAMS,
  type DriveRunState,
  type StarterMode,
  type VfdFaultMode,
  type VfdParams,
} from './vfdDrivePhysics';

export { vfdDriveMeta } from './vfdDriveMeta';

export function VfdDriveSimulator() {
  const { pick } = useLanguage();
  const [params, setParams] = useState<VfdParams>(DEFAULT_VFD_PARAMS);
  const [runState, setRunState] = useState<DriveRunState>('running');
  const [currentFreqHz, setCurrentFreqHz] = useState<number>(50);
  const [elapsedRunS, setElapsedRunS] = useState<number>(5);
  const [rotorAngleDeg, setRotorAngleDeg] = useState<number>(0);

  const lastTimeRef = useRef<number | null>(null);

  const computed = useMemo(
    () => computeVfdState(params, currentFreqHz, runState, elapsedRunS),
    [params, currentFreqHz, runState, elapsedRunS]
  );

  const effectiveRunState: DriveRunState =
    runState !== 'stopped' &&
    (computed.tripCode === 'OV' || computed.tripCode === 'OC')
      ? 'tripped'
      : runState;

  // Physics & rotor animation loop
  useEffect(() => {
    if (effectiveRunState === 'stopped' || effectiveRunState === 'tripped') {
      lastTimeRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      setElapsedRunS((prev) => prev + dt);

      if (params.starterMode === 'vfd') {
        setCurrentFreqHz((prevFreq) => {
          if (runState === 'decelerating') {
            const decelRate = params.baseFreqHz / Math.max(0.5, params.decelTimeS);
            const next = Math.max(0, prevFreq - decelRate * dt);
            if (next <= 0.05) {
              setRunState('stopped');
              return 0;
            }
            return next;
          }
          const accelRate = params.baseFreqHz / Math.max(0.5, params.accelTimeS);
          const decelRate = params.baseFreqHz / Math.max(0.5, params.decelTimeS);
          if (prevFreq < params.targetFreqHz - 0.1) {
            const next = Math.min(params.targetFreqHz, prevFreq + accelRate * dt);
            if (Math.abs(next - params.targetFreqHz) < 0.15) {
              setRunState('running');
            }
            return next;
          }
          if (prevFreq > params.targetFreqHz + 0.1) {
            const next = Math.max(params.targetFreqHz, prevFreq - decelRate * dt);
            if (Math.abs(next - params.targetFreqHz) < 0.15) {
              setRunState('running');
            }
            return next;
          }
          return prevFreq;
        });
      }

      // Spin rotor visually proportional to rotorSpeedRpm
      const visualDegPerSec = Math.min(540, (computed.rotorSpeedRpm / 1500) * 260);
      setRotorAngleDeg((prev) => (prev + visualDegPerSec * dt) % 360);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    effectiveRunState,
    runState,
    params.starterMode,
    params.targetFreqHz,
    params.baseFreqHz,
    params.accelTimeS,
    params.decelTimeS,
    computed.rotorSpeedRpm,
  ]);

  const handleStart = () => {
    setElapsedRunS(0);
    if (params.starterMode === 'vfd') {
      setCurrentFreqHz(0);
      setRunState('accelerating');
    } else {
      setCurrentFreqHz(params.baseFreqHz);
      setRunState('running');
    }
  };

  const handleStop = () => {
    if (params.starterMode === 'vfd' && currentFreqHz > 0.5 && runState !== 'tripped') {
      setRunState('decelerating');
    } else {
      setRunState('stopped');
      setCurrentFreqHz(0);
    }
  };

  const handleReset = () => {
    setParams(DEFAULT_VFD_PARAMS);
    setCurrentFreqHz(50);
    setElapsedRunS(5);
    setRunState('running');
  };

  const updateParam = <K extends keyof VfdParams>(key: K, value: VfdParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const starterModes: { id: StarterMode; label: string }[] = [
    { id: 'dol', label: pick('DOL (Direct)', 'DOL (Langsung)', '直入 (DOL)') },
    { id: 'star-delta', label: pick('Star-Delta (Y-Δ)', 'Star-Delta (Y-Δ)', 'スターデルタ (Y-Δ)') },
    { id: 'vfd', label: pick('VFD Inverter', 'Inverter VFD', 'VFDインバータ') },
  ];

  const faultModes: { id: VfdFaultMode; label: string }[] = [
    { id: 'normal', label: pick('Normal Operation', 'Operasi Normal', '正常運転') },
    { id: 'phase-loss', label: pick('Single-Phasing (L2 Loss)', 'Hilang Fasa (L2 Putus)', '入力欠相 (L2欠相)') },
    { id: 'dc-overvoltage', label: pick('DC Bus Overvoltage', 'Tegangan Lebih Bus DC', 'DCバス過電圧') },
    { id: 'overcurrent-stall', label: pick('Overcurrent / Locked Rotor', 'Arus Lebih / Rotor Terkunci', '過電流 / 拘束') },
    { id: 'bearing-fluting', label: pick('Bearing EDM / Fluting', 'Arus Poros EDM / Fluting', '軸電流電食 (EDM)') },
  ];

  return (
    <div className="space-y-5">
      {/* Diagnostic Alert Banner */}
      {computed.diagnosticKey !== 'normal' && computed.diagnosticKey !== 'stopped' ? (
        <div
          className={`flex items-start gap-3 rounded-[24px] border p-4 text-sm ${
            computed.tripCode === 'OV' ||
            computed.tripCode === 'OC' ||
            computed.diagnosticKey === 'phase-loss'
              ? 'border-rose-300/70 bg-rose-50/90 text-rose-900 dark:border-rose-500/35 dark:bg-rose-950/35 dark:text-rose-200'
              : 'border-amber-300/70 bg-amber-50/90 text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/35 dark:text-amber-200'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-0.5">
            <div className="font-bold">
              {computed.diagnosticKey === 'dc-overvoltage' &&
                pick(
                  'TRIP [OV]: DC Bus Overvoltage (>790 V DC)',
                  'TRIP [OV]: Tegangan Lebih Bus DC (>790 V DC)',
                  'トリップ [OV]：DCバス過電圧（>790 V DC）'
                )}
              {computed.diagnosticKey === 'overcurrent-stall' &&
                pick(
                  'TRIP [OC]: Overcurrent / Locked Rotor Stall (>200% I_rated)',
                  'TRIP [OC]: Arus Lebih / Rotor Terkunci (>200% I_nominal)',
                  'トリップ [OC]：過電流 / 回転子拘束（定格の200%超）'
                )}
              {computed.diagnosticKey === 'phase-loss' &&
                pick(
                  'FAULT [PHL]: Input Single-Phasing Detected (High DC Bus Ripple)',
                  'GANGGUAN [PHL]: Hilang Fasa Masukan (Riak Bus DC Tinggi)',
                  '異常 [PHL]：入力欠相検出（DCバスリップル増大）'
                )}
              {computed.diagnosticKey === 'bearing-fluting' &&
                pick(
                  'WARNING [EDM]: High Common-Mode Shaft Voltage — Bearing Fluting Risk',
                  'PERINGATAN [EDM]: Tegangan Poros Tinggi — Risiko Fluting Bantalan',
                  '警告 [EDM]：コモンモード軸電圧上昇 — 軸受電食リスク'
                )}
              {computed.diagnosticKey === 'field-weakening' &&
                pick(
                  'Field Weakening Active (> Base Hz): Voltage Clamped, Torque Derated',
                  'Pelemahan Medan Aktif (> Hz Dasar): Tegangan Tertahan, Torsi Menurun',
                  '界磁弱め運転中（基底周波数超）：電圧クランプ・トルク低下'
                )}
              {computed.diagnosticKey === 'dol-inrush' &&
                pick(
                  'DOL Starting Transient: 6.5× Inrush Current & High Mechanical Shock',
                  'Transien Start DOL: Lonjakan Arus 6,5× & Hentakan Mekanis Tinggi',
                  'DOL始動過渡状態：6.5倍突入電流・高機械衝撃'
                )}
              {computed.diagnosticKey === 'star-starting' &&
                pick(
                  'Star-Delta (Star Stage): 1/3 Starting Current & 1/3 Torque before Δ Switch',
                  'Star-Delta (Tahap Bintang): Arus & Torsi Start 1/3 sebelum pindah ke Δ',
                  'スターデルタ（スター段階）：Δ切替前の1/3電流・1/3トルク'
                )}
            </div>
            <p className="text-xs opacity-90">
              {computed.diagnosticKey === 'dc-overvoltage' &&
                pick(
                  'Increase deceleration ramp time (≥3.0 s) or install a dynamic braking resistor to absorb regenerative inertia energy.',
                  'Perpanjang waktu deselerasi (≥3,0 dtk) atau pasang resistor pengereman dinamis untuk menyerap energi regeneratif.',
                  '減速時間を延ばす（3.0秒以上）か、回生エネルギー吸収用の制動抵抗器を設置してください。'
                )}
              {computed.diagnosticKey === 'overcurrent-stall' &&
                pick(
                  'Clear mechanical jam or reduce load torque below breakdown torque, then press Start/Reset.',
                  'Bersihkan hambatan mekanis atau turunkan torsi beban di bawah torsi maksimum, lalu tekan Start/Reset.',
                  '機械的拘束を解除するか負荷トルクを停動トルク以下に下げ、始動/リセットを押してください。'
                )}
              {computed.diagnosticKey === 'phase-loss' &&
                pick(
                  'Inspect upstream L2 fuse/MCCB. Remaining two phases carry 1.65× current with severe 88 Vpp DC bus ripple.',
                  'Periksa sekring/MCCB fasa L2. Dua fasa tersisa menanggung arus 1,65× dengan riak bus DC 88 Vpp.',
                  '電源側L2ヒューズ/MCCBを確認してください。残りの2相に1.65倍の電流と88 VppのDCリップルが発生します。'
                )}
              {computed.diagnosticKey === 'bearing-fluting' &&
                pick(
                  'Lower IGBT carrier frequency (≤4 kHz) or install a shaft grounding brush + insulated NDE bearing.',
                  'Turunkan frekuensi pembawa IGBT (≤4 kHz) atau pasang sikat pentanahan poros + bantalan NDE terisolasi.',
                  'IGBTキャリア周波数を下げる（4 kHz以下）か、軸接地ブラシと絶縁軸受を導入してください。'
                )}
              {computed.diagnosticKey === 'field-weakening' &&
                pick(
                  'Above base frequency, V/f drops and breakdown torque falls as (f_base / f)².',
                  'Di atas frekuensi dasar, rasio V/f turun dan torsi maksimum turun sebesar (f_dasar / f)².',
                  '基底周波数以上ではV/fが低下し、停動トルクが (f_base / f)² に比例して低下します。'
                )}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-[24px] border border-emerald-300/60 bg-emerald-50/80 px-4 py-3 text-xs font-semibold text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {runState === 'stopped'
            ? pick(
                'Drive Stopped — Ready to Start. Select Starter Mode and press Start.',
                'Penggerak Berhenti — Siap Dijalankan. Pilih Mode Starter dan tekan Start.',
                '停止中 — 始動準備完了。始動方式を選択して始動ボタンを押してください。'
              )
            : pick(
                'Normal 3-Phase Operation — Constant V/f Flux & Balanced Phase Currents.',
                'Operasi 3-Fasa Normal — Fluks V/f Konstan & Arus Fasa Seimbang.',
                '正常三相運転 — V/f一定磁束・三相平衡電流で安定稼働中。'
              )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN: SCHEMATIC + LIVE CHART (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <VfdDriveSvg
            params={params}
            computed={computed}
            runState={effectiveRunState}
            rotorAngleDeg={rotorAngleDeg}
          />
        </div>

        {/* RIGHT COLUMN: CONTROLS + TELEMETRY (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. STARTER MODE & RUN CONTROLS */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-3"
            data-tour="vfd-starter-mode"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Zap className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('Starter / Drive Mode', 'Mode Starter / Penggerak', '始動・駆動方式')}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="glass-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              >
                <RotateCcw className="h-3 w-3" />
                {pick('Reset', 'Reset', 'リセット')}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {starterModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    updateParam('starterMode', m.id);
                    if (m.id !== 'vfd' && runState !== 'stopped') {
                      setCurrentFreqHz(params.baseFreqHz);
                      setRunState('running');
                    }
                  }}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] transition ${
                    params.starterMode === m.id
                      ? 'm3-btn-filled font-bold'
                      : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleStart}
                className="m3-btn-filled flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold"
              >
                <Play className="h-3.5 w-3.5" />
                {effectiveRunState === 'tripped'
                  ? pick('Reset Trip & Start', 'Reset Trip & Start', 'トリップ解除＆始動')
                  : pick('Start Motor', 'Jalankan Motor', '電動機始動')}
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="glass-pill flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold text-[var(--md-on-surface)]"
              >
                <Square className="h-3.5 w-3.5" />
                {pick('Stop / Ramp Down', 'Stop / Deselerasi', '停止 / 減速')}
              </button>
            </div>
          </div>

          {/* 2. FREQUENCY & ACCEL/DECEL RAMP */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-3"
            data-tour="vfd-freq-ramp"
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <span className="flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('VFD Frequency & Ramp', 'Frekuensi & Rampa VFD', 'VFD周波数・加減速')}
              </span>
              <span className="font-mono text-[var(--md-primary)]">
                {params.starterMode === 'vfd'
                  ? `${params.targetFreqHz} Hz`
                  : `${params.baseFreqHz} Hz (Fixed)`}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[var(--md-on-surface-variant)]">
                    {pick('Target Frequency (5–80 Hz)', 'Frekuensi Target (5–80 Hz)', '目標周波数 (5–80 Hz)')}
                  </span>
                  <span className="font-mono font-bold">{params.targetFreqHz} Hz</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={1}
                  disabled={params.starterMode !== 'vfd'}
                  value={params.targetFreqHz}
                  onChange={(e) => updateParam('targetFreqHz', Number(e.target.value))}
                  className="w-full accent-[var(--md-primary)] disabled:opacity-40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--md-on-surface-variant)]">
                      {pick('Accel (s)', 'Aksel (dtk)', '加速時間 (s)')}
                    </span>
                    <span className="font-mono font-bold">{params.accelTimeS}s</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={0.5}
                    disabled={params.starterMode !== 'vfd'}
                    value={params.accelTimeS}
                    onChange={(e) => updateParam('accelTimeS', Number(e.target.value))}
                    className="w-full accent-[var(--md-primary)] disabled:opacity-40"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--md-on-surface-variant)]">
                      {pick('Decel (s)', 'Desel (dtk)', '減速時間 (s)')}
                    </span>
                    <span className="font-mono font-bold">{params.decelTimeS}s</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={25}
                    step={0.5}
                    disabled={params.starterMode !== 'vfd'}
                    value={params.decelTimeS}
                    onChange={(e) => updateParam('decelTimeS', Number(e.target.value))}
                    className="w-full accent-[var(--md-primary)] disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. LOAD TORQUE, POLES & CARRIER FREQUENCY */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-3"
            data-tour="vfd-load-carrier"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)] flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
              {pick('Load Torque, Poles & PWM Carrier', 'Torsi Beban, Kutub & Pembawa PWM', '負荷トルク・極数・PWMキャリア')}
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[var(--md-on-surface-variant)]">
                    {pick('Mechanical Load Torque', 'Torsi Beban Mekanis', '機械負荷トルク')}
                  </span>
                  <span className="font-mono font-bold">{params.loadTorquePct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={140}
                  step={5}
                  value={params.loadTorquePct}
                  onChange={(e) => updateParam('loadTorquePct', Number(e.target.value))}
                  className="w-full accent-[var(--md-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--md-on-surface-variant)]">
                      {pick('PWM Carrier', 'Pembawa PWM', 'キャリア周波数')}
                    </span>
                    <span className="font-mono font-bold">{params.carrierFreqKhz} kHz</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={16}
                    step={2}
                    disabled={params.starterMode !== 'vfd'}
                    value={params.carrierFreqKhz}
                    onChange={(e) => updateParam('carrierFreqKhz', Number(e.target.value))}
                    className="w-full accent-[var(--md-primary)] disabled:opacity-40"
                  />
                </div>

                <div>
                  <div className="mb-1 text-[var(--md-on-surface-variant)]">
                    {pick('Motor Poles', 'Jumlah Kutub', '電動機極数')}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {([2, 4, 6] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateParam('poles', p)}
                        className={`rounded-full py-1 text-[11px] font-mono ${
                          params.poles === p
                            ? 'm3-btn-filled font-bold'
                            : 'glass-pill font-semibold'
                        }`}
                      >
                        {p}P
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. FAULT INJECTION */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-2.5"
            data-tour="vfd-fault-panel"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              {pick('Fault Injection & Diagnostics', 'Injeksi Gangguan & Diagnosis', '故障注入・診断')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {faultModes.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updateParam('faultMode', f.id)}
                  className={`rounded-full px-3 py-1 text-[11px] transition ${
                    params.faultMode === f.id
                      ? f.id === 'normal'
                        ? 'm3-btn-filled font-bold'
                        : 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. TELEMETRY READOUT */}
          <div
            className="glass-panel rounded-[28px] p-4 space-y-2.5"
            data-tour="vfd-telemetry"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              {pick('Live Drive & Motor Telemetry', 'Telemetri Penggerak & Motor', 'ドライブ・電動機テレメトリ')}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                {
                  label: pick('Rotor Speed', 'Putaran Rotor', '回転速度'),
                  value: `${Math.round(computed.rotorSpeedRpm)} RPM`,
                },
                {
                  label: pick('Slip', 'Slip', '滑り'),
                  value: `${computed.slipPct.toFixed(1)}%`,
                },
                {
                  label: pick('Output V / Hz', 'Tegangan / Hz', '出力 V / Hz'),
                  value: `${Math.round(computed.outputVoltageV)}V / ${computed.effectiveFreqHz.toFixed(1)}Hz`,
                },
                {
                  label: pick('Stator Current', 'Arus Stator', '固定子電流'),
                  value: `${computed.outputCurrentA.toFixed(1)} A (${Math.round(computed.currentPct)}%)`,
                },
                {
                  label: pick('DC Bus V_dc', 'Bus DC', 'DCバス電圧'),
                  value:
                    params.starterMode === 'vfd'
                      ? `${Math.round(computed.dcBusVoltageV)} V`
                      : '—',
                },
                {
                  label: pick('Shaft EDM V', 'Teg. Poros EDM', '軸電圧 EDM'),
                  value: `${computed.shaftVoltageVpk.toFixed(1)} Vpk`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-2.5 py-2"
                >
                  <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                    {item.label}
                  </div>
                  <div className="font-mono text-xs font-bold text-[var(--md-on-surface)]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
