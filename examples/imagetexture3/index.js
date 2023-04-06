import vert from './vert.js';
import frag from './frag.js';
const imagetexture3 = {
    vert,
    frag,
    init: async points => {
        points.addSampler('feedbackSampler', null);
        // await points.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
    },
    update: points => {

    }
}

export default imagetexture3;