'use strict';
import WebGPU from './js/absulit.webgpu.module.js';
import RGBAColor from './js/color.js';
import Coordinate from './js/coordinate.js';
/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
//document.body.appendChild(stats.dom);
/***************/



const vertexArray = new Float32Array([
    // float4 position, float4 color,
    // there are itemsPerRow items in this row, that's why vertexSize is 4*itemsPerRow
    -1, +1, 0, 1,  1, 1, 0, 1,  0, 0,// top left
    +1, +1, 0, 1,  1, 0, 0, 1,  1, 0,// top right
    -1, -1, 0, 1,  0, 0, 1, 1,  0, 1,// bottom left

    +1, +1, 0, 1,  1, 0, 0, 1,  1, 0,// top right
    +1, -1, 0, 1,  0, 1, 0, 1,  1, 1,// bottom right
    -1, -1, 0, 1,  0, 0, 1, 1,  0, 1,// bottom left

]);

// const vertexArray = new Float32Array([
//     // float4 position, float4 color,
//     // there are itemsPerRow items in this row, that's why vertexSize is 4*itemsPerRow
//     +1/2, +1/2, 0, 1,  1, 0, 0, 1,  1, 0,
//     +1/2, -1/2, 0, 1,  0, 1, 0, 1,  1, 1,
//     -1/2, -1/2, 0, 1,  0, 0, 1, 1,  0, 1,

//     +1/2, +1/2, 0, 1,  1, 0, 0, 1,  1, 0,
//     -1/2, -1/2, 0, 1,  0, 0, 1, 1,  0, 1,
//     -1/2, +1/2, 0, 1,  1, 1, 0, 1,  0, 0,
// ]);


const webGPU = new WebGPU('gl-canvas');
webGPU.useTexture = false;

async function init() {
    const initialized = await webGPU.init();
    if (initialized) {
        //webGPU.createVertexBuffer(vertexArray);

        let color = new RGBAColor(1,0,0);
        let coordinate = new Coordinate(50,50,.3);
        webGPU.addPoint(coordinate, 100,100, color);

        color = new RGBAColor(1,0,1, .5);
        coordinate = new Coordinate(100,100,.2);
        webGPU.addPoint(coordinate, 100,100, color);

        await webGPU.createPipeline();
    }
    update();
}

function update() {
    stats.begin();

    webGPU.update();

    stats.end();
    requestAnimationFrame(update);
}

init();
