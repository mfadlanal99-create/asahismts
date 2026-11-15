import {
  rpmToRadS,
  degToRad,
  radToDeg,
  unbalanceMagnificationFactor,
  unbalancePhaseLag,
} from '../../physics';

export type FoundationSupport = 'rigid' | 'flexible';

export type IsoSeverityZone = 'A' | 'B' | 'C' | 'D';

export interface IsoSeverityInfo {
  zone: IsoSeverityZone;
  label: string;
  condition: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  thresholdMin: number;
  thresholdMax: number;
  recommendation: string;
}

export interface HarmonicComponent {
  order: number;
  freqHz: number;
  velocityRms: number;
  displacementUm: number;
  label: string;
}

export interface FftBin {
  freqHz: number;
  amplitudeMmS: number;
  order?: number;
  label?: string;
  isPeak: boolean;
}

export interface BodePoint {
  rpm: number;
  freqHz: number;
  ratio: number;
  amplitudeUm: number;
  velocityRmsMmS: number;
  phaseLagDeg: number;
}

export interface RotorDynamicInputs {
  rpm: number;
  criticalRpm: number;
  dampingRatio: number;
  rotorMassKg: number;
  boltRadiusMm: number;
  initialUnbalanceGmm: number;
  initialPhaseDeg: number;
  correctionMassG: number;
  correctionPhaseDeg: number;
  support: FoundationSupport;
}

export interface RotorDynamicState {
  rpm: number;
  freqHz: number;
  angularSpeedRadS: number;
  frequencyRatio: number;
  criticalRpm: number;
  dampingRatio: number;
  magnificationFactor: number;
  phaseLagDeg: number;
  totalPhaseDeg: number;
  initialUnbalanceGmm: number;
  initialPhaseDeg: number;
  correctionMassG: number;
  correctionUnbalanceGmm: number;
  correctionPhaseDeg: number;
  netUnbalanceGmm: number;
  netPhaseDeg: number;
  eccentricityUm: number;
  displacement1xPeakUm: number;
  displacement1xPkPkUm: number;
  velocity1xRmsMmS: number;
  velocityTotalRmsMmS: number;
  isoZone: IsoSeverityZone;
  isoInfo: IsoSeverityInfo;
  harmonics: HarmonicComponent[];
  fftBins: FftBin[];
}

export interface MachinePreset {
  id: string;
  name: string;
  description: string;
  initialUnbalanceGmm: number;
  initialPhaseDeg: number;
  targetRpm: number;
}

export const MACHINE_PRESETS: MachinePreset[] = [
  {
    id: 'factory-balanced',
    name: 'Precision Balanced (ISO G2.5)',
    description: 'Residual unbalance within ISO 21940-11 Grade G2.5 limit. Low synchronous vibration.',
    initialUnbalanceGmm: 12,
    initialPhaseDeg: 30,
    targetRpm: 1800,
  },
  {
    id: 'moderate-unbalance',
    name: 'Moderate Unbalance (Zone B/C)',
    description: 'Common field condition due to dirt build-up or loose balancing weights.',
    initialUnbalanceGmm: 150,
    initialPhaseDeg: 60,
    targetRpm: 1800,
  },
  {
    id: 'severe-unbalance',
    name: 'Severe Unbalance (Zone D Trip)',
    description: 'Heavy mass eccentricity causing high centrifugal force and dangerous bearing vibration.',
    initialUnbalanceGmm: 360,
    initialPhaseDeg: 135,
    targetRpm: 1800,
  },
  {
    id: 'resonant-speed',
    name: 'Resonance Demonstration',
    description: 'Operating at critical speed (r = 1.0) with high dynamic magnification and 90° phase shift.',
    initialUnbalanceGmm: 90,
    initialPhaseDeg: 90,
    targetRpm: 2100,
  },
];

// ISO 10816-3 / ISO 20816-3 Vibration Severity Limits for Medium Industrial Machines (Class II: 15 kW - 300 kW)
export const ISO_LIMITS = {
  rigid: {
    zoneA: 1.12, // Good (up to 1.12 mm/s RMS)
    zoneB: 2.80, // Acceptable (1.12 to 2.80 mm/s)
    zoneC: 4.50, // Unsatisfactory (2.80 to 4.50 mm/s)
    // Zone D > 4.50 mm/s (Unacceptable / Trip)
  },
  flexible: {
    zoneA: 1.80, // Good (up to 1.80 mm/s RMS)
    zoneB: 4.50, // Acceptable (1.80 to 4.50 mm/s)
    zoneC: 7.10, // Unsatisfactory (4.50 to 7.10 mm/s)
    // Zone D > 7.10 mm/s (Unacceptable / Trip)
  },
} as const;

