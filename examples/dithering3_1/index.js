import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const dithering3 = {
    vert,
    compute,
    frag,
    init: async points => {
        points.addSampler('imageSampler', null);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        // await points.addTextureWebcam('image');
        // await points.addTextureImage('image', './../img/angel_600x600.jpg');
        // await points.addTextureImage('image', './../img/gratia_800x800.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
        points.addBindingTexture('outputTex', 'computeTexture');
        points.addLayers(2);
        points.addStorage('variables', 1, 'Variable', 1, false, ShaderType.COMPUTE);
    },
    update: points => {

    }
}

export default dithering3;