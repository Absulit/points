import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';

import Points, { CullMode, PrimitiveTopology, RenderPass } from 'points';
import { loadAndExtract } from 'utils';

const options = {
    thickness: 0.456,
    wireframeColor: [255, 255, 255], // RGB array
    fillColor: [255, 0, 0], // RGB array
    opaque: true,
}

const r0 = new RenderPass(vert0, frag0);
r0.depthWriteEnabled = true;
r0.cullMode = CullMode.NONE
// r0.topology = PrimitiveTopology.LINE_STRIP
r0.setCube('cube0');
r0.setCylinder('cylinder0');
r0.setPlane('plane0')
r0.setSphere('sphere0')
r0.setTorus('torus0')

const url = '../models/monkey_subdivide.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
r0.setMesh('monkey', positions, colors, colorSize, uvs, normals, indices)

const base = {
    renderPasses: [
        r0,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        points.setCameraPerspective('camera');

        uniforms.wireframeColor = options.wireframeColor;
        folder.addColor(options, 'wireframeColor');

        uniforms.fillColor = options.fillColor;
        folder.addColor(options, 'fillColor');

        uniforms.thickness = options.thickness;
        folder.add(options, 'thickness', 0, 5, .0001).name('thickness');

        uniforms.opaque = options.opaque;
        folder.add(options, 'opaque').name('opaque').onChange(val => {
            r0.depthWriteEnabled = val; // TODO: error in depth
            uniforms.opaque = val;
        });


        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { uniforms } = points;
        points.setCameraPerspective('camera', [0, 0, 5]);
        uniforms.thickness = options.thickness;
        uniforms.wireframeColor = options.wireframeColor;
        uniforms.fillColor = options.fillColor;
    }
}

export default base;