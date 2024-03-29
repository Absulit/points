import { fnusin } from 'animation';
import { structs } from './structs.js';
import { rand } from 'random';

const frag = /*wgsl*/`

${fnusin}
${structs}
${rand}

// struct Colors{
//     // items: array< vec4<f32>, 800*800 >
//     items: array< vec4<f32>, 640000 >
// }

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var finalColor:vec4<f32> = vec4();

    if(variables.init == 0.){
        rand_seed = uvr + params.time;
        rand();
        finalColor = vec4(rand_seed, 0, 1);
        variables.init = 1;
        variables.color = finalColor;
    }
    finalColor = variables.color;

    let c = values[1];


    return variables.color;
}
`;

export default frag;
