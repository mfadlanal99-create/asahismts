import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  RefreshCw,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MultimeterSvg } from './MultimeterSvg';
import {
  HIDDEN_FAULT_OPTIONS,
  SCENARIO_TABS,
  computeAnalogReadout,
  computeDigitalReadout,
  evaluateRawPair,
  getScenarioNodes,
  type AcOutletFault,
  type AnalogRange,
  type CircuitState,
  type DigitalDialMode,
  type HiddenFaultId,
  type MeterStyle,
  type OhmSubMode,
  type RedJackId,
  type WorkbenchScenario,
} from './multimeterPhysics';

const DIGITAL_DIALS: { id: DigitalDialMode; label: string }[] = [
  { id: 'OFF', label: 'OFF' },
  { id: 'V_AC', label: 'V~' },
  { id: 'V_DC', label: 'V⎓' },
  { id: 'mV_DC', label: 'mV' },
  { id: 'OHM_CONT_DIODE', label: 'Ω/🔊/⏵|' },
  { id: 'HZ', label: 'Hz' },
  { id: 'MA_A', label: 'mA/A' },
];

const ANALOG_RANGES: { id: AnalogRange; label: string }[] = [
  { id: 'OFF', label: 'OFF' },
  { id: 'AC_250V', label: 'AC 250V' },
  { id: 'AC_50V', label: 'AC 50V' },
  { id: 'DC_50V', label: 'DC 50V' },
  { id: 'DC_10V', label: 'DC 10V' },
  { id: 'DC_2_5V', label: 'DC 2.5V' },
  { id: 'OHM_X1', label: 'Ω ×1' },
  { id: 'OHM_X100', label: 'Ω ×100' },
  { id: 'OHM_X10K', label: 'Ω ×10k' },
  { id: 'DC_MA', label: 'DC mA' },
];

