import { useRef } from 'react';
import {
  AlertOctagon,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Save,
  Square,
} from 'lucide-react';
import type {
  CartesianAxis,
  CoordMode,
  FanucAlarmCode,
  JointAngles,
  KinematicsResult,
  TpProgramLine,
} from './fanucM900Physics';
import { FANUC_ALARMS } from './fanucM900Physics';

interface FanucIPendantProps {
  coordMode: CoordMode;
  speedPct: number;
  stepMode: boolean;
  tpEnabled: boolean;
  deadmanEnabled: boolean;
  eStopActive: boolean;
  alarm: FanucAlarmCode;
  joints: JointAngles;
  kinematics: KinematicsResult;
  program: TpProgramLine[];
  activeLine: number;
  isRunningProgram: boolean;
  gripperOn: boolean;
  onToggleEStop: () => void;
  onToggleTp: () => void;
  onToggleDeadman: () => void;
  onResetAlarm: () => void;
  onToggleCoord: () => void;
  onToggleStep: () => void;
  onChangeSpeed: (delta: number) => void;
  onTouchupPoint: () => void;
  onFwdRun: () => void;
  onHoldStop: () => void;
  onSelectLine: (lineNum: number) => void;
  onJogStep: (index: number, dir: 1 | -1) => void;
  labels: {
    pendantTitle: string;
    eStop: string;
    tpSwitch: string;
    deadman: string;
    reset: string;
    coord: string;
    step: string;
    cont: string;
    touchup: string;
    fwd: string;
    hold: string;
    programHeader: string;
    holdHint: string;
  };
}

const JOINT_AXIS_NAMES: Array<{ key: keyof JointAngles; label: string }> = [
  { key: 'j1', label: 'J1' },
  { key: 'j2', label: 'J2' },
  { key: 'j3', label: 'J3' },
  { key: 'j4', label: 'J4' },
  { key: 'j5', label: 'J5' },
  { key: 'j6', label: 'J6' },
];

const WORLD_AXIS_NAMES: Array<{ key: CartesianAxis; label: string; unit: string }> = [
  { key: 'x', label: 'X', unit: 'mm' },
  { key: 'y', label: 'Y', unit: 'mm' },
  { key: 'z', label: 'Z', unit: 'mm' },
  { key: 'w', label: 'W', unit: '°' },
  { key: 'p', label: 'P', unit: '°' },
  { key: 'r', label: 'R', unit: '°' },
];

