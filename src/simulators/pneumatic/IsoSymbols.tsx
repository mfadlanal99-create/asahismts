import type { ComponentRuntimeState, PneumaticComponent } from './pneumaticTypes';
import { COMPONENT_CATALOG } from './pneumaticPorts';

interface IsoSymbolProps {
  comp: PneumaticComponent;
  runtime?: ComponentRuntimeState;
  compressorOn: boolean;
  supplyBar: number;
  selected: boolean;
  isDark: boolean;
  wiringFrom?: { compId: string; portId: string } | null;
  onSelect: (compId: string) => void;
  onStartDrag: (compId: string, e: React.PointerEvent<SVGGElement>) => void;
  onPortClick: (compId: string, portId: string, e: React.MouseEvent) => void;
  onActuateDown: (compId: string, e: React.MouseEvent) => void;
  onActuateUp: (compId: string) => void;
}

export function IsoSymbol({
  comp,
  runtime,
  compressorOn,
  supplyBar,
  selected,
  isDark,
  wiringFrom,
  onSelect,
  onStartDrag,
  onPortClick,
  onActuateDown,
  onActuateUp,
}: IsoSymbolProps) {
  const catalog = COMPONENT_CATALOG[comp.type];
  const spoolPos = runtime?.activeSpoolPos ?? 0;
  const isActuated = spoolPos === 1;

  // Theme-aware SVG palette
  const bodyBg = isDark ? '#0f172a' : '#ffffff';
  const inactiveStroke = isDark ? '#64748b' : '#94a3b8';
  const neutralStroke = isDark ? '#94a3b8' : '#475569';
  const arrowStroke = isDark ? '#cbd5e1' : '#334155';
  const activeCyan = isDark ? '#22d3ee' : '#0891b2';
  const activeCyanText = isDark ? '#67e8f9' : '#0e7490';
  const labelFill = isDark ? '#cbd5e1' : '#1e293b';
  const activeFill = isDark
    ? 'rgba(34, 211, 238, 0.14)'
    : 'rgba(8, 145, 178, 0.10)';
  const normalFill = isDark
    ? 'rgba(148, 163, 184, 0.08)'
    : 'rgba(100, 116, 139, 0.06)';
  const chamberFill = isDark
    ? 'rgba(34, 211, 238, 0.22)'
    : 'rgba(6, 182, 212, 0.20)';

  const portColor = (portId: string) => {
    const p = runtime?.portPressures[portId] ?? 0;
    return p > 0.2 ? activeCyan : inactiveStroke;
  };

  const renderBody = () => {
    switch (comp.type) {
      case 'compressor': {
        const active = compressorOn && supplyBar > 0;
        const stroke = active ? activeCyan : inactiveStroke;
        return (
          <g>
            <circle
              cx={0}
              cy={0}
              r={20}
              fill={bodyBg}
              stroke={stroke}
              strokeWidth={2.2}
            />
            <polygon
              points="0,-15 -7,-3 7,-3"
              fill={active ? activeCyan : 'none'}
              stroke={stroke}
              strokeWidth={1.6}
            />
            <text
              x={0}
              y={11}
              textAnchor="middle"
              fontSize={9}
              fontWeight={700}
              fill={active ? activeCyanText : inactiveStroke}
            >
              {active ? `${supplyBar.toFixed(1)}b` : 'OFF'}
            </text>
            <line x1={0} y1={-20} x2={0} y2={-26} stroke={stroke} strokeWidth={2} />
          </g>
        );
      }

      case 'frl': {
        const pIn = runtime?.portPressures['in'] ?? 0;
        const pOut = runtime?.portPressures['out'] ?? 0;
        const clogged = pIn - pOut > 1.0;
        const stroke = pOut > 0.2 ? activeCyan : neutralStroke;
        const gaugeAngle = -125 + Math.min(1, Math.max(0, pOut / 10)) * 250;
        return (
          <g>
            <rect
              x={-30}
              y={-18}
              width={60}
              height={36}
              rx={4}
              fill={bodyBg}
              stroke={clogged ? '#f59e0b' : stroke}
              strokeWidth={2}
              strokeDasharray="4 2"
            />
            {/* Filter diamond (amber fill when clogged) */}
            <polygon
              points="-18,-8 -10,0 -18,8 -26,0"
              fill={clogged ? 'rgba(245, 158, 11, 0.35)' : 'none'}
              stroke={clogged ? '#f59e0b' : stroke}
              strokeWidth={1.4}
            />
            <line
              x1={-24}
              y1={0}
              x2={-12}
              y2={0}
              stroke={clogged ? '#f59e0b' : stroke}
              strokeWidth={1.2}
              strokeDasharray="2 2"
            />
            {/* Live rotating FRL pressure gauge */}
            <circle cx={0} cy={-1} r={7.5} fill={bodyBg} stroke={stroke} strokeWidth={1.4} />
            <g transform={`translate(0, -1) rotate(${gaugeAngle.toFixed(1)})`}>
              <line x1={0} y1={1.5} x2={0} y2={-6} stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" />
            </g>
            <circle cx={0} cy={-1} r={1.4} fill={arrowStroke} />
            <text x={0} y={13} textAnchor="middle" fontSize={7} fontWeight={700} fill={clogged ? '#d97706' : activeCyanText}>
              {pOut.toFixed(1)}b
            </text>
            <line x1={18} y1={-8} x2={18} y2={8} stroke={stroke} strokeWidth={1.4} />
            <circle
              cx={18}
              cy={2}
              r={2.5}
              fill={pOut > 0.2 ? activeCyan : inactiveStroke}
            />
            <line x1={-34} y1={0} x2={-30} y2={0} stroke={portColor('in')} strokeWidth={2} />
            <line x1={30} y1={0} x2={34} y2={0} stroke={portColor('out')} strokeWidth={2} />
          </g>
        );
      }

      case 'valve32_pb':
      case 'valve32_limit': {
        const isLimit = comp.type === 'valve32_limit';
        return (
          <g
            className="cursor-pointer"
            onMouseDown={(e) => onActuateDown(comp.id, e)}
            onMouseUp={() => onActuateUp(comp.id)}
            onMouseLeave={() => onActuateUp(comp.id)}
          >
            {/* Left square (actuated state: 1 -> 2) */}
            <rect
              x={-36}
              y={-18}
              width={36}
              height={36}
              fill={isActuated ? activeFill : bodyBg}
              stroke={isActuated ? activeCyan : neutralStroke}
              strokeWidth={isActuated ? 2.2 : 1.6}
            />
            <line x1={-26} y1={14} x2={-26} y2={-12} stroke={arrowStroke} strokeWidth={1.6} />
            <polygon points="-26,-15 -29,-9 -23,-9" fill={arrowStroke} />
            <line x1={-10} y1={14} x2={-10} y2={6} stroke={inactiveStroke} strokeWidth={1.6} />
            <line x1={-14} y1={6} x2={-6} y2={6} stroke={inactiveStroke} strokeWidth={1.6} />

            {/* Right square (normal NC state: 1 blocked, 2 -> 3 exhaust) */}
            <rect
              x={0}
              y={-18}
              width={36}
              height={36}
              fill={!isActuated ? normalFill : bodyBg}
              stroke={!isActuated ? arrowStroke : inactiveStroke}
              strokeWidth={!isActuated ? 2 : 1.5}
            />
            <line x1={10} y1={14} x2={10} y2={6} stroke={arrowStroke} strokeWidth={1.6} />
            <line x1={6} y1={6} x2={14} y2={6} stroke={arrowStroke} strokeWidth={1.6} />
            <line x1={10} y1={-14} x2={26} y2={12} stroke={neutralStroke} strokeWidth={1.5} />
            <polygon points="27,14 22,10 27,8" fill={neutralStroke} />

            {/* Actuator */}
            {isLimit ? (
              <g>
                <line x1={-36} y1={0} x2={-48} y2={0} stroke="#f59e0b" strokeWidth={1.8} />
                <circle
                  cx={-52}
                  cy={0}
                  r={5}
                  fill={isActuated ? '#f59e0b' : bodyBg}
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                />
              </g>
            ) : (
              <g>
                <line x1={-36} y1={0} x2={-46} y2={0} stroke={activeCyan} strokeWidth={2} />
                <path
                  d="M -46 -9 L -52 -9 A 4 4 0 0 0 -52 9 L -46 9 Z"
                  fill={isActuated ? activeCyan : isDark ? '#1e293b' : '#e2e8f0'}
                  stroke={activeCyan}
                  strokeWidth={1.8}
                />
              </g>
            )}

            {/* Spring return */}
            <polyline
              points="36,0 40,-5 44,5 48,-5 52,5 56,0"
              fill="none"
              stroke={neutralStroke}
              strokeWidth={1.5}
            />

            <line x1={-10} y1={18} x2={-10} y2={24} stroke={portColor('1')} strokeWidth={2} />
            <line x1={-10} y1={-18} x2={-10} y2={-24} stroke={portColor('2')} strokeWidth={2} />
            <polygon points="10,18 6,25 14,25" fill="none" stroke={inactiveStroke} strokeWidth={1.4} />
            {/* Sliding spool position indicator bar */}
            <g
              style={{
                transform: `translateX(${isActuated ? -18 : 18}px)`,
                transition: 'transform 140ms ease-out',
              }}
            >
              <rect
                x={-10}
                y={-22}
                width={20}
                height={4}
                rx={2}
                fill={isActuated ? activeCyan : neutralStroke}
              />
            </g>
          </g>
        );
      }

      case 'valve52_pilot': {
        const p14 = (runtime?.portPressures['14'] ?? 0) > 0.2;
        const p12 = (runtime?.portPressures['12'] ?? 0) > 0.2;
        return (
          <g
            className="cursor-pointer"
            onMouseDown={(e) => onActuateDown(comp.id, e)}
          >
            {/* Left square */}
            <rect
              x={-40}
              y={-18}
              width={40}
              height={36}
              fill={isActuated ? activeFill : bodyBg}
              stroke={isActuated ? activeCyan : inactiveStroke}
              strokeWidth={isActuated ? 2.2 : 1.5}
            />
            <line x1={-20} y1={14} x2={-30} y2={-12} stroke={arrowStroke} strokeWidth={1.5} />
            <polygon points="-31,-15 -26,-10 -32,-9" fill={arrowStroke} />
            <line x1={-10} y1={-14} x2={-10} y2={12} stroke={neutralStroke} strokeWidth={1.4} />
            <polygon points="-10,15 -13,10 -7,10" fill={neutralStroke} />

            {/* Right square */}
            <rect
              x={0}
              y={-18}
              width={40}
              height={36}
              fill={!isActuated ? activeFill : bodyBg}
              stroke={!isActuated ? activeCyan : inactiveStroke}
              strokeWidth={!isActuated ? 2.2 : 1.5}
            />
            <line x1={16} y1={14} x2={28} y2={-12} stroke={arrowStroke} strokeWidth={1.5} />
            <polygon points="29,-15 24,-10 30,-9" fill={arrowStroke} />
            <line x1={10} y1={-14} x2={10} y2={12} stroke={neutralStroke} strokeWidth={1.4} />
            <polygon points="10,15 7,10 13,10" fill={neutralStroke} />

            {/* Left pilot triangle 14(Z) */}
            <polygon
              points="-48,-7 -40,0 -48,7"
              fill={p14 ? '#f59e0b' : isDark ? '#1e293b' : '#f1f5f9'}
              stroke={p14 ? '#d97706' : neutralStroke}
              strokeWidth={1.6}
            />
            {/* Right pilot triangle 12(Y) */}
            <polygon
              points="48,-7 40,0 48,7"
              fill={p12 ? '#f59e0b' : isDark ? '#1e293b' : '#f1f5f9'}
              stroke={p12 ? '#d97706' : neutralStroke}
              strokeWidth={1.6}
            />

            <line x1={0} y1={18} x2={0} y2={24} stroke={portColor('1')} strokeWidth={2} />
            <line x1={-16} y1={-18} x2={-16} y2={-24} stroke={portColor('4')} strokeWidth={2} />
            <line x1={16} y1={-18} x2={16} y2={-24} stroke={portColor('2')} strokeWidth={2} />
            <polygon points="-24,18 -28,25 -20,25" fill="none" stroke={inactiveStroke} strokeWidth={1.3} />
            <polygon points="24,18 20,25 28,25" fill="none" stroke={inactiveStroke} strokeWidth={1.3} />
            {/* Sliding 5/2 spool position bar */}
            <g
              style={{
                transform: `translateX(${isActuated ? -20 : 20}px)`,
                transition: 'transform 150ms ease-out',
              }}
            >
              <rect
                x={-12}
                y={-22}
                width={24}
                height={4}
                rx={2}
                fill={activeCyan}
              />
            </g>
          </g>
        );
      }

      case 'flow_control': {
        const p = Math.max(
          runtime?.portPressures['in'] ?? 0,
          runtime?.portPressures['out'] ?? 0
        );
        const stroke = p > 0.2 ? activeCyan : neutralStroke;
        const pct = comp.throttlePct ?? 50;
        return (
          <g>
            <rect
              x={-24}
              y={-20}
              width={48}
              height={40}
              rx={4}
              fill={bodyBg}
              stroke={stroke}
              strokeWidth={1.8}
            />
            <path d="M -8 -12 Q -2 0 -8 12" fill="none" stroke={stroke} strokeWidth={1.6} />
            <path d="M 8 -12 Q 2 0 8 12" fill="none" stroke={stroke} strokeWidth={1.6} />
            <line x1={-12} y1={10} x2={12} y2={-10} stroke={activeCyan} strokeWidth={1.5} />
            <polygon points="13,-11 7,-9 11,-5" fill={activeCyan} />
            <text x={29} y={4} fontSize={9} fontWeight={600} fill={activeCyanText}>
              {pct}%
            </text>
            <line x1={0} y1={20} x2={0} y2={26} stroke={portColor('in')} strokeWidth={2} />
            <line x1={0} y1={-20} x2={0} y2={-26} stroke={portColor('out')} strokeWidth={2} />
          </g>
        );
      }

      case 'shuttle_or': {
        const pOut = runtime?.portPressures['y'] ?? 0;
        const stroke = pOut > 0.2 ? activeCyan : neutralStroke;
        return (
          <g>
            <rect
              x={-24}
              y={-16}
              width={48}
              height={32}
              rx={4}
              fill={bodyBg}
              stroke={stroke}
              strokeWidth={1.8}
            />
            <line x1={-24} y1={0} x2={24} y2={0} stroke={inactiveStroke} strokeWidth={1.4} />
            <line x1={0} y1={0} x2={0} y2={-16} stroke={stroke} strokeWidth={1.6} />
            <circle cx={0} cy={0} r={5} fill={pOut > 0.2 ? activeCyan : inactiveStroke} />
            <text x={0} y={12} textAnchor="middle" fontSize={8} fontWeight={700} fill={labelFill}>
              OR
            </text>
            <line x1={-28} y1={0} x2={-24} y2={0} stroke={portColor('a')} strokeWidth={2} />
            <line x1={24} y1={0} x2={28} y2={0} stroke={portColor('b')} strokeWidth={2} />
            <line x1={0} y1={-16} x2={0} y2={-22} stroke={portColor('y')} strokeWidth={2} />
          </g>
        );
      }

      case 'dual_and': {
        const pOut = runtime?.portPressures['y'] ?? 0;
        const stroke = pOut > 0.2 ? activeCyan : neutralStroke;
        return (
          <g>
            <rect
              x={-24}
              y={-16}
              width={48}
              height={32}
              rx={4}
              fill={bodyBg}
              stroke={stroke}
              strokeWidth={1.8}
            />
            <line x1={-12} y1={-7} x2={-12} y2={7} stroke={stroke} strokeWidth={2} />
            <line x1={12} y1={-7} x2={12} y2={7} stroke={stroke} strokeWidth={2} />
            <line x1={-12} y1={0} x2={12} y2={0} stroke={stroke} strokeWidth={1.6} />
            <text x={0} y={13} textAnchor="middle" fontSize={8} fontWeight={700} fill={labelFill}>
              AND
            </text>
            <line x1={-28} y1={0} x2={-24} y2={0} stroke={portColor('a')} strokeWidth={2} />
            <line x1={24} y1={0} x2={28} y2={0} stroke={portColor('b')} strokeWidth={2} />
            <line x1={0} y1={-16} x2={0} y2={-22} stroke={portColor('y')} strokeWidth={2} />
          </g>
        );
      }

      case 'cyl_single':
      case 'cyl_double': {
        const isDouble = comp.type === 'cyl_double';
        const pct = Math.max(0, Math.min(100, comp.strokePct ?? 0));
        const pistonX = -38 + (pct / 100) * 66;
        const pA = runtime?.portPressures['a'] ?? 0;
        const pB = runtime?.portPressures['b'] ?? 0;

        return (
          <g>
            <rect
              x={-52}
              y={-18}
              width={104}
              height={36}
              rx={2}
              fill={bodyBg}
              stroke="none"
            />
            {pA > 0.2 && (
              <rect
                x={-52}
                y={-17}
                width={Math.max(4, pistonX + 52)}
                height={34}
                fill={chamberFill}
              />
            )}
            {isDouble && pB > 0.2 && (
              <rect
                x={pistonX + 8}
                y={-17}
                width={Math.max(4, 52 - (pistonX + 8))}
                height={34}
                fill={chamberFill}
              />
            )}
            {!isDouble && (
              <polyline
                points={`${pistonX + 8},0 ${pistonX + 14},-8 ${pistonX + 20},8 ${pistonX + 26},-8 ${pistonX + 32},8 ${pistonX + 38},-8 50,0`}
                fill="none"
                stroke={neutralStroke}
                strokeWidth={1.5}
              />
            )}

            <rect
              x={-52}
              y={-18}
              width={104}
              height={36}
              rx={2}
              fill="none"
              stroke={arrowStroke}
              strokeWidth={2}
            />

            <rect
              x={pistonX}
              y={-16}
              width={8}
              height={32}
              fill={isDark ? '#38bdf8' : '#0284c7'}
              stroke={isDark ? '#e0f2fe' : '#0369a1'}
              strokeWidth={1.2}
            />
            <rect
              x={pistonX + 8}
              y={-4}
              width={64}
              height={8}
              fill={isDark ? '#94a3b8' : '#64748b'}
              stroke={isDark ? '#e2e8f0' : '#475569'}
              strokeWidth={1}
            />
            <circle cx={pistonX + 74} cy={0} r={4} fill={isDark ? '#38bdf8' : '#0284c7'} />

            <line x1={-44} y1={18} x2={-44} y2={24} stroke={portColor('a')} strokeWidth={2} />
            {isDouble && (
              <line x1={44} y1={18} x2={44} y2={24} stroke={portColor('b')} strokeWidth={2} />
            )}

            <text
              x={0}
              y={-24}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={activeCyanText}
            >
              {pct.toFixed(0)}% Stroke
            </text>
          </g>
        );
      }
    }
  };

  const labelY =
    comp.type === 'cyl_single' || comp.type === 'cyl_double' ? 42 : 40;

  return (
    <g
      transform={`translate(${comp.x}, ${comp.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerDown={(e) => onStartDrag(comp.id, e)}
      className="select-none"
    >
      {selected && (
        <rect
          x={-60}
          y={-34}
          width={120}
          height={68}
          rx={8}
          fill="none"
          stroke={activeCyan}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {renderBody()}

      <g className="pointer-events-none">
        <rect
          x={-Math.max(38, comp.label.length * 3.4 + 8)}
          y={labelY - 11}
          width={Math.max(76, comp.label.length * 6.8 + 16)}
          height={15}
          rx={4}
          fill={isDark ? 'rgba(2, 6, 23, 0.88)' : 'rgba(248, 250, 252, 0.92)'}
          stroke={isDark ? 'rgba(51, 65, 85, 0.65)' : 'rgba(203, 213, 225, 0.85)'}
          strokeWidth={0.8}
        />
        <text
          x={0}
          y={labelY}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight={600}
          fill={labelFill}
        >
          {comp.label}
        </text>
      </g>

      {catalog.ports.map((port) => {
        const isWireStart =
          wiringFrom?.compId === comp.id && wiringFrom?.portId === port.id;
        const p = runtime?.portPressures[port.id] ?? 0;
        const fill = isWireStart
          ? '#f59e0b'
          : p > 0.2
            ? activeCyan
            : isDark
              ? '#1e293b'
              : '#ffffff';
        return (
          <g
            key={port.id}
            transform={`translate(${port.dx}, ${port.dy})`}
            onClick={(e) => {
              e.stopPropagation();
              onPortClick(comp.id, port.id, e);
            }}
            className="cursor-crosshair"
          >
            <circle
              r={isWireStart ? 6 : 4.5}
              fill={fill}
              stroke={isWireStart ? '#fde68a' : neutralStroke}
              strokeWidth={1.5}
            />
            <title>{`${comp.label} — Port ${port.label} (${p.toFixed(1)} bar)`}</title>
          </g>
        );
      })}
    </g>
  );
}
