import { useRef, useState } from 'react';
import type {
  CoordMode,
  FanucAlarmCode,
  JointAngles,
  KinematicsResult,
  TpProgramLine,
} from './fanucM900Physics';
import { FANUC_ALARMS } from './fanucM900Physics';

type ScreenMode = 'split' | 'edit' | 'posn' | 'io' | 'alarm';

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
  onToggleGripper?: () => void;
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
  { key: 'w', label: 'W', unit: 'deg' },
  { key: 'p', label: 'P', unit: 'deg' },
  { key: 'r', label: 'R', unit: 'deg' },
];

/**
 * 1:1 FANUC A05B-2255-C101 12-Key Axis Jog Legend Definitions
 */
const JOG_KEY_PAIRS: {
  index: number;
  negCart: string;
  posCart: string;
  jointSub: string;
  rotational?: boolean;
}[] = [
  { index: 0, negCart: '-X', posCart: '+X', jointSub: 'J1' },
  { index: 1, negCart: '-Y', posCart: '+Y', jointSub: 'J2' },
  { index: 2, negCart: '-Z', posCart: '+Z', jointSub: 'J3' },
  { index: 3, negCart: '-X', posCart: '+X', jointSub: 'J4', rotational: true },
  { index: 4, negCart: '-Y', posCart: '+Y', jointSub: 'J5', rotational: true },
  { index: 5, negCart: '-Z', posCart: '+Z', jointSub: 'J6', rotational: true },
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
  onToggleGripper,
  labels,
}: FanucIPendantProps) {
  const jogIntervalRef = useRef<number | null>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>('split');
  const [shiftLatched, setShiftLatched] = useState(true);
  const [numBuffer, setNumBuffer] = useState('');

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
    }, 80);
  };

  const moveCursor = (delta: number) => {
    if (program.length === 0) return;
    const idx = program.findIndex((p) => p.lineNumber === activeLine);
    const nextIdx = Math.max(0, Math.min(program.length - 1, (idx === -1 ? 0 : idx) + delta));
    onSelectLine(program[nextIdx].lineNumber);
  };

  const handleDigit = (ch: string) => {
    setNumBuffer((prev) => (prev.length < 4 ? prev + ch : prev));
  };

  const handleEnterNumeric = () => {
    const parsed = Number.parseInt(numBuffer, 10);
    if (!Number.isNaN(parsed)) {
      if (parsed >= 1 && parsed <= program.length) {
        onSelectLine(parsed);
      } else if (parsed >= 5 && parsed <= 100) {
        onChangeSpeed(parsed - speedPct);
      }
    }
    setNumBuffer('');
  };

  const alarmInfo = FANUC_ALARMS[alarm];
  const hasFault = alarm !== 'none' || eStopActive;

  // Softkey definitions matching R-30iB screen bottom bar
  const softkeys: { f: string; label: string; active?: boolean; onClick: () => void }[] = [
    {
      f: 'F1',
      label: screenMode === 'split' ? 'SPLIT' : 'EDIT',
      active: screenMode === 'split' || screenMode === 'edit',
      onClick: () => setScreenMode((m) => (m === 'split' ? 'edit' : 'split')),
    },
    {
      f: 'F2',
      label: 'TOUCHUP',
      onClick: onTouchupPoint,
    },
    {
      f: 'F3',
      label: 'POSN',
      active: screenMode === 'posn',
      onClick: () => setScreenMode('posn'),
    },
    {
      f: 'F4',
      label: 'I/O',
      active: screenMode === 'io',
      onClick: () => setScreenMode('io'),
    },
    {
      f: 'F5',
      label: 'ALARM',
      active: screenMode === 'alarm',
      onClick: () => setScreenMode('alarm'),
    },
  ];

  return (
    <div
      data-tour="fanuc-pendant"
      style={{
        background: 'linear-gradient(180deg, #323741 0%, #262a33 48%, #1e222a 100%)',
        borderColor: '#15181e',
      }}
      className="fanuc-hw-scope relative mx-auto flex w-full max-w-[540px] select-none flex-col gap-2 rounded-[26px] border-[5px] p-3 shadow-[0_26px_55px_rgba(0,0,0,0.68),inset_0_2px_1px_rgba(255,255,255,0.16)]"
    >
      {/* Molded Black Corner Shock Bumpers */}
      <div
        style={{ backgroundColor: '#14171c' }}
        className="pointer-events-none absolute -left-1.5 -top-1.5 h-10 w-10 rounded-tl-[26px] border-l-4 border-t-4 border-[#0e1014]"
      />
      <div
        style={{ backgroundColor: '#14171c' }}
        className="pointer-events-none absolute -right-1.5 -top-1.5 h-10 w-10 rounded-tr-[26px] border-r-4 border-t-4 border-[#0e1014]"
      />

      {/* Side Peek-Out 3-Position Yellow Deadman Switch Bar (Rear Grip Interlock) */}
      <button
        type="button"
        onClick={onToggleDeadman}
        title="Rear 3-Position Deadman Enabling Switch (Click to Engage Center Position)"
        style={{
          backgroundColor: deadmanEnabled ? '#facc15' : '#713f12',
          borderColor: deadmanEnabled ? '#fef08a' : '#422006',
          color: deadmanEnabled ? '#0f172a' : '#fde68a',
        }}
        className="hw-key mx-6 flex items-center justify-between border-2 px-2.5 py-1 font-mono text-[9.5px] font-black tracking-wide shadow-md transition"
      >
        <span className="flex items-center gap-1.5">
          <span
            style={{ backgroundColor: deadmanEnabled ? '#16a34a' : '#dc2626' }}
            className="inline-block h-2 w-2 rounded-full"
          />
          3-POS {labels.deadman}
        </span>
        <span>{deadmanEnabled ? '● CENTER HELD' : '○ RELEASED'}</span>
      </button>

      {/* =================================================================== */}
      {/* TOP MOLDED HARDWARE HEAD: Rotary Key Switch + Branding/LEDs + EMO   */}
      {/* =================================================================== */}
      <div
        style={{ backgroundColor: '#1d2129', borderColor: '#3b4252' }}
        className="hw-box grid grid-cols-12 items-center gap-2 border px-2.5 py-2 shadow-inner"
      >
        {/* Left: 2-Position Physical TP ON/OFF Rotary Key Switch */}
        <div className="col-span-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTp}
            aria-label="TP Enable Key Switch"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #e2e8f0, #64748b 70%, #334155)',
              borderColor: tpEnabled ? '#facc15' : '#475569',
            }}
            className="hw-round relative flex h-11 w-11 shrink-0 items-center justify-center border-2 shadow-[0_3px_8px_rgba(0,0,0,0.65)]"
          >
            {/* Key Slot Bar */}
            <span
              style={{
                backgroundColor: '#0f172a',
                transform: tpEnabled ? 'rotate(38deg)' : 'rotate(-38deg)',
              }}
              className="block h-6 w-1.5 rounded-sm border border-slate-400 transition-transform duration-200"
            />
          </button>
          <div className="font-mono leading-tight">
            <div className="text-[8px] font-bold tracking-wider text-slate-400">ENABLE</div>
            <div className="flex items-center gap-1 text-[10px] font-black">
              <span style={{ color: !tpEnabled ? '#f87171' : '#64748b' }}>OFF</span>
              <span className="text-slate-600">/</span>
              <span style={{ color: tpEnabled ? '#facc15' : '#64748b' }}>ON</span>
            </div>
            <div className="text-[8px] text-slate-500">T1 MODE</div>
          </div>
        </div>

        {/* Center: Authentic FANUC Emblem + Part No + 5 Rectangular Hardware LEDs */}
        <div className="col-span-5 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5">
            <span
              style={{ backgroundColor: '#facc15', color: '#dc2626' }}
              className="rounded-[2px] px-1.5 py-0.5 font-sans text-[11px] font-black tracking-wider shadow-sm"
            >
              FANUC
            </span>
            <span className="font-sans text-[11px] font-extrabold italic tracking-tight text-slate-200">
              iPendant
            </span>
          </div>

          {/* 5 Recessed Rectangular Status LEDs */}
          <div
            style={{ backgroundColor: '#11141a', borderColor: '#2e3440' }}
            className="grid w-full grid-cols-5 gap-0.5 rounded border px-1 py-1 text-center font-mono text-[7.5px] font-bold"
          >
            {[
              { name: 'PWR', on: true, hex: '#22c55e' },
              { name: 'FLT', on: hasFault, hex: '#ef4444' },
              { name: 'HLD', on: !isRunningProgram && !hasFault, hex: '#facc15' },
              { name: 'STP', on: stepMode, hex: '#facc15' },
              { name: 'BSY', on: isRunningProgram, hex: '#22c55e' },
            ].map((led) => (
              <div key={led.name} className="flex flex-col items-center gap-0.5">
                <span
                  style={{
                    backgroundColor: led.on ? led.hex : '#272c36',
                    boxShadow: led.on ? `0 0 6px ${led.hex}` : 'none',
                  }}
                  className="block h-1.5 w-4 rounded-[1px]"
                />
                <span style={{ color: led.on ? '#e2e8f0' : '#64748b' }}>{led.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Yellow Protective Shroud + 3D Red Mushroom E-STOP */}
        <div className="col-span-3 flex flex-col items-end justify-center">
          <button
            type="button"
            onClick={onToggleEStop}
            aria-label={labels.eStop}
            style={{
              backgroundColor: '#facc15',
              borderColor: eStopActive ? '#ef4444' : '#ca8a04',
            }}
            className={`hw-round relative flex h-12 w-12 items-center justify-center border-2 p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.65)] ${
              eStopActive ? 'animate-pulse ring-2 ring-rose-500' : ''
            }`}
          >
            <span
              style={{
                background: eStopActive
                  ? 'radial-gradient(circle at 35% 35%, #f87171, #991b1b)'
                  : 'radial-gradient(circle at 35% 30%, #ef4444, #b91c1c 70%, #7f1d1d)',
                transform: eStopActive ? 'scale(0.88)' : 'scale(1)',
              }}
              className="flex h-full w-full items-center justify-center rounded-full border border-red-950 font-mono text-[7.5px] font-black text-white shadow-inner transition-transform"
            >
              STOP
            </span>
          </button>
          <span className="mt-0.5 pr-1 font-mono text-[7.5px] font-bold text-amber-300">
            {eStopActive ? '↻ TWIST' : 'E-STOP'}
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6.4" VGA COLOR TOUCH LCD (Authentic Classic FANUC R-30iB HMI UI!)   */}
      {/* =================================================================== */}
      <div
        data-tour="fanuc-pendant-screen"
        style={{ backgroundColor: '#11141a', borderColor: '#0b0e13' }}
        className="hw-box overflow-hidden border-[4px] p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]"
      >
        <div
          style={{ backgroundColor: '#dfe5ec', color: '#0f172a' }}
          className="flex flex-col overflow-hidden rounded-[2px] font-mono text-[10px]"
        >
          {/* R-30iB Top Status Bar (Row 1) */}
          <div
            style={{ backgroundColor: '#c8d2de', borderColor: '#94a3b8' }}
            className="flex items-center justify-between border-b px-1.5 py-0.5 text-[10px] font-bold"
          >
            <div className="flex items-center gap-1">
              <span
                style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                className="px-1.5 py-0.5 text-[9.5px]"
              >
                MAIN_PALLET
              </span>
              <span
                style={{ backgroundColor: '#e2e8f0', color: '#0f172a' }}
                className="border border-slate-400 px-1 py-0.5 text-[9px]"
              >
                L:{activeLine}/{program.length}
              </span>
              <span
                style={{
                  backgroundColor: stepMode ? '#facc15' : '#16a34a',
                  color: stepMode ? '#0f172a' : '#ffffff',
                }}
                className="px-1 py-0.5 text-[9px] font-black"
              >
                {stepMode ? 'STEP' : 'CONT'}
              </span>
              <span
                style={{
                  backgroundColor: hasFault
                    ? '#dc2626'
                    : isRunningProgram
                    ? '#16a34a'
                    : '#eab308',
                  color: hasFault || isRunningProgram ? '#ffffff' : '#0f172a',
                }}
                className="px-1.5 py-0.5 text-[9px] font-black"
              >
                {hasFault ? 'FAULT' : isRunningProgram ? 'RUN' : 'ABORTED'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span
                style={{ backgroundColor: '#0369a1', color: '#ffffff' }}
                className="px-1.5 py-0.5 text-[9.5px] font-black"
              >
                {coordMode}
              </span>
              <span
                style={{
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                }}
                className="px-1.5 py-0.5 text-[9.5px] font-black"
              >
                {speedPct}%
              </span>
            </div>
          </div>

          {/* R-30iB Alarm / System Prompt Line (Row 2) */}
          <div
            style={{
              backgroundColor: alarm === 'none' ? '#eef2f6' : '#b91c1c',
              color: alarm === 'none' ? '#0f172a' : '#ffffff',
              borderColor: '#94a3b8',
            }}
            className="flex items-center justify-between border-b px-1.5 py-0.5 text-[9.5px] font-bold"
          >
            <span className="truncate">
              {alarm === 'none' ? 'R-30iB READY — UF:0 UT:1 (M-900iB/700)' : alarmInfo.label}
            </span>
            {numBuffer && (
              <span
                style={{ backgroundColor: '#facc15', color: '#0f172a' }}
                className="ml-1 px-1 font-black"
              >
                IN:{numBuffer}_
              </span>
            )}
          </div>

          {/* R-30iB Main Viewport Window (Classic White/Cream TP Sheet + Teal Right Pane) */}
          <div className="min-h-[164px]">
            {(screenMode === 'split' || screenMode === 'edit') && (
              <div
                className={`grid min-h-[164px] ${
                  screenMode === 'split' ? 'grid-cols-12' : 'grid-cols-1'
                }`}
              >
                {/* Left Pane: Classic White FANUC TP Program Sheet */}
                <div
                  data-tour="fanuc-tp-program"
                  style={{ backgroundColor: '#f8fafc', borderColor: '#94a3b8' }}
                  className={`${
                    screenMode === 'split' ? 'col-span-7 border-r' : ''
                  } flex flex-col justify-between p-1.5`}
                >
                  <div>
                    <div
                      style={{ backgroundColor: '#0f4c81', color: '#ffffff' }}
                      className="mb-1 flex items-center justify-between px-1.5 py-0.5 text-[9px] font-bold"
                    >
                      <span>MAIN_PALLET.TP</span>
                      <span>CH1</span>
                    </div>
                    <div className="space-y-0.5">
                      {program.map((line) => {
                        const isActive = line.lineNumber === activeLine;
                        return (
                          <button
                            key={line.lineNumber}
                            type="button"
                            onClick={() => onSelectLine(line.lineNumber)}
                            style={{
                              backgroundColor: isActive ? '#facc15' : 'transparent',
                              color: '#0f172a',
                            }}
                            className="hw-line block w-full truncate px-1 py-0.5 text-left font-mono text-[10px] font-bold hover:bg-sky-100"
                          >
                            {isActive ? '▶' : ' '}
                            {line.text}
                          </button>
                        );
                      })}
                      <div style={{ color: '#64748b' }} className="px-1 pt-0.5 text-[9.5px] font-bold">
                        {'  [End]'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Pane (in SPLIT mode): Live J1..J6 / Cartesian Coordinates */}
                {screenMode === 'split' && (
                  <div
                    style={{ backgroundColor: '#eef2f6', color: '#0f172a' }}
                    className="col-span-5 flex flex-col justify-between p-1.5"
                  >
                    <div>
                      <div
                        style={{ backgroundColor: '#0f766e', color: '#ffffff' }}
                        className="mb-1 flex items-center justify-between px-1.5 py-0.5 text-[9px] font-bold"
                      >
                        <span>POSN ({coordMode})</span>
                        <span>UT:1</span>
                      </div>
                      <div className="space-y-0.5 text-[9.5px]">
                        {coordMode === 'JOINT'
                          ? JOINT_AXIS_NAMES.map(({ key, label }) => (
                              <div
                                key={key}
                                className="flex items-center justify-between border-b border-slate-300/70 py-0.2"
                              >
                                <span style={{ color: '#334155' }} className="font-bold">
                                  {label}:
                                </span>
                                <span style={{ color: '#0f172a' }} className="font-black">
                                  {joints[key].toFixed(2)}°
                                </span>
                              </div>
                            ))
                          : WORLD_AXIS_NAMES.map(({ key, label, unit }) => (
                              <div
                                key={key}
                                className="flex items-center justify-between border-b border-slate-300/70 py-0.2"
                              >
                                <span style={{ color: '#334155' }} className="font-bold">
                                  {label}:
                                </span>
                                <span style={{ color: '#0f172a' }} className="font-black">
                                  {kinematics[key].toFixed(
                                    key === 'x' || key === 'y' || key === 'z' ? 1 : 2
                                  )}{' '}
                                  {unit === 'deg' ? '°' : unit}
                                </span>
                              </div>
                            ))}
                      </div>
                    </div>

                    <div
                      style={{ backgroundColor: '#dbeafe', color: '#1e3a8a' }}
                      className="mt-1 flex items-center justify-between rounded-[2px] px-1 py-0.5 text-[8.5px] font-bold"
                    >
                      <span>DO[1:GRIP]</span>
                      <span style={{ color: gripperOn ? '#15803d' : '#b91c1c' }}>
                        {gripperOn ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {screenMode === 'posn' && (
              <div
                style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
                className="grid min-h-[164px] grid-cols-2 gap-2 p-2"
              >
                <div>
                  <div
                    style={{ backgroundColor: '#0f4c81', color: '#ffffff' }}
                    className="mb-1 px-1.5 py-0.5 text-[9px] font-bold"
                  >
                    JOINT (GROUP 1)
                  </div>
                  {JOINT_AXIS_NAMES.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-slate-200 py-0.5 text-[10px]"
                    >
                      <span className="font-bold text-slate-600">{label}</span>
                      <span className="font-black text-slate-900">{joints[key].toFixed(2)} deg</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div
                    style={{ backgroundColor: '#0f766e', color: '#ffffff' }}
                    className="mb-1 px-1.5 py-0.5 text-[9px] font-bold"
                  >
                    WORLD (UF:0 UT:1)
                  </div>
                  {WORLD_AXIS_NAMES.map(({ key, label, unit }) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-slate-200 py-0.5 text-[10px]"
                    >
                      <span className="font-bold text-slate-600">{label}</span>
                      <span className="font-black text-slate-900">
                        {kinematics[key].toFixed(1)} {unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screenMode === 'io' && (
              <div
                style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
                className="min-h-[164px] p-2"
              >
                <div
                  style={{ backgroundColor: '#0f4c81', color: '#ffffff' }}
                  className="mb-1.5 flex justify-between px-1.5 py-0.5 text-[9px] font-bold"
                >
                  <span>I/O DIGITAL OUT (DO)</span>
                  <span>RACK 48 • SLOT 1</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center justify-between rounded border border-slate-300 bg-amber-50 px-2 py-1 font-bold">
                    <span>DO[  1:EOAT_VAC_CLAMP ]</span>
                    <button
                      type="button"
                      onClick={onToggleGripper}
                      style={{
                        backgroundColor: gripperOn ? '#16a34a' : '#475569',
                        color: '#ffffff',
                      }}
                      className="hw-softkey px-2 py-0.5 text-[9.5px] font-black"
                    >
                      {gripperOn ? 'ON (CLICK OFF)' : 'OFF (CLICK ON)'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 px-2 py-0.5">
                    <span>DI[ 10:INFEED_PART_OK ]</span>
                    <span className="font-black text-emerald-700">ON</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 px-2 py-0.5">
                    <span>DI[ 11:LIGHT_CURTAIN  ]</span>
                    <span className="font-black text-emerald-700">CLEAR</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-0.5">
                    <span>UO[  6:FAULT_SIGNAL   ]</span>
                    <span className={hasFault ? 'font-black text-rose-700' : 'font-bold text-slate-500'}>
                      {hasFault ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {screenMode === 'alarm' && (
              <div
                style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}
                className="min-h-[164px] p-2"
              >
                <div
                  style={{ backgroundColor: '#991b1b', color: '#ffffff' }}
                  className="mb-1.5 flex justify-between px-1.5 py-0.5 text-[9px] font-bold"
                >
                  <span>ALARM LOG / ACTIVE FAULT</span>
                  <span>SV-DIAG</span>
                </div>
                <div
                  style={{
                    backgroundColor: alarm === 'none' ? '#ecfdf5' : '#fef2f2',
                    color: alarm === 'none' ? '#065f46' : '#991b1b',
                  }}
                  className="mb-1.5 border border-slate-300 px-2 py-1 font-bold"
                >
                  {alarmInfo.label}
                </div>
                <p className="mb-2 text-[9.5px] leading-snug text-slate-700">
                  {alarmInfo.description}
                </p>
                <div className="flex justify-between border-t border-slate-300 pt-1 text-[9px] font-bold text-slate-600">
                  <span>J2 DISTURB TORQUE: {kinematics.j2LoadPct.toFixed(1)}%</span>
                  <span>REACH: {kinematics.reachPct.toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* R-30iB On-Screen Beveled Touch Softkey Boxes */}
          <div
            style={{ backgroundColor: '#b8c4d4', borderColor: '#64748b' }}
            className="grid grid-cols-5 gap-0.5 border-t p-0.5"
          >
            {softkeys.map((sk) => (
              <button
                key={sk.f}
                type="button"
                onClick={sk.onClick}
                style={{
                  backgroundColor: sk.active ? '#0284c7' : '#e2e8f0',
                  color: sk.active ? '#ffffff' : '#0f172a',
                  borderColor: sk.active ? '#0369a1' : '#94a3b8',
                }}
                className="hw-softkey border py-1 text-center font-mono text-[9px] font-black shadow-sm"
              >
                {sk.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* HARDWARE FUNCTION KEY ROW: [PREV] [F1] [F2] [F3] [F4] [F5] [NEXT]   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-7 gap-1 px-0.5">
        <button
          type="button"
          onClick={() => setScreenMode('split')}
          style={{ backgroundColor: '#475569', color: '#f8fafc', borderColor: '#1e293b' }}
          className="hw-key border-b-2 py-1 font-mono text-[9px] font-black shadow"
        >
          PREV
        </button>
        {softkeys.map((sk) => (
          <button
            key={sk.f}
            type="button"
            onClick={sk.onClick}
            style={{ backgroundColor: '#cbd5e1', color: '#0f172a', borderColor: '#64748b' }}
            className="hw-key border-b-2 py-1 font-mono text-[9.5px] font-black shadow active:translate-y-px"
          >
            {sk.f}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            setScreenMode((m) =>
              m === 'split' ? 'posn' : m === 'posn' ? 'io' : m === 'io' ? 'alarm' : 'split'
            )
          }
          style={{ backgroundColor: '#475569', color: '#f8fafc', borderColor: '#1e293b' }}
          className="hw-key border-b-2 py-1 font-mono text-[9px] font-black shadow"
        >
          NEXT
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1:1 LOWER TACTILE MEMBRANE KEYPAD (3-COLUMN INDUSTRIAL MATRIX)      */}
      {/* =================================================================== */}
      <div
        style={{ backgroundColor: '#191d24', borderColor: '#2d3340' }}
        className="hw-box grid grid-cols-12 gap-1.5 border p-2 shadow-inner"
      >
        {/* COLUMN A (Left 3 cols): Left SHIFT + MENUS / SELECT / EDIT / DATA / FCTN */}
        <div className="col-span-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setShiftLatched((s) => !s)}
            style={{
              backgroundColor: shiftLatched ? '#0284c7' : '#0c4a6e',
              color: '#ffffff',
              borderColor: shiftLatched ? '#7dd3fc' : '#075985',
            }}
            className="hw-key border-b-2 py-2 font-mono text-[10px] font-black shadow"
          >
            SHIFT
          </button>
          {[
            { lbl: 'MENUS', act: () => setScreenMode('split') },
            { lbl: 'SELECT', act: () => setScreenMode('edit') },
            { lbl: 'EDIT', act: () => setScreenMode('split') },
            { lbl: 'DATA', act: () => setScreenMode('posn') },
            { lbl: 'FCTN', act: () => setScreenMode('io') },
            { lbl: 'STATUS', act: () => setScreenMode('alarm') },
          ].map((k) => (
            <button
              key={k.lbl}
              type="button"
              onClick={k.act}
              style={{ backgroundColor: '#374151', color: '#f1f5f9', borderColor: '#111827' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[8.5px] font-extrabold tracking-tight shadow active:translate-y-px"
            >
              {k.lbl}
            </button>
          ))}
        </div>

        {/* COLUMN B (Center 5 cols): D-Pad + Execution (STEP/HOLD/FWD/BWD) + COORD/SPEED + NumPad */}
        <div className="col-span-5 flex flex-col gap-1.5">
          {/* Upper Row: 4-Way Navy Cursor D-Pad + RESET & STEP */}
          <div className="grid grid-cols-5 gap-1">
            {/* 3x2 Compact Cursor Pad */}
            <div
              style={{ backgroundColor: '#111827', borderColor: '#334155' }}
              className="hw-box col-span-3 grid grid-cols-3 gap-0.5 border p-1"
            >
              <div />
              <button
                type="button"
                onClick={() => moveCursor(-1)}
                aria-label="Cursor Up"
                style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}
                className="hw-softkey py-1 text-[9px] font-black"
              >
                ▲
              </button>
              <div />
              <button
                type="button"
                onClick={() => setScreenMode('split')}
                aria-label="Pane Left"
                style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}
                className="hw-softkey py-1 text-[9px] font-black"
              >
                ◄
              </button>
              <button
                type="button"
                onClick={() => moveCursor(1)}
                aria-label="Cursor Down"
                style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}
                className="hw-softkey py-1 text-[9px] font-black"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => setScreenMode('posn')}
                aria-label="Pane Right"
                style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}
                className="hw-softkey py-1 text-[9px] font-black"
              >
                ►
              </button>
            </div>

            {/* STEP + RESET */}
            <div className="col-span-2 flex flex-col gap-1">
              <button
                type="button"
                onClick={onToggleStep}
                style={{
                  backgroundColor: stepMode ? '#facc15' : '#ca8a04',
                  color: '#0f172a',
                  borderColor: '#713f12',
                }}
                className="hw-key border-b-2 py-1 font-mono text-[9px] font-black shadow"
              >
                {labels.step}
              </button>
              <button
                type="button"
                onClick={onResetAlarm}
                style={{
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  borderColor: '#7c2d12',
                }}
                className="hw-key border-b-2 py-1 font-mono text-[9px] font-black shadow"
              >
                {labels.reset}
              </button>
            </div>
          </div>

          {/* Execution Bar: HOLD (Red) | FWD (Green) | BWD (Grey) */}
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={onHoldStop}
              style={{ backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#7f1d1d' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[9.5px] font-black shadow"
            >
              {labels.hold}
            </button>
            <button
              type="button"
              onClick={onFwdRun}
              style={{ backgroundColor: '#16a34a', color: '#ffffff', borderColor: '#14532d' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[9.5px] font-black shadow"
            >
              {labels.fwd}
            </button>
            <button
              type="button"
              onClick={() => moveCursor(-1)}
              style={{ backgroundColor: '#475569', color: '#f8fafc', borderColor: '#1e293b' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[9px] font-black shadow"
            >
              BWD
            </button>
          </div>

          {/* COORD (Yellow) + Speed Override (-% / +%) + RECORD/TOUCHUP */}
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={onToggleCoord}
              style={{ backgroundColor: '#facc15', color: '#0f172a', borderColor: '#854d0e' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[8.5px] font-black shadow"
            >
              {labels.coord}
            </button>
            <button
              type="button"
              onClick={() => onChangeSpeed(-10)}
              aria-label="Decrease Speed"
              style={{ backgroundColor: '#334155', color: '#f8fafc', borderColor: '#0f172a' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[9.5px] font-black shadow"
            >
              -%
            </button>
            <button
              type="button"
              onClick={() => onChangeSpeed(10)}
              aria-label="Increase Speed"
              style={{ backgroundColor: '#334155', color: '#f8fafc', borderColor: '#0f172a' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[9.5px] font-black shadow"
            >
              +%
            </button>
            <button
              type="button"
              onClick={onTouchupPoint}
              title={labels.touchup}
              style={{ backgroundColor: '#0d9488', color: '#ffffff', borderColor: '#115e59' }}
              className="hw-key border-b-2 py-1.5 font-mono text-[8px] font-black shadow"
            >
              REC
            </button>
          </div>

          {/* Tactile Numeric Keypad (7-8-9 / 4-5-6 / 1-2-3 / 0-.-ENT) */}
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {['7', '8', '9', 'POSN', '4', '5', '6', 'I/O', '1', '2', '3', 'CLR'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'POSN') setScreenMode('posn');
                  else if (key === 'I/O') setScreenMode('io');
                  else if (key === 'CLR') setNumBuffer('');
                  else handleDigit(key);
                }}
                style={{
                  backgroundColor: key.length > 1 ? '#374151' : '#cbd5e1',
                  color: key.length > 1 ? '#e2e8f0' : '#0f172a',
                  borderColor: '#475569',
                }}
                className="hw-key border-b-2 py-1 font-mono text-[9px] font-black shadow"
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleDigit('0')}
              style={{ backgroundColor: '#cbd5e1', color: '#0f172a', borderColor: '#475569' }}
              className="hw-key border-b-2 py-1 font-mono text-[9px] font-black shadow"
            >
              0
            </button>
            <button
              type="button"
              onClick={onToggleGripper}
              title="Toggle DO[1] Gripper"
              style={{
                backgroundColor: gripperOn ? '#16a34a' : '#374151',
                color: '#ffffff',
                borderColor: '#1e293b',
              }}
              className="hw-key border-b-2 py-1 font-mono text-[8px] font-black shadow"
            >
              TOOL
            </button>
            <button
              type="button"
              onClick={handleEnterNumeric}
              style={{ backgroundColor: '#cbd5e1', color: '#0f172a', borderColor: '#475569' }}
              className="hw-key col-span-2 border-b-2 py-1 font-mono text-[9px] font-black shadow"
            >
              ENTER ↵
            </button>
          </div>
        </div>

        {/* COLUMN C (Right 4 cols): Right SHIFT + 2×6 Iconic Blue FANUC Axis Jog Keys */}
        <div data-tour="fanuc-jog-keys" className="col-span-4 flex flex-col gap-1">
          {/* Right Thumb SHIFT Key */}
          <button
            type="button"
            onClick={() => setShiftLatched((s) => !s)}
            style={{
              backgroundColor: shiftLatched ? '#0284c7' : '#0c4a6e',
              color: '#ffffff',
              borderColor: shiftLatched ? '#7dd3fc' : '#075985',
            }}
            className="hw-key flex items-center justify-between border-b-2 px-2 py-1.5 font-mono text-[9.5px] font-black shadow"
          >
            <span>SHIFT</span>
            <span className="text-[8px] text-amber-300">{coordMode}</span>
          </button>

          {/* 6 Rows × 2 Columns (-Axis / +Axis with J1..J6 Sub-Labels) */}
          <div className="flex flex-col gap-1">
            {JOG_KEY_PAIRS.map((pair) => {
              const negMain =
                coordMode === 'JOINT'
                  ? `-${pair.jointSub}`
                  : `${pair.negCart}${pair.rotational ? '↻' : ''}`;
              const posMain =
                coordMode === 'JOINT'
                  ? `+${pair.jointSub}`
                  : `${pair.posCart}${pair.rotational ? '↻' : ''}`;
              const subTag = coordMode === 'JOINT' ? pair.posCart.replace('+', '') : pair.jointSub;

              return (
                <div key={pair.jointSub} className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onPointerDown={() => startJog(pair.index, -1)}
                    onPointerUp={stopContinuousJog}
                    onPointerLeave={stopContinuousJog}
                    onPointerCancel={stopContinuousJog}
                    style={{
                      backgroundColor: '#0369a1',
                      color: '#ffffff',
                      borderColor: '#082f49',
                    }}
                    className="hw-key flex items-center justify-between border-b-2 px-1.5 py-1.5 font-mono shadow active:translate-y-px active:brightness-125"
                  >
                    <span className="text-[10px] font-black leading-none">{negMain}</span>
                    <span style={{ color: '#bae6fd' }} className="text-[7.5px] font-bold leading-none">
                      {subTag}
                    </span>
                  </button>

                  <button
                    type="button"
                    onPointerDown={() => startJog(pair.index, 1)}
                    onPointerUp={stopContinuousJog}
                    onPointerLeave={stopContinuousJog}
                    onPointerCancel={stopContinuousJog}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      borderColor: '#082f49',
                    }}
                    className="hw-key flex items-center justify-between border-b-2 px-1.5 py-1.5 font-mono shadow active:translate-y-px active:brightness-125"
                  >
                    <span className="text-[10px] font-black leading-none">{posMain}</span>
                    <span style={{ color: '#fef08a' }} className="text-[7.5px] font-bold leading-none">
                      {subTag}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Molded Cord Strain Relief Footer */}
      <div className="flex items-center justify-between px-2 pt-0.5 font-mono text-[8.5px] text-slate-400">
        <span>A05B-2255-C101#EMH</span>
        <span>{labels.holdHint}</span>
      </div>
    </div>
  );
}
