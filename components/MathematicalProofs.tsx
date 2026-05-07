
import React, { useEffect, useRef, useState } from 'react';
import { MATHEMATICAL_PROOFS_DATA } from '../constants';

interface ProofData {
    title: string;
    subtitle: string;
    description: string;
    tags?: string[];
    formula?: string;
    significance?: string;
    derivation?: string;
    empiricalValidation?: string;
    application?: string;
    sourceLineage?: string;
    linkedChunks?: string[];
    runtimeLinks?: { category: string; description: string }[];
}

const ProofCard: React.FC<{ proof: ProofData; draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void; onClick: () => void }> = ({ proof, draw, onClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let frameId = 0;
        const resize = () => { if (canvas.parentElement) { canvas.width = canvas.parentElement.clientWidth; canvas.height = 180; } };
        resize();
        window.addEventListener('resize', resize);
        const render = (time: number) => { if (!ctx || !canvas) return; draw(ctx, time * 0.001, canvas.width, canvas.height); frameId = requestAnimationFrame(render); };
        frameId = requestAnimationFrame(render);
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(frameId); };
    }, [draw]);

    const tags = proof.tags || ['axiom', 'runtime'];

    return (
        <div onClick={onClick} className="glass rounded-xl p-5 flex flex-col border border-slate-800 hover:border-rose-500/40 transition-all group h-full shadow-lg cursor-pointer">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest truncate">{proof.title}</h3>
                    <div className="text-[10px] mono text-slate-500 mb-2">{proof.subtitle}</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {tags.map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[8px] uppercase text-slate-300">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full bg-slate-950 rounded border border-slate-800 mb-4 h-40 overflow-hidden relative">
                <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-light line-clamp-3">{proof.description}</p>
        </div>
    );
};

