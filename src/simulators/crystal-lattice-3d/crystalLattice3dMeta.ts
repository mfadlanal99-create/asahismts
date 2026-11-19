import type { SimulatorMeta } from '../../types/simulator';
import './crystalLattice3dI18n';

export const crystalLattice3dMeta: SimulatorMeta = {
  id: 'crystal-lattice-3d',
  title: '3D Crystal Lattice & Bravais Structures Lab',
  shortTitle: '3D Crystal Lattices',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Interactive 360° 3D crystallography simulator covering all 14 Bravais lattices across all 7 crystal systems (Cubic, Tetragonal, Orthorhombic, Hexagonal, Rhombohedral, Monoclinic, Triclinic) plus HCP Full Prism, Diamond Cubic, NaCl B1, and Ordered B2 intermetallics. Inspect 2×2×2 supercells, hard-sphere APF packing, Miller (hkl) slip planes, interstitial voids, and coordination cages.',
  iconName: 'CircleDot',
  accentColor: 'violet',
  explore: [
    {
      title: 'The 7 Crystal Systems & 14 Bravais Lattices',
      summary:
        'A crystalline solid repeats identically in 3D space along three basis vectors (a, b, c) with interaxial angles (α, β, γ). Auguste Bravais proved mathematically that only 14 unique space-filling point lattices (P Primitive, I Body-Centered, F Face-Centered, C Base-Centered) exist across the 7 crystal families—ranging from maximum-symmetry Cubic (a = b = c, 90°) to fully oblique Triclinic (a ≠ b ≠ c, α ≠ β ≠ γ).',
      equations: [
        {
          label: 'Cubic Unit Cell Volume & Face/Body Diagonals',
          formula: 'V_C = a³  |  d_face = √2·a  |  d_body = √3·a',
          note: 'In FCC, atoms touch along the face diagonal (4R = √2·a). In BCC, atoms touch along the body diagonal (4R = √3·a).',
        },
        {
          label: 'General Triclinic Unit Cell Volume',
          formula: 'V_C = a·b·c·√(1 − cos²α − cos²β − cos²γ + 2·cosα·cosβ·cosγ)',
          note: 'Reduces cleanly to V_C = a·b·c for orthogonal systems and V_C = (√3/2)·a²·c for a primitive hexagonal prism.',
        },
      ],
      workedExample: {
        title: 'Theoretical Density of BCC α-Ferrite Iron',
        given: [
          'α-Fe (BCC) atomic radius R = 0.1241 nm = 1.241 × 10⁻⁸ cm',
          'Molar mass A_Fe = 55.845 g/mol, Avogadro constant N_A = 6.022 × 10²³ mol⁻¹',
        ],
        steps: [
          'Effective atoms per BCC unit cell: n = (8 × 1/8) + 1 = 2 atoms',
          'Lattice parameter along body diagonal: a = 4R / √3 = 4(1.241 × 10⁻⁸) / 1.7321 = 2.866 × 10⁻⁸ cm',
          'Unit cell volume: V_C = a³ = (2.866 × 10⁻⁸)³ = 2.354 × 10⁻²³ cm³',
          'Theoretical density ρ = (n · A_Fe) / (V_C · N_A) = (2 × 55.845) / (2.354 × 10⁻²³ × 6.022 × 10²³)',
        ],
        answer: 'ρ = 7.88 g/cm³ (matches measured structural steel ferrite 7.87 g/cm³)',
      },
    },
    {
      title: 'Atomic Packing Factor (APF) & Close-Packed Stackings',
      summary:
        'Atomic Packing Factor measures the fraction of unit cell volume occupied by hard-sphere atoms. Both Face-Centered Cubic (FCC, ABCABC stacking along {111}) and Hexagonal Close-Packed (HCP, ABAB stacking along {0001}, ideal c/a = √(8/3) ≈ 1.633) reach the theoretical hard-sphere Kepler limit of APF = 74.0% and Coordination Number 12. Body-Centered Cubic (BCC) reaches 68.0% with larger tetrahedral voids, while covalent sp³ Diamond Cubic sits openly at 34.0%.',
      equations: [
        {
          label: 'Atomic Packing Factor Definition',
          formula: 'APF = (n · (4/3)·π·R³) / V_cell',
          note: 'SC = π/6 (0.524), BCC = √3·π/8 (0.680), FCC/HCP = √2·π/6 (0.740), Diamond = π√3/16 (0.340).',
        },
        {
          label: 'Theoretical Crystal Density',
          formula: 'ρ = (n · A) / (V_C · N_A)  [g/cm³]',
          note: 'Carbon dissolves interstitially in BCC/BCT octahedral pockets to harden steel into BCT Martensite.',
        },
      ],
    },
    {
      title: 'Slip Systems, Miller Indices & Mechanical Ductility',
      summary:
        'Plastic deformation proceeds by dislocation glide along closest-packed planes and directions—governed by Schmid’s Law (τ_R = σ cosφ cosλ). FCC metals (Al, Cu, SS304/316 Ni alloys) possess 12 easily activated {111}⟨110⟩ slip systems and maintain toughness even in cryogenic liquid nitrogen service. BCC steels have 48 non-close-packed slip systems requiring higher thermal energy to overcome Peierls barriers, causing a sharp Ductile-to-Brittle Transition Temperature (DBTT). HCP metals (Ti, Mg) have only 3 basal slip systems at ambient temperature, explaining pronounced anisotropy and twinning.',
      equations: [
        {
          label: 'Schmid’s Critical Resolved Shear Stress',
          formula: 'τ_R = σ · cos(φ) · cos(λ)',
          note: 'Yielding initiates when τ_R reaches the lattice critical resolved shear stress τ_crss (maximum Schmid factor = 0.50 at φ = λ = 45°).',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'cl3d-p1',
      prompt:
        'Copper (Cu) crystallizes in Face-Centered Cubic (FCC) with atomic radius R = 0.1278 nm. Using a = 2√2·R, calculate the Atomic Packing Factor (APF) as a percentage (%) to 1 decimal place.',
      hint: 'APF = [4 × (4/3)πR³] / (2√2·R)³ = π√2 / 6. Multiply by 100 for percentage.',
      targetValue: 74.0,
      unit: '%',
      tolerance: 0.4,
      solutionSteps: [
        'For FCC, n = 4 atoms/cell and a = 2√2 · R.',
        'V_atoms = 4 × (4/3)πR³ = (16/3)πR³.',
        'V_cell = a³ = (2√2 · R)³ = 16√2 · R³.',
        'APF = [(16/3)π] / [16√2] = π / (3√2) ≈ 0.74048 = 74.0%.',
      ],
    },
    {
      id: 'cl3d-p2',
      prompt:
        'Calculate the theoretical density ρ (in g/cm³) of BCC Tungsten (W) given R = 0.137 nm (1.37 × 10⁻⁸ cm), molar mass A = 183.84 g/mol, n = 2, and N_A = 6.022 × 10²³ mol⁻¹.',
      hint: 'First find a = 4R/√3 = 3.164 × 10⁻⁸ cm, then V_C = a³ = 3.167 × 10⁻²³ cm³, then ρ = (n·A)/(V_C·N_A).',
      targetValue: 19.28,
      unit: 'g/cm³',
      tolerance: 0.4,
      solutionSteps: [
        'a = 4 × (1.37 × 10⁻⁸ cm) / √3 = 3.1639 × 10⁻⁸ cm.',
        'V_C = a³ = 3.1671 × 10⁻²³ cm³.',
        'ρ = (2 × 183.84) / (3.1671 × 10⁻²³ × 6.022 × 10²³) = 367.68 / 19.072 = 19.28 g/cm³.',
      ],
    },
    {
      id: 'cl3d-p3',
      prompt:
        'How many effective whole atoms belong to a single 6-sided Hexagonal Close-Packed (HCP) full unit prism (12 corner vertices shared among 6 prisms, 2 basal center atoms shared between 2 prisms, and 3 interior B-layer atoms)?',
      hint: 'N_eff = (12 × 1/6) + (2 × 1/2) + 3.',
      targetValue: 6,
      unit: 'atoms',
      tolerance: 0.1,
      solutionSteps: [
        '12 corner sites × (1/6 share per corner) = 2 atoms.',
        '2 top/bottom basal face center sites × (1/2 share) = 1 atom.',
        '3 completely enclosed mid-plane B-layer atoms × 1 = 3 atoms.',
        'Total per full hexagonal prism = 2 + 1 + 3 = 6 atoms.',
      ],
    },
  ],
  quiz: [
    {
      id: 'cl3d-q1',
      question:
        'Which Bravais lattice forms when FCC Austenite is rapidly quenched in high-carbon tool steel, trapping Carbon atoms along the z-octahedral sites?',
      options: [
        'Simple Cubic (cP)',
        'Body-Centered Tetragonal (BCT · tI)',
        'Hexagonal Close-Packed (HCP)',
        'Triclinic (aP)',
      ],
      correctIndex: 1,
      explanation:
        'Diffusionless quenching locks supersaturated Carbon in c-axis octahedral voids, stretching BCC into high-hardness Body-Centered Tetragonal (BCT) Martensite.',
    },
    {
      id: 'cl3d-q2',
      question:
        'Why do FCC metals like 304/316 stainless steel and aluminum retain high ductility at cryogenic temperatures where BCC carbon steels turn brittle?',
      options: [
        'FCC has lower density and fewer slip systems than BCC',
        'FCC contains 12 close-packed {111}⟨110⟩ slip systems with very low Peierls friction',
        'FCC atoms do not share electrons linearly',
        'FCC possesses only covalent sp³ bonding',
      ],
      correctIndex: 1,
      explanation:
        'Close-packed {111} planes in FCC provide 12 low-friction slip systems that glide easily even near liquid helium/nitrogen temperatures, eliminating a sharp DBTT.',
    },
    {
      id: 'cl3d-q3',
      question:
        'How many unique 3D Bravais space lattices exist across all 7 crystal systems?',
      options: ['7', '12', '14', '32'],
      correctIndex: 2,
      explanation:
        'Across the 7 crystal systems (Cubic, Tetragonal, Orthorhombic, Hexagonal, Rhombohedral, Monoclinic, Triclinic), exactly 14 distinct Bravais lattices pack 3D space.',
    },
    {
      id: 'cl3d-q4',
      question:
        'What is the ideal c/a axial height ratio for hard spheres packing in a Hexagonal Close-Packed (HCP) unit prism?',
      options: ['1.000', '1.414 (√2)', '1.633 (√(8/3))', '1.732 (√3)'],
      correctIndex: 2,
      explanation:
        'Pure rigid-sphere geometry in ABAB stacking sets the ideal c/a ratio of HCP to √(8/3) ≈ 1.633, giving a 74.0% APF matching FCC.',
    },
  ],
};
