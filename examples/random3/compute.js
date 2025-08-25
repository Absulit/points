import { fnusin } from 'points/animation';
import { RGBAFromHSV } from 'points/color';
import { rand, random } from 'points/random';

const compute = /*wgsl*/`

${random}
${rand}
${RGBAFromHSV}
${fnusin}

const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {

    rand_seed.x += f32(WorkGroupID.x);
    rand_seed.y += f32(WorkGroupID.y);

    seed += i32(WorkGroupID.x + WorkGroupID.y);

    let randNumber = rand();
    rand_seed.y += randNumber + fract(params.sliderA);
    let v = step(randNumber, .5); // if(randNumber < .5){v = 1.;}

    // textureStore(outputTex, GlobalId.xy, vec4(randNumber));
    // textureStore(outputTex, GlobalId.xy, RGBAFromHSV(randNumber, 1, 1));
    // textureStore(outputTex, GlobalId.xy, RGBAFromHSV( fnusin(randNumber), 1, 1));
    // textureStore(outputTex, GlobalId.xy, vec4( fnusin(randNumber)));

    textureStore(outputTex, GlobalId.xy, vec4(fract(randNumber + fnusin(1))));
    // textureStore(outputTex, WorkGroupID.xy, vec4( fract(randNumber + fnusin(1))));
    // textureStore(outputTex, LocalInvocationID.xy, vec4( fract(randNumber + fnusin(1))));

}
`;

export default compute;
