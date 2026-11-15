import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  Keyboard,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Shuffle,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { degToRad } from '../../physics';
import {
  PRESET_PARTS,
  getInstrumentConfig,
  getMicrometerBreakdown,
  getVernierBreakdown,
  snapToLeastCount,
} from './caliperMath';
import type { InstrumentType, PresetPart } from './caliperTypes';
import { MicrometerSvg } from './MicrometerSvg';
import { VernierSvg } from './VernierSvg';
import {
  createQcBatch,
  isWithinTolerance,
  toPresetPart,
  type QcBatchPart,
  type QcSubmission,
} from './qcBatch';

type LabMode = 'measure' | 'test' | 'qc';

const ZERO_ERROR_OPTIONS = [
  { label: '0.00 mm (None)', value: 0 },
  { label: '+0.04 mm (Pos)', value: 0.04 },
  { label: '-0.04 mm (Neg)', value: -0.04 },
  { label: '+0.02 mm (Pos)', value: 0.02 },
  { label: '-0.02 mm (Neg)', value: -0.02 },
  { label: '+0.05 mm (Pos)', value: 0.05 },
  { label: '-0.05 mm (Neg)', value: -0.05 },
];

export function CaliperSimulator() {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const [labMode, setLabMode] = useState<LabMode>('measure');
  const [instrument, setInstrument] = useState<InstrumentType>('vernier-002');
  const [observedMm, setObservedMm] = useState<number>(24.36);
  const [zeroErrorEnabled, setZeroErrorEnabled] = useState<boolean>(false);
  const [zeroErrorMm, setZeroErrorMm] = useState<number>(0.04);
  const [activePartId, setActivePartId] = useState<string>('shaft-od');
  const [showLoupe, setShowLoupe] = useState<boolean>(true);
  const [loupeZoom, setLoupeZoom] = useState<number>(3);
  const [parallaxAngleDeg, setParallaxAngleDeg] = useState<number>(0);

  // Test Yourself state
  const [guessInput, setGuessInput] = useState<string>('');
  const [guessResult, setGuessResult] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  // Incoming QC Inspection Mode state
  const [qcBatchVariant, setQcBatchVariant] = useState<number>(0);
  const [qcBatch, setQcBatch] = useState<QcBatchPart[]>(() => createQcBatch(0));
  const [activeQcIndex, setActiveQcIndex] = useState<number>(0);
  const [qcReadingInput, setQcReadingInput] = useState<string>('');
  const [qcVerdictChoice, setQcVerdictChoice] = useState<'PASS' | 'REJECT'>('PASS');
  const [qcSubmissions, setQcSubmissions] = useState<Record<string, QcSubmission>>({});

  const config = getInstrumentConfig(instrument);
  const effectiveZeroError = zeroErrorEnabled ? zeroErrorMm : 0;

  const activeQcPart = qcBatch[activeQcIndex] ?? qcBatch[0];
  const hideReadout =
    labMode === 'test' ||
    (labMode === 'qc' && !qcSubmissions[activeQcPart.id]);

  const activePart: PresetPart | null = useMemo(() => {
    if (labMode === 'qc') {
      return toPresetPart(activeQcPart);
    }
    return PRESET_PARTS.find((p) => p.id === activePartId) ?? null;
  }, [labMode, activeQcPart, activePartId]);

  const trueReadingMm = useMemo(
    () => Number((observedMm - effectiveZeroError).toFixed(2)),
    [observedMm, effectiveZeroError]
  );

  const vernierBreakdown = useMemo(
    () =>
      instrument === 'micrometer-001'
        ? null
        : getVernierBreakdown(observedMm, config.leastCount as 0.02 | 0.05),
    [instrument, observedMm, config.leastCount]
  );

  const microBreakdown = useMemo(
    () =>
      instrument === 'micrometer-001'
        ? getMicrometerBreakdown(observedMm)
        : null,
    [instrument, observedMm]
  );

  function loadQcPart(part: QcBatchPart, index: number) {
    setActiveQcIndex(index);
    const targetCfg = getInstrumentConfig(part.recommendedInstrument);
    setInstrument(part.recommendedInstrument);
    setObservedMm(
      snapToLeastCount(
        part.actualMm + effectiveZeroError,
        targetCfg.leastCount,
        targetCfg.maxMm
      )
    );
    setQcReadingInput('');
    setQcVerdictChoice('PASS');
  }

  function handleSwitchLabMode(nextMode: LabMode) {
    setLabMode(nextMode);
    setGuessResult(null);
    if (nextMode === 'qc') {
      loadQcPart(qcBatch[activeQcIndex] ?? qcBatch[0], activeQcIndex);
    }
  }

  function handleSelectInstrument(next: InstrumentType) {
    const nextCfg = getInstrumentConfig(next);
    setInstrument(next);
    setObservedMm((prev) => snapToLeastCount(prev, nextCfg.leastCount, nextCfg.maxMm));
    setGuessResult(null);
  }

  function handleSelectPart(part: PresetPart | null) {
    if (!part) {
      setActivePartId('free');
      return;
    }
    setActivePartId(part.id);
    const targetInst = part.recommendedInstrument;
    const targetCfg = getInstrumentConfig(targetInst);
    setInstrument(targetInst);
    const nextObserved = snapToLeastCount(
      part.targetMm + effectiveZeroError,
      targetCfg.leastCount,
      targetCfg.maxMm
    );
    setObservedMm(nextObserved);
    setGuessResult(null);
    setGuessInput('');
  }

  function handleStep(deltaSteps: number) {
    setObservedMm((prev) =>
      snapToLeastCount(
        prev + deltaSteps * config.leastCount,
        config.leastCount,
        config.maxMm
      )
    );
    setGuessResult(null);
  }

  function handleStageKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleStep(e.shiftKey ? -10 : -1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleStep(e.shiftKey ? 10 : 1);
    }
  }

  function handleRandomChallenge() {
    setActivePartId('free');
    const maxVal = instrument === 'micrometer-001' ? 22 : 65;
    const minVal = 3;
    const raw = minVal + Math.random() * (maxVal - minVal);
    const snapped = snapToLeastCount(raw, config.leastCount, config.maxMm);
    setObservedMm(snapped);
    setGuessInput('');
    setGuessResult(null);
  }

  function handleCheckGuess() {
    const parsed = Number.parseFloat(guessInput);
    if (Number.isNaN(parsed)) {
      setGuessResult({
        correct: false,
        message: 'Enter a valid numeric measurement in mm.',
      });
      return;
    }
    const diff = Math.abs(parsed - trueReadingMm);
    if (diff <= config.leastCount / 2 + 1e-6) {
      setGuessResult({
        correct: true,
        message: `Exact! True reading is ${trueReadingMm.toFixed(2)} mm${
          effectiveZeroError !== 0
            ? ` (Observed ${observedMm.toFixed(2)} - Zero Error ${effectiveZeroError >= 0 ? '+' : ''}${effectiveZeroError.toFixed(2)})`
            : ''
        }.`,
      });
    } else {
      setGuessResult({
        correct: false,
        message: `Your entry (${parsed.toFixed(2)} mm) is off by ${diff.toFixed(2)} mm. Check the ${
          instrument === 'micrometer-001'
            ? '0.5 mm sleeve mark and thimble datum'
            : 'MSR left of vernier 0 and coinciding tick'
        }${effectiveZeroError !== 0 ? ' + zero error' : ''}.`,
      });
    }
  }

  function handleSubmitQcPart() {
    const parsed = Number.parseFloat(qcReadingInput);
    if (Number.isNaN(parsed)) return;
    const expectedPass = isWithinTolerance(activeQcPart);
    const expectedVerdict: 'PASS' | 'REJECT' = expectedPass ? 'PASS' : 'REJECT';
    const readingCorrect =
      Math.abs(parsed - activeQcPart.actualMm) <= config.leastCount + 1e-6;
    const verdictCorrect = qcVerdictChoice === expectedVerdict;

    setQcSubmissions((prev) => ({
      ...prev,
      [activeQcPart.id]: {
        enteredMm: parsed,
        verdict: qcVerdictChoice,
        readingCorrect,
        verdictCorrect,
        fullyCorrect: readingCorrect && verdictCorrect,
      },
    }));
  }

  function handleNewQcBatch() {
    const nextVariant = qcBatchVariant + 1;
    const nextBatch = createQcBatch(nextVariant);
    setQcBatchVariant(nextVariant);
    setQcBatch(nextBatch);
    setQcSubmissions({});
    loadQcPart(nextBatch[0], 0);
  }

  const qcCompletedCount = Object.keys(qcSubmissions).length;
  const qcCorrectCount = Object.values(qcSubmissions).filter(
    (s) => s.fullyCorrect
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Control Bar */}
      <div className="glass-panel rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Instrument Selector */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {(
              [
                ['vernier-002', pick('Vernier 0.02 mm', 'Jangka Sorong 0.02 mm', 'ノギス 0.02 mm')],
                ['vernier-005', pick('Vernier 0.05 mm', 'Jangka Sorong 0.05 mm', 'ノギス 0.05 mm')],
                ['micrometer-001', pick('Micrometer 0.01 mm', 'Mikrometer 0.01 mm', 'マイクロメータ 0.01 mm')],
              ] as [InstrumentType, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectInstrument(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  instrument === id
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mode & Loupe Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLoupe((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                showLoupe
                  ? 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              {pick('Loupe', 'Kaca Pembesar', 'ルーペ')} {showLoupe ? pick('On', 'Aktif', 'ON') : pick('Off', 'Nonaktif', 'OFF')}
            </button>

            {showLoupe && (
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                {[2.5, 3, 4].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setLoupeZoom(z)}
                    className={`px-2 py-1.5 font-medium ${
                      loupeZoom === z
                        ? 'bg-sky-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {z}×
                  </button>
                ))}
              </div>
            )}

            {/* Lab Sub-Mode Switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => handleSwitchLabMode('measure')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  labMode === 'measure'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                {pick('Measure', 'Ukur', '測定')}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLabMode('test')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  labMode === 'test'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <EyeOff className="h-3.5 w-3.5" />
                {pick('Test Yourself', 'Uji Mandiri', 'セルフテスト')}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLabMode('qc')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  labMode === 'qc'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                {pick('QC Inspection', 'Inspeksi QC', 'QC検査')}
              </button>
            </div>
          </div>
        </div>

        {/* Preset Parts & Zero Error Row (or QC Batch Strip when in QC mode) */}
        {labMode !== 'qc' ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {pick('Test Parts:', 'Benda Uji:', '測定ワーク:')}
              </span>
              <button
                type="button"
                onClick={() => handleSelectPart(null)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  activePartId === 'free'
                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {pick('Free Measure', 'Ukur Bebas', '自由測定')}
              </button>
              {PRESET_PARTS.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => handleSelectPart(part)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    activePartId === part.id
                      ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {part.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zeroErrorEnabled}
                  onChange={(e) => setZeroErrorEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                {pick('Zero Error', 'Kesalahan Nol', 'ゼロ誤差')}
              </label>
              {zeroErrorEnabled && (
                <select
                  value={zeroErrorMm}
                  onChange={(e) => setZeroErrorMm(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  {ZERO_ERROR_OPTIONS.filter((o) => o.value !== 0).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Incoming QC Batch #{qcBatchVariant + 1}
                </span>
                <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                  Batch Score: {qcCorrectCount} / {qcBatch.length} Correct (
                  {qcCompletedCount} inspected)
                </span>
              </div>
              <button
                type="button"
                onClick={handleNewQcBatch}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Shuffle className="h-3.5 w-3.5" />
                {pick('New QC Batch', 'Batch QC Baru', '新規QCバッチ')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {qcBatch.map((part, idx) => {
                const sub = qcSubmissions[part.id];
                const isActive = idx === activeQcIndex;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => loadQcPart(part, idx)}
                    className={`text-left rounded-lg border p-2.5 transition-colors ${
                      isActive
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {part.partNumber} · {part.measurementType}
                      </span>
                      {sub ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            sub.fullyCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {sub.fullyCorrect ? 'OK' : 'MISS'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {part.name}
                    </div>
                    <div className="text-[11px] font-mono text-sky-700 dark:text-sky-300">
                      {part.specLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace: 8-col Left Instrument Stage + 4-col Right Sidebar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column: Interactive Instrument + Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div
            tabIndex={0}
            onKeyDown={handleStageKeyDown}
            className="glass-panel rounded-2xl p-4 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {config.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    parallaxAngleDeg === 0
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {parallaxAngleDeg === 0
                    ? pick(
                        'Jaw Seated · 90° Eye-Level (0.00 mm Parallax)',
                        'Rahang Rapat · Tegak Lurus 90° (0.00 mm Paralaks)',
                        'ジョウ密着 · 正面90°視線 (視差 0.00 mm)'
                      )
                    : `${pick('Parallax', 'Paralaks', '視差')} ${parallaxAngleDeg > 0 ? '+' : ''}${parallaxAngleDeg}° (${
                        parallaxAngleDeg > 0 ? '+' : ''
                      }${(0.5 * Math.tan(degToRad(parallaxAngleDeg))).toFixed(2)} mm)`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px]">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                    {pick('View Angle:', 'Sudut Pandang:', '視点角度:')}
                  </span>
                  {([-15, 0, 15] as const).map((ang) => (
                    <button
                      key={ang}
                      type="button"
                      onClick={() => setParallaxAngleDeg(ang)}
                      className={`px-2 py-0.5 font-medium transition-colors ${
                        parallaxAngleDeg === ang
                          ? ang === 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {ang === 0 ? pick('0° (90° Perp)', '0° (Tegak)', '0° (正面)') : `${ang > 0 ? '+' : ''}${ang}°`}
                    </button>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Keyboard className="h-3 w-3 text-sky-500" />
                  Click stage · <kbd className="font-mono font-semibold">←/→</kbd> ±1 LC ·{' '}
                  <kbd className="font-mono font-semibold">Shift+←/→</kbd> ±10 LC
                </span>
              </div>
            </div>

            <div className="flex w-full items-center justify-center">
              {instrument === 'micrometer-001' ? (
                <MicrometerSvg
                  observedMm={observedMm}
                  theme={theme}
                  activePart={activePart}
                  hideReadout={hideReadout}
                  showLoupe={showLoupe}
                  loupeZoom={loupeZoom}
                  parallaxAngleDeg={parallaxAngleDeg}
                  qcSpecLabel={labMode === 'qc' ? activeQcPart.specLabel : undefined}
                  onChangeObserved={(mm) => {
                    setObservedMm(mm);
                    setGuessResult(null);
                  }}
                />
              ) : (
                <VernierSvg
                  observedMm={observedMm}
                  leastCount={config.leastCount as 0.02 | 0.05}
                  maxMm={config.maxMm}
                  theme={theme}
                  activePart={activePart}
                  hideReadout={hideReadout}
                  showLoupe={showLoupe}
                  loupeZoom={loupeZoom}
                  parallaxAngleDeg={parallaxAngleDeg}
                  qcSpecLabel={labMode === 'qc' ? activeQcPart.specLabel : undefined}
                  onChangeObserved={(mm) => {
                    setObservedMm(mm);
                    setGuessResult(null);
                  }}
                />
              )}
            </div>

            {/* Fine & Coarse Adjustment Controls */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Position Slider (0 – {config.maxMm} mm)</span>
                  <span className="font-mono">Step: {config.leastCount.toFixed(2)} mm</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={config.maxMm}
                  step={config.leastCount}
                  value={observedMm}
                  onChange={(e) => {
                    setObservedMm(
                      snapToLeastCount(Number(e.target.value), config.leastCount, config.maxMm)
                    );
                    setGuessResult(null);
                  }}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStep(-10)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  -10 LC
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Minus className="h-3.5 w-3.5" /> 1 LC
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Plus className="h-3.5 w-3.5" /> 1 LC
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(10)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  +10 LC
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setObservedMm(0);
                    setActivePartId('free');
                    setGuessResult(null);
                  }}
                  title="Reset to zero"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Zero
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Readout / QC / Test Yourself (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {labMode === 'qc' ? (
            <div className="rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Inspecting {activeQcPart.partNumber}: {activeQcPart.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Tolerance Spec:{' '}
                    <span className="font-mono font-semibold text-sky-700 dark:text-sky-300">
                      {activeQcPart.specLabel}
                    </span>{' '}
                    · Read the scale in the Magnifier Loupe, enter your measurement, and
                    mark PASS or REJECT.
                  </p>
                </div>
              </div>

              {!qcSubmissions[activeQcPart.id] ? (
                <div className="space-y-3">
                  <input
                    type="number"
                    step={config.leastCount}
                    placeholder="Measured mm"
                    value={qcReadingInput}
                    onChange={(e) => setQcReadingInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setQcVerdictChoice('PASS')}
                      className={`py-2 rounded-lg text-center transition-colors border ${
                        qcVerdictChoice === 'PASS'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pick('PASS (In Spec)', 'LULUS (Sesuai Spek)', '合格 (規格内)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQcVerdictChoice('REJECT')}
                      className={`py-2 rounded-lg text-center transition-colors border ${
                        qcVerdictChoice === 'REJECT'
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pick('REJECT (Out of Tol)', 'TOLAK (Luar Toleransi)', '不合格 (規格外)')}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitQcPart}
                    disabled={!qcReadingInput}
                    className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                  >
                    {pick('Submit QC Decision', 'Kirim Keputusan QC', 'QC判定を確定')}
                  </button>
                </div>
              ) : (
                (() => {
                  const sub = qcSubmissions[activeQcPart.id];
                  const actualInSpec = isWithinTolerance(activeQcPart);
                  return (
                    <div
                      className={`rounded-lg border p-3 text-xs space-y-2 ${
                        sub.fullyCorrect
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                          : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {sub.fullyCorrect ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold">
                            {sub.fullyCorrect
                              ? 'QC Inspection Passed!'
                              : 'QC Discrepancy'}
                          </div>
                          <div className="mt-1">
                            Actual: <span className="font-mono font-semibold">{activeQcPart.actualMm.toFixed(2)} mm</span> ({actualInSpec ? 'PASS' : 'REJECT'}) ·
                            You entered <span className="font-mono font-semibold">{sub.enteredMm.toFixed(2)} mm</span> ({sub.verdict}).
                          </div>
                        </div>
                      </div>
                      {activeQcIndex < qcBatch.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            loadQcPart(qcBatch[activeQcIndex + 1], activeQcIndex + 1)
                          }
                          className="w-full py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Next Part →
                        </button>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          ) : labMode === 'test' ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Test Yourself — Read the Scale
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Use the Magnifier Loupe to read the {config.label}
                    {effectiveZeroError !== 0
                      ? ` and compensate for the ${effectiveZeroError >= 0 ? '+' : ''}${effectiveZeroError.toFixed(2)} mm zero error`
                      : ''}
                    .
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRandomChallenge}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  {pick('New Challenge', 'Tantangan Baru', '新しい問題')}
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="number"
                  step={config.leastCount}
                  placeholder={pick('Enter reading in mm (e.g. 24.36)', 'Masukkan pembacaan mm (cth. 24.36)', '測定値をmmで入力 (例: 24.36)')}
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheckGuess();
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleCheckGuess}
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
                >
                  {pick('Check Reading', 'Periksa Pembacaan', '読取りを確認')}
                </button>
              </div>

              {guessResult && (
                <div
                  className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                    guessResult.correct
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                      : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {guessResult.correct ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  )}
                  <span>{guessResult.message}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Readout Card */}
              <div className="glass-panel rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {effectiveZeroError !== 0
                    ? pick('Corrected True Reading', 'Pembacaan Terkoreksi', 'ゼロ誤差補正後の真値')
                    : pick('Measured Reading', 'Hasil Pengukuran', '測定値')}
                </div>
                <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
                  {trueReadingMm.toFixed(2)}{' '}
                  <span className="text-base font-medium text-slate-500 dark:text-slate-400">
                    mm
                  </span>
                </div>
                {effectiveZeroError !== 0 && (
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div>Observed: {observedMm.toFixed(2)} mm</div>
                    <div>
                      Zero Error: {effectiveZeroError >= 0 ? '+' : ''}
                      {effectiveZeroError.toFixed(2)} mm
                    </div>
                  </div>
                )}
                {activePart && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {activePart.name}:
                    </span>{' '}
                    {activePart.description}
                  </div>
                )}
              </div>

              {/* Step-by-Step Scale Breakdown */}
              <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {pick('Scale Reading Breakdown', 'Rincian Pembacaan Skala', '目盛読取り内訳')} ({config.label})
                </div>

                {vernierBreakdown && (
                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                      <div className="text-slate-500 dark:text-slate-400">
                        1. Main Scale (MSR)
                      </div>
                      <div className="mt-0.5 text-base font-bold font-mono text-sky-600 dark:text-sky-400">
                        {vernierBreakdown.msrMm.toFixed(2)} mm
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Whole mm left of vernier 0
                      </div>
                    </div>

                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                      <div className="text-slate-500 dark:text-slate-400">
                        2. Vernier Scale (VSR × LC)
                      </div>
                      <div className="mt-0.5 text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        +{vernierBreakdown.vernierContributionMm.toFixed(2)} mm
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Div #{vernierBreakdown.coincidingDiv} × {vernierBreakdown.leastCount.toFixed(2)} mm
                      </div>
                    </div>

                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                      <div className="text-slate-500 dark:text-slate-400">
                        3. Observed Sum
                      </div>
                      <div className="mt-0.5 text-base font-bold font-mono text-slate-900 dark:text-white">
                        {vernierBreakdown.observedMm.toFixed(2)} mm
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {vernierBreakdown.msrMm} + {vernierBreakdown.vernierContributionMm.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {microBreakdown && (
                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                      <div className="text-slate-500 dark:text-slate-400">
                        1. Sleeve Reading
                      </div>
                      <div className="mt-0.5 text-base font-bold font-mono text-sky-600 dark:text-sky-400">
                        {microBreakdown.sleeveMm.toFixed(2)} mm
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {microBreakdown.sleeveFullMm} mm
                        {microBreakdown.hasHalfMm ? ' + 0.50 mm mark' : ' (no 0.5 mm mark)'}
                      </div>
                    </div>

                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                      <div className="text-slate-500 dark:text-slate-400">
                        2. Thimble (Div × 0.01)
                      </div>
                      <div className="mt-0.5 text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        +{microBreakdown.thimbleContributionMm.toFixed(2)} mm
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Div #{microBreakdown.thimbleDiv} × 0.01 mm
                      </div>
                    </div>

                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                      <div className="text-slate-500 dark:text-slate-400">
                        3. Observed Sum
                      </div>
                      <div className="mt-0.5 text-base font-bold font-mono text-slate-900 dark:text-white">
                        {microBreakdown.observedMm.toFixed(2)} mm
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {microBreakdown.sleeveMm.toFixed(2)} +{' '}
                        {microBreakdown.thimbleContributionMm.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
