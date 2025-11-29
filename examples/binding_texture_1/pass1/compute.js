const compute = /*wgsl*/`

@compute @workgroup_size(8,8,1)
fn main(in: ComputeIn) {
    let bColor = textureLoad(b, in.GID.xy, 0);
}
`;

export default compute;
