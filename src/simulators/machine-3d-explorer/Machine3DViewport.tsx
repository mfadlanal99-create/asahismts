import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  renderCadScene,
  type CameraState,
  type ProjectedCallout,
  type RenderFrameResult,
} from './cad3dEngine';
import {
  CATEGORY_COLORS,
  type Machine3DPartSpec,
} from './machine3dData';

export interface CameraPresetCommand {
  state: CameraState;
  seq: number;
}

interface Machine3DViewportProps {
  parts: Machine3DPartSpec[];
  cameraPreset: CameraPresetCommand;
  onResetCamera: () => void;
  explodePct: number;
  onExplodePctChange: (pct: number) => void;
  explodeMode: 'proportional' | 'staged';
  onExplodeModeChange: (mode: 'proportional' | 'staged') => void;
  isAnimatingExplode: boolean;
  onToggleExplodeAnimation: () => void;
  rpm: number;
  isRunning: boolean;
  autoRotate: boolean;
  xrayHousing: boolean;
  showCallouts: boolean;
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
  isolatedPartId: string | null;
  onToggleIsolatePart: (partId: string | null) => void;
}

export function Machine3DViewport({
  parts,
  cameraPreset,
  onResetCamera,
  explodePct,
  onExplodePctChange,
  explodeMode,
  onExplodeModeChange,
  isAnimatingExplode,
  onToggleExplodeAnimation,
  rpm,
  isRunning,
  autoRotate,
  xrayHousing,
  showCallouts,
  selectedPartId,
  onSelectPart,
  isolatedPartId,
  onToggleIsolatePart,
}: Machine3DViewportProps) {
  const { language, pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const zoomTextRef = useRef<HTMLSpanElement | null>(null);

  const frameResultRef = useRef<RenderFrameResult | null>(null);
  const calloutsRef = useRef<ProjectedCallout[]>([]);

  const cameraRef = useRef<CameraState>({ ...cameraPreset.state });
  const shaftAngleRef = useRef<number>(0);

  const dirtyRef = useRef<boolean>(true);
  const rafIdRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const viewportSizeRef = useRef<{ width: number; height: number; dpr: number }>({
    width: 720,
    height: 540,
    dpr: 1,
  });

  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);

  const explodeFactor = explodePct / 100;

  const stateRef = useRef({
    explodeFactor,
    explodeMode,
    rpm,
    isRunning,
    autoRotate,
    xrayHousing,
    showCallouts,
    hoveredPartId,
    selectedPartId,
    isolatedPartId,
    isDark,
    parts,
  });

  const dragRef = useRef<{
    active: boolean;
    mode: 'orbit' | 'pan';
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    movedDistance: number;
  }>({
    active: false,
    mode: 'orbit',
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    movedDistance: 0,
  });

  const hoverCheckScheduledRef = useRef<boolean>(false);
  const latestPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateZoomBadge = useCallback((zoom: number) => {
    if (zoomTextRef.current) {
      zoomTextRef.current.textContent = `${Math.round(zoom * 100)}%`;
    }
  }, []);

  const drawSingleFrame = useCallback((dt: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const s = stateRef.current;
    const { width, height, dpr } = viewportSizeRef.current;

    if (s.isRunning && s.rpm > 0) {
      const radPerSec = Math.min(18, (s.rpm / 60) * 0.45);
      shaftAngleRef.current += radPerSec * dt;
    }

    if (s.autoRotate && !dragRef.current.active) {
      cameraRef.current.yaw -= dt * 0.42;
    }

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const res = renderCadScene(ctx, width, height, cameraRef.current, {
      parts: s.parts,
      explodeFactor: s.explodeFactor,
      explodeMode: s.explodeMode,
      shaftAngleRad: shaftAngleRef.current,
      xrayHousing: s.xrayHousing,
      showCallouts: s.showCallouts,
      hoveredPartId: s.hoveredPartId,
      selectedPartId: s.selectedPartId,
      isolatedPartId: s.isolatedPartId,
      isDark: s.isDark,
      isDriving: s.isRunning && s.rpm > 0,
    });

    frameResultRef.current = res;
    calloutsRef.current = res.callouts;

    if (s.showCallouts && !s.isolatedPartId && res.callouts.length > 0) {
      const sortedCallouts = [...res.callouts].sort((a, b) => b.depth - a.depth);
      ctx.font = '600 10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < sortedCallouts.length; i++) {
        const pin = sortedCallouts[i];
        const isSel = pin.partId === s.selectedPartId;
        const isHov = pin.partId === s.hoveredPartId;

        ctx.strokeStyle = isSel
          ? '#0891B2'
          : isHov
            ? '#D97706'
            : s.isDark
              ? 'rgba(148, 163, 184, 0.55)'
              : 'rgba(15, 23, 42, 0.35)';
        ctx.lineWidth = isSel || isHov ? 1.8 : 1.0;
        ctx.beginPath();
        ctx.moveTo(pin.anchorX, pin.anchorY);
        ctx.lineTo(pin.x, pin.y);
        ctx.stroke();

        ctx.fillStyle = isSel ? '#06B6D4' : isHov ? '#F59E0B' : '#0284C7';
        ctx.beginPath();
        ctx.arc(pin.anchorX, pin.anchorY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pin.x, pin.y, isSel ? 12 : 10.5, 0, Math.PI * 2);
        ctx.fillStyle = isSel
          ? '#0891B2'
          : isHov
            ? '#D97706'
            : s.isDark
              ? '#0F172A'
              : '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = isSel ? 2 : 1.25;
        ctx.strokeStyle = isSel
          ? '#67E8F9'
          : isHov
            ? '#FDE68A'
            : s.isDark
              ? '#475569'
              : '#94A3B8';
        ctx.stroke();

        ctx.fillStyle =
          isSel || isHov ? '#FFFFFF' : s.isDark ? '#E2E8F0' : '#0F172A';
        ctx.fillText(String(pin.bomNumber).padStart(2, '0'), pin.x, pin.y + 0.5);
      }
    }

    ctx.restore();
  }, []);

  const scheduleRender = useCallback(() => {
    dirtyRef.current = true;
    if (rafIdRef.current !== 0) return;

    lastFrameTimeRef.current = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTimeRef.current) / 1000));
      lastFrameTimeRef.current = now;

      const s = stateRef.current;
      const needsContinuous = (s.isRunning && s.rpm > 0) || s.autoRotate;

      if (dirtyRef.current || needsContinuous) {
        dirtyRef.current = false;
        drawSingleFrame(dt);
      }

      if (needsContinuous || dirtyRef.current) {
        rafIdRef.current = window.requestAnimationFrame(loop);
      } else {
        rafIdRef.current = 0;
      }
    };

    rafIdRef.current = window.requestAnimationFrame(loop);
  }, [drawSingleFrame]);

  useEffect(() => {
    stateRef.current = {
      explodeFactor,
      explodeMode,
      rpm,
      isRunning,
      autoRotate,
      xrayHousing,
      showCallouts,
      hoveredPartId,
      selectedPartId,
      isolatedPartId,
      isDark,
      parts,
    };
    scheduleRender();
  }, [
    explodeFactor,
    explodeMode,
    rpm,
    isRunning,
    autoRotate,
    xrayHousing,
    showCallouts,
    hoveredPartId,
    selectedPartId,
    isolatedPartId,
    isDark,
    parts,
    scheduleRender,
  ]);

  useEffect(() => {
    if (cameraPreset.seq > 0) {
      cameraRef.current = { ...cameraPreset.state };
      updateZoomBadge(cameraRef.current.zoom);
      scheduleRender();
    }
  }, [cameraPreset, scheduleRender, updateZoomBadge]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const syncCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(280, Math.floor(rect.width));
      const height = Math.max(320, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      viewportSizeRef.current = { width, height, dpr };

      const targetW = Math.floor(width * dpr);
      const targetH = Math.floor(height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      scheduleRender();
    };

    syncCanvasSize();
    const ro = new ResizeObserver(syncCanvasSize);
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (rafIdRef.current !== 0) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };
  }, [scheduleRender]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.1 : 0.91;
      const nextZoom = Math.max(0.5, Math.min(2.8, cameraRef.current.zoom * delta));
      cameraRef.current.zoom = nextZoom;
      updateZoomBadge(nextZoom);
      scheduleRender();
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [scheduleRender, updateZoomBadge]);

  const pickPartAtCoords = useCallback((canvasX: number, canvasY: number): string | null => {
    const s = stateRef.current;
    if (s.showCallouts && !s.isolatedPartId) {
      for (const pin of calloutsRef.current) {
        if (Math.hypot(canvasX - pin.x, canvasY - pin.y) <= 14) {
          return pin.partId;
        }
      }
    }
    return frameResultRef.current?.hitTestPart(canvasX, canvasY) ?? null;
  }, []);

  const getLocalCoords = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getLocalCoords(e);
    const isPan = e.button === 2 || e.shiftKey;
    dragRef.current = {
      active: true,
      mode: isPan ? 'pan' : 'orbit',
      startX: x,
      startY: y,
      lastX: x,
      lastY: y,
      movedDistance: 0,
    };
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getLocalCoords(e);
    latestPointerRef.current = { x, y };

    if (tooltipRef.current && !dragRef.current.active) {
      const tx = Math.min(
        Math.max(12, x + 14),
        Math.max(12, viewportSizeRef.current.width - 240)
      );
      const ty = Math.max(12, y - 34);
      tooltipRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }

    if (dragRef.current.active) {
      const dx = x - dragRef.current.lastX;
      const dy = y - dragRef.current.lastY;
      dragRef.current.lastX = x;
      dragRef.current.lastY = y;
      dragRef.current.movedDistance += Math.hypot(dx, dy);

      if (dragRef.current.mode === 'pan') {
        cameraRef.current.panX = Math.max(-280, Math.min(280, cameraRef.current.panX + dx));
        cameraRef.current.panY = Math.max(-220, Math.min(220, cameraRef.current.panY + dy));
      } else {
        cameraRef.current.yaw -= dx * 0.0085;
        cameraRef.current.pitch = Math.max(
          -1.48,
          Math.min(1.48, cameraRef.current.pitch - dy * 0.0085)
        );
      }
      scheduleRender();
      return;
    }

    if (!hoverCheckScheduledRef.current) {
      hoverCheckScheduledRef.current = true;
      window.requestAnimationFrame(() => {
        hoverCheckScheduledRef.current = false;
        if (dragRef.current.active) return;
        const hitId = pickPartAtCoords(
          latestPointerRef.current.x,
          latestPointerRef.current.y
        );
        if (hitId !== stateRef.current.hoveredPartId) {
          setHoveredPartId(hitId);
        }
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity =
            hitId && hitId !== stateRef.current.selectedPartId ? '1' : '0';
        }
      });
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const { x, y } = getLocalCoords(e);
    const wasClick = dragRef.current.active && dragRef.current.movedDistance < 6;
    dragRef.current.active = false;

    if (wasClick) {
      const hitId = pickPartAtCoords(x, y);
      onSelectPart(hitId);
    }
  };

  const handlePointerLeave = () => {
    setHoveredPartId(null);
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
    }
  };

  const adjustZoom = (delta: number) => {
    const nextZoom = Math.max(0.5, Math.min(2.8, cameraRef.current.zoom + delta));
    cameraRef.current.zoom = nextZoom;
    updateZoomBadge(nextZoom);
    scheduleRender();
  };

  const hoveredPart = hoveredPartId
    ? parts.find((p) => p.id === hoveredPartId) ?? null
    : null;
  const selectedPart = selectedPartId
    ? parts.find((p) => p.id === selectedPartId) ?? null
    : null;
  const selectedIndex = selectedPart
    ? parts.findIndex((p) => p.id === selectedPart.id)
    : -1;

  const stepPart = (dir: -1 | 1) => {
    if (selectedIndex < 0) return;
    const nextIdx = (selectedIndex + dir + parts.length) % parts.length;
    const nextId = parts[nextIdx].id;
    onSelectPart(nextId);
    if (isolatedPartId) {
      onToggleIsolatePart(nextId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[500px] w-full select-none overflow-hidden bg-slate-50 sm:h-[580px] dark:bg-[#060D1A]"
    >
      {/* 3D CAD Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        className={`h-full w-full touch-none ${
          hoveredPart ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Minimal Top-Left Zoom Controls */}
      <div className="pointer-events-auto absolute left-3 top-3 flex items-center gap-0.5 rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)]/92 p-1 text-xs shadow-md backdrop-blur-xl">
        <button
          type="button"
          onClick={() => adjustZoom(-0.2)}
          title={pick('Zoom Out', 'Perkecil', '縮小')}
          className="rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span
          ref={zoomTextRef}
          className="min-w-[40px] text-center font-mono text-[11px] font-bold text-[var(--md-on-surface)]"
        >
          100%
        </span>
        <button
          type="button"
          onClick={() => adjustZoom(0.2)}
          title={pick('Zoom In', 'Perbesar', '拡大')}
          className="rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <div className="mx-0.5 h-3.5 w-px bg-[var(--md-outline-variant)]/60" />
        <button
          type="button"
          onClick={onResetCamera}
          title={pick('Reset View', 'Reset', 'リセット')}
          className="rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Isolated 3D Banner */}
      {isolatedPartId && selectedPart && (
        <div className="pointer-events-auto absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-[var(--md-primary)]/40 bg-[var(--md-surface-container-low)]/95 px-3.5 py-1.5 text-xs text-[var(--md-on-surface)] shadow-lg backdrop-blur-xl">
          <Eye className="h-3.5 w-3.5 text-[var(--md-primary)]" />
          <span className="truncate font-semibold">
            #{String(selectedPart.bomNumber).padStart(2, '0')} {selectedPart.name[language]}
          </span>
          <button
            type="button"
            onClick={() => onToggleIsolatePart(null)}
            className="m3-btn-filled px-2.5 py-0.5 text-[11px] font-bold"
          >
            {pick('Exit Solo', 'Keluar Solo', '全体へ')}
          </button>
        </div>
      )}

      {/* Compact Bottom-Center Explode Scrubber Dock */}
      {!isolatedPartId && (
        <div
          className={`pointer-events-auto absolute bottom-3 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)]/92 px-3.5 py-2 text-xs shadow-md backdrop-blur-xl ${
            selectedPart
              ? 'left-1/2 w-[min(92%,460px)] sm:left-[calc(50%-174px)] sm:w-[min(420px,calc(100%-380px))]'
              : 'left-1/2 w-[min(92%,460px)]'
          }`}
        >
          <button
            type="button"
            onClick={onToggleExplodeAnimation}
            title={pick('Animate Explode', 'Animasi', 'アニメ再生')}
            className="m3-btn-filled flex h-7 w-7 shrink-0 items-center justify-center"
          >
            {isAnimatingExplode ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 translate-x-[0.5px]" />
            )}
          </button>

          <span className="hidden shrink-0 text-[11px] font-semibold text-[var(--md-on-surface-variant)] sm:inline">
            {pick('Explode', 'Bongkar', '分解')}
          </span>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={explodePct}
            onChange={(e) => onExplodePctChange(Number(e.target.value))}
            aria-label="Exploded view percentage"
            className="min-w-0 flex-1"
          />

          <span className="w-9 shrink-0 text-right font-mono text-[11px] font-bold text-[var(--md-on-surface)]">
            {explodePct}%
          </span>

          <div className="hidden h-4 w-px bg-[var(--md-outline-variant)]/60 sm:block" />

          <button
            type="button"
            onClick={() =>
              onExplodeModeChange(explodeMode === 'staged' ? 'proportional' : 'staged')
            }
            className="hidden shrink-0 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] sm:inline-block"
          >
            {explodeMode === 'staged'
              ? pick('Staged', 'Bertahap', '段階')
              : pick('Linear', 'Linear', '比例')}
          </button>
        </div>
      )}

      {/* GPU-Composited Floating Hover Tooltip */}
      <div
        ref={tooltipRef}
        style={{ opacity: 0, left: 0, top: 0 }}
        className="pointer-events-none absolute z-10 max-w-[236px] rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-highest)]/95 px-3 py-1.5 text-[11px] text-[var(--md-on-surface)] shadow-md backdrop-blur-md transition-opacity duration-75 will-change-transform"
      >
        {hoveredPart && hoveredPart.id !== selectedPartId && (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold text-[var(--md-primary)]">
              #{String(hoveredPart.bomNumber).padStart(2, '0')}
            </span>
            <span className="truncate font-semibold">{hoveredPart.name[language]}</span>
          </div>
        )}
      </div>

      {/* Clean Material 3 Expressive Part Inspector Sheet */}
      {selectedPart && (
        <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-20 flex max-h-[72%] flex-col overflow-hidden rounded-[24px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)]/96 shadow-xl backdrop-blur-xl sm:bottom-3 sm:left-auto sm:right-3 sm:top-3 sm:max-h-none sm:w-[336px]">
          <div className="flex items-start justify-between gap-2 border-b border-[var(--md-outline-variant)]/55 px-4 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="font-bold text-[var(--md-primary)]">
                  #{String(selectedPart.bomNumber).padStart(2, '0')}
                </span>
                <span className="text-[var(--md-on-surface-variant)]">·</span>
                <span className="text-[var(--md-on-surface-variant)]">
                  {selectedPart.partCode}
                </span>
                <span className="text-[var(--md-on-surface-variant)]">·</span>
                <span className="font-sans text-[11px] font-semibold text-[var(--md-on-surface)]">
                  {CATEGORY_COLORS[selectedPart.category].label[language]}
                </span>
              </div>
              <h3 className="mt-1 text-sm font-extrabold leading-snug text-[var(--md-on-surface)]">
                {selectedPart.name[language]}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectPart(null);
                onToggleIsolatePart(null);
              }}
              title={pick('Close Pop-up', 'Tutup', '閉じる')}
              className="shrink-0 rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-xs">
            <button
              type="button"
              onClick={() =>
                onToggleIsolatePart(
                  isolatedPartId === selectedPart.id ? null : selectedPart.id
                )
              }
              className={`flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${
                isolatedPartId === selectedPart.id
                  ? 'border-transparent bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                  : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] hover:brightness-95'
              }`}
            >
              {isolatedPartId === selectedPart.id ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  {pick('Show Full Assembly', 'Tampilkan Mesin Utuh', '全体表示に戻す')}
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  {pick('Isolate Part in 3D', 'Isolasi Komponen 3D', 'この部品を単独表示')}
                </>
              )}
            </button>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Material', 'Material', '材質')}
              </div>
              <p className="mt-0.5 font-semibold text-[var(--md-on-surface)]">
                {selectedPart.material[language]}
              </p>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Function', 'Fungsi', '機能')}
              </div>
              <p className="mt-0.5 leading-relaxed text-[var(--md-on-surface-variant)]">
                {selectedPart.functionSummary[language]}
              </p>
            </div>

            <div className="border-l-2 border-amber-500 pl-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {pick('Failure Modes', 'Mode Kerusakan', '故障モード')}
              </div>
              <p className="mt-0.5 leading-relaxed text-[var(--md-on-surface-variant)]">
                {selectedPart.failureModes[language]}
              </p>
            </div>

            <div className="border-l-2 border-emerald-500 pl-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {pick('Maintenance & Tolerance', 'Perawatan & Toleransi', '保守・公差基準')}
              </div>
              <p className="mt-0.5 leading-relaxed text-[var(--md-on-surface-variant)]">
                {selectedPart.maintenanceSpec[language]}
              </p>
              <div className="mt-1.5 font-mono text-[11px] font-bold text-[var(--md-on-surface)]">
                {selectedPart.clearanceOrTorque}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--md-outline-variant)]/55 px-3.5 py-2.5">
            <button
              type="button"
              onClick={() => stepPart(-1)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {pick('Prev', 'Prev', '前へ')}
            </button>
            <span className="font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
              {selectedIndex + 1} / {parts.length}
            </span>
            <button
              type="button"
              onClick={() => stepPart(1)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
            >
              {pick('Next', 'Next', '次へ')}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
