import type { SimulatorMeta } from '../../types/simulator';

export const dbMeterMeta: SimulatorMeta = {
  id: 'db-meter',
  title: 'Sound Level / dB Meter (IEC 61672 Class 1)',
  shortTitle: 'Sound Level / dB Meter',
  category: 'Diagnostic Instruments',
  difficulty: 'Beginner',
  description:
    'Measure industrial machine noise using an IEC 61672 Class 1 Sound Level Meter. Explore A/C/Z frequency weightings, FAST/SLOW time constants, free-field inverse-square distance attenuation, acoustic enclosure insertion loss, and OSHA/NIOSH occupational noise dose limits.',
  iconName: 'Volume2',
  accentColor: 'emerald',
  explore: [
    {
      title: 'Decibel Scale, Octave Bands & Inverse-Square Law',
      summary:
        'Sound pressure level (SPL) compresses a million-fold range of acoustic pressures onto a logarithmic decibel scale referenced to the threshold of human hearing (20 μPa). In an unobstructed free field, spherical wave spreading causes SPL to drop by 6.02 dB every time the distance from a point source doubles.',
      equations: [
        {
          label: 'Sound Pressure Level (SPL)',
          formula: 'L_p = 20 · log₁₀(p / p₀),   p₀ = 20 μPa',
          note: 'p = RMS acoustic pressure (Pa); a +6 dB increase doubles acoustic pressure.',
        },
        {
          label: 'Inverse-Square Distance Attenuation',
          formula: 'L_p(d₂) = L_p(d₁) − 20 · log₁₀(d₂ / d₁)',
          note: 'Doubling distance (d₂ = 2·d₁) reduces free-field SPL by 20·log₁₀(2) ≈ 6.02 dB.',
        },
        {
          label: 'Logarithmic Addition of Octave Bands',
          formula: 'L_total = 10 · log₁₀( Σ 10^(L_i / 10) )',
          note: 'Used to combine 63 Hz – 8 kHz octave band levels into overall dBA, dBC, or dBZ.',
        },
      ],
      workedExample: {
        title: 'Predicting Noise Level at a Walkway 4 m Away',
        given: [
          'Measured compressor noise at d₁ = 1.0 m: L_p1 = 98.0 dBA',
          'Operator walkway distance: d₂ = 4.0 m (free-field)',
          'Acoustic enclosure insertion loss: IL = 12.0 dB (when installed)',
        ],
        steps: [
          'Compute distance attenuation: ΔL_dist = −20 · log₁₀(4.0 / 1.0) = −20 · 0.6021 = −12.04 dB.',
          'Without enclosure at 4.0 m: L_p = 98.0 − 12.04 = 85.96 dBA (still above 85 dBA NIOSH REL).',
          'With −12 dB acoustic enclosure installed: L_p = 85.96 − 12.0 = 73.96 dBA.',
        ],
        answer: '86.0 dBA (open) or 74.0 dBA (with acoustic enclosure)',
      },
    },
    {
      title: 'IEC 61672 Frequency Weightings (A, C, Z) & Time Constants',
      summary:
        'Human ears are far less sensitive to low frequencies (63–250 Hz) than to mid-high frequencies (1–4 kHz). IEC 61672-1 defines standardized weighting filters: dBA models human hearing sensitivity at moderate levels and is required for OSHA/NIOSH compliance; dBC is nearly flat down to 31.5 Hz for evaluating low-frequency rumble and peak noise; dBZ (Zero) is completely unweighted flat response for engineering diagnostics.',
      equations: [
        {
          label: 'A-Weighting vs Z-Weighting',
          formula: 'L_A,i = L_Z,i + W_A(f_i)',
          note: 'At 63 Hz, W_A = −26.2 dB; at 1 kHz, W_A = 0.0 dB; at 2 kHz, W_A = +1.2 dB.',
        },
        {
          label: 'Exponential Time Weighting (FAST / SLOW)',
          formula: 'τ_FAST = 125 ms,   τ_SLOW = 1000 ms (1 s)',
          note: 'FAST tracks rapid impact/cavitation bursts; SLOW smooths fluctuating machinery noise for steady readings.',
        },
      ],
      workedExample: {
        title: 'Comparing dBA and dBC on a Low-Frequency Cooling Fan',
        given: [
          'Electric motor fan dominated by 63 Hz (76 dBZ) and 125 Hz (78 dBZ) airflow',
          'A-weighting offsets: −26.2 dB at 63 Hz, −16.1 dB at 125 Hz',
          'C-weighting offsets: −0.8 dB at 63 Hz, −0.2 dB at 125 Hz',
        ],
        steps: [
          'In dBA, the 63 Hz and 125 Hz bands are attenuated to 49.8 dBA and 61.9 dBA, yielding an overall ~79 dBA.',
          'In dBC, those same low-frequency bands remain 75.2 dBC and 77.8 dBC, yielding ~82 dBC.',
          'A large (dBC − dBA) spread (> 3–5 dB) is a classic diagnostic indicator of dominant low-frequency noise.',
        ],
        answer: 'dBC reads ~3 dB higher than dBA due to low-frequency fan energy',
      },
    },
    {
      title: 'OSHA vs. NIOSH Occupational Noise Exposure & 8h TWA Dose',
      summary:
        'Hearing conservation standards limit daily noise dose based on a Criterion Level (L_c) for an 8-hour shift and an Exchange Rate (ER) specifying how many decibels halve the permissible exposure time. OSHA (29 CFR 1910.95) uses a 90 dBA criterion with a 5 dB exchange rate, whereas NIOSH uses a more protective 85 dBA criterion with a 3 dB equal-energy exchange rate.',
      equations: [
        {
          label: 'Permissible Exposure Time (T)',
          formula: 'T = 8 / 2^((L_A − L_c) / ER)   [hours]',
          note: 'OSHA: L_c = 90 dBA, ER = 5 dB. NIOSH: L_c = 85 dBA, ER = 3 dB.',
        },
        {
          label: '8-Hour TWA Noise Dose (%)',
          formula: 'Dose (%) = 100 · (t_exp / T) = 100 · 2^((L_A − L_c) / ER)  (for 8h shift)',
          note: '100% Dose = maximum allowable daily exposure; ≥ 50% OSHA Dose (85 dBA) triggers Hearing Conservation Program.',
        },
      ],
      workedExample: {
        title: 'Evaluating an 8-Hour Shift at 91 dBA',
        given: [
          'Steady operator exposure level L_A = 91.0 dBA for an 8-hour shift',
        ],
        steps: [
          'OSHA (L_c = 90, ER = 5): T_OSHA = 8 / 2^((91 − 90)/5) = 8 / 2^0.2 = 6.96 hours.',
          'OSHA 8h Dose = 100 · 2^0.2 = 114.9% (Exceeds 100% PEL).',
          'NIOSH (L_c = 85, ER = 3): T_NIOSH = 8 / 2^((91 − 85)/3) = 8 / 2^2 = 2.00 hours.',
          'NIOSH 8h Dose = 100 · 2^2 = 400% (4× the recommended limit).',
        ],
        answer: 'OSHA: 6h 58m (115% Dose); NIOSH: 2h 00m (400% Dose)',
      },
    },
  ],
  practice: [
    {
      id: 'db-inverse-square',
      prompt:
        'A centrifugal compressor measures 98.0 dBA at 1.0 m in a free field. Assuming inverse-square law attenuation (−6.02 dB per doubling of distance) and no enclosure, what is the predicted sound level in dBA at 4.0 m?',
      hint: 'Use L_p(d₂) = L_p(d₁) − 20·log₁₀(d₂ / d₁). Going from 1 m to 4 m is two doublings of distance.',
      targetValue: 85.96,
      unit: 'dBA',
      tolerance: 0.3,
      solutionSteps: [
        'Distance ratio d₂ / d₁ = 4.0 / 1.0 = 4.',
        'Attenuation = −20 · log₁₀(4) = −20 · 0.60206 = −12.04 dB.',
        'L_p(4 m) = 98.0 − 12.04 = 85.96 dBA.',
      ],
    },
    {
      id: 'db-osha-time',
      prompt:
        'Under OSHA 29 CFR 1910.95 (90 dBA criterion, 5 dB exchange rate), what is the maximum permissible exposure time in hours at a steady noise level of 95 dBA?',
      hint: 'Apply T = 8 / 2^((L_A − 90) / 5).',
      targetValue: 4,
      unit: 'hours',
      tolerance: 0.1,
      solutionSteps: [
        'Exponent = (95 − 90) / 5 = 1.0.',
        'T_OSHA = 8 / 2^1.0 = 8 / 2 = 4.0 hours.',
      ],
    },
    {
      id: 'db-niosh-dose',
      prompt:
        'Under NIOSH criteria (85 dBA criterion, 3 dB exchange rate), what is the 8-hour TWA noise dose percentage (%) if a technician works a full 8-hour shift in an 88 dBA area?',
      hint: 'Dose (%) = 100 · 2^((L_A − 85) / 3).',
      targetValue: 200,
      unit: '%',
      tolerance: 2,
      solutionSteps: [
        'Exponent = (88 − 85) / 3 = 1.0.',
        'Dose (%) = 100 · 2^1.0 = 200%.',
      ],
    },
  ],
  quiz: [
    {
      id: 'db-q1',
      question:
        'Which frequency weighting curve is legally required for OSHA and NIOSH occupational hearing conservation measurements?',
      options: ['dBA (A-weighted)', 'dBC (C-weighted)', 'dBZ (Zero / unweighted)', 'dBG (Infrasound)'],
      correctIndex: 0,
      explanation:
        'dBA approximates the frequency response of the human ear at moderate sound levels and is the standard weighting specified by OSHA (29 CFR 1910.95) and NIOSH.',
    },
    {
      id: 'db-q2',
      question:
        'Moving a sound level meter from 2 m to 4 m away from a point noise source in an open free field reduces the measured SPL by approximately:',
      options: ['3 dB', '6 dB', '10 dB', '12 dB'],
      correctIndex: 1,
      explanation:
        'By the inverse-square law, doubling distance reduces SPL by 20·log₁₀(2) ≈ 6.02 dB.',
    },
    {
      id: 'db-q3',
      question:
        'When should a technician select FAST (125 ms) time weighting instead of SLOW (1 s) on an IEC 61672 sound level meter?',
      options: [
        'To smooth out steady HVAC fan noise for a stable average reading',
        'To capture rapid transient bursts such as cavitation crackle or pneumatic exhaust pulses',
        'To convert dBC readings into dBA',
        'To double the microphone sensitivity',
      ],
      correctIndex: 1,
      explanation:
        'FAST (125 ms) tracks rapid level fluctuations and short acoustic bursts, whereas SLOW (1000 ms) damps fluctuations for steady-state readings.',
    },
    {
      id: 'db-q4',
      question:
        'How does NIOSH (85 dBA / 3 dB exchange rate) compare to OSHA (90 dBA / 5 dB exchange rate) for permissible exposure at 91 dBA?',
      options: [
        'NIOSH allows more hours than OSHA',
        'Both allow exactly 8 hours',
        'NIOSH is much stricter, allowing only 2.0 hours vs. OSHA’s ~7.0 hours',
        'NIOSH ignores frequencies above 1 kHz',
      ],
      correctIndex: 2,
      explanation:
        'Because NIOSH uses an 85 dBA criterion and a 3 dB halving rate (equal-energy rule), 91 dBA is two 3 dB doublings above 85 dBA: 8 / 2² = 2.0 hours.',
    },
  ],
};
