'use strict';
import * as dat from './../src/vendor/datgui/dat.gui.module.js';
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
import imagetexture4 from './imagetexture4/index.js';
import layers1 from './layers1/index.js';
import mesh1 from './mesh1/index.js';
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

const gui = new dat.GUI({name: 'My GUI'});
const slidersFolder = gui.addFolder('Sliders');
console.log(slidersFolder.getSaveObject());

slidersFolder.open();

const sliders = { 'a': 0, 'b': 0, 'c': 0 }

sliders.a = Number(localStorage.getItem('slider-a')) || 0;
sliders.b = Number(localStorage.getItem('slider-b')) || 0;
sliders.c = Number(localStorage.getItem('slider-c')) || 0;


slidersFolder.add(sliders, 'a', -1, 1, .0001).onFinishChange(() => localStorage.setItem('slider-a', sliders.a));
slidersFolder.add(sliders, 'b', -1, 1, .0001).onFinishChange(() => localStorage.setItem('slider-b', sliders.b));
slidersFolder.add(sliders, 'c', -1, 1, .0001).onFinishChange(() => localStorage.setItem('slider-c', sliders.c));

let statsVisible = (localStorage.getItem('stats-visible') === 'true') || false;
statsVisible && (stats.dom.style.display = 'block');
!statsVisible && (stats.dom.style.display = 'none');
gui.add({'stats': ()=>{
    statsVisible = !statsVisible;
    statsVisible && (stats.dom.style.display = 'block');
    !statsVisible && (stats.dom.style.display = 'none');
    localStorage.setItem('stats-visible', statsVisible)
}}, 'stats')
/***************/


const points = new Points('gl-canvas');
points.useTexture = false;



let shaders;

async function init() {
    points.addUniform('sliderA', 0);
    points.addUniform('sliderB', 0);
    points.addUniform('sliderC', 0);

    shaders = base;

    // shaders = mesh1;
    // shaders = demo6;
    // shaders = imagescale1;
    // shaders = bloom1;
    // shaders = imagetexture1;
    // shaders = imagetexture2;
    // shaders = imagetexture3;
    // shaders = imagetexture4;
    // shaders = dithering1;
    // shaders = dithering2;
    // shaders = dithering3;
    // shaders = dithering4;
    // shaders = videotexture1;
    // shaders = noise1;
    // shaders = noisecircle1;
    // shaders = layers1;
    // shaders = shapes1;
    // shaders = shapes2;
    // shaders = random1;
    // shaders = random2;
    // shaders = random3;
    // shaders = circleblur;


    await shaders.init(points);
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}

function update() {
    stats.begin();

    // code here

    points.updateUniform('sliderA', sliders.a);
    points.updateUniform('sliderB', sliders.b);
    points.updateUniform('sliderC', sliders.c);

    shaders.update(points);
    points.update();

    //

    stats.end();

    capturer.capture(points.canvas);
    requestAnimationFrame(update);
}

init();

const ccaptureBtn = document.getElementById('ccaptureBtn');
let started = false;
ccaptureBtn.addEventListener('click', onClickCCaptureButton);
let buttonTitle = ccaptureBtn.textContent;
function onClickCCaptureButton(e) {
    started = !started;
    if (started) {
        // start
        capturer.start();
        //points.videoRecordStart();
        ccaptureBtn.textContent = 'RECORDING (STOP)';
    } else {
        ccaptureBtn.textContent = buttonTitle;
        // stop and download
        capturer.stop();
        // default save, will download automatically a file called {name}.extension (webm/gif/tar)
        capturer.save();
        //points.videoRecordStop();
    }
}

const liveCaptureBtn = document.getElementById('liveCaptureBtn');
let started2 = false;
liveCaptureBtn.addEventListener('click', onClickLiveCaptureButton);
let buttonTitle2 = liveCaptureBtn.textContent;
function onClickLiveCaptureButton(e) {
    started2 = !started2;
    if (started2) {
        // start
        //capturer.start();
        points.videoRecordStart();
        liveCaptureBtn.textContent = 'RECORDING (STOP)';
    } else {
        liveCaptureBtn.textContent = buttonTitle2;
        // stop and download
        //capturer.stop();
        // default save, will download automatically a file called {name}.extension (webm/gif/tar)
        //capturer.save();
        points.videoRecordStop();
    }
}

//
// var resizeViewport = function () {
//     let aspect = window.innerWidth / window.innerHeight;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// }

// window.addEventListener('resize', resizeViewport, false);

