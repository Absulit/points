import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }

        const size = { x: 8, y: 22 };

        points.setSampler('imageSampler', descriptor);
        await points.setTextureString(
            'textImg',
            'Custom Text',
            './../img/inconsolata_regular_8x22.png',
            size,
            -32
        );

    },
    update: points => {
    }
}

export default base;