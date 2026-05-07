
import React, { useMemo, useState } from 'react';
import { PRIME_SET } from '../constants';

interface Props {
  ticker: number;
}

const GeodesicMap: React.FC<Props> = ({ ticker }) => {
  // Use Prime Basis {2, 3, 5} as anchors + other primes
  const nodes = useMemo(() => [
      { val: 2, x: 50, y: 20, type: 'BASIS' },
      { val: 3, x: 20, y: 80, type: 'BASIS' },
      { val: 5, x: 80, y: 80, type: 'BASIS' },
      ...PRIME_SET.filter(p => p > 5).map(p => ({
          val: p,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          type: 'NODE'
      }))
  ], []);

  const [hoveredPath, setHoveredPath] = useState<{ p1: number, p2: number, x: number, y: number, status: string } | null>(null);
  
  // Filter State - Now supports multiple selections
  const [selectedPrimes, setSelectedPrimes] = useState<number[]>([]);
  const [showIdle, setShowIdle] = useState(true);

  const togglePrime = (p: number) => {
      setSelectedPrimes(prev => 
          prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
      );
  };

  const isVisible = (n1: number, n2: number) => {
      if (selectedPrimes.length === 0) return true;
      return selectedPrimes.includes(n1) || selectedPrimes.includes(n2);
  };

  // Active path cycling linked to ticker
  // We use the ticker to drive the "active resonance" wave across the map
  // Each tick activates a different subset of paths
  const activeOffset = ticker % 5; 

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-slate-900/50 rounded border border-slate-800/50">
      
      {/* Filter Controls */}
      <div className="absolute top-2 left-2 z-10 flex gap-2 flex-wrap max-w-[90%]">
          <div className="glass px-2 py-1 rounded flex items-center gap-1 flex-wrap">
              <span className="text-[9px] mono text-slate-400 mr-1">FILTER:</span>
              {[2, 3, 5, 7, 11].map(p => (
                  <button 
                    key={p}
                    onClick={() => togglePrime(p)}
                    className={`px-1.5 py-0.5 text-[8px] rounded border transition-all ${
                        selectedPrimes.includes(p) 
                        ? 'bg-amber-500 text-slate-900 border-amber-400 font-bold' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-amber-300'
                    }`}
                  >
                      P{p}
                  </button>
              ))}
              {selectedPrimes.length > 0 && (
                  <button onClick={() => setSelectedPrimes([])} className="ml-1 text-[8px] text-rose-400 hover:text-rose-300">
                      <i className="fa-solid fa-xmark"></i>
                  </button>
              )}
          </div>
          <button 
              onClick={() => setShowIdle(!showIdle)}
              className={`glass px-2 py-1 rounded text-[9px] mono border transition-colors ${showIdle ? 'border-amber-500/50 text-amber-300' : 'border-slate-700 text-slate-500'}`}
          >
              {showIdle ? 'IDLE: ON' : 'IDLE: OFF'}
          </button>
      </div>

      <svg className="w-full h-full">
        {/* 120-Degree Closure Triangle between Basis Nodes */}
        <polygon 
            points={`${nodes[0].x}%,${nodes[0].y}% ${nodes[1].x}%,${nodes[1].y}% ${nodes[2].x}%,${nodes[2].y}%`}
            fill="rgba(99, 102, 241, 0.05)"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeDasharray="4,4"
        />

        {/* Background Grid */}
        {showIdle && nodes.map((node, i) => 
          nodes.slice(i + 1).map((other, j) => {
             if (!isVisible(node.val, other.val)) return null;

             return (
                <line
                key={`${i}-${j}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${other.x}%`}
                y2={`${other.y}%`}
                stroke="rgba(251, 191, 36, 0.1)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                />
            );
          })
        )}
        
        {/* Active Geodesic Paths linked to Ticker */}
        {nodes.map((node, i) => {
           // Create a few connections for each node
           // Use the index and ticker to create a dynamic, rotating pattern
           const targetIndex = (i + 1 + activeOffset) % nodes.length;
           const targetNode = nodes[targetIndex];
           
           if (!isVisible(node.val, targetNode.val)) return null;
           
           // Only show some active paths to avoid clutter
           if (i % 2 !== activeOffset % 2) return null;

           return (
              <g key={`active-${i}-${targetIndex}`}>
                 <line
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${targetNode.x}%`}
                    y2={`${targetNode.y}%`}
                    stroke="rgba(34, 211, 238, 0.6)"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:stroke-cyan-400 transition-colors"
                    onMouseEnter={(e) => {
                        const containerRect = e.currentTarget.closest('div')?.getBoundingClientRect();
                        if (containerRect) {
                            let x = e.clientX - containerRect.left;
                            let y = e.clientY - containerRect.top;
                            const tooltipWidth = 160;
                            const tooltipHeight = 80;
                            if (x + tooltipWidth > containerRect.width) x -= tooltipWidth;
                            if (y + tooltipHeight > containerRect.height) y -= tooltipHeight;
                            setHoveredPath({ 
                                p1: node.val, 
                                p2: targetNode.val,
                                x: x + 10,
                                y: y + 10,
                                status: `RES: ${ticker.toString(16).toUpperCase()}`
                            });
                        }
                    }}
                    onMouseLeave={() => setHoveredPath(null)}
                />
                {/* Flowing Data Particle */}
                <circle r="2" fill="#22d3ee">
                   <animate 
                        attributeName="cx" 
                        from={`${node.x}%`} 
                        to={`${targetNode.x}%`} 
                        dur="2s" 
                        repeatCount="indefinite" 
                        begin={`${i * 0.2}s`}
                   />
                   <animate 
                        attributeName="cy" 
                        from={`${node.y}%`} 
                        to={`${targetNode.y}%`} 
                        dur="2s" 
                        repeatCount="indefinite" 
                        begin={`${i * 0.2}s`}
                   />
                   <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                </circle>
              </g>
           );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
            const isDimmed = selectedPrimes.length > 0 && !selectedPrimes.includes(node.val);
            return (
              <g key={i} className="pointer-events-none transition-opacity duration-300" style={{ opacity: isDimmed ? 0.2 : 1 }}>
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={node.type === 'BASIS' ? "8" : "6"}
                  fill={node.type === 'BASIS' ? "#4f46e5" : "#0f172a"}
                  stroke={node.type === 'BASIS' ? "#818cf8" : "#fbbf24"}
                  strokeWidth="2"
                />
                <text
                  x={`${node.x}%`}
                  y={`${node.y - (node.type === 'BASIS' ? 10 : 8)}%`}
                  fill={node.type === 'BASIS' ? "#818cf8" : "#fbbf24"}
                  fontSize={node.type === 'BASIS' ? "12" : "10"}
                  fontWeight={node.type === 'BASIS' ? "bold" : "normal"}
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {node.type === 'BASIS' ? `BASIS(${node.val})` : `P${node.val}`}
                </text>
              </g>
            );
        })}
      </svg>
      
      {/* Dynamic Path Tooltip */}
      {hoveredPath && (
          <div 
            className="absolute z-20 bg-slate-900/95 border border-amber-500/40 p-3 rounded shadow-xl pointer-events-none glass backdrop-blur animate-in fade-in zoom-in-95 duration-100"
            style={{ left: hoveredPath.x, top: hoveredPath.y }}
          >
              <div className="flex items-center gap-2 mb-2 border-b border-amber-500/20 pb-1">
                  <i className="fa-solid fa-bezier-curve text-amber-500 text-[10px]"></i>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Geodesic Link</span>
              </div>
              <div className="space-y-1">
                  <div className="flex justify-between gap-4 text-[9px] mono">
                      <span className="text-slate-400">PRIME ORIGIN:</span>
                      <span className="text-white font-bold">P{hoveredPath.p1}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-[9px] mono">
                      <span className="text-slate-400">PRIME TARGET:</span>
                      <span className="text-white font-bold">P{hoveredPath.p2}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-[9px] mono pt-1 border-t border-white/5 mt-1">
                      <span className="text-slate-400">STATUS:</span>
                      <span className="text-emerald-400 font-bold animate-pulse">{hoveredPath.status}</span>
                  </div>
              </div>
          </div>
      )}

      <div className="absolute bottom-2 right-2 text-[8px] mono text-amber-500/50">
        TICK: {ticker.toString(15).toUpperCase()} // BASIS CLOSURE
      </div>
    </div>
  );
};

export default GeodesicMap;
