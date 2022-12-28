
import { fnusin } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';
import { rand } from '../random.js';
const planetsFrag = /*wgsl*/`

${defaultStructs}

struct Variable{
    particlesCreated: f32,
}

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32,
    x: f32,
    y: f32
}

${fnusin}
${rand}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let pc: ptr<storage, f32, read_write> = &variables.particlesCreated;

    let scale = .01;

    var c = 1.;

    //var planet = 0];
    var lastDistance = -1.;
    for(var i:u32 = 0; i < u32(800 * params.sliderA); i++){
        var planet = planets[i];
        var d = distance(uv / ratio * 200 * params.sliderA * params.sliderB, vec2(rand(), rand()) * 200 * params.sliderB);


        if(lastDistance != -1.){
            lastDistance = min(lastDistance, d);
        }else{
            lastDistance = d;
        }
    }
    if(lastDistance > .01){
        c = 0.;
    }

    // var d1 = distance(uv, vec2( .5, .5) );
    // var d2 = distance(uv, vec2( .6, .6) );
    // var d3 = distance(uv, vec2( .7, .7) );
    // var d = min(min(d1,d3), d2);
    // if(d > .1){
    //     c = 0.;
    // }
    // r += c;

    let r = c + lastDistance;
    let g = lastDistance;
    let b = 1 - lastDistance * 32;

    let finalColor:vec4<f32> = vec4(1-lastDistance);


    return finalColor;
}
`;

export default planetsFrag;
