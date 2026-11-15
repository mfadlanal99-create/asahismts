export type FrequencyWeighting = 'dBA' | 'dBC' | 'dBZ';
export type TimeWeighting = 'FAST' | 'SLOW';

export type AcousticSourceId =
  | 'centrifugal-compressor'
  | 'cavitation-pump'
  | 'compressed-air-nozzle'
  | 'gear-reducer-whine'
  | 'electric-motor-fan';

export const OCTAVE_BANDS_HZ = [63, 125, 250, 500, 1000, 2000, 4000, 8000] as const;

// IEC 61672-1 nominal octave-band frequency weightings (dB)
export const A_WEIGHTING_OFFSETS: readonly number[] = [
  -26.2, -16.1, -8.6, -3.2, 0.0, 1.2, 1.0, -1.1,
];

export const C_WEIGHTING_OFFSETS: readonly number[] = [
  -0.8, -0.2, 0.0, 0.0, 0.0, -0.2, -0.8, -3.0,
];

export const Z_WEIGHTING_OFFSETS: readonly number[] = [0, 0, 0, 0, 0, 0, 0, 0];

export interface AcousticSourceSpec {
  id: AcousticSourceId;
  name: string;
  nameId: string;
  nameJa: string;
  /** Unweighted (Z) 8-octave band sound pressure levels at 1.0 m reference (dB re 20 uPa) */
  bandLevels1mZ: readonly [number, number, number, number, number, number, number, number];
  /** Crest / fluctuation amplitude in dB for live meter realism */
  fluctuationDb: number;
  dominantNote: string;
  dominantNoteId: string;
  dominantNoteJa: string;
}

export const ACOUSTIC_SOURCES: AcousticSourceSpec[] = [
  {
    id: 'centrifugal-compressor',
    name: 'Centrifugal Compressor',
    nameId: 'Kompresor Sentrifugal',
    nameJa: '遠心圧縮機',
    bandLevels1mZ: [84, 87, 89, 91, 93, 92, 88, 82],
    fluctuationDb: 1.4,
    dominantNote: 'Broadband aerodynamic + blade-pass tone (1–2 kHz)',
    dominantNoteId: 'Aerodinamis pita lebar + nada bilah (1–2 kHz)',
    dominantNoteJa: '広帯域空力音＋翼通過周波数 (1–2 kHz)',
  },
  {
    id: 'cavitation-pump',
    name: 'Cavitation Pump',
    nameId: 'Pompa Kavitasi',
    nameJa: 'キャビテーションポンプ',
    bandLevels1mZ: [78, 80, 83, 86, 88, 90, 91, 88],
    fluctuationDb: 2.8,
    dominantNote: 'High-frequency vapor bubble collapse crackle (2–8 kHz)',
    dominantNoteId: 'Derak gelembung uap frekuensi tinggi (2–8 kHz)',
    dominantNoteJa: '高周波気泡崩壊クラックル音 (2–8 kHz)',
  },
  {
    id: 'compressed-air-nozzle',
    name: 'Compressed Air Nozzle',
    nameId: 'Nosel Udara Bertekanan',
    nameJa: '圧縮エアノズル',
    bandLevels1mZ: [72, 76, 81, 86, 92, 97, 100, 98],
    fluctuationDb: 1.8,
    dominantNote: 'Severe high-frequency turbulent jet hiss (4–8 kHz)',
    dominantNoteId: 'Desis jet turbulen frekuensi tinggi ekstrem (4–8 kHz)',
    dominantNoteJa: '強烈な高周波乱流ジェット音 (4–8 kHz)',
  },
  {
    id: 'gear-reducer-whine',
    name: 'Gear Reducer Whine',
    nameId: 'Desing Gear Reducer',
    nameJa: '歯車減速機うなり音',
    bandLevels1mZ: [79, 82, 85, 89, 88, 84, 79, 73],
    fluctuationDb: 1.0,
    dominantNote: 'Tonal gear-mesh frequency peak (500–1000 Hz)',
    dominantNoteId: 'Puncak tonal frekuensi gigi (500–1000 Hz)',
    dominantNoteJa: '歯車噛み合い周波数ピーク (500–1000 Hz)',
  },
  {
    id: 'electric-motor-fan',
    name: 'Electric Motor Fan',
    nameId: 'Kipas Motor Listrik',
    nameJa: '電動機冷却ファン',
    bandLevels1mZ: [76, 78, 79, 77, 75, 72, 68, 63],
    fluctuationDb: 0.9,
    dominantNote: 'Low-mid cooling fan airflow & 2x line hum (125–250 Hz)',
    dominantNoteId: 'Aliran udara kipas & dengung 2x jala-jala (125–250 Hz)',
    dominantNoteJa: '冷却ファン気流音・低中域 (125–250 Hz)',
  },
];

export const ENCLOSURE_ATTENUATION_DB = 12;

