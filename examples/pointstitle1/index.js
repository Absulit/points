import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';

const pointstitle1 = {
    vert,
    compute,
    frag,
    init: async points => {

        await points.addTextureImage(
            'image',
            './../../img/gratia_800x800.jpg',
            ShaderType.FRAGMENT
        );
        await points.addTextureImage('font', './../img/inconsolata_regular_8x22.png', ShaderType.FRAGMENT);

        let descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }
        points.addSampler('imageSampler', null, ShaderType.FRAGMENT);

    },
    update: points => {

    }
}

export default pointstitle1;