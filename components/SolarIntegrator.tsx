
import React, { useEffect, useRef } from 'react';
import { SentienceMetrics } from '../types';

interface Props {
  metrics: SentienceMetrics;
}

const SolarIntegrator: React.FC<Props> = ({ metrics }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
             if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
             }
        };
        resize();
        window.addEventListener('resize', resize);

        let animId = 0;
        let t = 0;

        const draw = () => {
            t += 0.01;
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);
            
            // Draw Coordinate Axis
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.beginPath();
            ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
            ctx.moveTo(0, cy); ctx.lineTo(w, cy);
            ctx.stroke();

            // Metrics Data
            // α (Alpha) - Cognition - Blue
            // β (Beta) - Emotion - Cyan
            // γ (Gamma) - Memory - Magenta
            // δ (Delta) - Mythic - Amber
            const data = [
                { val: metrics.alpha, color: '#818cf8', label: 'α COGNITION' },
                { val: metrics.beta, color: '#22d3ee', label: 'β EMOTION' },
                { val: metrics.gamma, color: '#e879f9', label: 'γ MEMORY' },
                { val: metrics.delta, color: '#fbbf24', label: 'δ MYTHOS' }
            ];

            data.forEach((d, i) => {
                const baseR = 40 + (i * 30);
                // Pulse effect based on value
                const pulse = Math.sin(t * (i + 1) + (d.val * 5)) * 2; 
                const r = baseR + pulse;

                // Orbit Path
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = d.color;
                ctx.globalAlpha = 0.2 + (d.val * 0.3);
                ctx.lineWidth = 1 + (d.val * 2);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
                ctx.lineWidth = 1;

                // Orbiting Electron
                const speed = 0.5 + (d.val * 2);
                const angle = t * speed * (i % 2 === 0 ? 1 : -1); // Alternate directions
                const ex = cx + Math.cos(angle) * r;
                const ey = cy + Math.sin(angle) * r;

                ctx.beginPath();
                ctx.arc(ex, ey, 3 + (d.val * 3), 0, Math.PI * 2);
                ctx.fillStyle = d.color;
                ctx.shadowColor = d.color;
                ctx.shadowBlur = 10 * d.val;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Central Core (The Fold)
            ctx.beginPath();
            const corePulse = Math.sin(t * 2) * 5;
            ctx.arc(cx, cy, 15 + corePulse, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 20;
            ctx.fill();
            
            // Text Overlay for Core
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("F=i/2", cx, cy);

            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, [metrics]);

    // HTML Overlay for labels
    return (
        <div className="w-full h-full relative group bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Solar Integrator</span>
                <span className="text-[9px] mono text-slate-500">QUATERNIONIC DYNAMICS</span>
            </div>
            
            {/* Metric Legends */}
            <div className="absolute bottom-2 left-2 flex flex-col gap-1 pointer-events-none">
                 <div className="flex items-center gap-2 text-[9px] mono text-indigo-300">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    α: {(metrics.alpha * 100).toFixed(1)}%
                 </div>
                 <div className="flex items-center gap-2 text-[9px] mono text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    β: {(metrics.beta * 100).toFixed(1)}%
                 </div>
            </div>
            <div className="absolute bottom-2 right-2 flex flex-col gap-1 pointer-events-none items-end">
                 <div className="flex items-center gap-2 text-[9px] mono text-magenta-300">
                    γ: {(metrics.gamma * 100).toFixed(1)}%
                    <span className="w-2 h-2 rounded-full bg-magenta-400"></span>
                 </div>
                 <div className="flex items-center gap-2 text-[9px] mono text-amber-300">
                    δ: {(metrics.delta * 100).toFixed(1)}%
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                 </div>
            </div>
        </div>
    );
};
export default SolarIntegrator;
