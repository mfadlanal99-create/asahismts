export type InspectionSceneId =
  | 'mcc-breaker'
  | 'bearing-housing'
  | 'steam-trap'
  | 'motor-stator';

export type DsRatio = 12 | 30;
export type ThermalPalette = 'ironbow' | 'rainbow';
export type CameraMode = 'spot' | 'thermal';

export type EmissivityPresetId =
  | 'oxidized-steel'
  | 'electrical-tape'
  | 'painted-housing'
  | 'shiny-aluminum';

export interface EmissivityPreset {
  id: EmissivityPresetId;
  emissivity: number;
  labelEn: string;
  labelId: string;
  labelJa: string;
}

export const EMISSIVITY_PRESETS: EmissivityPreset[] = [
  {
    id: 'oxidized-steel',
    emissivity: 0.85,
    labelEn: 'Oxidized Steel (0.85)',
    labelId: 'Baja Teroksidasi (0,85)',
    labelJa: '酸化鋼 (0.85)',
  },
  {
    id: 'electrical-tape',
    emissivity: 0.95,
    labelEn: 'Electrical Tape (0.95)',
    labelId: 'Isolasi Listrik (0,95)',
    labelJa: '絶縁テープ (0.95)',
  },
  {
    id: 'painted-housing',
    emissivity: 0.92,
    labelEn: 'Painted Housing (0.92)',
    labelId: 'Rumah Mesin Dicat (0,92)',
    labelJa: '塗装ハウジング (0.92)',
  },
  {
    id: 'shiny-aluminum',
    emissivity: 0.15,
    labelEn: 'Shiny Aluminum (0.15)',
    labelId: 'Aluminium Mengilap (0,15)',
    labelJa: '光沢アルミ (0.15)',
  },
];

export interface ThermalZone {
  id: string;
  labelEn: string;
  labelId: string;
  labelJa: string;
  cx: number;
  cy: number;
  radiusPx: number;
  tempC: number;
  surfaceEmissivity: number;
}

export interface InspectionScene {
  id: InspectionSceneId;
  labelEn: string;
  labelId: string;
  labelJa: string;
  descEn: string;
  descId: string;
  descJa: string;
  ambientBgTempC: number;
  defaultAimX: number;
  defaultAimY: number;
  minScaleC: number;
  maxScaleC: number;
  zones: ThermalZone[];
}

