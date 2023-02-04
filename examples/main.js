'use strict';
import * as dat from './../src/vendor/datgui/dat.gui.module.js';
import Points, { ShaderType } from '../src/absulit.points.module.js';

/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'webm',
    //timeLimit: 10,
    verbose: true
});

const gui = new dat.GUI({ name: 'Points GUI' });
const slidersFolder = gui.addFolder('Sliders');

slidersFolder.open();

const sliders = { 'a': 0, 'b': 0, 'c': 0 };

sliders.a = Number(localStorage.getItem('slider-a')) || 0;
sliders.b = Number(localStorage.getItem('slider-b')) || 0;
sliders.c = Number(localStorage.getItem('slider-c')) || 0;

slidersFolder.add(sliders, 'a', -1, 1, .0001).name('params.sliderA').onFinishChange(() => localStorage.setItem('slider-a', sliders.a));
slidersFolder.add(sliders, 'b', -1, 1, .0001).name('params.sliderB').onFinishChange(() => localStorage.setItem('slider-b', sliders.b));
slidersFolder.add(sliders, 'c', -1, 1, .0001).name('params.sliderC').onFinishChange(() => localStorage.setItem('slider-c', sliders.c));

let statsVisible = (localStorage.getItem('stats-visible') === 'true') || false;
function setStatsVisibility(value) {
    value && (stats.dom.style.display = 'block');
    !value && (stats.dom.style.display = 'none');
    localStorage.setItem('stats-visible', value);
}
setStatsVisibility(statsVisible);

let stats2 = { 'visible': statsVisible };
gui.add(stats2, 'visible').name('Show Stats').onChange(value => setStatsVisibility(value));

const shaderProjects = [
    { name: 'Base', path: '../src/shaders/base/index.js' },
    { name: 'Bloom1', path: './bloom1/index.js' },
    { name: 'Circle Blur', path: './circleblur/index.js' },
    { name: 'Demo 6', path: './demo_6/index.js' },
    { name: 'Dithering 1', path: './dithering1/index.js' },
    { name: 'Dithering 2', path: './dithering2/index.js' },
    { name: 'Dithering 3', path: './dithering3/index.js' },
    { name: 'Dithering 4', path: './dithering4/index.js' },
    { name: 'Image Scale 1', path: './imagescale1/index.js' },
    { name: 'Image Texture 1', path: './imagetexture1/index.js' },
    { name: 'Image Texture 2', path: './imagetexture2/index.js' },
    { name: 'Image Texture 3', path: './imagetexture3/index.js' },
    { name: 'Image Texture 4', path: './imagetexture4/index.js' },
    { name: 'Layers 1', path: './layers1/index.js' },
    { name: 'Mesh 1', path: './mesh1/index.js' },
    { name: 'Noise 1', path: './noise1/index.js' },
    { name: 'Noise Circle 1', path: './noisecircle1/index.js' },
    { name: 'Random 1', path: './random1/index.js' },
    { name: 'Random 2 (⚠ SLOW)', path: './random2/index.js' },
    { name: 'Random 3', path: './random3/index.js' },
    { name: 'Shapes 1', path: './shapes1/index.js' },
    { name: 'Shapes 2', path: './shapes2/index.js' },
    { name: 'Video Texture 1', path: './videotexture1/index.js' },
]

const shaderNames = {};
shaderProjects.forEach((item, index) => {
    shaderNames[item.name] = index;
});

let selectedShader = { index: Number(localStorage.getItem('selected-shader')) || 0 }

let examples = gui.add(selectedShader, 'index', shaderNames).name('Examples');

async function loadShaderByIndex(index) {
    localStorage.setItem('selected-shader', index);
    console.clear();
    let shaderPath = shaderProjects[index].path;
    shaders = (await import(shaderPath)).default;
    await init();
}

examples.onChange(loadShaderByIndex);

//---
const recordingFolder = gui.addFolder('Recording');
recordingFolder.open();

const recordingOptions = [
    {
        nameStopped: 'CCapture (slow/HQ)',
        nameStarted: 'RECORDING (STOP)',
        fn: function (e) {
            this.started = !this.started;
            if (this.started) {
                this.controller.name(this.nameStarted);
                capturer.start();
            } else {
                this.controller.name(this.nameStopped);
                // stop and download
                capturer.stop();
                // default save, will download automatically a file called {name}.extension (webm/gif/tar)
                capturer.save();
            }
        },
        started: false,
        controller: null
    },
    {
        nameStopped: 'Live Capture (fast/LQ)',
        nameStarted: 'RECORDING (STOP)',
        fn: function (e) {
            this.started = !this.started;
            if (this.started) {
                this.controller.name(this.nameStarted);
                points.videoRecordStart();
            } else {
                this.controller.name(this.nameStopped);
                points.videoRecordStop();
            }
        },
        started: false,
        controller: null
    },
];

recordingOptions.forEach(recordingOption => {
    recordingOption.controller = recordingFolder.add(recordingOption, 'fn').name(recordingOption.nameStopped)
});

/***************/

let points;

let shaders;
let animationFrameId = null;
await loadShaderByIndex(selectedShader.index);

async function init() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    points = new Points('gl-canvas');
    points.addUniform('sliderA', 0);
    points.addUniform('sliderB', 0);
    points.addUniform('sliderC', 0);


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
    animationFrameId = requestAnimationFrame(update);
}

//
// var resizeViewport = function () {
//     let aspect = window.innerWidth / window.innerHeight;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// }

// window.addEventListener('resize', resizeViewport, false);