export function evaluateIsoSeverity(
  vRms: number,
  support: FoundationSupport
): IsoSeverityInfo {
  const limits = ISO_LIMITS[support];

  if (vRms <= limits.zoneA) {
    return {
      zone: 'A',
      label: 'Zone A — Good',
      condition: 'Newly commissioned / pristine condition',
      color: '#10b981', // emerald-500
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      thresholdMin: 0,
      thresholdMax: limits.zoneA,
      recommendation: 'No maintenance action required. Machine is in optimal operating condition.',
    };
  }

  if (vRms <= limits.zoneB) {
    return {
      zone: 'B',
      label: 'Zone B — Acceptable',
      condition: 'Normal long-term unrestricted operation',
      color: '#06b6d4', // cyan-500
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
      badgeText: 'text-cyan-700 dark:text-cyan-300',
      thresholdMin: limits.zoneA,
      thresholdMax: limits.zoneB,
      recommendation: 'Permissible for long-term continuous operation without restriction.',
    };
  }

  if (vRms <= limits.zoneC) {
    return {
      zone: 'C',
      label: 'Zone C — Unsatisfactory',
      condition: 'Restricted operation — maintenance required',
      color: '#f59e0b', // amber-500
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
      badgeText: 'text-amber-700 dark:text-amber-300',
      thresholdMin: limits.zoneB,
      thresholdMax: limits.zoneC,
      recommendation: 'Plan corrective balancing during next scheduled downtime to prevent bearing fatigue.',
    };
  }

  return {
    zone: 'D',
    label: 'Zone D — Unacceptable',
    condition: 'Danger of damage — immediate shutdown',
    color: '#ef4444', // red-500
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeText: 'text-red-700 dark:text-red-300',
    thresholdMin: limits.zoneC,
    thresholdMax: 25.0,
    recommendation: 'High vibration severity! Risk of catastrophic failure. Immediate shutdown required.',
  };
}

/**
 * Computes single-plane rotor dynamic response and vibration telemetry.
 */
