export type TestVoltage = 250 | 500 | 1000 | 2500;

export type LeadConnection = 'U-GND' | 'V-GND' | 'W-GND' | 'U-V';

export type MotorConditionId =
  | 'clean-dry'
  | 'humid-contaminated'
  | 'brittle-aged'
  | 'ground-fault';

export type TestPhase = 'idle' | 'charging' | 'testing' | 'discharging';

export interface MotorConditionPreset {
  id: MotorConditionId;
  labelEn: string;
  labelId: string;
  labelJa: string;
  descEn: string;
  descId: string;
  descJa: string;
  /** Steady-state insulation resistance at 40°C (MΩ) */
  rInf40: number;
  /** Absorption resistance scale at 40°C (MΩ) */
  rAbs40: number;
  /** Dielectric absorption exponent (higher = steeper polarization rise) */
  absorptionExp: number;
  /** Capacitive time constant (seconds) */
  tauCapSec: number;
  /** Voltage stress sensitivity factor (0 = linear, >0 = drops at high kV) */
  voltageStressCoeff: number;
  /** Faulted on U phase only (true for single-phase ground fault) */
  faultOnUPhase: boolean;
}

export const TEST_VOLTAGES: TestVoltage[] = [250, 500, 1000, 2500];

export const LEAD_CONNECTIONS: {
  id: LeadConnection;
  label: string;
  descEn: string;
  descId: string;
  descJa: string;
}[] = [
  {
    id: 'U-GND',
    label: 'U – GND',
    descEn: 'Phase U winding to Motor Frame (PE)',
    descId: 'Belitan Fasa U ke Rangka Motor (PE)',
    descJa: 'U相巻線 – モータフレーム (PE)',
  },
  {
    id: 'V-GND',
    label: 'V – GND',
    descEn: 'Phase V winding to Motor Frame (PE)',
    descId: 'Belitan Fasa V ke Rangka Motor (PE)',
    descJa: 'V相巻線 – モータフレーム (PE)',
  },
  {
    id: 'W-GND',
    label: 'W – GND',
    descEn: 'Phase W winding to Motor Frame (PE)',
    descId: 'Belitan Fasa W ke Rangka Motor (PE)',
    descJa: 'W相巻線 – モータフレーム (PE)',
  },
  {
    id: 'U-V',
    label: 'U – V',
    descEn: 'Phase-to-Phase (U to V winding)',
    descId: 'Antar-Fasa (Belitan U ke V)',
    descJa: '相間 (U相 – V相巻線)',
  },
];

