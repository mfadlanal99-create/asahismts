import type { SimulatorMeta } from '../../types/simulator';
import './vbeltBasicsI18n';

export const vbeltBasicsMeta: SimulatorMeta = {
  id: 'vbelt-basics',
  title: 'V-Belt & Drive Belt Basics',
  shortTitle: 'V-Belts & Wedging Physics',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  description:
    'Interactive 2D CAD cross-section lab for industrial drive belts (Classical A/B/C, Narrow Wedge SPZ/SPA/SPB, Cogged AX/BX, HTD 5M/8M Timing, Poly-V PJ/PK, Flat) showing sidewall wedging mechanics, bottoming-out failure diagnostics, and a live belt code decoder.',
  iconName: 'Cog',
  accentColor: 'amber',
  explore: [
    {
      title: 'V-Belt Wedging Action & "Bottoming-Out" Catastrophic Failure',
      summary:
        'A V-belt does NOT grip the bottom floor of the pulley groove! Power is transmitted purely by the inclined tapered sidewalls squeezing radially into the V-groove flanks. Explain how V-belt wedging multiplies apparent friction (μ′ = μ / sin β) and diagnose worn dished sheaves before belt burnout occurs.',
      equations: [
        {
          label: 'Flank Normal Force & Apparent Wedging Friction',
          formula: "F_n = T / (2 · sin β)   |   μ' = μ / sin β",
          note: 'For 2β = 36° (β = 18°, sin 18° = 0.309), radial tension T is amplified ~3× into flank normal force and apparent friction rises from μ ≈ 0.30 to μ′ ≈ 0.90–1.05.',
        },
        {
          label: 'Bottoming-Out Catastrophe',
          formula: "Root Clearance c → 0 mm  ⇒  μ' drops to ~0.30",
          note: 'When a pulley groove wears wider/deeper or an undersized belt is installed, sidewall wedging collapses instantly and severe slip burns the belt in minutes.',
        },
      ],
    },
    {
      title: 'Industrial Drive Belt Profiles: Classical, Narrow, Cogged, Timing & Poly-V',
      summary:
        'Modern mechanical drives span multiple belt families tailored for high power density, small pulley diameters, or zero-slip synchronization.',
      equations: [
        {
          label: 'Classical Wrapped (A, B, C) & Narrow Wedge (SPZ, SPA, SPB)',
          formula: '40° Classical (13×8, 17×11, 22×14) vs 38° Deep Narrow Wedge (2–3× Power)',
          note: 'Wrapped V-belts serve general fans and pumps; deeper SPZ/SPA/SPB profiles pack high-strength tensile cords for narrow multi-groove sheaves.',
        },
        {
          label: 'Cogged Raw-Edge (AX, BX)',
          formula: 'Molded Bottom Cogs → ~15°C Cooler on Small Sheaves',
          note: 'Precision-ground rubber sidewalls boost friction while molded bottom cogs slash bending stress around tight motor pulleys.',
        },
        {
          label: 'Timing (HTD 5M, 8M) & Poly-V (PJ, PK)',
          formula: 'Positive Curvilinear Tooth Mesh / Multi-Rib Serpentine Flex',
          note: 'HTD timing belts engage pulley pockets positively with zero slip and low bearing preload; Poly-V belts bend flexibly around compact serpentine pulleys.',
        },
      ],
    },
    {
      title: 'Belt Code Decoding, Pitch Length & Sheave Inspection',
      summary:
        'Reading belt part numbers correctly prevents ordering mismatched Imperial inside-length vs Metric datum pitch-length spares.',
      equations: [
        {
          label: 'Timing Belt Tooth Count',
          formula: 'N = L_pitch / p',
          note: 'Example: HTD 8M-800 → 8 mm pitch × 800 mm pitch length = 100 teeth.',
        },
        {
          label: 'Imperial Classical / Cogged Codes (e.g., B-65, AX-42)',
          formula: 'L_i (mm) = Code_Inches × 25.4',
          note: 'Letter gives cross-section (A, B, C, AX, BX) and number gives inside length in inches (65 in × 25.4 = 1,651 mm).',
        },
        {
          label: 'Metric Narrow Wedge & Poly-V Codes (SPA-1250, 6PK-1840)',
          formula: 'Numeric Suffix = Datum Pitch / Effective Length (mm)',
          note: 'SPA-1250 has 1,250 mm datum pitch length; 6PK-1840 has 6 longitudinal PK ribs at 1,840 mm effective length.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A Classical B-section V-belt with base rubber friction μ = 0.30 runs inside a machined sheave groove with included angle 2β = 36° (so half-angle β = 18°). Calculate the apparent wedging friction coefficient μ′ = μ / sin(18°).',
      hint: 'Compute sin(18°) ≈ 0.3090, then divide 0.30 by 0.3090.',
      targetValue: 0.97,
      tolerance: 0.05,
      unit: 'μ′',
      solutionSteps: [
        "μ' = 0.30 / sin(18°) = 0.30 / 0.3090 ≈ 0.97 (over 3× higher effective grip than a flat belt!).",
      ],
    },
    {
      id: 'p2',
      prompt:
        'A narrow SPA V-belt carries radial pull tension T = 600 N into a 36° pulley groove (half-angle β = 18°). Compute the normal clamping force Fn = T / (2 · sin 18°) acting on EACH sidewall flank.',
      hint: 'Substitute T = 600 N and sin(18°) = 0.3090 into Fn = 600 / (2 × 0.3090).',
      targetValue: 970.8,
      tolerance: 30,
      unit: 'N',
      solutionSteps: ['Fn = 600 / (2 × 0.3090) = 600 / 0.6180 ≈ 970.8 N per sidewall.'],
    },
    {
      id: 'p3',
      prompt:
        'A 125 mm pitch-diameter pulley rotates at 1450 RPM driving an A-section V-belt. Calculate the linear belt speed V = (π · D · N) / 60,000 in m/s.',
      hint: 'Convert D = 125 mm to 0.125 m, or use V = π × 125 × 1450 / 60000.',
      targetValue: 9.49,
      tolerance: 0.25,
      unit: 'm/s',
      solutionSteps: ['V = (π × 125 × 1450) / 60,000 = 569,413.7 / 60,000 ≈ 9.49 m/s.'],
    },
    {
      id: 'p4',
      prompt:
        'Decode the classical V-belt code "B-65": what is its nominal inside circumference length in millimeters? (1 inch = 25.4 mm)',
      hint: 'In Imperial classical belt codes, the number after the hyphen is inside length in inches.',
      targetValue: 1651,
      tolerance: 5,
      unit: 'mm',
      solutionSteps: ['65 inches × 25.4 mm/in = 1,651.0 mm inside length.'],
    },
    {
      id: 'p5',
      prompt:
        'Decode the synchronous timing belt code "HTD 8M-800": with a tooth pitch of 8 mm and pitch length of 800 mm, how many teeth does the belt have?',
      hint: 'Divide the pitch length (800 mm) by the tooth pitch (8 mm).',
      targetValue: 100,
      tolerance: 0.1,
      unit: 'teeth',
      solutionSteps: ['Tooth count N = 800 mm / 8 mm = 100 teeth.'],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'What happens immediately when a V-belt rides deep enough to "bottom out" against the floor of a worn pulley groove?',
      options: [
        'Sidewall wedging pressure collapses, apparent friction plunges to flat-belt levels (~0.30), and severe slip overheats the belt.',
        'Power transmission capacity doubles due to triple contact surfaces.',
        'The belt automatically self-centers and reduces bearing shaft load.',
        'The groove angle increases from 38° to 60°.',
      ],
      correctIndex: 0,
      explanation:
        'A healthy V-belt must NEVER touch the groove bottom. Bottoming out destroys sidewall wedging force amplification, causing immediate slip and thermal glazing.',
    },
    {
      id: 'q2',
      question:
        'Why does an HTD 8M Synchronous Timing Belt require much lower static pretension than a Classical V-belt for the same shaft torque?',
      options: [
        'Positive tooth-in-groove mechanical meshing transmits torque without relying on high sidewall wedging friction.',
        'Timing belts have 45° wedge angles that quadruple normal force.',
        'Timing belts run in oil baths inside the pulley.',
        'Timing belt cords expand during rotation to tighten themselves.',
      ],
      correctIndex: 0,
      explanation:
        'Synchronous timing belts transmit power through positive mechanical engagement between curvilinear teeth and pulley grooves, drastically lowering radial shaft bearing loads.',
    },
    {
      id: 'q3',
      question:
        'Compared to a Classical A-section wrapped belt (13 × 8 mm), why can a Narrow Wedge SPA belt (12.7 × 10 mm) transmit substantially higher horsepower per strand?',
      options: [
        'Its deeper cross-section provides greater sidewall contact height and positions higher-modulus tensile cords directly over the groove flanks.',
        'It bottoms out deliberately on the groove floor for extra traction.',
        'It has no tensile cords and stretches more easily.',
        'It operates at a 90° flat contact angle.',
      ],
      correctIndex: 0,
      explanation:
        'Narrow wedge belts (SPZ, SPA, SPB) use a deeper profile ratio that gives higher cord support and uniform sidewall pressure across the sheave flanks.',
    },
    {
      id: 'q4',
      question:
        'When wrapping a drive belt around an undersized motor pulley, why is a Cogged Raw-Edge belt (AX or BX) superior to a wrapped Classical belt (A or B)?',
      options: [
        'Molded bottom notches (cogs) reduce bending hysteresis heat and flexibility stress while raw rubber flanks offer higher friction.',
        'Cogged belts act as toothed timing belts with zero slip.',
        'Cogged belts are wider than C-section belts.',
        'Cogged belts require no pulley groove sidewalls.',
      ],
      correctIndex: 0,
      explanation:
        'Bottom cogs allow the belt to bend smoothly around smaller sheaves with less internal heat generation, extending fatigue life on compact motor pulleys.',
    },
    {
      id: 'q5',
      question:
        'In a washing machine or automotive serpentine accessory drive with tight back-bend idlers and high speed, which belt family is most suitable?',
      options: [
        'Poly-V Multi-Ribbed Belt (PJ / PK)',
        'Classical Wrapped C-Section V-Belt',
        'Heavy Leather Flat Belt',
        'Single-Strand B-Section V-Belt',
      ],
      correctIndex: 0,
      explanation:
        'Poly-V (PJ, PK) belts combine multiple micro-V ribs with a thin flat backing, giving high wedging grip plus extreme bending flexibility over small serpentine and back-idler pulleys.',
    },
    {
      id: 'q6',
      question:
        'During preventive maintenance, a technician slides a V-belt gauge into a pulley and notices the groove flanks are dished/concave and the belt sits below the pulley rim. What is the correct action?',
      options: [
        'Replace the worn pulley sheave along with the new belt—installing only a new belt will bottom out quickly and fail prematurely.',
        'Over-tighten the belt tension by 50% to compensate for the worn groove.',
        'Apply belt dressing grease to the groove floor.',
        'Switch to a narrower SPZ belt inside the same wide B-groove.',
      ],
      correctIndex: 0,
      explanation:
        'Worn dished sheave walls allow a brand-new belt to sink too deep, ruining wedging geometry and causing rapid bottoming-out failure.',
    },
  ],
};
