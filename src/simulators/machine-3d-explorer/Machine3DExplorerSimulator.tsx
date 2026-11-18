import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Pause,
  Play,
  RotateCw,
  ScanEye,
  Tag,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { renderCadScene, type CameraState } from './cad3dEngine';
import {
  AIR_KNOCKER_3D_PARTS,
  AIR_KNOCKER_INFO,
} from './airKnocker3dData';
import {
  BELT_CONVEYOR_3D_PARTS,
  BELT_CONVEYOR_INFO,
} from './beltConveyor3dData';
import {
  CHAIN_CONVEYOR_3D_PARTS,
  CHAIN_CONVEYOR_INFO,
} from './chainConveyor3dData';
import {
  MACHINE_INFO,
  PUMP_3D_PARTS,
  type Machine3DPartSpec,
} from './machine3dData';
import {
  SKAKO_FEEDER_3D_PARTS,
  SKAKO_FEEDER_INFO,
} from './skakoFeeder3dData';
import {
  SCREW_CONVEYOR_3D_PARTS,
  SCREW_CONVEYOR_INFO,
} from './screwConveyor3dData';
import {
  Machine3DViewport,
  type CameraPresetCommand,
} from './Machine3DViewport';

type MachineId = 'pump' | 'belt' | 'chain' | 'knocker' | 'skako' | 'screw';

const MACHINE_CONFIGS: {
  id: MachineId;
  info: typeof MACHINE_INFO;
  parts: Machine3DPartSpec[];
  shortLabel: { en: string; id: string; ja: string };
  summary: { en: string; id: string; ja: string };
  standardTag: string;
}[] = [
  {
    id: 'pump',
    info: MACHINE_INFO,
    parts: PUMP_3D_PARTS,
    shortLabel: {
      en: 'ANSI Centrifugal Process Pump',
      id: 'Pompa Proses Sentrifugal ANSI',
      ja: 'ANSI 遠心プロセスポンプ',
    },
    summary: {
      en: 'End-suction volute casing, 6-vane impeller, cartridge seal & duplex thrust bearings.',
      id: 'Rumah volute end-suction, impeller 6-sudu, mechanical seal cartridge & bearing duplex.',
      ja: '片吸込ボリュート・6枚羽根インペラ・カートリッジシール・背面組合せ軸受。',
    },
    standardTag: 'ANSI B73.1',
  },
  {
    id: 'belt',
    info: BELT_CONVEYOR_INFO,
    parts: BELT_CONVEYOR_3D_PARTS,
    shortLabel: {
      en: 'CEMA Troughed Belt Conveyor',
      id: 'Konveyor Sabuk Trough CEMA',
      ja: 'CEMA トラフ型ベルトコンベヤ',
    },
    summary: {
      en: '35° 3-roll troughing idlers, lagged head drive pulley, skirtboard hopper & scraper.',
      id: 'Idler trough 35° 3-roll, puli penggerak lagged, hopper skirtboard & scraper.',
      ja: '35°トラフアイドラ・ラギング駆動プーリ・スカートホッパ・スクレーパ。',
    },
    standardTag: 'CEMA 35°',
  },
  {
    id: 'chain',
    info: CHAIN_CONVEYOR_INFO,
    parts: CHAIN_CONVEYOR_3D_PARTS,
    shortLabel: {
      en: 'En-Masse & Scraper Drag Chain Conveyor',
      id: 'Konveyor Rantai Penggaruk & En-Masse',
      ja: 'エンマス＆スクレーパ・ドラッグチェーンコンベヤ',
    },
    summary: {
      en: 'Dust-tight U-trough casing, UHMW wear liner, forged scraper flights & drive sprockets.',
      id: 'Palung-U kedap debu, liner aus UHMW, flight penggaruk tempa & sproket penggerak.',
      ja: '密閉Uトラフ・UHMW摩耗ライナ・鍛造フライトチェーン・駆動スプロケット。',
    },
    standardTag: 'EN-MASSE / SCRAPER',
  },
  {
    id: 'knocker',
    info: AIR_KNOCKER_INFO,
    parts: AIR_KNOCKER_3D_PARTS,
    shortLabel: {
      en: 'Seishin SK-60 Pneumatic Air Knocker',
      id: 'Seishin SK-60 Pneumatic Air Knocker',
      ja: 'セイシン SK-60 エアーノッカー',
    },
    summary: {
      en: 'Ø121×215 mm ribbed cylinder, NdFeB magnetic latch piston, SWP-B spring & 200×90 base.',
      id: 'Silinder bersirip Ø121×215 mm, piston magnet NdFeB, pegas SWP-B & pelat dasar 200×90.',
      ja: 'Ø121×215mmシリンダ・磁気吸着ピストン・戻しコイルばね・200×90ベース板。',
    },
    standardTag: 'SEISHIN SK-60',
  },
  {
    id: 'skako',
    info: SKAKO_FEEDER_INFO,
    parts: SKAKO_FEEDER_3D_PARTS,
    shortLabel: {
      en: 'SKAKO 50D Electromagnetic Vibrator (Pos. 1–13)',
      id: 'Vibrator Elektromagnetik SKAKO 50D (Pos. 1–13)',
      ja: 'SKAKO 50D 電磁リニアバイブレータ (Pos. 1–13)',
    },
    summary: {
      en: 'Central magnet & perforated armature, twin helical springs, trimming weights, yoke & domed hood.',
      id: 'Magnet & jangkar berlubang, pegas heliks kembar, trimming weights, yoke & tudung galvanis.',
      ja: '電磁コア＆矩形アーマチュア・ツインコイルばね・調整ウェイト・ヨーク・亜鉛めっきカバー。',
    },
    standardTag: 'SKAKO 50D',
  },
  {
    id: 'screw',
    info: SCREW_CONVEYOR_INFO,
    parts: SCREW_CONVEYOR_3D_PARTS,
    shortLabel: {
      en: 'CEMA 350 Horizontal U-Trough Screw Conveyor',
      id: 'Konveyor Sekrup Palung-U CEMA 350',
      ja: 'CEMA 350 横型Uトラフスクリューコンベヤ',
    },
    summary: {
      en: 'Continuous end-to-end helicoid auger & Sch 80 torque pipe, stuffing-box seals, bearings & gearmotor.',
      id: 'Ulir sekrup helikoid & pipa torsi Sch 80 penuh ujung-ke-ujung, segel stuffing box & gearmotor.',
      ja: '通し連続ヘリコイド羽根＆Sch80トルクパイプ・グランドパッキン・端軸受・ギヤモータ。',
    },
    standardTag: 'CEMA BOOK 350',
  },
];

