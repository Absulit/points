import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from './../../src/absulit.points.module.js';
const noisecircle1 = {
    vert,
    compute,
    frag,
    init: async points => {
        const numPoints = 128;
        points.addUniform('numPoints', numPoints);
        points.addStorage('points', numPoints, 'vec2<f32>', 2, ShaderType.COMPUTE);
    },
    update: points => {

    }
}

export default noisecircle1;