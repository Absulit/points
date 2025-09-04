import { BLACK, RED } from 'points/color';
import { structs } from './../structs.js';
import { PI, polar, TAU } from 'points/math';
import { rand, random } from 'points/random';

const compute = /*wgsl*/`

${structs}
${BLACK}
${RED}
${PI}
${TAU}
${polar}
${rand}
${random}

const SIZE = vec2f(800.,800.);
const speed = .01; // .0001

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let index = GlobalId.xy;

    let particleColor = textureLoad(pass0Texture, index, 0); // image

    textureStore(writeTexture, index, particleColor * .98999999);

}
`;

export default compute;
