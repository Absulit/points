'use strict';

//ffmpeg -r 60 -f image2 -s 600x600 -i %07d.jpg -vcodec libx264 -crf 25  -pix_fmt yuv420p test.mp4


import Screen from './js/screen.js';
import RGBAColor from './js/color.js';
import MathUtil from './js/mathutil.js';
import Star from './js/examples/star.js';
import Clock from './js/examples/clock.js';
import Matrix from './js/examples/matrix.js';
import CostaRicanFlag from './js/examples/costaricanflag.js';
import SineWave from './js/examples/sinewave.js';
import PolygonChange from './js/examples/polygonchange.js';
import DrawCircle from './js/examples/drawcircle.js';
import WaveNoise from './js/examples/wavenoise.js';
import Point from './js/point.js';
import ImageNoise from './js/examples/imagenoise.js';
import Effects from './js/effects.js';
import ImageLoader from './js/imageloader.js';
import VideoLoader from './js/videoloader.js';
import SpriteLoader from './js/spriteloader.js';
import ChromaSpiral from './js/examples/chromaspiral.js';
import VideoAtlas from './js/examples/videoatlas.js';
import SquidGame from './js/examples/squidgame.js';
import PMW from './js/examples/pmw.js';
import Fluid1 from './js/examples/fluid1.js';
import Fibonacci from './js/examples/fibonacci.js';
import GameOfLife from './js/examples/gameoflife.js';



const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'jpg',
    //timeLimit: 10,
    verbose: true
});


var aspect,
    dimension = 3,
    utime = 0;


let side = 40;
let numColumns = side;
let numRows = side;
let numMargin = 0;
let screen;
let numLayers = 3;

let vertices = [];
let colors = [];
let pointsizes = [];
let atlasids = [];
let uround;
let urounddec;
let usin;
let ucos;

let clearMixColor = new RGBAColor(0, 0, 0);

let clock;
let star;
let matrix;
let flag;
let sinewave;
let polygonChange;
let drawCircle;
let wavenoise;
let imageNoise;
let chromaSpiral;
let squidGame;
let pmw;
let fluid1;
let fibonacci;
let gameOfLife;

let videoatlas;

let effects;

let imageLoader;
let videoLoader;
let spriteLoader;
let spriteLoader2;

let idsOfChars;
let idsOfChars2;

let cache = {
    maxFrames: 60 * 10,
    currentFrame: 0
};

function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0.5]);

    assignShaders("vertex-shader", "fragment-shader");

    dimension = 3;

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, numLayers);

    star = new Star(screen);
    clock = new Clock(screen);
    matrix = new Matrix(screen);
    flag = new CostaRicanFlag(screen);
    sinewave = new SineWave(screen);
    polygonChange = new PolygonChange(screen);
    drawCircle = new DrawCircle(screen);
    wavenoise = new WaveNoise(screen);
    //imageNoise = new ImageNoise(screen);
    chromaSpiral = new ChromaSpiral(screen);
    videoatlas = new VideoAtlas(screen);
    squidGame = new SquidGame(screen);
    pmw = new PMW(screen);
    fluid1 = new Fluid1(screen);
    effects = new Effects(screen);

    imageLoader = new ImageLoader(screen);
    //imageLoader.load('/img/old_king_100x100.jpg');
    //imageLoader.load('/img/old_king_200x200.jpg');
    //imageLoader.load('/img/old_king_600x600.jpg');

    videoLoader = new VideoLoader(screen);
    //videoLoader.load('/assets_ignore/VID_350400608_093537_138.mp4');
    videoLoader.load('/assets_ignore/20210925_183936.mp4');
    //videoLoader.load('/assets_ignore/Black and White Clouds - Time lapse (240p_30fps_H264-128kbit_AAC).mp4');


    spriteLoader = new SpriteLoader(screen, 32, 32);
    //spriteLoader.load('/assets_ignore/pixelspritefont 32.png', 32,32);
    spriteLoader.load('/assets_ignore/pixelspritefont 32_green.png', 32, 32);
    //spriteLoader.load('/assets_ignore/katakana.png', 32, 32);

    idsOfChars = [-1, 31, 51, 37, 40, 47, 61, 30, 62, 63];
    idsOfChars2 = [-1, 60, 36, 51, 48, 57, 38, 61, 45, 64, 63];

    //spriteLoader2 = new SpriteLoader(screen, 64,64);
    //spriteLoader2.load('/img/sprite_nums_1024x1024.png');

    //fibonacci = new Fibonacci(screen);

    gameOfLife = new GameOfLife(screen);
    //-----------

    // point size
    gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);
}

