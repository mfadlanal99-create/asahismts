import {
  degToRad,
  G_ACCEL,
} from '../../physics';

// Hardness Testing Simulator Data & Physics Engine
// Standards: ASTM E18 (Rockwell), ASTM E10 (Brinell), ASTM E92 (Vickers), ASTM E140 (Standard Hardness Conversion Tables)

export type HardnessScaleId = 'HRC' | 'HRB' | 'HBW' | 'HV';

export type IndenterType = 'diamond_cone' | 'ball_1_16' | 'ball_10mm' | 'diamond_pyramid';

export interface HardnessScaleConfig {
  id: HardnessScaleId;
  name: string;
  fullName: string;
  standard: string;
  indenterType: IndenterType;
  indenterName: string;
  indenterGeometry: string;
  minorLoadKgf: number;
  majorLoadKgf: number;
  totalLoadKgf: number;
  defaultDwellSec: number;
  unit: string;
  minRecommended: number;
  maxRecommended: number;
  readoutFormula: string;
}

export const HARDNESS_SCALES: Record<HardnessScaleId, HardnessScaleConfig> = {
  HRC: {
    id: 'HRC',
    name: 'Rockwell C',
    fullName: 'Rockwell C Scale (HRC)',
    standard: 'ASTM E18 / ISO 6508-1',
    indenterType: 'diamond_cone',
    indenterName: 'Brale Diamond Cone',
    indenterGeometry: '120° Spheroconical diamond, 0.20 mm spherical tip radius',
    minorLoadKgf: 10,
    majorLoadKgf: 140,
    totalLoadKgf: 150,
    defaultDwellSec: 10,
    unit: 'HRC',
    minRecommended: 20,
    maxRecommended: 70,
    readoutFormula: 'HRC = 100 - (h / 0.002 mm)',
  },
  HRB: {
    id: 'HRB',
    name: 'Rockwell B',
    fullName: 'Rockwell B Scale (HRB)',
    standard: 'ASTM E18 / ISO 6508-1',
    indenterType: 'ball_1_16',
    indenterName: '1/16" (1.588 mm) Carbide Ball',
    indenterGeometry: 'Grade 25 WC or hardened steel ball, 1.5875 mm diameter',
    minorLoadKgf: 10,
    majorLoadKgf: 90,
    totalLoadKgf: 100,
    defaultDwellSec: 10,
    unit: 'HRB',
    minRecommended: 0,
    maxRecommended: 100,
    readoutFormula: 'HRB = 130 - (h / 0.002 mm)',
  },
  HBW: {
    id: 'HBW',
    name: 'Brinell (HBW 10/3000)',
    fullName: 'Brinell Hardness (HBW 10/3000)',
    standard: 'ASTM E10 / ISO 6506-1',
    indenterType: 'ball_10mm',
    indenterName: '10 mm Tungsten Carbide Ball',
    indenterGeometry: 'Polished tungsten carbide spherical indenter, 10.00 mm diameter',
    minorLoadKgf: 0,
    majorLoadKgf: 3000,
    totalLoadKgf: 3000,
    defaultDwellSec: 15,
    unit: 'HBW',
    minRecommended: 50,
    maxRecommended: 650,
    readoutFormula: 'HBW = 2F / [π·D·(D - √(D² - d²))]',
  },
  HV: {
    id: 'HV',
    name: 'Vickers (HV 30)',
    fullName: 'Vickers Pyramid Hardness (HV 30)',
    standard: 'ASTM E92 / ISO 6507-1',
    indenterType: 'diamond_pyramid',
    indenterName: 'Vickers 136° Diamond Pyramid',
    indenterGeometry: 'Square-base pyramid with 136° face angle (0.5 µm vertex precision)',
    minorLoadKgf: 0,
    majorLoadKgf: 30,
    totalLoadKgf: 30,
    defaultDwellSec: 12,
    unit: 'HV',
    minRecommended: 40,
    maxRecommended: 1000,
    readoutFormula: 'HV = 1.8544 · F / d²',
  },
};

