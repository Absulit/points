@group(0) @binding(0) var inputTex : texture_2d<f32>;

struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>,
    //@location(1) fragUV: vec2<f32>
}


@stage(vertex)
fn main(@location(0) position: vec4<f32>, @location(1) color: vec4<f32>, @builtin(vertex_index) VertexIndex: u32) -> Fragment {

    var result: Fragment;

    result.Position = vec4<f32>(position);
    //output.fragUV = uv;
    result.Color = vec4<f32>(color);

    return result;
}
