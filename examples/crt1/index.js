import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass, RenderPasses } from 'points';

const options = {
}

const r0 = new RenderPass(vert, frag, compute);

const base = {
    renderPasses: [
        r0,
        // RenderPasses.CRT,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        points.setSampler('imageSampler', null);
        await points.setTextureVideo(
            'video',
            './../img/6903977-hd_1920_1080_25fps_800x800.mp4'
        );

        points.addRenderPass(RenderPasses.CRT, {scale: .6, displacement: .005});
        points.addRenderPass(RenderPasses.LENS_DISTORTION, {amount: .7, distance: .005});
    },
    /**
     * @param {Points} points
     */
    update: points => {
    }
}

export default base;
