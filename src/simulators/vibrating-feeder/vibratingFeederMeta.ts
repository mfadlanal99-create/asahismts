import type { SimulatorMeta } from '../../types/simulator';
import './vibratingFeederI18n';

export const vibratingFeederMeta: SimulatorMeta = {
  id: 'vibrating-feeder',
  title: 'Vibrating Feeder & Hopper Flow',
  shortTitle: 'Vibrating Feeder',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Analyze throw index (Kᵥ), micro-throwing conveying velocity, gate-controlled mass flow rate (t/h), motor power (kW) & current (A), liner wear index, and super-resonant coil spring isolation (N/mm) while diagnosing broken springs, hopper bridging, and eccentric phase slip.',
  iconName: 'Activity',
  accentColor: 'amber',
  explore: [
    {
      title: 'Throw Index (Kᵥ) & Micro-Throwing Kinematics',
      summary:
        'A vibrating feeder moves bulk material forward by oscillating an inclined trough at frequency f and peak-to-peak stroke 2A along a throw angle β. When the normal acceleration component exceeds the normal component of gravity (Kᵥ > 1.0), particles lift off the liner in microscopic parabolic hops ("micro-throwing") and advance down the trough.',
      equations: [
        {
          label: 'Angular Frequency & Peak Acceleration',
          formula: 'ω = 2πf,   a_max = A · ω²   [m/s²]',
          note: 'A = single amplitude = (peak-to-peak stroke) / 2 in meters',
        },
        {
          label: 'Throw Index (G-Factor Ratio)',
          formula: 'Kᵥ = (A · ω² · sin β) / (g · cos α)',
          note: 'β = throw angle relative to trough; α = downward trough inclination; Kᵥ > 1.0 required for micro-throwing (typical: 1.8 – 3.2)',
        },
        {
          label: 'Mean Conveying Velocity',
          formula: 'v_c ≈ A · ω · cos β · η_throw · (1 + 0.035 α)',
          note: 'η_throw increases with Kᵥ above 1.0; below Kᵥ = 1.0 material only slides slowly',
        },
      ],
      workedExample: {
        title: 'Calculating Throw Index Kᵥ for a Dual-Eccentric Feeder',
        given: [
          'Drive frequency f = 24 Hz (ω = 150.8 rad/s)',
          'Peak-to-peak stroke 2A = 6.0 mm (single amplitude A = 3.0 mm = 0.003 m)',
          'Throw angle β = 22°, downward trough inclination α = 5°',
        ],
        steps: [
          'Compute peak acceleration: a_max = 0.003 × (150.8)² = 68.22 m/s² (6.96 g)',
          'Compute normal throw component: a_max · sin(22°) = 68.22 × 0.3746 = 25.56 m/s²',
          'Divide by g · cos(5°) = 9.807 × 0.9962 = 9.77 m/s² → Kᵥ = 25.56 / 9.77 = 2.62',
        ],
        answer:
          'Kᵥ = 2.62 (Optimal micro-throwing regime; smooth conveying with moderate liner wear)',
      },
    },
    {
      title: 'Gate-Controlled Volumetric & Mass Flow Rate',
      summary:
        'Under steady hopper head, the trough width W and adjustable vertical gate opening H define the cross-sectional area of the flowing material bed. Multiplying this area by conveying velocity v_c, bed fill factor η_fill (≈ 0.85 due to shear lag), and bulk density ρ yields the mass flow rate in metric tonnes per hour (t/h).',
      equations: [
        {
          label: 'Volumetric Flow Rate',
          formula: 'Q_vol = 3600 · W · H · v_c · η_fill   [m³/h]',
          note: 'W = trough width (m), H = gate opening (m), v_c = conveying velocity (m/s)',
        },
        {
          label: 'Mass Flow Rate',
          formula: 'ṁ = Q_vol · ρ   [t/h]',
          note: 'ρ = bulk density (t/m³), e.g., limestone ≈ 1.60, coal ≈ 0.85, iron ore ≈ 2.45 t/m³ (1 t/m³ = 1000 kg/m³)',
        },
      ],
      workedExample: {
        title: 'Sizing Feeder Throughput for Crushed Limestone',
        given: [
          'Trough width W = 600 mm (0.60 m), gate opening H = 120 mm (0.12 m)',
          'Conveying velocity v_c = 0.38 m/s (22.8 m/min), bed fill factor η_fill = 0.85',
          'Limestone bulk density ρ = 1600 kg/m³',
        ],
        steps: [
          'Cross-sectional flow area: A_flow = 0.60 × 0.12 × 0.85 = 0.0612 m²',
          'Volumetric flow: Q_vol = 3600 × 0.0612 × 0.38 = 83.72 m³/h',
          'Mass flow rate: ṁ = (83.72 × 1600) / 1000 = 134.0 t/h',
        ],
        answer: 'Mass flow rate ṁ = 134.0 t/h',
      },
    },
    {
      title: 'Coil Spring Isolation, Resonance Ratio & Fault Modes',
      summary:
        'Vibrating feeders are mounted on helical coil springs to isolate dynamic forces from the supporting structure. Industrial feeders operate super-resonantly (f / fₙ > 2.0) so transmissibility remains low. A broken coil spring lowers stiffness and tilts the trough; hopper bridging chokes the throat; and eccentric phase slip destroys linear throw.',
      equations: [
        {
          label: 'Natural Frequency & Resonance Ratio',
          formula: 'fₙ = (1 / 2π) · √(k_eff / M_total),   r = f / fₙ',
          note: 'Avoid resonance danger zone (0.75 ≤ r ≤ 1.35); target r > 2.0 for > 75% isolation',
        },
        {
          label: 'Force Transmissibility',
          formula: 'T_R = √(1 + (2ζr)²) / √((1 − r²)² + (2ζr)²)',
          note: 'Isolation efficiency η_iso = (1 − T_R) × 100%; steel coil damping ζ ≈ 0.06',
        },
      ],
      workedExample: {
        title: 'Evaluating Spring Isolation Efficiency',
        given: [
          'Drive frequency f = 24 Hz, feeder natural frequency fₙ = 6.0 Hz',
          'Coil spring damping ratio ζ = 0.06',
        ],
        steps: [
          'Frequency ratio: r = 24 / 6.0 = 4.0',
          'Denominator √((1 − 16)² + (2 × 0.06 × 4)²) = √(225 + 0.23) = 15.01',
          'Numerator √(1 + 0.23) = 1.11 → T_R = 1.11 / 15.01 = 0.074',
          'Isolation efficiency: η_iso = (1 − 0.074) × 100% = 92.6%',
        ],
        answer: 'T_R = 0.074 (92.6% of dynamic force isolated from the foundation)',
      },
    },
  ],
  practice: [
    {
      id: 'vf-prac-1',
      prompt:
        'A vibrating feeder operates at f = 25 Hz with a peak-to-peak stroke of 8.0 mm (single amplitude A = 4.0 mm). Calculate the peak acceleration a_max in m/s².',
      hint: 'Use a_max = A · (2πf)², with A = 0.004 m.',
      targetValue: 98.7,
      unit: 'm/s²',
      tolerance: 1.0,
      solutionSteps: [
        'Angular frequency: ω = 2π × 25 = 157.08 rad/s',
        'Single amplitude: A = 4.0 mm = 0.004 m',
        'Peak acceleration: a_max = 0.004 × (157.08)² = 98.70 m/s²',
      ],
    },
    {
      id: 'vf-prac-2',
      prompt:
        'A feeder has peak acceleration a_max = 68.2 m/s², throw angle β = 22°, and trough downward inclination α = 5°. Compute the throw index Kᵥ (using g = 9.81 m/s²).',
      hint: 'Use Kᵥ = (a_max · sin β) / (g · cos α).',
      targetValue: 2.61,
      unit: '',
      tolerance: 0.06,
      solutionSteps: [
        'Normal acceleration: 68.2 × sin(22°) = 68.2 × 0.3746 = 25.55 m/s²',
        'Normal gravity: 9.81 × cos(5°) = 9.81 × 0.9962 = 9.77 m/s²',
        'Throw index: Kᵥ = 25.55 / 9.77 = 2.615 ≈ 2.61',
      ],
    },
    {
      id: 'vf-prac-3',
      prompt:
        'A feeder trough (W = 0.80 m, gate opening H = 0.15 m) conveys crushed ore (ρ = 2000 kg/m³) at v_c = 0.30 m/s with bed fill factor η_fill = 0.85. Calculate the mass flow rate ṁ in t/h.',
      hint: 'ṁ = (3600 × W × H × v_c × η_fill × ρ) / 1000.',
      targetValue: 220.3,
      unit: 't/h',
      tolerance: 2.5,
      solutionSteps: [
        'Volumetric flow: Q_vol = 3600 × 0.80 × 0.15 × 0.30 × 0.85 = 110.16 m³/h',
        'Mass flow rate: ṁ = (110.16 × 2000) / 1000 = 220.32 t/h',
      ],
    },
    {
      id: 'vf-prac-4',
      prompt:
        'An isolated vibrating feeder has an oscillating mass of 600 kg supported on coil springs with total stiffness k = 850,000 N/m. Calculate its natural frequency fₙ in Hz.',
      hint: 'Use fₙ = (1 / 2π) · √(k / M).',
      targetValue: 5.99,
      unit: 'Hz',
      tolerance: 0.15,
      solutionSteps: [
        'ωₙ = √(850,000 / 600) = √1416.67 = 37.64 rad/s',
        'fₙ = 37.64 / (2π) = 5.99 Hz',
      ],
    },
    {
      id: 'vf-prac-5',
      prompt:
        'If a feeder runs at f = 24 Hz and its coil spring isolation system has a natural frequency fₙ = 6.0 Hz, what is the frequency ratio r = f / fₙ?',
      hint: 'Divide drive frequency by natural frequency.',
      targetValue: 4.0,
      unit: '',
      tolerance: 0.05,
      solutionSteps: ['Frequency ratio r = f / fₙ = 24 / 6.0 = 4.0'],
    },
  ],
  quiz: [
    {
      id: 'vf-quiz-1',
      question:
        'What minimum value of the throw index Kᵥ is required for bulk material to lift off the trough deck and enter the micro-throwing regime?',
      options: ['Kᵥ > 0.25', 'Kᵥ > 0.50', 'Kᵥ > 1.00', 'Kᵥ > 5.00'],
      correctIndex: 2,
      explanation:
        'When Kᵥ > 1.00, the upward normal acceleration of the trough exceeds the normal component of gravity, allowing particles to hop forward in micro-throws.',
    },
    {
      id: 'vf-quiz-2',
      question:
        'Why are most industrial vibrating feeders designed to operate in the super-resonant zone (f / fₙ > 2.0)?',
      options: [
        'To maximize dynamic force transmitted to the building foundation',
        'To achieve high vibration isolation efficiency (> 75%) and keep foundation loads low',
        'To prevent particles from bouncing off the trough',
        'To eliminate the need for coil springs',
      ],
      correctIndex: 1,
      explanation:
        'Operating well above natural frequency (r = f / fₙ > 2.0) keeps transmissibility T_R low, isolating most of the dynamic shaking force from the supporting structure.',
    },
    {
      id: 'vf-quiz-3',
      question:
        'Which fault is indicated when material stops flowing out of the hopper even though the trough is vibrating at normal amplitude and frequency?',
      options: [
        'Broken coil spring',
        'Hopper bridging (arching)',
        'Excessive throw index',
        'High isolation efficiency',
      ],
      correctIndex: 1,
      explanation:
        'Cohesive or damp material can form a self-supporting arch above the hopper throat ("bridging"), starving the vibrating trough while the drive continues running normally.',
    },
    {
      id: 'vf-quiz-4',
      question:
        'In a dual-eccentric vibrating feeder, what happens if one shaft slips out of phase relative to the other?',
      options: [
        'The directed linear stroke drops and unwanted rocking vibration is introduced',
        'Mass flow rate doubles immediately',
        'Natural frequency increases by 50%',
        'Gate opening increases automatically',
      ],
      correctIndex: 0,
      explanation:
        'Counter-rotating eccentric shafts cancel lateral forces and add along the throw line only when synchronized. Phase slip reduces effective throw stroke and induces rocking.',
    },
    {
      id: 'vf-quiz-5',
      question:
        'How does increasing the throw index Kᵥ well above 3.5 typically affect a vibrating feeder?',
      options: [
        'It eliminates all liner wear',
        'It causes aggressive bouncing, increased noise, and accelerated trough liner wear',
        'It freezes the material bed in place',
        'It lowers peak acceleration below 1 g',
      ],
      correctIndex: 1,
      explanation:
        'Excessive Kᵥ (> 3.3–3.5) produces high-impact particle bouncing, noisy operation, degradation of friable material, and rapid wear of the trough liner.',
    },
    {
      id: 'vf-quiz-6',
      question:
        'If a coil spring bank fractures during operation, what immediate mechanical symptoms occur?',
      options: [
        'Spring stiffness drops, static deflection increases, and the trough tilts asymmetrically',
        'Drive frequency doubles automatically',
        'Bulk density of the material increases',
        'Throw angle becomes 90°',
      ],
      correctIndex: 0,
      explanation:
        'A broken coil spring reduces total support stiffness, causing greater static sag on the failed side, trough tilt, uneven material bed depth, and high frame stress.',
    },
  ],
};
