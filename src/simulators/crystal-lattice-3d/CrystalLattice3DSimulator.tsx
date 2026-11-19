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
  ChevronLeft,
  ChevronRight,
  Compass,
  Expand,
  Grid2x2,
  LayoutGrid,
  Link2,
  Maximize2,
  Minimize2,
  PanelTop,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
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

function CrystalPreviewCanvas({
  spec,
  isDark,
  variant,
}: {
  spec: CrystalLatticeSpec;
  isDark: boolean;
  variant: 'strip' | 'grid';
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = variant === 'strip' ? 192 : 320;
    const height = variant === 'strip' ? 104 : 172;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const primaryHex =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--md-primary')
        .trim() || '#2563eb';

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderCrystalScene(
      ctx,
      width,
      height,
      { yaw: -0.62, pitch: -0.34, zoom: 1.08, panX: 0, panY: 0 },
      {
        lattice: spec,
        bOverA: spec.defaultBOverA,
        cOverA: spec.defaultCOverA,
        alphaDeg: spec.defaultAlphaDeg,
        betaDeg: spec.defaultBetaDeg,
        gammaDeg: spec.defaultGammaDeg,
        displayMode: 'ball-stick',
        atomRadiusScale: 1.0,
        explodeFactor: 0,
        showSupercell: false,
        showBonds: true,
        showAxes: false,
        showInterstitials: false,
        millerPlane: 'none',
        hoveredAtomId: null,
        selectedAtomId: null,
        isDark,
        primaryHex,
      }
    );
    ctx.restore();
  }, [spec, isDark, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={
        variant === 'strip'
          ? 'block h-[104px] w-full object-cover'
          : 'block h-[172px] w-full object-cover'
      }
      aria-hidden="true"
    />
  );
}

