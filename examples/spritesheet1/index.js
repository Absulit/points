import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const spritesheet1 = {
    vert,
    compute,
    frag,
    init: async points => {
        let descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }
        points.addSampler('imageSampler', null, ShaderType.FRAGMENT);
        await points.addTextureImage('image', './../assets_ignore/inconsolata_regular_8x22.png', ShaderType.FRAGMENT);
    },
    update: points => {

    }
}

export default spritesheet1;