export function getWeightingOffsets(weighting: FrequencyWeighting): readonly number[] {
  if (weighting === 'dBA') return A_WEIGHTING_OFFSETS;
  if (weighting === 'dBC') return C_WEIGHTING_OFFSETS;
  return Z_WEIGHTING_OFFSETS;
}

/**
 * Energetic (logarithmic) sum of sound pressure levels in dB.
 */
export function sumOctaveBandsDb(levelsDb: readonly number[]): number {
  let linearSum = 0;
  for (const level of levelsDb) {
    linearSum += Math.pow(10, level / 10);
  }
  return 10 * Math.log10(Math.max(linearSum, 1e-12));
}

/**
 * Inverse-square law distance attenuation relative to 1.0 m reference:
 * Delta L = -20 * log10(d / 1.0)
 */
export function computeDistanceAttenuationDb(distanceM: number): number {
  const clamped = Math.max(1, Math.min(15, distanceM));
  return -20 * Math.log10(clamped);
}

export interface ExposureStandardResult {
  criterionDb: number;
  exchangeRateDb: number;
  permissibleHours: number;
  dose8hPercent: number;
  status: 'safe' | 'action' | 'exceeded';
}

export interface DbMeterComputation {
  source: AcousticSourceSpec;
  distanceM: number;
  enclosureActive: boolean;
  weighting: FrequencyWeighting;
  distanceAttenuationDb: number;
  enclosureAttenuationDb: number;
  weightedBandsDb: number[];
  overallSplDb: number;
  equivalentDba: number;
  equivalentDbc: number;
  equivalentDbz: number;
  osha: ExposureStandardResult;
  niosh: ExposureStandardResult;
}

function computeExposureStandard(
  levelDba: number,
  criterionDb: number,
  exchangeRateDb: number,
  actionThresholdDb: number
): ExposureStandardResult {
  const permissibleHours = 8 / Math.pow(2, (levelDba - criterionDb) / exchangeRateDb);
  const dose8hPercent = 100 * Math.pow(2, (levelDba - criterionDb) / exchangeRateDb);
  let status: 'safe' | 'action' | 'exceeded' = 'safe';
  if (levelDba >= criterionDb) {
    status = 'exceeded';
  } else if (levelDba >= actionThresholdDb) {
    status = 'action';
  }
  return {
    criterionDb,
    exchangeRateDb,
    permissibleHours,
    dose8hPercent,
    status,
  };
}

export function computeDbMeterState(
  sourceId: AcousticSourceId,
  distanceM: number,
  enclosureActive: boolean,
  weighting: FrequencyWeighting
): DbMeterComputation {
  const source =
    ACOUSTIC_SOURCES.find((s) => s.id === sourceId) ?? ACOUSTIC_SOURCES[0];
  const distanceAttenuationDb = computeDistanceAttenuationDb(distanceM);
  const enclosureAttenuationDb = enclosureActive ? -ENCLOSURE_ATTENUATION_DB : 0;
  const totalShift = distanceAttenuationDb + enclosureAttenuationDb;

  const bandsA = source.bandLevels1mZ.map(
    (lvl, idx) => lvl + totalShift + A_WEIGHTING_OFFSETS[idx]
  );
  const bandsC = source.bandLevels1mZ.map(
    (lvl, idx) => lvl + totalShift + C_WEIGHTING_OFFSETS[idx]
  );
  const bandsZ = source.bandLevels1mZ.map((lvl) => lvl + totalShift);

  const equivalentDba = sumOctaveBandsDb(bandsA);
  const equivalentDbc = sumOctaveBandsDb(bandsC);
  const equivalentDbz = sumOctaveBandsDb(bandsZ);

  const weightedBandsDb =
    weighting === 'dBA' ? bandsA : weighting === 'dBC' ? bandsC : bandsZ;
  const overallSplDb =
    weighting === 'dBA'
      ? equivalentDba
      : weighting === 'dBC'
        ? equivalentDbc
        : equivalentDbz;

  const osha = computeExposureStandard(equivalentDba, 90, 5, 85);
  const niosh = computeExposureStandard(equivalentDba, 85, 3, 82);

  return {
    source,
    distanceM,
    enclosureActive,
    weighting,
    distanceAttenuationDb,
    enclosureAttenuationDb,
    weightedBandsDb,
    overallSplDb,
    equivalentDba,
    equivalentDbc,
    equivalentDbz,
    osha,
    niosh,
  };
}

export function formatExposureDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours >= 48) {
    return '> 48 h';
  }
  if (hours >= 1) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 60) return `${h + 1}h 00m`;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }
  const totalMinutes = hours * 60;
  if (totalMinutes >= 1) {
    const m = Math.floor(totalMinutes);
    const s = Math.round((totalMinutes - m) * 60);
    if (s === 60) return `${m + 1}m 00s`;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }
  const seconds = Math.max(1, Math.round(hours * 3600));
  return `${seconds} s`;
}
