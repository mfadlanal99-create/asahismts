import type { SimulatorMeta } from '../../types/simulator';
import './bucketElevatorI18n';

export const bucketElevatorMeta: SimulatorMeta = {
  id: 'bucket-elevator',
  title: 'Bucket Elevator & Centrifugal Discharge Lab',
  shortTitle: 'Bucket Elevator',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Analyze vertical bucket elevator kinematics, Froude number and pole-distance discharge criteria, mass throughput (t/h), drive power, and fault diagnostics including belt slip and boot choke.',
  iconName: 'Layers',
  accentColor: 'sky',
  explore: [
    {
      title: 'Centrifugal vs. Gravity Discharge (Froude & Pole Distance)',
      summary:
        'As a bucket rounds the head pulley, bulk material experiences both downward gravity (g) and outward centrifugal acceleration (ω²R_eff). For clean centrifugal discharge into the chute, the Froude number Fr = ω²R_eff / g must be at least 1.0, meaning the pole distance h_p = g / ω² lies inside the effective bucket centroid radius R_eff. If RPM drops too low (e.g., during belt slip), Fr < 1.0 and material dumps prematurely down the casing (back-spill).',
      equations: [
        {
          label: 'Belt / Chain Linear Speed',
          formula: 'v = (π × D × N) / 60  [m/s]',
          note: 'D = head pulley diameter (m), N = head pulley rotational speed (RPM)',
        },
        {
          label: 'Pole Distance Criterion',
          formula: 'h_p = g / ω² = 894.5 / N²  [m]',
          note: 'Centrifugal discharge requires h_p < R_eff (pole lies inside bucket centroid path)',
        },
        {
          label: 'Head Pulley Froude Number',
          formula: 'Fr = (ω² × R_eff) / g = R_eff / h_p',
          note: 'Fr ≥ 1.0: Centrifugal; 0.72 ≤ Fr < 1.0: Transitional; Fr < 0.72: Gravity back-spill',
        },
      ],
      workedExample: {
        title: 'Checking Centrifugal Discharge on a 450 mm Head Pulley',
        given: [
          'Head pulley diameter D = 450 mm (R = 0.225 m), bucket centroid offset = 0.070 m → R_eff = 0.295 m',
          'Operating speed N = 60 RPM (ω = 2π × 60 / 60 = 6.283 rad/s)',
        ],
        steps: [
          'Compute pole distance: h_p = 9.807 / (6.283)² = 0.248 m',
          'Compute Froude number: Fr = R_eff / h_p = 0.295 / 0.248 = 1.19',
          'Since Fr = 1.19 > 1.0, centrifugal force exceeds gravity at top dead center.',
        ],
        answer: 'Fr = 1.19 (Clean centrifugal discharge into the head chute)',
      },
    },
    {
      title: 'Volumetric & Mass Capacity and Lift Drive Power',
      summary:
        'Bucket elevator throughput depends on bucket volume V, bucket spacing S, fill factor η_fill (typically 65%–85% depending on material flowability), belt speed v, and bulk density ρ. Shaft power must overcome both the vertical potential energy lift and boot digging/scooping friction.',
      equations: [
        {
          label: 'Volumetric Capacity',
          formula: 'Q_v = 3600 × (V_L / S_mm) × η_fill × v  [m³/h]',
          note: 'V_L = struck bucket volume (L), S_mm = bucket spacing (mm)',
        },
        {
          label: 'Mass Capacity',
          formula: 'Q_m = (Q_v × ρ) / 1000  [t/h]',
          note: 'ρ = bulk material density (kg/m³)',
        },
        {
          label: 'Net Lift Power & Motor Power',
          formula: 'P_lift = (Q_m × g × H) / 3600  [kW]',
          note: 'Multiply P_lift by digging factor (~1.18) + idle loss, then divide by drive efficiency η_drive',
        },
      ],
      workedExample: {
        title: 'Throughput & Lift Power for a 15 m Grain Elevator',
        given: [
          'Bucket volume V = 4.5 L, spacing S = 300 mm, fill factor η_fill = 0.80',
          'Belt speed v = 2.0 m/s, wheat bulk density ρ = 750 kg/m³, lift height H = 15 m',
        ],
        steps: [
          'Volumetric flow: Q_v = 3600 × (4.5 / 300) × 0.80 × 2.0 = 86.4 m³/h',
          'Mass flow: Q_m = (86.4 × 750) / 1000 = 64.8 t/h',
          'Net lift power: P_lift = (64.8 × 9.81 × 15) / 3600 = 2.65 kW',
        ],
        answer: 'Q_m = 64.8 t/h; Net lift power = 2.65 kW (≈ 3.9 kW motor input with boot digging & losses)',
      },
    },
  ],
  practice: [
    {
      id: 'be-prac-1',
      prompt:
        'A bucket elevator has a 500 mm diameter head pulley rotating at 60 RPM. Calculate the linear belt speed v in m/s.',
      hint: 'Use v = (π × D × N) / 60 with D = 0.50 m.',
      targetValue: 1.57,
      unit: 'm/s',
      tolerance: 0.03,
      solutionSteps: [
        'Convert pulley diameter to meters: D = 500 / 1000 = 0.50 m',
        'Calculate belt speed: v = (π × 0.50 × 60) / 60 = 1.571 m/s',
      ],
    },
    {
      id: 'be-prac-2',
      prompt:
        'At a head pulley speed of 50 RPM, what is the pole distance h_p (in m)? Use g = 9.81 m/s².',
      hint: 'Compute ω = 2πN / 60, then h_p = g / ω².',
      targetValue: 0.36,
      unit: 'm',
      tolerance: 0.02,
      solutionSteps: [
        'Angular velocity: ω = (2π × 50) / 60 = 5.236 rad/s',
        'Pole distance: h_p = 9.81 / (5.236)² = 9.81 / 27.416 = 0.358 m ≈ 0.36 m',
      ],
    },
    {
      id: 'be-prac-3',
      prompt:
        'An elevator carries 4.5 L buckets spaced at 300 mm with an 80% fill factor at v = 2.0 m/s. If bulk density is 750 kg/m³, calculate the mass capacity Q_m in t/h.',
      hint: 'First find Q_v = 3600 × (4.5 / 300) × 0.80 × 2.0, then multiply by 750 / 1000.',
      targetValue: 64.8,
      unit: 't/h',
      tolerance: 0.5,
      solutionSteps: [
        'Volumetric capacity: Q_v = 3600 × (4.5 / 300) × 0.80 × 2.0 = 86.4 m³/h',
        'Mass capacity: Q_m = (86.4 × 750) / 1000 = 64.8 t/h',
      ],
    },
    {
      id: 'be-prac-4',
      prompt:
        'Calculate the pure vertical lift power P_lift (in kW) required to elevate 90 t/h of material to a height H = 20 m (use g = 9.81 m/s²).',
      hint: 'Use P_lift = (Q_m × g × H) / 3600.',
      targetValue: 4.91,
      unit: 'kW',
      tolerance: 0.1,
      solutionSteps: [
        'P_lift = (90 × 9.81 × 20) / 3600',
        'P_lift = 17,658 / 3600 = 4.905 kW ≈ 4.91 kW',
      ],
    },
  ],
  quiz: [
    {
      id: 'be-quiz-1',
      question:
        'What condition must the Froude number Fr satisfy at the head pulley for clean centrifugal discharge?',
      options: [
        'Fr < 0.5',
        'Fr ≥ 1.0 (pole distance h_p < effective radius R_eff)',
        'Fr = 0.0',
        'Fr must equal the lift height in meters',
      ],
      correctIndex: 1,
      explanation:
        'Centrifugal discharge occurs when outward centrifugal acceleration ω²R_eff exceeds gravity g, i.e., Fr ≥ 1.0 (or equivalently h_p < R_eff).',
    },
    {
      id: 'be-quiz-2',
      question:
        'What happens inside a centrifugal bucket elevator when severe belt slip reduces head pulley RPM by 35–40%?',
      options: [
        'Mass capacity increases automatically',
        'Froude number drops below 1.0, causing premature gravity drop and back-spill down the casing',
        'The discharge throw distance doubles',
        'Boot digging resistance drops to zero',
      ],
      correctIndex: 1,
      explanation:
        'Because Fr is proportional to RPM², a 38% drop in RPM cuts Fr by over 60%, causing material to fall out of buckets before reaching the chute throat (back-spill).',
    },
    {
      id: 'be-quiz-3',
      question:
        'Which fault is indicated by a sudden motor power and head-shaft torque surge while head pulley RPM remains normal?',
      options: [
        'Boot choke / material overload in the lower housing',
        'Missing bucket',
        'Excessive head pulley diameter',
        'Low bulk density',
      ],
      correctIndex: 0,
      explanation:
        'A boot choke packs material around the tail pulley, forcing buckets to plow through dense material and spiking digging resistance and motor current.',
    },
    {
      id: 'be-quiz-4',
      question:
        'What is the primary purpose of the screw take-up assembly at the boot (tail) pulley?',
      options: [
        'To increase bucket volume',
        'To maintain proper belt/chain tension and prevent head pulley slip',
        'To cool the bulk material',
        'To measure bulk density',
      ],
      correctIndex: 1,
      explanation:
        'The boot take-up tensions the belt or chain to maintain traction on the head drive pulley and compensate for belt stretch or chain elongation.',
    },
  ],
};
