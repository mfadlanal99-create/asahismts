/* oxlint-disable react/only-export-components */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  Home,
  Package,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FanucIPendant } from './FanucIPendant';
import { FanucRobotCanvas, type TcpTrailPoint } from './FanucRobotCanvas';
import {
  clampJoint,
  computeForwardKinematics,
  DEFAULT_HOME_JOINTS,
  DEFAULT_TAUGHT_POINTS,
  DEFAULT_TP_PROGRAM,
  FANUC_ALARMS,
  FANUC_M900_SPECS,
  interpolateJoints,
  stepCartesianWorld,
  type CartesianAxis,
  type CoordMode,
  type FanucAlarmCode,
  type JointAngles,
} from './fanucM900Physics';

export { fanucM900Meta } from './fanucM900Meta';

const JOINT_KEYS: Array<keyof JointAngles> = ['j1', 'j2', 'j3', 'j4', 'j5', 'j6'];
const WORLD_KEYS: CartesianAxis[] = ['x', 'y', 'z', 'w', 'p', 'r'];

export function FanucM900Simulator() {
  const { pick } = useLanguage();

  const [joints, setJoints] = useState<JointAngles>(DEFAULT_HOME_JOINTS);
  const [taughtPoints, setTaughtPoints] = useState<Record<number, JointAngles>>(
    DEFAULT_TAUGHT_POINTS
  );
  const [coordMode, setCoordMode] = useState<CoordMode>('JOINT');
  const [speedPct, setSpeedPct] = useState<number>(60);
  const [stepMode, setStepMode] = useState<boolean>(false);
  const [tpEnabled, setTpEnabled] = useState<boolean>(true);
  const [deadmanEnabled, setDeadmanEnabled] = useState<boolean>(true);
  const [eStopActive, setEStopActive] = useState<boolean>(false);
  const [injectedFault, setInjectedFault] = useState<FanucAlarmCode>('none');

  const [payloadKg, setPayloadKg] = useState<number>(420);
  const [gripperOn, setGripperOn] = useState<boolean>(false);
  const [workpieceState, setWorkpieceState] = useState<'infeed' | 'carried' | 'pallet'>(
    'infeed'
  );
  const [activeLine, setActiveLine] = useState<number>(1);
  const [isRunningProgram, setIsRunningProgram] = useState<boolean>(false);
  const [tcpTrail, setTcpTrail] = useState<TcpTrailPoint[]>([]);

  // Motion interpolation refs for TP program execution
  const motionRef = useRef<{
    active: boolean;
    from: JointAngles;
    to: JointAngles;
    progress: number;
    targetLine: number;
  } | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const kinematics = useMemo(
    () => computeForwardKinematics(joints, payloadKg),
    [joints, payloadKg]
  );

  // Determine effective controller alarm
  const effectiveAlarm: FanucAlarmCode = useMemo(() => {
    if (eStopActive) return 'SRVO-001';
    if (injectedFault !== 'none') return injectedFault;
    if (kinematics.payloadOverload || kinematics.j2LoadPct > 115) return 'SRVO-050';
    if (kinematics.outOfReach) return 'MOTN-017';
    return 'none';
  }, [eStopActive, injectedFault, kinematics.payloadOverload, kinematics.j2LoadPct, kinematics.outOfReach]);

  const canMove = effectiveAlarm === 'none' && (!tpEnabled || deadmanEnabled);
  const effectiveRunning = isRunningProgram && canMove;

  const appendTrailForJoints = useCallback(
    (nextJoints: JointAngles) => {
      const nextFk = computeForwardKinematics(nextJoints, payloadKg);
      setTcpTrail((prev) => {
        const last = prev[prev.length - 1];
        if (
          last &&
          Math.hypot(
            (last.x ?? last.r) - nextFk.x,
            (last.y ?? 0) - nextFk.y,
            last.z - nextFk.z
          ) < 18
        ) {
          return prev;
        }
        const next = [
          ...prev,
          { r: nextFk.tcpPos.r, z: nextFk.tcpPos.z, x: nextFk.x, y: nextFk.y },
        ];
        return next.length > 64 ? next.slice(next.length - 64) : next;
      });
    },
    [payloadKg]
  );

  const startLineExecution = useCallback(
    (lineNum: number, currentJoints: JointAngles) => {
      let cursor = lineNum;
      let line = DEFAULT_TP_PROGRAM.find((l) => l.lineNumber === cursor);
      while (line && line.action.type === 'do') {
        const nextGrip = line.action.value;
        setGripperOn(nextGrip);
        setWorkpieceState(nextGrip ? 'carried' : 'pallet');
        cursor = cursor < DEFAULT_TP_PROGRAM.length ? cursor + 1 : 1;
        setActiveLine(cursor);
        if (stepMode) {
          setIsRunningProgram(false);
          return;
        }
        line = DEFAULT_TP_PROGRAM.find((l) => l.lineNumber === cursor);
      }

      if (!line || line.action.type !== 'move') {
        setIsRunningProgram(false);
        return;
      }

      const targetPt = taughtPoints[line.action.pointIndex] ?? DEFAULT_HOME_JOINTS;
      motionRef.current = {
        active: true,
        from: currentJoints,
        to: targetPt,
        progress: 0,
        targetLine: cursor,
      };
    },
    [stepMode, taughtPoints]
  );

  // Animation loop for TP program execution
  useEffect(() => {
    if (!effectiveRunning) {
      lastFrameRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = now;
      }
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      const motion = motionRef.current;
      if (motion && motion.active) {
        const speedScale = Math.max(0.15, speedPct / 100);
        const nextProgress = Math.min(1, motion.progress + dt * 0.95 * speedScale);
        motion.progress = nextProgress;
        const nextJ = interpolateJoints(motion.from, motion.to, nextProgress);
        setJoints(nextJ);
        appendTrailForJoints(nextJ);

        if (nextProgress >= 1) {
          motion.active = false;
          // At P[4] (line 5), release workpiece onto pallet
          if (motion.targetLine === 5) {
            setGripperOn(false);
            setWorkpieceState('pallet');
          }
          const nextLine =
            motion.targetLine < DEFAULT_TP_PROGRAM.length ? motion.targetLine + 1 : 1;
          setActiveLine(nextLine);

          if (stepMode || motion.targetLine === DEFAULT_TP_PROGRAM.length) {
            setIsRunningProgram(false);
            motionRef.current = null;
            return;
          } else {
            // Prepare next line (reset workpiece to infeed when looping to line 1)
            if (nextLine === 1) {
              setWorkpieceState('infeed');
            }
            startLineExecution(nextLine, nextJ);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [effectiveRunning, speedPct, stepMode, startLineExecution, appendTrailForJoints]);

  // Jog handler (called by iPendant press-and-hold keys)
  const handleJogStep = useCallback(
    (index: number, dir: 1 | -1) => {
      if (!canMove || !tpEnabled) return;
      setIsRunningProgram(false);
      motionRef.current = null;

      const rate = Math.max(0.2, speedPct / 100);

      setJoints((prev) => {
        let nextJoints = prev;
        if (coordMode === 'JOINT') {
          const key = JOINT_KEYS[index];
          if (!key) return prev;
          const stepDeg = 2.5 * rate * dir;
          const res = clampJoint(key, prev[key] + stepDeg);
          if (res.clamped) {
            setInjectedFault('MOTN-017');
          }
          nextJoints = { ...prev, [key]: Number(res.value.toFixed(2)) };
        } else {
          const axis = WORLD_KEYS[index];
          if (!axis) return prev;
          const stepAmt = (axis === 'x' || axis === 'y' || axis === 'z' ? 28 : 2.5) * rate * dir;
          const ik = stepCartesianWorld(prev, axis, stepAmt, payloadKg);
          if (ik.limitHit) {
            setInjectedFault('MOTN-017');
          }
          nextJoints = ik.nextJoints;
        }
        appendTrailForJoints(nextJoints);
        return nextJoints;
      });
    },
    [canMove, tpEnabled, speedPct, coordMode, payloadKg, appendTrailForJoints]
  );

  const handleToggleEStop = () => {
    setEStopActive((prev) => {
      const next = !prev;
      if (next) {
        setIsRunningProgram(false);
        motionRef.current = null;
      }
      return next;
    });
  };

  const handleResetAlarm = () => {
    if (eStopActive) return; // Must release E-Stop first
    if (payloadKg > FANUC_M900_SPECS.maxPayloadKg) {
      setPayloadKg(FANUC_M900_SPECS.maxPayloadKg);
    }
    setInjectedFault('none');
  };

  const handleTouchupPoint = () => {
    if (!tpEnabled) return;
    const line = DEFAULT_TP_PROGRAM.find((l) => l.lineNumber === activeLine);
    if (line && line.action.type === 'move') {
      const ptIdx = line.action.pointIndex;
      setTaughtPoints((prev) => ({
        ...prev,
        [ptIdx]: { ...joints },
      }));
    }
  };

  const handleFwdRun = () => {
    if (!canMove || !tpEnabled) return;
    if (activeLine === 1 && workpieceState === 'pallet') {
      setWorkpieceState('infeed');
      setGripperOn(false);
    }
    setIsRunningProgram(true);
    startLineExecution(activeLine, joints);
  };

  const handleHoldStop = () => {
    setIsRunningProgram(false);
    motionRef.current = null;
  };

  const handleHomeReset = () => {
    setIsRunningProgram(false);
    motionRef.current = null;
    setJoints(DEFAULT_HOME_JOINTS);
    setTaughtPoints(DEFAULT_TAUGHT_POINTS);
    setGripperOn(false);
    setWorkpieceState('infeed');
    setActiveLine(1);
    setTcpTrail([]);
    setInjectedFault('none');
    setEStopActive(false);
  };

  const alarmInfo = FANUC_ALARMS[effectiveAlarm];

  return (
    <div className="space-y-4">
      {/* Main 2-Column Workspace: Robot Stage + R-30iB iPendant */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Robot Cell Stage */}
        <div data-tour="fanuc-stage" className="lg:col-span-7">
          <FanucRobotCanvas
            joints={joints}
            kinematics={kinematics}
            payloadKg={payloadKg}
            gripperOn={gripperOn}
            workpieceState={workpieceState}
            alarm={effectiveAlarm}
            tpEnabled={tpEnabled}
            deadmanEnabled={deadmanEnabled}
            eStopActive={eStopActive}
            tcpTrail={tcpTrail}
            labels={{
              reachEnvelope: pick('Max Reach', 'Jangkauan Maks', '最大リーチ'),
              payload: pick('Payload', 'Muatan', '可搬質量'),
              j2Load: pick('J2 Load', 'Beban J2', 'J2負荷'),
              singularity: pick('WRIST SINGULARITY', 'SINGULARITAS PERGELANGAN', '手首特異点'),
              turretJ1: pick('J1 Turret', 'Turret J1', 'J1旋回'),
              infeed: pick('Infeed', 'Masuk', '供給'),
              pallet: pick('Pallet', 'Palet', 'パレット'),
              servoOn: pick('SERVOS READY', 'SERVO SIAP', 'サーボ準備完了'),
              servoOff: pick('SERVOS OFF / HOLD', 'SERVO MATI / TAHAN', 'サーボ停止'),
            }}
          />
        </div>

        {/* Right: Authentic R-30iB iPendant */}
        <div className="lg:col-span-5">
          <FanucIPendant
            coordMode={coordMode}
            speedPct={speedPct}
            stepMode={stepMode}
            tpEnabled={tpEnabled}
            deadmanEnabled={deadmanEnabled}
            eStopActive={eStopActive}
            alarm={effectiveAlarm}
            joints={joints}
            kinematics={kinematics}
            program={DEFAULT_TP_PROGRAM}
            activeLine={activeLine}
            isRunningProgram={isRunningProgram}
            gripperOn={gripperOn}
            onToggleEStop={handleToggleEStop}
            onToggleTp={() => setTpEnabled((v) => !v)}
            onToggleDeadman={() => setDeadmanEnabled((v) => !v)}
            onResetAlarm={handleResetAlarm}
            onToggleCoord={() =>
              setCoordMode((m) => (m === 'JOINT' ? 'WORLD' : 'JOINT'))
            }
            onToggleStep={() => setStepMode((s) => !s)}
            onChangeSpeed={(d) =>
              setSpeedPct((s) => Math.max(10, Math.min(100, s + d)))
            }
            onTouchupPoint={handleTouchupPoint}
            onFwdRun={handleFwdRun}
            onHoldStop={handleHoldStop}
            onSelectLine={(lineNum) => setActiveLine(lineNum)}
            onJogStep={handleJogStep}
            onToggleGripper={() => {
              setGripperOn((prev) => {
                const next = !prev;
                if (next && kinematics.z < 920) {
                  setWorkpieceState('carried');
                } else if (!next && workpieceState === 'carried') {
                  setWorkpieceState(joints.j1 > 10 ? 'pallet' : 'infeed');
                }
                return next;
              });
            }}
            labels={{
              pendantTitle: pick('iPendant R-30iB', 'iPendant R-30iB', 'iPendant R-30iB'),
              eStop: 'E-STOP',
              tpSwitch: 'TP',
              deadman: pick('DEADMAN', 'DEADMAN', 'デッドマン'),
              reset: 'RESET',
              coord: 'COORD',
              step: 'STEP',
              cont: 'CONT',
              touchup: pick('RECORD', 'REKAM', '位置教示'),
              fwd: 'FWD',
              hold: 'HOLD',
              programHeader: pick('TP PROGRAM: PICK_PLACE', 'PROGRAM TP: PICK_PLACE', 'TPプログラム: PICK_PLACE'),
              holdHint: pick('Press & hold to jog', 'Tekan & tahan untuk jog', '長押しでジョグ'),
            }}
          />
        </div>
      </div>

      {/* Bottom Controls & Telemetry Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Payload, Fault Injection & Cell Controls */}
        <div
          data-tour="fanuc-payload-faults"
          className="glass-panel rounded-2xl p-4 lg:col-span-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-[var(--md-on-surface)]">
                {pick(
                  'Payload & Fault Diagnostics',
                  'Muatan & Diagnosis Gangguan',
                  '可搬質量・故障診断'
                )}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleHomeReset}
              className="glass-pill inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[var(--md-on-surface)] hover:opacity-85"
            >
              <Home className="h-3.5 w-3.5" />
              {pick('Reset Cell', 'Atur Ulang Sel', 'セル初期化')}
            </button>
          </div>

          {/* Payload Slider */}
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-[var(--md-on-surface-variant)]">
                <Package className="h-3.5 w-3.5" />
                {pick('Wrist Payload (Max 700 kg)', 'Muatan Pergelangan (Maks 700 kg)', '手首可搬質量 (最大 700 kg)')}
              </span>
              <span
                className={`font-mono font-bold ${
                  payloadKg > 700 ? 'text-rose-500' : 'text-amber-500'
                }`}
              >
                {payloadKg} kg
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={850}
              step={10}
              value={payloadKg}
              onChange={(e) => setPayloadKg(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Fault Injection Buttons */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[var(--md-on-surface-variant)]">
              {pick(
                'Inject FANUC Controller / Servo Alarm',
                'Simulasikan Alarm Pengendali / Servo FANUC',
                'FANUC 制御・サーボアラーム模擬'
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { code: 'none', label: pick('Normal', 'Normal', '正常') },
                  { code: 'SRVO-050', label: 'SRVO-050 Collision' },
                  { code: 'SRVO-062', label: 'SRVO-062 BZAL' },
                  { code: 'MOTN-017', label: 'MOTN-017 Limit' },
                ] as const
              ).map((item) => {
                const active = injectedFault === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setInjectedFault(item.code)}
                    className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition ${
                      active
                        ? item.code === 'none'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                        : 'glass-pill text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alarm Explanation Box */}
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border p-2.5 text-xs ${
              effectiveAlarm === 'none'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-200'
            }`}
          >
            {effectiveAlarm === 'none' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              <div className="font-mono font-bold">{alarmInfo.label}</div>
              <div className="mt-0.5 opacity-90">{alarmInfo.description}</div>
            </div>
          </div>
        </div>

        {/* Live Telemetry Cards */}
        <div
          data-tour="fanuc-telemetry"
          className="glass-panel rounded-2xl p-4 lg:col-span-7"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-500" />
              <h3 className="text-sm font-semibold text-[var(--md-on-surface)]">
                {pick(
                  'Live Servo, Kinematics & Reach Telemetry',
                  'Telemetri Servo, Kinematika & Jangkauan Langsung',
                  'サーボ・運動学・リーチリアルタイム計測'
                )}
              </h3>
            </div>
            <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
              M-900iB/700 · {FANUC_M900_SPECS.maxReachMm} mm
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] p-2.5">
              <div className="flex items-center gap-1 text-[11px] text-[var(--md-on-surface-variant)]">
                <Cpu className="h-3.5 w-3.5 text-sky-500" />
                {pick('TCP (X, Y, Z)', 'TCP (X, Y, Z)', 'TCP (X, Y, Z)')}
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-[var(--md-on-surface)]">
                {kinematics.x.toFixed(0)}, {kinematics.y.toFixed(0)}, {kinematics.z.toFixed(0)} mm
              </div>
            </div>

            <div className="rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] p-2.5">
              <div className="flex items-center gap-1 text-[11px] text-[var(--md-on-surface-variant)]">
                <Gauge className="h-3.5 w-3.5 text-amber-500" />
                {pick('Reach Envelope', 'Batas Jangkauan', 'リーチ使用率')}
              </div>
              <div
                className={`mt-1 font-mono text-xs font-bold ${
                  kinematics.outOfReach
                    ? 'text-rose-500'
                    : 'text-[var(--md-on-surface)]'
                }`}
              >
                {kinematics.radialMm.toFixed(0)} mm ({kinematics.reachPct.toFixed(0)}%)
              </div>
            </div>

            <div className="rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] p-2.5">
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('J2 / J3 Servo Load', 'Beban Servo J2 / J3', 'J2 / J3 サーボ負荷')}
              </div>
              <div
                className={`mt-1 font-mono text-xs font-bold ${
                  kinematics.j2LoadPct > 95
                    ? 'text-rose-500'
                    : 'text-[var(--md-on-surface)]'
                }`}
              >
                {kinematics.j2LoadPct.toFixed(0)}% / {kinematics.j3LoadPct.toFixed(0)}%
              </div>
            </div>

            <div className="rounded-xl border border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] p-2.5">
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('J2 Counterbalance', 'Penyeimbang J2', 'J2 バランサ推力')}
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-[var(--md-on-surface)]">
                {kinematics.counterbalanceForceN} N ({kinematics.j2TorqueNm} N·m)
              </div>
            </div>
          </div>

          {kinematics.singularityWarning && (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {pick(
                  'Wrist Singularity Warning: |J5| < 5° aligns J4 and J6 axes. Tilt J5 away from 0° before linear (L) moves.',
                  'Peringatan Singularitas Pergelangan: |J5| < 5° membuat sumbu J4 dan J6 segaris. Miringkan J5 menjauhi 0° sebelum gerak linear (L).',
                  '手首特異点警告: |J5| < 5° のため J4 軸と J6 軸が同軸になります。直線補間前に J5 を 0° から傾けてください。'
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