export function computeRotorDynamics(inputs: RotorDynamicInputs): RotorDynamicState {
  const {
    rpm,
    criticalRpm,
    dampingRatio,
    rotorMassKg,
    boltRadiusMm,
    initialUnbalanceGmm,
    initialPhaseDeg,
    correctionMassG,
    correctionPhaseDeg,
    support,
  } = inputs;

  const freqHz = rpm / 60;
  const angularSpeedRadS = rpmToRadS(rpm);
  const criticalRadS = rpmToRadS(criticalRpm);
  const frequencyRatio = criticalRadS > 0 ? angularSpeedRadS / criticalRadS : 0;

  // Unbalance vector synthesis (polar to Cartesian)
  const theta0Rad = degToRad(initialPhaseDeg);
  const u0x = initialUnbalanceGmm * Math.cos(theta0Rad);
  const u0y = initialUnbalanceGmm * Math.sin(theta0Rad);

  const correctionUnbalanceGmm = correctionMassG * boltRadiusMm;
  const thetacRad = degToRad(correctionPhaseDeg);
  const ucx = correctionUnbalanceGmm * Math.cos(thetacRad);
  const ucy = correctionUnbalanceGmm * Math.sin(thetacRad);

  // Resultant Net Unbalance
  const netUx = u0x + ucx;
  const netUy = u0y + ucy;
  const netUnbalanceGmm = Math.sqrt(netUx * netUx + netUy * netUy);

  let netPhaseDeg = radToDeg(Math.atan2(netUy, netUx));
  if (netPhaseDeg < 0) netPhaseDeg += 360;

  // Center of mass eccentricity e_u = U_net / M_rotor (in micrometers, um)
  // (g * mm) / (kg * 1000 g/kg) * 1000 um/mm = U_net / M_kg
  const eccentricityUm = rotorMassKg > 0 ? netUnbalanceGmm / rotorMassKg : 0;

  // Dynamic Magnification Factor M(r) and Phase lag phi via dynamics physics engine
  const magnificationFactor = unbalanceMagnificationFactor(frequencyRatio, dampingRatio);
  const phaseLagDeg = radToDeg(unbalancePhaseLag(frequencyRatio, dampingRatio));

  // Total sensor phase angle (strobe/keyphasor relative angle)
  let totalPhaseDeg = (netPhaseDeg - phaseLagDeg) % 360;
  if (totalPhaseDeg < 0) totalPhaseDeg += 360;

  // 1X Synchronous displacement amplitude (peak, zero-to-peak)
  const displacement1xPeakUm = eccentricityUm * magnificationFactor;
  const displacement1xPkPkUm = 2 * displacement1xPeakUm;

  // Synchronous 1X velocity v = omega * X_peak (mm/s peak)
  // displacement in um -> * 1e-3 gives mm
  const velocity1xPeakMmS = angularSpeedRadS * displacement1xPeakUm * 1e-3;
  const velocity1xRmsMmS = velocity1xPeakMmS / Math.SQRT2;

  // Harmonic noise / baseline misalignment & looseness components
  // Real machines have small 2X (misalignment) and 3X (harmonics)
  const v2xRms = velocity1xRmsMmS * 0.12 + 0.18 * (rpm / 3000);
  const v3xRms = velocity1xRmsMmS * 0.05 + 0.08 * (rpm / 3000);
  const noiseFloorRms = 0.15;

  const velocityTotalRmsMmS = Math.sqrt(
    velocity1xRmsMmS * velocity1xRmsMmS +
      v2xRms * v2xRms +
      v3xRms * v3xRms +
      noiseFloorRms * noiseFloorRms
  );

  const harmonics: HarmonicComponent[] = [
    {
      order: 1,
      freqHz: freqHz,
      velocityRms: velocity1xRmsMmS,
      displacementUm: displacement1xPeakUm,
      label: '1X (Unbalance)',
    },
    {
      order: 2,
      freqHz: freqHz * 2,
      velocityRms: v2xRms,
      displacementUm: (v2xRms * Math.SQRT2) / (2 * angularSpeedRadS * 1e-3 || 1),
      label: '2X (Misalignment/Ovality)',
    },
    {
      order: 3,
      freqHz: freqHz * 3,
      velocityRms: v3xRms,
      displacementUm: (v3xRms * Math.SQRT2) / (3 * angularSpeedRadS * 1e-3 || 1),
      label: '3X (Looseness/Harmonic)',
    },
  ];

  // FFT frequency spectrum bins (up to 150 Hz)
  const maxFftHz = 150;
  const stepHz = 1.0;
  const fftBins: FftBin[] = [];

  for (let f = 0; f <= maxFftHz; f += stepHz) {
    let amp = 0.08 + Math.sin(f * 1.7) * 0.02; // noise floor

    // Add peak if near 1X
    const dist1 = Math.abs(f - freqHz);
    if (dist1 < 3) {
      amp += velocity1xRmsMmS * Math.exp(-(dist1 * dist1) / 1.2);
    }
    // Add peak if near 2X
    const dist2 = Math.abs(f - freqHz * 2);
    if (dist2 < 3) {
      amp += v2xRms * Math.exp(-(dist2 * dist2) / 1.2);
    }
    // Add peak if near 3X
    const dist3 = Math.abs(f - freqHz * 3);
    if (dist3 < 3) {
      amp += v3xRms * Math.exp(-(dist3 * dist3) / 1.2);
    }

    const is1xPeak = Math.abs(f - Math.round(freqHz)) < 0.5;
    const is2xPeak = Math.abs(f - Math.round(freqHz * 2)) < 0.5;
    const is3xPeak = Math.abs(f - Math.round(freqHz * 3)) < 0.5;

    let label: string | undefined;
    let order: number | undefined;
    if (is1xPeak) {
      label = '1X RPM';
      order = 1;
    } else if (is2xPeak) {
      label = '2X RPM';
      order = 2;
    } else if (is3xPeak) {
      label = '3X RPM';
      order = 3;
    }

    fftBins.push({
      freqHz: f,
      amplitudeMmS: Math.max(0, amp),
      order,
      label,
      isPeak: is1xPeak || is2xPeak || is3xPeak,
    });
  }

  const isoInfo = evaluateIsoSeverity(velocityTotalRmsMmS, support);

  return {
    rpm,
    freqHz,
    angularSpeedRadS,
    frequencyRatio,
    criticalRpm,
    dampingRatio,
    magnificationFactor,
    phaseLagDeg,
    totalPhaseDeg,
    initialUnbalanceGmm,
    initialPhaseDeg,
    correctionMassG,
    correctionUnbalanceGmm,
    correctionPhaseDeg,
    netUnbalanceGmm,
    netPhaseDeg,
    eccentricityUm,
    displacement1xPeakUm,
    displacement1xPkPkUm,
    velocity1xRmsMmS,
    velocityTotalRmsMmS,
    isoZone: isoInfo.zone,
    isoInfo,
    harmonics,
    fftBins,
  };
}

