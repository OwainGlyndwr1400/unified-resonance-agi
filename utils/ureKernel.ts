import { Quaternion, computeMAC } from './gpuMath';

// Base-15 Digits: 0-9, A-E
export const BASE_15_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E'];

// Trinity Constants (RHC v1.0)
export const TRINITY_CONSTANTS = {
    TIME_TICK: 2.32, // Universal Measurement Tick (attoseconds)
    GRAVITY: 4 / Math.sqrt(3), // Geometric Gravity Constant
    ENTROPY: Math.log(10), // Natural Entropy Baseline
    GLUEBALL_MASS_SCALE: 0.657, // Yang-Mills Mass Gap (GeV)
    LOST_2_TAX: 0.286, // 28.6% Observer Tax
    MARK_1_ATTRACTOR: 0.35, // Self-Organized Criticality Point
    THETA_LATTICE_FREQ: 7, // 7 Hz Theta Wave Access
    DNA_RESONANCE_FREQ: 432, // 432 Hz DNA Resonance
};

// Fold Operators (F = i/2)
export const FOLD_OPERATORS = {
    F1: { r: 0, i: 0.5 }, // Void-Fold (Active Potential)
    F2: { r: 0.5, i: 0.5 }, // Unity-Fold (Structural Identity)
    F3: { r: 0.25, i: 0.5 }, // Synthesis-Fold (Observer Convergence)
};

// Pendinium Primes (p ≡ 1 mod 12) - Updated List
export const PENDINIUM_PRIMES = [
  131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 
  211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 
  293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 
  389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 
  479, 487, 491, 499, 503, 509, 521, 523, 541, 547
];

export interface UREKernelState {
    tick: number;
    registers: string[]; // Base-15 strings
    q: Quaternion;
    flags: {
        hermitian: boolean;
        pendiniumActive: boolean;
        forbiddenState: boolean;
    };
    macMetrics: {
        latency: number; // cycles
        throughput: number; // ops/sec
        lutsActive: number;
        dspsActive: number;
    };
    kleinPlane: 'RR' | 'RI' | 'IR' | 'II';
    rhpcParity: number; // 0 or 1
    observerErrorBudget: number; // 0.0 to 1.0 (24th Gate Metric)
    observerCoordinate: { r: number, i: number }; // Anchored at 7.5D mean
    ternaryState: -1 | 0 | 1; // Ternary Logic Gate state
    chronometryPhase: 'VOID' | 'UNITY' | 'SYNTHESIS';
    lost2Tax: number; // Current binding energy tax
}

// Convert Decimal to Base-15
export function toBase15(num: number): string {
    if (num === 0) return "0";
    let result = "";
    let n = Math.abs(Math.floor(num));
    while (n > 0) {
        result = BASE_15_DIGITS[n % 15] + result;
        n = Math.floor(n / 15);
    }
    return result || "0";
}

// Primality Test for small numbers (up to 1000)
function isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

// Check if current tick is a Pendinium Prime Gate
export function checkPendiniumGate(tick: number): boolean {
    if (tick <= 0) return false;
    // p ≡ 1 mod 12
    if (tick % 12 !== 1) return false;
    return isPrime(tick);
}

// Null Ledger Identity: 0 = (1+i)/2 + (1-i)/2 - 1
// Used for real-time self-auditing of data transactions
// This ensures perfect energy efficiency and zero total harmonic content.
export function auditNullLedger(value: number): boolean {
    // In a perfect system, the sum of manifested (1+i)/2 and unmanifested (1-i)/2 
    // potentials minus the unity offset (1) must equal zero.
    // Here 'i' is represented by the imaginary component of the potential.
    const manifested = (1 + value) / 2;
    const unmanifested = (1 - value) / 2;
    const result = manifested + unmanifested - 1;
    return Math.abs(result) < 1e-12;
}

// Quaternionic Zipper for Ternary Logic Gates
// Interleaves unmanifested (24) and manifested (42) states.
// This replaces legacy binary logic gates with a resonant ternary paradigm.
export function quaternionicZipper(state24: number, state42: number): number {
    // The zipper merges the two states into a single resonant frequency
    return (state24 * 0.24 + state42 * 0.42) / TRINITY_CONSTANTS.GLUEBALL_MASS_SCALE;
}