export function FanucIPendant({
  coordMode,
  speedPct,
  stepMode,
  tpEnabled,
  deadmanEnabled,
  eStopActive,
  alarm,
  joints,
  kinematics,
  program,
  activeLine,
  isRunningProgram,
  gripperOn,
  onToggleEStop,
  onToggleTp,
  onToggleDeadman,
  onResetAlarm,
  onToggleCoord,
  onToggleStep,
  onChangeSpeed,
  onTouchupPoint,
  onFwdRun,
  onHoldStop,
  onSelectLine,
  onJogStep,
  labels,
}: FanucIPendantProps) {
  const jogIntervalRef = useRef<number | null>(null);

  const stopContinuousJog = () => {
    if (jogIntervalRef.current !== null) {
      window.clearInterval(jogIntervalRef.current);
      jogIntervalRef.current = null;
    }
  };

  const startJog = (index: number, dir: 1 | -1) => {
    stopContinuousJog();
    onJogStep(index, dir);
    jogIntervalRef.current = window.setInterval(() => {
      onJogStep(index, dir);
    }, 85);
  };

  const alarmInfo = FANUC_ALARMS[alarm];

  return (
    <div
      data-tour="fanuc-pendant"
      className="flex flex-col gap-3 rounded-2xl border-2 border-slate-700 bg-slate-900 p-3.5 text-slate-100 shadow-2xl"
    >
      {/* Top Pendant Bezel: E-Stop, TP ON/OFF, Deadman, RESET */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[10px] font-black tracking-wider text-slate-950">
            FANUC
          </span>
          <span className="font-mono text-xs font-semibold text-slate-300">
            {labels.pendantTitle}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* TP ON/OFF Switch */}
          <button
            type="button"
            onClick={onToggleTp}
            className={`rounded-lg border px-2 py-1 font-mono text-[11px] font-bold transition ${
              tpEnabled
                ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            {labels.tpSwitch}: {tpEnabled ? 'ON' : 'OFF'}
          </button>

          {/* Deadman Enable Toggle */}
          <button
            type="button"
            onClick={onToggleDeadman}
            className={`rounded-lg border px-2 py-1 font-mono text-[11px] font-bold transition ${
              deadmanEnabled
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            {labels.deadman}: {deadmanEnabled ? 'ON' : 'OFF'}
          </button>

          {/* Red Mushroom E-Stop */}
          <button
            type="button"
            onClick={onToggleEStop}
            className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 font-mono text-[11px] font-black transition ${
              eStopActive
                ? 'animate-pulse border-rose-300 bg-rose-600 text-white shadow-md shadow-rose-600/50'
                : 'border-rose-500/70 bg-rose-950/70 text-rose-300 hover:bg-rose-900/80'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            {labels.eStop}
          </button>
        </div>
      </div>

      {/* Color LCD Screen */}
      <div
        data-tour="fanuc-pendant-screen"
        className="overflow-hidden rounded-xl border-2 border-slate-700 bg-[#0B172A] font-mono text-xs shadow-inner"
      >
        {/* LCD Header Status Bar */}
        <div className="flex items-center justify-between bg-[#1D4ED8] px-2.5 py-1 text-[11px] font-bold text-white">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] text-slate-950">
              {coordMode}
            </span>
            <span>{speedPct}%</span>
            <span className="rounded bg-slate-900/50 px-1.5 py-0.5 text-[10px]">
              {stepMode ? labels.step : labels.cont}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className={gripperOn ? 'text-emerald-300' : 'text-slate-300'}>
              DO[1]:{gripperOn ? 'ON' : 'OFF'}
            </span>
            <span className={isRunningProgram ? 'text-amber-300' : 'text-slate-200'}>
              {isRunningProgram ? 'RUN' : 'READY'}
            </span>
          </div>
        </div>

        {/* Alarm Banner inside LCD */}
        <div
          className={`border-b px-2.5 py-1 text-[11px] font-semibold ${
            alarm === 'none'
              ? 'border-slate-800 bg-emerald-950/50 text-emerald-300'
              : 'border-rose-700/60 bg-rose-950/80 text-rose-200'
          }`}
        >
          {alarmInfo.label}
        </div>

        {/* Split LCD Body: Coordinates + TP Program */}
        <div className="grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-2">
          {/* Live Coordinates (JOINT or WORLD) */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
              {coordMode === 'JOINT' ? 'JOINT (DEG)' : 'WORLD (MM / DEG)'}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
              {coordMode === 'JOINT'
                ? JOINT_AXIS_NAMES.map(({ key, label }) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-100">{joints[key].toFixed(1)}°</span>
                    </div>
                  ))
                : WORLD_AXIS_NAMES.map(({ key, label, unit }) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-slate-100">
                        {kinematics[key].toFixed(key === 'x' || key === 'y' || key === 'z' ? 0 : 1)}
                        {unit}
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          {/* TP Program Listing */}
          <div
            data-tour="fanuc-tp-program"
            className="rounded-lg border border-slate-800 bg-slate-950/70 p-2"
          >
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              {labels.programHeader}
            </div>
            <div className="space-y-0.5 text-[11px]">
              {program.map((line) => {
                const isActive = line.lineNumber === activeLine;
                return (
                  <button
                    key={line.lineNumber}
                    type="button"
                    onClick={() => onSelectLine(line.lineNumber)}
                    className={`block w-full truncate rounded px-1.5 py-0.5 text-left transition ${
                      isActive
                        ? 'bg-amber-400 font-bold text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {isActive ? '▶ ' : '  '}
                    {line.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Control Keys Row: RESET, COORD, STEP, -%, +%, RECORD, FWD, HOLD */}
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        <button
          type="button"
          onClick={onResetAlarm}
          className="flex items-center justify-center gap-1 rounded-lg border border-sky-500/60 bg-sky-950/70 px-2 py-2 font-mono text-[11px] font-bold text-sky-200 hover:bg-sky-900/80"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {labels.reset}
        </button>

        <button
          type="button"
          onClick={onToggleCoord}
          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 font-mono text-[11px] font-bold text-amber-300 hover:bg-slate-700"
        >
          {labels.coord}
        </button>

        <button
          type="button"
          onClick={onToggleStep}
          className={`rounded-lg border px-2 py-2 font-mono text-[11px] font-bold transition ${
            stepMode
              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
              : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {labels.step}
        </button>

        <button
          type="button"
          onClick={() => onChangeSpeed(-10)}
          className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 font-mono text-[11px] font-bold text-slate-200 hover:bg-slate-700"
          aria-label="Decrease Speed"
        >
          <Minus className="h-3.5 w-3.5" />%
        </button>

        <button
          type="button"
          onClick={() => onChangeSpeed(10)}
          className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 font-mono text-[11px] font-bold text-slate-200 hover:bg-slate-700"
          aria-label="Increase Speed"
        >
          <Plus className="h-3.5 w-3.5" />%
        </button>

        <button
          type="button"
          onClick={onTouchupPoint}
          className="flex items-center justify-center gap-1 rounded-lg border border-violet-500/50 bg-violet-950/70 px-2 py-2 font-mono text-[11px] font-bold text-violet-200 hover:bg-violet-900/80"
        >
          <Save className="h-3.5 w-3.5" />
          {labels.touchup}
        </button>

        <button
          type="button"
          onClick={onFwdRun}
          className="flex items-center justify-center gap-1 rounded-lg border border-emerald-500/60 bg-emerald-700 px-2 py-2 font-mono text-[11px] font-bold text-white hover:bg-emerald-600"
        >
          <Play className="h-3.5 w-3.5" />
          {labels.fwd}
        </button>

        <button
          type="button"
          onClick={onHoldStop}
          className="flex items-center justify-center gap-1 rounded-lg border border-rose-500/60 bg-rose-800 px-2 py-2 font-mono text-[11px] font-bold text-white hover:bg-rose-700"
        >
          <Square className="h-3.5 w-3.5" />
          {labels.hold}
        </button>
      </div>

      {/* Jog Keys Grid (±J1..±J6 or ±X..±R) */}
      <div data-tour="fanuc-jog-keys" className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono uppercase tracking-wider">
            {coordMode === 'JOINT' ? 'JOINT JOG (±J1..±J6)' : 'WORLD JOG (±X..±R)'}
          </span>
          <span>{labels.holdHint}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {(coordMode === 'JOINT' ? JOINT_AXIS_NAMES : WORLD_AXIS_NAMES).map((axis, idx) => (
            <div
              key={axis.key}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/90 p-1"
            >
              <button
                type="button"
                onPointerDown={() => startJog(idx, -1)}
                onPointerUp={stopContinuousJog}
                onPointerLeave={stopContinuousJog}
                onPointerCancel={stopContinuousJog}
                className="rounded bg-sky-700/80 px-2 py-1.5 font-mono text-[11px] font-bold text-white active:bg-sky-500"
              >
                -{axis.label}
              </button>
              <button
                type="button"
                onPointerDown={() => startJog(idx, 1)}
                onPointerUp={stopContinuousJog}
                onPointerLeave={stopContinuousJog}
                onPointerCancel={stopContinuousJog}
                className="rounded bg-sky-600/80 px-2 py-1.5 font-mono text-[11px] font-bold text-white active:bg-sky-400"
              >
                +{axis.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
