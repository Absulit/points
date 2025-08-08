import { fnusin } from 'points/animation';
import { structs } from './structs.js';
import { rand } from 'points/random';

const frag = /*wgsl*/`

${fnusin}
${structs}
${rand}

// struct Colors{
//     // items: array< vec4f, 800*800 >
//     items: array< vec4f, 640000 >
// }

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    var finalColor:vec4f = vec4();

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
