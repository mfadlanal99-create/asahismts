/**
 * Mechanical Engineering Physics Engine: Rotordynamics, Machine Vibration,
 * Rolling Element Bearing Fatigue Life (ISO 281), Rigging Mechanics, and Shaft Alignment
 * MechLab Physics Engine
 */

import { degToRad, radToDeg } from './constants.ts';

// ============================================================================
// 1. Single-Degree-of-Freedom Jeffcott Rotordynamics & Vibration
// ============================================================================

/**
 * Natural angular frequency of 1-DOF Jeffcott rotor:
 * ω_n = √(k / m)
 * @param stiffnessNPerM Rotor shaft lateral stiffness k [N/m]
 * @param massKg Rotor mass m [kg]
 * @returns Undamped natural frequency ω_n [rad/s]
 */
export function naturalFrequencyOmegaN(stiffnessNPerM: number, massKg: number): number {
  if (stiffnessNPerM <= 0 || massKg <= 0) {
    throw new Error('Stiffness and mass must be strictly positive');
  }
  return Math.sqrt(stiffnessNPerM / massKg);
}

/**
 * Critical rotational speed in RPM:
 * N_c = (60 / (2π)) · √(k / m)
 */
export function criticalSpeedRpm(stiffnessNPerM: number, massKg: number): number {
  const omegaN = naturalFrequencyOmegaN(stiffnessNPerM, massKg);
  return (omegaN * 60) / (2 * Math.PI);
}

/**
 * Critical damping coefficient:
 * c_c = 2 · √(k · m) = 2 · m · ω_n
 * @param stiffnessNPerM Stiffness k [N/m]
 * @param massKg Mass m [kg]
 * @returns Critical damping coefficient [N·s/m]
 */
export function criticalDampingCoeff(stiffnessNPerM: number, massKg: number): number {
  return 2 * Math.sqrt(stiffnessNPerM * massKg);
}

/**
 * Damping ratio ζ:
 * ζ = c / c_c = c / (2 · √(k · m))
 */
export function dampingRatio(dampingNsm: number, stiffnessNPerM: number, massKg: number): number {
  return dampingNsm / criticalDampingCoeff(stiffnessNPerM, massKg);
}

/**
 * Dynamic magnification factor M(r, ζ) for rotating mass unbalance excitation:
 * M(r, ζ) = r² / √[ (1 - r²)² + (2 · ζ · r)² ]
 * where r = ω / ω_n is the frequency ratio.
 *
 * @param frequencyRatio Dimensionless frequency ratio r = ω / ω_n [-]
 * @param dampingRatioVal Viscous damping ratio ζ [-]
 * @returns Dynamic unbalance amplification factor [-]
 */
export function unbalanceMagnificationFactor(
  frequencyRatio: number,
  dampingRatioVal: number
): number {
  const r = frequencyRatio;
  const z = dampingRatioVal;
  const denominator = Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * z * r, 2));
  if (denominator <= 0) return Infinity;
  return (r * r) / denominator;
}

/**
 * Phase lag angle for rotating mass unbalance excitation:
 * φ = atan2(2·ζ·r, 1 - r²)
 * @param frequencyRatio Dimensionless frequency ratio r = ω / ω_n [-]
 * @param dampingRatioVal Viscous damping ratio ζ [-]
 * @returns Phase lag angle in radians [0, π] or [0, 2π)
 */
export function unbalancePhaseLag(
  frequencyRatio: number,
  dampingRatioVal: number
): number {
  const phi = Math.atan2(2 * dampingRatioVal * frequencyRatio, 1 - frequencyRatio * frequencyRatio);
  return phi < 0 ? phi + 2 * Math.PI : phi;
}

/**
 * Dynamic vibration response of a Jeffcott rotor with mass eccentricity e:
 * X(ω) = e · M(r, ζ)
 *
 * @param massEccentricityM Eccentricity e = m_unbalance · r_unbalance / m_total [m]
 * @param operatingOmegaRadS Rotational angular velocity ω [rad/s]
 * @param naturalOmegaRadS Undamped critical angular velocity ω_n [rad/s]
 * @param dampingRatioVal Damping ratio ζ [-]
 * @returns Peak displacement [m], velocity [m/s], acceleration [m/s²], and phase lag [deg]
 */
