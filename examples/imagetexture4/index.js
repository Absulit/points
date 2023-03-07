import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const imagetexture4 = {
    vert,
    compute,
    frag,
    init: async points => {
        /**
         * @type {GPUObjectDescriptorBase}
         */
        let descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }

        points.addSampler('feedbackSampler', descriptor, ShaderType.FRAGMENT);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
        await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
        // await points.addTextureImage('image', './../img/absulit_800x800.jpg', ShaderType.FRAGMENT);
    },
    update: points => {

    }
}

export default imagetexture4;