import type { SimulatorMeta } from '../../types/simulator';
import './bearingI18n';

export const bearingMeta: SimulatorMeta = {
  id: 'bearing',
  title: 'Bearing Selection & L10 Life / Fit Simulator',
  shortTitle: 'Bearing & Fits',
  category: 'Rotating Equipment',
  difficulty: 'Intermediate',
  description:
    'Select ball and roller bearings, evaluate ISO 281 L10/L10h fatigue life, compute equivalent dynamic loads, and verify ISO 286 shaft/housing fits.',
  iconName: 'Cog',
  accentColor: 'violet',
  explore: [
    {
      title: '1. ISO 281 Basic & Modified Rating Life (L10, L10h, Lna)',
      summary:
        'Rolling bearings fail primarily by subsurface rolling-contact fatigue. The basic rating life L10 is the number of revolutions (in millions) that 90% of a group of identical bearings will complete before the first sign of fatigue spalling. Point-contact ball bearings use exponent p = 3, while line-contact roller bearings use p = 10/3 (3.33). The modified life L10ha scales basic life by the ISO reliability/lubrication factor a_ISO.',
      equations: [
        {
          label: 'Basic Rating Life (million revs)',
          formula: 'L10 = (C / P)^p',
          note: 'C = basic dynamic load rating (kN), P = equivalent dynamic load (kN), p = 3 (ball) or 10/3 (roller).',
        },
        {
          label: 'Operating Hours Life',
          formula: 'L10h = (10^6 / (60 · N)) · L10',
          note: 'N = rotational speed in RPM.',
        },
        {
          label: 'Modified Rating Life',
          formula: 'L10ha = a_ISO · L10h',
          note: 'a_ISO accounts for lubrication film thickness (kappa), contamination, and fatigue load limit.',
        },
      ],
      workedExample: {
        title: 'L10 and L10h for a 6308 Deep Groove Ball Bearing',
        given: [
          'Bearing: 6308 (C = 42.3 kN, p = 3)',
          'Equivalent dynamic load: P = 6.0 kN',
          'Speed: N = 1500 RPM',
        ],
        steps: [
          'Compute basic life in million revolutions: L10 = (42.3 / 6.0)^3 = (7.05)^3 = 350.4 million revs.',
          'Convert revolutions to operating hours: L10h = (1,000,000 / (60 × 1500)) × 350.4.',
          'L10h = 11.111 × 350.4 = 3,893 hours.',
        ],
        answer: 'L10 = 350.4 million revs, L10h = 3,893 hours',
      },
    },
    {
      title: '2. Equivalent Dynamic Load (P = X·Fr + Y·Fa) & Static Safety (s0)',
      summary:
        'Real shafts carry both radial (Fr) and axial (Fa) loads. ISO 281 combines them into a single equivalent radial load P using radial factor X and axial factor Y, selected by comparing Fa/Fr against a bearing-specific threshold e. Note that NU-type cylindrical roller bearings have separable inner rings with no ribs, so they cannot carry any axial load (Fa must be 0). Static safety s0 = C0 / P0 guards against permanent raceway brinelling under shock or stationary loads.',
      equations: [
        {
          label: 'Equivalent Dynamic Load',
          formula: 'P = X · Fr + Y · Fa',
          note: 'When Fa/Fr <= e, typically X = 1, Y = 0 (except double-row spherical rollers).',
        },
        {
          label: 'Static Safety Factor',
          formula: 's0 = C0 / P0',
          note: 'Target s0 >= 1.5 for normal industrial service; s0 < 1.0 risks plastic brinelling.',
        },
      ],
      workedExample: {
        title: 'Equivalent Load on a 30208 Tapered Roller Bearing',
        given: [
          'Bearing: 30208 (e = 0.37, X = 0.4, Y = 1.6)',
          'Radial load Fr = 8.0 kN, Axial load Fa = 4.0 kN',
        ],
        steps: [
          'Check load ratio: Fa / Fr = 4.0 / 8.0 = 0.50.',
          'Since 0.50 > e (0.37), use X = 0.4 and Y = 1.6.',
          'Compute P = 0.4 × 8.0 + 1.6 × 4.0 = 3.2 + 6.4 = 9.6 kN.',
        ],
        answer: 'P = 9.6 kN',
      },
    },
    {
      title: '3. ISO 286 Shaft & Housing Fits',
      summary:
        'A ring that rotates relative to the load direction must have an interference fit to prevent ring creep and fretting corrosion. For a standard rotating shaft with stationary housing load, the inner ring uses an interference fit (k5 or m5) while the outer ring uses a clearance or transition fit (H7 or J7) so it can float axially for thermal expansion. Conversely, a stationary shaft with rotating outer ring (e.g., pulley hub) uses a clearance shaft fit (g6) and interference housing fit (N7).',
      equations: [
        {
          label: 'Shaft-to-Bore Clearance',
          formula: 'Clearance = d_bore - d_shaft',
          note: 'Negative values indicate interference (µm).',
        },
        {
          label: 'Radial Clearance Reduction',
          formula: 'ΔCr ≈ 0.8 · δ_shaft + 0.6 · δ_housing',
          note: 'Interference expands the inner ring and compresses the outer ring, reducing internal radial clearance.',
        },
      ],
      workedExample: {
        title: '6308 Bore (40 mm) on an ISO k5 Shaft',
        given: [
          '6308 Normal Bore Tolerance (d = 40 mm): 0 to -12 µm',
          'ISO k5 Shaft Tolerance (30 < d <= 50 mm): +2 to +13 µm',
        ],
        steps: [
          'Minimum clearance (tightest fit): d_bore,min - d_shaft,max = -12 - (+13) = -25 µm (25 µm interference).',
          'Maximum clearance (loosest fit): d_bore,max - d_shaft,min = 0 - (+2) = -2 µm (2 µm interference).',
          'Both extremes are negative, guaranteeing an interference fit with 13.5 µm mean interference.',
        ],
        answer: '2 to 25 µm Interference Fit (mean 13.5 µm)',
      },
    },
  ],
  practice: [
    {
      id: 'bearing-p1',
      prompt:
        'A 6206 deep groove ball bearing (C = 20.3 kN, p = 3) carries a pure radial load of Fr = 4.0 kN (Fa = 0 kN). Calculate its basic rating life L10 in million revolutions.',
      hint: 'Use L10 = (C / P)^p with P = Fr = 4.0 kN and p = 3.',
      targetValue: 130.71,
      unit: 'million revs',
      tolerance: 2.0,
      solutionSteps: [
        'Since Fa = 0 kN, P = Fr = 4.0 kN.',
        'L10 = (20.3 / 4.0)^3 = (5.075)^3.',
        'L10 = 130.71 million revolutions.',
      ],
    },
    {
      id: 'bearing-p2',
      prompt:
        'Convert L10 = 130.71 million revolutions into operating hours L10h for a shaft running at N = 1200 RPM.',
      hint: 'L10h = (1,000,000 / (60 × N)) × L10.',
      targetValue: 1815.4,
      unit: 'hours',
      tolerance: 25,
      solutionSteps: [
        'Revolutions per hour = 60 × 1200 = 72,000 rev/h = 0.072 million rev/h.',
        'L10h = 130.71 / 0.072 = 1,815.4 hours.',
      ],
    },
    {
      id: 'bearing-p3',
      prompt:
        'A 30208 tapered roller bearing (e = 0.37, X = 0.4, Y = 1.6) supports Fr = 10.0 kN and Fa = 5.0 kN. Compute the equivalent dynamic load P (kN).',
      hint: 'Check Fa/Fr = 0.50 > 0.37, then apply P = X·Fr + Y·Fa.',
      targetValue: 12.0,
      unit: 'kN',
      tolerance: 0.2,
      solutionSteps: [
        'Fa / Fr = 5.0 / 10.0 = 0.50, which exceeds e = 0.37.',
        'P = 0.4 × 10.0 + 1.6 × 5.0 = 4.0 + 8.0 = 12.0 kN.',
      ],
    },
    {
      id: 'bearing-p4',
      prompt:
        'A 22210 spherical roller bearing (C0 = 108 kN, Y1 = 2.8) experiences a static load of Fr = 18.0 kN and Fa = 3.0 kN where P0 = Fr + Y1·Fa. Calculate the static safety factor s0.',
      hint: 'First compute P0 = 18 + 2.8 × 3, then s0 = C0 / P0.',
      targetValue: 4.09,
      unit: 's0',
      tolerance: 0.1,
      solutionSteps: [
        'P0 = 18.0 + 2.8 × 3.0 = 18.0 + 8.4 = 26.4 kN.',
        's0 = C0 / P0 = 108 / 26.4 = 4.09.',
      ],
    },
    {
      id: 'bearing-p5',
      prompt:
        'A 6206 bearing (bore d = 30 mm, tolerance 0 to -10 µm) is mounted on an ISO m5 shaft (+8 to +17 µm). What is the mean interference in µm?',
      hint: 'Find min and max clearance = d_bore - d_shaft, then average their magnitudes.',
      targetValue: 17.5,
      unit: 'µm',
      tolerance: 0.5,
      solutionSteps: [
        'Tightest fit: -10 - (+17) = -27 µm (27 µm interference).',
        'Loosest fit: 0 - (+8) = -8 µm (8 µm interference).',
        'Mean interference = (27 + 8) / 2 = 17.5 µm.',
      ],
    },
  ],
  quiz: [
    {
      id: 'bearing-q1',
      question:
        'If you double the equivalent dynamic load P on a ball bearing (p = 3), how does its L10 fatigue life change?',
      options: [
        'It decreases to 1/2 (50%)',
        'It decreases to 1/4 (25%)',
        'It decreases to 1/8 (12.5%)',
        'It decreases to 1/10 (10%)',
      ],
      correctIndex: 2,
      explanation:
        'Because L10 = (C / P)^3 for ball bearings, doubling P divides L10 by 2^3 = 8 (reducing life to 12.5%).',
    },
    {
      id: 'bearing-q2',
      question:
        'Which bearing type in the simulator has ZERO axial load capacity and must allow free axial float?',
      options: [
        'Deep Groove Ball (6206)',
        'Cylindrical Roller (NU 208)',
        'Tapered Roller (30208)',
        'Spherical Roller (22210)',
      ],
      correctIndex: 1,
      explanation:
        'An NU-design cylindrical roller bearing has no ribs on the inner ring, so it accommodates axial shaft expansion internally and cannot carry thrust loads.',
    },
    {
      id: 'bearing-q3',
      question:
        'For an electric motor with a rotating shaft and stationary housing under radial load, which fit combination is standard practice?',
      options: [
        'g6 shaft + N7 housing',
        'k5 shaft + H7 housing',
        'g6 shaft + H7 housing',
        'm5 shaft + N7 housing',
      ],
      correctIndex: 1,
      explanation:
        'A rotating inner ring requires an interference shaft fit (k5) to prevent creep/fretting, while the stationary outer ring takes a clearance housing fit (H7) for assembly and axial float.',
    },
    {
      id: 'bearing-q4',
      question:
        'What is the primary risk of combining heavy interference fits on both the shaft (m5) and housing (N7) simultaneously?',
      options: [
        'Inner ring fretting corrosion',
        'Loss of internal radial clearance and thermal preload',
        'Increased axial play',
        'Lower static load rating C0',
      ],
      correctIndex: 1,
      explanation:
        'Interference expands the inner ring and compresses the outer ring, consuming internal radial clearance and potentially causing excessive heat and premature spalling.',
    },
    {
      id: 'bearing-q5',
      question:
        'In ISO 281, what does the life exponent p equal for roller bearings compared to ball bearings?',
      options: [
        'p = 2 for rollers, p = 3 for balls',
        'p = 3 for rollers, p = 10/3 for balls',
        'p = 10/3 for rollers, p = 3 for balls',
        'p = 4 for both rollers and balls',
      ],
      correctIndex: 2,
      explanation:
        'Line-contact roller bearings use p = 10/3 (3.33), whereas point-contact ball bearings use p = 3.',
    },
    {
      id: 'bearing-q6',
      question:
        'What does a static safety factor s0 < 1.0 indicate?',
      options: [
        'The bearing is running above its limiting speed',
        'The lubrication film is too thin (low a_ISO)',
        'Risk of permanent plastic indentation (brinelling) on the raceways',
        'The housing fit is too loose',
      ],
      correctIndex: 2,
      explanation:
        's0 = C0 / P0 compares the static load rating to the equivalent static load; values below 1.0 mean permanent raceway deformation can occur.',
    },
  ],
};
