'use strict';
import { print } from '../js/utils.js';
import WebGPU from './js/absulit.webgpu.module.js';

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

const demo6ComputeShader = await fetch('./shaders/points.compute.wgsl').then(r => r.text());


const webGPU = new WebGPU('gl-canvas');
webGPU.useTexture = false;

let utime = 0;

let side = 744; //744 max
let numColumns = side;
let numRows = side;

let shaderModule;


async function init() {
    const initialized = await webGPU.init();
    if (initialized) {
        //webGPU.createVertexBuffer(vertexArray);
        // COMPUTE SHADER WGSL
        shaderModule = webGPU._device.createShaderModule({
            code: demo6ComputeShader
        });

        webGPU._shaderModule = shaderModule;
        await webGPU.createScreen(numColumns, numRows);
    }
    await update();
}

async function update() {
    stats.begin();
    utime += 1 / 60;

    webGPU._screenSizeArray[2] = utime;
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
