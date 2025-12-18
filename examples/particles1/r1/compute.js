import { structs } from './../structs.js';

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(16,16,1)
fn main(in: ComputeIn) {
    let index = in.GID.xy;

    let particleColor = textureLoad(pass0Texture, index, 0); // image

    textureStore(writeTexture, index, particleColor * .98999999);
}
`;

export default compute;
