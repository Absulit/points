import vert from './vert.js';
import frag from './frag.js';

const options = {
    scale0: .291,
    scale1: .018,
    scale2: .059,
}

const noise1 = {
    vert,
    frag,
    init: async (points, folder) => {
        const numPoints = 800*800;
        points.addUniform('value_noise_data_length', numPoints);
        points.addStorage('value_noise_data', `array<f32, ${numPoints}>`);
        points.addStorage('variables', 'Variable');

        points.addUniform('scale0', options.scale0, 'f32');
        points.addUniform('scale1', options.scale1, 'f32');
        points.addUniform('scale2', options.scale2, 'f32');

        folder.add(options, 'scale0', 0, 1, .0001).name('Scale 0');
        folder.add(options, 'scale1', 0, 1, .0001).name('Scale 1');
        folder.add(options, 'scale2', 0, 1, .0001).name('Scale 2');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale0', options.scale0);
        points.updateUniform('scale1', options.scale1);
        points.updateUniform('scale2', options.scale2);
    }
}

export default noise1;