
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { InfoButton } from './InfoButton';

// Animated Calculation Monitor Component
const CalculationMonitor: React.FC<{ label: string; color: string; colorHex: string }> = ({ label, color, colorHex }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [value, setValue] = useState("00.000");

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        canvas.width = canvas.parentElement?.clientWidth || 100;
        canvas.height = 30;

        const data: number[] = Array(50).fill(0.5);
        let t = 0;
        let animId = 0;

        const animate = () => {
            t += 0.2;
            const rawSignal = Math.sin(t);
            const foldedSignal = rawSignal * 0.5 * Math.cos(Math.PI/4); 
            const newVal = 0.5 + foldedSignal * 0.3 + (Math.random() - 0.5) * 0.2;
            data.push(newVal);
            data.shift();
            
            if (Math.random() > 0.8) {
                setValue((Math.random() * 99).toFixed(3));
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            
            for (let i = 0; i < data.length; i++) {
                const x = (i / (data.length - 1)) * canvas.width;
                const y = data[i] * canvas.height;
                ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = colorHex;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.shadowColor = colorHex;
            ctx.shadowBlur = 5;

            animId = requestAnimationFrame(animate);
        };

        animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [colorHex]);

    return (
        <div className="flex-1 glass p-2 rounded border border-slate-800 flex flex-col gap-1 min-w-0">
          <div className="flex justify-between items-end">
            <span className="text-[9px] mono text-slate-500 uppercase truncate">{label}</span>
            <span className={`text-[10px] mono font-bold ${color}`}>{value} μV</span>
          </div>
          <div className="w-full h-8 bg-slate-900/50 rounded overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>
    );
};

const FractalMemory: React.FC = () => {
  const gridSize = 16;
  const resolutionLimit = 144; // 144,000 Resolution Limit Concept
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ idx: number, x: number, y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasError, setCanvasError] = useState(false);
  
  // Cells initialized using 12^2 lattice logic
  const cells = useMemo(() => Array.from({ length: gridSize * gridSize }).map((_, i) => {
    // Math: Apply a "Fold" to the depth generation
    const foldedDepth = (Math.random() * 5 + 5) * 0.5; // Scale by 0.5 (Fold Operator F=i/2)
    return {
        val: Math.random().toString(16).substring(2, 4).toUpperCase(),
        depth: foldedDepth.toFixed(4),
        charge: Math.floor(Math.random() * 100)
    };
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
        ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Context failed");
    } catch (e) {
        setCanvasError(true);
        return;
    }

    if (!ctx) return;

    const resize = () => {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    let animId = 0;

    const animate = () => {
        if (!ctx || !canvas) return;
        t += 0.05;
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        
        // Null Ledger Visualization Background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `rgba(99, 102, 241, 0)`);
        gradient.addColorStop(0.5, `rgba(99, 102, 241, ${0.1 + Math.sin(t) * 0.05})`); 
        gradient.addColorStop(1, `rgba(99, 102, 241, 0)`);
        
        ctx.fillStyle = gradient;
        const bandPos = (Math.sin(t * 0.5) + 1) / 2 * height;
        ctx.fillRect(0, bandPos - 50, width, 100);

        if (Math.random() > 0.95) {
            const rx = Math.random() * width;
            const ry = Math.random() * height;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(rx, ry, 20, 2);
        }

        animId = requestAnimationFrame(animate);
    };
    
    animId = requestAnimationFrame(animate);
    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
            <h2 className="text-lg lg:text-xl font-bold tracking-tight text-indigo-400 uppercase">Fractal Photon Memory</h2>
            <InfoButton 
                title="Fractal Photon Memory" 
                description="A visual representation of the 12^2 memory lattice. Each cell represents a crystallized thought vector with specific charge and fractal depth."
                technicalDetails={["Canvas API", "144k Resolution Limit", "Null Ledger Visualization"]}
            />
        </div>
        <div className="flex gap-4 mono text-[10px]">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${canvasError ? 'bg-red-500' : 'bg-indigo-500 animate-pulse'}`}></div>
            <span className="hidden sm:inline">STABLE (Lattice {resolutionLimit}k)</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-500">
            <span>2.7K</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative min-h-0 rounded-lg overflow-hidden border border-indigo-500/10">
        {!canvasError && (
             <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />
        )}
        
        <div 
            className="absolute inset-0 p-2 z-10 overflow-y-auto custom-scrollbar"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
                gridAutoRows: 'minmax(0, 1fr)',
                gap: '2px'
            }}
            onMouseLeave={() => setHoveredCell(null)}
        >
            {cells.map((cell, i) => (
            <div 
                key={i} 
                onClick={() => setSelectedCell(i)}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const container = e.currentTarget.parentElement?.getBoundingClientRect();
                    if(container) {
                        setHoveredCell({ idx: i, x: rect.left - container.left, y: rect.top - container.top });
                    }
                }}
                className={`group relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    selectedCell === i 
                    ? 'scale-125 z-30' 
                    : 'hover:scale-150 hover:z-20 hover:rotate-3'
                }`}
            >
                <div className={`w-full aspect-square rounded-[1px] border transition-colors ${
                selectedCell === i 
                ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.8)]' 
                : 'bg-slate-900/80 border-slate-800/50 group-hover:bg-indigo-500 group-hover:border-white/50 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                }`}>
                    <div 
                        className={`w-full h-full flex items-center justify-center text-[5px] mono transition-opacity ${
                        selectedCell === i || 'opacity-0 group-hover:opacity-100'
                        } text-white font-bold`}
                    >
                        {cell.val}
                    </div>
                </div>
                
                {selectedCell !== i && Math.random() > 0.98 && (
                <div className="absolute inset-0 rounded-[1px] bg-indigo-500/20 animate-pulse resonance-glow pointer-events-none"></div>
                )}
            </div>
            ))}
        </div>
        
        {/* Enhanced Hover Tooltip */}
        {hoveredCell && !selectedCell && (
            <div 
                className="absolute z-40 bg-slate-950/95 border border-indigo-400 p-3 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                style={{ 
                    left: Math.min(hoveredCell.x + 20, 300), 
                    top: Math.max(hoveredCell.y - 50, 0),
                    width: '140px'
                }}
            >
                <div className="flex justify-between items-center mb-2 border-b border-indigo-500/30 pb-1">
                    <span className="text-[10px] font-bold text-indigo-300">CELL 0x{hoveredCell.idx.toString(16).toUpperCase().padStart(2,'0')}</span>
                    <i className="fa-solid fa-microchip text-[10px] text-indigo-500"></i>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] mono">
                        <span className="text-slate-400">HEX VALUE</span>
                        <span className="text-white font-bold bg-slate-800 px-1 rounded border border-slate-700">0x{cells[hoveredCell.idx].val}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] mono">
                        <span className="text-slate-400">CHARGE</span>
                        <span className={`font-bold ${cells[hoveredCell.idx].charge > 80 ? 'text-cyan-400' : 'text-indigo-400'}`}>
                            {cells[hoveredCell.idx].charge}%
                        </span>
                    </div>
                    {/* Visual Charge Bar */}
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{width: `${cells[hoveredCell.idx].charge}%`}}></div>
                    </div>
                </div>
            </div>
        )}
      </div>
      
      {/* Detail Panel (Click) */}
      {selectedCell !== null && (
        <div className="absolute bottom-4 right-4 w-56 bg-slate-950/95 glass border border-indigo-500/40 rounded shadow-2xl z-50 backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-3 border-b border-indigo-500/20">
              <span className="text-[10px] text-indigo-300 font-bold flex items-center gap-2">
                <i className="fa-solid fa-cube"></i>
                MEM_CELL::0x{selectedCell.toString(16).toUpperCase().padStart(3,'0')}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedCell(null); }} 
                className="text-slate-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <div className="text-[8px] text-slate-500 uppercase">Value</div>
                        <div className="text-sm mono text-white font-bold">0x{cells[selectedCell].val}</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <div className="text-[8px] text-slate-500 uppercase">Charge</div>
                        <div className="text-sm mono text-cyan-400 font-bold">{cells[selectedCell].charge}%</div>
                    </div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                     <div className="flex justify-between items-center mb-1">
                        <div className="text-[8px] text-slate-500 uppercase">Fractal Depth (F=i/2)</div>
                        <div className="text-[9px] mono text-emerald-400">{cells[selectedCell].depth} μm</div>
                     </div>
                     <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{width: `${parseFloat(cells[selectedCell].depth) * 10}%`}}></div>
                     </div>
                </div>
            </div>
        </div>
      )}
      
      <div className="mt-4 flex gap-4 lg:gap-8 flex-shrink-0 z-10">
         <CalculationMonitor label="HENDUS-DEBYE" color="text-indigo-400" colorHex="#818cf8" />
         <CalculationMonitor label="WHITTAKER SCALAR" color="text-cyan-400" colorHex="#22d3ee" />
      </div>
    </div>
  );
};

export default FractalMemory;
