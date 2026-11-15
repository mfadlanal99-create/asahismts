import { hzToRadS, radSToRpm, rpmToRadS } from '../../physics';

export type MotorType =
  | 'ac-tefc'
  | 'single-phase'
  | 'vfd-inverter'
  | 'bldc'
  | 'servo'
  | 'stepper';

export interface MotorTypeInfo {
  id: MotorType;
  name: string;
  powerSource: string;
  features: string;
  efficiencyClass: string;
  primaryUse: string;
}

export const MOTOR_TYPES: MotorTypeInfo[] = [
  {
    id: 'ac-tefc',
    name: '3-Phase AC Induction TEFC',
    powerSource: '3-Phase 380–415V AC (50Hz) or 440–480V (60Hz)',
    features:
      'Totally Enclosed Fan Cooled; rugged squirrel cage rotor, external shaft-driven cowl fan.',
    efficiencyClass: 'IE3 Premium / IE4 Super Premium',
    primaryUse:
      'Centrifugal pumps, industrial fans, screw compressors, belt conveyors, factory automation.',
  },
  {
    id: 'single-phase',
    name: 'Single-Phase Capacitor Start',
    powerSource: '1-Phase 220–240V AC (50/60Hz)',
    features:
      'Auxiliary starting winding connected through electrolytic start capacitor and internal centrifugal disconnect switch.',
    efficiencyClass: 'Standard IE1',
    primaryUse:
      'Workshop drill presses, bench grinders, residential water pumps, air conditioners.',
  },
  {
    id: 'vfd-inverter',
    name: 'VFD Inverter-Duty AC',
    powerSource: '3-Phase Inverter Output (0–120Hz PWM)',
    features:
      'Class H insulation, insulated non-drive bearings (prevents EDM fluting), independent constant-speed cooling blower.',
    efficiencyClass: 'IE4 / IE5 Ultra-Efficient',
    primaryUse:
      'Variable speed conveyor lines, cranes, extruders, high-turndown pumps.',
  },
  {
    id: 'bldc',
    name: 'BLDC / Brushless DC Motor',
    powerSource: 'DC Bus via 3-Phase Inverter (24V, 48V, 310V DC)',
    features:
      'Rare-earth NdFeB permanent magnet rotor, electronic hall-sensor commutation, high power-to-weight ratio.',
    efficiencyClass: '90%+ High Efficiency',
    primaryUse:
      'Electric vehicles, AGV warehouse robots, medical tools, drone propulsion, computer cooling fans.',
  },
  {
    id: 'servo',
    name: 'AC Servo Motor w/ Encoder',
    powerSource: 'Servo Drive Inverter (Sine-wave PWM)',
    features:
      'Low rotor inertia for extreme dynamic acceleration; 23-bit absolute optical encoder feedback for closed-loop precision.',
    efficiencyClass: 'High Dynamic Servo',
    primaryUse:
      'CNC machining centres, multi-axis robotic arms, pick-and-place packaging, semiconductor handling.',
  },
  {
    id: 'stepper',
    name: 'Hybrid Stepper Motor',
    powerSource: 'Constant-current chopper stepper drive (DC)',
    features:
      'Open-loop precision stepping (typically 1.8° = 200 steps/rev), exceptional holding torque at zero speed.',
    efficiencyClass: 'Moderate (Continuous holding current)',
    primaryUse:
      '3D printers, laser cutters, peristaltic pumps, microscope stage positioning.',
  },
];

export type MotorMounting = 'B3' | 'B5' | 'B14';

export interface MotorMountingInfo {
  code: MotorMounting;
  name: string;
  description: string;
  mountingFace: string;
  bestFit: string;
}

export const MOTOR_MOUNTINGS: Record<MotorMounting, MotorMountingInfo> = {
  B3: {
    code: 'B3',
    name: 'B3 Foot Mount',
    description:
      'Horizontal mounting with 4 rigid mounting feet integrated into the stator frame casting.',
    mountingFace: 'Bottom feet with clearance bolt holes on baseplate / slide rails.',
    bestFit: 'Coupled pump packages, belt-driven fans, floor-mounted agitator frames.',
  },
  B5: {
    code: 'B5',
    name: 'B5 Large Flange Mount',
    description:
      'Large drive-end flange with outer diameter larger than the motor stator frame.',
    mountingFace: 'Drive end flange with through clearance holes bolted from motor side.',
    bestFit:
      'Direct close-coupled inline gearboxes, hydraulic pump bell housings, vertical sump pumps.',
  },
  B14: {
    code: 'B14',
    name: 'B14 Face Flange Mount',
    description:
      'Compact flange with pitch diameter smaller than the stator frame, containing blind tapped threaded holes.',
    mountingFace: 'Face flange with metric internal threads tapped into motor end-shield.',
    bestFit:
      'Compact helical gearmotors, compact machine tool headstocks, confined spaces.',
  },
};

export type PoleCount = 2 | 4 | 6;

export interface PoleSpec {
  poles: PoleCount;
  label: string;
  syncSpeed50HzRpm: number;
  typicalRated50HzRpm: number;
  syncSpeed60HzRpm: number;
  typicalRated60HzRpm: number;
  typicalSlipPct: number;
}

