
import { clearMix } from 'points/effects';
const compute = /*wgsl*/`

${clearMix}

const workgroupSize = 1;


@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {


    var rgba = textureSampleLevel(
        feedbackTexture,
        feedbackSampler,
        vec2f(GlobalId.xy),
        0.
    );

    // textureLoad here behaves differently
    // var rgba = textureLoad(feedbackTexture, GlobalId.xy, 0);

    rgba = clearMix(rgba, 1.01) + vec4f(1.,0.,0., .5);
    textureStore(outputTex, GlobalId.xy, rgba);
}
`;

export default compute;