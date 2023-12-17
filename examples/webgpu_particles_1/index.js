import Points from './../../src/absulit.points.module.js';
import RenderPass from '../../src/RenderPass.js';

import {
    vec3,
    mat4,
} from 'https://wgpu-matrix.org/dist/2.x/wgpu-matrix.module.js';

import renderPass0 from './pass0/index.js';

const base = {
    renderPasses: [
        renderPass0
    ],
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        // const aspect = points.canvas.width / points.canvas.height;

        // const projection = mat4.perspective((2 * Math.PI) / 5, aspect, 1, 100.0);
        const view = mat4.create();
        const mvp = mat4.create();


        const modelViewProjectionMatrix = [
            mvp[0], mvp[1], mvp[2], mvp[3],
            mvp[4], mvp[5], mvp[6], mvp[7],
            mvp[8], mvp[9], mvp[10], mvp[11],
            mvp[12], mvp[13], mvp[14], mvp[15]
        ];

        const right = [view[0], view[4], view[8]]

        const up = [view[1], view[5], view[9]]

        // const data = [
        //     // modelViewProjectionMatrix
        //     mvp[0], mvp[1], mvp[2], mvp[3],
        //     mvp[4], mvp[5], mvp[6], mvp[7],
        //     mvp[8], mvp[9], mvp[10], mvp[11],
        //     mvp[12], mvp[13], mvp[14], mvp[15],

        //     view[0], view[4], view[8], // right

        //     0, // padding

        //     view[1], view[5], view[9], // up

        //     0, // padding
        // ]

        // const modelViewProjectionMatrix = [
        //     7, 7, 7, 7,
        //     7, 7, 7, 7,
        //     7, 7, 7, 7,
        //     7, 7, 7, 7
        // ];

        // const right = [8, 8, 8]

        // const up = [9, 9, 9]




        points.addUniform('right', right, 'vec3<f32>');
        points.addUniform('up', up, 'vec3<f32>');
        points.addUniform('modelViewProjectionMatrix', modelViewProjectionMatrix, 'mat4x4<f32>');

        // points.addUniform('render_params', data, 'RenderParams');

        // TODO: bug, invert MOUSE_DELTA and MOUSE_WHEEL positions in addUniforms
    },
    update: points => {

    }
}

export default base;