import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass, ScaleMode } from 'points';

const options = {
    squareSize: .103,
    squareFeather: .009,
    lineWidth: .092,
}

const shapes1 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 128, 1, 1)
    ],
    /**
     *
     * @param {Points} points
     * @param {*} folder
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        points.scaleMode = ScaleMode.FIT;
        const numPoints = 128;
        uniforms.numPoints = numPoints;
        points.setStorage('points', `array<vec2f, ${numPoints}>`);

        uniforms.squareSize = options.squareSize;
        uniforms.squareFeather = options.squareFeather;
        uniforms.lineWidth = options.lineWidth;

        folder.add(options, 'squareSize', 0, 1, .0001).name('Square Size');
        folder.add(options, 'squareFeather', 0, 1, .0001).name('Square Feather');
        folder.add(options, 'lineWidth', 0, 1, .0001).name('Line Width');
        folder.open();
    },
    update: points => {
        const { uniforms } = points;
        uniforms.squareSize = options.squareSize;
        uniforms.squareFeather = options.squareFeather;
        uniforms.lineWidth = options.lineWidth;
    }
}

export default shapes1;