import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  HelpCircle,
  Layers,
  Plus,
  Power,
  RotateCcw,
  Trash2,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  DisplacementChart,
  type DisplacementSample,
} from './DisplacementChart';
import { IsoSymbol } from './IsoSymbols';
import { PneumaticCutawaySvg } from './PneumaticCutawaySvg';
import { COMPONENT_CATALOG, getPortPosition } from './pneumaticPorts';
import { PNEUMATIC_PRESETS } from './pneumaticPresets';
import { solvePneumaticNetwork, stepCylinderMotion } from './pneumaticSolver';
import type {
  PneumaticComponent,
  PneumaticComponentType,
  PneumaticConnection,
  PneumaticFaultType,
} from './pneumaticTypes';

const STROKE_LENGTH_MM = 200;

const FAULT_INFO: Record<
  Exclude<PneumaticFaultType, 'none'>,
  {
    label: string;
    symptom: string;
    fixHint: string;
  }
> = {
  clogged_frl: {
    label: 'Clogged FRL Filter',
    symptom:
      'Downstream FRL pressure drops >50% (starved supply), causing weak cylinder force and slow motion.',
    fixHint:
      'Inspect FRL ΔP gauge (P_in vs P_out). Replace or drain the clogged 5 μm filter element.',
  },
  leaking_pilot: {
    label: 'Leaking 5/2 Pilot Line',
    symptom:
      'Pilot signal (14/12) bleeds off before reaching spool shifting pressure (~2.2 bar) while wasting compressed air.',
    fixHint:
      'Check NL/min air consumption spike & pilot pressure; tighten or replace leaking push-in pilot fitting.',
  },
  stuck_fcv: {
    label: 'Stuck Meter-Out FCV',
    symptom:
      'Cylinder crawls at ~10% speed even when FCV throttle is open and FRL pressure is normal.',
    fixHint:
      'FRL ΔP is 0 and pilot shifts normally, but exhaust is choked—clean or replace the seized needle valve.',
  },
};

function clonePreset(presetId: string): {
  components: PneumaticComponent[];
  connections: PneumaticConnection[];
} {
  const preset =
    PNEUMATIC_PRESETS.find((p) => p.id === presetId) ?? PNEUMATIC_PRESETS[0];
  return {
    components: preset.components.map((c) => ({ ...c })),
    connections: preset.connections.map((c) => ({ ...c })),
  };
}

function buildElbowPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  const midY = (y1 + y2) / 2;
  if (Math.abs(x1 - x2) < 4 || Math.abs(y1 - y2) < 4) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
}

