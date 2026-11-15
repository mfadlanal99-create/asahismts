import {
  G_ACCEL,
  mmToM,
  mpaToPa,
  paToMpa,
  shrinkFitContactPressure,
  shrinkFitTorqueCapacity,
  umToM,
} from '../../physics';

export type NominalDiameterMm = 25 | 40 | 50 | 80 | 100;
export type HoleClassId = 'H6' | 'H7' | 'H8';
export type ShaftClassId = 'f7' | 'g6' | 'h6' | 'k6' | 'm6' | 'p6' | 's6';
export type FitCategory = 'clearance' | 'transition' | 'interference';

export interface HoleClassSpec {
  id: HoleClassId;
  itGrade: string;
  labelEn: string;
  labelId: string;
  labelJa: string;
  applicationEn: string;
  applicationId: string;
  applicationJa: string;
}

export interface ShaftClassSpec {
  id: ShaftClassId;
  fitFamily: FitCategory;
  nameEn: string;
  nameId: string;
  nameJa: string;
  applicationEn: string;
  applicationId: string;
  applicationJa: string;
}

export interface DeviationLimitsUm {
  upper: number; // ES or es in µm
  lower: number; // EI or ei in µm
}

export const NOMINAL_DIAMETERS_MM: NominalDiameterMm[] = [25, 40, 50, 80, 100];

export const HOLE_CLASSES: HoleClassSpec[] = [
  {
    id: 'H6',
    itGrade: 'IT6',
    labelEn: 'H6 — High-Precision Bore',
    labelId: 'H6 — Lubang Presisi Tinggi',
    labelJa: 'H6 — 高精度穴 (IT6)',
    applicationEn: 'Precision spindle housings, ground bearing seats, and high-accuracy gears',
    applicationId: 'Rumah spindel presisi, dudukan bantalan gerinda, dan roda gigi akurasi tinggi',
    applicationJa: '精密スピンドルハウジング、研削軸受座、高精度歯車内径',
  },
  {
    id: 'H7',
    itGrade: 'IT7',
    labelEn: 'H7 — Standard Industrial Hole Basis',
    labelId: 'H7 — Basis Lubang Industri Standar',
    labelJa: 'H7 — 標準穴基準はめあい (IT7)',
    applicationEn: 'Universal ISO 286 standard bore reamed or fine-bored for couplings, pulleys & bushings',
    applicationId: 'Standar lubang ISO 286 hasil reamer/bubut halus untuk kopling, puli & bushing',
    applicationJa: 'カップリング、プーリ、ブッシュ用の最も一般的なリーマ・精密ボーリング穴',
  },
  {
    id: 'H8',
    itGrade: 'IT8',
    labelEn: 'H8 — General Machining Bore',
    labelId: 'H8 — Lubang Pemesinan Umum',
    labelJa: 'H8 — 一般機械加工穴 (IT8)',
    applicationEn: 'Standard lathe-bored sleeves, agricultural/conveyor hubs, and wider production tolerances',
    applicationId: 'Selongsong bubut standar, hub konveyor, dan toleransi produksi umum',
    applicationJa: '標準旋盤加工スリーブ、コンベヤハブ、一般公差部品',
  },
];

