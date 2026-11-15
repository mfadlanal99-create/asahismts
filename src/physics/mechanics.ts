/**
 * Mechanical Engineering Physics Engine: Solid Mechanics, Machine Elements,
 * Stress Analysis, Beam Bending, Fastening, Gearing, and Power Transmission
 * MechLab Physics Engine
 */

import { degToRad } from './constants.ts';

// ============================================================================
// 1. Uniaxial Stress, Strain, Hooke's Law & Plasticity
// ============================================================================

/**
 * Engineering stress σ = F / A₀
 * @param forceN Tensile or compressive axial load [N]
 * @param originalAreaM2 Original cross-sectional area [m²]
 * @returns Engineering stress [Pa]
 */
export function engineeringStress(forceN: number, originalAreaM2: number): number {
  if (originalAreaM2 <= 0) throw new Error('Original area must be strictly positive');
  return forceN / originalAreaM2;
}

/**
 * Normal axial stress: σ = F / A
 * @param forceN Axial force F [N]
 * @param areaM2 Cross-sectional area A [m²]
 * @returns Normal axial stress [Pa]
 */
export function axialStress(forceN: number, areaM2: number): number {
  if (areaM2 <= 0) throw new Error('Area must be strictly positive');
  return forceN / areaM2;
}

/**
 * Engineering strain ε = ΔL / L₀
 * @param elongationM Change in length [m]
 * @param originalLengthM Original gauge length [m]
 * @returns Dimensionless engineering strain [-]
 */
export function engineeringStrain(elongationM: number, originalLengthM: number): number {
  if (originalLengthM <= 0) throw new Error('Original length must be strictly positive');
  return elongationM / originalLengthM;
}

/**
 * Linear elastic Hooke's law: σ = E · ε
 * @param strain Dimensionless engineering strain [-]
 * @param youngsModulusPa Modulus of Elasticity [Pa]
 * @returns Elastic stress [Pa]
 */
export function hookesLawStress(strain: number, youngsModulusPa: number): number {
  return youngsModulusPa * strain;
}

/**
 * True strain: ε_true = ln(1 + ε_eng)
 * Valid up to the onset of localized necking (uniform plastic deformation).
 */
export function trueStrain(engineeringStrainVal: number): number {
  if (engineeringStrainVal <= -1) throw new Error('Engineering strain cannot be ≤ -1');
  return Math.log(1 + engineeringStrainVal);
}

/**
 * True stress (pre-necking volume conservation): σ_true = σ_eng · (1 + ε_eng)
 */
export function trueStress(engineeringStressPa: number, engineeringStrainVal: number): number {
  return engineeringStressPa * (1 + engineeringStrainVal);
}

/**
 * Hollomon power-law strain hardening equation: σ_true = K · (ε_true)^n
 * @param trueStrainVal Plastic true strain [-]
 * @param strengthCoefficientK Strength coefficient K [Pa]
 * @param strainHardeningExponentN Strain hardening exponent n (typically 0.1 to 0.5) [-]
 * @returns Flow stress [Pa]
 */
export function hollomonFlowStress(
  trueStrainVal: number,
  strengthCoefficientK: number,
  strainHardeningExponentN: number
): number {
  if (trueStrainVal <= 0) return 0;
  return strengthCoefficientK * Math.pow(trueStrainVal, strainHardeningExponentN);
}

/**
 * Considère criterion for diffuse necking:
 * At the onset of necking (maximum load / UTS), dσ_true/dε_true = σ_true.
 * Under Hollomon hardening (σ = K·ε^n), necking occurs precisely at ε_true = n.
 * @param strainHardeningExponentN Hardening exponent n [-]
 * @returns True strain at ultimate tensile strength (UTS) [-]
 */
export function neckingTrueStrainConsidere(strainHardeningExponentN: number): number {
  return strainHardeningExponentN;
}

/**
 * Modulus of Resilience: Ur = σ_y² / (2E)
 * Maximum elastic energy stored per unit volume [J/m³]
 * @param yieldStrengthPa Yield strength [Pa]
 * @param youngsModulusPa Young's modulus [Pa]
 */
export function modulusOfResilience(yieldStrengthPa: number, youngsModulusPa: number): number {
  if (youngsModulusPa <= 0) throw new Error('Youngs modulus must be positive');
  return (yieldStrengthPa * yieldStrengthPa) / (2 * youngsModulusPa);
}

