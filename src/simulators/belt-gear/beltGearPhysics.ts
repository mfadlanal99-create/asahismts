import {
  beltCentrifugalTension,
  degToRad,
  eulerEytelweinTensionRatio,
  gearTangentialForce,
  kwToW,
  lewisGearBendingStress,
  mmToM,
  paToMpa,
  radToDeg,
  rpmToRadS,
} from '../../physics';

export type DriveMode = 'v-belt' | 'spur-gear';

export type MaintenanceStatus =
  | 'Properly Tensioned'
  | 'Loose'
  | 'Over-tightened';

export type BeltSection = 'Z / 3V' | 'A' | 'B / 5V' | 'C';

export interface BeltSectionSpec {
  id: BeltSection;
  label: string;
  minPulleyMm: number;
  nominalTestForceN: number;
  widthMm: number;
  typicalPowerRange: string;
}

export const BELT_SECTION_SPECS: Record<BeltSection, BeltSectionSpec> = {
  'Z / 3V': {
    id: 'Z / 3V',
    label: 'Z / 3V (Light)',
    minPulleyMm: 67,
    nominalTestForceN: 20,
    widthMm: 10,
    typicalPowerRange: '0.3–4 kW',
  },
  A: {
    id: 'A',
    label: 'A (Medium)',
    minPulleyMm: 80,
    nominalTestForceN: 28,
    widthMm: 13,
    typicalPowerRange: '0.75–7.5 kW',
  },
  'B / 5V': {
    id: 'B / 5V',
    label: 'B / 5V (Heavy)',
    minPulleyMm: 125,
    nominalTestForceN: 35,
    widthMm: 17,
    typicalPowerRange: '2–18 kW',
  },
  C: {
    id: 'C',
    label: 'C (Extra Heavy)',
    minPulleyMm: 200,
    nominalTestForceN: 55,
    widthMm: 22,
    typicalPowerRange: '7.5–45 kW',
  },
};

export interface VBeltParams {
  beltSection: BeltSection;
  d1: number; // Driver pulley diameter (mm)
  d2: number; // Driven pulley diameter (mm)
  centerDistance: number; // Center distance C (mm)
  motorRpm: number; // Input speed N1 (RPM)
  motorKw: number; // Motor power P (kW)
  tensionLevel: number; // % of nominal tension (40 - 170)
  testForceN: number; // Mid-span deflection test force (N)
  misalignmentDeg: number; // Sheave misalignment (deg)
}

export interface VBeltResults {
  speedRatio: number;
  idealOutputRpm: number;
  outputRpm: number;
  beltLengthMm: number;
  spanLengthMm: number;
  wrapAngleDeg: number;
  beltSpeedMs: number;
  inputTorqueNm: number;
  outputTorqueNm: number;
  targetDeflectionMm: number;
  actualDeflectionMm: number;
  nominalTestForceN: number;
  minPulleyMm: number;
  minPulleyWarning: boolean;
  slipPercent: number;
  efficiencyPercent: number;
  radialBearingLoadN: number;
  beltTempC: number;
  vibrationMmS: number;
  noiseDba: number;
  centrifugalWarning: boolean;
  standardBeltDesignation: string;
  standardBeltLengthMm: number;
  beltLengthDeltaMm: number;
  status: MaintenanceStatus;
  misalignmentWarning: boolean;
  diagnosticNote: string;
}

export interface SpurGearParams {
  z1: number; // Driver teeth
  z2: number; // Driven teeth
  moduleMm: number; // Gear module m (mm)
  motorRpm: number; // Input speed N1 (RPM)
  motorKw: number; // Motor power P (kW)
  centerOffsetMm: number; // Center distance adjustment delta C (mm)
}

export interface SpurGearResults {
  speedRatio: number;
  pitchDiameter1Mm: number;
  pitchDiameter2Mm: number;
  standardCenterDistanceMm: number;
  actualCenterDistanceMm: number;
  outputRpm: number;
  pitchLineVelocityMs: number;
  inputTorqueNm: number;
  outputTorqueNm: number;
  backlashMm: number;
  nominalBacklashMm: number;
  efficiencyPercent: number;
  gearTempC: number;
  vibrationMmS: number;
  noiseDba: number;
  tangentialForceN: number;
  normalForceN: number;
  bendingSafetyFactor: number;
  contactSafetyFactor: number;
  toothSafetyStatus: 'Safe (AGMA OK)' | 'Marginal' | 'Overload Risk';
  status: MaintenanceStatus;
  diagnosticNote: string;
}

