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

        points.setCameraPerspective('camera', [0, 0, -5]);

        points.setUniform('wireframeColor', options.wireframeColor, 'vec3f');
        folder.addColor(options, 'wireframeColor');

        points.setUniform('fillColor', options.fillColor, 'vec3f');
        folder.addColor(options, 'fillColor');

        points.setUniform('thickness', options.thickness);
        folder.add(options, 'thickness', 0, 5, .0001).name('thickness');

        points.setUniform('opaque', options.opaque);
        folder.add(options, 'opaque').name('opaque').onChange(val =>{
            r0.depthWriteEnabled = val; // TODO: error in depth
        });


        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, -5]);
        points.setUniform('thickness', options.thickness);
        points.setUniform('wireframeColor', options.wireframeColor);
        points.setUniform('fillColor', options.fillColor);
        points.setUniform('opaque', options.opaque);
    }
}

export default base;