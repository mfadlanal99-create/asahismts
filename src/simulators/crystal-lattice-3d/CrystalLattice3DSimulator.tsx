import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Atom,
  Axis3d,
  Box,
  Check,
  Compass,
  Expand,
  Grid2x2,
  Layers,
  Link2,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  renderCrystalScene,
  type CrystalCameraState,
  type CrystalDisplayMode,
  type RenderCrystalResult,
  type RenderedAtomInfo,
} from './crystal3dEngine';
import {
  CRYSTAL_LATTICES,
  MILLER_PLANES,
  SYSTEM_LABELS,
  type AtomSiteRole,
  type CrystalLatticeSpec,
  type CrystalSystemId,
  type LatticeStructureId,
  type MillerPlaneId,
} from './crystalLatticeData';

const DEFAULT_CAMERA: CrystalCameraState = {
  yaw: -0.62,
  pitch: -0.34,
  zoom: 1.0,
  panX: 0,
  panY: 0,
};

const ROLE_META: Record<
  AtomSiteRole,
  { colorHex: string; label: { en: string; id: string; ja: string } }
> = {
  corner: {
    colorHex: '#2563eb',
    label: { en: 'Corner Site', id: 'Titik Sudut', ja: '頂点サイト' },
  },
  body: {
    colorHex: '#d97706',
    label: { en: 'Body Center', id: 'Pusat Badan', ja: '体心サイト' },
  },
  face: {
    colorHex: '#059669',
    label: { en: 'Face Center', id: 'Pusat Muka', ja: '面心サイト' },
  },
  base: {
    colorHex: '#0d9488',
    label: { en: 'Basal Center', id: 'Pusat Alas', ja: '底心サイト' },
  },
  edge: {
    colorHex: '#db2777',
    label: { en: 'Edge Center', id: 'Pusat Rusuk', ja: '辺心サイト' },
  },
  interior: {
    colorHex: '#dc2626',
    label: {
      en: 'Interior / B-Layer',
      id: 'Interior / Lapisan-B',
      ja: '内部 / B層原子',
    },
  },
  'species-b': {
    colorHex: '#ea580c',
    label: {
      en: 'Species B / Octahedral',
      id: 'Spesies B / Oktahedral',
      ja: 'B種 / 八面体サイト',
    },
  },
};