export const DEFAULT_VBELT_PARAMS: VBeltParams = {
  beltSection: 'B / 5V',
  d1: 140,
  d2: 280,
  centerDistance: 480,
  motorRpm: 1450,
  motorKw: 5.5,
  tensionLevel: 100,
  testForceN: 35,
  misalignmentDeg: 0.1,
};

export const DEFAULT_SPUR_GEAR_PARAMS: SpurGearParams = {
  z1: 20,
  z2: 45,
  moduleMm: 3,
  motorRpm: 1450,
  motorKw: 7.5,
  centerOffsetMm: 0.05,
};

const STANDARD_BELT_LENGTHS_MM = [
  630, 710, 800, 900, 1000, 1120, 1250, 1320, 1400, 1500, 1600, 1700, 1800,
  1900, 2000, 2120, 2240, 2360, 2500, 2650, 2800, 3000, 3150, 3350, 3550,
];

function matchStandardBelt(section: BeltSection, lengthMm: number) {
  let nearest = STANDARD_BELT_LENGTHS_MM[0];
  let bestDiff = Math.abs(lengthMm - nearest);
  for (const candidate of STANDARD_BELT_LENGTHS_MM) {
    const diff = Math.abs(lengthMm - candidate);
    if (diff < bestDiff) {
      bestDiff = diff;
      nearest = candidate;
    }
  }
  const prefix = section === 'Z / 3V' ? 'Z' : section === 'B / 5V' ? 'B' : section;
  const rmaInches = Math.round(nearest / 25.4);
  return {
    standardBeltDesignation: `${prefix}-${nearest} (${prefix}${rmaInches})`,
    standardBeltLengthMm: nearest,
    beltLengthDeltaMm: nearest - lengthMm,
  };
}

