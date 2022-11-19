'use strict';
import MathUtil from '../js/mathutil.js';
import { print } from '../js/utils.js';
import WebGPU from './absulit.simplewebgpu.module.js';
import blur1Compute from './shaders/blur1.compute.js';
import blur1Frag from './shaders/blur1.frag.js';
import circleblurCompute from './shaders/circleblur.compute.js';
import circleblurFrag from './shaders/circleblur.frag.js';
import defaultCompute from './shaders/default.compute.js';
import defaultFrag from './shaders/default.frag.js';
import defaultVert from './shaders/default.vert.js';
import planetsCompute from './shaders/planets.compute.js';
import planetsFrag from './shaders/planets.frag.js';
import planets2Compute from './shaders/planets2.compute.js';
import planets2Frag from './shaders/planets2.frag.js';
import reactiondiffusionCompute from './shaders/reactiondiffusion.compute.js';
import reactiondiffusionFrag from './shaders/reactiondiffusion.frag.js';
import test1Frag from './shaders/test1.frag.js';

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


const webGPU = new WebGPU('gl-canvas');
webGPU.useTexture = false;

let utime = 0;
let mouseX = 0;
let mouseY = 0;


const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let shaderModule;

let canvas = document.getElementById('gl-canvas');

async function init() {
    //const initialized = await webGPU.init();
    const initialized = await webGPU.init(defaultVert, defaultFrag);
    if (initialized) {
        //webGPU.createVertexBuffer(vertexArray);
        // COMPUTE SHADER WGSL
        shaderModule = webGPU._device.createShaderModule({
            code: defaultCompute
        });

        webGPU._shaderModule = shaderModule;
        await webGPU.createScreen(1, 1);
    }
    await update();
}

async function update() {
    stats.begin();
    utime += 0.016666666666666666;//1 / 60;

    // code here
    //webGPU._screenSizeArray[2] = utime;

    webGPU._uniformsArray[0] = utime;
    webGPU._uniformsArray[1] = canvas.width;
    webGPU._uniformsArray[2] = canvas.height;
    webGPU._uniformsArray[3] = mouseX;
    webGPU._uniformsArray[4] = mouseY;

    webGPU._uniformsArray[5] = sliders.a;
    webGPU._uniformsArray[6] = sliders.b;
    webGPU._uniformsArray[7] = sliders.c;

    webGPU.update();

    //

    stats.end();

    capturer.capture(canvas);
    requestAnimationFrame(update);
}

init();

const downloadBtn = document.getElementById('downloadBtn');
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

const sliderA = document.getElementById('slider-a');
const sliderB = document.getElementById('slider-b');
const sliderC = document.getElementById('slider-c');

sliders.a = sliderA.value = localStorage.getItem('slider-a') || 0;
sliders.b = sliderB.value = localStorage.getItem('slider-b') || 0;
sliders.c = sliderC.value = localStorage.getItem('slider-c') || 0;

sliderA.addEventListener('input', e => sliders.a = e.target.value);
sliderB.addEventListener('input', e => sliders.b = e.target.value);
sliderC.addEventListener('input', e => sliders.c = e.target.value);

sliderA.addEventListener('change', e => localStorage.setItem('slider-a', e.target.value));
sliderB.addEventListener('change', e => localStorage.setItem('slider-b', e.target.value));
sliderC.addEventListener('change', e => localStorage.setItem('slider-c', e.target.value));

sliderA.addEventListener('change', e => print(e.target.value));
sliderB.addEventListener('change', e => print(e.target.value));
sliderC.addEventListener('change', e => print(e.target.value));
//
// var resizeViewport = function () {
//     let aspect = window.innerWidth / window.innerHeight;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// }

// window.addEventListener('resize', resizeViewport, false);

document.onmousemove = function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

const statsBtn = document.getElementById('statsBtn');
let statsVisible = (localStorage.getItem('stats-visible') === 'true') || false;
statsBtn.onclick = () => {
    console.log('---- statsBtn.onclick', statsVisible);
    statsVisible = !statsVisible;
    console.log('---- statsBtn.onclick', statsVisible);
    statsVisible && (stats.dom.style.display = 'block');
    !statsVisible && (stats.dom.style.display = 'none');
    localStorage.setItem('stats-visible', statsVisible)

};
statsVisible && (stats.dom.style.display = 'block');
!statsVisible && (stats.dom.style.display = 'none');