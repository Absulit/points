import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { CullMode, RenderPass } from 'points';

const options = {
    val: 0,
    bool: false,
}

const r0 = new RenderPass(vert, frag, compute);
r0.depthWriteEnabled = true;
// r0.cullMode = CullMode.NONE;
r0.addCube('cube0');
r0.addCube('cube1', { x: 0, y: 1.1, z: 0 });
r0.addPlane('plane0', { x: 0, y: 0, z: 0 }, { width: 2, height: 2 })

let camera = {
    position: [0, 0, 5],
    lookAt: [0, 0, 0]
}

let time = 0;

const base = {
    renderPasses: [
        r0
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        points.setCameraPerspective('camera0', camera.position, camera.lookAt);

        points.setUniform('val', options.val);
        folder.add(options, 'val', -1, 1, .0001).name('Val');

        folder.add(options, 'bool').name('Bool');


        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('val', options.val);

        camera.position[1] = Math.sin(time * .01);
        camera.lookAt[1] = Math.sin(time * .00133);
        points.setCameraPerspective('camera0', camera.position, camera.lookAt);
        time++;
    }
}

export default base;