'use strict';
import MathUtil from '../js/mathutil.js';
import { print } from '../js/utils.js';
import WebGPU, { ShaderType } from './absulit.simplewebgpu.module.js';
import blur1Compute from './shaders/blur1/blur1.compute.js';
import blur1Frag from './shaders/blur1/blur1.frag.js';
import blur1Vert from './shaders/blur1/blur1.vert.js';
import circleblurCompute from './shaders/circleblur/circleblur.compute.js';
import circleblurVert from './shaders/circleblur/circleblur.vert.js';
import circleblurFrag from './shaders/circleblur/circleblur.frag.js';
import defaultCompute from './shaders/default/default.compute.js';
import defaultFrag from './shaders/default/default.frag.js';
import defaultVert from './shaders/default/default.vert.js';
import demo6_textureFrag from './shaders/demo_6/demo6_texture.frag.js';
import demo6_textureVert from './shaders/demo_6/demo6_texture.vert.js';
import planetsCompute from './shaders/planets/planets.compute.js';
import planetsFrag from './shaders/planets/planets.frag.js';
import planetsVert from './shaders/planets/planets.vert.js';
import planets2Compute from './shaders/planets2/planets2.compute.js';
import planets2Frag from './shaders/planets2/planets2.frag.js';
import planets2Vert from './shaders/planets2/planets2.vert.js';
import planets3Compute from './shaders/planets3/planets3.compute.js';
import planets3Vert from './shaders/planets3/planets3.vert.js';
import planets3Frag from './shaders/planets3/planets3.frag.js';
import planetsblurCompute from './shaders/planetsblur/planetsblur.compute.js';
import planetsblurFrag from './shaders/planetsblur/planetsblur.frag.js';
import planetsblurVert from './shaders/planetsblur/planetsblur.vert.js';
import planetsblur2Compute from './shaders/planetsblur2/planetsblur2.compute.js';
import planetsblur2Frag from './shaders/planetsblur2/planetsblur2.frag.js';
import planetsblur2Vert from './shaders/planetsblur2/planetsblur2.vert.js';
import reactiondiffusionVert from './shaders/reactiondiffusion/reactiondiffusion.vert.js';
import reactiondiffusionCompute from './shaders/reactiondiffusion/reactiondiffusion.compute.js';
import reactiondiffusionFrag from './shaders/reactiondiffusion/reactiondiffusion.frag.js';
import slimeCompute from './shaders/slime/slime.compute.js';
import slimeFrag from './shaders/slime/slime.frag.js';
import slimeVert from './shaders/slime/slime.vert.js';
import slime2Compute from './shaders/slime2/slime2.compute.js';
import slime2Frag from './shaders/slime2/slime2.frag.js';
import slime2Vert from './shaders/slime2/slime2.vert.js';
import test1Frag from './shaders/test1/test1.frag.js';
import random1Frag from './shaders/random1/random1.frag.js';
import random1Compute from './shaders/random1/random1.compute.js';
import random1Vert from './shaders/random1/random1.vert.js';
import slime3Vert from './shaders/slime3/slime3.vert.js';
import slime3Compute from './shaders/slime3/slime3.compute.js';
import slime3Frag from './shaders/slime3/slime3.frag.js';
import random2Vert from './shaders/random2/random2.vert.js';
import random2Compute from './shaders/random2/random2.compute.js';
import random2Frag from './shaders/random2/random2.frag.js';
import shapes1Vert from './shaders/shapes1/shapes1.vert.js';
import shapes1Compute from './shaders/shapes1/shapes1.compute.js';
import shapes1Frag from './shaders/shapes1/shapes1.frag.js';
import shapes2Vert from './shaders/shapes2/shapes2.vert.js';
import shapes2Compute from './shaders/shapes2/shapes2.compute.js';
import shapes2Frag from './shaders/shapes2/shapes2.frag.js';
import chromaspiralVert from './shaders/chromaspiral/chromaspiral.vert.js';
import chromaspiralCompute from './shaders/chromaspiral/chromaspiral.compute.js';
import chromaspiralFrag from './shaders/chromaspiral/chromaspiral.frag.js';
import chromaspiral2Vert from './shaders/chromaspiral2/chromaspiral2.vert.js';
import chromaspiral2Compute from './shaders/chromaspiral2/chromaspiral2.compute.js';
import chromaspiral2Frag from './shaders/chromaspiral2/chromaspiral2.frag.js';
import twigl1Vert from './shaders/twigl1/twigl1.vert.js';
import twigl1Compute from './shaders/twigl1/twigl1.compute.js';
import twigl1Frag from './shaders/twigl1/twigl1.frag.js';
import kaleidoscope1Vert from './shaders/kaleidoscope1/kaleidoscope1.vert.js';
import kaleidoscope1Compute from './shaders/kaleidoscope1/kaleidoscope1.compute.js';
import kaleidoscope1Frag from './shaders/kaleidoscope1/kaleidoscope1.frag.js';
import random3Vert from './shaders/random3/random3.vert.js';
import random3Compute from './shaders/random3/random3.compute.js';
import random3Frag from './shaders/random3/random3.frag.js';
import layers1Vert from './shaders/layers1/layers1.vert.js';
import layers1Compute from './shaders/layers1/layers1.compute.js';
import layers1Frag from './shaders/layers1/layers1.frag.js';
import noise1Vert from './shaders/noise1/noise1.vert.js';
import noise1Compute from './shaders/noise1/noise1.compute.js';
import noise1Frag from './shaders/noise1/noise1.frag.js';
import flowfieldsanimatedCompute from './shaders/flowfieldsanimated/flowfieldsanimated.compute.js';
import flowfieldsanimatedVert from './shaders/flowfieldsanimated/flowfieldsanimated.vert.js';
import flowfieldsanimatedFrag from './shaders/flowfieldsanimated/flowfieldsanimated.frag.js';
import noisecircle1Vert from './shaders/noisecircle1/noisecircle1.vert.js';
import noisecircle1Compute from './shaders/noisecircle1/noisecircle1.compute.js';
import noisecircle1Frag from './shaders/noisecircle1/noisecircle1.frag.js';
import noise2Vert from './shaders/noise2/noise2.vert.js';
import noise2Compute from './shaders/noise2/noise2.compute.js';
import noise2Frag from './shaders/noise2/noise2.frag.js';
import oscilloscope1Vert from './shaders/oscilloscope1/oscilloscope1.vert.js';
import oscilloscope1Compute from './shaders/oscilloscope1/oscilloscope1.compute.js';
import oscilloscope1Frag from './shaders/oscilloscope1/oscilloscope1.frag.js';
import imagetexture1Vert from './shaders/imagetexture1/imagetexture1.vert.js';
import imagetexture1Compute from './shaders/imagetexture1/imagetexture1.compute.js';
import imagetexture1Frag from './shaders/imagetexture1/imagetexture1.frag.js';
import imagetexture2Vert from './shaders/imagetexture2/imagetexture2.vert.js';
import imagetexture2Compute from './shaders/imagetexture2/imagetexture2.compute.js';
import imagetexture2Frag from './shaders/imagetexture2/imagetexture2.frag.js';
import noise3Vert from './shaders/noise3/noise3.vert.js';
import noise3Compute from './shaders/noise3/noise3.compute.js';
import noise3Frag from './shaders/noise3/noise3.frag.js';
import imagetexture3Vert from './shaders/imagetexture3/imagetexture3.vert.js';
import imagetexture3Compute from './shaders/imagetexture3/imagetexture3.compute.js';
import imagetexture3Frag from './shaders/imagetexture3/imagetexture3.frag.js';
import videotexture1Vert from './shaders/videotexture1/videotexture1.vert.js';
import videotexture1Compute from './shaders/videotexture1/videotexture1.compute.js';
import videotexture1Frag from './shaders/videotexture1/videotexture1.frag.js';
import reactiondiffusion1Vert from './shaders/reactiondiffusion1/reactiondiffusion1.vert.js';
import reactiondiffusion1Compute from './shaders/reactiondiffusion1/reactiondiffusion1.compute.js';
import reactiondiffusion1Frag from './shaders/reactiondiffusion1/reactiondiffusion1.frag.js';
import dithering1Vert from './shaders/dithering1/dithering1.vert.js';
import dithering1Compute from './shaders/dithering1/dithering1.compute.js';
import dithering1Frag from './shaders/dithering1/dithering1.frag.js';
import dithering2Vert from './shaders/dithering2/dithering2.vert.js';
import dithering2Compute from './shaders/dithering2/dithering2.compute.js';
import dithering2Frag from './shaders/dithering2/dithering2.frag.js';

