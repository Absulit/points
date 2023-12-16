import vert from './vert.js';
import frag from './frag.js';
const noise1 = {
    vert,
    frag,
    init: async points => {
        const numPoints = 800*800;
        points.addUniform('value_noise_data_length', numPoints);
        points.addStorage('value_noise_data', `array<f32, ${numPoints}>`);
        points.addStorage('variables', 'Variable');
    },
    update: points => {

    }
}

export default noise1;