
import Points, { RenderPass, RenderPasses } from 'points';
import { loadAndExtract } from 'utils';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';

const options = {
    mode: 1
}

const url = '../models/Soldier.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture, animations, weights, joints } = data[0]

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
        const { uniforms, storages } = points;
        await points.setTextureImage('albedo', texture);
        points.setSampler('imageSampler', null);

        const dropdownItems = { /*'Vertex': 0,*/ 'Texture': 1, 'Shader': 2 };

        uniforms.color_mode = options.mode;
        folder.add(options, 'mode', dropdownItems).name('Colors').onChange(value => {
            console.log(value);
            uniforms.color_mode = +value;
        });


        storages.weights.setType('array<vec4f>').setValue(weights);
        storages.joints.setType('array<vec4f>').setValue(joints);

        points.setCameraPerspective('camera');

        // points.addRenderPass(RenderPasses.COLOR);
        // points.addRenderPass(RenderPasses.PIXELATE);
        // points.addRenderPass(RenderPasses.FILM_GRAIN);

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 1, 5], [0, 1, 0]);
    }
}

export default base;
