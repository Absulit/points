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
    printPoints,
    printLayers
} from './absulit.module.js';
import Cache from './js/cache.js';
import ColorCoordinates from './js/examples/colorcoordinates.js';
import RGBAColor from './js/color.js';
import Effects from './js/effects.js';
import PolygonChange from './js/examples/polygonchange.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'jpg',
    //timeLimit: 10,
    verbose: true
});

let aspect,
    utime = 0;

let side = 100;
let numColumns = side;
let numRows = side;
let numMargin = 0;
let screen;
let numLayers = 2;

let uround;
let urounddec;
let usin;
let ucos;

let demo;

let cache;

let vertices = [];
let colors = [];
let pointsizes = [];
let atlasids = [];
let layers;
let effects;

function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0.5]);

    assignShaders("vertex-shader", "fragment-shader");

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, numLayers);

    cache = new Cache();

    demo = new ChromaSpiral(screen);

    effects = new Effects(screen);

    // point size
    gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);
}

function update() {
    clearScreen();
    stats.begin();


    // does it need it?
    //gl.uniform1f(gl.getUniformLocation(program, "utime"), utime);

    cache.update(() => {
        utime += 1 / 60;//0.01;
        uround = Math.round(utime);
        usin = Math.sin(utime);
        ucos = Math.cos(utime);
        urounddec = utime % 1;

        screen.layerIndex = 0;
            screen.drawCircle(10,10, 10, 1,0,0);
            demo.update(usin, ucos, side, utime);

        screen.layerIndex = 1;

            screen.drawCircle(20,20, 10, 0,1,0);
            screen.points.forEach(point => {
                point.size = point.getBrightness() * screen.pointSizeFull;
            });
            //effects.soften2(3);
            //effects.soften2(3);


        screen._mergeLayers();
        screen._addPointsToPrint();

        vertices = screen._vertices;
        colors = screen._colors;
        pointsizes = screen._pointsizes;
        atlasids = screen._atlasids;
        layers = [];

        /*for (let index = 0; index < screen.layers.length; index++) {
            const layer = screen.layers[index];
            layers.push(
                {
                    vertices: layer.vertices,
                    colors: layer.colors,
                    pointsizes: layer.pointsizes,
                    atlasIds: layer.atlasIds,
                    modifieds: layer.modifieds
                }
            );
        }*/

        cache.data = {
            vertices: vertices,
            colors: colors,
            pointsizes: pointsizes,
            atlasids: atlasids,
            //layers: layers,
        }

        screen._vertices = [];
        screen._colors = [];
        screen._pointsizes = [];
        screen._atlasids = [];

    }, currentFrameData => {
        vertices = currentFrameData.vertices;
        colors = currentFrameData.colors;
        pointsizes = currentFrameData.pointsizes;
        atlasids = currentFrameData.atlasids;
        //layers = currentFrameData.layers;
    });
    printPoints(vertices, colors, pointsizes, atlasids);
    //printLayers(layers);

    /*************/

    //screen.render();
    capturer.capture(document.getElementById('gl-canvas'));

    stats.end();
    window.requestAnimFrame(update);
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
