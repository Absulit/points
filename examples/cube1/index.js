
import Points, { RenderPass, RenderPasses } from 'points';
import { cube_renderpass } from './cube_renderpass/index.js';
import { staticcube_renderpass } from './staticcube_renderpass/index.js';

const options = {
    loadOp: false
}

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

// TODO: cubes need to be outside init() here, because the RenderPass is imported
// and is already in memory the next time is loaded, so new cubes load
// a solution would be to call a remove (like init, update) and delete the RenderPass

staticcube_renderpass.depthWriteEnabled = true;
staticcube_renderpass.addCube('cube_behind');

cube_renderpass.loadOp = 'clear';
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

        aspect = points.canvas.width / points.canvas.height;
        points.setUniform(
            'projection',
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ],
            'mat4x4<f32>'
        )

        // camera at [0, 0, 5], looking at origin
        points.setUniform(
            'view',
            [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, -5, 1
            ],
            'mat4x4<f32>'
        )

        // points.addRenderPass(RenderPasses.COLOR);
        // points.addRenderPass(RenderPasses.PIXELATE);
        // points.addRenderPass(RenderPasses.FILM_GRAIN);

        folder.add(options, 'loadOp')
            .name('loadOp: clear|load')
            .onChange(value => cube_renderpass.loadOp = value ? 'load' : 'clear');
        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {

        aspect = points.canvas.width / points.canvas.height;
        points.setUniform(
            'projection',
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ]
        )
    }
}

export default base;
