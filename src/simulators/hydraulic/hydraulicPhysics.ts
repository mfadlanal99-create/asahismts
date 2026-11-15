import {
  astmD341ViscosityAtTemp,
  barToPa,
  cToK,
  lpmToM3s,
  m3sToLpm,
  orificeFlowRate,
  paToBar,
  wToKw,
} from '../../physics';
import type { HydraulicParams, HydraulicTelemetry } from './hydraulicTypes';

// Standard industrial double-acting cylinder geometry
export const CYLINDER_BORE_MM = 80;
export const CYLINDER_ROD_MM = 45;
export const CYLINDER_STROKE_MM = 400;

// Areas in cm^2: 1 bar * 1 cm^2 = 10 N = 0.01 kN
export const AREA_CAP_CM2 = (Math.PI / 4) * (CYLINDER_BORE_MM / 10) ** 2; // 50.265 cm^2
export const AREA_ROD_CS_CM2 = (Math.PI / 4) * (CYLINDER_ROD_MM / 10) ** 2; // 15.904 cm^2
export const AREA_ANNULUS_CM2 = AREA_CAP_CM2 - AREA_ROD_CS_CM2; // 34.361 cm^2
export const AREA_RATIO = AREA_CAP_CM2 / AREA_ANNULUS_CM2; // ~1.463

const TANK_PRESSURE_BAR = 2;
const LINE_LOSS_BAR = 3;
const OIL_DENSITY_KG_M3 = 870;
const ORIFICE_CD = 0.62;
// Calibrated so full-open (alpha=1) at 20 L/min produces 2.5 bar backpressure:
// Q = Cd * A * sqrt(2 * dP / rho) -> A = Q / (Cd * sqrt(2 * dP / rho))
const METER_OUT_MAX_AREA_M2 =
  lpmToM3s(20) / (ORIFICE_CD * Math.sqrt((2 * barToPa(2.5)) / OIL_DENSITY_KG_M3));

function fluidPowerKw(pressureBar: number, flowLpm: number): number {
  return wToKw(barToPa(pressureBar) * lpmToM3s(flowLpm));
}

function orificeDeltaPBar(flowLpm: number, effectiveAreaM2: number): number {
  if (effectiveAreaM2 <= 0) return 0;
  const vEff = lpmToM3s(flowLpm) / (ORIFICE_CD * effectiveAreaM2);
  return paToBar(0.5 * OIL_DENSITY_KG_M3 * vEff * vEff);
}

/**
 * Convert flow (L/min) into velocity (mm/s) given area in cm^2.
 * Q [L/min] = 1000 cm^3 / 60 s = 16.6667 cm^3/s
 * v [cm/s] = (Q * 1000 / 60) / A [cm^2] -> v [mm/s] = (Q * 10000 / 60) / A
 */
function flowToVelocityMmS(flowLpm: number, areaCm2: number): number {
  return ((flowLpm * 10000) / 60) / areaCm2;
}

/**
 * ISO VG 46 hydraulic oil kinematic viscosity (cSt) as a function of temperature (°C)
 * using the ASTM D341 Walther viscosity-temperature equation.
 * Nominal 46 cSt at 40 °C, 6.8 cSt at 100 °C (VI ~100).
 */
export function computeOilViscosityCst(tempC: number): number {
  const cst = astmD341ViscosityAtTemp(cToK(tempC), 46.0, 6.8);
  return Math.max(6, Math.min(180, cst));
}

function withThermalMetrics(
  base: Omit<
    HydraulicTelemetry,
    'reliefHeatLossKw' | 'usefulPowerKw' | 'systemEfficiencyPct'
  >,
): HydraulicTelemetry {
  const reliefHeatLossKw = base.reliefOpen
    ? fluidPowerKw(base.p1PumpBar, base.qReliefLpm)
    : 0;
  const usefulPowerKw = Math.max(
    0,
    (Math.abs(base.netForceKn) * Math.abs(base.velocityMmS)) / 1000,
  );
  const systemEfficiencyPct =
    base.hydraulicPowerKw > 0.05
      ? Math.min(98, (usefulPowerKw / base.hydraulicPowerKw) * 100)
      : 0;
  return {
    ...base,
    reliefHeatLossKw,
    usefulPowerKw,
    systemEfficiencyPct,
  };
}

