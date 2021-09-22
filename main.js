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
    u_time = 0;


let side = 50;
let numColumns = side;
let numRows = side*2;
let numMargin = 2;
let screen;

let vertices = [];
let colors = [];
let pointsizes = [];
let uround;
let urounddec;
let usin;

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
let effects;

let imageLoader;
let videoLoader;

function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0.5]);

    assignShaders("vertex-shader", "fragment-shader");

    dimension = 3;

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, 3);

    star = new Star(screen);
    clock = new Clock(screen);
    matrix = new Matrix(screen);
    flag = new CostaRicanFlag(screen);
    sinewave = new SineWave(screen);
    polygonChange = new PolygonChange(screen);
    drawCircle = new DrawCircle(screen);
    wavenoise = new WaveNoise(screen);
    //imageNoise = new ImageNoise(screen);
    effects = new Effects(screen);

    imageLoader = new ImageLoader(screen);
    //imageLoader.load('/img/old_king_100x100.jpg');
    //imageLoader.load('/img/old_king_200x200.jpg');
    //imageLoader.load('/img/old_king_600x600.jpg');

    videoLoader = new VideoLoader(screen);
    //videoLoader.load('/video/bars.mp4');
    videoLoader.load('/video/VID_350400608_093537_138.mp4');

    //-----------

    // point size
    gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);
}





function update() {
    clearScreen();
    stats.begin();
    u_time += 1 / 60;//0.01;
    uround = Math.round(u_time);
    usin = Math.sin(u_time);
    urounddec = u_time % 1;




    // does it need it?
    //gl.uniform1f(gl.getUniformLocation(program, "u_time"), u_time);

    //wavenoise.update(u_time);
    //wavenoise.update2(u_time, usin);
    //wavenoise.scanLine();
    //wavenoise.scanLine2();
    //drawCircle.update(u_time);
    //drawCircle.update2(u_time);
    //polygonChange.update(u_time, usin);
    //clock.update();
    //sinewave.update(u_time);
    //flag.update(u_time);
    //matrix.update();
    //star.update(u_time, usin);
    //imageNoise.update(usin);

    screen.layerIndex = 0;

    /*drawCircle.click();
    screen.clearMix(clearMixColor, 1.1);


    screen.layerIndex = 1;

    polygonChange.update(u_time, usin);
    effects.scanLine(Math.round(screen.numRows * .03));
    effects.fire(Math.round(screen.numRows * .01));

    screen.layerIndex = 2;*/
    //let scale = .25 - (.2 * usin);
    //let scale = 1;
    //imageLoader.type = imageLoader.FIT;
    //imageLoader.loadToLayer(0, 0, scale, scale);

    let scale = 1;
    videoLoader.type = videoLoader.FIT;
    videoLoader.loadToLayer(0, 0, scale, scale);

    effects.scanLine(3);
    screen.currentLayer.points.forEach(p => {
        p.size = (p.color.r + p.color.b + p.color.g) / 3 * screen.pointSize;
        p.setColor(1, 1, 1);
    });

    screen.mergeLayers();

    addPointsToPrint(screen.mainLayer.points);
    //printLayers(screen.layers);

    //screen.layers.forEach(layer => {
    /*screen.layers.reverse().forEach(layer => {
        addPointsToPrint(layer.points);
    });*/

    /*************/
    /*let icon = document.getElementById('icon');  // get the <img> tag

    let glTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);  // this is the 0th texture
    gl.bindTexture(gl.TEXTURE_2D, glTexture);

    // actually upload bytes
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, icon);

    // generates a version for different resolutions, needed to draw
    gl.generateMipmap(gl.TEXTURE_2D);*/

    /*************/

    /*let icon2 = document.getElementById('icon2');  // get the <img> tag

    let glTexture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);  // this is the 0th texture
    gl.bindTexture(gl.TEXTURE_2D, glTexture2);

    // actually upload bytes
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, icon2);

    // generates a version for different resolutions, needed to draw
    gl.generateMipmap(gl.TEXTURE_2D);*/


    // here we could merge all the vertices and colors
    // and call draw drawPoints2
    //screen.render();
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

function addToPrint(point) {
    vertices.push(point.position.value);
    colors.push(point.color.value);
    pointsizes.push(point.size);
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

    pointsizes = pointsizes;
    getBuffer2(pointsizes);
    shaderVariableToBuffer("vPointSize", 1);

    drawPoints2(vBuffer, vertices, dimension);
    vertices = [];
    colors = [];
    pointsizes = [];
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