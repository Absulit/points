import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const spritesheet1 = {
    vert,
    compute,
    frag,
    init: async (points) => {
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
        //await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
        //await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.FRAGMENT);
        // await points.addTextureImage('image', './../img/sprite_nums_640x640.png', ShaderType.FRAGMENT);
        // await points.addTextureImage('image', './../assets_ignore/pixelspritefont 32_green.png', ShaderType.FRAGMENT);
        // await points.addTextureImage('image', './../assets_ignore/pixeldroid_botic_64x64.png', ShaderType.FRAGMENT);
        await points.addTextureImage('image', './../assets_ignore/inconsolata_regular_8x22.png', ShaderType.FRAGMENT);
    },
    update: (points) => {

    }
}

export default spritesheet1;