// ============================================================================
// 2. Beam Mechanics & Euler–Bernoulli Bending
// ============================================================================

/**
 * Flexural bending normal stress: σ = M · y / I
 * @param momentNm Internal bending moment [N·m]
 * @param distanceToNeutralAxisM Perpendicular distance y from neutral axis [m]
 * @param momentOfInertiaM4 Second moment of area I_x [m⁴]
 * @returns Normal stress [Pa]
 */
export function beamBendingStress(
  momentNm: number,
  distanceToNeutralAxisM: number,
  momentOfInertiaM4: number
): number {
  if (momentOfInertiaM4 <= 0) throw new Error('Moment of inertia must be strictly positive');
  return (momentNm * distanceToNeutralAxisM) / momentOfInertiaM4;
}

/**
 * Jourawski transverse shear stress formula: τ = V · Q / (I · b)
 * @param shearForceN Transverse shear force V [N]
 * @param firstMomentOfAreaM3 First moment of area Q about neutral axis [m³]
 * @param momentOfInertiaM4 Second moment of area I [m⁴]
 * @param sectionWidthM Beam width b at the evaluated cut [m]
 * @returns Transverse shear stress [Pa]
 */
export function transverseShearStress(
  shearForceN: number,
  firstMomentOfAreaM3: number,
  momentOfInertiaM4: number,
  sectionWidthM: number
): number {
  if (momentOfInertiaM4 <= 0 || sectionWidthM <= 0) {
    throw new Error('Moment of inertia and width must be strictly positive');
  }
  return (shearForceN * firstMomentOfAreaM3) / (momentOfInertiaM4 * sectionWidthM);
}

/**
 * Standard cross-section geometric properties
 */
export function rectangularSectionProps(widthM: number, heightM: number) {
  const area = widthM * heightM;
  const momentOfInertia = (widthM * Math.pow(heightM, 3)) / 12;
  const sectionModulus = (widthM * Math.pow(heightM, 2)) / 6;
  const maxShearStressFactor = 1.5; // τ_max = 1.5 * V / A
  return { area, momentOfInertia, sectionModulus, maxShearStressFactor };
}

export function circularSectionProps(diameterM: number) {
  const r = diameterM / 2;
  const area = Math.PI * r * r;
  const momentOfInertia = (Math.PI * Math.pow(diameterM, 4)) / 64;
  const sectionModulus = (Math.PI * Math.pow(diameterM, 3)) / 32;
  const maxShearStressFactor = 4 / 3; // τ_max = (4/3) * V / A
  return { area, momentOfInertia, sectionModulus, maxShearStressFactor };
}

/**
 * Maximum deflection of simply supported beam with center point load P:
 * δ_max = P · L³ / (48 · E · I)
 */
export function deflectionSimplySupportedCenterLoad(
  loadN: number,
  lengthM: number,
  youngsModulusPa: number,
  momentOfInertiaM4: number
): number {
  return (loadN * Math.pow(lengthM, 3)) / (48 * youngsModulusPa * momentOfInertiaM4);
}

/**
 * Maximum deflection of simply supported beam under uniform distributed load w [N/m]:
 * δ_max = 5 · w · L⁴ / (384 · E · I)
 */
export function deflectionSimplySupportedUdl(
  udlNpm: number,
  lengthM: number,
  youngsModulusPa: number,
  momentOfInertiaM4: number
): number {
  return (5 * udlNpm * Math.pow(lengthM, 4)) / (384 * youngsModulusPa * momentOfInertiaM4);
}

/**
 * Tip deflection of cantilever beam with end load P:
 * δ_tip = P · L³ / (3 · E · I)
 */
export function deflectionCantileverEndLoad(
  loadN: number,
  lengthM: number,
  youngsModulusPa: number,
  momentOfInertiaM4: number
): number {
  return (loadN * Math.pow(lengthM, 3)) / (3 * youngsModulusPa * momentOfInertiaM4);
}

// ============================================================================
// 3. Weld Mechanics & AWS Standard Vector Stress Analysis
// ============================================================================

/**
 * Theoretical throat dimension of an equal-leg 45° fillet weld:
 * a = s · sin(45°) = s · (√2 / 2) ≈ 0.7071 s
 * @param legSizeM Fillet weld leg size s [m]
 * @returns Throat thickness a [m]
 */
export function filletWeldThroat(legSizeM: number): number {
  return legSizeM * (Math.SQRT2 / 2);
}