export function jeffcottRotorResponse(
  massEccentricityM: number,
  operatingOmegaRadS: number,
  naturalOmegaRadS: number,
  dampingRatioVal: number
) {
  const r = operatingOmegaRadS / naturalOmegaRadS;
  const mag = unbalanceMagnificationFactor(r, dampingRatioVal);
  const displacementAmplitudeM = massEccentricityM * mag;
  const velocityAmplitudeMps = operatingOmegaRadS * displacementAmplitudeM;
  const accelerationAmplitudeMps2 = Math.pow(operatingOmegaRadS, 2) * displacementAmplitudeM;

  // Phase lag angle: φ = atan2(2·ζ·r, 1 - r²)
  const phaseLagRad = Math.atan2(2 * dampingRatioVal * r, 1 - r * r);
  const phaseLagDeg = radToDeg(phaseLagRad < 0 ? phaseLagRad + 2 * Math.PI : phaseLagRad);

  return {
    frequencyRatio: r,
    magnificationFactor: mag,
    displacementAmplitudeM,
    velocityAmplitudeMps,
    velocityRmsMps: velocityAmplitudeMps / Math.SQRT2,
    accelerationAmplitudeMps2,
    phaseLagDeg,
  };
}

// ============================================================================
// 2. Rolling Element Bearing Rating Life (ISO 281 Standard)
// ============================================================================

/**
 * Dynamic equivalent radial load P for rolling bearings (ISO 281):
 * P = X · F_r + Y · F_a
 * @param radialLoadN Applied radial force F_r [N]
 * @param axialLoadN Applied thrust / axial force F_a [N]
 * @param radialFactorX Radial load factor X [-]
 * @param axialFactorY Axial load factor Y [-]
 * @returns Dynamic equivalent radial load P [N]
 */
export function bearingEquivalentLoad(
  radialLoadN: number,
  axialLoadN: number,
  radialFactorX = 1.0,
  axialFactorY = 0.0
): number {
  return radialFactorX * radialLoadN + axialFactorY * axialLoadN;
}

/**
 * Basic dynamic rating life L₁₀ in millions of revolutions (ISO 281:2007):
 * L₁₀ = (C / P)^p [10⁶ revolutions]
 * where p = 3 for ball bearings, p = 10/3 for roller bearings.
 *
 * @param dynamicLoadRatingC Dynamic basic load rating C [N]
 * @param equivalentLoadP Dynamic equivalent load P [N]
 * @param bearingType 'ball' (p = 3) or 'roller' (p = 10/3)
 * @returns Rating life L₁₀ in millions of revolutions
 */
export function bearingLifeMillionsRevs(
  dynamicLoadRatingC: number,
  equivalentLoadP: number,
  bearingType: 'ball' | 'roller' = 'ball'
): number {
  if (equivalentLoadP <= 0) return Infinity;
  const p = bearingType === 'ball' ? 3.0 : 10 / 3;
  return Math.pow(dynamicLoadRatingC / equivalentLoadP, p);
}

/**
 * Bearing basic rating life in operating hours L₁₀h:
 * L₁₀h = (10⁶ / (60 · n)) · (C / P)^p
 * @param lifeMillionsRevs Life L₁₀ in millions of revolutions [-]
 * @param rpm Rotational speed n [rev/min]
 * @returns Rating life L₁₀h in operating hours [hours]
 */
export function bearingLifeHours(lifeMillionsRevs: number, rpm: number): number {
  if (rpm <= 0) return Infinity;
  return (lifeMillionsRevs * 1e6) / (60 * rpm);
}

// ============================================================================
// 3. Rigging & Lifting Mechanics (ASME B30.9 & Sling Angle Factors)
// ============================================================================

