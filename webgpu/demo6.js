'use strict';
import WebGPU from './js/absulit.webgpu.module.js';
// import triangleVertWGSL from './shaders/triangle.vert.wgsl';
// import redFragWGSL from './shaders/red.frag.wgsl';
import { getShaderSource } from './shader_loader.js';

const colorsVertWGSL = await getShaderSource('./shaders/demo6_colors.vert.wgsl');
const colorsFragWGSL = await getShaderSource('./shaders/demo6_colors.frag.wgsl');

const textureVertWGSL = await getShaderSource('./shaders/demo6_texture.vert.wgsl');
const textureFragWGSL = await getShaderSource('./shaders/demo6_texture.frag.wgsl');

const useTexture = true;
const shaders = {
    false: {
        vertex: colorsVertWGSL,
        fragment: colorsFragWGSL
    },
    true: {
        vertex: textureVertWGSL,
        fragment: textureFragWGSL
    }
}


let pipeline = null;
let verticesBuffer = null;
let uniformBindGroup = null;




/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
/***************/



const vertexArray = new Float32Array([
    // float4 position, float4 color,
    // there are itemsPerRow items in this row, that's why vertexSize is 4*itemsPerRow
    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,
    +1, -1, 0, 1, 0, 1, 0, 1, 1, 1,
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,

    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,
    -1, +1, 0, 1, 1, 1, 0, 1, 0, 0,
]);


const webGPU = new WebGPU('gl-canvas');
webGPU.useTexture = true;
async function init() {
    const initialized = await webGPU.init();
    if (initialized) {
        webGPU.createVertexBuffer(vertexArray);
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