function update() {
    clearScreen();
    stats.begin();
    utime += 1 / 60;//0.01;
    uround = Math.round(utime);
    usin = Math.sin(utime);
    ucos = Math.cos(utime);
    urounddec = utime % 1;

    // does it need it?
    //gl.uniform1f(gl.getUniformLocation(program, "utime"), utime);

    //
    // EXAPLES: copy to a layer to test
    //
    //wavenoise.update(utime);
    //wavenoise.update2(utime, usin);
    //wavenoise.scanLine();
    //wavenoise.scanLine2();
    //drawCircle.update(utime);
    //drawCircle.update2(utime);
    //polygonChange.update(utime, usin);
    //clock.update();
    //sinewave.update(utime);
    //flag.update(utime);
    //matrix.update();
    //star.update(utime, usin);
    //imageNoise.update(usin);
    //chromaSpiral.update(usin, ucos, side);
    //videoatlas.update();
    //chromaSpiral.update(usin, ucos, side, utime);
    //squidGame.update(utime, usin, ucos);
    //pmw.update(usin, ucos);
    //imageLoader.loadToLayer();


    //if (cache[cache.currentFrame]) {
    if (false) {
        // retrieve from cache
        vertices = cache[cache.currentFrame].vertices;
        colors = cache[cache.currentFrame].colors;
        pointsizes = cache[cache.currentFrame].pointsizes;
        atlasids = cache[cache.currentFrame].atlasids;
    } else {
        screen.layerIndex = 0;

        screen.clearMix(new RGBAColor(0, 0, 0), 1.5);
        screen.currentLayer.points.forEach((point, index) => {
            // do something to every point
            // or every p.modified point
            


        });


        //screen.layerIndex = 1;

        //fluid1.update(usin, ucos, side, utime);

        //chromaSpiral.update(usin, ucos, side, utime);
        //fibonacci.update(usin, ucos, side, utime);

        gameOfLife.update(usin, ucos, side, utime);


        screen.mergeLayers();

        //store cache
        addPointsToPrint(screen.mainLayer.points);
        cache[cache.currentFrame] = {
            vertices: vertices,
            colors: colors,
            pointsizes: pointsizes,
            atlasids: atlasids
        }
    }


    if (++cache.currentFrame > cache.maxFrames) {
        cache.currentFrame = 0;
        videoLoader.restart();
    }


    //printLayers(screen.layers);

    //screen.layers.forEach(layer => {
    /*screen.layers.reverse().forEach(layer => {
        addPointsToPrint(layer.points);
    });*/

    /*************/

    // TODO: screen.render();
    printPoints();
    capturer.capture(document.getElementById('gl-canvas'));

    stats.end();
    window.requestAnimFrame(update);
}

function printPoint(point) {
    let vBuffer = getBuffer2(point.position.value);
    shaderVariableToBuffer("vPosition", dimension);

    getBuffer2(point.color.value);
    shaderVariableToBuffer("vColor", 4);

    drawPoints2(vBuffer, point.position.value);
}

function getWebGLCoordinate(value, side, invert = false) {
    let direction = invert ? -1 : 1;
    let p = value / side;
    return ((p * 2) - 1) * direction;
};

function addToPrint(point) {
    if (!point.position.value.calculated) {
        const value = point.position.value;

        value[0] = getWebGLCoordinate(value[0], canvas.width);
        value[1] = getWebGLCoordinate(value[1], canvas.height, true);
        point.position.value.calculated = true;
    }

    vertices.push(point.position.value);
    colors.push(point.color.value);
    pointsizes.push(point.size);
    atlasids.push(point.atlasId);
}

function addPointsToPrint(points) {
    points
        .filter(point => point.modified)
        .forEach(point => addToPrint(point));

};

function printPoints() {
    vertices = flatten(vertices);
    let vBuffer = getBuffer2(vertices);
    shaderVariableToBuffer("vPosition", dimension);

    colors = flatten(colors);
    getBuffer2(colors);
    shaderVariableToBuffer("vColor", 4);

    //pointsizes = pointsizes;
    getBuffer2(pointsizes);
    shaderVariableToBuffer("vPointSize", 1);

    //atlasids = atlasids;
    getBuffer2(atlasids);
    shaderVariableToBuffer("vAtlasId", 1);

    drawPoints2(vBuffer, vertices, dimension);
    vertices = [];
    colors = [];
    pointsizes = [];
    atlasids = []
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