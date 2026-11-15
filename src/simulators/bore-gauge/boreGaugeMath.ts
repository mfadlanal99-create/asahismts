import { degToRad } from '../../physics';

export type LinerPresetId =
  | 'healthy'
  | 'top-taper'
  | 'thrust-ovality'
  | 'barrel-wear'
  | 'blind-challenge';

export type DepthPlaneId = 'top' | 'mid' | 'bottom';
export type BoreAxisId = 'axisA' | 'axisB';

export interface BorePlaneReadings {
  axisA: number; // 0° Thrust axis diameter (mm)
  axisB: number; // 90° Wrist Pin axis diameter (mm)
}

export interface LinerProfile {
  id: LinerPresetId;
  nominalMm: number;
  serviceLimitMm: number; // 0.050 mm OEM limit for both Ovality and Taper
  planes: Record<DepthPlaneId, BorePlaneReadings>;
  expectedVerdict: 'PASS' | 'RE-BORE';
  faultCategory: 'healthy' | 'taper' | 'ovality' | 'barrel';
}

export interface RecordedBoreMap {
  top: { axisA: number | null; axisB: number | null };
  mid: { axisA: number | null; axisB: number | null };
  bottom: { axisA: number | null; axisB: number | null };
}

export const NOMINAL_BORE_MM = 85.0;
export const OEM_SERVICE_LIMIT_MM = 0.05;

export const DEPTH_PLANES: {
  id: DepthPlaneId;
  depthMm: number;
  yRatio: number;
}[] = [
  { id: 'top', depthMm: 15, yRatio: 0.16 },
  { id: 'mid', depthMm: 75, yRatio: 0.5 },
  { id: 'bottom', depthMm: 135, yRatio: 0.84 },
];

export const LINER_PRESETS: Record<Exclude<LinerPresetId, 'blind-challenge'>, LinerProfile> = {
  healthy: {
    id: 'healthy',
    nominalMm: NOMINAL_BORE_MM,
    serviceLimitMm: OEM_SERVICE_LIMIT_MM,
    planes: {
      top: { axisA: 85.012, axisB: 85.008 },
      mid: { axisA: 85.015, axisB: 85.009 },
      bottom: { axisA: 85.006, axisB: 85.004 },
    },
    expectedVerdict: 'PASS',
    faultCategory: 'healthy',
  },
  'top-taper': {
    id: 'top-taper',
    nominalMm: NOMINAL_BORE_MM,
    serviceLimitMm: OEM_SERVICE_LIMIT_MM,
    planes: {
      top: { axisA: 85.084, axisB: 85.068 },
      mid: { axisA: 85.042, axisB: 85.032 },
      bottom: { axisA: 85.012, axisB: 85.008 },
    },
    expectedVerdict: 'RE-BORE',
    faultCategory: 'taper',
  },
  'thrust-ovality': {
    id: 'thrust-ovality',
    nominalMm: NOMINAL_BORE_MM,
    serviceLimitMm: OEM_SERVICE_LIMIT_MM,
    planes: {
      top: { axisA: 85.058, axisB: 85.014 },
      mid: { axisA: 85.078, axisB: 85.012 },
      bottom: { axisA: 85.022, axisB: 85.008 },
    },
    expectedVerdict: 'RE-BORE',
    faultCategory: 'ovality',
  },
  'barrel-wear': {
    id: 'barrel-wear',
    nominalMm: NOMINAL_BORE_MM,
    serviceLimitMm: OEM_SERVICE_LIMIT_MM,
    planes: {
      top: { axisA: 85.018, axisB: 85.014 },
      mid: { axisA: 85.076, axisB: 85.018 },
      bottom: { axisA: 85.014, axisB: 85.01 },
    },
    expectedVerdict: 'RE-BORE',
    faultCategory: 'barrel',
  },
};

const BLIND_VARIANTS: Omit<LinerProfile, 'id'>[] = [
  {
    nominalMm: NOMINAL_BORE_MM,
    serviceLimitMm: OEM_SERVICE_LIMIT_MM,
    planes: {
      top: { axisA: 85.076, axisB: 85.02 },
      mid: { axisA: 85.044, axisB: 85.016 },
      bottom: { axisA: 85.012, axisB: 85.008 },
    },
    expectedVerdict: 'RE-BORE',
    faultCategory: 'taper',
  },
  {
    nominalMm: NOMINAL_BORE_MM,
    serviceLimitMm: OEM_SERVICE_LIMIT_MM,
    planes: {
      top: { axisA: 85.018, axisB: 85.01 },
      mid: { axisA: 85.022, axisB: 85.012 },
      bottom: { axisA: 85.008, axisB: 85.005 },
    },
    expectedVerdict: 'PASS',
    faultCategory: 'healthy',
  },
  {
    nominalMm: NOMINAL_BORE_MM,
    serviceLimitMm: OEM_SERVICE_LIMIT_MM,
    planes: {
      top: { axisA: 85.052, axisB: 85.012 },
      mid: { axisA: 85.082, axisB: 85.014 },
      bottom: { axisA: 85.02, axisB: 85.009 },
    },
    expectedVerdict: 'RE-BORE',
    faultCategory: 'ovality',
  },
];

export function getBlindLinerProfile(variantIndex: number): LinerProfile {
  const chosen = BLIND_VARIANTS[Math.abs(variantIndex) % BLIND_VARIANTS.length];
  return {
    id: 'blind-challenge',
    ...chosen,
  };
}

