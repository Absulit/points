'use strict';
import * as dat from 'datgui';
import Points from 'points';
import RenderPass from 'renderpass';
import { shaderProjects } from './index_files/shader_projects.js';

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

const shaderNames = {};
const nav = document.getElementById('nav');
const ul = nav.children[0];
const showcaseUl = nav.querySelector('.showcase');
const referenceUl = nav.querySelector('.reference');

let lastSelected = null;
shaderProjects
    // .filter(item => item.enabled)
    // .filter(item => item.tax == 'showcase')
    .forEach((item, index) => {
        if (!item.enabled) {
            return;
        }
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
        if (item.tax === 'showcase') {
            showcaseUl.appendChild(li);
        }
        if (item.tax === 'reference') {
            referenceUl.appendChild(li);
        }
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
    } else {
        selectedShader.index = index;
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
    if (await points.init(renderPasses)) {
        points.fitWindow = isFitWindowData.isFitWindow;
        update();
    } else {
        const el = document.getElementById('nowebgpu');
        el.classList.toggle('show');
    }
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
