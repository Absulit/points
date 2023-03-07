import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const noise1 = {
    vert,
    compute,
    frag,
    init: async points => {
        const numPoints = 800*800;
        points.addUniform('value_noise_data_length', numPoints);
        points.addStorage('value_noise_data', numPoints, 'f32', 1, ShaderType.COMPUTE);
        points.addStorage('variables', 1, 'Variable', 1, ShaderType.COMPUTE);
    },
    update: points => {

    }
}

export default noise1;