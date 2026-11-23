export type StarterMode = 'dol' | 'star-delta' | 'vfd';

export type VfdFaultMode =
  | 'normal'
  | 'phase-loss'
  | 'dc-overvoltage'
  | 'overcurrent-stall'
  | 'bearing-fluting';

export type DriveRunState =
  | 'stopped'
  | 'accelerating'
  | 'running'
  | 'decelerating'
  | 'tripped';

export interface VfdParams {
  starterMode: StarterMode;
  targetFreqHz: number;
  baseFreqHz: 50 | 60;
  ratedVoltageV: number;
  poles: 2 | 4 | 6;
  ratedPowerKw: number;
  loadTorquePct: number;
  accelTimeS: number;
  decelTimeS: number;
  carrierFreqKhz: number;
  faultMode: VfdFaultMode;
}

export interface VfdComputedState {
  effectiveFreqHz: number;
  syncSpeedRpm: number;
  rotorSpeedRpm: number;
  slipPct: number;
  outputVoltageV: number;
  vfRatioPct: number;
  fluxPct: number;
  inFieldWeakening: boolean;
  dcBusVoltageV: number;
  dcBusRippleVpp: number;
  ratedCurrentA: number;
  outputCurrentA: number;
  currentPct: number;
  inrushPeakPct: number;
  ratedTorqueNm: number;
  motorTorqueNm: number;
  motorTorquePct: number;
  breakdownTorquePct: number;
  shaftVoltageVpk: number;
  starDeltaPhase: 'star' | 'delta' | 'n/a';
  tripCode: 'NONE' | 'OV' | 'OC' | 'PHL' | 'EDM_WARN';
  isTripped: boolean;
  diagnosticKey:
    | 'normal'
    | 'stopped'
    | 'star-starting'
    | 'dol-inrush'
    | 'field-weakening'
    | 'phase-loss'
    | 'dc-overvoltage'
    | 'overcurrent-stall'
    | 'bearing-fluting';
}

export interface TorqueSpeedPoint {
  rpm: number;
  motorTorquePct: number;
  loadTorquePct: number;
}

export interface VfCurvePoint {
  freqHz: number;
  voltageV: number;
  fluxPct: number;
}

export interface WaveformPoint {
  deg: number;
  u: number;
  v: number;
  w: number;
  pwmU: number;
}

export const DEFAULT_VFD_PARAMS: VfdParams = {
  starterMode: 'vfd',
  targetFreqHz: 50,
  baseFreqHz: 50,
  ratedVoltageV: 400,
  poles: 4,
  ratedPowerKw: 7.5,
  loadTorquePct: 70,
  accelTimeS: 8,
  decelTimeS: 8,
  carrierFreqKhz: 4,
  faultMode: 'normal',
};

export function computeSyncSpeedRpm(freqHz: number, poles: 2 | 4 | 6): number {
  return (120 * freqHz) / poles;
}

export function computeRatedCurrentA(powerKw: number, voltageV: number): number {
  // Typical 400V 3-phase induction motor: eta ~ 0.89, pf ~ 0.85
  const eta = 0.89;
  const pf = 0.85;
  return (powerKw * 1000) / (Math.sqrt(3) * voltageV * eta * pf);
}

export function computeRatedTorqueNm(
  powerKw: number,
  baseFreqHz: 50 | 60,
  poles: 2 | 4 | 6
): number {
  const ns = computeSyncSpeedRpm(baseFreqHz, poles);
  const ratedRpm = ns * 0.96; // 4% nominal full-load slip
  const omega = (2 * Math.PI * ratedRpm) / 60;
  return (powerKw * 1000) / omega;
}

export function computeVfdOutputVoltage(
  freqHz: number,
  baseFreqHz: 50 | 60,
  ratedVoltageV: number
): { voltageV: number; fluxPct: number; inFieldWeakening: boolean } {
  if (freqHz <= 0.1) {
    return { voltageV: 0, fluxPct: 0, inFieldWeakening: false };
  }
  if (freqHz <= baseFreqHz) {
    // Constant V/f with small low-frequency stator IR boost (~14 V at 0 Hz)
    const boostV = 14 * Math.max(0, 1 - freqHz / 12);
    const linearV = ratedVoltageV * (freqHz / baseFreqHz) + boostV;
    const voltageV = Math.min(ratedVoltageV, linearV);
    return {
      voltageV,
      fluxPct: 100,
      inFieldWeakening: false,
    };
  }
  // Field weakening above base frequency: V stays clamped at ratedVoltageV
  const fluxPct = (baseFreqHz / freqHz) * 100;
  return {
    voltageV: ratedVoltageV,
    fluxPct,
    inFieldWeakening: true,
  };
}

