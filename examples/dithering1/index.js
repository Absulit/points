import vert from './vert.js';
import frag from './frag.js';
const dithering1 = {
    vert,
    frag,
    init: async points => {
        let descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }
        points.addSampler('feedbackSampler', descriptor);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
    },
    update: points => {

    }
}

export default dithering1;