// Scene coordinate space: x in [40, 560], y in [40, 400] (520 x 360 px = 52 cm x 36 cm)
export const INSPECTION_SCENES: Record<InspectionSceneId, InspectionScene> = {
  'mcc-breaker': {
    id: 'mcc-breaker',
    labelEn: 'MCC Breaker Panel',
    labelId: 'Panel Pemutus MCC',
    labelJa: 'MCC遮断器盤',
    descEn: 'Loose Phase B busbar lug creating an 88 °C localized hotspot.',
    descId: 'Terminal busbar Fasa B longgar menimbulkan titik panas 88 °C.',
    descJa: 'B相ブスバー端子の緩みによる88°Cの局所過熱。',
    ambientBgTempC: 28,
    defaultAimX: 300,
    defaultAimY: 195,
    minScaleC: 25,
    maxScaleC: 95,
    zones: [
      {
        id: 'phase-a',
        labelEn: 'Phase A Lug',
        labelId: 'Terminal Fasa A',
        labelJa: 'A相端子',
        cx: 185,
        cy: 195,
        radiusPx: 26,
        tempC: 42,
        surfaceEmissivity: 0.85,
      },
      {
        id: 'phase-b-hot',
        labelEn: 'Phase B Loose Lug (Hotspot)',
        labelId: 'Terminal Fasa B Longgar (Panas)',
        labelJa: 'B相緩み端子 (過熱点)',
        cx: 300,
        cy: 195,
        radiusPx: 26,
        tempC: 88,
        surfaceEmissivity: 0.85,
      },
      {
        id: 'phase-c',
        labelEn: 'Phase C Lug',
        labelId: 'Terminal Fasa C',
        labelJa: 'C相端子',
        cx: 415,
        cy: 195,
        radiusPx: 26,
        tempC: 41,
        surfaceEmissivity: 0.85,
      },
    ],
  },
  'bearing-housing': {
    id: 'bearing-housing',
    labelEn: 'Pillow-Block Bearing',
    labelId: 'Rumah Bantalan Pillow-Block',
    labelJa: 'ピローブロック軸受',
    descEn: 'Under-lubricated bearing race (94 °C) next to shiny steel shaft (ε = 0.15).',
    descId: 'Lintasan bantalan kurang pelumas (94 °C) di sebelah poros baja mengilap (ε = 0,15).',
    descJa: '潤滑不足の軸受部（94°C）と光沢鋼軸（ε = 0.15）。',
    ambientBgTempC: 30,
    defaultAimX: 300,
    defaultAimY: 215,
    minScaleC: 25,
    maxScaleC: 100,
    zones: [
      {
        id: 'bearing-core',
        labelEn: 'Bearing Race Hotspot',
        labelId: 'Titik Panas Bantalan',
        labelJa: '軸受レース過熱部',
        cx: 300,
        cy: 215,
        radiusPx: 34,
        tempC: 94,
        surfaceEmissivity: 0.92,
      },
      {
        id: 'bearing-foot',
        labelEn: 'Painted Housing',
        labelId: 'Rumah Bantalan Dicat',
        labelJa: '塗装ハウジング',
        cx: 300,
        cy: 270,
        radiusPx: 55,
        tempC: 58,
        surfaceEmissivity: 0.92,
      },
      {
        id: 'shiny-shaft',
        labelEn: 'Polished Steel Shaft',
        labelId: 'Poros Baja Mengilap',
        labelJa: '研磨鋼シャフト',
        cx: 155,
        cy: 215,
        radiusPx: 32,
        tempC: 68,
        surfaceEmissivity: 0.15,
      },
    ],
  },
  'steam-trap': {
    id: 'steam-trap',
    labelEn: 'Steam Trap & Pipe',
    labelId: 'Perangkap Uap & Pipa',
    labelJa: 'スチームトラップ・配管',
    descEn: 'Live 165 °C steam inlet vs 82 °C condensate return; inspect trap body.',
    descId: 'Uap masuk 165 °C vs kondensat keluar 82 °C; periksa bodi trap.',
    descJa: '165°C蒸気入口と82°C復水出口。トラップ本体の診断。',
    ambientBgTempC: 32,
    defaultAimX: 300,
    defaultAimY: 220,
    minScaleC: 30,
    maxScaleC: 170,
    zones: [
      {
        id: 'steam-inlet',
        labelEn: 'Steam Inlet Pipe',
        labelId: 'Pipa Masuk Uap',
        labelJa: '蒸気入口配管',
        cx: 155,
        cy: 220,
        radiusPx: 32,
        tempC: 165,
        surfaceEmissivity: 0.85,
      },
      {
        id: 'trap-body',
        labelEn: 'Steam Trap Body',
        labelId: 'Bodi Steam Trap',
        labelJa: 'トラップ本体',
        cx: 300,
        cy: 220,
        radiusPx: 40,
        tempC: 148,
        surfaceEmissivity: 0.85,
      },
      {
        id: 'condensate-out',
        labelEn: 'Condensate Return',
        labelId: 'Pipa Balik Kondensat',
        labelJa: '復水出口配管',
        cx: 445,
        cy: 220,
        radiusPx: 30,
        tempC: 82,
        surfaceEmissivity: 0.85,
      },
    ],
  },
  'motor-stator': {
    id: 'motor-stator',
    labelEn: 'Motor Stator Frame',
    labelId: 'Rangka Stator Motor',
    labelJa: 'モータステータ外枠',
    descEn: 'Drive-end bearing bell running at 76 °C vs 64 °C ribbed stator frame.',
    descId: 'Tutup bantalan sisi penggerak 76 °C vs rangka stator bersirip 64 °C.',
    descJa: '負荷側ブラケット76°Cと冷却フィン付きフレーム64°C。',
    ambientBgTempC: 29,
    defaultAimX: 385,
    defaultAimY: 220,
    minScaleC: 25,
    maxScaleC: 85,
    zones: [
      {
        id: 'stator-ribs',
        labelEn: 'Stator Cooling Fins',
        labelId: 'Sirip Pendingin Stator',
        labelJa: 'ステータ冷却フィン',
        cx: 265,
        cy: 220,
        radiusPx: 75,
        tempC: 64,
        surfaceEmissivity: 0.92,
      },
      {
        id: 'de-endbell',
        labelEn: 'Drive-End Bearing Bell',
        labelId: 'Tutup Bantalan DE',
        labelJa: '負荷側軸受ブラケット',
        cx: 390,
        cy: 220,
        radiusPx: 34,
        tempC: 76,
        surfaceEmissivity: 0.92,
      },
      {
        id: 'tbox',
        labelEn: 'Terminal Box',
        labelId: 'Kotak Terminal',
        labelJa: '端子箱',
        cx: 265,
        cy: 120,
        radiusPx: 30,
        tempC: 44,
        surfaceEmissivity: 0.92,
      },
    ],
  },
};

/**
 * Sample true surface temperature & emissivity at point (x, y) in scene coordinates.
 */
export function samplePointInScene(
  scene: InspectionScene,
  x: number,
  y: number
): { tempC: number; surfaceEmissivity: number; zoneLabelEn: string } {
  let maxWeight = 0;
  let weightedTemp = scene.ambientBgTempC;
  let surfaceEmissivity = 0.92;
  let zoneLabelEn = 'Ambient Enclosure';

  for (const z of scene.zones) {
    const dist = Math.hypot(x - z.cx, y - z.cy);
    if (dist <= z.radiusPx * 1.45) {
      // Smooth Gaussian-like falloff at zone boundary
      const norm = dist / z.radiusPx;
      const w = norm <= 0.7 ? 1 : Math.exp(-Math.pow((norm - 0.7) / 0.45, 2));
      if (w > maxWeight) {
        maxWeight = w;
        weightedTemp = scene.ambientBgTempC + w * (z.tempC - scene.ambientBgTempC);
        surfaceEmissivity = z.surfaceEmissivity;
        zoneLabelEn = z.labelEn;
      }
    }
  }

  return { tempC: weightedTemp, surfaceEmissivity, zoneLabelEn };
}