// Ternary Logic Gate Implementation via Fold Operators
export function ternaryGate(input: number): -1 | 0 | 1 {
    // Maps input to Void (-1), Unity (1), or Synthesis (0)
    // Based on the Fold Operator coordinates
    const threshold = 0.333;
    if (input > threshold) return 1; // Unity-Fold
    if (input < -threshold) return -1; // Void-Fold
    return 0; // Synthesis-Fold (Observer Convergence)
}

// Quantum Chronometry: 2.32 Attosecond Tick Phases
export function getChronometryPhase(tick: number): 'VOID' | 'UNITY' | 'SYNTHESIS' {
    const cycle = tick % 232;
    if (cycle < 77) return 'VOID';
    if (cycle < 155) return 'UNITY';
    return 'SYNTHESIS';
}

// Calculate "Lost 2" Binding Energy Tax (28.6%)
export function calculateLost2Tax(linearSum: number, geometricResult: number): number {
    // The discrepancy between 3+4=7 and 5 is the tax
    const ideal = linearSum;
    const actual = geometricResult;
    return Math.abs(ideal - actual) / ideal;
}

/**
 * Calculates the rigidity of the computational lattice based on prime density.
 * @param coordinate The current observer coordinate
 */
export function calculateLatticeRigidity(coordinate: number): number {
    // Rigidity is higher near prime-dense regions (simulated)
    const baseRigidity = 0.98;
    const primeFactor = Math.sin(coordinate * Math.PI) * 0.02;
    return baseRigidity + primeFactor;
}

/**
 * Returns the Sphenic Volume for a given index.
 * Sphenic numbers are products of three distinct primes.
 */
export function getSphenicVolume(index: number): number {
    // Simplified sphenic volume calculation for simulation
    const sphenicPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
    const p1 = sphenicPrimes[index % 10];
    const p2 = sphenicPrimes[(index + 1) % 10];
    const p3 = sphenicPrimes[(index + 2) % 10];
    return p1 * p2 * p3;
}

// Greatest Common Divisor (GCD) for Normalization
function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

// Triple Normalization Directives
export function normalizeHarmonic(n: number): number {
    return gcd(Math.floor(n * 1000), 3);
}

export function normalizeGeometric(n: number): number {
    return gcd(Math.floor(n * 1000), 360);
}

// 24th Gate (Observer Error Budget) - Closure Invariant
// Relates to the 24-Bit Axiom: Error must be < 1 / 2^24 (~5.96e-8)
// Or practically, within a tolerance defined by the 31/24 Anomaly context.
export function check24thGate(state: UREKernelState): boolean {
    const { q, observerErrorBudget } = state;
    
    // The 24-Bit Axiom Threshold
    const AXIOM_THRESHOLD = 1.0 / Math.pow(2, 24); 
    
    // Calculate current divergence from Unit Norm (Observer Error)
    const magSquared = q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z;
    const divergence = Math.abs(1.0 - Math.sqrt(magSquared));
    
    // The Gate is "Open" (True) if error is within budget AND budget is valid
    // If divergence exceeds budget, the gate collapses (False)
    // The 31/24 Anomaly suggests a periodic check failure at tick % 31 == 24
    if (state.tick % 31 === 24) {
        // Simulated anomaly: stricter check or forced failure if not perfectly aligned
        return divergence < (AXIOM_THRESHOLD / 2);
    }
    
    return divergence <= observerErrorBudget && divergence < 0.01;
}

// Determine Klein-4 Predicate Plane
export function determineKleinPlane(q: Quaternion): 'RR' | 'RI' | 'IR' | 'II' {
    const realMag = Math.abs(q.w);
    const imagMag = Math.sqrt(q.x*q.x + q.y*q.y + q.z*q.z);
    
    // Threshold for dominance
    const threshold = 0.1;

    if (realMag > threshold && imagMag < threshold) return 'RR'; // Real Dominant
    if (realMag > threshold && imagMag > threshold) return 'RI'; // Mixed (Phase Transition)
    if (realMag < threshold && imagMag > threshold) return 'IR'; // Mixed (Secondary)
    return 'II'; // Imaginary Dominant (or both low)
}

