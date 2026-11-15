import type { SimulatorMeta } from '../../types/simulator';
import './pumpI18n';

export const pumpMeta: SimulatorMeta = {
  id: 'pump',
  title: 'Centrifugal Pump & Seal Maintenance Simulator',
  shortTitle: 'Pump & Seal Lab',
  category: 'Fluid Power',
  difficulty: 'Intermediate',
  description:
    'Analyze centrifugal pump H-Q and efficiency curves, apply affinity laws, evaluate NPSHa vs NPSHr cavitation risk, and diagnose dead-head and mechanical seal wear.',
  iconName: 'Wind',
  accentColor: 'cyan',
  explore: [
    {
      title: '1. Pump H-Q Curves, System Resistance & BEP',
      summary:
        'A centrifugal pump’s operating point is the intersection of its H-Q performance curve and the piping system resistance curve. Throttling a discharge valve steepens the system curve, reducing flow and increasing head, while shifting the pump away from its Best Efficiency Point (BEP).',
      equations: [
        {
          label: 'System Resistance Curve',
          formula: 'H_sys(Q) = H_static + (k_pipe + k_valve) · Q²',
          note: 'H_static = H_discharge - H_suction; throttling increases k_valve.',
        },
        {
          label: 'Hydraulic & Shaft Power',
          formula: 'P_h = (ρ · g · Q · H) / 1000 (kW),   P_shaft = P_h / η',
          note: 'Q in m³/s, H in m, ρ in kg/m³, η as a decimal (0–1).',
        },
      ],
      workedExample: {
        title: 'Finding Shaft Power at BEP',
        given: [
          'Flow Q = 90 m³/h (0.025 m³/s)',
          'Total Dynamic Head H = 25 m',
          'Water density ρ = 1000 kg/m³, g = 9.81 m/s²',
          'Pump efficiency η = 80% (0.80)',
        ],
        steps: [
          'Compute hydraulic power: P_h = (1000 × 9.81 × 0.025 × 25) / 1000 = 6.131 kW.',
          'Divide by efficiency: P_shaft = 6.131 / 0.80 = 7.664 kW.',
        ],
        answer: 'P_shaft = 7.66 kW',
      },
    },
    {
      title: '2. Affinity Laws (Variable Speed / VFD Control)',
      summary:
        'Adjusting impeller speed N via a Variable Frequency Drive (VFD) shifts the entire pump curve. Flow scales linearly with speed, head scales with the square of speed, and shaft power scales with the cube of speed—making VFD speed reduction far more energy-efficient than valve throttling.',
      equations: [
        {
          label: 'Flow Affinity Law',
          formula: 'Q₂ / Q₁ = N₂ / N₁',
          note: 'Valid for geometrically similar impellers at homologous operating points.',
        },
        {
          label: 'Head Affinity Law',
          formula: 'H₂ / H₁ = (N₂ / N₁)²',
          note: 'Shutoff head and BEP head both scale with N².',
        },
        {
          label: 'Power Affinity Law',
          formula: 'P₂ / P₁ = (N₂ / N₁)³',
          note: 'A 20% speed reduction cuts shaft power demand by nearly 49%!',
        },
      ],
      workedExample: {
        title: 'Energy Savings from VFD Speed Reduction',
        given: [
          'Rated speed N₁ = 1750 RPM, Q₁ = 90 m³/h, H₁ = 24.6 m, P₁ = 7.5 kW',
          'Reduced speed N₂ = 1400 RPM (80% speed)',
        ],
        steps: [
          'Speed ratio: N₂ / N₁ = 1400 / 1750 = 0.80.',
          'New flow: Q₂ = 90 × 0.80 = 72.0 m³/h.',
          'New head: H₂ = 24.6 × 0.80² = 15.74 m.',
          'New power: P₂ = 7.5 × 0.80³ = 7.5 × 0.512 = 3.84 kW.',
        ],
        answer: 'Q₂ = 72 m³/h, H₂ = 15.74 m, P₂ = 3.84 kW (48.8% power reduction)',
      },
    },
    {
      title: '3. NPSHa vs NPSHr & Cavitation Prevention',
      summary:
        'Cavitation occurs when local static pressure at the impeller eye drops below the liquid’s vapor pressure, forming vapor bubbles that violently collapse in higher-pressure zones. This erodes impeller vanes, causes severe vibration, and destroys mechanical seals. Always maintain NPSHa > NPSHr with a safety margin (typically ≥ 0.5–1.0 m).',
      equations: [
        {
          label: 'Net Positive Suction Head Available (NPSHa)',
          formula: 'NPSHa = (P_atm - P_v) / (ρ · g) + H_s - h_f,suction',
          note: 'H_s is positive for flooded suction and negative for suction lift.',
        },
        {
          label: 'Cavitation Criterion',
          formula: 'NPSHa > NPSHr + Margin',
          note: 'Raising fluid temperature increases P_v, which directly reduces NPSHa.',
        },
      ],
      workedExample: {
        title: 'Checking Cavitation Margin for Warm Water',
        given: [
          'Atmospheric pressure P_atm = 101.3 kPa',
          'Water at 50 °C: P_v = 12.3 kPa, ρ = 988 kg/m³',
          'Suction lift H_s = -2.5 m, suction friction h_f,suction = 1.2 m',
          'Pump NPSHr = 4.2 m',
        ],
        steps: [
          'Pressure head term: (101,300 - 12,300) / (988 × 9.81) = 89,000 / 9,692.3 = 9.18 m.',
          'Subtract lift and friction: NPSHa = 9.18 - 2.5 - 1.2 = 5.48 m.',
          'Compare with NPSHr: Margin = 5.48 - 4.2 = +1.28 m (safe).',
        ],
        answer: 'NPSHa = 5.48 m (Margin +1.28 m, no cavitation)',
      },
    },
    {
      title: '4. Dead-Head, Low-Flow Recirculation & Seal Wear',
      summary:
        'Running a centrifugal pump against a closed discharge valve (dead-head) or below ~45% of BEP flow traps energy inside the casing. Nearly all shaft power converts to heat, boiling the fluid film between mechanical seal faces and causing thermal cracking, dry running, and shaft deflection.',
      equations: [
        {
          label: 'Minimum Continuous Stable Flow',
          formula: 'Q_min ≈ 0.40 to 0.50 × Q_BEP',
          note: 'Install a minimum-flow bypass line if process demand can drop below Q_min.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'pump-p1',
      prompt:
        'A centrifugal pump delivers Q₁ = 90 m³/h at N₁ = 1750 RPM. If the VFD increases speed to N₂ = 2100 RPM, what is the new flow rate Q₂ in m³/h?',
      hint: 'Use the first affinity law: Q₂ = Q₁ × (N₂ / N₁).',
      targetValue: 108,
      unit: 'm³/h',
      tolerance: 1.5,
      solutionSteps: [
        'Speed ratio = 2100 / 1750 = 1.20.',
        'Q₂ = 90 × 1.20 = 108 m³/h.',
      ],
    },
    {
      id: 'pump-p2',
      prompt:
        'At 1750 RPM, a pump produces H₁ = 24.6 m of head at BEP. If speed is reduced to 1400 RPM, calculate the new head H₂ in meters.',
      hint: 'Head scales with the square of speed: H₂ = H₁ × (N₂ / N₁)².',
      targetValue: 15.74,
      unit: 'm',
      tolerance: 0.3,
      solutionSteps: [
        'Speed ratio = 1400 / 1750 = 0.80.',
        'H₂ = 24.6 × (0.80)² = 24.6 × 0.64 = 15.74 m.',
      ],
    },
    {
      id: 'pump-p3',
      prompt:
        'A pump draws P₁ = 7.5 kW of shaft power at 1750 RPM. What is the shaft power P₂ (in kW) when slowed to 1400 RPM?',
      hint: 'Power scales with the cube of speed: P₂ = P₁ × (N₂ / N₁)³.',
      targetValue: 3.84,
      unit: 'kW',
      tolerance: 0.1,
      solutionSteps: [
        'Speed ratio = 1400 / 1750 = 0.80.',
        'P₂ = 7.5 × (0.80)³ = 7.5 × 0.512 = 3.84 kW.',
      ],
    },
    {
      id: 'pump-p4',
      prompt:
        'Calculate NPSHa (in m) for water at 50 °C (P_v = 12.3 kPa, ρ = 988 kg/m³) with P_atm = 101.3 kPa, suction lift H_s = -2.5 m, and suction friction loss h_f = 1.2 m (use g = 9.81 m/s²).',
      hint: 'NPSHa = (P_atm - P_v)/(ρg) + H_s - h_f. Remember P in Pascals (1 kPa = 1000 Pa).',
      targetValue: 5.48,
      unit: 'm',
      tolerance: 0.15,
      solutionSteps: [
        '(101,300 - 12,300) / (988 × 9.81) = 89,000 / 9,692.28 = 9.183 m.',
        'NPSHa = 9.183 - 2.5 - 1.2 = 5.48 m.',
      ],
    },
    {
      id: 'pump-p5',
      prompt:
        'A pump delivers Q = 90 m³/h (0.025 m³/s) of water (ρ = 1000 kg/m³) at H = 25 m with η = 80% efficiency. Find the required shaft power in kW (g = 9.81 m/s²).',
      hint: 'First find hydraulic power P_h = ρgQH / 1000, then divide by η = 0.80.',
      targetValue: 7.66,
      unit: 'kW',
      tolerance: 0.15,
      solutionSteps: [
        'P_h = (1000 × 9.81 × 0.025 × 25) / 1000 = 6.131 kW.',
        'P_shaft = 6.131 / 0.80 = 7.66 kW.',
      ],
    },
  ],
  quiz: [
    {
      id: 'pump-q1',
      question:
        'What happens to a centrifugal pump’s operating point when the discharge valve is partially closed?',
      options: [
        'Flow decreases and head increases along the pump H-Q curve',
        'Flow increases and head decreases',
        'Both flow and head increase simultaneously',
        'The pump curve shifts downward while the system curve stays fixed',
      ],
      correctIndex: 0,
      explanation:
        'Closing the discharge valve increases system resistance, steepening the system curve so it intersects the pump H-Q curve at a lower flow rate and higher head.',
    },
    {
      id: 'pump-q2',
      question:
        'According to the affinity laws, if you double the impeller speed (N₂ = 2·N₁), by what factor does shaft power increase?',
      options: ['2×', '4×', '8×', '16×'],
      correctIndex: 2,
      explanation:
        'Shaft power scales with the cube of rotational speed: P₂/P₁ = (N₂/N₁)³ = 2³ = 8×.',
    },
    {
      id: 'pump-q3',
      question:
        'Which action will IMMEDIATELY increase NPSHa to help eliminate pump cavitation?',
      options: [
        'Increase impeller speed N',
        'Raise the fluid temperature',
        'Raise the suction tank liquid level (or lower the pump)',
        'Use a smaller-diameter suction pipe',
      ],
      correctIndex: 2,
      explanation:
        'Raising the suction tank level increases static suction head H_s, directly increasing NPSHa. Raising temperature increases P_v (lowering NPSHa), and smaller piping increases suction friction loss.',
    },
    {
      id: 'pump-q4',
      question:
        'Why is operating a centrifugal pump at dead-head (0% discharge valve opening) dangerous for the mechanical seal?',
      options: [
        'Shaft power drops to zero, causing the seal to freeze',
        'Churning heats the trapped fluid, flashing the lubricating film between seal faces',
        'Discharge pressure drops below atmospheric pressure',
        'The impeller reverses rotation direction',
      ],
      correctIndex: 1,
      explanation:
        'At dead-head, ~35% of BEP shaft power is still dissipated as heat into a stagnant volume of fluid, rapidly boiling the liquid film at the mechanical seal faces and causing dry-run failure.',
    },
    {
      id: 'pump-q5',
      question:
        'Where should a centrifugal pump ideally operate for maximum reliability, lowest vibration, and longest seal/bearing life?',
      options: [
        'At shutoff head (Q = 0)',
        'Near the Best Efficiency Point (BEP)',
        'At maximum runout flow (H = 0)',
        'Slightly below NPSHr',
      ],
      correctIndex: 1,
      explanation:
        'At BEP, hydraulic radial forces on the impeller are balanced, internal recirculation is minimized, and efficiency is highest.',
    },
    {
      id: 'pump-q6',
      question:
        'Why does hot water (e.g., 85 °C) cavitate much more easily than cold water (20 °C) at the same suction tank level?',
      options: [
        'Hot water has a much higher vapor pressure P_v, reducing NPSHa',
        'Hot water has a higher density, increasing static head',
        'Hot water increases the pump’s BEP efficiency',
        'Hot water eliminates suction pipe friction',
      ],
      correctIndex: 0,
      explanation:
        'Water vapor pressure rises exponentially with temperature (from 2.3 kPa at 20 °C to ~57.8 kPa at 85 °C), sharply subtracting from (P_atm - P_v)/(ρg) in the NPSHa equation.',
    },
  ],
};
