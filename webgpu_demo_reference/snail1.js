'use strict';

import { print } from "../js/utils.js";

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);


const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();



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

          @compute @workgroup_size(8,8)
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



async function snail(array) {
    // empty, nothing to return
    if (array.length == 0) {
        return [];
    }

    let numColumns = array[0].length;
    let numRows = array.length;

    //let arrayFlatten = flatten(array);
    let arrayFlatten = new Float32Array(array.flat(2));


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
    const workgroupCountX = Math.ceil(numColumns / 8);
    const workgroupCountY = Math.ceil(numRows / 8);
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
    return Array.from(new Float32Array(arrayBuffer));
}


async function init() {

    let array = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // array = [[]];
    array = [[312, 845, 869, 494, 667], [716, 660, 255., 130, 767], [121, 506, 480, 792, 334], [218, 639, 57, 434, 13], [14, 572, 501, 965, 729], [760, 359, 572, 123, 824], [275, 935, 466, 485, 721], [369, 892, 860, 334, 498], [968, 351, 177, 264, 542], [308, 574, 624, 823, 85], [246, 462, 960, 878, 954], [424, 829, 331, 50, 293], [504, 562, 668, 623, 508], [578, 20, 761, 773, 678], [959, 933, 995, 998, 837], [99, 741, 501, 841, 352], [965, 157, 114, 261, 118], [432, 221, 847, 713, 719], [664, 1, 737, 364, 702], [323, 310, 166, 280, 501]]

    const r = await snail(array)
    console.log(r);











}

function update() {

}


init();
update();