export const MOTOR_PRESETS: Record<MotorConditionId, MotorConditionPreset> = {
  'clean-dry': {
    id: 'clean-dry',
    labelEn: 'Clean Dry Winding',
    labelId: 'Belitan Bersih & Kering',
    labelJa: '清浄・乾燥巻線',
    descEn: 'Healthy Class F epoxy-mica insulation; strong polarization rise (PI > 2.0).',
    descId: 'Isolasi epoksi-mika Kelas F sehat; kenaikan polarisasi kuat (PI > 2,0).',
    descJa: '健全なF種エポキシマイカ絶縁。強い分極上昇（PI > 2.0）。',
    rInf40: 5200,
    rAbs40: 1400,
    absorptionExp: 0.72,
    tauCapSec: 2.2,
    voltageStressCoeff: 0.02,
    faultOnUPhase: false,
  },
  'humid-contaminated': {
    id: 'humid-contaminated',
    labelEn: 'Humid / Contaminated',
    labelId: 'Lembap / Terkontaminasi',
    labelJa: '吸湿・汚損巻線',
    descEn: 'Moisture & conductive dust on end-turns cause high surface leakage & flat PI.',
    descId: 'Kelembapan & debu konduktif menyebabkan arus bocor permukaan tinggi & PI datar.',
    descJa: '湿気や導電性粉塵により表面漏れ電流が増大し、PIが平坦化。',
    rInf40: 19,
    rAbs40: 85,
    absorptionExp: 0.35,
    tauCapSec: 1.5,
    voltageStressCoeff: 0.08,
    faultOnUPhase: false,
  },
  'brittle-aged': {
    id: 'brittle-aged',
    labelEn: 'Brittle Aged Insulation',
    labelId: 'Isolasi Menua & Getas',
    labelJa: '経年劣化・脆化絶縁',
    descEn: 'Thermally aged varnish with micro-voids; marginal PI and drops at 2500 V.',
    descId: 'Pernis menua dengan retakan mikro; PI marginal dan turun pada 2500 V.',
    descJa: '熱劣化ワニスと微細クラック。PIは境界域で、2500V印加時に低下。',
    rInf40: 260,
    rAbs40: 420,
    absorptionExp: 0.42,
    tauCapSec: 1.8,
    voltageStressCoeff: 0.24,
    faultOnUPhase: false,
  },
  'ground-fault': {
    id: 'ground-fault',
    labelEn: 'Direct Ground Fault (U)',
    labelId: 'Gangguan Hubung Tanah (U)',
    labelJa: '地絡故障 (U相)',
    descEn: 'Phase U winding shorted to stator core/frame; V & W remain intact.',
    descId: 'Belitan Fasa U hubung singkat ke inti/rangka stator; V & W masih baik.',
    descJa: 'U相巻線がステータ鉄心・フレームと地絡。V・W相は健全。',
    rInf40: 0.08,
    rAbs40: 0.5,
    absorptionExp: 0.15,
    tauCapSec: 0.4,
    voltageStressCoeff: 0.1,
    faultOnUPhase: true,
  },
};

/**
 * IEEE Std 43 temperature correction factor K_T40 to normalize
 * measured insulation resistance from winding temperature T (°C) to 40°C:
 *   R_c40 = R_T * K_T40, where K_T40 = 0.5^((40 - T)/10) = 2^((T - 40)/10)
 */
export function computeKt40(tempC: number): number {
  return Math.pow(2, (tempC - 40) / 10);
}

/**
 * Compute insulation resistance R(t) in MΩ at elapsed test time tSec (0..600s).
 */
export function computeInsulationResistanceAtTime(
  presetId: MotorConditionId,
  lead: LeadConnection,
  voltage: TestVoltage,
  tempC: number,
  tSec: number
): number {
  const preset = MOTOR_PRESETS[presetId];
  const t = Math.max(0.5, tSec);

  // If ground-fault preset, only leads involving U show the fault; V-GND and W-GND are healthy
  const isFaultedLead =
    preset.faultOnUPhase && (lead === 'U-GND' || lead === 'U-V');

  const effectivePreset =
    preset.faultOnUPhase && !isFaultedLead
      ? MOTOR_PRESETS['clean-dry']
      : preset;

  // Phase-to-phase (U-V) has ~1.18x higher healthy path resistance than phase-to-ground
  const leadFactor = lead === 'U-V' && !isFaultedLead ? 1.18 : lead === 'V-GND' ? 0.96 : lead === 'W-GND' ? 1.03 : 1.0;

  // Voltage stress factor (normalized around 500V)
  const kvRatio = Math.max(0, (voltage - 500) / 2000);
  const stressFactor = Math.max(0.35, 1 - effectivePreset.voltageStressCoeff * kvRatio);

  // Temperature scaling: R_T = R_40 / K_T40 = R_40 * 2^((40 - T)/10)
  const kt40 = computeKt40(tempC);
  const tempScale = 1 / kt40;

  const rInfT = effectivePreset.rInf40 * leadFactor * stressFactor * tempScale;
  const rAbsT = effectivePreset.rAbs40 * leadFactor * stressFactor * tempScale;

  // Currents normalized per unit voltage (conductance in 1/MΩ = μS):
  // 1) Capacitive charging conductance decays exponentially
  const gCap = (1 / Math.max(0.05, rInfT * 0.08)) * Math.exp(-t / effectivePreset.tauCapSec);
  // 2) Dielectric absorption conductance decays as power law (t + 1)^(-n)
  const gAbs = (1 / Math.max(0.05, rAbsT)) * Math.pow(t + 1, -effectivePreset.absorptionExp);
  // 3) Steady conduction / surface leakage conductance
  const gLeak = 1 / Math.max(0.01, rInfT);

  const totalConductance = gCap + gAbs + gLeak;
  const rMeasured = 1 / totalConductance;

  return Math.min(25000, Math.max(0.01, rMeasured));
}

