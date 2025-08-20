import vert from './vert.js';
import compute from './pass0/compute.js';
import frag from './pass0/frag.js';

import compute1 from './pass1/compute.js';
import frag1 from './pass1/frag.js';
import Points, { RenderPass, ShaderType } from 'points';

const options = {
    scale: 1,
    quantError: 1,
}

const dithering3 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800),
        new RenderPass(vert, frag1, compute1, 800, 800),
    ],
    /**
     * @param {Points} points
     * @param {*} folder
     */
    init: async (points, folder) => {
        let descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }
        points.setSampler('imageSampler', descriptor);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_800x00.jpg');
        // await points.setTextureWebcam('image');
        // await points.setTextureImage('image', './../img/angel_600x600.jpg');
        // await points.setTextureImage('image', './../img/gratia_800x800.jpg');
        // await points.setTextureVideo('image', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setBindingTexture('brightnessWrite', 'brightnessRead', 0,1);
        points.setBindingTexture('quantErrorWrite', 'quantErrorRead', 0,1);
        points.setBindingTexture('finalWrite', 'finalRead');
        // points.setLayers(2);
        // points.setStorage('variables', 'Variable', false, ShaderType.COMPUTE);

        points.setUniform('scale', options.scale);
        points.setUniform('quantError', options.quantError);

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.add(options, 'quantError', -1, 1, .0001).name('quantError');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
        points.setUniform('quantError', options.quantError);
    }
}

export default dithering3;