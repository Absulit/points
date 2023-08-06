import Points from 'points';
import RenderPass from 'renderpass';

import {
    vec3,
    mat4,
} from 'https://wgpu-matrix.org/dist/2.x/wgpu-matrix.module.js';

import renderPass0 from './pass0/index.js';
import renderPass1 from './pass1/index.js';


const base = {
    renderPasses: [
        renderPass0,
        // renderPass1,
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

        points.addUniform('deltaTime', 0);
        points.addUniform('seed', [0, 0, 0, 0], 'vec4f');

        points.addStorage('data', 'Particles');
        await points.addTextureImage('texture', 'webgpu_particles_1/webgpu.png');
        // points.addUniform('render_params', data, 'RenderParams');

        points.addUniform('ubo_width', 1, 'u32');
        // points.addStorage()
        points.addStorage('buf_in', 'Buffer', true);
        points.addStorage('buf_out', 'Buffer');

        points.addBindingTexture('tex_out', 'tex_in')
    },
    update: points => {

    }
}

export default base;