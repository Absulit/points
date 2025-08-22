import vert from './vert.js';
import frag from './frag.js';

const options = {
    scale: 1,
    color0: [255, 0, 0],
    color1: [255, 255, 0],
}

const imagetexture2 = {
    vert,
    frag,
    init: async (points, folder) => {
        points.setSampler('feedbackSampler', null);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');

        points.setUniform('color0', options.color0, 'vec3f');
        points.setUniform('color1', options.color1, 'vec3f');
        points.setUniform('scale', options.scale, 'f32');

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.addColor(options, 'color0');
        folder.addColor(options, 'color1');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
        points.setUniform('color0', options.color0);
        points.setUniform('color1', options.color1);
    }
}

export default imagetexture2;
