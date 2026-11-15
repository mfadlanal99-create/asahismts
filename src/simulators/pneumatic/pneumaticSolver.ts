import {
  AIR_DENSITY_STP,
  ATM_BAR,
  barToPa,
  m3sToLpm,
  mmToM,
  orificeFlowRate,
} from '../../physics';
import type {
  ComponentRuntimeState,
  LineState,
  PneumaticComponent,
  PneumaticConnection,
  PneumaticFaultType,
  SimulationSnapshot,
} from './pneumaticTypes';

const NOMINAL_VALVE_ORIFICE_M2 = 6.0e-6; // ~2.76 mm equivalent pneumatic orifice
const ORIFICE_CD = 0.72;

export interface SolverInput {
  components: PneumaticComponent[];
  connections: PneumaticConnection[];
  compressorOn: boolean;
  supplyBar: number;
  activeFault?: PneumaticFaultType;
}

export interface SpoolUpdate {
  compId: string;
  newActuated: boolean;
}

/**
 * Resolves pilot-driven 5/2 spool transitions and limit-switch states,
 * then propagates air pressure and flow across all ports and lines.
 */
export function solvePneumaticNetwork(input: SolverInput): {
  snapshot: SimulationSnapshot;
  spoolUpdates: SpoolUpdate[];
} {
  const {
    components,
    connections,
    compressorOn,
    supplyBar,
    activeFault = 'none',
  } = input;

  const compMap = new Map<string, PneumaticComponent>();
  for (const c of components) {
    compMap.set(c.id, c);
  }

  // Port pressures: `${compId}:${portId}` -> bar
  const portP = new Map<string, number>();
  // Effective throttle factor (0.05..1) at each port for flow calculation
  const portThrottle = new Map<string, number>();

  const setPort = (compId: string, portId: string, p: number, throttle = 1) => {
    const key = `${compId}:${portId}`;
    const prev = portP.get(key) ?? 0;
    if (p > prev) {
      portP.set(key, p);
      portThrottle.set(key, throttle);
    }
  };

  const getPort = (compId: string, portId: string): number =>
    portP.get(`${compId}:${portId}`) ?? 0;

  const getThrottle = (compId: string, portId: string): number =>
    portThrottle.get(`${compId}:${portId}`) ?? 1;

  // Determine effective spool position for 5/2 valves (starting from current actuated state)
  const spoolPos = new Map<string, 0 | 1>();
  for (const c of components) {
    if (c.type === 'valve52_pilot') {
      spoolPos.set(c.id, c.actuated ? 1 : 0);
    }
  }

  // Determine limit-switch actuation based on linked cylinder stroke
  const isValve32Actuated = (c: PneumaticComponent): boolean => {
    if (c.type === 'valve32_limit' && c.linkedCylinderId) {
      const cyl = compMap.get(c.linkedCylinderId);
      if (cyl && (cyl.strokePct ?? 0) >= 96) {
        return true;
      }
    }
    return Boolean(c.actuated);
  };

  // Iterative fixed-point propagation
  for (let iter = 0; iter < 14; iter++) {
    // 1. Sources & internal component routing
    for (const c of components) {
      if (c.type === 'compressor') {
        if (compressorOn && supplyBar > 0) {
          setPort(c.id, 'out', supplyBar, 1);
        }
      } else if (c.type === 'frl') {
        const pIn = getPort(c.id, 'in');
        if (pIn > 0) {
          const dropFactor = activeFault === 'clogged_frl' ? 0.42 : 1.0;
          const flowFactor = activeFault === 'clogged_frl' ? 0.45 : 1.0;
          setPort(
            c.id,
            'out',
            pIn * dropFactor,
            Math.min(flowFactor, getThrottle(c.id, 'in'))
          );
        }
      } else if (c.type === 'valve32_pb' || c.type === 'valve32_limit') {
        if (isValve32Actuated(c)) {
          const p1 = getPort(c.id, '1');
          if (p1 > 0) {
            setPort(c.id, '2', p1, getThrottle(c.id, '1'));
          }
        }
      } else if (c.type === 'valve52_pilot') {
        const p14 = getPort(c.id, '14');
        const p12 = getPort(c.id, '12');
        const pilotThreshold = activeFault === 'leaking_pilot' ? 2.2 : 0.5;
        let pos = spoolPos.get(c.id) ?? 0;
        if (p14 > pilotThreshold && p12 <= pilotThreshold) {
          pos = 1;
        } else if (p12 > pilotThreshold && p14 <= pilotThreshold) {
          pos = 0;
        }
        spoolPos.set(c.id, pos);

        const p1 = getPort(c.id, '1');
        const t1 = getThrottle(c.id, '1');
        if (p1 > 0) {
          if (pos === 1) {
            setPort(c.id, '4', p1, t1);
          } else {
            setPort(c.id, '2', p1, t1);
          }
        }
      } else if (c.type === 'flow_control') {
        const effectivePct =
          activeFault === 'stuck_fcv' ? 10 : (c.throttlePct ?? 50);
        const t = Math.max(0.05, Math.min(1, effectivePct / 100));
        const pIn = getPort(c.id, 'in');
        const pOut = getPort(c.id, 'out');
        if (pIn > pOut) {
          setPort(c.id, 'out', pIn, Math.min(t, getThrottle(c.id, 'in')));
        } else if (pOut > pIn) {
          setPort(c.id, 'in', pOut, Math.min(t, getThrottle(c.id, 'out')));
        }
      } else if (c.type === 'shuttle_or') {
        const pA = getPort(c.id, 'a');
        const pB = getPort(c.id, 'b');
        const pMax = Math.max(pA, pB);
        if (pMax > 0) {
          const t = pA >= pB ? getThrottle(c.id, 'a') : getThrottle(c.id, 'b');
          setPort(c.id, 'y', pMax, t);
        }
      } else if (c.type === 'dual_and') {
        const pA = getPort(c.id, 'a');
        const pB = getPort(c.id, 'b');
        if (pA > 0.5 && pB > 0.5) {
          const pMin = Math.min(pA, pB);
          const t = Math.min(getThrottle(c.id, 'a'), getThrottle(c.id, 'b'));
          setPort(c.id, 'y', pMin, t);
        }
      }
    }

    // 2. Propagate across connections (bidirectional air lines)
    for (const conn of connections) {
      const leakFactor =
        activeFault === 'leaking_pilot' && conn.isPilot ? 0.28 : 1.0;
      const pFrom = getPort(conn.fromCompId, conn.fromPortId) * leakFactor;
      const pTo = getPort(conn.toCompId, conn.toPortId) * leakFactor;
      if (pFrom > pTo) {
        setPort(
          conn.toCompId,
          conn.toPortId,
          pFrom,
          getThrottle(conn.fromCompId, conn.fromPortId)
        );
      } else if (pTo > pFrom) {
        setPort(
          conn.fromCompId,
          conn.fromPortId,
          pTo,
          getThrottle(conn.toCompId, conn.toPortId)
        );
      }
    }
  }

  // Build lineStates
  const lineStates: Record<string, LineState> = {};
  for (const conn of connections) {
    const pA = getPort(conn.fromCompId, conn.fromPortId);
    const pB = getPort(conn.toCompId, conn.toPortId);
    const p = Math.max(pA, pB);
    const t = Math.min(
      getThrottle(conn.fromCompId, conn.fromPortId),
      getThrottle(conn.toCompId, conn.toPortId)
    );
    const pressurized = p > 0.2;
    // Orifice flow rate [L/min] using compressed air density at line pressure
    const airDensityKgM3 = AIR_DENSITY_STP * ((p + ATM_BAR) / ATM_BAR);
    const flowLpm = pressurized
      ? Number(
          m3sToLpm(
            orificeFlowRate(
              ORIFICE_CD,
              NOMINAL_VALVE_ORIFICE_M2 * t,
              barToPa(p),
              airDensityKgM3
            )
          ).toFixed(1)
        )
      : 0;
    lineStates[conn.id] = {
      pressurized,
      pressureBar: Number(p.toFixed(2)),
      flowLpm,
    };
  }

  // Build compStates and spool updates
  const compStates: Record<string, ComponentRuntimeState> = {};
  const spoolUpdates: SpoolUpdate[] = [];

  for (const c of components) {
    const portPressures: Record<string, number> = {};
    for (const [key, val] of portP.entries()) {
      if (key.startsWith(`${c.id}:`)) {
        const portId = key.slice(c.id.length + 1);
        portPressures[portId] = Number(val.toFixed(2));
      }
    }
    const pos =
      c.type === 'valve52_pilot'
        ? (spoolPos.get(c.id) ?? 0)
        : isValve32Actuated(c)
          ? 1
          : 0;

    compStates[c.id] = {
      portPressures,
      activeSpoolPos: pos,
    };

    if (c.type === 'valve52_pilot') {
      const nextActuated = pos === 1;
      if (Boolean(c.actuated) !== nextActuated) {
        spoolUpdates.push({ compId: c.id, newActuated: nextActuated });
      }
    }
  }

  return {
    snapshot: { lineStates, compStates },
    spoolUpdates,
  };
}