export const SHAFT_CLASSES: ShaftClassSpec[] = [
  {
    id: 'f7',
    fitFamily: 'clearance',
    nameEn: 'f7 — Close Running Fit',
    nameId: 'f7 — Suaian Putar Longgar',
    nameJa: 'f7 — 動きばめ (普通回転)',
    applicationEn: 'Hydrodynamic journal bearings, gearboxes & greased rotating sleeves with continuous film',
    applicationId: 'Bantalan jurnal hidrodinamik, gearbox & selongsong berputar dengan lapisan pelumas',
    applicationJa: '流体潤滑ジャーナル軸受、油膜を必要とする連続回転スリーブ',
  },
  {
    id: 'g6',
    fitFamily: 'clearance',
    nameEn: 'g6 — Precision Sliding Fit',
    nameId: 'g6 — Suaian Geser Presisi',
    nameJa: 'g6 — 精密滑りばめ',
    applicationEn: 'Clutch sliding hubs, precision guide pins, and valve spools without perceptible play',
    applicationId: 'Hub geser kopling, pin pemandu presisi, dan spool katup tanpa kelonggaran berlebih',
    applicationJa: 'クラッチ摺動ハブ、精密ガイドピン、ガタを嫌うバルブスプール',
  },
  {
    id: 'h6',
    fitFamily: 'clearance',
    nameEn: 'h6 — Locational Clearance Fit',
    nameId: 'h6 — Suaian Pas Lokasi',
    nameJa: 'h6 — 位置決め隙間ばめ',
    applicationEn: 'Hand-assembled couplings, removable bearing rings & keyed collars pushed on by hand',
    applicationId: 'Kopling rakit tangan, cincin bantalan lepas-pasang & kerah berpasak dorong tangan',
    applicationJa: '手組みカップリング、着脱可能な軸受リング、キー付きカラー',
  },
  {
    id: 'k6',
    fitFamily: 'transition',
    nameEn: 'k6 — True Transition Fit',
    nameId: 'k6 — Suaian Transisi (Ketat Ringan)',
    nameJa: 'k6 — 中間ばめ (軽打込み)',
    applicationEn: 'Precision concentric gears, inner bearing rings & keyed pulleys tapped with a soft mallet',
    applicationId: 'Roda gigi konsentris presisi, cincin dalam bantalan & puli berpasak ketuk palu lunak',
    applicationJa: '同心度を要する歯車・プーリ、プラスチックハンマーで軽圧入する軸受内輪',
  },
  {
    id: 'm6',
    fitFamily: 'transition',
    nameEn: 'm6 — Tight Transition / Light Arbor Fit',
    nameId: 'm6 — Suaian Transisi Ketat',
    nameJa: 'm6 — 締り寄り中間ばめ',
    applicationEn: 'Pump impellers, electric motor couplings & cam hubs assembled with an arbor press',
    applicationId: 'Impeler pompa, kopling motor listrik & hub kam yang dipasang dengan pres arbor',
    applicationJa: 'ポンプインペラ、電動機カップリング、ハンドプレス組付け部品',
  },
  {
    id: 'p6',
    fitFamily: 'interference',
    nameEn: 'p6 — Light Press Interference Fit',
    nameId: 'p6 — Suaian Paksa Ringan (Press)',
    nameJa: 'p6 — 軽圧入しまりばめ',
    applicationEn: 'Bronze bushings in housings, permanent collars & hubs requiring hydraulic press or 80°C heat',
    applicationId: 'Bushing perunggu di rumah, kerah permanen & hub dengan pres hidrolik atau pemanas 80°C',
    applicationJa: 'ハウジング内砲金ブッシュ、油圧プレスまたは約80°C加熱組付けハブ',
  },
  {
    id: 's6',
    fitFamily: 'interference',
    nameEn: 's6 — Heavy Thermal Shrink-Fit',
    nameId: 's6 — Suaian Susut Termal Berat (Shrink)',
    nameJa: 's6 — 強しまりばめ (焼きばめ・冷やしばめ)',
    applicationEn: 'Heavy torque transmission without keys, turbine/compressor rotors & railway/gear rims',
    applicationId: 'Transmisi torsi berat tanpa pasak, rotor turbin/kompresor & roda gigi beban kejut',
    applicationJa: 'キーなし高トルク伝達ハブ、タービン・圧縮機ロータ、大型歯車リムの焼きばめ',
  },
];

// ISO 286-2 Deviations in micrometers (µm) indexed by NominalDiameterMm
export const HOLE_DEVIATIONS_UM: Record<
  NominalDiameterMm,
  Record<HoleClassId, DeviationLimitsUm>
