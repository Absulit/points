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
import Gen1 from './js/genuary2022/01/gen1.js';
import Gen2 from './js/genuary2022/02/gen2.js';
import Gen3 from './js/genuary2022/03/gen3.js';
import Gen4 from './js/genuary2022/04/gen4.js';
import Gen4_1 from './js/genuary2022/04/gen4_1.js';
import Gen5 from './js/genuary2022/05/gen5.js';
import Gen6 from './js/genuary2022/06/gen6.js';
import Gen7 from './js/genuary2022/07/gen7.js';
import Gen8 from './js/genuary2022/08/gen8.js';
import Gen9 from './js/genuary2022/09/gen9.js';
import Gen9_1 from './js/genuary2022/09/gen9_1.js';
import Gen10 from './js/genuary2022/10/gen10.js';
import Gen12 from './js/genuary2022/12/gen12.js';
import Gen13 from './js/genuary2022/13/gen13.js';
import Gen14 from './js/genuary2022/14/gen14.js';
import Gen15 from './js/genuary2022/15/gen15.js';
import Gen16 from './js/genuary2022/16/gen16.js';
import Gen17 from './js/genuary2022/17/gen17.js';
import Gen17_2 from './js/genuary2022/17/gen17_2.js';
import Gen18 from './js/genuary2022/18/gen18.js';
import Gen19 from './js/genuary2022/19/gen19.js';
import Gen20 from './js/genuary2022/20/gen20.js';
import Gen21 from './js/genuary2022/21/gen21.js';
import Gen22 from './js/genuary2022/22/gen22.js';
import Gen23 from './js/genuary2022/23/gen23.js';
import Gen24 from './js/genuary2022/24/gen24.js';
import Mandelbrot from './js/examples/mandelbrot.js';
import Gen25 from './js/genuary2022/25/gen25.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'webm',
    //timeLimit: 10,
    verbose: true
});

let aspect,
    utime = 0;

let side = 200;
let numColumns = side;
let numRows = side;
let numMargin = 0;
let screen;
let numLayers = 4;

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
let effects;

function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0.5]);

    assignShaders("vertex-shader", "fragment-shader");

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, numLayers);

    cache = new Cache(60*30);

    demo = new Gen25(screen);

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

        screen.layerIndex = 0;//--------------------------- LAYER 0
        demo.update(usin, ucos, side, utime);

        screen._groupLayers();

        vertices = screen._vertices;
        colors = screen._colors;
        pointsizes = screen._pointsizes;
        atlasids = screen._atlasids;

        /*cache.data = {
            vertices: vertices,
            colors: colors,
            pointsizes: pointsizes,
            atlasids: atlasids,
        }*/

        screen._vertices = [];
        screen._colors = [];
        screen._pointsizes = [];
        screen._atlasids = [];

    }, currentFrameData => {
        vertices = currentFrameData.vertices;
        colors = currentFrameData.colors;
        pointsizes = currentFrameData.pointsizes;
        atlasids = currentFrameData.atlasids;
    });
    printPoints(vertices, colors, pointsizes, atlasids);

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
