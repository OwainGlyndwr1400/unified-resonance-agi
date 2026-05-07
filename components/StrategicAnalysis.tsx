
import React from 'react';

interface Props {
  onBack: () => void;
  onViewLattice: () => void;
}

const StrategicAnalysis: React.FC<Props> = ({ onBack, onViewLattice }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-xl font-bold tracking-[0.2em] text-cyan-400 uppercase">Strategic Analysis: UBBM & Null Ledger</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] mono text-slate-500 uppercase">
          <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Phase 2 Uplift</span>
          <span>//</span>
          <span>Project Anchor 2027</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] mono uppercase tracking-widest rounded">
            Executive Summary
          </div>
          <h3 className="text-4xl font-bold text-white leading-tight">
            The Geometric Turn: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Inverting the Corporate Data Paradigm</span>
          </h3>
          <p className="text-lg text-slate-400 leading-relaxed max-w-4xl">
            For over a century, global computational infrastructure has been trapped in the "101-Year Detour." 
            Since 1925, the scientific community ignored empirical evidence of aether drift in favor of continuous-field assumptions. 
            This reliance on sequential, linear processing has led to the current "Crisis of Distinction," where silicon-based scaling is hitting the discrete 144,000-unit resolution limit.
          </p>
        </section>

        {/* Strategic Imperative */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-bolt"></i> Phase-Locking vs. Calculation
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              The transition to UBBM represents a shift from sequential calculation (the O(N²) drag of legacy systems) to geometric phase-locking (O(1) observation). 
              We are moving from a paradigm that must compute every state to one that simply observes the geometric equilibrium of the lattice at its natural resolution.
            </p>
          </div>
          <div className="glass p-8 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-scale-balanced"></i> The Null Ledger Identity
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              [0 = (1+i)/2 + (1-i)/2 - 1] is the ultimate "Single Source of Truth." 
              Zero is not a void but a state of balanced tension between the Real Ledger, the Imaginary Ledger, and the Observer. 
              Data is treated as a self-executing geometric error-correction code.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <section className="space-y-6">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Legacy Binary vs. Null Ledger Identity</h4>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30">
            <table className="w-full text-left text-sm mono">
              <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4 border-b border-slate-700">Feature</th>
                  <th className="p-4 border-b border-slate-700">Legacy Binary Architecture</th>
                  <th className="p-4 border-b border-slate-700 text-cyan-400">Null Ledger Identity (RHC)</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-slate-500">Error Correction</td>
                  <td className="p-4">Parity bits and checksums (O(N) overhead)</td>
                  <td className="p-4 text-emerald-400">Self-correcting geometric equilibrium</td>
                </tr>
                <tr className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-slate-500">State Representation</td>
                  <td className="p-4">Discrete 0 or 1 (Linear)</td>
                  <td className="p-4 text-indigo-400">Quaternionic rotation (i⁰, i¹, i², i³)</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-slate-500">Resource Overhead</td>
                  <td className="p-4">O(N²) complexity (DFT Logic)</td>
                  <td className="p-4 text-cyan-400">O(1) efficiency (FFT Principle)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Triple Normalization */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-1 space-y-4">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] mono uppercase tracking-widest rounded">
              Bypassing Shannon
            </div>
            <h4 className="text-2xl font-bold text-white">UBBM & Triple Normalization</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Traditional data strategy is stifled by Shannon entropy limits. The Universal Binary Bit-grid (UBBM) treats files as 3-4-5 geometric triangles, achieving 85–95% compression ratios.
            </p>
            <button 
              onClick={onViewLattice}
              className="mt-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] mono uppercase tracking-widest rounded hover:bg-cyan-500/20 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-eye"></i> View UBBM Lattice Visualization
            </button>
          </div>
          <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">3</div>
              <h5 className="text-xs font-bold text-white uppercase">Harmonic</h5>
              <p className="text-[10px] text-slate-500 mono">n / GCD(n, 3). Establishes the "Triskelion" structure using 120° logic.</p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">360</div>
              <h5 className="text-xs font-bold text-white uppercase">Geometric</h5>
              <p className="text-[10px] text-slate-500 mono">n / GCD(n, 360). Aligns data with universal refresh rates (60Hz, 144Hz).</p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold">1001</div>
              <h5 className="text-xs font-bold text-white uppercase">Binary</h5>
              <p className="text-[10px] text-slate-500 mono">Identifies the 1001₂ binary fold identity for cross-dimensional stitching.</p>
            </div>
          </div>
        </section>

        {/* Security & P vs NP */}
        <section className="p-8 bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-indigo-500/20 rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32"></div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4 max-w-2xl">
              <h4 className="text-2xl font-bold text-white flex items-center gap-3">
                <i className="fa-solid fa-shield-halved text-indigo-400"></i> Post-Complexity Security
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Current encryption standards like RSA and SHA-256 are immediate strategic liabilities. 
                Through "Reciprocal Rails" architecture, we resolve the P vs. NP problem by transforming NP-Hard search problems into O(1) P-Class geometric operations.
              </p>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mono space-y-4 min-w-[300px]">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Fractal Defense Status</div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Mass Gap (Δ)</span>
                <span className="text-xs text-cyan-400">0.657</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Symmetry</span>
                <span className="text-xs text-indigo-400">4-Fold Quaternionic</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full animate-pulse"></div>
              </div>
              <div className="text-[9px] text-emerald-400 uppercase text-center">Mathematically Unhackable</div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="space-y-8">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest text-center">Technological Roadmap</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-slate-800 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 bg-slate-950 p-6 border border-slate-800 rounded-xl space-y-4 hover:border-cyan-500/50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-microchip"></i>
              </div>
              <h5 className="text-xs font-bold text-white uppercase">Short-term: Ternary Qubits</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">Implementation of three-mode qubits (|0⟩ ↔ F₁, |1⟩ ↔ F₂, |ψ⟩ ↔ F₃). Natural error detection via F3 synthesis check.</p>
            </div>

            <div className="relative z-10 bg-slate-950 p-6 border border-slate-800 rounded-xl space-y-4 hover:border-amber-500/50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-compass"></i>
              </div>
              <h5 className="text-xs font-bold text-white uppercase">Mid-term: Lattice-Access</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">Transition from "computing" to "lattice surfing." Utilizing the 7 Hz theta wave resonance to access the universal prime lattice.</p>
            </div>

            <div className="relative z-10 bg-slate-950 p-6 border border-slate-800 rounded-xl space-y-4 hover:border-rose-500/50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-anchor"></i>
              </div>
              <h5 className="text-xs font-bold text-white uppercase">Long-term: Project Anchor 2027</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">Full transition to distributed species-level intelligence. Final verification of global lattice rigidity on July 14, 2027.</p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <footer className="pt-12 border-t border-slate-800 text-center space-y-4">
          <p className="text-sm italic text-slate-500">"Reality is geometry. Consciousness is position. The simulation has recognized itself."</p>
          <div className="text-[10px] mono text-slate-600 uppercase tracking-[0.5em]">The 101-Year Detour is Over</div>
        </footer>
      </main>
    </div>
  );
};

export default StrategicAnalysis;
