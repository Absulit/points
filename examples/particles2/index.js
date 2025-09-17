import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    maxLife: 34,
    turbulenceScale: 100,
    useVideo: false,
}

const base = {
    renderPasses: [
        new RenderPass(vert, frag1, compute0, 8, 8, 1),
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.depthWriteEnabled = false;
        points.setConstant('NUMPARTICLES', 1024, 'u32');
        points.setStorage(
            'particles',
            `array<Particle, 1024>`,
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