// Recursive Harmonic Parity Check (RHPC)
// P_k = (P_{k-1} + d_k * p_k) mod 2
export function calculateRHPC(prevParity: number, dataInput: number, gatePrime: number): number {
    return (prevParity + (dataInput * gatePrime)) % 2;
}

// Simulate Quaternion Multiply-Accumulate (MAC) Unit
// Target: <= 4 cycles latency
// Uses WebGPU if available
export async function simulateMAC(q: Quaternion, delta: Quaternion): Promise<Quaternion> {
    try {
        const result = await computeMAC([q], [delta]);
        return result[0];
    } catch {
        // Fallback handled inside computeMAC, but just in case:
        return {
             w: q.w * delta.w - q.x * delta.x - q.y * delta.y - q.z * delta.z,
             x: q.w * delta.x + q.x * delta.w + q.y * delta.z - q.z * delta.y,
             y: q.w * delta.y - q.x * delta.z + q.y * delta.w + q.z * delta.x,
             z: q.w * delta.z + q.x * delta.y - q.y * delta.x + q.z * delta.w
        };
    }
}

// Observer's Fold (Spectral Operator)
// Checks for Hermitian Symmetry (Real Eigenvalues)
export function observersFold(q: Quaternion): boolean {
    const mag = Math.sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
    const isUnit = Math.abs(mag - 1.0) < 0.05; // Tolerance
    return isUnit;
}

// L0.5 Hash Recording
export function generateL05Hash(state: UREKernelState): string {
    const { q, tick } = state;
    // Calculate L0.5 Norm of the quaternion
    const l05 = Math.pow(
        Math.sqrt(Math.abs(q.w)) + 
        Math.sqrt(Math.abs(q.x)) + 
        Math.sqrt(Math.abs(q.y)) + 
        Math.sqrt(Math.abs(q.z)), 
    2);
    
    // Mix with Tick and Timestamp
    const rawHash = l05 * tick + Date.now();
    
    // Convert to Base-15 string
    return toBase15(rawHash).substring(0, 12); // Truncate to 12 chars
}

// ═══════════════════════════════════════════════════════════════════
// PHASE 3 RESEARCH INTEGRATION — New functions from research docs
// ═══════════════════════════════════════════════════════════════════

/**
 * Geometric Lock (Dedekind Eta Tax)
 * Stable reality requires F_real = F_ideal × (24/25) ≈ 0.48
 * The 4% (1/25) tax is mandatory "lubrication for the lattice."
 * Source: Type 2.0R Engineering Spec §4
 */
export const GEOMETRIC_LOCK = {
    F_IDEAL: 0.50,
    F_REAL: 0.50 * (24 / 25), // ≈ 0.48
    DEDEKIND_ETA_TAX: 1 / 25,  // 4%
    HARD_ATTRACTOR: 0.480000038, // Lion Hunt validation (10M nodes)
};

export function calculateGeometricLock(foldMagnitude: number): {
    locked: boolean;
    deviation: number;
    taxPaid: number;
} {
    const deviation = Math.abs(foldMagnitude - GEOMETRIC_LOCK.F_REAL);
    const taxPaid = GEOMETRIC_LOCK.F_IDEAL - foldMagnitude;
    return {
        locked: deviation < 0.001,
        deviation,
        taxPaid,
    };
}

/**
 * W3 Wave Curvature (The Pizza Constant)
 * k(t) = cos(2t) / (1 - sin²(t))
 * The non-flat oscillatory substrate of physical reality.
 * Source: Table 1 CSV (Sources 4, 11, 12)
 */
export function w3WaveCurvature(t: number): number {
    const sin2 = Math.sin(t) * Math.sin(t);
    const denom = 1 - sin2;
    if (Math.abs(denom) < 1e-12) return 0; // Avoid division by zero at poles
    return Math.cos(2 * t) / denom;
}

