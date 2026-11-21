import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Info,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  LUBRICATION_CONDITIONS,
  METRIC_BOLTS,
  PROPERTY_CLASSES,
  calculateBoltedJoint,
  type LubricationSpec,
  type MetricBoltSpec,
  type PropertyClassSpec,
} from './boltData';
import { TorqueWrenchSvg } from './TorqueWrenchSvg';
import { FlangeStarMiniLab } from './FlangeStarMiniLab';
import { DryVsLubeComparisonStrip } from './DryVsLubeComparisonStrip';
import { playWrenchClick } from './wrenchAudio';

export function BoltTorqueSimulator() {
  const { pick } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string>('M12');
  const [selectedClass, setSelectedClass] = useState<PropertyClassSpec['id']>('8.8');
  const [selectedLube, setSelectedLube] = useState<LubricationSpec['id']>('dry');
  const [torqueNm, setTorqueNm] = useState<number>(91);
  const [gripLengthMm, setGripLengthMm] = useState<number>(50);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [justClicked, setJustClicked] = useState<boolean>(false);

  const bolt: MetricBoltSpec = useMemo(
    () => METRIC_BOLTS.find((b) => b.size === selectedSize) ?? METRIC_BOLTS[3],
    [selectedSize]
  );

  const propClass: PropertyClassSpec = useMemo(
    () => PROPERTY_CLASSES.find((c) => c.id === selectedClass) ?? PROPERTY_CLASSES[0],
    [selectedClass]
  );

  const lubrication: LubricationSpec = useMemo(
    () =>
      LUBRICATION_CONDITIONS.find((l) => l.id === selectedLube) ??
      LUBRICATION_CONDITIONS[0],
    [selectedLube]
  );

  const calc = useMemo(
    () => calculateBoltedJoint(bolt, propClass, lubrication, torqueNm, gripLengthMm),
    [bolt, propClass, lubrication, torqueNm, gripLengthMm]
  );

  // Target window (72% - 79% Proof Load around 75% target)
  const inTargetWindow = calc.proofPercent >= 72 && calc.proofPercent <= 79;
  const prevTorqueRef = useRef<number>(torqueNm);

  const triggerWrenchClick = () => {
    if (soundEnabled) {
      playWrenchClick();
    }
    setJustClicked(true);
  };

  useEffect(() => {
    if (!justClicked) return;
    const timer = window.setTimeout(() => setJustClicked(false), 1200);
    return () => window.clearTimeout(timer);
  }, [justClicked]);

  const updateTorqueWithClickCheck = (nextTorque: number) => {
    const prev = prevTorqueRef.current;
    const target = calc.recommendedTorqueNm;
    const crossedUp = prev < target && nextTorque >= target;
    const crossedDown = prev > target && nextTorque <= target;
    if (crossedUp || crossedDown) {
      triggerWrenchClick();
    }
    prevTorqueRef.current = nextTorque;
    setTorqueNm(nextTorque);
  };

  // Keep torque within slider bounds when user switches bolt size or class
  const handleBoltChange = (newSize: string) => {
    setSelectedSize(newSize);
    const nextBolt = METRIC_BOLTS.find((b) => b.size === newSize) ?? bolt;
    const nextCalc = calculateBoltedJoint(nextBolt, propClass, lubrication, torqueNm);
    setTorqueNm(Math.round(nextCalc.recommendedTorqueNm));
  };

  const handleClassChange = (newClass: PropertyClassSpec['id']) => {
    setSelectedClass(newClass);
    const nextProp = PROPERTY_CLASSES.find((c) => c.id === newClass) ?? propClass;
    const nextCalc = calculateBoltedJoint(bolt, nextProp, lubrication, torqueNm);
    setTorqueNm(Math.round(nextCalc.recommendedTorqueNm));
  };

  const applyProofPercent = (pct: number) => {
    const nextT = Number(((calc.proofTorqueNm * pct) / 100).toFixed(1));
    prevTorqueRef.current = nextT;
    setTorqueNm(nextT);
    if (pct === 75) {
      triggerWrenchClick();
    }
  };

  const statusBanner = useMemo(() => {
    switch (calc.status) {
      case 'stripped':
        return {
          title: pick(
            'STRIPPED / FRACTURE FAILURE',
            'GAGAL ULIR RUSAK / PUTUS TARIK',
            'ねじ山破損・破断'
          ),
          message: pick(
            `Tensile stress (${calc.tensileStressMpa.toFixed(0)} MPa) exceeds Ultimate Tensile Strength (${propClass.tensileStrengthMpa} MPa). Threads strip or shank snaps!`,
            `Tegangan tarik (${calc.tensileStressMpa.toFixed(0)} MPa) melebihi Kuat Tarik Maksimum (${propClass.tensileStrengthMpa} MPa). Ulir rusak atau batang baut putus!`,
            `引張応力 (${calc.tensileStressMpa.toFixed(0)} MPa) が引張強さ (${propClass.tensileStrengthMpa} MPa) を超過しています。ねじ山破損または破断が発生します！`
          ),
          classes:
            'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
          icon: AlertOctagon,
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
      case 'yielded':
        return {
          title: pick(
            'OVER-TORQUE — BOLT YIELDED',
            'OVER-TORQUE — BAUT LULUH',
            'オーバートルク — ボルト降伏'
          ),
          message: pick(
            `Exceeds 100% Proof Load (${calc.proofPercent.toFixed(0)}%). Fastener suffers permanent plastic stretch and must be replaced.`,
            `Melewati 100% Proof Load (${calc.proofPercent.toFixed(0)}%). Baut mengalami regangan plastis permanen dan wajib diganti.`,
            `保証荷重の 100% (${calc.proofPercent.toFixed(0)}%) を超過しています。永久塑性伸びが生じたためボルト交換が必要です。`
          ),
          classes:
            'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200',
          icon: AlertTriangle,
          iconColor: 'text-orange-600 dark:text-orange-400',
        };
      case 'caution':
        return {
          title: pick(
            'HIGH PRELOAD CAUTION (88–100% PROOF)',
            'PERINGATAN PRELOAD TINGGI (88–100% PROOF)',
            '高軸力注意 (保証荷重 88–100%)'
          ),
          message: pick(
            'Very close to Proof Load. Any wrench scatter or thermal expansion could yield the fastener.',
            'Sangat dekat dengan batas Proof Load. Variasi kunci momen atau ekspansi termal dapat meluluhkan baut.',
            '保証荷重に極めて近い状態です。レンチ誤差や熱膨張で降伏する恐れがあります。'
          ),
          classes:
            'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'optimal':
        return {
          title: pick(
            'OPTIMAL CLAMPING ZONE (55–88% PROOF)',
            'ZONA JEPIT OPTIMAL (55–88% PROOF)',
            '最適締結領域 (保証荷重 55–88%)'
          ),
          message: pick(
            `Safe elastic preload (${calc.preloadKn.toFixed(1)} kN). Ideal ~75% Proof target is ${calc.recommendedTorqueNm.toFixed(1)} N·m.`,
            `Preload elastis aman (${calc.preloadKn.toFixed(1)} kN). Target ideal ~75% Proof adalah ${calc.recommendedTorqueNm.toFixed(1)} N·m.`,
            `安全な弾性域軸力です (${calc.preloadKn.toFixed(1)} kN)。75% 保証荷重の推奨トルクは ${calc.recommendedTorqueNm.toFixed(1)} N·m です。`
          ),
          classes:
            'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      default:
        return {
          title: pick(
            'UNDER-TORQUED / LOW PRELOAD',
            'TORSI KURANG / PRELOAD RENDAH',
            'トルク不足・軸力低下'
          ),
          message: pick(
            'Insufficient clamping force (<55% Proof). Joint is vulnerable to vibration loosening or gasket leakage.',
            'Gaya jepit tidak mencukupi (<55% Proof). Sambungan rentan kendur akibat getaran atau kebocoran gasket.',
            '締付軸力が不足しています (<55% 保証荷重)。振動による緩みやガスケット漏洩の恐れがあります。'
          ),
          classes:
            'border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]',
          icon: Info,
          iconColor: 'text-[var(--md-on-surface-variant)]',
        };
    }
  }, [calc, propClass, pick]);

  const BannerIcon = statusBanner.icon;

  return (
    <div className="space-y-5">
      {/* Top Grid: Controls + Torque Wrench Diagram & Live Readouts */}
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Controls Panel */}
        <div className="glass-panel space-y-5 rounded-[28px] p-5 lg:col-span-5">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
              <h2 className="text-sm font-bold text-[var(--md-on-surface)]">
                {pick(
                  'Fastener & Torque Wrench Controls',
                  'Kontrol Baut & Kunci Momen',
                  'ボルト・トルクレンチ制御'
                )}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              title={pick(
                'Toggle mechanical click-wrench audio feedback',
                'Aktifkan/matikan suara klik kunci momen',
                'トルクレンチのクリック音を切り替え'
              )}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                soundEnabled
                  ? 'border-[var(--md-primary)]/40 bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                  : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              {soundEnabled
                ? pick('Click ON', 'Suara ON', '音 ON')
                : pick('Muted', 'Senyap', '消音')}
            </button>
          </div>

          {/* Metric Bolt Size */}
          <div data-tour="bolt-size">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[var(--md-on-surface)]">
                {pick(
                  'Metric Bolt Size (ISO Coarse)',
                  'Ukuran Baut Metrik (Ulir Kasar ISO)',
                  'メートル並目ねじサイズ (ISO)'
                )}
              </label>
              <span className="font-mono text-[var(--md-on-surface-variant)]">
                At = {bolt.tensileAreaMm2} mm² · p = {bolt.pitchMm} mm
              </span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {METRIC_BOLTS.map((b) => (
                <button
                  key={b.size}
                  type="button"
                  onClick={() => handleBoltChange(b.size)}
                  className={`rounded-full border py-1.5 text-xs transition ${
                    selectedSize === b.size
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-semibold text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  {b.size}
                </button>
              ))}
            </div>
          </div>

          {/* Property Class */}
          <div>
            <label className="text-xs font-semibold text-[var(--md-on-surface)]">
              {pick(
                'Property Class (ISO 898-1)',
                'Kelas Properti (ISO 898-1)',
                '強度区分 (ISO 898-1)'
              )}
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PROPERTY_CLASSES.map((pc) => (
                <button
                  key={pc.id}
                  type="button"
                  onClick={() => handleClassChange(pc.id)}
                  className={`rounded-[20px] border p-2.5 text-left transition ${
                    selectedClass === pc.id
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  <div className="text-xs font-bold">
                    {pc.label}
                  </div>
                  <div className="mt-0.5 text-[11px] opacity-80">
                    Sp = {pc.proofStrengthMpa} MPa
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Surface / Lubrication */}
          <div data-tour="bolt-lube">
            <label className="text-xs font-semibold text-[var(--md-on-surface)]">
              {pick(
                'Surface & Lubrication Condition (Nut Factor K)',
                'Kondisi Permukaan & Pelumasan (Faktor Mur K)',
                '表面・潤滑条件 (トルク係数 K)'
              )}
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {LUBRICATION_CONDITIONS.map((lube) => {
                const isSelected = selectedLube === lube.id;
                return (
                  <button
                    key={lube.id}
                    type="button"
                    onClick={() => setSelectedLube(lube.id)}
                    className={`rounded-[20px] border p-2.5 text-left transition ${
                      isSelected
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold">
                        {lube.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                          isSelected
                            ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                            : 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                        }`}
                      >
                        K={lube.kFactor.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--md-on-surface-variant)]">
              {lubrication.note}
            </p>
          </div>

          {/* Torque Wrench Slider */}
          <div data-tour="bolt-wrench" className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="torque-slider"
                className="text-xs font-bold text-[var(--md-on-surface)]"
              >
                {pick(
                  'Applied Wrench Torque (T)',
                  'Torsi Kunci Momen (T)',
                  '印加トルク (T)'
                )}
              </label>
              <div className="flex items-center gap-2">
                {(justClicked || inTargetWindow) && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 ${
                      justClicked ? 'animate-pulse' : ''
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {pick(
                      'CLICK! Target Reached',
                      'KLIK! Target Tercapai',
                      'カチッ！目標到達'
                    )}
                  </span>
                )}
                <span className="font-mono text-base font-extrabold text-[var(--md-primary)]">
                  {torqueNm.toFixed(1)} N·m
                </span>
              </div>
            </div>

            <input
              id="torque-slider"
              type="range"
              min={0}
              max={calc.maxSliderTorqueNm}
              step={Math.max(0.5, Number((calc.maxSliderTorqueNm / 200).toFixed(1)))}
              value={Math.min(torqueNm, calc.maxSliderTorqueNm)}
              onChange={(e) => updateTorqueWithClickCheck(Number(e.target.value))}
              className="mt-2.5 w-full"
            />

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                { label: '50% Proof', pct: 50 },
                { label: '75% Target', pct: 75 },
                { label: '92% Caution', pct: 92 },
                { label: '110% Yield', pct: 110 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyProofPercent(preset.pct)}
                  className="glass-pill rounded-full px-2.5 py-1 text-[11px] font-semibold"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Joint Grip Length (L_grip) for Elastic Elongation */}
          <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="grip-slider"
                className="font-semibold text-[var(--md-on-surface)]"
              >
                {pick(
                  'Effective Grip Length (L_grip)',
                  'Panjang Jepit Efektif (L_grip)',
                  '有効締付長さ (L_grip)'
                )}
              </label>
              <span className="font-mono font-bold text-[var(--md-primary)]">
                {gripLengthMm} mm
              </span>
            </div>
            <input
              id="grip-slider"
              type="range"
              min={20}
              max={120}
              step={5}
              value={gripLengthMm}
              onChange={(e) => setGripLengthMm(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </div>
        </div>

        {/* Right Visualization & Live Readouts */}
        <div className="space-y-4 lg:col-span-7">
          <div data-tour="bolt-readout" className="glass-panel rounded-[28px] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
                <h2 className="text-sm font-bold text-[var(--md-on-surface)]">
                  {pick(
                    'Live Preload & Proof-Load Readout',
                    'Pembacaan Preload & Proof-Load Langsung',
                    'リアルタイム軸力・保証荷重計測'
                  )}
                </h2>
              </div>
              <span className="font-mono text-xs text-[var(--md-on-surface-variant)]">
                T = K · d · Fi
              </span>
            </div>

            <div className="flex w-full items-center justify-center">
              <TorqueWrenchSvg
                bolt={bolt}
                propClass={propClass}
                lubrication={lubrication}
                calc={calc}
                justClicked={justClicked}
                inTargetWindow={inTargetWindow}
              />
            </div>

            {/* 6 Key Metric Cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                  {pick('Applied Torque (T)', 'Torsi Pengencangan (T)', '印加トルク (T)')}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                  {calc.torqueNm.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">N·m</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                  {pick('Clamping Preload (Fi)', 'Gaya Jepit (Fi)', '締付軸力 (Fi)')}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                  {calc.preloadKn.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">kN</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                  {pick('Tensile Stress (σt)', 'Tegangan Tarik (σt)', '引張応力 (σt)')}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                  {calc.tensileStressMpa.toFixed(0)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">MPa</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                  {pick('Proof Capacity', 'Kapasitas Proof', '保証荷重比')} ({propClass.proofStrengthMpa} MPa)
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-[var(--md-primary)]">
                  {calc.proofPercent.toFixed(0)}%
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                  {pick('Thread Stress Area (As)', 'Luas Tegangan Ulir (As)', '有効断面積 (As)')}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                  {calc.tensileAreaMm2.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">mm²</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                  {pick('Elastic Elongation (ΔL)', 'Elongasi Elastis (ΔL)', '弾性伸び (ΔL)')}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                  {calc.elongationMm.toFixed(3)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">mm</span>
                </div>
              </div>
            </div>

            {/* Status / Warning Banner */}
            <div
              data-tour="bolt-diagnostics"
              className={`mt-4 flex items-start gap-2.5 rounded-[22px] border p-3.5 text-xs ${statusBanner.classes}`}
            >
              <BannerIcon className={`mt-0.5 h-4 w-4 shrink-0 ${statusBanner.iconColor}`} />
              <div>
                <div className="font-bold">{statusBanner.title}</div>
                <p className="mt-0.5 opacity-90">{statusBanner.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Full-Width: Dry vs Lubricated Over-Torque Comparison Strip */}
      <DryVsLubeComparisonStrip
        bolt={bolt}
        propClass={propClass}
        torqueNm={torqueNm}
        activeLubeId={selectedLube}
        onApplyDrySpec={(dryTarget) => {
          prevTorqueRef.current = dryTarget;
          setTorqueNm(dryTarget);
          triggerWrenchClick();
        }}
      />

      {/* Bottom Full-Width: Flange Star-Pattern Tightening Mini-Lab */}
      <FlangeStarMiniLab targetTorqueNm={calc.recommendedTorqueNm} />
    </div>
  );
}
