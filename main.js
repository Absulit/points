'use strict';

//ffmpeg -r 60 -f image2 -s 600x600 -i %07d.jpg -vcodec libx264 -crf 25  -pix_fmt yuv420p test.mp4

import Screen from './js/screen.js';
import ChromaSpiral from './js/examples/chromaspiral.js';

import {
    assignShaders,
    canvas,
    clearScreen,
    gl, initWebGL,
    program,
    setClearColor,
    getBuffer2,
    shaderVariableToBuffer,
    drawPoints2
} from './absulit.module.js';
import Cache from './js/cache.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'jpg',
    //timeLimit: 10,
    verbose: true
});

let aspect,
    dimension = 3,
    utime = 0;

let side = 100;
let numColumns = side;
let numRows = side;
let numMargin = 0;
let screen;
let numLayers = 3;

let uround;
let urounddec;
let usin;
let ucos;

let chromaSpiral;

let cache;

let vertices = [];
let colors = [];
let pointsizes = [];
let atlasids = [];


function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0.5]);

    assignShaders("vertex-shader", "fragment-shader");

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, numLayers);

    cache = new Cache();

    chromaSpiral = new ChromaSpiral(screen);

    // point size
    gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);
}

function update() {
    clearScreen();
    stats.begin();


    // does it need it?
    //gl.uniform1f(gl.getUniformLocation(program, "utime"), utime);

    cache.update((runningFromCache, currentFrameData) => {
        if (runningFromCache) {
            vertices = currentFrameData.vertices;
            colors = currentFrameData.colors;
            pointsizes = currentFrameData.pointsizes;
            atlasids = currentFrameData.atlasids;
            printPoints();
        } else {
            utime += 1 / 60;//0.01;
            uround = Math.round(utime);
            usin = Math.sin(utime);
            ucos = Math.cos(utime);
            urounddec = utime % 1;
            chromaSpiral.update2(usin, ucos, side, utime);

            screen._mergeLayers();
            screen._addPointsToPrint();

            vertices = screen._vertices;
            colors = screen._colors;
            pointsizes = screen._pointsizes;
            atlasids = screen._atlasids;

            cache.data = {
                vertices: vertices,
                colors: colors,
                pointsizes: pointsizes,
                atlasids: atlasids,
            }
            printPoints();

            screen._vertices = [];
            screen._colors = [];
            screen._pointsizes = [];
            screen._atlasids = [];
        }
    });

    /*************/

    //screen.render();
    capturer.capture(document.getElementById('gl-canvas'));

    stats.end();
    window.requestAnimFrame(update);
}


function printPoints() {
    vertices = flatten(vertices);
    let vBuffer = getBuffer2(vertices);
    shaderVariableToBuffer("vPosition", dimension);

    //colors = flatten(colors); // TODO: test if call is required
    getBuffer2(colors);
    shaderVariableToBuffer("vColor", 4);

    //pointsizes = pointsizes;
    getBuffer2(pointsizes);
    shaderVariableToBuffer("vPointSize", 1);

    //atlasids = atlasids;
    getBuffer2(atlasids);
    shaderVariableToBuffer("vAtlasId", 1);

    drawPoints2(vBuffer, vertices, dimension);
}

function printPoint(point) {
    let vBuffer = getBuffer2(point.position.value);
    shaderVariableToBuffer("vPosition", dimension);

    getBuffer2(point.color.value);
    shaderVariableToBuffer("vColor", 4);

    drawPoints2(vBuffer, point.position.value);
}


function printLayers(layers) {
    let vBuffer
    layers.forEach((layer, indexLayer) => {
        addPointsToPrint(layer.points);
        vertices = flatten(vertices);
        vBuffer = getBuffer2(vertices);
        shaderVariableToBuffer(`layer${indexLayer}_vPosition`, dimension);

        colors = flatten(colors);
        getBuffer2(colors);
        shaderVariableToBuffer(`layer${indexLayer}_vColor`, 4);

        pointsizes = pointsizes;
        getBuffer2(pointsizes);
        shaderVariableToBuffer(`layer${indexLayer}_vPointSize`, 1);
    });
    drawPoints2(vBuffer, vertices, dimension);
    vertices = [];
    colors = [];
    pointsizes = [];
}

init();
update();

let downloadBtn = document.getElementById('downloadBtn');
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

/*

// RotationAngle is in radians
x = RotationAxis.x * sin(RotationAngle / 2)
y = RotationAxis.y * sin(RotationAngle / 2)
z = RotationAxis.z * sin(RotationAngle / 2)
w = cos(RotationAngle / 2)

*/