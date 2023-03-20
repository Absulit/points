const compute = /*wgsl*/`

struct Matrix {
    size : vec2<f32>,
    numbers: array<f32>,
}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    // Guard against out-of-bounds work group sizes
    if (GlobalId.x >= u32(firstMatrix.size.x) || GlobalId.y >= u32(secondMatrix.size.y)) {
        return;
    }

    let time = params.time;

    resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

    let resultCell = vec2(GlobalId.x, GlobalId.y);
    var result = 0.0;
    for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
      let a = i + resultCell.x * u32(firstMatrix.size.y);
      let b = resultCell.y + i * u32(secondMatrix.size.y);
      result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
    }

    let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
    resultMatrix.numbers[index] = result;

}
`;

export default compute;
