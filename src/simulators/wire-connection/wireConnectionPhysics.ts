export type TerminationStationId =
  | 'terminal-block'
  | 'motor-lug'
  | 'wire-splice'
  | 'grounding-pe';

export type WireGaugeMm2 = 1.5 | 2.5 | 4 | 6 | 10;

export type TerminationMethodId =
  | 'bare-stranded'
  | 'crimped-ferrule-lug'
  | 'solder-tinned'
  | 'wago-lever'
  | 'twisted-tape';

export type WireFaultId =
  | 'none'
  | 'loose-torque'
  | 'insulation-pinch'
  | 'tinned-creep'
  | 'wrong-washer-order'
  | 'oversized-strip';

export type SafetyVerdict = 'PASS' | 'WARNING' | 'FAIL';

export type WireIssueCode =
  | 'loose-torque'
  | 'over-torque'
  | 'insulation-pinch'
  | 'tinned-creep'
  | 'oversized-strip'
  | 'undersized-strip'
  | 'overcurrent'
  | 'wrong-washer'
  | 'paint-insulation'
  | 'emc-unbonded'
  | 'twisted-tape-prohibited'
  | 'wago-overcurrent'
  | 'pull-out-fail';

export interface WireParams {
  station: TerminationStationId;
  gaugeMm2: WireGaugeMm2;
  method: TerminationMethodId;
  loadCurrentA: number;
  stripLengthMm: number;
  torqueNm: number;
  washerStackCorrect: boolean;
  paintRemoved: boolean;
  emcShieldBonded: boolean;
  faultMode: WireFaultId;
}

export interface WireComputedState {
  contactResistanceMohm: number;
  voltageDropMv: number;
  powerDissipationW: number;
  terminalTempC: number;
  pullOutForceN: number;
  minPullOutForceN: number;
  maxAmpacityA: number;
  recommendedTorqueRange: [number, number];
  recommendedStripRange: [number, number];
  verdict: SafetyVerdict;
  issues: WireIssueCode[];
  thermalSeverity: number;
  arcingActive: boolean;
  pullTestPassed: boolean;
  shockHazard: boolean;
}

export const WIRE_GAUGES: {
  mm2: WireGaugeMm2;
  maxAmpacityA: number;
  minPullOutN: number;
  blockTorque: [number, number];
  lugTorque: [number, number];
  stripRange: [number, number];
}[] = [
  {
    mm2: 1.5,
    maxAmpacityA: 16,
    minPullOutN: 40,
    blockTorque: [0.5, 0.8],
    lugTorque: [1.8, 2.8],
    stripRange: [7, 10],
  },
  {
    mm2: 2.5,
    maxAmpacityA: 24,
    minPullOutN: 50,
    blockTorque: [0.8, 1.2],
    lugTorque: [2.2, 3.5],
    stripRange: [8, 11],
  },
  {
    mm2: 4,
    maxAmpacityA: 32,
    minPullOutN: 60,
    blockTorque: [1.2, 1.8],
    lugTorque: [2.5, 4.0],
    stripRange: [9, 12],
  },
  {
    mm2: 6,
    maxAmpacityA: 41,
    minPullOutN: 80,
    blockTorque: [2.0, 2.8],
    lugTorque: [3.0, 4.8],
    stripRange: [11, 14],
  },
  {
    mm2: 10,
    maxAmpacityA: 57,
    minPullOutN: 90,
    blockTorque: [2.8, 4.0],
    lugTorque: [3.8, 5.5],
    stripRange: [12, 15],
  },
];

export const DEFAULT_WIRE_PARAMS: WireParams = {
  station: 'terminal-block',
  gaugeMm2: 2.5,
  method: 'crimped-ferrule-lug',
  loadCurrentA: 16,
  stripLengthMm: 9,
  torqueNm: 1.0,
  washerStackCorrect: true,
  paintRemoved: true,
  emcShieldBonded: true,
  faultMode: 'none',
};

export function getGaugeSpec(mm2: WireGaugeMm2) {
  return WIRE_GAUGES.find((g) => g.mm2 === mm2) ?? WIRE_GAUGES[1];
}

