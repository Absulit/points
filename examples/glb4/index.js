
import Points, { RenderPass, RenderPasses } from 'points';
import { loadAndExtract, getAnimationDuration, calculateBoneMatrices, pixelTextureB64 } from 'utils';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';

const options = {
    animation: 37
}

const url = '../models/UAL1_Standard.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const cube_renderpass = new RenderPass(vert, frag);
const data_animations = [];
const data_textures = [];
const data_skins = [];

data.forEach((datum, idx) => {
    const { positions, colors, uvs, normals, indices, colorSize, texture, animations, weights, joints, skins, meshName } = datum;
    cube_renderpass.setMesh(`${meshName}_${idx}`, positions, colors, colorSize, uvs, normals, indices, { weights, joints });

    data_animations.push(animations);
    data_textures.push(texture)
    data_skins.push(skins);
})
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.clearValue = { r: 61 / 255, g: 37 / 255, b: 103 / 255, a: 1 }

let SKIN = data_skins[0][0];
let ANIM = data_animations[0][options.animation];

let animationDuration = getAnimationDuration(ANIM);

const base = {
    renderPasses: [
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages } = points;


        await points.setTextureImage('albedo', data_textures[0] || pixelTextureB64);
        points.setSampler('imageSampler', null);

        let dropdownItems = {};
        data_animations[0].forEach((animation, idx) => {
            dropdownItems[animation.getName()] = idx;
        })

        folder.add(options, 'animation', dropdownItems)
            .name('Animations')
            .onChange(value => {
                console.log(value);
                ANIM = data_animations[0][+value];
                animationDuration = getAnimationDuration(ANIM);
            });

        const boneData = calculateBoneMatrices(SKIN, ANIM, 0);

        storages.boneMatrices.setType('array<mat4x4f>').setValue(Array.from(boneData))
        points.setCameraPerspective('camera');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: (points, t, dt) => {
        const { storages } = points;
        const currentTime = t % animationDuration;
        const boneData = calculateBoneMatrices(SKIN, ANIM, currentTime);
        storages.boneMatrices.setValue(Array.from(boneData));
        points.setCameraPerspective('camera', [0, 1, 5], [0, 1, 0]);
    }
}

export default base;
