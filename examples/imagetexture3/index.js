import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const imagetexture3 = {
    vert,
    compute,
    frag,
    init: async points => {
        points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
        // await points.addTextureImage('oldking', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
        await points.addTextureImage('image', './../img/absulit_800x800.jpg', ShaderType.FRAGMENT);
    },
    update: points => {

    }
}

export default imagetexture3;