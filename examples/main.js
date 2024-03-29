'use strict';
import * as dat from 'datgui';
import Points from 'points';
import ShaderType from 'shadertype';
import RenderPass from 'renderpass';

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

let isFullscreenData = { 'isFullscreen': false };
let fullscreenCheck = gui.add(isFullscreenData, 'isFullscreen').name('Fullscreen').onChange(value => points.fullscreen = value);
document.addEventListener('fullscreenchange', e => {
    let isFullscreen = window.innerWidth == screen.width && window.innerHeight == screen.height;
    isFullscreenData.isFullscreen = isFullscreen;
    fullscreenCheck.updateDisplay();
});

let isFitWindow = (localStorage.getItem('fitwindow-enabled') === 'true') || false;
let isFitWindowData = { 'isFitWindow': isFitWindow };
gui.add(isFitWindowData, 'isFitWindow').name('Fit Window').onChange(value => {
    points.fitWindow = value;
    localStorage.setItem('fitwindow-enabled', value);
});

const shaderProjects = [
    { name: 'Base', path: './base/index.js' },
    { name: 'Audio 1', path: './audio1/index.js' },
    { name: 'Audio 2', path: './audio2/index.js' },
    { name: 'Bloom1', path: './bloom1/index.js' },
    { name: 'Circle Blur', path: './circleblur/index.js' },
    { name: 'Data 1', path: './data1/index.js' },
    { name: 'Demo 6', path: './demo_6/index.js' },
    { name: 'Dithering 1', path: './dithering1/index.js' },
    { name: 'Dithering 2', path: './dithering2/index.js' },
    { name: 'Dithering 3 - 1', path: './dithering3_1/index.js' },
    { name: 'Dithering 3 - 2', path: './dithering3_2/index.js' },
    { name: 'Dithering 4', path: './dithering4/index.js' },
    { name: 'Events 1', path: './events1/index.js' },
    { name: 'Image Scale 1', path: './imagescale1/index.js' },
    { name: 'Image Texture 1', path: './imagetexture1/index.js' },
    { name: 'Image Texture 2', path: './imagetexture2/index.js' },
    { name: 'Image Texture 3', path: './imagetexture3/index.js' },
    { name: 'Image Texture 4', path: './imagetexture4/index.js' },
    { name: 'Layers 1', path: './layers1/index.js' },
    { name: 'Mesh 1', path: './mesh1/index.js' },
    { name: 'Mouse 1', path: './mouse1/index.js' },
    { name: 'Mouse Click and Scroll 1', path: './mouseclickscroll1/index.js' },
    { name: 'Noise 1', path: './noise1/index.js' },
    { name: 'Noise Circle 1', path: './noisecircle1/index.js' },
    { name: 'Points Title 1', path: './pointstitle1/index.js' },
    { name: 'Random 1', path: './random1/index.js' },
    { name: 'Random 2 (⚠ SLOW)', path: './random2/index.js' },
    { name: 'Random 3', path: './random3/index.js' },
    { name: 'Render Passes 1', path: './renderpasses1/index.js' },
    { name: 'Render Passes 2', path: './renderpasses2/index.js' },
    { name: 'Shapes 1', path: './shapes1/index.js' },
    { name: 'Shapes 2', path: './shapes2/index.js' },
    { name: 'Spritesheet 1', path: './spritesheet1/index.js' },
    { name: 'UVs 1', path: './uvs1/index.js' },
    { name: 'Video Texture 1', path: './videotexture1/index.js' },
    // { name: 'PARAMS TEST', path: './params_test/index.js' },
    // { name: 'WebGPU Particles 1', path: './webgpu_particles_1/index.js' },
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
    shaders?.remove?.();
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
    {
        nameStopped: 'Download PNG Image',
        fn: function (e) {
            let image = document.getElementById('gl-canvas').toDataURL().replace('image/png', 'image/octet-stream');
            window.location.href = image;
        },
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
    let renderPasses = shaders.renderPasses || [new RenderPass(shaders.vert, shaders.frag, shaders.compute)];
    // await points.addPostRenderPass(RenderPasses.GRAYSCALE);
    await points.init(renderPasses);

    let hasVertexAndFragmentShader = renderPasses.every(renderPass => renderPass.hasVertexAndFragmentShader)
    hasVertexAndFragmentShader && (points.fitWindow = isFitWindow);

    update();
}

async function update() {
    stats.begin();

    // code here

    points.updateUniform('sliderA', sliders.a);
    points.updateUniform('sliderB', sliders.b);
    points.updateUniform('sliderC', sliders.c);

    shaders.update(points);
    await points.update();

    await shaders.read?.(points);
    //

    stats.end();

    capturer.capture(points.canvas);
    animationFrameId = requestAnimationFrame(update);
}