/**
 * Computes cylinder kinematics step (dt in seconds) using chamber pressures
 * and any flow control valves connected to cylinder ports.
 */
export function stepCylinderMotion(
  comp: PneumaticComponent,
  compState: ComponentRuntimeState | undefined,
  components: PneumaticComponent[],
  connections: PneumaticConnection[],
  dtSec: number,
  activeFault: PneumaticFaultType = 'none',
  boreMm = 50
): { strokePct: number; velocityPctPerSec: number } {
  const current = comp.strokePct ?? 0;
  const pA = compState?.portPressures['a'] ?? 0;
  const pB = compState?.portPressures['b'] ?? 0;

  // Find any flow control valve connected to port A or port B (meter-in or meter-out)
  let throttleFactor = activeFault === 'clogged_frl' ? 0.55 : 1.0;
  for (const conn of connections) {
    const otherCompId =
      conn.fromCompId === comp.id
        ? conn.toCompId
        : conn.toCompId === comp.id
          ? conn.fromCompId
          : null;
    if (!otherCompId) continue;
    const other = components.find((c) => c.id === otherCompId);
    if (other?.type === 'flow_control') {
      const pct = activeFault === 'stuck_fcv' ? 10 : (other.throttlePct ?? 50);
      const t = Math.max(0.08, pct / 100);
      throttleFactor = Math.min(throttleFactor, t);
    }
  }
  if (activeFault === 'stuck_fcv') {
    throttleFactor = Math.min(throttleFactor, 0.12);
  }

  let targetVel = 0;
  // Larger bore has larger area A = pi * D^2 / 4 -> slower stroke at fixed valve orifice
  const refAreaM2 = (Math.PI / 4) * mmToM(50) ** 2;
  const boreAreaM2 = (Math.PI / 4) * mmToM(Math.max(15, boreMm)) ** 2;
  const boreScale = Math.max(0.25, Math.min(2.5, refAreaM2 / boreAreaM2));
  const baseSpeed = 85 * boreScale; // % per second at 6 bar, 50 mm bore

  if (comp.type === 'cyl_single') {
    const springThreshold = 1.0; // bar needed to overcome return spring
    if (pA > springThreshold) {
      targetVel = baseSpeed * ((pA - springThreshold) / 5) * throttleFactor;
    } else {
      targetVel = -baseSpeed * 0.75 * throttleFactor;
    }
  } else if (comp.type === 'cyl_double') {
    const netBar = pA - pB;
    if (Math.abs(netBar) > 0.25) {
      targetVel = baseSpeed * (netBar / 6) * throttleFactor;
    } else {
      targetVel = 0;
    }
  }

  let next = current + targetVel * dtSec;
  let actualVel = targetVel;
  if (next >= 100) {
    next = 100;
    actualVel = current >= 100 ? 0 : targetVel;
  } else if (next <= 0) {
    next = 0;
    actualVel = current <= 0 ? 0 : targetVel;
  }

  return {
    strokePct: Number(next.toFixed(2)),
    velocityPctPerSec: Number(actualVel.toFixed(1)),
  };
}
