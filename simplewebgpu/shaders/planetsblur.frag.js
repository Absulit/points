
import defaultStructs from './defaultStructs.js';
import { fnusin } from './defaultFunctions.js';

const planetsblurFrag = /*wgsl*/`

${defaultStructs}

struct Particle{
    x: f32,
    y: f32
}

${fnusin}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage> particles: array<Particle>;

@group(0) @binding(2) var feedbackSampler: sampler;
@group(0) @binding(3) var feedbackTexture: texture_2d<f32>;

@group(0) @binding(4) var computeTexture: texture_2d<f32>;
@group(0) @binding(5) var<storage> particles2: array<Particle>;

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    //let texColor = textureSample(myTexture, mySampler, uv * 1.0 + .1 * fnusin(2));
    let texColor = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1.001325,-1.001));

    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));

    let particle = particles[0];
    let particle2 = particles2[0];

    // let d = distance(uv, vec2(.5 + .1 * fusin(2), .5  + .1 * fusin(4.123)));
    // var c = 1.;
    // if(d > .1){
    //     c = 0;
    // }

    let decayR =  texColor.r * .999;
    let decayG =  texColor.g * .991;
    let decayB =  texColor.b * .995 * uv.x;
    let decayA =  texColor.a * .9999;
    //var finalColor:vec4<f32> = vec4(uv.x * c + decayR, uv.y * c + decayR, c + decayB, 1);

    // let cellSize = 20. + 10. * fnusin(1.);
    // let a = sin(uv.x  * cellSize) * sin(uv.y * cellSize);
    // let b = sin(uv.x * uv.y * 10. * 9.1 * .25 );
    // let cc = fnusin(uv.x * uv.y * 10.);
    // let dd = distance(a,b);
    // let f = dd * uv.x * uv.y;
    // var finalColor = vec4(a*dd + decayR,f*cc*a+decayG,f+decayB, a*dd + decayA);



    let scale = .01;

    var c = 1.;

    //var particle = particles[0];
    var lastDistance = -1.;
    for(var i:u32 = 0; i < 8u; i++){
        var particle = particles[i];
        var d = distance(uv, vec2(particle.x * scale + .5, particle.y * scale + .5));


        if(lastDistance != -1.){
            lastDistance = min(lastDistance, d);
        }else{
            lastDistance = d;
        }
    }
    if(lastDistance > .01 + .001 * fnusin(1.25)){
        c = 0.;
    }

    let r = c + lastDistance;
    let g = lastDistance;
    let b = 1 - lastDistance * 32;

    var finalColor:vec4<f32> = vec4(c + decayR, c + decayG, c + decayB, c + decayA );


    return finalColor;
}
`;

export default planetsblurFrag;
