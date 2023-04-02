import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
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
        points.addSampler('imageSampler', descriptor);
        await points.addTextureImage('image', './../img/inconsolata_regular_8x22.png');
        /**
         * sprite sheet animation created by Nelson Yiap
         * https://opengameart.org/users/nelson-yiap
         */
        await points.addTextureImage('bobbles', './../img/fishing_bobbles_nelson-yiap_24x24.png');
        /**
         * penguin sprite by tamashihoshi
         * https://opengameart.org/users/tamashihoshi
         */
        await points.addTextureImage('penguin', './../img/lr_penguin2_tamashihoshi_32x32.png');
    },
    update: points => {

    }
}

export default spritesheet1;