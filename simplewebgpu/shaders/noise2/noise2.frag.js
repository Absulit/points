import defaultStructs from '../defaultStructs.js';
import { fnusin } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';
import { rand } from '../random.js';

const noise2Frag = /*wgsl*/`

${defaultStructs}

struct Point{
    position: vec2<f32>,
    prev: vec2<f32>,
}

${fnusin}
${snoise}
${rand}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv);


    var n1 = snoise(uv * 200 * params.sliderA + 10 * .033 ); //fnusin(.01)
    n1 = (n1+1) * .5;


    let scale = .01;
    var c = 1.;

    //var planet = 0];
    var lastDistance = -1.;
    for(var i:i32 = 0; i < i32(params.numPoints); i++){
        var point = points[i];
        var d = distance(uv, vec2(point.position.x, point.position.y));


        if(lastDistance != -1.){
            lastDistance = min(lastDistance, d);
        }else{
            lastDistance = d;
        }
    }
    if(lastDistance > .01){
        c = 0.;
    }






    rand();
    let finalColor = texColorCompute + vec4(c) * vec4(rand_seed, 0, 1);

    return finalColor;
}
`;

export default noise2Frag;