/**
 * Solve steady-state hydraulic circuit telemetry given current parameters,
 * normalized stroke position [0..1], and animation time (for cavitation jitter).
 */
export function solveHydraulicCircuit(
  params: HydraulicParams,
  strokeNorm: number,
  timeSec: number,
): HydraulicTelemetry {
  if (!params.pumpOn) {
    const residualLoadBar =
      params.dcv === 'neutral' && params.loadKn > 0
        ? Math.min(params.reliefCrackBar, (params.loadKn * 100) / AREA_CAP_CM2)
        : TANK_PRESSURE_BAR;

    const pilotCheckLocked = params.pilotCheckValve && params.dcv === 'neutral';
    const driftVel =
      !pilotCheckLocked && params.dcv === 'neutral' && params.loadKn > 6 && strokeNorm > 0.005
        ? -Math.min(4, params.loadKn * 0.06)
        : 0;

    return withThermalMetrics({
      p1PumpBar: 0,
      p2CapBar:
        params.fault === 'cylinder-seal-bypass' && !pilotCheckLocked
          ? TANK_PRESSURE_BAR
          : residualLoadBar,
      p3RodBar: TANK_PRESSURE_BAR,
      qPumpLpm: 0,
      qActuatorLpm: 0,
      qReliefLpm: 0,
      velocityMmS: driftVel,
      netForceKn: 0,
      hydraulicPowerKw: 0,
      pilotCheckLocked,
      reliefOpen: false,
      isStalled: false,
      isBottomedOut: false,
      isCavitating: false,
      statusText: pilotCheckLocked
        ? 'HPU Off — Pilot Check Valve Locked (Zero Drift)'
        : driftVel < 0
          ? 'HPU Off — Cylinder Drifting via Spool Leakage'
          : 'HPU Off — Pump Stopped',
    });
  }

  const isCavitating = params.fault === 'suction-cavitation';
  const cavitationJitter = isCavitating
    ? 0.85 + 0.15 * Math.sin(timeSec * 23) * Math.cos(timeSec * 11)
    : 1;

  // Effective pump flow drops significantly under suction strainer cavitation
  const qPumpLpm = isCavitating ? params.pumpFlowLpm * 0.42 : params.pumpFlowLpm;

  // Effective relief cracking pressure drops to ~11 bar if stuck open
  const effectiveCrackBar =
    params.fault === 'relief-stuck-open' ? 11 : params.reliefCrackBar;
  const reliefForcedOpen = params.fault === 'relief-stuck-open';

  const alpha = Math.max(0.1, Math.min(1, params.meterOutOpenPct / 100));

  // Neutral (Tandem-Center): P -> T open, A & B blocked
  if (params.dcv === 'neutral') {
    const p1 = (TANK_PRESSURE_BAR + 1.5) * cavitationJitter;
    const pilotCheckLocked = params.pilotCheckValve;
    const loadPressure = (params.loadKn * 100) / AREA_CAP_CM2;
    const p2 =
      params.fault === 'cylinder-seal-bypass' && !pilotCheckLocked
        ? TANK_PRESSURE_BAR + loadPressure * 0.35
        : TANK_PRESSURE_BAR + Math.min(effectiveCrackBar, loadPressure);
    const p3 =
      params.fault === 'cylinder-seal-bypass' && !pilotCheckLocked
        ? TANK_PRESSURE_BAR + loadPressure * 0.3
        : TANK_PRESSURE_BAR;

    // Without pilot check valve, DCV spool micro-leakage causes slow drift under load;
    // seal bypass accelerates drift. Pilot check valve locks cap end with zero drift.
    let driftVel = 0;
    if (!pilotCheckLocked && strokeNorm > 0.005) {
      if (params.fault === 'cylinder-seal-bypass' && params.loadKn > 2) {
        driftVel = -Math.min(18, params.loadKn * 0.35);
      } else if (params.loadKn > 6) {
        driftVel = -Math.min(4, params.loadKn * 0.06);
      }
    }

    return withThermalMetrics({
      p1PumpBar: p1,
      p2CapBar: p2,
      p3RodBar: p3,
      qPumpLpm,
      qActuatorLpm: 0,
      qReliefLpm: reliefForcedOpen ? qPumpLpm * 0.3 : 0,
      velocityMmS: driftVel,
      netForceKn: (p2 * AREA_CAP_CM2 - p3 * AREA_ANNULUS_CM2) / 100,
      hydraulicPowerKw: fluidPowerKw(p1, qPumpLpm),
      pilotCheckLocked,
      reliefOpen: reliefForcedOpen,
      isStalled: false,
      isBottomedOut: false,
      isCavitating,
      statusText: pilotCheckLocked
        ? 'Neutral (Tandem P→T) — Pilot Check Locked (Zero Drift)'
        : driftVel < 0
          ? params.fault === 'cylinder-seal-bypass'
            ? 'Neutral (Tandem P→T) — Cylinder drifting due to internal seal bypass'
            : 'Neutral (Tandem P→T) — Slight spool-leakage drift (enable Pilot Check to lock)'
          : isCavitating
            ? 'Neutral (Tandem P→T) — Pump cavitating (starved suction)'
            : 'Neutral (Tandem Center P→T) — Unloaded circulation',
    });
  }

  // EXTEND
  if (params.dcv === 'extend') {
    const atFullExtend = strokeNorm >= 0.999;

    if (atFullExtend) {
      const p1 = effectiveCrackBar * cavitationJitter;
      const p2 =
        params.fault === 'cylinder-seal-bypass'
          ? p1 * 0.68
          : p1;
      const p3 =
        params.fault === 'cylinder-seal-bypass'
          ? p1 * 0.55
          : TANK_PRESSURE_BAR;
      return withThermalMetrics({
        p1PumpBar: p1,
        p2CapBar: p2,
        p3RodBar: p3,
        qPumpLpm,
        qActuatorLpm: 0,
        qReliefLpm: qPumpLpm,
        velocityMmS: 0,
        netForceKn: (p2 * AREA_CAP_CM2 - p3 * AREA_ANNULUS_CM2) / 100,
        hydraulicPowerKw: fluidPowerKw(p1, qPumpLpm),
        pilotCheckLocked: false,
        reliefOpen: true,
        isStalled: false,
        isBottomedOut: true,
        isCavitating,
        statusText: reliefForcedOpen
          ? 'Full Extend — Relief valve stuck open at low pressure'
          : 'Full Extend (Dead-Headed) — Relief valve open, bypassing 100% flow',
      });
    }

    // Load pressure required on cap end (bar)
    const pLoadBar = (params.loadKn * 100) / AREA_CAP_CM2;
    const qRodFull = qPumpLpm / AREA_RATIO;

    // Meter-out orifice backpressure at full pump flow
    const deltaPMeterFull = orificeDeltaPBar(qRodFull, METER_OUT_MAX_AREA_M2 * alpha);
    const p3Full = TANK_PRESSURE_BAR + deltaPMeterFull;
    const p2Full = pLoadBar + p3Full / AREA_RATIO + 2;
    const p1ReqFull = p2Full + LINE_LOSS_BAR;

    // Check if load alone exceeds cracking pressure
    const p1MinToMove = pLoadBar + TANK_PRESSURE_BAR / AREA_RATIO + 2 + LINE_LOSS_BAR;

    if (p1MinToMove >= effectiveCrackBar) {
      // Stalled under load!
      const p1 = effectiveCrackBar * cavitationJitter;
      const p2 =
        params.fault === 'cylinder-seal-bypass'
          ? Math.max(TANK_PRESSURE_BAR, p1 * 0.65)
          : Math.max(TANK_PRESSURE_BAR, p1 - LINE_LOSS_BAR);
      const p3 =
        params.fault === 'cylinder-seal-bypass'
          ? p1 * 0.52
          : TANK_PRESSURE_BAR;
      return withThermalMetrics({
        p1PumpBar: p1,
        p2CapBar: p2,
        p3RodBar: p3,
        qPumpLpm,
        qActuatorLpm: 0,
        qReliefLpm: qPumpLpm,
        velocityMmS: 0,
        netForceKn: (p2 * AREA_CAP_CM2 - p3 * AREA_ANNULUS_CM2) / 100,
        hydraulicPowerKw: fluidPowerKw(p1, qPumpLpm),
        pilotCheckLocked: false,
        reliefOpen: true,
        isStalled: true,
        isBottomedOut: false,
        isCavitating,
        statusText: reliefForcedOpen
          ? 'STALLED — Relief valve stuck open (~11 bar); cannot overcome load'
          : 'STALLED — Load exceeds relief cracking pressure; full flow bypassing',
      });
    }

    let qActuator = qPumpLpm;
    let qRelief = 0;
    let p1 = p1ReqFull;
    let p2 = p2Full;
    let p3 = p3Full;
    let reliefOpen = reliefForcedOpen;

    if (p1ReqFull > effectiveCrackBar) {
      // Meter-out throttling pushes P1 to relief cracking pressure; excess flow bypasses
      reliefOpen = true;
      p1 = effectiveCrackBar;
      const p2Avail = p1 - LINE_LOSS_BAR;
      const deltaPAvail = Math.max(
        0.2,
        (p2Avail - pLoadBar - 2) * AREA_RATIO - TANK_PRESSURE_BAR,
      );
      const qRodThrottled = Math.min(
        qRodFull,
        m3sToLpm(
          orificeFlowRate(
            ORIFICE_CD,
            METER_OUT_MAX_AREA_M2 * alpha,
            barToPa(deltaPAvail),
            OIL_DENSITY_KG_M3,
          ),
        ),
      );
      qActuator = Math.min(qPumpLpm, qRodThrottled * AREA_RATIO);
      qRelief = Math.max(0, qPumpLpm - qActuator);
      p3 = TANK_PRESSURE_BAR + deltaPAvail;
      p2 = p2Avail;
    }

    // Apply cylinder internal seal bypass fault
    if (params.fault === 'cylinder-seal-bypass') {
      const bypassFraction = 0.58;
      qActuator *= 1 - bypassFraction;
      p2 = Math.max(TANK_PRESSURE_BAR + 4, p2 * 0.72);
      p3 = Math.max(p3, p2 * 0.68);
      p1 = Math.min(effectiveCrackBar, p2 + LINE_LOSS_BAR);
    }

    p1 *= cavitationJitter;
    const velocityMmS = flowToVelocityMmS(qActuator, AREA_CAP_CM2);

    return withThermalMetrics({
      p1PumpBar: p1,
      p2CapBar: p2,
      p3RodBar: p3,
      qPumpLpm,
      qActuatorLpm: qActuator,
      qReliefLpm: qRelief,
      velocityMmS,
      netForceKn: (p2 * AREA_CAP_CM2 - p3 * AREA_ANNULUS_CM2) / 100,
      hydraulicPowerKw: fluidPowerKw(p1, qPumpLpm),
      pilotCheckLocked: false,
      reliefOpen,
      isStalled: false,
      isBottomedOut: false,
      isCavitating,
      statusText:
        params.fault === 'cylinder-seal-bypass'
          ? 'Extending (Sluggish) — Internal piston seal bypass equalizing P2 & P3'
          : isCavitating
            ? 'Extending (Slow/Erratic) — Pump cavitating due to clogged suction strainer'
            : reliefOpen
              ? 'Extending (Meter-Out Throttled) — Relief valve bypassing excess flow'
              : 'Extending Normally',
    });
  }

  // RETRACT (oil enters rod end via free-flow check valve, cap end exhausts to tank)
  const atFullRetract = strokeNorm <= 0.001;
  if (atFullRetract) {
    const p1 = effectiveCrackBar * cavitationJitter;
    const p3 = params.fault === 'cylinder-seal-bypass' ? p1 * 0.68 : p1;
    const p2 = params.fault === 'cylinder-seal-bypass' ? p1 * 0.55 : TANK_PRESSURE_BAR;
    return withThermalMetrics({
      p1PumpBar: p1,
      p2CapBar: p2,
      p3RodBar: p3,
      qPumpLpm,
      qActuatorLpm: 0,
      qReliefLpm: qPumpLpm,
      velocityMmS: 0,
      netForceKn: (p3 * AREA_ANNULUS_CM2 - p2 * AREA_CAP_CM2) / 100,
      hydraulicPowerKw: fluidPowerKw(p1, qPumpLpm),
      pilotCheckLocked: false,
      reliefOpen: true,
      isStalled: false,
      isBottomedOut: true,
      isCavitating,
      statusText: reliefForcedOpen
        ? 'Full Retract — Relief valve stuck open at low pressure'
        : 'Full Retract (Dead-Headed) — Relief valve open, bypassing 100% flow',
    });
  }

  const pLoadRetractBar = (params.loadKn * 100) / AREA_ANNULUS_CM2;
  const p2Retract = TANK_PRESSURE_BAR + 1.5;
  const p3Req = pLoadRetractBar + p2Retract * AREA_RATIO + 2;
  const p1ReqRetract = p3Req + LINE_LOSS_BAR;

  if (p1ReqRetract >= effectiveCrackBar) {
    const p1 = effectiveCrackBar * cavitationJitter;
    const p3 =
      params.fault === 'cylinder-seal-bypass'
        ? Math.max(TANK_PRESSURE_BAR, p1 * 0.65)
        : Math.max(TANK_PRESSURE_BAR, p1 - LINE_LOSS_BAR);
    const p2 = params.fault === 'cylinder-seal-bypass' ? p1 * 0.52 : p2Retract;
    return withThermalMetrics({
      p1PumpBar: p1,
      p2CapBar: p2,
      p3RodBar: p3,
      qPumpLpm,
      qActuatorLpm: 0,
      qReliefLpm: qPumpLpm,
      velocityMmS: 0,
      netForceKn: (p3 * AREA_ANNULUS_CM2 - p2 * AREA_CAP_CM2) / 100,
      hydraulicPowerKw: fluidPowerKw(p1, qPumpLpm),
      pilotCheckLocked: false,
      reliefOpen: true,
      isStalled: true,
      isBottomedOut: false,
      isCavitating,
      statusText: reliefForcedOpen
        ? 'STALLED on Retract — Relief valve stuck open (~11 bar)'
        : 'STALLED on Retract — Load exceeds relief cracking pressure',
    });
  }

  let qActuator = qPumpLpm;
  let p3 = p3Req;
  let p2 = p2Retract;
  let p1 = p1ReqRetract;

  if (params.fault === 'cylinder-seal-bypass') {
    qActuator *= 0.42;
    p3 = Math.max(TANK_PRESSURE_BAR + 4, p3 * 0.72);
    p2 = Math.max(p2, p3 * 0.68);
    p1 = Math.min(effectiveCrackBar, p3 + LINE_LOSS_BAR);
  }

  p1 *= cavitationJitter;
  const velocityMmS = -flowToVelocityMmS(qActuator, AREA_ANNULUS_CM2);

  return withThermalMetrics({
    p1PumpBar: p1,
    p2CapBar: p2,
    p3RodBar: p3,
    qPumpLpm,
    qActuatorLpm: qActuator,
    qReliefLpm: reliefForcedOpen ? qPumpLpm * 0.25 : 0,
    velocityMmS,
    netForceKn: (p3 * AREA_ANNULUS_CM2 - p2 * AREA_CAP_CM2) / 100,
    hydraulicPowerKw: fluidPowerKw(p1, qPumpLpm),
    pilotCheckLocked: false,
    reliefOpen: reliefForcedOpen,
    isStalled: false,
    isBottomedOut: false,
    isCavitating,
    statusText:
      params.fault === 'cylinder-seal-bypass'
        ? 'Retracting (Sluggish) — Internal piston seal bypass equalizing P2 & P3'
        : isCavitating
          ? 'Retracting (Slow/Erratic) — Pump cavitating due to clogged suction strainer'
          : 'Retracting Normally (Bypass Check Open — Higher Speed)',
  });
}
