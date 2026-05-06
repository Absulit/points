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
        const { uniforms } = points;
        uniforms.scale0 = options.scale0;
        uniforms.scale1 = options.scale1;
        uniforms.scale2 = options.scale2;

        folder.add(options, 'scale0', 0, 1, .0001).name('Scale 0');
        folder.add(options, 'scale1', 0, 1, .0001).name('Scale 1');
        folder.add(options, 'scale2', 0, 1, .0001).name('Scale 2');
        folder.open();
    },
    update: points => {
        const { uniforms } = points;
        uniforms.scale0 = options.scale0;
        uniforms.scale1 = options.scale1;
        uniforms.scale2 = options.scale2;
    }
}

export default noise1;