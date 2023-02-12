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
        points.addSampler('imageSampler', descriptor, ShaderType.FRAGMENT);
        await points.addTextureImage('image', './../assets_ignore/inconsolata_regular_8x22.png', ShaderType.FRAGMENT);
        /**
         * sprite sheet animation created by Nelson Yiap
         * https://opengameart.org/users/nelson-yiap
         */
        await points.addTextureImage('bobbles', './../assets_ignore/fishing_bobbles_nelson-yiap_24x24.png', ShaderType.FRAGMENT);
        /**
         * penguin sprite by tamashihoshi
         * https://opengameart.org/users/tamashihoshi
         */
        await points.addTextureImage('penguin', './../assets_ignore/lr_penguin2_tamashihoshi_32x32.png', ShaderType.FRAGMENT);
    },
    update: points => {

    }
}

export default spritesheet1;