export function calculateVBelt(params: VBeltParams): VBeltResults {
  const {
    beltSection,
    d1,
    d2,
    centerDistance,
    motorRpm,
    motorKw,
    tensionLevel,
    testForceN,
    misalignmentDeg,
  } = params;

  const spec = BELT_SECTION_SPECS[beltSection];
  const minPulleyMm = spec.minPulleyMm;
  const minPulleyWarning = d1 < minPulleyMm;
  const nominalTestForceN = spec.nominalTestForceN;

  const minCenter = (d1 + d2) / 2 + 25;
  const C = Math.max(centerDistance, minCenter);

  const speedRatio = d2 / D_SAFE(d1);
  const idealOutputRpm = motorRpm / speedRatio;

  const halfDiff = (d2 - d1) / 2;
  const spanLengthMm = Math.sqrt(Math.max(100, C * C - halfDiff * halfDiff));
  const beltLengthMm =
    2 * C + (Math.PI / 2) * (d1 + d2) + Math.pow(d2 - d1, 2) / (4 * C);

  const sinArg = Math.max(-0.98, Math.min(0.98, (d2 - d1) / (2 * C)));
  const wrapAngleDeg = 180 - 2 * radToDeg(Math.asin(sinArg));

  const omega1 = rpmToRadS(motorRpm);
  const beltSpeedMs = mmToM(d1) * 0.5 * omega1;
  const inputTorqueNm = omega1 > 0 ? kwToW(motorKw) / omega1 : 0;

  // Target deflection using the standard C/64 rule
  const targetDeflectionMm = C / 64;
  // Actual deflection increases when belt is loose (low tensionLevel) and scales with test force
  const actualDeflectionMm =
    targetDeflectionMm *
    (testForceN / nominalTestForceN) *
    (100 / Math.max(25, tensionLevel));

  // Slip calculation: rises sharply when tensionLevel < 85% or wrapAngle < 120 deg
  let slipPercent = 0.5;
  if (tensionLevel < 85) {
    slipPercent += Math.pow((85 - tensionLevel) / 10, 1.45) * 1.4;
  }
  if (wrapAngleDeg < 120) {
    slipPercent += (120 - wrapAngleDeg) * 0.08;
  }
  if (minPulleyWarning) {
    slipPercent += 0.6;
  }
  slipPercent = Math.min(24, Math.max(0.2, slipPercent));

  const outputRpm = idealOutputRpm * (1 - slipPercent / 100);

  // Efficiency drops with slip and sheave misalignment
  const misalignmentLoss = misalignmentDeg * 1.1;
  const efficiencyPercent = Math.max(
    70,
    Math.min(97, 96 - slipPercent * 0.85 - misalignmentLoss)
  );
  const outputTorqueNm =
    inputTorqueNm * speedRatio * (efficiencyPercent / 100);

  // Effective tight+slack side radial load on shaft bearings using Euler-Eytelwein + centrifugal tension (38° V-sheave)
  const effectivePullN = beltSpeedMs > 0.1 ? kwToW(motorKw) / beltSpeedMs : 0;
  const wrapAngleRad = degToRad(wrapAngleDeg);
  const eytelweinRatio = eulerEytelweinTensionRatio(0.28, wrapAngleRad, degToRad(19));
  const centrifugalTensionN = beltCentrifugalTension(0.18, beltSpeedMs);
  const minRequiredTensionSumN =
    effectivePullN * ((eytelweinRatio + 1) / Math.max(0.1, eytelweinRatio - 1)) +
    2 * centrifugalTensionN;
  const appliedTensionSumN = (tensionLevel / 100) * 1.25 * minRequiredTensionSumN;
  const radialBearingLoadN = Math.max(
    effectivePullN,
    appliedTensionSumN * Math.sin(wrapAngleRad / 2)
  );

  // Live Drive Diagnostics
  const beltTempC = Math.min(
    115,
    30 +
      motorKw * 1.1 +
      slipPercent * 3.6 +
      misalignmentDeg * 9.5 +
      (minPulleyWarning ? 13 : 0) +
      (tensionLevel > 125 ? (tensionLevel - 125) * 0.25 : 0)
  );

  const vibrationMmS = Math.min(
    14,
    1.1 +
      misalignmentDeg * 2.9 +
      (tensionLevel > 120 ? (tensionLevel - 120) * 0.09 : 0) +
      (slipPercent > 2.5 ? (slipPercent - 2.5) * 0.28 : 0) +
      (minPulleyWarning ? 0.8 : 0)
  );

  const noiseDba = Math.min(
    98,
    66 +
      slipPercent * 1.35 +
      misalignmentDeg * 5.2 +
      (tensionLevel > 125 ? 4.5 : 0)
  );

  const centrifugalWarning = beltSpeedMs > 25;
  const {
    standardBeltDesignation,
    standardBeltLengthMm,
    beltLengthDeltaMm,
  } = matchStandardBelt(beltSection, beltLengthMm);

  let status: MaintenanceStatus = 'Properly Tensioned';
  let diagnosticNote =
    'Deflection matches C/64 target. Optimal grip and bearing life.';

  if (tensionLevel < 85) {
    status = 'Loose';
    diagnosticNote =
      'Excessive mid-span deflection (> C/64). Belt slip, glazing, and speed loss detected.';
  } else if (tensionLevel > 120) {
    status = 'Over-tightened';
    diagnosticNote =
      'Deflection below C/64 target. Excessive radial bearing load and shaft fatigue risk.';
  }

  const misalignmentWarning = misalignmentDeg > 0.5;
  if (misalignmentWarning && status === 'Properly Tensioned') {
    diagnosticNote =
      'Tension is within C/64 range, but sheave misalignment exceeds 0.5° (sidewall wear risk).';
  } else if (minPulleyWarning && status === 'Properly Tensioned') {
    diagnosticNote = `Driver pulley D₁ (${d1} mm) is below minimum ${minPulleyMm} mm for ${beltSection} — bending fatigue risk.`;
  }

  return {
    speedRatio,
    idealOutputRpm,
    outputRpm,
    beltLengthMm,
    spanLengthMm,
    wrapAngleDeg,
    beltSpeedMs,
    inputTorqueNm,
    outputTorqueNm,
    targetDeflectionMm,
    actualDeflectionMm,
    nominalTestForceN,
    minPulleyMm,
    minPulleyWarning,
    slipPercent,
    efficiencyPercent,
    radialBearingLoadN,
    beltTempC,
    vibrationMmS,
    noiseDba,
    centrifugalWarning,
    standardBeltDesignation,
    standardBeltLengthMm,
    beltLengthDeltaMm,
    status,
    misalignmentWarning,
    diagnosticNote,
  };
}

