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
fn main(in: FragmentIn) -> @location(0) vec4f {

    var finalColor:vec4f = vec4();

    if(variables.init == 0.){
        rand_seed = in.uvr + params.time;
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
