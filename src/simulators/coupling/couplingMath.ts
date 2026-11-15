import {
  degToRad,
  engineeringStress,
  mm2ToM2,
  paToMpa,
  radToDeg,
} from '../../physics';
import type {
  BalancingChallenge,
  BalancingSolution,
  ComplexNumber,
  CouplingInspectionInputs,
  CouplingInspectionResult,
  CouplingSpec,
  CouplingType,
  IsoZone,
  PolarVector,
  RiskLevel,
} from './couplingTypes';

export function normalizeDeg(deg: number): number {
  const mod = deg % 360;
  return mod < 0 ? mod + 360 : mod;
}

export function polarToComplex(v: PolarVector): ComplexNumber {
  const rad = degToRad(v.deg);
  return {
    re: v.mag * Math.cos(rad),
    im: v.mag * Math.sin(rad),
  };
}

export function complexToPolar(c: ComplexNumber): PolarVector {
  return {
    mag: Math.hypot(c.re, c.im),
    deg: normalizeDeg(radToDeg(Math.atan2(c.im, c.re))),
  };
}

export function addComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function subComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mulComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function divComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const denom = b.re * b.re + b.im * b.im;
  if (denom < 1e-12) {
    return { re: 0, im: 0 };
  }
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

/**
 * ISO 10816-3 Group 2 (Medium Machines 15-300 kW, Rigid Foundation)
 * Zone A: <= 1.4 mm/s | Zone B: 1.4-2.8 | Zone C: 2.8-4.5 | Zone D: > 4.5
 */
export function classifyIso10816Zone(rmsMmS: number): IsoZone {
  if (rmsMmS <= 1.4) return 'A';
  if (rmsMmS <= 2.8) return 'B';
  if (rmsMmS <= 4.5) return 'C';
  return 'D';
}

export function getIsoZoneMeta(zone: IsoZone): {
  label: string;
  description: string;
  range: string;
} {
  switch (zone) {
    case 'A':
      return {
        label: 'Zone A — Good',
        description: 'Newly commissioned / precision balanced condition.',
        range: '0.0 – 1.4 mm/s',
      };
    case 'B':
      return {
        label: 'Zone B — Satisfactory',
        description: 'Acceptable for unrestricted long-term operation.',
        range: '1.4 – 2.8 mm/s',
      };
    case 'C':
      return {
        label: 'Zone C — Unsatisfactory',
        description: 'Restricted operation; schedule balancing maintenance.',
        range: '2.8 – 4.5 mm/s',
      };
    case 'D':
      return {
        label: 'Zone D — Unacceptable',
        description: 'Severe unbalance; immediate shutdown / correction required.',
        range: '> 4.5 mm/s',
      };
  }
}

export const INITIAL_CHALLENGE: BalancingChallenge = {
  id: 1,
  rpm: 1500,
  rotorRadiusMm: 140,
  v0: { mag: 6.8, deg: 52 },
  alpha: { mag: 0.28, deg: 34 },
  noiseFloor: { mag: 0.24, deg: 140 },
};

export function generateBalancingChallenge(prevId: number): BalancingChallenge {
  const rpmOptions = [1200, 1500, 1800, 3000];
  const rpm = rpmOptions[Math.floor(Math.random() * rpmOptions.length)];
  const v0Mag = Number((4.8 + Math.random() * 5.2).toFixed(1));
  const v0Deg = Math.round(Math.random() * 359);
  const alphaMag = Number((0.18 + Math.random() * 0.22).toFixed(2));
  const alphaDeg = Math.round(15 + Math.random() * 65);
  const noiseMag = Number((0.18 + Math.random() * 0.22).toFixed(2));
  const noiseDeg = Math.round(Math.random() * 359);

  return {
    id: prevId + 1,
    rpm,
    rotorRadiusMm: 140,
    v0: { mag: v0Mag, deg: v0Deg },
    alpha: { mag: alphaMag, deg: alphaDeg },
    noiseFloor: { mag: noiseMag, deg: noiseDeg },
  };
}

