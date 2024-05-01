import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import ShaderType from 'shadertype';

const options = {
    scale: 1,
}


const dithering3 = {
    vert,
    compute,
    frag,
    init: async (points, folder) => {
        let descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }
        points.addSampler('imageSampler', descriptor);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        // await points.addTextureWebcam('image');
        // await points.addTextureImage('image', './../img/angel_600x600.jpg');
        // await points.addTextureImage('image', './../img/gratia_800x800.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
        points.addBindingTexture('outputTex', 'computeTexture');
        points.addLayers(2);
        points.addStorage('variables', 'Variable', false, ShaderType.COMPUTE);

        points.addUniform('scale', options.scale);

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', options.scale);
    }
}

export default dithering3;