export function computeVfdState(
  params: VfdParams,
  currentFreqHz: number,
  runState: DriveRunState,
  elapsedRunS: number
): VfdComputedState {
  const ratedCurrentA = computeRatedCurrentA(
    params.ratedPowerKw,
    params.ratedVoltageV
  );
  const ratedTorqueNm = computeRatedTorqueNm(
    params.ratedPowerKw,
    params.baseFreqHz,
    params.poles
  );

  const isActive =
    runState === 'accelerating' ||
    runState === 'running' ||
    runState === 'decelerating';

  const effectiveFreqHz =
    params.starterMode === 'vfd'
      ? isActive
        ? Math.max(0, currentFreqHz)
        : 0
      : isActive
        ? params.baseFreqHz
        : 0;

  const syncSpeedRpm = computeSyncSpeedRpm(effectiveFreqHz, params.poles);

  // Star-Delta timer (3.0 s Star phase before switching to Delta)
  let starDeltaPhase: 'star' | 'delta' | 'n/a' = 'n/a';
  if (params.starterMode === 'star-delta' && isActive) {
    starDeltaPhase = elapsedRunS < 3.0 ? 'star' : 'delta';
  }

  // Output Voltage & Flux
  let outputVoltageV = 0;
  let fluxPct = 0;
  let inFieldWeakening = false;

  if (isActive) {
    if (params.starterMode === 'vfd') {
      const vf = computeVfdOutputVoltage(
        effectiveFreqHz,
        params.baseFreqHz,
        params.ratedVoltageV
      );
      outputVoltageV = vf.voltageV;
      fluxPct = vf.fluxPct;
      inFieldWeakening = vf.inFieldWeakening;
    } else if (params.starterMode === 'dol') {
      outputVoltageV = params.ratedVoltageV;
      fluxPct = 100;
    } else {
      // Star-Delta: V_phase is 1/sqrt(3) in Star (equivalent line voltage effect on torque = 1/3)
      outputVoltageV =
        starDeltaPhase === 'star'
          ? params.ratedVoltageV / Math.sqrt(3)
          : params.ratedVoltageV;
      fluxPct = starDeltaPhase === 'star' ? 57.7 : 100;
    }
  }

  // Breakdown torque (%)
  let breakdownTorquePct = 240;
  if (inFieldWeakening && effectiveFreqHz > params.baseFreqHz) {
    breakdownTorquePct = 240 * Math.pow(params.baseFreqHz / effectiveFreqHz, 2);
  }
  if (starDeltaPhase === 'star') {
    breakdownTorquePct = 240 / 3; // 80% breakdown torque in Star
  }
  if (params.faultMode === 'phase-loss') {
    breakdownTorquePct *= 0.52;
  }

  // DC Bus Voltage (for VFD; 0/idle when stopped or non-VFD)
  let dcBusVoltageV =
    params.starterMode === 'vfd' ? params.ratedVoltageV * Math.SQRT2 : 0;
  let dcBusRippleVpp = params.starterMode === 'vfd' ? 8 : 0;

  if (params.starterMode === 'vfd') {
    if (isActive) {
      dcBusVoltageV -= 18 * (params.loadTorquePct / 100);
      dcBusRippleVpp = 14 * (params.loadTorquePct / 100) + 4;
    }
    if (params.faultMode === 'phase-loss') {
      dcBusVoltageV -= 38;
      dcBusRippleVpp = 88;
    }
    // Regenerative braking on fast decel or explicit DC overvoltage fault
    const fastDecelRegen =
      runState === 'decelerating' && params.decelTimeS < 2.5 && effectiveFreqHz > 8;
    if (params.faultMode === 'dc-overvoltage' && isActive) {
      dcBusVoltageV = 815;
    } else if (fastDecelRegen) {
      const regenBoost = ((2.5 - params.decelTimeS) / 2.5) * 260;
      dcBusVoltageV = Math.min(825, dcBusVoltageV + regenBoost);
    }
  }

  // Slip & Rotor Speed
  let slipPct = 0;
  let rotorSpeedRpm = 0;
  let motorTorquePct = 0;
  let outputCurrentA = 0;
  let inrushPeakPct = params.starterMode === 'dol' ? 650 : params.starterMode === 'star-delta' ? 220 : 125;

  const isLockedRotor = params.faultMode === 'overcurrent-stall';

  if (isActive && effectiveFreqHz > 0.5) {
    if (isLockedRotor || params.loadTorquePct > breakdownTorquePct) {
      // Stalled / Locked rotor
      slipPct = 100;
      rotorSpeedRpm = 0;
      motorTorquePct = Math.min(breakdownTorquePct, 150);
      outputCurrentA =
        params.starterMode === 'vfd'
          ? ratedCurrentA * 2.35
          : params.starterMode === 'dol'
            ? ratedCurrentA * 6.5
            : ratedCurrentA * 2.2;
    } else {
      // Solve slip s in stable region (0 < s < s_bk = 0.16)
      // T/T_bk = 2 / (s/s_bk + s_bk/s) -> approximate stable root
      const sBk = 0.16;
      const ratio = Math.min(0.98, params.loadTorquePct / Math.max(10, breakdownTorquePct));
      const disc = Math.sqrt(Math.max(0, 1 - ratio * ratio));
      const s = ratio > 0.01 ? (sBk * (1 - disc)) / ratio : 0.003;
      slipPct = Math.min(100, s * 100);
      rotorSpeedRpm = syncSpeedRpm * (1 - s);
      motorTorquePct = params.loadTorquePct;

      // Current calculation
      const magnetizingA = ratedCurrentA * 0.34 * (fluxPct / 100);
      const torqueProducingA =
        ratedCurrentA * 0.94 * (params.loadTorquePct / 100) * (100 / Math.max(40, fluxPct));
      outputCurrentA = Math.hypot(magnetizingA, torqueProducingA);

      // Starting inrush for DOL and Star-Delta
      if (params.starterMode === 'dol' && elapsedRunS < 1.8) {
        const decay = Math.exp(-elapsedRunS * 1.4);
        outputCurrentA = Math.max(outputCurrentA, ratedCurrentA * (1 + 5.5 * decay));
      } else if (params.starterMode === 'star-delta') {
        if (elapsedRunS < 2.2) {
          const decay = Math.exp(-elapsedRunS * 1.2);
          outputCurrentA = Math.max(outputCurrentA, ratedCurrentA * (0.8 + 1.4 * decay));
        } else if (elapsedRunS >= 3.0 && elapsedRunS < 3.8) {
          // Star-to-Delta transition transient
          outputCurrentA = Math.max(outputCurrentA, ratedCurrentA * 3.1);
        }
      }

      if (params.faultMode === 'phase-loss') {
        outputCurrentA *= 1.65;
      }
    }
  }

  const currentPct = ratedCurrentA > 0 ? (outputCurrentA / ratedCurrentA) * 100 : 0;
  const motorTorqueNm = ratedTorqueNm * (motorTorquePct / 100);

  // Bearing EDM shaft voltage (VFD PWM common-mode dv/dt)
  let shaftVoltageVpk = 0;
  if (params.starterMode === 'vfd' && isActive) {
    shaftVoltageVpk = 2.5 + params.carrierFreqKhz * 0.85;
    if (params.faultMode === 'bearing-fluting') {
      shaftVoltageVpk = Math.max(18.5, shaftVoltageVpk * 1.9);
    }
  }

  // Trip / Fault evaluation
  let tripCode: VfdComputedState['tripCode'] = 'NONE';
  if (runState === 'tripped' || (isActive && params.starterMode === 'vfd')) {
    if (dcBusVoltageV >= 790) {
      tripCode = 'OV';
    } else if (currentPct >= 200) {
      tripCode = 'OC';
    } else if (params.faultMode === 'phase-loss' && isActive) {
      tripCode = 'PHL';
    } else if (params.faultMode === 'bearing-fluting' || shaftVoltageVpk >= 12) {
      tripCode = 'EDM_WARN';
    }
  }

  const isTripped =
    tripCode === 'OV' || tripCode === 'OC' || (tripCode === 'PHL' && params.faultMode === 'phase-loss');

  let diagnosticKey: VfdComputedState['diagnosticKey'] = 'normal';
  if (tripCode === 'OV') {
    diagnosticKey = 'dc-overvoltage';
  } else if (tripCode === 'OC' || isLockedRotor) {
    diagnosticKey = 'overcurrent-stall';
  } else if (params.faultMode === 'phase-loss' && isActive) {
    diagnosticKey = 'phase-loss';
  } else if (
    isActive &&
    (params.faultMode === 'bearing-fluting' || shaftVoltageVpk >= 12)
  ) {
    diagnosticKey = 'bearing-fluting';
  } else if (!isActive) {
    diagnosticKey = 'stopped';
  } else if (params.starterMode === 'dol' && elapsedRunS < 1.8) {
    diagnosticKey = 'dol-inrush';
  } else if (params.starterMode === 'star-delta' && starDeltaPhase === 'star') {
    diagnosticKey = 'star-starting';
  } else if (inFieldWeakening) {
    diagnosticKey = 'field-weakening';
  }

  const vfRatioPct =
    effectiveFreqHz > 0.5
      ? ((outputVoltageV / effectiveFreqHz) / (params.ratedVoltageV / params.baseFreqHz)) * 100
      : 0;

  return {
    effectiveFreqHz,
    syncSpeedRpm,
    rotorSpeedRpm,
    slipPct,
    outputVoltageV,
    vfRatioPct,
    fluxPct,
    inFieldWeakening,
    dcBusVoltageV,
    dcBusRippleVpp,
    ratedCurrentA,
    outputCurrentA,
    currentPct,
    inrushPeakPct,
    ratedTorqueNm,
    motorTorqueNm,
    motorTorquePct,
    breakdownTorquePct,
    shaftVoltageVpk,
    starDeltaPhase,
    tripCode,
    isTripped,
    diagnosticKey,
  };
}

