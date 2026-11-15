import type { InstrumentType, MeasurementType, PresetPart } from './caliperTypes';

export interface QcBatchPart {
  id: string;
  partNumber: string;
  name: string;
  nominalMm: number;
  upperTolMm: number; // e.g. +0.03
  lowerTolMm: number; // e.g. -0.03
  specLabel: string;
  measurementType: MeasurementType;
  recommendedInstrument: InstrumentType;
  actualMm: number;
}

export interface QcSubmission {
  enteredMm: number;
  verdict: 'PASS' | 'REJECT';
  readingCorrect: boolean;
  verdictCorrect: boolean;
  fullyCorrect: boolean;
}

export function isWithinTolerance(part: QcBatchPart): boolean {
  const minMm = Number((part.nominalMm + part.lowerTolMm).toFixed(4));
  const maxMm = Number((part.nominalMm + part.upperTolMm).toFixed(4));
  return part.actualMm >= minMm - 1e-6 && part.actualMm <= maxMm + 1e-6;
}

export function toPresetPart(part: QcBatchPart): PresetPart {
  return {
    id: part.id,
    name: part.name,
    targetMm: part.actualMm,
    measurementType: part.measurementType,
    recommendedInstrument: part.recommendedInstrument,
    description: `Spec: ${part.specLabel}`,
  };
}

export function createQcBatch(variant = 0): QcBatchPart[] {
  const batches: QcBatchPart[][] = [
    [
      {
        id: 'qc-1',
        partNumber: 'PS-104',
        name: 'Pump Shaft Journal',
        nominalMm: 25.0,
        upperTolMm: 0.03,
        lowerTolMm: -0.03,
        specLabel: 'Ø25.00 ± 0.03 mm',
        measurementType: 'OD',
        recommendedInstrument: 'vernier-002',
        actualMm: 24.98,
      },
      {
        id: 'qc-2',
        partNumber: 'BB-209',
        name: 'Bearing Bore',
        nominalMm: 47.0,
        upperTolMm: 0.025,
        lowerTolMm: 0.0,
        specLabel: 'Ø47.00 +0.025/-0.000 mm',
        measurementType: 'ID',
        recommendedInstrument: 'vernier-002',
        actualMm: 47.04,
      },
      {
        id: 'qc-3',
        partNumber: 'KW-312',
        name: 'Keyway Width',
        nominalMm: 8.0,
        upperTolMm: 0.02,
        lowerTolMm: -0.02,
        specLabel: '8.00 ± 0.02 mm',
        measurementType: 'Width',
        recommendedInstrument: 'micrometer-001',
        actualMm: 8.01,
      },
      {
        id: 'qc-4',
        partNumber: 'RG-408',
        name: 'Retaining Groove Depth',
        nominalMm: 4.2,
        upperTolMm: 0.05,
        lowerTolMm: -0.05,
        specLabel: '4.20 ± 0.05 mm',
        measurementType: 'Depth',
        recommendedInstrument: 'vernier-002',
        actualMm: 4.12,
      },
    ],
    [
      {
        id: 'qc-1',
        partNumber: 'PS-104',
        name: 'Pump Shaft Journal',
        nominalMm: 25.0,
        upperTolMm: 0.03,
        lowerTolMm: -0.03,
        specLabel: 'Ø25.00 ± 0.03 mm',
        measurementType: 'OD',
        recommendedInstrument: 'vernier-002',
        actualMm: 25.06,
      },
      {
        id: 'qc-2',
        partNumber: 'BB-209',
        name: 'Bearing Bore',
        nominalMm: 47.0,
        upperTolMm: 0.025,
        lowerTolMm: 0.0,
        specLabel: 'Ø47.00 +0.025/-0.000 mm',
        measurementType: 'ID',
        recommendedInstrument: 'vernier-002',
        actualMm: 47.02,
      },
      {
        id: 'qc-3',
        partNumber: 'KW-312',
        name: 'Keyway Width',
        nominalMm: 8.0,
        upperTolMm: 0.02,
        lowerTolMm: -0.02,
        specLabel: '8.00 ± 0.02 mm',
        measurementType: 'Width',
        recommendedInstrument: 'micrometer-001',
        actualMm: 7.96,
      },
      {
        id: 'qc-4',
        partNumber: 'RG-408',
        name: 'Retaining Groove Depth',
        nominalMm: 4.2,
        upperTolMm: 0.05,
        lowerTolMm: -0.05,
        specLabel: '4.20 ± 0.05 mm',
        measurementType: 'Depth',
        recommendedInstrument: 'vernier-002',
        actualMm: 4.24,
      },
    ],
  ];

  return batches[variant % batches.length];
}