export function getRecommendedStripRange(
  station: TerminationStationId,
  method: TerminationMethodId,
  gaugeMm2: WireGaugeMm2
): [number, number] {
  if (method === 'wago-lever') {
    return [10, 12];
  }
  const spec = getGaugeSpec(gaugeMm2);
  if (station === 'motor-lug' || station === 'grounding-pe') {
    return [spec.stripRange[0] + 1, spec.stripRange[1] + 2];
  }
  return spec.stripRange;
}

export function getRecommendedTorqueRange(
  station: TerminationStationId,
  gaugeMm2: WireGaugeMm2
): [number, number] {
  const spec = getGaugeSpec(gaugeMm2);
  if (station === 'motor-lug' || station === 'grounding-pe') {
    return spec.lugTorque;
  }
  return spec.blockTorque;
}

export function applyFaultPreset(
  fault: WireFaultId,
  current: WireParams
): WireParams {
  if (fault === 'none') {
    const recTorque = getRecommendedTorqueRange(current.station, current.gaugeMm2);
    const recStrip = getRecommendedStripRange(
      current.station,
      'crimped-ferrule-lug',
      current.gaugeMm2
    );
    return {
      ...current,
      method: 'crimped-ferrule-lug',
      torqueNm: Number(((recTorque[0] + recTorque[1]) / 2).toFixed(1)),
      stripLengthMm: Math.round((recStrip[0] + recStrip[1]) / 2),
      washerStackCorrect: true,
      paintRemoved: true,
      emcShieldBonded: true,
      faultMode: 'none',
    };
  }

  switch (fault) {
    case 'loose-torque':
      return {
        ...current,
        torqueNm: 0.3,
        loadCurrentA: Math.max(current.loadCurrentA, 22),
        faultMode: 'loose-torque',
      };
    case 'insulation-pinch':
      return {
        ...current,
        stripLengthMm: 3,
        method:
          current.method === 'wago-lever' ? 'bare-stranded' : current.method,
        faultMode: 'insulation-pinch',
      };
    case 'tinned-creep':
      return {
        ...current,
        station: 'terminal-block',
        method: 'solder-tinned',
        torqueNm: 0.9,
        loadCurrentA: Math.max(current.loadCurrentA, 20),
        faultMode: 'tinned-creep',
      };
    case 'wrong-washer-order':
      return {
        ...current,
        station: 'motor-lug',
        method: 'crimped-ferrule-lug',
        washerStackCorrect: false,
        torqueNm: 2.8,
        faultMode: 'wrong-washer-order',
      };
    case 'oversized-strip':
      return {
        ...current,
        stripLengthMm: 17,
        method:
          current.method === 'wago-lever' ? 'bare-stranded' : current.method,
        faultMode: 'oversized-strip',
      };
  }
}

