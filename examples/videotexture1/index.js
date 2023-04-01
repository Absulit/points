import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const videotexture1 = {
    vert,
    compute,
    frag,
    init: async points => {
        points.addSampler('feedbackSampler', null);
        // await points.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg');
        await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        // await points.addTextureImage('image', './../img/absulit_800x800.jpg');
        await points.addTextureVideo('video', './../img/61c6eeaf-87cf5e18.mp4')
        points.addBindingTexture('outputTex', 'computeTexture');

    },
    update: points => {

    }
}

export default videotexture1;