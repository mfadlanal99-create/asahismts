import {
  G_ACCEL,
  degToRad,
  radToDeg,
  slingLegTension,
  slingLoadFactor,
} from '../../physics';

export type PresetId = 'pump-skid' | 'heat-exchanger' | 'gearbox-skid' | 'custom';

export type HitchType = 'bridle' | 'choker' | 'basket';

export type SlingWllTonnes = 1.0 | 2.0 | 3.0 | 5.0;

export interface EquipmentPreset {
  id: PresetId;
  name: { en: string; id: string; ja: string };
  subtitle: { en: string; id: string; ja: string };
  massTonnes: number;
  lugSpanM: number;
  defaultCogOffsetPct: number; // % of lugSpan from geometric center (-35 to +35)
  defaultAngleDeg: number;
  defaultHitch: HitchType;
  defaultWll: SlingWllTonnes;
}

export interface HitchSpec {
  id: HitchType;
  label: { en: string; id: string; ja: string };
  shortLabel: { en: string; id: string; ja: string };
  efficiency: number; // 1.0, 0.75, 2.0
  note: { en: string; id: string; ja: string };
}

export interface SlingWllSpec {
  wllTonnes: SlingWllTonnes;
  colorName: { en: string; id: string; ja: string };
  strokeHex: string;
  badgeClass: string;
}

export interface ShackleSpec {
  nominalInch: string;
  pinDiameterMm: number;
  wllTonnes: number;
  modelCode: string;
}

export const EQUIPMENT_PRESETS: EquipmentPreset[] = [
  {
    id: 'pump-skid',
    name: {
      en: '1.8 t Centrifugal Pump Skid',
      id: 'Skid Pompa Sentrifugal 1.8 t',
      ja: '1.8 t 渦巻ポンプスキッド',
    },
    subtitle: {
      en: 'Compact baseplate, slight CoG shift toward drive motor (+5%)',
      id: 'Baseplate kompak, CoG sedikit bergeser ke arah motor (+5%)',
      ja: 'コンパクト共通ベース、駆動モータ側へわずかに重心偏心 (+5%)',
    },
    massTonnes: 1.8,
    lugSpanM: 2.2,
    defaultCogOffsetPct: 5,
    defaultAngleDeg: 60,
    defaultHitch: 'bridle',
    defaultWll: 2.0,
  },
  {
    id: 'heat-exchanger',
    name: {
      en: '4.2 t Heat Exchanger Bundle',
      id: 'Bundel Heat Exchanger 4.2 t',
      ja: '4.2 t 熱交換器チューブバンドル',
    },
    subtitle: {
      en: 'Long symmetric tube bundle, sensitive to choker derating & pinch',
      id: 'Bundel tabung panjang simetris, sensitif faktor choker & gaya jepit',
      ja: '長尺対称チューブバンドル、チョーカー減格と水平圧縮力に注意',
    },
    massTonnes: 4.2,
    lugSpanM: 4.0,
    defaultCogOffsetPct: 0,
    defaultAngleDeg: 45,
    defaultHitch: 'choker',
    defaultWll: 3.0,
  },
  {
    id: 'gearbox-skid',
    name: {
      en: '6.5 t Asymmetric Gearbox & Motor Skid',
      id: 'Skid Gearbox & Motor Asimetris 6.5 t',
      ja: '6.5 t 非対称減速機・モータスキッド',
    },
    subtitle: {
      en: 'Heavy cast-iron reducer shifts CoG -18% toward Left Lug 1',
      id: 'Gearbox besi cor berat menggeser CoG -18% ke arah Lug Kiri 1',
      ja: '重量鋳鉄製減速機により重心が左ラグ1側へ大きく偏心 (-18%)',
    },
    massTonnes: 6.5,
    lugSpanM: 3.2,
    defaultCogOffsetPct: -18,
    defaultAngleDeg: 60,
    defaultHitch: 'bridle',
    defaultWll: 5.0,
  },
  {
    id: 'custom',
    name: {
      en: 'Custom Payload',
      id: 'Beban Kustom',
      ja: 'カスタム吊り荷',
    },
    subtitle: {
      en: 'User-configurable payload mass, CoG offset & rigging geometry',
      id: 'Massa beban, offset CoG & geometri rigging dapat diatur bebas',
      ja: '質量・重心オフセット・玉掛け幾何条件を自由に設定',
    },
    massTonnes: 3.6,
    lugSpanM: 3.0,
    defaultCogOffsetPct: -10,
    defaultAngleDeg: 50,
    defaultHitch: 'bridle',
    defaultWll: 3.0,
  },
];

