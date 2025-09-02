import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';
import { dataSize, getArrayTypeData } from '../../src/data-size.js';

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        const startTime = performance.now()
        let result = dataSize(`

            struct Params {
            sliderA:f32,
            sliderB:f32,
            sliderC:f32,
            right:vec3f,
            up:vec3f,
            modelViewProjectionMatrix:mat4x4<f32>,
            time:f32,
            epoch:f32,
            screen:vec2f,
            mouse:vec2f,
            mouseClick:f32,
            mouseDown:f32,
            mouseDelta:vec2f,
            mouseWheel:f32,

            }
        `);
        var endTime = performance.now()

        console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
        console.log(result);
        for (let [r, c] of result) {
            console.log(r, c.bytes)

        }


        points.setStorageMap('test', [0, 0, 1, .5], 'vec4f');


        points.setStorage('variables', 'Variable');
        points.setStorage('test2', 'TestStruct');

        points.setUniform('test3', [1, 0, 0, 1], 'vec4f');

        points.setStorage('anim', 'array<Variable>');

        points.setStorageMap('values', [1.0, 99.0], 'array<f32, 2>');

        // points.setUniform('test4', [1, 0, 0, 1], 'array< vec4f, 1 >');
        // TODO: throw error if using array in uniform?
        // points.setUniform('test5', [1,1,1,1], 'array<f32,4>');



        let ds = dataSize(`
            struct Event {
                updated: u32,
                data: array<f32>
            }
        `);


        const d = ds.get('Event');
        let structSize = d.bytes
        console.log(d, structSize);

    },
    update: points => {

    }
}

export default base;