import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';
import { isMobile, setDisabled } from 'utils';
import { structs } from './structs.js';

const options = {
    maxLife: 100,
    turbulenceScale: 100,
    particleSize: 2,
    mode: 0
}

options.isMobile = isMobile();

let WORKGROUP_X = 256;
let WORKGROUP_Y = 1;
let WORKGROUP_Z = 1;

let THREADS_X = 256;
let THREADS_Y = 1;
let THREADS_Z = 1;

if (options.isMobile) {
    WORKGROUP_X = 8;
    WORKGROUP_Y = 4;
    WORKGROUP_Z = 2;

    THREADS_X = 4;
    THREADS_Y = 4;
    THREADS_Z = 2;

    options.particleSize = 6.5492;
}

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log(NUMPARTICLES);


const instancedParticlesRenderPass = new RenderPass(vert, frag1, compute0, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z)
instancedParticlesRenderPass.depthWriteEnabled = false;
instancedParticlesRenderPass.setPlane('plane', { x: 0, y: 0 }, { width: 2, height: 2 }).instanceCount = NUMPARTICLES;

const notificationMsg = `This demo uses a webcam, but it seems you don't have one, \nso we replaced it with a video.`;

const base = {
    renderPasses: [
        instancedParticlesRenderPass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages, constants } = points;
        const { VERTEX, COMPUTE } = GPUShaderStage;
        points.import(structs);

        await points.setTextureWebcam('webcam')
            .catch(async err => {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('Points - Particles 3', {
                        body: notificationMsg,
                        //icon: 'https://your-icon-url.png'
                    });
                } else {
                    alert(notificationMsg)
                }

                await points.setTextureVideo('webcam', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');
            });

        constants.NUMPARTICLES = NUMPARTICLES;
        constants.WORKGROUP_X = WORKGROUP_X;
        constants.WORKGROUP_Y = WORKGROUP_Y;
        constants.WORKGROUP_Z = WORKGROUP_Z;
        constants.THREADS_X = THREADS_X;
        constants.THREADS_Y = THREADS_Y;
        constants.THREADS_Z = THREADS_Z;

        storages.particles
            .setType(`array<Particle, ${NUMPARTICLES}>`)
            .setShaderStage(VERTEX | COMPUTE);

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        await points.setTextureVideo('video', './../img/8056464-hd_1080_1920_30fps_800x800.mp4');

        points.setCameraOrthographic('camera');

        uniforms.maxLife = options.maxLife;
        folder.add(options, 'maxLife', 1, 600, .0001).name('maxLife');

        uniforms.turbulenceScale = options.turbulenceScale;
        folder.add(options, 'turbulenceScale', 10, 1024, .0001).name('turbulenceScale');

        uniforms.particleSize = options.particleSize;
        folder.add(options, 'particleSize', 1, 10, .0001).name('particleSize');


        const dropdownItems = { 'Video': 0, 'Webcam': 1, 'Image': 2 };
        uniforms.texture_mode = options.mode;
        folder.add(options, 'mode', dropdownItems).name('Textures').onChange(async value => {
            console.log(value);
            uniforms.texture_mode = value;
        });



        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { uniforms } = points;
        uniforms.maxLife = options.maxLife;
        uniforms.turbulenceScale = options.turbulenceScale;
        uniforms.particleSize = options.particleSize;
        uniforms.texture_mode = options.mode;
    }
}

export default base;