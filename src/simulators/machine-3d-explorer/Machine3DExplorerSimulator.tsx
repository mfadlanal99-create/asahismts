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
  GEARBOX_REDUCER_3D_PARTS,
  GEARBOX_REDUCER_INFO,
} from './gearboxReducer3dData';
import {
  MOTOR_3D_PARTS,
  MOTOR_3D_INFO,
} from './motor3dData';
import {
  URAS_MOTOR_3D_PARTS,
  URAS_MOTOR_INFO,
} from './urasMotor3dData';
import {
  BUCKET_ELEVATOR_3D_PARTS,
  BUCKET_ELEVATOR_3D_INFO,
} from './bucketElevator3dData';
import {
  APRON_CONVEYOR_3D_PARTS,
  APRON_CONVEYOR_3D_INFO,
} from './apronConveyor3dData';
import {
  Machine3DViewport,
  type CameraPresetCommand,
} from './Machine3DViewport';

type MachineId =
  | 'pump'
  | 'belt'
  | 'chain'
  | 'knocker'
  | 'skako'
  | 'screw'
  | 'gearbox'
  | 'motor'
  | 'uras'
  | 'bucket-elevator'
  | 'apron-conveyor';

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
  {
    id: 'gearbox',
    info: GEARBOX_REDUCER_INFO,
    parts: GEARBOX_REDUCER_3D_PARTS,
    shortLabel: {
      en: 'Helical 2-Stage Gearbox Reducer',
      id: 'Gearbox Reducer Heliks 2-Tingkat',
      ja: '2段ヘリカル減速機',
    },
    summary: {
      en: 'Split-case parallel-shaft helical reducer (i=18.5:1) with tapered roller bearings, Viton seals & oil sump.',
      id: 'Reducer poros sejajar gigi heliks rumah belah (i=18,5:1) dengan bearing rol tirus, seal Viton & bak oli.',
      ja: '割りケース平行軸2段ヘリカル減速機（i=18.5:1）・円すいころ軸受・オイルシール。',
    },
    standardTag: 'AGMA / ISO 6336',
  },
  {
    id: 'motor',
    info: MOTOR_3D_INFO,
    parts: MOTOR_3D_PARTS,
    shortLabel: {
      en: '3-Phase TEFC Induction Motor',
      id: 'Motor Induksi 3-Fasa TEFC',
      ja: '三相全閉外扇形誘導電動機',
    },
    summary: {
      en: 'IEC 160M 15 kW 4-pole squirrel-cage TEFC motor with Class-F VPI stator, cooling fins & 6-stud terminal box.',
      id: 'Motor sangkar tupai TEFC IEC 160M 15 kW 4-kutub dengan stator Kelas-F VPI, sirip pendingin & kotak terminal.',
      ja: 'IEC 160M 15kW 4極 全閉外扇かご形誘導電動機（F種絶縁・冷却フィン・端子箱）。',
    },
    standardTag: 'IEC 60034 / IP55',
  },
  {
    id: 'uras',
    info: URAS_MOTOR_INFO,
    parts: URAS_MOTOR_3D_PARTS,
    shortLabel: {
      en: 'URAS KEE Vibrating Motor',
      id: 'Motor Getar URAS KEE',
      ja: 'ユーラスバイブレータ KEE形',
    },
    summary: {
      en: 'FCD450 nodular iron rotary vibrator with dual phase-adjustable eccentric counterweights & potted terminal box.',
      id: 'Vibrator putar bodi FCD450 dengan pemberat eksentrik ganda dapat disetel & kotak terminal cor epoksi.',
      ja: 'FCD450ダクタイル鋳鉄フレーム・位相可変偏心ウエイト・防振モールド端子箱。',
    },
    standardTag: 'URAS KEE / IP66',
  },
  {
    id: 'bucket-elevator',
    info: BUCKET_ELEVATOR_3D_INFO,
    parts: BUCKET_ELEVATOR_3D_PARTS,
    shortLabel: {
      en: 'CEMA Centrifugal Bucket Elevator',
      id: 'Bucket Elevator Sentrifugal CEMA',
      ja: 'CEMA 遠心排出バケットエレベータ',
    },
    summary: {
      en: 'Twin-leg enclosed casing, lagged head drive pulley, sprag backstop, wing boot take-up & 14 buckets.',
      id: 'Casing tertutup dua jalur, puli kepala berpelapis karet, rem backstop, puli ekor sayap & 14 bucket.',
      ja: '2列密閉ケーシング・ライニングヘッドプーリ・逆転防止装置・ウィングテールプーリ＆バケット。',
    },
    standardTag: 'CEMA / ISO 7119',
  },
  {
    id: 'apron-conveyor',
    info: APRON_CONVEYOR_3D_INFO,
    parts: APRON_CONVEYOR_3D_PARTS,
    shortLabel: {
      en: 'Heavy-Duty Apron Chain Conveyor',
      id: 'Konveyor Rantai Apron Tugas Berat',
      ja: '重荷重エプロンチェーンコンベヤ',
    },
    summary: {
      en: 'Twin outboard roller chains, 24 overlapping beaded steel pans, skirtboards & helical-bevel gearmotor.',
      id: 'Rantai rol ganda eksternal, 24 pelat apron baja tumpang-tindih, skirtboard & gearmotor heliks-bevel.',
      ja: '両側アウトボードチェーン・24枚オーバーラップ鋼製パン・スカートボード・直交軸ギヤモータ。',
    },
    standardTag: 'CEMA / DIN 8175',
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
        <div className="glass-panel flex flex-col gap-2 rounded-[28px] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--md-on-surface)]">
              {pick(
                'Choose a 3D Machine to Inspect',
                'Pilih Mesin 3D untuk Diinspeksi',
                '点検する3D機械を選択'
              )}
            </h2>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                'Select an assembly to orbit 360°, animate exploded disassembly, and click parts for specifications.',
                'Pilih rakitan untuk memutar 360°, simulasi bongkar-pasang, dan klik bagian untuk info spesifikasi.',
                'アセンブリを選択して360°回転・分解アニメーション・部品クリック仕様確認を行います。'
              )}
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-[var(--md-primary-container)] px-3 py-1 font-mono text-xs font-bold text-[var(--md-on-primary-container)]">
            {MACHINE_CONFIGS.length} {pick('Assemblies', 'Rakitan', 'アセンブリ')}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3" data-tour="m3d-catalog">
          {MACHINE_CONFIGS.map((machine) => (
            <button
              key={machine.id}
              type="button"
              onClick={() => handleSelectMachine(machine.id)}
              className="m3-card glass-card group flex flex-col overflow-hidden rounded-[28px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-primary)]"
            >
              {/* Live 3D Isometric Preview */}
              <div className="relative w-full overflow-hidden border-b border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)]">
                <MachinePreviewCanvas parts={machine.parts} isDark={isDark} />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 font-bold text-[var(--md-on-secondary-container)]">
                      {machine.standardTag}
                    </span>
                    <span className="font-semibold text-[var(--md-on-surface-variant)]">
                      {machine.parts.length} {pick('parts', 'komponen', '部品')}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-extrabold tracking-tight text-[var(--md-on-surface)] transition-colors group-hover:text-[var(--md-primary)]">
                    {machine.shortLabel[language]}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--md-on-surface-variant)]">
                    {machine.summary[language]}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--md-outline-variant)]/45 pt-3.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-primary-container)] px-3.5 py-1.5 font-bold text-[var(--md-on-primary-container)] transition group-hover:bg-[var(--md-primary)] group-hover:text-[var(--md-on-primary)]">
                    {pick('Open 3D Inspector', 'Buka Inspektor 3D', '3Dビューアを開く')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
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
    <div className="overflow-hidden rounded-[28px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-sm">
      {/* Integrated Top Studio Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/55 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={handleBackToPicker}
            className="m3-btn-tonal inline-flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {pick('Choose Machine', 'Pilih Mesin', '機械選択')}
          </button>

          <div className="hidden h-4 w-px bg-[var(--md-outline-variant)]/60 sm:block" />

          <h2 className="truncate text-sm font-extrabold text-[var(--md-on-surface)]">
            {activeInfo.title[language]}
          </h2>
        </div>

        {/* Compact CAD View & Drive Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5" data-tour="m3d-toolbar">
          {/* Camera View Presets */}
          <div className="flex items-center rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-0.5 text-[11px] font-semibold">
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
                className="rounded-full px-2.5 py-1 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-surface-container-low)] hover:text-[var(--md-on-surface)]"
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setXrayHousing((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              xrayHousing
                ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
            }`}
          >
            <ScanEye className="h-3.5 w-3.5" />
            {pick('X-Ray', 'X-Ray', '透過')}
          </button>

          <button
            type="button"
            onClick={() => setShowCallouts((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              showCallouts
                ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            {pick('Pins', 'Pin', '番号')}
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              autoRotate
                ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            {pick('Orbit', 'Orbit', '回転')}
          </button>

          <div className="flex items-center gap-2 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] px-2.5 py-1">
            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                isRunning
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)]'
              }`}
            >
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {pick('Drive', 'Jalankan', '駆動')}
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
              className="hidden w-16 sm:block"
            />
            <span className="font-mono text-[10px] font-semibold text-[var(--md-on-surface-variant)]">
              {isRunning ? rpm : 0} RPM
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Workspace: 3D Viewport + Integrated Assembly Tree */}
      <div className="grid lg:grid-cols-[1fr_296px]">
        {/* Left: 3D CAD Viewport */}
        <div className="min-w-0" data-tour="m3d-viewport">
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
        <aside className="flex flex-col border-t border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] lg:h-[580px] lg:border-l lg:border-t-0" data-tour="m3d-bom">
          <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick('Assembly Tree', 'Daftar Komponen', '部品ツリー (BOM)')}
            </span>
            <span className="rounded-full bg-[var(--md-primary-container)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--md-on-primary-container)]">
              {activeParts.length}
            </span>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-2">
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
                  className={`group flex cursor-pointer items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-left transition ${
                    isSel
                      ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                      : 'hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          isSel
                            ? 'text-[var(--md-primary)]'
                            : 'text-[var(--md-on-surface-variant)]'
                        }`}
                      >
                        {String(part.bomNumber).padStart(2, '0')}
                      </span>
                      <span
                        className={`truncate text-xs font-semibold ${
                          isSel
                            ? 'text-[var(--md-on-secondary-container)]'
                            : 'text-[var(--md-on-surface)]'
                        }`}
                      >
                        {part.name[language]}
                      </span>
                    </div>
                    <div className="mt-0.5 pl-6 font-mono text-[10px] text-[var(--md-on-surface-variant)] opacity-85">
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
                    className={`shrink-0 rounded-full p-1.5 transition ${
                      isIso
                        ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                        : 'text-[var(--md-on-surface-variant)] opacity-0 hover:bg-[var(--md-primary-container)] hover:text-[var(--md-on-primary-container)] group-hover:opacity-100'
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
