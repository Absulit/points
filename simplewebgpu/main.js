'use strict';
import MathUtil from '../js/mathutil.js';
import { print } from '../js/utils.js';
import WebGPU from './absulit.simplewebgpu.module.js';

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


const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let shaderModule;

let canvas = document.getElementById('gl-canvas');

let planets = [
    { radius: 5 , speed: 10, angle: Math.random() * 360 },
    { radius: 10 , speed: 7, angle: Math.random() * 360 },
    { radius: 13 , speed: 6, angle: Math.random() * 360 },
    { radius: 16 , speed: 5, angle: Math.random() * 360 },
    { radius: 20 , speed: 5, angle: Math.random() * 360 },
    { radius: 23 , speed: 1, angle: Math.random() * 360 },
    { radius: 27 , speed: -1, angle: Math.random() * 360 },
    { radius: 32 , speed: .1, angle: Math.random() * 360 },
]

async function init() {
    //const initialized = await webGPU.init();
    const initialized = await webGPU.init(null, './shaders/circleblur.frag.wgsl');
    if (initialized) {
        //webGPU.createVertexBuffer(vertexArray);
        // COMPUTE SHADER WGSL
        shaderModule = webGPU._device.createShaderModule({
            code: demo6ComputeShader
        });

        webGPU._shaderModule = shaderModule;
        await webGPU.createScreen(1, 1);
    }
    await update();
}

async function update() {
    stats.begin();
    utime += 1 / 60;

    // code here
    //webGPU._screenSizeArray[2] = utime;

    webGPU._uniformsArray[0] = utime;
    webGPU._uniformsArray[1] = canvas.width;
    webGPU._uniformsArray[2] = canvas.height;



    planets.forEach((planet, index) => {
        let pointFromCenter, radians;
        radians = MathUtil.radians(planet.angle);
        pointFromCenter = MathUtil.vector(planet.radius, radians);
        const x = (pointFromCenter.x + 4) * .1;
        const y = (pointFromCenter.y + 4) * .1;

        // if greater than 360 set back to zero, also increment
        planet.angle = (planet.angle * (planet.angle < 360) || 0) + (planet.speed * .3);

        webGPU._particles[index * 2] = x;
        webGPU._particles[index * 2 + 1] = y;
    });


    //webGPU._particles[0] = 1;

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