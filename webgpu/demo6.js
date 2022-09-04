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

let side = 100;
let numColumns = side;
let numRows = side;

let gpuWriteBuffer1;
let gpuWriteBuffer2;
let gpuWriteBuffer3;

let buffers;

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

    // const commandEncoder = webGPU._device.createCommandEncoder();
    // const x = 1;
    // const y = 1;
    // const numColumns = 2;
    // const index = y + (x * numColumns);
    // for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
    //     commandEncoder.copyBufferToBuffer(
    //         gpuWriteBuffer /* source buffer */,
    //         0 /* source offset */,
    //         webGPU._buffer /* destination buffer */,
    //         4*(vertexIndex * 10 + index*60 + 4)/* destination offset */, //4 * (index * 10 + 4)
    //         gpuWriteBuffer.size/* size */
    //     );
    // }
    // const copyCommands = commandEncoder.finish();
    // webGPU._device.queue.submit([copyCommands]);

    for (let indexColumn = 0; indexColumn < numColumns; indexColumn++) {
        for (let indexRow = 0; indexRow < numRows; indexRow++) {

            webGPU.modifyPointColor2(new Coordinate(indexColumn, indexRow), buffers[ Math.floor( Math.random() * 3 ) ])
        }
    }




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

