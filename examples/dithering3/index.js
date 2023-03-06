import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const dithering3 = {
    vert,
    compute,
    frag,
    init: async (points) => {
        points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg', ShaderType.FRAGMENT);
        await points.addTextureImage('image', './../img/old_king_600x600.jpg', ShaderType.COMPUTE);
        // await points.addTextureImage('image', './../assets_ignore/absulit_800x800.jpg', ShaderType.COMPUTE);
        // await points.addTextureVideo('image', './../assets_ignore/Black and White Clouds - Time lapse (480p_30fps_H264-128kbit_AAC).mp4', ShaderType.COMPUTE);
        // await points.addTextureVideo('image', './../assets_ignore/weird_4_2_noaudio.mp4', ShaderType.COMPUTE);
        // await points.addTextureVideo('image', './../assets_ignore/VID_57840514_190415.mp4', ShaderType.COMPUTE);
        // await points.addTextureWebcam('image', ShaderType.COMPUTE);
        // await points.addTextureImage('image', './../img/angel_600x600.jpg', ShaderType.COMPUTE);
        points.addBindingTexture('outputTex', 'computeTexture');
        points.addLayers(2, ShaderType.COMPUTE);
        points.addStorage('variables', 1, 'Variable', 2, ShaderType.COMPUTE);
    },
    update: (points) => {

    }
}

export default dithering3;