/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'webm',
    //timeLimit: 10,
    verbose: true
});
/***************/


const webGPU = new WebGPU('gl-canvas');
webGPU.useTexture = false;

let utime = 0;
let epoch = 0;
let mouseX = 0;
let mouseY = 0;


const sliders = { 'a': 0, 'b': 0, 'c': 0 }

let canvas = document.getElementById('gl-canvas');

let vertexShader, computeShader, fragmentShader;

async function init() {


    webGPU.addUniform('utime', 0);
    webGPU.addUniform('epoch', 0);
    webGPU.addUniform('screenWidth', 0);
    webGPU.addUniform('screenHeight', 0);
    webGPU.addUniform('mouseX', 0);
    webGPU.addUniform('mouseY', 0);
    webGPU.addUniform('sliderA', 0);
    webGPU.addUniform('sliderB', 0);
    webGPU.addUniform('sliderC', 0);

    vertexShader = defaultVert;
    computeShader = defaultCompute;
    fragmentShader = defaultFrag;

    // vertexShader = defaultVert;
    // computeShader = defaultCompute;
    // fragmentShader = test1Frag;

    // vertexShader = oscilloscope1Vert;
    // computeShader = oscilloscope1Compute;
    // fragmentShader = oscilloscope1Frag;
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addStorage('variables', 1, 'Variable', 2, ShaderType.FRAGMENT);

    // vertexShader = imagetexture1Vert;
    // computeShader = imagetexture1Compute;
    // fragmentShader = imagetexture1Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // vertexShader = imagetexture2Vert;
    // computeShader = imagetexture2Compute;
    // fragmentShader = imagetexture2Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // vertexShader = imagetexture3Vert;
    // computeShader = imagetexture3Compute;
    // fragmentShader = imagetexture3Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // vertexShader = dithering1Vert;
    // computeShader = dithering1Compute;
    // fragmentShader = dithering1Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);

    // vertexShader = dithering2Vert;
    // computeShader = dithering2Compute;
    // fragmentShader = dithering2Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureVideo('video', './../assets_ignore/VIDEO0244.mp4', ShaderType.FRAGMENT);
    // await webGPU.addTextureWebcam('video', ShaderType.FRAGMENT);

    // vertexShader = videotexture1Vert;
    // computeShader = videotexture1Compute;
    // fragmentShader = videotexture1Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
    // //await webGPU.addTextureImage('oldking', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
    // await webGPU.addTextureVideo('video', './../assets_ignore/Black and White Clouds - Time lapse (480p_30fps_H264-128kbit_AAC).mp4', ShaderType.COMPUTE)
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = flowfieldsanimatedVert;
    // computeShader = flowfieldsanimatedCompute;
    // fragmentShader = flowfieldsanimatedFrag;
    // const lineAmount = 1024;
    // webGPU.addUniform('flowfields_lineAmount', lineAmount);
    // webGPU.addUniform('flowfields_numSteps', 10);
    // webGPU.addUniform('flowfields_stepLength', 10);
    // webGPU.addUniform('flowfields_radians', Math.PI * 2); // angle
    // webGPU.addStorage('flowfields_startPositions', lineAmount, 'StartPosition', 2, ShaderType.COMPUTE);
    // webGPU.addStorage('variables', 1, 'Variable', 2, ShaderType.COMPUTE);
    // webGPU.addLayers(2, ShaderType.COMPUTE);

    // vertexShader = noise1Vert;
    // computeShader = noise1Compute;
    // fragmentShader = noise1Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('value_noise_data_length', numPoints);
    // webGPU.addStorage('value_noise_data', numPoints, 'f32', 1, ShaderType.COMPUTE);
    // webGPU.addStorage('variables', 1, 'Variable', 1, ShaderType.COMPUTE);

    // vertexShader = noise2Vert;
    // computeShader = noise2Compute;
    // fragmentShader = noise2Frag;
    // const numPoints = 1024;
    // const lineAmount = 16;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addUniform('initializeAgain', 0);
    // webGPU.addUniform('lineAmount', lineAmount);
    // webGPU.addStorage('points', numPoints, 'Point', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 3, ShaderType.COMPUTE);
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // webGPU.addLayers(1, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);

    // vertexShader = noise3Vert;
    // computeShader = noise3Compute;
    // fragmentShader = noise3Frag;
    // const numPoints = 1024;
    // const lineAmount = 16;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addUniform('initializeAgain', 0);
    // webGPU.addUniform('lineAmount', lineAmount);
    // webGPU.addStorage('points', numPoints, 'Point', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 3, ShaderType.COMPUTE);
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.FRAGMENT);
    // webGPU.addLayers(1, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // webGPU.addSampler('feedbackSampler', null);
    // //await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // //await webGPU.addTextureImage('image', './../assets_ignore/pmw_800x800.jpg', ShaderType.COMPUTE);
    // await webGPU.addTextureImage('image', './../img/carmen_lyra_2_800x800.jpg', ShaderType.COMPUTE);

    // vertexShader = noisecircle1Vert;
    // computeShader = noisecircle1Compute;
    // fragmentShader = noisecircle1Frag;
    // const numPoints = 128;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec2<f32>', 2);

    // vertexShader = layers1Vert;
    // computeShader = layers1Compute;
    // fragmentShader = layers1Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec4<f32>', 4);
    // webGPU.addLayers(2, ShaderType.COMPUTE);

    // vertexShader = twigl1Vert;
    // computeShader = twigl1Compute;
    // fragmentShader = twigl1Frag;

    // vertexShader = kaleidoscope1Vert;
    // computeShader = kaleidoscope1Compute;
    // fragmentShader = kaleidoscope1Frag;

    // vertexShader = chromaspiralVert;
    // computeShader = chromaspiralCompute;
    // fragmentShader = chromaspiralFrag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // webGPU.addLayers(1, ShaderType.COMPUTE);


    // vertexShader = chromaspiral2Vert;
    // computeShader = chromaspiral2Compute;
    // fragmentShader = chromaspiral2Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec4<f32>', 4);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = shapes1Vert;
    // computeShader = shapes1Compute;
    // fragmentShader = shapes1Frag;
    // const numPoints = 128;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec2<f32>', 2);

    // vertexShader = shapes2Vert;
    // computeShader = shapes2Compute;
    // fragmentShader = shapes2Frag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('points', numPoints, 'vec4<f32>', 4);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = random1Vert;
    // computeShader = random1Compute;
    // fragmentShader = random1Frag;
    // webGPU.addUniform('randNumber', 0);
    // webGPU.addUniform('randNumber2', 0);
    // webGPU.addStorage('stars', 800*800, 'Star', 4);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = random2Vert;
    // computeShader = random2Compute;
    // fragmentShader = random2Frag;
    // webGPU.addUniform('randNumber', 0);
    // webGPU.addUniform('randNumber2', 0);
    // webGPU.addStorage('stars', 800*800, 'Star', 4);
    // let data = [];
    // for (let k = 0; k < 800*800; k++) {
    //     data.push(Math.random());
    // }
    // webGPU.addStorageMap('rands', [0,0], 'f32');
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = random3Vert;
    // computeShader = random3Compute;
    // fragmentShader = random3Frag;
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = planetsVert;
    // computeShader = planetsCompute;
    // fragmentShader = planetsFrag;
    // webGPU.addStorage('planets', 8, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);

    // vertexShader = planets2Vert;
    // computeShader = planets2Compute;
    // fragmentShader = planets2Frag;
    // webGPU.addStorage('planets', 8, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);

    // vertexShader = planets3Vert;
    // computeShader = planets3Compute;
    // fragmentShader = planets3Frag;
    // const numParticles = 1024 * 4;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('planets', numParticles, 'Planet', 3);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = planetsblurVert;
    // computeShader = planetsblurCompute;
    // fragmentShader = planetsblurFrag;
    // const numParticles = 8;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('planets', numParticles, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);

    // vertexShader = planetsblur2Vert;
    // computeShader = planetsblur2Compute;
    // fragmentShader = planetsblur2Frag;
    // const numParticles = 8;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('planets', numParticles, 'Planet', 5);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);

    // vertexShader = reactiondiffusionVert;
    // computeShader = reactiondiffusionCompute;
    // fragmentShader = reactiondiffusionFrag;
    // const numPoints = 800*800;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('chemicals', numPoints, 'Chemical', 2);
    // webGPU.addStorage('chemicals2', numPoints, 'Chemical', 2);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = reactiondiffusion1Vert;
    // computeShader = reactiondiffusion1Compute;
    // fragmentShader = reactiondiffusion1Frag;
    // const numPoints = 800*800*2;
    // webGPU.addUniform('numPoints', numPoints);
    // webGPU.addStorage('chemicals', numPoints, 'Chemical', 2);
    // webGPU.addStorage('chemicals2', numPoints, 'Chemical', 2);
    // webGPU.addStorage('variables', 1, 'Variable', 2);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // //webGPU.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');
    // await webGPU.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../assets_ignore/sunset_800x800_20220604_173907.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../assets_ignore/tucan_jcvp_800x800.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../assets_ignore/pmw_800x800.jpg', ShaderType.COMPUTE);
    // // await webGPU.addTextureImage('image', './../img/carmen_lyra_2_800x800.jpg', ShaderType.COMPUTE);
    // //await webGPU.addTextureImage('image', './../assets_ignore/face_coeff.jpg', ShaderType.COMPUTE);

    // vertexShader = slimeVert;
    // computeShader = slimeCompute;
    // fragmentShader = slimeFrag;
    // const numParticles = 1024 * 2;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('particles', numParticles, 'Particle', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = slime2Vert;
    // computeShader = slime2Compute;
    // fragmentShader = slime2Frag;
    // const numParticles = 1024 * 2;
    // webGPU.addUniform('numParticles', numParticles)
    // webGPU.addStorage('particles', numParticles, 'Particle', 4);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = slime3Vert;
    // computeShader = slime3Compute;
    // fragmentShader = slime3Frag;
    // const numParticles = 1024 * 2;
    // webGPU.addUniform('numParticles', numParticles);
    // webGPU.addStorage('particles', numParticles, 'Particle', 4, ShaderType.COMPUTE);
    // webGPU.addStorage('variables', 1, 'Variable', 1);
    // ////webGPU.addStorage('layer0', 1, 'Color', 4);
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = blur1Vert;
    // computeShader = blur1Compute;
    // fragmentShader = blur1Frag;
    // webGPU.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = circleblurVert;
    // computeShader = circleblurCompute;
    // fragmentShader = circleblurFrag;
    // webGPU.addSampler('feedbackSampler');
    // webGPU.addTexture2d('feedbackTexture', true);
    // webGPU.addBindingTexture('outputTex', 'computeTexture');

    // vertexShader = demo6_textureVert;
    // computeShader = defaultCompute;
    // fragmentShader = demo6_textureFrag;

    const initialized = await webGPU.init(vertexShader, computeShader, fragmentShader);
    if (initialized) {
        await webGPU.createScreen(1, 1);
    }
    await update();
}

