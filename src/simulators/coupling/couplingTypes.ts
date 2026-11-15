export interface PolarVector {
  /** Magnitude (e.g., mm/s RMS or grams) */
  mag: number;
  /** Phase or angular position in degrees [0, 360) */
  deg: number;
}

export interface ComplexNumber {
  re: number;
  im: number;
}

export type BalancingStep = 'initial' | 'trial' | 'correction' | 'verified';

export type IsoZone = 'A' | 'B' | 'C' | 'D';

export interface BalancingChallenge {
  id: number;
  rpm: number;
  rotorRadiusMm: number;
  /** Initial 1X vibration vector V0 (mm/s, deg) */
  v0: PolarVector;
  /** True complex influence coefficient alpha (mm/s per gram) */
  alpha: PolarVector;
  /** Unavoidable background/runout noise vector (mm/s) */
  noiseFloor: PolarVector;
}

export interface BalancingSolution {
  /** V1 = V0 + alpha * m_trial */
  v1: PolarVector;
  /** Vt = V1 - V0 (trial weight effect) */
  vt: PolarVector;
  /** Estimated influence coefficient alpha = Vt / m_trial */
  alphaEst: PolarVector;
  /** Exact correction weight magnitude (g) */
  mcMag: number;
  /** Exact correction weight angle (deg) */
  mcDeg: number;
  /** Residual vibration with user's correction weight installed (and trial removed) */
  vRes: PolarVector;
  /** ISO 10816-3 zone for initial vibration */
  initialZone: IsoZone;
  /** ISO 10816-3 zone for current active run */
  activeZone: IsoZone;
  /** Percentage vibration reduction from V0 to Vres */
  reductionPct: number;
}

export type CouplingType = 'jaw' | 'gear' | 'grid';

export interface CouplingSpec {
  id: CouplingType;
  name: string;
  shortName: string;
  nominalTorqueNm: number;
  pitchRadiusMm: number;
  maxParallelMisalignmentMm: number;
  maxAngularMisalignmentDeg: number;
  baseBacklashDeg: number;
  dampingRating: string;
  lubeRequirement: string;
  summary: string;
}

export interface CouplingInspectionInputs {
  couplingType: CouplingType;
  torqueNm: number;
  keywayClearanceMm: number;
  elastomerWearPct: number;
  shaftDiameterMm: number;
  keyLengthMm: number;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface CouplingInspectionResult {
  spec: CouplingSpec;
  /** Total torsional backlash in degrees */
  torsionalBacklashDeg: number;
  /** Torsional backlash in arc-minutes */
  torsionalBacklashArcMin: number;
  /** Circumferential play at pitch radius (mm) */
  circumferentialPlayMm: number;
  /** Nominal service factor (T_rated / T_applied) */
  nominalServiceFactor: number;
  /** Effective derated service factor accounting for wear & keyway impact */
  effectiveServiceFactor: number;
  /** Fretting corrosion risk level */
  frettingRisk: RiskLevel;
  /** Fretting risk score 0-100 */
  frettingScore: number;
  /** Standard DIN 6885 key width b (mm) */
  keyWidthMm: number;
  /** Standard DIN 6885 key height h (mm) */
  keyHeightMm: number;
  /** Key shear stress (MPa) */
  keyShearStressMpa: number;
  /** Key crushing / bearing stress (MPa) */
  keyCrushingStressMpa: number;
  /** Overall health status */
  healthStatus: 'Healthy' | 'Monitor' | 'Action Required';
  /** Actionable maintenance recommendation */
  recommendation: string;
}