/**
 * Computes frequency response curve (Bode plot) across RPM 300 to 4500.
 */
export function computeBodeCurve(
  criticalRpm: number,
  dampingRatio: number,
  netUnbalanceGmm: number,
  rotorMassKg: number
): BodePoint[] {
  const points: BodePoint[] = [];
  const minRpm = 300;
  const maxRpm = 4500;
  const stepRpm = 50;
  const criticalRadS = rpmToRadS(criticalRpm);
  const eccentricityUm = rotorMassKg > 0 ? netUnbalanceGmm / rotorMassKg : 0;

  for (let curRpm = minRpm; curRpm <= maxRpm; curRpm += stepRpm) {
    const curRadS = rpmToRadS(curRpm);
    const r = criticalRadS > 0 ? curRadS / criticalRadS : 0;
    const mag = unbalanceMagnificationFactor(r, dampingRatio);
    const ampUm = eccentricityUm * mag;
    const vPeak = curRadS * ampUm * 1e-3;
    const vRms = vPeak / Math.SQRT2;
    const phaseLagDeg = radToDeg(unbalancePhaseLag(r, dampingRatio));

    points.push({
      rpm: curRpm,
      freqHz: curRpm / 60,
      ratio: r,
      amplitudeUm: ampUm,
      velocityRmsMmS: vRms,
      phaseLagDeg,
    });
  }

  return points;
}

/**
 * Calculates exact counter-weight mass & angle to fully cancel initial unbalance.
 */
export function computeIdealCounterWeight(
  initialUnbalanceGmm: number,
  initialPhaseDeg: number,
  boltRadiusMm: number
): { correctionMassG: number; correctionPhaseDeg: number } {
  if (boltRadiusMm <= 0) return { correctionMassG: 0, correctionPhaseDeg: 0 };
  const massG = Number((initialUnbalanceGmm / boltRadiusMm).toFixed(2));
  const phaseDeg = (initialPhaseDeg + 180) % 360;
  return {
    correctionMassG: massG,
    correctionPhaseDeg: phaseDeg,
  };
}

/**
 * Exports vibration test data to downloadable CSV format.
 */
export function exportVibrationDataToCsv(
  state: RotorDynamicState,
  bodePoints: BodePoint[]
): void {
  const lines: string[] = [];
  lines.push('--- ROTOR BALANCING & VIBRATION REPORT (ISO 10816 / ISO 20816) ---');
  lines.push(`Operating Speed (RPM),${state.rpm}`);
  lines.push(`Rotational Frequency (Hz),${state.freqHz.toFixed(2)}`);
  lines.push(`Critical Speed (RPM),${state.criticalRpm}`);
  lines.push(`Frequency Ratio (r),${state.frequencyRatio.toFixed(3)}`);
  lines.push(`Damping Ratio (zeta),${state.dampingRatio}`);
  lines.push(`Initial Unbalance (g*mm),${state.initialUnbalanceGmm.toFixed(1)} @ ${state.initialPhaseDeg}°`);
  lines.push(`Correction Mass (g),${state.correctionMassG.toFixed(2)} @ ${state.correctionPhaseDeg}°`);
  lines.push(`Net Unbalance (g*mm),${state.netUnbalanceGmm.toFixed(2)} @ ${state.netPhaseDeg.toFixed(1)}°`);
  lines.push(`1X Peak-to-Peak Displacement (um),${state.displacement1xPkPkUm.toFixed(2)}`);
  lines.push(`1X Velocity RMS (mm/s),${state.velocity1xRmsMmS.toFixed(3)}`);
  lines.push(`Total Vibration Velocity RMS (mm/s),${state.velocityTotalRmsMmS.toFixed(3)}`);
  lines.push(`ISO Severity Classification,${state.isoInfo.label} (${state.isoInfo.condition})`);
  lines.push('');
  lines.push('--- BODE SWEEP DATA (AMPLITUDE & PHASE VS RPM) ---');
  lines.push('RPM,Frequency (Hz),Frequency Ratio (r),Displacement Amplitude (um),RMS Velocity (mm/s),Phase Lag (deg)');

  bodePoints.forEach((p) => {
    lines.push(
      `${p.rpm},${p.freqHz.toFixed(2)},${p.ratio.toFixed(3)},${p.amplitudeUm.toFixed(2)},${p.velocityRmsMmS.toFixed(3)},${p.phaseLagDeg.toFixed(1)}`
    );
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rotor_vibration_${state.rpm}rpm_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
