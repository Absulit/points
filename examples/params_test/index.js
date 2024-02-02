import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from '.points';
import { dataSize } from 'datasize';

const base = {
  vert,
  compute,
  frag,
  /**
   *
   * @param {Points} points
   */
  init: async points => {


    var startTime = performance.now()
    const result = dataSize(`

    struct Params {
      sliderA:f32,
      sliderB:f32,
      sliderC:f32,
      right:vec3<f32>,
      up:vec3<f32>,
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


    points.addStorageMap('test', [0, 0, 1, .5], 'vec4f');


    points.addStorage('variables', 'Variable');
    points.addStorage('test2', 'TestStruct');

    points.addUniform('test3', [1, 0, 0, 1], 'vec4f');

    points.addStorage('anim', 'array<Variable>');

    points.addStorageMap('values', [1.0, 99.0], 'array<f32, 2>');

    // points.addUniform('test4', [1, 0, 0, 1], 'array< vec4<f32>, 1 >');
    // TODO: throw error if using array in uniform?
    // points.addUniform('test5', [1,1,1,1], 'array<f32,4>');


  },
  update: points => {

  }
}

export default base;