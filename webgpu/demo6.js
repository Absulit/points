'use strict';
import { print } from '../js/utils.js';
import WebGPU, { VertexBufferInfo } from './js/absulit.webgpu.module.js';
import RGBAColor from './js/color.js';
import Coordinate from './js/coordinate.js';
/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'webm',
    //timeLimit: 10,
    verbose: true
});
/***************/



/*const vertexArray = new Float32Array([
    // float4 position, float4 color,
    // there are itemsPerRow items in this row, that's why vertexSize is 4*itemsPerRow
    -1, +1, 0, 1, 1, 1, 0, 1, 0, 0,// top left
    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,// top right
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,// bottom left

    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,// top right
    +1, -1, 0, 1, 0, 1, 0, 1, 1, 1,// bottom right
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,// bottom left

]);*/


const webGPU = new WebGPU('gl-canvas');
webGPU.useTexture = false;

let utime = 0;
let uround;
let usin;
let ucos;
let urounddec;
let nusin;

let side = 400;
let numColumns = side;
let numRows = side;

let gpuWriteBuffer1;
let gpuWriteBuffer2;
let gpuWriteBuffer3;

let buffers;
let shaderModule;
let gpuBufferFirstMatrix;
let resultMatrixBufferSize;
let resultMatrixBuffer;
let screenSizeArrayBuffer;
let computePipeline;
let bindGroup;

let screenSizeArray;

let va;

async function init() {
    const initialized = await webGPU.init();
    if (initialized) {
        //webGPU.createVertexBuffer(vertexArray);
        await webGPU.createScreen(numColumns, numRows);

        // va = new Float32Array(dataArray)
        // gpuWriteBuffer = webGPU._device.createBuffer({
        //     mappedAtCreation: true,
        //     size: va.byteLength,
        //     usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
        // });
        // const arrayBuffer = gpuWriteBuffer.getMappedRange();

        // // Write bytes to buffer.
        // new Float32Array(arrayBuffer).set(va);

        // // Unmap buffer so that it can be used later for copy.
        // gpuWriteBuffer.unmap();

        gpuWriteBuffer1 = webGPU.createWriteCopyBuffer([1, 0, 0, 1]);
        gpuWriteBuffer2 = webGPU.createWriteCopyBuffer([0, 1, 0, 1]);
        gpuWriteBuffer3 = webGPU.createWriteCopyBuffer([0, 0, 1, 1]);
        buffers = [gpuWriteBuffer1, gpuWriteBuffer2, gpuWriteBuffer3];

        //--------------------------------------------
        screenSizeArray = new Float32Array([numColumns, numRows, 0]);

        screenSizeArrayBuffer = webGPU._device.createBuffer({
            mappedAtCreation: true,
            size: screenSizeArray.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const screenSizeArrayMappedRange = screenSizeArrayBuffer.getMappedRange();
        new Float32Array(screenSizeArrayMappedRange).set(screenSizeArray);
        screenSizeArrayBuffer.unmap();
        //--------------------------------------------



        // First Matrix

        const firstMatrix = new Float32Array(webGPU._vertexArray);

        gpuBufferFirstMatrix = webGPU._device.createBuffer({
            mappedAtCreation: true,
            size: firstMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
        new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
        gpuBufferFirstMatrix.unmap();

        // Result Matrix

        resultMatrixBufferSize = firstMatrix.byteLength;
        resultMatrixBuffer = webGPU._device.createBuffer({
            size: firstMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true,
        });

        const b = resultMatrixBuffer.getMappedRange();
        new Float32Array(b).set(firstMatrix);
        resultMatrixBuffer.unmap();

        // COMPUTE SHADER WGSL
        shaderModule = webGPU._device.createShaderModule({
            code: /* wgsl */`

            struct Vertex {
                position: array<f32,4>,
                color: array<f32,4>,
                uv: array<f32,2>,
            }

            struct Screen{
                size: vec2<f32>,
                points: array<f32>
            }

            struct ScreenSize {
                numRows: f32,
                numColumns: f32,
                uTime: f32
            }

            struct Point {
                vertex0: Vertex,
                vertex1: Vertex,
                vertex2: Vertex,
                vertex3: Vertex,
                vertex4: Vertex,
                vertex5: Vertex,
            }

            struct Points{
                points: array<Point>
            }

            fn fusin(speed:f32, utime:f32) -> f32{
                return (sin(utime * speed) + 1) * .5;
            }

          @group(0) @binding(0) var<storage, read> firstMatrix : array<f32>;
          @group(0) @binding(1) var<storage, read_write> resultMatrix : Points;
          @group(0) @binding(2) var<storage, read> screenSize : ScreenSize;

          @compute @workgroup_size(64)
          fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            var gid : u32 = global_id.x;
            // Guard against out-of-bounds work group sizes
            // if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
            //   return;
            // }

            let longvarname  = firstMatrix[0];
            //resultMatrix[0] = -1;
            // let b = secondMatrix.size.x;

            let numColumns:f32 = screenSize.numColumns;
            let numRows:f32 = screenSize.numRows;


            var indexC:i32 = 0;
            for(var indexColumns: i32 = 0; indexColumns < i32(screenSize.numColumns); indexColumns++) {
                for(var indexRows: i32 = 0; indexRows < i32(screenSize.numRows); indexRows++) {

                    let x:f32 = f32(indexColumns);
                    let y:f32 = f32(indexRows);
                    // let x:f32 = f32(global_id.x);
                    // let y:f32 = f32(global_id.y);
                    //let x:f32 = 0;
                    //let y:f32 = 0;
                    let index:f32 = y + (x * screenSize.numColumns);
                    indexC = i32(index);

                    let indexSin = sin( f32(indexRows) * f32(indexColumns)  * screenSize.uTime * .1);
                    let indexCos = 1 - cos( f32(indexRows) * f32(indexColumns)  * screenSize.uTime * .2);
                    let indexTan = tan(index * screenSize.uTime * .003);


                    let color = array<f32,4>(indexSin,indexCos,0,1);
                    resultMatrix.points[indexC].vertex0.color = color;
                    resultMatrix.points[indexC].vertex1.color = color;
                    resultMatrix.points[indexC].vertex2.color = color;
                    resultMatrix.points[indexC].vertex3.color = color;
                    resultMatrix.points[indexC].vertex4.color = color;
                    resultMatrix.points[indexC].vertex5.color = color;

               }
            }

        }

        `
        });


        // Describe the compute operation
        // takes bind group layout and the compute shader `shaderModule`
        computePipeline = webGPU._device.createComputePipeline({
            /*layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),*/
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: "main"
            }
        });


        bindGroup = webGPU._device.createBindGroup({
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
                        buffer: resultMatrixBuffer
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: screenSizeArrayBuffer
                    }
                }
            ]
        });


    }
    await update();
}

