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

let gpuWriteBuffer;
let va;

async function init() {
    const initialized = await webGPU.init();
    if (initialized) {
        //webGPU.createVertexBuffer(vertexArray);
        let colors = [
            new RGBAColor(1, 0, 0),
            new RGBAColor(0, 1, 0),
            new RGBAColor(0, 0, 1),
            new RGBAColor(1, 1, 0),
        ];

        let side = 1;
        let numColumns = side;
        let numRows = side;



        for (let xIndex = 0; xIndex < numRows; xIndex++) {
            for (let yIndex = 0; yIndex < numColumns; yIndex++) {
                const coordinate = new Coordinate(xIndex * webGPU._canvas.clientWidth / side, yIndex * webGPU._canvas.clientHeight / side, .3);
                webGPU.addPoint(coordinate, webGPU._canvas.clientWidth / side, webGPU._canvas.clientHeight / side, colors);

            }

        }
        webGPU.createVertexBuffer(new Float32Array(webGPU._vertexArray));
        print(webGPU._vertexArray)
        await webGPU.createPipeline();


        const dataArray = [0, 1, 1, 1];
        va = new Float32Array(dataArray)
        gpuWriteBuffer = webGPU._device.createBuffer({
            mappedAtCreation: true,
            size: va.byteLength,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
        });
        const arrayBuffer = gpuWriteBuffer.getMappedRange();

        // Write bytes to buffer.
        new Float32Array(arrayBuffer).set(va);

        // Unmap buffer so that it can be used later for copy.
        gpuWriteBuffer.unmap();

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

    // TODO: modificar buffer?
    // let bufferTest = webGPU.device.createBuffer({
    //     size: vertexArray.byteLength,
    //     usage: GPUBufferUsage.STORAGE,
    //     mappedAtCreation: true,
    // });
    // new Float32Array(bufferTest.getMappedRange()).set(vertexArray);
    // bufferTest.unmap();
    //

    // for (let index = 0; index < 1000; index++) {
    //     const x = Math.floor(Math.random() * 100);
    //     const y = Math.floor(Math.random() * 100);
    //     webGPU.modifyPointColor(new Coordinate(x,y,0), new RGBAColor(nusin,0,0));
    // }


    // webGPU.modifyPointColor(new Coordinate(50, 50), new RGBAColor(1,0,0));
    // webGPU.modifyPointColor(new Coordinate(11,9), new RGBAColor(1,0,0));


    // webGPU.createVertexBuffer(new Float32Array(webGPU._vertexArray));
    // webGPU.createUnmappedBuffer(new Float32Array(webGPU._vertexArray));

    //let t = webGPU._buffer.getMappedRange();
    // new Float32Array(webGPU._buffer.getMappedRange()).set(new Float32Array(webGPU._vertexArray));
    // webGPU._buffer.unmap();


    //await webGPU.createPipeline();

    const commandEncoder = webGPU._device.createCommandEncoder();

    commandEncoder.copyBufferToBuffer(
        gpuWriteBuffer /* source buffer */,
        0 /* source offset */,
        webGPU._buffer /* destination buffer */,
        4*(4 * 10 + 4)/* destination offset */, //4 * (index * 10 + 4)
        va.byteLength /* size */
    );

    commandEncoder.copyBufferToBuffer(
        gpuWriteBuffer /* source buffer */,
        0 /* source offset */,
        webGPU._buffer /* destination buffer */,
        4*(0 * 10 + 4)/* destination offset */, //4 * (index * 10 + 4)
        va.byteLength /* size */
    );




    const copyCommands = commandEncoder.finish();
    webGPU._device.queue.submit([copyCommands]);

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

