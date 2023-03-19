const frag = /*wgsl*/`

@fragment
fn main(
        @location(0) color: vec4<f32>, 
        @location(1) uv: vec2<f32>
    ) -> @location(0) vec4<f32> {

    let time = params.time;
    _ = firstMatrix[0];
    _ = secondMatrix[0];

    return color;
}
`;

export default frag;
