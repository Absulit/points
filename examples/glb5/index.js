
import Points, { RenderPass } from 'points';
import { loadAndExtract } from 'utils';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';

const url = '../models/monkey_vertex_colors.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]

const cube_renderpass = new RenderPass(vert, frag);
cube_renderpass.setMesh('monkey', positions, colors, colorSize, uvs, normals, indices)
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.clearValue = { r: 61 / 255, g: 37 / 255, b: 103 / 255, a: 1 }

const base = {
    renderPasses: [
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setCameraPerspective('camera');
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, 5]);
    }
}

export default base;
