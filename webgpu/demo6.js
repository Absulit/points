'use strict';
import Screen from '../js/screen.js';
import { print } from '../js/utils.js';
import WebGPU from './js/absulit.webgpu.module.js';
import EffectsTester from './../js/examples/effects_tester.js';

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

let side = 96; //744 max
let numColumns = side;
let numRows = side;
let numLayers = 3;
let numMargin = 0;
let demo;

let sideScreen = 96; //744 max
let numColumnsScreen = sideScreen;
let numRowsScreen = sideScreen;

let uround;
let urounddec;
let usin;
let nusin;
let nucos;
let ucos;
let fnusin;
let fnucos;
let fnsin;
let fncos;
let fusin;
let fucos;
const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let shaderModule;

/** @type {Screen} */
let screen;
let canvas = document.getElementById('gl-canvas');

async function init() {

    screen = new Screen(canvas, numColumnsScreen, numRowsScreen, numMargin, numLayers);
    demo = new EffectsTester(screen);

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


    uround = Math.round(utime);
    usin = Math.sin(utime);
    ucos = Math.cos(utime);
    urounddec = utime % 1;
    nusin = (Math.sin(utime) + 1) * .5;
    nucos = (Math.cos(utime) + 1) * .5;

    fusin = speed => Math.sin(utime * speed);
    fucos = speed => Math.cos(utime * speed);

    fnusin = speed => (Math.sin(utime * speed) + 1) * .5;
    fnucos = speed => (Math.cos(utime * speed) + 1) * .5;

    fnsin = speed => (Math.sin(speed) + 1) * .5;
    fncos = speed => (Math.cos(speed) + 1) * .5;


    screen.layerIndex = 0;//--------------------------- LAYER 0
    demo.update({ sliders, usin, ucos, side, utime, nusin, nucos, fusin, fucos, fnusin, fnucos, fnsin, fncos });











    webGPU._screenSizeArray[2] = utime;
    webGPU.update();

    stats.end();

    capturer.capture(canvas);
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
