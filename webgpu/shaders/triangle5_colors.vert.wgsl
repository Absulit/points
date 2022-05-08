struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>,
    //@location(1) uv: vec2<f32>
}


@stage(vertex)
fn main(@location(0) position: vec4<f32>, @location(1) color: vec4<f32>, @builtin(vertex_index) VertexIndex: u32) -> Fragment {

    var result: Fragment;

    result.Position = vec4<f32>(position);
    //result.uv = uv;
    result.Color = vec4<f32>(color);

    return result;
}
