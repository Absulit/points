import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const layers1 = {
    vert,
    compute,
    frag,
    init: async points => {
        const numPoints = 800*800;
        points.setUniform('numPoints', numPoints);
        // points.setStorage('points', numPoints, `array<vec4f, ${numPoints}>`, 4);
        points.setLayers(2);
    },
    update: points => {

    }
}

export default layers1;