> = {
  25: {
    H6: { upper: 13, lower: 0 },
    H7: { upper: 21, lower: 0 },
    H8: { upper: 33, lower: 0 },
  },
  40: {
    H6: { upper: 16, lower: 0 },
    H7: { upper: 25, lower: 0 },
    H8: { upper: 39, lower: 0 },
  },
  50: {
    H6: { upper: 16, lower: 0 },
    H7: { upper: 25, lower: 0 },
    H8: { upper: 39, lower: 0 },
  },
  80: {
    H6: { upper: 19, lower: 0 },
    H7: { upper: 30, lower: 0 },
    H8: { upper: 46, lower: 0 },
  },
  100: {
    H6: { upper: 22, lower: 0 },
    H7: { upper: 35, lower: 0 },
    H8: { upper: 54, lower: 0 },
  },
};

export const SHAFT_DEVIATIONS_UM: Record<
  NominalDiameterMm,
  Record<ShaftClassId, DeviationLimitsUm>
> = {
  25: {
    f7: { upper: -20, lower: -41 },
    g6: { upper: -7, lower: -20 },
    h6: { upper: 0, lower: -13 },
    k6: { upper: 15, lower: 2 },
    m6: { upper: 21, lower: 8 },
    p6: { upper: 35, lower: 22 },
    s6: { upper: 48, lower: 35 },
  },
  40: {
    f7: { upper: -25, lower: -50 },
    g6: { upper: -9, lower: -25 },
    h6: { upper: 0, lower: -16 },
    k6: { upper: 18, lower: 2 },
    m6: { upper: 25, lower: 9 },
    p6: { upper: 42, lower: 26 },
    s6: { upper: 59, lower: 43 },
  },
  50: {
    f7: { upper: -25, lower: -50 },
    g6: { upper: -9, lower: -25 },
    h6: { upper: 0, lower: -16 },
    k6: { upper: 18, lower: 2 },
    m6: { upper: 25, lower: 9 },
    p6: { upper: 42, lower: 26 },
    s6: { upper: 59, lower: 43 },
  },
  80: {
    f7: { upper: -30, lower: -60 },
    g6: { upper: -10, lower: -29 },
    h6: { upper: 0, lower: -19 },
    k6: { upper: 21, lower: 2 },
    m6: { upper: 30, lower: 11 },
    p6: { upper: 51, lower: 32 },
    s6: { upper: 78, lower: 59 },
  },
  100: {
    f7: { upper: -36, lower: -71 },
    g6: { upper: -12, lower: -34 },
    h6: { upper: 0, lower: -22 },
    k6: { upper: 25, lower: 3 },
    m6: { upper: 35, lower: 13 },
    p6: { upper: 59, lower: 37 },
    s6: { upper: 93, lower: 71 },
  },
};

export interface IsoFitCalculationResult {
  nominalMm: NominalDiameterMm;
  holeClass: HoleClassId;
  shaftClass: ShaftClassId;
  engagementLengthMm: number;
  processTempC: number;
  ambientTempC: number;
  // Hole & Shaft deviations (µm)
  ES: number;
  EI: number;
  es: number;
  ei: number;
  holeToleranceUm: number;
  shaftToleranceUm: number;
  // Absolute dimensions (mm)
  holeMaxMm: number;
  holeMinMm: number;
  shaftMaxMm: number;
  shaftMinMm: number;
  // Signed clearance C = Hole - Shaft (µm); negative means interference
  maxClearanceUm: number; // ES - ei
  minClearanceUm: number; // EI - es
  meanClearanceUm: number;
  // Interference δ = Shaft - Hole (µm) = -Clearance
  maxInterferenceUm: number; // es - EI
  minInterferenceUm: number; // ei - ES
  meanInterferenceUm: number;
  effectiveInterferenceUm: number; // max(0, maxInterferenceUm) for worst-case press/shrink design
  fitCategory: FitCategory;
  // Contact pressure & Hydraulic Press Force (steel hub Do/d = 2.0, E = 207 GPa, µ = 0.15)
  contactPressureMeanMpa: number;
  contactPressureMaxMpa: number;
  pressForceMeanKn: number;
  pressForceMaxKn: number;
  pressForceMaxTonnes: number;
  transmissibleTorqueNm: number;
  // Thermal shrink/expansion assembly
  thermalMode: 'induction-hub' | 'cryo-shaft' | 'ambient';
  deltaTempC: number;
  thermalDiameterChangeUm: number; // Δd = α · d · |ΔT| in µm (α = 11.5e-6 /°C)
  safeAssemblyMarginUm: number; // safety clearance needed for drop-in assembly without seizing
  netAssemblyClearanceMinUm: number; // Δd - max(0, maxInterferenceUm)
  requiredTempForDropInC: number; // Target heater °C to clear maxInterferenceUm + safeAssemblyMarginUm
  canDropInWithoutPress: boolean;
}

