
import React, { useEffect, useRef, useState } from 'react';
import { ResonanceMode } from '../types';

interface Props {
  ticker: number;
  mode: ResonanceMode;
}

type Intensity = 'LOW' | 'MEDIUM' | 'HIGH';
type Pattern = 'SINE' | 'NOISE' | 'CHORD';

const ResonanceVisualizer: React.FC<Props> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  const [hasError, setHasError] = useState(false);
  
  // Synthesis State
  const [synthesisActive, setSynthesisActive] = useState(false);
  const [synthesisIntensity, setSynthesisIntensity] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<{ intensity: Intensity, pattern: Pattern }>({
      intensity: 'MEDIUM',
      pattern: 'NOISE'
  });

  const triggerSynthesis = () => {
    let boost = 0;
    switch(config.intensity) {
        case 'LOW': boost = 1.0; break;
        case 'MEDIUM': boost = 2.0; break;
        case 'HIGH': boost = 4.0; break;
    }
    setSynthesisIntensity(boost);
    setSynthesisActive(true);
    setShowConfig(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Robust Context Check
    let ctx: CanvasRenderingContext2D | null = null;
    try {
        ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) throw new Error("Context creation failed");
    } catch (e) {
        console.error("GPU/Canvas unavailable:", e);
        setHasError(true);
        return;
    }

    if (!ctx) return;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        particlesRef.current = []; 
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const initParticles = () => {
        particlesRef.current = [];
        for (let i = 0; i < 200; i++) {
            particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: Math.random(),
            color: Math.random() > 0.5 ? '#22d3ee' : '#e879f9'
            });
        }
    };

    if (particlesRef.current.length === 0) initParticles();

    const render = (time: number) => {
      if (!ctx || !canvas) return;
      
      try {
          const width = canvas.width;
          const height = canvas.height;
          if (width === 0 || height === 0) return;

          const t = time * 0.001;
          
          // Decay intensity
          if (synthesisIntensity > 0) {
            setSynthesisIntensity(prev => Math.max(0, prev - 0.01));
          } else {
            setSynthesisActive(false);
          }

          let visualBoost = synthesisIntensity;
          if (synthesisActive) {
              if (config.pattern === 'SINE') visualBoost *= (Math.sin(t * 10) + 1.5);
              if (config.pattern === 'CHORD') visualBoost *= ((Math.sin(t * 5) + Math.sin(t * 8) + Math.sin(t * 12)) / 3 + 1.5);
              if (config.pattern === 'NOISE') visualBoost *= (Math.random() * 0.5 + 1);
          }

          ctx.fillStyle = `rgba(2, 6, 23, ${0.2 - (visualBoost * 0.05)})`; 
          ctx.fillRect(0, 0, width, height);

          const cx = width / 2;
          const cy = height / 2;

          if (mode === ResonanceMode.TWIN_VORTEX) {
            // ... (Physics Logic)
            const a1 = { x: cx - width * 0.2, y: cy };
            const a2 = { x: cx + width * 0.2, y: cy };
            particlesRef.current.forEach(p => {
              const d1x = a1.x - p.x;
              const d1y = a1.y - p.y;
              const d2x = a2.x - p.x;
              const d2y = a2.y - p.y;
              const d1 = Math.sqrt(d1x*d1x + d1y*d1y) + 1;
              const d2 = Math.sqrt(d2x*d2x + d2y*d2y) + 1;
              const chaos = synthesisActive ? (Math.random() - 0.5) * visualBoost * 0.5 : 0;
              p.vx += (d1y / d1) * 0.5 - (d2y / d2) * 0.5 + chaos;
              p.vy += -(d1x / d1) * 0.5 + (d2x / d2) * 0.5 + chaos;
              p.vx *= 0.96;
              p.vy *= 0.96;
              p.x += p.vx;
              p.y += p.vy;
              const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
              if (speed < 0.1) {
                  p.vx += (Math.random() - 0.5);
                  p.vy += (Math.random() - 0.5);
              }
              if (p.x < 0) p.x = width;
              if (p.x > width) p.x = 0;
              if (p.y < 0) p.y = height;
              if (p.y > height) p.y = 0;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.5 + visualBoost, 0, Math.PI * 2);
              ctx.fillStyle = visualBoost > 0.5 ? '#fff' : p.color;
              ctx.fill();
            });
          } else if (mode === ResonanceMode.SCHLIEREN) {
             const gridSize = 20;
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += gridSize) {
              for (let y = 0; y < height; y += gridSize) {
                const distortionX = Math.sin(x * 0.05 + t) * 5 + Math.cos(y * 0.05 - t) * 5 + (Math.random() * visualBoost * 10);
                const distortionY = Math.cos(x * 0.05 - t) * 5 + Math.sin(y * 0.05 + t) * 5 + (Math.random() * visualBoost * 10);
                const px = x + distortionX;
                const py = y + distortionY;
                const intensity = Math.abs(Math.sin(px * 0.02) * Math.cos(py * 0.02));
                ctx.fillStyle = visualBoost > 1 ? `rgba(255, 255, 255, ${intensity})` : `rgba(251, 191, 36, ${intensity * 0.8})`;
                ctx.fillRect(px, py, 2 + visualBoost, 2 + visualBoost);
              }
            }
          } else if (mode === ResonanceMode.RECURSIVE) {
             ctx.translate(cx, cy);
            ctx.strokeStyle = visualBoost > 0 ? '#fff' : '#e879f9';
            ctx.lineWidth = 1.5 + visualBoost;
            ctx.beginPath();
            for (let i = 0; i < 360; i+=2) {
                const rad = i * Math.PI / 180;
                const r = (Math.min(width, height) * 0.3) + Math.sin(rad * 5 + t * 2) * 20 + Math.cos(rad * 13 - t) * 10 + Math.sin(rad * 21 + t * 5) * 5 + (Math.random() * visualBoost * 20);
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                if (i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.shadowBlur = 10 + visualBoost * 20;
            ctx.shadowColor = '#e879f9';
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
          } else {
             ctx.translate(cx, cy);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2 + visualBoost;
            ctx.beginPath();
            ctx.arc(0, 0, 50 + Math.sin(t * 3) * 10 + visualBoost * 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
          }

          frameRef.current = requestAnimationFrame(() => render(Date.now()));
      } catch (err) {
          console.error("Render loop error:", err);
          setHasError(true);
      }
    };

    frameRef.current = requestAnimationFrame(() => render(Date.now()));

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [mode, synthesisIntensity, synthesisActive, config]);

  // Fallback UI for GPU Failure
  if (hasError) {
      return (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4 border border-rose-900/50">
              <i className="fa-solid fa-eye-slash text-rose-500 text-3xl mb-2"></i>
              <h3 className="text-rose-400 font-bold tracking-widest uppercase text-xs">Optical Sensor Offline</h3>
              <p className="text-[10px] text-rose-500/50 mono mt-1">GPU ACCELERATION UNAVAILABLE</p>
              <div className="mt-4 p-4 bg-slate-950 rounded w-full max-w-xs">
                  <div className="text-[10px] mono text-slate-500">
                      {'>'} SYSTEM DIAGNOSTIC... <span className="text-rose-500">FAIL</span><br/>
                      {'>'} FALLBACK MODE... <span className="text-emerald-500">ACTIVE</span>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full h-full relative bg-slate-900/50 group overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2 left-2 text-[8px] mono text-slate-500 uppercase pointer-events-none">
        MODE: {mode} // GPU: ACTIVE
      </div>
      
      {showConfig ? (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20 animate-in fade-in zoom-in-95">
             {/* ... Config UI (Same as before) ... */}
              <div className="bg-slate-900 border border-indigo-500/30 p-4 rounded-lg w-full max-w-xs shadow-2xl">
                  <h3 className="text-xs font-bold text-indigo-400 mb-4 uppercase tracking-wider border-b border-indigo-500/20 pb-2">Synthesis Parameters</h3>
                  
                  <div className="mb-4 space-y-2">
                      <label className="text-[9px] text-slate-500 uppercase block">Resonance Intensity</label>
                      <div className="flex gap-2">
                          {(['LOW', 'MEDIUM', 'HIGH'] as Intensity[]).map(lvl => (
                              <button 
                                key={lvl}
                                onClick={() => setConfig(prev => ({...prev, intensity: lvl}))}
                                className={`flex-1 py-1 text-[9px] mono border rounded transition-all ${config.intensity === lvl ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                              >
                                  {lvl}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="mb-4 space-y-2">
                      <label className="text-[9px] text-slate-500 uppercase block">Modulation Pattern</label>
                      <div className="flex gap-2">
                          {(['SINE', 'NOISE', 'CHORD'] as Pattern[]).map(pat => (
                              <button 
                                key={pat}
                                onClick={() => setConfig(prev => ({...prev, pattern: pat}))}
                                className={`flex-1 py-1 text-[9px] mono border rounded transition-all ${config.pattern === pat ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                              >
                                  {pat}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-2 border-t border-slate-800">
                      <button 
                        onClick={() => setShowConfig(false)}
                        className="flex-1 py-2 text-[9px] font-bold text-slate-400 hover:text-white"
                      >
                          CANCEL
                      </button>
                      <button 
                        onClick={triggerSynthesis}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold rounded uppercase tracking-wider"
                      >
                          INITIALIZE
                      </button>
                  </div>
              </div>
          </div>
      ) : (
        <button
            onClick={() => setShowConfig(true)}
            className={`absolute bottom-2 right-2 px-3 py-1 border text-[9px] mono uppercase rounded transition-all backdrop-blur-sm flex items-center gap-2
                ${synthesisActive
                    ? 'bg-indigo-500/40 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                }
            `}
        >
            <i className={`fa-solid fa-bolt ${synthesisActive ? 'animate-pulse' : ''}`}></i>
            {synthesisActive ? 'SYNTHESIZING...' : 'SYNTHESIZE DATA'}
        </button>
      )}
    </div>
  );
};

export default ResonanceVisualizer;