function D_SAFE(d: number): number {
  return Math.max(1, d);
}

export function calculateSpurGear(params: SpurGearParams): SpurGearResults {
  const { z1, z2, moduleMm, motorRpm, motorKw, centerOffsetMm } = params;

  const pitchDiameter1Mm = moduleMm * z1;
  const pitchDiameter2Mm = moduleMm * z2;
  const standardCenterDistanceMm = (moduleMm * (z1 + z2)) / 2;
  const actualCenterDistanceMm = standardCenterDistanceMm + centerOffsetMm;

  const speedRatio = z2 / z1;
  const outputRpm = motorRpm / speedRatio;
  const omega1 = rpmToRadS(motorRpm);
  const pitchLineVelocityMs = mmToM(pitchDiameter1Mm) * 0.5 * omega1;

  // Standard 20 deg pressure angle involute backlash model
  const nominalBacklashMm = 0.04 * moduleMm;
  const pressureAngleRad = degToRad(20);
  const rawBacklash =
    nominalBacklashMm + 2 * centerOffsetMm * Math.tan(pressureAngleRad);
  const backlashMm = Math.max(0, rawBacklash);

  let status: MaintenanceStatus = 'Properly Tensioned';
  let efficiencyPercent = 98.2;
  let diagnosticNote =
    'Mesh clearance within ISO/AGMA backlash window. Smooth power transfer.';

  if (centerOffsetMm < -0.05 || backlashMm < 0.02 * moduleMm) {
    status = 'Over-tightened';
    efficiencyPercent = 93.5;
    diagnosticNote =
      'Center distance too tight (near-zero backlash). Risk of tooth binding, heat buildup, and scuffing.';
  } else if (centerOffsetMm > 0.45) {
    status = 'Loose';
    efficiencyPercent = 96.4;
    diagnosticNote =
      'Excessive center distance & backlash. Expect gear rattle, shock loads on reversal, and pitch wear.';
  }

  const gearTempC = Math.min(
    115,
    34 +
      motorKw * 1.4 +
      pitchLineVelocityMs * 1.1 +
      (status === 'Over-tightened' ? 28 : status === 'Loose' ? 9 : 0)
  );

  const vibrationMmS = Math.min(
    14,
    1.4 +
      (status === 'Loose'
        ? (centerOffsetMm - 0.35) * 9.0
        : status === 'Over-tightened'
          ? 4.6
          : 0)
  );

  const noiseDba = Math.min(
    98,
    70 +
      pitchLineVelocityMs * 0.45 +
      (status === 'Loose' ? 14 : status === 'Over-tightened' ? 11 : 0)
  );

  const inputTorqueNm = omega1 > 0 ? kwToW(motorKw) / omega1 : 0;
  const outputTorqueNm =
    inputTorqueNm * speedRatio * (efficiencyPercent / 100);

  // AGMA / ISO Tooth Contact & Lewis Bending Safety Calculation
  const tangentialForceN = gearTangentialForce(
    kwToW(motorKw),
    mmToM(pitchDiameter1Mm),
    motorRpm
  );
  const normalForceN = tangentialForceN / Math.cos(pressureAngleRad);
  const faceWidthMm = 10 * moduleMm;
  const lewisY = 0.32;
  const dynamicKv = (6.1 + pitchLineVelocityMs) / 6.1;
  const bendingStressMpa = paToMpa(
    lewisGearBendingStress(
      tangentialForceN * dynamicKv,
      mmToM(faceWidthMm),
      mmToM(moduleMm),
      lewisY
    )
  );
  const meshPenalty =
    status === 'Over-tightened' ? 0.72 : status === 'Loose' ? 0.8 : 1.0;

  const bendingSafetyFactor = Math.min(
    8,
    Math.max(0.4, (240 / Math.max(1, bendingStressMpa)) * meshPenalty)
  );
  const contactSafetyFactor = Math.min(
    6,
    Math.max(
      0.4,
      (Math.sqrt(9500 / Math.max(1, bendingStressMpa * 18)) * meshPenalty)
    )
  );

  const toothSafetyStatus: SpurGearResults['toothSafetyStatus'] =
    bendingSafetyFactor >= 1.5 && contactSafetyFactor >= 1.2
      ? 'Safe (AGMA OK)'
      : bendingSafetyFactor >= 1.1 && contactSafetyFactor >= 1.0
        ? 'Marginal'
        : 'Overload Risk';

  return {
    speedRatio,
    pitchDiameter1Mm,
    pitchDiameter2Mm,
    standardCenterDistanceMm,
    actualCenterDistanceMm,
    outputRpm,
    pitchLineVelocityMs,
    inputTorqueNm,
    outputTorqueNm,
    backlashMm,
    nominalBacklashMm,
    efficiencyPercent,
    gearTempC,
    vibrationMmS,
    noiseDba,
    tangentialForceN,
    normalForceN,
    bendingSafetyFactor,
    contactSafetyFactor,
    toothSafetyStatus,
    status,
    diagnosticNote,
  };
}

