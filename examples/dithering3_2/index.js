import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from './../../src/RenderPass.js';
import ShaderType from './../../src/ShaderType.js';
const dithering3 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
    init: async points => {
        let descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }
        points.addSampler('imageSampler', descriptor);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_800x00.jpg');
        // await points.addTextureWebcam('image');
        // await points.addTextureImage('image', './../img/angel_600x600.jpg');
        // await points.addTextureImage('image', './../img/gratia_800x800.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
        points.addBindingTexture('outputTex', 'computeTexture');
        points.addLayers(2);
        points.addStorage('variables', 'Variable', false, ShaderType.COMPUTE);
    },
    update: points => {

    }
}

export default dithering3;