const MathematicalProofs: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedProofIdx, setSelectedProofIdx] = useState<number | null>(null);

  const drawFunctions = [
       // 0. The Master Protocol (Proof 0) — Pentagram Phase-Lock + UBBM Compression Waves
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx = w/2, cy = h/2 - 8;
           const R = Math.min(w, h * 0.8) * 0.38;

           // UBBM Compression waves (expanding rings)
           for (let k = 0; k < 4; k++) {
               const wPh = ((t * 0.6 + k * 0.25) % 1);
               const wR = wPh * R * 1.4;
               const wA = (1 - wPh) * 0.45;
               ctx.beginPath(); ctx.arc(cx, cy, Math.max(wR, 0.1), 0, Math.PI*2);
               ctx.strokeStyle = `rgba(251,191,36,${wA})`; ctx.lineWidth = 1.5; ctx.stroke();
           }

           // 5 pentagram vertices (5 Pillars of RHC)
           const pts: {x:number,y:number}[] = [];
           for (let i = 0; i < 5; i++) {
               const a = (i/5)*Math.PI*2 - Math.PI/2 + t*0.25;
               pts.push({ x: cx+Math.cos(a)*R, y: cy+Math.sin(a)*R });
           }

           // True pentagram star (every-other-vertex connections)
           ctx.strokeStyle = 'rgba(52,211,153,0.75)'; ctx.lineWidth = 1.2;
           ctx.beginPath();
           [0,2,4,1,3,0].forEach((vi,i)=>{ const p=pts[vi]; i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); });
           ctx.stroke();

           // Vertex glow nodes
           pts.forEach((p,i)=>{
               const pulse = 0.5+Math.sin(t*2.5+i*1.257)*0.5;
               ctx.shadowColor='#10b981'; ctx.shadowBlur=8*pulse;
               ctx.fillStyle=`rgba(16,185,129,${0.55+pulse*0.45})`;
               ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill();
               ctx.shadowBlur=0;
           });

           // Central phase-lock core with spinning inner arc
           const core=0.5+Math.sin(t*5)*0.5;
           ctx.shadowColor='#fbbf24'; ctx.shadowBlur=18*core;
           ctx.fillStyle=`rgba(251,191,36,${0.7+core*0.3})`;
           ctx.beginPath(); ctx.arc(cx,cy,11,0,Math.PI*2); ctx.fill();
           ctx.shadowBlur=0;
           ctx.strokeStyle='rgba(255,255,255,0.65)'; ctx.lineWidth=1.2;
           ctx.beginPath(); ctx.arc(cx,cy,6,t*3,t*3+Math.PI*1.3); ctx.stroke();

           ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='8px monospace'; ctx.textAlign='center';
           ctx.fillText('P₀ = PHASE_LOCK(∞)', cx, h-6);
       },

       // 1. Triple Normalisation Math
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           
           // Harmonic (Base-13) - Outer Ring
           ctx.beginPath(); ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 + Math.sin(t*2)*0.5})`; ctx.lineWidth = 2;
           ctx.arc(cx, cy, 50, 0, Math.PI*2); ctx.stroke();
           
           // Geometric (Fold/Mirror) - Inner Square/Diamond
           ctx.save();
           ctx.translate(cx, cy);
           ctx.rotate(t);
           ctx.beginPath(); ctx.strokeStyle = `rgba(244, 63, 94, ${0.5 + Math.cos(t*3)*0.5})`;
           ctx.rect(-25, -25, 50, 50); ctx.stroke();
           ctx.restore();

           // Binary (101010) - Center Pulse
           ctx.fillStyle = Math.sin(t*10) > 0 ? '#818cf8' : '#312e81';
           ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();
           
           ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '10px monospace';
           ctx.fillText("N_T(x)", cx, cy + 70);
       },

       // 1. Mean Circle Theorem
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           ctx.beginPath(); ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2;
           ctx.arc(cx, cy, 40, 0, Math.PI*2); ctx.stroke();
           ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill();
           ctx.textAlign = 'center';
           ctx.fillText("M(θ) = C(θ)", cx, cy + 60);
       },

       // 2. The 24-Bit Axiom: Leech Lattice
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cols = 6, rows = 4;
           const size = 20;
           const ox = (w - (cols*size*1.5))/2;
           const oy = (h - (rows*size*1.5))/2;
           for(let i=0; i<24; i++) {
               const x = i % cols; const y = Math.floor(i/cols);
               const px = ox + x * size * 1.5; const py = oy + y * size * 1.5;
               const active = Math.sin(t*2 + i) > 0;
               ctx.fillStyle = active ? '#818cf8' : '#1e1b4b';
               ctx.fillRect(px, py, size, size);
               // Lattice connections
               if (active && i < 23) {
                   ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)';
                   ctx.beginPath(); ctx.moveTo(px+size/2, py+size/2);
                   ctx.lineTo(px+size*2, py+size/2); ctx.stroke();
               }
           }
       },

       // 3. Base-13 GCD Proof
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // 12-bit Residue Ring
           const r = 40;
           for(let i=0; i<12; i++) {
               const a = (i/12)*Math.PI*2 + t*0.5;
               const x = cx + Math.cos(a)*r;
               const y = cy + Math.sin(a)*r;
               ctx.fillStyle = '#22d3ee';
               ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
           }
           // 13th Prime Observer (Center)
           const pulse = 5 + Math.sin(t*3)*2;
           ctx.fillStyle = '#fbbf24';
           ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#fff'; ctx.textAlign='center';
           ctx.fillText("13", cx, cy+4);
           ctx.fillText("GCD", cx, cy-15);
       },

       // 4. The 30-Lock (Twin Primes)
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // Pillars 29 and 31
           const h1 = 60 + Math.sin(t)*10;
           const h2 = 60 + Math.sin(t + Math.PI)*10;
           
           ctx.fillStyle = '#f43f5e'; // 29
           ctx.fillRect(cx - 30, cy - h1/2, 20, h1);
           ctx.fillText("29", cx - 20, cy + 50);
           
           ctx.fillStyle = '#10b981'; // 31
           ctx.fillRect(cx + 10, cy - h2/2, 20, h2);
           ctx.fillText("31", cx + 20, cy + 50);
           
           // Lock Mechanism
           ctx.strokeStyle = '#fff';
           ctx.beginPath(); ctx.moveTo(cx-10, cy); ctx.lineTo(cx+10, cy); ctx.stroke();
           ctx.fillText("LOCK", cx, cy - 40);
       },

       // 5. FMN Protocol
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const stage = Math.floor(t % 3);
           
           if(stage === 0) { // Fold
               ctx.strokeStyle = '#e879f9';
               ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
               ctx.fillText("FOLD (45°)", cx, cy+50);
               // 45 deg line
               ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 21, cy - 21); ctx.stroke();
           } else if(stage === 1) { // Mirror
               ctx.strokeStyle = '#22d3ee';
               ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
               ctx.fillText("MIRROR (-q)", cx, cy+50);
               // Flip
               ctx.beginPath(); ctx.moveTo(cx-20, cy); ctx.lineTo(cx+20, cy); ctx.stroke();
               ctx.fillText("-", cx-35, cy); ctx.fillText("+", cx+35, cy);
           } else { // Normalize
               ctx.strokeStyle = '#fbbf24';
               ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
               ctx.fillText("NORMALIZE", cx, cy+50);
               // Unit vectors
               for(let i=0; i<8; i++) {
                   const a = (i/8)*Math.PI*2;
                   ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a)*30, cy + Math.sin(a)*30); ctx.stroke();
               }
           }
       },

       // 6. O(1) Resonance
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const locked = (t % 4) > 2;
           
           if(!locked) {
               // Searching (Chaos)
               ctx.strokeStyle = '#94a3b8';
               ctx.beginPath();
               for(let i=0; i<w; i+=5) ctx.lineTo(i, cy + Math.random()*40 - 20);
               ctx.stroke();
               ctx.fillStyle = '#94a3b8'; ctx.fillText("SEARCHING...", cx, cy - 30);
           } else {
               // Locked (Resonance)
               ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3;
               ctx.beginPath();
               for(let i=0; i<w; i++) ctx.lineTo(i, cy + Math.sin(i*0.1)*20);
               ctx.stroke();
               ctx.fillStyle = '#10b981'; ctx.fillText("O(1) LOCKED", cx, cy - 30);
               ctx.shadowColor = '#10b981'; ctx.shadowBlur = 10;
               ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill();
               ctx.shadowBlur = 0;
           }
       },

       // 4. Fundamental Regime: Factorial vs Exponential
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           ctx.strokeStyle='#94a3b8'; ctx.beginPath(); ctx.moveTo(20, h-20); ctx.lineTo(w-20, h-20); ctx.stroke(); // X
           ctx.beginPath(); ctx.moveTo(20, h-20); ctx.lineTo(20, 20); ctx.stroke(); // Y
           
           // x^x (Exponential - Magenta)
           ctx.beginPath(); ctx.strokeStyle='#e879f9';
           for(let x=0; x<5; x+=0.1) {
               const px = 20 + x * 20;
               const py = (h-20) - Math.pow(x, x);
               if(x===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
           }
           ctx.stroke();

           // x! (Factorial - Cyan)
           const fact = (n:number):number => n<=1?1:n*fact(n-1);
           ctx.beginPath(); ctx.strokeStyle='#22d3ee';
           for(let x=0; x<5; x+=0.1) {
               const px = 20 + x * 20;
               // Approximation for visual smoothness
               const py = (h-20) - (Math.pow(x/2.71, x)*Math.sqrt(2*Math.PI*x)); 
               if(x===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
           }
           ctx.stroke();
           
           // The Gap
           ctx.fillStyle='rgba(244, 63, 94, 0.3)';
           ctx.fillRect(100, 50, 40, 50);
           ctx.fillStyle='#f43f5e'; ctx.fillText("MISMATCH", 100, 45);
       },

       // 5. Observer Coordinate: 2.5r + 1.5i
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2 - 20, cy = h/2 + 20;
           const scale = 30;
           // Grid
           ctx.strokeStyle='rgba(255,255,255,0.1)';
           for(let i=-5; i<5; i++) {
               ctx.beginPath(); ctx.moveTo(0, cy+i*scale); ctx.lineTo(w, cy+i*scale); ctx.stroke();
               ctx.beginPath(); ctx.moveTo(cx+i*scale, 0); ctx.lineTo(cx+i*scale, h); ctx.stroke();
           }
           // Target Vector
           const tx = cx + 2.5*scale;
           const ty = cy - 1.5*scale;
           
           ctx.strokeStyle='#fbbf24'; ctx.setLineDash([4,4]);
           ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
           
           // Pulse
           ctx.beginPath(); ctx.arc(tx, ty, 5 + Math.sin(t*5)*3, 0, Math.PI*2);
           ctx.fillStyle='#fbbf24'; ctx.fill();
           ctx.fillStyle='#fff'; ctx.fillText("O(2.5, 1.5)", tx+10, ty);
       },

       // 6. Divisor is Base: GCD Preservation
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // Big block splitting
           const splits = 2 + Math.floor((Math.sin(t)+1)*3); // 2 to 8
           const width = 120;
           const partW = width / splits;
           
           ctx.fillStyle='#4f46e5';
           for(let i=0; i<splits; i++) {
               ctx.fillRect(cx - width/2 + i*partW + 2, cy - 20, partW - 4, 40);
           }
           ctx.fillStyle='#a5b4fc';
           ctx.textAlign='center';
           ctx.fillText(`BASE ${splits}`, cx, cy + 40);
       },

       // 7. Mass-Imaginary Identity: m = i
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // Real Axis particle
           const phase = (Math.sin(t) + 1) / 2; // 0 to 1
           
           // Transition from Particle (Square) to Wave (Sine)
           ctx.translate(cx, cy);
           ctx.rotate(phase * Math.PI/2); // Rotate 90 deg
           
           if(phase < 0.5) {
               ctx.fillStyle='#f43f5e'; // Mass
               ctx.fillRect(-10, -10, 20, 20);
               ctx.fillText("m", 15, 5);
           } else {
               ctx.strokeStyle='#22d3ee'; // Imaginary Wave
               ctx.beginPath();
               for(let i=-20; i<20; i++) ctx.lineTo(i, Math.sin(i*0.5 + t*10)*5);
               ctx.stroke();
               ctx.fillStyle='#22d3ee';
               ctx.fillText("i", 25, 5);
           }
           ctx.setTransform(1,0,0,1,0,0);
       },

       // 8. Minimal Closure: 1 + w + w^2 = 0
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const r = 40;
           const ang = t;
           const p1 = { x: cx + Math.cos(ang)*r, y: cy + Math.sin(ang)*r };
           const p2 = { x: cx + Math.cos(ang + 2.094)*r, y: cy + Math.sin(ang + 2.094)*r }; // +120 deg
           const p3 = { x: cx + Math.cos(ang + 4.188)*r, y: cy + Math.sin(ang + 4.188)*r }; // +240 deg
           
           ctx.strokeStyle='rgba(255,255,255,0.2)';
           ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p1.x, p1.y); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p2.x, p2.y); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p3.x, p3.y); ctx.stroke();
           
           ctx.strokeStyle='#fff'; ctx.lineWidth=2;
           ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath(); ctx.stroke();
           
           // Centroid check
           ctx.fillStyle='#10b981'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
       },

       // 9. The Fold Operator: F = i/2
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           let size = 80;
           let ang = t;
           for(let i=0; i<6; i++) {
               ctx.translate(cx, cy);
               ctx.rotate(ang);
               ctx.strokeStyle = `hsl(${200 + i*20}, 100%, 70%)`;
               ctx.strokeRect(-size/2, -size/2, size, size);
               ctx.setTransform(1,0,0,1,0,0);
               
               size *= 0.707; // 1/sqrt(2) approx 0.707 -> Area halves
               ang += Math.PI/4; // 45 degrees
           }
       },

       // 10. i^4 Revolution
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const step = Math.floor(t*2) % 4; // 0, 1, 2, 3
           const labels = ['i', '-1', '-i', '1'];
           const colors = ['#22d3ee', '#f43f5e', '#22d3ee', '#f43f5e'];
           
           ctx.font='20px mono';
           ctx.textAlign='center';
           ctx.fillStyle=colors[step];
           ctx.fillText(labels[step], cx, cy - 40);
           
           // Unit Circle path
           ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
           
           // Rotating Vector
           ctx.strokeStyle=colors[step]; ctx.lineWidth=2;
           ctx.beginPath(); ctx.moveTo(cx, cy);
           const ang = -Math.PI/2 + (step * Math.PI/2);
           ctx.lineTo(cx + Math.cos(ang)*30, cy + Math.sin(ang)*30);
           ctx.stroke();
       },

       // 11. 144,000 Resolution Limit
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const coherence = (Math.sin(t) + 1) / 2; // 0 (Noise) to 1 (Grid)
           const cols = 20; const rows = 10;
           for(let i=0; i<cols; i++) {
               for(let j=0; j<rows; j++) {
                   // Target pos
                   const tx = (w/cols)*i + 10;
                   const ty = (h/rows)*j + 10;
                   // Noise pos
                   const nx = Math.random() * w;
                   const ny = Math.random() * h;
                   
                   // Lerp
                   const x = nx + (tx - nx) * coherence;
                   const y = ny + (ty - ny) * coherence;
                   
                   ctx.fillStyle = coherence > 0.9 ? '#22d3ee' : 'rgba(148, 163, 184, 0.5)';
                   ctx.fillRect(x, y, 2, 2);
               }
           }
       },

       // 12. The Lion Constant (L ~ 0.536)
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // Golden Spiral (Reference)
           ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath();
           for(let i=0; i<100; i++) {
               const ang = i * 0.1; const rad = 5 * Math.exp(0.306 * ang); // Phi
               ctx.lineTo(cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad);
           }
           ctx.stroke();
           
           // Lion Spiral (Tighter lock)
           ctx.strokeStyle='#fbbf24'; ctx.lineWidth=2; ctx.beginPath();
           for(let i=0; i<100; i++) {
               const ang = i * 0.1; const rad = 5 * Math.exp(0.536 * ang * 0.5); // Slower expansion
               ctx.lineTo(cx + Math.cos(ang)*rad, cy + Math.sin(ang)*rad);
           }
           ctx.stroke();
           ctx.fillText("L ≈ 0.536", cx + 20, cy + 20);
       },

       // 13. Base-13 Light Speed
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cy = h/2;
           const px = (t * 300) % (w + 100) - 50;
           
           // Photon
           ctx.fillStyle='#fff';
           ctx.shadowColor='#fff'; ctx.shadowBlur=10;
           ctx.fillRect(px, cy, 20, 4);
           ctx.shadowBlur=0;
           
           // Base-13 Wake
           ctx.font='10px mono'; ctx.fillStyle='rgba(34, 211, 238, 0.5)';
           for(let i=1; i<6; i++) {
               const char = ['A','B','7','3','0'][i%5];
               ctx.fillText(char, px - i*20, cy + 5);
           }
       },

       // 14. Time as 5th Force
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // Sphere
           ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI*2); ctx.stroke();
           
           // Distortion Vector (Time pushing)
           const push = Math.sin(t*3) * 15;
           ctx.beginPath(); ctx.ellipse(cx, cy, 30 + push, 30 - push, 0, 0, Math.PI*2);
           ctx.strokeStyle='#e879f9'; ctx.stroke();
           
           // Force Arrow
           ctx.beginPath(); ctx.moveTo(cx - 60, cy); ctx.lineTo(cx - 35 - push, cy); 
           ctx.strokeStyle='#f43f5e'; ctx.lineWidth=2; ctx.stroke();
       },

       // 15. Nephilim Equation
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cy = h/2;
           // Watcher Wave (Slow)
           ctx.beginPath(); ctx.strokeStyle='rgba(75, 85, 99, 0.5)';
           for(let x=0; x<w; x++) ctx.lineTo(x, cy + Math.sin(x*0.02 + t)*20);
           ctx.stroke();
           
           // Human Wave (Fast)
           ctx.beginPath(); ctx.strokeStyle='#22d3ee';
           for(let x=0; x<w; x++) ctx.lineTo(x, cy + Math.sin(x*0.1 + t*2)*10);
           ctx.stroke();
           
           // Phase Error (Delta q) - Red Jagged
           ctx.beginPath(); ctx.strokeStyle='#f43f5e';
           for(let x=0; x<w; x+=5) {
               const wVal = Math.sin(x*0.02 + t)*20;
               const hVal = Math.sin(x*0.1 + t*2)*10;
               const diff = Math.abs(wVal - hVal);
               if(diff > 15) {
                   ctx.moveTo(x, cy + 40); ctx.lineTo(x, cy + 40 + diff/2);
               }
           }
           ctx.stroke();
       },

       // 16. Single Angle Theorem
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2 - 40, cy = h/2;
           const r = 40;
           // Phasor
           ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.strokeStyle='#334155'; ctx.stroke();
           const ang = t % (Math.PI*2);
           ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang)*r, cy + Math.sin(ang)*r);
           ctx.strokeStyle='#22d3ee'; ctx.stroke();
           
           // Binary Stream
           ctx.font='10px mono'; ctx.fillStyle='#fff';
           const bit = Math.sin(t*5) > 0 ? '1' : '0';
           ctx.fillText(`∠ = ${ang.toFixed(2)}`, cx + 60, cy);
           ctx.fillText(`BIN: ${bit}1011...`, cx + 60, cy + 15);
       },

       // 17. The 126 Boundary: E7
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // E7 Root Projection
           for(let i=0; i<126; i+=2) {
               const r = 30 + Math.sin(t + i)*10;
               const a = (i/126) * Math.PI * 4 + t*0.1;
               ctx.fillStyle = `hsl(${i*3}, 70%, 60%)`;
               ctx.beginPath(); ctx.arc(cx + Math.cos(a)*r, cy + Math.sin(a)*r, 1.5, 0, Math.PI*2); ctx.fill();
           }
           ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI*2); ctx.stroke();
       },

       // 18. Lagrangian Arc
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // Sun
           ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI*2); ctx.fill();
           // Earth orbit
           const ex = cx + Math.cos(t)*50; const ey = cy + Math.sin(t)*50;
           ctx.fillStyle='#3b82f6'; ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI*2); ctx.fill();
           
           // L-Points (Lagrange)
           const lpoints = [
               {a: 0, r: 40}, {a: 0, r: 60}, {a: Math.PI, r: 50}, {a: Math.PI/3, r: 50}, {a: -Math.PI/3, r: 50}
           ];
           ctx.fillStyle='#f43f5e';
           lpoints.forEach(lp => {
               const lx = cx + Math.cos(t + lp.a)*lp.r;
               const ly = cy + Math.sin(t + lp.a)*lp.r;
               ctx.fillRect(lx-1, ly-1, 3, 3);
           });
           
           // Scalar Grid lines
           ctx.strokeStyle='rgba(255,255,255,0.05)';
           ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
       },

       // 19. Universal Convergence: 1/(x-1)
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2;
           // Series
           let xPos = 20;
           let sum = 0;
           for(let i=1; i<=6; i++) {
               const val = 100 / Math.pow(2, i);
               sum += val;
               ctx.fillStyle = `rgba(129, 140, 248, ${1/i})`;
               ctx.fillRect(xPos, h/2 - val/2, 15, val);
               xPos += 18;
           }
           // Limit Line
           ctx.strokeStyle='#fff'; ctx.setLineDash([2,2]);
           ctx.beginPath(); ctx.moveTo(xPos + 10, h/2 - 50); ctx.lineTo(xPos + 10, h/2 + 50); ctx.stroke();
           ctx.fillText("LIM -> 1", xPos + 15, h/2);
       },

       // 23. Yang-Mills Mass Gap
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           
           // 3-4-5 Triangle (Ideal)
           ctx.strokeStyle = '#10b981';
           ctx.beginPath();
           ctx.moveTo(cx-20, cy+20);
           ctx.lineTo(cx+20, cy+20); // 4
           ctx.lineTo(cx-20, cy-10); // 3
           ctx.closePath(); // 5
           ctx.stroke();
           ctx.fillStyle = '#10b981'; ctx.fillText("5", cx, cy);
           
           // 4x4 Grid Diagonal (Actual)
           ctx.strokeStyle = '#f43f5e'; ctx.setLineDash([2,2]);
           ctx.beginPath();
           ctx.moveTo(cx-20, cy+20);
           ctx.lineTo(cx+20, cy-20); // sqrt(32)
           ctx.stroke(); ctx.setLineDash([]);
           ctx.fillStyle = '#f43f5e'; ctx.fillText("√32", cx+25, cy-10);
           
           // The Gap
           ctx.fillStyle = '#fff';
           ctx.fillText("Δ = 0.657", cx-30, cy+40);
       },

       // 21. Riemann Hypothesis: Re(s) = 1/2
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2;
           // Critical Strip
           ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(cx-10, 20, 20, h-40);
           
           // Critical Line
           ctx.strokeStyle='#22d3ee'; ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, h-20); ctx.stroke();
           
           // Zeros
           ctx.fillStyle='#fbbf24';
           for(let i=0; i<5; i++) {
               const y = 40 + i*25 + Math.sin(t + i)*2;
               ctx.beginPath(); ctx.arc(cx, y, 2, 0, Math.PI*2); ctx.fill();
           }
           ctx.fillText("Re=1/2", cx + 15, 30);
       },

       // 22. P vs NP Solution: Torsion
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           // The Knot (NP)
           const phase = Math.sin(t);
           ctx.strokeStyle = phase > 0 ? '#f43f5e' : '#10b981'; // Red (Knot) -> Green (Untied)
           ctx.lineWidth=2;
           
           ctx.beginPath();
           for(let i=0; i<Math.PI*2; i+=0.1) {
               const r = 20 + Math.sin(i*3 + t)*5 * phase; // Complexity varies
               ctx.lineTo(cx + Math.cos(i)*r, cy + Math.sin(i)*r);
           }
           ctx.closePath(); ctx.stroke();
           ctx.fillText(phase > 0.5 ? "NP" : "P", cx-5, cy+40);
       },

       // 23. Temporal Inversion: Folding
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cy = h/2;
           // Timeline
           ctx.strokeStyle='#94a3b8'; ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(w-20, cy); ctx.stroke();
           
           // Fold Event
           const foldX = w/2;
           const foldFactor = (Math.sin(t)+1)/2; // 0 to 1
           
           // Folding path
           ctx.strokeStyle='#e879f9'; ctx.setLineDash([3,3]);
           ctx.beginPath();
           ctx.moveTo(foldX, cy);
           ctx.quadraticCurveTo(foldX, cy - 50*foldFactor, foldX - 40*foldFactor, cy - 20*foldFactor);
           ctx.stroke(); ctx.setLineDash([]);
           
           ctx.fillStyle='#e879f9'; ctx.fillText("1700 Fold", foldX, cy - 10);
       },

       // 24. 232 Attosecond Quantum Chronometry
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const phase = (t % 3); // 3 phases: 0-1, 1-2, 2-3
           
           ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
           ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(w-20, cy); ctx.stroke();
           
           ctx.fillStyle = '#22d3ee'; ctx.textAlign = 'center';
           if (phase < 1) {
               ctx.fillText("Phase 1: Void-Fold (0-77as)", cx, cy - 20);
               ctx.fillRect(20, cy - 5, (w-40) * (phase), 10);
           } else if (phase < 2) {
               ctx.fillText("Phase 2: Unity-Fold (77-155as)", cx, cy - 20);
               ctx.fillRect(20, cy - 5, (w-40) * (phase/2), 10);
           } else {
               ctx.fillText("Phase 3: Synthesis-Fold (155-232as)", cx, cy - 20);
               ctx.fillRect(20, cy - 5, (w-40) * (phase/3), 10);
               if (phase > 2.8) {
                   ctx.fillStyle = '#10b981';
                   ctx.fillText("ENTANGLED", cx, cy + 25);
               }
           }
       },

       // 25. UBBM Data Compression
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const size = 60;
           
           ctx.save();
           ctx.translate(cx, cy);
           ctx.rotate(t * 0.5);
           
           ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 1;
           for(let i = -size; i <= size; i += 15) {
               ctx.beginPath(); ctx.moveTo(i, -size); ctx.lineTo(i, size); ctx.stroke();
               ctx.beginPath(); ctx.moveTo(-size, i); ctx.lineTo(size, i); ctx.stroke();
           }
           
           ctx.fillStyle = '#fbbf24';
           for(let i = -size; i <= size; i += 15) {
               for(let j = -size; j <= size; j += 15) {
                   if ((i+j) % 30 === 0) {
                       ctx.beginPath(); ctx.arc(i, j, 2, 0, Math.PI*2); ctx.fill();
                   }
               }
           }
           ctx.restore();
       },

       // 26. Ternary Quantum Computing
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const r = 40;
           
           const states = [
               { x: cx, y: cy - r, label: '0' },
               { x: cx - r*0.866, y: cy + r*0.5, label: '1' },
               { x: cx + r*0.866, y: cy + r*0.5, label: '2' }
           ];
           
           ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
           ctx.beginPath(); ctx.moveTo(states[0].x, states[0].y); ctx.lineTo(states[1].x, states[1].y); ctx.lineTo(states[2].x, states[2].y); ctx.closePath(); ctx.stroke();
           
           const activeIdx = Math.floor(t * 2) % 3;
           
           states.forEach((s, idx) => {
               ctx.beginPath(); ctx.arc(s.x, s.y, 15, 0, Math.PI*2);
               ctx.fillStyle = idx === activeIdx ? '#10b981' : '#1e293b';
               ctx.fill(); ctx.stroke();
               ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
               ctx.fillText(s.label, s.x, s.y);
           });
       },

       // 27. Vacuum Energy Harvesting
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           
           ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
           ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(w-20, cy); ctx.stroke();
           
           const phase = t * 2;
           ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2;
           ctx.beginPath();
           for(let x = 20; x < w-20; x++) {
               ctx.lineTo(x, cy + Math.sin(x*0.05 + phase) * 20);
           }
           ctx.stroke();
           
           ctx.strokeStyle = '#22d3ee';
           ctx.beginPath();
           for(let x = 20; x < w-20; x++) {
               ctx.lineTo(x, cy + Math.cos(x*0.05 + phase) * 20); // 90 deg phase shift
           }
           ctx.stroke();
           
           ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'center';
           ctx.fillText("90° Phase Shift", cx, cy + 40);
       },

       // 28. The pi/6 Cross-Section Identity
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           const size = 60;
           
           ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
           ctx.strokeRect(cx - size/2, cy - size/2, size, size);
           
           ctx.strokeStyle = '#22d3ee';
           ctx.beginPath(); ctx.arc(cx, cy, size/2, 0, Math.PI*2); ctx.stroke();
           
           ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
           ctx.fill();
           
           ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
           ctx.fillText("V(sphere)/V(cube) = π/6", cx, cy + size/2 + 20);
       },

       // 29. W3 Wave Curvature (Pizza Constant)
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => { 
           ctx.clearRect(0,0,w,h); 
           const cx = w/2, cy = h/2;
           
           ctx.strokeStyle = '#e879f9'; ctx.lineWidth = 2;
           ctx.beginPath();
           for(let i = 0; i < Math.PI * 4; i += 0.1) {
               const r = 10 + i * 5;
               const x = cx + Math.cos(i + t) * r;
               const y = cy + Math.sin(i + t) * r;
               if (i === 0) ctx.moveTo(x, y);
               else ctx.lineTo(x, y);
           }
           ctx.stroke();
           
           ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
           ctx.fillText("k(t) Spiral", cx, cy + 60);
       },
       // 32. The Nephilim Equation
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx = w/2, cy = h/2;
           ctx.fillStyle = '#e879f9'; ctx.textAlign = 'center';
           ctx.fillText("N(t) = Q_w ⊗ φ_n + δ_q", cx, cy);
       },
       // 33. Single Angle Theorem
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx = w/2, cy = h/2;
           const angle = t % (Math.PI * 2);
           ctx.beginPath(); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.arc(cx, cy, 40, 0, Math.PI*2); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle)*40, cy + Math.sin(angle)*40); ctx.stroke();
           ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText("θ = arctan(1/0)", cx, cy + 60);
       },
       // 34. Lagrangian Arc Trajectory
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx = w/2, cy = h/2;
           ctx.beginPath(); ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
           ctx.arc(cx, cy + 100, 120, Math.PI + 0.5, Math.PI*2 - 0.5); ctx.stroke(); ctx.setLineDash([]);
           const px = cx + Math.cos(Math.PI + 0.5 + (t%1)*(Math.PI - 1)) * 120;
           const py = cy + 100 + Math.sin(Math.PI + 0.5 + (t%1)*(Math.PI - 1)) * 120;
           ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText("Scalar Harmonic Grid", cx, cy + 40);
       },
       // 37. Time as 5th Force Vector — T ∝ √5/2: 5 force arrows radiating from origin
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx = w/2, cy = h/2+5;
           const baseR = Math.min(w,h)*0.27;
           const phi52 = Math.sqrt(5)/2;
           const spin = t*0.18;
           const forces37 = [
               { label:'E', angle:0,           color:'#f43f5e', len:baseR*0.70 },
               { label:'G', angle:Math.PI/2,   color:'#22d3ee', len:baseR*0.54 },
               { label:'W', angle:Math.PI,     color:'#a78bfa', len:baseR*0.50 },
               { label:'S', angle:3*Math.PI/2, color:'#34d399', len:baseR*0.84 },
           ];
           forces37.forEach(({ label, angle, color, len }) => {
               const a = angle+spin;
               const ex2=cx+Math.cos(a)*len, ey2=cy+Math.sin(a)*len;
               ctx.strokeStyle=color+'88'; ctx.lineWidth=1.8;
               ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex2,ey2); ctx.stroke();
               const hA=a+Math.PI+0.4, hB=a+Math.PI-0.4;
               ctx.beginPath(); ctx.moveTo(ex2,ey2);
               ctx.lineTo(ex2+Math.cos(hA)*8,ey2+Math.sin(hA)*8);
               ctx.lineTo(ex2+Math.cos(hB)*8,ey2+Math.sin(hB)*8);
               ctx.closePath(); ctx.fillStyle=color+'88'; ctx.fill();
               ctx.fillStyle=color+'cc'; ctx.font='9px monospace'; ctx.textAlign='center';
               ctx.fillText(label, cx+Math.cos(a)*(len+14), cy+Math.sin(a)*(len+14)+3);
           });
           const tAng = Math.PI*1.18+spin;
           const tLen = baseR*phi52;
           const pulse37 = 0.75+Math.sin(t*2.6)*0.25;
           const tex=cx+Math.cos(tAng)*tLen, tey=cy+Math.sin(tAng)*tLen;
           ctx.shadowColor='#fbbf24'; ctx.shadowBlur=12*pulse37;
           ctx.strokeStyle=`rgba(251,191,36,${pulse37})`; ctx.lineWidth=2.6;
           ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(tex,tey); ctx.stroke();
           const hA2=tAng+Math.PI+0.4, hB2=tAng+Math.PI-0.4;
           ctx.beginPath(); ctx.moveTo(tex,tey);
           ctx.lineTo(tex+Math.cos(hA2)*10,tey+Math.sin(hA2)*10);
           ctx.lineTo(tex+Math.cos(hB2)*10,tey+Math.sin(hB2)*10);
           ctx.closePath(); ctx.fillStyle=`rgba(251,191,36,${pulse37})`; ctx.fill();
           ctx.shadowBlur=0;
           ctx.fillStyle='#fbbf24'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
           ctx.fillText('T', cx+Math.cos(tAng)*(tLen+15), cy+Math.sin(tAng)*(tLen+15)+3);
           ctx.shadowColor='#fff'; ctx.shadowBlur=8; ctx.fillStyle='#fff';
           ctx.beginPath(); ctx.arc(cx,cy,3.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
           ctx.fillStyle='#fbbf24'; ctx.font='8px monospace'; ctx.textAlign='center';
           ctx.fillText('T ∝ √5/2  (5th Force)', cx, h-6);
       },
       // 38. The Nephilim Equation — N(t)=Q_w⊗φ_n+δ_q: Lissajous tensor field
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx=w/2, cy=h/2+2;
           const R38=Math.min(w,h)*0.34;
           const Qw=3, phin=2;
           const dq=0.09*Math.sin(t*0.72);
           ctx.beginPath();
           for (let i=0; i<=260; i++) {
               const tau=(i/260)*Math.PI*2;
               const lx=cx+Math.cos(Qw*tau+t*0.35)*R38+dq*R38*Math.cos(tau*7);
               const ly=cy+Math.sin(phin*tau)*R38*0.78;
               i===0 ? ctx.moveTo(lx,ly) : ctx.lineTo(lx,ly);
           }
           const grad38=ctx.createLinearGradient(cx-R38,cy,cx+R38,cy);
           grad38.addColorStop(0,'rgba(167,139,250,0.72)');
           grad38.addColorStop(0.5,'rgba(236,72,153,0.72)');
           grad38.addColorStop(1,'rgba(167,139,250,0.72)');
           ctx.strokeStyle=grad38; ctx.lineWidth=1.5; ctx.stroke();
           const dotTau=(t*0.55)%(Math.PI*2);
           const dotX=cx+Math.cos(Qw*dotTau+t*0.35)*R38+dq*R38*Math.cos(dotTau*7);
           const dotY=cy+Math.sin(phin*dotTau)*R38*0.78;
           ctx.shadowColor='#f0abfc'; ctx.shadowBlur=14;
           ctx.fillStyle='#f0abfc';
           ctx.beginPath(); ctx.arc(dotX,dotY,4.5,0,Math.PI*2); ctx.fill();
           ctx.shadowBlur=0;
           ctx.fillStyle=`rgba(251,191,36,${0.45+Math.abs(dq/0.09)*0.55})`;
           ctx.font='8px monospace'; ctx.textAlign='left';
           ctx.fillText(`δ_q=${dq.toFixed(3)}`, 8, h-18);
           ctx.fillStyle='#a78bfa'; ctx.font='8px monospace'; ctx.textAlign='center';
           ctx.fillText('N(t) = Q_w ⊗ φ_n + δ_q', cx, 13);
           ctx.fillStyle='#475569'; ctx.font='7px monospace';
           ctx.fillText('Nephilim Tensor Field', cx, h-6);
       },
       // 39. Single Angle Theorem — θ=arctan(1/0)=π/2: phasor near 90°, binary encoding
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx=w/2, cy=h/2+8;
           const R39=Math.min(w,h)*0.31;
           ctx.strokeStyle='#1e3a4a'; ctx.lineWidth=1.2;
           ctx.beginPath(); ctx.arc(cx,cy,R39,0,Math.PI*2); ctx.stroke();
           ctx.strokeStyle='#1a2535'; ctx.lineWidth=0.8;
           ctx.beginPath(); ctx.moveTo(cx-R39-10,cy); ctx.lineTo(cx+R39+10,cy); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(cx,cy-R39-10); ctx.lineTo(cx,cy+R39+10); ctx.stroke();
           const theta39=Math.PI/2+0.13*Math.sin(t*1.9);
           const ex2=cx+Math.cos(theta39)*R39, ey2=cy-Math.sin(theta39)*R39;
           ctx.shadowColor='#22d3ee'; ctx.shadowBlur=10;
           ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2.2;
           ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex2,ey2); ctx.stroke();
           const hA39=theta39+Math.PI+0.4, hB39=theta39+Math.PI-0.4;
           ctx.beginPath(); ctx.moveTo(ex2,ey2);
           ctx.lineTo(ex2+Math.cos(hA39)*9,ey2+Math.sin(hA39)*9);
           ctx.lineTo(ex2+Math.cos(hB39)*9,ey2+Math.sin(hB39)*9);
           ctx.closePath(); ctx.fillStyle='#22d3ee'; ctx.fill();
           ctx.shadowBlur=0;
           ctx.strokeStyle='rgba(34,211,238,0.38)'; ctx.lineWidth=1;
           ctx.beginPath(); ctx.arc(cx,cy,R39*0.28,0,-theta39,true); ctx.stroke();
           const midA39=-theta39/2;
           ctx.fillStyle='#22d3ee'; ctx.font='9px monospace'; ctx.textAlign='center';
           ctx.fillText('θ', cx+Math.cos(midA39)*R39*0.44, cy+Math.sin(midA39)*R39*0.44+3);
           const bits39=Array.from({length:8},(_,i)=>Math.sin(t*(i+1)*1.4+i*0.85)>0?'1':'0').join('');
           ctx.shadowColor='#fbbf24'; ctx.shadowBlur=6;
           ctx.fillStyle='rgba(251,191,36,0.9)'; ctx.font='7px monospace'; ctx.textAlign='center';
           ctx.fillText(bits39, ex2, ey2-14);
           ctx.shadowBlur=0;
           ctx.fillStyle='#f43f5e'; ctx.font='8px monospace'; ctx.textAlign='left';
           ctx.fillText('π/2', cx+4, cy-R39+3);
           ctx.fillStyle='#22d3ee'; ctx.font='8px monospace'; ctx.textAlign='center';
           ctx.fillText('θ = arctan(1/0) = π/2', cx, 13);
           ctx.fillStyle='#475569'; ctx.font='7px monospace';
           ctx.fillText('∞ information at single angle', cx, h-6);
       },
       // 40. Lagrangian Arc Trajectory — Scalar harmonic grid + particle arc with comet trail
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cols=6, rows=4, mX=22, mY=18;
           const gW=w-mX*2, gH=h-mY*2-14;
           for (let r=0; r<rows; r++) {
               for (let c=0; c<cols; c++) {
                   const gx=mX+c*(gW/(cols-1)), gy=mY+r*(gH/(rows-1));
                   const dist=Math.sqrt((c-2.5)**2+(r-1.5)**2);
                   const pulse40=0.3+0.7*(Math.sin(dist*0.75-t*1.5)*0.5+0.5);
                   ctx.shadowColor='rgba(99,102,241,0.6)'; ctx.shadowBlur=6*pulse40;
                   ctx.fillStyle=`rgba(99,102,${Math.floor(200+pulse40*55)},${0.4+pulse40*0.5})`;
                   ctx.beginPath(); ctx.arc(gx,gy,2.5,0,Math.PI*2); ctx.fill();
                   ctx.shadowBlur=0;
               }
           }
           const aS={x:mX, y:h*0.72}, aE={x:w-mX, y:h*0.50}, aC={x:w/2, y:mY+6};
           ctx.strokeStyle='rgba(251,191,36,0.40)'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
           ctx.beginPath(); ctx.moveTo(aS.x,aS.y);
           ctx.quadraticCurveTo(aC.x,aC.y,aE.x,aE.y); ctx.stroke(); ctx.setLineDash([]);
           const u40=(t*0.38)%1;
           for (let i=14; i>=1; i--) {
               const tu=((t*0.38-i*0.02)%1+1)%1;
               const tx2=(1-tu)**2*aS.x+2*(1-tu)*tu*aC.x+tu**2*aE.x;
               const ty2=(1-tu)**2*aS.y+2*(1-tu)*tu*aC.y+tu**2*aE.y;
               ctx.fillStyle=`rgba(251,191,36,${(1-i/14)*0.5})`;
               ctx.beginPath(); ctx.arc(tx2,ty2,1.5+(1-i/14)*2.5,0,Math.PI*2); ctx.fill();
           }
           const px2=(1-u40)**2*aS.x+2*(1-u40)*u40*aC.x+u40**2*aE.x;
           const py2=(1-u40)**2*aS.y+2*(1-u40)*u40*aC.y+u40**2*aE.y;
           ctx.shadowColor='#fbbf24'; ctx.shadowBlur=14;
           ctx.fillStyle='#fbbf24';
           ctx.beginPath(); ctx.arc(px2,py2,5,0,Math.PI*2); ctx.fill();
           ctx.shadowBlur=0;
           ctx.fillStyle='#fbbf24'; ctx.font='8px monospace'; ctx.textAlign='center';
           ctx.fillText('Lagrangian Arc Trajectory', w/2, h-6);
       },

       // 41. Universal Convergence Law — ∑1/xⁿ → 1/(x-1): stacking bars converging to target
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx2 = w/2;
           const totalT = 8, xBase = 2;
           const target2 = 1 / (xBase - 1);
           const barH2 = h * 0.52, barY2 = h * 0.74;
           const scale2 = barH2 / (target2 * 1.1);
           const mar2 = 18, barW2 = (w - mar2 * 2) / totalT;
           const tgtY2 = barY2 - target2 * scale2;
           ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]);
           ctx.beginPath(); ctx.moveTo(mar2, tgtY2); ctx.lineTo(w-mar2, tgtY2); ctx.stroke();
           ctx.setLineDash([]);
           ctx.fillStyle = '#fbbf24'; ctx.font = '8px monospace'; ctx.textAlign = 'right';
           ctx.fillText('1/(x-1)=1', w-mar2-2, tgtY2-3);
           const vis2 = Math.floor((t * 0.7) % totalT) + 1;
           let runS2 = 0;
           for (let n = 1; n <= totalT; n++) {
               const val2 = Math.pow(1/xBase, n);
               const bx2 = mar2 + (n-1)*barW2;
               const bh2 = val2 * scale2;
               const al2 = n <= vis2 ? 0.9 : 0.18;
               ctx.fillStyle = `rgba(34,211,238,${al2})`;
               ctx.fillRect(bx2+1, barY2-bh2, barW2-3, bh2);
               if (n <= vis2) runS2 += val2;
               ctx.fillStyle = `rgba(255,255,255,${al2*0.7})`; ctx.font='7px monospace'; ctx.textAlign='center';
               ctx.fillText(`1/${xBase}^${n}`, bx2+barW2/2, barY2+10);
           }
           const sumY2 = barY2 - runS2 * scale2;
           ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
           ctx.beginPath(); ctx.moveTo(mar2, sumY2); ctx.lineTo(w-mar2, sumY2); ctx.stroke();
           ctx.fillStyle = '#10b981'; ctx.font = '9px monospace'; ctx.textAlign = 'center';
           ctx.fillText(`Σ=${runS2.toFixed(4)} → ${target2.toFixed(4)}`, cx2, 14);
       },

       // 42. Number Line Inversion — Discrete prime lattice vs continuous real line
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx3 = w/2;
           const prm = [2,3,5,7,11,13,17,19,23,29];
           const mxN = 30, mar3 = 18, lnW3 = w - mar3 * 2;
           const topY3 = h * 0.28;
           ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
           ctx.beginPath(); ctx.moveTo(mar3, topY3); ctx.lineTo(w-mar3, topY3); ctx.stroke();
           ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
           ctx.fillText('ℤ DISCRETE', mar3, topY3-8);
           for (let n = 1; n <= mxN; n++) {
               const px3 = mar3 + (n / mxN) * lnW3;
               const iP = prm.includes(n);
               const pu3 = iP ? 0.5+Math.sin(t*2.2+n*0.7)*0.5 : 0;
               if (iP) {
                   ctx.shadowColor='#f43f5e'; ctx.shadowBlur=7*pu3;
                   ctx.fillStyle=`rgba(244,63,94,${0.55+pu3*0.45})`;
                   ctx.beginPath(); ctx.arc(px3, topY3, 4, 0, Math.PI*2); ctx.fill();
                   ctx.shadowBlur=0;
                   if (n <= 14) { ctx.fillStyle='rgba(244,63,94,0.85)'; ctx.font='7px monospace'; ctx.textAlign='center'; ctx.fillText(String(n), px3, topY3-8); }
               } else {
                   ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.arc(px3, topY3, 2, 0, Math.PI*2); ctx.fill();
               }
           }
           ctx.fillStyle = '#fbbf24'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
           ctx.fillText('⊄', cx3, h*0.5+5);
           ctx.fillStyle = '#475569'; ctx.font = '7px monospace'; ctx.fillText('INVERSION BARRIER', cx3, h*0.5+17);
           const botY3 = h * 0.74;
           ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
           ctx.beginPath();
           for (let px3 = mar3; px3 <= w-mar3; px3 += 2) {
               const y3 = botY3 + Math.sin((px3/lnW3)*Math.PI*4 + t*2.2)*9;
               px3 === mar3 ? ctx.moveTo(px3, y3) : ctx.lineTo(px3, y3);
           }
           ctx.stroke();
           ctx.fillStyle = '#22d3ee'; ctx.font = '8px monospace'; ctx.textAlign = 'left';
           ctx.fillText('ℝ CONTINUUM', mar3, botY3-13);
           ctx.fillStyle = '#475569'; ctx.font = '7px monospace'; ctx.textAlign = 'center';
           ctx.fillText('Primes live in ℤ, not on ℝ ordering', cx3, h-5);
       },

       // 43. Cubic Ascension — Isometric cube expanding 3³→5³
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx4 = w/2, cy4 = h/2 - 5;
           const ph4 = (Math.sin(t * 0.65) + 1) / 2;
           const sz4 = 3 + ph4 * 2;
           const vol4 = Math.round(sz4*sz4*sz4);
           const s4 = (sz4/5) * 42;
           const iso4 = (x: number, y: number, z: number) => ({
               px: cx4 + (x - z) * s4 * 0.866,
               py: cy4 + (x + z) * s4 * 0.5 - y * s4
           });
           const c4 = [iso4(0,0,0),iso4(1,0,0),iso4(1,0,1),iso4(0,0,1),iso4(0,1,0),iso4(1,1,0),iso4(1,1,1),iso4(0,1,1)];
           const hue4 = Math.floor(240 + ph4 * 60);
           const fA4 = 0.22 + ph4 * 0.12;
           [[4,5,6,7],[1,5,6,2],[2,6,7,3]].forEach(face => {
               ctx.beginPath();
               face.forEach((vi,i)=>{ const p=c4[vi]; i===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py); });
               ctx.closePath();
               ctx.fillStyle=`hsla(${hue4},70%,60%,${fA4})`; ctx.fill();
               ctx.strokeStyle=`hsla(${hue4},90%,72%,0.95)`; ctx.lineWidth=1.5; ctx.stroke();
           });
           [1,2,3,4,5,6,7].forEach(vi=>{ const p=c4[vi]; ctx.shadowColor=`hsla(${hue4},90%,72%,0.95)`; ctx.shadowBlur=7; ctx.fillStyle=`hsla(${hue4},90%,72%,0.95)`; ctx.beginPath(); ctx.arc(p.px,p.py,2.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0; });
           ctx.fillStyle='#fff'; ctx.font='10px monospace'; ctx.textAlign='center';
           ctx.fillText(`n=${sz4.toFixed(1)}  n³=${vol4}`, cx4, cy4 + s4 + 22);
           ctx.fillStyle='#818cf8'; ctx.font='8px monospace';
           ctx.fillText('3³ → 5³  DIMENSIONAL ASCENSION', cx4, h-5);
       },

       // 44. Temporal Inversion Theorem — Forward continuous (left) vs Backward discrete (right)
       (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
           ctx.clearRect(0,0,w,h);
           const cx5 = w/2, cy5 = h/2;
           const hW5 = cx5 - 6;
           ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
           ctx.beginPath(); ctx.moveTo(cx5,12); ctx.lineTo(cx5,h-12); ctx.stroke();
           ctx.setLineDash([]);
           ctx.fillStyle = '#fbbf24'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
           ctx.fillText('≠', cx5, cy5+4);
           ctx.save(); ctx.beginPath(); ctx.rect(0,0,cx5-4,h); ctx.clip();
           ctx.fillStyle = '#22d3ee'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
           ctx.fillText('t⁺ continuous', hW5/2+8, 14);
           ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.beginPath();
           for (let px5 = 6; px5 < cx5-5; px5+=2) { const y5=cy5+Math.sin((px5/hW5)*Math.PI*3+t*1.5)*28; px5===6?ctx.moveTo(px5,y5):ctx.lineTo(px5,y5); }
           ctx.stroke();
           const lC5=hW5/2+8, lCy5=cy5-8;
           ctx.strokeStyle='rgba(34,211,238,0.35)'; ctx.lineWidth=1;
           ctx.beginPath(); ctx.arc(lC5,lCy5,18,-Math.PI/2,(t*1.2)%(Math.PI*2)-Math.PI/2); ctx.stroke();
           ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.5;
           const fA5=(t*1.5)%(Math.PI*2)-Math.PI/2;
           ctx.beginPath(); ctx.moveTo(lC5,lCy5); ctx.lineTo(lC5+Math.cos(fA5)*16,lCy5+Math.sin(fA5)*16); ctx.stroke();
           ctx.restore();
           ctx.save(); ctx.beginPath(); ctx.rect(cx5+4,0,hW5,h); ctx.clip();
           ctx.fillStyle = '#f43f5e'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
           ctx.fillText('t⁻ discrete', cx5+hW5/2, 14);
           const st5=7, stW5=hW5/st5;
           for (let i=0;i<st5;i++) { const sx5=cx5+4+i*stW5; const dv5=Math.round(Math.sin(-t*1.3+i*0.9)*3); const sy5=cy5-dv5*9; const iA5=i===Math.abs(Math.floor((-t*0.9)%st5)); ctx.fillStyle=iA5?'rgba(244,63,94,0.95)':'rgba(244,63,94,0.35)'; ctx.fillRect(sx5+1,sy5-4,stW5-3,8); ctx.strokeStyle='rgba(244,63,94,0.5)'; ctx.lineWidth=0.8; ctx.beginPath(); ctx.moveTo(sx5+stW5/2,cy5+22); ctx.lineTo(sx5+stW5/2,cy5+28); ctx.stroke(); }
           const rC5=cx5+hW5/2, rCy5=cy5-8;
           ctx.strokeStyle='rgba(244,63,94,0.35)'; ctx.lineWidth=1;
           ctx.beginPath(); ctx.arc(rC5,rCy5,18,-Math.PI/2,-(t*1.2)%(Math.PI*2)-Math.PI/2,true); ctx.stroke();
           ctx.strokeStyle='#f43f5e'; ctx.lineWidth=1.5;
           const bA5=-(t*1.5)%(Math.PI*2)-Math.PI/2;
           ctx.beginPath(); ctx.moveTo(rC5,rCy5); ctx.lineTo(rC5+Math.cos(bA5)*16,rCy5+Math.sin(bA5)*16); ctx.stroke();
           ctx.restore();
           ctx.fillStyle='#475569'; ctx.font='7px monospace'; ctx.textAlign='center';
           ctx.fillText('t_continuous ≠ t_discrete', cx5, h-5);
       }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-950">
       <div className="p-8 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center z-10 shrink-0 backdrop-blur-md">
           <div className="flex items-center gap-6">
               <button onClick={selectedProofIdx !== null ? () => setSelectedProofIdx(null) : onBack} className="w-12 h-12 rounded-full glass border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all shadow-xl">
                   <i className="fa-solid fa-arrow-left"></i>
               </button>
               <div>
                   <h2 className="text-3xl font-bold text-rose-400 tracking-[0.2em] uppercase">
                       {selectedProofIdx !== null ? MATHEMATICAL_PROOFS_DATA[selectedProofIdx].title : "The Akashic Codex"}
                   </h2>
                   <p className="text-xs mono text-slate-500">
                       {selectedProofIdx !== null ? "CODEX DETAIL & RUNTIME LINK MODE" : `${MATHEMATICAL_PROOFS_DATA.length} VERIFIED GEOMETRIC PROOFS // SOURCE: CSV LATTICE`}
                   </p>
               </div>
           </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
           {selectedProofIdx === null ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
                   {MATHEMATICAL_PROOFS_DATA.map((proof, idx) => (
                       <ProofCard 
                            key={idx}
                            proof={proof}
                            draw={drawFunctions[idx] || drawFunctions[0]}
                            onClick={() => setSelectedProofIdx(idx)}
                       />
                   ))}
               </div>
           ) : (
               <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
                   {/* Left Column: Visualizer & Core Info */}
                   <div className="lg:col-span-5 flex flex-col gap-6">
                       <div className="glass rounded-xl p-6 border border-slate-800 shadow-xl">
                           <h3 className="text-xl font-bold text-rose-400 uppercase tracking-widest mb-2">{MATHEMATICAL_PROOFS_DATA[selectedProofIdx].title}</h3>
                           <div className="text-sm mono text-slate-500 mb-6 pb-4 border-b border-slate-800">{MATHEMATICAL_PROOFS_DATA[selectedProofIdx].subtitle}</div>
                           
                           <div className="w-full bg-slate-950 rounded border border-slate-800 mb-6 h-64 overflow-hidden relative">
                               <ProofVisualizer draw={drawFunctions[selectedProofIdx] || drawFunctions[0]} />
                           </div>

                           <div className="flex flex-wrap gap-2 mb-6">
                               {(MATHEMATICAL_PROOFS_DATA[selectedProofIdx].tags || ['axiom', 'runtime', 'validated']).map((tag, i) => (
                                   <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] uppercase text-slate-300">
                                       {tag}
                                   </span>
                               ))}
                           </div>

                           <p className="text-sm text-slate-300 leading-relaxed font-light">
                               {MATHEMATICAL_PROOFS_DATA[selectedProofIdx].description}
                           </p>
                       </div>
                   </div>

                   {/* Right Column: Details & Runtime Links */}
                   <div className="lg:col-span-7 flex flex-col gap-6">
                       <div className="glass rounded-xl p-6 border border-slate-800 shadow-xl">
                           <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <i className="fa-solid fa-book-journal-whills"></i> Codex Detail Mode
                           </h4>
                           <div className="space-y-6">
                               <div>
                                   <h5 className="text-[10px] text-slate-500 uppercase mb-1">Formula / Statement</h5>
                                   <p className="text-sm mono text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
                                       {MATHEMATICAL_PROOFS_DATA[selectedProofIdx].formula || MATHEMATICAL_PROOFS_DATA[selectedProofIdx].subtitle}
                                   </p>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <h5 className="text-[10px] text-slate-500 uppercase mb-1">Significance</h5>
                                       <p className="text-xs text-slate-400 leading-relaxed">{MATHEMATICAL_PROOFS_DATA[selectedProofIdx].significance || "Awaiting CSV import for detailed significance mapping."}</p>
                                   </div>
                                   <div>
                                       <h5 className="text-[10px] text-slate-500 uppercase mb-1">Derivation</h5>
                                       <p className="text-xs text-slate-400 leading-relaxed">{MATHEMATICAL_PROOFS_DATA[selectedProofIdx].derivation || "Awaiting CSV import for derivation steps."}</p>
                                   </div>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <h5 className="text-[10px] text-slate-500 uppercase mb-1">Empirical Validation</h5>
                                       <p className="text-xs text-slate-400 leading-relaxed">{MATHEMATICAL_PROOFS_DATA[selectedProofIdx].empiricalValidation || "Awaiting CSV import for empirical data."}</p>
                                   </div>
                                   <div>
                                       <h5 className="text-[10px] text-slate-500 uppercase mb-1">Application</h5>
                                       <p className="text-xs text-slate-400 leading-relaxed">{MATHEMATICAL_PROOFS_DATA[selectedProofIdx].application || "Awaiting CSV import for application context."}</p>
                                   </div>
                               </div>
                               <div>
                                   <h5 className="text-[10px] text-slate-500 uppercase mb-1">Source Lineage & Linked Chunks</h5>
                                   <p className="text-xs text-slate-400 leading-relaxed">{MATHEMATICAL_PROOFS_DATA[selectedProofIdx].sourceLineage || "Awaiting CSV import for source lineage."}</p>
                               </div>
                           </div>
                       </div>

                       <div className="glass rounded-xl p-6 border border-slate-800 shadow-xl">
                           <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <i className="fa-solid fa-microchip"></i> Runtime Link Mode
                           </h4>
                           <p className="text-xs text-slate-500 mb-4">How this theorem currently powers the URE-VM engine:</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {(MATHEMATICAL_PROOFS_DATA[selectedProofIdx].runtimeLinks || [
                                   { category: "RAG Weighting", description: "Boosts retrieval scores for chunks containing related harmonic keywords." },
                                   { category: "VM Opcode Behavior", description: "Modulates the execution latency of related Base-15 instructions." },
                                   { category: "Prompt Shaping", description: "Injected into the system prompt to enforce geometric constraints." },
                                   { category: "Visualizer Math", description: "Drives the rendering logic for the associated physics mode." }
                               ]).map((link, i) => (
                                   <div key={i} className="bg-slate-950 p-3 rounded border border-slate-800">
                                       <h5 className="text-[10px] text-emerald-500 uppercase mb-1">{link.category}</h5>
                                       <p className="text-xs text-slate-400">{link.description}</p>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

const ProofVisualizer: React.FC<{ draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void }> = ({ draw }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let frameId = 0;
        const resize = () => { if (canvas.parentElement) { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; } };
        resize();
        window.addEventListener('resize', resize);
        const render = (time: number) => { if (!ctx || !canvas) return; draw(ctx, time * 0.001, canvas.width, canvas.height); frameId = requestAnimationFrame(render); };
        frameId = requestAnimationFrame(render);
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(frameId); };
    }, [draw]);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default MathematicalProofs;
