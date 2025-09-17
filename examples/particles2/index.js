import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    maxLife: 34,
    turbulenceScale: 100,
    useVideo: false,
}

const NUMPARTICLES = 1024;

const instancedParticlesRenderPass = new RenderPass(vert, frag1, compute0, 4, 1, 1)
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
        points.setStorage(
            'particles',
            `array<Particle, ${NUMPARTICLES}>`,
            false,
            GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE
        );

    },
    /**
     * @param {Points} points
     */
    update: points => {
    }
}

export default base;