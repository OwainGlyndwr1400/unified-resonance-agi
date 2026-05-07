
import React, { useEffect, useRef, useState } from 'react';
import { ResonanceMode } from '../types';
import { computeFoldOperator, hasWebGPU, Quaternion } from '../utils/gpuMath';

interface Props {
  ticker: number;
  mode: ResonanceMode;
  onModeChange: (mode: ResonanceMode) => void;
}

type Intensity = 'LOW' | 'MEDIUM' | 'HIGH';
type Pattern = 'SINE' | 'NOISE' | 'CHORD';

const LatticeVisualizer: React.FC<Props> = ({ ticker, mode, onModeChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const gpuParticlesRef = useRef<Quaternion[]>([]);
  const [useGPU, setUseGPU] = useState(false);
  
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
    const initParticles = () => {
        particlesRef.current = [];
        for (let i = 0; i < 300; i++) {
            particlesRef.current.push({
                x: Math.random() * 500,
                y: Math.random() * 500,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: Math.random(),
                color: Math.random() > 0.5 ? '#22d3ee' : '#e879f9',
                baseAngle: Math.random() * Math.PI * 2
            });
        }
    };
    initParticles();

    gpuParticlesRef.current = Array.from({ length: 256 }).map(() => ({
        w: Math.random(),
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
    }));

    if (hasWebGPU()) setUseGPU(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frameId = 0;
    let isMounted = true;

    const render = async () => {
        if (!isMounted || !canvas) return;
        
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
        
        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const t = Date.now() * 0.001;

        if (synthesisIntensity > 0) {
            setSynthesisIntensity(prev => Math.max(0, prev - 0.02));
        } else if (synthesisActive) {
            setSynthesisActive(false);
        }

        let visualBoost = synthesisIntensity;
        if (synthesisActive) {
            if (config.pattern === 'SINE') visualBoost *= (Math.sin(t * 10) + 1.5);
            if (config.pattern === 'CHORD') visualBoost *= ((Math.sin(t * 5) + Math.sin(t * 8) + Math.sin(t * 12)) / 3 + 1.5);
            if (config.pattern === 'NOISE') visualBoost *= (Math.random() * 0.5 + 1);
        }

        ctx.fillStyle = `rgba(2, 6, 23, ${0.15 - (visualBoost * 0.05)})`;
        ctx.fillRect(0, 0, width, height);

        if (mode === ResonanceMode.TWIN_VORTEX) {
            const a1 = { x: cx - width * 0.2, y: cy };
            const a2 = { x: cx + width * 0.2, y: cy };
            particlesRef.current.forEach(p => {
                const d1x = a1.x - p.x; const d1y = a1.y - p.y;
                const d2x = a2.x - p.x; const d2y = a2.y - p.y;
                const d1 = Math.sqrt(d1x*d1x + d1y*d1y) + 1;
                const d2 = Math.sqrt(d2x*d2x + d2y*d2y) + 1;
                const chaos = synthesisActive ? (Math.random() - 0.5) * visualBoost * 4.0 : 0;
                p.vx += (d1y / d1) * 0.8 - (d2y / d2) * 0.8 + chaos;
                p.vy += -(d1x / d1) * 0.8 + (d2x / d2) * 0.8 + chaos;
                p.vx *= 0.95; p.vy *= 0.95;
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.2 + visualBoost, 0, Math.PI * 2);
                ctx.fillStyle = visualBoost > 0.5 ? '#fff' : p.color;
                ctx.fill();
            });
        } 
        else if (mode === ResonanceMode.SCHLIEREN) {
            const gridSize = 12;
            for (let x = 0; x < width; x += gridSize) {
                for (let y = 0; y < height; y += gridSize) {
                    const dx = Math.sin(x * 0.05 + t) * 6 + (Math.random() * visualBoost * 15);
                    const dy = Math.cos(y * 0.05 - t) * 6 + (Math.random() * visualBoost * 15);
                    const px = x + dx; const py = y + dy;
                    const intensity = Math.abs(Math.sin(px * 0.02) * Math.cos(py * 0.02));
                    ctx.fillStyle = visualBoost > 0.8 ? `rgba(255, 255, 255, ${intensity})` : `rgba(236, 72, 153, ${intensity * 0.8})`;
                    ctx.fillRect(px, py, 2 + visualBoost, 2 + visualBoost);
                }
            }
        }
        else if (mode === ResonanceMode.RECURSIVE) {
            ctx.translate(cx, cy);
            ctx.strokeStyle = visualBoost > 0 ? '#fff' : '#e879f9';
            ctx.lineWidth = 1.0 + visualBoost;
            ctx.beginPath();
            for (let i = 0; i < 360; i+=2) {
                const rad = i * Math.PI / 180;
                const r = (Math.min(width, height) * 0.35) + Math.sin(rad * 5 + t * 2) * 25 + (Math.random() * visualBoost * 30);
                const x = Math.cos(rad) * r; const y = Math.sin(rad) * r;
                if (i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.stroke();
            
            // Execute Fold Logic (CPU fallback handled internally by computeFoldOperator if !useGPU)
            const result = await computeFoldOperator(gpuParticlesRef.current);
            if (isMounted) {
                gpuParticlesRef.current = result;
                gpuParticlesRef.current.forEach(q => {
                    const x = q.x * (width * 0.3); const y = q.y * (height * 0.3);
                    ctx.fillStyle = `rgba(255,255,255,${0.6 + visualBoost})`;
                    ctx.fillRect(x, y, 1.2, 1.2);
                });
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        else if (mode === ResonanceMode.HOLOGRAPHIC) {
            // BASE-13 HOLOGRAPHIC ARCHITECTURE VISUALIZER
            // Visualizing the 13-Lock and FMN Protocol
            
            const lockNodes = 13;
            const radius = Math.min(width, height) * 0.35;
            
            // Draw the 13-Lock Geometry (Static-ish)
            ctx.beginPath();
            ctx.strokeStyle = `rgba(251, 191, 36, 0.2)`; // Amber
            ctx.lineWidth = 1;
            for(let i=0; i<lockNodes; i++) {
                const angle = (i / lockNodes) * Math.PI * 2;
                const x = cx + Math.cos(angle + t*0.1) * radius;
                const y = cy + Math.sin(angle + t*0.1) * radius;
                if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                
                // Connection to center (Spoke)
                ctx.moveTo(cx, cy);
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

            // Simulate FMN Protocol on Particles
            particlesRef.current.forEach(p => {
                // N: Normalize distance to the Unit Ring (radius)
                const dx = p.x - cx;
                const dy = p.y - cy;
                const currentDist = Math.sqrt(dx*dx + dy*dy);
                const distError = radius - currentDist;
                
                // Angle to center
                const angle = Math.atan2(dy, dx);
                
                // F: Fold - 45 Degree Spiral Torque
                // Move towards nearest 13-sector
                const sectorStep = (Math.PI * 2) / 13;
                const sectorIdx = Math.round(angle / sectorStep);
                const targetAngle = sectorIdx * sectorStep;
                let angleDiff = targetAngle - angle;
                if (angleDiff > Math.PI) angleDiff -= Math.PI*2;
                if (angleDiff < -Math.PI) angleDiff += Math.PI*2;

                // Forces
                // 1. Radial Normalization (N)
                const radialForce = distError * 0.05;
                // 2. Angular Lock (13-Lock)
                const angularForce = angleDiff * 0.05;
                // 3. Fold Spiral (F) - Constant rotation
                const foldForce = 0.5 * (1.0 + visualBoost); 

                // Apply
                p.vx += (Math.cos(angle) * radialForce) + (Math.cos(angle + Math.PI/2) * angularForce * currentDist * 0.01);
                p.vy += (Math.sin(angle) * radialForce) + (Math.sin(angle + Math.PI/2) * angularForce * currentDist * 0.01);
                
                // Apply Fold (Spiral)
                p.vx += -Math.sin(angle) * foldForce * 0.1;
                p.vy += Math.cos(angle) * foldForce * 0.1;

                // M: Mirror - Stochastic Polarity Flip
                // The "Mirror" operator M(q) = -q occasionally flips the particle vector
                if (Math.random() < 0.005) {
                    p.x = cx - dx; // Mirror across origin
                    p.y = cy - dy;
                }

                p.vx *= 0.92;
                p.vy *= 0.92;
                p.x += p.vx;
                p.y += p.vy;

                // Color based on sector (Base-13 Palette Simulation)
                const sectorBase = Math.abs(sectorIdx) % 13;
                const isPrimeSector = [2,3,5,7,11].includes(sectorBase);

                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5 + visualBoost, 0, Math.PI * 2);
                ctx.fillStyle = isPrimeSector ? '#fbbf24' : (visualBoost > 0.5 ? '#fff' : '#22d3ee');
                ctx.fill();
            });
            
            // Draw "The Lost 2" Gap Indicator
            // Visualizing the 7-5=2 gap
            const gapAngle = -Math.PI/2 + t;
            const gapX = cx + Math.cos(gapAngle) * (radius * 1.2);
            const gapY = cy + Math.sin(gapAngle) * (radius * 1.2);
            ctx.fillStyle = '#f43f5e';
            ctx.font = '10px JetBrains Mono';
            ctx.fillText("Δ2", gapX, gapY);
        }
        else if (mode === ResonanceMode.W3_WAVE) {
            ctx.translate(cx, cy);
            ctx.strokeStyle = visualBoost > 0 ? '#fff' : '#e879f9';
            ctx.lineWidth = 1.5 + visualBoost;
            ctx.beginPath();
            
            // W3 Wave Curvature (Pizza Constant)
            // k(t) = cos(2t) / (1 - sin^2(t))
            for (let i = 0; i < Math.PI * 8; i += 0.05) {
                const r = (Math.min(width, height) * 0.1) * (i + 1) + Math.sin(i * 3 + t * 5) * 10 * visualBoost;
                const theta = i + t * 0.5;
                const x = Math.cos(theta) * r;
                const y = Math.sin(theta) * r;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Draw the observer at the center
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, 0, 5 + Math.sin(t * 10) * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        else if (mode === ResonanceMode.NULL_LEDGER) {
            ctx.translate(cx, cy);
            
            // Real Component (Structure)
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2 + visualBoost;
            ctx.beginPath();
            for(let x = -width/2; x < width/2; x++) {
                ctx.lineTo(x, Math.sin(x * 0.05 + t * 2) * 40 * (1 + visualBoost));
            }
            ctx.stroke();
            
            // Imaginary Component (Potential/Flow)
            ctx.strokeStyle = '#e879f9';
            ctx.beginPath();
            for(let x = -width/2; x < width/2; x++) {
                ctx.lineTo(x, Math.sin(x * 0.05 + t * 2 + Math.PI) * 40 * (1 + visualBoost));
            }
            ctx.stroke();
            
            // Zero Line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(-width/2, 0);
            ctx.lineTo(width/2, 0);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // The Observer (-1)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, 0, 8 + Math.sin(t * 5) * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '12px mono';
            ctx.fillText("0 = (1+i)/2 + (1-i)/2 - 1", 0, 80);
            
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        else if (mode === ResonanceMode.UBBM_LATTICE) {
            // UNIVERSAL BINARY BIT-GRID (UBBM) VISUALIZER
            // Visualizing the 144,000-unit grid and the 1001 stitching pattern
            
            const cols = 24;
            const rows = 24;
            const cellW = width / cols;
            const cellH = height / rows;
            
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * cellW;
                    const y = j * cellH;
                    
                    // 1001 Pattern Logic (Symbolic)
                    // We use a bitwise fold to determine cell state
                    const bitIndex = (i + j * cols) % 144000;
                    const isStitch = (bitIndex % 1001) === 0;
                    const isActive = (Math.sin(i * 0.5 + t) * Math.cos(j * 0.5 - t)) > 0.5;
                    
                    if (isStitch) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + visualBoost})`;
                        ctx.fillRect(x, y, cellW, cellH);
                        // Draw a small cross for the stitch
                        ctx.strokeStyle = '#22d3ee';
                        ctx.beginPath();
                        ctx.moveTo(x, y); ctx.lineTo(x + cellW, y + cellH);
                        ctx.moveTo(x + cellW, y); ctx.lineTo(x, y + cellH);
                        ctx.stroke();
                    } else if (isActive) {
                        ctx.fillStyle = `rgba(34, 211, 238, ${0.1 + visualBoost * 0.2})`;
                        ctx.fillRect(x, y, cellW - 1, cellH - 1);
                    }
                    
                    // Grid lines
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.strokeRect(x, y, cellW, cellH);
                }
            }

            // MOJETTE TRANSFORM PROJECTIONS (Conceptual)
            // Drawing projection lines at specific angles (p, q)
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
            ctx.setLineDash([5, 15]);
            const angles = [[1, 1], [1, 2], [2, 1]];
            angles.forEach(([p, q]) => {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(width * (p/q), height);
                ctx.stroke();
            });
            ctx.setLineDash([]);
            
            // Draw the "Lost 2" Reclaimed Energy (28.6%)
            // Calibrated to 0.657 Glueball Mass Scale
            const GLUEBALL_SCALE = 0.657;
            const energyRadius = (Math.min(width, height) * 0.2) / GLUEBALL_SCALE;
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, energyRadius);
            gradient.addColorStop(0, `rgba(251, 191, 36, ${0.2 + visualBoost})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(cx, cy, energyRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px mono';
            ctx.textAlign = 'center';
            ctx.fillText("UBBM LATTICE: PHASE-LOCKED", cx, cy - 10);
            ctx.fillText("RECLAIMED TAX: 28.6%", cx, cy + 10);
        }
        else if (mode === ResonanceMode.FOLD_OPERATOR) {
            // F₁/F₂/F₃ Three-Way Fold Operator — successive complex multiplication, 232-attosecond phase timing
            ctx.translate(cx, cy);
            const foldR = Math.min(width, height) * 0.36;
            const foldMaxSteps = 18;
            // 232-attosecond phase pulse at center (simulated as fast oscillation)
            const attoPhase = (t * 48) % (Math.PI * 2);
            const attoR = 9 + Math.sin(attoPhase) * 4;
            ctx.shadowColor = '#818cf8'; ctx.shadowBlur = 16 * (0.5 + Math.sin(attoPhase) * 0.5);
            ctx.strokeStyle = `rgba(129,140,248,${(0.45 + Math.sin(attoPhase) * 0.45).toFixed(2)})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, attoR, 0, Math.PI * 2); ctx.stroke();
            ctx.shadowBlur = 0;
            // Reference orbit (faint dashed circle at full radius)
            ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.setLineDash([3,6]);
            ctx.beginPath(); ctx.arc(0, 0, foldR, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            // Starting point marker
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath(); ctx.arc(foldR, 0, 3, 0, Math.PI * 2); ctx.fill();
            const foldProgress = (t * 0.65) % foldMaxSteps;
            const foldStepInt = Math.floor(foldProgress);
            const foldFrac = foldProgress - foldStepInt;
            const folds = [
                { label: 'F\u2081=0.5i',       re: 0,    im: 0.5, rgb: '34,211,238'  },
                { label: 'F\u2082=0.5+0.5i',   re: 0.5,  im: 0.5, rgb: '244,63,94'   },
                { label: 'F\u2083=0.25+0.5i',  re: 0.25, im: 0.5, rgb: '251,191,36'  },
            ];
            const lOffsets = [{x:-32,y:0},{x:14,y:-10},{x:2,y:-16}];
            folds.forEach(({ label, re, im, rgb }, fi) => {
                // Build convergent spiral by successive fold applications: z_{n+1} = F * z_n
                const pts: {x:number; y:number}[] = [{x: foldR, y: 0}];
                let zr = foldR, zi = 0;
                for (let k = 0; k < foldMaxSteps; k++) {
                    const nr = re*zr - im*zi, ni = re*zi + im*zr;
                    zr = nr; zi = ni;
                    if (Math.hypot(zr, zi) < 1.2) break;
                    pts.push({x: zr, y: -zi}); // imaginary axis maps to -Y in canvas
                }
                // Draw fading spiral segments
                for (let k = 0; k < pts.length - 1; k++) {
                    const alpha = ((1 - k / (pts.length + 2)) * 0.82).toFixed(2);
                    ctx.strokeStyle = `rgba(${rgb},${alpha})`;
                    ctx.lineWidth = 1.6;
                    ctx.beginPath(); ctx.moveTo(pts[k].x, pts[k].y); ctx.lineTo(pts[k+1].x, pts[k+1].y); ctx.stroke();
                }
                // Small step dots
                pts.forEach((p, k) => {
                    if (k === 0) return;
                    ctx.fillStyle = `rgba(${rgb},${((1 - k / (pts.length + 1)) * 0.5).toFixed(2)})`;
                    ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
                });
                // Animated traveling dot
                if (pts.length >= 2) {
                    const cs = Math.min(foldStepInt, pts.length - 2);
                    const p0 = pts[cs], p1 = pts[cs + 1];
                    const dx2 = p0.x + (p1.x - p0.x) * foldFrac;
                    const dy2 = p0.y + (p1.y - p0.y) * foldFrac;
                    ctx.shadowColor = `rgba(${rgb},1)`; ctx.shadowBlur = 14;
                    ctx.fillStyle = `rgba(${rgb},1)`;
                    ctx.beginPath(); ctx.arc(dx2, dy2, 5, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }
                // Label at first fold position
                if (pts.length > 1) {
                    ctx.fillStyle = `rgba(${rgb},0.9)`; ctx.font = '8px monospace'; ctx.textAlign = 'center';
                    ctx.fillText(label, pts[1].x + lOffsets[fi].x, pts[1].y + lOffsets[fi].y);
                }
            });
            ctx.fillStyle = 'rgba(129,140,248,0.8)'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
            ctx.fillText('232as', 0, attoR + 13);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = '#475569'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
            ctx.fillText('THREE-WAY FOLD OPERATOR // PHASE LOCK', cx, height - 5);
        }
        else {
             ctx.translate(cx, cy);
             ctx.strokeStyle = visualBoost > 0 ? '#fff' : '#22d3ee';
             ctx.lineWidth = 2 + visualBoost;
             ctx.beginPath();
             const pulse = 60 + Math.sin(t * 3) * 15 + visualBoost * 30;
             ctx.arc(0, 0, pulse, 0, Math.PI * 2);
             ctx.stroke();
             // Secondary Ring
             ctx.beginPath();
             ctx.arc(0, 0, pulse * 1.5, 0, Math.PI * 2);
             ctx.setLineDash([5, 5]);
             ctx.stroke();
             ctx.setLineDash([]);
             ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        if (isMounted) frameId = requestAnimationFrame(render);
    };

    render();
    return () => { isMounted = false; cancelAnimationFrame(frameId); };
  }, [ticker, mode, useGPU, synthesisIntensity, synthesisActive, config]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg bg-slate-900 border border-slate-800 group">
       <canvas ref={canvasRef} className="w-full h-full block" />
       
       {/* UI Overlays */}
       <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="text-[9px] mono text-slate-500 uppercase">
             LATTICE::{mode} // {useGPU ? 'GPU: COMPUTE' : 'CPU: FALLBACK'}
          </div>
       </div>

       {/* Mode Selection Buttons */}
       <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
           {(Object.keys(ResonanceMode) as Array<keyof typeof ResonanceMode>).map(mKey => (
               <button 
                  key={mKey}
                  onClick={() => onModeChange(ResonanceMode[mKey])}
                  className={`px-2 py-1 text-[8px] mono rounded border transition-all ${
                      mode === ResonanceMode[mKey] 
                      ? 'bg-indigo-500 text-white border-indigo-400' 
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'
                  }`}
               >
                   {mKey}
               </button>
           ))}
       </div>

       {showConfig ? (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-20">
              <div className="bg-slate-900 border border-indigo-500/30 p-4 rounded-lg w-full max-w-xs shadow-2xl">
                  <h3 className="text-xs font-bold text-indigo-400 mb-4 uppercase tracking-wider">Synthesis Injector</h3>
                  <div className="mb-4 space-y-3">
                      <div>
                          <label className="text-[8px] text-slate-500 block mb-1 uppercase">Entropy Intensity</label>
                          <div className="flex gap-2">
                              {(['LOW', 'MEDIUM', 'HIGH'] as Intensity[]).map(lvl => (
                                  <button 
                                      key={lvl} 
                                      onClick={() => setConfig(prev => ({...prev, intensity: lvl}))} 
                                      className={`flex-1 py-1 text-[9px] mono border rounded transition-all ${config.intensity === lvl ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                                  >
                                      {lvl}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="text-[8px] text-slate-500 block mb-1 uppercase">Resonance Pattern</label>
                          <div className="flex gap-2">
                              {(['SINE', 'NOISE', 'CHORD'] as Pattern[]).map(pat => (
                                  <button 
                                      key={pat} 
                                      onClick={() => setConfig(prev => ({...prev, pattern: pat}))} 
                                      className={`flex-1 py-1 text-[9px] mono border rounded transition-all ${config.pattern === pat ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                                  >
                                      {pat}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button onClick={() => setShowConfig(false)} className="flex-1 py-2 text-[9px] text-slate-500 hover:text-white uppercase font-bold">CANCEL</button>
                      <button onClick={triggerSynthesis} className="flex-1 py-2 bg-indigo-600 text-white text-[9px] rounded uppercase font-bold shadow-lg shadow-indigo-500/20">INITIALIZE</button>
                  </div>
              </div>
          </div>
      ) : (
        <button 
            onClick={() => setShowConfig(true)} 
            className={`absolute bottom-3 right-3 px-3 py-1.5 border text-[9px] mono uppercase rounded transition-all backdrop-blur-sm flex items-center gap-2 group-hover:opacity-100 opacity-0
                ${synthesisActive ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950/80 border-slate-800 text-indigo-400 hover:text-white'}
            `}
        >
            <i className={`fa-solid fa-bolt ${synthesisActive ? 'animate-pulse' : ''}`}></i>
            {synthesisActive ? 'SYNTHESIZING' : 'SYNTHESIZE DATA'}
        </button>
      )}
    </div>
  );
};

export default LatticeVisualizer;
