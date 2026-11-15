export type InstrumentType = 'vernier-002' | 'vernier-005' | 'micrometer-001';

export type MeasurementType = 'OD' | 'ID' | 'Depth' | 'Width';

export interface PresetPart {
  id: string;
  name: string;
  targetMm: number;
  measurementType: MeasurementType;
  recommendedInstrument: InstrumentType;
  description: string;
}

export interface VernierBreakdown {
  observedMm: number;
  leastCount: 0.02 | 0.05;
  numDivisions: 50 | 20;
  vernierSpanMm: 49 | 39;
  msrMm: number;
  coincidingDiv: number;
  vernierContributionMm: number;
}

export interface MicrometerBreakdown {
  observedMm: number;
  leastCount: 0.01;
  sleeveFullMm: number;
  hasHalfMm: boolean;
  sleeveMm: number;
  thimbleDiv: number;
  thimbleContributionMm: number;
}
