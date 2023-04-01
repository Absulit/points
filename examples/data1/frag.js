const frag = /*wgsl*/`

struct Matrix {
    size : vec2<f32>,
    numbers: array<f32>,
}


@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>
    ) -> @location(0) vec4<f32> {

    // frag code

    return color;
}
`;

export default frag;