/**
 * Computes the apparent bore span D(theta) when the dial bore gauge stem is tilted
 * by `rockingAngleDeg` degrees away from perpendicular (theta = 0° null point).
 * D(theta) = D_true / cos(theta)
 */
export function computeRockedReading(
  trueDiameterMm: number,
  rockingAngleDeg: number,
  bezelZeroOffsetMm = 0
): {
  apparentSpanMm: number;
  cosineErrorMm: number;
  dialDeviationMm: number;
  isAtNullPoint: boolean;
} {
  const rad = degToRad(rockingAngleDeg);
  const cosVal = Math.cos(rad);
  const rawSpan = trueDiameterMm / cosVal;
  const apparentSpanMm = Number((rawSpan + bezelZeroOffsetMm).toFixed(3));
  const cosineErrorMm = Number((rawSpan - trueDiameterMm).toFixed(3));
  const dialDeviationMm = Number((apparentSpanMm - NOMINAL_BORE_MM).toFixed(3));
  const isAtNullPoint = Math.abs(rockingAngleDeg) <= 0.25;

  return {
    apparentSpanMm,
    cosineErrorMm,
    dialDeviationMm,
    isAtNullPoint,
  };
}

export function createEmptyBoreMap(): RecordedBoreMap {
  return {
    top: { axisA: null, axisB: null },
    mid: { axisA: null, axisB: null },
    bottom: { axisA: null, axisB: null },
  };
}

export function computeBoreMapMetrics(map: RecordedBoreMap) {
  const ovalityByPlane: Record<DepthPlaneId, number | null> = {
    top:
      map.top.axisA !== null && map.top.axisB !== null
        ? Number(Math.abs(map.top.axisA - map.top.axisB).toFixed(3))
        : null,
    mid:
      map.mid.axisA !== null && map.mid.axisB !== null
        ? Number(Math.abs(map.mid.axisA - map.mid.axisB).toFixed(3))
        : null,
    bottom:
      map.bottom.axisA !== null && map.bottom.axisB !== null
        ? Number(Math.abs(map.bottom.axisA - map.bottom.axisB).toFixed(3))
        : null,
  };

  const taperByAxis: Record<BoreAxisId, number | null> = {
    axisA:
      map.top.axisA !== null && map.bottom.axisA !== null
        ? Number(Math.abs(map.top.axisA - map.bottom.axisA).toFixed(3))
        : null,
    axisB:
      map.top.axisB !== null && map.bottom.axisB !== null
        ? Number(Math.abs(map.top.axisB - map.bottom.axisB).toFixed(3))
        : null,
  };

  // Also compute axial barrel excursion (max - min across Top/Mid/Bottom) so barrel wear is caught
  const axialSpanByAxis: Record<BoreAxisId, number | null> = {
    axisA:
      map.top.axisA !== null && map.mid.axisA !== null && map.bottom.axisA !== null
        ? Number(
            (
              Math.max(map.top.axisA, map.mid.axisA, map.bottom.axisA) -
              Math.min(map.top.axisA, map.mid.axisA, map.bottom.axisA)
            ).toFixed(3)
          )
        : null,
    axisB:
      map.top.axisB !== null && map.mid.axisB !== null && map.bottom.axisB !== null
        ? Number(
            (
              Math.max(map.top.axisB, map.mid.axisB, map.bottom.axisB) -
              Math.min(map.top.axisB, map.mid.axisB, map.bottom.axisB)
            ).toFixed(3)
          )
        : null,
  };

  const validOvalities = Object.values(ovalityByPlane).filter(
    (v): v is number => v !== null
  );
  const maxOvalityMm =
    validOvalities.length > 0 ? Math.max(...validOvalities) : null;

  const validTapers = [
    taperByAxis.axisA,
    taperByAxis.axisB,
  ].filter((v): v is number => v !== null);
  const maxTaperMm = validTapers.length > 0 ? Math.max(...validTapers) : null;

  const validAxialSpans = [
    axialSpanByAxis.axisA,
    axialSpanByAxis.axisB,
  ].filter((v): v is number => v !== null);
  const maxAxialVariationMm =
    validAxialSpans.length > 0 ? Math.max(...validAxialSpans) : null;

  const recordedCount =
    (map.top.axisA !== null ? 1 : 0) +
    (map.top.axisB !== null ? 1 : 0) +
    (map.mid.axisA !== null ? 1 : 0) +
    (map.mid.axisB !== null ? 1 : 0) +
    (map.bottom.axisA !== null ? 1 : 0) +
    (map.bottom.axisB !== null ? 1 : 0);

  const isServiceLimitExceeded =
    (maxOvalityMm !== null && maxOvalityMm > OEM_SERVICE_LIMIT_MM + 1e-6) ||
    (maxTaperMm !== null && maxTaperMm > OEM_SERVICE_LIMIT_MM + 1e-6) ||
    (maxAxialVariationMm !== null && maxAxialVariationMm > OEM_SERVICE_LIMIT_MM + 1e-6);

  return {
    ovalityByPlane,
    taperByAxis,
    axialSpanByAxis,
    maxOvalityMm,
    maxTaperMm,
    maxAxialVariationMm,
    recordedCount,
    isServiceLimitExceeded,
  };
}
