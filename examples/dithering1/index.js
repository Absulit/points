import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const dithering1 = {
    vert,
    compute,
    frag,
    init: async points => {
        points.addSampler('feedbackSampler', null);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
    },
    update: points => {

    }
}

export default dithering1;