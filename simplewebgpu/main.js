'use strict';
import { print } from '../js/utils.js';
import Points, { ShaderType } from './absulit.points.module.js';
import base from './shaders/base/index.js';
import bloom1 from './shaders/bloom1/index.js';
import oscilloscope1 from './shaders/oscilloscope1/index.js';
import imagetexture1 from './shaders/imagetexture1/index.js';
import imagetexture2 from './shaders/imagetexture2/index.js';
import imagetexture3 from './shaders/imagetexture3/index.js';
import dithering1 from './shaders/dithering1/index.js';
import dithering2 from './shaders/dithering2/index.js';
import videotexture1 from './shaders/videotexture1/index.js';
import flowfieldsanimated from './shaders/flowfieldsanimated/index.js';
import noise1 from './shaders/noise1/index.js';
import noise2 from './shaders/noise2/index.js';
import noise3 from './shaders/noise3/index.js';
import noisecircle1 from './shaders/noisecircle1/index.js';
import layers1 from './shaders/layers1/index.js';
import twigl1 from './shaders/twigl1/index.js';
import kaleidoscope1 from './shaders/kaleidoscope1/index.js';
import chromaspiral from './shaders/chromaspiral/index.js';
import chromaspiral2 from './shaders/chromaspiral2/index.js';
import shapes1 from './shaders/shapes1/index.js';
import shapes2 from './shaders/shapes2/index.js';
import random1 from './shaders/random1/index.js';
import random2 from './shaders/random2/index.js';
import random3 from './shaders/random3/index.js';
import planets from './shaders/planets/index.js';
import planets2 from './shaders/planets2/index.js';
import planets3 from './shaders/planets3/index.js';
import planetsblur from './shaders/planetsblur/index.js';
import planetsblur2 from './shaders/planetsblur2/index.js';
import reactiondiffusion from './shaders/reactiondiffusion/index.js';
import reactiondiffusion1 from './shaders/reactiondiffusion1/index.js';
import slime from './shaders/slime/index.js';
import slime2 from './shaders/slime2/index.js';
import slime3 from './shaders/slime3/index.js';
import blur1 from './shaders/blur1/index.js';
import circleblur from './shaders/circleblur/index.js';
import demo6 from './shaders/demo_6/index.js';
import dithering3 from './shaders/dithering3/index.js';
import dithering4 from './shaders/dithering4/index.js';
import poisson1 from './shaders/poisson1/index.js';
import costarica_map1 from './shaders/costarica_map1/index.js';
import imagescale1 from './shaders/imagescale1/index.js';
import twistedtoroid1 from './shaders/twistedtoroid1/index.js';




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


const points = new Points('gl-canvas');
points.useTexture = false;

let utime = 0;
let epoch = 0;
let mouseX = 0;
let mouseY = 0;


const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let shaders;

