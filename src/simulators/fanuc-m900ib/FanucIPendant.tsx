import { useRef, useState } from 'react';
import {
  AlertOctagon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Save,
  Square,
} from 'lucide-react';
import type {
  CoordMode,
  FanucAlarmCode,
  JointAngles,
  KinematicsResult,
  TpProgramLine,
} from './fanucM900Physics';
import { FANUC_ALARMS } from './fanucM900Physics';

type LcdTab = 'edit' | 'posn' | 'alarm';

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
    tpSwitch: string;
    deadman: string;
    eStop: string;
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

const JOINT_AXIS_NAMES: { key: keyof JointAngles; label: string }[] = [
  { key: 'j1', label: 'J1' },
  { key: 'j2', label: 'J2' },
  { key: 'j3', label: 'J3' },
  { key: 'j4', label: 'J4' },
  { key: 'j5', label: 'J5' },
  { key: 'j6', label: 'J6' },
];

const WORLD_AXIS_NAMES: {
  key: 'x' | 'y' | 'z' | 'w' | 'p' | 'r';
  label: string;
  unit: string;
}[] = [
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
  const [lcdTab, setLcdTab] = useState<LcdTab>('edit');
  const [shiftHeld, setShiftHeld] = useState(false);

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

  const moveCursor = (delta: number) => {
    if (program.length === 0) return;
    const idx = program.findIndex((p) => p.lineNumber === activeLine);
    const nextIdx = Math.max(0, Math.min(program.length - 1, (idx === -1 ? 0 : idx) + delta));
    onSelectLine(program[nextIdx].lineNumber);
  };

  const alarmInfo = FANUC_ALARMS[alarm];
  const hasFault = alarm !== 'none' || eStopActive;

  return (
    <div
      data-tour="fanuc-pendant"
      className="relative flex flex-col gap-2.5 rounded-[24px] border-4 border-[#334155] bg-gradient-to-b from-[#2b3445] via-[#1f2735] to-[#171e2b] p-3 text-slate-100 shadow-[0_24px_48px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)]"
    >
      {/* Rubberized FANUC Yellow Corner Bumpers */}
      <div className="pointer-events-none absolute -top-1 left-4 right-4 h-1.5 rounded-full bg-amber-400/80" />

      {/* Top Hardware Strip: FANUC Badge + TP Key Switch + Deadman + Red Mushroom E-Stop */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700/80 bg-slate-950/70 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="inline-block rounded bg-[#facc15] px-1.5 py-0.5 font-mono text-[10px] font-black tracking-widest text-slate-950">
              FANUC
            </span>
          </div>
          <div className="leading-tight">
            <div className="font-mono text-[11px] font-bold text-slate-200">
              iPendant R-30iB
            </div>
            <div className="font-mono text-[9px] text-slate-400">
              {labels.pendantTitle}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* TP ON/OFF Selector Switch */}
          <button
            type="button"
            onClick={onToggleTp}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[10px] font-bold transition ${
              tpEnabled
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                tpEnabled ? 'bg-amber-400' : 'bg-slate-600'
              }`}
            />
            {labels.tpSwitch}: {tpEnabled ? 'ON' : 'OFF'}
          </button>

          {/* 3-Position Deadman Grip */}
          <button
            type="button"
            onClick={onToggleDeadman}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[10px] font-bold transition ${
              deadmanEnabled
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.25)]'
                : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                deadmanEnabled ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
            {labels.deadman}: {deadmanEnabled ? 'ON' : 'OFF'}
          </button>

          {/* Yellow Collar + Red Mushroom E-Stop */}
          <button
            type="button"
            onClick={onToggleEStop}
            className={`inline-flex items-center gap-1 rounded-full border-4 px-2.5 py-1 font-mono text-[10px] font-black transition ${
              eStopActive
                ? 'animate-pulse border-amber-400 bg-rose-600 text-white shadow-[0_0_14px_rgba(225,29,72,0.8)]'
                : 'border-amber-400/90 bg-rose-700 text-white hover:bg-rose-600'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            {labels.eStop}
          </button>
        </div>
      </div>

      {/* Hardware Status LED Strip */}
      <div className="grid grid-cols-5 gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 font-mono text-[9px] font-bold tracking-wider">
        {[
          { label: 'POWER', active: true, color: 'bg-emerald-400 text-emerald-300' },
          { label: 'BUSY', active: isRunningProgram, color: 'bg-amber-400 text-amber-300' },
          { label: 'STEP', active: stepMode, color: 'bg-sky-400 text-sky-300' },
          { label: 'HOLD', active: !isRunningProgram && !hasFault, color: 'bg-amber-300 text-amber-200' },
          { label: 'FAULT', active: hasFault, color: 'bg-rose-500 text-rose-300' },
        ].map((led) => (
          <div key={led.label} className="flex items-center justify-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                led.active ? led.color.split(' ')[0] : 'bg-slate-700'
              }`}
            />
            <span className={led.active ? led.color.split(' ')[1] : 'text-slate-600'}>
              {led.label}
            </span>
          </div>
        ))}
      </div>

      {/* R-30iB Color Touch LCD Screen */}
      <div
        data-tour="fanuc-pendant-screen"
        className="overflow-hidden rounded-xl border-[3px] border-slate-700 bg-[#0A192F] font-mono text-xs shadow-[inset_0_2px_10px_rgba(0,0,0,0.85)]"
      >
        {/* Authentic FANUC Navy/Blue Top Status Bar */}
        <div className="flex items-center justify-between bg-[#1e40af] px-2.5 py-1 text-[10px] font-bold text-white">
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-black ${
                hasFault
                  ? 'bg-rose-600 text-white'
                  : isRunningProgram
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-400 text-slate-950'
              }`}
            >
              {hasFault ? 'FAULT' : isRunningProgram ? 'RUN' : 'READY'}
            </span>
            <span className="rounded bg-sky-900/90 px-1.5 py-0.5 text-[9px] text-sky-200">
              {coordMode}
            </span>
            <span className="text-amber-300">{speedPct}%</span>
            <span className="rounded bg-slate-950/60 px-1.5 py-0.5 text-[9px]">
              {stepMode ? labels.step : labels.cont}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px]">
            <span className={gripperOn ? 'text-emerald-300' : 'text-slate-300'}>
              DO[1]:{gripperOn ? 'ON' : 'OFF'}
            </span>
            <span className="text-sky-200">T1</span>
          </div>
        </div>

        {/* Alarm Banner */}
        <div
          className={`border-b px-2.5 py-1 text-[10px] font-semibold ${
            alarm === 'none'
              ? 'border-slate-800 bg-[#0f2942] text-emerald-300'
              : 'border-rose-700/70 bg-rose-950/90 text-rose-200'
          }`}
        >
          {alarmInfo.label}
        </div>

        {/* LCD Content Area (switches via F1..F5 softkeys) */}
        <div className="min-h-[168px] p-2">
          {lcdTab === 'edit' && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
              {/* Compact Live Readout */}
              <div className="rounded border border-slate-800 bg-slate-950/80 p-2 sm:col-span-5">
                <div className="mb-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-sky-400">
                  <span>{coordMode === 'JOINT' ? 'JOINT (°)' : 'WORLD (MM/°)'}</span>
                  <span>UFRAME 0</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
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
                            {kinematics[key].toFixed(
                              key === 'x' || key === 'y' || key === 'z' ? 0 : 1
                            )}
                            {unit}
                          </span>
                        </div>
                      ))}
                </div>
              </div>

              {/* TP Program Editor */}
              <div
                data-tour="fanuc-tp-program"
                className="rounded border border-slate-800 bg-slate-950/80 p-2 sm:col-span-7"
              >
                <div className="mb-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  <span>{labels.programHeader}</span>
                  <span className="text-slate-400">LN {activeLine}/{program.length}</span>
                </div>
                <div className="space-y-0.5 text-[10px]">
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
          )}

          {lcdTab === 'posn' && (
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded border border-slate-800 bg-slate-950/80 p-2">
                <div className="mb-1 font-bold text-sky-400">JOINT POSITION (DEG)</div>
                {JOINT_AXIS_NAMES.map(({ key, label }) => (
                  <div key={key} className="flex justify-between py-0.5">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-bold text-slate-100">{joints[key].toFixed(2)}°</span>
                  </div>
                ))}
              </div>
              <div className="rounded border border-slate-800 bg-slate-950/80 p-2">
                <div className="mb-1 font-bold text-amber-400">WORLD POSITION (UTOOL 1)</div>
                {WORLD_AXIS_NAMES.map(({ key, label, unit }) => (
                  <div key={key} className="flex justify-between py-0.5">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-bold text-slate-100">
                      {kinematics[key].toFixed(key === 'x' || key === 'y' || key === 'z' ? 1 : 2)}{' '}
                      {unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lcdTab === 'alarm' && (
            <div className="rounded border border-slate-800 bg-slate-950/80 p-2.5 text-[10px]">
              <div className="mb-1.5 font-bold uppercase tracking-wider text-rose-400">
                ALARM HISTORY / ACTIVE DIAGNOSTICS
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between rounded bg-slate-900 px-2 py-1">
                  <span className="text-slate-400">ACTIVE:</span>
                  <span className={alarm === 'none' ? 'text-emerald-300' : 'font-bold text-rose-300'}>
                    {alarmInfo.label}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-300">
                  {alarmInfo.description}
                </p>
                <div className="flex items-center justify-between pt-1 text-slate-400">
                  <span>J2 TORQUE LOAD: {kinematics.j2LoadPct.toFixed(1)}%</span>
                  <span>REACH: {kinematics.reachPct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom LCD Softkey Labels (F1..F5) */}
        <div className="grid grid-cols-5 border-t border-slate-700 bg-[#1e3a8a] text-center font-mono text-[9px] font-bold text-sky-100">
          <button
            type="button"
            onClick={() => setLcdTab('edit')}
            className={`border-r border-slate-700 py-1 transition ${
              lcdTab === 'edit' ? 'bg-sky-600 text-white' : 'hover:bg-sky-800/70'
            }`}
          >
            F1 EDIT
          </button>
          <button
            type="button"
            onClick={onTouchupPoint}
            className="border-r border-slate-700 py-1 hover:bg-sky-800/70"
          >
            F2 TOUCHUP
          </button>
          <button
            type="button"
            onClick={onToggleCoord}
            className="border-r border-slate-700 py-1 hover:bg-sky-800/70"
          >
            F3 {coordMode}
          </button>
          <button
            type="button"
            onClick={() => setLcdTab('posn')}
            className={`border-r border-slate-700 py-1 transition ${
              lcdTab === 'posn' ? 'bg-sky-600 text-white' : 'hover:bg-sky-800/70'
            }`}
          >
            F4 POSN
          </button>
          <button
            type="button"
            onClick={() => setLcdTab('alarm')}
            className={`py-1 transition ${
              lcdTab === 'alarm' ? 'bg-sky-600 text-white' : 'hover:bg-sky-800/70'
            }`}
          >
            F5 ALARM
          </button>
        </div>
      </div>

      {/* Physical Membrane Control Keys (Left) + Cursor D-Pad (Right) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
        {/* Control Keys */}
        <div className="grid grid-cols-4 gap-1.5 sm:col-span-9">
          <button
            type="button"
            onClick={() => setShiftHeld((v) => !v)}
            className={`rounded-lg border px-2 py-2 font-mono text-[10px] font-black transition ${
              shiftHeld
                ? 'border-sky-300 bg-sky-500 text-slate-950'
                : 'border-sky-700 bg-sky-900/70 text-sky-200 hover:bg-sky-800'
            }`}
          >
            SHIFT
          </button>

          <button
            type="button"
            onClick={onResetAlarm}
            className="flex items-center justify-center gap-1 rounded-lg border border-sky-500/60 bg-sky-950/80 px-2 py-2 font-mono text-[10px] font-bold text-sky-200 hover:bg-sky-900"
          >
            <RotateCcw className="h-3 w-3" />
            {labels.reset}
          </button>

          <button
            type="button"
            onClick={onToggleCoord}
            className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 font-mono text-[10px] font-bold text-amber-300 hover:bg-slate-700"
          >
            {labels.coord}
          </button>

          <button
            type="button"
            onClick={onToggleStep}
            className={`rounded-lg border px-2 py-2 font-mono text-[10px] font-bold transition ${
              stepMode
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {labels.step}
          </button>

          <button
            type="button"
            onClick={() => onChangeSpeed(-10)}
            className="flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 font-mono text-[10px] font-bold text-slate-200 hover:bg-slate-700"
            aria-label="Decrease Speed"
          >
            <Minus className="h-3 w-3" />%
          </button>

          <button
            type="button"
            onClick={() => onChangeSpeed(10)}
            className="flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 font-mono text-[10px] font-bold text-slate-200 hover:bg-slate-700"
            aria-label="Increase Speed"
          >
            <Plus className="h-3 w-3" />%
          </button>

          <button
            type="button"
            onClick={onTouchupPoint}
            className="flex items-center justify-center gap-1 rounded-lg border border-violet-500/60 bg-violet-950/70 px-2 py-2 font-mono text-[10px] font-bold text-violet-200 hover:bg-violet-900"
          >
            <Save className="h-3 w-3" />
            {labels.touchup}
          </button>

          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={onFwdRun}
              className="flex items-center justify-center rounded-lg border border-emerald-500/70 bg-emerald-700 px-1 py-2 font-mono text-[10px] font-black text-white hover:bg-emerald-600"
              title={labels.fwd}
            >
              <Play className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onHoldStop}
              className="flex items-center justify-center rounded-lg border border-rose-500/70 bg-rose-700 px-1 py-2 font-mono text-[10px] font-black text-white hover:bg-rose-600"
              title={labels.hold}
            >
              <Square className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Cursor D-Pad */}
        <div className="grid grid-cols-3 gap-0.5 rounded-xl border border-slate-700 bg-slate-900/90 p-1 sm:col-span-3">
          <div />
          <button
            type="button"
            onClick={() => moveCursor(-1)}
            className="flex items-center justify-center rounded bg-slate-800 py-1 text-slate-200 hover:bg-slate-700"
            aria-label="Cursor Up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => setLcdTab('edit')}
            className="flex items-center justify-center rounded bg-slate-800 py-1 text-slate-200 hover:bg-slate-700"
            aria-label="Previous Screen"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center justify-center font-mono text-[8px] font-bold text-slate-500">
            ENT
          </div>
          <button
            type="button"
            onClick={() => setLcdTab('posn')}
            className="flex items-center justify-center rounded bg-slate-800 py-1 text-slate-200 hover:bg-slate-700"
            aria-label="Next Screen"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => moveCursor(1)}
            className="flex items-center justify-center rounded bg-slate-800 py-1 text-slate-200 hover:bg-slate-700"
            aria-label="Cursor Down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <div />
        </div>
      </div>

      {/* Authentic Blue FANUC Directional Jog Keys (±J1..±J6 or ±X..±R) */}
      <div
        data-tour="fanuc-jog-keys"
        className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/70 p-2"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono font-bold uppercase tracking-wider text-sky-300">
            {coordMode === 'JOINT' ? 'JOINT JOG (±J1..±J6)' : 'WORLD JOG (±X..±R)'}
          </span>
          <span>{labels.holdHint}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {(coordMode === 'JOINT' ? JOINT_AXIS_NAMES : WORLD_AXIS_NAMES).map((axis, idx) => (
            <div
              key={axis.key}
              className="flex flex-col gap-1 rounded-lg border border-slate-700/80 bg-[#0f172a] p-1"
            >
              <button
                type="button"
                onPointerDown={() => startJog(idx, 1)}
                onPointerUp={stopContinuousJog}
                onPointerLeave={stopContinuousJog}
                onPointerCancel={stopContinuousJog}
                className="!rounded-md bg-[#0284c7] py-1.5 font-mono text-[10px] font-black text-white shadow-sm active:bg-sky-400"
              >
                +{axis.label}
              </button>
              <button
                type="button"
                onPointerDown={() => startJog(idx, -1)}
                onPointerUp={stopContinuousJog}
                onPointerLeave={stopContinuousJog}
                onPointerCancel={stopContinuousJog}
                className="!rounded-md bg-[#0369a1] py-1.5 font-mono text-[10px] font-black text-white shadow-sm active:bg-sky-400"
              >
                -{axis.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
