const compute = /*wgsl*/`

const SIZE = vec2u(800, 800);

fn pack_bools_to_f32(bits: array<bool, 8>) -> f32 {
    var packed = 0u;

    for (var i = 0u; i < 8u; i = i + 1u) {
        let bit = select(0u, 1u, bits[i]); // true → 1, false → 0
        packed = packed | (bit << (7u - i)); // MSB first
    }

    // Option 1: Normalize to [0.0, 1.0]
    return f32(packed) / 255.0;

    // Option 2: Reinterpret as float (if padded to full 32-bit)
    // return bitcast<f32>(packed << 24);
}

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let grayscale = textureLoad(grayscalePassTexture, GlobalId.xy, 0); // image

    let g = GlobalId.xy / (SIZE / BUCKETWIDTH);
    let arrayIndex = g.x + (g.y * BUCKETWIDTH);
    buckets[arrayIndex] = 0;

    var color = vec4f(1,0,0,1);
    if(  !(any(GlobalId.xy <= vec2()) || any(GlobalId.xy > SIZE-2))){
        // here we use the coordinate GlobalId.xy ignoring the borders
        let index = vec2i(GlobalId.xy);
        let g0 = textureLoad(grayscalePassTexture, index + vec2i(-1, -1), 0);
        let g1 = textureLoad(grayscalePassTexture, index + vec2i( 0, -1), 0);
        let g2 = textureLoad(grayscalePassTexture, index + vec2i( 1, -1), 0);
        let g3 = textureLoad(grayscalePassTexture, index + vec2i(-1,  0), 0);
        let g4 = textureLoad(grayscalePassTexture, index + vec2i( 1,  0), 0);
        let g5 = textureLoad(grayscalePassTexture, index + vec2i(-1,  1), 0);
        let g6 = textureLoad(grayscalePassTexture, index + vec2i( 0,  1), 0);
        let g7 = textureLoad(grayscalePassTexture, index + vec2i( 1,  1), 0);

        let r0 = (g0.r >= grayscale.r);
        let r1 = (g1.r >= grayscale.r);
        let r2 = (g2.r >= grayscale.r);
        let r3 = (g3.r >= grayscale.r);
        let r4 = (g4.r >= grayscale.r);
        let r5 = (g5.r >= grayscale.r);
        let r6 = (g6.r >= grayscale.r);
        let r7 = (g7.r >= grayscale.r);

        let a = array<bool, 8>(r0, r1, r2, r3, r4, r5, r6, r7);

        let r = pack_bools_to_f32(a);

        color = vec4f(r);
    }


    textureStore(lpbWriteTexture, GlobalId.xy, color);

}
`;

export default compute;