async function init() {


    points.addUniform('utime', 0);
    points.addUniform('epoch', 0);
    points.addUniform('screenWidth', 0);
    points.addUniform('screenHeight', 0);
    points.addUniform('mouseX', 0);
    points.addUniform('mouseY', 0);
    points.addUniform('sliderA', 0);
    points.addUniform('sliderB', 0);
    points.addUniform('sliderC', 0);

    shaders = base;

    //shaders = demo6;

    // vertexShader = defaultVert;
    // computeShader = defaultCompute;
    // fragmentShader = test1Frag;

    shaders = twistedtoroid1;

    // shaders = imagescale1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // await points.addTextureImage('image1', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image2', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image3', './../img/unnamed_horror_100x100.png', ShaderType.FRAGMENT);

    // shaders = poisson1;
    // const r = 10;
    // const k = 30;
    // const w = r / Math.sqrt(2);
    // const rows = Math.floor(points.canvas.width / w);
    // const columns = Math.floor(points.canvas.height / w);;
    // points.addUniform('r', r);
    // points.addUniform('k', k);
    // points.addUniform('rows', rows);
    // points.addUniform('columns', columns);

    // const numPoints = 4096;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'Point', 4);

    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // points.addBindingTexture('outputTex', 'computeTexture');
    // points.addStorage('variables', 1, 'Variable', 3, ShaderType.COMPUTE);

    // shaders = bloom1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('kernel', './../assets_ignore/ftt_mask_800x800.jpg', ShaderType.FRAGMENT);

    // shaders = oscilloscope1;
    // points.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addStorage('variables', 1, 'Variable', 2, ShaderType.FRAGMENT);

    // shaders = imagetexture1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // shaders = imagetexture2;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // shaders = imagetexture3;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // shaders = costarica_map1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/costa_rica_map.png', ShaderType.FRAGMENT);
    // await points.addTextureImage('mask', './../assets_ignore/costa_rica_map_mask.png', ShaderType.FRAGMENT);

    // shaders = dithering1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // shaders = dithering2;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureVideo('video', './../assets_ignore/VIDEO0244.mp4', ShaderType.FRAGMENT);
    // await points.addTextureWebcam('video', ShaderType.FRAGMENT);

    // shaders = dithering3;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // // await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // // await points.addTextureVideo('image', './../assets_ignore/Black and White Clouds - Time lapse (480p_30fps_H264-128kbit_AAC).mp4', ShaderType.COMPUTE);
    // // await points.addTextureVideo('image', './../assets_ignore/weird_4_2_noaudio.mp4', ShaderType.COMPUTE);
    // // await points.addTextureVideo('image', './../assets_ignore/VID_57840514_190415.mp4', ShaderType.COMPUTE);
    // await points.addTextureWebcam('image', ShaderType.COMPUTE);
    // // await points.addTextureImage('image', './../img/angel_600x600.jpg', ShaderType.COMPUTE);
    // points.addBindingTexture('outputTex', 'computeTexture');
    // points.addLayers(2, ShaderType.COMPUTE);
    // points.addStorage('variables', 1, 'Variable', 2, ShaderType.COMPUTE);

    // shaders = dithering4;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // shaders = videotexture1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await points.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await points.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // await points.addTextureVideo('video', './../assets_ignore/Black and White Clouds - Time lapse (480p_30fps_H264-128kbit_AAC).mp4', ShaderType.COMPUTE)
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = flowfieldsanimated;
    // const lineAmount = 1024;
    // points.addUniform('flowfields_lineAmount', lineAmount);
    // points.addUniform('flowfields_numSteps', 10);
    // points.addUniform('flowfields_stepLength', 10);
    // points.addUniform('flowfields_radians', Math.PI * 2); // angle
    // points.addStorage('flowfields_startPositions', lineAmount, 'StartPosition', 2, ShaderType.COMPUTE);
    // points.addStorage('variables', 1, 'Variable', 2, ShaderType.COMPUTE);
    // points.addLayers(2, ShaderType.COMPUTE);

    // shaders = noise1;
    // const numPoints = 800*800;
    // points.addUniform('value_noise_data_length', numPoints);
    // points.addStorage('value_noise_data', numPoints, 'f32', 1, ShaderType.COMPUTE);
    // points.addStorage('variables', 1, 'Variable', 1, ShaderType.COMPUTE);

    // shaders = noise2;
    // const numPoints = 1024;
    // const lineAmount = 16;
    // points.addUniform('numPoints', numPoints);
    // points.addUniform('initializeAgain', 0);
    // points.addUniform('lineAmount', lineAmount);
    // points.addStorage('points', numPoints, 'Point', 4);
    // points.addStorage('variables', 1, 'Variable', 3, ShaderType.COMPUTE);
    // points.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // points.addLayers(1, ShaderType.COMPUTE);
    // points.addBindingTexture('outputTex', 'computeTexture');
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);

    // shaders = noise3;
    // const numPoints = 1024;
    // const lineAmount = 16;
    // points.addUniform('numPoints', numPoints);
    // points.addUniform('initializeAgain', 0);
    // points.addUniform('lineAmount', lineAmount);
    // points.addStorage('points', numPoints, 'Point', 4);
    // points.addStorage('variables', 1, 'Variable', 3, ShaderType.COMPUTE);
    // points.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // points.addLayers(1, ShaderType.COMPUTE);
    // points.addBindingTexture('outputTex', 'computeTexture');
    // points.addSampler('feedbackSampler', null);
    // // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // // await points.addTextureImage('image', './../assets_ignore/pmw_800x800.jpg', ShaderType.COMPUTE);
    // await points.addTextureImage('image', './../img/carmen_lyra_2_800x800.jpg', ShaderType.COMPUTE);
    // // await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.COMPUTE);

    // shaders = noisecircle1;
    // const numPoints = 128;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'vec2<f32>', 2);

    // shaders = layers1;
    // const numPoints = 800*800;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'vec4<f32>', 4);
    // points.addLayers(2, ShaderType.COMPUTE);

    // shaders = twigl1;

    // shaders = kaleidoscope1;

    // shaders = chromaspiral;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addBindingTexture('outputTex', 'computeTexture');
    // points.addLayers(1, ShaderType.COMPUTE);

    // shaders = chromaspiral2;
    // const numPoints = 800*800;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'vec4<f32>', 4);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = shapes1;
    // const numPoints = 128;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'vec2<f32>', 2);

    // shaders = shapes2;
    // const numPoints = 800*800;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'vec4<f32>', 4);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = random1;
    // points.addUniform('randNumber', 0);
    // points.addUniform('randNumber2', 0);
    // points.addStorage('stars', 800*800, 'Star', 4);
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = random2;
    // points.addUniform('randNumber', 0);
    // points.addUniform('randNumber2', 0);
    // points.addStorage('stars', 800*800, 'Star', 4);
    // let data = [];
    // for (let k = 0; k < 800*800; k++) {
    //     data.push(Math.random());
    // }
    // points.addStorageMap('rands', [0,0], 'f32');
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = random3;
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = planets;
    // points.addStorage('planets', 8, 'Planet', 5);
    // points.addStorage('variables', 1, 'Variable', 1);

    // shaders = planets2;
    // points.addStorage('planets', 8, 'Planet', 5);
    // points.addStorage('variables', 1, 'Variable', 1);

    // shaders = planets3;
    // const numParticles = 1024 * 4;
    // points.addUniform('numParticles', numParticles);
    // points.addStorage('planets', numParticles, 'Planet', 3);
    // points.addStorage('variables', 1, 'Variable', 1);
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = planetsblur;
    // const numParticles = 8;
    // points.addUniform('numParticles', numParticles);
    // points.addStorage('planets', numParticles, 'Planet', 5);
    // points.addStorage('variables', 1, 'Variable', 1);
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);

    // shaders = planetsblur2;
    // const numParticles = 8;
    // points.addUniform('numParticles', numParticles);
    // points.addStorage('planets', numParticles, 'Planet', 5);
    // points.addStorage('variables', 1, 'Variable', 1);
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);

    // shaders = reactiondiffusion;
    // const numPoints = 800*800;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('chemicals', numPoints, 'Chemical', 2);
    // points.addStorage('chemicals2', numPoints, 'Chemical', 2);
    // points.addStorage('variables', 1, 'Variable', 1);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = reactiondiffusion1;
    // const numPoints = 800*800*2;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('chemicals', numPoints, 'Chemical', 2);
    // points.addStorage('chemicals2', numPoints, 'Chemical', 2);
    // points.addStorage('variables', 1, 'Variable', 2);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //points.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);
    // points.addBindingTexture('outputTex', 'computeTexture');
    // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // // await points.addTextureImage('image', './../assets_ignore/sunset_800x800_20220604_173907.jpg', ShaderType.COMPUTE);
    // // await points.addTextureImage('image', './../assets_ignore/tucan_jcvp_800x800.jpg', ShaderType.COMPUTE);
    // // await points.addTextureImage('image', './../assets_ignore/pmw_800x800.jpg', ShaderType.COMPUTE);
    // // await points.addTextureImage('image', './../img/carmen_lyra_2_800x800.jpg', ShaderType.COMPUTE);
    // //await points.addTextureImage('image', './../assets_ignore/face_coeff.jpg', ShaderType.COMPUTE);

    // shaders = slime;
    // const numParticles = 1024 * 2;
    // points.addUniform('numParticles', numParticles);
    // points.addStorage('particles', numParticles, 'Particle', 4);
    // points.addStorage('variables', 1, 'Variable', 1);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = slime2;
    // const numParticles = 1024 * 2;
    // points.addUniform('numParticles', numParticles)
    // points.addStorage('particles', numParticles, 'Particle', 4);
    // points.addStorage('variables', 1, 'Variable', 1);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = slime3;
    // const numParticles = 1024 * 2;
    // points.addUniform('numParticles', numParticles);
    // points.addStorage('particles', numParticles, 'Particle', 4, ShaderType.COMPUTE);
    // points.addStorage('variables', 1, 'Variable', 1);
    // ////points.addStorage('layer0', 1, 'Color', 4);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = blur1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = circleblur;
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    await points.init(shaders.vert, shaders.compute, shaders.frag);
    await update();
}

