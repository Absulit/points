import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from '../../src/absulit.points.module.js';
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


    var startTime = performance.now()
    const result = dataSize(`

        struct Light {
          mode: u32,
          power: f32,
          range: f32,
          innerAngle: f32,
          outerAngle: f32,
          direction: vec3f,
          position: vec3f,
        };

        struct FSInput {
          colorMult: vec4f,
          specularFactor: f32,
          lights: array<Light, 2>,
        };

        struct VSInput {
          projectionMatrix: mat4x4f,
          viewMatrix: mat4x4f,
          modelMatrix: mat4x4f,
          normalMatrix: mat4x4f,
        };

        @group(0) @binding(0) var<uniform> vsUni: VSInput;
        @group(0) @binding(1) var<uniform> fsUni: FSInput;
        @group(0) @binding(2) var diffuseSampler: sampler;
        @group(0) @binding(3) var diffuseTexture: texture_2d<f32>;

        struct Attribs {
          @location(0) position: vec4f,
          @location(1) normal: vec3f,
          @location(2) texcoord: vec2f,
        };

        struct VSOutput {
          @builtin(position) position: vec4f,
          @location(0) texcoord: vec2f,
          @location(1) normal: vec3f,
        };

        @vertex fn vs(vin: Attribs) -> VSOutput {
          var vout: VSOutput;
          vout.position = vsUni.projectionMatrix * vsUni.viewMatrix * vsUni.modelMatrix * vin.position;
          vout.texcoord = vin.texcoord;
          vout.normal = (vsUni.normalMatrix * vec4f(vin.normal, 0)).xyz;
          return vout;
        }

        @fragment fn fs(vout: VSOutput) -> @location(0) vec4f {
          let normal = normalize(vout.normal);
          var l = 0.0;
          for (var i = 0; i < 2; i++) {
            let light = fsUni.lights[i];
            l += clamp(dot(normal, light.direction), 0.0, 1.0);
          }

          let color = textureSample(diffuseTexture, diffuseSampler, vout.texcoord);
          return vec4f(color.rgb * clamp(l, 0.0, 1.0), color.a);
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

    // points.addUniform('test4', [1, 0, 0, 1], 'array< vec4<f32>, 1 >');
    // TODO: throw error if using array in uniform?
    // points.addUniform('test5', [1,1,1,1], 'array<f32,4>');


  },
  update: points => {

  }
}

export default base;