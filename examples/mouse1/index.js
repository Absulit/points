import vert from './vert.js';
import frag from './frag.js';
const mouse1 = {
    vert,
    frag,
    init: async points => {
        const size = { x: 8, y: 22 };
        await points.setTextureString(
            'cta',
            'Move your mouse',
            './../img/inconsolata_regular_8x22.png',
            size,
            -32
        );

        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }

        points.setSampler('imageSampler', descriptor);
    },
    update: points => {

    }
}

export default mouse1;