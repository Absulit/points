'use strict';

//ffmpeg -r 60 -f image2 -s 600x600 -i %07d.jpg -vcodec libx264 -crf 25  -pix_fmt yuv420p test.mp4

import {
    assignShaders,
    canvas,
    clearScreen,
    gl, initWebGL,
    program,
    setClearColor,
    printPoints,
    printLayers,
    shaderUniformToBuffer,
    printTriangles,
    getBuffer2,
    shaderVariableToBuffer
} from '../absulit.module.js';
import MathUtil from '../js/mathutil.js';


const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'webm',
    //timeLimit: 10,
    verbose: true
});

let utime = 0;

let vertices = new Float32Array([
    -1.0, -1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,

    1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,

    -1.0, -1.0, 0.0,



]);
let colors = new Float32Array([
    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,

    1, 0, 0, 1,
    1, 0, 0, 1,
    1, 0, 0, 1,
]);
let pointsizes = new Float32Array([
    10,
    10,
    10,
    10,
    10,
    10,
]);
let atlasids = new Float32Array([
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
]);


const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let planets;
function init() {
    initWebGL("gl-canvas", true);
    setClearColor([0, 0, 0, 0]);

    assignShaders("vertex-shader", "fragment-shader");

    //-----------
    planets = [
        { radius: 5, speed: 10, angle: Math.random() * 360 },
        { radius: 10, speed: 7, angle: Math.random() * 360 },
        { radius: 13, speed: 6, angle: Math.random() * 360 },
        { radius: 16, speed: 5, angle: Math.random() * 360 },
        { radius: 20, speed: 5, angle: Math.random() * 360 },
        { radius: 23, speed: 1, angle: Math.random() * 360 },
        { radius: 27, speed: -1, angle: Math.random() * 360 },
        { radius: 32, speed: .1, angle: Math.random() * 360 },
    ]
}

function update() {
    clearScreen();
    stats.begin();

    shaderUniformToBuffer('utime', utime);

    shaderUniformToBuffer('screenWidth', canvas.width);
    shaderUniformToBuffer('screenHeight', canvas.height);

    utime += 0.01666;//1 / 60;//0.01666;

    //
    // CODE HERE
    let cx = canvas.width * .5, cy = canvas.height * .5;
    let planetPoints = [];
    planets.forEach((planet, index) => {
        let pointFromCenter, point, radians;
        radians = MathUtil.radians(planet.angle);
        pointFromCenter = MathUtil.vector(planet.radius, radians);
        let coord = {
            x: Math.round(pointFromCenter.x + cx),
            y: Math.round(pointFromCenter.y + cy)
        };
        planetPoints.push(coord.x);
        planetPoints.push(coord.y);

        // if greater than 360 set back to zero, also increment
        planet.angle = (planet.angle * (planet.angle < 360) || 0) + (planet.speed * .3);

    });

    //getBuffer2(new Float32Array(planetPoints));
    shaderUniformToBuffer("planetPoints", new Float32Array(planetPoints) );
    shaderUniformToBuffer("planetPointsLength", 8 );

    //
    //printPoints(vertices, colors, pointsizes, atlasids);
    printTriangles(vertices, colors, pointsizes, atlasids);

    /*************/

    //screen.render();
    capturer.capture(document.getElementById('gl-canvas'));

    stats.end();
    window.requestAnimFrame(update);
}

init();
update();

const downloadBtn = document.getElementById('downloadBtn');
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

const sliderA = document.getElementById('slider-a');
const sliderB = document.getElementById('slider-b');
const sliderC = document.getElementById('slider-c');

sliders.a = sliderA.value = localStorage.getItem('slider-a') || 0;
sliders.b = sliderB.value = localStorage.getItem('slider-b') || 0;
sliders.c = sliderC.value = localStorage.getItem('slider-c') || 0;

sliderA.addEventListener('input', e => sliders.a = e.target.value);
sliderB.addEventListener('input', e => sliders.b = e.target.value);
sliderC.addEventListener('input', e => sliders.c = e.target.value);

sliderA.addEventListener('change', e => localStorage.setItem('slider-a', e.target.value));
sliderB.addEventListener('change', e => localStorage.setItem('slider-b', e.target.value));
sliderC.addEventListener('change', e => localStorage.setItem('slider-c', e.target.value));

sliderA.addEventListener('change', e => print(e.target.value));
sliderB.addEventListener('change', e => print(e.target.value));
sliderC.addEventListener('change', e => print(e.target.value));
