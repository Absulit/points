import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    maxLife: 100,
    turbulenceScale: 100,
    useVideo: true,
    particleSize: 30,
    limit: .5,
}

const WORKGROUP_X = 256;
const WORKGROUP_Y = 1;

const THREADS_X = 256;
const THREADS_Y = 1;

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * THREADS_X * THREADS_Y;
console.log(NUMPARTICLES);


const instancedParticlesRenderPass = new RenderPass(vert, frag1, compute0, WORKGROUP_X, WORKGROUP_Y, 1)
instancedParticlesRenderPass.instanceCount = NUMPARTICLES;

const base = {
    renderPasses: [
        instancedParticlesRenderPass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.depthWriteEnabled = false;
        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setStorage(
            'particles',
            `array<Particle, ${NUMPARTICLES}>`,
            false,
            GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE
        );

        points.setSampler('imageSampler', null);
        // await points.setTextureImage('image', './../img/webgpu_800x800.png');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        // await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        // await points.setTextureVideo('video', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');
        // await points.setTextureVideo('video', './../img/3641672-hd_1920_1080_24fps_800x800.mp4');
        // await points.setTextureVideo('video', './../img/8056464-hd_1080_1920_30fps_800x800.mp4');
        // await points.setTextureVideo('video', './../img/pexels-shubh-haque-4746616-960x540-30fps.mp4');
        await points.setTextureVideo('video', './../assets_ignore/VID_20250920_145526.mp4.mp4');


        points.setUniform('maxLife', options.maxLife);
        folder.add(options, 'maxLife', 1, 600, .0001).name('maxLife');

        points.setUniform('turbulenceScale', options.turbulenceScale);
        folder.add(options, 'turbulenceScale', 10, 1024, .0001).name('turbulenceScale');

        points.setUniform('useVideo', false);
        folder.add(options, 'useVideo').name('useVideo');

        points.setUniform('particleSize', options.particleSize);
        folder.add(options, 'particleSize', 1, 60, .0001).name('particleSize');

        points.setUniform('limit', options.limit);
        folder.add(options, 'limit', 0, 1, .0001).name('limit');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('useVideo', options.useVideo);
        points.setUniform('maxLife', options.maxLife);
        points.setUniform('turbulenceScale', options.turbulenceScale);
        points.setUniform('particleSize', options.particleSize);
        points.setUniform('limit', options.limit);
    }
}

export default base;