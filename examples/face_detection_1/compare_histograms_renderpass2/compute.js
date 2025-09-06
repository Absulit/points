import { structs } from "../structs.js";

const compute = /*wgsl*/`

// function compareHistograms(hist1, hist2) {
//   let totalDistance = 0;

//   for (let i = 0; i < hist1.length; i++) {
//     const h1 = hist1[i];
//     const h2 = hist2[i];

//     let blockDistance = 0;
//     for (let j = 0; j < h1.length; j++) {
//       const diff = h1[j] - h2[j];
//       blockDistance += diff * diff;
//     }

//     totalDistance += Math.sqrt(blockDistance); // Euclidean distance for this block
//   }

//   return totalDistance; // Lower = more similar
// }



${structs}

const SIZE = vec2(800,800);

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    if(GlobalId.x + 1 >= NUMBUCKETS){
        return;
    }
    let a = i32(histograms[GlobalId.x].data[GlobalId.y] * 255);
    let b = i32(histograms[GlobalId.x + 1].data[GlobalId.y] * 255);

    // distances[GlobalId.y] = a - b;
    let diff = a - b;
    atomicAdd(&blockDistance.value, diff * diff);

    // log_data[0] = f32(GlobalId.x);
    // log.updated = 1;
    // let index = vec2(GlobalId.x * BUCKETWIDTH, GlobalId.y);

    // atomicAdd(&counter.value, 1);


    // let raw_i32: i32 = atomicLoad(&counter.value);
    // textureStore(compareWriteTexture, GlobalId.xy, vec4f(f32(raw_i32)/255 * .0000001) );

}
`;

export default compute;
