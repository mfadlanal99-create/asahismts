import { useId } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { barToPa, paToPsi } from '../../physics';

interface PressureGaugeProps {
  label: string;
  sublabel: string;
  pressureBar: number;
  maxBar?: number;
  limitBar?: number;
  warning?: boolean;
}

export function PressureGauge({
  label,
  sublabel,
  pressureBar,
  maxBar = 240,
  limitBar,
  warning = false,
}: PressureGaugeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const uid = useId().replace(/:/g, '');

  const clamped = Math.max(0, Math.min(maxBar, pressureBar));
  const startAngle = -135;
  const endAngle = 135;
  const angle = startAngle + (clamped / maxBar) * (endAngle - startAngle);
  const limitAngle =
    limitBar !== undefined
      ? startAngle + (Math.max(0, Math.min(maxBar, limitBar)) / maxBar) * (endAngle - startAngle)
      : null;

  const isHigh = pressureBar >= 140 || (limitBar !== undefined && pressureBar >= limitBar * 0.95);
  const needleColor = warning
    ? '#ef4444'
    : isHigh
      ? '#f59e0b'
      : 'var(--md-primary)';

  const faceBg = 'var(--md-surface-container-lowest)';
  const tickColor = 'var(--md-outline)';
  const textColor = 'var(--md-on-surface)';
  const subColor = 'var(--md-on-surface-variant)';

  const ticks = [0, 40, 80, 120, 160, 200, 240];

  const polar = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: 60 + r * Math.cos(rad), y: 60 + r * Math.sin(rad) };
  };

  const arcPath = (fromDeg: number, toDeg: number, r: number) => {
    const p1 = polar(fromDeg, r);
    const p2 = polar(toDeg, r);
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  };

  return (
    <div className="glass-card flex flex-col items-center rounded-[24px] p-3.5">
      <div className="flex w-full items-center justify-between text-xs">
        <span className="font-bold text-[var(--md-on-surface)]">{label}</span>
        <span className="text-[11px] text-[var(--md-on-surface-variant)]">{sublabel}</span>
      </div>

      <svg viewBox="0 0 120 112" className="mt-1 h-28 w-32 select-none">
        <defs>
          <linearGradient id={`bezel-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isDark ? '#64748b' : '#cbd5e1'} />
            <stop offset="50%" stopColor={isDark ? '#334155' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#64748b'} />
          </linearGradient>
        </defs>

        {/* Metallic outer bezel */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill={`url(#bezel-${uid})`}
          stroke={warning ? '#ef4444' : isDark ? '#475569' : '#94a3b8'}
          strokeWidth={warning ? '2' : '1'}
        />

        {/* Inner dial face */}
        <circle cx="60" cy="60" r="45" fill={faceBg} />

        {/* Color-coded operating zone arcs */}
        <path
          d={arcPath(-135, 35, 41)}
          fill="none"
          stroke="#10b981"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={arcPath(35, 95, 41)}
          fill="none"
          stroke="#f59e0b"
          strokeOpacity="0.45"
          strokeWidth="3"
        />
        <path
          d={arcPath(95, 135, 41)}
          fill="none"
          stroke="#ef4444"
          strokeOpacity="0.55"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {ticks.map((t) => {
          const deg = startAngle + (t / maxBar) * (endAngle - startAngle);
          const p1 = polar(deg, 36);
          const p2 = polar(deg, 42);
          const pt = polar(deg, 28);
          return (
            <g key={t}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={tickColor}
                strokeWidth="1.5"
              />
              <text
                x={pt.x}
                y={pt.y + 2.5}
                textAnchor="middle"
                fontSize="6.8"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill={subColor}
              >
                {t}
              </text>
            </g>
          );
        })}

        {/* Relief cracking marker */}
        {limitAngle !== null && (() => {
          const lp1 = polar(limitAngle, 34);
          const lp2 = polar(limitAngle, 44);
          return (
            <line
              x1={lp1.x}
              y1={lp1.y}
              x2={lp2.x}
              y2={lp2.y}
              stroke="#ef4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          );
        })()}

        {/* Needle */}
        {(() => {
          const tip = polar(angle, 37);
          const tail = polar(angle + 180, 9);
          return (
            <line
              x1={tail.x}
              y1={tail.y}
              x2={tip.x}
              y2={tip.y}
              stroke={needleColor}
              strokeWidth="2.4"
              strokeLinecap="round"
              style={{ transition: 'all 100ms ease-out' }}
            />
          );
        })()}

        <circle cx="60" cy="60" r="4.5" fill={textColor} />
        <circle cx="60" cy="60" r="2" fill={needleColor} />
        <text
          x="60"
          y="85"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="800"
          letterSpacing="0.8"
          fontFamily="var(--font-sans)"
          fill={subColor}
        >
          BAR
        </text>
      </svg>

      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="font-mono text-base font-bold text-[var(--md-on-surface)]">
          {pressureBar.toFixed(1)}
        </span>
        <span className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
          bar
        </span>
        <span className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
          ({Math.round(paToPsi(barToPa(pressureBar)))} psi)
        </span>
      </div>
    </div>
  );
}
