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
        points.addSampler('feedbackSampler', null);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');

        // TODO: error if scale is placed before the colors
        points.addUniform('color0', options.color0, 'vec3f');
        points.addUniform('color1', options.color1, 'vec3f');
        points.addUniform('scale', options.scale, 'f32');


        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.addColor(options, 'color0');
        folder.addColor(options, 'color1');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', options.scale);
        points.updateUniform('color0', options.color0);
        points.updateUniform('color1', options.color1);
    }
}

export default imagetexture2;