
import Points, { FrontFace, RenderPass, RenderPasses } from 'points';
import { mesh_renderpass } from './mesh_renderpass/index.js';
import { loadAndExtract } from 'utils';

const options = {
    mode: 1
}

const url = '../models/monkey_subdivide.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
mesh_renderpass.addMesh('monkey', positions, colors, colorSize, uvs, normals, indices);
mesh_renderpass.depthWriteEnabled = true;
mesh_renderpass.clearValue = { r: 61 / 255, g: 37 / 255, b: 103 / 255, a: 1 }
// mesh_renderpass.frontFace = FrontFace.CW

const base = {
    renderPasses: [
        mesh_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        await points.setTextureImage('albedo', texture);
        points.setSampler('imageSampler', null);

        const dropdownItems = { /*'Vertex': 0,*/ 'Texture': 1, 'Shader': 2 };

        points.setUniform('cameraPosition', [0, 0, 5], 'vec3f');
        points.setUniform('color_mode', options.mode);
        folder.add(options, 'mode', dropdownItems).name('Colors').onChange(value => {
            console.log(value);
            points.setUniform('color_mode', value);
        });


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

        points.setCameraPerspective('camera', [0, 0, 5], [0, 0, -1000]);
    }
}

export default base;
