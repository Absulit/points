import vert from './vert.js';
import frag from './frag.js';

const mouseclickscroll1 = {
    vert,
    frag,
    init: async points => {
        points.setStorage('variables', 'Variable', false, GPUShaderStage.FRAGMENT);

        const size = { x: 8, y: 22 };
        await points.setTextureString(
            'cta',
            'Click and scroll',
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

export default mouseclickscroll1;