export function solveSinglePlaneBalancing(
  challenge: BalancingChallenge,
  trialMassG: number,
  trialAngleDeg: number,
  corrMassG: number,
  corrAngleDeg: number,
  isCorrectionApplied: boolean,
  isTrialInstalled: boolean
): BalancingSolution {
  const v0C = polarToComplex(challenge.v0);
  const alphaC = polarToComplex(challenge.alpha);
  const noiseC = polarToComplex(challenge.noiseFloor);

  const mtC = polarToComplex({ mag: trialMassG, deg: trialAngleDeg });
  const vtTrueC = mulComplex(alphaC, mtC);
  const v1C = addComplex(v0C, vtTrueC);
  const v1 = complexToPolar(v1C);

  const vtC = subComplex(v1C, v0C);
  const vt = complexToPolar(vtC);

  const alphaEstC = divComplex(vtC, mtC);
  const alphaEst = complexToPolar(alphaEstC);

  // Exact correction weight: Mc = -V0 / alpha
  const negV0C: ComplexNumber = { re: -v0C.re, im: -v0C.im };
  const mcC = divComplex(negV0C, alphaEstC);
  const mcPolar = complexToPolar(mcC);

  // Residual vibration when correction weight is installed (trial weight removed)
  const mUserC = polarToComplex({ mag: corrMassG, deg: corrAngleDeg });
  const vResRawC = addComplex(v0C, mulComplex(alphaC, mUserC));
  const vResC = addComplex(vResRawC, noiseC);
  const vRes = complexToPolar(vResC);

  const initialZone = classifyIso10816Zone(challenge.v0.mag);
  const activeMag = isCorrectionApplied
    ? vRes.mag
    : isTrialInstalled
      ? v1.mag
      : challenge.v0.mag;
  const activeZone = classifyIso10816Zone(activeMag);

  const reductionPct =
    challenge.v0.mag > 0
      ? Math.max(
          -100,
          Math.min(100, ((challenge.v0.mag - vRes.mag) / challenge.v0.mag) * 100)
        )
      : 0;

  return {
    v1,
    vt,
    alphaEst,
    mcMag: mcPolar.mag,
    mcDeg: mcPolar.deg,
    vRes,
    initialZone,
    activeZone,
    reductionPct,
  };
}

export const COUPLING_SPECS: Record<CouplingType, CouplingSpec> = {
  jaw: {
    id: 'jaw',
    name: 'Elastomer Jaw Coupling',
    shortName: 'Elastomer Jaw',
    nominalTorqueNm: 340,
    pitchRadiusMm: 45,
    maxParallelMisalignmentMm: 0.38,
    maxAngularMisalignmentDeg: 1.0,
    baseBacklashDeg: 0.45,
    dampingRating: 'High (Polyurethane / Nitrile Spider)',
    lubeRequirement: 'None (Dry Elastomer)',
    summary:
      'Fail-safe torsionally soft coupling using an elastomeric spider between interlocking jaws. Absorbs shock loads and requires no lubrication.',
  },
  gear: {
    id: 'gear',
    name: 'Crowned-Tooth Gear Coupling',
    shortName: 'Gear Coupling',
    nominalTorqueNm: 960,
    pitchRadiusMm: 52,
    maxParallelMisalignmentMm: 0.65,
    maxAngularMisalignmentDeg: 1.5,
    baseBacklashDeg: 0.16,
    dampingRating: 'Low (Torsionally Rigid)',
    lubeRequirement: 'EP Grease / Oil Bath (6-month interval)',
    summary:
      'High-torque-density coupling with crowned external hub teeth engaging internal sleeve teeth. Sensitive to grease starvation and fretting.',
  },
  grid: {
    id: 'grid',
    name: 'Tapered Grid Coupling',
    shortName: 'Grid Coupling',
    nominalTorqueNm: 660,
    pitchRadiusMm: 56,
    maxParallelMisalignmentMm: 0.25,
    maxAngularMisalignmentDeg: 0.5,
    baseBacklashDeg: 0.24,
    dampingRating: 'Moderate (Flexing Steel Grid)',
    lubeRequirement: 'NLGI #2 Coupling Grease',
    summary:
      'Alloy steel serpentine grid flexes across curved hub slots to cushion peak torque shocks while transmitting high power.',
  },
};

/** DIN 6885-1 Parallel Key cross-section (b x h) from shaft diameter d (mm) */
export function getDin6885KeySize(shaftDiameterMm: number): {
  b: number;
  h: number;
} {
  if (shaftDiameterMm <= 30) return { b: 8, h: 7 };
  if (shaftDiameterMm <= 38) return { b: 10, h: 8 };
  if (shaftDiameterMm <= 44) return { b: 12, h: 8 };
  if (shaftDiameterMm <= 50) return { b: 14, h: 9 };
  if (shaftDiameterMm <= 58) return { b: 16, h: 10 };
  if (shaftDiameterMm <= 65) return { b: 18, h: 11 };
  if (shaftDiameterMm <= 75) return { b: 20, h: 12 };
  return { b: 22, h: 14 };
}

