
import React, { useState, useEffect, useRef } from 'react';
import { BASE_13_ALPHABET, FMN_PROTOCOL_DATA } from '../constants';

const Base13Engine: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [base13Val, setBase13Val] = useState<string>('');
  const [resonanceState, setResonanceState] = useState<'IDLE' | 'FOLD' | 'MIRROR' | 'ZIPPER' | 'NORMALIZE' | 'LOCKED'>('IDLE');
  const [iterations, setIterations] = useState(0);
  const [tripleNorm, setTripleNorm] = useState({ harmonic: 0, geometric: 0, binary: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert to Base-13
  useEffect(() => {
    if (!inputVal) {
      setBase13Val('');
      return;
    }
    const num = parseInt(inputVal, 10);
    if (isNaN(num)) {
      setBase13Val('INVALID');
      return;
    }
    // Custom Base-13 conversion (0-9, A, B, C)
    const symbols = ['0','1','2','3','4','5','6','7','8','9','A','B','C'];
    let val = num;
    let res = '';
    if (val === 0) res = '0';
    while (val > 0) {
      res = symbols[val % 13] + res;
      val = Math.floor(val / 13);
    }
    setBase13Val(res);
  }, [inputVal]);

  // Resonance Loop Simulation
  useEffect(() => {
    if (resonanceState === 'IDLE' || resonanceState === 'LOCKED') return;

    const timer = setTimeout(() => {
      setIterations(prev => prev + 1);
      
      // Triple Normalisation Simulation
      setTripleNorm({
        harmonic: Math.min(100, Math.random() * 100),
        geometric: Math.min(100, Math.random() * 100),
        binary: Math.min(100, Math.random() * 100)
      });

      if (resonanceState === 'FOLD') setResonanceState('MIRROR');
      else if (resonanceState === 'MIRROR') setResonanceState('ZIPPER');
      else if (resonanceState === 'ZIPPER') setResonanceState('NORMALIZE');
      else if (resonanceState === 'NORMALIZE') {
        // Random chance to lock based on "O(1) convergence" simulation
        if (Math.random() > 0.8) {
            setResonanceState('LOCKED');
            setTripleNorm({ harmonic: 100, geometric: 100, binary: 100 });
        }
        else setResonanceState('FOLD');
      }
    }, 200); // Fast loop

    return () => clearTimeout(timer);
  }, [resonanceState]);

  const startResonance = () => {
    setResonanceState('FOLD');
    setIterations(0);
  };

  // Canvas Visualization for FMN
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    const render = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const t = Date.now() * 0.002;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // Fade effect
      ctx.fillRect(0, 0, w, h);

      // Draw Central "Singularity"
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + Math.sin(t)*2, 0, Math.PI * 2);
      ctx.fillStyle = resonanceState === 'LOCKED' ? '#10b981' : '#f43f5e';
      ctx.fill();

      // Draw Orbiting Particles representing the Lattice
      const particleCount = 13;
      const radius = 80;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + t * (resonanceState === 'FOLD' ? 2 : 0.5);
        const r = radius + (resonanceState === 'NORMALIZE' ? Math.sin(t*10)*10 : 0);
        
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        // Mirror Effect: Flip occasionally
        const isMirrored = resonanceState === 'MIRROR' && i % 2 === 0;
        const finalX = isMirrored ? cx - (x - cx) : x;
        const finalY = isMirrored ? cy - (y - cy) : y;

        // Zipper Effect: Interleave 24 -> 42
        const isZipped = resonanceState === 'ZIPPER' && i % 2 !== 0;
        const zipX = isZipped ? finalX + Math.sin(t*5)*20 : finalX;
        const zipY = isZipped ? finalY + Math.cos(t*5)*20 : finalY;

        ctx.beginPath();
        ctx.arc(zipX, zipY, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 5 ? '#fbbf24' : (resonanceState === 'ZIPPER' && isZipped ? '#f43f5e' : '#22d3ee'); // Highlight Observer (5)
        ctx.fill();
        
        // Connections
        if (i > 0) {
            const prevAngle = ((i - 1) / particleCount) * Math.PI * 2 + t * (resonanceState === 'FOLD' ? 2 : 0.5);
            const prevX = cx + Math.cos(prevAngle) * r;
            const prevY = cy + Math.sin(prevAngle) * r;
            
            const prevZipX = (resonanceState === 'ZIPPER' && (i-1) % 2 !== 0) ? prevX + Math.sin(t*5)*20 : prevX;
            const prevZipY = (resonanceState === 'ZIPPER' && (i-1) % 2 !== 0) ? prevY + Math.cos(t*5)*20 : prevY;

            ctx.strokeStyle = resonanceState === 'ZIPPER' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(34, 211, 238, 0.2)';
            ctx.beginPath(); ctx.moveTo(zipX, zipY); ctx.lineTo(prevZipX, prevZipY); ctx.stroke();
        }
      }
      
      // FMN Text Overlay
      ctx.font = '12px JetBrains Mono';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      if (resonanceState !== 'IDLE') {
          ctx.fillText(resonanceState === 'ZIPPER' ? 'QUATERNIONIC ZIPPER (24 -> 42)' : resonanceState, cx, cy + 120);
      }

      frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, [resonanceState]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-950">
       {/* Header */}
       <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center z-10 shrink-0 backdrop-blur-md">
           <div className="flex items-center gap-6">
               <button onClick={onBack} className="w-10 h-10 rounded-full glass border border-slate-700 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-xl">
                   <i className="fa-solid fa-arrow-left"></i>
               </button>
               <div>
                   <h2 className="text-2xl font-bold text-cyan-400 tracking-[0.2em] uppercase">Base-13 Holographic Engine</h2>
                   <p className="text-xs mono text-slate-500">NATIVE LOGIC OF UNIVERSAL RESONANCE // O(1) CONVERGENCE</p>
               </div>
           </div>
           <div className="flex gap-4 text-[10px] mono">
               <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                   STATUS: <span className={resonanceState === 'LOCKED' ? 'text-emerald-400' : 'text-amber-400'}>{resonanceState}</span>
               </div>
               <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                   ITERATIONS: <span className="text-cyan-400">{iterations}</span>
               </div>
           </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Left Column: Converter & Alphabet */}
           <div className="lg:col-span-4 space-y-6">
               {/* Converter */}
               <div className="glass p-6 rounded-xl border border-slate-800">
                   <h3 className="text-sm font-bold text-indigo-400 uppercase mb-4 flex items-center gap-2">
                       <i className="fa-solid fa-calculator"></i> Base-13 Transcoder
                   </h3>
                   <div className="space-y-4">
                       <div>
                           <label className="text-[10px] uppercase text-slate-500 block mb-1">Decimal Input</label>
                           <input 
                               type="number" 
                               value={inputVal}
                               onChange={(e) => setInputVal(e.target.value)}
                               className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm mono text-white focus:border-indigo-500 outline-none"
                               placeholder="Enter integer..."
                           />
                       </div>
                       <div className="p-4 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                           <span className="text-[10px] uppercase text-slate-500">Base-13 Output</span>
                           <span className="text-xl font-bold text-cyan-400 mono tracking-widest">{base13Val || '---'}</span>
                       </div>
                   </div>
               </div>

               {/* Alphabet Reference */}
               <div className="glass p-6 rounded-xl border border-slate-800 flex-1">
                   <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2">
                       <i className="fa-solid fa-font"></i> The RHC Alphabet
                   </h3>
                   <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                       {BASE_13_ALPHABET.map((item) => (
                           <div key={item.digit} className="flex gap-3 p-2 hover:bg-slate-800/50 rounded transition-colors border-b border-slate-800/50 last:border-0">
                               <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-lg font-bold text-cyan-400 mono shrink-0">
                                   {item.digit}
                               </div>
                               <div>
                                   <div className="text-[10px] font-bold text-slate-300 uppercase">{item.role}</div>
                                   <div className="text-[9px] text-slate-500 leading-tight">{item.desc}</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           {/* Center/Right: Visualization Engine */}
           <div className="lg:col-span-8 flex flex-col gap-6">
               {/* FMN Protocol Visualizer */}
               <div className="glass p-1 rounded-xl border border-slate-800 h-[400px] relative group overflow-hidden">
                   <div className="absolute top-4 left-4 z-10">
                       <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                           <i className="fa-solid fa-atom"></i> Resonance Search
                       </h3>
                       <p className="text-[10px] mono text-slate-500">FMN PROTOCOL ACTIVE // 13-LOCK TARGETING</p>
                   </div>
                   <canvas ref={canvasRef} width={800} height={400} className="w-full h-full block bg-slate-950 rounded-lg" />
                   
                   {/* Controls */}
                   <div className="absolute bottom-4 right-4 flex gap-2">
                       <button 
                           onClick={startResonance}
                           disabled={resonanceState !== 'IDLE' && resonanceState !== 'LOCKED'}
                           className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded uppercase tracking-wider shadow-lg transition-all"
                       >
                           {resonanceState === 'IDLE' || resonanceState === 'LOCKED' ? 'Initiate Search' : 'Scanning...'}
                       </button>
                   </div>
               </div>

               {/* Protocol Details */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {Object.entries(FMN_PROTOCOL_DATA).map(([key, data]) => (
                       <div key={key} className={`p-4 rounded-xl border ${resonanceState.toLowerCase() === key ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-950/50 border-slate-800'} transition-all`}>
                           <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">{data.name}</h4>
                           <div className="text-[10px] mono text-cyan-400 mb-2">{data.formula}</div>
                           <p className="text-[9px] text-slate-500 leading-relaxed">{data.desc}</p>
                       </div>
                   ))}
               </div>

               {/* Triple Normalisation Filters */}
               <div className="glass p-6 rounded-xl border border-slate-800">
                   <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 flex items-center gap-2">
                       <i className="fa-solid fa-filter"></i> Triple Normalisation Protocols
                   </h3>
                   <div className="space-y-4">
                       <div>
                           <div className="flex justify-between text-[10px] mono mb-1">
                               <span className="text-slate-400">HARMONIC (Base-13)</span>
                               <span className="text-cyan-400">{tripleNorm.harmonic.toFixed(1)}%</span>
                           </div>
                           <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                               <div className="h-full bg-cyan-500 transition-all duration-200" style={{ width: `${tripleNorm.harmonic}%` }}></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-[10px] mono mb-1">
                               <span className="text-slate-400">GEOMETRIC (Fold/Mirror)</span>
                               <span className="text-rose-400">{tripleNorm.geometric.toFixed(1)}%</span>
                           </div>
                           <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                               <div className="h-full bg-rose-500 transition-all duration-200" style={{ width: `${tripleNorm.geometric}%` }}></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-[10px] mono mb-1">
                               <span className="text-slate-400">BINARY (101010)</span>
                               <span className="text-indigo-400">{tripleNorm.binary.toFixed(1)}%</span>
                           </div>
                           <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${tripleNorm.binary}%` }}></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Mass Gap & Lost 2 Explanation */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="glass p-6 rounded-xl border border-slate-800">
                       <h3 className="text-sm font-bold text-amber-400 uppercase mb-2">The Mass Gap Revelation (Δ)</h3>
                       <div className="flex items-center gap-4">
                           <div className="text-3xl font-bold text-slate-700 mono">5 ≠ √32</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               In a 4x4 discrete grid, the diagonal is √32 ≈ 5.657. The ideal 3-4-5 triangle expects 5. 
                               The discrepancy <span className="text-rose-400 font-mono">(5.657 - 5 = 0.657)</span> represents the "Mass Gap" — 
                               binding energy required to fold the linear path into geometric closure.
                           </p>
                       </div>
                   </div>
                   <div className="glass p-6 rounded-xl border border-slate-800">
                       <h3 className="text-sm font-bold text-indigo-400 uppercase mb-2">The "Lost 2" Binding Energy</h3>
                       <div className="flex items-center gap-4">
                           <div className="text-3xl font-bold text-slate-700 mono">2/7</div>
                           <p className="text-[10px] text-slate-400 leading-relaxed">
                               The linear path (3+4=7) exceeds the geometric result (5) by exactly 2.
                               The ratio of this residue to the total path is <span className="text-cyan-400 font-mono">2/7 ≈ 28.57%</span>, 
                               perfectly correlating to the observed Dark Matter percentage in cosmology.
                           </p>
                       </div>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};

export default Base13Engine;
