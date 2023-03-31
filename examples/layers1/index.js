import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const layers1 = {
    vert,
    compute,
    frag,
    init: async points => {
        const numPoints = 800*800;
        points.addUniform('numPoints', numPoints);
        // points.addStorage('points', numPoints, 'vec4<f32>', 4);
        points.addLayers(2, ShaderType.COMPUTE);
    },
    update: points => {

    }
}

export default layers1;