export const HITCH_SPECS: HitchSpec[] = [
  {
    id: 'bridle',
    label: {
      en: '2-Leg Bridle (1.0×)',
      id: 'Bridle 2-Kaki (1.0×)',
      ja: '2本ストレート吊り (1.0×)',
    },
    shortLabel: {
      en: '2-Leg Bridle',
      id: 'Bridle 2-Kaki',
      ja: '2本吊り (1.0×)',
    },
    efficiency: 1.0,
    note: {
      en: 'Direct eye-to-lug shackle connection; 100% single-leg vertical WLL before angle factor.',
      id: 'Koneksi langsung mata sling ke shackle lug; 100% WLL vertikal sebelum faktor sudut.',
      ja: '吊り耳シャックル直結。角度係数を乗じる前の1脚基本使用荷重は 100% (1.0×)。',
    },
  },
  {
    id: 'choker',
    label: {
      en: 'Choker Hitch (0.75×)',
      id: 'Choker Hitch (0.75×)',
      ja: 'チョーカー吊り (0.75×)',
    },
    shortLabel: {
      en: 'Choker (0.75×)',
      id: 'Choker (0.75×)',
      ja: 'チョーカー (0.75×)',
    },
    efficiency: 0.75,
    note: {
      en: 'Sling chokes through its own eye around cylindrical load; sharp bend derates WLL to 75%.',
      id: 'Sling menjerat melewati matanya sendiri; tekukan tajam menurunkan WLL efektif ke 75%.',
      ja: 'アイ部にスリングを通して絞る目通し吊り。屈曲応力により実効 WLL は 75% (0.75×) に低下。',
    },
  },
  {
    id: 'basket',
    label: {
      en: 'Double Basket (2.0×)',
      id: 'Double Basket (2.0×)',
      ja: 'ダブルバスケット吊り (2.0×)',
    },
    shortLabel: {
      en: 'Basket (2.0×)',
      id: 'Basket (2.0×)',
      ja: 'バスケット (2.0×)',
    },
    efficiency: 2.0,
    note: {
      en: 'Each sling cradles the load in a U-loop with both eyes on the hook; 200% effective WLL per side.',
      id: 'Tiap sling menggendong beban bentuk U (dua mata di hook); 200% WLL efektif per sisi.',
      ja: '各スリングをU字状に掛け両アイをフックへ接続。1側あたり実効 WLL は 200% (2.0×)。',
    },
  },
];

export const SLING_WLL_SPECS: SlingWllSpec[] = [
  {
    wllTonnes: 1.0,
    colorName: { en: 'Violet (EN 1492 1.0 t)', id: 'Ungu (EN 1492 1.0 t)', ja: '紫 (JIS/EN 1.0 t)' },
    strokeHex: '#8b5cf6',
    badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-400/40',
  },
  {
    wllTonnes: 2.0,
    colorName: { en: 'Green (EN 1492 2.0 t)', id: 'Hijau (EN 1492 2.0 t)', ja: '緑 (JIS/EN 2.0 t)' },
    strokeHex: '#10b981',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40',
  },
  {
    wllTonnes: 3.0,
    colorName: { en: 'Yellow (EN 1492 3.0 t)', id: 'Kuning (EN 1492 3.0 t)', ja: '黄 (JIS/EN 3.0 t)' },
    strokeHex: '#eab308',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40',
  },
  {
    wllTonnes: 5.0,
    colorName: { en: 'Red (EN 1492 5.0 t)', id: 'Merah (EN 1492 5.0 t)', ja: '赤 (JIS/EN 5.0 t)' },
    strokeHex: '#ef4444',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/40',
  },
];

export const STANDARD_SHACKLES: ShackleSpec[] = [
  { nominalInch: '3/8"', pinDiameterMm: 11, wllTonnes: 1.0, modelCode: 'G-209 3/8"' },
  { nominalInch: '7/16"', pinDiameterMm: 13, wllTonnes: 1.5, modelCode: 'G-209 7/16"' },
  { nominalInch: '1/2"', pinDiameterMm: 16, wllTonnes: 2.0, modelCode: 'G-209 1/2"' },
  { nominalInch: '5/8"', pinDiameterMm: 19, wllTonnes: 3.25, modelCode: 'G-209 5/8"' },
  { nominalInch: '3/4"', pinDiameterMm: 22, wllTonnes: 4.75, modelCode: 'G-209 3/4"' },
  { nominalInch: '7/8"', pinDiameterMm: 25, wllTonnes: 6.5, modelCode: 'G-209 7/8"' },
  { nominalInch: '1"', pinDiameterMm: 28, wllTonnes: 8.5, modelCode: 'G-209 1"' },
  { nominalInch: '1-1/8"', pinDiameterMm: 32, wllTonnes: 9.5, modelCode: 'G-209 1-1/8"' },
  { nominalInch: '1-1/4"', pinDiameterMm: 35, wllTonnes: 12.0, modelCode: 'G-209 1-1/4"' },
];