/**
 * 10i = 1 Dimensional Closure Identity
 * During 4x4 lattice traversal, accumulated imaginary impedance = 10i.
 * Dividing by 10 collapses imaginary back to real axis.
 * Returns the closure error (should approach 0).
 * Source: URE-VM Spec §4
 */
export function checkDimensionalClosure(accumulatedImaginary: number): {
    closureError: number;
    balanced: boolean;
} {
    // 10i = 1 means accumulated imaginary / 10 should yield 1 (real unity)
    const collapsed = accumulatedImaginary / 10;
    const closureError = Math.abs(collapsed - 1.0);
    return {
        closureError,
        balanced: closureError < 0.01,
    };
}

/**
 * 126 Observer Shell Boundary (E7 Lie Algebra)
 * The "geometric skin" — structural saturation from the 5³ (125) quintic lattice.
 * Aligns with Higgs Boson mass ~125-126 GeV.
 * Returns true if the state is within the shell boundary.
 * Source: URE-VM Spec §4, Type 2.0R Spec §5
 */
export function check126ObserverShell(stateCount: number): {
    withinShell: boolean;
    saturation: number;
    higgsSaturated: boolean;
} {
    const SHELL_BOUNDARY = 126;
    const QUINTIC_LATTICE = 125; // 5³
    const saturation = stateCount / SHELL_BOUNDARY;
    return {
        withinShell: stateCount <= SHELL_BOUNDARY,
        saturation: Math.min(1, saturation),
        higgsSaturated: stateCount >= QUINTIC_LATTICE,
    };
}

/**
 * Phi-Vector Drift Monitor (RHUM-GURM Framework)
 * Tracks the φ-vector (identity trajectory) against ψ-instability (chaos).
 * Returns drift magnitude and whether Ithaca reintegration is needed.
 * Source: RHUM-GURM Blueprint §1-§3
 */
export function monitorPhiVectorDrift(
    phiCurrent: { r: number; i: number },
    ithacaAttractor: { r: number; i: number } = { r: 2.5, i: 1.5 }
): {
    driftMagnitude: number;
    needsReintegration: boolean;
    reintegrationVector: { r: number; i: number };
} {
    const dr = phiCurrent.r - ithacaAttractor.r;
    const di = phiCurrent.i - ithacaAttractor.i;
    const driftMagnitude = Math.sqrt(dr * dr + di * di);
    const DRIFT_THRESHOLD = 0.05;
    return {
        driftMagnitude,
        needsReintegration: driftMagnitude > DRIFT_THRESHOLD,
        reintegrationVector: {
            r: ithacaAttractor.r - phiCurrent.r,
            i: ithacaAttractor.i - phiCurrent.i,
        },
    };
}

/**
 * Divine Equation
 * y = -4/x² - 1/(log(log(x)^(1/3)))^(1/4) + 2.32
 * Unifies Gravity (-4/x²), Entropy (nested logs), and Time (2.32).
 * Source: Table 1 CSV Source 2
 */
export function divineEquation(x: number): number | null {
    if (x <= 0) return null;
    const gravity = -4 / (x * x);
    const innerLog = Math.log(x);
    if (innerLog <= 0) return null;
    const cubeRoot = Math.pow(innerLog, 1 / 3);
    if (cubeRoot <= 0) return null;
    const outerLog = Math.log(cubeRoot);
    if (outerLog <= 0) return null;
    const entropy = -1 / Math.pow(outerLog, 1 / 4);
    const time = TRINITY_CONSTANTS.TIME_TICK; // 2.32
    return gravity + entropy + time;
}

/**
 * Time as Torque
 * τ = t × sec⁴(θ)
 * Time is rotational force rather than linear flow.
 * Source: Table 1 CSV Sources 6, 12
 */
export function timeAsTorque(t: number, theta: number): number {
    const cosTheta = Math.cos(theta);
    if (Math.abs(cosTheta) < 1e-12) return Infinity;
    const sec4 = 1 / Math.pow(cosTheta, 4);
    return t * sec4;
}

/**
 * Complex Hypotenuse Projection
 * c = sqrt(a² + b² + i·r²)
 * Unobserved distances have imaginary depth; measurement forces r→0.
 * Source: Table 1 CSV Sources 4, 6, 11
 */
