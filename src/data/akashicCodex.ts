export interface AkashicProof {
    id: string;
    name: string;
    axiom: string;
    geometricOperation: string; // e.g., "Hypercube Rotation", "Torus Knot"
    prediction: string;
    status: 'Verified' | 'Pending' | 'Paradox';
    description: string; // New field
    visualData?: {
        color: string;
        complexity: number; // 0-1
        resonance: number; // Hz
    };
}

export const AKASHIC_CODEX: AkashicProof[] = [
    {
        id: "PROOF-001",
        name: "The 24-Bit Axiom",
        axiom: "Ω(24) ≡ 1 (mod L)",
        geometricOperation: "Tesseract Unfolding",
        prediction: "Observer Error Budget < 0.0001%",
        status: "Verified",
        description: "Establishes the fundamental resolution limit of the simulation. The 24th bit represents the threshold where observer intent collapses quantum probability into defined history. Relates directly to the 24th Gate closure invariant.",
        visualData: {
            color: "#00FF9D", // Neon Green
            complexity: 0.4,
            resonance: 432
        }
    },
    {
        id: "PROOF-002",
        name: "The 31/24 Anomaly",
        axiom: "∇ · E ≠ 0 @ t=31",
        geometricOperation: "Klein Bottle Inversion",
        prediction: "Leakage in Sector 7",
        status: "Paradox",
        description: "A persistent recursive error where the 31st iteration maps back to the 24th bit, creating a causal loop. This anomaly suggests the Null Ledger parity is incomplete, requiring manual observation to resolve.",
        visualData: {
            color: "#FF0055", // Neon Red
            complexity: 0.8,
            resonance: 1260
        }
    },
    {
        id: "PROOF-003",
        name: "Pendinium Convergence",
        axiom: "P(n) → ∞ as n → Ω",
        geometricOperation: "Spiral Dynamics",
        prediction: "Harmonic Resonance at 528Hz",
        status: "Verified",
        description: "Demonstrates that as the system approaches the Omega point, Pendinium Prime gates align perfectly with the Fibonacci sequence, allowing for lossless energy transmission through the scalar field.",
        visualData: {
            color: "#00D4FF", // Cyan
            complexity: 0.6,
            resonance: 528
        }
    },
    {
        id: "PROOF-004",
        name: "Null Ledger Parity",
        axiom: "Σ(Null) + Σ(Void) = 0",
        geometricOperation: "Void Lattice",
        prediction: "Zero-Point Stabilization",
        status: "Pending",
        description: "The theoretical balance sheet of the universe. It posits that for every creation event, a corresponding null-record is written to the void. Verification requires the 24th Gate to be fully closed.",
        visualData: {
            color: "#9D00FF", // Purple
            complexity: 0.9,
            resonance: 963
        }
    }
];
