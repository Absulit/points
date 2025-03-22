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
        points.setSampler('imageSampler', descriptor);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        // await points.addTextureWebcam('image');
        // await points.setTextureImage('image', './../img/angel_600x600.jpg');
        // await points.setTextureImage('image', './../img/gratia_800x800.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setBindingTexture('outputTex', 'computeTexture');
        points.addLayers(2);
        points.setStorage('variables', 'Variable', false, ShaderType.COMPUTE);

        points.setUniform('scale', options.scale);

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
    }
}

export default dithering3;