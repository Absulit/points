import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';
import ShaderType from 'shadertype';

const options = {
    scale: 1,
    quantError: 1,
}

const dithering3 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
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
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setBindingTexture('outputTex', 'computeTexture');
        points.setLayers(2);
        points.setStorage('variables', 'Variable', false, ShaderType.COMPUTE);

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