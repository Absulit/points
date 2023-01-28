'use strict';
import { print } from '../legacy/js/utils.js';
import Points, { ShaderType } from '../src/absulit.points.module.js';
import base from '../src/shaders/base/index.js';
import bloom1 from './bloom1/index.js';
import circleblur from './circleblur/index.js';
import demo6 from './demo_6/index.js';
import dithering1 from './dithering1/index.js';
import dithering2 from './dithering2/index.js';
import dithering3 from './dithering3/index.js';
import dithering4 from './dithering4/index.js';
import imagescale1 from './imagescale1/index.js';
import imagetexture1 from './imagetexture1/index.js';
import imagetexture2 from './imagetexture2/index.js';
import imagetexture3 from './imagetexture3/index.js';
import layers1 from './layers1/index.js';
import noise1 from './noise1/index.js';
import noisecircle1 from './noisecircle1/index.js';
import random1 from './random1/index.js';
import random2 from './random2/index.js';
import random3 from './random3/index.js';
import shapes1 from './shapes1/index.js';
import shapes2 from './shapes2/index.js';
import videotexture1 from './videotexture1/index.js';


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


const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let shaders;

async function init() {
    points.addUniform('sliderA', 0);
    points.addUniform('sliderB', 0);
    points.addUniform('sliderC', 0);

    shaders = base;

    //shaders = demo6;


    // shaders = imagescale1;
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // await points.addTextureImage('image1', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image2', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await points.addTextureImage('image3', './../img/unnamed_horror_100x100.png', ShaderType.FRAGMENT);

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

    // shaders = noise1;
    // const numPoints = 800*800;
    // points.addUniform('value_noise_data_length', numPoints);
    // points.addStorage('value_noise_data', numPoints, 'f32', 1, ShaderType.COMPUTE);
    // points.addStorage('variables', 1, 'Variable', 1, ShaderType.COMPUTE);


    // shaders = noisecircle1;
    // const numPoints = 128;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'vec2<f32>', 2);

    // shaders = layers1;
    // const numPoints = 800*800;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('points', numPoints, 'vec4<f32>', 4);
    // points.addLayers(2, ShaderType.COMPUTE);

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

    // shaders = reactiondiffusion;
    // const numPoints = 800*800;
    // points.addUniform('numPoints', numPoints);
    // points.addStorage('chemicals', numPoints, 'Chemical', 2);
    // points.addStorage('chemicals2', numPoints, 'Chemical', 2);
    // points.addStorage('variables', 1, 'Variable', 1);
    // points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // points.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);
    // points.addBindingTexture('outputTex', 'computeTexture');

    // shaders = circleblur;
    // points.addSampler('feedbackSampler');
    // points.addTexture2d('feedbackTexture', true);
    // points.addBindingTexture('outputTex', 'computeTexture');

    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}

function update() {
    stats.begin();

    // code here

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