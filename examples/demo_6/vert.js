const vert = /*wgsl*/`

// By default there's a Fragment struct (check base demo)
// but you can create your own to send to the Fragment Shader in frag.js
struct CustomFragment {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) uv: vec2f
}

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32) -> CustomFragment {

    var result: CustomFragment;

    result.position = vec4f(position);
    result.uv = uv;
    result.color = vec4f(color);

    return result;
}
`;

export default vert;