export function CrystalLattice3DSimulator() {
  const { language, pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [systemFilter, setSystemFilter] = useState<'all' | CrystalSystemId>('all');
  const [selectorMode, setSelectorMode] = useState<'strip' | 'gallery'>('strip');
  const [sidebarTab, setSidebarTab] = useState<'controls' | 'inspector'>('controls');
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

  const handleStepLattice = useCallback(
    (dir: -1 | 1) => {
      const list = filteredLattices.length > 0 ? filteredLattices : CRYSTAL_LATTICES;
      const idx = list.findIndex((item) => item.id === activeLattice.id);
      const nextIdx =
        idx < 0 ? 0 : (idx + dir + list.length) % list.length;
      handleSelectLattice(list[nextIdx]);
    },
    [filteredLattices, activeLattice.id, handleSelectLattice]
  );

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
        setSidebarTab('inspector');
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

  const hasVoids = Boolean(
    activeLattice.interstitials && activeLattice.interstitials.length > 0
  );

  return (
    <div className="space-y-5">
      {/* 1. Visual Crystal Structure Selector (Filter Strip + Live 3D Card Deck / Grid Gallery) */}
      <section className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Crystal System Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(SYSTEM_LABELS) as ('all' | CrystalSystemId)[]).map(
              (sysKey) => {
                const active = systemFilter === sysKey;
                return (
                  <button
                    key={sysKey}
                    type="button"
                    onClick={() => setSystemFilter(sysKey)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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

          {/* Strip / Grid Gallery View Toggle */}
          <div className="flex shrink-0 items-center rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectorMode('strip')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
                selectorMode === 'strip'
                  ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] shadow-2xs'
                  : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <PanelTop className="h-3.5 w-3.5" />
              {pick('Strip', 'Deret', 'ストリップ')}
            </button>
            <button
              type="button"
              onClick={() => setSelectorMode('gallery')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
                selectorMode === 'gallery'
                  ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] shadow-2xs'
                  : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {pick('Gallery', 'Galeri', 'ギャラリー')}
            </button>
          </div>
        </div>

        {/* Horizontal 3D Thumbnail Deck (Compact Strip) or Expanded Visual Gallery */}
        {selectorMode === 'strip' ? (
          <div className="mt-3.5 flex gap-3 overflow-x-auto pb-1.5">
            {filteredLattices.map((spec) => {
              const isSel = spec.id === activeLattice.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleSelectLattice(spec)}
                  className={`group relative w-48 shrink-0 overflow-hidden rounded-[22px] border text-left transition ${
                    isSel
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-sm ring-1 ring-[var(--md-primary)]/40'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:border-[var(--md-primary)]/50 hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  <div className="relative overflow-hidden border-b border-[var(--md-outline-variant)]/45">
                    <CrystalPreviewCanvas
                      spec={spec}
                      isDark={isDark}
                      variant="strip"
                    />
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold backdrop-blur-md ${
                        isSel
                          ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                          : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]/85 text-[var(--md-on-surface)]'
                      }`}
                    >
                      {spec.pearsonSymbol}
                    </span>
                    {isSel && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)]">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <div className="px-3 py-2.5">
                    <div className="truncate text-xs font-extrabold tracking-tight">
                      {spec.name[language]}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] opacity-80">
                      <span>CN {spec.coordinationNumber.split(' ')[0]}</span>
                      <span>APF {spec.apfPercent}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLattices.map((spec) => {
              const isSel = spec.id === activeLattice.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    handleSelectLattice(spec);
                    setSelectorMode('strip');
                  }}
                  className={`m3-card group flex flex-col overflow-hidden rounded-[24px] border text-left transition ${
                    isSel
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-sm ring-1 ring-[var(--md-primary)]/40'
                      : 'border-[var(--md-outline-variant)]/65 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:border-[var(--md-primary)]/50'
                  }`}
                >
                  <div className="relative w-full overflow-hidden border-b border-[var(--md-outline-variant)]/45">
                    <CrystalPreviewCanvas
                      spec={spec}
                      isDark={isDark}
                      variant="grid"
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold backdrop-blur-md ${
                        isSel
                          ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                          : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]/90 text-[var(--md-on-surface)]'
                      }`}
                    >
                      {spec.pearsonSymbol}
                    </span>
                    <span className="absolute right-3 top-3 rounded-full bg-[var(--md-surface-container)]/90 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[var(--md-on-surface)] backdrop-blur-md">
                      APF {spec.apfPercent}%
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="text-sm font-extrabold tracking-tight">
                        {spec.name[language]}
                      </h3>
                      <p className="mt-1 font-mono text-[11px] opacity-80">
                        {spec.cellConstraints}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--md-outline-variant)]/40 pt-2.5">
                      <span className="min-w-0 flex-1 truncate font-mono text-[10px] opacity-80">
                        {spec.exampleMaterials.slice(0, 2).join(' · ')}
                      </span>
                      <span className="shrink-0 rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]">
                        {pick('Load 3D', 'Muat 3D', '3D開く')}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Unified & Aligned 3D Crystal Studio Workstation */}
      <section
        className={`overflow-hidden rounded-[28px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-sm ${
          isFullscreen ? 'fixed inset-3 z-50 flex flex-col' : ''
        }`}
      >
        {/* Single Integrated Top Studio Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-4 py-2.5">
          {/* Left: Prev/Next Stepper + Active Crystal Title */}
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 items-center rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-0.5">
              <button
                type="button"
                onClick={() => handleStepLattice(-1)}
                title={pick('Previous Structure', 'Struktur Sebelumnya', '前の結晶構造')}
                className="rounded-full p-1 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-surface)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleStepLattice(1)}
                title={pick('Next Structure', 'Struktur Berikutnya', '次の結晶構造')}
                className="rounded-full p-1 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-surface)]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <span className="hidden rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[var(--md-on-primary-container)] sm:inline-flex">
              {activeLattice.shortName}
            </span>

            <h2 className="truncate text-sm font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-base">
              {activeLattice.name[language]}
            </h2>
          </div>

          {/* Right: Camera Presets + Orbit + Fullscreen */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-0.5 text-[11px] font-semibold">
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
                  className="rounded-full px-2.5 py-1 font-mono text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAutoRotate((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                autoRotate
                  ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                  : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)]'
              }`}
            >
              <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              {pick('Auto-Orbit', 'Putar', '自動回転')}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((p) => !p)}
              title={pick('Toggle Fullscreen', 'Layar Penuh', '全画面切替')}
              className="rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-1.5 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-surface)]"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Strictly Aligned 2-Column Studio Body */}
        <div
          className={`grid ${isFullscreen ? 'min-h-0 flex-1' : ''} lg:grid-cols-[1fr_336px]`}
        >
          {/* Left Column: Clean 3D Canvas with Minimal Floating Pill Overlays */}
          <div
            ref={containerRef}
            className={`relative w-full select-none overflow-hidden ${
              isFullscreen ? 'min-h-[400px] flex-1 lg:h-full' : 'h-[460px] lg:h-[540px]'
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

            {/* Top-Left Compact Zoom + Constraints Capsule */}
            <div className="pointer-events-none absolute left-3.5 top-3.5 flex flex-wrap items-center gap-2">
              <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-[var(--md-outline-variant)]/65 bg-[var(--md-surface-container)]/90 p-1 shadow-sm backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    cameraRef.current.zoom = Math.max(0.45, cameraRef.current.zoom / 1.15);
                  }}
                  title={pick('Zoom Out', 'Perkecil', '縮小')}
                  className="rounded-full p-1 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-surface)]"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cameraRef.current = { ...DEFAULT_CAMERA };
                  }}
                  title={pick('Reset Camera', 'Reset Kamera', 'カメラリセット')}
                  className="rounded-full p-1 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-surface)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cameraRef.current.zoom = Math.min(2.6, cameraRef.current.zoom * 1.15);
                  }}
                  title={pick('Zoom In', 'Perbesar', '拡大')}
                  className="rounded-full p-1 text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-surface)]"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="rounded-full border border-[var(--md-outline-variant)]/65 bg-[var(--md-surface-container)]/90 px-3 py-1 font-mono text-[11px] font-semibold text-[var(--md-on-surface)] shadow-sm backdrop-blur-md">
                {activeLattice.cellConstraints}
              </div>
            </div>

            {/* Top-Right Compact Atom Site Role Legend */}
            <div className="pointer-events-none absolute right-3.5 top-3.5 hidden flex-col gap-1 rounded-2xl border border-[var(--md-outline-variant)]/65 bg-[var(--md-surface-container)]/90 px-3 py-2 shadow-sm backdrop-blur-md sm:flex">
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
              {showInterstitials && hasVoids && (
                <div className="mt-0.5 flex items-center gap-2 border-t border-[var(--md-outline-variant)]/40 pt-1 text-[10px] font-semibold text-rose-500">
                  <span className="inline-block h-2.5 w-2.5 rotate-45 bg-rose-500" />
                  {pick('Octa / Tetra Void', 'Rongga Okta / Tetra', '八面体・四面体空隙')}
                </div>
              )}
            </div>

            {/* Bottom-Center Floating Display Mode Pill Dock */}
            <div className="pointer-events-auto absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container)]/92 p-1 shadow-md backdrop-blur-xl">
              {(
                [
                  ['ball-stick', pick('Ball & Stick', 'Bola & Batang', '球棒')],
                  ['hard-sphere', pick('Hard-Sphere APF', 'Bola Rapat', '剛体球 APF')],
                  ['coordination', pick('Coordination', 'Koordinasi', '配位結合')],
                ] as const
              ).map(([mId, label]) => (
                <button
                  key={mId}
                  type="button"
                  onClick={() => setDisplayMode(mId)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                    displayMode === mId
                      ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-2xs'
                      : 'text-[var(--md-on-surface-variant)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Aligned 2-Tab Controls & Inspector Sidebar (540px matched height) */}
          <aside
            className={`flex flex-col border-t border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] lg:border-l lg:border-t-0 ${
              isFullscreen ? 'lg:h-full' : 'lg:h-[540px]'
            }`}
          >
            {/* Segmented 2-Tab Sidebar Switch */}
            <div className="border-b border-[var(--md-outline-variant)]/50 p-3">
              <div className="grid grid-cols-2 gap-1 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSidebarTab('controls')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 transition ${
                    sidebarTab === 'controls'
                      ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] shadow-2xs'
                      : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {pick('Controls', 'Kontrol', '制御')}
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('inspector')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full py-1.5 transition ${
                    sidebarTab === 'inspector'
                      ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] shadow-2xs'
                      : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  <Atom className="h-3.5 w-3.5" />
                  {pick('Atom & Alloy', 'Atom & Paduan', '原子・物性')}
                </button>
              </div>
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
              {sidebarTab === 'controls' ? (
                <>
                  {/* 2x2 Material You Quick Settings Overlay Toggles */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSupercell((p) => !p)}
                      className={`flex items-center gap-2 rounded-[18px] border px-3 py-2.5 text-left text-xs font-bold transition ${
                        showSupercell
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <Grid2x2 className="h-4 w-4 shrink-0 text-[var(--md-primary)]" />
                      <span className="truncate">
                        {pick('2×2×2 Cell', 'Supersel 2×', '2×2×2 拡張')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBonds((p) => !p)}
                      className={`flex items-center gap-2 rounded-[18px] border px-3 py-2.5 text-left text-xs font-bold transition ${
                        showBonds
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <Link2 className="h-4 w-4 shrink-0 text-[var(--md-primary)]" />
                      <span className="truncate">
                        {pick('Bonds', 'Ikatan', '原子結合')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAxes((p) => !p)}
                      className={`flex items-center gap-2 rounded-[18px] border px-3 py-2.5 text-left text-xs font-bold transition ${
                        showAxes
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <Axis3d className="h-4 w-4 shrink-0 text-[var(--md-primary)]" />
                      <span className="truncate">
                        {pick('Axes (a,b,c)', 'Sumbu', '結晶軸')}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={!hasVoids}
                      onClick={() => setShowInterstitials((p) => !p)}
                      className={`flex items-center gap-2 rounded-[18px] border px-3 py-2.5 text-left text-xs font-bold transition disabled:pointer-events-none disabled:opacity-45 ${
                        showInterstitials && hasVoids
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <Sparkles className="h-4 w-4 shrink-0 text-[var(--md-primary)]" />
                      <span className="truncate">
                        {pick('Void Sites', 'Rongga', '格子空隙')}
                      </span>
                    </button>
                  </div>

                  {/* Miller Slip Plane (hkl) Overlay */}
                  <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                      <Compass className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                      {pick('Miller Slip Plane (hkl)', 'Bidang Miller (hkl)', 'ミラー指数すべり面')}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
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

                  {/* Visual Scale & Unit Cell Geometry Sliders */}
                  <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                        <Box className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                        {pick('Geometry & Scale', 'Geometri & Skala', '寸法・格子制御')}
                      </span>
                      <button
                        type="button"
                        onClick={handleResetCellParams}
                        className="rounded-full bg-[var(--md-surface-container-high)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-primary)] transition hover:bg-[var(--md-primary-container)]"
                      >
                        {pick('Reset', 'Reset', 'リセット')}
                      </button>
                    </div>

                    <label className="block space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span>{pick('Atom Radius', 'Radius Atom', '原子半径')}</span>
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
                      <div className="flex justify-between text-[11px] font-semibold">
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
                          <span>α = β = γ</span>
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
                </>
              ) : (
                <>
                  {/* Selected Atom 3D Inspector Card */}
                  <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--md-on-surface)]">
                        {pick('Selected Atom Inspector', 'Inspektor Atom', '選択原子インスペクタ')}
                      </span>
                      {selectedAtom && (
                        <button
                          type="button"
                          onClick={() => setSelectedAtom(null)}
                          className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]"
                        >
                          {pick('Clear', 'Hapus', '解除')}
                        </button>
                      )}
                    </div>

                    {selectedAtom ? (
                      <div className="mt-2.5 space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-bold text-[var(--md-primary)]">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: ROLE_META[selectedAtom.spec.role].colorHex,
                            }}
                          />
                          {ROLE_META[selectedAtom.spec.role].label[language]}
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                          <div className="rounded-xl bg-[var(--md-surface-container)] p-2">
                            <div className="text-[10px]">
                              {pick('Cell Share', 'Porsi Sel', '寄与率')}
                            </div>
                            <strong className="text-sm text-[var(--md-on-surface)]">
                              {selectedAtom.spec.cellWeightLabel}
                            </strong>
                          </div>
                          <div className="rounded-xl bg-[var(--md-surface-container)] p-2">
                            <div className="text-[10px]">
                              {pick('Neighbors', 'Tetangga', '配位数')}
                            </div>
                            <strong className="text-sm text-[var(--md-on-surface)]">
                              {selectedNeighborCount}
                            </strong>
                          </div>
                        </div>
                        <div className="rounded-xl bg-[var(--md-surface-container)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                          (u, v, w) = ({selectedAtom.spec.u.toFixed(2)},{' '}
                          {selectedAtom.spec.v.toFixed(2)},{' '}
                          {selectedAtom.spec.w.toFixed(2)})
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs leading-relaxed text-[var(--md-on-surface-variant)]">
                        {pick(
                          'Click any atom sphere inside the 3D viewport to spotlight its nearest-neighbor coordination bonds and unit-cell weight.',
                          'Klik bola atom mana saja pada tampilan 3D untuk menyorot ikatan tetangga dan porsi sel satuannya.',
                          '3Dビュー内の原子をクリックすると配位結合と単位格子への寄与率を表示します。'
                        )}
                      </p>
                    )}
                  </div>

                  {/* Metallurgical Profile & Engineering Alloys */}
                  <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] p-3.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--md-primary)]">
                      {pick(
                        'Mechanical & Metallurgical Notes',
                        'Catatan Mekanis & Metalurgi',
                        '金属学・機械的性質'
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--md-on-surface)]">
                      {activeLattice.mechanicalBehavior[language]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
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
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* 3. Clean 4-Card Aligned KPI Telemetry Strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card flex flex-col justify-between rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Effective Atoms / Cell (n)', 'Atom Efektif / Sel (n)', '実効原子数 (n)')}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-extrabold text-[var(--md-primary)]">
            {activeLattice.effectiveAtomsPerCell}
          </div>
          <div className="mt-2 text-xs text-[var(--md-on-surface-variant)]">
            {activeLattice.atomCountBreakdown[language]}
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Coordination & Radius', 'Koordinasi & Jari-Jari', '配位数 & 格子定数')}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-extrabold text-[var(--md-on-surface)]">
            CN {activeLattice.coordinationNumber.split(' ')[0]}
          </div>
          <div className="mt-2 font-mono text-xs text-[var(--md-on-surface-variant)]">
            {activeLattice.radiusFormula}
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Atomic Packing Factor (APF)', 'Kepadatan Atom (APF)', '原子充填率 (APF)')}
          </div>
          <div className="mt-1.5 font-mono text-2xl font-extrabold text-[var(--md-primary)]">
            {activeLattice.apfLabel}
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
            <div
              className="h-full rounded-full bg-[var(--md-primary)] transition-all duration-300"
              style={{ width: `${Math.min(100, activeLattice.apfPercent)}%` }}
            />
          </div>
        </div>

        <div className="glass-card flex flex-col justify-between rounded-[24px] p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Primary Slip & Materials', 'Sistem Selip & Material', '主すべり系・材料')}
          </div>
          <div className="mt-1.5 text-xs font-bold leading-relaxed text-[var(--md-on-surface)]">
            {activeLattice.slipSystems[language]}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {activeLattice.exampleMaterials.slice(0, 4).map((mat) => (
              <span
                key={mat}
                className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[var(--md-on-secondary-container)]"
              >
                {mat}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
