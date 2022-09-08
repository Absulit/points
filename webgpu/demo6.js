'use strict';
import { print } from '../js/utils.js';
import WebGPU, { VertexBufferInfo } from './js/absulit.webgpu.module.js';
import RGBAColor from './js/color.js';
import Coordinate from './js/coordinate.js';
/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//document.body.appendChild(stats.dom);

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

let side = 100;
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
        const screenSizeArray = new Float32Array([numColumns,numRows]);

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

            struct Point {
                position: vec4<f32>,
                color: vec4<f32>,
                uv: vec2<f32>,
            }

            struct Screen{
                size: vec2<f32>,
                points: array<f32>
            }

            struct ScreenSize{
                numRows: i32,
                numColumns: i32
            }

            struct Points{
                points: array<Point>
            }


          @group(0) @binding(0) var<storage, read> firstMatrix : array<f32>;
          @group(0) @binding(1) var<storage, read_write> resultMatrix : array<f32>;
          @group(0) @binding(2) var<storage, read> screenSize : array<f32>;

          @compute @workgroup_size(64)
          fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            // Guard against out-of-bounds work group sizes
            // if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
            //   return;
            // }

            let longvarname  = firstMatrix[0];
            //resultMatrix[0] = -1;
            // let b = secondMatrix.size.x;

            let x:f32 = 1;
            let y:f32 = 0;
            let index:f32 = y + (x * screenSize[1]);
            //for(var j: i32 = 0; j < 1; j++) {
                for(var vertexIndex: i32 = 0; vertexIndex < 6; vertexIndex++) {
                    let indexC:i32 = i32(index);
                    //let resultIndex = 4*(vertexIndex * 10 + index*60 + 4);
                    //resultMatrix.color = vec4(1,1,0,1);

                    resultMatrix[4 + vertexIndex * 10 + indexC*60] = 1.0;
                    resultMatrix[5 + vertexIndex * 10 + indexC*60] = 1.0;
                    resultMatrix[6 + vertexIndex * 10 + indexC*60] = 1.0;
                    resultMatrix[7 + vertexIndex * 10 + indexC*60] = 1.0;

                    //resultMatrix.points[vertexIndex * 10 + indexC*60].color = vec4(1,1,0,1);

                }

            //}

            //let b = resultMatrix[130];
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
    uround = Math.round(utime);
    usin = Math.sin(utime);
    ucos = Math.cos(utime);
    urounddec = utime % 1;
    nusin = (Math.sin(utime) + 1) * .5;


    // for (let indexColumn = 0; indexColumn < numColumns; indexColumn++) {
    //     for (let indexRow = 0; indexRow < numRows; indexRow++) {

    //         webGPU.modifyPointColor2(new Coordinate(indexColumn, indexRow), buffers[Math.floor(Math.random() * 3)])
    //     }
    // }




    // Dispatch to GPU
    const commandEncoder = webGPU._device.createCommandEncoder();

    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.setBindGroup(0, bindGroup);
    //const workgroupCountX = Math.ceil(firstMatrix[0] / 8);
    //const workgroupCountY = Math.ceil(resultMatrix[1] / 8);
    //passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    //passEncoder.dispatchWorkgroups(workgroupCountX);
    //passEncoder.dispatchWorkgroups(webGPU._vertexBufferInfo._vertexCount);
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
    webGPU._device.queue.submit([gpuCommands]);

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

