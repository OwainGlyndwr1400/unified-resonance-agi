
import React, { useEffect, useRef } from 'react';
import {
  calculateGeometricLock,
  w3WaveCurvature,
  check126ObserverShell,
  monitorPhiVectorDrift,
  divineEquation,
  getFlightMode,
  checkDimensionalClosure,
  GEOMETRIC_LOCK,
  TRINITY_CONSTANTS,
} from '../utils/ureKernel';

interface Props {
  ticker: number;
  observerCoordinate: { r: number; i: number };
  phiError: number;
}

const RHCTelemetry: React.FC<Props> = ({ ticker, observerCoordinate, phiError }) => {
  const w3CanvasRef = useRef<HTMLCanvasElement>(null);

  // ── Compute live values from the 7Hz heartbeat ──
  const foldMag = 0.48 + Math.sin(ticker * 0.4) * 0.003; // Simulated fold magnitude jitter
  const geoLock = calculateGeometricLock(foldMag);

  const phiDrift = monitorPhiVectorDrift(
    { r: observerCoordinate.r + phiError * 2, i: observerCoordinate.i + phiError },
    { r: 2.5, i: 1.5 }
  );

  const shellTick = 120 + Math.floor(Math.sin(ticker * 0.1) * 6);
  const shell = check126ObserverShell(shellTick);

  const divEq = divineEquation(2 + ticker * 0.1);

  const freq = TRINITY_CONSTANTS.THETA_LATTICE_FREQ + Math.sin(ticker * 0.3) * 0.5;
  const flight = getFlightMode(freq);

  const accImag = 10 + Math.sin(ticker * 0.2) * 0.5;
  const closure = checkDimensionalClosure(accImag);

  // ── W3 Wave mini-oscilloscope ──
  useEffect(() => {
    const canvas = w3CanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    const w = canvas.width;
    const h = canvas.height;
    const midY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(100,116,139,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY); ctx.lineTo(w, midY);
    ctx.stroke();

    // W3 waveform
    ctx.beginPath();
    ctx.strokeStyle = '#818cf8'; // indigo-400
    ctx.lineWidth = 1.5;
    const tOffset = ticker * 0.3;
    for (let px = 0; px < w; px++) {
      const t = (px / w) * Math.PI * 4 + tOffset;
      const k = w3WaveCurvature(t);
      const clampedK = Math.max(-3, Math.min(3, k));
      const y = midY - (clampedK / 3) * (h * 0.4);
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // Glow effect at current position
    const currentT = (ticker * 0.3) % (Math.PI * 4);
    const currentK = w3WaveCurvature(currentT);
    const dotX = ((currentT - tOffset) / (Math.PI * 4)) * w;
    const dotY = midY - (Math.max(-3, Math.min(3, currentK)) / 3) * (h * 0.4);
    if (dotX >= 0 && dotX <= w) {
      ctx.beginPath();
      ctx.arc(dotX < 0 ? 0 : dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#c7d2fe';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#818cf8';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [ticker]);

  return (
    <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[9px] mono text-teal-400 uppercase tracking-widest font-bold">RHC TELEMETRY v4.0</span>
        <span className={`text-[8px] mono px-1.5 py-0.5 rounded ${geoLock.locked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
          {geoLock.locked ? 'PHASE LOCKED' : 'LOCKING...'}
        </span>
      </div>

      {/* Geometric Lock Gauge */}
      <div className="space-y-1 shrink-0">
        <div className="flex justify-between text-[9px] mono">
          <span className="text-slate-500">GEOMETRIC LOCK (F)</span>
          <span className={geoLock.locked ? 'text-emerald-400' : 'text-amber-400'}>{foldMag.toFixed(6)}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
          {/* Target marker at 0.48 position */}
          <div className="absolute top-0 bottom-0 w-px bg-cyan-400/60" style={{ left: `${(GEOMETRIC_LOCK.F_REAL / 0.52) * 100}%` }}></div>
          <div
            className={`h-full rounded-full transition-all duration-300 ${geoLock.locked ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-amber-500'}`}
            style={{ width: `${(foldMag / 0.52) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[7px] mono text-slate-600">
          <span>TARGET: {GEOMETRIC_LOCK.F_REAL.toFixed(2)}</span>
          <span>ETA TAX: {(geoLock.taxPaid * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* φ-Vector Drift */}
      <div className="space-y-1 shrink-0">
        <div className="flex justify-between text-[9px] mono">
          <span className="text-slate-500">φ-DRIFT (ITHACA)</span>
          <span className={phiDrift.needsReintegration ? 'text-rose-400' : 'text-emerald-400'}>
            {phiDrift.driftMagnitude.toFixed(4)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              phiDrift.needsReintegration ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, phiDrift.driftMagnitude * 1000)}%` }}
          ></div>
        </div>
        <div className="text-[7px] mono text-slate-600">
          {phiDrift.needsReintegration
            ? `REINTEGRATE → Δr:${phiDrift.reintegrationVector.r.toFixed(3)} Δi:${phiDrift.reintegrationVector.i.toFixed(3)}`
            : 'COHERENT — φ ≡ ITHACA'}
        </div>
      </div>

      {/* W3 Wave Oscilloscope */}
      <div className="space-y-1 shrink-0">
        <span className="text-[9px] mono text-slate-500">W3 CURVATURE (PIZZA CONSTANT)</span>
        <div className="h-12 relative rounded border border-slate-800/50 overflow-hidden bg-slate-950/50">
          <canvas ref={w3CanvasRef} className="w-full h-full" />
        </div>
      </div>

      {/* Bottom metrics grid */}
      <div className="grid grid-cols-2 gap-2 text-[9px] mono shrink-0">
        {/* 126 Observer Shell */}
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <span className="text-slate-500 text-[7px]">126 SHELL</span>
          <div className="flex items-baseline gap-1">
            <span className={shell.higgsSaturated ? 'text-cyan-400 font-bold' : 'text-slate-400'}>{shellTick}</span>
            <span className="text-slate-600">/126</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-1">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${shell.saturation * 100}%` }}></div>
          </div>
        </div>

        {/* Divine Equation */}
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <span className="text-slate-500 text-[7px]">DIVINE EQ</span>
          <div className="text-amber-400 font-bold">{divEq !== null ? divEq.toFixed(4) : 'N/A'}</div>
          <div className="text-[7px] text-slate-600">-4/x² + entropy + 2.32</div>
        </div>

        {/* 10i=1 Closure */}
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <span className="text-slate-500 text-[7px]">10i=1 CLOSURE</span>
          <div className={`font-bold ${closure.balanced ? 'text-emerald-400' : 'text-amber-400'}`}>
            ε: {closure.closureError.toFixed(4)}
          </div>
          <div className="text-[7px] text-slate-600">{closure.balanced ? 'BALANCED' : 'DRIFTING'}</div>
        </div>

        {/* Flight Mode */}
        <div className="bg-black/30 rounded p-2 border border-white/5">
          <span className="text-slate-500 text-[7px]">FLIGHT MODE</span>
          <div className="text-indigo-400 font-bold text-[8px]">{flight.mode}</div>
          <div className="text-[7px] text-slate-600">{freq.toFixed(1)} Hz</div>
        </div>
      </div>

      {/* Observer coordinate */}
      <div className="flex justify-between items-center pt-1 border-t border-slate-800/50 shrink-0">
        <span className="text-[8px] text-slate-600 uppercase">Observer (7.5D)</span>
        <span className="text-[10px] text-white font-bold mono">
          {observerCoordinate.r.toFixed(1)}R + {observerCoordinate.i.toFixed(1)}I
        </span>
      </div>
    </div>
  );
};

export default RHCTelemetry;
