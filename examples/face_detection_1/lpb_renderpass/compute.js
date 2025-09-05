const compute = /*wgsl*/`



// function computeLBP(gray, width, height) {
//   const lbp = new Uint8Array(width * height);
//   for (let y = 1; y < height - 1; y++) {
//     for (let x = 1; x < width - 1; x++) {
//       const center = gray[y * width + x];
//       let code = 0;
//       let idx = 0;
//       for (let dy = -1; dy <= 1; dy++) {
//         for (let dx = -1; dx <= 1; dx++) {
//           if (dx === 0 && dy === 0) continue;
//           const neighbor = gray[(y + dy) * width + (x + dx)];
//           code |= (neighbor >= center ? 1 : 0) << idx;
//           idx++;
//         }
//       }
//       lbp[y * width + x] = code;
//     }
//   }
//   return lbp;
// }

const SIZE = vec2u(800, 800);

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let grayscale = textureLoad(grayscalePassTexture, GlobalId.xy, 0); // image

    var color = grayscale;
    if(any(GlobalId.xy <= vec2()) || any(GlobalId.xy > SIZE-2)){
        color = vec4f(1,0,0,1);
    }


    textureStore(writeTexture, GlobalId.xy, color);

}
`;

export default compute;