async function update() {
    stats.begin();
    utime += 1 / 60;

    screenSizeArray[2] = utime;
    screenSizeArrayBuffer = webGPU._device.createBuffer({
        mappedAtCreation: true,
        size: screenSizeArray.byteLength,
        usage: GPUBufferUsage.STORAGE,
    });
    const screenSizeArrayMappedRange = screenSizeArrayBuffer.getMappedRange();
    new Float32Array(screenSizeArrayMappedRange).set(screenSizeArray);
    screenSizeArrayBuffer.unmap();
    ///----------------

    bindGroup = webGPU._device.createBindGroup({
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
                    buffer: resultMatrixBuffer
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: screenSizeArrayBuffer
                }
            }
        ]
    });


    // Dispatch to GPU
    const commandEncoder = webGPU._device.createCommandEncoder();

    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(64);
    passEncoder.end();

    // ------------
    // Get a GPU buffer for reading in an unmapped state.
    // (unmapped because this is happening on the GPU side, not Javascript)
    // const gpuReadBuffer = webGPU._device.createBuffer({
    //     size: resultMatrixBufferSize,
    //     usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    // });

    // Encode commands for copying buffer to buffer.
    commandEncoder.copyBufferToBuffer(
        resultMatrixBuffer /* source buffer */,
        0 /* source offset */,
        webGPU._buffer /* destination buffer */,
        0 /* destination offset */,
        resultMatrixBufferSize /* size */
    );

    // Submit GPU commands.
    const gpuCommands = commandEncoder.finish();
    webGPU._commandsFinished.push(gpuCommands);

    webGPU.update();


    stats.end();

    capturer.capture(document.getElementById('gl-canvas'));
    requestAnimationFrame(update);
}

init();


let downloadBtn = document.getElementById('downloadBtn');
let started = false;
downloadBtn.addEventListener('click', onClickDownloadButton);
let buttonTitle = downloadBtn.textContent;
function onClickDownloadButton(e) {
    started = !started;
    if (started) {
        // start
        capturer.start();
        downloadBtn.textContent = 'RECORDING (STOP)';
    } else {
        downloadBtn.textContent = buttonTitle;
        // stop and download
        capturer.stop();
        // default save, will download automatically a file called {name}.extension (webm/gif/tar)
        capturer.save();
    }
}

