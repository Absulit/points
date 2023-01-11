import { fnusin, sdfSegment } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';

const frag = /*wgsl*/`

${defaultStructs}

struct Variable{
    particlesCreated: f32
}

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32,
    x: f32,
    y: f32
}

${fnusin}
${sdfSegment}

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

    var lastDistance = -1.;
    for(var i:u32 = 0; i < 8u; i++){
        var particle = planets[i];
        var d = distance(uv, vec2(particle.x * scale + .5, particle.y * scale + .5));

        if(i > 1u && i < 8u){

        }

        if(lastDistance != -1.){

            let p1 = planets[i - 1];
            let p2 = planets[i];
            let dSegment = sdfSegment(uv, vec2(p1.x * scale + .5,p1.y * scale + .5), vec2(p2.x * scale + .5,p2.y * scale + .5));
            d = min(dSegment, d);


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
    let g = lastDistance * uv.x * uv.y * fnusin(uv.x) * 10;
    let b = 1 - lastDistance * uv.y * 32 * uv.x;

    let finalColor:vec4<f32> = vec4(b, r, g, 1 );


    return finalColor;
}
`;

export default frag;
