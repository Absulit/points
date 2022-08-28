'use strict';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

async function init() {

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) { return; }
    const device = await adapter.requestDevice();
    device.lost.then((info) => {
        console.log(info);
    });
    console.log(device);

    // First Matrix

    const firstMatrix = new Float32Array([
        2 /* rows */, 4 /* columns */,
        1, 2, 3, 4,
        5, 6, 7, 8
    ]);

    const gpuBufferFirstMatrix = device.createBuffer({
        mappedAtCreation: true,
        size: firstMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE,
    });
    const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
    new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
    gpuBufferFirstMatrix.unmap();


    // Second Matrix

    const secondMatrix = new Float32Array([
        4 /* rows */, 2 /* columns */,
        1, 2,
        3, 4,
        5, 6,
        7, 8
    ]);

    const gpuBufferSecondMatrix = device.createBuffer({
        mappedAtCreation: true,
        size: secondMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE,
    });
    const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange();
    new Float32Array(arrayBufferSecondMatrix).set(secondMatrix);
    gpuBufferSecondMatrix.unmap();


    // Result Matrix

    const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
    const resultMatrixBuffer = device.createBuffer({
        size: resultMatrixBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

    // bind group layout means the interface with the GPU
    // we tell to the GPU what to expect
    // This is Group 0
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "read-only-storage"
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "read-only-storage"
                }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage"
                }
            }
        ]
    });


    // bind group is the data itself
    // we tell the GPU the expected data defined in the layout
    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: gpuBufferFirstMatrix
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: gpuBufferSecondMatrix
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: resultMatrixBuffer
                }
            }
        ]
    });


    // COMPUTE SHADER WGSL
    const shaderModule = device.createShaderModule({
        code: /* wgsl */`
          struct Matrix {
            size : vec2<f32>,
            numbers: array<f32>,
          }

          @group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
          @group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
          @group(0) @binding(2) var<storage, write> resultMatrix : Matrix;

          @compute @workgroup_size(8, 8)
          fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            // Guard against out-of-bounds work group sizes
            if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
              return;
            }

            resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

            let resultCell = vec2(global_id.x, global_id.y);
            var result = 0.0;
            for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
              let a = i + resultCell.x * u32(firstMatrix.size.y);
              let b = resultCell.y + i * u32(secondMatrix.size.y);
              result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
            }

            let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
            resultMatrix.numbers[index] = result;
          }
        `
    });


    // Describe the compute operation
    // takes bind group layout and the compute shader `shaderModule`
    const computePipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        }),
        compute: {
            module: shaderModule,
            entryPoint: "main"
        }
    });


    // Dispatch to GPU
    const commandEncoder = device.createCommandEncoder();

    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup);
    const workgroupCountX = Math.ceil(firstMatrix[0] / 8);
    const workgroupCountY = Math.ceil(secondMatrix[1] / 8);
    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    passEncoder.end();




    // ------------
    // Get a GPU buffer for reading in an unmapped state.
    // (unmapped because this is happening on the GPU side, not Javascript)
    const gpuReadBuffer = device.createBuffer({
        size: resultMatrixBufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    // Encode commands for copying buffer to buffer.
    commandEncoder.copyBufferToBuffer(
        resultMatrixBuffer /* source buffer */,
        0 /* source offset */,
        gpuReadBuffer /* destination buffer */,
        0 /* destination offset */,
        resultMatrixBufferSize /* size */
    );

    // Submit GPU commands.
    const gpuCommands = commandEncoder.finish();
    device.queue.submit([gpuCommands]);



    await gpuReadBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = gpuReadBuffer.getMappedRange();
    console.log(new Float32Array(arrayBuffer));











}

function update() {

}


init();
update();