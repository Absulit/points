const compute = /*wgsl*/`

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {


    let dims = textureDimensions(feedbackTexture);

    let numColumns:f32 = f32(dims.x);
    let numRows:f32 = f32(dims.y);

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));


    //--------------------------------------------------

    for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
        let ux = u32(x);
        // let ix = i32(x);
        // let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            // let iy = i32(y);
            // let ny = y / numRows;
            // let uv = vec2(nx,ny);

            let pointIndex = i32(y + (x * numColumns));
            let c = rands[pointIndex];

            let positionU = vec2<u32>(ux,uy);
            textureStore(outputTex, positionU, vec4<f32>(c));
            storageBarrier();
        }
    }

}
`;

export default compute;