export interface RiggingCalculationResult {
  massTonnes: number;
  weightKn: number;
  lugSpanM: number;
  /** Horizontal distance from Lug 1 (left) to CoG (m) */
  d1M: number;
  /** Horizontal distance from Lug 2 (right) to CoG (m) */
  d2M: number;
  /** Nominal horizontal sling angle (deg) */
  nominalAngleDeg: number;
  /** Nominal angle load factor 1 / sin(theta) */
  nominalLoadFactor: number;
  /** Vertical headroom from lug plane to crane hook (m) */
  headroomM: number;
  /** Individual horizontal angles for Leg 1 and Leg 2 (deg) */
  theta1Deg: number;
  theta2Deg: number;
  /** Minimum of theta1Deg and theta2Deg (deg) */
  minThetaDeg: number;
  /** Individual sling lengths L1 and L2 (m) */
  length1M: number;
  length2M: number;
  /** Vertical load shares V1 and V2 (tonnes) */
  v1Tonnes: number;
  v2Tonnes: number;
  /** Actual sling leg tensions T1 and T2 (tonnes & kN) */
  t1Tonnes: number;
  t2Tonnes: number;
  t1Kn: number;
  t2Kn: number;
  /** Horizontal compressive pinch force (tonnes & kN) */
  horizPinchTonnes: number;
  horizPinchKn: number;
  /** Effective single-side WLL after hitch efficiency factor (tonnes) */
  effectiveWllTonnes: number;
  /** Utilization % of effective WLL for Leg 1 and Leg 2 */
  util1Pct: number;
  util2Pct: number;
  maxUtilPct: number;
  /** Hook horizontal offset from CoG (% of lugSpan) */
  hookMisalignmentPct: number;
  /** Hook horizontal offset from CoG (m) */
  hookMisalignmentM: number;
  /** Resulting load tilt angle when lifted with hook misaligned from CoG (deg) */
  loadTiltDeg: number;
  /** Recommended bow shackle based on max leg tension */
  recommendedShackle: ShackleSpec;
  /** Safety flags */
  isAngleDanger: boolean; // < 30 deg
  isAngleCaution: boolean; // >= 30 and < 45 deg
  isWllOverload: boolean; // maxUtilPct > 100
  isTiltWarning: boolean; // |loadTiltDeg| > 2.5 deg
  overallStatus: 'danger' | 'caution' | 'optimal';
}

