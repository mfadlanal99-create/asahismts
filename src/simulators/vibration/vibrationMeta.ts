import type { SimulatorMeta } from '../../types/simulator';
import './vibrationI18n';

export const vibrationMeta: SimulatorMeta = {
  id: 'vibration',
  title: 'Rotor Balancing & Vibration Analysis (ISO 10816 / 20816)',
  shortTitle: 'Rotor Vibration & Balancing',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Simulate single-plane rotordynamics, Jeffcott rotor critical speeds, synchronous 1X vibration amplitudes, and polar vector balancing. Evaluate machine health according to ISO 10816-3 and ISO 20816-3 vibration severity standards, inspect live shaft orbits, and analyze FFT frequency spectra and Bode sweeps.',
  iconName: 'Activity',
  accentColor: 'cyan',
  explore: [
    {
      title: 'Jeffcott Rotor Dynamics & Critical Speed Resonance',
      summary:
        'A rotating machine experiences dynamic centrifugal excitation due to residual mass unbalance. The classic Jeffcott rotor model represents an elastic shaft of stiffness k supporting a central rotor of mass M with center-of-mass eccentricity e_u. As rotational speed approaches the natural frequency (critical speed ω_n = √(k/M)), vibration displacement is amplified by the dynamic magnification factor M(r). At resonance (frequency ratio r = 1), the phase lag between the unbalance heavy spot and peak displacement is exactly 90°, transitioning to 180° (self-centering about the center of mass) at supercritical speeds.',
      equations: [
        {
          label: 'Undamped Critical Speed (Natural Frequency)',
          formula: 'ω_n = √(k / M),   N_c = (60 / 2π) * √(k / M)',
          note: 'k = lateral shaft stiffness (N/m), M = effective rotor mass (kg), N_c = critical speed in RPM.',
        },
        {
          label: 'Mass Eccentricity (Specific Unbalance)',
          formula: 'e_u = U / M = (m_u * r_u) / M',
          note: 'U = unbalance in g·mm, M = rotor mass in kg; e_u represents center of gravity offset in μm.',
        },
        {
          label: 'Dynamic Magnification Factor (Unbalance Excitation)',
          formula: 'M(r) = r² / √((1 - r²)² + (2 * ζ * r)²)',
          note: 'r = ω / ω_n is frequency ratio, ζ = c / (2√(k·M)) is viscous damping ratio.',
        },
        {
          label: 'Phase Lag Angle (Heavy Spot to Vibration Peak)',
          formula: 'φ = atan2(2 * ζ * r, 1 - r²)',
          note: 'φ ≈ 0° far below resonance, φ = 90° at resonance (r = 1), φ → 180° well above resonance.',
        },
      ],
      workedExample: {
        title: 'Calculating Critical Speed and Resonant Magnification Factor',
        given: [
          'Effective rotor assembly mass M = 4.0 kg',
          'Equivalent shaft bending stiffness k = 197,392 N/m',
          'Viscous damping ratio ζ = 0.08',
          'Operating speed N = 2,100 RPM',
        ],
        steps: [
          'Compute circular natural frequency: ω_n = √(k / M) = √(197,392 / 4.0) = √49,348 = 222.14 rad/s.',
          'Convert to critical speed: N_c = (60 / 2π) * 222.14 = 2,121 RPM ≈ 2,100 RPM.',
          'Operating speed N = 2,100 RPM yields frequency ratio r = 2,100 / 2,121 = 0.990 ≈ 1.0 (near resonance).',
          'Compute dynamic magnification at r = 1: M(1) = 1 / (2 * ζ) = 1 / (2 * 0.08) = 6.25.',
          'At resonance, 1X synchronous displacement is amplified 6.25 times higher than the physical mass eccentricity.',
        ],
        answer: 'N_c = 2,121 RPM, Dynamic Magnification M = 6.25 (Resonant Amplification)',
      },
    },
    {
      title: 'Static & Dynamic Unbalance and Single-Plane Polar Vector Balancing',
      summary:
        'Rotor unbalance occurs when the principal inertia axis deviates from the geometric rotational axis. For thin disk rotors (L/D < 0.5), single-plane static unbalance dominates. In single-plane polar vector balancing, the initial unbalance vector U₀ is measured at angle θ₀. A known trial mass W_t is bolted at radius R to determine the system influence coefficient vector α. The required counter-balancing mass W_c and mounting angle θ_c are computed to generate an equal and opposing centrifugal force, bringing residual vibration down to ISO 21940 balance quality grades (e.g. G2.5 or G1.0).',
      equations: [
        {
          label: 'Centrifugal Unbalance Force',
          formula: 'F_c = m_u * r_u * ω² = U * ω²',
          note: 'F_c in Newtons; unbalance force scales quadratically with rotational angular velocity ω (rad/s).',
        },
        {
          label: 'Ideal Counter-Weight Cancellation (Single Plane)',
          formula: 'W_c = U₀ / R_hole,   θ_c = (θ₀ + 180°) mod 360°',
          note: 'W_c = correction weight (g), R_hole = bolt radius (mm), θ_c = diametrically opposite angular position.',
        },
        {
          label: 'Trial Mass Influence Coefficient Vector',
          formula: 'α = (V_{0+t} - V₀) / W_t',
          note: 'V₀ = initial 1X vibration vector, V_{0+t} = vibration with trial mass W_t; α in (mm/s)/g.',
        },
        {
          label: 'ISO 21940-11 Permissible Residual Unbalance',
          formula: 'U_per = 1000 * (G * M) / ω',
          note: 'G = balance quality grade (mm/s), M = rotor mass (kg), ω = service angular velocity (rad/s).',
        },
      ],
      workedExample: {
        title: 'Determining Balance Correction Mass and Angle',
        given: [
          'Measured initial unbalance U₀ = 180 g·mm at angular position θ₀ = 45°',
          'Balancing disk bolt pitch radius R_hole = 60 mm',
          'Available bolt hole positions spaced every 30° on the disk face',
        ],
        steps: [
          'Calculate required correction mass: W_c = U₀ / R_hole = 180 g·mm / 60 mm = 3.00 g.',
          'Calculate diametrically opposite angle: θ_c = (45° + 180°) = 225°.',
          'If 225° falls between standard 30° holes (210° and 240°), vector split mass across the two adjacent holes: W_c1 = W_c * sin(240° - 225°) / sin(30°) = 3.0 * sin(15°) / 0.5 = 1.55 g at 210°, and W_c2 = 1.55 g at 240°.',
          'Directly bolting 3.00 g at 225° fully cancels the initial unbalance vector (net U = 0 g·mm).',
        ],
        answer: 'W_c = 3.00 g at θ_c = 225° (Exact Counter-Balancing)',
      },
    },
    {
      title: 'ISO 10816-3 & ISO 20816-3 Vibration Severity Standards',
      summary:
        'Industrial condition monitoring evaluates rotating machinery health by measuring overall broadband vibration velocity RMS (10 Hz to 1,000 Hz) at bearing housings. ISO 10816-3 and modern ISO 20816-3 establish four standardized operational evaluation zones for medium industrial machines (Class II: 15 kW to 300 kW electric motors and driven pumps, fans, compressors) mounted on either rigid or flexible foundations.',
      equations: [
        {
          label: 'RMS Vibration Velocity from Harmonic Displacement',
          formula: 'v_rms = (ω * X_peak) / √2 = (2π * f * X_peak) / (1000 * √2)',
          note: 'X_peak in μm (zero-to-peak), f in Hz, v_rms in mm/s RMS.',
        },
        {
          label: 'Overall RMS Velocity from Harmonic Components',
          formula: 'v_total = √(v_{1X}² + v_{2X}² + v_{3X}² + v_{noise}²)',
          note: 'Synthesizes synchronous unbalance, 2X misalignment, and harmonic looseness.',
        },
        {
          label: 'ISO 10816-3 Class II Rigid Foundation Limits',
          formula: 'Zone A ≤ 1.12,  Zone B ≤ 2.80,  Zone C ≤ 4.50,  Zone D > 4.50 mm/s',
          note: 'Zone A: Good; Zone B: Acceptable; Zone C: Unsatisfactory; Zone D: Unacceptable / Trip.',
        },
        {
          label: 'ISO 10816-3 Class II Flexible Foundation Limits',
          formula: 'Zone A ≤ 1.80,  Zone B ≤ 4.50,  Zone C ≤ 7.10,  Zone D > 7.10 mm/s',
          note: 'Flexible foundation allows higher bearing housing motion due to structural compliance.',
        },
      ],
      workedExample: {
        title: 'Evaluating ISO Vibration Severity Zone for an Industrial Motor',
        given: [
          'Operating speed N = 3,000 RPM (f = 50.0 Hz, ω = 314.16 rad/s)',
          'Measured synchronous 1X peak displacement X_peak = 15.0 μm (30 μm peak-to-peak)',
          'Foundation type: Heavy rigid reinforced concrete base (Class II, Rigid)',
        ],
        steps: [
          'Compute peak vibration velocity: v_peak = ω * X_peak * 10⁻³ = 314.16 * 15.0 * 10⁻³ = 4.712 mm/s.',
          'Convert to RMS velocity: v_rms = 4.712 / √2 = 3.332 mm/s RMS.',
          'Compare with ISO 10816-3 Class II Rigid thresholds: Zone A ≤ 1.12, Zone B ≤ 2.80, Zone C ≤ 4.50.',
          'Since 2.80 < 3.332 ≤ 4.50 mm/s, the machine falls into Zone C (Unsatisfactory).',
          'Corrective action: Plan balancing at the next opportunity; unrestricted long-term operation is not permitted.',
        ],
        answer: 'v_rms = 3.33 mm/s (Zone C — Unsatisfactory / Maintenance Required)',
      },
    },
    {
      title: 'FFT Frequency Spectrum Analysis & Order Tracking',
      summary:
        'Fast Fourier Transform (FFT) spectrum analysis decomposes raw time-domain vibration signals into discrete frequency components. In rotating machinery diagnostics, frequencies are expressed in orders of running speed (1X, 2X, 3X). A dominant 1X peak with low harmonics signifies pure mass unbalance. Elevated 2X vibration indicates shaft misalignment or bent shaft, while 3X and higher harmonics signify mechanical looseness, bearing race defects, or blade pass interactions.',
      equations: [
        {
          label: 'Fundamental Running Speed Frequency (1X)',
          formula: 'f_{1X} = N / 60 (Hz)',
          note: 'At 1,800 RPM, f_{1X} = 30.0 Hz; at 3,600 RPM, f_{1X} = 60.0 Hz.',
        },
        {
          label: 'Vibration Order Relationship',
          formula: 'f_n = n * f_{1X} = n * (N / 60)',
          note: 'n = 1 (unbalance), n = 2 (coupling misalignment), n = 3 (bearing/base looseness).',
        },
        {
          label: 'Harmonic Distortion / Unbalance Dominance Ratio',
          formula: 'R_{1X} = v_{1X} / v_total',
          note: 'When R_{1X} > 0.85, the vibration fault is overwhelmingly dominated by pure mass unbalance.',
        },
      ],
      workedExample: {
        title: 'Diagnosing Machine Fault from Multi-Order FFT Spectrum',
        given: [
          'Running speed N = 1,800 RPM (1X frequency = 30 Hz)',
          'FFT spectrum peak amplitudes: 1X (30 Hz) = 4.2 mm/s RMS, 2X (60 Hz) = 0.5 mm/s RMS, 3X (90 Hz) = 0.2 mm/s RMS',
        ],
        steps: [
          'Compute total RMS velocity: v_total = √(4.2² + 0.5² + 0.2²) = √(17.64 + 0.25 + 0.04) = √17.93 = 4.23 mm/s RMS.',
          'Calculate unbalance dominance ratio: R_{1X} = 4.2 / 4.23 = 99.3%.',
          'Diagnose: The overwhelming concentration of energy at 1X with negligible 2X/3X confirms pure rotor unbalance as the root cause, rather than coupling misalignment or bearing looseness.',
          'Recommendation: Execute single-plane rotor balancing without requiring shaft realignment.',
        ],
        answer: 'Root Cause: Single-Plane Rotor Unbalance (99.3% 1X Energy Dominance)',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A single-disk rotor has an effective mass M = 4.0 kg and is mounted on a flexible shaft with lateral bending stiffness k = 157,914 N/m. Calculate the first undamped critical speed N_c in revolutions per minute (RPM).',
      hint: 'ω_n = √(k / M) in rad/s, then N_c = (60 / 2π) * ω_n = ω_n * 9.5493.',
      targetValue: 1900,
      unit: 'RPM',
      tolerance: 20,
      solutionSteps: [
        'ω_n = √(157,914 N/m / 4.0 kg) = √39,478.5 = 198.69 rad/s',
        'N_c = (60 / (2 * π)) * 198.69 = 9.5493 * 198.69 = 1,897.4 RPM ≈ 1,900 RPM',
      ],
    },
    {
      id: 'p2',
      prompt:
        'A balancing technician measures an initial unbalance U₀ = 240 g·mm on a rotor with total mass M = 6.0 kg. Calculate the center of mass eccentricity e_u in micrometers (μm).',
      hint: 'e_u = U₀ / M. Remember that (1 g·mm) / (1 kg) = (10⁻³ kg * 10⁻³ m) / (1 kg) = 10⁻⁶ m = 1 μm.',
      targetValue: 40.0,
      unit: 'μm',
      tolerance: 0.5,
      solutionSteps: [
        'e_u = U₀ / M = 240 g·mm / 6.0 kg',
        'e_u = 40.0 (g·mm/kg) = 40.0 μm',
      ],
    },
    {
      id: 'p3',
      prompt:
        'A rotor disk exhibits an initial unbalance U₀ = 150 g·mm at angular position θ₀ = 60°. If correction weights are installed at a bolt hole radius R_hole = 50 mm, calculate the exact correction mass W_c in grams required for complete counter-balancing.',
      hint: 'W_c = U₀ / R_hole. The counter-weight must be mounted diametrically opposite (θ_c = 60° + 180° = 240°).',
      targetValue: 3.0,
      unit: 'g',
      tolerance: 0.1,
      solutionSteps: [
        'W_c = U₀ / R_hole',
        'W_c = 150 g·mm / 50 mm = 3.00 g',
        'Mounted at θ_c = (60° + 180°) = 240° to cancel the heavy spot.',
      ],
    },
    {
      id: 'p4',
      prompt:
        'A rotor with mass eccentricity e_u = 25 μm operates at a frequency ratio r = 0.60 below its critical speed. If the damping ratio is ζ = 0.08, calculate the dynamic synchronous vibration amplitude X in micrometers (μm).',
      hint: 'X = e_u * M(r), where M(r) = r² / √((1 - r²)² + (2 * ζ * r)²).',
      targetValue: 13.9,
      unit: 'μm',
      tolerance: 0.5,
      solutionSteps: [
        'r² = 0.60² = 0.36',
        '(1 - r²) = 1 - 0.36 = 0.64,  (1 - r²)² = 0.64² = 0.4096',
        '2 * ζ * r = 2 * 0.08 * 0.60 = 0.096,  (2 * ζ * r)² = 0.096² = 0.009216',
        'Denominator = √(0.4096 + 0.009216) = √0.418816 = 0.64716',
        'M(r) = 0.36 / 0.64716 = 0.5563',
        'X = 25 μm * 0.5563 = 13.91 μm',
      ],
    },
    {
      id: 'p5',
      prompt:
        'An induction motor runs at N = 1,800 RPM. A vibration accelerometer on the drive-end bearing detects a synchronous 1X peak displacement X_peak = 20.0 μm (40 μm peak-to-peak). Calculate the root-mean-square (RMS) vibration velocity v_rms in mm/s.',
      hint: 'ω = 2π * (1,800 / 60) = 188.5 rad/s. v_peak = ω * X_peak (in mm/s). v_rms = v_peak / √2.',
      targetValue: 2.67,
      unit: 'mm/s',
      tolerance: 0.1,
      solutionSteps: [
        'ω = (2 * π * 1,800) / 60 = 188.496 rad/s',
        'X_peak = 20.0 μm = 0.020 mm',
        'v_peak = ω * X_peak = 188.496 * 0.020 = 3.770 mm/s',
        'v_rms = v_peak / √2 = 3.770 / 1.4142 = 2.666 mm/s ≈ 2.67 mm/s',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'What physical phenomenon occurs when a rotor accelerates through its critical speed (resonance)?',
      options: [
        'The vibration amplitude peaks and the phase angle between the heavy spot and vibration peak shifts through 90°',
        'The rotor instantaneously stops rotating due to aerodynamic drag',
        'Centrifugal unbalance force drops to exactly zero at resonance',
        'The shaft switches its direction of rotation from clockwise to counter-clockwise',
      ],
      correctIndex: 0,
      explanation:
        'At critical speed (r = 1), the forcing frequency matches the system lateral natural frequency. Vibration displacement peaks sharply (governed by damping ζ), and the phase lag between the heavy spot and peak deflection passes through 90°, approaching 180° at supercritical speeds.',
    },
    {
      id: 'q2',
      question:
        'Why does a flexible rotor self-center about its center of mass when operated well above its critical speed (r >> 1)?',
      options: [
        'The phase lag approaches 180°, causing the rotor to deflect so that its center of mass aligns with the axis of rotation',
        'The unbalance weight is physically thrown off the rotor by centrifugal force',
        'Shaft stiffness increases to infinity at supercritical speeds',
        'Viscous damping eliminates all rotational kinetic energy',
      ],
      correctIndex: 0,
      explanation:
        'At speeds well above resonance (r >> 1), the phase lag between mass eccentricity and vibration displacement approaches 180°. In this regime, the shaft flexes inward toward the heavy spot, causing the physical center of mass to align with the axis of rotation (the dynamic magnification factor M(r) approaches 1.0).',
    },
    {
      id: 'q3',
      question:
        'In vibration frequency spectrum analysis (FFT), which spectral pattern is the definitive signature of pure mass unbalance?',
      options: [
        'A dominant synchronous peak at 1X RPM with very low harmonic distortion (low 2X and 3X)',
        'Dominant peaks at 2X RPM with high axial vibration',
        'Broadband high-frequency noise above 2 kHz without any discrete 1X component',
        'Sub-synchronous peaks at exactly 0.43X to 0.48X RPM caused by oil whirl',
      ],
      correctIndex: 0,
      explanation:
        'Mass unbalance creates a sinusoidal centrifugal force that rotates at exactly once per shaft revolution. Its FFT frequency signature is overwhelmingly concentrated at the 1X running frequency, with circular or elliptical planar orbits and low harmonic distortion.',
    },
    {
      id: 'q4',
      question:
        'According to ISO 10816-3 and ISO 20816-3 for medium machines on rigid foundations (Class II), what action is mandated when vibration reaches Zone D (> 4.50 mm/s RMS)?',
      options: [
        'Immediate shutdown/trip to prevent catastrophic structural or bearing failure',
        'Continue unrestricted operation until the next yearly planned maintenance',
        'Increase rotational speed to bypass the vibration alarm',
        'Add lubrication grease until the vibration reading drops',
      ],
      correctIndex: 0,
      explanation:
        'ISO 10816-3 classifies vibration severity into four zones: Zone A (Good), Zone B (Acceptable), Zone C (Unsatisfactory / restricted), and Zone D (Unacceptable). Zone D signifies vibration levels severe enough to cause rapid bearing fatigue, shaft damage, or casing cracking, requiring immediate shutdown.',
    },
    {
      id: 'q5',
      question:
        'What is the fundamental difference in allowable vibration severity between rigid and flexible machine supports in ISO 10816-3?',
      options: [
        'Flexible supports allow higher vibration velocity limits because foundation compliance absorbs dynamic forces without generating excessive bearing stress',
        'Rigid supports permit twice the vibration velocity of flexible supports',
        'Flexible foundations eliminate all centrifugal forces from unbalance',
        'ISO standards only apply to rigidly mounted machines and prohibit flexible supports',
      ],
      correctIndex: 0,
      explanation:
        'Flexible supports (such as spring or elastomer vibration isolators) yield more easily under dynamic loads, allowing the casing to vibrate with larger amplitude while actually transmitting lower dynamic shear forces into the sub-base. Hence, ISO 10816-3 permits higher velocity thresholds (e.g. Zone B limit is 4.50 mm/s for flexible vs 2.80 mm/s for rigid).',
    },
    {
      id: 'q6',
      question:
        'When executing single-plane field balancing on a rigid rotor, why is a trial weight run required before calculating the final correction mass?',
      options: [
        'To experimentally determine the system influence coefficient (sensitivity and phase response) under actual operating conditions',
        'To wear in the bearing surfaces prior to applying the permanent weight',
        'To burn off surface rust and dirt on the rotor disk',
        'To increase the critical speed of the shaft assembly',
      ],
      correctIndex: 0,
      explanation:
        'Because rotor damping, bearing stiffness, and sensor sensitivity are rarely known precisely from theoretical CAD models, adding a known trial mass W_t allows calculating the complex influence coefficient vector α = (V_{0+t} - V₀) / W_t, relating added mass to resulting vibration change.',
    },
  ],
};
