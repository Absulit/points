import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';

const options = {
    squareSize: .180,
    squareFeather: .302,
    lineWidth: .236,
}

const shapes1 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 128, 1, 1)
    ],
    init: async (points, folder) => {
        const numPoints = 128;
        points.addUniform('numPoints', numPoints);
        points.addStorage('points', `array<vec2<f32>, ${numPoints}>`);

        points.addUniform('squareSize', options.squareSize, 'f32');
        points.addUniform('squareFeather', options.squareFeather, 'f32');
        points.addUniform('lineWidth', options.lineWidth, 'f32');

        folder.add(options, 'squareSize', 0, 1, .0001).name('Square Size');
        folder.add(options, 'squareFeather', 0, 1, .0001).name('Square Feather');
        folder.add(options, 'lineWidth', 0, 1, .0001).name('Line Width');
        folder.open();
    },
    update: points => {
        points.updateUniform('squareSize', options.squareSize);
        points.updateUniform('squareFeather', options.squareFeather);
        points.updateUniform('lineWidth', options.lineWidth);
    }
}

export default shapes1;