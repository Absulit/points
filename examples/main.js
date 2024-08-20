'use strict';
import * as dat from 'datgui';
import Points from 'points';
import RenderPass from 'renderpass';

/**
 * Gets all the uri parts in an array.
 */
const uriParts = () => window.location.hash.split('#').filter(s => s.length >= 0);

/**
 * Changes uri.
 * @param {string} uri
 */
function changeUri(uri) { window.history.pushState('', '', `index.html#${uri}`) };

/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.dom.style.position = 'relative';
stats.dom.style.display = 'inline-block';

document.getElementsByClassName('right')[0].appendChild(stats.dom);

const capturer = new CCapture({
    format: 'webm',
    //timeLimit: 10,
    verbose: true
});

const gui = new dat.GUI({ name: 'Points GUI' });
const FOLDER_NAME = 'Options'
let optionsFolder = gui.addFolder(FOLDER_NAME);

let statsVisible = (localStorage.getItem('stats-visible') === 'true') || false;
function setStatsVisibility(value) {
    value && (stats.dom.style.display = 'inline-block');
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

let isFitWindowData = { 'isFitWindow': false };
gui.add(isFitWindowData, 'isFitWindow').name('Fit Window').listen().onChange(value => {
    points.fitWindow = value;
});

const shaderProjects = [
    { name: 'Base', path: './base/index.js', uri: 'base', desc: 'Empty project to start', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Audio 1', path: './audio1/index.js', uri: 'audio1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Audio 2', path: './audio2/index.js', uri: 'audio2', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Bloom1', path: './bloom1/index.js', uri: 'bloom1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Circle Blur', path: './circleblur/index.js', uri: 'circleblur', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Data 1', path: './data1/index.js', uri: 'data1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Demo 6', path: './demo_6/index.js', uri: 'demo_6', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Dithering 1', path: './dithering1/index.js', uri: 'dithering1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Dithering 2', path: './dithering2/index.js', uri: 'dithering2', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Dithering 3 - 1', path: './dithering3_1/index.js', uri: 'dithering3_1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: false, },
    { name: 'Dithering 3 - 2', path: './dithering3_2/index.js', uri: 'dithering3_2', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: false, },
    { name: 'Dithering 4', path: './dithering4/index.js', uri: 'dithering4', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Events 1', path: './events1/index.js', uri: 'events1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Image Scale 1', path: './imagescale1/index.js', uri: 'imagescale1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Image Texture 1', path: './imagetexture1/index.js', uri: 'imagetexture1', desc: 'How to load a texture.', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Image Texture 2', path: './imagetexture2/index.js', uri: 'imagetexture2', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Image Texture 3', path: './imagetexture3/index.js', uri: 'imagetexture3', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Image Texture 4', path: './imagetexture4/index.js', uri: 'imagetexture4', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Layers 1', path: './layers1/index.js', uri: 'layers1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Mesh 1', path: './mesh1/index.js', uri: 'mesh1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Mouse 1', path: './mouse1/index.js', uri: 'mouse1', desc: 'Mouse demo that draws a cross.', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Mouse Click and Scroll 1', path: './mouseclickscroll1/index.js', uri: 'mouseclickscroll1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Noise 1', path: './noise1/index.js', uri: 'noise1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Noise Circle 1', path: './noisecircle1/index.js', uri: 'noisecircle1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Points Title 1', path: './pointstitle1/index.js', uri: 'pointstitle1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Random 1', path: './random1/index.js', uri: 'random1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: false, },
    { name: 'Random 2 (⚠ SLOW)', path: './random2/index.js', uri: 'random2', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: false, },
    { name: 'Random 3', path: './random3/index.js', uri: 'random3', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: false, },
    { name: 'Render Passes 1', path: './renderpasses1/index.js', uri: 'renderpasses1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Render Passes 2', path: './renderpasses2/index.js', uri: 'renderpasses2', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: false, },
    { name: 'Shapes 1', path: './shapes1/index.js', uri: 'shapes1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Shapes 2', path: './shapes2/index.js', uri: 'shapes2', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: false, },
    { name: 'Spritesheet 1', path: './spritesheet1/index.js', uri: 'spritesheet1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'UVs 1', path: './uvs1/index.js', uri: 'uvs1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    { name: 'Video Texture 1', path: './videotexture1/index.js', uri: 'videotexture1', desc: '', author: 'absulit', authlink: 'http://absulit.com', fitWindow: true, },
    // { name: 'PARAMS TEST', path: './params_test/index.js', uri:'params_test', desc:'', author: 'absulit', authlink:'http://absulit.com', fitWindow: true, },
    // { name: 'WebGPU Particles 1', path: './webgpu_particles_1/index.js', uri:'webgpu_particles_1', desc:'', author: 'absulit', authlink:'http://absulit.com', fitWindow: true, },
]

const shaderNames = {};
const nav = document.getElementById('nav');
const ul = nav.children[0];

let lastSelected = null;
shaderProjects.forEach((item, index) => {
    shaderNames[item.name] = index;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${item.uri}`;
    a.innerHTML = item.name;
    a.index = index;
    a.addEventListener('click', e => {
        lastSelected?.classList.remove('selected');
        e.target.classList.add('selected');
        lastSelected = e.target;
        loadShaderByIndex(e.target.index)
    });
    li.appendChild(a);
    ul.appendChild(li);
});

let selectedShader = { index: Number(localStorage.getItem('selected-shader')) || 0 }

const sourceBtn = document.getElementById('source_btn');
const infoEl = document.getElementById('info');
const titleInfoEl = infoEl.querySelector('#info-title');
const descInfoEl = infoEl.querySelector('#info-desc');
const authorInfoEl = infoEl.querySelector('#info-author');
const authorLinkEl = infoEl.querySelector('#author-link');

async function loadShaderByIndex(index) {
    console.clear();
    localStorage.setItem('selected-shader', index);
    const shaderProject = shaderProjects[index];
    sourceBtn.href = `https://github.com/Absulit/points/tree/master/examples/${shaderProject.uri}`;

    titleInfoEl.innerHTML = shaderProject.name;
    descInfoEl.innerHTML = shaderProject.desc;
    authorInfoEl.innerHTML = shaderProject.author;
    authorLinkEl.href = shaderProject.authlink;
    isFitWindowData.isFitWindow = shaderProject.fitWindow;

    changeUri(shaderProject.uri);
    shaders?.remove?.();
    shaders = (await import(shaderProject.path)).default;
    await init();
}

async function loadShaderByURI() {
    const parts = uriParts();
    let index = shaderProjects.findIndex(s => s.uri == parts[1]);
    if (index == -1) {
        index = selectedShader.index;
    }

    lastSelected = Array.from(document.querySelectorAll('#nav a')).filter(a => a.index == index)[0];
    lastSelected.classList.add('selected');
}

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
            let image = document.getElementById('canvas').toDataURL().replace('image/png', 'image/octet-stream');
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
await loadShaderByURI();

async function init() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    const canvas = document.getElementById('canvas');
    canvas.width = 800;
    canvas.height = 800;
    points = new Points('canvas');

    gui.removeFolder(optionsFolder);
    optionsFolder = gui.addFolder(FOLDER_NAME);

    await shaders.init(points, optionsFolder);
    let renderPasses = shaders.renderPasses || [new RenderPass(shaders.vert, shaders.frag, shaders.compute)];
    // await points.addPostRenderPass(RenderPasses.GRAYSCALE);
    await points.init(renderPasses);
    points.fitWindow = isFitWindowData.isFitWindow;

    let hasVertexAndFragmentShader = renderPasses.every(renderPass => renderPass.hasVertexAndFragmentShader)
    hasVertexAndFragmentShader;

    update();
}

async function update() {
    stats.begin();

    // code here

    shaders.update(points);
    await points.update();

    await shaders.read?.(points);
    //

    stats.end();

    capturer.capture(points.canvas);
    animationFrameId = requestAnimationFrame(update);
}

loadShaderByIndex(selectedShader.index);