export type SpecimenMaterialId =
  | 'tool-steel-d2'
  | '4140-qt'
  | 'mild-steel-1018'
  | 'al-6061-t6'
  | 'brass-c360'
  | 'annealed-copper';

export interface SpecimenMaterial {
  id: SpecimenMaterialId;
  name: string;
  category: 'ferrous' | 'non-ferrous';
  baseValues: {
    HRC: number;
    HRB: number;
    HBW: number;
    HV: number;
  };
  estimatedUtsMpa: number;
  color: string;
  finishColor: string;
  description: string;
  treatment: string;
  recommendedScale: HardnessScaleId;
}

export const SPECIMEN_MATERIALS: Record<SpecimenMaterialId, SpecimenMaterial> = {
  'tool-steel-d2': {
    id: 'tool-steel-d2',
    name: 'Tool Steel D2 (60 HRC)',
    category: 'ferrous',
    baseValues: {
      HRC: 60.0,
      HRB: 122.0, // Extrapolated / out-of-scale
      HBW: 601.0,
      HV: 720.0,
    },
    estimatedUtsMpa: 2200,
    color: '#64748b',
    finishColor: '#94a3b8',
    description: 'High-carbon, high-chromium cold work die steel. Outstanding abrasion resistance.',
    treatment: 'Austenitized 1030°C, air-quenched, double tempered at 200°C',
    recommendedScale: 'HRC',
  },
  '4140-qt': {
    id: '4140-qt',
    name: '4140 Q&T Steel (38 HRC)',
    category: 'ferrous',
    baseValues: {
      HRC: 38.0,
      HRB: 110.0, // Out of standard 0-100 HRB
      HBW: 353.0,
      HV: 372.0,
    },
    estimatedUtsMpa: 1180,
    color: '#475569',
    finishColor: '#64748b',
    description: 'Chromium-molybdenum medium-carbon alloy steel. High fatigue strength and toughness.',
    treatment: 'Oil quenched 845°C, tempered 540°C',
    recommendedScale: 'HRC',
  },
  'mild-steel-1018': {
    id: 'mild-steel-1018',
    name: 'Mild Steel 1018 (72 HRB)',
    category: 'ferrous',
    baseValues: {
      HRC: 14.0, // Below 20 HRC minimum
      HRB: 72.0,
      HBW: 126.0,
      HV: 131.0,
    },
    estimatedUtsMpa: 440,
    color: '#94a3b8',
    finishColor: '#cbd5e1',
    description: 'General purpose low-carbon cold-rolled steel. Ductile and readily machinable.',
    treatment: 'Cold drawn / as-received bar stock',
    recommendedScale: 'HRB',
  },
  'al-6061-t6': {
    id: 'al-6061-t6',
    name: 'Aluminum 6061-T6 (60 HRB)',
    category: 'non-ferrous',
    baseValues: {
      HRC: 0.0, // Invalid for soft aluminum
      HRB: 60.0,
      HBW: 95.0,
      HV: 107.0,
    },
    estimatedUtsMpa: 310,
    color: '#cbd5e1',
    finishColor: '#e2e8f0',
    description: 'Precipitation-hardened aerospace aluminum alloy with Mg and Si additions.',
    treatment: 'Solution heat treated 530°C and artificially aged 160°C (T6 temper)',
    recommendedScale: 'HRB',
  },
  'brass-c360': {
    id: 'brass-c360',
    name: 'Brass C360 (78 HRB)',
    category: 'non-ferrous',
    baseValues: {
      HRC: 16.0,
      HRB: 78.0,
      HBW: 143.0,
      HV: 150.0,
    },
    estimatedUtsMpa: 470,
    color: '#d97706',
    finishColor: '#fbbf24',
    description: 'Free-cutting brass with ~3% lead addition. Industry benchmark for machinability (100%).',
    treatment: 'Half-hard cold drawn (H02)',
    recommendedScale: 'HRB',
  },
  'annealed-copper': {
    id: 'annealed-copper',
    name: 'Annealed Copper (45 HBW)',
    category: 'non-ferrous',
    baseValues: {
      HRC: 0.0,
      HRB: 25.0,
      HBW: 45.0,
      HV: 50.0,
    },
    estimatedUtsMpa: 220,
    color: '#b45309',
    finishColor: '#f59e0b',
    description: 'Pure electrolytic tough-pitch copper (ETP C11000). Highly ductile and malleable.',
    treatment: 'Fully annealed at 500°C, slow cooled',
    recommendedScale: 'HBW',
  },
};

