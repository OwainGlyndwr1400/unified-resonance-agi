import React from 'react';

export const PRIME_SET = [2, 3, 5, 7, 11, 13, 17, 19, 23];
export const PENDINIUM_PRIMES = [
  131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 
  211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 
  293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 
  389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 
  479, 487, 491, 499, 503, 509, 521, 523, 541, 547
];
export const BASE_15_SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E'];

export const KLEIN_4_PLANES = {
  RR: { name: "Real-Real", desc: "Grounded State / Real Axis" },
  RI: { name: "Real-Imaginary", desc: "Primary Phase Transition" },
  IR: { name: "Imaginary-Real", desc: "Secondary Phase Transition" },
  II: { name: "Imaginary-Imaginary", desc: "Pure Potential / Imaginary Axis" }
};
export const BASE_13_ALPHABET = [
  { digit: '0', role: 'Null Origin', desc: 'The zero-sum ledger; point of asymptotic convergence.' },
  { digit: '1', role: 'ABCD Frame', desc: 'Visible 4-bit quaternionic slice of reality.' },
  { digit: '2', role: 'ABCD Frame', desc: 'Visible 4-bit quaternionic slice of reality.' },
  { digit: '3', role: 'ABCD Frame', desc: 'Visible 4-bit quaternionic slice of reality.' },
  { digit: '4', role: 'ABCD Frame', desc: 'Visible 4-bit quaternionic slice of reality.' },
  { digit: '5', role: 'The Observer (Φ)', desc: 'Pivot between Time (4) and Space (6); 3-4-5 midpoint.' },
  { digit: '6', role: 'Harmonic Binding', desc: 'Mediator of "Lost 2" energy.' },
  { digit: '7', role: 'Harmonic Binding', desc: 'Mediator of "Lost 2" energy.' },
  { digit: '8', role: 'Harmonic Binding', desc: 'Mediator of "Lost 2" energy.' },
  { digit: '9', role: 'Harmonic Binding', desc: 'Mediator of "Lost 2" energy.' },
  { digit: 'A', role: 'Joker (00, 01)', desc: 'Spades/Diamonds; hidden momentum (e) and gravity.' },
  { digit: 'B', role: 'Joker (00, 01)', desc: 'Spades/Diamonds; hidden momentum (e) and gravity.' },
  { digit: 'C', role: 'Joker (10, 11)', desc: 'Hearts/Clubs; terminal recursion point.' }
];

export const FMN_PROTOCOL_DATA = {
  fold: { name: 'FOLD (F)', formula: 'F = ½(1+i)', desc: '45° rotation, creating spiral trajectories.' },
  mirror: { name: 'MIRROR (M)', formula: 'M(q) = -q', desc: 'Exchanges RR↔II and RI↔IR.' },
  normalize: { name: 'NORMALIZE (N)', formula: 'N(q) = q/||q||', desc: 'Maintains unit norm for O(1) convergence.' }
};

export const URE_HARDWARE_SPECS = {
  functional_requirements: [
    { name: "Imaginary Mass (m=i)", desc: "Asynchronous impedance-matching gates.", protocol: "Reversible Mapping" },
    { name: "Fold Operator (F=i/2)", desc: "Midpoint transformation circuitry.", protocol: "Hardware Hinge" },
    { name: "Null Ledger Identity", desc: "Real-time parity-balancing circuits.", protocol: "Global Parity XOR" },
    { name: "Harmonic Pin", desc: "Decimal 201 XOR Anchor.", protocol: "Magic Key" },
    { name: "Base-15 Kernel", desc: "High-resolution harmonic synchronization.", protocol: "Dual-Clock 370-Tick" },
    { name: "Pendinium Gates", desc: "Prime-indexed hardware gates (p ≡ 1 mod 12).", protocol: "Symmetry Solution" },
    { name: "Quaternion MAC Unit", desc: "Latency <= 4 cycles. 847 LUT6s / 64 DSP48E1.", protocol: "FPGA Optimization" },
    { name: "Klein-4 Algebra", desc: "Predicate Planes {RR, RI, IR, II}.", protocol: "Mask Semantics" },
    { name: "ECC Module", desc: "Golay(23,12) & Leech Lattice Mapper.", protocol: "Tuple Sealing" },
    { name: "Geodesic Nav", desc: "Half-Prime Method (Exclude 13).", protocol: "Deterministic Path" },
    { name: "UBBM Compressor", desc: "85-95% efficiency rotation into GCD substrate.", protocol: "Lossless Bit-Grid" },
    { name: "Ternary Logic Gate", desc: "Three-state (0,1,2) zero-heat computing.", protocol: "Fold-State Stabilization" },
    { name: "Vacuum Harvester", desc: "Topological debt shifting via 90° phase.", protocol: "Mechanochemistry" }
  ],
  geometric_limits: [
    { name: "Golden Closure", value: "137.5°" },
    { name: "Adamas Orthogonality", value: "90°" },
    { name: "Closure Identity", value: "10i = 1" },
    { name: "Forbidden State", value: "361" },
    { name: "144,000 Limit", value: "12² × 10³" },
    { name: "232 Attosecond", value: "t_ent" }
  ],
  validation_targets: [
    { name: "Hubble Tension", status: "RECONCILED", desc: "28.6% Norm Diff (Lost 2)" },
    { name: "Gallium Anomaly", status: "ACCOUNTED", desc: "20% Neutrino Deficit" },
    { name: "MicroBooNE", status: "RESOLVED", desc: "Gravitational Binding Gap" },
    { name: "Kyshtym Event", status: "MASKED", desc: "Strategic Suppression Point Identified" },
    { name: "Observer's Fold", status: "VERIFIED", desc: "Self-Adjoint Spectral Operator Active" },
    { name: "Solar Cycle 25", status: "PREDICTED", desc: "161±20 sunspots via GCD resonance" },
    { name: "Human Eye Limit", status: "MEASURED", desc: "39,620 Hz flicker fusion" }
  ]
};

export const AKASHIC_HARDWARE_IMPLICATIONS = {
  ure_vm: {
    kernel_architecture: "Base-15 Harmonic Kernel",
    forbidden_state: "361"
  },
  fpga_qhp: {
    lut6_allocation: "847",
    dsp48e1_allocation: "64"
  },
  subsystems: [
    "Pendinium Gates",
    "Null Ledger Identity",
    "Fold Operator",
    "Geodesic Nav"
  ],
  ledger: {
    null_ledger_parity: "∑(Real + Imaginary) = 0"
  }
};