/**
 * Tension in each leg of an n-leg symmetrical bridle sling:
 * T = W / (n · sin(θ))
 * where θ is the horizontal sling angle (angle from horizontal).
 *
 * @param totalLoadWeightN Total lifted load W [N] (mass_kg · g)
 * @param numberOfLegs Number of shared load-carrying sling legs n [-]
 * @param horizontalAngleDeg Sling horizontal angle θ (typically 30° to 90°) [deg]
 * @returns Tension per sling leg [N]
 */
export function slingLegTension(
  totalLoadWeightN: number,
  numberOfLegs: number,
  horizontalAngleDeg: number
): number {
  if (numberOfLegs <= 0) throw new Error('Number of sling legs must be ≥ 1');
  const thetaRad = degToRad(horizontalAngleDeg);
  const sinTheta = Math.sin(thetaRad);
  if (sinTheta <= 0.05) throw new Error('Horizontal sling angle too shallow (< 3°)');
  return totalLoadWeightN / (numberOfLegs * sinTheta);
}

/**
 * Sling Angle Load Factor (SLF):
 * SLF = 1 / sin(θ)
 * Multiplying nominal vertical share (W/n) by SLF gives actual sling leg tension.
 */
export function slingLoadFactor(horizontalAngleDeg: number): number {
  const thetaRad = degToRad(horizontalAngleDeg);
  return 1 / Math.sin(thetaRad);
}

/**
 * Wire rope D/d bending efficiency factor (ASME B30.9 / Wire Rope Users Manual):
 * Accounts for wire rope strength reduction when bent around sheaves, pins, or shackles.
 * E = 1 - 0.5 / √(D/d) for D/d ≥ 1.0 (capped at 1.0)
 *
 * @param pinDiameterM Diameter of the curved pin/shackle D [m]
 * @param ropeDiameterM Diameter of the wire rope d [m]
 * @returns Strength retention efficiency factor (0.5 to 1.0) [-]
 */
export function wireRopeDoverDEfficiency(pinDiameterM: number, ropeDiameterM: number): number {
  if (ropeDiameterM <= 0) throw new Error('Rope diameter must be positive');
  const ratio = pinDiameterM / ropeDiameterM;
  if (ratio < 1) return 0.5;
  const efficiency = 1 - 0.5 / Math.sqrt(ratio);
  return Math.min(1.0, Math.max(0.5, efficiency));
}

// ============================================================================
// 4. Precision Shaft Alignment Geometry (Rim-and-Face & Reverse Dial)
// ============================================================================

/**
 * Rim-and-Face dial indicator shaft alignment calculations:
 * Calculates required shim corrections at front and rear machine feet.
 *
 * @param dialFaceTirM Total Indicator Reading on Face dial (axial) [m]
 * @param dialRimTirM Total Indicator Reading on Rim dial (radial offset) [m]
 * @param indicatorDiameterM Diameter of the circular sweep path on coupling face [m]
 * @param distToFrontFootM Distance from indicator sweep plane to Front Foot [m]
 * @param distFrontToBackFootM Distance from Front Foot to Rear Foot [m]
 * @returns Angular slope [rad], coupling offset [m], and foot shim corrections [m]
 */
export function rimAndFaceAlignment(
  dialFaceTirM: number,
  dialRimTirM: number,
  indicatorDiameterM: number,
  distToFrontFootM: number,
  distFrontToBackFootM: number
) {
  if (indicatorDiameterM <= 0) throw new Error('Indicator sweep diameter must be positive');

  // Angular slope α = Face TIR / Indicator Diameter
  const angularSlope = dialFaceTirM / indicatorDiameterM;

  // Centerline radial offset at indicator plane δ = Rim TIR / 2
  const centerOffset = dialRimTirM / 2;

  // Front Foot correction: S₁ = δ + α · L₁
  const frontFootCorrectionM = centerOffset + angularSlope * distToFrontFootM;

  // Rear Foot correction: S₂ = δ + α · (L₁ + L₂)
  const rearFootCorrectionM =
    centerOffset + angularSlope * (distToFrontFootM + distFrontToBackFootM);

  return {
    angularSlopeRad: angularSlope,
    angularSlopeMmPerM: angularSlope * 1000,
    centerlineOffsetM: centerOffset,
    frontFootCorrectionM,
    rearFootCorrectionM,
  };
}
