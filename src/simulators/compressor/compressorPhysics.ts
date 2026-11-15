import {
  ATM_BAR,
  barToPa,
  compressorDischargeTemp,
  cToK,
  kToC,
  polytropicSpecificWork,
  R_AIR,
  wToKw,
} from '../../physics';

export type CompressorFaultId =
  | 'none'
  | 'clogged-filter'
  | 'fouled-cooler'
  | 'failed-drain'
  | 'excessive-leaks';

export interface CompressorParams {
  loadPressureBar: number;     // 5.5 - 8.5 bar(g)
  unloadPressureBar: number;   // 6.5 - 9.5 bar(g)
  plantDemandM3Min: number;    // 1.0 - 12.0 m³/min
  intakeFilterDpMbar: number;  // 0 - 120 mbar
  coolerFoulingPct: number;    // 0 - 100 %
  autoDrainEnabled: boolean;   // true = auto-drain working, false = stuck closed
  plantLeakPct: number;        // 0 - 45 % of rated capacity
}

export interface CompressorPreset {
  id: string;
  label: string;
  description: string;
  faultId: CompressorFaultId;
  params: CompressorParams;
}

export interface CompressorDynamicState {
  receiverPressureBar: number;
  isLoaded: boolean;
  condensateLevelPct: number;
  highTempTrip: boolean;
}

export interface CompressorSolution {
  suctionPressureBarAbs: number;
  dischargePressureBarAbs: number;
  compressionRatio: number;
  stageRatio: number;
  ratedFadM3Min: number;
  actualFadM3Min: number;
  leakFlowM3Min: number;
  totalDemandM3Min: number;
  dutyCyclePct: number;
  interstageTempC: number;
  dischargeTempC: number;
  aftercoolerOutletC: number;
  pressureDewPointC: number;
  loadedPowerKw: number;
  unloadedPowerKw: number;
  averagePowerKw: number;
  specificPowerKwPerM3Min: number;
  annualEnergyCostUsd: number;
  waterCarryover: boolean;
  pressureStarved: boolean;
  highTempTrip: boolean;
  activeWarnings: string[];
}

export const RATED_FAD_M3_MIN = 12.0;
const ATM_PRESSURE_BAR = ATM_BAR;
const AMBIENT_TEMP_K = cToK(25); // 25 °C
const COOLANT_TEMP_C = 24.0;
const N_EFF = 1.17; // Effective cooled 2-stage polytropic exponent
const OPERATING_HOURS_YR = 6000;
const ELECTRICITY_RATE_USD_KWH = 0.12;
const DRYER_POWER_KW = 2.2;

export const COMPRESSOR_PRESETS: CompressorPreset[] = [
  {
    id: 'optimal',
    label: 'Optimal Baseline',
    description: 'Clean intake filter, 10% cooler fouling, active auto-drain, low plant leaks (6%).',
    faultId: 'none',
    params: {
      loadPressureBar: 6.8,
      unloadPressureBar: 7.5,
      plantDemandM3Min: 6.8,
      intakeFilterDpMbar: 12,
      coolerFoulingPct: 10,
      autoDrainEnabled: true,
      plantLeakPct: 6,
    },
  },
  {
    id: 'clogged-filter',
    label: 'Clogged Intake Filter',
    description: 'Severe intake filter restriction (92 mbar ΔP) starving suction density & raising compression ratio.',
    faultId: 'clogged-filter',
    params: {
      loadPressureBar: 6.8,
      unloadPressureBar: 7.5,
      plantDemandM3Min: 7.2,
      intakeFilterDpMbar: 92,
      coolerFoulingPct: 12,
      autoDrainEnabled: true,
      plantLeakPct: 7,
    },
  },
  {
    id: 'fouled-cooler',
    label: 'Fouled Intercooler',
    description: 'Heavy cooler fin fouling (88%) causing high stage-2 inlet temp and >105 °C discharge trip.',
    faultId: 'fouled-cooler',
    params: {
      loadPressureBar: 6.8,
      unloadPressureBar: 7.5,
      plantDemandM3Min: 7.0,
      intakeFilterDpMbar: 15,
      coolerFoulingPct: 88,
      autoDrainEnabled: true,
      plantLeakPct: 6,
    },
  },
  {
    id: 'failed-drain',
    label: 'Failed Condensate Drain',
    description: 'Stuck-closed receiver auto-drain causing condensate flooding and downstream water carryover.',
    faultId: 'failed-drain',
    params: {
      loadPressureBar: 6.8,
      unloadPressureBar: 7.5,
      plantDemandM3Min: 6.5,
      intakeFilterDpMbar: 14,
      coolerFoulingPct: 14,
      autoDrainEnabled: false,
      plantLeakPct: 6,
    },
  },
  {
    id: 'excessive-leaks',
    label: 'Excessive Plant Leaks',
    description: '36% compressed air lost to leaking couplings and hoses, driving near-100% duty cycle and high energy cost.',
    faultId: 'excessive-leaks',
    params: {
      loadPressureBar: 6.8,
      unloadPressureBar: 7.5,
      plantDemandM3Min: 7.4,
      intakeFilterDpMbar: 15,
      coolerFoulingPct: 15,
      autoDrainEnabled: true,
      plantLeakPct: 36,
    },
  },
];

