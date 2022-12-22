'use strict';
import MathUtil from '../js/mathutil.js';
import { print } from '../js/utils.js';
import WebGPU, { ShaderType } from './absulit.simplewebgpu.module.js';
import blur1Compute from './shaders/blur1/blur1.compute.js';
import blur1Frag from './shaders/blur1/blur1.frag.js';
import blur1Vert from './shaders/blur1/blur1.vert.js';
import circleblurCompute from './shaders/circleblur/circleblur.compute.js';
import circleblurVert from './shaders/circleblur/circleblur.vert.js';
import circleblurFrag from './shaders/circleblur/circleblur.frag.js';
import defaultCompute from './shaders/default/default.compute.js';
import defaultFrag from './shaders/default/default.frag.js';
import defaultVert from './shaders/default/default.vert.js';
import demo6_textureFrag from './shaders/demo_6/demo6_texture.frag.js';
import demo6_textureVert from './shaders/demo_6/demo6_texture.vert.js';
import planetsCompute from './shaders/planets/planets.compute.js';
import planetsFrag from './shaders/planets/planets.frag.js';
import planetsVert from './shaders/planets/planets.vert.js';
import planets2Compute from './shaders/planets2/planets2.compute.js';
import planets2Frag from './shaders/planets2/planets2.frag.js';
import planets2Vert from './shaders/planets2/planets2.vert.js';
import planets3Compute from './shaders/planets3/planets3.compute.js';
import planets3Vert from './shaders/planets3/planets3.vert.js';
import planets3Frag from './shaders/planets3/planets3.frag.js';
import planetsblurCompute from './shaders/planetsblur/planetsblur.compute.js';
import planetsblurFrag from './shaders/planetsblur/planetsblur.frag.js';
import planetsblurVert from './shaders/planetsblur/planetsblur.vert.js';
import planetsblur2Compute from './shaders/planetsblur2/planetsblur2.compute.js';
import planetsblur2Frag from './shaders/planetsblur2/planetsblur2.frag.js';
import planetsblur2Vert from './shaders/planetsblur2/planetsblur2.vert.js';
import reactiondiffusionVert from './shaders/reactiondiffusion/reactiondiffusion.vert.js';
import reactiondiffusionCompute from './shaders/reactiondiffusion/reactiondiffusion.compute.js';
import reactiondiffusionFrag from './shaders/reactiondiffusion/reactiondiffusion.frag.js';
import slimeCompute from './shaders/slime/slime.compute.js';
import slimeFrag from './shaders/slime/slime.frag.js';
import slimeVert from './shaders/slime/slime.vert.js';
import slime2Compute from './shaders/slime2/slime2.compute.js';
import slime2Frag from './shaders/slime2/slime2.frag.js';
import slime2Vert from './shaders/slime2/slime2.vert.js';
import test1Frag from './shaders/test1/test1.frag.js';
import random1Frag from './shaders/random1/random1.frag.js';
import random1Compute from './shaders/random1/random1.compute.js';
import random1Vert from './shaders/random1/random1.vert.js';
import slime3Vert from './shaders/slime3/slime3.vert.js';
import slime3Compute from './shaders/slime3/slime3.compute.js';
import slime3Frag from './shaders/slime3/slime3.frag.js';
import random2Vert from './shaders/random2/random2.vert.js';
import random2Compute from './shaders/random2/random2.compute.js';
import random2Frag from './shaders/random2/random2.frag.js';
import shapes1Vert from './shaders/shapes1/shapes1.vert.js';
import shapes1Compute from './shaders/shapes1/shapes1.compute.js';
import shapes1Frag from './shaders/shapes1/shapes1.frag.js';
import shapes2Vert from './shaders/shapes2/shapes2.vert.js';
import shapes2Compute from './shaders/shapes2/shapes2.compute.js';
import shapes2Frag from './shaders/shapes2/shapes2.frag.js';
import chromaspiralVert from './shaders/chromaspiral/chromaspiral.vert.js';
import chromaspiralCompute from './shaders/chromaspiral/chromaspiral.compute.js';
import chromaspiralFrag from './shaders/chromaspiral/chromaspiral.frag.js';
import chromaspiral2Vert from './shaders/chromaspiral2/chromaspiral2.vert.js';
import chromaspiral2Compute from './shaders/chromaspiral2/chromaspiral2.compute.js';
import chromaspiral2Frag from './shaders/chromaspiral2/chromaspiral2.frag.js';
import twigl1Vert from './shaders/twigl1/twigl1.vert.js';
import twigl1Compute from './shaders/twigl1/twigl1.compute.js';
import twigl1Frag from './shaders/twigl1/twigl1.frag.js';
import kaleidoscope1Vert from './shaders/kaleidoscope1/kaleidoscope1.vert.js';
import kaleidoscope1Compute from './shaders/kaleidoscope1/kaleidoscope1.compute.js';
import kaleidoscope1Frag from './shaders/kaleidoscope1/kaleidoscope1.frag.js';

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

let vertexShader, computeShader, fragmentShader;