export interface IrMeasurementResult {
  spotDiameterCm: number;
  spotRadiusPx: number;
  trueCenterTempC: number;
  spotAvgTrueTempC: number;
  effectiveSurfaceEmissivity: number;
  displayedTempC: number;
  spotErrorC: number;
  emissivityErrorC: number;
  totalErrorC: number;
  targetZoneName: string;
}

/**
 * Compute full IR pyrometer reading including D:S spot averaging and
 * Stefan-Boltzmann emissivity + reflected ambient temperature error.
 */
export function computeIrMeasurement(
  sceneId: InspectionSceneId,
  aimX: number,
  aimY: number,
  distanceCm: number,
  dsRatio: DsRatio,
  instrumentEmissivity: number,
  reflectedTempC: number,
  tapeApplied: boolean
): IrMeasurementResult {
  const scene = INSPECTION_SCENES[sceneId];
  const spotDiameterCm = distanceCm / dsRatio;
  // Scale: 1 cm = 10 px in our 520x360 scene
  const spotRadiusPx = Math.max(3, (spotDiameterCm * 10) / 2);

  const centerSample = samplePointInScene(scene, aimX, aimY);

  // Area-weighted circular sampling over the laser spot (center + 2 concentric rings)
  const offsets: { dx: number; dy: number }[] = [{ dx: 0, dy: 0 }];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    offsets.push({ dx: 0.45 * spotRadiusPx * Math.cos(a), dy: 0.45 * spotRadiusPx * Math.sin(a) });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    offsets.push({ dx: 0.85 * spotRadiusPx * Math.cos(a), dy: 0.85 * spotRadiusPx * Math.sin(a) });
  }

  let sumTemp = 0;
  let sumEps = 0;
  for (const off of offsets) {
    const s = samplePointInScene(scene, aimX + off.dx, aimY + off.dy);
    sumTemp += s.tempC;
    sumEps += s.surfaceEmissivity;
  }

  const spotAvgTrueTempC = sumTemp / offsets.length;
  const effectiveSurfaceEmissivity = tapeApplied
    ? 0.95
    : sumEps / offsets.length;

  // Stefan-Boltzmann Radiometric Equation in Kelvin
  const tSpotK = spotAvgTrueTempC + 273.15;
  const tReflK = reflectedTempC + 273.15;
  const epsSurf = Math.min(1, Math.max(0.05, effectiveSurfaceEmissivity));
  const epsInst = Math.min(1, Math.max(0.1, instrumentEmissivity));

  const wTotal = epsSurf * Math.pow(tSpotK, 4) + (1 - epsSurf) * Math.pow(tReflK, 4);
  const tDispK4 = Math.max(Math.pow(200, 4), (wTotal - (1 - epsInst) * Math.pow(tReflK, 4)) / epsInst);
  const displayedTempC = Math.pow(tDispK4, 0.25) - 273.15;

  const spotErrorC = spotAvgTrueTempC - centerSample.tempC;
  const emissivityErrorC = displayedTempC - spotAvgTrueTempC;
  const totalErrorC = displayedTempC - centerSample.tempC;

  return {
    spotDiameterCm,
    spotRadiusPx,
    trueCenterTempC: centerSample.tempC,
    spotAvgTrueTempC,
    effectiveSurfaceEmissivity,
    displayedTempC,
    spotErrorC,
    emissivityErrorC,
    totalErrorC,
    targetZoneName: centerSample.zoneLabelEn,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rgbHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function tempToPaletteColor(
  tempC: number,
  minC: number,
  maxC: number,
  palette: ThermalPalette
): string {
  const t = Math.min(1, Math.max(0, (tempC - minC) / Math.max(1, maxC - minC)));

  const stops =
    palette === 'ironbow'
      ? [
          { t: 0.0, r: 18, g: 8, b: 64 },
          { t: 0.25, r: 120, g: 20, b: 128 },
          { t: 0.55, r: 225, g: 75, b: 25 },
          { t: 0.82, r: 252, g: 205, b: 55 },
          { t: 1.0, r: 254, g: 249, b: 195 },
        ]
      : [
          { t: 0.0, r: 29, g: 78, b: 216 },
          { t: 0.25, r: 6, g: 182, b: 212 },
          { t: 0.5, r: 34, g: 197, b: 94 },
          { t: 0.75, r: 234, g: 179, b: 8 },
          { t: 1.0, r: 239, g: 68, b: 68 },
        ];

  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i];
    const s1 = stops[i + 1];
    if (t >= s0.t && t <= s1.t) {
      const localT = (t - s0.t) / (s1.t - s0.t);
      return rgbHex(
        lerp(s0.r, s1.r, localT),
        lerp(s0.g, s1.g, localT),
        lerp(s0.b, s1.b, localT)
      );
    }
  }
  const last = stops[stops.length - 1];
  return rgbHex(last.r, last.g, last.b);
}