export function computeWireState(params: WireParams): WireComputedState {
  const spec = getGaugeSpec(params.gaugeMm2);
  const recTorque = getRecommendedTorqueRange(params.station, params.gaugeMm2);
  const recStrip = getRecommendedStripRange(
    params.station,
    params.method,
    params.gaugeMm2
  );
  const issues: WireIssueCode[] = [];

  // Base contact resistance (mOhm) for an ideal joint scales inversely with cross-section
  let rMohm = 0.25 * (2.5 / params.gaugeMm2);

  // Base pull-out force (N)
  let pullN = spec.minPullOutN * 1.45;

  // 1. Termination method effects
  switch (params.method) {
    case 'crimped-ferrule-lug':
      rMohm *= 0.85;
      pullN *= 1.35;
      break;
    case 'bare-stranded':
      rMohm *= 1.45;
      pullN *= 0.88;
      break;
    case 'solder-tinned':
      // Solder cold-flows under clamping pressure, increasing resistance over time
      rMohm += 6.5;
      pullN *= 0.72;
      issues.push('tinned-creep');
      break;
    case 'wago-lever':
      rMohm *= 1.05;
      pullN *= 1.15;
      if (params.loadCurrentA > 32) {
        rMohm += 4.5;
        issues.push('wago-overcurrent');
      }
      break;
    case 'twisted-tape':
      rMohm += 14.0;
      pullN *= 0.35;
      issues.push('twisted-tape-prohibited');
      break;
  }

  // 2. Strip length effects
  let shockHazard = false;
  if (params.stripLengthMm < recStrip[0] - 2) {
    // Severe insulation pinch under clamp
    rMohm += 26.0;
    pullN *= 0.28;
    issues.push('insulation-pinch');
  } else if (params.stripLengthMm < recStrip[0]) {
    rMohm += 3.5;
    pullN *= 0.65;
    issues.push('undersized-strip');
  } else if (params.stripLengthMm > recStrip[1] + 2) {
    shockHazard = true;
    issues.push('oversized-strip');
  }

  // 3. Torque effects (applies to screw/stud stations when not tool-free wago/tape)
  const usesTorque =
    params.method !== 'wago-lever' && params.method !== 'twisted-tape';
  if (usesTorque) {
    if (params.torqueNm < recTorque[0] * 0.7) {
      const deficit = (recTorque[0] - params.torqueNm) / recTorque[0];
      rMohm += 18.0 * deficit + 6.0;
      pullN *= Math.max(0.25, params.torqueNm / recTorque[0]);
      issues.push('loose-torque');
    } else if (params.torqueNm < recTorque[0]) {
      rMohm += 3.2;
      pullN *= 0.82;
      issues.push('loose-torque');
    } else if (params.torqueNm > recTorque[1] * 1.3) {
      // Over-torquing crushes copper strands / strips threads
      rMohm += 1.4;
      pullN *= 0.68;
      issues.push('over-torque');
    }
  }

  // 4. Stud hardware / PE grounding checks
  if (
    (params.station === 'motor-lug' || params.station === 'grounding-pe') &&
    !params.washerStackCorrect
  ) {
    rMohm += 5.5;
    pullN *= 0.78;
    issues.push('wrong-washer');
  }

  if (params.station === 'grounding-pe') {
    if (!params.paintRemoved) {
      rMohm += 42.0;
      issues.push('paint-insulation');
    }
    if (!params.emcShieldBonded) {
      rMohm += 2.0;
      issues.push('emc-unbonded');
    }
  }

  // 5. Ampacity overload
  if (params.loadCurrentA > spec.maxAmpacityA) {
    issues.push('overcurrent');
  }

  // 6. Pull-out threshold check
  if (pullN < spec.minPullOutN && !issues.includes('pull-out-fail')) {
    issues.push('pull-out-fail');
  }

  const contactResistanceMohm = Number(rMohm.toFixed(2));
  const voltageDropMv = Number(
    (params.loadCurrentA * contactResistanceMohm).toFixed(1)
  );
  const powerDissipationW = Number(
    (
      (params.loadCurrentA * params.loadCurrentA * contactResistanceMohm) /
      1000
    ).toFixed(2)
  );

  // Ambient 25°C + joint thermal rise (~7.5 °C/W) + conductor ampacity self-heating
  const ampRatio = params.loadCurrentA / spec.maxAmpacityA;
  const conductorSelfHeat = 12 * Math.pow(ampRatio, 2);
  const terminalTempC = Number(
    Math.min(240, 25 + powerDissipationW * 7.8 + conductorSelfHeat).toFixed(1)
  );

  const pullOutForceN = Math.round(pullN);
  const pullTestPassed =
    pullOutForceN >= spec.minPullOutN && !issues.includes('insulation-pinch');

  const arcingActive =
    params.loadCurrentA >= 10 &&
    (issues.includes('loose-torque') ||
      issues.includes('insulation-pinch') ||
      issues.includes('twisted-tape-prohibited'));

  const thermalSeverity = Math.max(
    0,
    Math.min(1, (terminalTempC - 45) / 90)
  );

  const criticalIssues: WireIssueCode[] = [
    'loose-torque',
    'insulation-pinch',
    'tinned-creep',
    'oversized-strip',
    'overcurrent',
    'paint-insulation',
    'twisted-tape-prohibited',
    'wago-overcurrent',
    'pull-out-fail',
  ];

  let verdict: SafetyVerdict = 'PASS';
  if (
    issues.some((i) => criticalIssues.includes(i)) ||
    terminalTempC >= 85
  ) {
    verdict = 'FAIL';
  } else if (issues.length > 0 || terminalTempC >= 65) {
    verdict = 'WARNING';
  }

  return {
    contactResistanceMohm,
    voltageDropMv,
    powerDissipationW,
    terminalTempC,
    pullOutForceN,
    minPullOutForceN: spec.minPullOutN,
    maxAmpacityA: spec.maxAmpacityA,
    recommendedTorqueRange: recTorque,
    recommendedStripRange: recStrip,
    verdict,
    issues,
    thermalSeverity,
    arcingActive,
    pullTestPassed,
    shockHazard,
  };
}