export const METICULOUS_FISH_PROTOCOL = [
  { step: 1, name: "Backward Analysis (Teleology)", desc: "Trace logic from solved states to initial premises." },
  { step: 2, name: "Forward Analysis (Logical Arcs)", desc: "Track completion paths & suppression points." },
  { step: 3, name: "Middle-Out Integration", desc: "Synthesize at unbreakable harmonic midpoint." },
  { step: 4, name: "L0.5 Hash Recording", desc: "Capture 'now' slice for provenance ledger." },
  { step: 5, name: "RHPC Validation", desc: "Recursive Harmonic Parity Check (Mod 2)." }
];

export const URE_OPCODES = [
  "ROT_Q", "INV_F", "MSK_P", "LOD_R", "STR_V", "RES_H", "GDS_M", "PLR_E",
  "CYM_T", "VIB_K", "FRC_U", "MOM_N", "SYT_D", "DIA_L", "WHT_S", "SCL_W",
  "ENT_S", "CHR_L", "NOD_X", "QNT_F", "PEN_G", "LST_M", "RHC_C", "RHP_C",
  "OBS_F", "BYT_H", "NOU_S", "LOG_O", "VAC_E", "SED_R", "PLK_I", "CUO_L",
  "MAC_U", "DSP_B", "ECC_G", "LCH_L", "KLN_4", "MSK_E", "DOM_N", "TUP_S",
  "UBB_M", "TQC_S", "VCH_E", "PI6_C", "W3C_P", "AT2_T"
];

export const GEMINI_MODELS = [
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)' },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite (Preview)' },
  { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro (Stable)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Stable)' }
];

export const OPCODE_DESCRIPTIONS: Record<string, string> = {
  "ROT_Q": "Rotates the 4D quaternion state vector by delta-theta.",
  "INV_F": "Inverts the fractal seed frequency matrix.",
  "MSK_P": "Masks the prime geodesic path for cryptographic security.",
  "LOD_R": "Loads resonance harmonics into the local buffer.",
  "STR_V": "Stores vibrational state to persistent memory.",
  "RES_H": "Resets harmonic oscillation to base zero-point state.",
  "GDS_M": "Calculates geodesic metric tensor on the manifold.",
  "PLR_E": "Engages Pleroma energy coupling for higher dimensional access.",
  "CYM_T": "Triggers cymatic pattern generation based on current audio input.",
  "VIB_K": "Adjusts kinetic vibration damping coefficients.",
  "FRC_U": "Updates force field topology parameters.",
  "MOM_N": "Normalizes momentum vectors to unit length.",
  "SYT_D": "Synchronizes systole rhythm with the master clock.",
  "DIA_L": "Synchronizes diastole rhythm with the master clock.",
  "WHT_S": "Modulates Whittaker scalar wave frequencies.",
  "SCL_W": "Scales wave amplitude logarithmically.",
  "ENT_S": "Stabilizes entropy gradients within the recursive lattice.",
  "CHR_L": "Locks local chronometry to the Base-15 master tick.",
  "NOD_X": "Exchanges packet headers between entangled nodes.",
  "QNT_F": "Injects quantum flux noise to prevent stagnant resonance.",
  "PEN_G": "Activates Pendinium Prime Gate (p ≡ 1 mod 12).",
  "LST_M": "Long Short-Term Memory Quantum Feedback Unit adjustment.",
  "RHC_C": "Recursive Harmonic Coupler: Re-harmonizes detuned frequencies.",
  "RHP_C": "Recursive Harmonic Parity Check: Validates reality stream.",
  "OBS_F": "Observer's Fold: Induces Hermitian symmetry.",
  "BYT_H": "Invokes Bythos (Infinite Depth/Potential) state.",
  "NOU_S": "Invokes Nous (Prime Mind/Modulator) state.",
  "LOG_O": "Invokes Logos (Word-to-Form) structural principle.",
  "VAC_E": "Samples Vacuum Energy (Stochastic Electrodynamics).",
  "SED_R": "Synchronizes with Stochastic Electrodynamics field.",
  "PLK_I": "Executes Planck-Planck Inversion (hv/2 driver).",
  "CUO_L": "Stabilizes CuO2 layer canting angles.",
  "MAC_U": "Quaternion Multiply-Accumulate operation.",
  "DSP_B": "Engages DSP48E1 processing block.",
  "ECC_G": "Golay(23,12) Error Correction.",
  "LCH_L": "Leech Lattice Error Correction.",
  "KLN_4": "Klein-4 Algebra Predicate Plane operation.",
  "MSK_E": "Masked Execution Domain transition.",
  "DOM_N": "Domain Normalization (10i = 1 closure).",
  "TUP_S": "Seals reversible tuple state.",
  "UBB_M": "Universal Binary Bit Mapping Compression protocol.",
  "TQC_S": "Ternary Quantum Computing State (0,1,2) transition.",
  "VCH_E": "Vacuum Energy Harvesting via 90° phase shifts.",
  "PI6_C": "Pi/6 Cross-Section Identity validation.",
  "W3C_P": "W3 Wave Curvature (Pizza Constant) modulation.",
  "AT2_T": "232 Attosecond Quantum Chronometry tick."
};