export function evaluateCouplingInspection(
  inputs: CouplingInspectionInputs
): CouplingInspectionResult {
  const spec = COUPLING_SPECS[inputs.couplingType];
  const { b: keyWidthMm, h: keyHeightMm } = getDin6885KeySize(
    inputs.shaftDiameterMm
  );

  const wearFrac = Math.max(0, Math.min(1, inputs.elastomerWearPct / 100));
  const elementWearDeg =
    inputs.couplingType === 'jaw'
      ? 4.6 * Math.pow(wearFrac, 1.2)
      : inputs.couplingType === 'grid'
        ? 2.2 * Math.pow(wearFrac, 1.15)
        : 1.8 * Math.pow(wearFrac, 1.2);

  const shaftRadiusMm = Math.max(5, inputs.shaftDiameterMm / 2);
  const keywayPlayDeg = radToDeg(
    Math.atan2(inputs.keywayClearanceMm, shaftRadiusMm)
  );

  const torsionalBacklashDeg =
    spec.baseBacklashDeg + elementWearDeg + keywayPlayDeg;
  const torsionalBacklashArcMin = torsionalBacklashDeg * 60;
  const circumferentialPlayMm =
    degToRad(torsionalBacklashDeg) * spec.pitchRadiusMm;

  const appliedTorque = Math.max(1, inputs.torqueNm);
  const nominalServiceFactor = spec.nominalTorqueNm / appliedTorque;
  const derateFactor = Math.max(
    0.35,
    1 - 0.45 * wearFrac - 0.85 * Math.max(0, inputs.keywayClearanceMm - 0.03)
  );
  const effectiveServiceFactor = nominalServiceFactor * derateFactor;

  // Key shear and crushing stress (DIN 6885 parallel key)
  const tangentialForceN = (appliedTorque * 1000) / shaftRadiusMm;
  const keyLength = Math.max(10, inputs.keyLengthMm);
  const keyShearStressMpa = paToMpa(
    engineeringStress(tangentialForceN, mm2ToM2(keyWidthMm * keyLength))
  );
  const keyCrushingStressMpa = paToMpa(
    engineeringStress(tangentialForceN, mm2ToM2((keyHeightMm / 2) * keyLength))
  );

  // Fretting risk score (0-100): driven by keyway clearance, torque load ratio, and wear
  const clearanceScore = Math.min(
    55,
    Math.max(0, (inputs.keywayClearanceMm - 0.02) / 0.28) * 55
  );
  const loadRatio = appliedTorque / spec.nominalTorqueNm;
  const loadScore = Math.min(25, loadRatio * 20);
  const wearScore = wearFrac * 20;
  const frettingScore = Math.round(
    Math.min(100, clearanceScore + loadScore + wearScore)
  );

  let frettingRisk: RiskLevel = 'Low';
  if (frettingScore >= 70) frettingRisk = 'Critical';
  else if (frettingScore >= 45) frettingRisk = 'High';
  else if (frettingScore >= 22) frettingRisk = 'Moderate';

  let healthStatus: CouplingInspectionResult['healthStatus'] = 'Healthy';
  let recommendation =
    'Coupling backlash, keyway fit, and service factor are within acceptable industrial limits.';

  if (
    effectiveServiceFactor < 1.0 ||
    frettingRisk === 'Critical' ||
    inputs.elastomerWearPct >= 65 ||
    keyShearStressMpa > 90 ||
    keyCrushingStressMpa > 160
  ) {
    healthStatus = 'Action Required';
    if (effectiveServiceFactor < 1.0) {
      recommendation =
        'Effective service factor dropped below 1.0. Replace worn element/coupling or upsize coupling rating immediately.';
    } else if (frettingRisk === 'Critical') {
      recommendation =
        'Severe keyway clearance & cyclic load causing fretting corrosion. Re-machine keyway / fit stepped key and apply anti-fretting paste.';
    } else if (inputs.elastomerWearPct >= 65) {
      recommendation =
        'Excessive element wear detected. Replace spider/grid/sleeve before metal-to-metal jaw or tooth impact occurs.';
    } else {
      recommendation =
        'Key shear or crushing stress exceeds safe C45 key limit. Increase key engagement length or shaft diameter.';
    }
  } else if (
    effectiveServiceFactor < 1.4 ||
    frettingRisk === 'High' ||
    frettingRisk === 'Moderate' ||
    inputs.elastomerWearPct >= 30 ||
    inputs.keywayClearanceMm > 0.08
  ) {
    healthStatus = 'Monitor';
    recommendation =
      'Elevated backlash or keyway micro-play. Schedule inspection at next turnaround, verify hub interference fit, and check lubrication/spider condition.';
  }

  return {
    spec,
    torsionalBacklashDeg,
    torsionalBacklashArcMin,
    circumferentialPlayMm,
    nominalServiceFactor,
    effectiveServiceFactor,
    frettingRisk,
    frettingScore,
    keyWidthMm,
    keyHeightMm,
    keyShearStressMpa,
    keyCrushingStressMpa,
    healthStatus,
    recommendation,
  };
}
