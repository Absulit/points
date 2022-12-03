import defaultStructs from './defaultStructs.js';
import { fnusin } from './defaultFunctions.js';

const shapes1Frag = /*wgsl*/`

${defaultStructs}

${fnusin}


fn sdfCircle(position:vec2<f32>, radius: f32, uv:vec2<f32>) -> vec4<f32>{
    let d = distance(uv, vec2(.5, .5));
    var c = 1.;
    if(d > radius){
        c = 0;
    }
    return vec4(c);
}

fn sdfCircleSmooth(position:vec2<f32>, radius: f32, min: f32, max: f32, uv:vec2<f32>) -> vec4<f32>{
    let d = distance(uv, vec2(.5, .5));
    let st = smoothstep(min, max, d);
    return vec4(st);
}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let d = distance(uv, vec2(.5, .5));
    let st = smoothstep(params.sliderA, params.sliderB , d);
    var c = 1.;
    if(d > .1){
        c = 0;
    }



    //var finalColor:vec4<f32> = sdfCircle(vec2(.5,.5), .1, uv);
    var finalColor:vec4<f32> = sdfCircleSmooth(vec2(.5,.5), .1,  .2,.1 * fnusin(10),  uv);

    return finalColor;
}
`;

export default shapes1Frag;
