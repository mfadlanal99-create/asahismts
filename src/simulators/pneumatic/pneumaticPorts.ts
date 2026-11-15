import type { PneumaticComponentType, PortDef } from './pneumaticTypes';

export interface ComponentCatalogItem {
  type: PneumaticComponentType;
  name: string;
  shortLabel: string;
  category: 'Supply' | 'Valves' | 'Logic & Flow' | 'Actuators';
  ports: PortDef[];
}

export const COMPONENT_CATALOG: Record<PneumaticComponentType, ComponentCatalogItem> = {
  compressor: {
    type: 'compressor',
    name: 'Air Compressor',
    shortLabel: 'COMP',
    category: 'Supply',
    ports: [{ id: 'out', label: '1(P)', dx: 0, dy: -26, direction: 'out' }],
  },
  frl: {
    type: 'frl',
    name: 'FRL Unit',
    shortLabel: 'FRL',
    category: 'Supply',
    ports: [
      { id: 'in', label: 'IN', dx: -34, dy: 0, direction: 'in' },
      { id: 'out', label: 'OUT', dx: 34, dy: 0, direction: 'out' },
    ],
  },
  valve32_pb: {
    type: 'valve32_pb',
    name: '3/2 Pushbutton Valve',
    shortLabel: '3/2 PB',
    category: 'Valves',
    ports: [
      { id: '1', label: '1(P)', dx: -10, dy: 24, direction: 'in' },
      { id: '2', label: '2(A)', dx: -10, dy: -24, direction: 'out' },
    ],
  },
  valve32_limit: {
    type: 'valve32_limit',
    name: '3/2 Limit Switch Valve',
    shortLabel: '3/2 LS',
    category: 'Valves',
    ports: [
      { id: '1', label: '1(P)', dx: -10, dy: 24, direction: 'in' },
      { id: '2', label: '2(A)', dx: -10, dy: -24, direction: 'out' },
    ],
  },
  valve52_pilot: {
    type: 'valve52_pilot',
    name: '5/2 Pilot/Solenoid DCV',
    shortLabel: '5/2 DCV',
    category: 'Valves',
    ports: [
      { id: '1', label: '1(P)', dx: 0, dy: 24, direction: 'in' },
      { id: '4', label: '4(A)', dx: -16, dy: -24, direction: 'out' },
      { id: '2', label: '2(B)', dx: 16, dy: -24, direction: 'out' },
      { id: '14', label: '14(Z)', dx: -48, dy: 0, direction: 'in' },
      { id: '12', label: '12(Y)', dx: 48, dy: 0, direction: 'in' },
    ],
  },
  flow_control: {
    type: 'flow_control',
    name: 'Flow Control Valve',
    shortLabel: 'FCV',
    category: 'Logic & Flow',
    ports: [
      { id: 'in', label: '1', dx: 0, dy: 26, direction: 'bi' },
      { id: 'out', label: '2', dx: 0, dy: -26, direction: 'bi' },
    ],
  },
  shuttle_or: {
    type: 'shuttle_or',
    name: 'Shuttle OR Valve',
    shortLabel: 'OR',
    category: 'Logic & Flow',
    ports: [
      { id: 'a', label: '1(X)', dx: -28, dy: 0, direction: 'in' },
      { id: 'b', label: '1(Y)', dx: 28, dy: 0, direction: 'in' },
      { id: 'y', label: '2(A)', dx: 0, dy: -22, direction: 'out' },
    ],
  },
  dual_and: {
    type: 'dual_and',
    name: 'Dual-Pressure AND Valve',
    shortLabel: 'AND',
    category: 'Logic & Flow',
    ports: [
      { id: 'a', label: '1(X)', dx: -28, dy: 0, direction: 'in' },
      { id: 'b', label: '1(Y)', dx: 28, dy: 0, direction: 'in' },
      { id: 'y', label: '2(A)', dx: 0, dy: -22, direction: 'out' },
    ],
  },
  cyl_single: {
    type: 'cyl_single',
    name: 'Single-Acting Cylinder',
    shortLabel: 'SAC',
    category: 'Actuators',
    ports: [{ id: 'a', label: 'A', dx: -44, dy: 24, direction: 'in' }],
  },
  cyl_double: {
    type: 'cyl_double',
    name: 'Double-Acting Cylinder',
    shortLabel: 'DAC',
    category: 'Actuators',
    ports: [
      { id: 'a', label: 'A', dx: -44, dy: 24, direction: 'in' },
      { id: 'b', label: 'B', dx: 44, dy: 24, direction: 'in' },
    ],
  },
};

export function getPortPosition(
  comp: { x: number; y: number; type: PneumaticComponentType },
  portId: string
): { x: number; y: number } {
  const catalog = COMPONENT_CATALOG[comp.type];
  const port = catalog.ports.find((p) => p.id === portId);
  if (!port) return { x: comp.x, y: comp.y };
  return { x: comp.x + port.dx, y: comp.y + port.dy };
}