export const FAULT_DIAGNOSIS_OPTIONS: {
  id: Exclude<CompressorFaultId, 'none'>;
  label: string;
  clue: string;
}[] = [
  {
    id: 'clogged-filter',
    label: 'Clogged Intake Filter',
    clue: 'High intake ΔP (> 50 mbar), reduced FAD capacity, elevated specific power.',
  },
  {
    id: 'fouled-cooler',
    label: 'Fouled Intercooler / Aftercooler',
    clue: 'Discharge temp > 105 °C trip, elevated pressure dew point from hot air entering dryer.',
  },
  {
    id: 'failed-drain',
    label: 'Failed Condensate Auto-Drain',
    clue: 'Receiver tank condensate level near 100%, water carryover spiking pressure dew point.',
  },
  {
    id: 'excessive-leaks',
    label: 'Excessive Plant Air Leaks',
    clue: 'Duty cycle pinned near 100%, receiver pressure sagging, soaring annual energy cost.',
  },
];

export function solveCompressorSystem(
  params: CompressorParams,
  dyn: CompressorDynamicState
): CompressorSolution {
  const suctionPressureBarAbs = Math.max(
    0.75,
    ATM_PRESSURE_BAR - params.intakeFilterDpMbar / 1000
  );
  const effectiveGaugeBar = dyn.receiverPressureBar;
  const dischargePressureBarAbs = effectiveGaugeBar + ATM_PRESSURE_BAR;

  const compressionRatio = dischargePressureBarAbs / suctionPressureBarAbs;
  const stageRatio = Math.sqrt(compressionRatio);

  // Volumetric capacity derates with lower suction density
  const actualFadM3Min =
    RATED_FAD_M3_MIN * Math.pow(suctionPressureBarAbs / ATM_PRESSURE_BAR, 0.85);

  const leakFlowM3Min = RATED_FAD_M3_MIN * (params.plantLeakPct / 100);
  const totalDemandM3Min = params.plantDemandM3Min + leakFlowM3Min;

  const rawDuty = (totalDemandM3Min / actualFadM3Min) * 100;
  const dutyCyclePct = Math.min(100, Math.max(0, rawDuty));
  const pressureStarved = totalDemandM3Min > actualFadM3Min * 0.99;

  // 2-Stage Polytropic Temperatures
  const t1OutK = compressorDischargeTemp(AMBIENT_TEMP_K, stageRatio, N_EFF);
  const t1OutC = kToC(t1OutK);

  // Intercooler effectiveness degrades with fouling
  const icEffectiveness = Math.max(
    0.15,
    0.88 * (1 - 0.78 * (params.coolerFoulingPct / 100))
  );
  const t2InC = t1OutC - icEffectiveness * (t1OutC - COOLANT_TEMP_C);
  const t2InK = cToK(t2InC);

  const dischargeTempK = compressorDischargeTemp(t2InK, stageRatio, N_EFF);
  const dischargeTempC = kToC(dischargeTempK);
  const highTempTrip = dischargeTempC > 105;

  // Aftercooler outlet temp
  const acEffectiveness = Math.max(
    0.2,
    0.9 * (1 - 0.72 * (params.coolerFoulingPct / 100))
  );
  const aftercoolerOutletC =
    dischargeTempC - acEffectiveness * (dischargeTempC - (COOLANT_TEMP_C + 4));

  // Condensate & Pressure Dew Point
  const waterCarryover = !params.autoDrainEnabled && dyn.condensateLevelPct >= 88;
  let pressureDewPointC = 3.0;
  if (aftercoolerOutletC > 42) {
    // Refrigerated dryer thermally overloaded
    pressureDewPointC += (aftercoolerOutletC - 42) * 0.48;
  }
  if (waterCarryover) {
    // Liquid water bypassing separator/dryer
    pressureDewPointC = Math.max(pressureDewPointC, 21.5);
  }
  pressureDewPointC = Math.min(35, pressureDewPointC);

  // Power calculation (2-stage polytropic work + mechanical/motor efficiency)
  // Mass flow m_dot = P1 * V1_dot / (R_air * T1)
  const massFlowKgS =
    (barToPa(suctionPressureBarAbs) * (actualFadM3Min / 60)) /
    (R_AIR * AMBIENT_TEMP_K);
  const stage1SpecWorkJkg = polytropicSpecificWork(AMBIENT_TEMP_K, stageRatio, R_AIR, N_EFF);
  const stage2SpecWorkJkg = polytropicSpecificWork(t2InK, stageRatio, R_AIR, N_EFF);
  const idealTwoStageWorkKw = wToKw(
    massFlowKgS * (stage1SpecWorkJkg + stage2SpecWorkJkg)
  );

  const etaMechMotor = 0.76;
  const loadedPowerKw = idealTwoStageWorkKw / etaMechMotor;
  const unloadedPowerKw = loadedPowerKw * 0.26;

  const dutyFrac = dutyCyclePct / 100;
  const averagePowerKw =
    loadedPowerKw * dutyFrac + unloadedPowerKw * (1 - dutyFrac) + DRYER_POWER_KW;

  const usefulAirM3Min = Math.max(0.5, params.plantDemandM3Min);
  // Specific power based on compressed air delivered vs. average compressor power
  const specificPowerKwPerM3Min =
    (loadedPowerKw * dutyFrac + unloadedPowerKw * (1 - dutyFrac)) /
    Math.max(0.5, Math.min(actualFadM3Min, totalDemandM3Min));

  // True plant energy cost includes wasted leak air & unloaded power
  const annualEnergyCostUsd =
    averagePowerKw * OPERATING_HOURS_YR * ELECTRICITY_RATE_USD_KWH;

  // Warnings
  const activeWarnings: string[] = [];
  if (highTempTrip) {
    activeWarnings.push(
      `High Discharge Temp Trip (${dischargeTempC.toFixed(1)} °C > 105 °C) — clean intercooler/aftercooler fins.`
    );
  }
  if (params.intakeFilterDpMbar >= 50) {
    activeWarnings.push(
      `Intake Filter Clogged (${params.intakeFilterDpMbar.toFixed(0)} mbar ΔP) — replace filter element to restore FAD.`
    );
  }
  if (waterCarryover) {
    activeWarnings.push(
      `Water Carryover Detected (Condensate ${dyn.condensateLevelPct.toFixed(0)}%) — repair/open receiver auto-drain.`
    );
  } else if (!params.autoDrainEnabled) {
    activeWarnings.push(
      `Auto-Drain Disabled — condensate accumulating in receiver (${dyn.condensateLevelPct.toFixed(0)}%).`
    );
  }
  if (params.plantLeakPct >= 20) {
    activeWarnings.push(
      `Excessive Plant Air Leaks (${params.plantLeakPct}% = ${leakFlowM3Min.toFixed(2)} m³/min wasted) — perform ultrasonic leak audit.`
    );
  }
  if (pressureStarved) {
    activeWarnings.push(
      `Air Supply Starved — total demand (${totalDemandM3Min.toFixed(1)} m³/min) exceeds FAD (${actualFadM3Min.toFixed(1)} m³/min).`
    );
  }
  void usefulAirM3Min;

  return {
    suctionPressureBarAbs,
    dischargePressureBarAbs,
    compressionRatio,
    stageRatio,
    ratedFadM3Min: RATED_FAD_M3_MIN,
    actualFadM3Min,
    leakFlowM3Min,
    totalDemandM3Min,
    dutyCyclePct,
    interstageTempC: t1OutC,
    dischargeTempC,
    aftercoolerOutletC,
    pressureDewPointC,
    loadedPowerKw,
    unloadedPowerKw,
    averagePowerKw,
    specificPowerKwPerM3Min,
    annualEnergyCostUsd,
    waterCarryover,
    pressureStarved,
    highTempTrip,
    activeWarnings,
  };
}