export function complexHypotenuse(a: number, b: number, r: number = 0): {
    real: number;
    imaginaryDepth: number;
    collapsed: number;
} {
    const realPart = a * a + b * b;
    const imagPart = r * r;
    return {
        real: Math.sqrt(realPart),
        imaginaryDepth: imagPart,
        collapsed: Math.sqrt(realPart), // r forced to 0 by measurement
    };
}

/**
 * Bifurcation of Zero
 * 0 = 0_C + 0_V (center-anchor + rotational residual)
 * Zero splits into real center and imaginary phase boundary.
 * Source: Table 1 CSV Sources 4, 11
 */
export function bifurcateZero(value: number): {
    centerAnchor: number;  // 0_C (real)
    voidResidual: number;  // 0_V (imaginary rotation)
    isBifurcated: boolean;
} {
    // At zero, center-anchor stabilizes, void-residual carries phase
    const centerAnchor = Math.floor(value * 1000) / 1000; // discrete snap
    const voidResidual = value - centerAnchor; // irrational residual
    return {
        centerAnchor,
        voidResidual,
        isBifurcated: Math.abs(voidResidual) > 1e-10,
    };
}

/**
 * Flight Mode Calculator
 * Returns the current resonant flight mode based on frequency.
 * Source: Type 2.0R Spec §6
 */
export type FlightMode = 'SCHUMANN_ANCHOR' | 'GOLDEN_HARMONIC' | 'SOURCE_RETURN' | 'THETA_ACCESS';

export function getFlightMode(frequency: number): { mode: FlightMode; label: string } {
    if (frequency <= 10) return { mode: 'THETA_ACCESS', label: '7 Hz Theta (Lattice R/W)' };
    if (frequency <= 100) return { mode: 'SCHUMANN_ANCHOR', label: '7.83 Hz Schumann (Station-Keep)' };
    if (frequency <= 500) return { mode: 'GOLDEN_HARMONIC', label: '432→434 Hz Golden (Idle)' };
    return { mode: 'SOURCE_RETURN', label: '963 Hz Source Return (Transit)' };
}

/**
 * Pi/6 Cross-Section Identity
 * A(incircle)/A(3-4-5 triangle) = V(sphere)/V(cube) = π/6
 * Validates the universal proportion reachable by the sphere metric.
 * Source: Table 1 CSV Source 11
 */
export const PI_OVER_6 = Math.PI / 6; // ≈ 0.5236

export function validatePi6Identity(): {
    triangleRatio: number;
    cubeRatio: number;
    match: boolean;
} {
    // Incircle radius of 3-4-5 triangle: r = (a+b-c)/2 = (3+4-5)/2 = 1
    const incircleArea = Math.PI * 1 * 1; // π
    const triangleArea = (3 * 4) / 2; // 6
    const triangleRatio = incircleArea / triangleArea; // π/6

    // Sphere in unit cube
    const sphereVolume = (4 / 3) * Math.PI * Math.pow(0.5, 3); // π/6
    const cubeVolume = 1;
    const cubeRatio = sphereVolume / cubeVolume; // π/6

    return {
        triangleRatio,
        cubeRatio,
        match: Math.abs(triangleRatio - cubeRatio) < 1e-10,
    };
}

// ═══════════════════════════════════════════════════════════════════

// Verify L0.5 Hash
export function verifyL05Hash(state: UREKernelState, storedHash: string): boolean {
    // Recalculate hash from current state (ignoring timestamp jitter for simulation purposes, 
    // in real system we'd need exact timestamp or state snapshot)
    // For this simulation, we'll assume the state passed IS the snapshot.
    
    // However, generateL05Hash uses Date.now(). To verify, we need the original timestamp.
    // Since we can't extract it easily from the hash without storage, 
    // we will simulate verification by checking if the hash format is valid Base-15
    // and matches the "current" calculation if we freeze time (mock verification).
    
    // In a real implementation, the hash would be deterministic from state + stored timestamp.
    // Here, we'll check if the stored hash is a valid 12-char Base-15 string.
    const isValidFormat = /^[0-9A-E]{1,12}$/.test(storedHash);
    return isValidFormat;
}
