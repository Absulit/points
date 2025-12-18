import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { RenderPass } from 'points';

const options = {
    squareSize: .103,
    squareFeather: .009,
    lineWidth: .092,
}

const shapes1 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 128, 1, 1)
    ],
    init: async (points, folder) => {
        const numPoints = 128;
        points.setUniform('numPoints', numPoints);
        points.setStorage('points', `array<vec2f, ${numPoints}>`);

        points.setUniform('squareSize', options.squareSize, 'f32');
        points.setUniform('squareFeather', options.squareFeather, 'f32');
        points.setUniform('lineWidth', options.lineWidth, 'f32');

        folder.add(options, 'squareSize', 0, 1, .0001).name('Square Size');
        folder.add(options, 'squareFeather', 0, 1, .0001).name('Square Feather');
        folder.add(options, 'lineWidth', 0, 1, .0001).name('Line Width');
        folder.open();
    },
    update: points => {
        points.setUniform('squareSize', options.squareSize);
        points.setUniform('squareFeather', options.squareFeather);
        points.setUniform('lineWidth', options.lineWidth);
    }
}

export default shapes1;