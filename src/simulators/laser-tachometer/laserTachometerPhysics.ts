export type InstrumentMode = 'laser' | 'stroboscope';

export type PoleCount = 2 | 4 | 6 | 8;

export type DrivePresetId =
  | 'vfd-fan-4p'
  | 'high-speed-pump-2p'
  | 'conveyor-6p'
  | 'heavy-mixer-8p';

export interface DrivePreset {
  id: DrivePresetId;
  label: string;
  labelId: string;
  labelJa: string;
  vfdFreqHz: number;
  poles: PoleCount;
  loadTorquePct: number;
  initialStrobeFpm: number;
}

export const DRIVE_PRESETS: DrivePreset[] = [
  {
    id: 'vfd-fan-4p',
    label: '4P Exhaust Fan (50 Hz)',
    labelId: 'Kipas Exhaust 4P (50 Hz)',
    labelJa: '4P排気ファン (50 Hz)',
    vfdFreqHz: 50,
    poles: 4,
    loadTorquePct: 70,
    initialStrobeFpm: 1461,
  },
  {
    id: 'high-speed-pump-2p',
    label: '2P Centrifugal Pump (60 Hz)',
    labelId: 'Pompa Sentrifugal 2P (60 Hz)',
    labelJa: '2P遠心ポンプ (60 Hz)',
    vfdFreqHz: 60,
    poles: 2,
    loadTorquePct: 80,
    initialStrobeFpm: 3523,
  },
  {
    id: 'conveyor-6p',
    label: '6P VFD Conveyor (35 Hz)',
    labelId: 'Konveyor VFD 6P (35 Hz)',
    labelJa: '6P VFDコンベア (35 Hz)',
    vfdFreqHz: 35,
    poles: 6,
    loadTorquePct: 60,
    initialStrobeFpm: 682,
  },
  {
    id: 'heavy-mixer-8p',
    label: '8P Process Mixer (45 Hz)',
    labelId: 'Mixer Proses 8P (45 Hz)',
    labelJa: '8Pプロセスミキサー (45 Hz)',
    vfdFreqHz: 45,
    poles: 8,
    loadTorquePct: 90,
    initialStrobeFpm: 647,
  },
];

const RATED_SLIP_BY_POLES: Record<PoleCount, number> = {
  2: 0.025,
  4: 0.035,
  6: 0.04,
  8: 0.045,
};

export interface MotorDriveState {
  vfdFreqHz: number;
  poles: PoleCount;
  loadTorquePct: number;
  syncRpm: number;
  rotorRpm: number;
  slipPct: number;
  rps: number;
  omegaRadS: number;
  pulsePeriodMs: number;
}

/**
 * Computes induction motor synchronous speed, slip, and actual rotor kinematics
 * under VFD frequency and mechanical load torque.
 */
export function calculateMotorDrive(
  vfdFreqHz: number,
  poles: PoleCount,
  loadTorquePct: number
): MotorDriveState {
  const clampedFreq = Math.max(10, Math.min(60, vfdFreqHz));
  const clampedLoad = Math.max(0, Math.min(100, loadTorquePct));

  const syncRpm = (120 * clampedFreq) / poles;
  const noLoadSlip = 0.0015;
  const slipFraction =
    noLoadSlip + RATED_SLIP_BY_POLES[poles] * (clampedLoad / 100);
  const slipPct = slipFraction * 100;
  const rotorRpm = syncRpm * (1 - slipFraction);
  const rps = rotorRpm / 60;
  const omegaRadS = (2 * Math.PI * rotorRpm) / 60;
  const pulsePeriodMs = rotorRpm > 0 ? 60000 / rotorRpm : 0;

  return {
    vfdFreqHz: clampedFreq,
    poles,
    loadTorquePct: clampedLoad,
    syncRpm,
    rotorRpm,
    slipPct,
    rps,
    omegaRadS,
    pulsePeriodMs,
  };
}

export type StrobeSyncStatus =
  | 'true-freeze'
  | 'harmonic-multiple'
  | 'sub-harmonic'
  | 'drift-forward'
  | 'drift-backward'
  | 'unlocked';

export interface StrobeAnalysis {
  strobeFpm: number;
  ratio: number;
  syncStatus: StrobeSyncStatus;
  harmonicOrder: number;
  subHarmonicDivisor: number;
  apparentRpm: number;
  phaseDeltaDeg: number;
  apparentImages: number;
  isTrueFundamental: boolean;
}

/**
 * Analyzes stroboscope flash rate (FPM) vs true shaft speed (RPM),
 * detecting 1:1 freeze-frame, 2x/3x harmonic multi-images, sub-harmonic traps,
 * and forward/backward alias drift.
 */
export function analyzeStroboscope(
  rotorRpm: number,
  strobeFpm: number
): StrobeAnalysis {
  const safeRpm = Math.max(1, rotorRpm);
  const safeFpm = Math.max(60, strobeFpm);
  const ratio = safeFpm / safeRpm;

  const rawPhase = ((safeRpm / safeFpm) * 360) % 360;
  const phaseDeltaDeg = ((rawPhase + 540) % 360) - 180;
  const apparentRpm = (phaseDeltaDeg / 360) * safeFpm;

  const nearestHarmonic = Math.max(2, Math.round(ratio));
  const subHarmonicDivisor = Math.max(2, Math.round(safeRpm / safeFpm));

  if (Math.abs(safeFpm - safeRpm) <= 1.2) {
    return {
      strobeFpm: safeFpm,
      ratio,
      syncStatus: 'true-freeze',
      harmonicOrder: 1,
      subHarmonicDivisor: 1,
      apparentRpm: 0,
      phaseDeltaDeg: 0,
      apparentImages: 1,
      isTrueFundamental: true,
    };
  }

  if (
    ratio >= 1.75 &&
    nearestHarmonic <= 4 &&
    Math.abs(safeFpm - nearestHarmonic * safeRpm) <= 2.5 * nearestHarmonic
  ) {
    return {
      strobeFpm: safeFpm,
      ratio,
      syncStatus: 'harmonic-multiple',
      harmonicOrder: nearestHarmonic,
      subHarmonicDivisor: 1,
      apparentRpm: 0,
      phaseDeltaDeg,
      apparentImages: nearestHarmonic,
      isTrueFundamental: false,
    };
  }

  if (
    ratio <= 0.65 &&
    subHarmonicDivisor <= 4 &&
    Math.abs(safeFpm - safeRpm / subHarmonicDivisor) <= 1.5
  ) {
    return {
      strobeFpm: safeFpm,
      ratio,
      syncStatus: 'sub-harmonic',
      harmonicOrder: 1,
      subHarmonicDivisor,
      apparentRpm: 0,
      phaseDeltaDeg: 0,
      apparentImages: 1,
      isTrueFundamental: false,
    };
  }

  if (Math.abs(phaseDeltaDeg) <= 28) {
    return {
      strobeFpm: safeFpm,
      ratio,
      syncStatus: phaseDeltaDeg >= 0 ? 'drift-forward' : 'drift-backward',
      harmonicOrder: 1,
      subHarmonicDivisor: 1,
      apparentRpm,
      phaseDeltaDeg,
      apparentImages: 1,
      isTrueFundamental: false,
    };
  }

  return {
    strobeFpm: safeFpm,
    ratio,
    syncStatus: 'unlocked',
    harmonicOrder: Math.max(1, Math.round(ratio)),
    subHarmonicDivisor: 1,
    apparentRpm,
    phaseDeltaDeg,
    apparentImages: 1,
    isTrueFundamental: false,
  };
}
