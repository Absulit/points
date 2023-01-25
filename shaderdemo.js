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
import MathUtil from './js/mathutil.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//document.body.appendChild(stats.dom);

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

let constant = 10;
let planets = null;
let center = null;

function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, .1]);

    assignShaders("vertex-shader", "fragment-shader");

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, numLayers);

    cache = new Cache();

    demo = new ColorCoordinates(screen);

    // point size
    gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);


    constant = 1;
    planets = [
        { radius: 40 * constant, speed: 13, angle: 360 },
        { radius: 30 * constant, speed: 8 , angle: 360 },
    ];
    center = screen.center;
}

function update() {
    //clearScreen();
    // gl.clearColor(0, 0, 0, .0001);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    stats.begin();


    // does it need it?
    
    cache.update(() => {
        utime += 1 / 60;//0.01;
        uround = Math.round(utime);
        usin = Math.sin(utime);
        ucos = Math.cos(utime);
        urounddec = utime % 1;
        gl.uniform1f(gl.getUniformLocation(program, "u_time"), utime);
        


        let cx = center.x, cy = center.y;

        const pointList = [];
        //console.log(screen);
        //console.log(planets);
        planets.forEach(planet => {
            let pointFromCenter, radians;
            radians = MathUtil.radians(planet.angle);
            pointFromCenter = MathUtil.vector(planet.radius, radians);
            //console.log(pointFromCenter);
            const point = screen.getPointAt(Math.floor(pointFromCenter.x + cx), Math.floor(pointFromCenter.y + cy));
            pointList.push(point);
            if (point) {
                const { x, y } = point.normalPosition;
                point.modifyColor(color => color.set(1-x, 1-y, x));
                //point.setBrightness(1);
            }

            // if greater than 360 set back to zero, also increment
            planet.angle = (planet.angle * (planet.angle < 360) || 0) + (planet.speed * .3);

        });


        const dimension = 3;
        let vertices = [];
        pointList.forEach(point => {
            //console.log('point: ', point);
            if(point){
                vertices.push(point.position.value);
            }
        });
        vertices = flatten(vertices);


        const vBuffer = getBuffer2(vertices);
        shaderVariableToBuffer("vPosition", dimension);

        let colors = [];
        pointList.forEach(point => {
            if(point){
                colors.push(point.color.value);
            }
        });
        colors = flatten(colors);


        getBuffer2(colors);
        shaderVariableToBuffer("vColor", 4);

        const pointsizes = [];
        pointList.forEach(point => {
            pointsizes.push(10);
        });

        getBuffer2(pointsizes);
        shaderVariableToBuffer("vPointSize", 1);

        const atlasids = [];
        pointList.forEach(point => {
            atlasids.push(-1);
        });

        getBuffer2(atlasids);
        shaderVariableToBuffer("vAtlasId", 1);

       // console.log(vertices, colors, pointsizes, atlasids);debugger

        //drawPoints2(vBuffer, vertices, dimension);
        drawLines2(vBuffer, vertices);
        //drawTriangleStrip2(vBuffer, vertices, 3);

        //printPoints(vertices, colors, pointsizes, atlasids)

        //console.log(planets);

    }, currentFrameData => {
        /*vertices = currentFrameData.vertices;
        colors = currentFrameData.colors;
        pointsizes = currentFrameData.pointsizes;
        atlasids = currentFrameData.atlasids;*/
    });
    //printPoints(vertices, colors, pointsizes, atlasids);

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
