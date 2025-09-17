import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    maxLife: 34,
    turbulenceScale: 100,
    useVideo: false,
}

const WORKGROUP_X = 1024;
const WORKGROUP_Y = 1;

const THREADS = 1;

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * THREADS;

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
        points.setConstant('THREADS', THREADS, 'u32');
        points.setStorage(
            'particles',
            `array<Particle, ${NUMPARTICLES}>`,
            false,
            GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE
        );

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/webgpu_800x800.png');
        // await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        await points.setTextureVideo('video', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');


        points.setUniform('maxLife', options.maxLife);
        folder.add(options, 'maxLife', 1, 600, .0001).name('maxLife');

        points.setUniform('turbulenceScale', options.turbulenceScale);
        folder.add(options, 'turbulenceScale', 10, 1024, .0001).name('turbulenceScale');

        points.setUniform('useVideo', false);
        folder.add(options, 'useVideo').name('useVideo');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('useVideo', options.useVideo);
        points.setUniform('maxLife', options.maxLife);
        points.setUniform('turbulenceScale', options.turbulenceScale);
    }
}

export default base;