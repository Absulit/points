
import { clearMix } from './../../src/core/effects.js';
const compute = /*wgsl*/`

${clearMix}

const workgroupSize = 8;

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

    let filterDim = 128u;
    let blockDim = 128u;
    let flipValue = 0u;

    let filterOffset : u32 = (filterDim - 1u) / 2u;
    let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);

    let baseIndex = vec2<i32>(
        WorkGroupID.xy * vec2<u32>(blockDim, 4u) +
        LocalInvocationID.xy * vec2<u32>(4u, 1u)
    ) - vec2<i32>(i32(filterOffset), 0);

    // ----------------------------------------------
    let numColumns:f32 = f32(dims.x);
    let numRows:f32 = f32(dims.y);

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

    for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
        let ux = u32(x);
        let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            let ny = y / numRows;

            var rgba = textureSampleLevel(feedbackTexture,feedbackSampler, vec2<f32>(x,y),  0.0);

            rgba = clearMix(rgba, 1.01) + vec4<f32>(1.,0.,0., .5);

            textureStore(outputTex, vec2<u32>(ux,uy), rgba);
        }
    }
}
`;

export default compute;