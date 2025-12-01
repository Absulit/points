
import Points, { LoadOp, RenderPass, RenderPasses } from 'points';
import { cube_renderpass } from './cube_renderpass/index.js';
import { staticcube_renderpass } from './staticcube_renderpass/index.js';

const options = {
    loadOp: false
}

// TODO: cubes need to be outside init() here, because the RenderPass is imported
// and is already in memory the next time is loaded, so new cubes load
// a solution would be to call a remove (like init, update) and delete the RenderPass

staticcube_renderpass.depthWriteEnabled = true;
staticcube_renderpass.addCube('cube_behind');

cube_renderpass.loadOp = LoadOp.CLEAR;
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.addCube('cube0');
cube_renderpass.addCube('cube1', { x: 0, y: 1, z: 0 });


const base = {
    renderPasses: [
        staticcube_renderpass,
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        points.setCameraPerspective('camera');

        // points.addRenderPass(RenderPasses.COLOR);
        // points.addRenderPass(RenderPasses.PIXELATE);
        // points.addRenderPass(RenderPasses.FILM_GRAIN);

        folder.add(options, 'loadOp')
            .name('loadOp: clear|load')
            .onChange(value => cube_renderpass.loadOp = value ? LoadOp.LOAD : LoadOp.CLEAR);
        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, 5]);
    }
}

export default base;