const DEFAULT_CAMERA: CameraState = {
  yaw: -0.56,
  pitch: -0.36,
  zoom: 1.0,
  panX: 0,
  panY: 0,
};

function MachinePreviewCanvas({
  parts,
  isDark,
}: {
  parts: Machine3DPartSpec[];
  isDark: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 420;
    const height = 220;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderCadScene(
      ctx,
      width,
      height,
      { yaw: -0.58, pitch: -0.34, zoom: 1.08, panX: 0, panY: 4 },
      {
        parts,
        explodeFactor: 0.14,
        explodeMode: 'staged',
        shaftAngleRad: 0.25,
        xrayHousing: false,
        showCallouts: false,
        hoveredPartId: null,
        selectedPartId: null,
        isolatedPartId: null,
        isDark,
      }
    );
    ctx.restore();
  }, [parts, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="h-44 w-full object-cover"
      aria-hidden="true"
    />
  );
}

export function Machine3DExplorerSimulator() {
  const { language, pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedMachineId, setSelectedMachineId] = useState<MachineId | null>(null);
  const currentMachine =
    MACHINE_CONFIGS.find((m) => m.id === selectedMachineId) ?? MACHINE_CONFIGS[0];
  const activeInfo = currentMachine.info;
  const activeParts = currentMachine.parts;

  const [cameraPreset, setCameraPreset] = useState<CameraPresetCommand>({
    state: DEFAULT_CAMERA,
    seq: 0,
  });
  const [explodePct, setExplodePct] = useState<number>(25);
  const [explodeMode, setExplodeMode] = useState<'proportional' | 'staged'>('staged');
  const [isAnimatingExplode, setIsAnimatingExplode] = useState<boolean>(false);
  const [explodeDirection, setExplodeDirection] = useState<1 | -1>(1);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [rpm, setRpm] = useState<number>(960);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [xrayHousing, setXrayHousing] = useState<boolean>(false);
  const [showCallouts, setShowCallouts] = useState<boolean>(true);

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [isolatedPartId, setIsolatedPartId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAnimatingExplode) return;
    const timer = window.setInterval(() => {
      setExplodePct((prev) => {
        const next = prev + explodeDirection * 2;
        if (next >= 100) {
          setExplodeDirection(-1);
          setIsAnimatingExplode(false);
          return 100;
        }
        if (next <= 0) {
          setExplodeDirection(1);
          setIsAnimatingExplode(false);
          return 0;
        }
        return next;
      });
    }, 24);
    return () => window.clearInterval(timer);
  }, [isAnimatingExplode, explodeDirection]);

  const handleToggleExplodeAnimation = () => {
    if (explodePct >= 98) {
      setExplodeDirection(-1);
    } else if (explodePct <= 2) {
      setExplodeDirection(1);
    }
    setIsAnimatingExplode((prev) => !prev);
  };

  const applyCameraPreset = useCallback(
    (preset: 'iso' | 'front' | 'side' | 'top') => {
      setAutoRotate(false);
      let nextState: CameraState;
      if (preset === 'iso') {
        nextState = { ...DEFAULT_CAMERA, zoom: explodePct > 50 ? 0.85 : 1.0 };
      } else if (preset === 'front') {
        nextState = { yaw: Math.PI * 0.5, pitch: -0.05, zoom: 1.15, panX: 0, panY: 0 };
      } else if (preset === 'side') {
        nextState = { yaw: 0, pitch: -0.06, zoom: explodePct > 50 ? 0.82 : 1.0, panX: 0, panY: 0 };
      } else {
        nextState = { yaw: 0, pitch: -1.45, zoom: explodePct > 50 ? 0.82 : 1.0, panX: 0, panY: 0 };
      }
      setCameraPreset((prev) => ({ state: nextState, seq: prev.seq + 1 }));
    },
    [explodePct]
  );

  const handleResetCamera = useCallback(() => {
    setAutoRotate(false);
    setCameraPreset((prev) => ({ state: DEFAULT_CAMERA, seq: prev.seq + 1 }));
  }, []);

  const handleSelectMachine = (machineId: MachineId) => {
    setSelectedMachineId(machineId);
    setSelectedPartId(null);
    setIsolatedPartId(null);
    setIsAnimatingExplode(false);
    setExplodePct(25);
    setAutoRotate(false);
    setCameraPreset((prev) => ({ state: DEFAULT_CAMERA, seq: prev.seq + 1 }));
  };

  const handleBackToPicker = () => {
    setIsAnimatingExplode(false);
    setIsRunning(false);
    setAutoRotate(false);
    setSelectedPartId(null);
    setIsolatedPartId(null);
    setSelectedMachineId(null);
  };

  const handleSelectBomPart = (partId: string) => {
    setSelectedPartId(partId);
    if (isolatedPartId && isolatedPartId !== partId) {
      setIsolatedPartId(partId);
    }
  };

  // --- View 1: Clean CAD Machine Selection Hub ---
  if (selectedMachineId === null) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {pick(
                'Choose a 3D Machine to Inspect',
                'Pilih Mesin 3D untuk Diinspeksi',
                '点検する3D機械を選択'
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pick(
                'Select an assembly to orbit 360°, animate exploded disassembly, and click parts for specifications.',
                'Pilih rakitan untuk memutar 360°, simulasi bongkar-pasang, dan klik bagian untuk info spesifikasi.',
                'アセンブリを選択して360°回転・分解アニメーション・部品クリック仕様確認を行います。'
              )}
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
            {MACHINE_CONFIGS.length} {pick('Assemblies', 'Rakitan', 'アセンブリ')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {MACHINE_CONFIGS.map((machine) => (
            <button
              key={machine.id}
              type="button"
              onClick={() => handleSelectMachine(machine.id)}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white text-left transition duration-150 hover:border-[#001F6B]/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-slate-800 dark:bg-[#091221] dark:hover:border-cyan-400/50"
            >
              {/* Live 3D Isometric Preview */}
              <div className="relative w-full overflow-hidden border-b border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-[#060D1A]">
                <MachinePreviewCanvas parts={machine.parts} isDark={isDark} />
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{machine.standardTag}</span>
                    <span>
                      {machine.parts.length} {pick('parts', 'komponen', '部品')}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold tracking-tight text-slate-900 group-hover:text-[#001F6B] dark:text-white dark:group-hover:text-cyan-300">
                    {machine.shortLabel[language]}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {machine.summary[language]}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-[#001F6B] dark:border-slate-800/80 dark:text-cyan-400">
                  <span>
                    {pick('Open 3D Inspector', 'Buka Inspektor 3D', '3Dビューアを開く')}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- View 2: Unified CAD Studio Workstation ---
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-[#091221]">
      {/* Integrated Top Studio Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/90 px-3 py-2 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={handleBackToPicker}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {pick('Choose Machine', 'Pilih Mesin', '機械選択')}
          </button>

          <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />

          <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {activeInfo.title[language]}
          </h2>
        </div>

        {/* Compact CAD View & Drive Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Camera View Presets */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-medium dark:border-slate-700 dark:bg-slate-800/70">
            {(
              [
                ['iso', pick('Iso', 'Iso', '立体')],
                ['front', pick('Front', 'Depan', '正面')],
                ['side', pick('Side', 'Samping', '側面')],
                ['top', pick('Top', 'Atas', '上面')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => applyCameraPreset(id)}
                className="rounded-md px-2 py-1 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setXrayHousing((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              xrayHousing
                ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <ScanEye className="h-3.5 w-3.5" />
            {pick('X-Ray', 'X-Ray', '透過')}
          </button>

          <button
            type="button"
            onClick={() => setShowCallouts((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              showCallouts
                ? 'border-[#001F6B]/40 bg-[#001F6B]/10 text-[#001F6B] dark:border-sky-400/40 dark:bg-sky-400/15 dark:text-sky-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            {pick('Pins', 'Pin', '番号')}
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
              autoRotate
                ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            {pick('Orbit', 'Putar', '回転')}
          </button>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800/70">
            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold transition ${
                isRunning
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {pick('Drive', 'Putar', '駆動')}
            </button>
            <input
              type="range"
              min={150}
              max={1750}
              step={25}
              value={rpm}
              onChange={(e) => {
                setRpm(Number(e.target.value));
                if (!isRunning) setIsRunning(true);
              }}
              aria-label="Drive speed RPM"
              className="hidden w-16 accent-emerald-600 sm:block dark:accent-emerald-400"
            />
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {isRunning ? rpm : 0} RPM
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Workspace: 3D Viewport + Integrated Assembly Tree */}
      <div className="grid lg:grid-cols-[1fr_296px]">
        {/* Left: 3D CAD Viewport */}
        <div className="min-w-0">
          <Machine3DViewport
            parts={activeParts}
            cameraPreset={cameraPreset}
            onResetCamera={handleResetCamera}
            explodePct={explodePct}
            onExplodePctChange={(pct) => {
              setIsAnimatingExplode(false);
              setExplodePct(pct);
            }}
            explodeMode={explodeMode}
            onExplodeModeChange={setExplodeMode}
            isAnimatingExplode={isAnimatingExplode}
            onToggleExplodeAnimation={handleToggleExplodeAnimation}
            rpm={rpm}
            isRunning={isRunning}
            autoRotate={autoRotate}
            xrayHousing={xrayHousing}
            showCallouts={showCallouts}
            selectedPartId={selectedPartId}
            onSelectPart={setSelectedPartId}
            isolatedPartId={isolatedPartId}
            onToggleIsolatePart={setIsolatedPartId}
          />
        </div>

        {/* Right: CAD Assembly Tree / Bill of Materials */}
        <aside className="flex flex-col border-t border-slate-200/90 bg-slate-50/50 lg:h-[580px] lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-[#0A1424]">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-3.5 py-2.5 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {pick('Assembly Tree', 'Daftar Komponen', '部品ツリー (BOM)')}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {activeParts.length}
            </span>
          </div>

          <div className="flex-1 divide-y divide-slate-200/60 overflow-y-auto dark:divide-slate-800/70">
            {activeParts.map((part) => {
              const isSel = selectedPartId === part.id;
              const isIso = isolatedPartId === part.id;
              return (
                <div
                  key={part.id}
                  onClick={() => handleSelectBomPart(part.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectBomPart(part.id);
                    }
                  }}
                  className={`group flex cursor-pointer items-center justify-between gap-2 border-l-2 px-3.5 py-2.5 text-left transition ${
                    isSel
                      ? 'border-l-cyan-500 bg-cyan-500/8 dark:bg-cyan-500/10'
                      : 'border-l-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          isSel
                            ? 'text-cyan-700 dark:text-cyan-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {String(part.bomNumber).padStart(2, '0')}
                      </span>
                      <span
                        className={`truncate text-xs font-medium ${
                          isSel
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {part.name[language]}
                      </span>
                    </div>
                    <div className="mt-0.5 pl-6 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      {part.partCode} · {pick('Stage', 'Tahap', '段階')} {part.explodeStage}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPartId(part.id);
                      setIsolatedPartId(isIso ? null : part.id);
                    }}
                    title={pick('Isolate 3D Part', 'Isolasi 3D', '単独表示')}
                    className={`shrink-0 rounded p-1 transition ${
                      isIso
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 opacity-0 hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <Maximize2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