async function update() {
    stats.begin();
    utime += 0.016666666666666666;//1 / 60;
    epoch = new Date() / 1000;

    // code here

    webGPU.updateUniform('utime', utime);
    webGPU.updateUniform('epoch', epoch);
    webGPU.updateUniform('screenWidth', canvas.width);
    webGPU.updateUniform('screenHeight', canvas.height);
    webGPU.updateUniform('mouseX', mouseX);
    webGPU.updateUniform('mouseY', mouseY);
    webGPU.updateUniform('sliderA', sliders.a);
    webGPU.updateUniform('sliderB', sliders.b);
    webGPU.updateUniform('sliderC', sliders.c);


    // webGPU.updateUniform('randNumber', Math.random()); // random1
    // webGPU.updateUniform('randNumber2', Math.random()); // random1

    // webGPU.updateUniform('randNumber', Math.random()); // random2
    // webGPU.updateUniform('randNumber2', Math.random()); // random2
    // let data = [];
    // for (let k = 0; k < 800*800; k++) {
    //     data.push(Math.random());
    // }
    // webGPU.updateStorageMap('rands', data);// random2

    webGPU.update();

    //

    stats.end();

    capturer.capture(canvas);
    requestAnimationFrame(update);
}

init();

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
//
// var resizeViewport = function () {
//     let aspect = window.innerWidth / window.innerHeight;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// }

// window.addEventListener('resize', resizeViewport, false);

document.onmousemove = function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

const statsBtn = document.getElementById('statsBtn');
let statsVisible = (localStorage.getItem('stats-visible') === 'true') || false;
statsBtn.onclick = () => {
    console.log('---- statsBtn.onclick', statsVisible);
    statsVisible = !statsVisible;
    console.log('---- statsBtn.onclick', statsVisible);
    statsVisible && (stats.dom.style.display = 'block');
    !statsVisible && (stats.dom.style.display = 'none');
    localStorage.setItem('stats-visible', statsVisible)

};
statsVisible && (stats.dom.style.display = 'block');
!statsVisible && (stats.dom.style.display = 'none');