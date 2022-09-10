'use strict';

import { print } from "../js/utils.js";

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

/**
 * Ed Angel's flatten method
 * @param {Array} v
 * @returns
 */
function flatten(v) {
    if (v.matrix === true) {
        v = transpose(v);
    }

    var n = v.length;
    var elemsAreArrays = false;

    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array(n);

    if (elemsAreArrays) {
        var idx = 0;
        for (var i = 0; i < v.length; ++i) {
            for (var j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for (var i = 0; i < v.length; ++i) {
            floats[i] = v[i];
        }
    }

    return floats;
}

function transpose(m) {
    if (!m.matrix) {
        return "transpose(): trying to transpose a non-matrix";
    }

    var result = [];
    for (var i = 0; i < m.length; ++i) {
        result.push([]);
        for (var j = 0; j < m[i].length; ++j) {
            result[i].push(m[j][i]);
        }
    }

    result.matrix = true;

    return result;
}


async function init() {

    let array = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // array = [[]];
    // array = [
    //     [996,821,450,669,76,353,952,16],
    //     [344,523,196,484,426,682,433,228]
    // ];

    let numColumns = array[0].length;
    let numRows = array.length;
    print({ numColumns, numRows })

    let arrayFlatten = flatten(array);
    print(arrayFlatten)

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) { return; }
    const device = await adapter.requestDevice();




    // First Matrix

    const firstMatrix = arrayFlatten;

    const gpuBufferFirstMatrix = device.createBuffer({
        mappedAtCreation: true,
        size: firstMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE,
    });
    const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
    new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
    gpuBufferFirstMatrix.unmap();


    // Second Matrix

    const secondMatrix = new Float32Array([numColumns, numRows]);

    const gpuBufferSecondMatrix = device.createBuffer({
        mappedAtCreation: true,
        size: secondMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE,
    });
    const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange();
    new Float32Array(arrayBufferSecondMatrix).set(secondMatrix);
    gpuBufferSecondMatrix.unmap();


    // Result Matrix

    const resultMatrixBufferSize = firstMatrix.byteLength;
    const resultMatrixBuffer = device.createBuffer({
        size: resultMatrixBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });

        // visited array

        const visitedBufferSize = firstMatrix.byteLength;
        const visitedBuffer = device.createBuffer({
            size: visitedBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });

    // bind group layout means the interface with the GPU
    // we tell to the GPU what to expect
    // This is Group 0
    /*const bindGroupLayout = device.createBindGroupLayout({
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
    });*/

    // COMPUTE SHADER WGSL
    const shaderModule = device.createShaderModule({
        code: /* wgsl */`
          struct Matrix {
            size : vec2<f32>,
            numbers: array<f32>,
          }

          struct ScreenSize{
            numColumns: f32,
            numRows: f32
          }

          struct Direction{
            x:i32,
            y:i32
          }

          fn rotate(d:Direction)->Direction{
            var dR:Direction = Direction(0,0);
            if(d.x == 1){
                dR.y = 1;
            } else if(d.y == 1){
                dR.x = -1;
            } else if (d.x == -1){
                dR.y = -1;
            } else if (d.y == -1){
                dR.x = 1;
            }
            return dR;
          }

          @group(0) @binding(0) var<storage, read> firstMatrix : array<f32>;
          @group(0) @binding(1) var<storage, read> secondMatrix : ScreenSize;
          @group(0) @binding(2) var<storage, read_write> resultMatrix : array<f32>;
          @group(0) @binding(3) var<storage, read_write> visited : array<f32>;

          @compute @workgroup_size(8, 8)
          fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {

            var x = 0;
            var y = 0;
            var d:Direction = Direction(1,0);

            var numPoints:i32 = i32(secondMatrix.numColumns * secondMatrix.numRows);
            var firstMatrixIndex:i32 = 0;

            for(var numPointsIndex:i32 = 0; numPointsIndex < numPoints ;  ){
                if(numPointsIndex != numPoints){
                    firstMatrixIndex = x + (y * i32(secondMatrix.numColumns));
                    if((0 <= x) && (0 <= y) && (y < i32(secondMatrix.numRows)) && (x < i32(secondMatrix.numColumns)) && (visited[firstMatrixIndex] == 0) ){
                            let pointValue:f32 = firstMatrix[firstMatrixIndex];
                            resultMatrix[numPointsIndex] = pointValue;
                            visited[firstMatrixIndex] = 1;
                            numPointsIndex++;
                    }else{
                        // out of bounds in X or Y
                        x -= d.x;
                        y -= d.y;
                        d = rotate(d);
                    }
                    x += d.x;
                    y += d.y;
                }

            }


          }
        `
    });


    // Describe the compute operation
    // takes bind group layout and the compute shader `shaderModule`
    const computePipeline = device.createComputePipeline({
        /*layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        }),*/
        layout: 'auto',
        compute: {
            module: shaderModule,
            entryPoint: "main"
        }
    });


    // bind group is the data itself
    // we tell the GPU the expected data defined in the layout
    const bindGroup = device.createBindGroup({
        //layout: bindGroupLayout,
        layout: computePipeline.getBindGroupLayout(0 /* index */),
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
            },
            {
                binding: 3,
                resource: {
                    buffer: visitedBuffer
                }
            }
        ]
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