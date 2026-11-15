export type PneumaticFaultType =
  | 'none'
  | 'clogged_frl'
  | 'leaking_pilot'
  | 'stuck_fcv';

export type PneumaticComponentType =
  | 'compressor'
  | 'frl'
  | 'valve32_pb'
  | 'valve32_limit'
  | 'valve52_pilot'
  | 'flow_control'
  | 'shuttle_or'
  | 'dual_and'
  | 'cyl_single'
  | 'cyl_double';

export type PortDirection = 'in' | 'out' | 'bi';

export interface PortDef {
  id: string;
  label: string;
  /** Offset from component center (x, y) in SVG units */
  dx: number;
  dy: number;
  direction: PortDirection;
}

export interface PneumaticComponent {
  id: string;
  type: PneumaticComponentType;
  label: string;
  x: number;
  y: number;
  /** Interactive state: pressed/actuated for 3/2, shifted (position 1 = true, 0 = false) for 5/2 */
  actuated?: boolean;
  /** Latch mode for 3/2 pushbutton (toggle vs momentary) */
  latched?: boolean;
  /** Flow control opening percentage (5 - 100) */
  throttlePct?: number;
  /** Cylinder extension (0 - 100 %) */
  strokePct?: number;
  /** Cylinder velocity (% per second) for smooth readout */
  velocityPctPerSec?: number;
  /** Linked cylinder ID for limit switch (triggers when linked cylinder >= 96% stroke) */
  linkedCylinderId?: string;
}

export interface PneumaticConnection {
  id: string;
  fromCompId: string;
  fromPortId: string;
  toCompId: string;
  toPortId: string;
  /** Optional tag for pilot lines */
  isPilot?: boolean;
}

export interface LineState {
  pressurized: boolean;
  pressureBar: number;
  flowLpm: number;
}

export interface ComponentRuntimeState {
  portPressures: Record<string, number>;
  activeSpoolPos: 0 | 1;
}

export interface SimulationSnapshot {
  lineStates: Record<string, LineState>;
  compStates: Record<string, ComponentRuntimeState>;
}

export interface CircuitPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  components: PneumaticComponent[];
  connections: PneumaticConnection[];
}
