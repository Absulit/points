import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';

import grayscaleFragment from './grayscale_renderpass/frag.js';
import lbp_renderpass from './lpb_renderpass/index.js';
import histogram_renderpass from './histogram_renderpass/index.js';


const options = {
    val: 0,
    bool: false,
}

const base = {
    renderPasses: [
        new RenderPass(vert, grayscaleFragment, null),
        lbp_renderpass,
        histogram_renderpass,
        new RenderPass(vert, frag, compute),
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        // Add elements to dat gui
        // create an uniform and get value from options
        points.setUniform('val', options.val);

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'val', -1, 1, .0001).name('Val');
        folder.add(options, 'bool').name('Bool');

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/pexels-ketut-subiyanto-4350315.jpg');

        points.setTexture2d('grayscalePassTexture', true, null, 0); // avail this texture to next render passes
        points.setBindingTexture('lpbWriteTexture', 'lpbReadTexture', 1, 2); // from lbp to histogram
        points.setBindingTexture('histogramWriteTexture', 'histogramReadTexture', 2, base.renderPasses.length-1); // from histogram to final


        const bucketWidth = 8;
        const numBuckets = bucketWidth * bucketWidth;
        points.setConstant('BUCKETWIDTH', bucketWidth, 'u32');
        points.setConstant('NUMBUCKETS', numBuckets, 'u32');
        points.setStorage('buckets', `array<f32, ${numBuckets}>`);

        points.addEventListener('log', data => {
            console.log(data[0]);
        });

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('val', options.val);
    }
}

export default base;