export function PneumaticSimulator() {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const [workspaceMode, setWorkspaceMode] = useState<'presets' | 'builder'>(
    'presets'
  );
  const [cadViewMode, setCadViewMode] = useState<'cutaway' | 'iso' | 'split'>(
    'cutaway'
  );
  const [activePresetId, setActivePresetId] = useState<string>(
    PNEUMATIC_PRESETS[0].id
  );
  const [components, setComponents] = useState<PneumaticComponent[]>(
    () => clonePreset(PNEUMATIC_PRESETS[0].id).components
  );
  const [connections, setConnections] = useState<PneumaticConnection[]>(
    () => clonePreset(PNEUMATIC_PRESETS[0].id).connections
  );

  const [compressorOn, setCompressorOn] = useState(true);
  const [supplyBar, setSupplyBar] = useState(6.0);
  const [boreMm, setBoreMm] = useState(50);
  const [rodMm, setRodMm] = useState(20);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wiringFrom, setWiringFrom] = useState<{
    compId: string;
    portId: string;
  } | null>(null);

  const [activeFault, setActiveFault] = useState<PneumaticFaultType>('none');
  const [blindMode, setBlindMode] = useState(false);
  const [blindTargetFault, setBlindTargetFault] =
    useState<Exclude<PneumaticFaultType, 'none'>>('clogged_frl');
  const [blindGuess, setBlindGuess] = useState<Exclude<
    PneumaticFaultType,
    'none'
  > | null>(null);

  const effectiveFault: PneumaticFaultType = blindMode
    ? blindTargetFault
    : activeFault;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    compId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const { snapshot, spoolUpdates } = useMemo(
    () =>
      solvePneumaticNetwork({
        components,
        connections,
        compressorOn,
        supplyBar,
        activeFault: effectiveFault,
      }),
    [components, connections, compressorOn, supplyBar, effectiveFault]
  );

  const [traceSamples, setTraceSamples] = useState<DisplacementSample[]>([
    { t: 0, strokePct: 0 },
  ]);
  const [measuredCpm, setMeasuredCpm] = useState(0);
  const simTimeRef = useRef(0);
  const lastSampleTimeRef = useRef(0);
  const cycleTimesRef = useRef<number[]>([]);
  const prevStrokeHighRef = useRef(false);

  const latestStateRef = useRef({
    components,
    connections,
    snapshot,
    spoolUpdates,
    effectiveFault,
    boreMm,
  });
  useEffect(() => {
    latestStateRef.current = {
      components,
      connections,
      snapshot,
      spoolUpdates,
      effectiveFault,
      boreMm,
    };
  });

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dtSec = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      simTimeRef.current += dtSec;

      const {
        components: curComps,
        connections: curConns,
        snapshot: curSnap,
        spoolUpdates: curSpoolUpdates,
        effectiveFault: curFault,
        boreMm: curBoreMm,
      } = latestStateRef.current;

      let changed = false;
      const nextComps = curComps.map((c) => {
        const spoolUpd = curSpoolUpdates.find((u) => u.compId === c.id);
        let updated = c;
        if (spoolUpd && c.actuated !== spoolUpd.newActuated) {
          changed = true;
          updated = { ...updated, actuated: spoolUpd.newActuated };
        }
        if (c.type !== 'cyl_single' && c.type !== 'cyl_double') return updated;
        const motion = stepCylinderMotion(
          updated,
          curSnap.compStates[c.id],
          curComps,
          curConns,
          dtSec,
          curFault,
          curBoreMm
        );
        if (
          Math.abs((updated.strokePct ?? 0) - motion.strokePct) > 0.01 ||
          (updated.velocityPctPerSec ?? 0) !== motion.velocityPctPerSec
        ) {
          changed = true;
          return {
            ...updated,
            strokePct: motion.strokePct,
            velocityPctPerSec: motion.velocityPctPerSec,
          };
        }
        return updated;
      });

      if (changed) {
        setComponents(nextComps);
      }

      // Record displacement sample at 20 Hz
      if (simTimeRef.current - lastSampleTimeRef.current >= 0.05) {
        lastSampleTimeRef.current = simTimeRef.current;
        const primaryCyl = nextComps.find(
          (c) => c.type === 'cyl_single' || c.type === 'cyl_double'
        );
        const pct = primaryCyl?.strokePct ?? 0;
        if (pct >= 96 && !prevStrokeHighRef.current) {
          prevStrokeHighRef.current = true;
          cycleTimesRef.current.push(simTimeRef.current);
          if (cycleTimesRef.current.length > 6) {
            cycleTimesRef.current.shift();
          }
          const tArr = cycleTimesRef.current;
          if (tArr.length >= 2) {
            setMeasuredCpm(
              (60 * (tArr.length - 1)) /
                Math.max(0.5, tArr[tArr.length - 1] - tArr[0])
            );
          }
        } else if (pct <= 10) {
          prevStrokeHighRef.current = false;
        }
        setTraceSamples((prev) => {
          const next = [
            ...prev,
            { t: Number(simTimeRef.current.toFixed(2)), strokePct: pct },
          ];
          return next.length > 160 ? next.slice(next.length - 160) : next;
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const cloned = clonePreset(presetId);
    setActivePresetId(presetId);
    setComponents(cloned.components);
    setConnections(cloned.connections);
    setSelectedId(null);
    setWiringFrom(null);
  }, []);

  const handleReset = () => {
    if (workspaceMode === 'presets') {
      loadPreset(activePresetId);
    } else {
      setComponents((prev) =>
        prev.map((c) => ({
          ...c,
          actuated: false,
          strokePct: 0,
          velocityPctPerSec: 0,
        }))
      );
    }
  };

  const getSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 450, y: 250 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 900;
    const y = ((clientY - rect.top) / rect.height) * 500;
    return {
      x: Math.max(55, Math.min(845, Math.round(x))),
      y: Math.max(45, Math.min(460, Math.round(y))),
    };
  };

  const handleStartDrag = (
    compId: string,
    e: React.PointerEvent<SVGGElement>
  ) => {
    if (e.button !== 0) return;
    const comp = components.find((c) => c.id === compId);
    if (!comp) return;
    const pt = getSvgCoords(e.clientX, e.clientY);
    dragRef.current = {
      compId,
      offsetX: comp.x - pt.x,
      offsetY: comp.y - pt.y,
    };
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const { compId, offsetX, offsetY } = dragRef.current;
    const pt = getSvgCoords(e.clientX, e.clientY);
    const nx = Math.max(55, Math.min(845, pt.x + offsetX));
    const ny = Math.max(45, Math.min(460, pt.y + offsetY));
    setComponents((prev) =>
      prev.map((c) => (c.id === compId ? { ...c, x: nx, y: ny } : c))
    );
  };

  const handleSvgPointerUp = () => {
    dragRef.current = null;
  };

  const handlePortClick = (
    compId: string,
    portId: string,
    _e: React.MouseEvent
  ) => {
    if (!wiringFrom) {
      setWiringFrom({ compId, portId });
      return;
    }
    if (wiringFrom.compId === compId && wiringFrom.portId === portId) {
      setWiringFrom(null);
      return;
    }
    if (wiringFrom.compId === compId) {
      setWiringFrom({ compId, portId });
      return;
    }

    const exists = connections.some(
      (cn) =>
        (cn.fromCompId === wiringFrom.compId &&
          cn.fromPortId === wiringFrom.portId &&
          cn.toCompId === compId &&
          cn.toPortId === portId) ||
        (cn.toCompId === wiringFrom.compId &&
          cn.toPortId === wiringFrom.portId &&
          cn.fromCompId === compId &&
          cn.fromPortId === portId)
    );

    if (!exists) {
      const isPilot =
        portId === '14' ||
        portId === '12' ||
        wiringFrom.portId === '14' ||
        wiringFrom.portId === '12';
      setConnections((prev) => [
        ...prev,
        {
          id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fromCompId: wiringFrom.compId,
          fromPortId: wiringFrom.portId,
          toCompId: compId,
          toPortId: portId,
          isPilot,
        },
      ]);
    }
    setWiringFrom(null);
  };

  const handleActuateDown = (compId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== compId) return c;
        if (c.type === 'valve52_pilot') {
          return { ...c, actuated: !c.actuated };
        }
        if (c.type === 'valve32_pb' || c.type === 'valve32_limit') {
          if (c.latched) {
            return { ...c, actuated: !c.actuated };
          }
          return { ...c, actuated: true };
        }
        return c;
      })
    );
  };

  const handleActuateUp = (compId: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== compId) return c;
        if (
          (c.type === 'valve32_pb' || c.type === 'valve32_limit') &&
          !c.latched &&
          c.actuated
        ) {
          return { ...c, actuated: false };
        }
        return c;
      })
    );
  };

  const addComponent = (type: PneumaticComponentType) => {
    const catalog = COMPONENT_CATALOG[type];
    const count = components.filter((c) => c.type === type).length + 1;
    const newId = `${type}-${Date.now().toString(36)}`;
    const newComp: PneumaticComponent = {
      id: newId,
      type,
      label: `${catalog.shortLabel} ${count}`,
      x: 160 + ((components.length * 65) % 580),
      y: 120 + ((components.length * 55) % 280),
      actuated: false,
      latched: type === 'valve32_pb',
      throttlePct: type === 'flow_control' ? 50 : undefined,
      strokePct:
        type === 'cyl_single' || type === 'cyl_double' ? 0 : undefined,
    };
    setComponents((prev) => [...prev, newComp]);
    setSelectedId(newId);
  };

  const deleteComponent = (compId: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== compId));
    setConnections((prev) =>
      prev.filter((cn) => cn.fromCompId !== compId && cn.toCompId !== compId)
    );
    if (selectedId === compId) setSelectedId(null);
    if (wiringFrom?.compId === compId) setWiringFrom(null);
  };

  const deleteConnection = (connId: string) => {
    setConnections((prev) => prev.filter((cn) => cn.id !== connId));
  };

  const clearCanvas = () => {
    setComponents([]);
    setConnections([]);
    setSelectedId(null);
    setWiringFrom(null);
  };

  const startBlindChallenge = () => {
    const faultPool: Array<Exclude<PneumaticFaultType, 'none'>> = [
      'clogged_frl',
      'leaking_pilot',
      'stuck_fcv',
    ];
    const picked = faultPool[Math.floor(Math.random() * faultPool.length)];
    // Load meter-out-speed preset so FRL, 5/2 Pilot DCV, and FCV are all present
    setWorkspaceMode('presets');
    loadPreset('meter-out-speed');
    setBlindTargetFault(picked);
    setBlindGuess(null);
    setBlindMode(true);
    setActiveFault('none');
  };

  const activePreset = PNEUMATIC_PRESETS.find((p) => p.id === activePresetId);
  const selectedComp = components.find((c) => c.id === selectedId) ?? null;
  const cylinders = components.filter(
    (c) => c.type === 'cyl_single' || c.type === 'cyl_double'
  );

  const pressureMPa = supplyBar * 0.1;
  const areaBoreMm2 = (Math.PI / 4) * boreMm * boreMm;
  const effectiveRod = Math.min(rodMm, boreMm - 4);
  const areaAnnulusMm2 =
    (Math.PI / 4) * (boreMm * boreMm - effectiveRod * effectiveRod);
  const maxExtendForceN = pressureMPa * areaBoreMm2;
  const maxRetractForceN = pressureMPa * areaAnnulusMm2;

  // FRL upstream/downstream pressure telemetry
  const frlComp = components.find((c) => c.type === 'frl');
  const frlInBar = frlComp
    ? (snapshot.compStates[frlComp.id]?.portPressures['in'] ?? 0)
    : compressorOn
      ? supplyBar
      : 0;
  const frlOutBar = frlComp
    ? (snapshot.compStates[frlComp.id]?.portPressures['out'] ?? 0)
    : frlInBar;
  const frlDeltaP = Math.max(0, frlInBar - frlOutBar);

  // Air Consumption (NL/min) & Energy Cost ($/hr)
  const cylVolLiters =
    ((Math.PI / 4) * (boreMm / 100) * (boreMm / 100) * (STROKE_LENGTH_MM / 10)) ;
  const compressionRatio = (Math.max(0, frlOutBar) + 1) / 1;
  const movingCylCount = cylinders.filter(
    (c) => Math.abs(c.velocityPctPerSec ?? 0) > 0.5
  ).length;
  const activeStrokeNlMin =
    compressorOn && movingCylCount > 0
      ? cylVolLiters * compressionRatio * 18 * movingCylCount
      : 0;
  const baselineLeakNlMin = compressorOn ? 8.5 : 0;
  const faultLeakNlMin =
    compressorOn && effectiveFault === 'leaking_pilot'
      ? 95.0
      : compressorOn && effectiveFault === 'clogged_frl'
        ? 14.0
        : 0;
  const totalNlMin = activeStrokeNlMin + baselineLeakNlMin + faultLeakNlMin;
  // Standard industrial compressed air cost: ~$0.025 per Nm^3 (1000 NL)
  const energyCostPerHr = totalNlMin * 60 * 0.000025;
  const energyCostPerYr = energyCostPerHr * 6000;

  const gridStroke = 'var(--md-outline-variant)';
  const lineIdle = isDark ? '#475569' : '#94a3b8';
  const linePressurized = isDark ? '#22d3ee' : '#0891b2';
  const linePilot = isDark ? '#fbbf24' : '#d97706';

  const primaryCyl = cylinders[0];
  const primaryCylState = primaryCyl
    ? snapshot.compStates[primaryCyl.id]
    : undefined;
  const isPrimaryDoubleActing = primaryCyl?.type !== 'cyl_single';
  const cutawayPABar = primaryCylState?.portPressures['A'] ?? 0;
  const cutawayPBBar = isPrimaryDoubleActing
    ? (primaryCylState?.portPressures['B'] ?? 0)
    : 0;
  const dcv52Comp = components.find((c) => c.type === 'valve52_pilot');
  const pb32Comps = components.filter((c) => c.type === 'valve32_pb');
  const cutawaySpoolPos: 0 | 1 = dcv52Comp
    ? dcv52Comp.actuated
      ? 1
      : 0
    : pb32Comps.length > 0 && pb32Comps.every((v) => v.actuated)
      ? 1
      : cutawayPABar > 0.3
        ? 1
        : 0;
  const fcvComps = components.filter((c) => c.type === 'flow_control');
  const cutawayHasFcv = fcvComps.length > 0;
  const cutawayFcvOpenPct = cutawayHasFcv
    ? Math.round(
        fcvComps.reduce((acc, c) => acc + (c.throttlePct ?? 50), 0) /
          fcvComps.length
      )
    : 100;
  const limitValveComp = components.find((c) => c.type === 'valve32_limit');
  const cutawayHasLimitSwitch = Boolean(limitValveComp);
  const cutawayLimitTripped = Boolean(
    limitValveComp?.actuated || (primaryCyl?.strokePct ?? 0) >= 95
  );

  const handleCutawayShiftSpool = (targetPos: 0 | 1) => {
    const wantActuated = targetPos === 1;
    setComponents((prev) => {
      const has52 = prev.some((c) => c.type === 'valve52_pilot');
      return prev.map((c) => {
        if (has52) {
          if (c.type === 'valve52_pilot') {
            return { ...c, actuated: wantActuated };
          }
          if (c.type === 'valve32_pb' && c.latched && !wantActuated) {
            return { ...c, actuated: false };
          }
          return c;
        }
        if (c.type === 'valve32_pb') {
          return { ...c, actuated: wantActuated };
        }
        return c;
      });
    });
  };

  const effectiveCadView: 'cutaway' | 'iso' | 'split' =
    workspaceMode === 'builder' ? 'iso' : cadViewMode;

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-3.5 sm:px-5" data-tour="pneu-toolbar">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
            <button
              type="button"
              onClick={() => setWorkspaceMode('presets')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                workspaceMode === 'presets'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              {pick('Pre-built Circuits', 'Sirkuit Prasetel', 'プリセット回路')}
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('builder')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                workspaceMode === 'builder'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              {pick('Interactive Builder', 'Perakit Interaktif', '回路ビルダー')}
            </button>
          </div>

          {workspaceMode === 'presets' && (
            <select
              value={activePresetId}
              onChange={(e) => loadPreset(e.target.value)}
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
            >
              {PNEUMATIC_PRESETS.map((p) => {
                const localizedName =
                  p.id === 'direct-single'
                    ? pick(p.name, 'Kontrol Kerja Tunggal Langsung', '単動シリンダ直接制御')
                    : p.id === 'indirect-double'
                      ? pick(p.name, 'Pilot 5/2 Kerja Ganda Tidak Langsung', '複動5/2パイロット間接制御')
                      : p.id === 'semi-auto-limit'
                        ? pick(p.name, 'Balik Semi-Otomatis (Limit Switch)', 'リミットSW半自動復帰')
                        : p.id === 'and-or-safety'
                          ? pick(p.name, 'Sirkuit Keselamatan AND / OR', 'AND/OR 二圧安全回路')
                          : pick(p.name, 'Kontrol Kecepatan Meter-Out', 'メータアウト速度制御回路');
                return (
                  <option key={p.id} value={p.id}>
                    {localizedName}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {/* Supply & Cylinder Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setCompressorOn((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
              compressorOn
                ? 'm3-btn-filled font-bold'
                : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            {pick('Compressor', 'Kompresor', 'コンプレッサ')}{' '}
            {compressorOn ? 'ON' : 'OFF'}
          </button>

          <label className="flex items-center gap-2 text-xs text-[var(--md-on-surface)]">
            <span className="text-[var(--md-on-surface-variant)]">
              {pick('Supply:', 'Suplai:', '供給圧:')}
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={supplyBar}
              onChange={(e) => setSupplyBar(Number(e.target.value))}
              className="w-24"
            />
            <span className="w-14 font-mono font-bold text-[var(--md-primary)]">
              {supplyBar.toFixed(1)} bar
            </span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-[var(--md-on-surface)]">
            <span className="text-[var(--md-on-surface-variant)]">
              {pick('Bore:', 'Bore:', '内径:')}
            </span>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={boreMm}
              onChange={(e) => setBoreMm(Number(e.target.value))}
              className="w-20"
            />
            <span className="w-12 font-mono font-semibold text-[var(--md-on-surface)]">
              {boreMm} mm
            </span>
          </label>

          <button
            type="button"
            onClick={handleReset}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Preset Description Banner */}
      {workspaceMode === 'presets' && activePreset && (
        <div className="rounded-[22px] border border-[var(--md-primary)]/25 bg-[var(--md-primary-container)] px-4 py-2.5 text-xs text-[var(--md-on-primary-container)]">
          <span className="font-bold">
            {activePreset.name}:{' '}
          </span>
          {activePreset.description}
        </div>
      )}

      {/* Plant Fault Troubleshooting Bar */}
      <div className="glass-panel rounded-[28px] p-3.5 sm:px-5" data-tour="pneu-faults">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              {pick('Plant Faults:', 'Gangguan Pabrik:', '設備異常:')}
            </span>
            {(
              [
                ['none', pick('Healthy', 'Normal', '正常')],
                [
                  'clogged_frl',
                  pick('Clogged FRL Filter', 'Filter FRL Tersumbat', 'FRLフィルタ詰まり'),
                ],
                [
                  'leaking_pilot',
                  pick('Leaking 5/2 Pilot Line', 'Jalur Pilot 5/2 Bocor', '5/2パイロット漏れ'),
                ],
                [
                  'stuck_fcv',
                  pick('Stuck Meter-Out FCV', 'FCV Meter-Out Macet', 'メータアウトFCV固着'),
                ],
              ] as const
            ).map(([faultKey, label]) => {
              const isActive = !blindMode && activeFault === faultKey;
              return (
                <button
                  key={faultKey}
                  type="button"
                  onClick={() => {
                    setBlindMode(false);
                    setBlindGuess(null);
                    setActiveFault(faultKey);
                  }}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    isActive
                      ? 'bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/40'
                      : 'glass-pill font-medium text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={startBlindChallenge}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
              blindMode
                ? 'm3-btn-filled font-bold'
                : 'm3-btn-tonal font-semibold'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {blindMode
              ? pick('New Blind Fault', 'Uji Buta Baru', '新しいブラインド異常')
              : pick('Blind Fault Challenge', 'Tantangan Uji Buta', 'ブラインド異常診断')}
          </button>
        </div>

        {/* Active Fault Hint or Blind Challenge Panel */}
        {!blindMode && activeFault !== 'none' && (
          <div className="mt-3 rounded-[20px] border border-amber-300/60 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
            <span className="font-semibold">
              {FAULT_INFO[activeFault].label}:{' '}
            </span>
            {FAULT_INFO[activeFault].symptom}{' '}
            <span className="text-amber-700 dark:text-amber-300">
              ({FAULT_INFO[activeFault].fixHint})
            </span>
          </div>
        )}

        {blindMode && (
          <div className="mt-3 rounded-[20px] border border-amber-300/60 bg-amber-50/80 p-3.5 text-xs dark:border-amber-500/40 dark:bg-amber-950/30">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                Blind Fault Active — Actuate S1/S2 and inspect FRL ΔP, pilot
                shifting, cylinder speed, and NL/min air flow to diagnose:
              </span>
              <button
                type="button"
                onClick={() => {
                  setBlindMode(false);
                  setBlindGuess(null);
                }}
                className="text-[11px] font-medium text-[var(--md-on-surface-variant)] underline hover:text-[var(--md-on-surface)]"
              >
                Exit Challenge
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                ['clogged_frl', 'leaking_pilot', 'stuck_fcv'] as const
              ).map((option) => {
                const picked = blindGuess === option;
                const isCorrect = option === blindTargetFault;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBlindGuess(option)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                      picked
                        ? isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {FAULT_INFO[option].label}
                  </button>
                );
              })}
            </div>
            {blindGuess && (
              <div
                className={`mt-2 flex items-start gap-1.5 text-xs ${
                  blindGuess === blindTargetFault
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {blindGuess === blindTargetFault
                    ? `Correct! ${FAULT_INFO[blindTargetFault].fixHint}`
                    : `Not quite — check the FRL ΔP gauge (${frlDeltaP.toFixed(1)} bar), pilot spool response, and air consumption (${totalNlMin.toFixed(0)} NL/min).`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Builder Component Palette */}
      {workspaceMode === 'builder' && (
        <div className="glass-panel rounded-[28px] p-4">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              Add ISO 1219 Component
            </span>
            <div className="flex items-center gap-2 text-[11px] text-[var(--md-on-surface-variant)]">
              <span>
                Drag to move • Click two ports to connect • Click line to remove
              </span>
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1 rounded-full border border-rose-300/60 bg-rose-50 px-2.5 py-0.5 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
              >
                <Trash2 className="h-3 w-3" />
                Clear Canvas
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              Object.keys(COMPONENT_CATALOG) as PneumaticComponentType[]
            ).map((type) => {
              const item = COMPONENT_CATALOG[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addComponent(type)}
                  className="glass-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Workspace Grid: Canvas + Telemetry */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column: 2D CAD Cutaway / ISO 1219 Schematic + Displacement-Step Chart */}
        <div className="space-y-4 lg:col-span-8" data-tour="pneu-viewport">
          {workspaceMode === 'presets' && (
            <div className="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-[24px] px-4 py-2.5" data-tour="pneu-view-mode">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Visualizer Mode', 'Mode Tampilan', '表示モード')}
              </span>
              <div className="inline-flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                {(
                  [
                    [
                      'cutaway',
                      pick('2D CAD Cutaway', 'Potongan CAD 2D', '2D CAD断面図'),
                    ],
                    [
                      'iso',
                      pick('ISO 1219 Circuit', 'Sirkuit ISO 1219', 'ISO 1219回路図'),
                    ],
                    [
                      'split',
                      pick('Cutaway + ISO Split', 'Gabungan CAD + ISO', '断面+ISO分割'),
                    ],
                  ] as const
                ).map(([modeKey, label]) => (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => setCadViewMode(modeKey)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      cadViewMode === modeKey
                        ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(effectiveCadView === 'cutaway' || effectiveCadView === 'split') && (
            <div className="glass-panel overflow-hidden rounded-[28px]">
              <PneumaticCutawaySvg
                compressorOn={compressorOn}
                supplyBar={supplyBar}
                frlInBar={frlInBar}
                frlOutBar={frlOutBar}
                strokePct={primaryCyl?.strokePct ?? 0}
                boreMm={boreMm}
                rodMm={rodMm}
                pABar={cutawayPABar}
                pBBar={cutawayPBBar}
                spoolPos={cutawaySpoolPos}
                isDoubleActing={isPrimaryDoubleActing}
                fcvOpenPct={cutawayFcvOpenPct}
                hasFcv={cutawayHasFcv}
                hasLimitSwitch={cutawayHasLimitSwitch}
                limitTripped={cutawayLimitTripped}
                activeFault={effectiveFault}
                totalNlMin={totalNlMin}
                velocityPctPerSec={primaryCyl?.velocityPctPerSec ?? 0}
                onShiftSpool={handleCutawayShiftSpool}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-4 py-2.5 text-[11px] text-[var(--md-on-surface-variant)]">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-full bg-cyan-500" />
                    {pick('Supply / Pressurized', 'Suplai / Bertekanan', '供給・加圧')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-full bg-amber-500" />
                    {pick('Pilot / Regulated', 'Pilot / Teregulasi', 'パイロット・調圧')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-full bg-[var(--md-outline)]" />
                    {pick('Exhaust / Muffler Vent', 'Buang / Silencer', '排気・サイレンサ')}
                  </span>
                </div>
                <span>
                  {pick(
                    'Click SOL 14 / SOL 12 or EXTEND / RETRACT in CAD cutaway to shift 5/2 spool',
                    'Klik SOL 14 / SOL 12 atau EXTEND / RETRACT pada potongan CAD untuk menggeser spool 5/2',
                    'CAD断面図のSOL 14 / SOL 12またはEXTEND / RETRACTをクリックして5/2スプールを切替'
                  )}
                </span>
              </div>
            </div>
          )}

          {(effectiveCadView === 'iso' || effectiveCadView === 'split') && (
          <div className="glass-panel relative flex flex-col overflow-hidden rounded-[28px]">
          {wiringFrom && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 shadow-xs dark:border-amber-500/40 dark:bg-amber-950/85 dark:text-amber-200">
              <span>Select destination port to connect air line...</span>
              <button
                type="button"
                onClick={() => setWiringFrom(null)}
                className="underline hover:opacity-80"
              >
                Cancel
              </button>
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox="0 0 900 500"
            className="h-[460px] w-full touch-none"
            style={{ background: 'var(--md-surface-container-lowest)' }}
            onClick={() => {
              setSelectedId(null);
              setWiringFrom(null);
            }}
            onPointerMove={handleSvgPointerMove}
            onPointerUp={handleSvgPointerUp}
            onPointerLeave={handleSvgPointerUp}
          >
            <defs>
              <pattern
                id="pneu-grid"
                width="25"
                height="25"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 25 0 L 0 0 0 25"
                  fill="none"
                  stroke={gridStroke}
                  strokeOpacity="0.35"
                  strokeWidth="0.7"
                />
              </pattern>
            </defs>

            <rect width="900" height="500" fill="url(#pneu-grid)" />

            {/* Air Lines */}
            {connections.map((conn) => {
              const fromComp = components.find((c) => c.id === conn.fromCompId);
              const toComp = components.find((c) => c.id === conn.toCompId);
              if (!fromComp || !toComp) return null;
              const p1 = getPortPosition(fromComp, conn.fromPortId);
              const p2 = getPortPosition(toComp, conn.toPortId);
              const d = buildElbowPath(p1.x, p1.y, p2.x, p2.y);
              const state = snapshot.lineStates[conn.id];
              const pressurized = state?.pressurized ?? false;

              const stroke = pressurized
                ? conn.isPilot
                  ? linePilot
                  : linePressurized
                : lineIdle;

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const isHoriz = Math.abs(p1.x - p2.x) >= Math.abs(p1.y - p2.y);
              const arrowAngle = isHoriz
                ? p2.x >= p1.x
                  ? 0
                  : 180
                : p2.y >= p1.y
                  ? 90
                  : -90;

              return (
                <g
                  key={conn.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (workspaceMode === 'builder') {
                      deleteConnection(conn.id);
                    }
                  }}
                  className={
                    workspaceMode === 'builder' ? 'cursor-pointer' : ''
                  }
                >
                  <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
                  <path
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={pressurized ? 2.8 : 2}
                    strokeDasharray={conn.isPilot ? '6 4' : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pressurized && (
                    <>
                      <path
                        d={d}
                        fill="none"
                        stroke={isDark ? '#e0f2fe' : '#ffffff'}
                        strokeWidth={1.6}
                        strokeDasharray="4 14"
                        strokeLinecap="round"
                        opacity={0.75}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="18"
                          to="0"
                          dur={effectiveFault === 'stuck_fcv' ? '1.6s' : '0.65s'}
                          repeatCount="indefinite"
                        />
                      </path>
                      <g
                        transform={`translate(${midX}, ${midY}) rotate(${arrowAngle})`}
                        className="pointer-events-none"
                      >
                        <polygon
                          points="-4,-3.5 5,0 -4,3.5"
                          fill={stroke}
                        />
                      </g>
                    </>
                  )}
                  <title>
                    {pressurized
                      ? `Pressurized: ${state.pressureBar.toFixed(1)} bar (${state.flowLpm} L/min)`
                      : 'Exhaust / Unpressurized (0 bar)'}
                  </title>
                </g>
              );
            })}

            {/* ISO 1219 Components */}
            {components.map((comp) => (
              <IsoSymbol
                key={comp.id}
                comp={comp}
                runtime={snapshot.compStates[comp.id]}
                compressorOn={compressorOn}
                supplyBar={supplyBar}
                selected={selectedId === comp.id}
                isDark={isDark}
                wiringFrom={wiringFrom}
                onSelect={setSelectedId}
                onStartDrag={handleStartDrag}
                onPortClick={handlePortClick}
                onActuateDown={handleActuateDown}
                onActuateUp={handleActuateUp}
              />
            ))}
          </svg>

          {/* Bottom Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-4 py-2.5 text-[11px] text-[var(--md-on-surface-variant)]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                {pick('Pressurized Air', 'Udara Bertekanan', '加圧空気')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full bg-amber-600 dark:bg-amber-400" />
                {pick('Pilot Signal', 'Sinyal Pilot', 'パイロット信号')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-full bg-[var(--md-outline)]" />
                {pick('Exhaust / 0 bar', 'Buang / 0 bar', '排気 / 0 bar')}
              </span>
            </div>
            <span>
              {pick(
                'Click 3/2 pushbuttons or 5/2 valve to actuate',
                'Klik tombol tekan 3/2 atau katup 5/2 untuk mengaktifkan',
                '3/2押ボタンまたは5/2弁をクリックして作動'
              )}
            </span>
          </div>
          </div>
          )}

          {(() => {
            const primaryCyl = cylinders[0];
            const vel = primaryCyl?.velocityPctPerSec ?? 0;
            const fcvList = components.filter((c) => c.type === 'flow_control');
            const avgThrottle =
              fcvList.length > 0
                ? Math.round(
                    fcvList.reduce((acc, c) => acc + (c.throttlePct ?? 50), 0) /
                      fcvList.length
                  )
                : 100;

            let flowDirectionLabel = pick(
              'Idle (Hold / Exhausted)',
              'Diam (Tahan / Terbuang)',
              '待機 (保持 / 排気)'
            );
            let flowDirectionTone: 'cyan' | 'amber' | 'rose' | 'slate' =
              'slate';
            if (effectiveFault === 'stuck_fcv') {
              flowDirectionLabel = pick(
                'FCV Seized (10% Choked Exhaust)',
                'FCV Macet (Buang Tercekik 10%)',
                'FCV固着 (排気10%絞り)'
              );
              flowDirectionTone = 'rose';
            } else if (effectiveFault === 'clogged_frl') {
              flowDirectionLabel = pick(
                'Starved Supply (High FRL ΔP)',
                'Suplai Terhambat (ΔP FRL Tinggi)',
                '供給不足 (FRL差圧大)'
              );
              flowDirectionTone = 'amber';
            } else if (Math.abs(vel) > 0.5) {
              const dir =
                vel > 0
                  ? pick('Extending →', 'Maju →', '前進 →')
                  : pick('← Retracting', '← Mundur', '← 後退');
              if (fcvList.length > 0) {
                flowDirectionLabel = `${pick('Meter-Out', 'Meter-Out', 'メータアウト')} ${avgThrottle}% (${dir})`;
              } else {
                flowDirectionLabel = `${pick('Quick-Exhaust Full Flow', 'Buang Cepat Aliran Penuh', '急速排気全開')} (${dir})`;
              }
              flowDirectionTone = 'cyan';
            } else if (fcvList.length > 0) {
              flowDirectionLabel = `${pick('Meter-Out Set @', 'Meter-Out @', 'メータアウト設定')} ${avgThrottle}%`;
              flowDirectionTone = 'slate';
            }

            const instCpm =
              Math.abs(vel) > 0.5 ? (Math.abs(vel) / 200) * 60 : 0;
            const cycleRateCpm = instCpm > 0 ? instCpm : measuredCpm;

            return (
              <DisplacementChart
                samples={traceSamples}
                cycleRateCpm={cycleRateCpm}
                flowDirectionLabel={flowDirectionLabel}
                flowDirectionTone={flowDirectionTone}
                onClear={() => {
                  cycleTimesRef.current = [];
                  setMeasuredCpm(0);
                  setTraceSamples([
                    {
                      t: Number(simTimeRef.current.toFixed(2)),
                      strokePct: primaryCyl?.strokePct ?? 0,
                    },
                  ]);
                }}
              />
            );
          })()}
        </div>

        {/* Right Telemetry & Inspector Panel */}
        <div className="space-y-4 lg:col-span-4">
          {/* Live Cylinder Readouts */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5" data-tour="pneu-telemetry">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--md-on-surface)]">
                <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('Cylinder Telemetry', 'Telemetri Silinder', 'シリンダ計測値')}
              </h3>
              <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                D={boreMm}mm, d={effectiveRod}mm
              </span>
            </div>

            {cylinders.length === 0 ? (
              <p className="text-xs text-[var(--md-on-surface-variant)]">
                Add a Single-Acting or Double-Acting Cylinder to view live
                force, flow, and stroke readouts.
              </p>
            ) : (
              <div className="space-y-3">
                {cylinders.map((cyl) => {
                  const state = snapshot.compStates[cyl.id];
                  const pA = state?.portPressures['a'] ?? 0;
                  const pB = state?.portPressures['b'] ?? 0;
                  const pct = cyl.strokePct ?? 0;
                  const strokeMm = (pct / 100) * STROKE_LENGTH_MM;

                  const liveExtendN = pA * 0.1 * areaBoreMm2;
                  const liveRetractN =
                    cyl.type === 'cyl_double' ? pB * 0.1 * areaAnnulusMm2 : 0;
                  const netForceN = liveExtendN - liveRetractN;
                  const activeFlowLpm =
                    Math.abs(cyl.velocityPctPerSec ?? 0) > 0.5
                      ? Number((Math.max(pA, pB) * 14.5).toFixed(1))
                      : 0;

                  return (
                    <div
                      key={cyl.id}
                      className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-xs"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-bold text-[var(--md-primary)]">
                          {cyl.label}
                        </span>
                        <span className="font-mono text-[var(--md-on-surface-variant)]">
                          {strokeMm.toFixed(0)} / {STROKE_LENGTH_MM} mm (
                          {pct.toFixed(0)}%)
                        </span>
                      </div>

                      <div className="mb-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                        <div
                          className="h-full rounded-full bg-[var(--md-primary)] transition-all duration-75"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded-2xl border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container-low)] px-2.5 py-2">
                          <div className="text-[var(--md-on-surface-variant)]">
                            Chamber A / B
                          </div>
                          <div className="font-mono font-semibold text-[var(--md-on-surface)]">
                            {pA.toFixed(1)} / {pB.toFixed(1)} bar
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container-low)] px-2.5 py-2">
                          <div className="text-[var(--md-on-surface-variant)]">
                            Live Net Force
                          </div>
                          <div className="font-mono font-bold text-[var(--md-primary)]">
                            {netForceN >= 0 ? '+' : ''}
                            {netForceN.toFixed(0)} N
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container-low)] px-2.5 py-2">
                          <div className="text-[var(--md-on-surface-variant)]">
                            Max Ext / Ret
                          </div>
                          <div className="font-mono text-[var(--md-on-surface)]">
                            {maxExtendForceN.toFixed(0)} /{' '}
                            {maxRetractForceN.toFixed(0)} N
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container-low)] px-2.5 py-2">
                          <div className="text-[var(--md-on-surface-variant)]">
                            Air Flow
                          </div>
                          <div className="font-mono text-[var(--md-on-surface)]">
                            {activeFlowLpm.toFixed(1)} L/min
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Air Consumption & Compressed-Air Energy Cost */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5" data-tour="pneu-air-cost">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--md-on-surface)]">
                <Zap className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Air Consumption & Cost',
                  'Konsumsi Udara & Biaya',
                  '空気消費量・エネルギーコスト'
                )}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                  faultLeakNlMin > 20
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                    : frlDeltaP > 1.0
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                }`}
              >
                {faultLeakNlMin > 20
                  ? pick('AIR LEAK DETECTED', 'KEBOCORAN UDARA', 'エア漏れ検知')
                  : frlDeltaP > 1.0
                    ? pick('HIGH FRL ΔP', 'ΔP FRL TINGGI', 'FRL差圧異常')
                    : pick('NOMINAL', 'NORMAL', '正常')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Total Air Flow', 'Total Aliran Udara', '総空気流量')}
                </div>
                <div className="font-mono text-sm font-bold text-[var(--md-primary)]">
                  {totalNlMin.toFixed(1)} NL/min
                </div>
              </div>
              <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Energy Cost', 'Biaya Energi', '電力コスト')}
                </div>
                <div className="font-mono text-sm font-bold text-[var(--md-on-surface)]">
                  ${energyCostPerHr.toFixed(3)}/hr
                </div>
                <div className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
                  ~${energyCostPerYr.toFixed(0)}/yr (6,000h)
                </div>
              </div>
              <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('FRL Gauge (In → Out)', 'Pengukur FRL (In → Out)', 'FRL圧力計 (入口→出口)')}
                </div>
                <div
                  className={`font-mono font-semibold ${
                    frlDeltaP > 1.0
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-[var(--md-on-surface)]'
                  }`}
                >
                  {frlInBar.toFixed(1)} → {frlOutBar.toFixed(1)} bar
                </div>
              </div>
              <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Leakage / Baseline', 'Kebocoran / Dasar', '漏れ / 基礎消費')}
                </div>
                <div
                  className={`font-mono font-semibold ${
                    faultLeakNlMin > 0
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-[var(--md-on-surface)]'
                  }`}
                >
                  {(baselineLeakNlMin + faultLeakNlMin).toFixed(1)} NL/min
                </div>
              </div>
            </div>
          </div>

          {/* Selected Component Inspector */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[var(--md-on-surface)]">
              <Wind className="h-4 w-4 text-[var(--md-primary)]" />
              {pick('Component Inspector', 'Inspektor Komponen', '部品インスペクタ')}
            </h3>

            {!selectedComp ? (
              <p className="text-xs text-[var(--md-on-surface-variant)]">
                Click any component on the schematic to inspect its ports,
                adjust flow control throttle %, or toggle pushbutton latching.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[var(--md-on-surface)]">
                      {selectedComp.label}
                    </div>
                    <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                      {COMPONENT_CATALOG[selectedComp.type].name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteComponent(selectedComp.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-300/60 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>

                {selectedComp.type === 'flow_control' && (
                  <label className="block space-y-1">
                    <div className="flex justify-between text-[var(--md-on-surface)]">
                      <span>Throttle Opening</span>
                      <span className="font-mono font-bold text-[var(--md-primary)]">
                        {selectedComp.throttlePct ?? 50}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={selectedComp.throttlePct ?? 50}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setComponents((prev) =>
                          prev.map((c) =>
                            c.id === selectedComp.id
                              ? {
                                  ...c,
                                  throttlePct: val,
                                  label: c.label.replace(
                                    /\(\d+%\)/,
                                    `(${val}%)`
                                  ),
                                }
                              : c
                          )
                        );
                      }}
                      className="w-full"
                    />
                  </label>
                )}

                {selectedComp.type === 'valve32_pb' && (
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-[var(--md-on-surface)]">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedComp.latched)}
                        onChange={(e) =>
                          setComponents((prev) =>
                            prev.map((c) =>
                              c.id === selectedComp.id
                                ? { ...c, latched: e.target.checked }
                                : c
                            )
                          )
                        }
                      />
                      Latching Pushbutton
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setComponents((prev) =>
                          prev.map((c) =>
                            c.id === selectedComp.id
                              ? { ...c, actuated: !c.actuated }
                              : c
                          )
                        )
                      }
                      className="m3-btn-tonal px-3 py-1.5 text-xs font-bold"
                    >
                      {selectedComp.actuated ? 'Release' : 'Actuate'}
                    </button>
                  </div>
                )}

                {selectedComp.type === 'valve32_limit' && (
                  <label className="block space-y-1">
                    <span className="text-[var(--md-on-surface)]">
                      Linked Cylinder (trips at ≥96% stroke)
                    </span>
                    <select
                      value={selectedComp.linkedCylinderId ?? ''}
                      onChange={(e) =>
                        setComponents((prev) =>
                          prev.map((c) =>
                            c.id === selectedComp.id
                              ? { ...c, linkedCylinderId: e.target.value }
                              : c
                          )
                        )
                      }
                      className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    >
                      <option value="">None (Manual)</option>
                      {cylinders.map((cyl) => (
                        <option key={cyl.id} value={cyl.id}>
                          {cyl.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {selectedComp.type === 'cyl_double' && (
                  <label className="block space-y-1">
                    <div className="flex justify-between text-[var(--md-on-surface)]">
                      <span>Rod Diameter</span>
                      <span className="font-mono font-bold text-[var(--md-primary)]">
                        {effectiveRod} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={40}
                      step={2}
                      value={rodMm}
                      onChange={(e) => setRodMm(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
