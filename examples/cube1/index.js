
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

// const left = -1;
// const right = 1;
// const bottom = -1;
// const top = 1;
// const near = 0.1;
// const far = 100;

// const lr = 1 / (right - left);
// const bt = 1 / (top - bottom);
// const nf = 1 / (near - far);

// const orthoMatrix = [
//   2 * lr, 0,       0,              0,
//   0,      2 * bt,  0,              0,
//   0,      0,       2 * nf,         0,
//   -(right + left) * lr,
//   -(top + bottom) * bt,
//   (far + near) * nf,
//   1
// ];


cube_renderpass.loadOp = 'clear';

const base = {
    renderPasses: [
        staticcube_renderpass,
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        cube_renderpass.addCube(
            { x: 0, y: 0, z: 0 },
            { width: 1, height: 1, depth: 1 },
            { r: 1, g: 0, b: 0, a: 1 }
        );

        staticcube_renderpass.addCube(
            { x: 0, y: 0, z: 0 },
            { width: 1, height: 1, depth: 1 },
            { r: 1, g: 0, b: 0, a: 1 }
        );

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
