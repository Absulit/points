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
    printLayers,
    shaderUniformToBuffer
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
import Gen26 from './js/genuary2022/26/gen26.js';
import Gen27 from './js/genuary2022/27/gen27.js';
import Gen28 from './js/genuary2022/28/gen28.js';
import Gen29 from './js/genuary2022/29/gen29.js';
import Gen30 from './js/genuary2022/30/gen30.js';
import Gen31 from './js/genuary2022/31/gen31.js';
import EffectsTester from './js/examples/effects_tester.js';
import CostaRicanFlag from './js/examples/costaricanflag.js';
import GameOfLife from './js/examples/gameoflife.js';
import CenterDistance from './js/examples/centerdistance.js';
import CenterAngle from './js/examples/centerangle.js';
import FlowFieldsAnimated from './js/examples/flowfieldsanimated.js';
import FlowFieldsAnimated2 from './js/examples/flowfieldsanimated2.js';
import VideoAtlas from './js/examples/videoatlas.js';
import Gen6_2 from './js/genuary2022/06/gen6_2.js';
import SlimeImage from './js/examples/slimeimage.js';
import PlanetaryLines from './js/examples/planetarylines.js';
import PlanetaryLines2 from './js/examples/planetarylines2.js';
import PlanetaryLines3 from './js/examples/planetarylines3.js';
import Math1 from './js/examples/math1.js';
import ChromaSpiral_2 from './js/examples/chromaspiral_2.js';
import ChromaSpiral_3 from './js/examples/chromaspiral_3.js';
import DistancePoints from './js/examples/distancepoints.js';
import SineWave2 from './js/examples/sinewave2.js';
import SpeedPoints from './js/examples/speedpoints.js';
import SpeedPoints2 from './js/examples/speedpoints2.js';
import SpeedPoints3 from './js/examples/speedpoints3.js';
import SpeedPoints4 from './js/examples/speedpoints4.js';
import SpeedPoints5 from './js/examples/speedpoints5.js';
import SpeedPoints6 from './js/examples/speedpoints6.js';
import SpeedPoints7 from './js/examples/speedpoints7.js';
import SpeedPoints2_1 from './js/examples/speedpoints2_1.js';
import SpeedPoints8 from './js/examples/speedpoints8.js';
import Julio1 from './js/examples/julio1.js';
import SpeedPoints9 from './js/examples/speedpoints9.js';
import Noise1 from './js/examples/noise1.js';
import Noise2 from './js/examples/noise2.js';
import Fluid1 from './js/examples/fluid1.js';
import Slime from './js/examples/slime.js';
import Slime2 from './js/examples/slime2.js';
import SineLines from './js/examples/sinelines.js';
import Noise1_2 from './js/examples/noise1_2.js';

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


let numMargin = 0;
let screen;

let uround;
let urounddec;
let usin;
let nusin;
let nucos;
let ucos;
let fnusin;
let fnucos;
let fnsin;
let fncos;
let fusin;
let fucos;

let demo;

let cache;

let vertices = [];
let colors = [];
let pointsizes = [];
let atlasids = [];
let effects;

let side = 100;
let numLayers = 4;
let numColumns = side;
let numRows = side;

function init() {
    initWebGL("gl-canvas", true);
    aspect = canvas.width / canvas.height;
    setClearColor([0, 0, 0, 0]);

    assignShaders("vertex-shader", "fragment-shader");

    //-----------
    screen = new Screen(canvas, numColumns, numRows, numMargin, numLayers);

    cache = new Cache(60 * 10);

    demo = new Noise1_2(screen);

    effects = new Effects(screen);

    // point size
    // this is not used, just legacy:
    //gl.uniform1f(gl.getUniformLocation(program, "u_pointsize"), screen.pointSize);
}

function update() {
    clearScreen();
    stats.begin();


    // does it need it?
    //gl.uniform1f(gl.getUniformLocation(program, "utime"), utime);
    shaderUniformToBuffer('u_time', utime);

    cache.update(() => {
        utime += 1 / 60;//0.01;
        uround = Math.round(utime);
        usin = Math.sin(utime);
        ucos = Math.cos(utime);
        urounddec = utime % 1;
        nusin = (Math.sin(utime) + 1) / 2;
        nucos = (Math.cos(utime) + 1) / 2;

        fusin = speed => Math.sin(utime * speed);
        fucos = speed => Math.cos(utime * speed);

        fnusin = speed => (Math.sin(utime * speed) + 1) / 2;
        fnucos = speed => (Math.cos(utime * speed) + 1) / 2;

        fnsin = speed => (Math.sin(speed) + 1) / 2;
        fncos = speed => (Math.cos(speed) + 1) / 2;


        screen.layerIndex = 0;//--------------------------- LAYER 0
        demo.update({usin, ucos, side, utime, nusin, nucos, fusin, fucos, fnusin, fnucos, fnsin, fncos});

        screen._groupLayers();

        vertices = screen._vertices;
        colors = screen._colors;
        pointsizes = screen._pointsizes;
        atlasids = screen._atlasids;

        // cache.data = {
        //     vertices: vertices,
        //     colors: colors,
        //     pointsizes: pointsizes,
        //     atlasids: atlasids,
        // }

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
