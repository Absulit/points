import vert from './vert.js';
import frag from './frag.js';

const layers1 = {
    vert,
    frag,
    init: async points => {
        const { uniforms } = points;
        const numPoints = 800*800;
        uniforms.numPoints = numPoints;
        // points.setStorage('points', numPoints, `array<vec4f, ${numPoints}>`, 4);
        points.setLayers(2);
    },
    update: points => {

    }
}

export default layers1;