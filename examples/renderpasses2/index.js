import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import { RenderPass } from '../../src/absulit.points.module.js';
import { RenderPasses } from "../../src/RenderPasses.js";

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
        RenderPasses.chromaticAberration(points, { distance: .02 });
        RenderPasses.color(points, { color: [.5, 1, 0, 1], blendAmount: .5 });
        RenderPasses.pixelate(points, { pixelsWidth: 10, pixelsHeight: 10 });
        RenderPasses.lensDistortion(points, { amount: .4, distance: .01 });
        RenderPasses.filmgrain(points, { amount: .4, distance: .01 });
        RenderPasses.bloom(points, { amount: .5 });
        RenderPasses.blur(points, { resolution: [100, 100], direction: [.4, 0], radians: 0.0 });
        RenderPasses.waves(points, { scale: .05, intensity: .03 });

    },
    update: points => {

    }
}

export default renderpasses1;