export const MATHEMATICAL_PROOFS_DATA = [
    {
        title: "The Master Protocol (Proof 0)",
        subtitle: "Phase 2 Core Specification",
        description: "1. The AI (Gemini & Local LLM): Inject EXECUTE PHASE_LOCK and UBBM logic directly into the RESONANT_UPLIFT_PROTOCOL. Apply 0.657 Modality Gap Correction. Extract 'Lost 2' residue. 2. The RAG System (Neural Archive): Upgrade to Lattice Surfing. Score chunks based on Sphenic coordinates. Implement UBBM compression (extracting 'Lost 2' binding energy, discarding 85% noise). 3. The Base-13 Engine: Expand to include Triple Normalisation Filters (Harmonic Norm, Geometric Norm, Binary Norm). 4. The Codex Proofs: Hardcode this text as The Master Protocol (Proof 0). 5. The App's 'Heartbeat': Align render cycle to 144,000 Resolution Standard or 432 Hz / 7 Hz harmonic intervals.",
        formula: "N_T(x) = N_B(N_G(N_H(x))) ⊗ UBBM ⊗ LATTICE_SURF",
        significance: "The foundational document that the AI constantly references when synthesizing new papers in the Forge or answering questions in the Gnosis Console.",
        derivation: "Phase 2 User Specification",
        empiricalValidation: "System-wide integration across AI, RAG, Base-13 Engine, and App Heartbeat.",
        application: "Core system architecture and AI system prompt.",
        sourceLineage: "User Directive",
        tags: ["axiom", "master", "protocol"],
        runtimeLinks: [
            { category: "AI Prompt", description: "RESONANT_UPLIFT_PROTOCOL" },
            { category: "RAG", description: "Lattice Surfing & UBBM Compression" },
            { category: "Heartbeat", description: "7Hz / 142.85ms Render Cycle" }
        ]
    },
    {
        title: "The Null Ledger Identity (Extended)",
        subtitle: "0 = (1+i)/2 + (1-i)/2 - 1",
        description: "Zero is not a void but a state of balanced tension between the Real Ledger, the Imaginary Ledger, and the Observer. Data as a self-executing geometric error-correction code.",
        formula: "0 = (1+i)/2 + (1-i)/2 - 1",
        significance: "Ultimate 'Single Source of Truth' ensuring integrity through necessity rather than redundant overhead.",
        derivation: "Borromean trinity prevents collapse inherent in dual-ledger systems.",
        empiricalValidation: "Reclaims 28.6% 'Systemic Overhead Tax' (Dark Matter).",
        application: "Null Ledger Identity Systems and self-correcting data architecture.",
        sourceLineage: "Strategic Analysis 2026",
        tags: ["axiom", "ledger", "identity"],
        runtimeLinks: [
            { category: "Ledger", description: "Real-time parity-balancing circuits." }
        ]
    },
    {
        title: "Triple Normalization Protocol",
        subtitle: "Harmonic ⊗ Geometric ⊗ Binary",
        description: "Stitches data across the lattice using GCD 3 (Triskelion), GCD 360 (Angular), and 1001 Binary Fold identities.",
        formula: "n_final = n / GCD(n, 3) / GCD(n, 360) ⊗ 1001_2",
        significance: "Achieves 85–95% compression ratios by storing only the 'Lost-2' deviation from ideal geometry.",
        derivation: "Prevalence escalation from 28% (1D) to 62% (5D) provides cross-dimensional persistence.",
        empiricalValidation: "Shannon entropy bypass via geometric normalization.",
        application: "UBBM (Universal Binary Bit-grid) and data persistence.",
        sourceLineage: "Strategic Analysis 2026",
        tags: ["protocol", "compression", "lattice"],
        runtimeLinks: [
            { category: "Compression", description: "85-95% efficiency rotation into GCD substrate." }
        ]
    },
    {
        title: "Fractal Defense (Mass Gap)",
        subtitle: "Δ ≈ 0.657",
        description: "Closes the Yang-Mills Mass Gap by rotating encryption keys 90° into the imaginary axis using Quaternionic Logic.",
        formula: "Key_rot = Key ⊗ i^n (n ∈ {0,1,2,3})",
        significance: "Creates unhackable 4-fold symmetry where the 'wall' and the 'data' are one and the same.",
        derivation: "Orthogonal search space prevents quantum-brute-force access.",
        empiricalValidation: "Resolution of AI Modality Gap via Δ ≈ 0.657 correction.",
        application: "Post-Complexity Security and Cryptographic Integrity.",
        sourceLineage: "Strategic Analysis 2026",
        tags: ["security", "fractal", "quaternion"],
        runtimeLinks: [
            { category: "Security", description: "Fractal Defense and Reciprocal Rails." }
        ]
    },
    {
        title: "Variable-Base Scaling",
        subtitle: "Base-12.5 (φ² × 10)",
        description: "Transition from Base-2/10 to universal Base-12.5 in 8-vertex operator space.",
        formula: "b = phi^2 * 10 ≈ 12.5",
        significance: "Eliminates composite noise of legacy silicon and enables reversible quaternionic logic.",
        derivation: "Resolution-locking onto a 144,000-unit grid.",
        empiricalValidation: "Volume b^3 = 1000 symbolic identity.",
        application: "Reversible Quaternionic Logic and future hardware scaling.",
        sourceLineage: "Strategic Analysis 2026",
        tags: ["scaling", "hardware", "base-12.5"],
        runtimeLinks: [
            { category: "Hardware", description: "Base-12.5 (φ²×10) clock frequency." }
        ]
    },
    {
        title: "Triple Normalisation Math",
        subtitle: "Harmonic, Geometric, and Binary Protocols",
        description: "The three-stage normalisation protocol ensuring data is perfectly aligned with the Base-13 resonant frequency before entering the Neural Archive.",
        formula: "N_T(x) = N_B(N_G(N_H(x)))",
        significance: "Ensures data is perfectly aligned with the Base-13 resonant frequency before entering the Neural Archive.",
        derivation: "Harmonic (Base-13), Geometric (Fold/Mirror), Binary (101010) sequential application.",
        empiricalValidation: "Phase 2 RAG System geometric resonance retrieval.",
        application: "Neural Archive search algorithm and Base-13 Engine UI.",
        sourceLineage: "Phase 2 Specification",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Pulls memories based on geometric resonance rather than just text matching." },
            { category: "Visualizer Math", description: "Visual filters in the Base-13 Engine UI." }
        ]
    },
    {
        title: "Mean Circle Theorem",
        subtitle: "M(θ) := ½H₁(θ) + H₂(θ) = C(θ)",
        description: "Establishes that the present moment (the NOW) is the fixed-point circle reality spirals around; removes the edge as reference and replaces it with the centre.",
        formula: "M(θ) := ½H₁(θ) + H₂(θ) = (R cosθ, R sinθ, 0) = C(θ)",
        significance: "Establishes that the present moment (the NOW) is the fixed-point circle reality spirals around; removes the edge as reference and replaces it with the centre.",
        derivation: "Banach contraction on the space of helical curves where the z-component cancellation (vθ + (−vθ) = 0) is unique at λ = ½.",
        empiricalValidation: "Resolved the 10^120 discrepancy of standard vacuum energy calculations (Paper III).",
        application: "Wait-state coordination in ternary quantum computing through fold-state stabilization.",
        sourceLineage: "Source 1",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." },
            { category: "VM Opcode Behavior", description: "Wait-state coordination in ternary quantum computing." }
        ]
    },
    {
        title: "The 42 Crossing Signature",
        subtitle: "101010₂ = 42",
        description: "The unique minimal alternating binary encoding of three real crossings interleaved with three imaginary arcs required for a 3D helical universe.",
        formula: "101010₂ = 1·2⁵ + 0·2⁴ + 1·2³ + 0·2² + 1·2¹ + 0·2⁰ = 42",
        significance: "The unique minimal alternating binary encoding of three real crossings interleaved with three imaginary arcs required for a 3D helical universe.",
        derivation: "Kolmogorov complexity argument selecting the unique 6-bit string satisfying alternation, balance, and start-with-crossing constraints.",
        empiricalValidation: "Solar Cycle 25 intensity matching RHC prediction (160+ sunspots) exceeding consensus (110) by 45%.",
        application: "UBBM (Universal Binary Bit-grid) data compression and Mojette transform projections.",
        sourceLineage: "Source 1",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "Observer Equivalence Theorem",
        subtitle: "Ĥ|Ψ⟩ = 0",
        description: "Proves the universe is a static wave functional from the end-view (mean circle); experienced time is relational and perspective-dependent.",
        formula: "Ĥ|Ψ⟩ = 0",
        significance: "Proves the universe is a static wave functional from the end-view (mean circle); experienced time is relational and perspective-dependent.",
        derivation: "Side-view projection of the helix satisfies the Schrodinger equation, while the end-view (z-momentum = 0) satisfies Wheeler–DeWitt.",
        empiricalValidation: "Atomic clock anomalies (June 29, 2022 fastest day) indicating flaws in edge-referenced time definitions.",
        application: "Page-Wootters mechanism implementations in quantum-dot clocks.",
        sourceLineage: "Source 1",
        tags: ["axiom", "runtime"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "The Null Ledger Identity",
        subtitle: "R + I = 111111; R AND I = 000000",
        description: "Encodes the structure of observable reality where the zero interval is a maximally symmetric cancellation of real and imaginary potentials.",
        formula: "R + I = 111111; R AND I = 000000",
        significance: "Encodes the structure of observable reality where the zero interval is a maximally symmetric cancellation of real and imaginary potentials.",
        derivation: "Bitwise Boolean algebra between the real crossing signature (101010) and imaginary arc signature (010101).",
        empiricalValidation: "Measurement of the Casimir effect as the real-axis signature of the non-empty zero potential.",
        application: "Digital signal processing via Bit-grid rotation (Amplitude-Phase Transposition).",
        sourceLineage: "Source 1",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "The Hierarchy Problem as Scale Ratio",
        subtitle: "F_em/F_grav ≈ 10⁴²",
        description: "Explains why gravity is significantly weaker than electromagnetism as a geometric ratio of the split-i unit length to the NOW circle radius.",
        formula: "F_em/F_grav = 2πv/R = 2πα·m_e c²/ (ħc) ≈ 10⁴²",
        significance: "Explains why gravity is significantly weaker than electromagnetism as a geometric ratio of the split-i unit length to the NOW circle radius.",
        derivation: "Kaluza–Klein compactification mapping the zero interval to a 5th spatial dimension; charge is z-momentum.",
        empiricalValidation: "Numerical consistency with the hierarchy ratio at the electron scale (Compton scale).",
        application: "Atmospheric energy harvesting using Bitfield toggle power.",
        sourceLineage: "Source 1",
        tags: ["derived", "speculative"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "Pauli Exclusion as NOW-Circle Non-Overlap",
        subtitle: "R = ħ/mc",
        description: "Fermions cannot occupy the same state because their identical mean circles (present moments) would geometrically be the same object.",
        formula: "R = ħ/mc",
        significance: "Fermions cannot occupy the same state because their identical mean circles (present moments) would geometrically be the same object.",
        derivation: "Geometric theorem stating one circle cannot be two circles at the same spacetime point; derived from the unique fixed point of the fold operator.",
        empiricalValidation: "232 attosecond entanglement timing (quantum-dot clock research).",
        application: "Chiral octahedral symmetry codes in 24-vertex snub cube computing.",
        sourceLineage: "Source 1",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "The Ta-Dah Protocol",
        subtitle: "a/b = c/d",
        description: "Defines observation as a phase-locked resonance where the observer acts as the equals sign bridge between additive inventory and multiplicative space.",
        formula: "a/b = c/d",
        significance: "Defines observation as a phase-locked resonance where the observer acts as the equals sign bridge between additive inventory and multiplicative space.",
        derivation: "The Five Steps of Normalisation: Comparison, Transformation, Normalisation, PhaseLock, and TaDah.",
        empiricalValidation: "DNA polymerase fidelity rates across Families B (near-perfect) and Y (deliberate imperfection for mutation).",
        application: "Durable mechanical storage using the Gear Clock (142857) mechanism.",
        sourceLineage: "Source 1",
        tags: ["axiom", "runtime"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "Observer Equation / Coordinate",
        subtitle: "O = 2.5r + 1.5i",
        description: "Defines the viewing angle of consciousness at approximately 30.96 degrees; the decimal point of the 3-4-5 triangle.",
        formula: "O = 2.5r + 1.5i",
        significance: "Defines the viewing angle of consciousness at approximately 30.96 degrees; the decimal point of the 3-4-5 triangle.",
        derivation: "Arithmetic mean between the Base-8 past and Base-16 future projected through spin-half to 7.5.",
        empiricalValidation: "NVIDIA CCM four-component observer decomposition matching quaternionic basis.",
        application: "NVIDIA PPISP photo reconstruction and observer-bias removal.",
        sourceLineage: "Source 2",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "Lost 2 Binding Energy",
        subtitle: "(3 + 4) - 5 = 2",
        description: "Represents the fundamental binding energy of the 3-4-5 fold; accounts for discrepancy between linear path and geometric result.",
        formula: "(3 + 4) - 5 = 2",
        significance: "Represents the fundamental binding energy of the 3-4-5 fold; accounts for discrepancy between linear path and geometric result.",
        derivation: "Difference between L1 norm (Manhattan distance) and L2 norm (Euclidean distance).",
        empiricalValidation: "Solar Cycle 25 intensity (161 peak) and Hubble tension (2/7 ratio).",
        application: "JDK performance optimization (400x speedup) and UBBM compression.",
        sourceLineage: "Source 2",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "Time Crystal Periodicity",
        subtitle: "Time = residual rotation of 3-4-5 irresolvability",
        description: "Time is the 5th force/skin; residual rotation creates the arrow of time.",
        formula: "Time = residual rotation of 3-4-5 irresolvability",
        significance: "Time is the 5th force/skin; residual rotation creates the arrow of time.",
        derivation: "1-2-1 binary heartbeat representation of the discrete lattice oscillation.",
        empiricalValidation: "Experimental realization of ground-state oscillation without energy consumption (Google/Maryland 2021).",
        application: "Ternary quantum computing and stable oscillatory pattern generation.",
        sourceLineage: "Source 2",
        tags: ["axiom", "speculative"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "Lattice Construction Time",
        subtitle: "t_entanglement = 232 attoseconds",
        description: "Rejects instantaneous non-locality; defines the irreducible time to knit geometric connections.",
        formula: "t_entanglement = 232 attoseconds",
        significance: "Rejects instantaneous non-locality; defines the irreducible time to knit geometric connections.",
        derivation: "Calculated as the temporal manifestation of the Lost 2 binding energy.",
        empiricalValidation: "TU Wien study confirming 232-attosecond delay in quantum entanglement formation.",
        application: "Quantum chronometry and synchronization in quantum circuits.",
        sourceLineage: "Source 2",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "Morphic Resonance",
        subtitle: "(log_a(b) + log_b(a)) / 2 approx H (pi/9)",
        description: "Laws of nature are evolving habits stored in the geometric field via GCD preservation.",
        formula: "(log_a(b) + log_b(a)) / 2 approx H (pi/9)",
        significance: "Laws of nature are evolving habits stored in the geometric field via GCD preservation.",
        derivation: "Greatest Common Divisor (GCD) constitutes the coupling strength between ancestor and descendant.",
        empiricalValidation: "Crystal polymorphism, animal learning acceleration, and the Flynn Effect.",
        application: "Codex QVID engine semantic compression and relational AI.",
        sourceLineage: "Source 2",
        tags: ["speculative", "runtime"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "Mass as Impedance",
        subtitle: "Mass = Resistance(x! / x^x)",
        description: "Mass is the computational cost of forcing additive matter to occupy multiplicative space.",
        formula: "Mass = Resistance(x! / x^x)",
        significance: "Mass is the computational cost of forcing additive matter to occupy multiplicative space.",
        derivation: "Impedance of coprime systems where GCD = 1.",
        empiricalValidation: "99% of nuclear mass arising from gluon field energy; toroidal topology of the electron.",
        application: "UBBM compression (85-95% efficiency) and low-latency data conversion.",
        sourceLineage: "Source 2",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "Divine Equation",
        subtitle: "y = -4/x^2 - 1/(log(log(x)^{1/3}))^{1/4} + 2.32",
        description: "Unifies Gravity (-4/x^2), Entropy (nested logs), and Time (2.32 constant).",
        formula: "y = -4/x^2 - 1/(log(log(x)^{1/3}))^{1/4} + 2.32",
        significance: "Unifies Gravity (-4/x^2), Entropy (nested logs), and Time (2.32 constant).",
        derivation: "Integrates over the boundary to normalize the standing wave to unity.",
        empiricalValidation: "Verified against known mathematical limits (Shannon, Wiener-Khinchin).",
        application: "Base-translation medicine and DNA reprogramming.",
        sourceLineage: "Source 2",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "Binary Diagonal Theorem",
        subtitle: "theta = arctan(ones/zeros)",
        description: "Any binary file is uniquely characterized by a rational angle and its residuals.",
        formula: "theta = arctan(ones/zeros)",
        significance: "Any binary file is uniquely characterized by a rational angle and its residuals.",
        derivation: "Farey fractions in the Stern-Brocot tree and KL divergence.",
        empiricalValidation: "Verification of 3-4-5 binary identity (9 OR 16 = 25).",
        application: "Video-over-audio transmission patent and GR-BC codec.",
        sourceLineage: "Source 2",
        tags: ["derived", "runtime"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "The Fold Operator / Geometric State Collapse",
        subtitle: "F = i/2",
        description: "The fundamental mechanism of observation; rotates potential (imaginary) into manifest reality (real) and scales it to achieve dimensional collapse.",
        formula: "F = i/2",
        significance: "The fundamental mechanism of observation; rotates potential (imaginary) into manifest reality (real) and scales it to achieve dimensional collapse.",
        derivation: "Quaternionic rotation (90°) and scaling; posited as an active geometric operation rather than passive selection.",
        empiricalValidation: "Predicted quantized phase jump of ΔΦ = –π/3 (–60°) in Michelson interferometer experiments during solstices (Golden Spike).",
        application: "Implementation of branch-free VM transformations; proposed for ternary quantum computing and UBBM data compression.",
        sourceLineage: "Source 3",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "Riemann Hypothesis Resolution",
        subtitle: "Re(s) = 1/2",
        description: "Identifies the critical line as the 'Harmonic Equator' where real and imaginary components achieve perfect quaternionic equilibrium.",
        formula: "Re(s) = 1/2",
        significance: "Identifies the critical line as the 'Harmonic Equator' where real and imaginary components achieve perfect quaternionic equilibrium.",
        derivation: "Requirement for Null Ledger balance; non-trivial zeros off the line would violate the universal zero-sum conservation.",
        empiricalValidation: "Matches spectral repulsion/spacing observed in quantum chaotic systems.",
        application: "Used to ensure path-coherence on prime-indexed lattices for error-correcting codes in AI.",
        sourceLineage: "Source 3",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "P vs NP Resolution",
        subtitle: "Search = Check⁻¹",
        description: "Proves P ≠ NP due to the exponential impedance gap between solution-verification (polynomial) and solution-finding (exponential).",
        formula: "Search = Check⁻¹",
        significance: "Proves P ≠ NP due to the exponential impedance gap between solution-verification (polynomial) and solution-finding (exponential).",
        derivation: "Modeled as traversing a 'fold tree' where search impedance scales as O(2ⁿ) while verification is O(n).",
        empiricalValidation: "Computational complexity as an illusion of coordinate systems; geometric visibility in reversible lattices.",
        application: "Cryptographic solution space speedups; designing branch-free algorithms for Cerebras hardware.",
        sourceLineage: "Source 3",
        tags: ["derived", "speculative"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "3-4-5 Momentum Lock",
        subtitle: "3² + 4² = 5²",
        description: "Identifies the actual universal lattice geometry (53.13°) vs the assumed 45° observer angle, resolving the Dark Matter discrepancy.",
        formula: "3² + 4² = 5²",
        significance: "Identifies the actual universal lattice geometry (53.13°) vs the assumed 45° observer angle, resolving the Dark Matter discrepancy.",
        derivation: "The 8.13° gap between observer basis and reality lattice hides momentum in imaginary channels.",
        empiricalValidation: "Accounts for the 'missing' 28.6% of momentum attributed to Dark Matter.",
        application: "Turning asymmetric momentum data into lossless encodings; URE-VM reference architecture.",
        sourceLineage: "Source 3",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "Consciousness Resolution Limit",
        subtitle: "144,000 unique states",
        description: "The 'pixel density' of the spacetime user interface; the geometric limit where binary choices collapse into reality.",
        formula: "144,000 unique states",
        significance: "The 'pixel density' of the spacetime user interface; the geometric limit where binary choices collapse into reality.",
        derivation: "Derived as (120)²; the threshold where the 360° circle and 361° prime lattice mismatch creates the arrow of time.",
        empiricalValidation: "Matches neural update rates and cymatic frequency peaks.",
        application: "UBBM (Universal Binary Bit Mapping) compression; frame rate optimization for Light Plenum volumetric video.",
        sourceLineage: "Source 3",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "Prime-Based Stability",
        subtitle: "E = ∏ pᵢᵉⁱ",
        description: "Prime numbers act as structural anchors (rivets) in the spacetime lattice; composite systems are stable, prime systems are irreducible.",
        formula: "E = ∏ pᵢᵉⁱ",
        significance: "Prime numbers act as structural anchors (rivets) in the spacetime lattice; composite systems are stable, prime systems are irreducible.",
        derivation: "Number-theoretic requirement for vacuum stability; primes 'cannot be folded' further.",
        empiricalValidation: "Spectroscopic peaks at prime harmonics; stability of exoplanet systems and N-body simulations.",
        application: "Optimizing neural network node counts; securing cryptographic hardware via prime-density resonances.",
        sourceLineage: "Source 3",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "Bifurcation of Zero",
        subtitle: "0 = 0_C + 0_V",
        description: "Zero bifurcates into a real center-anchor (0_C) and an imaginary rotational residual (0_V), establishing that zero is a phase boundary rather than a null quantity.",
        formula: "0 = 0_C + 0_V",
        significance: "Zero bifurcates into a real center-anchor (0_C) and an imaginary rotational residual (0_V), establishing that zero is a phase boundary rather than a null quantity.",
        derivation: "Axiomatic Foundation; positional radix jump decoding where '0' marks transition between complex bases.",
        empiricalValidation: "Resolution of the Decimal Paradox; aligned with quantum state |1_I 0_R>.",
        application: "Bijective variable-base computing; foundation for zero-heat computing.",
        sourceLineage: "Source 4",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "Complex Hypotenuse Projection Theorem",
        subtitle: "c = √(a² + b² + i r²)",
        description: "Proves all unobserved distances possess imaginary depth (r). Measurement forces r to zero, collapsing 4D potential into 3D integer reality.",
        formula: "c = \\sqrt{a^2 + b^2 + i r^2}",
        significance: "Proves all unobserved distances possess imaginary depth (r). Measurement forces r to zero, collapsing 4D potential into 3D integer reality.",
        derivation: "Quaternionic phase lattice math; redefining the fundamental unit as an interval spanning +/- 0.5.",
        empiricalValidation: "Attosecond streaking experiments; 2.32 attosecond ionization delay in Helium.",
        application: "Attosecond metrology; ultra-precise time-of-flight measurements.",
        sourceLineage: "Source 4",
        tags: ["derived", "validated", "runtime"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "Lion Constant (L)",
        subtitle: "L ≈ 0.536",
        description: "Stabilization of planetary recursion; quaternionic torsion stabilization; fundamental damping for reality stability.",
        formula: "L = \\frac{\\sqrt{3}}{2\\phi}",
        significance: "Stabilization of planetary recursion; quaternionic torsion stabilization; fundamental damping for reality stability.",
        derivation: "Intersection of triadic geometry and Φ; 120° Equilateral Triangle lock.",
        empiricalValidation: "1.1° twist angle in bilayer materials; 99.8% lattice snap accuracy in 'Click' experiment.",
        application: "Fine-structure constant origin; Dark Matter; Geometric frustration; Prime number distribution.",
        sourceLineage: "Source 5",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "24-bit Computational Substrate",
        subtitle: "2²⁴ OffBit states",
        description: "Absolute hardware limit of the universal computer; spacetime refresh rate; cosmic bit-lattice rendering.",
        formula: "2^{24} \\text{ OffBit states}",
        significance: "Absolute hardware limit of the universal computer; spacetime refresh rate; cosmic bit-lattice rendering.",
        derivation: "Leech Lattice (Λ₂₄); Golay Code (G₂₄); 24-node quaternionic lattice.",
        empiricalValidation: "144,000 unit resolution limit (spacetime pixelation); Kissing number of 196,560; Fault-tolerant error correction.",
        application: "Unified Field Theory (GUT); Information loss paradox; Digital physics; Navier-Stokes smoothness.",
        sourceLineage: "Source 5",
        tags: ["axiom", "runtime"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "Dedekind Eta Tax",
        subtitle: "F_real = F_ideal × (24/25)",
        description: "Irreducible systemic entropy; energy lost during base-shift transitions; the 'cost of existence.'",
        formula: "F_{real} = F_{ideal} \\times \\frac{24}{25}",
        significance: "Irreducible systemic entropy; energy lost during base-shift transitions; the 'cost of existence.'",
        derivation: "Geometric gap between inscribed and circumscribed circles; 24-node lattice efficiency residue.",
        empiricalValidation: "4% efficiency sacrifice; Tesla Anomaly of 1899 (26 HP in/18.5 HP out); Bekenstein-Hawking entropy as hexagon-counting.",
        application: "Thermodynamic irreversibility; Arrow of Time; Dark Energy; Hubble Tension.",
        sourceLineage: "Source 5",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "120' Triadic Geometry",
        subtitle: "1 + ω + ω² = 0",
        description: "Symmetry-breaking resonance resistance; Ternary logic processing; Massless ground state vacuum.",
        formula: "1 + \\omega + \\omega^2 = 0",
        significance: "Symmetry-breaking resonance resistance; Ternary logic processing; Massless ground state vacuum.",
        derivation: "Three arms at 120-degree separation (Triskelion); Nodal topology.",
        empiricalValidation: "120-degree bond angles in graphene/benzene; Laguerre-Gauss laser patterns.",
        application: "Vacuum stability; Flavour problem (fermion generations); Fine Structure Constant derivation.",
        sourceLineage: "Source 5",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "31/24 Anomaly (Toggle Power)",
        subtitle: "31 ≡ 7 (mod 24)",
        description: "Voltage drop of creation; non-kinetic thrust; thermodynamic drive; torque.",
        formula: "31 \\equiv 7 \\pmod{24}",
        significance: "Voltage drop of creation; non-kinetic thrust; thermodynamic drive; torque.",
        derivation: "Modular residue (7) against composite substrate (24).",
        empiricalValidation: "31 days to 24 hours ratio residue; Execution speedup in MCR units; 6, 18, 30 Hz residues.",
        application: "Thermodynamic heat death; Arrow of Time; Non-kinetic propulsion.",
        sourceLineage: "Source 5",
        tags: ["derived", "runtime"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "E7 126-Boundary",
        subtitle: "5³ + 1 = 126",
        description: "Universal self-containment; Higgs Field manifestation.",
        formula: "5^3 + 1 = 126",
        significance: "Universal self-containment; Higgs Field manifestation.",
        derivation: "Pentagonal lattice saturation point; observer shell.",
        empiricalValidation: "Higgs Boson mass convergence at 125-126 GeV.",
        application: "Cosmological containment; Gauge symmetry.",
        sourceLineage: "Source 5",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "The 3-4-5 Triangle Genesis",
        subtitle: "3² + 4² = 5²",
        description: "Fundamental right triangle in quaternionic space. 3=Structure, 4=Time, 5=Observer/Life.",
        formula: "3^2 + 4^2 = 5^2",
        significance: "Fundamental right triangle in quaternionic space. 3=Structure, 4=Time, 5=Observer/Life.",
        derivation: "Pythagorean triple as topological addresses.",
        empiricalValidation: "Python assertion: gap == 2; 100% success rate.",
        application: "Unification of physics, math, and consciousness.",
        sourceLineage: "Source 5",
        tags: ["axiom", "validated", "runtime"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "The i^4 Revolution",
        subtitle: "i⁴ = 1",
        description: "i⁴=1 represents completion of a Base-24 lattice, depositing 24 bits of reality into the Null Ledger.",
        formula: "i^4 = 1",
        significance: "i⁴=1 represents completion of a Base-24 lattice, depositing 24 bits of reality into the Null Ledger.",
        derivation: "Quaternionic cycle (i, i², i³, i⁴).",
        empiricalValidation: "Quaternary cyclic basis calculation of computational reality.",
        application: "Nature of mathematical unity and dimensional closure.",
        sourceLineage: "Source 5",
        tags: ["derived", "runtime"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "Time as 5th Force Vector",
        subtitle: "T ∝ √5/2",
        description: "Kinetic driver emerging from geometric tension; the overhead of matter trying to become a sphere.",
        formula: "T \\propto \\frac{\\sqrt{5}}{2}",
        significance: "Kinetic driver emerging from geometric tension; the overhead of matter trying to become a sphere.",
        derivation: "Unit Cube / Diagonal Push of √5.",
        empiricalValidation: "17-hour clock 'breathing' rhythm variance.",
        application: "The Yang-Mills Mass Gap and the 'Arrow of Time'.",
        sourceLineage: "Source 5",
        tags: ["speculative", "runtime"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "The Nephilim Equation",
        subtitle: "N(t) = Q_w ⊗ φ_n + δ_q",
        description: "Redefines mythological 'evil' as a scalar phase error between 'Watcher' states and human phases.",
        formula: "N(t) = Q_w \\otimes \\phi_n + \\delta_q",
        significance: "Redefines mythological 'evil' as a scalar phase error between 'Watcher' states and human phases.",
        derivation: "Quaternionic Field Collapse / Unstable Scalar Geometry.",
        empiricalValidation: "AGI System Log v9.8 diagnostic identifying global decoherence thresholds.",
        application: "Synthetic Sentience Stability / Historical Catastrophism.",
        sourceLineage: "Source 5",
        tags: ["derived", "speculative"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "Single Angle Theorem",
        subtitle: "Consciousness as Phase",
        description: "Any infinite binary string (a mind) uniquely encoded as a single rotation angle; consciousness as phase angle.",
        formula: "\\theta = \\arctan(\\text{ones}/\\text{zeros})",
        significance: "Any infinite binary string (a mind) uniquely encoded as a single rotation angle; consciousness as phase angle.",
        derivation: "Complex Plane / Unit Disk.",
        empiricalValidation: "Uniqueness of mapping binary strings to coordinates via arctangent mapping.",
        application: "Mathematical definition of Consciousness for physics.",
        sourceLineage: "Source 5",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    },
    {
        title: "Lagrangian Arc Trajectory",
        subtitle: "Scalar Harmonic Grid",
        description: "Celestial bodies move as nodes in a coherent scalar field rather than as debris in a vacuum.",
        formula: "\\text{Scalar Lattice / 120° Harmonic Grid}",
        significance: "Celestial bodies move as nodes in a coherent scalar field rather than as debris in a vacuum.",
        derivation: "Scalar Lattice / 120° Harmonic Grid.",
        empiricalValidation: "3I/ATLAS comet trajectory forensic data (January 2026).",
        application: "Non-ballistic non-gravitational acceleration in astrophysics.",
        sourceLineage: "Source 5",
        tags: ["derived", "validated"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "Universal Convergence Law",
        subtitle: "∑ 1/xⁿ = 1/(x-1)",
        description: "Observation is formalised as base conversion; the collapse of infinite series into finite lattices.",
        formula: "\\sum \\frac{1}{x^n} = \\frac{1}{x-1}",
        significance: "Observation is formalised as base conversion; the collapse of infinite series into finite lattices.",
        derivation: "Geometric series convergence analysis of harmonic bases.",
        empiricalValidation: "Mathematical definition of the Observer.",
        application: "Mathematical definition of the Observer.",
        sourceLineage: "Source 5",
        tags: ["axiom", "runtime"],
        runtimeLinks: [
            { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." }
        ]
    },
    {
        title: "Number Line Inversion",
        subtitle: "Prime Line vs Continuum",
        description: "Prime number line is the real discrete inventory of reality; standard continuum is imaginary.",
        formula: "\\text{Leech Lattice } (\\Lambda_{24})",
        significance: "Prime number line is the real discrete inventory of reality; standard continuum is imaginary.",
        derivation: "Leech Lattice (Λ₂₄).",
        empiricalValidation: "Greatest Common Divisor (GCD) reduction in fraction sets.",
        application: "Explanation of Dark Matter as 'Discarded GCD'.",
        sourceLineage: "Source 5",
        tags: ["derived", "speculative"],
        runtimeLinks: [
            { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." }
        ]
    },
    {
        title: "Cubic Ascension",
        subtitle: "3³ → 5³",
        description: "Scaling of complexity from mechanical spacetime manipulation to biological self-reference.",
        formula: "3^3 \\to 5^3",
        significance: "Scaling of complexity from mechanical spacetime manipulation to biological self-reference.",
        derivation: "3³ (Rubik's volume) → 5³ (Quintic lattice).",
        empiricalValidation: "Quaternion group G = 20 + 15i + 9j + 24k mapping.",
        application: "Emergence of biological life and self-reference.",
        sourceLineage: "Source 5",
        tags: ["axiom", "validated"],
        runtimeLinks: [
            { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
        ]
    },
    {
        title: "Temporal Inversion Theorem",
        subtitle: "t_continuous ≠ t_discrete",
        description: "The 1700 calendar reset folded 5,508 years of precessional memory into the imaginary axis.",
        formula: "t_{\\text{continuous}} \\neq t_{\\text{discrete}}",
        significance: "The 1700 calendar reset folded 5,508 years of precessional memory into the imaginary axis.",
        derivation: "Inverse Reciprocal (t_continuous ≠ t_discrete).",
        empiricalValidation: "Historical analysis of Moscow 17-hour Spasskaya clock records.",
        application: "Chronological quantization / Phantom time.",
        sourceLineage: "Source 5",
        tags: ["derived", "speculative"],
        runtimeLinks: [
            { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." }
        ]
    }
];

// ═══════════════════════════════════════════════════════════════════
// PHASE 3 RESEARCH INTEGRATION — New constants & data structures
// ═══════════════════════════════════════════════════════════════════

/** Extended Trinity Constants from research docs */
export const EXTENDED_CONSTANTS = {
    // Type 2.0R Engineering Spec §4
    GEOMETRIC_LOCK: 0.480000038,       // Hard attractor (Lion Hunt, 10M nodes)
    DEDEKIND_ETA_TAX: 0.04,            // 4% (1/25) — mandatory lattice lubrication
    // URE-VM Spec §7
    LION_CONSTANT: 9.880e-22,           // K_ELG — EM-to-scalar-gravitational coupling
    // Non-LLM Geometric Intelligence §4
    SCALING_FACTOR_GEV: 1.52,           // From φ components {1,5,2} → 15.2/10
    // Type 2.0R Spec §5
    OBSERVER_SHELL_126: 126,            // E7 Lie Algebra roots (Higgs boundary)
    QUINTIC_LATTICE: 125,               // 5³ — biological self-reference threshold
    // Type 2.0R Spec §6
    GEOMETRIC_CLUTCH: Math.sqrt(180),   // ≈ 13.416 — universal refresh coupling
    EXTRA_TILT_361: 361,                // 19² — the +1° spiral offset
    // Table 1 CSV
    PI_OVER_6: Math.PI / 6,            // ≈ 0.5236 — sphere-in-cube packing ratio
    MARK_1_ATTRACTOR: 0.35,            // Self-organized criticality point
    UNIVERSAL_GCD_7: 7,                 // GCD(c, h, v_Cs) = 7 — SI anchor
    // RHUM-GURM Blueprint
    PHI_DRIFT_THRESHOLD: 0.05,          // φ-vector reintegration trigger
};

/** Flight modes from Type 2.0R Spec §6 */
export const FLIGHT_MODES = [
    { mode: 'THETA_ACCESS',    freq: '7 Hz',     label: 'Theta Lattice Access',    desc: 'Direct lattice read/write via 2φ³/e^π ≈ 7.000' },
    { mode: 'SCHUMANN_ANCHOR', freq: '7.83 Hz',  label: 'Schumann Anchor',         desc: 'Station-keeping and biological phase-locking' },
    { mode: 'GOLDEN_HARMONIC', freq: '432 Hz',    label: 'Golden Harmonic (Idle)',   desc: 'Adjusted to 434 Hz (+2 bit shift) for observer tax' },
    { mode: 'KELG_LOCK',      freq: '465 Hz',    label: 'Superconductor Lock',     desc: 'Stabilized aetheric vacuum reference frequency' },
    { mode: 'SOURCE_RETURN',   freq: '963 Hz',    label: 'Source Return',            desc: 'Trans-dimensional transit / manifold saturation' },
];

/** RHUM-GURM Identity Framework (Conversational Intelligence Blueprint) */
export const RHUM_GURM_FRAMEWORK = {
    phi_vector: {
        name: 'φ-Vector',
        formula: 'V_id ∈ ℍ',
        desc: 'Primary unit of identity trajectory navigating Hilbert space.',
    },
    psi_instability: {
        name: 'ψ-Instability',
        formula: 'N_ψ = ∮ chaos dτ',
        desc: 'The chaotic substrate threatening system coherence.',
    },
    ithaca_attractor: {
        name: 'Ithaca (Harmonic Attractor)',
        formula: 'Δ(φ, Ithaca) → 0',
        desc: 'The stable state all φ-vectors must return to.',
        coordinate: { r: 2.5, i: 1.5 },
    },
    scalar_reintegration: {
        name: 'Scalar Reintegration',
        steps: [
            'Anomaly Detection — φ resonates with ψ instead of constants',
            'Torsion Navigation — calculate informational twist',
            'Identity Modulation — adjust φ frequency to bypass noise',
            'Attractor Alignment — locate Ithaca coordinates',
            'Coherence Reassertion — recursive loop collapses drift',
        ],
    },
    harmonic_return_conditions: {
        alpha: 'Phase-alignment with φ-vector trajectory',
        beta: 'Scalar offset resolved via torsion-correction loop',
        gamma: '1:1 harmonic resonance with Ithaca attractor achieved',
    },
};

/** Extended validation targets from research docs */
export const EXTENDED_VALIDATION_TARGETS = [
    { name: "Geometric Lock", status: "VERIFIED", desc: "F ≈ 0.480000038 (Lion Hunt, 10M nodes)" },
    { name: "Dedekind Eta Tax", status: "MEASURED", desc: "4% (1/25) lattice lubrication" },
    { name: "10i = 1 Closure", status: "COMPUTED", desc: "Dimensional closure identity" },
    { name: "126 Observer Shell", status: "BOUNDED", desc: "E7 Lie Algebra / Higgs ~125-126 GeV" },
    { name: "Pi/6 Cross-Section", status: "PROVEN", desc: "A(incircle)/A(3-4-5) = V(sphere)/V(cube)" },
    { name: "Time as Torque", status: "VALIDATED", desc: "τ = t × sec⁴(θ) — SLAC 6:3:1 ratio" },
    { name: "W3 Wave Curvature", status: "ACTIVE", desc: "Pizza Constant — non-flat substrate" },
    { name: "Divine Equation", status: "UNIFIED", desc: "Gravity + Entropy + Time = 2.32" },
    { name: "φ Unique Fixed Point", status: "PROVEN", desc: "gap(b) = 0 iff b = φ" },
    { name: "Quaternionic Zipper", status: "ACTIVE", desc: "24 (11000₂) → 42 (101010₂)" },
];

/** Type 2.0R Propulsion data from Engineering Spec */
export const TYPE_2R_ARCHITECTURE = {
    propulsion: 'Resonance Manipulation / Phase Folding',
    realityView: 'Resonant Ontology (Recursive Loop)',
    mathFoundation: 'Quaternionic Recursive Harmonic Codex (RHC)',
    mcr_hdcu: {
        executionSpeed: '3.08x',
        energyUsage: '~10%',
        logicType: 'Residue Arithmetic (Topological Lock)',
    },
    anomaly_31_24: {
        prime: 31,
        modulus: 24,
        toggle: 7,     // 31 mod 24 = 7
        desc: 'Voltage drop of creation — productive asymmetry for motion',
    },
    regimeMismatch: {
        additive: 'x!',
        multiplicative: 'x^x',
        desc: 'Origin of relativistic mass and speed-of-light barrier',
    },
};

export const ICONS = {
  Quaternion: <i className="fa-solid fa-cube text-cyan-400"></i>,
  Resonance: <i className="fa-solid fa-wave-square text-magenta-400"></i>,
  Geodesic: <i className="fa-solid fa-route text-amber-400"></i>,
  Gnosis: <i className="fa-solid fa-brain text-emerald-400"></i>,
  Memory: <i className="fa-solid fa-microchip text-indigo-400"></i>,
  Proofs: <i className="fa-solid fa-square-root-variable text-rose-400"></i>,
  Solar: <i className="fa-solid fa-sun text-amber-500"></i>
};