export type TestStage =
  | 'idle'
  | 'elevating'
  | 'minor_load'
  | 'major_load'
  | 'dwelling'
  | 'unloading'
  | 'measuring'
  | 'completed';

export interface HardnessConversionResult {
  HRC: { value: number; valid: boolean; note?: string };
  HRB: { value: number; valid: boolean; note?: string };
  HBW: { value: number; valid: boolean; note?: string };
  HV: { value: number; valid: boolean; note?: string };
  utsMpa: { value: number; valid: boolean; note?: string };
}

// ASTM E140 Non-Austenitic Steels & Alloys Hardness Conversion Table approximations
export function convertHardness(
  scale: HardnessScaleId,
  value: number,
  isFerrous = true
): HardnessConversionResult {
  let hrc = 0;
  let hrb = 0;
  let hbw = 0;
  let hv = 0;
  let uts = 0;

  if (scale === 'HRC') {
    hrc = value;
    // Approximations from ASTM E140 Table 1
    if (hrc >= 20 && hrc <= 68) {
      hv = Math.round(180 + 5.2 * (hrc - 20) + 0.12 * Math.pow(hrc - 20, 2) + 0.003 * Math.pow(hrc - 20, 3));
      hbw = Math.round(hv * (1 - 0.00025 * hv));
      uts = Math.round(hbw * 3.45);
      hrb = Math.min(125, Math.round(98 + (hrc - 20) * 0.55));
    } else if (hrc < 20) {
      hv = Math.max(80, Math.round(226 - (20 - hrc) * 5.5));
      hbw = Math.round(hv * 0.96);
      hrb = Math.max(0, Math.round(98 - (20 - hrc) * 2.3));
      uts = Math.round(hbw * 3.45);
    } else {
      hv = Math.round(900 + (hrc - 68) * 35);
      hbw = 650;
      uts = Math.round(hbw * 3.45);
      hrb = 130;
    }
  } else if (scale === 'HRB') {
    hrb = value;
    if (hrb >= 60 && hrb <= 100) {
      hbw = Math.round(40 + Math.exp(0.043 * hrb) * 2.8);
      hv = Math.round(hbw * 1.04);
      hrc = Math.max(0, Number(((hrb - 65) / 1.7).toFixed(1)));
      uts = Math.round(hbw * 3.45);
    } else if (hrb < 60) {
      hbw = Math.max(30, Math.round(30 + hrb * 1.1));
      hv = Math.round(hbw * 1.02);
      hrc = 0;
      uts = Math.round(hbw * 3.3);
    } else {
      // HRB > 100
      hrc = Number((20 + (hrb - 100) * 0.85).toFixed(1));
      hv = Math.round(240 + (hrb - 100) * 8.5);
      hbw = Math.round(hv * 0.95);
      uts = Math.round(hbw * 3.45);
    }
  } else if (scale === 'HBW') {
    hbw = value;
    hv = Math.round(hbw * (1 + 0.00028 * hbw));
    if (hbw >= 226) {
      hrc = Number((10 + Math.sqrt(Math.max(0, (hbw - 200) * 7.5)) * 0.9).toFixed(1));
      hrb = 100;
    } else {
      hrc = 0;
      hrb = Math.max(0, Math.min(100, Math.round(25 + Math.log(Math.max(1, hbw / 30)) * 48)));
    }
    uts = Math.round(hbw * (isFerrous ? 3.45 : 3.2));
  } else {
    // HV
    hv = value;
    hbw = Math.round(hv / (1 + 0.00028 * hv));
    if (hv >= 240) {
      hrc = Number((10 + Math.sqrt(Math.max(0, (hv - 210) * 7.2)) * 0.88).toFixed(1));
      hrb = 100;
    } else {
      hrc = 0;
      hrb = Math.max(0, Math.min(100, Math.round(22 + Math.log(Math.max(1, hv / 28)) * 46)));
    }
    uts = Math.round(hbw * (isFerrous ? 3.45 : 3.2));
  }

  return {
    HRC: {
      value: hrc,
      valid: hrc >= 20 && hrc <= 70,
      note: hrc < 20 ? 'Below 20 HRC: use HRB or HV' : hrc > 70 ? 'Above 70 HRC: diamond cone risk' : undefined,
    },
    HRB: {
      value: hrb,
      valid: hrb >= 0 && hrb <= 100,
      note: hrb > 100 ? 'Above 100 HRB: ball indenter deformation risk' : undefined,
    },
    HBW: {
      value: hbw,
      valid: hbw >= 50 && hbw <= 650,
      note: hbw > 650 ? 'Above 650 HBW: WC ball flattens' : undefined,
    },
    HV: {
      value: hv,
      valid: hv >= 40 && hv <= 1200,
    },
    utsMpa: {
      value: uts,
      valid: uts > 0,
      note: isFerrous ? 'ASTM E140 approx: UTS ≈ 3.45 × HBW' : 'Empirical correlation for non-ferrous alloys',
    },
  };
}

