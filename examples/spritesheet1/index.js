import vert from './vert.js';
import frag from './frag.js';
const spritesheet1 = {
    vert,
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
        points.setSampler('imageSampler', descriptor);
        await points.setTextureImage('image', './../img/inconsolata_regular_8x22.png');
        /**
         * sprite sheet animation created by Nelson Yiap
         * https://opengameart.org/users/nelson-yiap
         */
        await points.setTextureImage('bobbles', './../img/fishing_bobbles_nelson-yiap_24x24.png');
        /**
         * penguin sprite by tamashihoshi
         * https://opengameart.org/users/tamashihoshi
         */
        await points.setTextureImage('penguin', './../img/lr_penguin2_tamashihoshi_32x32.png');
    },
    update: points => {

    }
}

export default spritesheet1;