export interface MegohmmeterMetrics {
  rLive: number;
  leakageMicroAmps: number;
  r30s: number;
  r60s: number;
  r600s: number;
  kt40: number;
  rc40: number;
  dar: number;
  pi: number;
  verdict: 'good' | 'questionable' | 'danger';
  ieeeMinMOhm: number;
}

export function computeMegohmmeterMetrics(
  presetId: MotorConditionId,
  lead: LeadConnection,
  voltage: TestVoltage,
  tempC: number,
  elapsedSec: number
): MegohmmeterMetrics {
  const tEval = Math.max(1, elapsedSec);
  const rLive = computeInsulationResistanceAtTime(presetId, lead, voltage, tempC, tEval);
  const r30s = computeInsulationResistanceAtTime(presetId, lead, voltage, tempC, 30);
  const r60s = computeInsulationResistanceAtTime(presetId, lead, voltage, tempC, 60);
  const r600s = computeInsulationResistanceAtTime(presetId, lead, voltage, tempC, 600);

  const kt40 = computeKt40(tempC);
  const rc40 = r60s * kt40;
  const dar = r60s / Math.max(0.01, r30s);
  const pi = r600s / Math.max(0.01, r60s);

  // Leakage current I = V / R (V in Volts, R in MΩ => result in μA)
  const leakageMicroAmps = voltage / Math.max(0.01, rLive);

  // IEEE 43-2013 minimum recommended R_c40 for most AC industrial motors (< 1 kV = 5 MΩ, >= 1 kV = 100 MΩ)
  const ieeeMinMOhm = voltage >= 1000 ? 100 : 5;

  let verdict: 'good' | 'questionable' | 'danger' = 'good';
  if (rc40 < ieeeMinMOhm || pi < 1.0) {
    verdict = 'danger';
  } else if (pi < 2.0 || dar < 1.25) {
    verdict = 'questionable';
  }

  return {
    rLive,
    leakageMicroAmps,
    r30s,
    r60s,
    r600s,
    kt40,
    rc40,
    dar,
    pi,
    verdict,
    ieeeMinMOhm,
  };
}

export function formatResistance(mOhm: number): { value: string; unit: 'MΩ' | 'GΩ' } {
  if (mOhm >= 1000) {
    const gOhm = mOhm / 1000;
    return {
      value: gOhm >= 10 ? gOhm.toFixed(1) : gOhm.toFixed(2),
      unit: 'GΩ',
    };
  }
  if (mOhm >= 100) {
    return { value: mOhm.toFixed(0), unit: 'MΩ' };
  }
  if (mOhm >= 10) {
    return { value: mOhm.toFixed(1), unit: 'MΩ' };
  }
  return { value: mOhm.toFixed(2), unit: 'MΩ' };
}

export function generateResistanceCurve(
  presetId: MotorConditionId,
  lead: LeadConnection,
  voltage: TestVoltage,
  tempC: number
): { tSec: number; rMOhm: number }[] {
  const sampleTimes = [
    1, 2, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480, 540, 600,
  ];
  return sampleTimes.map((tSec) => ({
    tSec,
    rMOhm: computeInsulationResistanceAtTime(presetId, lead, voltage, tempC, tSec),
  }));
}
