
declare const GPUBufferUsage: any;
declare const GPUMapMode: any;

export const hasWebGPU = () => typeof navigator !== 'undefined' && !!(navigator as any).gpu;

const FOLD_SHADER = `
struct Quaternion { w: f32, x: f32, y: f32, z: f32 }
@group(0) @binding(0) var<storage, read> inputData : array<Quaternion>;
@group(0) @binding(1) var<storage, read_write> outputData : array<Quaternion>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let index = global_id.x;
    if (index >= arrayLength(&inputData)) { return; }
    let q = inputData[index];
    outputData[index].w = -q.x;
    outputData[index].x = -q.w;
    outputData[index].y = q.z;
    outputData[index].z = -q.y;
}
`;

const MAC_SHADER = `
struct Quaternion { w: f32, x: f32, y: f32, z: f32 }
@group(0) @binding(0) var<storage, read> inputA : array<Quaternion>;
@group(0) @binding(1) var<storage, read> inputB : array<Quaternion>;
@group(0) @binding(2) var<storage, read_write> output : array<Quaternion>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let index = global_id.x;
    if (index >= arrayLength(&inputA)) { return; }
    
    let q = inputA[index];
    let d = inputB[index];
    
    // Quaternion Multiplication
    output[index].w = q.w * d.w - q.x * d.x - q.y * d.y - q.z * d.z;
    output[index].x = q.w * d.x + q.x * d.w + q.y * d.z - q.z * d.y;
    output[index].y = q.w * d.y - q.x * d.z + q.y * d.w + q.z * d.x;
    output[index].z = q.w * d.z + q.x * d.y - q.y * d.x + q.z * d.w;
}
`;

export async function computeMAC(a: Quaternion[], b: Quaternion[]): Promise<Quaternion[]> {
    if (isGpuDisabled || !hasWebGPU()) {
        // CPU Fallback for MAC
        return a.map((q, i) => {
            const d = b[i] || { w: 1, x: 0, y: 0, z: 0 };
            return {
                w: q.w * d.w - q.x * d.x - q.y * d.y - q.z * d.z,
                x: q.w * d.x + q.x * d.w + q.y * d.z - q.z * d.y,
                y: q.w * d.y - q.x * d.z + q.y * d.w + q.z * d.x,
                z: q.w * d.z + q.x * d.y - q.y * d.x + q.z * d.w
            };
        });
    }

    let bufferA: any = null;
    let bufferB: any = null;
    let outputBuffer: any = null;
    let readBuffer: any = null;

    try {
        if (!globalDevice) {
            const adapter = await (navigator as any).gpu.requestAdapter();
            if (!adapter) throw new Error("No adapter");
            globalDevice = await adapter.requestDevice();
        }

        // Re-use or create pipeline (simplified for this context, ideally cache pipelines)
        const pipeline = globalDevice.createComputePipeline({
            layout: 'auto',
            compute: {
                module: globalDevice.createShaderModule({ code: MAC_SHADER }),
                entryPoint: 'main'
            }
        });

        const size = a.length * 16;
        bufferA = globalDevice.createBuffer({ size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, mappedAtCreation: true });
        new Float32Array(bufferA.getMappedRange()).set(a.flatMap(q => [q.w, q.x, q.y, q.z]));
        bufferA.unmap();

        bufferB = globalDevice.createBuffer({ size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, mappedAtCreation: true });
        new Float32Array(bufferB.getMappedRange()).set(b.flatMap(q => [q.w, q.x, q.y, q.z]));
        bufferB.unmap();

        outputBuffer = globalDevice.createBuffer({ size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
        readBuffer = globalDevice.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUMapMode.READ });

        const bindGroup = globalDevice.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: bufferA } },
                { binding: 1, resource: { buffer: bufferB } },
                { binding: 2, resource: { buffer: outputBuffer } }
            ]
        });

        const encoder = globalDevice.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(a.length / 64));
        pass.end();
        encoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, size);
        globalDevice.queue.submit([encoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);
        const resultTyped = new Float32Array(readBuffer.getMappedRange());
        const result: Quaternion[] = [];
        for (let i = 0; i < a.length; i++) {
            result.push({ w: resultTyped[i*4], x: resultTyped[i*4+1], y: resultTyped[i*4+2], z: resultTyped[i*4+3] });
        }
        readBuffer.unmap();
        
        return result;

    } catch (e) {
        console.warn("GPU MAC Failed, falling back to CPU", e);
        isGpuDisabled = true;
        // Recursive call will hit CPU fallback immediately due to isGpuDisabled flag
        return computeMAC(a, b); 
    } finally {
        if (bufferA) bufferA.destroy();
        if (bufferB) bufferB.destroy();
        if (outputBuffer) outputBuffer.destroy();
        if (readBuffer) readBuffer.destroy();
    }
}
let globalPipeline: any = null;
let isGpuDisabled = false;

function cpuFallback(data: Quaternion[]): Quaternion[] {
    return data.map(q => ({ w: -q.x, x: -q.w, y: q.z, z: -q.y }));
}

export async function computeFoldOperator(data: Quaternion[]): Promise<Quaternion[]> {
    if (isGpuDisabled || !hasWebGPU()) return cpuFallback(data);
    
    let inputBuffer: any = null;
    let outputBuffer: any = null;
    let readBuffer: any = null;

    try {
        if (!globalDevice) {
            const adapter = await (navigator as any).gpu.requestAdapter();
            if (!adapter) throw new Error("No adapter");
            globalDevice = await adapter.requestDevice();
            globalPipeline = globalDevice.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: globalDevice.createShaderModule({ code: FOLD_SHADER }),
                    entryPoint: 'main'
                }
            });
        }

        const inputBufferSize = data.length * 16;
        inputBuffer = globalDevice.createBuffer({ size: inputBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST, mappedAtCreation: true });
        new Float32Array(inputBuffer.getMappedRange()).set(data.flatMap(q => [q.w, q.x, q.y, q.z]));
        inputBuffer.unmap();

        outputBuffer = globalDevice.createBuffer({ size: inputBufferSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
        readBuffer = globalDevice.createBuffer({ size: inputBufferSize, usage: GPUBufferUsage.COPY_DST | GPUMapMode.READ });

        const bindGroup = globalDevice.createBindGroup({
            layout: globalPipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: { buffer: inputBuffer } }, { binding: 1, resource: { buffer: outputBuffer } }]
        });

        const encoder = globalDevice.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(globalPipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(data.length / 64));
        pass.end();
        encoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, inputBufferSize);
        globalDevice.queue.submit([encoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);
        const resultTyped = new Float32Array(readBuffer.getMappedRange());
        const result: Quaternion[] = [];
        for (let i = 0; i < data.length; i++) {
            result.push({ w: resultTyped[i*4], x: resultTyped[i*4+1], y: resultTyped[i*4+2], z: resultTyped[i*4+3] });
        }
        readBuffer.unmap();
        
        return result;
    } catch {
        isGpuDisabled = true;
        return cpuFallback(data);
    } finally {
        if (inputBuffer) inputBuffer.destroy();
        if (outputBuffer) outputBuffer.destroy();
        if (readBuffer) readBuffer.destroy();
    }
}