export const POLE_SPECS: Record<PoleCount, PoleSpec> = {
  2: {
    poles: 2,
    label: '2 Poles (1 Pair)',
    syncSpeed50HzRpm: 3000,
    typicalRated50HzRpm: 2910,
    syncSpeed60HzRpm: 3600,
    typicalRated60HzRpm: 3490,
    typicalSlipPct: 3.0,
  },
  4: {
    poles: 4,
    label: '4 Poles (2 Pairs) [Standard Industry Baseline]',
    syncSpeed50HzRpm: 1500,
    typicalRated50HzRpm: 1440,
    syncSpeed60HzRpm: 1800,
    typicalRated60HzRpm: 1740,
    typicalSlipPct: 4.0,
  },
  6: {
    poles: 6,
    label: '6 Poles (3 Pairs)',
    syncSpeed50HzRpm: 1000,
    typicalRated50HzRpm: 960,
    syncSpeed60HzRpm: 1200,
    typicalRated60HzRpm: 1150,
    typicalSlipPct: 4.0,
  },
};

export type IpRating = 'IP54' | 'IP55' | 'IP65';

export interface IpRatingInfo {
  code: IpRating;
  dustProtection: string;
  waterProtection: string;
  environment: string;
}

export const IP_RATINGS: Record<IpRating, IpRatingInfo> = {
  IP54: {
    code: 'IP54',
    dustProtection:
      'Dust protected: Limited dust ingress allowed, does not interfere with normal operation.',
    waterProtection:
      'Splashing water: Water splashing against enclosure from any direction has no harmful effect.',
    environment: 'Dry indoor workshops, clean utility rooms, controlled HVAC machinery.',
  },
  IP55: {
    code: 'IP55',
    dustProtection: 'Dust protected: Heavy dust resistance with shaft labyrinth seals.',
    waterProtection:
      'Water jets: Water projected by a nozzle (6.3mm) against enclosure from any direction.',
    environment:
      'Worldwide standard industrial plant floor, dusty cement, chemical plants, moderate washdown.',
  },
  IP65: {
    code: 'IP65',
    dustProtection: 'Dust tight: Total seal against ingress of dust and airborne particulate.',
    waterProtection:
      'Heavy water jets: Water projected in powerful jets (12.5mm nozzle) against enclosure.',
    environment:
      'Food & beverage washdown zones, outdoor marine decks, abattoir sanitization lines.',
  },
};

export type TerminalConnectionMode = 'star' | 'delta';

export interface TerminalWiringInfo {
  mode: TerminalConnectionMode;
  symbol: string;
  name: string;
  jumperArrangement: string;
  coilVoltageFormula: string;
  startingCurrent: string;
  operatingVoltage400VGrid: string;
  summary: string;
}

export const TERMINAL_WIRING: Record<TerminalConnectionMode, TerminalWiringInfo> = {
  star: {
    mode: 'star',
    symbol: 'Y',
    name: 'Star (Wye) Connection',
    jumperArrangement:
      'Single horizontal brass link bridging W2 — U2 — V2 together (forming the neutral star point).',
    coilVoltageFormula:
      'V_phase = V_line / √3 (e.g. 400 V / 1.732 = 230 V across each coil winding)',
    startingCurrent:
      'Low (~1/3 of full Delta locked rotor current; used in Star-Delta reduced-voltage starters)',
    operatingVoltage400VGrid:
      'Required for 230/400V rated motors operating on standard European 400V 3-phase grid!',
    summary:
      'Star connection shares voltage across two windings in series between any two line conductors. Each winding receives only 57.7% of line voltage, protecting 230V windings from burning out on a 400V line.',
  },
  delta: {
    mode: 'delta',
    symbol: 'Δ',
    name: 'Delta (Triangle) Connection',
    jumperArrangement:
      'Three vertical parallel brass links bridging: U1–W2, V1–U2, and W1–V2.',
    coilVoltageFormula:
      'V_phase = V_line (e.g. Full 400 V applied directly across each coil winding)',
    startingCurrent:
      'Full across-the-line locked-rotor current (typically 6–8× nominal rated current)',
    operatingVoltage400VGrid:
      'Required for 400/690V rated motors operating on standard European 400V 3-phase grid!',
    summary:
      'Delta connection applies the full line voltage directly across each individual phase winding. This produces maximum rated shaft torque and power output.',
  },
};

export interface MotorStateCalc {
  syncRpm: number;
  ratedRpm: number;
  slipPct: number;
  omegaRadS: number;
  ratedTorqueNm: number;
  phaseVoltageOn400V: number;
}

/**
 * Calculates synchronous speed, full-load shaft speed, slip percentage, angular velocity,
 * and 4.0 kW baseline shaft torque using the central MechLab physics engine (`rpmToRadS`).
 */
export function calculateMotorState(
  poles: PoleCount,
  frequency: 50 | 60,
  terminalConnection: TerminalConnectionMode
): MotorStateCalc {
  const poleSpec = POLE_SPECS[poles];
  const syncRpm = Math.round(radSToRpm(hzToRadS(frequency) / (poles / 2)));
  const ratedRpm =
    frequency === 50 ? poleSpec.typicalRated50HzRpm : poleSpec.typicalRated60HzRpm;
  const slipPct = ((syncRpm - ratedRpm) / syncRpm) * 100;
  const omegaRadS = rpmToRadS(ratedRpm);
  const ratedTorqueNm = 4000 / omegaRadS;
  const phaseVoltageOn400V = terminalConnection === 'star' ? 400 / Math.sqrt(3) : 400;

  return {
    syncRpm,
    ratedRpm,
    slipPct,
    omegaRadS,
    ratedTorqueNm,
    phaseVoltageOn400V,
  };
}
