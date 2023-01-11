'use strict';
import { print } from '../js/utils.js';
import WebGPU, { ShaderType } from './absulit.simplewebgpu.module.js';
import base from './shaders/base/index.js';
import bloom1 from './shaders/bloom1/index.js';
import oscilloscope1 from './shaders/oscilloscope1/index.js';
import imagetexture1 from './shaders/imagetexture1/index.js';




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
let epoch = 0;
let mouseX = 0;
let mouseY = 0;


const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let canvas = document.getElementById('gl-canvas');

let shaders;

async function init() {


    webGPU.addUniform('utime', 0);
    webGPU.addUniform('epoch', 0);
    webGPU.addUniform('screenWidth', 0);
    webGPU.addUniform('screenHeight', 0);
    webGPU.addUniform('mouseX', 0);
    webGPU.addUniform('mouseY', 0);
    webGPU.addUniform('sliderA', 0);
    webGPU.addUniform('sliderB', 0);
    webGPU.addUniform('sliderC', 0);

    shaders = base;

    // vertexShader = defaultVert;
    // computeShader = defaultCompute;
    // fragmentShader = test1Frag;

    // shaders = bloom1;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('kernel', './../assets_ignore/ftt_mask_800x800.jpg', ShaderType.FRAGMENT);

    // shaders = oscilloscope1;
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addStorage('variables', 1, 'Variable', 2, ShaderType.FRAGMENT);

    shaders = imagetexture1;
    webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    //await webGPU.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    //await webGPU.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // vertexShader = imagetexture2Vert;
    // computeShader = imagetexture2Compute;
    // fragmentShader = imagetexture2Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // vertexShader = imagetexture3Vert;
    // computeShader = imagetexture3Compute;
    // fragmentShader = imagetexture3Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // vertexShader = dithering1Vert;
    // computeShader = dithering1Compute;
    // fragmentShader = dithering1Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // vertexShader = dithering2Vert;
    // computeShader = dithering2Compute;
    // fragmentShader = dithering2Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureVideo('video', './../assets_ignore/VIDEO0244.mp4', ShaderType.FRAGMENT);
    // await webGPU.addTextureWebcam('video', ShaderType.FRAGMENT);

    // vertexShader = videotexture1Vert;
    // computeShader = videotexture1Compute;
    // fragmentShader = videotexture1Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureVideo('video', './../assets_ignore/Black and White Clouds - Time lapse (480p_30fps_H264-128kbit_AAC).mp4', ShaderType.COMPUTE)
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = flowfieldsanimatedVert;
    // computeShader = flowfieldsanimatedCompute;
    // fragmentShader = flowfieldsanimatedFrag;
    // const lineAmount = 1024;
    // webGPU.addUniform('flowfields_lineAmount', lineAmount);
    // webGPU.addUniform('flowfields_numSteps', 10);
    // webGPU.addUniform('flowfields_stepLength', 10);
    // webGPU.addUniform('flowfields_radians', Math.PI * 2); // angle
    // webGPU.addStorage('flowfields_startPositions', lineAmount, 'StartPosition', 2, ShaderType.COMPUTE);
    // webGPU.addStorage('variables', 1, 'Variable', 2, ShaderType.COMPUTE);
    // webGPU.addLayers(2, ShaderType.COMPUTE);

    // vertexShader = noise1Vert;
    // computeShader = noise1Compute;
    // fragmentShader = noise1Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('value_noise_data_length', numPoints);
    // webGPU.addStorage('value_noise_data', numPoints, 'f32', 1, ShaderType.COMPUTE);
    // webGPU.addStorage('variables', 1, 'Variable', 1, ShaderType.COMPUTE);

    // vertexShader = noise2Vert;
    // computeShader = noise2Compute;
    // fragmentShader = noise2Frag;
    // const numPoints = 1024;
    // const lineAmount = 16;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addUniform('initializeAgain', 0);
    // webGPU.addUniform('lineAmount', lineAmount);
    // webGPU.addStorage('points', numPoints, 'Point', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 3, ShaderType.COMPUTE);
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // webGPU.addLayers(1, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);

    // vertexShader = noise3Vert;
    // computeShader = noise3Compute;
    // fragmentShader = noise3Frag;
    // const numPoints = 1024;
    // const lineAmount = 16;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addUniform('initializeAgain', 0);
    // webGPU.addUniform('lineAmount', lineAmount);
    // webGPU.addStorage('points', numPoints, 'Point', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 3, ShaderType.COMPUTE);
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // webGPU.addLayers(1, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // webGPU.addSampler('feedbackSampler', null);
    // //await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // //await webGPU.addTextureImage('image', './../assets_ignore/pmw_800x800.jpg', ShaderType.COMPUTE);
    // await webGPU.addTextureImage('image', './../img/carmen_lyra_2_800x800.jpg', ShaderType.COMPUTE);

    // vertexShader = noisecircle1Vert;
    // computeShader = noisecircle1Compute;
    // fragmentShader = noisecircle1Frag;
    // const numPoints = 128;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec2<f32>', 2);

    // vertexShader = layers1Vert;
    // computeShader = layers1Compute;
    // fragmentShader = layers1Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec4<f32>', 4);
    // webGPU.addLayers(2, ShaderType.COMPUTE);

    // vertexShader = twigl1Vert;
    // computeShader = twigl1Compute;
    // fragmentShader = twigl1Frag;

    // vertexShader = kaleidoscope1Vert;
    // computeShader = kaleidoscope1Compute;
    // fragmentShader = kaleidoscope1Frag;

    // vertexShader = chromaspiralVert;
    // computeShader = chromaspiralCompute;
    // fragmentShader = chromaspiralFrag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // webGPU.addLayers(1, ShaderType.COMPUTE);


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

    // vertexShader = random3Vert;
    // computeShader = random3Compute;
    // fragmentShader = random3Frag;
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

    // vertexShader = reactiondiffusion1Vert;
    // computeShader = reactiondiffusion1Compute;
    // fragmentShader = reactiondiffusion1Frag;
    // const numPoints = 800*800*2;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('chemicals', numPoints, 'Chemical', 2);
    // webGPU.addStorage('chemicals2', numPoints, 'Chemical', 2);
    // webGPU.addStorage('variables', 1, 'Variable', 2);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //webGPU.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../assets_ignore/sunset_800x800_20220604_173907.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../assets_ignore/tucan_jcvp_800x800.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../assets_ignore/pmw_800x800.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../img/carmen_lyra_2_800x800.jpg', ShaderType.COMPUTE);
    // //await webGPU.addTextureImage('image', './../assets_ignore/face_coeff.jpg', ShaderType.COMPUTE);

    // vertexShader = slimeVert;
    // computeShader = slimeCompute;
    // fragmentShader = slimeFrag;
    // const numParticles = 1024 * 2;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('particles', numParticles, 'Particle', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

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
    // webGPU.addStorage('particles', numParticles, 'Particle', 4, ShaderType.COMPUTE);
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

    const initialized = await webGPU.init(shaders.vert, shaders.compute, shaders.frag);
    if (initialized) {
        await webGPU.createScreen(1, 1);
    }
    await update();
}

async function update() {
    stats.begin();
    utime += 0.016666666666666666;//1 / 60;
    epoch = new Date() / 1000;

    // code here

    webGPU.updateUniform('utime', utime);
    webGPU.updateUniform('epoch', epoch);
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