export function CrystalLattice3DSimulator() {
  const { language, pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [systemFilter, setSystemFilter] = useState<'all' | CrystalSystemId>('all');
  const [selectedId, setSelectedId] = useState<LatticeStructureId>('fcc');

  const activeLattice: CrystalLatticeSpec = useMemo(
    () =>
      CRYSTAL_LATTICES.find((l) => l.id === selectedId) ?? CRYSTAL_LATTICES[2],
    [selectedId]
  );

  // Interactive cell parameter overrides
  const [bOverA, setBOverA] = useState<number>(activeLattice.defaultBOverA);
  const [cOverA, setCOverA] = useState<number>(activeLattice.defaultCOverA);
  const [alphaDeg, setAlphaDeg] = useState<number>(activeLattice.defaultAlphaDeg);
  const [betaDeg, setBetaDeg] = useState<number>(activeLattice.defaultBetaDeg);
  const [gammaDeg, setGammaDeg] = useState<number>(activeLattice.defaultGammaDeg);

  // Display & Viewport options
  const [displayMode, setDisplayMode] = useState<CrystalDisplayMode>('ball-stick');
  const [atomRadiusScale, setAtomRadiusScale] = useState<number>(1.0);
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [showSupercell, setShowSupercell] = useState<boolean>(false);
  const [showBonds, setShowBonds] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showInterstitials, setShowInterstitials] = useState<boolean>(false);
  const [millerPlane, setMillerPlane] = useState<MillerPlaneId>('none');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [hoveredAtomId, setHoveredAtomId] = useState<string | null>(null);
  const [selectedAtom, setSelectedAtom] = useState<RenderedAtomInfo | null>(null);
  const [selectedNeighborCount, setSelectedNeighborCount] = useState<number>(0);

  // Camera & Canvas Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<CrystalCameraState>({ ...DEFAULT_CAMERA });
  const frameResultRef = useRef<RenderCrystalResult | null>(null);
  const dragRef = useRef<{
    active: boolean;
    mode: 'orbit' | 'pan';
    startX: number;
    startY: number;
    moved: boolean;
    lastX: number;
    lastY: number;
  } | null>(null);

  const filteredLattices = useMemo(() => {
    if (systemFilter === 'all') return CRYSTAL_LATTICES;
    return CRYSTAL_LATTICES.filter(
      (item) =>
        item.categoryGroup === systemFilter || item.system === systemFilter
    );
  }, [systemFilter]);

  const handleSelectLattice = useCallback((spec: CrystalLatticeSpec) => {
    setSelectedId(spec.id);
    setBOverA(spec.defaultBOverA);
    setCOverA(spec.defaultCOverA);
    setAlphaDeg(spec.defaultAlphaDeg);
    setBetaDeg(spec.defaultBetaDeg);
    setGammaDeg(spec.defaultGammaDeg);
    setSelectedAtom(null);
    setHoveredAtomId(null);
    setExplodeFactor(0);
    // Keep sensible Miller plane if compatible
    if (spec.isFullHexPrism) {
      setMillerPlane((prev) =>
        prev === '111' || prev === '110' ? '0001' : prev
      );
    } else {
      setMillerPlane((prev) =>
        prev === '0001' || prev === '10-10' ? 'none' : prev
      );
    }
  }, []);

  const handleResetCellParams = useCallback(() => {
    setBOverA(activeLattice.defaultBOverA);
    setCOverA(activeLattice.defaultCOverA);
    setAlphaDeg(activeLattice.defaultAlphaDeg);
    setBetaDeg(activeLattice.defaultBetaDeg);
    setGammaDeg(activeLattice.defaultGammaDeg);
    setAtomRadiusScale(1.0);
    setExplodeFactor(0);
  }, [activeLattice]);

  const applyCameraPreset = useCallback(
    (preset: 'iso' | '100' | '010' | '001' | '111') => {
      setAutoRotate(false);
      if (preset === 'iso') {
        cameraRef.current = { ...DEFAULT_CAMERA };
      } else if (preset === '100') {
        cameraRef.current = { yaw: -Math.PI * 0.5, pitch: 0, zoom: 1.05, panX: 0, panY: 0 };
      } else if (preset === '010') {
        cameraRef.current = { yaw: 0, pitch: 0, zoom: 1.05, panX: 0, panY: 0 };
      } else if (preset === '001') {
        cameraRef.current = { yaw: 0, pitch: -Math.PI * 0.48, zoom: 1.05, panX: 0, panY: 0 };
      } else {
        cameraRef.current = { yaw: -Math.PI * 0.25, pitch: -0.615, zoom: 1.02, panX: 0, panY: 0 };
      }
    },
    []
  );

  const renderStateRef = useRef({
    activeLattice,
    bOverA,
    cOverA,
    alphaDeg,
    betaDeg,
    gammaDeg,
    displayMode,
    atomRadiusScale,
    explodeFactor,
    showSupercell,
    showBonds,
    showAxes,
    showInterstitials,
    millerPlane,
    hoveredAtomId,
    selectedAtomId: selectedAtom?.renderId ?? null,
    autoRotate,
    isDark,
  });

  useEffect(() => {
    renderStateRef.current = {
      activeLattice,
      bOverA,
      cOverA,
      alphaDeg,
      betaDeg,
      gammaDeg,
      displayMode,
      atomRadiusScale,
      explodeFactor,
      showSupercell,
      showBonds,
      showAxes,
      showInterstitials,
      millerPlane,
      hoveredAtomId,
      selectedAtomId: selectedAtom?.renderId ?? null,
      autoRotate,
      isDark,
    };
  }, [
    activeLattice,
    bOverA,
    cOverA,
    alphaDeg,
    betaDeg,
    gammaDeg,
    displayMode,
    atomRadiusScale,
    explodeFactor,
    showSupercell,
    showBonds,
    showAxes,
    showInterstitials,
    millerPlane,
    hoveredAtomId,
    selectedAtom,
    autoRotate,
    isDark,
  ]);

  // Sync Resize & 60fps Interactive Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = containerRef.current;
    if (!canvas || !wrapper) return;

    const sizeRef = { width: 720, height: 520, dpr: 1 };

    const drawFrame = () => {
      const s = renderStateRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const primaryHex =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--md-primary')
          .trim() || '#2563eb';

      ctx.save();
      ctx.setTransform(sizeRef.dpr, 0, 0, sizeRef.dpr, 0, 0);
      const result = renderCrystalScene(
        ctx,
        sizeRef.width,
        sizeRef.height,
        cameraRef.current,
        {
          lattice: s.activeLattice,
          bOverA: s.bOverA,
          cOverA: s.cOverA,
          alphaDeg: s.alphaDeg,
          betaDeg: s.betaDeg,
          gammaDeg: s.gammaDeg,
          displayMode: s.displayMode,
          atomRadiusScale: s.atomRadiusScale,
          explodeFactor: s.explodeFactor,
          showSupercell: s.showSupercell,
          showBonds: s.showBonds,
          showAxes: s.showAxes,
          showInterstitials: s.showInterstitials,
          millerPlane: s.millerPlane,
          hoveredAtomId: s.hoveredAtomId,
          selectedAtomId: s.selectedAtomId,
          isDark: s.isDark,
          primaryHex,
        }
      );
      ctx.restore();
      frameResultRef.current = result;
      if (s.selectedAtomId) {
        setSelectedNeighborCount((prev) =>
          prev !== result.neighborCountForSelected
            ? result.neighborCountForSelected
            : prev
        );
      }
    };

    const syncSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const width = Math.max(300, Math.floor(rect.width));
      const height = Math.max(360, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.width = width;
      sizeRef.height = height;
      sizeRef.dpr = dpr;

      const targetW = Math.floor(width * dpr);
      const targetH = Math.floor(height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      drawFrame();
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(wrapper);

    let rafId = 0;
    let lastTs = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      if (renderStateRef.current.autoRotate && !dragRef.current?.active) {
        cameraRef.current.yaw += dt * 0.42;
      }

      drawFrame();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  // Pointer Controls (Orbit, Shift-Pan, Click Atom Picking)
  const getCanvasCoords = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasCoords(e);
    dragRef.current = {
      active: true,
      mode: e.shiftKey || e.button === 2 ? 'pan' : 'orbit',
      startX: x,
      startY: y,
      moved: false,
      lastX: x,
      lastY: y,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const drag = dragRef.current;

    if (drag?.active) {
      const dx = x - drag.lastX;
      const dy = y - drag.lastY;
      if (Math.hypot(x - drag.startX, y - drag.startY) > 4) {
        drag.moved = true;
      }
      if (drag.mode === 'orbit') {
        cameraRef.current.yaw += dx * 0.008;
        cameraRef.current.pitch = Math.max(
          -1.52,
          Math.min(1.52, cameraRef.current.pitch + dy * 0.008)
        );
      } else {
        cameraRef.current.panX += dx;
        cameraRef.current.panY += dy;
      }
      drag.lastX = x;
      drag.lastY = y;
      return;
    }

    const hit = frameResultRef.current?.hitTestAtom(x, y) ?? null;
    setHoveredAtomId(hit ? hit.renderId : null);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (drag && !drag.moved) {
      const { x, y } = getCanvasCoords(e);
      const hit = frameResultRef.current?.hitTestAtom(x, y) ?? null;
      if (hit) {
        setSelectedAtom((prev) =>
          prev?.renderId === hit.renderId ? null : hit
        );
      } else {
        setSelectedAtom(null);
      }
    }
  };

  const presentRoles = useMemo(() => {
    const seen = new Set<AtomSiteRole>();
    for (const a of activeLattice.atoms) {
      seen.add(a.role);
    }
    return Array.from(seen);
  }, [activeLattice]);

  const activePlaneInfo = useMemo(
    () => MILLER_PLANES.find((p) => p.id === millerPlane) ?? MILLER_PLANES[0],
    [millerPlane]
  );

  return (
    <div className="space-y-5">
      {/* 1. Crystal System Filter Strip (Material You Pill Rail) */}
      <div className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-primary-container)] px-3 py-1 font-mono text-[11px] font-bold text-[var(--md-on-primary-container)]">
                <Atom className="h-3.5 w-3.5" />
                {pick(
                  '7 Crystal Systems · 14 Bravais Lattices + 4 Engineering Crystals',
                  '7 Sistem Kristal · 14 Kisi Bravais + 4 Kristal Teknik',
                  '7結晶系・14ブラベー格子＋4主要工学結晶構造'
                )}
              </span>
              <span className="rounded-full bg-[var(--md-secondary-container)] px-3 py-1 font-mono text-[11px] font-bold text-[var(--md-on-secondary-container)]">
                {activeLattice.shortName}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-xl">
              {activeLattice.name[language]}
            </h2>
          </div>

          {/* Camera & Display Quick Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Camera Views */}
            <div className="flex items-center rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-1 text-xs font-semibold">
              {(
                [
                  ['iso', 'Iso'],
                  ['100', '[100]'],
                  ['010', '[010]'],
                  ['001', '[001]'],
                  ['111', '[111]'],
                ] as const
              ).map(([presetId, label]) => (
                <button
                  key={presetId}
                  type="button"
                  onClick={() => applyCameraPreset(presetId)}
                  className="rounded-full px-2.5 py-1 font-mono text-[11px] text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAutoRotate((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                autoRotate
                  ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                  : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)]'
              }`}
            >
              <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              {pick('Auto-Orbit', 'Putar Otomatis', '自動回転')}
            </button>

            <button
              type="button"
              onClick={() => setShowSupercell((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                showSupercell
                  ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                  : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)]'
              }`}
            >
              <Grid2x2 className="h-3.5 w-3.5" />
              {pick('2×2×2 Supercell', 'Supersel 2×2×2', '2×2×2 スーパーセル')}
            </button>
          </div>
        </div>

        {/* Crystal System Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[var(--md-outline-variant)]/50 pt-3">
          {(Object.keys(SYSTEM_LABELS) as ('all' | CrystalSystemId)[]).map(
            (sysKey) => {
              const active = systemFilter === sysKey;
              return (
                <button
                  key={sysKey}
                  type="button"
                  onClick={() => setSystemFilter(sysKey)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-2xs'
                      : 'border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                  }`}
                >
                  {SYSTEM_LABELS[sysKey][language]}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 2. Main Split Workspace: Interactive 360° 3D Viewport + Lattice Explorer Sidebar */}
      <div
        className={`overflow-hidden rounded-[28px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-sm ${
          isFullscreen ? 'fixed inset-3 z-50 flex flex-col' : ''
        }`}
      >
        <div className="grid flex-1 lg:grid-cols-[1fr_340px]">
          {/* Left: 3D Crystal Canvas Viewport */}
          <div className="flex flex-col">
            {/* Top Floating Canvas Sub-Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowBonds((p) => !p)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    showBonds
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  <Link2 className="h-3 w-3" />
                  {pick('Bonds', 'Ikatan', '結合')}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAxes((p) => !p)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    showAxes
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  <Axis3d className="h-3 w-3" />
                  {pick('Axes (a,b,c)', 'Sumbu (a,b,c)', '結晶軸 (a,b,c)')}
                </button>

                {activeLattice.interstitials && activeLattice.interstitials.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowInterstitials((p) => !p)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      showInterstitials
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {pick('Interstitial Voids', 'Rongga Sisipan', '格子間空隙')}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    cameraRef.current.zoom = Math.min(2.6, cameraRef.current.zoom * 1.15);
                  }}
                  title={pick('Zoom In', 'Perbesar', '拡大')}
                  className="rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cameraRef.current.zoom = Math.max(0.45, cameraRef.current.zoom / 1.15);
                  }}
                  title={pick('Zoom Out', 'Perkecil', '縮小')}
                  className="rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cameraRef.current = { ...DEFAULT_CAMERA };
                  }}
                  title={pick('Reset Camera', 'Reset Kamera', 'カメラリセット')}
                  className="rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen((p) => !p)}
                  title={pick('Toggle Fullscreen', 'Layar Penuh', '全画面切替')}
                  className="rounded-full p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 3D Interactive Canvas Area */}
            <div
              ref={containerRef}
              className={`relative w-full select-none overflow-hidden ${
                isFullscreen ? 'min-h-[380px] flex-1' : 'h-[420px] sm:h-[450px] lg:h-[470px]'
              }`}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={(e) => {
                  e.preventDefault();
                  const factor = e.deltaY < 0 ? 1.08 : 0.92;
                  cameraRef.current.zoom = Math.max(
                    0.45,
                    Math.min(2.6, cameraRef.current.zoom * factor)
                  );
                }}
                onContextMenu={(e) => e.preventDefault()}
                className={`absolute inset-0 block h-full w-full touch-none ${
                  hoveredAtomId ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                }`}
              />

              {/* Top-Left Structure Specs HUD Pill */}
              <div className="pointer-events-none absolute left-3.5 top-3.5 flex max-w-[300px] flex-col gap-1.5">
                <div className="rounded-2xl border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]/85 px-3 py-2 backdrop-blur-md">
                  <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-[var(--md-primary)]">
                    <span>{activeLattice.pearsonSymbol}</span>
                    {activeLattice.strutzbricht && (
                      <span>· {activeLattice.strutzbricht}</span>
                    )}
                    {activeLattice.isBravaisCanonical && (
                      <span className="rounded-full bg-[var(--md-primary-container)] px-1.5 py-0.5 text-[9px] text-[var(--md-on-primary-container)]">
                        BRAVAIS
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] font-semibold text-[var(--md-on-surface)]">
                    {activeLattice.cellConstraints}
                  </div>
                  <div className="mt-1 text-[10px] text-[var(--md-on-surface-variant)]">
                    {pick(
                      'Drag to orbit · Scroll to zoom · Click atom to inspect neighbors',
                      'Seret untuk putar · Scroll untuk zoom · Klik atom untuk inspeksi tetangga',
                      'ドラッグで回転・ホイールで拡大・原子クリックで配位確認'
                    )}
                  </div>
                </div>
              </div>

              {/* Top-Right Site Color Legend */}
              <div className="pointer-events-none absolute right-3.5 top-3.5 hidden flex-col gap-1 rounded-2xl border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]/85 px-3 py-2 backdrop-blur-md sm:flex">
                {presentRoles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2 text-[11px] font-medium text-[var(--md-on-surface)]"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/40"
                      style={{ backgroundColor: ROLE_META[role].colorHex }}
                    />
                    <span>{ROLE_META[role].label[language]}</span>
                  </div>
                ))}
                {showInterstitials &&
                  activeLattice.interstitials &&
                  activeLattice.interstitials.length > 0 && (
                    <div className="mt-0.5 flex items-center gap-2 border-t border-[var(--md-outline-variant)]/40 pt-1 text-[10px] font-semibold text-rose-500">
                      <span className="inline-block h-2.5 w-2.5 rotate-45 bg-rose-500" />
                      {pick(
                        'Octa / Tetra Void',
                        'Rongga Okta / Tetra',
                        '八面体・四面体空隙'
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Bottom Display Mode & Live Geometric Dock */}
            <div className="border-t border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)]/95 px-4 py-3 backdrop-blur-md">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  {/* Display Mode Segmented Dock */}
                  <div className="flex flex-wrap items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-1 text-xs font-semibold">
                    {(
                      [
                        [
                          'ball-stick',
                          pick('Ball & Stick', 'Bola & Batang', '球棒モデル'),
                        ],
                        [
                          'hard-sphere',
                          pick(
                            'Hard-Sphere APF',
                            'Bola Rapat APF',
                            '剛体球（充填率）'
                          ),
                        ],
                        [
                          'coordination',
                          pick(
                            'Coordination Bonds',
                            'Ikatan Koordinasi',
                            '配位結合強調'
                          ),
                        ],
                      ] as const
                    ).map(([mId, label]) => (
                      <button
                        key={mId}
                        type="button"
                        onClick={() => setDisplayMode(mId)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                          displayMode === mId
                            ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] shadow-2xs'
                            : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Radius & Explode Sliders */}
                  <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:max-w-md">
                    <label className="block space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                        <span>
                          {pick('Atom Radius', 'Radius Atom', '原子半径スケール')}
                        </span>
                        <span className="font-mono font-bold text-[var(--md-primary)]">
                          {(atomRadiusScale * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={1.3}
                        step={0.05}
                        value={atomRadiusScale}
                        onChange={(e) => setAtomRadiusScale(Number(e.target.value))}
                        className="w-full"
                      />
                    </label>

                    <label className="block space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                        <span className="inline-flex items-center gap-1">
                          <Expand className="h-3 w-3 text-[var(--md-primary)]" />
                          {pick('Lattice Explode', 'Urai Kisi', '格子展開')}
                        </span>
                        <span className="font-mono font-bold text-[var(--md-primary)]">
                          {(explodeFactor * 100).toFixed(0)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={explodeFactor}
                        onChange={(e) => setExplodeFactor(Number(e.target.value))}
                        className="w-full"
                      />
                    </label>
                  </div>
                </div>
              </div>
          </div>

          {/* Right Sidebar: Structure Catalog, Miller Planes, Cell Sliders & Atom Inspector */}
          <aside className="flex flex-col border-t border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] lg:max-h-[680px] lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                <Layers className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Crystal Structures', 'Struktur Kristal', '結晶構造リスト')}
              </span>
              <span className="rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[var(--md-on-primary-container)]">
                {filteredLattices.length}
              </span>
            </div>

            {/* Scrollable Catalog List */}
            <div className="max-h-[250px] space-y-1.5 overflow-y-auto p-2.5 lg:max-h-[260px]">
              {filteredLattices.map((spec) => {
                const isSel = spec.id === activeLattice.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => handleSelectLattice(spec)}
                    className={`flex w-full items-center justify-between gap-2 rounded-[18px] border px-3 py-2 text-left transition ${
                      isSel
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs'
                        : 'border-transparent bg-[var(--md-surface-container-high)]/70 text-[var(--md-on-surface)] hover:border-[var(--md-outline-variant)] hover:bg-[var(--md-secondary-container)]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold">
                          {spec.name[language]}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] opacity-80">
                        <span>{spec.pearsonSymbol}</span>
                        <span>·</span>
                        <span>CN {spec.coordinationNumber.split(' ')[0]}</span>
                        <span>·</span>
                        <span>APF {spec.apfPercent}%</span>
                      </div>
                    </div>
                    {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Controls Body inside Right Sidebar */}
            <div className="flex-1 space-y-3 overflow-y-auto border-t border-[var(--md-outline-variant)]/50 p-3.5">
              {/* Miller Plane Overlay Selector */}
              <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] p-3">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--md-on-surface)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                    {pick('Miller Slip Plane (hkl)', 'Bidang Miller (hkl)', 'ミラー指数すべり面 (hkl)')}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {MILLER_PLANES.map((mp) => (
                    <button
                      key={mp.id}
                      type="button"
                      onClick={() => setMillerPlane(mp.id)}
                      className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                        millerPlane === mp.id
                          ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                          : 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-secondary-container)]'
                      }`}
                    >
                      {mp.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-snug text-[var(--md-on-surface-variant)]">
                  {activePlaneInfo.description[language]}
                </p>
              </div>

              {/* Unit Cell Geometry Interactive Controls */}
              <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] p-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                    <Box className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                    {pick('Unit Cell Distortion', 'Parameter Sel Satuan', '単位格子パラメータ')}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetCellParams}
                    className="rounded-full bg-[var(--md-surface-container-high)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-primary)] transition hover:bg-[var(--md-primary-container)]"
                  >
                    {pick('Canonical', 'Standar', '基準値')}
                  </button>
                </div>

                {!activeLattice.allowBSlider &&
                !activeLattice.allowCSlider &&
                activeLattice.allowAngleSlider === 'none' ? (
                  <p className="mt-2 text-[11px] text-[var(--md-on-surface-variant)]">
                    {pick(
                      'Cubic symmetry fixes a = b = c and α = β = γ = 90° rigidly.',
                      'Simetri kubik mengunci a = b = c dan α = β = γ = 90°.',
                      '立方晶は高い対称性により a = b = c、α = β = γ = 90° に固定されます。'
                    )}
                  </p>
                ) : (
                  <div className="mt-2.5 space-y-2.5">
                    {activeLattice.allowBSlider && (
                      <label className="block space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>b / a ratio</span>
                          <span className="font-mono font-bold text-[var(--md-primary)]">
                            {bOverA.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.85}
                          max={1.6}
                          step={0.02}
                          value={bOverA}
                          onChange={(e) => setBOverA(Number(e.target.value))}
                          className="w-full"
                        />
                      </label>
                    )}

                    {activeLattice.allowCSlider && (
                      <label className="block space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>c / a ratio</span>
                          <span className="font-mono font-bold text-[var(--md-primary)]">
                            {cOverA.toFixed(3)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.9}
                          max={1.85}
                          step={0.01}
                          value={cOverA}
                          onChange={(e) => setCOverA(Number(e.target.value))}
                          className="w-full"
                        />
                      </label>
                    )}

                    {activeLattice.allowAngleSlider === 'beta' && (
                      <label className="block space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>Monoclinic β</span>
                          <span className="font-mono font-bold text-[var(--md-primary)]">
                            {betaDeg.toFixed(0)}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={95}
                          max={128}
                          step={1}
                          value={betaDeg}
                          onChange={(e) => setBetaDeg(Number(e.target.value))}
                          className="w-full"
                        />
                      </label>
                    )}

                    {activeLattice.allowAngleSlider === 'rhombohedral' && (
                      <label className="block space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>Rhombohedral α = β = γ</span>
                          <span className="font-mono font-bold text-[var(--md-primary)]">
                            {alphaDeg.toFixed(0)}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={62}
                          max={108}
                          step={1}
                          value={alphaDeg}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAlphaDeg(val);
                            setBetaDeg(val);
                            setGammaDeg(val);
                          }}
                          className="w-full"
                        />
                      </label>
                    )}

                    {activeLattice.allowAngleSlider === 'triclinic' && (
                      <div className="grid grid-cols-3 gap-2">
                        <label className="block space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold">
                            <span>α</span>
                            <span className="font-mono font-bold text-[var(--md-primary)]">
                              {alphaDeg}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min={68}
                            max={112}
                            step={1}
                            value={alphaDeg}
                            onChange={(e) => setAlphaDeg(Number(e.target.value))}
                            className="w-full"
                          />
                        </label>
                        <label className="block space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold">
                            <span>β</span>
                            <span className="font-mono font-bold text-[var(--md-primary)]">
                              {betaDeg}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min={68}
                            max={118}
                            step={1}
                            value={betaDeg}
                            onChange={(e) => setBetaDeg(Number(e.target.value))}
                            className="w-full"
                          />
                        </label>
                        <label className="block space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold">
                            <span>γ</span>
                            <span className="font-mono font-bold text-[var(--md-primary)]">
                              {gammaDeg}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min={68}
                            max={122}
                            step={1}
                            value={gammaDeg}
                            onChange={(e) => setGammaDeg(Number(e.target.value))}
                            className="w-full"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Atom Inspector Card */}
              <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--md-on-surface)]">
                    {pick('Selected Atom Inspector', 'Inspektor Atom Terpilih', '選択原子インスペクタ')}
                  </span>
                  {selectedAtom && (
                    <button
                      type="button"
                      onClick={() => setSelectedAtom(null)}
                      className="rounded-full bg-[var(--md-secondary-container)] px-2 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]"
                    >
                      {pick('Clear', 'Hapus', '解除')}
                    </button>
                  )}
                </div>

                {selectedAtom ? (
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[var(--md-primary)]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: ROLE_META[selectedAtom.spec.role].colorHex,
                        }}
                      />
                      {ROLE_META[selectedAtom.spec.role].label[language]}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                      <div>
                        {pick('Cell Share:', 'Porsi Sel:', '寄与率:')}{' '}
                        <strong className="text-[var(--md-on-surface)]">
                          {selectedAtom.spec.cellWeightLabel}
                        </strong>
                      </div>
                      <div>
                        {pick('Active Bonds:', 'Ikatan Aktif:', '配位結合:')}{' '}
                        <strong className="text-[var(--md-on-surface)]">
                          {selectedNeighborCount}
                        </strong>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
                      (u, v, w) = ({selectedAtom.spec.u.toFixed(2)},{' '}
                      {selectedAtom.spec.v.toFixed(2)},{' '}
                      {selectedAtom.spec.w.toFixed(2)})
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[11px] text-[var(--md-on-surface-variant)]">
                    {pick(
                      'Click any atom sphere in the 3D viewport to spotlight its nearest-neighbor coordination cage.',
                      'Klik bola atom mana saja di layar 3D untuk menyorot ikatan tetangga terdekatnya.',
                      '3Dビュー内の原子をクリックすると配位結合と共有寄与率を強調表示します。'
                    )}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 3. Material You KPI Strip (4 Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Effective Atoms / Cell (n)', 'Atom Efektif / Sel (n)', '実効原子数 (n)')}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-extrabold text-[var(--md-primary)]">
            {activeLattice.effectiveAtomsPerCell}
          </div>
          <div className="mt-1.5 text-xs text-[var(--md-on-surface-variant)]">
            {activeLattice.atomCountBreakdown[language]}
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Coordination & Radius Relation', 'Bilangan Koordinasi & Jari-Jari', '配位数 & 格子定数関係')}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-extrabold text-[var(--md-on-surface)]">
            CN {activeLattice.coordinationNumber}
          </div>
          <div className="mt-1.5 font-mono text-xs text-[var(--md-on-surface-variant)]">
            {activeLattice.radiusFormula}
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Atomic Packing Factor (APF)', 'Faktor Kepadatan Atom (APF)', '原子充填率 (APF)')}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-extrabold text-[var(--md-primary)]">
            {activeLattice.apfLabel}
          </div>
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
            <div
              className="h-full rounded-full bg-[var(--md-primary)] transition-all duration-300"
              style={{ width: `${Math.min(100, activeLattice.apfPercent)}%` }}
            />
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Primary Slip Systems', 'Sistem Selip Utama', '主すべり系')}
          </div>
          <div className="mt-1.5 text-xs font-bold leading-relaxed text-[var(--md-on-surface)]">
            {activeLattice.slipSystems[language]}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {activeLattice.exampleMaterials.map((mat) => (
              <span
                key={mat}
                className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[var(--md-on-secondary-container)]"
              >
                {mat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Engineering Behavior Insight + Complete 14 Bravais Comparison Table */}
      <div className="glass-panel rounded-[28px] p-5 space-y-4">
        <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-primary)]">
            {pick(
              'Metallurgical & Mechanical Profile',
              'Karakteristik Metalurgi & Mekanis',
              '金属学的特性・機械的挙動'
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--md-on-surface)]">
            {activeLattice.mechanicalBehavior[language]}
          </p>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold tracking-tight text-[var(--md-on-surface)]">
              {pick(
                'Quick-Switch Reference: All 14 Bravais Lattices & 4 Key Structures (Click Row)',
                'Tabel Referensi Cepat: Semua 14 Kisi Bravais & 4 Struktur Teknik (Klik Baris)',
                '全14ブラベー格子・4主要構造 クイック比較表（行クリックで3D切替）'
              )}
            </h3>
            <span className="font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
              7 Systems · 14 Bravais + 4 Compound/HCP
            </span>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-[var(--md-outline-variant)]/60">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  <th className="px-3.5 py-2.5">Structure</th>
                  <th className="px-3.5 py-2.5">Pearson</th>
                  <th className="px-3.5 py-2.5">Unit Cell Constraints</th>
                  <th className="px-3.5 py-2.5">n / Cell</th>
                  <th className="px-3.5 py-2.5">CN</th>
                  <th className="px-3.5 py-2.5">APF</th>
                  <th className="px-3.5 py-2.5">Representative Materials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-outline-variant)]/40 bg-[var(--md-surface-container-low)]">
                {CRYSTAL_LATTICES.map((row) => {
                  const active = row.id === activeLattice.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleSelectLattice(row)}
                      className={`cursor-pointer transition ${
                        active
                          ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-semibold'
                          : 'hover:bg-[var(--md-secondary-container)]/55 text-[var(--md-on-surface)]'
                      }`}
                    >
                      <td className="px-3.5 py-2 font-bold">
                        {row.name[language]}
                      </td>
                      <td className="px-3.5 py-2 font-mono">{row.pearsonSymbol}</td>
                      <td className="px-3.5 py-2 font-mono text-[11px]">
                        {row.cellConstraints}
                      </td>
                      <td className="px-3.5 py-2 font-mono">
                        {row.effectiveAtomsPerCell}
                      </td>
                      <td className="px-3.5 py-2 font-mono">
                        {row.coordinationNumber.split(' ')[0]}
                      </td>
                      <td className="px-3.5 py-2 font-mono">{row.apfPercent}%</td>
                      <td className="px-3.5 py-2 text-[11px]">
                        {row.exampleMaterials.slice(0, 3).join(', ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
