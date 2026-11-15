import type {
  InstrumentType,
  MicrometerBreakdown,
  PresetPart,
  VernierBreakdown,
} from './caliperTypes';

export const PRESET_PARTS: PresetPart[] = [
  {
    id: 'shaft-od',
    name: 'Pump Shaft OD',
    targetMm: 24.36,
    measurementType: 'OD',
    recommendedInstrument: 'vernier-002',
    description: 'Ground stainless steel pump shaft outer diameter.',
  },
  {
    id: 'bearing-id',
    name: 'Bearing Bore ID',
    targetMm: 32.5,
    measurementType: 'ID',
    recommendedInstrument: 'vernier-005',
    description: '6206-series ball bearing inner race bore diameter.',
  },
  {
    id: 'step-depth',
    name: 'Housing Step Depth',
    targetMm: 14.78,
    measurementType: 'Depth',
    recommendedInstrument: 'vernier-002',
    description: 'Counterbore shoulder depth for mechanical seal seat.',
  },
  {
    id: 'keyway-width',
    name: 'Keyway Width',
    targetMm: 8.04,
    measurementType: 'Width',
    recommendedInstrument: 'vernier-002',
    description: 'DIN 6885 parallel keyway slot width on drive shaft.',
  },
  {
    id: 'dowel-pin',
    name: 'Precision Dowel Pin',
    targetMm: 12.74,
    measurementType: 'OD',
    recommendedInstrument: 'micrometer-001',
    description: 'Hardened alignment dowel pin requiring 0.01 mm inspection.',
  },
  {
    id: 'shim-pack',
    name: 'Gauge Shim Stack',
    targetMm: 6.83,
    measurementType: 'OD',
    recommendedInstrument: 'micrometer-001',
    description: 'Machinery alignment shim stack thickness.',
  },
];

export function getInstrumentConfig(instrument: InstrumentType): {
  label: string;
  shortLabel: string;
  leastCount: 0.02 | 0.05 | 0.01;
  maxMm: number;
} {
  switch (instrument) {
    case 'vernier-002':
      return {
        label: 'Vernier Caliper (0.02 mm)',
        shortLabel: 'Vernier 0.02 mm',
        leastCount: 0.02,
        maxMm: 80,
      };
    case 'vernier-005':
      return {
        label: 'Vernier Caliper (0.05 mm)',
        shortLabel: 'Vernier 0.05 mm',
        leastCount: 0.05,
        maxMm: 80,
      };
    case 'micrometer-001':
      return {
        label: 'Outside Micrometer (0.01 mm)',
        shortLabel: 'Micrometer 0.01 mm',
        leastCount: 0.01,
        maxMm: 25,
      };
  }
}

export function snapToLeastCount(valueMm: number, leastCount: number, maxMm: number): number {
  const clamped = Math.max(0, Math.min(maxMm, valueMm));
  const steps = Math.round(clamped / leastCount);
  return Number((steps * leastCount).toFixed(2));
}

export function getVernierBreakdown(
  observedMm: number,
  leastCount: 0.02 | 0.05
): VernierBreakdown {
  const snapped = Math.max(0, Number((Math.round(observedMm / leastCount) * leastCount).toFixed(2)));
  const msrMm = Math.floor(snapped + 1e-9);
  const remainder = Number((snapped - msrMm).toFixed(2));
  const coincidingDiv = Math.round(remainder / leastCount);
  const numDivisions = leastCount === 0.02 ? 50 : 20;
  const vernierSpanMm = leastCount === 0.02 ? 49 : 39;

  return {
    observedMm: snapped,
    leastCount,
    numDivisions,
    vernierSpanMm,
    msrMm,
    coincidingDiv,
    vernierContributionMm: Number((coincidingDiv * leastCount).toFixed(2)),
  };
}

export function getMicrometerBreakdown(observedMm: number): MicrometerBreakdown {
  const snapped = Math.max(0, Math.min(25, Number((Math.round(observedMm / 0.01) * 0.01).toFixed(2))));
  const totalHundredths = Math.round(snapped * 100);
  const sleeveFullMm = Math.floor(totalHundredths / 100);
  const remHundredths = totalHundredths % 100;
  const hasHalfMm = remHundredths >= 50;
  const thimbleDiv = remHundredths % 50;
  const sleeveMm = sleeveFullMm + (hasHalfMm ? 0.5 : 0);

  return {
    observedMm: snapped,
    leastCount: 0.01,
    sleeveFullMm,
    hasHalfMm,
    sleeveMm,
    thimbleDiv,
    thimbleContributionMm: Number((thimbleDiv * 0.01).toFixed(2)),
  };
}
