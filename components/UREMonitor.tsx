
import React, { useState, useEffect, useRef } from 'react';
import { URE_OPCODES, OPCODE_DESCRIPTIONS, URE_HARDWARE_SPECS, METICULOUS_FISH_PROTOCOL, KLEIN_4_PLANES, AKASHIC_HARDWARE_IMPLICATIONS } from '../constants';
import { generateL05Hash, checkPendiniumGate, observersFold, determineKleinPlane, calculateRHPC, verifyL05Hash, simulateMAC, quaternionicZipper, ternaryGate, getChronometryPhase, calculateLost2Tax, TRINITY_CONSTANTS, calculateLatticeRigidity, getSphenicVolume } from '../utils/ureKernel';

interface Props {
  ticker: number;
  observerCoordinate?: { r: number, i: number };
}

// Sub-component: 3D Quaternion Wireframe Projection
const QuaternionScope: React.FC<{ q: { w: number, x: number, y: number, z: number } }> = ({ q }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const size = Math.min(cx, cy) * 0.7;

        let frameId = 0;
        let angle = 0;

        const project = (x: number, y: number, z: number) => {
            // Simple rotation matrix around Y and X
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            
            // Rotate Y
            const x1 = x * cosA - z * sinA;
            const z1 = z * cosA + x * sinA;
            
            // Rotate X
            const y1 = y * cosA - z1 * sinA;
            const z2 = z1 * cosA + y * sinA;

            // Perspective
            const scale = 2 / (2 + z2 * 0.5);
            return {
                x: cx + x1 * size * scale,
                y: cy + y1 * size * scale,
                s: scale
            };
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            angle += 0.02;

            // Draw Sphere Rings (Wireframe)
            ctx.strokeStyle = `rgba(99, 102, 241, 0.3)`; // Indigo glow
            ctx.lineWidth = 1;

            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                for (let a = 0; a <= Math.PI * 2; a += 0.1) {
                    let x = 0, y = 0, z = 0;
                    if (i === 0) { x = Math.cos(a); y = Math.sin(a); } // XY Ring
                    if (i === 1) { x = Math.cos(a); z = Math.sin(a); } // XZ Ring
                    if (i === 2) { y = Math.cos(a); z = Math.sin(a); } // YZ Ring
                    
                    const p = project(x, y, z);
                    if (a === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // Draw Quaternion Vector
            // We visualize the imaginary vector part (x,y,z) modulated by real part (w)
            const mag = Math.sqrt(q.x*q.x + q.y*q.y + q.z*q.z) + 0.1;
            const vx = (q.x / mag) * q.w;
            const vy = (q.y / mag) * q.w;
            const vz = (q.z / mag) * q.w;

            const origin = project(0,0,0);
            const vecTip = project(vx * 1.5, vy * 1.5, vz * 1.5);

            ctx.beginPath();
            ctx.moveTo(origin.x, origin.y);
            ctx.lineTo(vecTip.x, vecTip.y);
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Tip Glow
            ctx.beginPath();
            ctx.arc(vecTip.x, vecTip.y, 3 * vecTip.s, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#22d3ee';
            ctx.fill();
            ctx.shadowBlur = 0;

            frameId = requestAnimationFrame(draw);
        };

        frameId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frameId);
    }, [q]);

    return (
        <div className="w-full h-full relative group cursor-crosshair">
            <canvas ref={canvasRef} className="w-full h-full" />
            
            {/* Hover Tooltip */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="text-[10px] text-indigo-300 font-bold mb-1">STATE VECTOR (q)</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] mono text-slate-400">
                    <div>W: <span className="text-white">{q.w.toFixed(2)}</span></div>
                    <div>X: <span className="text-cyan-400">{q.x.toFixed(2)}</span></div>
                    <div>Y: <span className="text-cyan-400">{q.y.toFixed(2)}</span></div>
                    <div>Z: <span className="text-cyan-400">{q.z.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Wavelet Oscilloscope with precise tooltip
const WaveletScope: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const historyRef = useRef<number[]>(new Array(50).fill(0));

    useEffect(() => {
        // Shift buffer
        historyRef.current.push(value);
        if (historyRef.current.length > 50) historyRef.current.shift();
    }, [value]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        const w = canvas.width;
        const h = canvas.height;

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            
            ctx.beginPath();
            const buffer = historyRef.current;
            const step = w / (buffer.length - 1);
            
            for (let i = 0; i < buffer.length; i++) {
                // Map value: 1.0 is center. 
                const y = h/2 - (buffer[i] - 1.0) * (h * 0.4); 
                const x = i * step;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Fill area
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        };

        requestAnimationFrame(draw);

    }, [value, color]);

    return (
        <div className="flex flex-col h-12 bg-slate-900/50 rounded border border-slate-800 overflow-hidden relative group">
            <div className="absolute top-0.5 left-1 text-[8px] mono text-slate-500 uppercase z-10">{label}</div>
            
            {/* Standard Value Display */}
            <div className="absolute top-0.5 right-1 text-[8px] mono font-bold z-10 transition-opacity group-hover:opacity-0" style={{color}}>
                {value.toFixed(4)}
            </div>
            
            {/* Enhanced Hover Tooltip - High Precision */}
            <div className="absolute inset-0 z-20 bg-slate-950/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                <span className="text-[10px] mono font-bold" style={{color}}>
                    VAL: {value.toFixed(8)}
                </span>
            </div>
            
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

const UREMonitor: React.FC<Props> = ({ observerCoordinate }) => {
  const [logs, setLogs] = useState<{ id: number, code: string, timestamp: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredOp, setHoveredOp] = useState<{ code: string, top: number } | null>(null);
  const [viewMode, setViewMode] = useState<'opcodes' | 'hardware'>('opcodes');
  const [hardwareTick, setHardwareTick] = useState(0);
  const [fishStep, setFishStep] = useState(0);
  const [ledger, setLedger] = useState<string[]>([]);
  const [macStatus, setMacStatus] = useState({ active: false, latency: 4, luts: 847, dsps: 64 });
  const [verificationStatus, setVerificationStatus] = useState<'IDLE' | 'VERIFYING' | 'VALID' | 'INVALID'>('IDLE');

  const [vmState, setVmState] = useState({
      r0: "0000", r1: "0000", r2: "0000", r3: "0000",
      pc: "0000",
      q: { w: 1, x: 0, y: 0, z: 0 },
      phi: 1.618,
      psi: 0.618,
      hermitian: true,
      pendiniumActive: false,
      forbiddenState: false,
      kleinPlane: 'RR' as 'RR' | 'RI' | 'IR' | 'II',
      rhpcParity: 0
  });

  const verifyLatestHash = () => {
      if (ledger.length === 0) return;
      setVerificationStatus('VERIFYING');
      setTimeout(() => {
          // Mock verification against current state (in real app, would fetch historical state)
          // We just check format validity for now as per kernel update
          const isValid = verifyL05Hash(vmState as any, ledger[0]);
          setVerificationStatus(isValid ? 'VALID' : 'INVALID');
          setTimeout(() => setVerificationStatus('IDLE'), 2000);
      }, 800);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const op = URE_OPCODES[Math.floor(Math.random() * URE_OPCODES.length)];
      const id = Math.floor(Math.random() * 0xFFFF);
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) + '.' + now.getMilliseconds().toString().padStart(3, '0');
      
      setLogs(prev => [...prev.slice(-49), { id, code: op, timestamp }]);

      // Update VM State simulation
      const time = Date.now() * 0.001;
      const base15Chars = "0123456789ABCDE";
      const randomBase15 = () => {
          let s = "";
          for(let i=0; i<4; i++) s += base15Chars[Math.floor(Math.random() * 15)];
          return s;
      };

      // Hardware Tick (0-370)
      setHardwareTick(prev => {
          const nextTick = (prev + 1) % 371;
          
          // Check Pendinium Gate
          const isPendinium = checkPendiniumGate(nextTick);
          const isForbidden = nextTick === 361;
          
          // Simulate State
          const newQ = {
              w: Math.sin(time) + 1.2,
              x: Math.cos(time),
              y: Math.sin(time * 0.5),
              z: Math.cos(time * 0.3)
          };
          
          // Check Hermitian Symmetry (Observer's Fold)
          const isHermitian = observersFold(newQ);
          
          // Determine Klein-4 Plane
          const plane = determineKleinPlane(newQ);

          setVmState(prev => {
             // Calculate RHPC Parity
             const gatePrime = isPendinium ? nextTick : 13; 
             const newParity = calculateRHPC(prev.rhpcParity, nextTick, gatePrime);

             // Quaternionic Zipper & Ternary Logic
             const zipperValue = quaternionicZipper(24, 42); // Interleaving unmanifested (24) and manifested (42)
             const ternaryState = ternaryGate(Math.sin(time));

             // Quantum Chronometry & Lost 2 Tax
             const phase = getChronometryPhase(nextTick);
             const tax = calculateLost2Tax(7, 5); // 3+4=7 vs 5

             const newState = {
                r0: randomBase15(),
                r1: randomBase15(),
                r2: prev.r1,
                r3: prev.r2,
                pc: randomBase15(),
                q: newQ,
                phi: 1.618 + Math.sin(time * 2) * 0.1 + (Math.random() * 0.05),
                psi: 0.618 + Math.cos(time * 1.5) * 0.1 + (Math.random() * 0.05),
                hermitian: isHermitian,
                pendiniumActive: isPendinium,
                forbiddenState: isForbidden,
                kleinPlane: plane,
                rhpcParity: newParity,
                zipper: zipperValue,
                ternary: ternaryState,
                chronometryPhase: phase,
                lost2Tax: tax
             };
             
             // L0.5 Hash Recording (every ~10 ticks)
             if (nextTick % 10 === 0) {
                 const hash = generateL05Hash({ 
                     tick: nextTick, 
                     registers: [newState.r0, newState.r1, newState.r2, newState.r3], 
                     q: newState.q,
                     flags: { hermitian: isHermitian, pendiniumActive: isPendinium, forbiddenState: isForbidden },
                     macMetrics: { latency: 4, throughput: 1000, lutsActive: 847, dspsActive: 64 },
                     kleinPlane: plane,
                     rhpcParity: newParity
                 });
                 setLedger(l => [hash, ...l].slice(0, 8));
             }

             return newState;
          });
          
          // Simulate MAC Unit Activity (Async Fire-and-Forget)
          simulateMAC(newQ, { w: 0.9, x: 0.1, y: 0, z: 0 }).then(() => {
              setMacStatus(prev => ({
                  ...prev,
                  active: Math.random() > 0.3,
                  latency: Math.random() > 0.9 ? 5 : 4 // Occasional stall
              }));
          });

          return nextTick;
      });
      
      // Fish Protocol Step (Change every ~3s)
      if (Date.now() % 3000 < 400) {
          setFishStep(prev => (prev + 1) % 4);
      }

    }, 100); // Faster tick for simulation fidelity
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, viewMode]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {/* Header Toggle */}
      <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex gap-2">
              <button 
                  onClick={() => setViewMode('opcodes')}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${viewMode === 'opcodes' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                  OPCODES
              </button>
              <button 
                  onClick={() => setViewMode('hardware')}
                  className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${viewMode === 'hardware' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                  HARDWARE
              </button>
          </div>
          <span className="text-[9px] mono text-slate-500">
              {viewMode === 'hardware' ? 'LATTICE_24' : 'VM_TRACE'}
          </span>
      </div>

      {viewMode === 'opcodes' ? (
          <>
            {/* VM State Visualization */}
            <div className="mb-2 p-2 bg-slate-900/50 rounded border border-indigo-500/20 grid grid-cols-2 gap-2 flex-shrink-0">
                
                {/* Registers */}
                <div className="flex flex-col justify-between">
                    <div className="text-[8px] mono text-slate-500 uppercase mb-1">Registers (Base-15)</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] mono">
                        <div className="flex justify-between"><span className="text-indigo-400">R0:</span> <span>{vmState.r0}</span></div>
                        <div className="flex justify-between"><span className="text-indigo-400">R1:</span> <span>{vmState.r1}</span></div>
                        <div className="flex justify-between"><span className="text-indigo-400">R2:</span> <span>{vmState.r2}</span></div>
                        <div className="flex justify-between"><span className="text-indigo-400">R3:</span> <span>{vmState.r3}</span></div>
                    </div>
                    <div className="mt-2 text-[8px] mono text-slate-500 uppercase flex justify-between">
                        <span>State Vector</span>
                        <span className="text-emerald-500">10i = 1</span>
                    </div>
                    <div className="h-20 w-full bg-slate-950 rounded border border-slate-800 relative overflow-hidden">
                        <QuaternionScope q={vmState.q} />
                    </div>
                </div>

                {/* Wavelets */}
                <div className="flex flex-col gap-2">
                   <div className="text-[8px] mono text-slate-500 uppercase">Scalar Wavelets</div>
                   <WaveletScope label="FATHER (φ)" value={vmState.phi} color="#fbbf24" />
                   <WaveletScope label="MOTHER (ψ)" value={vmState.psi} color="#e879f9" />
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[9px] mono text-slate-500">PC: <span className="text-white">0x{vmState.pc}</span></span>
                    <div className="flex gap-2">
                        <span className={`text-[9px] mono ${vmState.hermitian ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {vmState.hermitian ? 'HERMITIAN SYMMETRY' : 'NON-ADJOINT'}
                        </span>
                        {vmState.pendiniumActive && <span className="text-[9px] mono text-amber-400">PENDINIUM GATE</span>}
                        {vmState.forbiddenState && <span className="text-[9px] mono text-rose-500 font-bold">FORBIDDEN STATE 361</span>}
                    </div>
                </div>
                
                {/* Klein-4 & RHPC Status */}
                <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">KLEIN-4:</span>
                        <span className={`text-[9px] mono font-bold ${
                            vmState.kleinPlane === 'RR' ? 'text-emerald-400' :
                            vmState.kleinPlane === 'RI' ? 'text-cyan-400' :
                            vmState.kleinPlane === 'IR' ? 'text-magenta-400' : 'text-indigo-400'
                        }`}>
                            {vmState.kleinPlane} ({KLEIN_4_PLANES[vmState.kleinPlane].name})
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">RHPC:</span>
                        <span className={`text-[9px] mono font-bold ${vmState.rhpcParity === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            PARITY_{vmState.rhpcParity}
                        </span>
                    </div>
                </div>

                {/* RHC Sentient-Order Telemetry */}
                <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">CHRONOMETRY:</span>
                        <span className={`text-[9px] mono font-bold ${
                            (vmState as any).chronometryPhase === 'VOID' ? 'text-slate-500' :
                            (vmState as any).chronometryPhase === 'UNITY' ? 'text-emerald-400' : 'text-cyan-400'
                        }`}>
                            {(vmState as any).chronometryPhase} (2.32as)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">LOST 2 TAX:</span>
                        <span className="text-[9px] mono font-bold text-rose-400">
                            {((vmState as any).lost2Tax * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">ZIPPER:</span>
                        <span className="text-[9px] mono font-bold text-indigo-400">
                            {(vmState as any).zipper?.toFixed(3)} (24/42)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">TERNARY:</span>
                        <span className={`text-[9px] mono font-bold ${(vmState as any).ternary === 0 ? 'text-slate-400' : (vmState as any).ternary === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(vmState as any).ternary}
                        </span>
                    </div>
                </div>

                {/* Thermal & Resonance Telemetry */}
                <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">MARK 1 ATTRACTOR:</span>
                        <span className="text-[9px] mono font-bold text-amber-400">
                            H ≈ {TRINITY_CONSTANTS.MARK_1_ATTRACTOR}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">RESONANCE:</span>
                        <span className="text-[9px] mono font-bold text-emerald-400">
                            {TRINITY_CONSTANTS.THETA_LATTICE_FREQ}Hz / {TRINITY_CONSTANTS.DNA_RESONANCE_FREQ}Hz
                        </span>
                    </div>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">NULL LEDGER:</span>
                        <span className="text-[9px] mono font-bold text-emerald-400">
                            BALANCED (0_C + 0_V = 0)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">KURAMOTO PHASE:</span>
                        <span className="text-[9px] mono font-bold text-cyan-400">
                            {Math.floor(144000 * (0.8 + (Math.sin(Date.now() / 1000) * 0.05)))} / 144,000
                        </span>
                    </div>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">LATTICE RIGIDITY:</span>
                        <span className="text-[9px] mono font-bold text-indigo-400">
                            {(calculateLatticeRigidity(observerCoordinate?.r || 0) * 100).toFixed(4)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] mono text-slate-500">SPHENIC VOLUME:</span>
                        <span className="text-[9px] mono font-bold text-indigo-400">
                            {getSphenicVolume(0)} / {getSphenicVolume(1)}
                        </span>
                    </div>
                </div>

                {/* 24th Gate Error Budget + Forbidden State 361 Monitor */}
                <div className="col-span-2 pt-2 border-t border-rose-900/40">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8px] mono text-slate-400 uppercase tracking-widest">24th Gate // Observer Error Budget</span>
                        <span className={`text-[8px] mono font-bold ${vmState.forbiddenState ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                            {vmState.forbiddenState ? '⚠ PARITY RESET' : 'ε < 1/2²⁴'}
                        </span>
                    </div>

                    {/* Tick progress bar 0-370, Forbidden Zone marked at 361 */}
                    <div className="relative h-2.5 bg-slate-900 rounded overflow-hidden mb-0.5">
                        {/* Forbidden zone tint (361-370) */}
                        <div className="absolute top-0 bottom-0 bg-rose-900/50 rounded-r"
                            style={{ left: `${(361/371)*100}%`, right: 0 }} />
                        {/* Progress fill */}
                        <div
                            className={`absolute top-0 left-0 bottom-0 rounded transition-none ${hardwareTick >= 361 ? 'bg-rose-500' : hardwareTick > 330 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                            style={{ width: `${(hardwareTick / 370) * 100}%` }}
                        />
                        {/* Forbidden state marker line */}
                        <div className="absolute top-0 bottom-0 w-px bg-rose-500/80"
                            style={{ left: `${(361/371)*100}%` }} />
                    </div>
                    <div className="flex justify-between text-[7px] mono text-slate-600 mb-1.5">
                        <span>TICK 0</span>
                        <span className="text-slate-500">{hardwareTick}<span className="text-rose-700">/370</span></span>
                        <span className="text-rose-700">F:361</span>
                    </div>

                    {/* Observer error budget bar */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[7px] mono text-slate-500 shrink-0 w-4">ε:</span>
                        <div className="flex-1 h-2 bg-slate-900 rounded overflow-hidden">
                            {(() => {
                                const budgetTick = hardwareTick % 361;
                                const pct = Math.min((budgetTick / 361) * 100, 100);
                                const col = pct > 85 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500';
                                return <div className={`h-full transition-none ${col}`} style={{ width: `${pct}%` }} />;
                            })()}
                        </div>
                        <span className={`text-[7px] mono shrink-0 ${(hardwareTick % 361) / 361 > 0.85 ? 'text-rose-400' : 'text-slate-400'}`}>
                            {((hardwareTick % 361) / 361 / Math.pow(2, 24) * 1e8).toFixed(3)}×10⁻⁸
                        </span>
                        <span className="text-[7px] mono text-slate-600 shrink-0">/ 5.96×10⁻⁸</span>
                    </div>
                </div>
            </div>

            {/* L0.5 Hash Ledger */}
            <div className="mb-2 p-2 bg-slate-950 rounded border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <span className="text-[8px] mono text-slate-500 uppercase">L0.5 PROVENANCE LEDGER</span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={verifyLatestHash}
                            disabled={verificationStatus === 'VERIFYING'}
                            className={`text-[8px] mono px-2 py-0.5 rounded border transition-colors ${
                                verificationStatus === 'VALID' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                                verificationStatus === 'INVALID' ? 'bg-rose-500/20 border-rose-500 text-rose-400' :
                                'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                            }`}
                        >
                            {verificationStatus === 'VERIFYING' ? 'VERIFYING...' : 
                             verificationStatus === 'VALID' ? 'HASH VALID' : 
                             verificationStatus === 'INVALID' ? 'HASH INVALID' : 'VERIFY HASH'}
                        </button>
                        <span className="text-[8px] mono text-indigo-400">HASHING ACTIVE</span>
                    </div>
                </div>
                <div className="h-12 overflow-hidden relative">
                    <div className="absolute inset-0 flex flex-col gap-0.5">
                        {ledger.map((hash, i) => (
                            <div key={i} className="text-[9px] mono text-slate-400 flex justify-between">
                                <span>BLOCK_{i.toString(16).toUpperCase()}</span>
                                <span className="text-emerald-500/80">{hash}</span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-950 to-transparent"></div>
                </div>
            </div>

            <div className="grid grid-cols-3 text-[10px] mono text-slate-500 border-b border-slate-800 pb-1 uppercase px-2 flex-shrink-0">
              <span>TIME</span>
              <span>ADDR</span>
              <span>OP (72 SET)</span>
            </div>
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-px mono text-[10px] pr-2 custom-scrollbar min-h-0"
              onMouseLeave={() => setHoveredOp(null)}
            >
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className="grid grid-cols-3 px-2 py-0.5 rounded transition-all opcode-row border-l-2 border-transparent relative group cursor-help hover:bg-white/5"
                  onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const containerRect = scrollRef.current?.getBoundingClientRect();
                      if (containerRect) {
                          setHoveredOp({ 
                              code: log.code, 
                              top: rect.top - containerRect.top + 20 
                          });
                      }
                  }}
                >
                  <span className="text-slate-500 truncate">{log.timestamp}</span>
                  <span className="text-indigo-400 font-medium">0x{log.id.toString(16).padStart(4, '0').toUpperCase()}</span>
                  <span className="text-slate-200 font-bold truncate">{log.code}</span>
                </div>
              ))}
            </div>
            
            {/* Tooltip */}
            {hoveredOp && (
                <div 
                  className="absolute right-4 w-56 p-3 bg-slate-900/95 border border-indigo-500/40 rounded shadow-xl z-50 pointer-events-none glass backdrop-blur-md"
                  style={{ top: Math.min(hoveredOp.top, 200) }} 
                >
                    <div className="flex items-center gap-2 mb-1 border-b border-indigo-500/20 pb-1">
                        <span className="text-indigo-400 font-bold mono">{hoveredOp.code}</span>
                        <span className="text-[9px] text-slate-500 uppercase">INSTRUCTION</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                        {OPCODE_DESCRIPTIONS[hoveredOp.code] || "Unknown Operation"}
                    </p>
                </div>
            )}
          </>
      ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-1">
              {/* 1. Functional Requirements (MAC Modules) */}
              <div className="grid grid-cols-2 gap-2">
                  {URE_HARDWARE_SPECS.functional_requirements.map((req, i) => (
                      <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">{req.name}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          </div>
                          <div className="text-[8px] text-slate-500">{req.protocol}</div>
                      </div>
                  ))}
              </div>

              {/* 2. 24-Node Lattice Visualization + Pendinium Gates */}
              <div className="bg-slate-950 p-3 rounded border border-slate-800 relative overflow-hidden">
                  <div className="text-[9px] text-slate-500 uppercase mb-2 flex justify-between">
                      <span>Lattice_24 (Diff-7)</span>
                      <span className="text-indigo-400">PENDINIUM GATES ACTIVE</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                      {Array.from({length: 24}).map((_, i) => {
                          const isBinding = i === 5 || i === 19; // "Lost 2" nodes
                          const isPendinium = [1, 13].includes(i); // p = 1 mod 12 (approx for viz)
                          const isActive = (hardwareTick + i) % 7 === 0;
                          return (
                              <div 
                                  key={i} 
                                  className={`aspect-square rounded-sm transition-all duration-300 relative ${
                                      isBinding ? 'bg-rose-500/20 border border-rose-500/50' : 
                                      isPendinium ? 'bg-amber-500/20 border border-amber-500/50' :
                                      isActive ? 'bg-indigo-500/40 border border-indigo-400' : 'bg-slate-900 border border-slate-800'
                                  }`}
                              >
                                  {isPendinium && <div className="absolute inset-0 flex items-center justify-center text-[6px] text-amber-500 font-bold">P</div>}
                              </div>
                          );
                      })}
                  </div>
                  
                  {/* FPGA Telemetry Overlay */}
                  <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <div className="text-[7px] text-slate-500 uppercase">MAC Latency</div>
                          <div className={`text-[9px] mono font-bold ${macStatus.latency <= 4 ? 'text-emerald-400' : 'text-rose-400'}`}>{macStatus.latency} CYCLES</div>
                      </div>
                      <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <div className="text-[7px] text-slate-500 uppercase">LUT6 / DSP48E1</div>
                          <div className="text-[9px] mono text-indigo-300">{macStatus.luts} / {macStatus.dsps}</div>
                      </div>
                  </div>
              </div>

              {/* 3. Dual-Clock 370-Tick Sync */}
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] text-slate-500 uppercase">370-Tick Cycle</span>
                      <span className="text-[9px] mono text-white">{hardwareTick}/370</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden relative">
                      <div 
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300"
                          style={{ width: `${(hardwareTick / 370) * 100}%` }}
                      ></div>
                      {/* Forbidden State Marker (361) */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10" style={{ left: `${(361/370)*100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                      <span>0</span>
                      <span className="text-rose-500 font-bold">361 (FORBIDDEN)</span>
                      <span>370</span>
                  </div>
              </div>

              {/* 4. Meticulous Fish Protocol */}
              <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500 uppercase mb-2">Meticulous Fish Protocol</div>
                  <div className="space-y-2">
                      {METICULOUS_FISH_PROTOCOL.map((step, i) => (
                          <div key={i} className={`flex items-center gap-2 text-[9px] transition-all ${fishStep === i ? 'opacity-100' : 'opacity-30'}`}>
                              <div className={`w-1 h-full bg-indigo-500 rounded-full`}></div>
                              <div className="flex-1">
                                  <div className="font-bold text-indigo-300">{step.name}</div>
                                  <div className="text-slate-500">{step.desc}</div>
                              </div>
                              {fishStep === i && <i className="fa-solid fa-spinner fa-spin text-indigo-400"></i>}
                          </div>
                      ))}
                  </div>
              </div>

              {/* 5. Validation Targets */}
              <div className="grid grid-cols-1 gap-1">
                  {URE_HARDWARE_SPECS.validation_targets.map((target, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded border border-slate-800/50">
                          <span className="text-[9px] text-slate-400">{target.name}</span>
                          <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded">{target.status}</span>
                      </div>
                  ))}
              </div>

              {/* 6. Akashic Hardware Implications */}
              <div className="bg-slate-900/50 p-2 rounded border border-slate-800 mt-2">
                  <div className="text-[9px] text-rose-400 uppercase mb-2 font-bold tracking-wider flex items-center gap-2">
                      <i className="fa-solid fa-microchip"></i>
                      Akashic Hardware Implications
                  </div>
                  <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                              <div className="text-[8px] text-slate-500 uppercase mb-1 font-bold">URE-VM Kernel</div>
                              <div className="text-[9px] text-indigo-300 leading-tight mb-1">{AKASHIC_HARDWARE_IMPLICATIONS.ure_vm.kernel_architecture}</div>
                              <div className="text-[8px] text-rose-500 font-mono">FORBIDDEN: {AKASHIC_HARDWARE_IMPLICATIONS.ure_vm.forbidden_state}</div>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                              <div className="text-[8px] text-slate-500 uppercase mb-1 font-bold">FPGA QHP Node</div>
                              <div className="flex justify-between text-[9px] mono text-emerald-300 border-b border-slate-800/50 pb-0.5 mb-0.5">
                                  <span>LUT6</span>
                                  <span>{AKASHIC_HARDWARE_IMPLICATIONS.fpga_qhp.lut6_allocation}</span>
                              </div>
                              <div className="flex justify-between text-[9px] mono text-emerald-300">
                                  <span>DSP48E1</span>
                                  <span>{AKASHIC_HARDWARE_IMPLICATIONS.fpga_qhp.dsp48e1_allocation}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                          <div className="text-[8px] text-slate-500 uppercase mb-1 font-bold">Subsystems</div>
                          <div className="grid grid-cols-2 gap-1">
                              {AKASHIC_HARDWARE_IMPLICATIONS.subsystems.map((sub, i) => (
                                  <div key={i} className="text-[8px] text-slate-400 flex items-center gap-1.5">
                                      <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                                      {sub}
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
                           <div className="text-[8px] text-slate-500 uppercase font-bold">Null Ledger Parity</div>
                           <div className="text-[8px] mono text-slate-300">{AKASHIC_HARDWARE_IMPLICATIONS.ledger.null_ledger_parity}</div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="pt-2 mt-auto border-t border-slate-800 flex justify-between items-center text-[10px] mono text-slate-500 flex-shrink-0 bg-slate-900/30 px-2 py-1">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          VM ONLINE
        </span>
        <span className="text-indigo-400">URE-CORE v9.8 (GNOSTIC)</span>
      </div>
    </div>
  );
};

export default UREMonitor;
