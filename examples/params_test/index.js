import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from '../../src/absulit.points.module.js';
// import { wgslTypeSize } from '../../src/wgslTypeSize.js';
import { makeShaderDataDefinitions } from './../../src/data-definitions.js';
import { dataSize } from '../../src/data-size.js';

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        // console.log(makeShaderDataDefinitions(`struct Params {
        //     sliderA:f32,
        //     sliderB:f32,
        //     sliderC:f32,
        //     test3:vec4f,
        //     time:f32,
        //     epoch:f32,
        //     screenWidth:f32,
        //     screenHeight:f32,
        //     mouseX:f32,
        //     mouseY:f32,
        //     mouseClick:f32,
        //     mouseDown:f32,
        //     mouseWheel:f32,
        //     mouseDeltaX:f32,
        //     mouseDeltaY:f32,

        // }`))

        var startTime = performance.now()
        const result = dataSize(`
        struct Ex4a {
            velocity: vec3f,
          };

          struct Ex4 {
            orientation: vec3f,
            size: f32,
            // direction: array<vec3f, 1>,
            scale: f32,
            info: Ex4a,
            friction: f32,
          };
        `);
        var endTime = performance.now()

        console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
        console.log(result)


        points.addStorageMap('test', [1, 0, 0, .5], 'vec4f');


        points.addStorage('variables', 1, 'Variable', 32);
        points.addStorage('test2', 1, 'TestStruct', 32);

        points.addUniform('test3', [1, 0, 0, 1], 'vec4f', 16)


    },
    update: points => {

    }
}

export default base;