/**
 * Effective weld area: A_w = a · L_eff
 * @param throatM Throat thickness [m]
 * @param effectiveLengthM Total effective weld length [m]
 */
export function weldEffectiveArea(throatM: number, effectiveLengthM: number): number {
  return throatM * effectiveLengthM;
}

/**
 * Vector shear resultant stress under orthogonal direct and torsional shear:
 * τ_res = √(τ_direct² + τ_torsion²)
 */
export function weldVectorResultantShear(directShearPa: number, torsionalShearPa: number): number {
  return Math.hypot(directShearPa, torsionalShearPa);
}

/**
 * Von Mises equivalent stress on weld throat (Eurocode 3 EN 1993-1-8):
 * σ_vm = √(σ_perp² + 3 · (τ_perp² + τ_parallel²))
 */
export function weldVonMisesStress(
  normalPerpPa: number,
  shearPerpPa: number,
  shearParallelPa: number
): number {
  return Math.sqrt(
    Math.pow(normalPerpPa, 2) + 3 * (Math.pow(shearPerpPa, 2) + Math.pow(shearParallelPa, 2))
  );
}

// ============================================================================
// 4. Lamé Thick-Wall Cylinders & Interference Shrink Fits
// ============================================================================

/**
 * Lamé thick cylinder shrink-fit interface contact pressure:
 * Calculates contact pressure p_c between an inner solid/hollow shaft and an outer hub
 * due to diametral interference δ.
 *
 * @param diametralInterferenceM Total radial/diametral interference [m]
 * @param nominalRadiusM Nominal interface radius R [m]
 * @param shaftInnerRadiusM Shaft bore radius R_i (0 for solid shaft) [m]
 * @param hubOuterRadiusM Outer hub radius R_o [m]
 * @param shaftEPa Young's modulus of shaft material [Pa]
 * @param shaftNu Poisson's ratio of shaft material [-]
 * @param hubEPa Young's modulus of hub material [Pa]
 * @param hubNu Poisson's ratio of hub material [-]
 * @returns Interface contact pressure p_c [Pa]
 */
export function shrinkFitContactPressure(
  diametralInterferenceM: number,
  nominalRadiusM: number,
  shaftInnerRadiusM: number,
  hubOuterRadiusM: number,
  shaftEPa: number,
  shaftNu: number,
  hubEPa: number,
  hubNu: number
): number {
  const R = nominalRadiusM;
  const Ri = shaftInnerRadiusM;
  const Ro = hubOuterRadiusM;

  // Hub compliance term: [(Ro² + R²) / (Ro² - R²) + ν_h] / E_h
  const hubGeom = (Ro * Ro + R * R) / (Ro * Ro - R * R);
  const hubTerm = (hubGeom + hubNu) / hubEPa;

  // Shaft compliance term: [(R² + Ri²) / (R² - Ri²) - ν_s] / E_s
  // For solid shaft (Ri = 0), geom = 1, so (1 - ν_s) / E_s
  const shaftGeom = Ri === 0 ? 1.0 : (R * R + Ri * Ri) / (R * R - Ri * Ri);
  const shaftTerm = (shaftGeom - shaftNu) / shaftEPa;

  // radial interference = δ / 2
  const radialInterference = diametralInterferenceM / 2;
  const denominator = R * (hubTerm + shaftTerm);

  if (denominator <= 0) throw new Error('Invalid shrink-fit geometry or compliance');
  return radialInterference / denominator;
}

/**
 * Maximum transmissible torque of an interference shrink fit:
 * T = 2 · π · μ · L · R² · p_c
 * @param contactPressurePa Interface contact pressure p_c [Pa]
 * @param interfaceRadiusM Nominal interface radius R [m]
 * @param engagementLengthM Axial engagement length L [m]
 * @param frictionCoeff Static coefficient of friction μ [-]
 * @returns Torque capacity [N·m]
 */
export function shrinkFitTorqueCapacity(
  contactPressurePa: number,
  interfaceRadiusM: number,
  engagementLengthM: number,
  frictionCoeff: number
): number {
  const normalForce = 2 * Math.PI * interfaceRadiusM * engagementLengthM * contactPressurePa;
  return frictionCoeff * normalForce * interfaceRadiusM;
}

// ============================================================================
// 5. Timoshenko Bimetallic Thermostat Strip Curvature
// ============================================================================