export function generateTorqueSpeedCurve(
  params: VfdParams,
  effectiveFreqHz: number,
  starDeltaPhase: 'star' | 'delta' | 'n/a'
): TorqueSpeedPoint[] {
  const f = Math.max(5, effectiveFreqHz || params.targetFreqHz);
  const ns = computeSyncSpeedRpm(f, params.poles);
  let tBk = 240;
  if (f > params.baseFreqHz) {
    tBk = 240 * Math.pow(params.baseFreqHz / f, 2);
  }
  if (params.starterMode === 'star-delta' && starDeltaPhase === 'star') {
    tBk = 240 / 3;
  }
  if (params.faultMode === 'phase-loss') {
    tBk *= 0.52;
  }

  const sBk = 0.16;
  const points: TorqueSpeedPoint[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const rpm = (ns * i) / steps;
    const s = Math.max(0.001, (ns - rpm) / ns);
    const motorTorquePct =
      i === steps ? 0 : (2 * tBk) / (s / sBk + sBk / s);
    points.push({
      rpm,
      motorTorquePct: Math.min(260, motorTorquePct),
      loadTorquePct: params.loadTorquePct,
    });
  }
  return points;
}

export function generateVfCurve(params: VfdParams): VfCurvePoint[] {
  const points: VfCurvePoint[] = [];
  for (let f = 0; f <= 80; f += 5) {
    const { voltageV, fluxPct } = computeVfdOutputVoltage(
      f,
      params.baseFreqHz,
      params.ratedVoltageV
    );
    points.push({
      freqHz: f,
      voltageV,
      fluxPct,
    });
  }
  return points;
}

export function generatePwmWaveforms(
  freqHz: number,
  voltageV: number,
  ratedVoltageV: number,
  carrierFreqKhz: number,
  faultMode: VfdFaultMode
): WaveformPoint[] {
  const amp = Math.min(1, voltageV / Math.max(1, ratedVoltageV));
  const carrierRatio = Math.max(6, Math.round(carrierFreqKhz * 2));
  const points: WaveformPoint[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const deg = (i * 360) / steps;
    const rad = (deg * Math.PI) / 180;
    const u = amp * Math.sin(rad);
    const v =
      faultMode === 'phase-loss'
        ? amp * 0.28 * Math.sin(rad - (2 * Math.PI) / 3)
        : amp * Math.sin(rad - (2 * Math.PI) / 3);
    const w = amp * Math.sin(rad + (2 * Math.PI) / 3);

    // Triangle carrier comparison for simplified bipolar PWM visualization
    const triPhase = ((i * carrierRatio) / steps) % 1;
    const tri = triPhase < 0.5 ? 4 * triPhase - 1 : 3 - 4 * triPhase;
    const pwmU = freqHz > 0.5 ? (u >= tri ? 1 : -1) : 0;

    points.push({ deg, u, v, w, pwmU });
  }
  return points;
}
