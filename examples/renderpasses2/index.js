import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import RenderPass from 'renderpass';
import RenderPasses from 'renderpasses';

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


        RenderPasses.grayscale(points);
        RenderPasses.chromaticAberration(points, .02);
        RenderPasses.color(points, .5, 1, 0, 1, .5);
        RenderPasses.pixelate(points, 10, 10);
        RenderPasses.lensDistortion(points, .4, .01);
        RenderPasses.filmgrain(points);
        RenderPasses.bloom(points, .5);
        RenderPasses.blur(points, 100, 100, .4, 0, 0.0);
        RenderPasses.waves(points, .05, .03);

    },
    update: points => {

    }
}

export default renderpasses1;