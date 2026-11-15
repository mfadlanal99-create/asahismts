import type { SimulatorMeta } from '../../types/simulator';
import './bearingBasicsI18n';

export const bearingBasicsMeta: SimulatorMeta = {
  id: 'bearing-basics',
  title: 'Bearing Types & Selection Basics',
  shortTitle: 'Bearing Types & Seals',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  description:
    'Interactive 2D CAD cutaway lab for rolling element bearings (Deep Groove, Angular Contact, Cylindrical, Tapered, Spherical, Thrust, Pillow Block) with live radial/axial load vectors, seal inspection, and an interactive application matcher.',
  iconName: 'CircleDot',
  accentColor: 'sky',
  explore: [
    {
      title: 'Rolling Bearing Construction & Load Directions',
      summary:
        'A rolling bearing consists of four core elements: an inner ring, an outer ring, rolling elements (balls or rollers), and a cage (retainer) that maintains uniform spacing. Identify rolling bearing geometry, compare point contact (balls) vs line contact (rollers), and understand how contact angle (α = 0°, 15°–40°, 90°) dictates radial vs axial thrust load capability.',
      equations: [
        {
          label: 'ISO Bore Code Rule (04–96)',
          formula: 'd = Bore_Code × 5 mm',
          note: 'Example: 6205 → 05 × 5 = 25 mm bore.',
        },
        {
          label: 'Point Contact (Ball: 6205, 7205, 51105) vs Line Contact (Roller: NU205, 30205, 22205)',
          formula: 'Point Contact → Low Friction / High RPM | Line Contact → High Cr & Shock Resistance',
          note: 'Ball bearings run with ultra-low rolling friction; cylindrical, tapered, and barrel rollers spread load over a line contact.',
        },
        {
          label: 'Contact Angle (α) Load Capability',
          formula: 'α = 0° (Radial) | α = 40° (Combined Radial + Axial) | α = 90° (Pure Axial Only)',
          note: 'Deep groove & NU carry primarily radial load; angular contact & tapered carry combined loads; 51105 thrust bearing fails catastrophically under radial force.',
        },
      ],
    },
    {
      title: 'Shields & Contact Seals: Open vs 2Z (Metal Shield) vs 2RS (Rubber Lip)',
      summary:
        'Choosing the right bearing enclosure balances contamination protection against frictional drag and high-speed heat buildup.',
      equations: [
        {
          label: 'Open Bearing',
          formula: 'No Seals / Shields → 100% Speed Rating',
          note: 'Relies on external gearbox oil bath or housing seals, allowing maximum RPM and easy oil flushing.',
        },
        {
          label: '2Z / ZZ (Double Metal Shields)',
          formula: 'Non-Contact Steel Gap → Zero Lip Friction',
          note: 'Stamped steel discs pressed into the outer ring with a tiny radial gap keep speed ratings high while blocking large dust and chips.',
        },
        {
          label: '2RS / 2RSH (Double Rubber Lip Seals)',
          formula: 'Contact NBR Lip → ~30–40% Lower Limiting RPM',
          note: 'Steel-reinforced nitrile rubber lips press against the inner ring shoulder to exclude fine dust, mud, and water splash while retaining factory grease.',
        },
      ],
    },
    {
      title: 'Thermal Float, Self-Alignment & Mounted Pillow Block Units',
      summary:
        'Real shafts bend under load and expand when hot—selecting the right non-locating or self-aligning bearing prevents housing seizure.',
      equations: [
        {
          label: 'Non-Locating Thermal Float (NU205)',
          formula: 'Ribless Inner Ring → Free Axial Slide',
          note: 'Because the inner ring has no side ribs, the shaft slides axially inside the bearing as it heats up without binding the locating bearing.',
        },
        {
          label: 'Self-Aligning Barrel Rollers (22205)',
          formula: 'Spherical Outer Raceway → ±1.5°–2° Tilt Allowance',
          note: 'A spherical outer raceway allows the inner assembly to pivot when heavy conveyor or crusher frames deflect.',
        },
        {
          label: 'Pillow Block Units (UCP205)',
          formula: 'UC205 Sealed Insert + Cast-Iron Bolt-Down Housing',
          note: 'Pre-lubricated, sealed insert bearings with a spherical outer seat and set screws—ideal for rapid machine frame assembly.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'An electric motor uses a 6205-2RS deep groove ball bearing (ISO bore code 05). According to standard ISO rolling bearing numbering, what is the shaft bore diameter d in millimeters?',
      hint: 'For ISO bore codes 04 and above, multiply the last two digits by 5 mm.',
      targetValue: 25,
      tolerance: 0.1,
      unit: 'mm',
      solutionSteps: ['d = 05 × 5 = 25 mm.'],
    },
    {
      id: 'p2',
      prompt:
        'A 6205 bearing has bore diameter d = 25 mm and outer diameter D = 52 mm. Calculate the single-side radial cross-section height H = (D − d) / 2 in millimeters.',
      hint: 'Subtract bore d from outer diameter D, then divide by 2 because the bearing wall wraps both sides of the shaft.',
      targetValue: 13.5,
      tolerance: 0.2,
      unit: 'mm',
      solutionSteps: ['H = (52 − 25) / 2 = 27 / 2 = 13.5 mm.'],
    },
    {
      id: 'p3',
      prompt:
        'A 22205 spherical roller bearing has bore d = 25 mm and outer diameter D = 52 mm. Calculate its pitch (mean) diameter d_m = (d + D) / 2 used for grease relubrication speed factor n·d_m.',
      hint: 'Take the arithmetic average of bore diameter d and outer diameter D.',
      targetValue: 38.5,
      tolerance: 0.2,
      unit: 'mm',
      solutionSteps: ['d_m = (25 + 52) / 2 = 38.5 mm.'],
    },
    {
      id: 'p4',
      prompt:
        'A 7205 Angular Contact Ball Bearing (α = 40°) supports a pure radial load Fr = 10 kN in a pump shaft. Estimate the induced axial thrust reaction Fa = Fr · tan(40°) inside the single bearing.',
      hint: 'Multiply Fr = 10 kN by tan(40°) ≈ 0.8391.',
      targetValue: 8.39,
      tolerance: 0.25,
      unit: 'kN',
      solutionSteps: [
        'Fa = 10 × tan(40°) = 10 × 0.8391 ≈ 8.39 kN (must be opposed by a second paired bearing!).',
      ],
    },
    {
      id: 'p5',
      prompt:
        'A 6205 open/2Z bearing has a grease limiting speed of 14,000 RPM, while the 2RS contact-seal version is limited to 8,500 RPM due to lip friction. What percentage reduction in limiting speed does switching from 2Z to 2RS cause?',
      hint: 'Compute ((14000 − 8500) / 14000) × 100.',
      targetValue: 39.3,
      tolerance: 1.0,
      unit: '%',
      solutionSteps: ['Reduction = (14,000 − 8,500) / 14,000 × 100 = 39.29% ≈ 39.3%.'],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'Why does a 51105 Thrust Ball Bearing fail rapidly if subjected to heavy radial shaft loads?',
      options: [
        'Its 90° raceway washers are perpendicular to the shaft and cannot trap balls radially, causing ball derailment.',
        'It uses brass cages instead of stamped steel.',
        'Its outer diameter is too small to dissipate heat.',
        'Its 2RS rubber seals blow out under radial deflection.',
      ],
      correctIndex: 0,
      explanation:
        'Thrust ball bearings have flat washers perpendicular to the shaft axis (α = 90°). Radial force pushes the balls sideways out of the shallow raceway grooves.',
    },
    {
      id: 'q2',
      question:
        'Why is an NU205 cylindrical roller bearing preferred on the non-locating (free) end of a long hot electric motor shaft?',
      options: [
        'The ribless inner ring allows the shaft to expand and float axially without binding the bearing.',
        'It absorbs bidirectional high axial thrust loads.',
        'It tolerates up to 5° of housing misalignment.',
        'It uses point contact for minimal radial capacity.',
      ],
      correctIndex: 0,
      explanation:
        'NU-type cylindrical roller bearings have two ribs on the outer ring and zero ribs on the inner ring, allowing smooth internal axial thermal expansion.',
    },
    {
      id: 'q3',
      question:
        'When mounting a single 7205 (40° Angular Contact) or 30205 (Tapered Roller) bearing on a shaft, why are they almost always installed in matched pairs (Back-to-Back DB or Face-to-Face DF)?',
      options: [
        'A single angled bearing only resists axial thrust in one direction and generates induced radial-to-axial force that must be opposed by a mirrored partner.',
        'Because single bearings do not fit standard 25 mm shafts without an adapter sleeve.',
        'To convert line contact into lower-friction point contact.',
        'To eliminate the need for grease or oil lubrication.',
      ],
      correctIndex: 0,
      explanation:
        'Single-row 7205 and 30205 bearings are asymmetric: they handle heavy thrust in one direction only and require an opposing paired bearing to locate the shaft in both directions.',
    },
    {
      id: 'q4',
      question:
        'Which bearing enclosure offers the best protection against muddy water washdown on a conveyor, even though it reduces maximum RPM?',
      options: [
        '2RS double contact nitrile rubber seals',
        '2Z double non-contact metal shields',
        'Open unsealed bearing',
        'Single-shield Z bearing',
      ],
      correctIndex: 0,
      explanation:
        '2RS rubber contact lips press directly against the inner ring shoulder to seal out water, slurry, and fine dust at the expense of some frictional drag.',
    },
    {
      id: 'q5',
      question:
        'Which bearing type can handle heavy shock loads AND tolerate ±1.5° of shaft misalignment from structural frame deflection?',
      options: [
        '22205 Spherical Roller Bearing',
        '6205 Deep Groove Ball Bearing',
        'NU205 Cylindrical Roller Bearing',
        '51105 Thrust Ball Bearing',
      ],
      correctIndex: 0,
      explanation:
        'Spherical roller bearings combine high-capacity barrel rollers with a spherically ground outer raceway that naturally pivots to accommodate frame misalignment.',
    },
    {
      id: 'q6',
      question:
        'A technician needs to mount a 25 mm conveyor tail-pulley shaft quickly onto a flat steel channel frame without machining a precision bearing bore housing. Which unit is ideal?',
      options: [
        'UCP205 Pillow Block Bearing Unit',
        '51105 Thrust Ball Bearing',
        '7205 Angular Contact Ball Bearing',
        'Open 30205 Tapered Roller Cup & Cone',
      ],
      correctIndex: 0,
      explanation:
        'A UCP205 pillow block pre-packages a sealed UC205 spherical-OD insert bearing inside a bolt-down cast-iron housing with set-screw shaft locking.',
    },
  ],
};