/**
 * Timoshenko classical bimetallic strip curvature (1925):
 * κ = 1 / ρ = 6 · (α₁ - α₂) · ΔT · (1 + m)² / { h · [3(1 + m)² + (1 + m·n)(m² + 1/(m·n))] }
 * where:
 *   m = t₁ / t₂ (ratio of thicknesses)
 *   n = E₁ / E₂ (ratio of Young's moduli)
 *   h = t₁ + t₂ (total thickness)
 *
 * @param alpha1 Thermal expansion coefficient of layer 1 [1/K]
 * @param alpha2 Thermal expansion coefficient of layer 2 [1/K]
 * @param deltaTC Temperature change from reference [K] or [°C]
 * @param t1M Thickness of layer 1 [m]
 * @param t2M Thickness of layer 2 [m]
 * @param e1Pa Young's modulus of layer 1 [Pa]
 * @param e2Pa Young's modulus of layer 2 [Pa]
 * @returns Strip curvature κ [1/m]
 */
export function timoshenkoBimetalCurvature(
  alpha1: number,
  alpha2: number,
  deltaTC: number,
  t1M: number,
  t2M: number,
  e1Pa: number,
  e2Pa: number
): number {
  const m = t1M / t2M;
  const n = e1Pa / e2Pa;
  const h = t1M + t2M;

  const numerator = 6 * (alpha1 - alpha2) * deltaTC * Math.pow(1 + m, 2);
  const denominator =
    h * (3 * Math.pow(1 + m, 2) + (1 + m * n) * (m * m + 1 / (m * n)));

  return numerator / denominator;
}

/**
 * Tip deflection of an end-clamped bimetallic cantilever strip:
 * δ_tip ≈ 0.5 · κ · L²
 * @param curvature Curvature κ [1/m]
 * @param lengthM Free strip length L [m]
 * @returns Tip deflection [m]
 */
export function bimetalTipDeflection(curvature: number, lengthM: number): number {
  return 0.5 * curvature * lengthM * lengthM;
}

// ============================================================================
// 6. Fastening & Threaded Joint Mechanics (Motosh & Shigley)
// ============================================================================

/**
 * Empirical bolt tightening torque-preload formula:
 * T = K · F_i · d
 * @param nominalDiameterM Nominal bolt major diameter d [m]
 * @param clampLoadN Desired bolt preload / clamp load F_i [N]
 * @param torqueCoefficientK Dimensionless torque factor K (typically 0.15 - 0.20) [-]
 * @returns Tightening torque [N·m]
 */
export function boltTighteningTorqueK(
  nominalDiameterM: number,
  clampLoadN: number,
  torqueCoefficientK = 0.20
): number {
  return torqueCoefficientK * clampLoadN * nominalDiameterM;
}

/**
 * Exact Motosh analytical bolt tightening torque equation:
 * T = F_i · [ (p / (2π)) + (μ_t · d₂ / (2 · cos α_n)) + (μ_c · d_c / 2) ]
 *
 * @param preloadN Bolt axial clamp preload F_i [N]
 * @param pitchM Thread pitch p [m]
 * @param pitchDiameterM Thread pitch diameter d₂ [m]
 * @param flankAngleDeg Half thread flank angle (30° for standard 60° metric thread) [deg]
 * @param threadFrictionCoeff Thread friction coefficient μ_t [-]
 * @param underheadFrictionCoeff Under-head or nut collar friction coefficient μ_c [-]
 * @param underheadEffectiveDiameterM Mean collar contact diameter d_c [m]
 * @returns Detailed breakdown of torque components [N·m]
 */
export function motoshBoltTorque(
  preloadN: number,
  pitchM: number,
  pitchDiameterM: number,
  flankAngleDeg = 30,
  threadFrictionCoeff = 0.14,
  underheadFrictionCoeff = 0.14,
  underheadEffectiveDiameterM: number
) {
  const alphaNRad = degToRad(flankAngleDeg);

  // 1. Thread lead torque (useful tensioning work)
  const tPitch = preloadN * (pitchM / (2 * Math.PI));

  // 2. Thread friction torque
  const tThreadFriction = preloadN * ((threadFrictionCoeff * pitchDiameterM) / (2 * Math.cos(alphaNRad)));

  // 3. Underhead / collar friction torque
  const tCollarFriction = preloadN * ((underheadFrictionCoeff * underheadEffectiveDiameterM) / 2);

  const tTotal = tPitch + tThreadFriction + tCollarFriction;
  const torqueCoeffK = tTotal / (preloadN * (pitchDiameterM * 1.05)); // Equivalent K approx

  return {
    torqueTotalNm: tTotal,
    torquePitchNm: tPitch,
    torqueThreadFrictionNm: tThreadFriction,
    torqueCollarFrictionNm: tCollarFriction,
    torqueCoefficientK: torqueCoeffK,
  };
}

