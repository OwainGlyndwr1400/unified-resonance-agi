
import React, { useEffect, useRef, useState } from 'react';
import { hasWebGPU } from '../utils/gpuMath';

declare const GPUBufferUsage: any;

const SCALAR_SHADER = `
struct Uniforms {
    time: f32,
    width: f32,
    height: f32,
}
@group(0) @binding(0) var<uniform> u : Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) vi : u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 6>(
        vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
        vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0)
    );
    return vec4(pos[vi], 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) pos : vec4<f32>) -> @location(0) vec4<f32> {
    let uv = pos.xy / vec2(u.width, u.height);
    
    // Simulate Scalar Interference
    let d = distance(uv, vec2(0.5, 0.5));
    let wave1 = sin(d * 50.0 - u.time * 5.0);
    let wave2 = sin(uv.x * 20.0 + u.time * 2.0);
    
    let interference = wave1 * wave2;
    
    // Color mapping based on phase error
    // Emerald/Teal palette
    let r = 0.0;
    let g = 0.2 + abs(interference) * 0.6;
    let b = 0.2 + abs(wave1) * 0.4;
    
    return vec4(r, g, b, 1.0);
}
`;

const ScalarAuditPanel: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // UI State for the badge
    const [uiStatus, setUiStatus] = useState("INIT");
    
    // Mutable ref to track render state without stale closures in the loop
    const renderState = useRef({
        status: "INIT",
        device: null as any,
        context: null as any,
        pipeline: null as any,
        bindGroup: null as any,
        uniformBuffer: null as any
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let animationFrameId = 0;

        const renderLoop = (t: number) => {
            const { status, device, context, pipeline, bindGroup, uniformBuffer } = renderState.current;
            
            // Ensure Canvas Size
            const parent = canvas.parentElement;
            if (parent) {
                if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
                     canvas.width = parent.clientWidth;
                     canvas.height = parent.clientHeight;
                }
            }

            if (status === 'GPU_ACTIVE' && device && context) {
                 const time = t * 0.001;
                 // Write uniforms
                 device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time, canvas.width, canvas.height]));

                 const encoder = device.createCommandEncoder();
                 const pass = encoder.beginRenderPass({
                     colorAttachments: [{
                         view: context.getCurrentTexture().createView(),
                         loadOp: 'clear',
                         clearValue: { r: 0.01, g: 0.02, b: 0.05, a: 1 },
                         storeOp: 'store'
                     }]
                 });
                 pass.setPipeline(pipeline);
                 pass.setBindGroup(0, bindGroup);
                 pass.draw(6);
                 pass.end();
                 device.queue.submit([encoder.finish()]);

            } else if (status === 'CPU_FALLBACK') {
                 // Robust & Performant 2D Fallback
                 const ctx = canvas.getContext('2d');
                 if (ctx) {
                     const time = t * 0.001;
                     const w = canvas.width;
                     const h = canvas.height;
                     
                     ctx.clearRect(0, 0, w, h);
                     
                     // Create interference pattern using radial gradient (Hardware accelerated usually)
                     const cx = w / 2;
                     const cy = h / 2;
                     const radius = Math.max(w, h) * 0.8;
                     
                     // Dynamic Gradient
                     const grad = ctx.createRadialGradient(
                         cx + Math.sin(time) * 50, cy + Math.cos(time) * 30, 0,
                         cx, cy, radius
                     );
                     
                     grad.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); // Emerald Core
                     grad.addColorStop(0.5, 'rgba(6, 78, 59, 0.1)');
                     grad.addColorStop(1, 'rgba(2, 6, 23, 0)');

                     ctx.fillStyle = grad;
                     ctx.fillRect(0, 0, w, h);

                     // Draw Scalar Vector Field Lines
                     ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
                     ctx.lineWidth = 1;
                     ctx.beginPath();
                     
                     const gridSize = 30;
                     for (let x = 0; x < w; x += gridSize) {
                         for (let y = 0; y < h; y += gridSize) {
                             const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
                             const angle = Math.atan2(y-cy, x-cx);
                             const wave = Math.sin(dist * 0.05 - time * 2);
                             
                             const len = wave * 10 + 5;
                             const dx = Math.cos(angle) * len;
                             const dy = Math.sin(angle) * len;
                             
                             ctx.moveTo(x, y);
                             ctx.lineTo(x + dx, y + dy);
                         }
                     }
                     ctx.stroke();
                     
                     // Info Text
                     ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
                     ctx.font = '10px JetBrains Mono';
                     ctx.fillText("SCALAR INTERFERENCE SIMULATION", 10, h - 10);
                 }
            }
            
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        const init = async () => {
            if (!hasWebGPU()) {
                console.log("Scalar Audit: WebGPU not found. Falling back to CPU.");
                renderState.current.status = "CPU_FALLBACK";
                setUiStatus("CPU_FALLBACK");
                renderLoop(0);
                return;
            }

            try {
                const adapter = await (navigator as any).gpu.requestAdapter();
                if (!adapter) throw new Error("No adapter found");
                
                const device = await adapter.requestDevice();
                renderState.current.device = device;
                
                const context = canvas.getContext('webgpu' as any) as any;
                renderState.current.context = context;
                
                if (!device || !context) throw new Error("GPU Device/Context init failed");
                
                const format = (navigator as any).gpu.getPreferredCanvasFormat();
                context.configure({ device, format });

                const pipeline = device.createRenderPipeline({
                    layout: 'auto',
                    vertex: {
                        module: device.createShaderModule({ code: SCALAR_SHADER }),
                        entryPoint: 'vs_main'
                    },
                    fragment: {
                        module: device.createShaderModule({ code: SCALAR_SHADER }),
                        entryPoint: 'fs_main',
                        targets: [{ format }]
                    },
                    primitive: { topology: 'triangle-list' }
                });
                renderState.current.pipeline = pipeline;

                const uniformBuffer = device.createBuffer({
                    size: 16,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
                });
                renderState.current.uniformBuffer = uniformBuffer;

                const bindGroup = device.createBindGroup({
                    layout: pipeline.getBindGroupLayout(0),
                    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
                });
                renderState.current.bindGroup = bindGroup;

                renderState.current.status = "GPU_ACTIVE";
                setUiStatus("GPU_ACTIVE");
                
                renderLoop(0);

            } catch (e) {
                console.warn("Scalar Audit: GPU Init Error", e);
                renderState.current.status = "CPU_FALLBACK";
                setUiStatus("CPU_FALLBACK");
                renderLoop(0);
            }
        };

        init();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-full h-full relative glass rounded-xl overflow-hidden flex flex-col">
            <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                 <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Scalar Field Audit</h2>
                 <span className={`text-[9px] mono px-2 rounded ${uiStatus === 'GPU_ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                     {uiStatus}
                 </span>
            </div>
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};

export default ScalarAuditPanel;