export function MultimeterSimulator() {
  const { pick } = useLanguage();

  // Workbench & Circuit state
  const [scenario, setScenario] = useState<WorkbenchScenario>('batteries');
  const [potRatio, setPotRatio] = useState<number>(0.5);
  const [ledSwitchOn, setLedSwitchOn] = useState<boolean>(true);
  const [acFault, setAcFault] = useState<AcOutletFault>('normal');
  const [hiddenFault, setHiddenFault] = useState<HiddenFaultId>('blown-fuse');
  const [faultGuess, setFaultGuess] = useState<HiddenFaultId | null>(null);
  const [faultChecked, setFaultChecked] = useState<boolean>(false);

  // Probes
  const [redNode, setRedNode] = useState<string | null>('BAT9_POS');
  const [blackNode, setBlackNode] = useState<string | null>('BAT9_NEG');
  const [activeProbe, setActiveProbe] = useState<'red' | 'black'>('red');

  // Meter state
  const [meterStyle, setMeterStyle] = useState<MeterStyle>('digital');
  const [digitalDial, setDigitalDial] = useState<DigitalDialMode>('V_DC');
  const [subMode, setSubMode] = useState<OhmSubMode>('OHM');
  const [holdActive, setHoldActive] = useState<boolean>(false);
  const [minMaxMode, setMinMaxMode] = useState<'off' | 'min' | 'max' | 'avg'>('off');
  const [manualRangeIdx, setManualRangeIdx] = useState<number>(0);
  const [backlightOn, setBacklightOn] = useState<boolean>(false);

  const [analogRange, setAnalogRange] = useState<AnalogRange>('DC_10V');
  const [zeroOhmAdj, setZeroOhmAdj] = useState<number>(0);

  const [redJack, setRedJack] = useState<RedJackId>('V_OHM_HZ');
  const [fuseBlown, setFuseBlown] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const circuit: CircuitState = useMemo(
    () => ({
      scenario,
      potRatio,
      ledSwitchOn,
      acFault,
      hiddenFault,
    }),
    [scenario, potRatio, ledSwitchOn, acFault, hiddenFault]
  );

  const rawPair = useMemo(
    () => evaluateRawPair(redNode, blackNode, circuit),
    [redNode, blackNode, circuit]
  );

  const liveDigital = useMemo(
    () =>
      computeDigitalReadout(
        digitalDial,
        subMode,
        redJack,
        fuseBlown,
        manualRangeIdx,
        rawPair
      ),
    [digitalDial, subMode, redJack, fuseBlown, manualRangeIdx, rawPair]
  );

  const [heldDigital, setHeldDigital] = useState(liveDigital);
  const digitalReadout = holdActive ? heldDigital : liveDigital;

  const analogReadout = useMemo(
    () => computeAnalogReadout(analogRange, zeroOhmAdj, redJack, fuseBlown, rawPair),
    [analogRange, zeroOhmAdj, redJack, fuseBlown, rawPair]
  );

  // Web Audio 2.4 kHz Continuity Beeper
  const audioCtxRef = useRef<AudioContext | null>(null);
  const shouldBeep =
    soundEnabled &&
    meterStyle === 'digital' &&
    digitalReadout.isBeep &&
    !holdActive;

  useEffect(() => {
    if (!shouldBeep) return;
    let osc: OscillatorNode | null = null;
    let gain: GainNode | null = null;
    try {
      const AudioCtx = window.AudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      osc = ctx.createOscillator();
      gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 2400;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
    } catch {
      // Ignore Web Audio errors in headless/restricted environments
    }
    return () => {
      try {
        osc?.stop();
        osc?.disconnect();
        gain?.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [shouldBeep]);

  useEffect(() => {
    return () => {
      try {
        void audioCtxRef.current?.close();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  const checkAndTriggerFuse = (
    nextRed: string | null,
    nextBlack: string | null,
    nextJack: RedJackId,
    nextDial: DigitalDialMode
  ) => {
    const nextRaw = evaluateRawPair(nextRed, nextBlack, circuit);
    const probingVInAmps = nextDial === 'MA_A' && nextRaw.isVoltageSource;
    const wrongJack =
      (nextJack === '10A' || nextJack === 'MA_UA') && nextRaw.isVoltageSource;
    if (probingVInAmps || wrongJack) {
      setFuseBlown(true);
    }
  };

  const handleSelectScenario = (next: WorkbenchScenario) => {
    setScenario(next);
    setHoldActive(false);
    setFaultChecked(false);
    setFaultGuess(null);
    const nodes = getScenarioNodes(next);
    setRedNode(nodes[0]?.id ?? null);
    setBlackNode(nodes[1]?.id ?? null);
    if (next === 'ac-outlet') {
      setDigitalDial('V_AC');
      setAnalogRange('AC_250V');
    } else if (next === 'components') {
      setDigitalDial('OHM_CONT_DIODE');
      setAnalogRange('OHM_X100');
    } else {
      setDigitalDial('V_DC');
      setAnalogRange('DC_50V');
    }
  };

  const handlePlaceProbe = (nodeId: string, which?: 'red' | 'black') => {
    const target = which ?? activeProbe;
    const nextRed = target === 'red' ? nodeId : redNode;
    const nextBlack = target === 'black' ? nodeId : blackNode;
    setRedNode(nextRed);
    setBlackNode(nextBlack);
    checkAndTriggerFuse(nextRed, nextBlack, redJack, digitalDial);
  };

  const handleLiftProbe = (which: 'red' | 'black') => {
    if (which === 'red') setRedNode(null);
    else setBlackNode(null);
  };

  const handleSwapLeads = () => {
    const nextRed = blackNode;
    const nextBlack = redNode;
    setRedNode(nextRed);
    setBlackNode(nextBlack);
    checkAndTriggerFuse(nextRed, nextBlack, redJack, digitalDial);
  };

  const handleLiftBoth = () => {
    setRedNode(null);
    setBlackNode(null);
  };

  const handleSelectRedJack = (jack: RedJackId) => {
    setRedJack(jack);
    checkAndTriggerFuse(redNode, blackNode, jack, digitalDial);
  };

  const handleCycleSubMode = () => {
    setDigitalDial('OHM_CONT_DIODE');
    setSubMode((prev) =>
      prev === 'OHM' ? 'CONT' : prev === 'CONT' ? 'DIODE' : 'OHM'
    );
  };

  const handleRandomFault = () => {
    const idx = Math.floor(Math.random() * HIDDEN_FAULT_OPTIONS.length);
    setHiddenFault(HIDDEN_FAULT_OPTIONS[idx].id);
    setFaultGuess(null);
    setFaultChecked(false);
  };

  const activeNote =
    meterStyle === 'digital' ? digitalReadout.note : analogReadout.note;
  const hasHazard =
    meterStyle === 'digital'
      ? digitalReadout.isLeadError
      : analogReadout.isLeadError || analogReadout.isReversePolarity;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* ==================== LEFT COLUMN: MULTIMETER + 6-SCENARIO ESD SVG ==================== */}
        <div className="lg:col-span-8 space-y-4">
          {/* Scenario Tabs */}
          <div className="glass-panel flex flex-wrap gap-1.5 rounded-[28px] p-2" data-tour="dmm-scenarios">
            {SCENARIO_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectScenario(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs transition cursor-pointer ${
                  scenario === tab.id
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick(tab.en, tab.idLabel, tab.ja)}
              </button>
            ))}
          </div>

          {/* Unified Interactive Multimeter + ESD Workbench SVG */}
          <MultimeterSvg
            meterStyle={meterStyle}
            digitalDial={digitalDial}
            onSelectDigitalDial={(m) => {
              setHoldActive(false);
              setDigitalDial(m);
              checkAndTriggerFuse(redNode, blackNode, redJack, m);
            }}
            subMode={subMode}
            onCycleSubMode={handleCycleSubMode}
            holdActive={holdActive}
            onToggleHold={() => {
              if (!holdActive) setHeldDigital(liveDigital);
              setHoldActive((prev) => !prev);
            }}
            minMaxMode={minMaxMode}
            onCycleMinMax={() =>
              setMinMaxMode((prev) =>
                prev === 'off'
                  ? 'min'
                  : prev === 'min'
                    ? 'max'
                    : prev === 'max'
                      ? 'avg'
                      : 'off'
              )
            }
            onCycleRange={() => setManualRangeIdx((prev) => (prev + 1) % 4)}
            backlightOn={backlightOn}
            onToggleBacklight={() => setBacklightOn((prev) => !prev)}
            analogRange={analogRange}
            redJack={redJack}
            onSelectRedJack={handleSelectRedJack}
            digitalReadout={digitalReadout}
            analogReadout={analogReadout}
            circuit={circuit}
            redNode={redNode}
            blackNode={blackNode}
            activeProbe={activeProbe}
            onPlaceProbe={handlePlaceProbe}
            onLiftProbe={handleLiftProbe}
            onToggleLedSwitch={() => setLedSwitchOn((prev) => !prev)}
          />

          {/* Probe Overlay Controls */}
          <div className="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-[28px] p-3.5" data-tour="dmm-probes">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveProbe('red')}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeProbe === 'red'
                    ? 'border-rose-500 bg-rose-600 text-white'
                    : 'glass-pill'
                }`}
              >
                {pick('Move Red (+)', 'Pindah Merah (+)', '赤プローブ移動')}
              </button>
              <button
                type="button"
                onClick={() => setActiveProbe('black')}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeProbe === 'black'
                    ? 'border-slate-600 bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950'
                    : 'glass-pill'
                }`}
              >
                {pick('Move Black (COM)', 'Pindah Hitam (COM)', '黒プローブ移動')}
              </button>
              <button
                type="button"
                onClick={handleSwapLeads}
                className="glass-pill flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {pick('Swap Leads', 'Tukar Probe', 'リード入替')}
              </button>
              <button
                type="button"
                onClick={handleLiftBoth}
                className="glass-pill rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer"
              >
                {pick('Lift Both', 'Angkat Probe', 'プローブ解除')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${
                soundEnabled
                  ? 'border border-[var(--md-primary)]/40 bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                  : 'glass-pill text-[var(--md-on-surface-variant)]'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              {soundEnabled
                ? pick('Beeper On', 'Buzzer Aktif', 'ブザーON')
                : pick('Muted', 'Nonaktif', 'ミュート')}
            </button>
          </div>

          {/* Diagnostic Readout Note */}
          <div
            data-tour="dmm-diagnostic-note"
            className={`glass-panel rounded-[28px] p-4 ${
              hasHazard
                ? 'border border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/30'
                : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {hasHazard ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              ) : (
                <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[var(--md-primary)]" />
              )}
              <p className="text-sm leading-relaxed text-[var(--md-on-surface)]">
                {pick(activeNote.en, activeNote.id, activeNote.ja)}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: SCENARIO & METER CONTROLS ==================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* Digital vs Analog Quick Mode */}
          <div className="grid grid-cols-2 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1" data-tour="dmm-style-toggle">
            <button
              type="button"
              onClick={() => setMeterStyle('digital')}
              className={`rounded-full py-2 text-xs transition cursor-pointer ${
                meterStyle === 'digital'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              Digital DMM-87V
            </button>
            <button
              type="button"
              onClick={() => setMeterStyle('analog')}
              className={`rounded-full py-2 text-xs transition cursor-pointer ${
                meterStyle === 'analog'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              Analog VOM-20K
            </button>
          </div>

          {/* Fuse Blown Alert */}
          {fuseBlown && (
            <div className="glass-panel flex items-center justify-between gap-2 rounded-[24px] border border-rose-500/60 bg-rose-50/80 p-3.5 dark:bg-rose-950/40">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-300">
                {pick('Internal Current Fuse Blown!', 'Sekring Arus Internal Putus!', '内蔵電流ヒューズ溶断！')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFuseBlown(false);
                  setRedJack('V_OHM_HZ');
                }}
                className="rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer hover:bg-rose-700"
              >
                {pick('Replace Fuse', 'Ganti Sekring', 'ヒューズ交換')}
              </button>
            </div>
          )}

          {/* Scenario-Specific Interactive Controls */}
          {scenario === 'dividers' && (
            <div className="glass-panel space-y-2.5 rounded-[28px] p-4 sm:p-5">
              <div className="flex justify-between text-xs font-bold text-[var(--md-on-surface)]">
                <span>
                  {pick('Potentiometer Ratio', 'Rasio Potensiometer', 'ポテンショメータ比')}
                </span>
                <span className="font-mono text-[var(--md-primary)]">
                  {Math.round(potRatio * 100)}% ({(12 * potRatio).toFixed(2)} V)
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.95}
                step={0.05}
                value={potRatio}
                onChange={(e) => setPotRatio(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {scenario === 'led' && (
            <div className="glass-panel flex items-center justify-between rounded-[28px] p-4 sm:p-5">
              <span className="text-xs font-bold text-[var(--md-on-surface)]">
                {pick('Circuit Toggle Switch (SW1)', 'Sakelar Rangkaian (SW1)', '回路スイッチ (SW1)')}
              </span>
              <button
                type="button"
                onClick={() => setLedSwitchOn((prev) => !prev)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer ${
                  ledSwitchOn
                    ? 'bg-emerald-600 text-white'
                    : 'glass-pill'
                }`}
              >
                {ledSwitchOn ? 'SW1: ON' : 'SW1: OFF'}
              </button>
            </div>
          )}

          {scenario === 'ac-outlet' && (
            <div className="glass-panel space-y-2.5 rounded-[28px] p-4 sm:p-5">
              <div className="text-xs font-bold text-[var(--md-on-surface-variant)]">
                {pick('AC Outlet Wiring Condition', 'Kondisi Pengkabelan Stopkontak', 'ACコンセント配線状態')}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(
                  [
                    { id: 'normal', en: 'Normal (230V L–N)', idL: 'Normal (230V L–N)', ja: '正常 (230V L–N)' },
                    { id: 'open-neutral', en: 'Open Neutral', idL: 'Netral Putus', ja: '中性線断線' },
                    { id: 'reverse-polarity', en: 'Reverse Polarity', idL: 'Polaritas Terbalik', ja: '極性逆転' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAcFault(item.id)}
                    className={`rounded-[20px] border px-3.5 py-2.5 text-left text-xs font-bold transition cursor-pointer ${
                      acFault === item.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {pick(item.en, item.idL, item.ja)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {scenario === 'fault' && (
            <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-primary)]">
                  {pick('Guided Fault Diagnosis', 'Tantangan Cari Gangguan', '故障診断チャレンジ')}
                </span>
                <button
                  type="button"
                  onClick={handleRandomFault}
                  className="m3-btn-tonal flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  {pick('New Fault', 'Gangguan Baru', '新しい故障')}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {HIDDEN_FAULT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFaultGuess(opt.id);
                      setFaultChecked(false);
                    }}
                    className={`rounded-[20px] border px-3.5 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                      faultGuess === opt.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {pick(opt.en, opt.idLabel, opt.ja)}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={!faultGuess}
                  onClick={() => setFaultChecked(true)}
                  className="m3-btn-filled w-full py-2.5 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  {pick('Verify Diagnosis', 'Periksa Diagnosis', '診断を確認')}
                </button>
                {faultChecked && faultGuess && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-bold ${
                      faultGuess === hiddenFault
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500'
                    }`}
                  >
                    {faultGuess === hiddenFault ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {pick('Correct! Fault isolated.', 'Benar! Gangguan ditemukan.', '正解！故障箇所を特定しました。')}
                      </>
                    ) : (
                      pick('Not quite — probe TP1–TP4 again!', 'Belum tepat — ukur ulang TP1–TP4!', '不正解 — TP1〜TP4を再測定してください！')
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meter Dial / Range Controls */}
          {meterStyle === 'digital' ? (
            <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5" data-tour="dmm-dial">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Digital Rotary Dial', 'Selektor Digital', 'デジタルダイヤル')}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DIGITAL_DIALS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setHoldActive(false);
                      setDigitalDial(d.id);
                      checkAndTriggerFuse(redNode, blackNode, redJack, d.id);
                    }}
                    className={`rounded-full border px-1.5 py-2 text-xs font-bold transition cursor-pointer ${
                      digitalDial === d.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5" data-tour="dmm-dial">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Analog Range & Zero Ω Adj', 'Rentang Analog & Zero Ω', 'アナログレンジ＆0Ω調整')}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {ANALOG_RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAnalogRange(r.id)}
                    className={`rounded-full border px-2 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                      analogRange === r.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold text-[var(--md-on-surface)]">
                  <span>Zero Ω Adj</span>
                  <span className="font-mono text-[var(--md-primary)]">{zeroOhmAdj.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={0.5}
                  value={zeroOhmAdj}
                  onChange={(e) => setZeroOhmAdj(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Red Lead Input Jack Selector */}
          <div className="glass-panel space-y-2.5 rounded-[28px] p-4 sm:p-5" data-tour="dmm-red-jack">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick('Red Test Lead Jack', 'Terminal Kabel Merah', '赤リード接続端子')}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'V_OHM_HZ', label: 'V-Ω-Hz' },
                  { id: 'MA_UA', label: 'mA / µA' },
                  { id: '10A', label: '10A' },
                ] as const
              ).map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => handleSelectRedJack(j.id)}
                  className={`rounded-full border py-2 text-xs font-bold transition cursor-pointer ${
                    redJack === j.id
                      ? 'border-rose-500 bg-rose-600 text-white'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
