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
import demo6_textureFrag from './shaders/demo6_texture.frag.js';
import demo6_textureVert from './shaders/demo6_texture.vert.js';
import planetsCompute from './shaders/planets.compute.js';
import planetsFrag from './shaders/planets.frag.js';
import planets2Compute from './shaders/planets2.compute.js';
import planets2Frag from './shaders/planets2.frag.js';
import planets3Compute from './shaders/planets3.compute.js';
import planets3Frag from './shaders/planets3.frag.js';
import planetsblurCompute from './shaders/planetsblur.compute.js';
import planetsblurFrag from './shaders/planetsblur.frag.js';
import planetsblur2Compute from './shaders/planetsblur2.compute.js';
import planetsblur2Frag from './shaders/planetsblur2.frag.js';
import reactiondiffusionCompute from './shaders/reactiondiffusion.compute.js';
import reactiondiffusionFrag from './shaders/reactiondiffusion.frag.js';
import slimeCompute from './shaders/slime.compute.js';
import slimeFrag from './shaders/slime.frag.js';
import slime2Compute from './shaders/slime2.compute.js';
import slime2Frag from './shaders/slime2.frag.js';
import test1Frag from './shaders/test1.frag.js';
import random1Frag from './shaders/random1.frag.js';
import random1Compute from './shaders/random1.compute.js';
import random1Vert from './shaders/random1.vert.js';
import planetsVert from './shaders/planets.vert.js';
import reactiondifussionVert from './shaders/reactiondiffusion.vert.js';
import slimeVert from './shaders/slime.vert.js';
import blur1Vert from './shaders/blur1.vert.js';
import circleblurVert from './shaders/circleblur.vert.js';
import planets2Vert from './shaders/planets2.vert.js';
import planets3Vert from './shaders/planets3.vert.js';
import planetsblurVert from './shaders/planetsblur.vert.js';
import planetsblur2Vert from './shaders/planetsblur2.vert.js';
import slime2Vert from './shaders/slime2.vert.js';

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

let canvas = document.getElementById('gl-canvas');

async function init() {


    webGPU.addUniform('utime', 0);
    webGPU.addUniform('screenWidth', 0);
    webGPU.addUniform('screenHeight', 0);
    webGPU.addUniform('mouseX', 0);
    webGPU.addUniform('mouseY', 0);
    webGPU.addUniform('sliderA', 0);
    webGPU.addUniform('sliderB', 0);
    webGPU.addUniform('sliderC', 0);

    // webGPU.addUniform('randNumber', 0); // random1
    // webGPU.addUniform('randNumber2', 0); // random1
    // webGPU.addStorage('stars', 800*800, 'Star', 4); // random1

    // webGPU.addStorage('planets', 8, 'Planet', 5); // planets
    // webGPU.addStorage('variables', 1, 'Variable', 1); // planets

    // webGPU.addStorage('planets', 8, 'Planet', 5); // planets2
    // webGPU.addStorage('variables', 1, 'Variable', 1); // planets2

    // const numParticles = 1024 * 4; // planets3
    // webGPU.addUniform('numParticles', numParticles); // planets3
    // webGPU.addStorage('planets', numParticles, 'Planet', 3); // planets3
    // webGPU.addStorage('variables', 1, 'Variable', 1); // planets3

    // const numParticles = 8; // planetsblur
    // webGPU.addUniform('numParticles', numParticles); // planetsblur
    // webGPU.addStorage('planets', numParticles, 'Planet', 5); // planetsblur
    // webGPU.addStorage('variables', 1, 'Variable', 1); // planetsblur

    // const numParticles = 8; // planetsblur2
    // webGPU.addUniform('numParticles', numParticles); // planetsblur2
    // webGPU.addStorage('planets', numParticles, 'Planet', 5); // planetsblur2
    // webGPU.addStorage('variables', 1, 'Variable', 1); // planetsblur2

    // webGPU.addStorage('chemicals', 800 * 800, 'Chemical', 2); // ractiondiffusion
    // webGPU.addStorage('chemicals2', 800 * 800, 'Chemical', 2); // ractiondiffusion
    // webGPU.addStorage('variables', 1, 'Variable', 1); // ractiondiffusion

    // const numParticles = 1024 * 2;// slime
    // webGPU.addUniform('numParticles', numParticles);// slime
    // webGPU.addStorage('particles', numParticles, 'Particle', 4); // slime
    // webGPU.addStorage('variables', 1, 'Variable', 1); // slime

    const numParticles = 1024 * 2;// slime2
    webGPU.addUniform('numParticles', numParticles);// slime2
    webGPU.addStorage('particles', numParticles, 'Particle', 4); // slime2
    webGPU.addStorage('variables', 1, 'Variable', 1); // slime2



    const initialized = await webGPU.init(slimeVert, slimeCompute, slimeFrag);
    if (initialized) {
        await webGPU.createScreen(1, 1);
    }
    await update();
}

async function update() {
    stats.begin();
    utime += 0.016666666666666666;//1 / 60;

    // code here

    webGPU.updateUniform('utime', utime);
    webGPU.updateUniform('screenWidth', canvas.width);
    webGPU.updateUniform('screenHeight', canvas.height);
    webGPU.updateUniform('mouseX', mouseX);
    webGPU.updateUniform('mouseY', mouseY);
    webGPU.updateUniform('sliderA', sliders.a);
    webGPU.updateUniform('sliderB', sliders.b);
    webGPU.updateUniform('sliderC', sliders.c);


    // webGPU.updateUniform('randNumber', Math.random()); // random1
    // webGPU.updateUniform('randNumber2', Math.random()); // random1

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