// ============================================================================
// 7. Gearing & AGMA 2001-D04 / Lewis Bending & Contact Stresses
// ============================================================================

/**
 * Tangential tooth driving force from transmitted power:
 * W_t = (60000 · P_kW) / (π · d · n) = P_W / v_t
 * @param powerWatts Transmitted mechanical power [W]
 * @param pitchDiameterM Pitch circle diameter [m]
 * @param rpm Rotational speed [rev/min]
 * @returns Tangential driving force W_t [N]
 */
export function gearTangentialForce(
  powerWatts: number,
  pitchDiameterM: number,
  rpm: number
): number {
  if (pitchDiameterM <= 0 || rpm <= 0) return 0;
  const pitchLineVelocity = (Math.PI * pitchDiameterM * rpm) / 60;
  return powerWatts / pitchLineVelocity;
}

/**
 * Lewis gear tooth bending stress:
 * σ_b = W_t / (F · m · Y)
 * @param tangentialForceN Tangential load W_t [N]
 * @param faceWidthM Gear face width F [m]
 * @param moduleM Gear module m [m]
 * @param lewisFormFactorY Lewis tooth geometry form factor Y [-]
 * @returns Lewis bending stress [Pa]
 */
export function lewisGearBendingStress(
  tangentialForceN: number,
  faceWidthM: number,
  moduleM: number,
  lewisFormFactorY: number
): number {
  return tangentialForceN / (faceWidthM * moduleM * lewisFormFactorY);
}

/**
 * Hertzian elastic contact coefficient Z_E for gear pair contact stress:
 * Z_E = √( 1 / [ π · ( (1 - ν₁²)/E₁ + (1 - ν₂²)/E₂ ) ] ) [√Pa]
 */
export function gearElasticCoefficientZE(
  e1Pa: number,
  nu1: number,
  e2Pa: number,
  nu2: number
): number {
  const compliance = ((1 - nu1 * nu1) / e1Pa) + ((1 - nu2 * nu2) / e2Pa);
  return Math.sqrt(1 / (Math.PI * compliance));
}

// ============================================================================
// 8. Belt & Friction Drive Mechanics (Euler–Eytelwein)
// ============================================================================

/**
 * Euler–Eytelwein (Capstan) belt friction tension ratio:
 * For flat belt: T₁ / T₂ = exp(μ · θ)
 * For V-belt with groove included angle 2β: T₁ / T₂ = exp(μ · θ / sin(β))
 *
 * @param frictionCoeff Friction coefficient μ [-]
 * @param wrapAngleRad Contact wrap angle θ [rad]
 * @param grooveHalfAngleRad Half groove wedge angle β [rad] (π/2 for flat belts)
 * @returns Limiting tension ratio T₁ / T₂ [-]
 */
export function eulerEytelweinTensionRatio(
  frictionCoeff: number,
  wrapAngleRad: number,
  grooveHalfAngleRad = Math.PI / 2
): number {
  const effectiveFriction = frictionCoeff / Math.sin(grooveHalfAngleRad);
  return Math.exp(effectiveFriction * wrapAngleRad);
}

/**
 * Centrifugal tension in a high-speed flexible belt or chain:
 * F_c = m' · v²
 * @param linearMassDensityKgPerM Mass per unit length m' [kg/m]
 * @param velocityMps Linear travel speed v [m/s]
 * @returns Centrifugal tension force [N]
 */
export function beltCentrifugalTension(
  linearMassDensityKgPerM: number,
  velocityMps: number
): number {
  return linearMassDensityKgPerM * velocityMps * velocityMps;
}

/**
 * Roller chain chordal speed variation (polygonal effect):
 * Δv / v_mean = 1 - cos(π / z)
 * @param sprocketTeeth Number of teeth z [-]
 * @returns Fractional speed pulsation amplitude [-]
 */
export function chainChordalSpeedVariation(sprocketTeeth: number): number {
  if (sprocketTeeth < 3) return 0;
  return 1 - Math.cos(Math.PI / sprocketTeeth);
}
