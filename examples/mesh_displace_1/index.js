import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    val: .5,
    bool: false,
}

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const renderPass = new RenderPass(vert, frag, compute);
renderPass.clearValue = { r: 61 / 255, g: 37 / 255, b: 103 / 255, a: 1 }
renderPass.addSphere('sphere', { x: 0, y: 0, z: 0 }, { r: 1, g: 1, b: 0, a: 1 }, 1, 256, 256);

const base = {
    renderPasses: [renderPass],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        // points.setStorage('noise', 'f32', false, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT);

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


        points.setUniform('val', options.val);
        folder.add(options, 'val', 0, 1, .0001).name('Val');
        folder.add(options, 'bool').name('Bool');

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

        points.setUniform('val', options.val);
    }
}

export default base;