async function update() {
    stats.begin();
    utime += 0.016666666666666666;//1 / 60;
    epoch = new Date() / 1000;

    // code here

    points.updateUniform('utime', utime);
    points.updateUniform('epoch', epoch);
    points.updateUniform('screenWidth', points.canvas.width);
    points.updateUniform('screenHeight', points.canvas.height);
    points.updateUniform('mouseX', mouseX);
    points.updateUniform('mouseY', mouseY);

    points.updateUniform('sliderA', sliders.a);
    points.updateUniform('sliderB', sliders.b);
    points.updateUniform('sliderC', sliders.c);


    // points.updateUniform('randNumber', Math.random()); // random1
    // points.updateUniform('randNumber2', Math.random()); // random1

    // points.updateUniform('randNumber', Math.random()); // random2
    // points.updateUniform('randNumber2', Math.random()); // random2
    // let data = [];
    // for (let k = 0; k < 800*800; k++) {
    //     data.push(Math.random());
    // }
    // points.updateStorageMap('rands', data);// random2

    points.update();

    //

    stats.end();

    capturer.capture(points.canvas);
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
        //points.videoRecordStart();
        downloadBtn.textContent = 'RECORDING (STOP)';
    } else {
        downloadBtn.textContent = buttonTitle;
        // stop and download
        capturer.stop();
        // default save, will download automatically a file called {name}.extension (webm/gif/tar)
        capturer.save();
        //points.videoRecordStop();
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