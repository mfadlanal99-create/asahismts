export type DcvPosition = 'extend' | 'neutral' | 'retract';

export type HydraulicFault =
  | 'none'
  | 'relief-stuck-open'
  | 'cylinder-seal-bypass'
  | 'suction-cavitation';

export interface FaultInfo {
  id: HydraulicFault;
  label: string;
  shortLabel: string;
  symptomSummary: string;
  rootCause: string;
}

export const HYDRAULIC_FAULTS: FaultInfo[] = [
  {
    id: 'none',
    label: 'Healthy Circuit (No Fault)',
    shortLabel: 'Healthy',
    symptomSummary: 'Normal pressures, crisp relief cracking at setpoint, full actuator speed.',
    rootCause: 'All components operating within specification.',
  },
  {
    id: 'relief-stuck-open',
    label: 'Relief Valve Stuck Open',
    shortLabel: 'Relief Stuck Open',
    symptomSummary:
      'System pressure P1 cannot build above ~10–12 bar; actuator stalls under light load; continuous tank bypass.',
    rootCause:
      'Contamination or broken bias spring holding the relief poppet/spool off its seat.',
  },
  {
    id: 'cylinder-seal-bypass',
    label: 'Cylinder Internal Seal Bypass',
    shortLabel: 'Seal Bypass',
    symptomSummary:
      'Oil leaks past piston seal; P2 and P3 partially equalize; sluggish speed and drift under load.',
    rootCause:
      'Worn or damaged piston U-cup / O-ring seal allowing cross-port internal leakage.',
  },
  {
    id: 'suction-cavitation',
    label: 'Clogged Suction Strainer (Cavitation)',
    shortLabel: 'Suction Cavitation',
    symptomSummary:
      'Erratic/pulsating P1 gauge, ~40% reduced flow & actuator speed, pump cavitation noise.',
    rootCause:
      'Restricted tank suction strainer starving the fixed-displacement pump inlet.',
  },
];

export interface HydraulicParams {
  pumpOn: boolean;
  pumpFlowLpm: number; // 10 - 60 L/min
  reliefCrackBar: number; // 20 - 210 bar
  dcv: DcvPosition;
  meterOutOpenPct: number; // 10 - 100 %
  loadKn: number; // 0 - 80 kN
  pilotCheckValve: boolean; // Load-holding pilot check valve on cap line
  accumulatorEnabled: boolean; // Gas-charged bladder accumulator for surge damping
  fault: HydraulicFault;
}

export interface HydraulicTelemetry {
  p1PumpBar: number;
  p2CapBar: number;
  p3RodBar: number;
  qPumpLpm: number;
  qActuatorLpm: number;
  qReliefLpm: number;
  velocityMmS: number;
  netForceKn: number;
  hydraulicPowerKw: number;
  reliefHeatLossKw: number;
  usefulPowerKw: number;
  systemEfficiencyPct: number;
  pilotCheckLocked: boolean;
  reliefOpen: boolean;
  isStalled: boolean;
  isBottomedOut: boolean;
  isCavitating: boolean;
  statusText: string;
}
