import vert0 from './r0/vert.js';
import compute0 from './r0/compute.js';
import frag0 from './r0/frag.js';

import Points, { CullMode, PrimitiveTopology, RenderPass } from 'points';
import { loadAndExtract } from 'utils';

const options = {
    thickness: 0.456,
    wireframeColor: [255, 255, 255], // RGB array
    fillColor: [255, 0, 0], // RGB array
}

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const r0 = new RenderPass(vert0, frag0, compute0);
r0.depthWriteEnabled = true;
r0.cullMode = CullMode.NONE
// r0.topology = PrimitiveTopology.LINE_STRIP
r0.addCube('cube0');
r0.addCylinder('cylinder0');
r0.addPlane('plane0')
r0.addSphere('sphere0')
r0.addTorus('torus0')

const url = '../models/monkey_subdivide.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
r0.addMesh('monkey', positions, colors, colorSize, uvs, normals, indices)

const base = {
    renderPasses: [
        r0,
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

        points.setUniform('wireframeColor', options.wireframeColor, 'vec3f');
        folder.addColor(options, 'wireframeColor');

        points.setUniform('fillColor', options.fillColor, 'vec3f');
        folder.addColor(options, 'fillColor');

        points.setUniform('thickness', options.thickness);
        folder.add(options, 'thickness', 0, 5, .0001).name('thickness');


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

        points.setUniform('thickness', options.thickness);
        points.setUniform('wireframeColor', options.wireframeColor);
        points.setUniform('fillColor', options.fillColor);

    }
}

export default base;