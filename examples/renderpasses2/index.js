import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import { RenderPass, RenderPasses } from '../../src/absulit.points.module.js';
import yellow from '../../src/core/RenderPasses/yellow/index.js';


const renderpasses1 = {
    /**
     * Render Passes expect to have an order
     */
    renderPasses: [
        new RenderPass(vert1, frag1),
        // new RenderPass(yellow.vertexShader, yellow.fragmentShader),
    ],
    init: async points => {
        // await yellow.init(points, {blendAmount: .5});
        points.addSampler('imageSampler', null);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
        points.addSampler('feedbackSampler');
        points.addTexture2d('feedbackTexture', true);



        await points.addPostRenderPass(RenderPasses.YELLOW, {blendAmount: .5});
        await points.addPostRenderPass(RenderPasses.GRAYSCALE);


    },
    update: points => {

    }
}

export default renderpasses1;