export interface IndentationGeometry {
  depthMm: number; // h in mm
  diameterMm: number; // d or average diagonal in mm
  d1Mm?: number;
  d2Mm?: number;
}

/**
 * Converts test load from kgf to Newtons using standard gravity constant.
 */
export function kgfToNewtons(kgf: number): number {
  return kgf * G_ACCEL;
}

export function computeIndentationGeometry(
  scale: HardnessScaleId,
  hardnessValue: number
): IndentationGeometry {
  switch (scale) {
    case 'HRC': {
      // h = (100 - HRC) * 0.002 mm
      const depthMm = Math.max(0.01, (100 - hardnessValue) * 0.002);
      // For 120 deg cone, d = 2 * h * tan(60 deg)
      const diameterMm = depthMm * 2 * Math.tan(degToRad(60));
      return { depthMm, diameterMm };
    }
    case 'HRB': {
      // h = (130 - HRB) * 0.002 mm
      const depthMm = Math.max(0.01, (130 - hardnessValue) * 0.002);
      // 1/16" ball (D = 1.5875 mm)
      const D = 1.5875;
      const dSqr = Math.max(0, 4 * depthMm * (D - depthMm));
      const diameterMm = Math.sqrt(dSqr);
      return { depthMm, diameterMm };
    }
    case 'HBW': {
      // D = 10 mm, F = 3000 kgf
      const D = 10.0;
      const F = 3000.0;
      const delta = (2 * F) / (Math.PI * D * Math.max(1, hardnessValue));
      const depthMm = delta / 2;
      const dSqr = Math.max(0, 2 * D * delta - delta * delta);
      const diameterMm = Math.min(D * 0.95, Math.sqrt(dSqr));
      return { depthMm, diameterMm };
    }
    case 'HV': {
      // F = 30 kgf, HV = 1.8544 * F / d^2 => d = sqrt(1.8544 * F / HV)
      const F = 30.0;
      const diameterMm = Math.sqrt((1.8544 * F) / Math.max(1, hardnessValue));
      // h = d / 7.0006
      const depthMm = diameterMm / 7.0006;
      // Slight asymmetry for realism
      const d1Mm = Number((diameterMm * 1.006).toFixed(4));
      const d2Mm = Number((diameterMm * 0.994).toFixed(4));
      return { depthMm, diameterMm, d1Mm, d2Mm };
    }
  }
}

export interface HardnessTestLog {
  id: string;
  timestamp: string;
  scale: HardnessScaleId;
  materialId: SpecimenMaterialId;
  materialName: string;
  appliedLoadKgf: number;
  dwellSec: number;
  measuredHardness: number;
  geometry: IndentationGeometry;
  conversions: HardnessConversionResult;
  validScale: boolean;
  statusNote: string;
}
