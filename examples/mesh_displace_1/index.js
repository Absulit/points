import vert from './vert.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';
import { isMobile } from 'utils';

const options = {
    val: .5,
}

options.isMobile = isMobile();

let segments = 256;
if(options.isMobile){
    segments = 64;
    options.val = 1;
}

const renderPass = new RenderPass(vert, frag);
renderPass.clearValue = { r: 61 / 255, g: 37 / 255, b: 103 / 255, a: 1 }
renderPass.addSphere('sphere', { x: 0, y: 0, z: 0 }, { r: 1, g: 1, b: 0, a: 1 }, 1.6, segments, segments);
renderPass.depthWriteEnabled = true;

const base = {
    renderPasses: [renderPass],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        // points.setStorage('noise', 'f32', false, GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT);
        points.setCameraPerspective('camera', [0, 0, -5]);


        points.setUniform('val', options.val);
        folder.add(options, 'val', 0, 1, .0001).name('Val');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, -5]);
        points.setUniform('val', options.val);
    }
}

export default base;