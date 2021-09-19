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


let numColumns = 100;
let numRows = 100;
let numMargin = 0;
let screen;

let vertices = [];
let colors = [];
let pointsizes = [];
let uround;
let urounddec;
let usin;

let clearMixColor = new RGBAColor(0, 0, 0);

let centerColumns = numColumns / 2, centerRows = numRows / 2;


let clock;
let star;
let matrix;
let flag;
let sinewave;
let polygonChange;
let drawCircle;
let wavenoise;
let imageNoise;

let printCircle = false;
let printCircleDistance = 0;
let printCirclePoint;


function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0.5]);

    assignShaders("vertex-shader", "fragment-shader");

    dimension = 3;

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, 5);
    centerColumns = numColumns / 2;
    centerRows = numRows / 2;

    star = new Star(screen);
    clock = new Clock(screen);
    matrix = new Matrix(screen);
    flag = new CostaRicanFlag(screen);
    sinewave = new SineWave(screen);
    polygonChange = new PolygonChange(screen);
    drawCircle = new DrawCircle(screen);
    wavenoise = new WaveNoise(screen);
    imageNoise = new ImageNoise(screen);



    //capturer.start();

    /*point = new Point()
    point.coordinate.set(0, 0, 0);
    point.color.set(1, 1, 0, 1);*/

    //-----------

    // point size
    gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);
}




let k = 0;

function update() {
    clearScreen();
    stats.begin();
    u_time += 1 / 60;//0.01;
    uround = Math.round(u_time);
    usin = Math.sin(u_time);
    urounddec = u_time % 1;




    // does it need it?
    //gl.uniform1f(gl.getUniformLocation(program, "u_time"), u_time);

    /*screen.clearMix(clearMixColor, 1.1);
    let point1 = screen.getPointAt(centerColumns, centerRows);
    let point2 = screen.getPointAt(centerColumns + 10, centerRows + 10);
    screen.drawCircleWithPoints(point1, point2);*/



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
    //imageNoise.update(usin);
    //sinewave.update(u_time);

    //screen.layerIndex = 1;

    //screen.clear(new RGBAColor(1,1,0));
    /*screen.clear();

    if (printCircle) {
        screen.drawCircle(printCirclePoint.coordinates.x, printCirclePoint.coordinates.y,
            printCircleDistance,
            1, 0, 0, 1,
            1);

        if (++printCircleDistance >= 100) {
            printCircle = false;
            printCircleDistance = 0;
        }
    }
    screen.clearMix(clearMixColor, 1.1);*/



    //screen.clear();

    //screen.clearMix(clearMixColor, 1.1);

    //screen.layerIndex = 2;
    //screen.drawLineRotation(screen.center.x, screen.center.y, 20, 3.14, new RGBAColor(1, 0, 0));

    //screen.layerIndex = 3;
    //screen.drawLineRotation(screen.center.x, screen.center.y, screen.numColumns * .8, 1, new RGBAColor(1, .1, 0, .5));
    polygonChange.update(u_time, usin);

    let amountNoise = Math.abs(1000 * usin) + 5000;
    for (let index = 0; index < amountNoise; index++) {
        let point = screen.getRandomPoint();
        //let point = screen.getPointAt(50,50);
        //let point2 = this._screen.getRandomPoint();
        //if(point.color.a > 0){
        if (point.modified) {
            //point.size = 10;
            point.size = screen.pointSize * point.color.r;
            screen.movePointTo(point, point.coordinates.x, point.coordinates.y - 1);
            screen.movePointTo(point, point.coordinates.x + 1, point.coordinates.y - 2);
            //screen.movePointTo(point, point.coordinates.x+2, point.coordinates.y-3);
        }
    }
    //screen.clearMix(clearMixColor, 1.1);


    //screen.layerIndex = 4;
    //screen.drawLineRotation(0, screen.center.y + 10, screen.numColumns * .8, MathUtil.radians(-15), new RGBAColor(1, 1, .1, .5));

    /*screen.layerIndex = 0;
    let point0 = screen.getPointAt(screen.center.x, screen.center.y);
    point0.setColor(1,0,0, .5);

    screen.layerIndex = 1;
    let point1 = screen.getPointAt(screen.center.x, screen.center.y);
    point1.setColor(0,1,0, 0.5);

    let point2 = screen.getPointAt(screen.center.x+1, screen.center.y-1);
    point2.setColor(0,1,0, 1);*/


    screen.mergeLayers();

    addPointsToPrint(screen.mainLayer.points);

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

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
    let point = screen.getPointAtCoordinate(x, y);
    if (point) {
        point.setColor(1, 0, 0);
    }
}


function loadCircle(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    printCirclePoint = screen.getPointAtCoordinate(x, y);
    printCircle = true;
    printCircleDistance = 0;
}

canvas.addEventListener('mousedown', function (e) {
    //getCursorPosition(canvas, e);
    loadCircle(canvas, e);
})


/*

// RotationAngle is in radians
x = RotationAxis.x * sin(RotationAngle / 2)
y = RotationAxis.y * sin(RotationAngle / 2)
z = RotationAxis.z * sin(RotationAngle / 2)
w = cos(RotationAngle / 2)

*/