async function init() {


    webGPU.addUniform('utime', 0);
    webGPU.addUniform('screenWidth', 0);
    webGPU.addUniform('screenHeight', 0);
    webGPU.addUniform('mouseX', 0);
    webGPU.addUniform('mouseY', 0);
    webGPU.addUniform('sliderA', 0);
    webGPU.addUniform('sliderB', 0);
    webGPU.addUniform('sliderC', 0);

    vertexShader = defaultVert;
    computeShader = defaultCompute;
    fragmentShader = defaultFrag;

    // vertexShader = defaultVert;
    // computeShader = defaultCompute;
    // fragmentShader = test1Frag;

    // vertexShader = twigl1Vert;
    // computeShader = twigl1Compute;
    // fragmentShader = twigl1Frag;

    // vertexShader = kaleidoscope1Vert;
    // computeShader = kaleidoscope1Compute;
    // fragmentShader = kaleidoscope1Frag;

    // vertexShader = chromaspiralVert;
    // computeShader = chromaspiralCompute;
    // fragmentShader = chromaspiralFrag;
    // const numPoints = canvas.width*canvas.height;
    // console.log(canvas.width,canvas.height);
    // //webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec4<f32>', 4);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');


    // vertexShader = chromaspiral2Vert;
    // computeShader = chromaspiral2Compute;
    // fragmentShader = chromaspiral2Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec4<f32>', 4);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = shapes1Vert;
    // computeShader = shapes1Compute;
    // fragmentShader = shapes1Frag;
    // const numPoints = 128;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec2<f32>', 2);

    // vertexShader = shapes2Vert;
    // computeShader = shapes2Compute;
    // fragmentShader = shapes2Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec4<f32>', 4);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = random1Vert;
    // computeShader = random1Compute;
    // fragmentShader = random1Frag;
    // webGPU.addUniform('randNumber', 0);
    // webGPU.addUniform('randNumber2', 0);
    // webGPU.addStorage('stars', 800*800, 'Star', 4);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = random2Vert;
    // computeShader = random2Compute;
    // fragmentShader = random2Frag;
    // webGPU.addUniform('randNumber', 0);
    // webGPU.addUniform('randNumber2', 0);
    // webGPU.addStorage('stars', 800*800, 'Star', 4);
    // let data = [];
    // for (let k = 0; k < 800*800; k++) {
    //     data.push(Math.random());
    // }
    // webGPU.addStorageMap('rands', [0,0], 'f32');
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = planetsVert;
    // computeShader = planetsCompute;
    // fragmentShader = planetsFrag;
    // webGPU.addStorage('planets', 8, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);

    // vertexShader = planets2Vert;
    // computeShader = planets2Compute;
    // fragmentShader = planets2Frag;
    // webGPU.addStorage('planets', 8, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);

    // vertexShader = planets3Vert;
    // computeShader = planets3Compute;
    // fragmentShader = planets3Frag;
    // const numParticles = 1024 * 4;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('planets', numParticles, 'Planet', 3);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = planetsblurVert;
    // computeShader = planetsblurCompute;
    // fragmentShader = planetsblurFrag;
    // const numParticles = 8;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('planets', numParticles, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);

    // vertexShader = planetsblur2Vert;
    // computeShader = planetsblur2Compute;
    // fragmentShader = planetsblur2Frag;
    // const numParticles = 8;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('planets', numParticles, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);

    // vertexShader = reactiondiffusionVert;
    // computeShader = reactiondiffusionCompute;
    // fragmentShader = reactiondiffusionFrag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('chemicals', numPoints, 'Chemical', 2);
    // webGPU.addStorage('chemicals2', numPoints, 'Chemical', 2);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    vertexShader = slimeVert;
    computeShader = slimeCompute;
    fragmentShader = slimeFrag;
    const numParticles = 1024 * 2;
    webGPU.addUniform('numParticles', numParticles);
    webGPU.addStorage('particles', numParticles, 'Particle', 4);
    webGPU.addStorage('variables', 1, 'Variable', 1);
    webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    webGPU.addTexture2d('feedbackTexture', true);
    webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = slime2Vert;
    // computeShader = slime2Compute;
    // fragmentShader = slime2Frag;
    // const numParticles = 1024 * 2;
    // webGPU.addUniform('numParticles', numParticles)
    // webGPU.addStorage('particles', numParticles, 'Particle', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = slime3Vert;
    // computeShader = slime3Compute;
    // fragmentShader = slime3Frag;
    // const numParticles = 1024 * 2;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('particles', numParticles, 'Particle', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // ////webGPU.addStorage('layer0', 1, 'Color', 4);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = blur1Vert;
    // computeShader = blur1Compute;
    // fragmentShader = blur1Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = circleblurVert;
    // computeShader = circleblurCompute;
    // fragmentShader = circleblurFrag;
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = demo6_textureVert;
    // computeShader = defaultCompute;
    // fragmentShader = demo6_textureFrag;

    const initialized = await webGPU.init(vertexShader, computeShader, fragmentShader);
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

    // webGPU.updateUniform('randNumber', Math.random()); // random2
    // webGPU.updateUniform('randNumber2', Math.random()); // random2
    // let data = [];
    // for (let k = 0; k < 800*800; k++) {
    //     data.push(Math.random());
    // }
    // webGPU.updateStorageMap('rands', data);// random2

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