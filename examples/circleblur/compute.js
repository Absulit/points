
import { clearMix } from 'points/effects';
const compute = /*wgsl*/`

${clearMix}

const workgroupSize = 1;

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

    // let filterDim = 128u;
    // let blockDim = 128u;
    // let flipValue = 0u;

    // let filterOffset : u32 = (filterDim - 1u) / 2u;

    // let baseIndex = vec2<i32>(
    //     WorkGroupID.xy * vec2<u32>(blockDim, 4u) +
    //     LocalInvocationID.xy * vec2<u32>(4u, 1u)
    // ) - vec2<i32>(i32(filterOffset), 0);

    // ----------------------------------------------


    var rgba = textureSampleLevel(
        feedbackTexture,feedbackSampler,
        vec2f(f32(GlobalId.x), f32(GlobalId.y)),
        0.0
    );
    rgba = clearMix(rgba, 1.01) + vec4<f32>(1.,0.,0., .5);
    textureStore(outputTex, GlobalId.xy, rgba);
}
`;

export default compute;