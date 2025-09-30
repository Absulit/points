import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    maxLife: 100,
    turbulenceScale: 100,
    useVideo: true,
    particleSize: 2,
}

const WORKGROUP_X = 256;
const WORKGROUP_Y = 1;

const THREADS_X = 256;
const THREADS_Y = 1;

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * THREADS_X * THREADS_Y;
console.log(NUMPARTICLES);


const instancedParticlesRenderPass = new RenderPass(vert, frag1, compute0, WORKGROUP_X, WORKGROUP_Y, 1)
instancedParticlesRenderPass.instanceCount = NUMPARTICLES;

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const base = {
    renderPasses: [
        instancedParticlesRenderPass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        instancedParticlesRenderPass.addCube(
            { x: 0, y: 0, z: 0 },
            { width: 1, height: 1, depth: 1 },
            { r: 0, b: 0, b: 0, a: 1 },
        )

        points.depthWriteEnabled = false;
        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setStorage(
            'particles',
            `array<Particle, ${NUMPARTICLES}>`,
            false,
            GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE
        );

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

        points.setUniform('maxLife', options.maxLife);
        folder.add(options, 'maxLife', 1, 600, .0001).name('maxLife');

        points.setUniform('turbulenceScale', options.turbulenceScale);
        folder.add(options, 'turbulenceScale', 10, 1024, .0001).name('turbulenceScale');

        points.setUniform('useVideo', false);
        folder.add(options, 'useVideo').name('useVideo');

        points.setUniform('particleSize', options.particleSize);
        folder.add(options, 'particleSize', 1, 10, .0001).name('particleSize');

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



        points.setUniform('useVideo', options.useVideo);
        points.setUniform('maxLife', options.maxLife);
        points.setUniform('turbulenceScale', options.turbulenceScale);
        points.setUniform('particleSize', options.particleSize);
    }
}

export default base;