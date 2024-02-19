import vert from './vert.js';
import frag from './frag.js';

const options = {
    scale: 1,
}

const imagetexture3 = {
    vert,
    frag,
    init: async (points, folder) => {
        points.addSampler('feedbackSampler', null);
        // await points.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');

        points.addUniform('scale', options.scale, 'f32');


        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', options.scale);
    }
}

export default imagetexture3;