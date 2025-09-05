import { structs } from "../structs.js";

const compute = /*wgsl*/`

${structs}

const SIZE = vec2u(800, 800);

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let lpb = textureLoad(lpbReadTexture, GlobalId.xy, 0).r; // image

    let g = GlobalId.xy / (SIZE / BUCKETWIDTH);

    let arrayIndex = g.x + (g.y * BUCKETWIDTH);
    buckets[arrayIndex] += lpb;
    hist[u32(lpb)] += .0001;

    histograms[arrayIndex].data[u32(lpb)] += 1;

    // log_data[0] = f32(arrayIndex);
    // log.updated = 1;


    textureStore(histogramWriteTexture, GlobalId.xy, vec4f( histograms[arrayIndex].data[u32(lpb)] *.00001 ) );

}
`;

export default compute;
