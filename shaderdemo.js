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
    getBuffer2,
    shaderVariableToBuffer,
    drawPoints2,
    drawLines2,
    drawTriangles2,
    drawTriangleStrip2
} from './absulit.module.js';
import Cache from './js/cache.js';
import ColorCoordinates from './js/examples/colorcoordinates.js';

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
let numLayers = 3;

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


function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0.5]);

    assignShaders("vertex-shader", "fragment-shader");

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, numLayers);

    cache = new Cache();

    demo = new ColorCoordinates(screen);

    // point size
    gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);
}

function update() {
    clearScreen();
    stats.begin();


    // does it need it?
    
    cache.update(() => {
        utime += 1 / 60;//0.01;
        uround = Math.round(utime);
        usin = Math.sin(utime);
        ucos = Math.cos(utime);
        urounddec = utime % 1;
        gl.uniform1f(gl.getUniformLocation(program, "u_time"), utime);
        

        /*demo.update(usin, ucos, side, utime);


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

        screen._vertices = [];
        screen._colors = [];
        screen._pointsizes = [];
        screen._atlasids = [];*/


        const dimension = 3;
        const vertices = [
            -1, -1, 0,
            -1, 1, 0,
            1, -1, 0,
            1, 1, 0,
        ];
        const vBuffer = getBuffer2(vertices);
        shaderVariableToBuffer("vPosition", dimension);

        const colors = [
            1, 0, 0, 1,
            1, 1, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,
        ]
        getBuffer2(colors);
        shaderVariableToBuffer("vColor", 4);

        const pointsizes = [
            10,
            10,
            10,
            10
        ];
        getBuffer2(pointsizes);
        shaderVariableToBuffer("vPointSize", 1);

        const atlasids = [
            -1,
            -1,
            -1,
            -1
        ];
        getBuffer2(atlasids);
        shaderVariableToBuffer("vAtlasId", 1);

        //drawPoints2(vBuffer, vertices, dimension);
        //drawLines2(vBuffer, vertices);
        drawTriangleStrip2(vBuffer, vertices, 3);

        //printPoints(vertices, colors, pointsizes, atlasids)

    }, currentFrameData => {
        /*vertices = currentFrameData.vertices;
        colors = currentFrameData.colors;
        pointsizes = currentFrameData.pointsizes;
        atlasids = currentFrameData.atlasids;*/
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
