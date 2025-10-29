import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';
import { isMobile } from 'utils';

const options = {
    maxLife: 100,
    turbulenceScale: 100,
    particleSize: 2,
    mode: 0
}

options.isMobile = isMobile();

let WORKGROUP_X = 256;
let WORKGROUP_Y = 1;
let WORKGROUP_Z = 1;

let THREADS_X = 256;
let THREADS_Y = 1;
let THREADS_Z = 1;

if(options.isMobile){
    WORKGROUP_X = 8;
    WORKGROUP_Y = 4;
    WORKGROUP_Z = 2;

    THREADS_X = 4;
    THREADS_Y = 4;
    THREADS_Z = 2;
}

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log(NUMPARTICLES);


const instancedParticlesRenderPass = new RenderPass(vert, frag1, compute0, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z)
instancedParticlesRenderPass.depthWriteEnabled = false;
instancedParticlesRenderPass.addPlane('plane', { x: 0, y: 0 }, { width: 2, height: 2 }).instanceCount = NUMPARTICLES;

// const aspect = canvas.width / canvas.height; // alternative to aspect in shader
const left = -1;
const right = 1;
const bottom = -1;
const top = 1;
const near = -1;   // include z = 0
const far = 1;

const lr = 1 / (right - left);
const bt = 1 / (top - bottom);
const nf = 1 / (near - far);

const orthoMatrix = [
    2 * lr, 0,       0,        0,
    0,      2 * bt,  0,        0,
    0,      0,       2 * nf,   0,
   -(right + left) * lr,
   -(top + bottom) * bt,
   (far + near) * nf,
    1
];

const base = {
    renderPasses: [
        instancedParticlesRenderPass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        await points.setTextureWebcam('webcam');

        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('WORKGROUP_X', WORKGROUP_X, 'u32');
        points.setConstant('WORKGROUP_Y', WORKGROUP_Y, 'u32');
        points.setConstant('WORKGROUP_Z', WORKGROUP_Z, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setConstant('THREADS_Z', THREADS_Z, 'u32');
        points.setStorage(
            'particles',
            `array<Particle, ${NUMPARTICLES}>`,
            false,
            GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE
        );

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        await points.setTextureVideo('video', './../img/8056464-hd_1080_1920_30fps_800x800.mp4');

        points.setUniform('projection', orthoMatrix, 'mat4x4<f32>');

        points.setUniform('maxLife', options.maxLife);
        folder.add(options, 'maxLife', 1, 600, .0001).name('maxLife');

        points.setUniform('turbulenceScale', options.turbulenceScale);
        folder.add(options, 'turbulenceScale', 10, 1024, .0001).name('turbulenceScale');

        points.setUniform('particleSize', options.particleSize);
        folder.add(options, 'particleSize', 1, 10, .0001).name('particleSize');


        const dropdownItems = { 'Video': 0, 'Webcam': 1, 'Image': 2 };
        points.setUniform('texture_mode', options.mode);
        folder.add(options, 'mode', dropdownItems).name('Textures').onChange(async value => {
            console.log(value);
            points.setUniform('texture_mode', value);
        });



        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('maxLife', options.maxLife);
        points.setUniform('turbulenceScale', options.turbulenceScale);
        points.setUniform('particleSize', options.particleSize);
        points.setUniform('texture_mode', options.mode);
    }
}

export default base;