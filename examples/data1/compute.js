// original article on compute shaders
// https://developer.chrome.com/articles/gpu-compute/

const compute = /*wgsl*/`

struct Matrix {
    size : vec2f,
    numbers: array<f32>,
}

@compute @workgroup_size(8,8,1)
fn main(in: ComputeIn) {
    // Guard against out-of-bounds work group sizes
    if (in.GID.x >= u32(firstMatrix.size.x) || in.GID.y >= u32(secondMatrix.size.y)) {
        return;
    }

    resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

    let resultCell = in.GID.xy;
    var result = 0.0;
    for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
      let a = i + resultCell.x * u32(firstMatrix.size.y);
      let b = resultCell.y + i * u32(secondMatrix.size.y);
      result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
    }

    let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
    resultMatrix.numbers[index] = result;
    result_test_data[index] = result;
    result_test.updated = 1;

}
`;

export default compute;
