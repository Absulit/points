const vert = /*wgsl*/`

// By default there's a Fragment struct (check base demo)
// but you can create your own to send to the Fragment Shader in frag.js
struct CustomFragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>,
    @location(1) uv: vec2<f32>
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) VertexIndex: u32) -> CustomFragment {

    var result: CustomFragment;

    result.Position = vec4<f32>(position);
    result.uv = uv;
    result.Color = vec4<f32>(color);

    return result;
}
`;

export default vert;
