import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';

const options = {
    enabled: true,
    mass: .0065,
    innerRadius: 1.,
    outerRadius: 2.3,
    mouseY: -.301,
    roDistance: -4.3702,
    diskSpeed: .9,
    threshold: 1.4,
    spin: .0032,
    hueShift: .001,

    sliderA: .0677,
    scale: .089,
    sliderC: .005,
    eventHorizon: 25.8,

    val: 0.1037,
    val2: .127,
}

const colors = [
    255, 255, 255, 255,
    255, 220, 150, 255,
    255, 140, 60, 255,
    180, 60, 30, 255,
    80, 30, 20, 255,
    0, 0, 0, 1
].map(i => i / 255);

const base = {
    vert,
    compute,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        points.scaleMode = ScaleMode.FIT

        const descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            //maxAnisotropy: 10,
        }
        points.setSampler('imageSampler', descriptor);
        await points.setTextureImage('image', './../img/pexels-philippedonn-1169754.jpg');
        await points.setTextureImage('diskTexture', './../img/000.png');
        points.setStorage('colors', 'array<vec4f, 6>')
            .setValue(colors);

        uniforms.enabled = options.enabled;
        uniforms.mass = options.mass;
        uniforms.innerRadius = options.innerRadius;
        uniforms.outerRadius = options.outerRadius;
        // uniforms.mouseY = options.mouseY;
        uniforms.roDistance = options.roDistance;
        uniforms.diskSpeed = options.diskSpeed;
        uniforms.threshold = options.threshold;
        uniforms.spin = options.spin;
        uniforms.hueShift = options.hueShift;
        uniforms.eventHorizon = options.eventHorizon;

        uniforms.sliderA = options.sliderA;
        uniforms.scale = options.scale;
        uniforms.sliderC = options.sliderC;
        uniforms.val = options.val; // to debug
        uniforms.val2 = options.val2; // to debug

        folder.add(options, 'enabled').name('enable');
        folder.add(options, 'mass', 0, 5, .0001).name('mass');
        folder.add(options, 'innerRadius', .1, 10, .0001).name('innerRadius');
        folder.add(options, 'outerRadius', .1, 10, .0001).name('outerRadius');
        // folder.add(options, 'mouseY', -1, 1, .0001).name('mouseY');
        // folder.add(options, 'roDistance', -10, 1, .0001).name('roDistance');
        folder.add(options, 'diskSpeed', .1, 10, .0001).name('diskSpeed');
        folder.add(options, 'threshold', -10.1, 11, .0001).name('threshold');
        folder.add(options, 'spin', 0, 1, .0001).name('spin');
        folder.add(options, 'hueShift', .001, 10, .0001).name('hueShift');
        folder.add(options, 'eventHorizon', .001, 100, .0001).name('eventHorizon');

        folder.add(options, 'sliderA', -1, 1, .0001).name('color shift A');
        folder.add(options, 'sliderC', -1, 1, .0001).name('color shift B');
        folder.add(options, 'scale', -1, 1, .0001).name('fov');
        // folder.add(options, 'val', 0, 1, .0001).name('val'); // to debug
        // folder.add(options, 'val2', 0, 1, .0001).name('val2'); // to debug
        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { uniforms } = points;
        uniforms.enabled = options.enabled;
        uniforms.mass = options.mass;
        uniforms.innerRadius = options.innerRadius;
        uniforms.outerRadius = options.outerRadius;
        // uniforms.mouseY = options.mouseY;
        uniforms.roDistance = options.roDistance;
        uniforms.diskSpeed = options.diskSpeed;
        uniforms.threshold = options.threshold;
        uniforms.spin = options.spin;
        uniforms.hueShift = options.hueShift;
        uniforms.eventHorizon = options.eventHorizon;

        uniforms.sliderA = options.sliderA;
        uniforms.scale = options.scale;
        uniforms.sliderC = options.sliderC;
        uniforms.val = options.val; // to debug
        uniforms.val2 = options.val2; // to debug
    }
}

export default base;