import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';
import { isMobile } from 'utils';
import { structs } from './structs.js';

const options = {
    maxLife: 100,
    turbulenceScale: 100,
    useVideo: false,
    particleSize: 30,
}

options.isMobile = isMobile();

let WORKGROUP_X = 256;
let WORKGROUP_Y = 1;
let WORKGROUP_Z = 1;

let THREADS_X = 256;
let THREADS_Y = 1;
let THREADS_Z = 1;

if (options.isMobile) {
    WORKGROUP_X = 8;
    WORKGROUP_Y = 4;
    WORKGROUP_Z = 2;

    THREADS_X = 4;
    THREADS_Y = 4;
    THREADS_Z = 2;

    options.particleSize = 60;
}

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log(NUMPARTICLES);


const instancedParticlesRenderPass = new RenderPass(vert, frag1, compute0, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z)
instancedParticlesRenderPass.depthWriteEnabled = false;
instancedParticlesRenderPass.setPlane('plane', { x: 0, y: 0, z: 0 }, { width: 2, height: 2 }).instanceCount = NUMPARTICLES;


const base = {
    renderPasses: [
        instancedParticlesRenderPass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages } = points;
        const { VERTEX, COMPUTE } = GPUShaderStage;
        points.import(structs);

        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('WORKGROUP_X', WORKGROUP_X, 'u32');
        points.setConstant('WORKGROUP_Y', WORKGROUP_Y, 'u32');
        points.setConstant('WORKGROUP_Z', WORKGROUP_Z, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setConstant('THREADS_Z', THREADS_Z, 'u32');

        storages.particles
            .setType(`array<Particle, ${NUMPARTICLES}>`)
            .setShaderStage(VERTEX | COMPUTE);

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/webgpu_800x800.png');
        // await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        // await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        // await points.setTextureVideo('video', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');
        await points.setTextureVideo('video', './../img/3641672-hd_1920_1080_24fps_800x800.mp4');
        // await points.setTextureVideo('video', './../img/8056464-hd_1080_1920_30fps_800x800.mp4');
        // await points.setTextureVideo('video', './../img/pexels-shubh-haque-4746616-960x540-30fps.mp4');

        points.setCameraOrthographic('camera');

        uniforms.maxLife = options.maxLife;
        folder.add(options, 'maxLife', 1, 600, .0001).name('maxLife');

        uniforms.turbulenceScale = options.turbulenceScale;
        folder.add(options, 'turbulenceScale', 10, 1024, .0001).name('turbulenceScale');

        uniforms.useVideo = false;
        folder.add(options, 'useVideo').name('useVideo');

        uniforms.particleSize = options.particleSize;
        folder.add(options, 'particleSize', 1, 60, .0001).name('particleSize');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { uniforms } = points;
        uniforms.useVideo = options.useVideo;
        uniforms.maxLife = options.maxLife;
        uniforms.turbulenceScale = options.turbulenceScale;
        uniforms.particleSize = options.particleSize;
    }
}

export default base;