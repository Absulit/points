import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';
import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';
import Points, { LoadOp, RenderPass, ScaleMode } from 'points';

const options = {
    scaleX: 1,
    scaleY: 1,
}

const r0 = new RenderPass(vert0, frag0);
const r1 = new RenderPass(vert1, frag1);
r1.loadOp = LoadOp.LOAD;
r1.setPlane('mesh', { x: 0, y: 0, z: 0 }, { width: 1, height: 1, depth: 1 });

const base = {
    renderPasses: [
        r0,
        r1
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        points.scaleMode = ScaleMode.COVER;

        points.setSampler('imageSampler', null);
        await points.setTextureImage('bgTexture', './../img/angel_600x600.jpg');
        await points.setTextureImage('meshTexture', './../img/house_512x512.jpg');

        points.setCameraPerspective('camera', [0, 0, 5], [0, 0, 0])

        uniforms.scale.setType('vec3f').setValue([options.scaleX, options.scaleY, 1]);

        folder.add(options, 'scaleX', 0, 2, .0001).name('scaleX');
        folder.add(options, 'scaleY', 0, 2, .0001).name('scaleY');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { uniforms } = points;
        uniforms.scale.setValue([options.scaleX, options.scaleY, 1]);
        points.setCameraPerspective('camera', [0, 0, 5], [0, 0, 0]);
    }
}

export default base;