export function calculateRiggingHoist(params: {
  massTonnes: number;
  lugSpanM: number;
  cogOffsetPct: number; // -35 to +35 (% of lugSpan from midpoint)
  hookPosPct: number; // -35 to +35 (% of lugSpan from midpoint)
  nominalAngleDeg: number; // 25 to 75
  hitchType: HitchType;
  ratedWllTonnes: SlingWllTonnes;
}): RiggingCalculationResult {
  const {
    massTonnes,
    lugSpanM,
    cogOffsetPct,
    hookPosPct,
    nominalAngleDeg,
    hitchType,
    ratedWllTonnes,
  } = params;

  const weightKn = massTonnes * G_ACCEL;

  // Lug 1 is at x = -lugSpanM/2, Lug 2 is at x = +lugSpanM/2
  const halfSpan = lugSpanM / 2;
  const xCog = (cogOffsetPct / 100) * lugSpanM;

  // Distances from Lug 1 and Lug 2 to CoG
  const d1M = Math.max(0.15, halfSpan + xCog);
  const d2M = Math.max(0.15, halfSpan - xCog);

  // Nominal angle multiplier 1 / sin(theta)
  const nominalRad = degToRad(nominalAngleDeg);
  const nominalLoadFactor = slingLoadFactor(nominalAngleDeg);

  // Headroom H determined by nominal angle relative to half-span: H = (lugSpan/2) * tan(theta)
  const headroomM = halfSpan * Math.tan(nominalRad);

  // When lifted in equilibrium, the CoG settles under the hook, or if the rigger sets the hook at xHook
  // before lift-off, the horizontal distances from Lug 1 & Lug 2 to the hook determine the rigged sling geometry,
  // while the mismatch (xHook - xCog) creates a tilt angle!
  const xHook = (hookPosPct / 100) * lugSpanM;
  const hookMisalignmentPct = hookPosPct - cogOffsetPct;
  const hookMisalignmentM = xHook - xCog;

  // Horizontal span from each lug to the crane hook
  const hSpan1 = Math.max(0.15, halfSpan + xHook);
  const hSpan2 = Math.max(0.15, halfSpan - xHook);

  const theta1Rad = Math.atan2(headroomM, hSpan1);
  const theta2Rad = Math.atan2(headroomM, hSpan2);
  const theta1Deg = radToDeg(theta1Rad);
  const theta2Deg = radToDeg(theta2Rad);
  const minThetaDeg = Math.min(theta1Deg, theta2Deg, nominalAngleDeg);

  const length1M = Math.hypot(hSpan1, headroomM);
  const length2M = Math.hypot(hSpan2, headroomM);

  // Vertical load share governed by CoG lever rule (V1 + V2 = W)
  const v1Tonnes = massTonnes * (d2M / lugSpanM);
  const v2Tonnes = massTonnes * (d1M / lugSpanM);

  // Sling leg tensions T1 = V1 / sin(theta1), T2 = V2 / sin(theta2)
  const t1Kn = slingLegTension(v1Tonnes * 1000 * G_ACCEL, 1, theta1Deg) / 1000;
  const t2Kn = slingLegTension(v2Tonnes * 1000 * G_ACCEL, 1, theta2Deg) / 1000;
  const t1Tonnes = t1Kn / G_ACCEL;
  const t2Tonnes = t2Kn / G_ACCEL;

  // Horizontal compressive pinch force (average horizontal component)
  const horiz1Tonnes = v1Tonnes / Math.tan(theta1Rad);
  const horiz2Tonnes = v2Tonnes / Math.tan(theta2Rad);
  const horizPinchTonnes = (horiz1Tonnes + horiz2Tonnes) / 2;
  const horizPinchKn = horizPinchTonnes * G_ACCEL;

  // Hitch efficiency
  const hitchSpec = HITCH_SPECS.find((h) => h.id === hitchType) ?? HITCH_SPECS[0];
  const effectiveWllTonnes = ratedWllTonnes * hitchSpec.efficiency;

  const util1Pct = (t1Tonnes / effectiveWllTonnes) * 100;
  const util2Pct = (t2Tonnes / effectiveWllTonnes) * 100;
  const maxUtilPct = Math.max(util1Pct, util2Pct);

  // Load tilt angle when hook is not aligned over CoG:
  // If hook is to the right of CoG (hookMisalignmentM > 0), the heavy CoG is to the left of the hook,
  // so the left side drops down (counter-clockwise / negative screen rotation or positive tilt readout).
  // Geometrically, the load rotates until the combined CoG-to-hook vector is plumb:
  // tilt ≈ atan2(hookMisalignmentM, headroomM * 0.85) clamped to [-28°, +28°]
  const rawTiltDeg = radToDeg(
    Math.atan2(hookMisalignmentM, Math.max(0.6, headroomM * 0.75))
  );
  const loadTiltDeg = Math.max(-26, Math.min(26, rawTiltDeg));

  const maxLegTonnes = Math.max(t1Tonnes, t2Tonnes);
  const recommendedShackle =
    STANDARD_SHACKLES.find((s) => s.wllTonnes >= maxLegTonnes) ??
    STANDARD_SHACKLES[STANDARD_SHACKLES.length - 1];

  const isAngleDanger = minThetaDeg < 30.05;
  const isAngleCaution = !isAngleDanger && minThetaDeg < 45;
  const isWllOverload = maxUtilPct > 100;
  const isTiltWarning = Math.abs(loadTiltDeg) > 2.0;

  let overallStatus: 'danger' | 'caution' | 'optimal' = 'optimal';
  if (isAngleDanger || isWllOverload || Math.abs(loadTiltDeg) > 8) {
    overallStatus = 'danger';
  } else if (isAngleCaution || maxUtilPct > 85 || isTiltWarning) {
    overallStatus = 'caution';
  }

  return {
    massTonnes,
    weightKn,
    lugSpanM,
    d1M,
    d2M,
    nominalAngleDeg,
    nominalLoadFactor,
    headroomM,
    theta1Deg,
    theta2Deg,
    minThetaDeg,
    length1M,
    length2M,
    v1Tonnes,
    v2Tonnes,
    t1Tonnes,
    t2Tonnes,
    t1Kn,
    t2Kn,
    horizPinchTonnes,
    horizPinchKn,
    effectiveWllTonnes,
    util1Pct,
    util2Pct,
    maxUtilPct,
    hookMisalignmentPct,
    hookMisalignmentM,
    loadTiltDeg,
    recommendedShackle,
    isAngleDanger,
    isAngleCaution,
    isWllOverload,
    isTiltWarning,
    overallStatus,
  };
}