export type FaultId =
  | 'loose-slip'
  | 'over-tight'
  | 'misaligned'
  | 'gear-backlash';

export interface DriveFaultScenario {
  id: FaultId;
  title: string;
  titleId: string;
  titleJa: string;
  driveMode: DriveMode;
  symptomSummary: string;
  symptomSummaryId: string;
  symptomSummaryJa: string;
  fixHint: string;
  fixHintId: string;
  fixHintJa: string;
  vBeltPatch?: Partial<VBeltParams>;
  spurPatch?: Partial<SpurGearParams>;
  isResolved: (
    mode: DriveMode,
    vParams: VBeltParams,
    vRes: VBeltResults,
    sRes: SpurGearResults
  ) => boolean;
}

export const DRIVE_FAULTS: DriveFaultScenario[] = [
  {
    id: 'loose-slip',
    title: 'Loose Belt Slip',
    titleId: 'Slip Sabuk Kendur',
    titleJa: 'ベルト緩みスリップ',
    driveMode: 'v-belt',
    symptomSummary:
      'Driven fan is running slow under load, belt temperature is elevated, and mid-span deflection exceeds C/64.',
    symptomSummaryId:
      'Kipas yang digerakkan berputar lambat saat berbeban, suhu sabuk meningkat, dan defleksi tengah bentang melebihi C/64.',
    symptomSummaryJa:
      '負荷時に従動ファンの回転数が低下し、ベルト温度が上昇、スパン中央たわみ量が C/64 を超過しています。',
    fixHint:
      'Switch to V-Belt mode and increase Belt Tension Setting into the 85%–120% nominal window until δ matches C/64.',
    fixHintId:
      'Gunakan mode V-Belt dan naikkan Setelan Ketegangan Sabuk ke rentang nominal 85%–120% hingga δ sesuai C/64.',
    fixHintJa:
      'Vベルトモードで張力設定を適正範囲（85%〜120%）まで上げ、たわみ量 δ を C/64 に合わせてください。',
    vBeltPatch: {
      beltSection: 'B / 5V',
      d1: 140,
      d2: 280,
      centerDistance: 480,
      tensionLevel: 55,
      testForceN: 35,
      misalignmentDeg: 0.2,
    },
    isResolved: (mode, _vp, vRes) =>
      mode === 'v-belt' &&
      vRes.status === 'Properly Tensioned' &&
      vRes.slipPercent < 1.5,
  },
  {
    id: 'over-tight',
    title: 'Over-Tensioned Bearing Overload',
    titleId: 'Beban Berlebih Bantalan (Terlalu Kencang)',
    titleJa: '過張力による軸受過負荷',
    driveMode: 'v-belt',
    symptomSummary:
      'Motor drive-end bearing is running hot with high radial load and mid-span deflection is far below C/64.',
    symptomSummaryId:
      'Bantalan sisi penggerak motor panas dengan beban radial tinggi dan defleksi tengah bentang jauh di bawah C/64.',
    symptomSummaryJa:
      'モータ駆動側軸受が高温でラジアル荷重が過大となり、スパン中央たわみ量が C/64 を大きく下回っています。',
    fixHint:
      'Reduce Belt Tension Setting from over-tightened (>120%) back into the 85%–120% range.',
    fixHintId:
      'Turunkan Setelan Ketegangan Sabuk dari kondisi terlalu kencang (>120%) kembali ke rentang 85%–120%.',
    fixHintJa:
      'ベルト張力設定を過張力状態（>120%）から適正範囲（85%〜120%）へ下げてください。',
    vBeltPatch: {
      beltSection: 'B / 5V',
      d1: 140,
      d2: 280,
      centerDistance: 480,
      tensionLevel: 155,
      testForceN: 35,
      misalignmentDeg: 0.1,
    },
    isResolved: (mode, _vp, vRes) =>
      mode === 'v-belt' && vRes.status === 'Properly Tensioned',
  },
  {
    id: 'misaligned',
    title: 'Angular Sheave Misalignment',
    titleId: 'Ketidaksejajaran Sudut Puli',
    titleJa: 'プーリ角度ミスアライメント',
    driveMode: 'v-belt',
    symptomSummary:
      'Belt sidewalls are fraying with high vibration (mm/s) and squealing noise (dBA), even though tension is nominal.',
    symptomSummaryId:
      'Dinding samping sabuk aus dengan getaran (mm/s) dan suara decit (dBA) tinggi, meski ketegangan nominal.',
    symptomSummaryJa:
      '張力は適正にもかかわらず、ベルト側面の摩耗が進み、振動（mm/s）と鳴き騒音（dBA）が高くなっています。',
    fixHint:
      'Align the driven sheave so Sheave Misalignment is ≤ 0.5° while keeping tension nominal.',
    fixHintId:
      'Sejajarkan puli yang digerakkan hingga Ketidaksejajaran Puli ≤ 0,5° sambil menjaga ketegangan nominal.',
    fixHintJa:
      '張力を適正に保ったまま、プーリのミスアライメントが 0.5° 以下になるよう芯出し調整してください。',
    vBeltPatch: {
      beltSection: 'B / 5V',
      d1: 140,
      d2: 280,
      centerDistance: 480,
      tensionLevel: 100,
      testForceN: 35,
      misalignmentDeg: 1.8,
    },
    isResolved: (mode, vParams, vRes) =>
      mode === 'v-belt' &&
      !vRes.misalignmentWarning &&
      vParams.misalignmentDeg <= 0.5 &&
      vRes.status === 'Properly Tensioned',
  },
  {
    id: 'gear-backlash',
    title: 'Excessive Gear Backlash / Pitting',
    titleId: 'Backlash Roda Gigi Berlebih / Pitting',
    titleJa: '歯車バックラッシ過大・ピッチング',
    driveMode: 'spur-gear',
    symptomSummary:
      'Gearbox exhibits loud rattle on load reversal, elevated vibration, and excessive tooth clearance.',
    symptomSummaryId:
      'Gearbox berbunyi berisik saat pembalikan beban, getaran meningkat, dan celah gigi terlalu besar.',
    symptomSummaryJa:
      '負荷反転時にギアボックスから大きな歯打ち音が発生し、振動と歯面バックラッシが過大になっています。',
    fixHint:
      'Adjust Center Offset (ΔC) toward 0.00–0.20 mm so backlash returns to the optimal ISO/AGMA window.',
    fixHintId:
      'Setel Pergeseran Pusat (ΔC) menuju 0,00–0,20 mm agar backlash kembali ke batas optimal ISO/AGMA.',
    fixHintJa:
      '中心距離オフセット (ΔC) を 0.00〜0.20 mm に調整し、バックラッシを ISO/AGMA 適正範囲へ戻してください。',
    spurPatch: {
      z1: 20,
      z2: 45,
      moduleMm: 3,
      centerOffsetMm: 0.85,
    },
    isResolved: (mode, _vp, _vr, sRes) =>
      mode === 'spur-gear' && sRes.status === 'Properly Tensioned',
  },
];