const STEEL_ALPHA_PER_C = 11.5e-6; // 11.5 µm / (m · °C) = 0.0115 µm / (mm · °C)
const AMBIENT_TEMP_C = 20;
const STEEL_MODULUS_MPA = 207000;
const STEEL_POISSON_NU = 0.3;
const HUB_OUTER_RATIO = 2.0; // Do / d = 2.0 thick-walled steel hub
const PRESS_FRICTION_MU = 0.15; // oiled/light paste steel press-fit coefficient

export function calculateIsoFitAndShrink(
  nominalMm: NominalDiameterMm,
  holeClass: HoleClassId,
  shaftClass: ShaftClassId,
  engagementLengthMm: number,
  processTempC: number
): IsoFitCalculationResult {
  const holeDev = HOLE_DEVIATIONS_UM[nominalMm][holeClass];
  const shaftDev = SHAFT_DEVIATIONS_UM[nominalMm][shaftClass];

  const ES = holeDev.upper;
  const EI = holeDev.lower;
  const es = shaftDev.upper;
  const ei = shaftDev.lower;

  const holeToleranceUm = ES - EI;
  const shaftToleranceUm = es - ei;

  const holeMaxMm = nominalMm + ES / 1000;
  const holeMinMm = nominalMm + EI / 1000;
  const shaftMaxMm = nominalMm + es / 1000;
  const shaftMinMm = nominalMm + ei / 1000;

  const maxClearanceUm = ES - ei;
  const minClearanceUm = EI - es;
  const meanClearanceUm = (maxClearanceUm + minClearanceUm) / 2;

  const maxInterferenceUm = es - EI;
  const minInterferenceUm = ei - ES;
  const meanInterferenceUm = (maxInterferenceUm + minInterferenceUm) / 2;

  let fitCategory: FitCategory = 'transition';
  if (minClearanceUm >= 0) {
    fitCategory = 'clearance';
  } else if (maxClearanceUm <= 0) {
    fitCategory = 'interference';
  }

  // Lamé contact pressure for solid steel shaft & thick steel hub (Do/d = 2.0, E = 207 GPa):
  const effectiveMeanInterferenceUm = Math.max(0, meanInterferenceUm);
  const effectiveMaxInterferenceUm = Math.max(0, maxInterferenceUm);

  const nominalDiameterM = mmToM(nominalMm);
  const nominalRadiusM = nominalDiameterM / 2;
  const hubOuterRadiusM = nominalRadiusM * HUB_OUTER_RATIO;
  const engagementLengthM = mmToM(engagementLengthMm);
  const steelEPa = mpaToPa(STEEL_MODULUS_MPA);

  const contactPressureMeanPa =
    effectiveMeanInterferenceUm > 0
      ? shrinkFitContactPressure(
          umToM(effectiveMeanInterferenceUm),
          nominalRadiusM,
          0,
          hubOuterRadiusM,
          steelEPa,
          STEEL_POISSON_NU,
          steelEPa,
          STEEL_POISSON_NU
        )
      : 0;
  const contactPressureMaxPa =
    effectiveMaxInterferenceUm > 0
      ? shrinkFitContactPressure(
          umToM(effectiveMaxInterferenceUm),
          nominalRadiusM,
          0,
          hubOuterRadiusM,
          steelEPa,
          STEEL_POISSON_NU,
          steelEPa,
          STEEL_POISSON_NU
        )
      : 0;

  const contactPressureMeanMpa = paToMpa(contactPressureMeanPa);
  const contactPressureMaxMpa = paToMpa(contactPressureMaxPa);

  // Hydraulic Press Force F = µ · p · π · d · L (in N -> /1000 for kN)
  const contactAreaM2 = Math.PI * nominalDiameterM * engagementLengthM;
  const pressForceMeanKn =
    (PRESS_FRICTION_MU * contactPressureMeanPa * contactAreaM2) / 1000;
  const pressForceMaxKn =
    (PRESS_FRICTION_MU * contactPressureMaxPa * contactAreaM2) / 1000;
  const pressForceMaxTonnes = pressForceMaxKn / G_ACCEL;

  // Slip torque capacity at mean interference: T = 2 · π · μ · L · R² · p_c
  const transmissibleTorqueNm = shrinkFitTorqueCapacity(
    contactPressureMeanPa,
    nominalRadiusM,
    engagementLengthM,
    PRESS_FRICTION_MU
  );

  // Thermal expansion / contraction relative to 20 °C ambient
  const deltaTempSigned = processTempC - AMBIENT_TEMP_C;
  const deltaTempC = Math.abs(deltaTempSigned);
  const thermalMode: IsoFitCalculationResult['thermalMode'] =
    deltaTempSigned > 1
      ? 'induction-hub'
      : deltaTempSigned < -1
        ? 'cryo-shaft'
        : 'ambient';

  // Δd in µm = α (1/°C) * d (mm) * |ΔT| * 1000 (µm/mm)
  const thermalDiameterChangeUm =
    STEEL_ALPHA_PER_C * nominalMm * deltaTempC * 1000;

  // Practical drop-in assembly safety margin (20 µm + 0.2 µm per mm diameter)
  const safeAssemblyMarginUm = Math.round(15 + nominalMm * 0.2);

  // Net clearance available during thermal assembly at maximum interference condition
  const netAssemblyClearanceMinUm =
    minClearanceUm + thermalDiameterChangeUm;

  // Required induction heater temperature (°C) to open maxInterferenceUm + safeAssemblyMarginUm
  const totalOpeningNeededUm = Math.max(
    0,
    effectiveMaxInterferenceUm + safeAssemblyMarginUm
  );
  const requiredDeltaTC =
    effectiveMaxInterferenceUm > 0
      ? totalOpeningNeededUm / (STEEL_ALPHA_PER_C * nominalMm * 1000)
      : 0;
  const requiredTempForDropInC = Math.round(AMBIENT_TEMP_C + requiredDeltaTC);

  const canDropInWithoutPress =
    fitCategory === 'clearance' ||
    netAssemblyClearanceMinUm >= safeAssemblyMarginUm;

  return {
    nominalMm,
    holeClass,
    shaftClass,
    engagementLengthMm,
    processTempC,
    ambientTempC: AMBIENT_TEMP_C,
    ES,
    EI,
    es,
    ei,
    holeToleranceUm,
    shaftToleranceUm,
    holeMaxMm,
    holeMinMm,
    shaftMaxMm,
    shaftMinMm,
    maxClearanceUm,
    minClearanceUm,
    meanClearanceUm,
    maxInterferenceUm,
    minInterferenceUm,
    meanInterferenceUm,
    effectiveInterferenceUm: effectiveMaxInterferenceUm,
    fitCategory,
    contactPressureMeanMpa,
    contactPressureMaxMpa,
    pressForceMeanKn,
    pressForceMaxKn,
    pressForceMaxTonnes,
    transmissibleTorqueNm,
    thermalMode,
    deltaTempC,
    thermalDiameterChangeUm,
    safeAssemblyMarginUm,
    netAssemblyClearanceMinUm,
    requiredTempForDropInC,
    canDropInWithoutPress,
  };
}
